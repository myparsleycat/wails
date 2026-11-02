import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// The shared protocol test environment has no DOM, so drag.js gets only what it reads.
class FakeMouseEvent extends Event {
    constructor(type, init = {}) {
        super(type);
        Object.assign(this, { buttons: 0, button: 0, clientX: 0, clientY: 0 }, init);
    }
}

beforeAll(async () => {
    const events = new EventTarget();
    vi.stubGlobal("MouseEvent", FakeMouseEvent);
    vi.stubGlobal("HTMLElement", class {});
    vi.stubGlobal("Node", class {});
    vi.stubGlobal("document", {
        readyState: "complete",
        addEventListener() {},
        body: { style: { cursor: "auto" } },
        documentElement: { clientWidth: 100, clientHeight: 100 },
    });
    Object.assign(window, {
        innerWidth: 100,
        innerHeight: 100,
        addEventListener: events.addEventListener.bind(events),
        dispatchEvent: events.dispatchEvent.bind(events),
        setInterval: () => 0,
        clearInterval() {},
    });
    window._wails = {
        environment: { OS: "windows" },
        flags: {
            resizeBorderInside: { left: 0, right: 0, top: 4, bottom: 0 },
            system: { resizeHandleWidth: 8, resizeHandleHeight: 8 },
        },
    };

    await import("./drag.js");
    window._wails.setResizable(true);
});

beforeEach(() => {
    document.body.style.cursor = "auto";
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, clientY: 50 }));
});

describe("configured resize borders", () => {
    it("keeps disabled inside edges interactive without losing the configured top edge", () => {
        window.dispatchEvent(new MouseEvent("mousemove", { clientX: 1, clientY: 50 }));
        expect(document.body.style.cursor).toBe("auto");

        window.dispatchEvent(new MouseEvent("mousemove", { clientX: 99, clientY: 50 }));
        expect(document.body.style.cursor).toBe("auto");

        window.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, clientY: 99 }));
        expect(document.body.style.cursor).toBe("auto");

        window.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, clientY: 1 }));
        expect(document.body.style.cursor).toBe("ns-resize");
    });
});
