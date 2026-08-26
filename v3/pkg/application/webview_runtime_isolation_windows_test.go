//go:build windows && !server

package application

import "testing"

func TestDisabledWailsRuntimeLeavesWebRequestHeadersUntouched(t *testing.T) {
	tests := []struct {
		name     string
		disabled bool
		want     bool
	}{
		{name: "runtime enabled", want: true},
		{name: "runtime disabled", disabled: true, want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := &windowsWebviewWindow{
				parent: &WebviewWindow{
					options: WebviewWindowOptions{DisableWailsRuntime: tt.disabled},
				},
			}
			if got := w.shouldAddWailsRequestHeaders(); got != tt.want {
				t.Fatalf("shouldAddWailsRequestHeaders() = %v, want %v", got, tt.want)
			}
		})
	}
}
