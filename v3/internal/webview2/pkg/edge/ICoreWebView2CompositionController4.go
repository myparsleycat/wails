//go:build windows

package edge

import (
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

type ICoreWebView2CompositionController4Vtbl struct {
	_IUnknownVtbl
	GetRootVisualTarget          ComProc
	PutRootVisualTarget          ComProc
	SendMouseInput               ComProc
	SendPointerInput             ComProc
	GetCursor                    ComProc
	GetSystemCursorId            ComProc
	AddCursorChanged             ComProc
	RemoveCursorChanged          ComProc
	GetUIAProvider               ComProc
	DragEnter                    ComProc
	DragLeave                    ComProc
	DragOver                     ComProc
	Drop                         ComProc
	GetNonClientRegionAtPoint    ComProc
	QueryNonClientRegion         ComProc
	AddNonClientRegionChanged    ComProc
	RemoveNonClientRegionChanged ComProc
}

type ICoreWebView2CompositionController4 struct {
	Vtbl *ICoreWebView2CompositionController4Vtbl
}

func (i *ICoreWebView2CompositionController4) AddRef() uintptr {
	ret, _, _ := i.Vtbl.AddRef.Call(uintptr(unsafe.Pointer(i)))

	return ret
}

func (i *ICoreWebView2CompositionController4) Release() uintptr {
	ret, _, _ := i.Vtbl.Release.Call(uintptr(unsafe.Pointer(i)))

	return ret
}

func (i *ICoreWebView2CompositionController) GetICoreWebView2CompositionController4() *ICoreWebView2CompositionController4 {
	var result *ICoreWebView2CompositionController4

	iidICoreWebView2CompositionController4 := NewGUID("{7C367B9B-3D2B-450F-9E58-D61A20F486AA}")
	_, _, _ = i.Vtbl.QueryInterface.Call(
		uintptr(unsafe.Pointer(i)),
		uintptr(unsafe.Pointer(iidICoreWebView2CompositionController4)),
		uintptr(unsafe.Pointer(&result)))

	return result
}

func (i *ICoreWebView2CompositionController4) GetNonClientRegionAtPoint(point POINT) (COREWEBVIEW2_NON_CLIENT_REGION_KIND, error) {
	var value COREWEBVIEW2_NON_CLIENT_REGION_KIND

	hr, _, _ := i.Vtbl.GetNonClientRegionAtPoint.Call(
		uintptr(unsafe.Pointer(i)),
		point.uintptr(),
		uintptr(unsafe.Pointer(&value)),
	)
	if windows.Handle(hr) != windows.S_OK {
		return 0, syscall.Errno(hr)
	}
	return value, nil
}

// DragEnter forwards an IDropTarget::DragEnter call to WebView2. The data
// object pointer is an IDataObject* borrowed from the OS drag loop; WebView2
// keeps it only for the duration of the drag. The point must be in the
// WebView's client coordinates, like SendMouseInput.
func (i *ICoreWebView2CompositionController4) DragEnter(dataObject uintptr, keyState uint32, point POINT) (uint32, error) {
	var effect uint32

	hr, _, _ := i.Vtbl.DragEnter.Call(
		uintptr(unsafe.Pointer(i)),
		dataObject,
		uintptr(keyState),
		point.uintptr(),
		uintptr(unsafe.Pointer(&effect)),
	)
	if int32(hr) < 0 {
		return 0, syscall.Errno(hr)
	}
	return effect, nil
}

// DragOver forwards an IDropTarget::DragOver call to WebView2. The point must
// be in the WebView's client coordinates, like SendMouseInput.
func (i *ICoreWebView2CompositionController4) DragOver(keyState uint32, point POINT) (uint32, error) {
	var effect uint32

	hr, _, _ := i.Vtbl.DragOver.Call(
		uintptr(unsafe.Pointer(i)),
		uintptr(keyState),
		point.uintptr(),
		uintptr(unsafe.Pointer(&effect)),
	)
	if int32(hr) < 0 {
		return 0, syscall.Errno(hr)
	}
	return effect, nil
}

// DragLeave forwards an IDropTarget::DragLeave call to WebView2.
func (i *ICoreWebView2CompositionController4) DragLeave() error {
	hr, _, _ := i.Vtbl.DragLeave.Call(
		uintptr(unsafe.Pointer(i)),
	)
	if int32(hr) < 0 {
		return syscall.Errno(hr)
	}
	return nil
}

// Drop forwards an IDropTarget::Drop call to WebView2. The data object pointer
// is only valid for the duration of the call. The point must be in the
// WebView's client coordinates, like SendMouseInput.
func (i *ICoreWebView2CompositionController4) Drop(dataObject uintptr, keyState uint32, point POINT) (uint32, error) {
	var effect uint32

	hr, _, _ := i.Vtbl.Drop.Call(
		uintptr(unsafe.Pointer(i)),
		dataObject,
		uintptr(keyState),
		point.uintptr(),
		uintptr(unsafe.Pointer(&effect)),
	)
	if int32(hr) < 0 {
		return 0, syscall.Errno(hr)
	}
	return effect, nil
}
