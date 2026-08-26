//go:build windows

package edge

import (
	"fmt"
	"math"
	"sync"
	"time"
)

var inFlightCookieHandlers sync.Map

// CopiedCookie is a Go-owned snapshot of a WebView2 cookie. Native COM
// objects are released on the calling apartment after the copy.
type CopiedCookie struct {
	Name     string
	Value    string
	Domain   string
	Path     string
	Expires  time.Time
	Session  bool
	HTTPOnly bool
	Secure   bool
	SameSite int32
}

// GetCookiesAsync enumerates cookies for uri using the official async
// ICoreWebView2CookieManager::GetCookies completion handler. The callback
// is invoked on the WebView2 UI/COM thread after all native objects used
// for the copy have been Released on that same thread.
func (i *ICoreWebView2CookieManager) GetCookiesAsync(uri string, callback func([]CopiedCookie, error)) {
	if i == nil {
		callback(nil, fmt.Errorf("cookie manager is nil"))
		return
	}
	var handler *iCoreWebView2GetCookiesCompletedHandler
	handler = newGetCookiesCompletedHandler(func(list *ICoreWebView2CookieList, err error) {
		// Keep the Go-backed COM handler reachable until Invoke and every
		// callback it runs have returned. WebView2 owns the list argument for
		// the duration of Invoke; copy its values here, but do not Release the
		// borrowed list itself.
		defer inFlightCookieHandlers.Delete(handler)
		if err != nil {
			callback(nil, err)
			return
		}
		cookies, copyErr := copyCookieList(list)
		callback(cookies, copyErr)
	})
	inFlightCookieHandlers.Store(handler, struct{}{})
	if err := i.GetCookies(uri, handler); err != nil {
		inFlightCookieHandlers.Delete(handler)
		handler.Release()
		callback(nil, err)
		return
	}
	// Drop the creator's reference after WebView2 has accepted the handler.
	// WebView2 retains its own reference until the asynchronous call finishes.
	handler.Release()
}

func copyCookieList(list *ICoreWebView2CookieList) ([]CopiedCookie, error) {
	if list == nil {
		return nil, nil
	}
	count, err := list.GetCount()
	if err != nil {
		return nil, err
	}
	out := make([]CopiedCookie, 0, count)
	for index := uint32(0); index < count; index++ {
		cookie, itemErr := list.GetItem(index)
		if itemErr != nil {
			return out, itemErr
		}
		copied, copyErr := copyCookie(cookie)
		cookie.Release()
		if copyErr != nil {
			return out, copyErr
		}
		out = append(out, copied)
	}
	return out, nil
}

func copyCookie(cookie *ICoreWebView2Cookie) (CopiedCookie, error) {
	var out CopiedCookie
	if cookie == nil {
		return out, fmt.Errorf("cookie is nil")
	}
	name, err := cookie.GetName()
	if err != nil {
		return out, err
	}
	value, err := cookie.GetValue()
	if err != nil {
		return out, err
	}
	domain, err := cookie.GetDomain()
	if err != nil {
		return out, err
	}
	path, err := cookie.GetPath()
	if err != nil {
		return out, err
	}
	expires, err := cookie.GetExpires()
	if err != nil {
		return out, err
	}
	httpOnly, err := cookie.GetIsHttpOnly()
	if err != nil {
		return out, err
	}
	secure, err := cookie.GetIsSecure()
	if err != nil {
		return out, err
	}
	sameSite, err := cookie.GetSameSite()
	if err != nil {
		return out, err
	}
	out = CopiedCookie{
		Name:     name,
		Value:    value,
		Domain:   domain,
		Path:     path,
		HTTPOnly: httpOnly,
		Secure:   secure,
		SameSite: sameSite,
	}
	if expires > 0 && !math.IsNaN(expires) {
		out.Expires = time.Unix(int64(expires), 0).UTC()
	} else {
		out.Session = true
	}
	return out, nil
}
