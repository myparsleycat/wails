# AI Agent Instructions for the Nahida Wails v3 Fork

## Fork Scope and Remotes

This is a purpose-built fork used by `nahida-desktop`, not a workspace for contributing
changes back to Wails upstream.

- `origin` (`myparsleycat/wails`) is the writable personal fork.
- `upstream` (`wailsapp/wails`) is read-only reference material.
- Never create an issue or pull request in `wailsapp/wails` for fork-specific work.
- Never push branches, commits, or tags to `upstream`.
- Upstream issues, pull requests, and documentation may be inspected when useful, but
  searching or linking them is not a prerequisite for work in this fork.

## Workflow for AI Agents

1. Keep changes focused on behavior required by `nahida-desktop`.
2. Follow the API selected by `v3/go.mod` and prefer the checked-out source when it
   disagrees with published documentation.
3. Add focused tests for changed behavior and run the applicable tests, linters, runtime
   builds, and asset generation before committing.
4. Update `FORK.md` when a patch changes the fork's behavior or consumer requirements.
5. Use Conventional Commits and the repository's configured Git identity. There is no
   required bot identity for this personal fork.
6. Once the requested change is verified, it may be committed and pushed to `origin`
   without a separate review-service run or an additional push-confirmation round trip.
7. Report the commit, tag when applicable, verification performed, and remote sync state.

### Important Rules

- CodeRabbit is optional and is not a commit or push gate.
- Do not create GitHub issues or pull requests unless the user explicitly requests one.
  Regardless of the request context, never create them in `wailsapp/wails` from this fork.
- Store AI-generated planning documents in `history/`, not the repository root.
- Preserve unrelated worktree changes and do not rewrite shared history unless explicitly
  requested.

## Windows Full-Suite Test Preflight

Do not run `go test ./...` in `v3/` with the host's default Go toolchain. The binding
generator golden tests are sensitive to standard-library types: a newer Go release can
introduce packages such as `encoding/json/v2`, produce large misleading golden diffs, and
leave untracked files under `internal/generator/testdata/output`.

Before a full Windows test run:

1. Run the focused tests for the changed packages first. For example, application dialog
   changes start with `go test ./pkg/application`.
2. Read the `go` directive from `v3/go.mod` and set `GOTOOLCHAIN` to that exact version.
   Confirm the selected version with `go version` before testing.
3. The Windows wake tests execute both `sh` and commands such as `true`. Discover the Git
   installation from `Get-Command git` and prepend both Git's `usr/bin` and `bin`
   directories to `PATH` for the test process.
4. Only after this preflight, run `go test ./...` when the task or acceptance criteria
   actually require the full suite.

Use this PowerShell pattern from `v3/`:

```powershell
$wailsGoVersion = (Select-String -Path go.mod -Pattern '^go\s+(\S+)$').Matches.Groups[1].Value
$env:GOTOOLCHAIN = "go$wailsGoVersion"
$gitExe = (Get-Command git).Source
$gitRoot = Split-Path -Parent (Split-Path -Parent $gitExe)
$env:PATH = "$gitRoot\usr\bin;$gitRoot\bin;$env:PATH"
go version
go test ./...
```

If a full run fails because the preflight was not applied, do not repeatedly restart the
entire suite. Correct the environment, rerun the failing package first, and perform at
most one clean full-suite rerun if it is still required. Do not update generator golden
files to match output from the wrong Go version. Remove only verified test-generated
artifacts, and stop further test runs immediately when the user asks to skip them.

### Managing AI-Generated Planning Documents

AI assistants often create planning and design documents during development:
- PLAN.md, ARCHITECTURE.md
- DESIGN.md, CODEBASE_SUMMARY.md, INTEGRATION_PLAN.md
- TESTING_GUIDE.md, TECHNICAL_DESIGN.md, and similar files

**Best Practice: Use a dedicated directory for these ephemeral files**

**Recommended approach:**
- Create a `history/` directory in the project root
- Store all ephemeral AI-generated planning/design docs in `history/`
- Keep the repository root clean and focused on permanent project files
- Only access `history/` when explicitly asked to review past planning

**Example .gitignore entry (optional):**
```
# AI planning documents (ephemeral)
history/
```

**Benefits:**
- Clean repository root
- Clear separation between ephemeral and permanent documentation
- Easy to exclude from version control if desired
- Preserves planning history for archeological research
- Reduces noise when browsing the project

## Frontend Runtime: Two Build Outputs

The TypeScript runtime in `v3/internal/runtime/desktop/@wailsio/runtime` produces **two**
independent artifacts, and rebuilding one but not the other is a common and confusing
mistake:

| task | output | consumed by |
|---|---|---|
| `task v3:runtime:build:assets` | `v3/internal/assetserver/bundledassets/runtime.js` (+ `.debug.js`) | the webview, served at `/wails/runtime.js` |
| `task v3:runtime:build:package` | `dist/` in the package directory | an app's frontend, via `node_modules` |

After changing anything under `src/`, rebuild **both**. CI verifies the committed bundles
match `build:assets` output exactly, so the bundles must be committed with the change.

An application imports `@wailsio/runtime` from npm, so it will not see runtime changes made
in this checkout. To test an app against the working tree:

```bash
task v3:install-runtime -- ./path/to/your-app/frontend
```

Undo with `npm install @wailsio/runtime@latest` in the same directory.

## Subsystem References

Some subsystems have a dedicated internals page written for agents. Read the relevant one
before changing that code — several of its decisions look arbitrary until you know which
measured bug they prevent.

- **Streams** (`pkg/application/stream*.go`, `runtime/.../stream.ts`):
  `docs/src/content/docs/guides/advanced/streams-internals.mdx`. Covers the held-poll
  design, the buffer constants and how to pick them, session and connection lifecycle,
  transport selection, and what is unfinished. To convert an existing WebSocket
  implementation, follow `docs/src/content/docs/guides/streams-from-websockets.mdx` —
  a mechanical checklist, including the differences that break silently.

## Landing the Plane (Session Completion)

**When ending a work session**, complete the applicable steps below.

**MANDATORY WORKFLOW:**

1. **Run quality gates** (if code changed) - Tests, linters, builds, and generated-asset checks
2. **Document remaining work** - Report follow-up work in the handoff; do not create an
   upstream issue or pull request
3. **Prepare for remote sync**:
   ```bash
   git status
   ```
   Resolve the exact branch and confirm the push remote is `origin`, never `upstream`.
4. **Commit and sync** - After verification, commit requested changes and push them to
   `origin`. Push a release tag when the consumer is being pinned to that tag.
5. **Clean up** - Review stashes and remove only obsolete ones; prune remote branches only
   when it is safe and relevant
6. **Verify** - Confirm intended commits and tags exist on `origin` and the worktree is clean
7. **Hand off** - Report what changed, verification results, commit/tag identifiers, and any
   known environmental limitations

**CRITICAL RULES:**
- Treat `upstream` as read-only; never create an issue or pull request in `wailsapp/wails`.
- CodeRabbit and other upstream-specific review automation are not required.
- Push only verified, intentional changes to `origin` and report the resulting remote state.
