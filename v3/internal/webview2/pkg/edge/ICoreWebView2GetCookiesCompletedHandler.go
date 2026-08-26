//go:build windows

package edge

import (
	"sync/atomic"
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

var (
	iidIUnknown                                = NewGUID("{00000000-0000-0000-C000-000000000046}")
	iidICoreWebView2GetCookiesCompletedHandler = NewGUID(
		"{5A4F5069-5C15-47C3-8646-F4DE1C116670}",
	)
)

type _ICoreWebView2GetCookiesCompletedHandlerVtbl struct {
	_IUnknownVtbl
	Invoke ComProc
}

type iCoreWebView2GetCookiesCompletedHandler struct {
	vtbl *_ICoreWebView2GetCookiesCompletedHandlerVtbl
	impl _ICoreWebView2GetCookiesCompletedHandlerImpl
}

func (i *iCoreWebView2GetCookiesCompletedHandler) AddRef() uint32 {
	ret, _, _ := i.vtbl.AddRef.Call(uintptr(unsafe.Pointer(i)))
	return uint32(ret)
}

func (i *iCoreWebView2GetCookiesCompletedHandler) Release() uint32 {
	ret, _, _ := i.vtbl.Release.Call(uintptr(unsafe.Pointer(i)))
	return uint32(ret)
}

func _ICoreWebView2GetCookiesCompletedHandlerIUnknownQueryInterface(
	this *iCoreWebView2GetCookiesCompletedHandler,
	refiid *GUID,
	object *unsafe.Pointer,
) uintptr {
	if object == nil {
		return uintptr(windows.E_POINTER)
	}
	*object = nil
	if this == nil || refiid == nil {
		return uintptr(windows.E_NOINTERFACE)
	}
	if !IsEqualGUID(refiid, iidIUnknown) &&
		!IsEqualGUID(refiid, iidICoreWebView2GetCookiesCompletedHandler) {
		return uintptr(windows.E_NOINTERFACE)
	}
	*object = unsafe.Pointer(this)
	this.impl.AddRef()
	return uintptr(windows.S_OK)
}

func _ICoreWebView2GetCookiesCompletedHandlerIUnknownAddRef(this *iCoreWebView2GetCookiesCompletedHandler) uintptr {
	return this.impl.AddRef()
}

func _ICoreWebView2GetCookiesCompletedHandlerIUnknownRelease(this *iCoreWebView2GetCookiesCompletedHandler) uintptr {
	return this.impl.Release()
}

func _ICoreWebView2GetCookiesCompletedHandlerInvoke(this *iCoreWebView2GetCookiesCompletedHandler, errorCode uintptr, result *ICoreWebView2CookieList) uintptr {
	return this.impl.GetCookiesCompleted(errorCode, result)
}

type _ICoreWebView2GetCookiesCompletedHandlerImpl interface {
	AddRef() uintptr
	Release() uintptr
	GetCookiesCompleted(errorCode uintptr, result *ICoreWebView2CookieList) uintptr
}

var _ICoreWebView2GetCookiesCompletedHandlerFn = _ICoreWebView2GetCookiesCompletedHandlerVtbl{
	_IUnknownVtbl{
		NewComProc(_ICoreWebView2GetCookiesCompletedHandlerIUnknownQueryInterface),
		NewComProc(_ICoreWebView2GetCookiesCompletedHandlerIUnknownAddRef),
		NewComProc(_ICoreWebView2GetCookiesCompletedHandlerIUnknownRelease),
	},
	NewComProc(_ICoreWebView2GetCookiesCompletedHandlerInvoke),
}

func newICoreWebView2GetCookiesCompletedHandler(impl _ICoreWebView2GetCookiesCompletedHandlerImpl) *iCoreWebView2GetCookiesCompletedHandler {
	return &iCoreWebView2GetCookiesCompletedHandler{
		vtbl: &_ICoreWebView2GetCookiesCompletedHandlerFn,
		impl: impl,
	}
}

type getCookiesCompletedHandler struct {
	refCount atomic.Int32
	callback func(*ICoreWebView2CookieList, error)
}

func newGetCookiesCompletedHandler(callback func(*ICoreWebView2CookieList, error)) *iCoreWebView2GetCookiesCompletedHandler {
	impl := &getCookiesCompletedHandler{callback: callback}
	impl.refCount.Store(1)
	return newICoreWebView2GetCookiesCompletedHandler(impl)
}

func (h *getCookiesCompletedHandler) AddRef() uintptr {
	return uintptr(h.refCount.Add(1))
}
func (h *getCookiesCompletedHandler) Release() uintptr {
	return uintptr(h.refCount.Add(-1))
}

func (h *getCookiesCompletedHandler) GetCookiesCompleted(errorCode uintptr, result *ICoreWebView2CookieList) uintptr {
	var err error
	if errorCode != 0 {
		err = syscall.Errno(errorCode)
	}
	if h.callback != nil {
		h.callback(result, err)
	}
	return 0
}
