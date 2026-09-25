package application

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

type beforeCallService struct{ calls atomic.Int32 }

func (s *beforeCallService) Run() string {
	s.calls.Add(1)
	return "ran"
}

func setupBeforeCallTest(t *testing.T, opts ServiceOptions) (*MessageProcessor, *beforeCallService, *BoundMethod) {
	t.Helper()
	app := &App{windows: map[uint]Window{}}
	previous := globalApplication
	globalApplication = app
	t.Cleanup(func() { globalApplication = previous })
	app.Window = newWindowManager(app)
	app.bindings = NewBindings(nil, nil)
	service := &beforeCallService{}
	if err := app.bindings.Add(NewServiceWithOptions(service, opts)); err != nil {
		t.Fatal(err)
	}
	method := app.bindings.Get(&CallOptions{MethodName: "github.com/wailsapp/wails/v3/pkg/application.beforeCallService.Run"})
	if method == nil {
		t.Fatal("missing test binding")
	}
	return NewMessageProcessor(slog.New(slog.NewTextHandler(io.Discard, nil))), service, method
}

func beforeCallRequest(t *testing.T, method *BoundMethod, callID string, byID bool) *RuntimeRequest {
	t.Helper()
	options := map[string]any{"call-id": callID, "args": []any{}}
	if byID {
		options["methodID"] = method.ID
	} else {
		options["methodName"] = method.FQN
	}
	data, err := json.Marshal(options)
	if err != nil {
		t.Fatal(err)
	}
	args := &Args{}
	if err := args.UnmarshalJSON(data); err != nil {
		t.Fatal(err)
	}
	return &RuntimeRequest{Object: callRequest, Method: CallBinding, Args: args}
}

func TestBeforeCallRunsForNamedAndNumericBindings(t *testing.T) {
	var names []string
	processor, service, method := setupBeforeCallTest(t, ServiceOptions{
		BeforeCall: func(_ context.Context, name string) error {
			names = append(names, name)
			return nil
		},
	})
	for _, tc := range []struct {
		name string
		byID bool
	}{{"named", false}, {"numeric", true}} {
		result, err := processor.HandleRuntimeCallWithIDs(context.Background(), beforeCallRequest(t, method, tc.name, tc.byID))
		if err != nil || result != "ran" {
			t.Fatalf("binding result = %v, %v", result, err)
		}
	}
	if service.calls.Load() != 2 || len(names) != 2 || names[0] != "Run" || names[1] != "Run" {
		t.Fatalf("calls = %d, hook names = %v", service.calls.Load(), names)
	}
	if result := service.Run(); result != "ran" || len(names) != 2 {
		t.Fatal("direct Go call unexpectedly ran BeforeCall")
	}
}

func TestBeforeCallNilAllowsBinding(t *testing.T) {
	processor, service, method := setupBeforeCallTest(t, ServiceOptions{})
	result, err := processor.HandleRuntimeCallWithIDs(context.Background(), beforeCallRequest(t, method, "plain", false))
	if err != nil || result != "ran" || service.calls.Load() != 1 {
		t.Fatalf("binding result = %v, %v; calls = %d", result, err, service.calls.Load())
	}
}

func TestBeforeCallErrorUsesServiceMarshaler(t *testing.T) {
	want := errors.New("maintenance failed")
	processor, service, method := setupBeforeCallTest(t, ServiceOptions{
		BeforeCall: func(context.Context, string) error { return want },
		MarshalError: func(err error) []byte {
			if !errors.Is(err, want) {
				t.Fatalf("marshaled error = %v", err)
			}
			return []byte(`{"code":"MAINTENANCE_FAILED"}`)
		},
	})
	_, err := processor.HandleRuntimeCallWithIDs(context.Background(), beforeCallRequest(t, method, "failure", false))
	var callErr *CallError
	if !errors.As(err, &callErr) || callErr.Kind != RuntimeError ||
		string(callErr.Cause.(json.RawMessage)) != `{"code":"MAINTENANCE_FAILED"}` {
		t.Fatalf("call error = %#v", err)
	}
	if service.calls.Load() != 0 {
		t.Fatal("method ran after hook error")
	}
}

func TestBeforeCallWaitCanBeCancelled(t *testing.T) {
	for _, kind := range []string{"call", "window", "request"} {
		t.Run(kind, func(t *testing.T) {
			entered := make(chan struct{})
			processor, service, method := setupBeforeCallTest(t, ServiceOptions{
				BeforeCall: func(ctx context.Context, _ string) error {
					close(entered)
					<-ctx.Done()
					return ctx.Err()
				},
			})
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			request := beforeCallRequest(t, method, "cancel-"+kind, false)
			if kind == "window" {
				window := &WebviewWindow{id: 7, options: WebviewWindowOptions{Name: "main"}}
				globalApplication.windows[7] = window
				request.WebviewWindowID = 7
			}
			done := make(chan error, 1)
			go func() {
				_, err := processor.HandleRuntimeCallWithIDs(ctx, request)
				done <- err
			}()
			select {
			case <-entered:
			case <-time.After(2 * time.Second):
				t.Fatal("hook did not start")
			}
			switch kind {
			case "call":
				args := &Args{}
				_ = args.UnmarshalJSON([]byte(`{"call-id":"cancel-call"}`))
				_, err := processor.processCallCancelMethod(&RuntimeRequest{Args: args})
				if err != nil {
					t.Fatal(err)
				}
			case "window":
				processor.CancelWindowCalls(7)
			case "request":
				cancel()
			}
			select {
			case err := <-done:
				if err == nil || !strings.Contains(err.Error(), "canceled") {
					t.Fatalf("cancel error = %v", err)
				}
			case <-time.After(2 * time.Second):
				t.Fatal("cancelled call stayed blocked")
			}
			if service.calls.Load() != 0 {
				t.Fatal("cancelled call ran its method")
			}
		})
	}
}

func TestBeforeCallDoesNotInvokeAfterRequestCancellation(t *testing.T) {
	entered := make(chan struct{})
	release := make(chan struct{})
	processor, service, method := setupBeforeCallTest(t, ServiceOptions{
		BeforeCall: func(context.Context, string) error {
			close(entered)
			<-release
			return nil
		},
	})
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	request := beforeCallRequest(t, method, "request-return", false)
	done := make(chan error, 1)
	go func() {
		_, err := processor.HandleRuntimeCallWithIDs(ctx, request)
		done <- err
	}()
	select {
	case <-entered:
	case <-time.After(2 * time.Second):
		close(release)
		t.Fatal("hook did not start")
	}
	cancel()
	close(release)
	select {
	case err := <-done:
		if err == nil || !strings.Contains(err.Error(), "canceled") {
			t.Fatalf("cancel error = %v", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("cancelled call stayed blocked")
	}
	if service.calls.Load() != 0 {
		t.Fatal("cancelled request ran its method")
	}
}
