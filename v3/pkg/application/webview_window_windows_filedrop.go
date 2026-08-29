//go:build windows

package application

import (
	"math"
	"unsafe"

	"github.com/wailsapp/wails/v3/pkg/w32"
)

func (w *windowsWebviewWindow) usesNativeCompositionFileDrop() bool {
	return w != nil &&
		w.parent != nil &&
		w.parent.options.EnableFileDrop &&
		w.parent.options.Windows.WebView2CompositionHosting
}

// registerFileDropTarget registers an OLE drop target on the host window and
// forwards drag events to the WebView2 composition controller.
//
// With WebView2 composition (visual) hosting the webview has no native child
// HWND of its own: ICoreWebView2CompositionController3 requires the hosting
// application to implement IDropTarget and forward
// DragEnter/DragOver/DragLeave/Drop to the controller. Without this, external
// file drags are rejected with the no-drop cursor and no DOM drag events fire,
// which silently disables the JS-side file drop flow (EnableFileDrop).
//
// In HWND hosting mode WebView2 registers its own drop target on its child
// HWND, so this path is only wired for composition-hosted windows.
func (w *windowsWebviewWindow) registerFileDropTarget() {
	if w.dropTarget != nil || w.hwnd == 0 {
		return
	}

	// RegisterDragDrop requires OLE initialization on the registering thread.
	// The main thread already runs COM STA through the edge package init
	// (CoInitializeEx APARTMENTTHREADED); OleInitialize layers the OLE services
	// (clipboard/drag-drop) on top and reports S_FALSE when already done.
	w32.OleInitialise()

	dropTarget := w32.NewDropTarget()
	dropTarget.OnEnterObject = func(dataObject *w32.IDataObject, keyState w32.DWORD, point w32.POINT, allowedEffect w32.DWORD) w32.DWORD {
		w.fileDragActive = dataObject.SupportsFileDrop()
		return w.acceptPendingFileDrop(w.forwardFileDragEnter(dataObject, keyState, point, allowedEffect), allowedEffect)
	}
	dropTarget.OnOverObject = func(keyState w32.DWORD, point w32.POINT, allowedEffect w32.DWORD) w32.DWORD {
		return w.acceptPendingFileDrop(w.forwardFileDragOver(keyState, point, allowedEffect), allowedEffect)
	}
	dropTarget.OnDropObject = func(dataObject *w32.IDataObject, keyState w32.DWORD, point w32.POINT, allowedEffect w32.DWORD) w32.DWORD {
		defer func() { w.fileDragActive = false }()

		effect := w.forwardFileDrop(dataObject, keyState, point, allowedEffect)
		paths, err := dataObject.FileDropPaths()
		if err != nil || len(paths) == 0 {
			return effect
		}

		x, y, ok := w.compositionDropCSSPoint(point)
		if ok {
			// The OLE callback runs on the window thread. InitiateFrontendDropProcessing
			// synchronously dispatches back to that thread, so hand the immutable drop
			// payload to a worker after the COM callback is allowed to return.
			go w.parent.InitiateFrontendDropProcessing(paths, x, y)
		}
		return w.acceptPendingFileDrop(effect, allowedEffect)
	}
	dropTarget.OnLeave = func() {
		w.fileDragActive = false
		_ = w.chromium.DragTargetLeave()
	}

	if err := w32.RegisterDragDrop(w.hwnd, dropTarget); err != nil {
		globalApplication.warning("failed to register file drop target: %v", err)
		return
	}
	w.dropTarget = dropTarget
}

// compositionDropCSSPoint converts the OLE screen point to logical pixels for
// document.elementFromPoint. WebView2's composition drag APIs use physical
// client pixels, while the runtime's platform drop handler consumes CSS pixels.
func (w *windowsWebviewWindow) compositionDropCSSPoint(point w32.POINT) (int, int, bool) {
	x, y, ok := w.compositionDropPoint(point)
	if !ok {
		return 0, 0, false
	}

	dpi := w32.GetDpiForWindow(w.hwnd)
	if dpi == 0 {
		return int(x), int(y), true
	}
	scale := float64(dpi) / 96.0
	return int(math.Round(float64(x) / scale)), int(math.Round(float64(y) / scale)), true
}

func (w *windowsWebviewWindow) acceptPendingFileDrop(effect, allowedEffect w32.DWORD) w32.DWORD {
	if effect != w32.DROPEFFECT_NONE || !w.fileDragActive {
		return effect
	}
	return preferredFileDropEffect(allowedEffect)
}

func preferredFileDropEffect(allowedEffect w32.DWORD) w32.DWORD {
	for _, effect := range [...]w32.DWORD{w32.DROPEFFECT_COPY, w32.DROPEFFECT_MOVE, w32.DROPEFFECT_LINK} {
		if allowedEffect&effect != 0 {
			return effect
		}
	}
	return w32.DROPEFFECT_NONE
}

// compositionDropPoint converts a screen-space drag point to the WebView's
// client coordinates, which is what the composition controller's drag methods
// expect (same coordinate space as SendMouseInput).
func (w *windowsWebviewWindow) compositionDropPoint(point w32.POINT) (int32, int32, bool) {
	clientX, clientY, ok := w32.ScreenToClient(w.hwnd, int(point.X), int(point.Y))
	if !ok {
		return 0, 0, false
	}
	return int32(clientX), int32(clientY), true
}

func (w *windowsWebviewWindow) forwardFileDragEnter(dataObject *w32.IDataObject, keyState w32.DWORD, point w32.POINT, allowedEffect w32.DWORD) w32.DWORD {
	x, y, ok := w.compositionDropPoint(point)
	if !ok {
		return w32.DROPEFFECT_NONE
	}
	effect, err := w.chromium.DragTargetEnter(uintptr(unsafe.Pointer(dataObject)), uint32(keyState), x, y, uint32(allowedEffect))
	if err != nil {
		return w32.DROPEFFECT_NONE
	}
	return w32.DWORD(effect)
}

func (w *windowsWebviewWindow) forwardFileDragOver(keyState w32.DWORD, point w32.POINT, allowedEffect w32.DWORD) w32.DWORD {
	x, y, ok := w.compositionDropPoint(point)
	if !ok {
		return w32.DROPEFFECT_NONE
	}
	effect, err := w.chromium.DragTargetOver(uint32(keyState), x, y, uint32(allowedEffect))
	if err != nil {
		return w32.DROPEFFECT_NONE
	}
	return w32.DWORD(effect)
}

func (w *windowsWebviewWindow) forwardFileDrop(dataObject *w32.IDataObject, keyState w32.DWORD, point w32.POINT, allowedEffect w32.DWORD) w32.DWORD {
	x, y, ok := w.compositionDropPoint(point)
	if !ok {
		return w32.DROPEFFECT_NONE
	}
	effect, err := w.chromium.DragTargetDrop(uintptr(unsafe.Pointer(dataObject)), uint32(keyState), x, y, uint32(allowedEffect))
	if err != nil {
		return w32.DROPEFFECT_NONE
	}
	return w32.DWORD(effect)
}
