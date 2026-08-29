# nahida Wails v3 fork

Fork of [wailsapp/wails](https://github.com/wailsapp/wails) used by nahida-desktop.

Branch `v3-nahida` is based on `v3.0.0-beta.16` plus the patches below.
The Go module path stays `github.com/wailsapp/wails/v3`. Consumers pin this
fork with a `replace` directive, for example:

```
replace github.com/wailsapp/wails/v3 => github.com/myparsleycat/wails/v3 v3.0.0-beta.16-nahida.1
```

## Patches

Added for GameBanana auto-login:

- `WebviewWindow.GetCookies` / `DeleteCookies` (context-aware; official async WebView2 `GetCookies`)
- `WebviewWindowOptions.DisableWailsRuntime` (no runtime inject, no `wails:` dispatch, no Wails-specific request headers)

Added for file drop with WebView2 composition hosting on Windows:

- Register an OLE `IDropTarget` on composition-hosted windows when `EnableFileDrop` is enabled
- Forward `DragEnter`, `DragOver`, `DragLeave`, and `Drop` to the WebView2 composition controller
- Preserve the drag source's allowed drop effects through the forwarding chain

Added for GitHub updater channels shared with older application releases:

- Inspect up to 100 releases when prereleases are enabled
- Select the highest newer SemVer that has a compatible platform asset
- Skip drafts, older versions, invalid tags, and releases for other packaging formats

Added for attached modal focus restoration on Windows:

- Re-enable the modal owner before destroying the foreground modal
- Restore owner activation without stealing focus when a background modal closes
