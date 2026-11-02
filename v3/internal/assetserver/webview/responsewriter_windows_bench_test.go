//go:build windows

package webview

import (
	"strconv"
	"testing"
)

// BenchmarkResponseWriterWrite mirrors http.ServeContent, which sets
// Content-Length and then copies the body in 32 KiB chunks.
func BenchmarkResponseWriterWrite(b *testing.B) {
	const size = 64 << 20
	chunk := make([]byte, 32<<10)
	b.SetBytes(size)
	b.ReportAllocs()
	for b.Loop() {
		rw := &responseWriter{}
		rw.Header().Set("Content-Length", strconv.Itoa(size))
		for written := 0; written < size; written += len(chunk) {
			if _, err := rw.Write(chunk); err != nil {
				b.Fatal(err)
			}
		}
	}
}
