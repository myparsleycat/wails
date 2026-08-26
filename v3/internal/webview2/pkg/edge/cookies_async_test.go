//go:build windows

package edge

import (
	"math"
	"testing"
	"time"
	"unsafe"

	"golang.org/x/sys/windows"
)

func TestCopyCookieListNil(t *testing.T) {
	cookies, err := copyCookieList(nil)
	if err != nil || cookies != nil {
		t.Fatalf("cookies=%v err=%v", cookies, err)
	}
}

func TestCopiedCookieSessionWhenExpiresMissing(t *testing.T) {
	copied := CopiedCookie{}
	if copied.Expires.IsZero() && !copied.Session {
		copied.Session = true
	}
	if !copied.Session {
		t.Fatal("expected session cookie")
	}
}

func TestCopiedCookieExpiryConversion(t *testing.T) {
	expires := float64(time.Date(2030, 1, 2, 3, 4, 5, 0, time.UTC).Unix())
	if math.IsNaN(expires) {
		t.Fatal("expires is NaN")
	}
	got := time.Unix(int64(expires), 0).UTC()
	if got.Year() != 2030 {
		t.Fatalf("year = %d", got.Year())
	}
}

func TestGetCookiesAsyncNilManager(t *testing.T) {
	var manager *ICoreWebView2CookieManager
	done := make(chan error, 1)
	manager.GetCookiesAsync("https://example.com/", func(_ []CopiedCookie, err error) {
		done <- err
	})
	if err := <-done; err == nil {
		t.Fatal("expected error")
	}
}

func TestCopiedCookieIncludesHTTPOnlyField(t *testing.T) {
	cookie := CopiedCookie{Name: "rmc", Value: "secret", HTTPOnly: true}
	if !cookie.HTTPOnly {
		t.Fatal("HttpOnly cookie must be retained")
	}
	if cookie.Value == "" {
		t.Fatal("value missing")
	}
}

func TestGetCookiesCompletedHandlerPropagatesHRESULT(t *testing.T) {
	done := make(chan error, 1)
	handler := &getCookiesCompletedHandler{
		callback: func(_ *ICoreWebView2CookieList, err error) {
			done <- err
		},
	}
	handler.GetCookiesCompleted(0x80004005, nil)
	if err := <-done; err == nil {
		t.Fatal("expected HRESULT error")
	}
}

func TestGetCookiesCompletedHandlerQueryInterface(t *testing.T) {
	handler := newGetCookiesCompletedHandler(func(*ICoreWebView2CookieList, error) {})

	for _, iid := range []*GUID{iidIUnknown, iidICoreWebView2GetCookiesCompletedHandler} {
		var result unsafe.Pointer
		hr := queryGetCookiesCompletedHandler(handler, iid, &result)
		if hr != uintptr(windows.S_OK) {
			t.Fatalf("QueryInterface(%s) HRESULT = %#x", iid, hr)
		}
		if result != unsafe.Pointer(handler) {
			t.Fatalf("QueryInterface(%s) result = %p", iid, result)
		}
		handler.Release()
	}

	unknown := NewGUID("{FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF}")
	result := unsafe.Pointer(handler)
	hr := queryGetCookiesCompletedHandler(handler, unknown, &result)
	if hr != uintptr(windows.E_NOINTERFACE) {
		t.Fatalf("unknown QueryInterface HRESULT = %#x", hr)
	}
	if result != nil {
		t.Fatalf("unknown QueryInterface result = %p", result)
	}

	if refs := handler.Release(); refs != 0 {
		t.Fatalf("final reference count = %d", refs)
	}
}

func TestGetCookiesCompletedHandlerQueryInterfaceRejectsNilOutput(t *testing.T) {
	handler := newGetCookiesCompletedHandler(func(*ICoreWebView2CookieList, error) {})
	hr := queryGetCookiesCompletedHandler(handler, iidIUnknown, nil)
	if hr != uintptr(windows.E_POINTER) {
		t.Fatalf("nil output QueryInterface HRESULT = %#x", hr)
	}
	handler.Release()
}

func queryGetCookiesCompletedHandler(
	handler *iCoreWebView2GetCookiesCompletedHandler,
	iid *GUID,
	result *unsafe.Pointer,
) uintptr {
	hr, _, _ := handler.vtbl.QueryInterface.Call(
		uintptr(unsafe.Pointer(handler)),
		uintptr(unsafe.Pointer(iid)),
		uintptr(unsafe.Pointer(result)),
	)
	return hr
}
