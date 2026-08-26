//go:build windows && !server

package application

import (
	"fmt"

	"github.com/wailsapp/wails/v3/internal/webview2/pkg/edge"
)

func (w *windowsWebviewWindow) getCookies(uri string, callback func([]WebviewCookie, error)) {
	if w == nil || w.chromium == nil {
		callback(nil, fmt.Errorf("webview is not initialized"))
		return
	}
	manager, err := w.chromium.GetCookieManager()
	if err != nil {
		callback(nil, err)
		return
	}
	manager.GetCookiesAsync(uri, func(copied []edge.CopiedCookie, callErr error) {
		manager.Release()
		if callErr != nil {
			callback(nil, callErr)
			return
		}
		out := make([]WebviewCookie, 0, len(copied))
		for _, cookie := range copied {
			out = append(out, WebviewCookie{
				Name:     cookie.Name,
				Value:    cookie.Value,
				Domain:   cookie.Domain,
				Path:     cookie.Path,
				Expires:  cookie.Expires,
				Session:  cookie.Session,
				HTTPOnly: cookie.HTTPOnly,
				Secure:   cookie.Secure,
				SameSite: webviewSameSite(cookie.SameSite),
			})
		}
		callback(out, nil)
	})
}

func (w *windowsWebviewWindow) deleteCookies(uri string, names []string, callback func(error)) {
	if w == nil || w.chromium == nil {
		callback(fmt.Errorf("webview is not initialized"))
		return
	}
	manager, err := w.chromium.GetCookieManager()
	if err != nil {
		callback(err)
		return
	}
	defer manager.Release()
	if len(names) == 0 {
		callback(manager.DeleteCookies("", uri))
		return
	}
	var first error
	for _, name := range names {
		if delErr := manager.DeleteCookies(name, uri); delErr != nil && first == nil {
			first = delErr
		}
	}
	callback(first)
}

func webviewSameSite(value int32) WebviewCookieSameSite {
	switch value {
	case 1:
		return WebviewCookieSameSiteNone
	case 2:
		return WebviewCookieSameSiteLax
	case 3:
		return WebviewCookieSameSiteStrict
	default:
		return WebviewCookieSameSiteUnspecified
	}
}
