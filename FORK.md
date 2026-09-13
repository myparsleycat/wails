# nahida Wails v3 fork

Fork of [wailsapp/wails](https://github.com/wailsapp/wails) used by nahida-desktop.

Branch `master` is the fork's integration line. It tracks upstream `master`
and carries the patches below; upstream changes are merged in as they land.
The Go module path stays `github.com/wailsapp/wails/v3`. Consumers pin this
fork with a `replace` directive, for example:

```
replace github.com/wailsapp/wails/v3 => github.com/myparsleycat/wails/v3 v3.0.0-beta.21
```

## Maintenance policy

- This fork exists to support `nahida-desktop`; fork-specific changes are committed and
  pushed directly to `myparsleycat/wails` after relevant verification passes.
- `wailsapp/wails` is treated as a read-only upstream. Do not create upstream issues or
  pull requests for these patches, and never push fork branches or tags there.
- Upstream-specific review automation, including CodeRabbit, is optional and is not a
  commit or release gate for this fork.
- Keep `master` in sync with `wailsapp/wails` master and merge upstream changes before
  developing new patches. Publish release tags from `master`; the former `v3-nahida`
  branch is superseded by `master`.
- Record consumer-visible patches below and publish a tag using the plain upstream
  version (for example `v3.0.0-beta.21`) when `nahida-desktop` needs to pin the change.
  Historical `-nahida.N` tags remain valid.

## Patches

Added for GameBanana auto-login:

- `WebviewWindow.GetCookies` / `DeleteCookies` (context-aware; official async WebView2 `GetCookies`)
- `WebviewWindowOptions.DisableWailsRuntime` (no runtime inject, no `wails:` dispatch, no Wails-specific request headers)

Added for file drop with WebView2 composition hosting on Windows:

- Register an OLE `IDropTarget` on composition-hosted windows when `EnableFileDrop` is enabled
- Forward `DragEnter`, `DragOver`, `DragLeave`, and `Drop` to the WebView2 composition controller
- Preserve the drag source's allowed drop effects through the forwarding chain
- Keep fast CF_HDROP operations eligible while WebView2 dispatches DOM drag handlers
- Resolve file paths natively on Drop and dispatch one `WindowFilesDropped` event through the existing platform-drop path
- Ignore duplicate file messages from older frontend runtimes while the native composition drop path is active

Added for GitHub updater channels shared with older application releases:

- Inspect up to 100 releases when prereleases are enabled
- Select the highest newer SemVer that has a compatible platform asset
- Skip drafts, older versions, invalid tags, and releases for other packaging formats

Added for attached modal focus restoration on Windows:

- Re-enable the modal owner before destroying the foreground modal
- Restore owner activation without stealing focus when a background modal closes

Added for native file dialog cancellation on Windows:

- Expose `application.ErrDialogCancelled` for open, save, folder, and multiple-selection dialogs
- Preserve all non-cancellation errors returned by the native common file dialog implementation

Added for frameless resize hit testing on Windows:

- `WindowsWindow.ResizeBorder` configures independent inside and outside resize widths for every edge
- Apply inside widths to both the native hit test and JavaScript runtime, without the default enlarged corner targets
- Reserve outside widths as native non-client frame around the WebView content
- Measure native hit tests from the actual client edge so the full configured outside band remains interactive

## Startup browser arguments

`App.SetWindowsBrowserArguments` lets the desktop load network settings after
the single-instance lock is acquired and before the first WebView is created.
It copies the complete argument list, applies it to all Windows WebViews, and
rejects changes once WebView initialization starts. Runtime proxy changes still
require restarting the application.
