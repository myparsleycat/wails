package application

import (
	"context"
	"errors"
	"net/url"
	"sync"
	"time"
)

// WebviewCookieSameSite is the cookie SameSite attribute.
type WebviewCookieSameSite int

const (
	WebviewCookieSameSiteUnspecified WebviewCookieSameSite = iota
	WebviewCookieSameSiteNone
	WebviewCookieSameSiteLax
	WebviewCookieSameSiteStrict
)

// WebviewCookie is a platform-copied cookie value. Callers must not assume
// the native cookie object remains valid after GetCookies returns.
type WebviewCookie struct {
	Name     string
	Value    string
	Domain   string
	Path     string
	Expires  time.Time
	Session  bool
	HTTPOnly bool
	Secure   bool
	SameSite WebviewCookieSameSite
}

// ErrWebviewCookiesUnsupported is returned when the current platform or
// window implementation cannot read or delete WebView cookies.
var ErrWebviewCookiesUnsupported = errors.New(
	"webview cookie access is unsupported on this platform",
)

var errWebviewCookieWindowDestroyed = errors.New("webview window is destroyed")
var errWebviewCookieURI = errors.New("webview cookie uri must be http or https")

type webviewCookieImpl interface {
	getCookies(uri string, callback func([]WebviewCookie, error))
	deleteCookies(uri string, names []string, callback func(error))
}

func parseWebviewCookieURI(raw string) (*url.URL, error) {
	parsed, err := url.Parse(raw)
	if err != nil {
		return nil, err
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return nil, errWebviewCookieURI
	}
	if parsed.Host == "" {
		return nil, errWebviewCookieURI
	}
	return parsed, nil
}

func waitCookieResult[T any](ctx context.Context, start func(func(T, error))) (T, error) {
	var zero T
	if ctx == nil {
		ctx = context.Background()
	}
	done := make(chan struct{})
	var once sync.Once
	var result T
	var err error
	start(func(value T, callErr error) {
		once.Do(func() {
			result = value
			err = callErr
			close(done)
		})
	})
	select {
	case <-ctx.Done():
		return zero, ctx.Err()
	case <-done:
		return result, err
	}
}

func runCookieCallOnUIThread(fn func()) {
	if globalApplication == nil || globalApplication.impl == nil {
		fn()
		return
	}
	InvokeAsync(fn)
}

func getCookiesFromImpl(ctx context.Context, uri string, impl webviewCookieImpl, destroyed func() bool) ([]WebviewCookie, error) {
	return waitCookieResult(ctx, func(callback func([]WebviewCookie, error)) {
		runCookieCallOnUIThread(func() {
			if destroyed != nil && destroyed() {
				callback(nil, errWebviewCookieWindowDestroyed)
				return
			}
			impl.getCookies(uri, func(cookies []WebviewCookie, err error) {
				defer func() { _ = recover() }()
				callback(cookies, err)
			})
		})
	})
}

func deleteCookiesFromImpl(ctx context.Context, uri string, names []string, impl webviewCookieImpl, destroyed func() bool) error {
	_, err := waitCookieResult(ctx, func(callback func(struct{}, error)) {
		runCookieCallOnUIThread(func() {
			if destroyed != nil && destroyed() {
				callback(struct{}{}, errWebviewCookieWindowDestroyed)
				return
			}
			impl.deleteCookies(uri, names, func(err error) {
				defer func() { _ = recover() }()
				callback(struct{}{}, err)
			})
		})
	})
	return err
}

// GetCookies returns cookies visible to uri from the native WebView store,
// including HttpOnly cookies. The native call is started on the UI/COM
// thread; this method never blocks that thread waiting for completion.
func (w *WebviewWindow) GetCookies(ctx context.Context, uri string) ([]WebviewCookie, error) {
	if _, err := parseWebviewCookieURI(uri); err != nil {
		return nil, err
	}
	if w == nil || w.isDestroyed() {
		return nil, errWebviewCookieWindowDestroyed
	}
	impl, ok := w.impl.(webviewCookieImpl)
	if !ok || impl == nil {
		return nil, ErrWebviewCookiesUnsupported
	}
	return getCookiesFromImpl(ctx, uri, impl, w.isDestroyed)
}

// DeleteCookies removes cookies matching uri. When names is empty every
// matching cookie is deleted; otherwise only the listed names are removed.
func (w *WebviewWindow) DeleteCookies(ctx context.Context, uri string, names ...string) error {
	if _, err := parseWebviewCookieURI(uri); err != nil {
		return err
	}
	if w == nil || w.isDestroyed() {
		return errWebviewCookieWindowDestroyed
	}
	impl, ok := w.impl.(webviewCookieImpl)
	if !ok || impl == nil {
		return ErrWebviewCookiesUnsupported
	}
	return deleteCookiesFromImpl(ctx, uri, names, impl, w.isDestroyed)
}
