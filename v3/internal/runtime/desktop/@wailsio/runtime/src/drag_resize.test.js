import { beforeAll, beforeEach, describe, expect, it } from "vitest";

beforeAll(async () => {
    Object.defineProperties(window, {
        innerWidth: { configurable: true, value: 100 },
        innerHeight: { configurable: true, value: 100 },
    });
    Object.defineProperties(document.documentElement, {
        clientWidth: { configurable: true, value: 100 },
        clientHeight: { configurable: true, value: 100 },
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
