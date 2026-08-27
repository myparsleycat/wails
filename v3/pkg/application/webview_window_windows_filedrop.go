//go:build windows

package application

import (
	"log"
	"unsafe"

	"github.com/wailsapp/wails/v3/pkg/w32"
)

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
	dropTarget.OnEnterObject = func(dataObject *w32.IDataObject, keyState w32.DWORD, point w32.POINT) w32.DWORD {
		return w.forwardFileDragEnter(dataObject, keyState, point)
	}
	dropTarget.OnOverObject = func(keyState w32.DWORD, point w32.POINT) w32.DWORD {
		return w.forwardFileDragOver(keyState, point)
	}
	dropTarget.OnDropObject = func(dataObject *w32.IDataObject, keyState w32.DWORD, point w32.POINT) w32.DWORD {
		return w.forwardFileDrop(dataObject, keyState, point)
	}
	dropTarget.OnLeave = func() {
		_ = w.chromium.DragTargetLeave()
	}

	if err := w32.RegisterDragDrop(w.hwnd, dropTarget); err != nil {
		globalApplication.warning("failed to register file drop target: %v", err)
		return
	}
	w.dropTarget = dropTarget
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

func (w *windowsWebviewWindow) forwardFileDragEnter(dataObject *w32.IDataObject, keyState w32.DWORD, point w32.POINT) w32.DWORD {
	x, y, ok := w.compositionDropPoint(point)
	if !ok {
		return w32.DROPEFFECT_NONE
	}
	effect, err := w.chromium.DragTargetEnter(uintptr(unsafe.Pointer(dataObject)), uint32(keyState), x, y)
	log.Printf("[FileDropDebug] DragEnter forwarded: effect=%d err=%v", effect, err)
	if err != nil {
		return w32.DROPEFFECT_NONE
	}
	return w32.DWORD(effect)
}

func (w *windowsWebviewWindow) forwardFileDragOver(keyState w32.DWORD, point w32.POINT) w32.DWORD {
	x, y, ok := w.compositionDropPoint(point)
	if !ok {
		return w32.DROPEFFECT_NONE
	}
	effect, err := w.chromium.DragTargetOver(uint32(keyState), x, y)
	if err != nil {
		return w32.DROPEFFECT_NONE
	}
	return w32.DWORD(effect)
}

func (w *windowsWebviewWindow) forwardFileDrop(dataObject *w32.IDataObject, keyState w32.DWORD, point w32.POINT) w32.DWORD {
	x, y, ok := w.compositionDropPoint(point)
	if !ok {
		log.Printf("[FileDropDebug] Drop: ScreenToClient failed")
		return w32.DROPEFFECT_NONE
	}
	effect, err := w.chromium.DragTargetDrop(uintptr(unsafe.Pointer(dataObject)), uint32(keyState), x, y)
	log.Printf("[FileDropDebug] Drop forwarded at (%d,%d): effect=%d err=%v", x, y, effect, err)
	if err != nil {
		return w32.DROPEFFECT_NONE
	}
	return w32.DWORD(effect)
}