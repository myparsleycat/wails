//go:build windows && !server

package application

import (
	"testing"

	"github.com/wailsapp/wails/v3/pkg/w32"
)

func TestResizeBorderHitTestForRects(t *testing.T) {
	windowRect := w32.RECT{Left: 0, Top: 0, Right: 120, Bottom: 120}
	visibleRect := w32.RECT{Left: 8, Top: 8, Right: 112, Bottom: 112}
	resizeBorder := WindowsWindowResizeBorder{
		Inside:  LRTB{Top: 4},
		Outside: LRTB{Left: 8, Right: 8, Top: 8, Bottom: 8},
	}

	tests := []struct {
		name    string
		x       int
		y       int
		want    uintptr
		wantHit bool
	}{
		{name: "left outside", x: 7, y: 60, want: w32.HTLEFT, wantHit: true},
		{name: "left inside disabled", x: 8, y: 60},
		{name: "right inside disabled", x: 111, y: 60},
		{name: "right outside", x: 112, y: 60, want: w32.HTRIGHT, wantHit: true},
		{name: "bottom inside disabled", x: 60, y: 111},
		{name: "bottom outside", x: 60, y: 112, want: w32.HTBOTTOM, wantHit: true},
		{name: "top inside", x: 60, y: 11, want: w32.HTTOP, wantHit: true},
		{name: "top past inside", x: 60, y: 12},
		{name: "outside corner", x: 7, y: 7, want: w32.HTTOPLEFT, wantHit: true},
		{name: "content", x: 60, y: 60},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, hit := resizeBorderHitTestForRects(test.x, test.y, windowRect, visibleRect, resizeBorder, 96)
			if hit != test.wantHit || got != test.want {
				t.Fatalf("resizeBorderHitTestForRects(%d, %d) = (%d, %t), want (%d, %t)",
					test.x, test.y, got, hit, test.want, test.wantHit)
			}
		})
	}
}

func TestScaleResizeBorder(t *testing.T) {
	got := scaleResizeBorder(LRTB{Left: 8, Right: -1, Top: 4, Bottom: 2}, 144)
	want := (LRTB{Left: 12, Right: 0, Top: 6, Bottom: 3})
	if got != want {
		t.Fatalf("scaleResizeBorder() = %+v, want %+v", got, want)
	}
}

func TestValidVisibleFrameRect(t *testing.T) {
	windowRect := w32.RECT{Left: 0, Top: 0, Right: 120, Bottom: 120}
	if !validVisibleFrameRect(w32.RECT{Left: 8, Top: 8, Right: 112, Bottom: 112}, windowRect) {
		t.Fatal("expected inset visible frame to be valid")
	}
	if validVisibleFrameRect(w32.RECT{Left: -1, Top: 0, Right: 120, Bottom: 120}, windowRect) {
		t.Fatal("expected frame extending outside the window to be invalid")
	}
	if validVisibleFrameRect(w32.RECT{}, windowRect) {
		t.Fatal("expected empty frame to be invalid")
	}
}
