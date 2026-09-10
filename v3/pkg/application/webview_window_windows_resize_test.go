//go:build windows && !server

package application

import (
	"testing"

	"github.com/wailsapp/wails/v3/pkg/w32"
)

func TestResizeBorderHitTestForRects(t *testing.T) {
	windowRect := w32.RECT{Left: 0, Top: 0, Right: 120, Bottom: 120}
	contentRect := w32.RECT{Left: 8, Top: 8, Right: 112, Bottom: 112}
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
			got, hit := resizeBorderHitTestForRects(test.x, test.y, windowRect, contentRect, resizeBorder, 96)
			if hit != test.wantHit || got != test.want {
				t.Fatalf("resizeBorderHitTestForRects(%d, %d) = (%d, %t), want (%d, %t)",
					test.x, test.y, got, hit, test.want, test.wantHit)
			}
		})
	}
}

func TestResizeBorderClientRect(t *testing.T) {
	windowRect := w32.RECT{Left: 10, Top: 20, Right: 210, Bottom: 140}
	resizeBorder := WindowsWindowResizeBorder{
		Outside: LRTB{Left: 8, Right: 6, Top: 4, Bottom: 2},
	}

	got := resizeBorderClientRect(windowRect, resizeBorder, 144)
	want := w32.RECT{Left: 22, Top: 26, Right: 201, Bottom: 137}
	if got != want {
		t.Fatalf("resizeBorderClientRect() = %+v, want %+v", got, want)
	}
}

func TestResizeBorderClientRectClampsOversizedBorders(t *testing.T) {
	windowRect := w32.RECT{Left: 10, Top: 20, Right: 20, Bottom: 30}
	resizeBorder := WindowsWindowResizeBorder{
		Outside: LRTB{Left: 20, Right: 20, Top: 20, Bottom: 20},
	}

	got := resizeBorderClientRect(windowRect, resizeBorder, 96)
	want := w32.RECT{Left: 20, Top: 30, Right: 20, Bottom: 30}
	if got != want {
		t.Fatalf("resizeBorderClientRect() = %+v, want %+v", got, want)
	}
}

func TestScaleResizeBorder(t *testing.T) {
	got := scaleResizeBorder(LRTB{Left: 8, Right: -1, Top: 4, Bottom: 2}, 144)
	want := (LRTB{Left: 12, Right: 0, Top: 6, Bottom: 3})
	if got != want {
		t.Fatalf("scaleResizeBorder() = %+v, want %+v", got, want)
	}
}
