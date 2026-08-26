package application

import (
	"testing"
)

type recordingWindow struct {
	WebviewWindow
	handled []string
}

func (w *recordingWindow) HandleMessage(message string) {
	w.handled = append(w.handled, message)
	w.WebviewWindow.HandleMessage(message)
}

func (w *recordingWindow) wailsRuntimeDisabled() bool {
	return w.options.DisableWailsRuntime
}

func TestHandleMessageIgnoresWailsOnDisabledRuntime(t *testing.T) {
	w := &WebviewWindow{
		options: WebviewWindowOptions{DisableWailsRuntime: true},
	}
	w.HandleMessage("wails:drag")
	w.HandleMessage("wails:runtime:ready")
	if w.runtimeLoaded {
		t.Fatal("disabled runtime must not mark runtime ready")
	}
}

func TestHandleWindowMessageSkipsDisabledRuntime(t *testing.T) {
	app := &App{windows: map[uint]Window{}}
	w := &recordingWindow{
		WebviewWindow: WebviewWindow{
			id:      7,
			options: WebviewWindowOptions{DisableWailsRuntime: true},
		},
	}
	app.windows[7] = w
	prev := globalApplication
	globalApplication = app
	t.Cleanup(func() { globalApplication = prev })
	app.handleWindowMessage(&windowMessage{windowId: 7, message: "wails:runtime:ready"})
	if len(w.handled) != 0 {
		t.Fatalf("disabled window handled %v", w.handled)
	}
}

func TestHandleWindowMessageStillDispatchesNormalWindows(t *testing.T) {
	app := &App{windows: map[uint]Window{}}
	w := &recordingWindow{
		WebviewWindow: WebviewWindow{id: 8},
	}
	app.windows[8] = w
	prev := globalApplication
	globalApplication = app
	t.Cleanup(func() { globalApplication = prev })
	app.handleWindowMessage(&windowMessage{windowId: 8, message: "wails:runtime:ready"})
	if len(w.handled) != 1 || w.handled[0] != "wails:runtime:ready" {
		t.Fatalf("normal window handled %v", w.handled)
	}
}
