package application

import (
	"sync"
	"testing"
)

func TestWindowsBrowserArgumentsFreeze(t *testing.T) {
	a := &App{}
	args := []string{"--proxy-server=http://127.0.0.1:1234"}
	if err := a.SetWindowsBrowserArguments(args); err != nil {
		t.Fatal(err)
	}
	args[0] = "--no-proxy-server"
	first := a.startWindowsBrowser()
	if first.AdditionalBrowserArgs[0] != "--proxy-server=http://127.0.0.1:1234" {
		t.Fatal("caller changed saved arguments")
	}
	first.AdditionalBrowserArgs[0] = "changed"
	if err := a.SetWindowsBrowserArguments(nil); err == nil {
		t.Fatal("accepted late arguments")
	}
	if a.startWindowsBrowser().AdditionalBrowserArgs[0] != "--proxy-server=http://127.0.0.1:1234" {
		t.Fatal("window changed shared arguments")
	}
}

func TestWindowsBrowserArgumentsConcurrentInitialization(t *testing.T) {
	a := &App{}
	var workers sync.WaitGroup
	for range 30 {
		workers.Go(func() { _ = a.SetWindowsBrowserArguments([]string{"--disable-quic"}) })
		workers.Go(func() { _ = a.startWindowsBrowser() })
		workers.Go(func() { _ = a.Config() })
	}
	workers.Wait()
	if err := a.SetWindowsBrowserArguments(nil); err == nil {
		t.Fatal("accepted configuration after initialization")
	}
}
