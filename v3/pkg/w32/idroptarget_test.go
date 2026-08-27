//go:build windows

package w32

import (
	"testing"

	"golang.org/x/sys/windows"
)

func TestDropTargetRawHooksReceiveAllowedEffect(t *testing.T) {
	tests := []struct {
		name string
		call func(target *DropTarget, effect *DWORD) uintptr
		set  func(target *DropTarget, received *DWORD)
	}{
		{
			name: "drag enter",
			call: func(target *DropTarget, effect *DWORD) uintptr {
				return target.DragEnter(nil, 0, POINT{}, effect)
			},
			set: func(target *DropTarget, received *DWORD) {
				target.OnEnterObject = func(_ *IDataObject, _ DWORD, _ POINT, allowedEffect DWORD) DWORD {
					*received = allowedEffect
					return DROPEFFECT_COPY
				}
			},
		},
		{
			name: "drag over",
			call: func(target *DropTarget, effect *DWORD) uintptr {
				return target.DragOver(0, POINT{}, effect)
			},
			set: func(target *DropTarget, received *DWORD) {
				target.OnOverObject = func(_ DWORD, _ POINT, allowedEffect DWORD) DWORD {
					*received = allowedEffect
					return DROPEFFECT_COPY
				}
			},
		},
		{
			name: "drop",
			call: func(target *DropTarget, effect *DWORD) uintptr {
				return target.Drop(nil, 0, POINT{}, effect)
			},
			set: func(target *DropTarget, received *DWORD) {
				target.OnDropObject = func(_ *IDataObject, _ DWORD, _ POINT, allowedEffect DWORD) DWORD {
					*received = allowedEffect
					return DROPEFFECT_COPY
				}
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			target := NewDropTarget()
			var received DWORD
			test.set(target, &received)

			effect := DROPEFFECT_COPY | DROPEFFECT_MOVE
			if result := test.call(target, &effect); result != uintptr(windows.S_OK) {
				t.Fatalf("result = %#x, want S_OK", result)
			}
			if received != DROPEFFECT_COPY|DROPEFFECT_MOVE {
				t.Fatalf("allowed effect = %d, want copy|move", received)
			}
			if effect != DROPEFFECT_COPY {
				t.Fatalf("result effect = %d, want copy", effect)
			}
		})
	}
}
