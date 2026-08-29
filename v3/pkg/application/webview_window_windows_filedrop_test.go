//go:build windows

package application

import (
	"testing"

	"github.com/wailsapp/wails/v3/pkg/w32"
)

func TestUsesNativeCompositionFileDrop(t *testing.T) {
	tests := []struct {
		name               string
		enableFileDrop     bool
		compositionHosting bool
		want               bool
	}{
		{
			name:               "enabled with composition hosting",
			enableFileDrop:     true,
			compositionHosting: true,
			want:               true,
		},
		{
			name:               "file drop disabled",
			enableFileDrop:     false,
			compositionHosting: true,
			want:               false,
		},
		{
			name:               "HWND hosting",
			enableFileDrop:     true,
			compositionHosting: false,
			want:               false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			window := &WebviewWindow{
				options: WebviewWindowOptions{
					EnableFileDrop: test.enableFileDrop,
					Windows: WindowsWindow{
						WebView2CompositionHosting: test.compositionHosting,
					},
				},
			}
			webview := &windowsWebviewWindow{parent: window}

			if got := webview.usesNativeCompositionFileDrop(); got != test.want {
				t.Fatalf("usesNativeCompositionFileDrop() = %v, want %v", got, test.want)
			}
		})
	}
}

func TestProcessMessageWithAdditionalObjectsIgnoresLegacyCompositionFileDrop(t *testing.T) {
	window := &WebviewWindow{
		options: WebviewWindowOptions{
			EnableFileDrop: true,
			Windows: WindowsWindow{
				WebView2CompositionHosting: true,
			},
		},
	}
	webview := &windowsWebviewWindow{parent: window}

	// Nil COM arguments make this test fail immediately if the legacy message
	// reaches WebView2 object processing instead of the native-drop guard.
	webview.processMessageWithAdditionalObjects("file:drop:10:20", nil, nil)
}

func TestPreferredFileDropEffect(t *testing.T) {
	tests := []struct {
		name    string
		allowed w32.DWORD
		want    w32.DWORD
	}{
		{name: "none", allowed: w32.DROPEFFECT_NONE, want: w32.DROPEFFECT_NONE},
		{name: "copy", allowed: w32.DROPEFFECT_COPY, want: w32.DROPEFFECT_COPY},
		{name: "move", allowed: w32.DROPEFFECT_MOVE, want: w32.DROPEFFECT_MOVE},
		{name: "link", allowed: w32.DROPEFFECT_LINK, want: w32.DROPEFFECT_LINK},
		{name: "prefer copy", allowed: w32.DROPEFFECT_MOVE | w32.DROPEFFECT_COPY, want: w32.DROPEFFECT_COPY},
		{name: "prefer move over link", allowed: w32.DROPEFFECT_LINK | w32.DROPEFFECT_MOVE, want: w32.DROPEFFECT_MOVE},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := preferredFileDropEffect(test.allowed); got != test.want {
				t.Fatalf("preferredFileDropEffect(%d) = %d, want %d", test.allowed, got, test.want)
			}
		})
	}
}

func TestAcceptPendingFileDrop(t *testing.T) {
	window := &windowsWebviewWindow{fileDragActive: true}
	if got := window.acceptPendingFileDrop(w32.DROPEFFECT_NONE, w32.DROPEFFECT_COPY); got != w32.DROPEFFECT_COPY {
		t.Fatalf("pending file drop effect = %d, want copy", got)
	}
	if got := window.acceptPendingFileDrop(w32.DROPEFFECT_MOVE, w32.DROPEFFECT_COPY); got != w32.DROPEFFECT_MOVE {
		t.Fatalf("WebView2-selected effect = %d, want move", got)
	}

	window.fileDragActive = false
	if got := window.acceptPendingFileDrop(w32.DROPEFFECT_NONE, w32.DROPEFFECT_COPY); got != w32.DROPEFFECT_NONE {
		t.Fatalf("non-file drop effect = %d, want none", got)
	}
}
