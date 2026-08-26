# nahida Wails v3 fork

Fork of [wailsapp/wails](https://github.com/wailsapp/wails) used by nahida-desktop.

Branch `v3-nahida` is based on `v3.0.0-beta.14` plus the patches below.
The Go module path stays `github.com/wailsapp/wails/v3`. Consumers pin this
fork with a `replace` directive, for example:

```
replace github.com/wailsapp/wails/v3 => github.com/myparsleycat/wails/v3 v3.0.0-beta.14-nahida.1
```

## Patches

Added for GameBanana auto-login:

- `WebviewWindow.GetCookies` / `DeleteCookies` (context-aware; official async WebView2 `GetCookies`)
- `WebviewWindowOptions.DisableWailsRuntime` (no runtime inject, no `wails:` dispatch, no Wails-specific request headers)
