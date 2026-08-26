package application

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

type fakeCookieImpl struct {
	mu        sync.Mutex
	cookies   []WebviewCookie
	gets      atomic.Int32
	deletes   atomic.Int32
	hold      chan struct{}
	late      chan func([]WebviewCookie, error)
	getErr    error
	deleteErr error
}

func (f *fakeCookieImpl) getCookies(uri string, callback func([]WebviewCookie, error)) {
	f.gets.Add(1)
	if f.late != nil {
		f.late <- callback
		return
	}
	if f.hold != nil {
		go func() {
			<-f.hold
			callback(append([]WebviewCookie(nil), f.cookies...), f.getErr)
		}()
		return
	}
	callback(append([]WebviewCookie(nil), f.cookies...), f.getErr)
}

func (f *fakeCookieImpl) deleteCookies(uri string, names []string, callback func(error)) {
	f.deletes.Add(1)
	if f.deleteErr != nil {
		callback(f.deleteErr)
		return
	}
	if len(names) == 0 {
		f.mu.Lock()
		f.cookies = nil
		f.mu.Unlock()
		callback(nil)
		return
	}
	wanted := make(map[string]struct{}, len(names))
	for _, name := range names {
		wanted[name] = struct{}{}
	}
	f.mu.Lock()
	kept := f.cookies[:0]
	for _, cookie := range f.cookies {
		if _, ok := wanted[cookie.Name]; !ok {
			kept = append(kept, cookie)
		}
	}
	f.cookies = kept
	f.mu.Unlock()
	callback(nil)
}

func TestGetCookiesRejectsBadURI(t *testing.T) {
	w := &WebviewWindow{}
	if _, err := w.GetCookies(context.Background(), "file:///tmp"); !errors.Is(err, errWebviewCookieURI) {
		t.Fatalf("err = %v", err)
	}
	if _, err := w.GetCookies(context.Background(), "not a url"); err == nil {
		t.Fatal("expected parse error")
	}
}

func TestGetCookiesUnsupportedWithoutImpl(t *testing.T) {
	w := &WebviewWindow{}
	if _, err := w.GetCookies(context.Background(), "https://gamebanana.com/"); !errors.Is(err, ErrWebviewCookiesUnsupported) {
		t.Fatalf("err = %v", err)
	}
}

func TestGetCookiesContextCancelUnblocks(t *testing.T) {
	hold := make(chan struct{})
	impl := &fakeCookieImpl{hold: hold}
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
	defer cancel()
	started := time.Now()
	_, err := getCookiesFromImpl(ctx, "https://gamebanana.com/", impl, nil)
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("err = %v", err)
	}
	if time.Since(started) > time.Second {
		t.Fatal("cancel did not unblock promptly")
	}
	close(hold)
}

func TestGetCookiesLateCallbackDoesNotPanic(t *testing.T) {
	late := make(chan func([]WebviewCookie, error), 1)
	impl := &fakeCookieImpl{late: late}
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() {
		_, err := getCookiesFromImpl(ctx, "https://gamebanana.com/", impl, nil)
		done <- err
	}()
	callback := <-late
	cancel()
	if err := <-done; !errors.Is(err, context.Canceled) {
		t.Fatalf("err = %v", err)
	}
	callback([]WebviewCookie{{Name: "rmc", Value: "secret"}}, nil)
}

func TestGetCookiesDestroyedWindow(t *testing.T) {
	w := &WebviewWindow{destroyed: true}
	if _, err := w.GetCookies(context.Background(), "https://gamebanana.com/"); !errors.Is(err, errWebviewCookieWindowDestroyed) {
		t.Fatalf("err = %v", err)
	}
}

func TestDeleteCookiesNameFilter(t *testing.T) {
	impl := &fakeCookieImpl{cookies: []WebviewCookie{
		{Name: "rmc", Value: "secret"},
		{Name: "keep", Value: "yes"},
	}}
	if err := deleteCookiesFromImpl(context.Background(), "https://gamebanana.com/", []string{"rmc"}, impl, nil); err != nil {
		t.Fatal(err)
	}
	if len(impl.cookies) != 1 || impl.cookies[0].Name != "keep" {
		t.Fatalf("cookies = %+v", impl.cookies)
	}
}

func TestWaitCookieResultIgnoresSecondSend(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	started := make(chan func(int, error), 1)
	done := make(chan error, 1)
	go func() {
		_, err := waitCookieResult(ctx, func(callback func(int, error)) {
			started <- callback
		})
		done <- err
	}()
	callback := <-started
	cancel()
	if err := <-done; !errors.Is(err, context.Canceled) {
		t.Fatalf("err = %v", err)
	}
	callback(1, nil)
	callback(2, errors.New("late"))
}
