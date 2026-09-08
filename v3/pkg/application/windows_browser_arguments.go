package application

import (
	"errors"
	"slices"
)

// SetWindowsBrowserArguments replaces the additional browser arguments before
// the first WebView starts initialization. Arguments apply to every window.
func (a *App) SetWindowsBrowserArguments(args []string) error {
	a.windowsBrowserMu.Lock()
	defer a.windowsBrowserMu.Unlock()
	if a.windowsBrowserStarted {
		return errors.New("Windows browser initialization has already started")
	}
	a.options.Windows.AdditionalBrowserArgs = slices.Clone(args)
	return nil
}

func (a *App) startWindowsBrowser() WindowsOptions {
	a.windowsBrowserMu.Lock()
	defer a.windowsBrowserMu.Unlock()
	a.windowsBrowserStarted = true
	options := a.options.Windows
	options.AdditionalBrowserArgs = slices.Clone(options.AdditionalBrowserArgs)
	return options
}
