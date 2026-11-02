// \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) {
		__defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	}
	if (!no_symbols) {
		__defProp(target, Symbol.toStringTag, { value: "Module" });
	}
	return target;
};

// src/environment.ts
var hasDOM;
function init_environment() {
	return (init_environment = __esmMin((() => {
		hasDOM = typeof window !== "undefined" && typeof document !== "undefined";
	})))();
}

// src/nanoid.ts
function nanoid(size = 21) {
	const source = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" ? crypto : null;
	if (source) {
		const bytes = new Uint8Array(size);
		source.getRandomValues(bytes);
		let id = "";
		for (let i = 0; i < size; i++) id += urlAlphabet[bytes[i] & 63];
		return id;
	}
	let id = "";
	let i = size | 0;
	while (i--) id += urlAlphabet[Math.random() * 64 | 0];
	return id;
}
var urlAlphabet;
function init_nanoid() {
	return (init_nanoid = __esmMin((() => {
		urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
function init_typeof() {
	return (init_typeof = __esmMin((() => {})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
function init_toPrimitive() {
	return (init_toPrimitive = __esmMin((() => {
		/* @__PURE__ */ init_typeof();
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}
function init_toPropertyKey() {
	return (init_toPropertyKey = __esmMin((() => {
		/* @__PURE__ */ init_typeof();
		init_toPrimitive();
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}
function init_defineProperty() {
	return (init_defineProperty = __esmMin((() => {
		init_toPropertyKey();
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/objectSpread2.js
function ownKeys(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r) {
			return Object.getOwnPropertyDescriptor(e, r).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread2(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
			_defineProperty(e, r, t[r]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
			Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
		});
	}
	return e;
}
function init_objectSpread2() {
	return (init_objectSpread2 = __esmMin((() => {
		init_defineProperty();
	})))();
}

// src/runtime.ts
function runtimeURL() {
	return window.location.origin + "/wails/runtime";
}
function setTransport(transport) {
	customTransport = transport;
}
function getTransport() {
	return customTransport;
}
function newRuntimeCaller(object, windowName = "") {
	return function(method, args = null) {
		return runtimeCallWithID(object, method, windowName, args);
	};
}
async function runtimeCallWithID(objectID, method, windowName, args) {
	var _response$headers$get, _response$headers$get2;
	if (customTransport) return customTransport.call(objectID, method, windowName, args);
	let url = new URL(runtimeURL());
	let body = {
		object: objectID,
		method
	};
	if (args !== null && args !== void 0) body.args = args;
	let headers = {
		["x-wails-client-id"]: clientId,
		["Content-Type"]: "application/json"
	};
	if (windowName) headers["x-wails-window-name"] = windowName;
	const bodyStr = JSON.stringify(body);
	let response;
	if (bodyStr.length > CHUNK_THRESHOLD$1) response = await sendChunked(url, headers, bodyStr);
	else response = await fetch(url, {
		method: "POST",
		headers,
		body: bodyStr
	});
	if (!response.ok) {
		const ct = response.headers.get("Content-Type");
		if (ct === null || ct === void 0 ? void 0 : ct.includes("application/json")) {
			const json = await response.json();
			let err;
			switch (json.kind) {
				case "ReferenceError":
					err = new ReferenceError(json.message);
					break;
				case "TypeError":
					err = new TypeError(json.message);
					break;
				case "RuntimeError":
					err = new RuntimeError(json.message);
					break;
				default: err = new Error(json.message);
			}
			err.cause = json.cause;
			throw err;
		}
		throw new Error(await response.text());
	}
	if (((_response$headers$get = (_response$headers$get2 = response.headers.get("Content-Type")) === null || _response$headers$get2 === void 0 ? void 0 : _response$headers$get2.indexOf("application/json")) !== null && _response$headers$get !== void 0 ? _response$headers$get : -1) !== -1) return response.json();
	else return response.text();
}
async function sendChunked(url, headers, bodyStr) {
	const chunkId = nanoid();
	const bodyBytes = new TextEncoder().encode(bodyStr);
	const totalChunks = Math.ceil(bodyBytes.length / CHUNK_THRESHOLD$1);
	for (let i = 0; i < totalChunks - 1; i++) {
		const chunk = bodyBytes.subarray(i * CHUNK_THRESHOLD$1, (i + 1) * CHUNK_THRESHOLD$1);
		const resp = await fetch(url, {
			method: "POST",
			headers: _objectSpread2(_objectSpread2({}, headers), {}, {
				"x-wails-chunk-id": chunkId,
				"x-wails-chunk-index": String(i),
				"x-wails-chunk-total": String(totalChunks)
			}),
			body: chunk
		});
		if (!resp.ok) throw new Error(await resp.text());
	}
	return fetch(url, {
		method: "POST",
		headers: _objectSpread2(_objectSpread2({}, headers), {}, {
			"x-wails-chunk-id": chunkId,
			"x-wails-chunk-index": String(totalChunks - 1),
			"x-wails-chunk-total": String(totalChunks)
		}),
		body: bodyBytes.subarray((totalChunks - 1) * CHUNK_THRESHOLD$1)
	});
}
var _window$wails, CHUNK_THRESHOLD$1, RuntimeError, objectNames, clientId, customTransport, androidBridge;
function init_runtime() {
	return (init_runtime = __esmMin((() => {
		init_nanoid();
		init_environment();
		init_objectSpread2();
		;
		CHUNK_THRESHOLD$1 = 524288;
		RuntimeError = class extends Error {
			constructor(message, options) {
				super(message, options);
				this.name = "RuntimeError";
			}
		};
		objectNames = Object.freeze({
			Call: 0,
			Clipboard: 1,
			Application: 2,
			Events: 3,
			ContextMenu: 4,
			Dialog: 5,
			Window: 6,
			Screens: 7,
			System: 8,
			Browser: 9,
			CancelCall: 10,
			IOS: 11,
			Android: 12
		});
		clientId = nanoid();
		customTransport = null;
		androidBridge = hasDOM && typeof ((_window$wails = window.wails) === null || _window$wails === void 0 ? void 0 : _window$wails.invokeAsync) === "function" ? window.wails : null;
		if (androidBridge) {
			const pending = /* @__PURE__ */ new Map();
			window._wailsAndroidCallback = (id, response, error) => {
				const promise = pending.get(id);
				if (!promise) return;
				pending.delete(id);
				if (error) {
					promise.reject(new Error(error));
					return;
				}
				try {
					const envelope = JSON.parse(response !== null && response !== void 0 ? response : "{}");
					if (!envelope.ok) {
						var _envelope$error;
						promise.reject(new Error((_envelope$error = envelope.error) !== null && _envelope$error !== void 0 ? _envelope$error : "unknown runtime call error"));
						return;
					}
					promise.resolve("text" in envelope ? envelope.text : envelope.data);
				} catch (e) {
					promise.reject(e);
				}
			};
			customTransport = { call(objectID, method, windowName, args) {
				return new Promise((resolve, reject) => {
					const id = nanoid();
					pending.set(id, {
						resolve,
						reject
					});
					try {
						androidBridge.invokeAsync(id, JSON.stringify({
							object: objectID,
							method,
							windowName,
							args: args !== null && args !== void 0 ? args : null,
							clientId
						}));
					} catch (e) {
						pending.delete(id);
						reject(e);
					}
				});
			} };
		}
	})))();
}

// src/system.ts
var system_exports = /* @__PURE__ */ __exportAll({
	Capabilities: () => Capabilities,
	Environment: () => Environment,
	IsAMD64: () => IsAMD64,
	IsARM: () => IsARM,
	IsARM64: () => IsARM64,
	IsAndroid: () => IsAndroid,
	IsDarkMode: () => IsDarkMode,
	IsDebug: () => IsDebug,
	IsDesktop: () => IsDesktop,
	IsIOS: () => IsIOS,
	IsLinux: () => IsLinux,
	IsMac: () => IsMac,
	IsMobile: () => IsMobile,
	IsWindows: () => IsWindows,
	invoke: () => invoke
});
function invoke(msg) {
	_invoke === null || _invoke === void 0 || _invoke(msg);
}
function IsDarkMode() {
	return call$10(SystemIsDarkMode);
}
async function Capabilities() {
	return call$10(SystemCapabilities);
}
function Environment() {
	return call$10(SystemEnvironment);
}
function IsWindows() {
	var _window$_wails;
	return ((_window$_wails = window._wails) === null || _window$_wails === void 0 || (_window$_wails = _window$_wails.environment) === null || _window$_wails === void 0 ? void 0 : _window$_wails.OS) === "windows";
}
function IsLinux() {
	var _window$_wails2;
	return ((_window$_wails2 = window._wails) === null || _window$_wails2 === void 0 || (_window$_wails2 = _window$_wails2.environment) === null || _window$_wails2 === void 0 ? void 0 : _window$_wails2.OS) === "linux";
}
function IsMac() {
	var _window$_wails3;
	return ((_window$_wails3 = window._wails) === null || _window$_wails3 === void 0 || (_window$_wails3 = _window$_wails3.environment) === null || _window$_wails3 === void 0 ? void 0 : _window$_wails3.OS) === "darwin";
}
function IsIOS() {
	var _window$_wails4;
	return ((_window$_wails4 = window._wails) === null || _window$_wails4 === void 0 || (_window$_wails4 = _window$_wails4.environment) === null || _window$_wails4 === void 0 ? void 0 : _window$_wails4.OS) === "ios";
}
function IsAndroid() {
	var _window$_wails5;
	return ((_window$_wails5 = window._wails) === null || _window$_wails5 === void 0 || (_window$_wails5 = _window$_wails5.environment) === null || _window$_wails5 === void 0 ? void 0 : _window$_wails5.OS) === "android";
}
function IsMobile() {
	return IsIOS() || IsAndroid();
}
function IsDesktop() {
	return IsMac() || IsWindows() || IsLinux();
}
function IsAMD64() {
	var _window$_wails6;
	return ((_window$_wails6 = window._wails) === null || _window$_wails6 === void 0 || (_window$_wails6 = _window$_wails6.environment) === null || _window$_wails6 === void 0 ? void 0 : _window$_wails6.Arch) === "amd64";
}
function IsARM() {
	var _window$_wails7;
	return ((_window$_wails7 = window._wails) === null || _window$_wails7 === void 0 || (_window$_wails7 = _window$_wails7.environment) === null || _window$_wails7 === void 0 ? void 0 : _window$_wails7.Arch) === "arm";
}
function IsARM64() {
	var _window$_wails8;
	return ((_window$_wails8 = window._wails) === null || _window$_wails8 === void 0 || (_window$_wails8 = _window$_wails8.environment) === null || _window$_wails8 === void 0 ? void 0 : _window$_wails8.Arch) === "arm64";
}
function IsDebug() {
	var _window$_wails9;
	return Boolean((_window$_wails9 = window._wails) === null || _window$_wails9 === void 0 || (_window$_wails9 = _window$_wails9.environment) === null || _window$_wails9 === void 0 ? void 0 : _window$_wails9.Debug);
}
var call$10, SystemIsDarkMode, SystemEnvironment, SystemCapabilities, _invoke;
function init_system() {
	return (init_system = __esmMin((() => {
		init_runtime();
		call$10 = newRuntimeCaller(objectNames.System);
		SystemIsDarkMode = 0;
		SystemEnvironment = 1;
		SystemCapabilities = 2;
		_invoke = (function() {
			try {
				var _window$chrome, _window$webkit, _window$wails;
				if ((_window$chrome = window.chrome) === null || _window$chrome === void 0 || (_window$chrome = _window$chrome.webview) === null || _window$chrome === void 0 ? void 0 : _window$chrome.postMessage) return window.chrome.webview.postMessage.bind(window.chrome.webview);
				else if ((_window$webkit = window.webkit) === null || _window$webkit === void 0 || (_window$webkit = _window$webkit.messageHandlers) === null || _window$webkit === void 0 || (_window$webkit = _window$webkit["external"]) === null || _window$webkit === void 0 ? void 0 : _window$webkit.postMessage) return window.webkit.messageHandlers["external"].postMessage.bind(window.webkit.messageHandlers["external"]);
				else if ((_window$wails = window.wails) === null || _window$wails === void 0 ? void 0 : _window$wails.invoke) {
					const bridge = window.wails;
					return (msg) => bridge.invoke(typeof msg === "string" ? msg : JSON.stringify(msg));
				}
			} catch (e) {}
			console.warn("\n%c⚠️ Browser Environment Detected %c\n\n%cOnly UI previews are available in the browser. For full functionality, please run the application in desktop mode.\nMore information at: https://v3.wails.io/learn/build/#using-a-browser-for-development\n", "background: #ffffff; color: #000000; font-weight: bold; padding: 4px 8px; border-radius: 4px; border: 2px solid #000000;", "background: transparent;", "color: #ffffff; font-style: italic; font-weight: bold;");
			return null;
		})();
	})))();
}

// src/utils.ts
function debugLog(message) {
	console.log("%c wails3 %c " + message + " ", "background: #aa0000; color: #fff; border-radius: 3px 0px 0px 3px; padding: 1px; font-size: 0.7rem", "background: #009900; color: #fff; border-radius: 0px 3px 3px 0px; padding: 1px; font-size: 0.7rem");
}
function canTrackButtons() {
	return new MouseEvent("mousedown").buttons === 0;
}
function canAbortListeners() {
	if (!EventTarget || !AbortSignal || !AbortController) return false;
	let result = true;
	const target = new EventTarget();
	const controller = new AbortController();
	target.addEventListener("test", () => {
		result = false;
	}, { signal: controller.signal });
	controller.abort();
	target.dispatchEvent(new CustomEvent("test"));
	return result;
}
function eventTarget(event) {
	if (event.target instanceof HTMLElement) return event.target;
	else if (!(event.target instanceof HTMLElement) && event.target instanceof Node) {
		var _event$target$parentE;
		return (_event$target$parentE = event.target.parentElement) !== null && _event$target$parentE !== void 0 ? _event$target$parentE : document.body;
	} else return document.body;
}
function whenReady(callback) {
	if (isReady || document.readyState === "complete") callback();
	else document.addEventListener("DOMContentLoaded", callback);
}
var isReady;
function init_utils() {
	return (init_utils = __esmMin((() => {
		init_environment();
		isReady = false;
		if (hasDOM) document.addEventListener("DOMContentLoaded", () => {
			isReady = true;
		});
	})))();
}

// src/contextmenu.ts
function openContextMenu(id, x, y, data) {
	call$9(ContextMenuOpen, {
		id,
		x,
		y,
		data
	});
}
function contextMenuHandler(event) {
	const target = eventTarget(event);
	const customContextMenu = window.getComputedStyle(target).getPropertyValue("--custom-contextmenu").trim();
	if (customContextMenu) {
		event.preventDefault();
		const data = window.getComputedStyle(target).getPropertyValue("--custom-contextmenu-data");
		openContextMenu(customContextMenu, event.clientX, event.clientY, data);
	} else processDefaultContextMenu(event, target);
}
function processDefaultContextMenu(event, target) {
	if (IsDebug()) return;
	switch (window.getComputedStyle(target).getPropertyValue("--default-contextmenu").trim()) {
		case "show": return;
		case "hide":
			event.preventDefault();
			return;
	}
	if (target.isContentEditable) return;
	const selection = window.getSelection();
	const hasSelection = selection && selection.toString().length > 0;
	if (hasSelection) for (let i = 0; i < selection.rangeCount; i++) {
		const rects = selection.getRangeAt(i).getClientRects();
		for (let j = 0; j < rects.length; j++) {
			const rect = rects[j];
			if (document.elementFromPoint(rect.left, rect.top) === target) return;
		}
	}
	if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
		if (hasSelection || !target.readOnly && !target.disabled) return;
	}
	event.preventDefault();
}
var call$9, ContextMenuOpen;
function init_contextmenu() {
	return (init_contextmenu = __esmMin((() => {
		init_runtime();
		init_system();
		init_utils();
		init_environment();
		if (hasDOM) window.addEventListener("contextmenu", contextMenuHandler);
		call$9 = newRuntimeCaller(objectNames.ContextMenu);
		ContextMenuOpen = 0;
	})))();
}

// src/flags.ts
var flags_exports = /* @__PURE__ */ __exportAll({ GetFlag: () => GetFlag });
function GetFlag(key) {
	try {
		return window._wails.flags[key];
	} catch (e) {
		throw new Error("Unable to retrieve flag '" + key + "': " + e, { cause: e });
	}
}
function init_flags() {
	return (init_flags = __esmMin((() => {})))();
}

// src/drag.ts
function isMobile() {
	var _window$_wails;
	const os = (_window$_wails = window._wails) === null || _window$_wails === void 0 || (_window$_wails = _window$_wails.environment) === null || _window$_wails === void 0 ? void 0 : _window$_wails.OS;
	if (os === "ios" || os === "android") return true;
	const ua = navigator.userAgent || navigator.vendor || window.opera || "";
	return /android|iphone|ipad|ipod|iemobile|wpdesktop/i.test(ua);
}
function tryInitDragHandlers() {
	if (dragInitDone) return;
	if (isMobile()) return;
	window.addEventListener("mousedown", update, { capture: true });
	window.addEventListener("mousemove", update, { capture: true });
	window.addEventListener("mouseup", update, { capture: true });
	for (const ev of [
		"click",
		"contextmenu",
		"dblclick"
	]) window.addEventListener(ev, suppressEvent, { capture: true });
	dragInitDone = true;
}
function suppressEvent(event) {
	if (event.type === "dblclick" && IsMac() && window === window.top && isDraggableEvent(event)) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
		invoke("wails:drag:doubleclick");
		return;
	}
	if (dragging || resizing) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
	}
}
function isDraggableEvent(event) {
	const target = eventTarget(event);
	return window.getComputedStyle(target).getPropertyValue("--wails-draggable").trim() === "drag" && event.offsetX >= 0 && event.offsetX < target.clientWidth && event.offsetY >= 0 && event.offsetY < target.clientHeight;
}
function update(event) {
	let eventType, eventButtons = event.buttons;
	switch (event.type) {
		case "mousedown":
			eventType = MouseDown;
			if (!buttonsTracked) eventButtons = buttons | 1 << event.button;
			break;
		case "mouseup":
			eventType = MouseUp;
			if (!buttonsTracked) eventButtons = buttons & ~(1 << event.button);
			break;
		default:
			eventType = MouseMove;
			if (!buttonsTracked) eventButtons = buttons;
	}
	let released = buttons & ~eventButtons;
	let pressed = eventButtons & ~buttons;
	buttons = eventButtons;
	if (eventType === MouseDown && !(pressed & event.button)) {
		released |= 1 << event.button;
		pressed |= 1 << event.button;
	}
	if (eventType !== MouseMove && resizing || dragging && (eventType === MouseDown || event.button !== 0)) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
	}
	if (released & 1) primaryUp(event);
	if (pressed & 1) primaryDown(event);
	if (eventType === MouseMove) onMouseMove(event);
}
function primaryDown(event) {
	canDrag = false;
	canResize = false;
	if (!IsWindows()) {
		if (event.type === "mousedown" && event.button === 0 && event.detail !== 1) return;
	}
	if (resizeEdge) {
		if (event.type !== "mousedown") return;
		canResize = true;
		return;
	}
	canDrag = isDraggableEvent(event);
}
function primaryUp(event) {
	canDrag = false;
	dragging = false;
	canResize = false;
	resizing = false;
}
function setResize(edge) {
	if (edge) {
		if (!resizeEdge) defaultCursor = document.body.style.cursor;
		document.body.style.cursor = cursorForEdge[edge];
	} else if (!edge && resizeEdge) document.body.style.cursor = defaultCursor;
	resizeEdge = edge || "";
}
function onMouseMove(event) {
	var _configuredBorder$lef, _configuredBorder$rig, _configuredBorder$top, _configuredBorder$bot;
	if (canResize && resizeEdge) {
		resizing = true;
		invoke("wails:resize:" + resizeEdge);
	} else if (canDrag) {
		dragging = true;
		invoke("wails:drag");
	}
	if (dragging || resizing) {
		canDrag = canResize = false;
		return;
	}
	if (!resizable || !IsWindows() && !(IsLinux() && GetFlag("frameless"))) {
		if (resizeEdge) setResize();
		return;
	}
	const configuredBorder = GetFlag("resizeBorderInside");
	const resizeHandleHeight = GetFlag("system.resizeHandleHeight") || 5;
	const resizeHandleWidth = GetFlag("system.resizeHandleWidth") || 5;
	const leftWidth = (_configuredBorder$lef = configuredBorder === null || configuredBorder === void 0 ? void 0 : configuredBorder.left) !== null && _configuredBorder$lef !== void 0 ? _configuredBorder$lef : resizeHandleWidth;
	const rightWidth = (_configuredBorder$rig = configuredBorder === null || configuredBorder === void 0 ? void 0 : configuredBorder.right) !== null && _configuredBorder$rig !== void 0 ? _configuredBorder$rig : resizeHandleWidth;
	const topHeight = (_configuredBorder$top = configuredBorder === null || configuredBorder === void 0 ? void 0 : configuredBorder.top) !== null && _configuredBorder$top !== void 0 ? _configuredBorder$top : resizeHandleHeight;
	const bottomHeight = (_configuredBorder$bot = configuredBorder === null || configuredBorder === void 0 ? void 0 : configuredBorder.bottom) !== null && _configuredBorder$bot !== void 0 ? _configuredBorder$bot : resizeHandleHeight;
	const cornerExtra = configuredBorder ? 0 : GetFlag("resizeCornerExtra") || 10;
	const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
	const scrollbarHeight = Math.max(0, window.innerHeight - document.documentElement.clientHeight);
	const rightContentEdge = window.innerWidth - scrollbarWidth;
	const bottomContentEdge = window.innerHeight - scrollbarHeight;
	const rightBorder = event.clientX < rightContentEdge && rightContentEdge - event.clientX < rightWidth;
	const leftBorder = event.clientX < leftWidth;
	const topBorder = event.clientY < topHeight;
	const bottomBorder = event.clientY < bottomContentEdge && bottomContentEdge - event.clientY < bottomHeight;
	const rightCorner = event.clientX < rightContentEdge && rightContentEdge - event.clientX < rightWidth + cornerExtra;
	const leftCorner = event.clientX < leftWidth + cornerExtra;
	const topCorner = event.clientY < topHeight + cornerExtra;
	const bottomCorner = event.clientY < bottomContentEdge && bottomContentEdge - event.clientY < bottomHeight + cornerExtra;
	if (!leftCorner && !topCorner && !bottomCorner && !rightCorner) setResize();
	else if (rightCorner && bottomCorner) setResize("se-resize");
	else if (leftCorner && bottomCorner) setResize("sw-resize");
	else if (leftCorner && topCorner) setResize("nw-resize");
	else if (topCorner && rightCorner) setResize("ne-resize");
	else if (leftBorder) setResize("w-resize");
	else if (topBorder) setResize("n-resize");
	else if (bottomBorder) setResize("s-resize");
	else if (rightBorder) setResize("e-resize");
	else setResize();
}
var canDrag, dragging, resizable, canResize, resizing, resizeEdge, defaultCursor, buttons, buttonsTracked, dragInitDone, MouseDown, MouseUp, MouseMove, cursorForEdge;
function init_drag() {
	return (init_drag = __esmMin((() => {
		init_system();
		/* @__PURE__ */ init_flags();
		init_utils();
		init_environment();
		canDrag = false;
		dragging = false;
		resizable = false;
		canResize = false;
		resizing = false;
		resizeEdge = "";
		defaultCursor = "auto";
		buttons = 0;
		buttonsTracked = false;
		if (hasDOM) {
			buttonsTracked = canTrackButtons();
			window._wails = window._wails || {};
			window._wails.setResizable = (value) => {
				resizable = value;
				if (!resizable) {
					canResize = resizing = false;
					setResize();
				}
			};
		}
		dragInitDone = false;
		if (hasDOM) {
			tryInitDragHandlers();
			document.addEventListener("DOMContentLoaded", tryInitDragHandlers, { once: true });
			let dragEnvPolls = 0;
			const dragEnvPoll = window.setInterval(() => {
				if (dragInitDone) {
					window.clearInterval(dragEnvPoll);
					return;
				}
				tryInitDragHandlers();
				if (++dragEnvPolls > 100) window.clearInterval(dragEnvPoll);
			}, 50);
		}
		MouseDown = 0;
		MouseUp = 1;
		MouseMove = 2;
		cursorForEdge = Object.freeze({
			"se-resize": "nwse-resize",
			"sw-resize": "nesw-resize",
			"nw-resize": "nwse-resize",
			"ne-resize": "nesw-resize",
			"w-resize": "ew-resize",
			"n-resize": "ns-resize",
			"s-resize": "ns-resize",
			"e-resize": "ew-resize"
		});
	})))();
}

// src/appregion.ts
function normaliseRegionKind(value) {
	const region = value.trim().toLowerCase();
	if (validRegions.has(region)) return region;
}
function nonClientRegionForElement(element) {
	if (!(element instanceof HTMLElement)) return;
	const region = normaliseRegionKind(window.getComputedStyle(element).getPropertyValue(regionProperty));
	if (!region) return;
	const parent = element.parentElement;
	if (parent) {
		if (normaliseRegionKind(window.getComputedStyle(parent).getPropertyValue(regionProperty)) === region) return;
	}
	return region;
}
function isVisible(element) {
	const style = window.getComputedStyle(element);
	return style.display !== "none" && style.visibility !== "hidden" && style.contentVisibility !== "hidden";
}
function elementRegion(element) {
	if (!(element instanceof HTMLElement)) return;
	const kind = nonClientRegionForElement(element);
	if (!kind || !isVisible(element)) return;
	const rect = element.getBoundingClientRect();
	if (rect.width <= 0 || rect.height <= 0) return;
	const scale = window.devicePixelRatio || 1;
	const left = Math.floor(rect.left * scale);
	const top = Math.floor(rect.top * scale);
	const right = Math.ceil(rect.right * scale);
	const bottom = Math.ceil(rect.bottom * scale);
	if (right <= left || bottom <= top) return;
	return {
		kind,
		left,
		top,
		right,
		bottom
	};
}
function regionElements() {
	const elements = [];
	if (document.documentElement) elements.push(document.documentElement);
	if (document.body) {
		elements.push(document.body);
		for (const element of document.body.querySelectorAll("*")) elements.push(element);
	}
	return elements;
}
function observeRegionElements(elements) {
	var _resizeObserver;
	if (typeof ResizeObserver === "undefined") return;
	(_resizeObserver = resizeObserver) !== null && _resizeObserver !== void 0 || (resizeObserver = new ResizeObserver(scheduleUpdate));
	const nextElements = new Set(elements);
	for (const element of observedElements) if (!nextElements.has(element)) resizeObserver.unobserve(element);
	for (const element of nextElements) if (!observedElements.has(element)) resizeObserver.observe(element);
	observedElements = nextElements;
}
function updateNonClientRegions() {
	updatePending = false;
	const elements = regionElements();
	const regions = [];
	const activeElements = [];
	for (const element of elements) {
		const region = elementRegion(element);
		if (region) {
			regions.push(region);
			activeElements.push(element);
		}
	}
	observeRegionElements(activeElements);
	const payload = JSON.stringify({
		version: 1,
		regions
	});
	if (payload === lastPayload) return;
	lastPayload = payload;
	invoke("wails:non-client-region:" + payload);
}
function scheduleUpdate() {
	if (updatePending) return;
	updatePending = true;
	window.requestAnimationFrame(updateNonClientRegions);
}
function startNonClientRegionTracking() {
	var _window$visualViewpor, _window$visualViewpor2;
	if (trackingStarted) return;
	trackingStarted = true;
	scheduleUpdate();
	new MutationObserver(scheduleUpdate).observe(document.documentElement, {
		attributes: true,
		childList: true,
		subtree: true
	});
	window.addEventListener("resize", scheduleUpdate);
	window.addEventListener("scroll", scheduleUpdate, true);
	(_window$visualViewpor = window.visualViewport) === null || _window$visualViewpor === void 0 || _window$visualViewpor.addEventListener("resize", scheduleUpdate);
	(_window$visualViewpor2 = window.visualViewport) === null || _window$visualViewpor2 === void 0 || _window$visualViewpor2.addEventListener("scroll", scheduleUpdate);
}
function tryStartNonClientRegionTracking() {
	var _window$_wails$enviro, _window$_wails$flags;
	const os = (_window$_wails$enviro = window._wails.environment) === null || _window$_wails$enviro === void 0 ? void 0 : _window$_wails$enviro.OS;
	if (os === void 0) return false;
	const enabled = (_window$_wails$flags = window._wails.flags) === null || _window$_wails$flags === void 0 ? void 0 : _window$_wails$flags.nonClientRegionTracking;
	if (os === "windows") {
		if (enabled === true) whenReady(startNonClientRegionTracking);
		return true;
	}
	return true;
}
var regionProperty, runtimeConfigReadyEvent, validRegions, updatePending, lastPayload, observedElements, resizeObserver, trackingStarted;
function init_appregion() {
	return (init_appregion = __esmMin((() => {
		init_system();
		init_utils();
		init_environment();
		regionProperty = "--wails-non-client-region";
		runtimeConfigReadyEvent = "wails:runtime-config-ready";
		validRegions = /* @__PURE__ */ new Set([
			"caption",
			"minimize",
			"maximize",
			"close"
		]);
		if (hasDOM) window._wails = window._wails || {};
		updatePending = false;
		lastPayload = "";
		observedElements = /* @__PURE__ */ new Set();
		;
		trackingStarted = false;
		if (hasDOM && !tryStartNonClientRegionTracking()) window.addEventListener(runtimeConfigReadyEvent, tryStartNonClientRegionTracking, { once: true });
	})))();
}

// src/application.ts
var application_exports = /* @__PURE__ */ __exportAll({
	Hide: () => Hide,
	Quit: () => Quit,
	Show: () => Show
});
function Hide() {
	return call$8(HideMethod$1);
}
function Show() {
	return call$8(ShowMethod$1);
}
function Quit() {
	return call$8(QuitMethod);
}
var call$8, HideMethod$1, ShowMethod$1, QuitMethod;
function init_application() {
	return (init_application = __esmMin((() => {
		init_runtime();
		call$8 = newRuntimeCaller(objectNames.Application);
		HideMethod$1 = 0;
		ShowMethod$1 = 1;
		QuitMethod = 2;
	})))();
}

// src/browser.ts
var browser_exports = /* @__PURE__ */ __exportAll({ OpenURL: () => OpenURL });
function OpenURL(url) {
	return call$7(BrowserOpenURL, { url: url.toString() });
}
var call$7, BrowserOpenURL;
function init_browser() {
	return (init_browser = __esmMin((() => {
		init_runtime();
		call$7 = newRuntimeCaller(objectNames.Browser);
		BrowserOpenURL = 0;
	})))();
}

// src/callable.ts
function isCallableRefApply(value) {
	if (isDDA(value)) return true;
	if (!value) return false;
	if (typeof value !== "function" && typeof value !== "object") return false;
	try {
		reflectApply(value, null, badArrayLike);
	} catch (e) {
		if (e !== isCallableMarker) return false;
	}
	return !isES6ClassFn(value) && tryFunctionObject(value);
}
function isCallableNoRefApply(value) {
	if (isDDA(value)) return true;
	if (!value) return false;
	if (typeof value !== "function" && typeof value !== "object") return false;
	if (hasToStringTag) return tryFunctionObject(value);
	if (isES6ClassFn(value)) return false;
	var strClass = toStr.call(value);
	if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) return false;
	return tryFunctionObject(value);
}
var fnToStr, reflectApply, badArrayLike, isCallableMarker, constructorRegex, isES6ClassFn, tryFunctionObject, toStr, objectClass, fnClass, genClass, ddaClass, ddaClass2, ddaClass3, hasToStringTag, isIE68, isDDA, all, callable_default;
function init_callable() {
	return (init_callable = __esmMin((() => {
		fnToStr = Function.prototype.toString;
		reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
		;
		;
		if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") try {
			badArrayLike = Object.defineProperty({}, "length", { get: function() {
				throw isCallableMarker;
			} });
			isCallableMarker = {};
			reflectApply(function() {
				throw 42;
			}, null, badArrayLike);
		} catch (_) {
			if (_ !== isCallableMarker) reflectApply = null;
		}
		else reflectApply = null;
		constructorRegex = /^\s*class\b/;
		isES6ClassFn = function isES6ClassFunction(value) {
			try {
				var fnStr = fnToStr.call(value);
				return constructorRegex.test(fnStr);
			} catch (e) {
				return false;
			}
		};
		tryFunctionObject = function tryFunctionToStr(value) {
			try {
				if (isES6ClassFn(value)) return false;
				fnToStr.call(value);
				return true;
			} catch (e) {
				return false;
			}
		};
		toStr = Object.prototype.toString;
		objectClass = "[object Object]";
		fnClass = "[object Function]";
		genClass = "[object GeneratorFunction]";
		ddaClass = "[object HTMLAllCollection]";
		ddaClass2 = "[object HTML document.all class]";
		ddaClass3 = "[object HTMLCollection]";
		hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
		isIE68 = !(0 in [,]);
		isDDA = function isDocumentDotAll() {
			return false;
		};
		if (typeof document === "object") {
			all = document.all;
			if (toStr.call(all) === toStr.call(document.all)) isDDA = function isDocumentDotAll(value) {
				if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) try {
					var str = toStr.call(value);
					return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
				} catch (e) {}
				return false;
			};
		}
		callable_default = reflectApply ? isCallableRefApply : isCallableNoRefApply;
	})))();
}

// src/cancellable.ts
function cancellerFor(promise, state) {
	let cancellationPromise = void 0;
	return (reason) => {
		if (!state.settled) {
			state.settled = true;
			state.reason = reason;
			promise.reject(reason);
			Promise.prototype.then.call(promise.promise, void 0, (err) => {
				if (err !== reason) throw err;
			});
		}
		if (!state.reason || !promise.oncancelled) return;
		cancellationPromise = new Promise((resolve) => {
			try {
				resolve(promise.oncancelled(state.reason.cause));
			} catch (err) {
				Promise.reject(new CancelledRejectionError(promise.promise, err, "Unhandled exception in oncancelled callback."));
			}
		}).catch((reason) => {
			Promise.reject(new CancelledRejectionError(promise.promise, reason, "Unhandled rejection in oncancelled callback."));
		});
		promise.oncancelled = null;
		return cancellationPromise;
	};
}
function resolverFor(promise, state) {
	return (value) => {
		if (state.resolving) return;
		state.resolving = true;
		if (value === promise.promise) {
			if (state.settled) return;
			state.settled = true;
			promise.reject(/* @__PURE__ */ new TypeError("A promise cannot be resolved with itself."));
			return;
		}
		if (value != null && (typeof value === "object" || typeof value === "function")) {
			let then;
			try {
				then = value.then;
			} catch (err) {
				state.settled = true;
				promise.reject(err);
				return;
			}
			if (callable_default(then)) {
				try {
					let cancel = value.cancel;
					if (callable_default(cancel)) {
						const oncancelled = (cause) => {
							Reflect.apply(cancel, value, [cause]);
						};
						if (state.reason) cancellerFor(_objectSpread2(_objectSpread2({}, promise), {}, { oncancelled }), state)(state.reason);
						else promise.oncancelled = oncancelled;
					}
				} catch (_unused) {}
				const newState = {
					root: state.root,
					resolving: false,
					get settled() {
						return this.root.settled;
					},
					set settled(value) {
						this.root.settled = value;
					},
					get reason() {
						return this.root.reason;
					}
				};
				const rejector = rejectorFor(promise, newState);
				try {
					Reflect.apply(then, value, [resolverFor(promise, newState), rejector]);
				} catch (err) {
					rejector(err);
				}
				return;
			}
		}
		if (state.settled) return;
		state.settled = true;
		promise.resolve(value);
	};
}
function rejectorFor(promise, state) {
	return (reason) => {
		if (state.resolving) return;
		state.resolving = true;
		if (state.settled) {
			try {
				if (reason instanceof CancelError && state.reason instanceof CancelError && Object.is(reason.cause, state.reason.cause)) return;
			} catch (_unused2) {}
			Promise.reject(new CancelledRejectionError(promise.promise, reason));
		} else {
			state.settled = true;
			promise.reject(reason);
		}
	};
}
function cancelAll(parent, values, cause) {
	const results = [];
	for (const value of values) {
		let cancel;
		try {
			if (!callable_default(value.then)) continue;
			cancel = value.cancel;
			if (!callable_default(cancel)) continue;
		} catch (_unused3) {
			continue;
		}
		let result;
		try {
			result = Reflect.apply(cancel, value, [cause]);
		} catch (err) {
			Promise.reject(new CancelledRejectionError(parent, err, "Unhandled exception in cancel method."));
			continue;
		}
		if (!result) continue;
		results.push((result instanceof Promise ? result : Promise.resolve(result)).catch((reason) => {
			Promise.reject(new CancelledRejectionError(parent, reason, "Unhandled rejection in cancel method."));
		}));
	}
	return Promise.all(results);
}
function identity(x) {
	return x;
}
function thrower(reason) {
	throw reason;
}
function errorMessage(err) {
	try {
		if (err instanceof Error || typeof err !== "object" || err.toString !== Object.prototype.toString) return "" + err;
	} catch (_unused4) {}
	try {
		return JSON.stringify(err);
	} catch (_unused5) {}
	try {
		return Object.prototype.toString.call(err);
	} catch (_unused6) {}
	return "<could not convert error to string>";
}
function currentBarrier(promise) {
	var _promise$barrierSym;
	let pwr = (_promise$barrierSym = promise[barrierSym]) !== null && _promise$barrierSym !== void 0 ? _promise$barrierSym : {};
	if (!("promise" in pwr)) Object.assign(pwr, promiseWithResolvers());
	if (promise[barrierSym] == null) {
		pwr.resolve();
		promise[barrierSym] = pwr;
	}
	return pwr.promise;
}
var _Symbol$species, CancelError, CancelledRejectionError, barrierSym, cancelImplSym, species, CancellablePromise, promiseWithResolvers;
function init_cancellable() {
	return (init_cancellable = __esmMin((() => {
		init_callable();
		init_objectSpread2();
		;
		CancelError = class extends Error {
			constructor(message, options) {
				super(message, options);
				this.name = "CancelError";
			}
		};
		CancelledRejectionError = class extends Error {
			constructor(promise, reason, info) {
				super((info !== null && info !== void 0 ? info : "Unhandled rejection in cancelled promise.") + " Reason: " + errorMessage(reason), { cause: reason });
				this.promise = promise;
				this.name = "CancelledRejectionError";
			}
		};
		barrierSym = Symbol("barrier");
		cancelImplSym = Symbol("cancelImpl");
		species = (_Symbol$species = Symbol.species) !== null && _Symbol$species !== void 0 ? _Symbol$species : Symbol("speciesPolyfill");
		CancellablePromise = class CancellablePromise extends Promise {
			constructor(executor, oncancelled) {
				let resolve;
				let reject;
				super((res, rej) => {
					resolve = res;
					reject = rej;
				});
				if (this.constructor[species] !== Promise) throw new TypeError("CancellablePromise does not support transparent subclassing. Please refrain from overriding the [Symbol.species] static property.");
				let promise = {
					promise: this,
					resolve,
					reject,
					get oncancelled() {
						var _oncancelled;
						return (_oncancelled = oncancelled) !== null && _oncancelled !== void 0 ? _oncancelled : null;
					},
					set oncancelled(cb) {
						oncancelled = cb !== null && cb !== void 0 ? cb : void 0;
					}
				};
				const state = {
					get root() {
						return state;
					},
					resolving: false,
					settled: false
				};
				Object.defineProperties(this, {
					[barrierSym]: {
						configurable: false,
						enumerable: false,
						writable: true,
						value: null
					},
					[cancelImplSym]: {
						configurable: false,
						enumerable: false,
						writable: false,
						value: cancellerFor(promise, state)
					}
				});
				const rejector = rejectorFor(promise, state);
				try {
					executor(resolverFor(promise, state), rejector);
				} catch (err) {
					if (state.resolving) console.log("Unhandled exception in CancellablePromise executor.", err);
					else rejector(err);
				}
			}
			cancel(cause) {
				return new CancellablePromise((resolve) => {
					Promise.all([this[cancelImplSym](new CancelError("Promise cancelled.", { cause })), currentBarrier(this)]).then(() => resolve(), () => resolve());
				});
			}
			cancelOn(signal) {
				if (signal.aborted) this.cancel(signal.reason);
				else signal.addEventListener("abort", () => void this.cancel(signal.reason), { capture: true });
				return this;
			}
			then(onfulfilled, onrejected, oncancelled) {
				if (!(this instanceof CancellablePromise)) throw new TypeError("CancellablePromise.prototype.then called on an invalid object.");
				if (!callable_default(onfulfilled)) onfulfilled = identity;
				if (!callable_default(onrejected)) onrejected = thrower;
				if (onfulfilled === identity && onrejected == thrower) return new CancellablePromise((resolve) => resolve(this));
				const barrier = {};
				this[barrierSym] = barrier;
				return new CancellablePromise((resolve, reject) => {
					super.then((value) => {
						var _barrier$resolve;
						if (this[barrierSym] === barrier) this[barrierSym] = null;
						(_barrier$resolve = barrier.resolve) === null || _barrier$resolve === void 0 || _barrier$resolve.call(barrier);
						try {
							resolve(onfulfilled(value));
						} catch (err) {
							reject(err);
						}
					}, (reason) => {
						var _barrier$resolve2;
						if (this[barrierSym] === barrier) this[barrierSym] = null;
						(_barrier$resolve2 = barrier.resolve) === null || _barrier$resolve2 === void 0 || _barrier$resolve2.call(barrier);
						try {
							resolve(onrejected(reason));
						} catch (err) {
							reject(err);
						}
					});
				}, async (cause) => {
					try {
						return oncancelled === null || oncancelled === void 0 ? void 0 : oncancelled(cause);
					} finally {
						await this.cancel(cause);
					}
				});
			}
			catch(onrejected, oncancelled) {
				return this.then(void 0, onrejected, oncancelled);
			}
			finally(onfinally, oncancelled) {
				if (!(this instanceof CancellablePromise)) throw new TypeError("CancellablePromise.prototype.finally called on an invalid object.");
				if (!callable_default(onfinally)) return this.then(onfinally, onfinally, oncancelled);
				return this.then((value) => CancellablePromise.resolve(onfinally()).then(() => value), (reason) => CancellablePromise.resolve(onfinally()).then(() => {
					throw reason;
				}), oncancelled);
			}
			static get [species]() {
				return Promise;
			}
			static all(values) {
				let collected = Array.from(values);
				const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
					Promise.all(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static allSettled(values) {
				let collected = Array.from(values);
				const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
					Promise.allSettled(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static any(values) {
				let collected = Array.from(values);
				const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
					Promise.any(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static race(values) {
				let collected = Array.from(values);
				const promise = new CancellablePromise((resolve, reject) => {
					Promise.race(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static cancel(cause) {
				const p = new CancellablePromise(() => {});
				p.cancel(cause);
				return p;
			}
			static timeout(milliseconds, cause) {
				const promise = new CancellablePromise(() => {});
				if (AbortSignal && typeof AbortSignal === "function" && AbortSignal.timeout && typeof AbortSignal.timeout === "function") AbortSignal.timeout(milliseconds).addEventListener("abort", () => void promise.cancel(cause));
				else setTimeout(() => void promise.cancel(cause), milliseconds);
				return promise;
			}
			static sleep(milliseconds, value) {
				return new CancellablePromise((resolve) => {
					setTimeout(() => resolve(value), milliseconds);
				});
			}
			static reject(reason) {
				return new CancellablePromise((_, reject) => reject(reason));
			}
			static resolve(value) {
				if (value instanceof CancellablePromise) return value;
				return new CancellablePromise((resolve) => resolve(value));
			}
			static withResolvers() {
				let result = { oncancelled: null };
				result.promise = new CancellablePromise((resolve, reject) => {
					result.resolve = resolve;
					result.reject = reject;
				}, (cause) => {
					var _result$oncancelled;
					(_result$oncancelled = result.oncancelled) === null || _result$oncancelled === void 0 || _result$oncancelled.call(result, cause);
				});
				return result;
			}
		};
		promiseWithResolvers = Promise.withResolvers;
		if (promiseWithResolvers && typeof promiseWithResolvers === "function") promiseWithResolvers = promiseWithResolvers.bind(Promise);
		else promiseWithResolvers = function() {
			let resolve;
			let reject;
			return {
				promise: new Promise((res, rej) => {
					resolve = res;
					reject = rej;
				}),
				resolve,
				reject
			};
		};
	})))();
}

// src/calls.ts
var calls_exports = /* @__PURE__ */ __exportAll({
	ByID: () => ByID,
	ByName: () => ByName,
	Call: () => Call,
	RuntimeError: () => RuntimeError
});
function generateID() {
	let result;
	do
		result = nanoid();
	while (callResponses.has(result));
	return result;
}
function Call(options) {
	const id = generateID();
	const result = CancellablePromise.withResolvers();
	callResponses.set(id, {
		resolve: result.resolve,
		reject: result.reject
	});
	const request = call$6(CallBinding, Object.assign({ "call-id": id }, options));
	let running = true;
	request.then((res) => {
		running = false;
		callResponses.delete(id);
		result.resolve(res);
	}, (err) => {
		running = false;
		callResponses.delete(id);
		result.reject(err);
	});
	const cancel = () => {
		callResponses.delete(id);
		return cancelCall(CancelMethod, { "call-id": id }).catch((err) => {
			console.error("Error while requesting binding call cancellation:", err);
		});
	};
	result.oncancelled = () => {
		if (running) return cancel();
		else return request.then(cancel);
	};
	return result.promise;
}
function ByName(methodName, ...args) {
	return Call({
		methodName,
		args
	});
}
function ByID(methodID, ...args) {
	return Call({
		methodID,
		args
	});
}
var call$6, cancelCall, callResponses, CallBinding, CancelMethod;
function init_calls() {
	return (init_calls = __esmMin((() => {
		init_cancellable();
		init_runtime();
		init_nanoid();
		init_environment();
		if (hasDOM) window._wails = window._wails || {};
		call$6 = newRuntimeCaller(objectNames.Call);
		cancelCall = newRuntimeCaller(objectNames.CancelCall);
		callResponses = /* @__PURE__ */ new Map();
		CallBinding = 0;
		CancelMethod = 0;
	})))();
}

// src/clipboard.ts
var clipboard_exports = /* @__PURE__ */ __exportAll({
	SetText: () => SetText,
	Text: () => Text
});
function SetText(text) {
	return call$5(ClipboardSetText, { text });
}
function Text() {
	return call$5(ClipboardText);
}
var call$5, ClipboardSetText, ClipboardText;
function init_clipboard() {
	return (init_clipboard = __esmMin((() => {
		init_runtime();
		call$5 = newRuntimeCaller(objectNames.Clipboard);
		ClipboardSetText = 0;
		ClipboardText = 1;
	})))();
}

// src/create.ts
var create_exports = /* @__PURE__ */ __exportAll({
	Any: () => Any,
	Array: () => Array$1,
	ByteSlice: () => ByteSlice,
	DateFromTime: () => DateFromTime,
	Events: () => Events$1,
	Map: () => Map$1,
	Nullable: () => Nullable,
	Struct: () => Struct
});
function Any(source) {
	return source;
}
function ByteSlice(source) {
	return source == null ? "" : source;
}
function Array$1(element) {
	if (element === Any) return (source) => source === null ? [] : source;
	return (source) => {
		if (source === null) return [];
		for (let i = 0; i < source.length; i++) source[i] = element(source[i]);
		return source;
	};
}
function Map$1(key, value) {
	if (value === Any) return (source) => source === null ? {} : source;
	return (source) => {
		if (source === null) return {};
		for (const key in source) source[key] = value(source[key]);
		return source;
	};
}
function Nullable(element) {
	if (element === Any) return Any;
	return (source) => source === null ? null : element(source);
}
function Struct(createField) {
	let allAny = true;
	for (const name in createField) if (createField[name] !== Any) {
		allAny = false;
		break;
	}
	if (allAny) return Any;
	return (source) => {
		for (const name in createField) if (name in source) source[name] = createField[name](source[name]);
		return source;
	};
}
function DateFromTime(source) {
	return new Date(source);
}
var Events$1;
function init_create() {
	return (init_create = __esmMin((() => {
		Events$1 = {};
	})))();
}

// src/dialogs.ts
var dialogs_exports = /* @__PURE__ */ __exportAll({
	Error: () => Error$1,
	Info: () => Info,
	OpenFile: () => OpenFile,
	Question: () => Question,
	SaveFile: () => SaveFile,
	Warning: () => Warning
});
function dialog(type, options = {}) {
	return call$4(type, options);
}
function Info(options) {
	return dialog(DialogInfo, options);
}
function Warning(options) {
	return dialog(DialogWarning, options);
}
function Error$1(options) {
	return dialog(DialogError, options);
}
function Question(options) {
	return dialog(DialogQuestion, options);
}
function OpenFile(options) {
	var _dialog;
	return (_dialog = dialog(DialogOpenFile, options)) !== null && _dialog !== void 0 ? _dialog : [];
}
function SaveFile(options) {
	return dialog(DialogSaveFile, options);
}
var call$4, DialogInfo, DialogWarning, DialogError, DialogQuestion, DialogOpenFile, DialogSaveFile;
function init_dialogs() {
	return (init_dialogs = __esmMin((() => {
		init_runtime();
		init_environment();
		if (hasDOM) window._wails = window._wails || {};
		call$4 = newRuntimeCaller(objectNames.Dialog);
		DialogInfo = 0;
		DialogWarning = 1;
		DialogError = 2;
		DialogQuestion = 3;
		DialogOpenFile = 4;
		DialogSaveFile = 5;
	})))();
}

// src/listener.ts
function listenerOff(listener) {
	let listeners = eventListeners.get(listener.eventName);
	if (!listeners) return;
	listeners = listeners.filter((l) => l !== listener);
	if (listeners.length === 0) eventListeners.delete(listener.eventName);
	else eventListeners.set(listener.eventName, listeners);
}
var eventListeners, Listener;
function init_listener() {
	return (init_listener = __esmMin((() => {
		eventListeners = /* @__PURE__ */ new Map();
		Listener = class {
			constructor(eventName, callback, maxCallbacks) {
				this.eventName = eventName;
				this.callback = callback;
				this.maxCallbacks = maxCallbacks || -1;
			}
			dispatch(data) {
				try {
					this.callback(data);
				} catch (err) {
					console.error(err);
				}
				if (this.maxCallbacks === -1) return false;
				this.maxCallbacks -= 1;
				return this.maxCallbacks === 0;
			}
		};
	})))();
}

// src/event_types.ts
var Types;
function init_event_types() {
	return (init_event_types = __esmMin((() => {
		Types = Object.freeze({
			Windows: Object.freeze({
				APMPowerSettingChange: "windows:APMPowerSettingChange",
				APMPowerStatusChange: "windows:APMPowerStatusChange",
				APMResumeAutomatic: "windows:APMResumeAutomatic",
				APMResumeSuspend: "windows:APMResumeSuspend",
				APMSuspend: "windows:APMSuspend",
				ApplicationStarted: "windows:ApplicationStarted",
				SystemThemeChanged: "windows:SystemThemeChanged",
				WebViewNavigationCompleted: "windows:WebViewNavigationCompleted",
				WindowActive: "windows:WindowActive",
				WindowBackgroundErase: "windows:WindowBackgroundErase",
				WindowClickActive: "windows:WindowClickActive",
				WindowClosing: "windows:WindowClosing",
				WindowDidMove: "windows:WindowDidMove",
				WindowDidResize: "windows:WindowDidResize",
				WindowDPIChanged: "windows:WindowDPIChanged",
				WindowDragDrop: "windows:WindowDragDrop",
				WindowDragEnter: "windows:WindowDragEnter",
				WindowDragLeave: "windows:WindowDragLeave",
				WindowDragOver: "windows:WindowDragOver",
				WindowEndMove: "windows:WindowEndMove",
				WindowEndResize: "windows:WindowEndResize",
				WindowFullscreen: "windows:WindowFullscreen",
				WindowHide: "windows:WindowHide",
				WindowInactive: "windows:WindowInactive",
				WindowKeyDown: "windows:WindowKeyDown",
				WindowKeyUp: "windows:WindowKeyUp",
				WindowKillFocus: "windows:WindowKillFocus",
				WindowNonClientHit: "windows:WindowNonClientHit",
				WindowNonClientMouseDown: "windows:WindowNonClientMouseDown",
				WindowNonClientMouseLeave: "windows:WindowNonClientMouseLeave",
				WindowNonClientMouseMove: "windows:WindowNonClientMouseMove",
				WindowNonClientMouseUp: "windows:WindowNonClientMouseUp",
				WindowPaint: "windows:WindowPaint",
				WindowRestore: "windows:WindowRestore",
				WindowSetFocus: "windows:WindowSetFocus",
				WindowShow: "windows:WindowShow",
				WindowStartMove: "windows:WindowStartMove",
				WindowStartResize: "windows:WindowStartResize",
				WindowUnFullscreen: "windows:WindowUnFullscreen",
				WindowZOrderChanged: "windows:WindowZOrderChanged",
				WindowMinimise: "windows:WindowMinimise",
				WindowUnMinimise: "windows:WindowUnMinimise",
				WindowMaximise: "windows:WindowMaximise",
				WindowUnMaximise: "windows:WindowUnMaximise"
			}),
			Mac: Object.freeze({
				ApplicationDidBecomeActive: "mac:ApplicationDidBecomeActive",
				ApplicationDidChangeBackingProperties: "mac:ApplicationDidChangeBackingProperties",
				ApplicationDidChangeEffectiveAppearance: "mac:ApplicationDidChangeEffectiveAppearance",
				ApplicationDidChangeIcon: "mac:ApplicationDidChangeIcon",
				ApplicationDidChangeOcclusionState: "mac:ApplicationDidChangeOcclusionState",
				ApplicationDidChangeScreenParameters: "mac:ApplicationDidChangeScreenParameters",
				ApplicationDidChangeStatusBarFrame: "mac:ApplicationDidChangeStatusBarFrame",
				ApplicationDidChangeStatusBarOrientation: "mac:ApplicationDidChangeStatusBarOrientation",
				ApplicationDidChangeTheme: "mac:ApplicationDidChangeTheme",
				ApplicationDidFinishLaunching: "mac:ApplicationDidFinishLaunching",
				ApplicationDidHide: "mac:ApplicationDidHide",
				ApplicationDidResignActive: "mac:ApplicationDidResignActive",
				ApplicationDidUnhide: "mac:ApplicationDidUnhide",
				ApplicationDidUpdate: "mac:ApplicationDidUpdate",
				ApplicationDidWake: "mac:ApplicationDidWake",
				ApplicationScreensDidSleep: "mac:ApplicationScreensDidSleep",
				ApplicationScreensDidWake: "mac:ApplicationScreensDidWake",
				ApplicationShouldHandleReopen: "mac:ApplicationShouldHandleReopen",
				ApplicationWillBecomeActive: "mac:ApplicationWillBecomeActive",
				ApplicationWillFinishLaunching: "mac:ApplicationWillFinishLaunching",
				ApplicationWillHide: "mac:ApplicationWillHide",
				ApplicationWillResignActive: "mac:ApplicationWillResignActive",
				ApplicationWillSleep: "mac:ApplicationWillSleep",
				ApplicationWillTerminate: "mac:ApplicationWillTerminate",
				ApplicationWillUnhide: "mac:ApplicationWillUnhide",
				ApplicationWillUpdate: "mac:ApplicationWillUpdate",
				MenuDidAddItem: "mac:MenuDidAddItem",
				MenuDidBeginTracking: "mac:MenuDidBeginTracking",
				MenuDidClose: "mac:MenuDidClose",
				MenuDidDisplayItem: "mac:MenuDidDisplayItem",
				MenuDidEndTracking: "mac:MenuDidEndTracking",
				MenuDidHighlightItem: "mac:MenuDidHighlightItem",
				MenuDidOpen: "mac:MenuDidOpen",
				MenuDidPopUp: "mac:MenuDidPopUp",
				MenuDidRemoveItem: "mac:MenuDidRemoveItem",
				MenuDidSendAction: "mac:MenuDidSendAction",
				MenuDidSendActionToItem: "mac:MenuDidSendActionToItem",
				MenuDidUpdate: "mac:MenuDidUpdate",
				MenuWillAddItem: "mac:MenuWillAddItem",
				MenuWillBeginTracking: "mac:MenuWillBeginTracking",
				MenuWillDisplayItem: "mac:MenuWillDisplayItem",
				MenuWillEndTracking: "mac:MenuWillEndTracking",
				MenuWillHighlightItem: "mac:MenuWillHighlightItem",
				MenuWillOpen: "mac:MenuWillOpen",
				MenuWillPopUp: "mac:MenuWillPopUp",
				MenuWillRemoveItem: "mac:MenuWillRemoveItem",
				MenuWillSendAction: "mac:MenuWillSendAction",
				MenuWillSendActionToItem: "mac:MenuWillSendActionToItem",
				MenuWillUpdate: "mac:MenuWillUpdate",
				WebViewDidCommitNavigation: "mac:WebViewDidCommitNavigation",
				WebViewDidFinishNavigation: "mac:WebViewDidFinishNavigation",
				WebViewDidReceiveServerRedirectForProvisionalNavigation: "mac:WebViewDidReceiveServerRedirectForProvisionalNavigation",
				WebViewDidStartProvisionalNavigation: "mac:WebViewDidStartProvisionalNavigation",
				WindowDidBecomeKey: "mac:WindowDidBecomeKey",
				WindowDidBecomeMain: "mac:WindowDidBecomeMain",
				WindowDidBeginSheet: "mac:WindowDidBeginSheet",
				WindowDidChangeAlpha: "mac:WindowDidChangeAlpha",
				WindowDidChangeBackingLocation: "mac:WindowDidChangeBackingLocation",
				WindowDidChangeBackingProperties: "mac:WindowDidChangeBackingProperties",
				WindowDidChangeCollectionBehavior: "mac:WindowDidChangeCollectionBehavior",
				WindowDidChangeEffectiveAppearance: "mac:WindowDidChangeEffectiveAppearance",
				WindowDidChangeOcclusionState: "mac:WindowDidChangeOcclusionState",
				WindowDidChangeOrderingMode: "mac:WindowDidChangeOrderingMode",
				WindowDidChangeScreen: "mac:WindowDidChangeScreen",
				WindowDidChangeScreenParameters: "mac:WindowDidChangeScreenParameters",
				WindowDidChangeScreenProfile: "mac:WindowDidChangeScreenProfile",
				WindowDidChangeScreenSpace: "mac:WindowDidChangeScreenSpace",
				WindowDidChangeScreenSpaceProperties: "mac:WindowDidChangeScreenSpaceProperties",
				WindowDidChangeSharingType: "mac:WindowDidChangeSharingType",
				WindowDidChangeSpace: "mac:WindowDidChangeSpace",
				WindowDidChangeSpaceOrderingMode: "mac:WindowDidChangeSpaceOrderingMode",
				WindowDidChangeTitle: "mac:WindowDidChangeTitle",
				WindowDidChangeToolbar: "mac:WindowDidChangeToolbar",
				WindowDidDeminiaturize: "mac:WindowDidDeminiaturize",
				WindowDidEndSheet: "mac:WindowDidEndSheet",
				WindowDidEnterFullScreen: "mac:WindowDidEnterFullScreen",
				WindowDidEnterVersionBrowser: "mac:WindowDidEnterVersionBrowser",
				WindowDidExitFullScreen: "mac:WindowDidExitFullScreen",
				WindowDidExitVersionBrowser: "mac:WindowDidExitVersionBrowser",
				WindowDidExpose: "mac:WindowDidExpose",
				WindowDidFocus: "mac:WindowDidFocus",
				WindowDidMiniaturize: "mac:WindowDidMiniaturize",
				WindowDidMove: "mac:WindowDidMove",
				WindowDidOrderOffScreen: "mac:WindowDidOrderOffScreen",
				WindowDidOrderOnScreen: "mac:WindowDidOrderOnScreen",
				WindowDidResignKey: "mac:WindowDidResignKey",
				WindowDidResignMain: "mac:WindowDidResignMain",
				WindowDidResize: "mac:WindowDidResize",
				WindowDidUpdate: "mac:WindowDidUpdate",
				WindowDidUpdateAlpha: "mac:WindowDidUpdateAlpha",
				WindowDidUpdateCollectionBehavior: "mac:WindowDidUpdateCollectionBehavior",
				WindowDidUpdateCollectionProperties: "mac:WindowDidUpdateCollectionProperties",
				WindowDidUpdateShadow: "mac:WindowDidUpdateShadow",
				WindowDidUpdateTitle: "mac:WindowDidUpdateTitle",
				WindowDidUpdateToolbar: "mac:WindowDidUpdateToolbar",
				WindowDidZoom: "mac:WindowDidZoom",
				WindowFileDraggingEntered: "mac:WindowFileDraggingEntered",
				WindowFileDraggingExited: "mac:WindowFileDraggingExited",
				WindowFileDraggingPerformed: "mac:WindowFileDraggingPerformed",
				WindowHide: "mac:WindowHide",
				WindowMaximise: "mac:WindowMaximise",
				WindowUnMaximise: "mac:WindowUnMaximise",
				WindowMinimise: "mac:WindowMinimise",
				WindowUnMinimise: "mac:WindowUnMinimise",
				WindowShouldClose: "mac:WindowShouldClose",
				WindowShow: "mac:WindowShow",
				WindowWillBecomeKey: "mac:WindowWillBecomeKey",
				WindowWillBecomeMain: "mac:WindowWillBecomeMain",
				WindowWillBeginSheet: "mac:WindowWillBeginSheet",
				WindowWillChangeOrderingMode: "mac:WindowWillChangeOrderingMode",
				WindowWillClose: "mac:WindowWillClose",
				WindowWillDeminiaturize: "mac:WindowWillDeminiaturize",
				WindowWillEnterFullScreen: "mac:WindowWillEnterFullScreen",
				WindowWillEnterVersionBrowser: "mac:WindowWillEnterVersionBrowser",
				WindowWillExitFullScreen: "mac:WindowWillExitFullScreen",
				WindowWillExitVersionBrowser: "mac:WindowWillExitVersionBrowser",
				WindowWillFocus: "mac:WindowWillFocus",
				WindowWillMiniaturize: "mac:WindowWillMiniaturize",
				WindowWillMove: "mac:WindowWillMove",
				WindowWillOrderOffScreen: "mac:WindowWillOrderOffScreen",
				WindowWillOrderOnScreen: "mac:WindowWillOrderOnScreen",
				WindowWillResignMain: "mac:WindowWillResignMain",
				WindowWillResize: "mac:WindowWillResize",
				WindowWillUnfocus: "mac:WindowWillUnfocus",
				WindowWillUpdate: "mac:WindowWillUpdate",
				WindowWillUpdateAlpha: "mac:WindowWillUpdateAlpha",
				WindowWillUpdateCollectionBehavior: "mac:WindowWillUpdateCollectionBehavior",
				WindowWillUpdateCollectionProperties: "mac:WindowWillUpdateCollectionProperties",
				WindowWillUpdateShadow: "mac:WindowWillUpdateShadow",
				WindowWillUpdateTitle: "mac:WindowWillUpdateTitle",
				WindowWillUpdateToolbar: "mac:WindowWillUpdateToolbar",
				WindowWillUpdateVisibility: "mac:WindowWillUpdateVisibility",
				WindowWillUseStandardFrame: "mac:WindowWillUseStandardFrame",
				WindowZoomIn: "mac:WindowZoomIn",
				WindowZoomOut: "mac:WindowZoomOut",
				WindowZoomReset: "mac:WindowZoomReset",
				WebViewWebContentProcessDidTerminate: "mac:WebViewWebContentProcessDidTerminate"
			}),
			Linux: Object.freeze({
				ApplicationStartup: "linux:ApplicationStartup",
				SystemDidWake: "linux:SystemDidWake",
				SystemThemeChanged: "linux:SystemThemeChanged",
				SystemWillSleep: "linux:SystemWillSleep",
				WindowDeleteEvent: "linux:WindowDeleteEvent",
				WindowDidMove: "linux:WindowDidMove",
				WindowDidResize: "linux:WindowDidResize",
				WindowFocusIn: "linux:WindowFocusIn",
				WindowFocusOut: "linux:WindowFocusOut",
				WindowLoadStarted: "linux:WindowLoadStarted",
				WindowLoadRedirected: "linux:WindowLoadRedirected",
				WindowLoadCommitted: "linux:WindowLoadCommitted",
				WindowLoadFinished: "linux:WindowLoadFinished"
			}),
			iOS: Object.freeze({
				ApplicationDidBecomeActive: "ios:ApplicationDidBecomeActive",
				ApplicationDidEnterBackground: "ios:ApplicationDidEnterBackground",
				ApplicationDidFinishLaunching: "ios:ApplicationDidFinishLaunching",
				ApplicationDidReceiveMemoryWarning: "ios:ApplicationDidReceiveMemoryWarning",
				ApplicationWillEnterForeground: "ios:ApplicationWillEnterForeground",
				ApplicationWillResignActive: "ios:ApplicationWillResignActive",
				ApplicationWillTerminate: "ios:ApplicationWillTerminate",
				WindowDidLoad: "ios:WindowDidLoad",
				WindowWillAppear: "ios:WindowWillAppear",
				WindowDidAppear: "ios:WindowDidAppear",
				WindowWillDisappear: "ios:WindowWillDisappear",
				WindowDidDisappear: "ios:WindowDidDisappear",
				WindowSafeAreaInsetsChanged: "ios:WindowSafeAreaInsetsChanged",
				WindowOrientationChanged: "ios:WindowOrientationChanged",
				WindowTouchBegan: "ios:WindowTouchBegan",
				WindowTouchMoved: "ios:WindowTouchMoved",
				WindowTouchEnded: "ios:WindowTouchEnded",
				WindowTouchCancelled: "ios:WindowTouchCancelled",
				WebViewDidStartNavigation: "ios:WebViewDidStartNavigation",
				WebViewDidFinishNavigation: "ios:WebViewDidFinishNavigation",
				WebViewDidFailNavigation: "ios:WebViewDidFailNavigation",
				WebViewDecidePolicyForNavigationAction: "ios:WebViewDecidePolicyForNavigationAction",
				BatteryChanged: "ios:BatteryChanged",
				NetworkChanged: "ios:NetworkChanged",
				ThemeChanged: "ios:ThemeChanged",
				ScreenLocked: "ios:ScreenLocked",
				ScreenUnlocked: "ios:ScreenUnlocked"
			}),
			Android: Object.freeze({
				ActivityCreated: "android:ActivityCreated",
				ActivityStarted: "android:ActivityStarted",
				ActivityResumed: "android:ActivityResumed",
				ActivityPaused: "android:ActivityPaused",
				ActivityStopped: "android:ActivityStopped",
				ActivityDestroyed: "android:ActivityDestroyed",
				ApplicationLowMemory: "android:ApplicationLowMemory",
				WebViewPageStarted: "android:WebViewPageStarted",
				WebViewPageFinished: "android:WebViewPageFinished",
				BatteryChanged: "android:BatteryChanged",
				NetworkChanged: "android:NetworkChanged",
				ThemeChanged: "android:ThemeChanged",
				ScreenLocked: "android:ScreenLocked",
				ScreenUnlocked: "android:ScreenUnlocked"
			}),
			Common: Object.freeze({
				ApplicationOpenedWithFile: "common:ApplicationOpenedWithFile",
				ApplicationStarted: "common:ApplicationStarted",
				ApplicationLaunchedWithUrl: "common:ApplicationLaunchedWithUrl",
				ThemeChanged: "common:ThemeChanged",
				SystemDidWake: "common:SystemDidWake",
				SystemWillSleep: "common:SystemWillSleep",
				WindowClosing: "common:WindowClosing",
				WindowDidMove: "common:WindowDidMove",
				WindowDidResize: "common:WindowDidResize",
				WindowDPIChanged: "common:WindowDPIChanged",
				WindowFilesDropped: "common:WindowFilesDropped",
				WindowFocus: "common:WindowFocus",
				WindowFullscreen: "common:WindowFullscreen",
				WindowHide: "common:WindowHide",
				WindowLostFocus: "common:WindowLostFocus",
				WindowMaximise: "common:WindowMaximise",
				WindowMinimise: "common:WindowMinimise",
				WindowToggleFrameless: "common:WindowToggleFrameless",
				WindowRestore: "common:WindowRestore",
				WindowRuntimeReady: "common:WindowRuntimeReady",
				WindowShow: "common:WindowShow",
				WindowUnFullscreen: "common:WindowUnFullscreen",
				WindowUnMaximise: "common:WindowUnMaximise",
				WindowUnMinimise: "common:WindowUnMinimise",
				WindowZoom: "common:WindowZoom",
				WindowZoomIn: "common:WindowZoomIn",
				WindowZoomOut: "common:WindowZoomOut",
				WindowZoomReset: "common:WindowZoomReset",
				BatteryChanged: "common:BatteryChanged",
				NetworkChanged: "common:NetworkChanged",
				ScreenLocked: "common:ScreenLocked",
				ScreenUnlocked: "common:ScreenUnlocked",
				LowMemory: "common:LowMemory"
			})
		});
	})))();
}

// src/events.ts
var events_exports = /* @__PURE__ */ __exportAll({
	Emit: () => Emit,
	Off: () => Off,
	OffAll: () => OffAll,
	On: () => On,
	OnMultiple: () => OnMultiple,
	Once: () => Once,
	Types: () => Types,
	WailsEvent: () => WailsEvent
});
function dispatchWailsEvent(event) {
	let listeners = eventListeners.get(event.name);
	if (!listeners) return;
	let wailsEvent = new WailsEvent(event.name, event.name in Events$1 ? Events$1[event.name](event.data) : event.data);
	if ("sender" in event) wailsEvent.sender = event.sender;
	const expired = /* @__PURE__ */ new Set();
	for (const listener of listeners.slice()) if (listener.dispatch(wailsEvent)) expired.add(listener);
	if (expired.size > 0) {
		const live = eventListeners.get(event.name);
		if (live) {
			const remaining = live.filter((l) => !expired.has(l));
			if (remaining.length === 0) eventListeners.delete(event.name);
			else eventListeners.set(event.name, remaining);
		}
	}
}
function OnMultiple(eventName, callback, maxCallbacks) {
	let listeners = eventListeners.get(eventName) || [];
	const thisListener = new Listener(eventName, callback, maxCallbacks);
	listeners.push(thisListener);
	eventListeners.set(eventName, listeners);
	return () => listenerOff(thisListener);
}
function On(eventName, callback) {
	return OnMultiple(eventName, callback, -1);
}
function Once(eventName, callback) {
	return OnMultiple(eventName, callback, 1);
}
function Off(...eventNames) {
	eventNames.forEach((eventName) => eventListeners.delete(eventName));
}
function OffAll() {
	eventListeners.clear();
}
function Emit(name, data) {
	return call$3(EmitMethod, new WailsEvent(name, data));
}
var call$3, EmitMethod, WailsEvent;
function init_events() {
	return (init_events = __esmMin((() => {
		init_runtime();
		init_listener();
		init_create();
		init_event_types();
		init_environment();
		if (hasDOM) {
			window._wails = window._wails || {};
			window._wails.dispatchWailsEvent = dispatchWailsEvent;
		}
		call$3 = newRuntimeCaller(objectNames.Events);
		EmitMethod = 0;
		WailsEvent = class {
			constructor(name, data) {
				this.name = name;
				this.data = data !== null && data !== void 0 ? data : null;
			}
		};
	})))();
}

// src/screens.ts
var screens_exports = /* @__PURE__ */ __exportAll({
	GetAll: () => GetAll,
	GetByID: () => GetByID,
	GetByIndex: () => GetByIndex,
	GetCurrent: () => GetCurrent,
	GetPrimary: () => GetPrimary
});
function GetAll() {
	return call$2(getAll);
}
function GetPrimary() {
	return call$2(getPrimary);
}
function GetCurrent() {
	return call$2(getCurrent);
}
function GetByID(id) {
	return call$2(getByID, { id });
}
function GetByIndex(index) {
	return call$2(getByIndex, { index });
}
var call$2, getAll, getPrimary, getCurrent, getByID, getByIndex;
function init_screens() {
	return (init_screens = __esmMin((() => {
		init_runtime();
		call$2 = newRuntimeCaller(objectNames.Screens);
		getAll = 0;
		getPrimary = 1;
		getCurrent = 2;
		getByID = 3;
		getByIndex = 4;
	})))();
}

// src/ios.ts
var ios_exports = /* @__PURE__ */ __exportAll({
	Device: () => Device$1,
	Haptics: () => Haptics$1
});
var call$1, HapticsImpact, DeviceInfo$1, Haptics$1, Device$1;
function init_ios() {
	return (init_ios = __esmMin((() => {
		init_runtime();
		call$1 = newRuntimeCaller(objectNames.IOS);
		HapticsImpact = 0;
		DeviceInfo$1 = 1;
		;
		(function(_Haptics) {
			function Impact(style = "medium") {
				return call$1(HapticsImpact, { style });
			}
			_Haptics.Impact = Impact;
		})(Haptics$1 || (Haptics$1 = {}));
		;
		(function(_Device) {
			function Info() {
				return call$1(DeviceInfo$1);
			}
			_Device.Info = Info;
		})(Device$1 || (Device$1 = {}));
	})))();
}

// src/android.ts
var android_exports = /* @__PURE__ */ __exportAll({
	Device: () => Device,
	Haptics: () => Haptics,
	Toast: () => Toast
});
var call, HapticsVibrate, DeviceInfo, ToastShow, Haptics, Device, Toast;
function init_android() {
	return (init_android = __esmMin((() => {
		init_runtime();
		call = newRuntimeCaller(objectNames.Android);
		HapticsVibrate = 0;
		DeviceInfo = 1;
		ToastShow = 2;
		;
		(function(_Haptics) {
			function Vibrate(durationMs = 100) {
				return call(HapticsVibrate, { duration: durationMs });
			}
			_Haptics.Vibrate = Vibrate;
		})(Haptics || (Haptics = {}));
		;
		(function(_Device) {
			function Info() {
				return call(DeviceInfo);
			}
			_Device.Info = Info;
		})(Device || (Device = {}));
		;
		(function(_Toast) {
			function Show(message) {
				return call(ToastShow, { message });
			}
			_Toast.Show = Show;
		})(Toast || (Toast = {}));
	})))();
}

// src/updater.ts
var updater_exports = /* @__PURE__ */ __exportAll({ Events: () => Events });
var Events;
function init_updater() {
	return (init_updater = __esmMin((() => {
		Events = Object.freeze({
			CheckStarted: "wails:updater:check-started",
			UpdateAvailable: "wails:updater:update-available",
			NoUpdate: "wails:updater:no-update",
			DownloadStarted: "wails:updater:download-started",
			DownloadProgress: "wails:updater:download-progress",
			DownloadComplete: "wails:updater:download-complete",
			Verifying: "wails:updater:verifying",
			Installing: "wails:updater:installing",
			UpdateReady: "wails:updater:update-ready",
			Error: "wails:updater:error",
			Meta: "wails:updater:meta",
			User: Object.freeze({
				Install: "wails:updater:user:install",
				Restart: "wails:updater:user:restart",
				Skip: "wails:updater:user:skip",
				Remind: "wails:updater:user:remind",
				Cancel: "wails:updater:user:cancel"
			}),
			Window: Object.freeze({ Ready: "wails:updater:window:ready" })
		});
	})))();
}

// src/window.ts
function getDropTargetElement(element) {
	if (!element) return null;
	return element.closest(`[${DROP_TARGET_ATTRIBUTE}]`);
}
function canResolveFilePaths() {
	var _window$chrome, _window$_wails;
	if (((_window$chrome = window.chrome) === null || _window$chrome === void 0 || (_window$chrome = _window$chrome.webview) === null || _window$chrome === void 0 ? void 0 : _window$chrome.postMessageWithAdditionalObjects) == null) return false;
	return ((_window$_wails = window._wails) === null || _window$_wails === void 0 || (_window$_wails = _window$_wails.flags) === null || _window$_wails === void 0 ? void 0 : _window$_wails.enableFileDrop) === true;
}
function resolveFilePaths(x, y, files) {
	var _window$chrome2;
	if ((_window$chrome2 = window.chrome) === null || _window$chrome2 === void 0 || (_window$chrome2 = _window$chrome2.webview) === null || _window$chrome2 === void 0 ? void 0 : _window$chrome2.postMessageWithAdditionalObjects) window.chrome.webview.postMessageWithAdditionalObjects(`file:drop:${x}:${y}`, files);
}
function cleanupNativeDrag() {
	nativeDragActive = false;
	if (currentDropTarget) {
		currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		currentDropTarget = null;
	}
}
function handleDragEnter() {
	var _window$_wails2;
	if (((_window$_wails2 = window._wails) === null || _window$_wails2 === void 0 || (_window$_wails2 = _window$_wails2.flags) === null || _window$_wails2 === void 0 ? void 0 : _window$_wails2.enableFileDrop) === false) return;
	nativeDragActive = true;
}
function handleDragLeave() {
	cleanupNativeDrag();
}
function handleDragOver(x, y) {
	var _window$_wails3;
	if (!nativeDragActive) return;
	if (((_window$_wails3 = window._wails) === null || _window$_wails3 === void 0 || (_window$_wails3 = _window$_wails3.flags) === null || _window$_wails3 === void 0 ? void 0 : _window$_wails3.enableFileDrop) === false) return;
	const dropTarget = getDropTargetElement(document.elementFromPoint(x, y));
	if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
	if (dropTarget) {
		dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
		currentDropTarget = dropTarget;
	} else currentDropTarget = null;
}
function setupDropTargetListeners() {
	const docElement = document.documentElement;
	let dragEnterCounter = 0;
	docElement.addEventListener("dragenter", (event) => {
		var _event$dataTransfer, _window$_wails5;
		if (!((_event$dataTransfer = event.dataTransfer) === null || _event$dataTransfer === void 0 ? void 0 : _event$dataTransfer.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_wails5 = window._wails) === null || _window$_wails5 === void 0 || (_window$_wails5 = _window$_wails5.flags) === null || _window$_wails5 === void 0 ? void 0 : _window$_wails5.enableFileDrop) === false) {
			event.dataTransfer.dropEffect = "none";
			return;
		}
		dragEnterCounter++;
		const dropTarget = getDropTargetElement(document.elementFromPoint(event.clientX, event.clientY));
		if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		if (dropTarget) {
			dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
			event.dataTransfer.dropEffect = "copy";
			currentDropTarget = dropTarget;
		} else {
			event.dataTransfer.dropEffect = "none";
			currentDropTarget = null;
		}
	}, false);
	docElement.addEventListener("dragover", (event) => {
		var _event$dataTransfer2, _window$_wails6;
		if (!((_event$dataTransfer2 = event.dataTransfer) === null || _event$dataTransfer2 === void 0 ? void 0 : _event$dataTransfer2.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_wails6 = window._wails) === null || _window$_wails6 === void 0 || (_window$_wails6 = _window$_wails6.flags) === null || _window$_wails6 === void 0 ? void 0 : _window$_wails6.enableFileDrop) === false) {
			event.dataTransfer.dropEffect = "none";
			return;
		}
		const dropTarget = getDropTargetElement(document.elementFromPoint(event.clientX, event.clientY));
		if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		if (dropTarget) {
			if (!dropTarget.classList.contains(DROP_TARGET_ACTIVE_CLASS)) dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
			event.dataTransfer.dropEffect = "copy";
			currentDropTarget = dropTarget;
		} else {
			event.dataTransfer.dropEffect = "none";
			currentDropTarget = null;
		}
	}, false);
	docElement.addEventListener("dragleave", (event) => {
		var _event$dataTransfer3, _window$_wails7;
		if (!((_event$dataTransfer3 = event.dataTransfer) === null || _event$dataTransfer3 === void 0 ? void 0 : _event$dataTransfer3.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_wails7 = window._wails) === null || _window$_wails7 === void 0 || (_window$_wails7 = _window$_wails7.flags) === null || _window$_wails7 === void 0 ? void 0 : _window$_wails7.enableFileDrop) === false) return;
		if (event.relatedTarget === null) return;
		dragEnterCounter--;
		if (dragEnterCounter === 0 || currentDropTarget && !currentDropTarget.contains(event.relatedTarget)) {
			if (currentDropTarget) {
				currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
				currentDropTarget = null;
			}
			dragEnterCounter = 0;
		}
	}, false);
	docElement.addEventListener("drop", (event) => {
		var _event$dataTransfer4, _window$_wails8, _window$_wails9;
		if (!((_event$dataTransfer4 = event.dataTransfer) === null || _event$dataTransfer4 === void 0 ? void 0 : _event$dataTransfer4.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_wails8 = window._wails) === null || _window$_wails8 === void 0 || (_window$_wails8 = _window$_wails8.flags) === null || _window$_wails8 === void 0 ? void 0 : _window$_wails8.enableFileDrop) === false) return;
		dragEnterCounter = 0;
		if (currentDropTarget) {
			currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
			currentDropTarget = null;
		}
		if (canResolveFilePaths() && ((_window$_wails9 = window._wails) === null || _window$_wails9 === void 0 || (_window$_wails9 = _window$_wails9.flags) === null || _window$_wails9 === void 0 ? void 0 : _window$_wails9.nativeCompositionFileDrop) !== true) {
			const files = [];
			if (event.dataTransfer.items) {
				for (const item of event.dataTransfer.items) if (item.kind === "file") {
					const file = item.getAsFile();
					if (file) files.push(file);
				}
			} else if (event.dataTransfer.files) for (const file of event.dataTransfer.files) files.push(file);
			if (files.length > 0) resolveFilePaths(event.clientX, event.clientY, files);
		}
	}, false);
}
var DROP_TARGET_ATTRIBUTE, DROP_TARGET_ACTIVE_CLASS, currentDropTarget, PositionMethod, CenterMethod, CloseMethod, DisableSizeConstraintsMethod, EnableSizeConstraintsMethod, FocusMethod, ForceReloadMethod, FullscreenMethod, GetScreenMethod, GetZoomMethod, HeightMethod, HideMethod, IsFocusedMethod, IsFullscreenMethod, IsMaximisedMethod, IsMinimisedMethod, MaximiseMethod, MinimiseMethod, NameMethod, OpenDevToolsMethod, RelativePositionMethod, ReloadMethod, ResizableMethod, RestoreMethod, SetPositionMethod, SetAlwaysOnTopMethod, SetBackgroundColourMethod, SetFramelessMethod, SetFullscreenButtonEnabledMethod, SetMaxSizeMethod, SetMinSizeMethod, SetRelativePositionMethod, SetResizableMethod, SetSizeMethod, SetTitleMethod, SetZoomMethod, ShowMethod, SizeMethod, ToggleFullscreenMethod, ToggleMaximiseMethod, ToggleFramelessMethod, UnFullscreenMethod, UnMaximiseMethod, UnMinimiseMethod, WidthMethod, ZoomMethod, ZoomInMethod, ZoomOutMethod, ZoomResetMethod, SnapAssistMethod, FilesDropped, PrintMethod, SetScreenMethod, nativeDragActive, callerSym, Window, thisWindow;
function init_window() {
	return (init_window = __esmMin((() => {
		init_runtime();
		DROP_TARGET_ATTRIBUTE = "data-file-drop-target";
		DROP_TARGET_ACTIVE_CLASS = "file-drop-target-active";
		currentDropTarget = null;
		PositionMethod = 0;
		CenterMethod = 1;
		CloseMethod = 2;
		DisableSizeConstraintsMethod = 3;
		EnableSizeConstraintsMethod = 4;
		FocusMethod = 5;
		ForceReloadMethod = 6;
		FullscreenMethod = 7;
		GetScreenMethod = 8;
		GetZoomMethod = 9;
		HeightMethod = 10;
		HideMethod = 11;
		IsFocusedMethod = 12;
		IsFullscreenMethod = 13;
		IsMaximisedMethod = 14;
		IsMinimisedMethod = 15;
		MaximiseMethod = 16;
		MinimiseMethod = 17;
		NameMethod = 18;
		OpenDevToolsMethod = 19;
		RelativePositionMethod = 20;
		ReloadMethod = 21;
		ResizableMethod = 22;
		RestoreMethod = 23;
		SetPositionMethod = 24;
		SetAlwaysOnTopMethod = 25;
		SetBackgroundColourMethod = 26;
		SetFramelessMethod = 27;
		SetFullscreenButtonEnabledMethod = 28;
		SetMaxSizeMethod = 29;
		SetMinSizeMethod = 30;
		SetRelativePositionMethod = 31;
		SetResizableMethod = 32;
		SetSizeMethod = 33;
		SetTitleMethod = 34;
		SetZoomMethod = 35;
		ShowMethod = 36;
		SizeMethod = 37;
		ToggleFullscreenMethod = 38;
		ToggleMaximiseMethod = 39;
		ToggleFramelessMethod = 40;
		UnFullscreenMethod = 41;
		UnMaximiseMethod = 42;
		UnMinimiseMethod = 43;
		WidthMethod = 44;
		ZoomMethod = 45;
		ZoomInMethod = 46;
		ZoomOutMethod = 47;
		ZoomResetMethod = 48;
		SnapAssistMethod = 49;
		FilesDropped = 50;
		PrintMethod = 51;
		SetScreenMethod = 52;
		nativeDragActive = false;
		callerSym = Symbol("caller");
		Window = class Window {
			constructor(name = "") {
				this[callerSym] = newRuntimeCaller(objectNames.Window, name);
				for (const method of Object.getOwnPropertyNames(Window.prototype)) if (method !== "constructor" && typeof this[method] === "function") this[method] = this[method].bind(this);
			}
			Get(name) {
				return new Window(name);
			}
			Position() {
				return this[callerSym](PositionMethod);
			}
			Center() {
				return this[callerSym](CenterMethod);
			}
			Close() {
				return this[callerSym](CloseMethod);
			}
			DisableSizeConstraints() {
				return this[callerSym](DisableSizeConstraintsMethod);
			}
			EnableSizeConstraints() {
				return this[callerSym](EnableSizeConstraintsMethod);
			}
			Focus() {
				return this[callerSym](FocusMethod);
			}
			ForceReload() {
				return this[callerSym](ForceReloadMethod);
			}
			Fullscreen() {
				return this[callerSym](FullscreenMethod);
			}
			GetScreen() {
				return this[callerSym](GetScreenMethod);
			}
			GetZoom() {
				return this[callerSym](GetZoomMethod);
			}
			Height() {
				return this[callerSym](HeightMethod);
			}
			Hide() {
				return this[callerSym](HideMethod);
			}
			IsFocused() {
				return this[callerSym](IsFocusedMethod);
			}
			IsFullscreen() {
				return this[callerSym](IsFullscreenMethod);
			}
			IsMaximised() {
				return this[callerSym](IsMaximisedMethod);
			}
			IsMinimised() {
				return this[callerSym](IsMinimisedMethod);
			}
			Maximise() {
				return this[callerSym](MaximiseMethod);
			}
			Minimise() {
				return this[callerSym](MinimiseMethod);
			}
			Name() {
				return this[callerSym](NameMethod);
			}
			OpenDevTools() {
				return this[callerSym](OpenDevToolsMethod);
			}
			RelativePosition() {
				return this[callerSym](RelativePositionMethod);
			}
			Reload() {
				return this[callerSym](ReloadMethod);
			}
			Resizable() {
				return this[callerSym](ResizableMethod);
			}
			Restore() {
				return this[callerSym](RestoreMethod);
			}
			SetPosition(x, y) {
				return this[callerSym](SetPositionMethod, {
					x,
					y
				});
			}
			SetAlwaysOnTop(alwaysOnTop) {
				return this[callerSym](SetAlwaysOnTopMethod, { alwaysOnTop });
			}
			SetBackgroundColour(r, g, b, a) {
				return this[callerSym](SetBackgroundColourMethod, {
					r,
					g,
					b,
					a
				});
			}
			SetFrameless(frameless) {
				return this[callerSym](SetFramelessMethod, { frameless });
			}
			SetFullscreenButtonEnabled(enabled) {
				return this[callerSym](SetFullscreenButtonEnabledMethod, { enabled });
			}
			SetMaxSize(width, height) {
				return this[callerSym](SetMaxSizeMethod, {
					width,
					height
				});
			}
			SetMinSize(width, height) {
				return this[callerSym](SetMinSizeMethod, {
					width,
					height
				});
			}
			SetRelativePosition(x, y) {
				return this[callerSym](SetRelativePositionMethod, {
					x,
					y
				});
			}
			SetResizable(resizable) {
				return this[callerSym](SetResizableMethod, { resizable });
			}
			SetSize(width, height) {
				return this[callerSym](SetSizeMethod, {
					width,
					height
				});
			}
			SetTitle(title) {
				return this[callerSym](SetTitleMethod, { title });
			}
			SetZoom(zoom) {
				return this[callerSym](SetZoomMethod, { zoom });
			}
			Show() {
				return this[callerSym](ShowMethod);
			}
			Size() {
				return this[callerSym](SizeMethod);
			}
			ToggleFullscreen() {
				return this[callerSym](ToggleFullscreenMethod);
			}
			ToggleMaximise() {
				return this[callerSym](ToggleMaximiseMethod);
			}
			ToggleFrameless() {
				return this[callerSym](ToggleFramelessMethod);
			}
			UnFullscreen() {
				return this[callerSym](UnFullscreenMethod);
			}
			UnMaximise() {
				return this[callerSym](UnMaximiseMethod);
			}
			UnMinimise() {
				return this[callerSym](UnMinimiseMethod);
			}
			Width() {
				return this[callerSym](WidthMethod);
			}
			Zoom() {
				return this[callerSym](ZoomMethod);
			}
			ZoomIn() {
				return this[callerSym](ZoomInMethod);
			}
			ZoomOut() {
				return this[callerSym](ZoomOutMethod);
			}
			ZoomReset() {
				return this[callerSym](ZoomResetMethod);
			}
			HandlePlatformFileDrop(filenames, x, y) {
				var _window$_wails4;
				if (((_window$_wails4 = window._wails) === null || _window$_wails4 === void 0 || (_window$_wails4 = _window$_wails4.flags) === null || _window$_wails4 === void 0 ? void 0 : _window$_wails4.enableFileDrop) === false) return;
				const dropTarget = getDropTargetElement(document.elementFromPoint(x, y));
				if (!dropTarget) return;
				const elementDetails = {
					id: dropTarget.id,
					classList: Array.from(dropTarget.classList),
					attributes: {}
				};
				for (let i = 0; i < dropTarget.attributes.length; i++) {
					const attr = dropTarget.attributes[i];
					elementDetails.attributes[attr.name] = attr.value;
				}
				const payload = {
					filenames,
					x,
					y,
					elementDetails
				};
				this[callerSym](FilesDropped, payload);
				cleanupNativeDrag();
			}
			SetScreen(screenID) {
				return this[callerSym](SetScreenMethod, { screenID });
			}
			SnapAssist() {
				return this[callerSym](SnapAssistMethod);
			}
			Print() {
				return this[callerSym](PrintMethod);
			}
		};
		thisWindow = new Window("");
		if (typeof window !== "undefined" && typeof document !== "undefined") setupDropTargetListeners();
	})))();
}

// src/wml.ts
var wml_exports = /* @__PURE__ */ __exportAll({
	Enable: () => Enable,
	Reload: () => Reload
});
function sendEvent(eventName, data = null) {
	Emit(eventName, data);
}
function callWindowMethod(windowName, methodName) {
	const targetWindow = thisWindow.Get(windowName);
	const method = targetWindow[methodName];
	if (typeof method !== "function") {
		console.error(`Window method '${methodName}' not found`);
		return;
	}
	try {
		method.call(targetWindow);
	} catch (e) {
		console.error(`Error calling window method '${methodName}': `, e);
	}
}
function onWMLTriggered(ev) {
	const element = ev.currentTarget;
	function runEffect(choice = "Yes") {
		if (choice !== "Yes") return;
		const eventType = element.getAttribute("wml-event") || element.getAttribute("data-wml-event");
		const targetWindow = element.getAttribute("wml-target-window") || element.getAttribute("data-wml-target-window") || "";
		const windowMethod = element.getAttribute("wml-window") || element.getAttribute("data-wml-window");
		const url = element.getAttribute("wml-openurl") || element.getAttribute("data-wml-openurl");
		if (eventType !== null) sendEvent(eventType);
		if (windowMethod !== null) callWindowMethod(targetWindow, windowMethod);
		if (url !== null) OpenURL(url);
	}
	const confirm = element.getAttribute("wml-confirm") || element.getAttribute("data-wml-confirm");
	if (confirm) Question({
		Title: "Confirm",
		Message: confirm,
		Detached: false,
		Buttons: [{ Label: "Yes" }, {
			Label: "No",
			IsDefault: true
		}]
	}).then(runEffect);
	else runEffect();
}
function addWMLListeners(element) {
	const triggerRegExp = /\S+/g;
	const triggerAttr = element.getAttribute("wml-trigger") || element.getAttribute("data-wml-trigger") || "click";
	const triggers = [];
	let match;
	while ((match = triggerRegExp.exec(triggerAttr)) !== null) triggers.push(match[0]);
	const options = triggerRegistry.set(element, triggers);
	for (const trigger of triggers) element.addEventListener(trigger, onWMLTriggered, options);
}
function Enable() {
	whenReady(Reload);
}
function Reload() {
	triggerRegistry.reset();
	document.body.querySelectorAll("[wml-event], [wml-window], [wml-openurl], [data-wml-event], [data-wml-window], [data-wml-openurl]").forEach(addWMLListeners);
}
var controllerSym, triggerMapSym, elementCountSym, AbortControllerRegistry, WeakMapRegistry, triggerRegistry;
function init_wml() {
	return (init_wml = __esmMin((() => {
		init_browser();
		init_dialogs();
		init_events();
		init_utils();
		init_window();
		controllerSym = Symbol("controller");
		triggerMapSym = Symbol("triggerMap");
		elementCountSym = Symbol("elementCount");
		AbortControllerRegistry = class {
			constructor() {
				this[controllerSym] = new AbortController();
			}
			set(element, triggers) {
				return { signal: this[controllerSym].signal };
			}
			reset() {
				this[controllerSym].abort();
				this[controllerSym] = new AbortController();
			}
		};
		WeakMapRegistry = class {
			constructor() {
				this[triggerMapSym] = /* @__PURE__ */ new WeakMap();
				this[elementCountSym] = 0;
			}
			set(element, triggers) {
				if (!this[triggerMapSym].has(element)) this[elementCountSym]++;
				this[triggerMapSym].set(element, triggers);
				return {};
			}
			reset() {
				if (this[elementCountSym] <= 0) return;
				for (const element of document.body.querySelectorAll("*")) {
					if (this[elementCountSym] <= 0) break;
					const triggers = this[triggerMapSym].get(element);
					if (triggers != null) this[elementCountSym]--;
					for (const trigger of triggers || []) element.removeEventListener(trigger, onWMLTriggered);
				}
				this[triggerMapSym] = /* @__PURE__ */ new WeakMap();
				this[elementCountSym] = 0;
			}
		};
		triggerRegistry = canAbortListeners() ? new AbortControllerRegistry() : new WeakMapRegistry();
	})))();
}

// src/stream.ts
function namedPageGeneration() {
	try {
		const marker = window.name.lastIndexOf(GENERATION_NAME_MARKER);
		if (marker < 0) return 0;
		const value = Number(window.name.slice(marker + 29));
		return Number.isSafeInteger(value) && value > 0 ? value : 0;
	} catch (_unused) {
		return 0;
	}
}
function rememberNamedPageGeneration(generation) {
	try {
		const marker = window.name.lastIndexOf(GENERATION_NAME_MARKER);
		const applicationName = marker < 0 ? window.name : window.name.slice(0, marker);
		window.name = applicationName + GENERATION_NAME_MARKER + generation;
	} catch (_unused2) {}
}
function nextPageGeneration() {
	if (!hasDOM) return 1;
	const origin = typeof performance !== "undefined" && Number.isFinite(performance.timeOrigin) ? performance.timeOrigin : Date.now();
	const pageTime = Math.max(1, Math.floor(origin * 1e3));
	let current = namedPageGeneration();
	try {
		const raw = window.sessionStorage.getItem(GENERATION_KEY);
		const stored = raw === null ? 0 : Number(raw);
		if (Number.isSafeInteger(stored) && stored > current) current = stored;
	} catch (_unused3) {}
	const next = Number.isSafeInteger(current) && current >= 0 && current < Number.MAX_SAFE_INTEGER ? Math.max(current + 1, pageTime) : pageTime;
	try {
		window.sessionStorage.setItem(GENERATION_KEY, String(next));
	} catch (_unused4) {}
	rememberNamedPageGeneration(next);
	return next;
}
function streamGlobals() {
	const fresh = () => ({
		session: nanoid(),
		generation: nextPageGeneration(),
		nextConnID: 1,
		connections: /* @__PURE__ */ new Map(),
		polling: false
	});
	if (!hasDOM) return fresh();
	const w = window._wails = window._wails || {};
	return w.__stream = w.__stream || fresh();
}
function streamURL(endpoint) {
	return window.location.origin + "/wails/stream/" + endpoint;
}
function sleep(ms, signal) {
	if (!signal) return new Promise((resolve) => setTimeout(resolve, ms));
	if (signal.aborted) return Promise.reject(new StreamRequestCancelled());
	return new Promise((resolve, reject) => {
		const onAbort = () => {
			clearTimeout(timer);
			reject(new StreamRequestCancelled());
		};
		const timer = setTimeout(() => {
			signal.removeEventListener("abort", onAbort);
			resolve();
		}, ms);
		signal.addEventListener("abort", onAbort, { once: true });
	});
}
function Stream(name) {
	if (hasDOM) {
		var _window$_wails;
		const factory = (_window$_wails = window._wails) === null || _window$_wails === void 0 ? void 0 : _window$_wails.streamFactory;
		if (typeof factory === "function") return factory(name);
	}
	return new WailsSocket(name);
}
function defineHandlerProperty(target, type) {
	let current = null;
	Object.defineProperty(target, "on" + type, {
		get: () => current,
		set(fn) {
			if (current) target.removeEventListener(type, current);
			current = typeof fn === "function" ? fn : null;
			if (current) target.addEventListener(type, current);
		},
		configurable: true,
		enumerable: true
	});
}
function JSONStream(name) {
	const socket = Stream(name);
	const decoder = new TextDecoder();
	const parse = (payload) => JSON.parse(typeof payload === "string" ? payload : decoder.decode(payload));
	if (socket instanceof WailsSocket) socket._decode = (payload) => parse(payload);
	else {
		const native = socket;
		native.binaryType = "arraybuffer";
		const wrapped = /* @__PURE__ */ new WeakMap();
		const decodedEvents = /* @__PURE__ */ new WeakMap();
		const add = native.addEventListener.bind(native);
		const remove = native.removeEventListener.bind(native);
		const decodeEvent = (ev) => {
			var _decodedEvents$get;
			if (decodedEvents.has(ev)) return (_decodedEvents$get = decodedEvents.get(ev)) !== null && _decodedEvents$get !== void 0 ? _decodedEvents$get : null;
			try {
				const value = parse(ev.data);
				const decoded = new MessageEvent("message", { data: value });
				decodedEvents.set(ev, decoded);
				return decoded;
			} catch (_unused6) {
				decodedEvents.set(ev, null);
				native.dispatchEvent(new Event("error"));
				return null;
			}
		};
		const decode = (listener) => {
			const existing = wrapped.get(listener);
			if (existing) return existing;
			const fn = (ev) => {
				const decoded = decodeEvent(ev);
				if (!decoded) return;
				if (typeof listener === "function") listener.call(native, decoded);
				else listener.handleEvent(decoded);
			};
			wrapped.set(listener, fn);
			return fn;
		};
		native.addEventListener = ((type, listener, opts) => {
			add(type, type === "message" && listener ? decode(listener) : listener, opts);
		});
		native.removeEventListener = ((type, listener, opts) => {
			const fn = type === "message" && listener ? wrapped.get(listener) : void 0;
			remove(type, fn !== null && fn !== void 0 ? fn : listener, opts);
		});
		let handler = null;
		Object.defineProperty(native, "onmessage", {
			get: () => handler,
			set(fn) {
				if (handler) native.removeEventListener("message", handler);
				handler = typeof fn === "function" ? fn : null;
				if (handler) native.addEventListener("message", handler);
			},
			configurable: true,
			enumerable: true
		});
	}
	const send = socket.send.bind(socket);
	socket.send = (value) => send(JSON.stringify(value));
	return socket;
}
function toBytesSync(data) {
	if (typeof data === "string") return textEncoder.encode(data);
	if (typeof Blob !== "undefined" && data instanceof Blob) return null;
	if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
	return new Uint8Array(data).slice();
}
function abortable(promise, signal) {
	if (!signal) return promise;
	if (signal.aborted) return Promise.reject(new StreamRequestCancelled());
	return new Promise((resolve, reject) => {
		const onAbort = () => reject(new StreamRequestCancelled());
		signal.addEventListener("abort", onAbort, { once: true });
		promise.then((value) => {
			signal.removeEventListener("abort", onAbort);
			resolve(value);
		}, (err) => {
			signal.removeEventListener("abort", onAbort);
			reject(err);
		});
	});
}
async function toBytes(data, signal) {
	if (typeof data === "string") return textEncoder.encode(data);
	if (typeof Blob !== "undefined" && data instanceof Blob) return new Uint8Array(await abortable(data.arrayBuffer(), signal));
	if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
	return new Uint8Array(data).slice();
}
async function postFrame(connID, kind, body, name, signal) {
	const headers = {
		[HDR_SESSION]: G.session,
		[HDR_GENERATION]: String(G.generation),
		[HDR_CONN]: String(connID),
		[HDR_KIND]: String(kind),
		"Content-Type": "application/octet-stream"
	};
	if (name !== void 0) headers[HDR_NAME] = name;
	if (body.byteLength <= CHUNK_THRESHOLD) {
		await postWithRetry(headers, body, signal);
		return;
	}
	const chunkID = nanoid();
	const total = Math.ceil(body.byteLength / CHUNK_THRESHOLD);
	for (let i = 0; i < total; i++) {
		const slice = body.subarray(i * CHUNK_THRESHOLD, (i + 1) * CHUNK_THRESHOLD);
		await postWithRetry(_objectSpread2(_objectSpread2({}, headers), {}, {
			[HDR_CHUNK]: chunkID,
			[HDR_CHUNK_INDEX]: String(i),
			[HDR_CHUNK_TOTAL]: String(total)
		}), slice, signal);
	}
}
async function postWithRetry(headers, body, signal) {
	let wait = 1;
	for (;;) {
		if (signal === null || signal === void 0 ? void 0 : signal.aborted) throw new StreamRequestCancelled();
		const resp = await fetch(streamURL("send"), {
			method: "POST",
			headers,
			body,
			signal
		});
		if (resp.ok) return;
		if (resp.status !== 429) throw new Error(await resp.text());
		await sleep(wait, signal);
		wait = Math.min(wait * 2, 50);
	}
}
async function postBatch(connID, frames, signal) {
	let start = 0;
	while (start < frames.length) {
		if (frames[start].byteLength > CHUNK_THRESHOLD) {
			await postFrame(connID, KIND_DATA, frames[start], void 0, signal);
			start++;
			continue;
		}
		let end = start;
		let size = 4;
		while (end < frames.length && end - start < MAX_BATCH_FRAMES) {
			const frame = frames[end];
			if (frame.byteLength > CHUNK_THRESHOLD || size + 4 + frame.byteLength > CHUNK_THRESHOLD) break;
			size += 4 + frame.byteLength;
			end++;
		}
		if (end === start) {
			await postFrame(connID, KIND_DATA, frames[start], void 0, signal);
			start++;
			continue;
		}
		const group = frames.slice(start, end);
		if (group.length === 1) await postFrame(connID, KIND_DATA, group[0], void 0, signal);
		else await postBatchGroup(connID, group, signal);
		start = end;
	}
}
async function postBatchGroup(connID, frames, signal) {
	if (frames.length === 0 || frames.length > MAX_BATCH_FRAMES) throw new Error("invalid stream batch size");
	let body = buildBatch(frames);
	let sent = 0;
	let wait = 1;
	for (;;) {
		var _resp$headers$get;
		if (signal === null || signal === void 0 ? void 0 : signal.aborted) throw new StreamRequestCancelled();
		const resp = await fetch(streamURL("send"), {
			method: "POST",
			headers: {
				[HDR_SESSION]: G.session,
				[HDR_GENERATION]: String(G.generation),
				[HDR_CONN]: String(connID),
				[HDR_KIND]: String(KIND_DATA),
				[HDR_BATCH]: String(frames.length - sent),
				"Content-Type": "application/octet-stream"
			},
			body,
			signal
		});
		if (resp.ok) return;
		if (resp.status !== 429) throw new Error(await resp.text());
		const accepted = Number((_resp$headers$get = resp.headers.get(HDR_BATCH)) !== null && _resp$headers$get !== void 0 ? _resp$headers$get : 0);
		const remaining = frames.length - sent;
		if (!Number.isInteger(accepted) || accepted < 0 || accepted >= remaining) {
			if (accepted !== 0) throw new Error("invalid stream batch acknowledgement");
		}
		sent += accepted;
		body = buildBatch(frames.slice(sent));
		await sleep(wait, signal);
		wait = Math.min(wait * 2, 50);
	}
}
function buildBatch(frames) {
	let size = 4;
	for (const f of frames) size += 4 + f.byteLength;
	const out = new Uint8Array(size);
	const view = new DataView(out.buffer);
	view.setUint32(0, frames.length);
	let off = 4;
	for (const f of frames) {
		view.setUint32(off, f.byteLength);
		off += 4;
		out.set(f, off);
		off += f.byteLength;
	}
	return out;
}
function startPolling() {
	if (G.polling || !hasDOM) return;
	G.polling = true;
	pollLoop();
}
async function pollLoop() {
	let backoff = 0;
	const abort = new AbortController();
	G.pollAbort = abort;
	while (G.connections.size > 0) try {
		const resp = await fetch(streamURL("poll"), {
			method: "GET",
			headers: {
				[HDR_SESSION]: G.session,
				[HDR_GENERATION]: String(G.generation)
			},
			cache: "no-store",
			signal: abort.signal
		});
		if (resp.status === 410) {
			closeAll(1001, "session closed");
			break;
		}
		if (!resp.ok && resp.status !== 204) {
			if (!isRetryablePollStatus(resp.status)) {
				failAll("stream poll failed: " + resp.status);
				break;
			}
			throw new Error("retryable stream poll failure: " + resp.status);
		}
		backoff = 0;
		if (resp.status !== 204) {
			let buf;
			try {
				buf = await resp.arrayBuffer();
			} catch (_unused7) {
				failAll("stream poll response body failed");
				break;
			}
			const frames = decodeFrames(buf);
			if (frames === null) {
				closeAll(1002, "unrecognised stream framing");
				break;
			}
			deliver(frames);
		}
	} catch (err) {
		if (abort.signal.aborted || G.connections.size === 0) break;
		backoff = backoff ? Math.min(backoff * 2, BACKOFF_MAX) : BACKOFF_MIN;
		try {
			await sleep(backoff, abort.signal);
		} catch (_unused8) {
			break;
		}
	}
	if (G.pollAbort === abort) G.pollAbort = void 0;
	G.polling = false;
	if (G.connections.size > 0) startPolling();
}
function isRetryablePollStatus(status) {
	return status === 408 || status === 425 || status === 429 || status >= 500 && status <= 599;
}
function decodeFrames(buf) {
	if (buf.byteLength < 9) return null;
	const dv = new DataView(buf);
	if (dv.getUint8(0) !== 87 || dv.getUint8(1) !== 83 || dv.getUint8(2) !== 49 || dv.getUint8(3) !== 0 || (dv.getUint8(4) & -2) !== 0) return null;
	const count = dv.getUint32(5);
	const frames = [];
	let off = 9;
	for (let i = 0; i < count; i++) {
		if (off + 9 > buf.byteLength) return null;
		const connID = dv.getUint32(off);
		off += 4;
		const kind = dv.getUint8(off);
		off += 1;
		const len = dv.getUint32(off);
		off += 4;
		if (kind > KIND_ERROR || len > buf.byteLength - off) return null;
		const payload = buf.slice(off, off + len);
		off += len;
		frames.push({
			connID,
			kind,
			payload
		});
	}
	return off === buf.byteLength ? frames : null;
}
function deliver(frames) {
	for (const frame of frames) {
		const connID = frame.connID;
		const kind = frame.kind;
		const payload = frame.payload;
		const conn = G.connections.get(connID);
		if (!conn) continue;
		switch (kind) {
			case KIND_DATA:
				conn._message(payload);
				break;
			case KIND_OPEN:
				conn._opened();
				break;
			case KIND_CLOSE:
				conn._closed(1e3, "", true);
				break;
			case KIND_ERROR: conn._fail(new Error(new TextDecoder().decode(payload)));
		}
	}
}
function closeAll(code, reason) {
	for (const conn of [...G.connections.values()]) conn._closed(code, reason, false);
}
function failAll(reason) {
	for (const conn of [...G.connections.values()]) conn._fail(new Error(reason));
}
var _WailsSocket, GENERATION_KEY, GENERATION_NAME_MARKER, G, HDR_SESSION, HDR_GENERATION, HDR_CONN, HDR_KIND, HDR_NAME, HDR_CHUNK, HDR_CHUNK_INDEX, HDR_CHUNK_TOTAL, HDR_BATCH, KIND_DATA, KIND_OPEN, KIND_CLOSE, KIND_ERROR, CHUNK_THRESHOLD, MAX_BATCH_FRAMES, BACKOFF_MIN, BACKOFF_MAX, textEncoder, StreamRequestCancelled, WailsSocket;
function init_stream() {
	return (init_stream = __esmMin((() => {
		init_nanoid();
		init_environment();
		init_objectSpread2();
		;
		GENERATION_KEY = "__wails_stream_generation";
		GENERATION_NAME_MARKER = "__wails_stream_generation__:";
		G = streamGlobals();
		HDR_SESSION = "x-wails-stream-session";
		HDR_GENERATION = "x-wails-stream-generation";
		HDR_CONN = "x-wails-stream-conn";
		HDR_KIND = "x-wails-stream-kind";
		HDR_NAME = "x-wails-stream-name";
		HDR_CHUNK = "x-wails-stream-chunk";
		HDR_CHUNK_INDEX = "x-wails-stream-chunk-index";
		HDR_CHUNK_TOTAL = "x-wails-stream-chunk-total";
		HDR_BATCH = "x-wails-stream-batch";
		KIND_DATA = 0;
		KIND_OPEN = 1;
		KIND_CLOSE = 2;
		KIND_ERROR = 3;
		CHUNK_THRESHOLD = 524288;
		MAX_BATCH_FRAMES = 4096;
		BACKOFF_MIN = 250;
		BACKOFF_MAX = 5e3;
		textEncoder = new TextEncoder();
		StreamRequestCancelled = class extends Error {
			constructor() {
				super("stream request cancelled");
				this.name = "AbortError";
			}
		};
		WailsSocket = class WailsSocket extends EventTarget {
			get bufferedAmount() {
				return this._buffered;
			}
			constructor(name) {
				super();
				this.CONNECTING = 0;
				this.OPEN = 1;
				this.CLOSING = 2;
				this.CLOSED = 3;
				this.protocol = "";
				this.extensions = "";
				this.binaryType = "arraybuffer";
				this.readyState = WailsSocket.CONNECTING;
				this.onopen = null;
				this.onmessage = null;
				this.onclose = null;
				this.onerror = null;
				this._decode = (payload) => payload;
				this._buffered = 0;
				this._chain = Promise.resolve();
				this._pending = [];
				this._flushing = false;
				this._openAbort = new AbortController();
				this._sendAbort = new AbortController();
				this.name = name;
				this._id = G.nextConnID++;
				this.url = hasDOM ? streamURL("poll") + "#" + encodeURIComponent(name) : "";
				for (const type of [
					"open",
					"message",
					"close",
					"error"
				]) defineHandlerProperty(this, type);
				G.connections.set(this._id, this);
				this._chain = this._chain.then(() => postFrame(this._id, KIND_OPEN, /* @__PURE__ */ new Uint8Array(0), name, this._openAbort.signal)).catch((err) => {
					this._fail(err);
				});
				startPolling();
			}
			send(data) {
				if (this.readyState === WailsSocket.CONNECTING) throw new DOMException("Still in CONNECTING state.", "InvalidStateError");
				if (this.readyState !== WailsSocket.OPEN) return;
				const immediate = toBytesSync(data);
				const snapshot = immediate ? Promise.resolve(immediate) : toBytes(data, this._sendAbort.signal);
				snapshot.catch(() => {});
				const blobSize = !immediate && typeof Blob !== "undefined" && data instanceof Blob ? data.size : 0;
				if (blobSize) this._buffered += blobSize;
				if (immediate) this._buffered += immediate.byteLength;
				this._pending.push(snapshot);
				if (this._flushing) return;
				this._flushing = true;
				this._chain = this._chain.then(async () => {
					try {
						while (this._pending.length > 0) {
							const queued = this._pending.splice(0, MAX_BATCH_FRAMES);
							const batch = await Promise.all(queued);
							if (this.readyState === WailsSocket.CLOSED) break;
							const total = batch.reduce((n, b) => n + b.byteLength, 0);
							try {
								await postBatch(this._id, batch, this._sendAbort.signal);
							} finally {
								this._buffered = Math.max(0, this._buffered - total);
							}
						}
					} finally {
						this._flushing = false;
					}
				}).catch((err) => {
					this._flushing = false;
					this._fail(err);
				});
			}
			close(code = 1e3, reason = "") {
				if (this.readyState === WailsSocket.CLOSING || this.readyState === WailsSocket.CLOSED) return;
				this.readyState = WailsSocket.CLOSING;
				this._pending.length = 0;
				this._buffered = 0;
				this._openAbort.abort();
				this._sendAbort.abort();
				this._chain = this._chain.then(() => postFrame(this._id, KIND_CLOSE, /* @__PURE__ */ new Uint8Array(0))).catch(() => {}).then(() => {
					this._closed(code, reason, true);
				});
			}
			_opened() {
				if (this.readyState !== WailsSocket.CONNECTING) return;
				this.readyState = WailsSocket.OPEN;
				this.dispatchEvent(new Event("open"));
			}
			_message(payload) {
				if (this.readyState !== WailsSocket.OPEN) return;
				let data;
				try {
					data = this._decode(payload);
				} catch (_unused5) {
					this.dispatchEvent(new Event("error"));
					return;
				}
				if (data === payload && this.binaryType === "blob") data = new Blob([payload]);
				this.dispatchEvent(new MessageEvent("message", { data }));
			}
			_fail(err) {
				if (this.readyState === WailsSocket.CLOSED || this.readyState === WailsSocket.CLOSING) return;
				this.dispatchEvent(new Event("error"));
				this._closed(1006, err instanceof Error ? err.message : String(err), false);
			}
			_closed(code, reason, wasClean) {
				var _G$pollAbort;
				if (this.readyState === WailsSocket.CLOSED) return;
				this.readyState = WailsSocket.CLOSED;
				this._openAbort.abort();
				this._sendAbort.abort();
				G.connections.delete(this._id);
				if (G.connections.size === 0) (_G$pollAbort = G.pollAbort) === null || _G$pollAbort === void 0 || _G$pollAbort.abort();
				this._pending.length = 0;
				this._buffered = 0;
				const ev = typeof CloseEvent === "function" ? new CloseEvent("close", {
					code,
					reason,
					wasClean
				}) : Object.assign(new Event("close"), {
					code,
					reason,
					wasClean
				});
				this.dispatchEvent(ev);
			}
		};
		_WailsSocket = WailsSocket;
		_WailsSocket.CONNECTING = 0;
		_WailsSocket.OPEN = 1;
		_WailsSocket.CLOSING = 2;
		_WailsSocket.CLOSED = 3;
	})))();
}

// ../../compiled/main.js
function init_main() {
	return (init_main = __esmMin((() => {
		init_src();
		init_wml();
		init_utils();
		window.wails = src_exports;
		Enable();
		debugLog("Wails Runtime Loaded");
	})))();
}

// src/index.ts
var src_exports = /* @__PURE__ */ __exportAll({
	Android: () => android_exports,
	Application: () => application_exports,
	Browser: () => browser_exports,
	Call: () => calls_exports,
	CancelError: () => CancelError,
	CancellablePromise: () => CancellablePromise,
	CancelledRejectionError: () => CancelledRejectionError,
	Clipboard: () => clipboard_exports,
	Create: () => create_exports,
	Dialogs: () => dialogs_exports,
	Events: () => events_exports,
	Flags: () => flags_exports,
	IOS: () => ios_exports,
	JSONStream: () => JSONStream,
	Screens: () => screens_exports,
	Stream: () => Stream,
	System: () => system_exports,
	Updater: () => updater_exports,
	WML: () => wml_exports,
	WailsSocket: () => WailsSocket,
	Window: () => thisWindow,
	clientId: () => clientId,
	getTransport: () => getTransport,
	loadOptionalScript: () => loadOptionalScript,
	objectNames: () => objectNames,
	setTransport: () => setTransport
});
function loadOptionalScript(url) {
	return fetch(url, { method: "HEAD" }).then((response) => {
		if (response.ok) {
			if ((response.headers.get("content-type") || "").toLowerCase().includes("javascript")) {
				const script = document.createElement("script");
				script.src = url;
				document.head.appendChild(script);
			}
		}
	}).catch(() => {});
}
function init_src() {
	return (init_src = __esmMin((() => {
		init_environment();
		init_contextmenu();
		init_drag();
		init_appregion();
		init_application();
		init_browser();
		init_calls();
		init_clipboard();
		init_create();
		init_dialogs();
		init_events();
		/* @__PURE__ */ init_flags();
		init_screens();
		init_system();
		init_ios();
		init_android();
		init_updater();
		init_window();
		init_wml();
		init_stream();
		init_cancellable();
		init_runtime();
		init_main();
		if (hasDOM) window._wails = window._wails || {};
		if (hasDOM) {
			window._wails.invoke = invoke;
			window._wails.clientId = clientId;
		}
		if (hasDOM) window._wails.handlePlatformFileDrop = thisWindow.HandlePlatformFileDrop.bind(thisWindow);
		if (hasDOM) {
			window._wails.handleDragEnter = handleDragEnter;
			window._wails.handleDragLeave = handleDragLeave;
			window._wails.handleDragOver = handleDragOver;
		}
		if (hasDOM) invoke("wails:runtime:ready");
		if (hasDOM) loadOptionalScript("/wails/custom.js");
	})))();
}

init_src();
export { android_exports as Android, application_exports as Application, browser_exports as Browser, calls_exports as Call, CancelError, CancellablePromise, CancelledRejectionError, clipboard_exports as Clipboard, create_exports as Create, dialogs_exports as Dialogs, events_exports as Events, flags_exports as Flags, ios_exports as IOS, JSONStream, screens_exports as Screens, Stream, system_exports as System, updater_exports as Updater, wml_exports as WML, WailsSocket, thisWindow as Window, clientId, getTransport, loadOptionalScript, objectNames, setTransport };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5kZWJ1Zy5qcyIsIm5hbWVzIjpbIkNIVU5LX1RIUkVTSE9MRCIsImNhbGwiLCJjYWxsIiwiY2FsbCIsIkhpZGVNZXRob2QiLCJTaG93TWV0aG9kIiwiY2FsbCIsImlzQ2FsbGFibGUiLCJjYWxsIiwiY2FsbCIsIkFycmF5IiwiTWFwIiwiRXZlbnRzIiwiY2FsbCIsIkVycm9yIiwiQ3JlYXRlIiwiY2FsbCIsImNhbGwiLCJjYWxsIiwiRGV2aWNlSW5mbyIsIkhhcHRpY3MiLCJEZXZpY2UiLCJXaW5kb3ciLCJSdW50aW1lIiwiU3lzdGVtLmludm9rZSIsIldpbmRvdyJdLCJzb3VyY2VzIjpbIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9lbnZpcm9ubWVudC50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9uYW5vaWQudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvcnVudGltZS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9zeXN0ZW0udHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvdXRpbHMudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvY29udGV4dG1lbnUudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvZmxhZ3MudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvZHJhZy50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9hcHByZWdpb24udHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvYXBwbGljYXRpb24udHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvYnJvd3Nlci50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9jYWxsYWJsZS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9jYW5jZWxsYWJsZS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9jYWxscy50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9jbGlwYm9hcmQudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvY3JlYXRlLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2RpYWxvZ3MudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvbGlzdGVuZXIudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvZXZlbnRfdHlwZXMudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvZXZlbnRzLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL3NjcmVlbnMudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvaW9zLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2FuZHJvaWQudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvdXBkYXRlci50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy93aW5kb3cudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvd21sLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL3N0cmVhbS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9jb21waWxlZC9tYWluLmpzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiBfICAgICBfXyAgICAgXyBfX1xyXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbi8qKlxyXG4gKiBUcnVlIHdoZW4gcnVubmluZyBpbnNpZGUgYSBicm93c2VyL3dlYnZpZXcgd2l0aCBhIERPTSBhdmFpbGFibGUuXHJcbiAqIEZhbHNlIHVuZGVyIHNlcnZlci1zaWRlIHJlbmRlcmluZyAoZS5nLiBgbmV4dCBidWlsZGAgcHJlcmVuZGVyaW5nKSxcclxuICogd2hlcmUgYXBwbGljYXRpb24gY29kZSBtYXkgaW1wb3J0IHRoZSBydW50aW1lIG1vZHVsZSBldmVuIHRob3VnaCBub1xyXG4gKiBXYWlscyBBUElzIGNhbiBhY3R1YWxseSBiZSB1c2VkICgjNDY3OSkuIE1vZHVsZXMgbXVzdCBub3QgdG91Y2hcclxuICogYHdpbmRvd2AvYGRvY3VtZW50YCBhdCBpbXBvcnQgdGltZSBleGNlcHQgYmVoaW5kIHRoaXMgZ3VhcmQuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaGFzRE9NID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgZG9jdW1lbnQgIT09IFwidW5kZWZpbmVkXCI7XHJcbiIsIi8vIFNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL2FpL25hbm9pZFxyXG5cclxuLy8gVGhlIE1JVCBMaWNlbnNlIChNSVQpXHJcbi8vXHJcbi8vIENvcHlyaWdodCAyMDE3IEFuZHJleSBTaXRuaWsgPGFuZHJleUBzaXRuaWsucnU+XHJcbi8vXHJcbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2ZcclxuLy8gdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpblxyXG4vLyB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvXHJcbi8vIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mXHJcbi8vIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcclxuLy8gICAgIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4vL1xyXG4vLyAgICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbi8vIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbi8vXHJcbi8vICAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTXHJcbi8vIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUlxyXG4vLyBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVJcclxuLy8gSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU5cclxuLy8gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuXHJcbi8vIFRoaXMgYWxwaGFiZXQgdXNlcyBgQS1aYS16MC05Xy1gIHN5bWJvbHMuXHJcbi8vIFRoZSBvcmRlciBvZiBjaGFyYWN0ZXJzIGlzIG9wdGltaXplZCBmb3IgYmV0dGVyIGd6aXAgYW5kIGJyb3RsaSBjb21wcmVzc2lvbi5cclxuLy8gUmVmZXJlbmNlcyB0byB0aGUgc2FtZSBmaWxlICh3b3JrcyBib3RoIGZvciBnemlwIGFuZCBicm90bGkpOlxyXG4vLyBgJ3VzZWAsIGBhbmRvbWAsIGFuZCBgcmljdCdgXHJcbi8vIFJlZmVyZW5jZXMgdG8gdGhlIGJyb3RsaSBkZWZhdWx0IGRpY3Rpb25hcnk6XHJcbi8vIGAtMjZUYCwgYDE5ODNgLCBgNDBweGAsIGA3NXB4YCwgYGJ1c2hgLCBgamFja2AsIGBtaW5kYCwgYHZlcnlgLCBhbmQgYHdvbGZgXHJcbmNvbnN0IHVybEFscGhhYmV0ID1cclxuICAgICd1c2VhbmRvbS0yNlQxOTgzNDBQWDc1cHhKQUNLVkVSWU1JTkRCVVNIV09MRl9HUVpiZmdoamtscXZ3eXpyaWN0J1xyXG5cclxuLy8gTU9ESUZJRUQgRk9SIFdBSUxTOiB0aGUgdXBzdHJlYW0gaW1wbGVtZW50YXRpb24gZHJhd3MgZnJvbSBNYXRoLnJhbmRvbSgpLFxyXG4vLyB3aGljaCBpcyBub3QgYSBjcnlwdG9ncmFwaGljIHNvdXJjZS4gVGhlc2UgaWRzIGFyZSB1c2VkIGZvciB0aGUgcnVudGltZVxyXG4vLyBjbGllbnQgaWQsIGJpbmRpbmcgY2FsbCBpZHMsIGNodW5rIGlkcywgYW5kIGRlc2t0b3Agc3RyZWFtIHNlc3Npb24gaWRzLiBUaGV5XHJcbi8vIGFyZSBjb3JyZWxhdGlvbiBpZGVudGlmaWVycyByYXRoZXIgdGhhbiBhdXRoZW50aWNhdGlvbiBjYXBhYmlsaXRpZXMsIGJ1dCBhXHJcbi8vIHN0cm9uZ2VyIHNvdXJjZSBtYWtlcyBhY2NpZGVudGFsIGNvbGxpc2lvbnMgbmVnbGlnaWJsZSBldmVuIGFjcm9zcyBtYW55XHJcbi8vIGNvbmN1cnJlbnRseSBsb2FkZWQgcnVudGltZXMuIFRoZSBhbHBoYWJldCBpcyA2NCBjaGFyYWN0ZXJzLCBzbyBtYXNraW5nIGFcclxuLy8gcmFuZG9tIGJ5dGUgd2l0aCA2MyBpcyB1bmlmb3JtIOKAlCBubyByZWplY3Rpb24gc2FtcGxpbmcgbmVlZGVkLlxyXG5leHBvcnQgZnVuY3Rpb24gbmFub2lkKHNpemU6IG51bWJlciA9IDIxKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHNvdXJjZSA9IHR5cGVvZiBjcnlwdG8gIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICAgID8gY3J5cHRvXHJcbiAgICAgICAgOiBudWxsO1xyXG5cclxuICAgIGlmIChzb3VyY2UpIHtcclxuICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KHNpemUpO1xyXG4gICAgICAgIHNvdXJjZS5nZXRSYW5kb21WYWx1ZXMoYnl0ZXMpO1xyXG4gICAgICAgIGxldCBpZCA9ICcnO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlkICs9IHVybEFscGhhYmV0W2J5dGVzW2ldICYgNjNdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmFsbGJhY2sgZm9yIGVudmlyb25tZW50cyB3aXRob3V0IFdlYiBDcnlwdG8gKHZlcnkgb2xkIGVuZ2luZXMsIHNvbWVcclxuICAgIC8vIHNlcnZlci1zaWRlIHJlbmRlcmluZyBjb250ZXh0cykuIElkcyByZW1haW4gdW5pcXVlIGJ1dCBub3QgdW5ndWVzc2FibGUuXHJcbiAgICBsZXQgaWQgPSAnJztcclxuICAgIGxldCBpID0gc2l6ZSB8IDA7XHJcbiAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgaWQgKz0gdXJsQWxwaGFiZXRbKE1hdGgucmFuZG9tKCkgKiA2NCkgfCAwXTtcclxuICAgIH1cclxuICAgIHJldHVybiBpZDtcclxufVxyXG4iLCIvKlxyXG4gXyAgICAgX18gICAgIF8gX19cclxufCB8ICAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBuYW5vaWQgfSBmcm9tIFwiLi9uYW5vaWQuanNcIjtcclxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcclxuXHJcbi8vIFJlc29sdmVkIGxhemlseTogd2luZG93IGRvZXMgbm90IGV4aXN0IHdoZW4gdGhlIG1vZHVsZSBpcyBpbXBvcnRlZCBkdXJpbmdcclxuLy8gc2VydmVyLXNpZGUgcmVuZGVyaW5nICgjNDY3OSksIGFuZCBub3RoaW5nIGNhbiBjYWxsIHRoZSBydW50aW1lIHRoZXJlLlxyXG5mdW5jdGlvbiBydW50aW1lVVJMKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIFwiL3dhaWxzL3J1bnRpbWVcIjtcclxufVxyXG5cclxuLy8gU3RheSB1bmRlciBXZWJWaWV3MidzIH4yTUIgcmVxdWVzdCBib2R5IGJ1ZmZlcmluZyBsaW1pdCBpbiBXZWJSZXNvdXJjZVJlcXVlc3RlZC5cclxuY29uc3QgQ0hVTktfVEhSRVNIT0xEID0gNTEyICogMTAyNDtcclxuXHJcbi8vIFJlLWV4cG9ydCBuYW5vaWQgZm9yIGN1c3RvbSB0cmFuc3BvcnQgaW1wbGVtZW50YXRpb25zXHJcbmV4cG9ydCB7IG5hbm9pZCB9O1xyXG5cclxudHlwZSBDYWxsRXJyb3JUeXBlID0ge1xyXG4gICAgbWVzc2FnZTogc3RyaW5nLFxyXG4gICAgY2F1c2U/OiB1bmtub3duLFxyXG4gICAga2luZDogXCJSZWZlcmVuY2VFcnJvclwiIHwgXCJUeXBlRXJyb3JcIiB8IFwiUnVudGltZUVycm9yXCJcclxufVxyXG5cclxuLyoqXHJcbiAqIEV4Y2VwdGlvbiBjbGFzcyB0aGF0IHdpbGwgYmUgdGhyb3duIGluIGNhc2UgdGhlIGJvdW5kIG1ldGhvZCByZXR1cm5zIGFuIGVycm9yLlxyXG4gKiBUaGUgdmFsdWUgb2YgdGhlIHtAbGluayBSdW50aW1lRXJyb3IjbmFtZX0gcHJvcGVydHkgaXMgXCJSdW50aW1lRXJyb3JcIi5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBSdW50aW1lRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgUnVudGltZUVycm9yIGluc3RhbmNlLlxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgZXJyb3IgbWVzc2FnZS5cclxuICAgICAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyB0byBiZSBmb3J3YXJkZWQgdG8gdGhlIEVycm9yIGNvbnN0cnVjdG9yLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBvcHRpb25zPzogRXJyb3JPcHRpb25zKSB7XHJcbiAgICAgICAgc3VwZXIobWVzc2FnZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJSdW50aW1lRXJyb3JcIjtcclxuICAgIH1cclxufVxyXG5cclxuLy8gT2JqZWN0IE5hbWVzXHJcbmV4cG9ydCBjb25zdCBvYmplY3ROYW1lcyA9IE9iamVjdC5mcmVlemUoe1xyXG4gICAgQ2FsbDogMCxcclxuICAgIENsaXBib2FyZDogMSxcclxuICAgIEFwcGxpY2F0aW9uOiAyLFxyXG4gICAgRXZlbnRzOiAzLFxyXG4gICAgQ29udGV4dE1lbnU6IDQsXHJcbiAgICBEaWFsb2c6IDUsXHJcbiAgICBXaW5kb3c6IDYsXHJcbiAgICBTY3JlZW5zOiA3LFxyXG4gICAgU3lzdGVtOiA4LFxyXG4gICAgQnJvd3NlcjogOSxcclxuICAgIENhbmNlbENhbGw6IDEwLFxyXG4gICAgSU9TOiAxMSxcclxuICAgIEFuZHJvaWQ6IDEyLFxyXG59KTtcclxuZXhwb3J0IGxldCBjbGllbnRJZCA9IG5hbm9pZCgpO1xyXG5cclxuLyoqXHJcbiAqIFJ1bnRpbWVUcmFuc3BvcnQgZGVmaW5lcyB0aGUgaW50ZXJmYWNlIGZvciBjdXN0b20gSVBDIHRyYW5zcG9ydCBpbXBsZW1lbnRhdGlvbnMuXHJcbiAqIEltcGxlbWVudCB0aGlzIGludGVyZmFjZSB0byB1c2UgV2ViU29ja2V0cywgY3VzdG9tIHByb3RvY29scywgb3IgYW55IG90aGVyXHJcbiAqIHRyYW5zcG9ydCBtZWNoYW5pc20gaW5zdGVhZCBvZiB0aGUgZGVmYXVsdCBIVFRQIGZldGNoLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBSdW50aW1lVHJhbnNwb3J0IHtcclxuICAgIC8qKlxyXG4gICAgICogU2VuZCBhIHJ1bnRpbWUgY2FsbCBhbmQgcmV0dXJuIHRoZSByZXNwb25zZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gb2JqZWN0SUQgLSBUaGUgV2FpbHMgb2JqZWN0IElEICgwPUNhbGwsIDE9Q2xpcGJvYXJkLCBldGMuKVxyXG4gICAgICogQHBhcmFtIG1ldGhvZCAtIFRoZSBtZXRob2QgSUQgdG8gY2FsbFxyXG4gICAgICogQHBhcmFtIHdpbmRvd05hbWUgLSBPcHRpb25hbCB3aW5kb3cgbmFtZVxyXG4gICAgICogQHBhcmFtIGFyZ3MgLSBBcmd1bWVudHMgdG8gcGFzcyAod2lsbCBiZSBKU09OIHN0cmluZ2lmaWVkIGlmIHByZXNlbnQpXHJcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcmVzcG9uc2UgZGF0YVxyXG4gICAgICovXHJcbiAgICBjYWxsKG9iamVjdElEOiBudW1iZXIsIG1ldGhvZDogbnVtYmVyLCB3aW5kb3dOYW1lOiBzdHJpbmcsIGFyZ3M6IGFueSk6IFByb21pc2U8YW55PjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEN1c3RvbSB0cmFuc3BvcnQgaW1wbGVtZW50YXRpb24gKGNhbiBiZSBzZXQgYnkgdXNlcilcclxuICovXHJcbmxldCBjdXN0b21UcmFuc3BvcnQ6IFJ1bnRpbWVUcmFuc3BvcnQgfCBudWxsID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBTZXQgYSBjdXN0b20gdHJhbnNwb3J0IGZvciBhbGwgV2FpbHMgcnVudGltZSBjYWxscy5cclxuICogVGhpcyBhbGxvd3MgeW91IHRvIHJlcGxhY2UgdGhlIGRlZmF1bHQgSFRUUCBmZXRjaCB0cmFuc3BvcnQgd2l0aFxyXG4gKiBXZWJTb2NrZXRzLCBjdXN0b20gcHJvdG9jb2xzLCBvciBhbnkgb3RoZXIgbWVjaGFuaXNtLlxyXG4gKlxyXG4gKiBAcGFyYW0gdHJhbnNwb3J0IC0gWW91ciBjdXN0b20gdHJhbnNwb3J0IGltcGxlbWVudGF0aW9uXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGBgYHR5cGVzY3JpcHRcclxuICogaW1wb3J0IHsgc2V0VHJhbnNwb3J0IH0gZnJvbSAnL3dhaWxzL3J1bnRpbWUuanMnO1xyXG4gKlxyXG4gKiBjb25zdCB3c1RyYW5zcG9ydCA9IHtcclxuICogICBjYWxsOiBhc3luYyAob2JqZWN0SUQsIG1ldGhvZCwgd2luZG93TmFtZSwgYXJncykgPT4ge1xyXG4gKiAgICAgLy8gWW91ciBXZWJTb2NrZXQgaW1wbGVtZW50YXRpb25cclxuICogICB9XHJcbiAqIH07XHJcbiAqXHJcbiAqIHNldFRyYW5zcG9ydCh3c1RyYW5zcG9ydCk7XHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFRyYW5zcG9ydCh0cmFuc3BvcnQ6IFJ1bnRpbWVUcmFuc3BvcnQgfCBudWxsKTogdm9pZCB7XHJcbiAgICBjdXN0b21UcmFuc3BvcnQgPSB0cmFuc3BvcnQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGN1cnJlbnQgdHJhbnNwb3J0ICh1c2VmdWwgZm9yIGV4dGVuZGluZy93cmFwcGluZylcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc3BvcnQoKTogUnVudGltZVRyYW5zcG9ydCB8IG51bGwge1xyXG4gICAgcmV0dXJuIGN1c3RvbVRyYW5zcG9ydDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgcnVudGltZSBjYWxsZXIgd2l0aCBzcGVjaWZpZWQgSUQuXHJcbiAqXHJcbiAqIEBwYXJhbSBvYmplY3QgLSBUaGUgb2JqZWN0IHRvIGludm9rZSB0aGUgbWV0aG9kIG9uLlxyXG4gKiBAcGFyYW0gd2luZG93TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB3aW5kb3cuXHJcbiAqIEByZXR1cm4gVGhlIG5ldyBydW50aW1lIGNhbGxlciBmdW5jdGlvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdDogbnVtYmVyLCB3aW5kb3dOYW1lOiBzdHJpbmcgPSAnJykge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtZXRob2Q6IG51bWJlciwgYXJnczogYW55ID0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBydW50aW1lQ2FsbFdpdGhJRChvYmplY3QsIG1ldGhvZCwgd2luZG93TmFtZSwgYXJncyk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBydW50aW1lQ2FsbFdpdGhJRChvYmplY3RJRDogbnVtYmVyLCBtZXRob2Q6IG51bWJlciwgd2luZG93TmFtZTogc3RyaW5nLCBhcmdzOiBhbnkpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgLy8gVXNlIGN1c3RvbSB0cmFuc3BvcnQgaWYgYXZhaWxhYmxlXHJcbiAgICBpZiAoY3VzdG9tVHJhbnNwb3J0KSB7XHJcbiAgICAgICAgcmV0dXJuIGN1c3RvbVRyYW5zcG9ydC5jYWxsKG9iamVjdElELCBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERlZmF1bHQgSFRUUCBmZXRjaCB0cmFuc3BvcnRcclxuICAgIGxldCB1cmwgPSBuZXcgVVJMKHJ1bnRpbWVVUkwoKSk7XHJcblxyXG4gICAgbGV0IGJvZHk6IHsgb2JqZWN0OiBudW1iZXI7IG1ldGhvZDogbnVtYmVyLCBhcmdzPzogYW55IH0gPSB7XHJcbiAgICAgIG9iamVjdDogb2JqZWN0SUQsXHJcbiAgICAgIG1ldGhvZFxyXG4gICAgfVxyXG4gICAgaWYgKGFyZ3MgIT09IG51bGwgJiYgYXJncyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGJvZHkuYXJncyA9IGFyZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgW1wieC13YWlscy1jbGllbnQtaWRcIl06IGNsaWVudElkLFxyXG4gICAgICAgIFtcIkNvbnRlbnQtVHlwZVwiXTogXCJhcHBsaWNhdGlvbi9qc29uXCJcclxuICAgIH1cclxuICAgIGlmICh3aW5kb3dOYW1lKSB7XHJcbiAgICAgICAgaGVhZGVyc1tcIngtd2FpbHMtd2luZG93LW5hbWVcIl0gPSB3aW5kb3dOYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJvZHlTdHIgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcclxuICAgIGxldCByZXNwb25zZTogUmVzcG9uc2U7XHJcbiAgICBpZiAoYm9keVN0ci5sZW5ndGggPiBDSFVOS19USFJFU0hPTEQpIHtcclxuICAgICAgICByZXNwb25zZSA9IGF3YWl0IHNlbmRDaHVua2VkKHVybCwgaGVhZGVycywgYm9keVN0cik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IG1ldGhvZDogJ1BPU1QnLCBoZWFkZXJzLCBib2R5OiBib2R5U3RyIH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICBjb25zdCBjdCA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpO1xyXG4gICAgICBpZiAoY3Q/LmluY2x1ZGVzKFwiYXBwbGljYXRpb24vanNvblwiKSkge1xyXG4gICAgICAgICAgY29uc3QganNvbjogQ2FsbEVycm9yVHlwZSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgIGxldCBlcnI7XHJcbiAgICAgICAgICBzd2l0Y2ggKGpzb24ua2luZCkge1xyXG4gICAgICAgICAgICAgIGNhc2UgXCJSZWZlcmVuY2VFcnJvclwiOiBlcnIgPSBuZXcgUmVmZXJlbmNlRXJyb3IoanNvbi5tZXNzYWdlKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgY2FzZSBcIlR5cGVFcnJvclwiOiAgICAgIGVyciA9IG5ldyBUeXBlRXJyb3IoanNvbi5tZXNzYWdlKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgY2FzZSBcIlJ1bnRpbWVFcnJvclwiOiAgIGVyciA9IG5ldyBSdW50aW1lRXJyb3IoanNvbi5tZXNzYWdlKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgZGVmYXVsdDogICAgICAgICAgICAgICBlcnIgPSBuZXcgRXJyb3IoanNvbi5tZXNzYWdlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVyci5jYXVzZSA9IGpzb24uY2F1c2U7XHJcbiAgICAgICAgICB0aHJvdyBlcnJcclxuICAgICAgfVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYXdhaXQgcmVzcG9uc2UudGV4dCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpPy5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSA/PyAtMSkgIT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gc2VuZENodW5rZWQgc3BsaXRzIGEgbGFyZ2Ugc2VyaWFsaXNlZCByZXF1ZXN0IGJvZHkgaW50byBDSFVOS19USFJFU0hPTEQtc2l6ZWRcclxuLy8gYnl0ZSBjaHVua3MgYW5kIHNlbmRzIHRoZW0gc2VyaWFsbHkuICBFbmNvZGluZyB0byBVVEYtOCBieXRlcyBiZWZvcmUgc2xpY2luZ1xyXG4vLyBwcmV2ZW50cyBjb3JydXB0aW9uIG9mIG5vbi1CTVAgY2hhcmFjdGVycyAoc3Vycm9nYXRlIHBhaXJzKSB0aGF0IHdvdWxkIG9jY3VyXHJcbi8vIHdoZW4gc3BsaXR0aW5nIGF0IEphdmFTY3JpcHQgc3RyaW5nIGluZGljZXMuICBUaGUgR28gdHJhbnNwb3J0IGFzc2VtYmxlcyB0aGVcclxuLy8gcmF3IGJ5dGVzIGJlZm9yZSBwcm9jZXNzaW5nLiAgT25seSB0aGUgZmluYWwgY2h1bmsncyByZXNwb25zZSBjYXJyaWVzIHRoZSBSUEMgcmVzdWx0LlxyXG5hc3luYyBmdW5jdGlvbiBzZW5kQ2h1bmtlZCh1cmw6IFVSTCwgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiwgYm9keVN0cjogc3RyaW5nKTogUHJvbWlzZTxSZXNwb25zZT4ge1xyXG4gICAgY29uc3QgY2h1bmtJZCA9IG5hbm9pZCgpO1xyXG4gICAgY29uc3QgYm9keUJ5dGVzID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGJvZHlTdHIpO1xyXG4gICAgY29uc3QgdG90YWxDaHVua3MgPSBNYXRoLmNlaWwoYm9keUJ5dGVzLmxlbmd0aCAvIENIVU5LX1RIUkVTSE9MRCk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3RhbENodW5rcyAtIDE7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGNodW5rID0gYm9keUJ5dGVzLnN1YmFycmF5KGkgKiBDSFVOS19USFJFU0hPTEQsIChpICsgMSkgKiBDSFVOS19USFJFU0hPTEQpO1xyXG4gICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaCh1cmwsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgIC4uLmhlYWRlcnMsXHJcbiAgICAgICAgICAgICAgICAneC13YWlscy1jaHVuay1pZCc6IGNodW5rSWQsXHJcbiAgICAgICAgICAgICAgICAneC13YWlscy1jaHVuay1pbmRleCc6IFN0cmluZyhpKSxcclxuICAgICAgICAgICAgICAgICd4LXdhaWxzLWNodW5rLXRvdGFsJzogU3RyaW5nKHRvdGFsQ2h1bmtzKSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYm9keTogY2h1bmssXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCFyZXNwLm9rKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihhd2FpdCByZXNwLnRleHQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgIC4uLmhlYWRlcnMsXHJcbiAgICAgICAgICAgICd4LXdhaWxzLWNodW5rLWlkJzogY2h1bmtJZCxcclxuICAgICAgICAgICAgJ3gtd2FpbHMtY2h1bmstaW5kZXgnOiBTdHJpbmcodG90YWxDaHVua3MgLSAxKSxcclxuICAgICAgICAgICAgJ3gtd2FpbHMtY2h1bmstdG90YWwnOiBTdHJpbmcodG90YWxDaHVua3MpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogYm9keUJ5dGVzLnN1YmFycmF5KCh0b3RhbENodW5rcyAtIDEpICogQ0hVTktfVEhSRVNIT0xEKSxcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogQW5kcm9pZCBXZWJWaWV3IGNhbm5vdCBkZWxpdmVyIGZldGNoKCkgUE9TVCBib2RpZXMgdG9cclxuICogc2hvdWxkSW50ZXJjZXB0UmVxdWVzdCwgc28gdGhlIGRlZmF1bHQgSFRUUCB0cmFuc3BvcnQgY2Fubm90IHJlYWNoIEdvLlxyXG4gKiBXaGVuIHRoZSBBbmRyb2lkIEphdmFzY3JpcHRJbnRlcmZhY2UgYnJpZGdlICh3aW5kb3cud2FpbHMpIGlzIHByZXNlbnQsXHJcbiAqIHJvdXRlIHJ1bnRpbWUgY2FsbHMgdGhyb3VnaCBpdCBpbnN0ZWFkLiBSZXNwb25zZXMgYXJyaXZlIHZpYVxyXG4gKiB3aW5kb3cuX3dhaWxzQW5kcm9pZENhbGxiYWNrLCBpbnZva2VkIGJ5IHRoZSBKYXZhIHNpZGUuXHJcbiAqL1xyXG5pbnRlcmZhY2UgQW5kcm9pZEpTQnJpZGdlIHtcclxuICAgIGludm9rZUFzeW5jKGNhbGxiYWNrSUQ6IHN0cmluZywgcGF5bG9hZDogc3RyaW5nKTogdm9pZDtcclxufVxyXG5cclxuY29uc3QgYW5kcm9pZEJyaWRnZTogQW5kcm9pZEpTQnJpZGdlIHwgbnVsbCA9IGhhc0RPTSAmJlxyXG4gICAgdHlwZW9mICh3aW5kb3cgYXMgYW55KS53YWlscz8uaW52b2tlQXN5bmMgPT09IFwiZnVuY3Rpb25cIiA/ICh3aW5kb3cgYXMgYW55KS53YWlscyA6IG51bGw7XHJcblxyXG5pZiAoYW5kcm9pZEJyaWRnZSkge1xyXG4gICAgY29uc3QgcGVuZGluZyA9IG5ldyBNYXA8c3RyaW5nLCB7IHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkOyByZWplY3Q6IChyZWFzb246IGFueSkgPT4gdm9pZCB9PigpO1xyXG5cclxuICAgICh3aW5kb3cgYXMgYW55KS5fd2FpbHNBbmRyb2lkQ2FsbGJhY2sgPSAoaWQ6IHN0cmluZywgcmVzcG9uc2U6IHN0cmluZyB8IG51bGwsIGVycm9yOiBzdHJpbmcgfCBudWxsKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHBlbmRpbmcuZ2V0KGlkKTtcclxuICAgICAgICBpZiAoIXByb21pc2UpIHJldHVybjtcclxuICAgICAgICBwZW5kaW5nLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KG5ldyBFcnJvcihlcnJvcikpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVudmVsb3BlID0gSlNPTi5wYXJzZShyZXNwb25zZSA/PyBcInt9XCIpO1xyXG4gICAgICAgICAgICBpZiAoIWVudmVsb3BlLm9rKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZW52ZWxvcGUuZXJyb3IgPz8gXCJ1bmtub3duIHJ1bnRpbWUgY2FsbCBlcnJvclwiKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKFwidGV4dFwiIGluIGVudmVsb3BlID8gZW52ZWxvcGUudGV4dCA6IGVudmVsb3BlLmRhdGEpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjdXN0b21UcmFuc3BvcnQgPSB7XHJcbiAgICAgICAgY2FsbChvYmplY3RJRDogbnVtYmVyLCBtZXRob2Q6IG51bWJlciwgd2luZG93TmFtZTogc3RyaW5nLCBhcmdzOiBhbnkpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBuYW5vaWQoKTtcclxuICAgICAgICAgICAgICAgIHBlbmRpbmcuc2V0KGlkLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5kcm9pZEJyaWRnZS5pbnZva2VBc3luYyhpZCwgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IG9iamVjdElELFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93TmFtZTogd2luZG93TmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogYXJncyA/PyBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogY2xpZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IGxlYWsgdGhlIHBlbmRpbmcgZW50cnkgaWYgZGlzcGF0Y2ggdGhyb3dzIHN5bmNocm9ub3VzbHlcclxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxufVxyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuXHJcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLlN5c3RlbSk7XHJcblxyXG5jb25zdCBTeXN0ZW1Jc0RhcmtNb2RlID0gMDtcclxuY29uc3QgU3lzdGVtRW52aXJvbm1lbnQgPSAxO1xyXG5jb25zdCBTeXN0ZW1DYXBhYmlsaXRpZXMgPSAyO1xyXG5cclxuY29uc3QgX2ludm9rZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIFdpbmRvd3MgV2ViVmlldzJcclxuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLmNocm9tZT8ud2Vidmlldz8ucG9zdE1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5jaHJvbWUud2Vidmlldy5wb3N0TWVzc2FnZS5iaW5kKCh3aW5kb3cgYXMgYW55KS5jaHJvbWUud2Vidmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG1hY09TL2lPUyBXS1dlYlZpZXdcclxuICAgICAgICBlbHNlIGlmICgod2luZG93IGFzIGFueSkud2Via2l0Py5tZXNzYWdlSGFuZGxlcnM/LlsnZXh0ZXJuYWwnXT8ucG9zdE1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS53ZWJraXQubWVzc2FnZUhhbmRsZXJzWydleHRlcm5hbCddLnBvc3RNZXNzYWdlLmJpbmQoKHdpbmRvdyBhcyBhbnkpLndlYmtpdC5tZXNzYWdlSGFuZGxlcnNbJ2V4dGVybmFsJ10pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBbmRyb2lkIFdlYlZpZXcgLSB1c2VzIGFkZEphdmFzY3JpcHRJbnRlcmZhY2Ugd2hpY2ggZXhwb3NlcyB3aW5kb3cud2FpbHMuaW52b2tlXHJcbiAgICAgICAgZWxzZSBpZiAoKHdpbmRvdyBhcyBhbnkpLndhaWxzPy5pbnZva2UpIHtcclxuICAgICAgICAgICAgY29uc3QgYnJpZGdlID0gKHdpbmRvdyBhcyBhbnkpLndhaWxzO1xyXG4gICAgICAgICAgICByZXR1cm4gKG1zZzogYW55KSA9PiBicmlkZ2UuaW52b2tlKHR5cGVvZiBtc2cgPT09ICdzdHJpbmcnID8gbXNnIDogSlNPTi5zdHJpbmdpZnkobXNnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaChlKSB7fVxyXG5cclxuICAgIGNvbnNvbGUud2FybignXFxuJWPimqDvuI8gQnJvd3NlciBFbnZpcm9ubWVudCBEZXRlY3RlZCAlY1xcblxcbiVjT25seSBVSSBwcmV2aWV3cyBhcmUgYXZhaWxhYmxlIGluIHRoZSBicm93c2VyLiBGb3IgZnVsbCBmdW5jdGlvbmFsaXR5LCBwbGVhc2UgcnVuIHRoZSBhcHBsaWNhdGlvbiBpbiBkZXNrdG9wIG1vZGUuXFxuTW9yZSBpbmZvcm1hdGlvbiBhdDogaHR0cHM6Ly92My53YWlscy5pby9sZWFybi9idWlsZC8jdXNpbmctYS1icm93c2VyLWZvci1kZXZlbG9wbWVudFxcbicsXHJcbiAgICAgICAgJ2JhY2tncm91bmQ6ICNmZmZmZmY7IGNvbG9yOiAjMDAwMDAwOyBmb250LXdlaWdodDogYm9sZDsgcGFkZGluZzogNHB4IDhweDsgYm9yZGVyLXJhZGl1czogNHB4OyBib3JkZXI6IDJweCBzb2xpZCAjMDAwMDAwOycsXHJcbiAgICAgICAgJ2JhY2tncm91bmQ6IHRyYW5zcGFyZW50OycsXHJcbiAgICAgICAgJ2NvbG9yOiAjZmZmZmZmOyBmb250LXN0eWxlOiBpdGFsaWM7IGZvbnQtd2VpZ2h0OiBib2xkOycpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbn0pKCk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlKG1zZzogYW55KTogdm9pZCB7XHJcbiAgICBfaW52b2tlPy4obXNnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHJpZXZlcyB0aGUgc3lzdGVtIGRhcmsgbW9kZSBzdGF0dXMuXHJcbiAqXHJcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIGlmIHRoZSBzeXN0ZW0gaXMgaW4gZGFyayBtb2RlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIElzRGFya01vZGUoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gY2FsbChTeXN0ZW1Jc0RhcmtNb2RlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoZXMgdGhlIGNhcGFiaWxpdGllcyBvZiB0aGUgYXBwbGljYXRpb24gZnJvbSB0aGUgc2VydmVyLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgY2FwYWJpbGl0aWVzLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIENhcGFiaWxpdGllcygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcclxuICAgIHJldHVybiBjYWxsKFN5c3RlbUNhcGFiaWxpdGllcyk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT1NJbmZvIHtcclxuICAgIC8qKiBUaGUgYnJhbmRpbmcgb2YgdGhlIE9TLiAqL1xyXG4gICAgQnJhbmRpbmc6IHN0cmluZztcclxuICAgIC8qKiBUaGUgSUQgb2YgdGhlIE9TLiAqL1xyXG4gICAgSUQ6IHN0cmluZztcclxuICAgIC8qKiBUaGUgbmFtZSBvZiB0aGUgT1MuICovXHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICAvKiogVGhlIHZlcnNpb24gb2YgdGhlIE9TLiAqL1xyXG4gICAgVmVyc2lvbjogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVudmlyb25tZW50SW5mbyB7XHJcbiAgICAvKiogVGhlIGFyY2hpdGVjdHVyZSBvZiB0aGUgc3lzdGVtLiAqL1xyXG4gICAgQXJjaDogc3RyaW5nO1xyXG4gICAgLyoqIFRydWUgaWYgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gZGVidWcgbW9kZSwgb3RoZXJ3aXNlIGZhbHNlLiAqL1xyXG4gICAgRGVidWc6IGJvb2xlYW47XHJcbiAgICAvKiogVGhlIG9wZXJhdGluZyBzeXN0ZW0gaW4gdXNlLiAqL1xyXG4gICAgT1M6IHN0cmluZztcclxuICAgIC8qKiBEZXRhaWxzIG9mIHRoZSBvcGVyYXRpbmcgc3lzdGVtLiAqL1xyXG4gICAgT1NJbmZvOiBPU0luZm87XHJcbiAgICAvKiogQWRkaXRpb25hbCBwbGF0Zm9ybSBpbmZvcm1hdGlvbi4gKi9cclxuICAgIFBsYXRmb3JtSW5mbzogUmVjb3JkPHN0cmluZywgYW55PjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHJpZXZlcyBlbnZpcm9ubWVudCBkZXRhaWxzLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3QgY29udGFpbmluZyBPUyBhbmQgc3lzdGVtIGFyY2hpdGVjdHVyZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBFbnZpcm9ubWVudCgpOiBQcm9taXNlPEVudmlyb25tZW50SW5mbz4ge1xyXG4gICAgcmV0dXJuIGNhbGwoU3lzdGVtRW52aXJvbm1lbnQpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgV2luZG93cy5cclxuICpcclxuICogQHJldHVybiBUcnVlIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlzIFdpbmRvd3MsIG90aGVyd2lzZSBmYWxzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBJc1dpbmRvd3MoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZW52aXJvbm1lbnQ/Lk9TID09PSBcIndpbmRvd3NcIjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIExpbnV4LlxyXG4gKlxyXG4gKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBMaW51eCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIElzTGludXgoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZW52aXJvbm1lbnQ/Lk9TID09PSBcImxpbnV4XCI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgYSBtYWNPUyBvcGVyYXRpbmcgc3lzdGVtLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBlbnZpcm9ubWVudCBpcyBtYWNPUywgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIElzTWFjKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmVudmlyb25tZW50Py5PUyA9PT0gXCJkYXJ3aW5cIjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIGlPUy5cclxuICpcclxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgb3BlcmF0aW5nIHN5c3RlbSBpcyBpT1MsIG90aGVyd2lzZSBmYWxzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBJc0lPUygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uT1MgPT09IFwiaW9zXCI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBBbmRyb2lkLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlzIEFuZHJvaWQsIG90aGVyd2lzZSBmYWxzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBJc0FuZHJvaWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZW52aXJvbm1lbnQ/Lk9TID09PSBcImFuZHJvaWRcIjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiB0aGUgYXBwIGlzIHJ1bm5pbmcgb24gYSBtb2JpbGUgT1MgKGlPUyBvciBBbmRyb2lkKS5cclxuICpcclxuICogQHJldHVybnMgVHJ1ZSBvbiBpT1Mgb3IgQW5kcm9pZCwgb3RoZXJ3aXNlIGZhbHNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIElzTW9iaWxlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIElzSU9TKCkgfHwgSXNBbmRyb2lkKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgdGhlIGFwcCBpcyBydW5uaW5nIG9uIGEgZGVza3RvcCBPUyAobWFjT1MsIFdpbmRvd3Mgb3IgTGludXgpLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBUcnVlIG9uIG1hY09TLCBXaW5kb3dzIG9yIExpbnV4LCBvdGhlcndpc2UgZmFsc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSXNEZXNrdG9wKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIElzTWFjKCkgfHwgSXNXaW5kb3dzKCkgfHwgSXNMaW51eCgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGFyY2hpdGVjdHVyZSBpcyBBTUQ2NC5cclxuICpcclxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQsIGZhbHNlIG90aGVyd2lzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBJc0FNRDY0KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmVudmlyb25tZW50Py5BcmNoID09PSBcImFtZDY0XCI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgYXJjaGl0ZWN0dXJlIGlzIEFSTS5cclxuICpcclxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY3VycmVudCBhcmNoaXRlY3R1cmUgaXMgQVJNLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSXNBUk0oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZW52aXJvbm1lbnQ/LkFyY2ggPT09IFwiYXJtXCI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgQVJNNjQgYXJjaGl0ZWN0dXJlLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSXNBUk02NCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uQXJjaCA9PT0gXCJhcm02NFwiO1xyXG59XHJcblxyXG4vKipcclxuICogUmVwb3J0cyB3aGV0aGVyIHRoZSBhcHAgaXMgYmVpbmcgcnVuIGluIGRlYnVnIG1vZGUuXHJcbiAqXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGFwcCBpcyBiZWluZyBydW4gaW4gZGVidWcgbW9kZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBJc0RlYnVnKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIEJvb2xlYW4oKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZW52aXJvbm1lbnQ/LkRlYnVnKTtcclxufVxyXG5cclxuIiwiLypcclxuIF8gICAgIF9fICAgICBfIF9fXHJcbnwgfCAgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuLyoqXHJcbiAqIExvZ3MgYSBtZXNzYWdlIHRvIHRoZSBjb25zb2xlIHdpdGggY3VzdG9tIGZvcm1hdHRpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gYmUgbG9nZ2VkLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnTG9nKG1lc3NhZ2U6IGFueSkge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXHJcbiAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAnJWMgd2FpbHMzICVjICcgKyBtZXNzYWdlICsgJyAnLFxyXG4gICAgICAgICdiYWNrZ3JvdW5kOiAjYWEwMDAwOyBjb2xvcjogI2ZmZjsgYm9yZGVyLXJhZGl1czogM3B4IDBweCAwcHggM3B4OyBwYWRkaW5nOiAxcHg7IGZvbnQtc2l6ZTogMC43cmVtJyxcclxuICAgICAgICAnYmFja2dyb3VuZDogIzAwOTkwMDsgY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDBweCAzcHggM3B4IDBweDsgcGFkZGluZzogMXB4OyBmb250LXNpemU6IDAuN3JlbSdcclxuICAgICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgd2VidmlldyBzdXBwb3J0cyB0aGUge0BsaW5rIE1vdXNlRXZlbnQjYnV0dG9uc30gcHJvcGVydHkuXHJcbiAqIExvb2tpbmcgYXQgeW91IG1hY09TIEhpZ2ggU2llcnJhIVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNhblRyYWNrQnV0dG9ucygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAobmV3IE1vdXNlRXZlbnQoJ21vdXNlZG93bicpKS5idXR0b25zID09PSAwO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGJyb3dzZXIgc3VwcG9ydHMgcmVtb3ZpbmcgbGlzdGVuZXJzIGJ5IHRyaWdnZXJpbmcgYW4gQWJvcnRTaWduYWxcclxuICogKHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRXZlbnRUYXJnZXQvYWRkRXZlbnRMaXN0ZW5lciNzaWduYWwpLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNhbkFib3J0TGlzdGVuZXJzKCkge1xyXG4gICAgaWYgKCFFdmVudFRhcmdldCB8fCAhQWJvcnRTaWduYWwgfHwgIUFib3J0Q29udHJvbGxlcilcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgY29uc3QgdGFyZ2V0ID0gbmV3IEV2ZW50VGFyZ2V0KCk7XHJcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCAoKSA9PiB7IHJlc3VsdCA9IGZhbHNlOyB9LCB7IHNpZ25hbDogY29udHJvbGxlci5zaWduYWwgfSk7XHJcbiAgICBjb250cm9sbGVyLmFib3J0KCk7XHJcbiAgICB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3Rlc3QnKSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlc29sdmVzIHRoZSBjbG9zZXN0IEhUTUxFbGVtZW50IGFuY2VzdG9yIG9mIGFuIGV2ZW50J3MgdGFyZ2V0LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50VGFyZ2V0KGV2ZW50OiBFdmVudCk6IEhUTUxFbGVtZW50IHtcclxuICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiBldmVudC50YXJnZXQ7XHJcbiAgICB9IGVsc2UgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpICYmIGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcclxuICAgICAgICByZXR1cm4gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQgPz8gZG9jdW1lbnQuYm9keTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmJvZHk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKipcclxuIFRoaXMgdGVjaG5pcXVlIGZvciBwcm9wZXIgbG9hZCBkZXRlY3Rpb24gaXMgdGFrZW4gZnJvbSBIVE1YOlxyXG5cclxuIEJTRCAyLUNsYXVzZSBMaWNlbnNlXHJcblxyXG4gQ29weXJpZ2h0IChjKSAyMDIwLCBCaWcgU2t5IFNvZnR3YXJlXHJcbiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxyXG4gbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XHJcblxyXG4gMS4gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXHJcbiBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuXHJcbiAyLiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXHJcbiB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXHJcbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cclxuXHJcbiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxyXG4gQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRVxyXG4gSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXHJcbiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFXHJcbiBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTFxyXG4gREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1JcclxuIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSXHJcbiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLFxyXG4gT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcclxuIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXHJcblxyXG4gKioqL1xyXG5cclxubGV0IGlzUmVhZHkgPSBmYWxzZTtcclxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcclxuXHJcbmlmIChoYXNET00pIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7IGlzUmVhZHkgPSB0cnVlIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gd2hlblJlYWR5KGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICBpZiAoaXNSZWFkeSB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICAgICAgY2FsbGJhY2soKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGNhbGxiYWNrKTtcclxuICAgIH1cclxufVxyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuaW1wb3J0IHsgSXNEZWJ1ZyB9IGZyb20gXCIuL3N5c3RlbS5qc1wiO1xyXG5pbXBvcnQgeyBldmVudFRhcmdldCB9IGZyb20gXCIuL3V0aWxzLmpzXCI7XHJcblxyXG4vLyBzZXR1cFxyXG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xyXG5cclxuaWYgKGhhc0RPTSkge1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgY29udGV4dE1lbnVIYW5kbGVyKTtcclxufVxyXG5cclxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQ29udGV4dE1lbnUpO1xyXG5cclxuY29uc3QgQ29udGV4dE1lbnVPcGVuID0gMDtcclxuXHJcbmZ1bmN0aW9uIG9wZW5Db250ZXh0TWVudShpZDogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlciwgZGF0YTogYW55KTogdm9pZCB7XHJcbiAgICB2b2lkIGNhbGwoQ29udGV4dE1lbnVPcGVuLCB7aWQsIHgsIHksIGRhdGF9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29udGV4dE1lbnVIYW5kbGVyKGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICBjb25zdCB0YXJnZXQgPSBldmVudFRhcmdldChldmVudCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIGN1c3RvbSBjb250ZXh0IG1lbnVcclxuICAgIGNvbnN0IGN1c3RvbUNvbnRleHRNZW51ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1jdXN0b20tY29udGV4dG1lbnVcIikudHJpbSgpO1xyXG5cclxuICAgIGlmIChjdXN0b21Db250ZXh0TWVudSkge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tY3VzdG9tLWNvbnRleHRtZW51LWRhdGFcIik7XHJcbiAgICAgICAgb3BlbkNvbnRleHRNZW51KGN1c3RvbUNvbnRleHRNZW51LCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBkYXRhKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcHJvY2Vzc0RlZmF1bHRDb250ZXh0TWVudShldmVudCwgdGFyZ2V0KTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbi8qXHJcbi0tZGVmYXVsdC1jb250ZXh0bWVudTogYXV0bzsgKGRlZmF1bHQpIHdpbGwgc2hvdyB0aGUgZGVmYXVsdCBjb250ZXh0IG1lbnUgaWYgY29udGVudEVkaXRhYmxlIGlzIHRydWUgT1IgdGV4dCBoYXMgYmVlbiBzZWxlY3RlZCBPUiBlbGVtZW50IGlzIGlucHV0IG9yIHRleHRhcmVhXHJcbi0tZGVmYXVsdC1jb250ZXh0bWVudTogc2hvdzsgd2lsbCBhbHdheXMgc2hvdyB0aGUgZGVmYXVsdCBjb250ZXh0IG1lbnVcclxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBoaWRlOyB3aWxsIGFsd2F5cyBoaWRlIHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxyXG5cclxuVGhpcyBydWxlIGlzIGluaGVyaXRlZCBsaWtlIG5vcm1hbCBDU1MgcnVsZXMsIHNvIG5lc3Rpbmcgd29ya3MgYXMgZXhwZWN0ZWRcclxuKi9cclxuZnVuY3Rpb24gcHJvY2Vzc0RlZmF1bHRDb250ZXh0TWVudShldmVudDogTW91c2VFdmVudCwgdGFyZ2V0OiBIVE1MRWxlbWVudCkge1xyXG4gICAgLy8gRGVidWcgYnVpbGRzIGFsd2F5cyBzaG93IHRoZSBtZW51XHJcbiAgICBpZiAoSXNEZWJ1ZygpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb2Nlc3MgZGVmYXVsdCBjb250ZXh0IG1lbnVcclxuICAgIHN3aXRjaCAod2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1kZWZhdWx0LWNvbnRleHRtZW51XCIpLnRyaW0oKSkge1xyXG4gICAgICAgIGNhc2UgJ3Nob3cnOlxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY2FzZSAnaGlkZSc6XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBpZiBjb250ZW50RWRpdGFibGUgaXMgdHJ1ZVxyXG4gICAgaWYgKHRhcmdldC5pc0NvbnRlbnRFZGl0YWJsZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBpZiB0ZXh0IGhhcyBiZWVuIHNlbGVjdGVkXHJcbiAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICBjb25zdCBoYXNTZWxlY3Rpb24gPSBzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLnRvU3RyaW5nKCkubGVuZ3RoID4gMDtcclxuICAgIGlmIChoYXNTZWxlY3Rpb24pIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdGlvbi5yYW5nZUNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdChpKTtcclxuICAgICAgICAgICAgY29uc3QgcmVjdHMgPSByYW5nZS5nZXRDbGllbnRSZWN0cygpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJlY3RzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZWN0ID0gcmVjdHNbal07XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChyZWN0LmxlZnQsIHJlY3QudG9wKSA9PT0gdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGlmIHRhZyBpcyBpbnB1dCBvciB0ZXh0YXJlYS5cclxuICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50IHx8IHRhcmdldCBpbnN0YW5jZW9mIEhUTUxUZXh0QXJlYUVsZW1lbnQpIHtcclxuICAgICAgICBpZiAoaGFzU2VsZWN0aW9uIHx8ICghdGFyZ2V0LnJlYWRPbmx5ICYmICF0YXJnZXQuZGlzYWJsZWQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaGlkZSBkZWZhdWx0IGNvbnRleHQgbWVudVxyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxufVxyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG4vKipcclxuICogUmV0cmlldmVzIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkgZnJvbSB0aGUgZmxhZyBtYXAuXHJcbiAqXHJcbiAqIEBwYXJhbSBrZXkgLSBUaGUga2V5IHRvIHJldHJpZXZlIHRoZSB2YWx1ZSBmb3IuXHJcbiAqIEByZXR1cm4gVGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBHZXRGbGFnKGtleTogc3RyaW5nKTogYW55IHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZmxhZ3Nba2V5XTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcmV0cmlldmUgZmxhZyAnXCIgKyBrZXkgKyBcIic6IFwiICsgZSwgeyBjYXVzZTogZSB9KTtcclxuICAgIH1cclxufVxyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBpbnZva2UsIElzV2luZG93cywgSXNMaW51eCwgSXNNYWMgfSBmcm9tIFwiLi9zeXN0ZW0uanNcIjtcclxuaW1wb3J0IHsgR2V0RmxhZyB9IGZyb20gXCIuL2ZsYWdzLmpzXCI7XHJcbmltcG9ydCB7IGNhblRyYWNrQnV0dG9ucywgZXZlbnRUYXJnZXQgfSBmcm9tIFwiLi91dGlscy5qc1wiO1xyXG5cclxuLy8gU2V0dXBcclxubGV0IGNhbkRyYWcgPSBmYWxzZTtcclxubGV0IGRyYWdnaW5nID0gZmFsc2U7XHJcblxyXG5sZXQgcmVzaXphYmxlID0gZmFsc2U7XHJcbmxldCBjYW5SZXNpemUgPSBmYWxzZTtcclxubGV0IHJlc2l6aW5nID0gZmFsc2U7XHJcbmxldCByZXNpemVFZGdlOiBzdHJpbmcgPSBcIlwiO1xyXG5sZXQgZGVmYXVsdEN1cnNvciA9IFwiYXV0b1wiO1xyXG5cclxubGV0IGJ1dHRvbnMgPSAwO1xyXG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xyXG5cclxubGV0IGJ1dHRvbnNUcmFja2VkID0gZmFsc2U7XHJcblxyXG5pZiAoaGFzRE9NKSB7XHJcbiAgICBidXR0b25zVHJhY2tlZCA9IGNhblRyYWNrQnV0dG9ucygpO1xyXG4gICAgd2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XHJcbiAgICB3aW5kb3cuX3dhaWxzLnNldFJlc2l6YWJsZSA9ICh2YWx1ZTogYm9vbGVhbik6IHZvaWQgPT4ge1xyXG4gICAgICAgIHJlc2l6YWJsZSA9IHZhbHVlO1xyXG4gICAgICAgIGlmICghcmVzaXphYmxlKSB7XHJcbiAgICAgICAgICAgIC8vIFN0b3AgcmVzaXppbmcgaWYgaW4gcHJvZ3Jlc3MuXHJcbiAgICAgICAgICAgIGNhblJlc2l6ZSA9IHJlc2l6aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNldFJlc2l6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbi8vIERlZmVyIGF0dGFjaGluZyBtb3VzZSBsaXN0ZW5lcnMgdW50aWwgd2Uga25vdyB3ZSdyZSBub3Qgb24gbW9iaWxlLlxyXG5sZXQgZHJhZ0luaXREb25lID0gZmFsc2U7XHJcbmZ1bmN0aW9uIGlzTW9iaWxlKCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qgb3MgPSAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uT1M7XHJcbiAgICBpZiAob3MgPT09IFwiaW9zXCIgfHwgb3MgPT09IFwiYW5kcm9pZFwiKSByZXR1cm4gdHJ1ZTtcclxuICAgIC8vIEZhbGxiYWNrIGhldXJpc3RpYyBpZiBlbnZpcm9ubWVudCBub3QgeWV0IHNldFxyXG4gICAgY29uc3QgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgKHdpbmRvdyBhcyBhbnkpLm9wZXJhIHx8IFwiXCI7XHJcbiAgICByZXR1cm4gL2FuZHJvaWR8aXBob25lfGlwYWR8aXBvZHxpZW1vYmlsZXx3cGRlc2t0b3AvaS50ZXN0KHVhKTtcclxufVxyXG5mdW5jdGlvbiB0cnlJbml0RHJhZ0hhbmRsZXJzKCk6IHZvaWQge1xyXG4gICAgaWYgKGRyYWdJbml0RG9uZSkgcmV0dXJuO1xyXG4gICAgaWYgKGlzTW9iaWxlKCkpIHJldHVybjtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB1cGRhdGUsIHsgY2FwdHVyZTogdHJ1ZSB9KTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB1cGRhdGUsIHsgY2FwdHVyZTogdHJ1ZSB9KTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdXBkYXRlLCB7IGNhcHR1cmU6IHRydWUgfSk7XHJcbiAgICBmb3IgKGNvbnN0IGV2IG9mIFsnY2xpY2snLCAnY29udGV4dG1lbnUnLCAnZGJsY2xpY2snXSkge1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGV2LCBzdXBwcmVzc0V2ZW50LCB7IGNhcHR1cmU6IHRydWUgfSk7XHJcbiAgICB9XHJcbiAgICBkcmFnSW5pdERvbmUgPSB0cnVlO1xyXG59XHJcbmlmIChoYXNET00pIHtcclxuICAgIC8vIEF0dGVtcHQgaW1tZWRpYXRlIGluaXQgKGluIGNhc2UgZW52aXJvbm1lbnQgYWxyZWFkeSBwcmVzZW50KVxyXG4gICAgdHJ5SW5pdERyYWdIYW5kbGVycygpO1xyXG4gICAgLy8gQWxzbyBhdHRlbXB0IG9uIERPTSByZWFkeVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHRyeUluaXREcmFnSGFuZGxlcnMsIHsgb25jZTogdHJ1ZSB9KTtcclxuICAgIC8vIEFzIGEgbGFzdCByZXNvcnQsIHBvbGwgZm9yIGVudmlyb25tZW50IGZvciBhIHNob3J0IHBlcmlvZFxyXG4gICAgbGV0IGRyYWdFbnZQb2xscyA9IDA7XHJcbiAgICBjb25zdCBkcmFnRW52UG9sbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYWdJbml0RG9uZSkgeyB3aW5kb3cuY2xlYXJJbnRlcnZhbChkcmFnRW52UG9sbCk7IHJldHVybjsgfVxyXG4gICAgICAgIHRyeUluaXREcmFnSGFuZGxlcnMoKTtcclxuICAgICAgICBpZiAoKytkcmFnRW52UG9sbHMgPiAxMDApIHsgd2luZG93LmNsZWFySW50ZXJ2YWwoZHJhZ0VudlBvbGwpOyB9XHJcbiAgICB9LCA1MCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN1cHByZXNzRXZlbnQoZXZlbnQ6IEV2ZW50KSB7XHJcbiAgICBpZiAoXHJcbiAgICAgICAgZXZlbnQudHlwZSA9PT0gXCJkYmxjbGlja1wiXHJcbiAgICAgICAgJiYgSXNNYWMoKVxyXG4gICAgICAgICYmIHdpbmRvdyA9PT0gd2luZG93LnRvcFxyXG4gICAgICAgICYmIGlzRHJhZ2dhYmxlRXZlbnQoZXZlbnQgYXMgTW91c2VFdmVudClcclxuICAgICkge1xyXG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgaW52b2tlKFwid2FpbHM6ZHJhZzpkb3VibGVjbGlja1wiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3VwcHJlc3MgY2xpY2sgZXZlbnRzIHdoaWxlIHJlc2l6aW5nIG9yIGRyYWdnaW5nLlxyXG4gICAgaWYgKGRyYWdnaW5nIHx8IHJlc2l6aW5nKSB7XHJcbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaXNEcmFnZ2FibGVFdmVudChldmVudDogTW91c2VFdmVudCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnRUYXJnZXQoZXZlbnQpO1xyXG4gICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS13YWlscy1kcmFnZ2FibGVcIikudHJpbSgpID09PSBcImRyYWdcIlxyXG4gICAgICAgICYmIGV2ZW50Lm9mZnNldFggPj0gMFxyXG4gICAgICAgICYmIGV2ZW50Lm9mZnNldFggPCB0YXJnZXQuY2xpZW50V2lkdGhcclxuICAgICAgICAmJiBldmVudC5vZmZzZXRZID49IDBcclxuICAgICAgICAmJiBldmVudC5vZmZzZXRZIDwgdGFyZ2V0LmNsaWVudEhlaWdodFxyXG4gICAgKTtcclxufVxyXG5cclxuLy8gVXNlIGNvbnN0YW50cyB0byBhdm9pZCBjb21wYXJpbmcgc3RyaW5ncyBtdWx0aXBsZSB0aW1lcy5cclxuY29uc3QgTW91c2VEb3duID0gMDtcclxuY29uc3QgTW91c2VVcCAgID0gMTtcclxuY29uc3QgTW91c2VNb3ZlID0gMjtcclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZShldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgLy8gV2luZG93cyBzdXBwcmVzc2VzIG1vdXNlIGV2ZW50cyBhdCB0aGUgZW5kIG9mIGRyYWdnaW5nIG9yIHJlc2l6aW5nLFxyXG4gICAgLy8gc28gd2UgbmVlZCB0byBiZSBzbWFydCBhbmQgc3ludGhlc2l6ZSBidXR0b24gZXZlbnRzLlxyXG5cclxuICAgIGxldCBldmVudFR5cGU6IG51bWJlciwgZXZlbnRCdXR0b25zID0gZXZlbnQuYnV0dG9ucztcclxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ21vdXNlZG93bic6XHJcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9IE1vdXNlRG93bjtcclxuICAgICAgICAgICAgaWYgKCFidXR0b25zVHJhY2tlZCkgeyBldmVudEJ1dHRvbnMgPSBidXR0b25zIHwgKDEgPDwgZXZlbnQuYnV0dG9uKTsgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdtb3VzZXVwJzpcclxuICAgICAgICAgICAgZXZlbnRUeXBlID0gTW91c2VVcDtcclxuICAgICAgICAgICAgaWYgKCFidXR0b25zVHJhY2tlZCkgeyBldmVudEJ1dHRvbnMgPSBidXR0b25zICYgfigxIDw8IGV2ZW50LmJ1dHRvbik7IH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgZXZlbnRUeXBlID0gTW91c2VNb3ZlO1xyXG4gICAgICAgICAgICBpZiAoIWJ1dHRvbnNUcmFja2VkKSB7IGV2ZW50QnV0dG9ucyA9IGJ1dHRvbnM7IH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHJlbGVhc2VkID0gYnV0dG9ucyAmIH5ldmVudEJ1dHRvbnM7XHJcbiAgICBsZXQgcHJlc3NlZCA9IGV2ZW50QnV0dG9ucyAmIH5idXR0b25zO1xyXG5cclxuICAgIGJ1dHRvbnMgPSBldmVudEJ1dHRvbnM7XHJcblxyXG4gICAgLy8gU3ludGhlc2l6ZSBhIHJlbGVhc2UtcHJlc3Mgc2VxdWVuY2UgaWYgd2UgZGV0ZWN0IGEgcHJlc3Mgb2YgYW4gYWxyZWFkeSBwcmVzc2VkIGJ1dHRvbi5cclxuICAgIGlmIChldmVudFR5cGUgPT09IE1vdXNlRG93biAmJiAhKHByZXNzZWQgJiBldmVudC5idXR0b24pKSB7XHJcbiAgICAgICAgcmVsZWFzZWQgfD0gKDEgPDwgZXZlbnQuYnV0dG9uKTtcclxuICAgICAgICBwcmVzc2VkIHw9ICgxIDw8IGV2ZW50LmJ1dHRvbik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3VwcHJlc3MgYWxsIGJ1dHRvbiBldmVudHMgZHVyaW5nIGRyYWdnaW5nIGFuZCByZXNpemluZyxcclxuICAgIC8vIHVubGVzcyB0aGlzIGlzIGEgbW91c2V1cCBldmVudCB0aGF0IGlzIGVuZGluZyBhIGRyYWcgYWN0aW9uLlxyXG4gICAgaWYgKFxyXG4gICAgICAgIGV2ZW50VHlwZSAhPT0gTW91c2VNb3ZlIC8vIEZhc3QgcGF0aCBmb3IgbW91c2Vtb3ZlXHJcbiAgICAgICAgJiYgcmVzaXppbmdcclxuICAgICAgICB8fCAoXHJcbiAgICAgICAgICAgIGRyYWdnaW5nXHJcbiAgICAgICAgICAgICYmIChcclxuICAgICAgICAgICAgICAgIGV2ZW50VHlwZSA9PT0gTW91c2VEb3duXHJcbiAgICAgICAgICAgICAgICB8fCBldmVudC5idXR0b24gIT09IDBcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIClcclxuICAgICkge1xyXG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIHJlbGVhc2VzXHJcbiAgICBpZiAocmVsZWFzZWQgJiAxKSB7IHByaW1hcnlVcChldmVudCk7IH1cclxuICAgIC8vIEhhbmRsZSBwcmVzc2VzXHJcbiAgICBpZiAocHJlc3NlZCAmIDEpIHsgcHJpbWFyeURvd24oZXZlbnQpOyB9XHJcblxyXG4gICAgLy8gSGFuZGxlIG1vdXNlbW92ZVxyXG4gICAgaWYgKGV2ZW50VHlwZSA9PT0gTW91c2VNb3ZlKSB7IG9uTW91c2VNb3ZlKGV2ZW50KTsgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJpbWFyeURvd24oZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIC8vIFJlc2V0IHJlYWRpbmVzcyBzdGF0ZS5cclxuICAgIGNhbkRyYWcgPSBmYWxzZTtcclxuICAgIGNhblJlc2l6ZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIElnbm9yZSByZXBlYXRlZCBjbGlja3Mgb24gbWFjT1MgYW5kIExpbnV4LlxyXG4gICAgaWYgKCFJc1dpbmRvd3MoKSkge1xyXG4gICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gPT09IDAgJiYgZXZlbnQuZGV0YWlsICE9PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc2l6ZUVkZ2UpIHtcclxuICAgICAgICAvLyBEbyBub3QgYXJtIGVkZ2UgcmVzaXplIGZyb20gc3ludGhlc2l6ZWQgcHJlc3NlcyBvYnNlcnZlZCBvbiBtb3ZlL3VwOlxyXG4gICAgICAgIC8vIGVudGVyaW5nIHRoZSB3aW5kb3cgd2l0aCB0aGUgcHJpbWFyeSBidXR0b24gYWxyZWFkeSBoZWxkIHNob3VsZCBub3RcclxuICAgICAgICAvLyBzdGVhbCBhbm90aGVyIGdlc3R1cmUgaW50byBhIHJlc2l6ZS5cclxuICAgICAgICBpZiAoZXZlbnQudHlwZSAhPT0gJ21vdXNlZG93bicpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVhZHkgdG8gcmVzaXplIGlmIHRoZSBwcmltYXJ5IGJ1dHRvbiB3YXMgcHJlc3NlZCBmb3IgdGhlIGZpcnN0IHRpbWUuXHJcbiAgICAgICAgY2FuUmVzaXplID0gdHJ1ZTtcclxuICAgICAgICAvLyBEbyBub3Qgc3RhcnQgZHJhZyBvcGVyYXRpb25zIHdoZW4gb24gcmVzaXplIGVkZ2VzLlxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXRyaWV2ZSB0YXJnZXQgZWxlbWVudFxyXG4gICAgLy8gUmVhZHkgdG8gZHJhZyBpZiB0aGUgcHJpbWFyeSBidXR0b24gd2FzIHByZXNzZWQgZm9yIHRoZSBmaXJzdCB0aW1lIG9uIGEgZHJhZ2dhYmxlIGVsZW1lbnQuXHJcbiAgICAvLyBJZ25vcmUgY2xpY2tzIG9uIHRoZSBzY3JvbGxiYXIuXHJcbiAgICBjYW5EcmFnID0gaXNEcmFnZ2FibGVFdmVudChldmVudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByaW1hcnlVcChldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgLy8gU3RvcCBkcmFnZ2luZyBhbmQgcmVzaXppbmcuXHJcbiAgICBjYW5EcmFnID0gZmFsc2U7XHJcbiAgICBkcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgY2FuUmVzaXplID0gZmFsc2U7XHJcbiAgICByZXNpemluZyA9IGZhbHNlO1xyXG59XHJcblxyXG5jb25zdCBjdXJzb3JGb3JFZGdlID0gT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICBcInNlLXJlc2l6ZVwiOiBcIm53c2UtcmVzaXplXCIsXHJcbiAgICBcInN3LXJlc2l6ZVwiOiBcIm5lc3ctcmVzaXplXCIsXHJcbiAgICBcIm53LXJlc2l6ZVwiOiBcIm53c2UtcmVzaXplXCIsXHJcbiAgICBcIm5lLXJlc2l6ZVwiOiBcIm5lc3ctcmVzaXplXCIsXHJcbiAgICBcInctcmVzaXplXCI6IFwiZXctcmVzaXplXCIsXHJcbiAgICBcIm4tcmVzaXplXCI6IFwibnMtcmVzaXplXCIsXHJcbiAgICBcInMtcmVzaXplXCI6IFwibnMtcmVzaXplXCIsXHJcbiAgICBcImUtcmVzaXplXCI6IFwiZXctcmVzaXplXCIsXHJcbn0pXHJcblxyXG5mdW5jdGlvbiBzZXRSZXNpemUoZWRnZT86IGtleW9mIHR5cGVvZiBjdXJzb3JGb3JFZGdlKTogdm9pZCB7XHJcbiAgICBpZiAoZWRnZSkge1xyXG4gICAgICAgIGlmICghcmVzaXplRWRnZSkgeyBkZWZhdWx0Q3Vyc29yID0gZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3I7IH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IGN1cnNvckZvckVkZ2VbZWRnZV07XHJcbiAgICB9IGVsc2UgaWYgKCFlZGdlICYmIHJlc2l6ZUVkZ2UpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IGRlZmF1bHRDdXJzb3I7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplRWRnZSA9IGVkZ2UgfHwgXCJcIjtcclxufVxyXG5cclxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmIChjYW5SZXNpemUgJiYgcmVzaXplRWRnZSkge1xyXG4gICAgICAgIC8vIFN0YXJ0IHJlc2l6aW5nLlxyXG4gICAgICAgIHJlc2l6aW5nID0gdHJ1ZTtcclxuICAgICAgICBpbnZva2UoXCJ3YWlsczpyZXNpemU6XCIgKyByZXNpemVFZGdlKTtcclxuICAgIH0gZWxzZSBpZiAoY2FuRHJhZykge1xyXG4gICAgICAgIC8vIFN0YXJ0IGRyYWdnaW5nLlxyXG4gICAgICAgIGRyYWdnaW5nID0gdHJ1ZTtcclxuICAgICAgICBpbnZva2UoXCJ3YWlsczpkcmFnXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkcmFnZ2luZyB8fCByZXNpemluZykge1xyXG4gICAgICAgIC8vIEVpdGhlciBkcmFnIG9yIHJlc2l6ZSBpcyBvbmdvaW5nLFxyXG4gICAgICAgIC8vIHJlc2V0IHJlYWRpbmVzcyBhbmQgc3RvcCBwcm9jZXNzaW5nLlxyXG4gICAgICAgIGNhbkRyYWcgPSBjYW5SZXNpemUgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyZXNpemFibGUgfHwgKCFJc1dpbmRvd3MoKSAmJiAhKElzTGludXgoKSAmJiBHZXRGbGFnKFwiZnJhbWVsZXNzXCIpKSkpIHtcclxuICAgICAgICBpZiAocmVzaXplRWRnZSkgeyBzZXRSZXNpemUoKTsgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb25maWd1cmVkQm9yZGVyID0gR2V0RmxhZyhcInJlc2l6ZUJvcmRlckluc2lkZVwiKSBhcyBSZXNpemVCb3JkZXIgfCB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCByZXNpemVIYW5kbGVIZWlnaHQgPSBHZXRGbGFnKFwic3lzdGVtLnJlc2l6ZUhhbmRsZUhlaWdodFwiKSB8fCA1O1xyXG4gICAgY29uc3QgcmVzaXplSGFuZGxlV2lkdGggPSBHZXRGbGFnKFwic3lzdGVtLnJlc2l6ZUhhbmRsZVdpZHRoXCIpIHx8IDU7XHJcblxyXG4gICAgY29uc3QgbGVmdFdpZHRoID0gY29uZmlndXJlZEJvcmRlcj8ubGVmdCA/PyByZXNpemVIYW5kbGVXaWR0aDtcclxuICAgIGNvbnN0IHJpZ2h0V2lkdGggPSBjb25maWd1cmVkQm9yZGVyPy5yaWdodCA/PyByZXNpemVIYW5kbGVXaWR0aDtcclxuICAgIGNvbnN0IHRvcEhlaWdodCA9IGNvbmZpZ3VyZWRCb3JkZXI/LnRvcCA/PyByZXNpemVIYW5kbGVIZWlnaHQ7XHJcbiAgICBjb25zdCBib3R0b21IZWlnaHQgPSBjb25maWd1cmVkQm9yZGVyPy5ib3R0b20gPz8gcmVzaXplSGFuZGxlSGVpZ2h0O1xyXG5cclxuICAgIC8vIEV4dHJhIHBpeGVscyBmb3IgdGhlIGNvcm5lciBhcmVhcy5cclxuICAgIGNvbnN0IGNvcm5lckV4dHJhID0gY29uZmlndXJlZEJvcmRlciA/IDAgOiBHZXRGbGFnKFwicmVzaXplQ29ybmVyRXh0cmFcIikgfHwgMTA7XHJcblxyXG4gICAgLy8gV2hlbiBhIHNjcm9sbGJhciBpcyBwcmVzZW50IGF0IHRoZSB3aW5kb3cgZWRnZSBpdCBjb25zdW1lcyBtb3VzZSBldmVudHMgaW4gdGhhdCBzdHJpcC5cclxuICAgIC8vIFNoaWZ0IHRoZSBlZmZlY3RpdmUgY29udGVudCBlZGdlIGlud2FyZCBzbyB0aGUgcmVzaXplIHpvbmUgc2l0cyBqdXN0IGJlZm9yZSB0aGUgc2Nyb2xsYmFyLlxyXG4gICAgY29uc3Qgc2Nyb2xsYmFyV2lkdGggPSBNYXRoLm1heCgwLCB3aW5kb3cuaW5uZXJXaWR0aCAtIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCk7XHJcbiAgICBjb25zdCBzY3JvbGxiYXJIZWlnaHQgPSBNYXRoLm1heCgwLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcclxuICAgIGNvbnN0IHJpZ2h0Q29udGVudEVkZ2UgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIHNjcm9sbGJhcldpZHRoO1xyXG4gICAgY29uc3QgYm90dG9tQ29udGVudEVkZ2UgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBzY3JvbGxiYXJIZWlnaHQ7XHJcblxyXG4gICAgY29uc3QgcmlnaHRCb3JkZXIgPSBldmVudC5jbGllbnRYIDwgcmlnaHRDb250ZW50RWRnZSAmJiAocmlnaHRDb250ZW50RWRnZSAtIGV2ZW50LmNsaWVudFgpIDwgcmlnaHRXaWR0aDtcclxuICAgIGNvbnN0IGxlZnRCb3JkZXIgPSBldmVudC5jbGllbnRYIDwgbGVmdFdpZHRoO1xyXG4gICAgY29uc3QgdG9wQm9yZGVyID0gZXZlbnQuY2xpZW50WSA8IHRvcEhlaWdodDtcclxuICAgIGNvbnN0IGJvdHRvbUJvcmRlciA9IGV2ZW50LmNsaWVudFkgPCBib3R0b21Db250ZW50RWRnZSAmJiAoYm90dG9tQ29udGVudEVkZ2UgLSBldmVudC5jbGllbnRZKSA8IGJvdHRvbUhlaWdodDtcclxuXHJcbiAgICAvLyBBZGp1c3QgZm9yIGNvcm5lciBhcmVhcy5cclxuICAgIGNvbnN0IHJpZ2h0Q29ybmVyID0gZXZlbnQuY2xpZW50WCA8IHJpZ2h0Q29udGVudEVkZ2UgJiYgKHJpZ2h0Q29udGVudEVkZ2UgLSBldmVudC5jbGllbnRYKSA8IChyaWdodFdpZHRoICsgY29ybmVyRXh0cmEpO1xyXG4gICAgY29uc3QgbGVmdENvcm5lciA9IGV2ZW50LmNsaWVudFggPCAobGVmdFdpZHRoICsgY29ybmVyRXh0cmEpO1xyXG4gICAgY29uc3QgdG9wQ29ybmVyID0gZXZlbnQuY2xpZW50WSA8ICh0b3BIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XHJcbiAgICBjb25zdCBib3R0b21Db3JuZXIgPSBldmVudC5jbGllbnRZIDwgYm90dG9tQ29udGVudEVkZ2UgJiYgKGJvdHRvbUNvbnRlbnRFZGdlIC0gZXZlbnQuY2xpZW50WSkgPCAoYm90dG9tSGVpZ2h0ICsgY29ybmVyRXh0cmEpO1xyXG5cclxuICAgIGlmICghbGVmdENvcm5lciAmJiAhdG9wQ29ybmVyICYmICFib3R0b21Db3JuZXIgJiYgIXJpZ2h0Q29ybmVyKSB7XHJcbiAgICAgICAgLy8gT3B0aW1pc2F0aW9uOiBvdXQgb2YgYWxsIGNvcm5lciBhcmVhcyBpbXBsaWVzIG91dCBvZiBib3JkZXJzLlxyXG4gICAgICAgIHNldFJlc2l6ZSgpO1xyXG4gICAgfVxyXG4gICAgLy8gRGV0ZWN0IGNvcm5lcnMuXHJcbiAgICBlbHNlIGlmIChyaWdodENvcm5lciAmJiBib3R0b21Db3JuZXIpIHNldFJlc2l6ZShcInNlLXJlc2l6ZVwiKTtcclxuICAgIGVsc2UgaWYgKGxlZnRDb3JuZXIgJiYgYm90dG9tQ29ybmVyKSBzZXRSZXNpemUoXCJzdy1yZXNpemVcIik7XHJcbiAgICBlbHNlIGlmIChsZWZ0Q29ybmVyICYmIHRvcENvcm5lcikgc2V0UmVzaXplKFwibnctcmVzaXplXCIpO1xyXG4gICAgZWxzZSBpZiAodG9wQ29ybmVyICYmIHJpZ2h0Q29ybmVyKSBzZXRSZXNpemUoXCJuZS1yZXNpemVcIik7XHJcbiAgICAvLyBEZXRlY3QgYm9yZGVycy5cclxuICAgIGVsc2UgaWYgKGxlZnRCb3JkZXIpIHNldFJlc2l6ZShcInctcmVzaXplXCIpO1xyXG4gICAgZWxzZSBpZiAodG9wQm9yZGVyKSBzZXRSZXNpemUoXCJuLXJlc2l6ZVwiKTtcclxuICAgIGVsc2UgaWYgKGJvdHRvbUJvcmRlcikgc2V0UmVzaXplKFwicy1yZXNpemVcIik7XHJcbiAgICBlbHNlIGlmIChyaWdodEJvcmRlcikgc2V0UmVzaXplKFwiZS1yZXNpemVcIik7XHJcbiAgICAvLyBPdXQgb2YgYm9yZGVyIGFyZWEuXHJcbiAgICBlbHNlIHNldFJlc2l6ZSgpO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUmVzaXplQm9yZGVyIHtcclxuICAgIGxlZnQ6IG51bWJlcjtcclxuICAgIHJpZ2h0OiBudW1iZXI7XHJcbiAgICB0b3A6IG51bWJlcjtcclxuICAgIGJvdHRvbTogbnVtYmVyO1xyXG59XHJcbiIsIi8qXHJcbiBfICAgICBfXyAgICBfIF9fXHJcbnwgfCAgIC8gL19fXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBpbnZva2UgfSBmcm9tIFwiLi9zeXN0ZW0uanNcIjtcclxuaW1wb3J0IHsgd2hlblJlYWR5IH0gZnJvbSBcIi4vdXRpbHMuanNcIjtcclxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcclxuXHJcbnR5cGUgTm9uQ2xpZW50UmVnaW9uS2luZCA9IFwiY2FwdGlvblwiIHwgXCJtaW5pbWl6ZVwiIHwgXCJtYXhpbWl6ZVwiIHwgXCJjbG9zZVwiO1xyXG5cclxuaW50ZXJmYWNlIE5vbkNsaWVudFJlZ2lvbiB7XHJcbiAgICBraW5kOiBOb25DbGllbnRSZWdpb25LaW5kO1xyXG4gICAgbGVmdDogbnVtYmVyO1xyXG4gICAgdG9wOiBudW1iZXI7XHJcbiAgICByaWdodDogbnVtYmVyO1xyXG4gICAgYm90dG9tOiBudW1iZXI7XHJcbn1cclxuXHJcbi8qXHJcbi0td2FpbHMtbm9uLWNsaWVudC1yZWdpb246IGNhcHRpb247ICBtYXJrcyBhbiBhcmVhIHRoYXQgY2FuIGRyYWcgdGhlIHdpbmRvd1xyXG4tLXdhaWxzLW5vbi1jbGllbnQtcmVnaW9uOiBtaW5pbWl6ZTsgbWFya3MgYSBjdXN0b20gbWluaW1pemUgYnV0dG9uXHJcbi0td2FpbHMtbm9uLWNsaWVudC1yZWdpb246IG1heGltaXplOyBtYXJrcyBhIGN1c3RvbSBtYXhpbWl6ZSBidXR0b25cclxuLS13YWlscy1ub24tY2xpZW50LXJlZ2lvbjogY2xvc2U7ICAgIG1hcmtzIGEgY3VzdG9tIGNsb3NlIGJ1dHRvblxyXG4qL1xyXG5jb25zdCByZWdpb25Qcm9wZXJ0eSA9IFwiLS13YWlscy1ub24tY2xpZW50LXJlZ2lvblwiO1xyXG5jb25zdCBydW50aW1lQ29uZmlnUmVhZHlFdmVudCA9IFwid2FpbHM6cnVudGltZS1jb25maWctcmVhZHlcIjtcclxuY29uc3QgdmFsaWRSZWdpb25zID0gbmV3IFNldDxOb25DbGllbnRSZWdpb25LaW5kPihbXCJjYXB0aW9uXCIsIFwibWluaW1pemVcIiwgXCJtYXhpbWl6ZVwiLCBcImNsb3NlXCJdKTtcclxuXHJcbi8vIFNldHVwXHJcbmlmIChoYXNET00pIHtcclxuICAgIHdpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xyXG59XHJcblxyXG5sZXQgdXBkYXRlUGVuZGluZyA9IGZhbHNlO1xyXG5sZXQgbGFzdFBheWxvYWQgPSBcIlwiO1xyXG5sZXQgb2JzZXJ2ZWRFbGVtZW50cyA9IG5ldyBTZXQ8RWxlbWVudD4oKTtcclxubGV0IHJlc2l6ZU9ic2VydmVyOiBSZXNpemVPYnNlcnZlciB8IHVuZGVmaW5lZDtcclxubGV0IHRyYWNraW5nU3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuZnVuY3Rpb24gbm9ybWFsaXNlUmVnaW9uS2luZCh2YWx1ZTogc3RyaW5nKTogTm9uQ2xpZW50UmVnaW9uS2luZCB8IHVuZGVmaW5lZCB7XHJcbiAgICBjb25zdCByZWdpb24gPSB2YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIGlmICh2YWxpZFJlZ2lvbnMuaGFzKHJlZ2lvbiBhcyBOb25DbGllbnRSZWdpb25LaW5kKSkge1xyXG4gICAgICAgIHJldHVybiByZWdpb24gYXMgTm9uQ2xpZW50UmVnaW9uS2luZDtcclxuICAgIH1cclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5vbkNsaWVudFJlZ2lvbkZvckVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IE5vbkNsaWVudFJlZ2lvbktpbmQgfCB1bmRlZmluZWQge1xyXG4gICAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcclxuICAgIGNvbnN0IHJlZ2lvbiA9IG5vcm1hbGlzZVJlZ2lvbktpbmQoc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShyZWdpb25Qcm9wZXJ0eSkpO1xyXG4gICAgaWYgKCFyZWdpb24pIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhcmVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcclxuICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICBjb25zdCBwYXJlbnRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHBhcmVudCk7XHJcbiAgICAgICAgLy8gVGhlIENTUyBwcm9wZXJ0eSBpcyBpbmhlcml0ZWQuIE9ubHkgcmVwb3J0IHRoZSBvdXRlcm1vc3QgZWxlbWVudCBmb3JcclxuICAgICAgICAvLyBlYWNoIGNvbnRpZ3VvdXMgcmVnaW9uIHNvIG5hdGl2ZSBoaXQgdGVzdGluZyBzZWVzIHN0YWJsZSByZWN0YW5nbGVzLlxyXG4gICAgICAgIGlmIChub3JtYWxpc2VSZWdpb25LaW5kKHBhcmVudFN0eWxlLmdldFByb3BlcnR5VmFsdWUocmVnaW9uUHJvcGVydHkpKSA9PT0gcmVnaW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZWdpb247XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzVmlzaWJsZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcclxuICAgIHJldHVybiBzdHlsZS5kaXNwbGF5ICE9PSBcIm5vbmVcIiAmJlxyXG4gICAgICAgIHN0eWxlLnZpc2liaWxpdHkgIT09IFwiaGlkZGVuXCIgJiZcclxuICAgICAgICBzdHlsZS5jb250ZW50VmlzaWJpbGl0eSAhPT0gXCJoaWRkZW5cIjtcclxufVxyXG5cclxuZnVuY3Rpb24gZWxlbWVudFJlZ2lvbihlbGVtZW50OiBFbGVtZW50KTogTm9uQ2xpZW50UmVnaW9uIHwgdW5kZWZpbmVkIHtcclxuICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGtpbmQgPSBub25DbGllbnRSZWdpb25Gb3JFbGVtZW50KGVsZW1lbnQpO1xyXG4gICAgaWYgKCFraW5kIHx8ICFpc1Zpc2libGUoZWxlbWVudCkpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgaWYgKHJlY3Qud2lkdGggPD0gMCB8fCByZWN0LmhlaWdodCA8PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBOYXRpdmUgaGl0IHRlc3RpbmcgcnVucyBpbiBwaHlzaWNhbCBwaXhlbHMsIHdoaWxlIERPTSBnZW9tZXRyeSBpcyBpbiBDU1MgcGl4ZWxzLlxyXG4gICAgY29uc3Qgc2NhbGUgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xyXG4gICAgY29uc3QgbGVmdCA9IE1hdGguZmxvb3IocmVjdC5sZWZ0ICogc2NhbGUpO1xyXG4gICAgY29uc3QgdG9wID0gTWF0aC5mbG9vcihyZWN0LnRvcCAqIHNjYWxlKTtcclxuICAgIGNvbnN0IHJpZ2h0ID0gTWF0aC5jZWlsKHJlY3QucmlnaHQgKiBzY2FsZSk7XHJcbiAgICBjb25zdCBib3R0b20gPSBNYXRoLmNlaWwocmVjdC5ib3R0b20gKiBzY2FsZSk7XHJcblxyXG4gICAgaWYgKHJpZ2h0IDw9IGxlZnQgfHwgYm90dG9tIDw9IHRvcCkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHsga2luZCwgbGVmdCwgdG9wLCByaWdodCwgYm90dG9tIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlZ2lvbkVsZW1lbnRzKCk6IEVsZW1lbnRbXSB7XHJcbiAgICBjb25zdCBlbGVtZW50czogRWxlbWVudFtdID0gW107XHJcblxyXG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xyXG4gICAgICAgIGVsZW1lbnRzLnB1c2goZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcclxuICAgIH1cclxuICAgIGlmIChkb2N1bWVudC5ib2R5KSB7XHJcbiAgICAgICAgZWxlbWVudHMucHVzaChkb2N1bWVudC5ib2R5KTtcclxuICAgICAgICAvLyBBcHBlbmQgdmlhIGEgbG9vcDogc3ByZWFkaW5nIGEgaHVnZSBOb2RlTGlzdCBpbnRvIHB1c2goKSBvdmVyZmxvd3NcclxuICAgICAgICAvLyB0aGUgZW5naW5lJ3MgYXJndW1lbnQgbGltaXQgb24gdmVyeSBsYXJnZSBkb2N1bWVudHMuXHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbChcIipcIikpIHtcclxuICAgICAgICAgICAgZWxlbWVudHMucHVzaChlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVsZW1lbnRzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvYnNlcnZlUmVnaW9uRWxlbWVudHMoZWxlbWVudHM6IEVsZW1lbnRbXSk6IHZvaWQge1xyXG4gICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUcmFjayBzaXplIGNoYW5nZXMgb25seSBmb3IgYWN0aXZlIHJlZ2lvbiBlbGVtZW50cy4gRE9NIHN0cnVjdHVyZSBhbmQgc3R5bGVcclxuICAgIC8vIGNoYW5nZXMgYXJlIGNvdmVyZWQgYnkgTXV0YXRpb25PYnNlcnZlciBpbiBzdGFydE5vbkNsaWVudFJlZ2lvblRyYWNraW5nKCkuXHJcbiAgICByZXNpemVPYnNlcnZlciA/Pz0gbmV3IFJlc2l6ZU9ic2VydmVyKHNjaGVkdWxlVXBkYXRlKTtcclxuICAgIGNvbnN0IG5leHRFbGVtZW50cyA9IG5ldyBTZXQoZWxlbWVudHMpO1xyXG5cclxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBvYnNlcnZlZEVsZW1lbnRzKSB7XHJcbiAgICAgICAgaWYgKCFuZXh0RWxlbWVudHMuaGFzKGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgIHJlc2l6ZU9ic2VydmVyLnVub2JzZXJ2ZShlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5leHRFbGVtZW50cykge1xyXG4gICAgICAgIGlmICghb2JzZXJ2ZWRFbGVtZW50cy5oYXMoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb2JzZXJ2ZWRFbGVtZW50cyA9IG5leHRFbGVtZW50cztcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlTm9uQ2xpZW50UmVnaW9ucygpOiB2b2lkIHtcclxuICAgIHVwZGF0ZVBlbmRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdCBlbGVtZW50cyA9IHJlZ2lvbkVsZW1lbnRzKCk7XHJcbiAgICBjb25zdCByZWdpb25zOiBOb25DbGllbnRSZWdpb25bXSA9IFtdO1xyXG4gICAgY29uc3QgYWN0aXZlRWxlbWVudHM6IEVsZW1lbnRbXSA9IFtdO1xyXG5cclxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xyXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IGVsZW1lbnRSZWdpb24oZWxlbWVudCk7XHJcbiAgICAgICAgaWYgKHJlZ2lvbikge1xyXG4gICAgICAgICAgICByZWdpb25zLnB1c2gocmVnaW9uKTtcclxuICAgICAgICAgICAgYWN0aXZlRWxlbWVudHMucHVzaChlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb2JzZXJ2ZVJlZ2lvbkVsZW1lbnRzKGFjdGl2ZUVsZW1lbnRzKTtcclxuXHJcbiAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoeyB2ZXJzaW9uOiAxLCByZWdpb25zIH0pO1xyXG4gICAgaWYgKHBheWxvYWQgPT09IGxhc3RQYXlsb2FkKSB7XHJcbiAgICAgICAgLy8gQXZvaWQgc2VuZGluZyBkdXBsaWNhdGUgbmF0aXZlIG1lc3NhZ2VzIGR1cmluZyByZXNpemUgb3Igc3R5bGUgY2h1cm4uXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxhc3RQYXlsb2FkID0gcGF5bG9hZDtcclxuICAgIGludm9rZShcIndhaWxzOm5vbi1jbGllbnQtcmVnaW9uOlwiICsgcGF5bG9hZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNjaGVkdWxlVXBkYXRlKCk6IHZvaWQge1xyXG4gICAgaWYgKHVwZGF0ZVBlbmRpbmcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQmF0Y2ggcmVnaW9uIHVwZGF0ZXMgdG8gYW5pbWF0aW9uIGZyYW1lcyBzbyBsYXlvdXQgaXMgbWVhc3VyZWQgb25jZSBwZXIgZnJhbWUuXHJcbiAgICB1cGRhdGVQZW5kaW5nID0gdHJ1ZTtcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlTm9uQ2xpZW50UmVnaW9ucyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0Tm9uQ2xpZW50UmVnaW9uVHJhY2tpbmcoKTogdm9pZCB7XHJcbiAgICBpZiAodHJhY2tpbmdTdGFydGVkKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRyYWNraW5nU3RhcnRlZCA9IHRydWU7XHJcbiAgICAvLyBTZW5kIGFuIGluaXRpYWwgZW1wdHkgb3IgcG9wdWxhdGVkIHJlZ2lvbiBsaXN0IG9uY2UgdGhlIERPTSBpcyByZWFkeS5cclxuICAgIHNjaGVkdWxlVXBkYXRlKCk7XHJcblxyXG4gICAgY29uc3QgbXV0YXRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKHNjaGVkdWxlVXBkYXRlKTtcclxuICAgIG11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHtcclxuICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxyXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcclxuICAgICAgICBzdWJ0cmVlOiB0cnVlLFxyXG4gICAgfSk7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgc2NoZWR1bGVVcGRhdGUpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgc2NoZWR1bGVVcGRhdGUsIHRydWUpO1xyXG4gICAgd2luZG93LnZpc3VhbFZpZXdwb3J0Py5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHNjaGVkdWxlVXBkYXRlKTtcclxuICAgIHdpbmRvdy52aXN1YWxWaWV3cG9ydD8uYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBzY2hlZHVsZVVwZGF0ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRyeVN0YXJ0Tm9uQ2xpZW50UmVnaW9uVHJhY2tpbmcoKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBvcyA9IHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQ/Lk9TO1xyXG4gICAgaWYgKG9zID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZW5hYmxlZCA9IHdpbmRvdy5fd2FpbHMuZmxhZ3M/Lm5vbkNsaWVudFJlZ2lvblRyYWNraW5nO1xyXG4gICAgaWYgKG9zID09PSBcIndpbmRvd3NcIikge1xyXG4gICAgICAgIGlmIChlbmFibGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHdoZW5SZWFkeShzdGFydE5vbkNsaWVudFJlZ2lvblRyYWNraW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmlmIChoYXNET00gJiYgIXRyeVN0YXJ0Tm9uQ2xpZW50UmVnaW9uVHJhY2tpbmcoKSkge1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIocnVudGltZUNvbmZpZ1JlYWR5RXZlbnQsIHRyeVN0YXJ0Tm9uQ2xpZW50UmVnaW9uVHJhY2tpbmcsIHsgb25jZTogdHJ1ZSB9KTtcclxufVxyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQXBwbGljYXRpb24pO1xyXG5cclxuY29uc3QgSGlkZU1ldGhvZCA9IDA7XHJcbmNvbnN0IFNob3dNZXRob2QgPSAxO1xyXG5jb25zdCBRdWl0TWV0aG9kID0gMjtcclxuXHJcbi8qKlxyXG4gKiBIaWRlcyBhIGNlcnRhaW4gbWV0aG9kIGJ5IGNhbGxpbmcgdGhlIEhpZGVNZXRob2QgZnVuY3Rpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSGlkZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBjYWxsKEhpZGVNZXRob2QpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsbHMgdGhlIFNob3dNZXRob2QgYW5kIHJldHVybnMgdGhlIHJlc3VsdC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBTaG93KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIGNhbGwoU2hvd01ldGhvZCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxscyB0aGUgUXVpdE1ldGhvZCB0byB0ZXJtaW5hdGUgdGhlIHByb2dyYW0uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gUXVpdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBjYWxsKFF1aXRNZXRob2QpO1xyXG59XHJcbiIsIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xyXG5cclxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQnJvd3Nlcik7XHJcblxyXG5jb25zdCBCcm93c2VyT3BlblVSTCA9IDA7XHJcblxyXG4vKipcclxuICogT3BlbiBhIGJyb3dzZXIgd2luZG93IHRvIHRoZSBnaXZlbiBVUkwuXHJcbiAqXHJcbiAqIEBwYXJhbSB1cmwgLSBUaGUgVVJMIHRvIG9wZW5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBPcGVuVVJMKHVybDogc3RyaW5nIHwgVVJMKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gY2FsbChCcm93c2VyT3BlblVSTCwge3VybDogdXJsLnRvU3RyaW5nKCl9KTtcclxufVxyXG4iLCIvLyBTb3VyY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9pbnNwZWN0LWpzL2lzLWNhbGxhYmxlXHJcblxyXG4vLyBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuLy9cclxuLy8gQ29weXJpZ2h0IChjKSAyMDE1IEpvcmRhbiBIYXJiYW5kXHJcbi8vXHJcbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbi8vXHJcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG4vLyBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4vL1xyXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG4vLyBTT0ZUV0FSRS5cclxuXHJcbnZhciBmblRvU3RyID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xyXG52YXIgcmVmbGVjdEFwcGx5OiB0eXBlb2YgUmVmbGVjdC5hcHBseSB8IGZhbHNlIHwgbnVsbCA9IHR5cGVvZiBSZWZsZWN0ID09PSAnb2JqZWN0JyAmJiBSZWZsZWN0ICE9PSBudWxsICYmIFJlZmxlY3QuYXBwbHk7XHJcbnZhciBiYWRBcnJheUxpa2U6IGFueTtcclxudmFyIGlzQ2FsbGFibGVNYXJrZXI6IGFueTtcclxuaWYgKHR5cGVvZiByZWZsZWN0QXBwbHkgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBiYWRBcnJheUxpa2UgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdsZW5ndGgnLCB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgaXNDYWxsYWJsZU1hcmtlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlzQ2FsbGFibGVNYXJrZXIgPSB7fTtcclxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdGhyb3ctbGl0ZXJhbFxyXG4gICAgICAgIHJlZmxlY3RBcHBseShmdW5jdGlvbiAoKSB7IHRocm93IDQyOyB9LCBudWxsLCBiYWRBcnJheUxpa2UpO1xyXG4gICAgfSBjYXRjaCAoXykge1xyXG4gICAgICAgIGlmIChfICE9PSBpc0NhbGxhYmxlTWFya2VyKSB7XHJcbiAgICAgICAgICAgIHJlZmxlY3RBcHBseSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IGVsc2Uge1xyXG4gICAgcmVmbGVjdEFwcGx5ID0gbnVsbDtcclxufVxyXG5cclxudmFyIGNvbnN0cnVjdG9yUmVnZXggPSAvXlxccypjbGFzc1xcYi87XHJcbnZhciBpc0VTNkNsYXNzRm4gPSBmdW5jdGlvbiBpc0VTNkNsYXNzRnVuY3Rpb24odmFsdWU6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB2YXIgZm5TdHIgPSBmblRvU3RyLmNhbGwodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3RvclJlZ2V4LnRlc3QoZm5TdHIpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gbm90IGEgZnVuY3Rpb25cclxuICAgIH1cclxufTtcclxuXHJcbnZhciB0cnlGdW5jdGlvbk9iamVjdCA9IGZ1bmN0aW9uIHRyeUZ1bmN0aW9uVG9TdHIodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBpZiAoaXNFUzZDbGFzc0ZuKHZhbHVlKSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgICBmblRvU3RyLmNhbGwodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcclxudmFyIG9iamVjdENsYXNzID0gJ1tvYmplY3QgT2JqZWN0XSc7XHJcbnZhciBmbkNsYXNzID0gJ1tvYmplY3QgRnVuY3Rpb25dJztcclxudmFyIGdlbkNsYXNzID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJztcclxudmFyIGRkYUNsYXNzID0gJ1tvYmplY3QgSFRNTEFsbENvbGxlY3Rpb25dJzsgLy8gSUUgMTFcclxudmFyIGRkYUNsYXNzMiA9ICdbb2JqZWN0IEhUTUwgZG9jdW1lbnQuYWxsIGNsYXNzXSc7XHJcbnZhciBkZGFDbGFzczMgPSAnW29iamVjdCBIVE1MQ29sbGVjdGlvbl0nOyAvLyBJRSA5LTEwXHJcbnZhciBoYXNUb1N0cmluZ1RhZyA9IHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgISFTeW1ib2wudG9TdHJpbmdUYWc7IC8vIGJldHRlcjogdXNlIGBoYXMtdG9zdHJpbmd0YWdgXHJcblxyXG52YXIgaXNJRTY4ID0gISgwIGluIFssXSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc3BhcnNlLWFycmF5cywgY29tbWEtc3BhY2luZ1xyXG5cclxudmFyIGlzRERBOiAodmFsdWU6IGFueSkgPT4gYm9vbGVhbiA9IGZ1bmN0aW9uIGlzRG9jdW1lbnREb3RBbGwoKSB7IHJldHVybiBmYWxzZTsgfTtcclxuaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ29iamVjdCcpIHtcclxuICAgIC8vIEZpcmVmb3ggMyBjYW5vbmljYWxpemVzIEREQSB0byB1bmRlZmluZWQgd2hlbiBpdCdzIG5vdCBhY2Nlc3NlZCBkaXJlY3RseVxyXG4gICAgdmFyIGFsbCA9IGRvY3VtZW50LmFsbDtcclxuICAgIGlmICh0b1N0ci5jYWxsKGFsbCkgPT09IHRvU3RyLmNhbGwoZG9jdW1lbnQuYWxsKSkge1xyXG4gICAgICAgIGlzRERBID0gZnVuY3Rpb24gaXNEb2N1bWVudERvdEFsbCh2YWx1ZSkge1xyXG4gICAgICAgICAgICAvKiBnbG9iYWxzIGRvY3VtZW50OiBmYWxzZSAqL1xyXG4gICAgICAgICAgICAvLyBpbiBJRSA2LTgsIHR5cGVvZiBkb2N1bWVudC5hbGwgaXMgXCJvYmplY3RcIiBhbmQgaXQncyB0cnV0aHlcclxuICAgICAgICAgICAgaWYgKChpc0lFNjggfHwgIXZhbHVlKSAmJiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RyID0gdG9TdHIuY2FsbCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyID09PSBkZGFDbGFzc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBzdHIgPT09IGRkYUNsYXNzMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBzdHIgPT09IGRkYUNsYXNzMyAvLyBvcGVyYSAxMi4xNlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBzdHIgPT09IG9iamVjdENsYXNzIC8vIElFIDYtOFxyXG4gICAgICAgICAgICAgICAgICAgICkgJiYgdmFsdWUoJycpID09IG51bGw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7IC8qKi8gfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpc0NhbGxhYmxlUmVmQXBwbHk8VD4odmFsdWU6IFQgfCB1bmtub3duKTogdmFsdWUgaXMgKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkgIHtcclxuICAgIGlmIChpc0REQSh2YWx1ZSkpIHsgcmV0dXJuIHRydWU7IH1cclxuICAgIGlmICghdmFsdWUpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIChyZWZsZWN0QXBwbHkgYXMgYW55KSh2YWx1ZSwgbnVsbCwgYmFkQXJyYXlMaWtlKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBpZiAoZSAhPT0gaXNDYWxsYWJsZU1hcmtlcikgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgIH1cclxuICAgIHJldHVybiAhaXNFUzZDbGFzc0ZuKHZhbHVlKSAmJiB0cnlGdW5jdGlvbk9iamVjdCh2YWx1ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQ2FsbGFibGVOb1JlZkFwcGx5PFQ+KHZhbHVlOiBUIHwgdW5rbm93bik6IHZhbHVlIGlzICguLi5hcmdzOiBhbnlbXSkgPT4gYW55IHtcclxuICAgIGlmIChpc0REQSh2YWx1ZSkpIHsgcmV0dXJuIHRydWU7IH1cclxuICAgIGlmICghdmFsdWUpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICBpZiAoaGFzVG9TdHJpbmdUYWcpIHsgcmV0dXJuIHRyeUZ1bmN0aW9uT2JqZWN0KHZhbHVlKTsgfVxyXG4gICAgaWYgKGlzRVM2Q2xhc3NGbih2YWx1ZSkpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICB2YXIgc3RyQ2xhc3MgPSB0b1N0ci5jYWxsKHZhbHVlKTtcclxuICAgIGlmIChzdHJDbGFzcyAhPT0gZm5DbGFzcyAmJiBzdHJDbGFzcyAhPT0gZ2VuQ2xhc3MgJiYgISgvXlxcW29iamVjdCBIVE1MLykudGVzdChzdHJDbGFzcykpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICByZXR1cm4gdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgcmVmbGVjdEFwcGx5ID8gaXNDYWxsYWJsZVJlZkFwcGx5IDogaXNDYWxsYWJsZU5vUmVmQXBwbHk7XHJcbiIsIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbmltcG9ydCBpc0NhbGxhYmxlIGZyb20gXCIuL2NhbGxhYmxlLmpzXCI7XHJcblxyXG4vKipcclxuICogRXhjZXB0aW9uIGNsYXNzIHRoYXQgd2lsbCBiZSB1c2VkIGFzIHJlamVjdGlvbiByZWFzb25cclxuICogaW4gY2FzZSBhIHtAbGluayBDYW5jZWxsYWJsZVByb21pc2V9IGlzIGNhbmNlbGxlZCBzdWNjZXNzZnVsbHkuXHJcbiAqXHJcbiAqIFRoZSB2YWx1ZSBvZiB0aGUge0BsaW5rIG5hbWV9IHByb3BlcnR5IGlzIHRoZSBzdHJpbmcgYFwiQ2FuY2VsRXJyb3JcImAuXHJcbiAqIFRoZSB2YWx1ZSBvZiB0aGUge0BsaW5rIGNhdXNlfSBwcm9wZXJ0eSBpcyB0aGUgY2F1c2UgcGFzc2VkIHRvIHRoZSBjYW5jZWwgbWV0aG9kLCBpZiBhbnkuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2FuY2VsRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgYENhbmNlbEVycm9yYCBpbnN0YW5jZS5cclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBFcnJvciBjb25zdHJ1Y3Rvci5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgb3B0aW9ucz86IEVycm9yT3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiQ2FuY2VsRXJyb3JcIjtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEV4Y2VwdGlvbiBjbGFzcyB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgYXMgYW4gdW5oYW5kbGVkIHJlamVjdGlvblxyXG4gKiBpbiBjYXNlIGEge0BsaW5rIENhbmNlbGxhYmxlUHJvbWlzZX0gcmVqZWN0cyBhZnRlciBiZWluZyBjYW5jZWxsZWQsXHJcbiAqIG9yIHdoZW4gdGhlIGBvbmNhbmNlbGxlZGAgY2FsbGJhY2sgdGhyb3dzIG9yIHJlamVjdHMuXHJcbiAqXHJcbiAqIFRoZSB2YWx1ZSBvZiB0aGUge0BsaW5rIG5hbWV9IHByb3BlcnR5IGlzIHRoZSBzdHJpbmcgYFwiQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3JcImAuXHJcbiAqIFRoZSB2YWx1ZSBvZiB0aGUge0BsaW5rIGNhdXNlfSBwcm9wZXJ0eSBpcyB0aGUgcmVhc29uIHRoZSBwcm9taXNlIHJlamVjdGVkIHdpdGguXHJcbiAqXHJcbiAqIEJlY2F1c2UgdGhlIG9yaWdpbmFsIHByb21pc2Ugd2FzIGNhbmNlbGxlZCxcclxuICogYSB3cmFwcGVyIHByb21pc2Ugd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHVuaGFuZGxlZCByZWplY3Rpb24gbGlzdGVuZXIgaW5zdGVhZC5cclxuICogVGhlIHtAbGluayBwcm9taXNlfSBwcm9wZXJ0eSBob2xkcyBhIHJlZmVyZW5jZSB0byB0aGUgb3JpZ2luYWwgcHJvbWlzZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDYW5jZWxsZWRSZWplY3Rpb25FcnJvciBleHRlbmRzIEVycm9yIHtcclxuICAgIC8qKlxyXG4gICAgICogSG9sZHMgYSByZWZlcmVuY2UgdG8gdGhlIHByb21pc2UgdGhhdCB3YXMgY2FuY2VsbGVkIGFuZCB0aGVuIHJlamVjdGVkLlxyXG4gICAgICovXHJcbiAgICBwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcmAgaW5zdGFuY2UuXHJcbiAgICAgKiBAcGFyYW0gcHJvbWlzZSAtIFRoZSBwcm9taXNlIHRoYXQgY2F1c2VkIHRoZSBlcnJvciBvcmlnaW5hbGx5LlxyXG4gICAgICogQHBhcmFtIHJlYXNvbiAtIFRoZSByZWplY3Rpb24gcmVhc29uLlxyXG4gICAgICogQHBhcmFtIGluZm8gLSBBbiBvcHRpb25hbCBpbmZvcm1hdGl2ZSBtZXNzYWdlIHNwZWNpZnlpbmcgdGhlIGNpcmN1bXN0YW5jZXMgaW4gd2hpY2ggdGhlIGVycm9yIHdhcyB0aHJvd24uXHJcbiAgICAgKiAgICAgICAgICAgICAgIERlZmF1bHRzIHRvIHRoZSBzdHJpbmcgYFwiVW5oYW5kbGVkIHJlamVjdGlvbiBpbiBjYW5jZWxsZWQgcHJvbWlzZS5cImAuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHByb21pc2U6IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPiwgcmVhc29uPzogYW55LCBpbmZvPzogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIoKGluZm8gPz8gXCJVbmhhbmRsZWQgcmVqZWN0aW9uIGluIGNhbmNlbGxlZCBwcm9taXNlLlwiKSArIFwiIFJlYXNvbjogXCIgKyBlcnJvck1lc3NhZ2UocmVhc29uKSwgeyBjYXVzZTogcmVhc29uIH0pO1xyXG4gICAgICAgIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJDYW5jZWxsZWRSZWplY3Rpb25FcnJvclwiO1xyXG4gICAgfVxyXG59XHJcblxyXG50eXBlIENhbmNlbGxhYmxlUHJvbWlzZVJlc29sdmVyPFQ+ID0gKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4gfCBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xyXG50eXBlIENhbmNlbGxhYmxlUHJvbWlzZVJlamVjdG9yID0gKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcclxudHlwZSBDYW5jZWxsYWJsZVByb21pc2VDYW5jZWxsZXIgPSAoY2F1c2U/OiBhbnkpID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPjtcclxudHlwZSBDYW5jZWxsYWJsZVByb21pc2VFeGVjdXRvcjxUPiA9IChyZXNvbHZlOiBDYW5jZWxsYWJsZVByb21pc2VSZXNvbHZlcjxUPiwgcmVqZWN0OiBDYW5jZWxsYWJsZVByb21pc2VSZWplY3RvcikgPT4gdm9pZDtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUPiB7XHJcbiAgICB0aGVuPFRSZXN1bHQxID0gVCwgVFJlc3VsdDIgPSBuZXZlcj4ob25mdWxmaWxsZWQ/OiAoKHZhbHVlOiBUKSA9PiBUUmVzdWx0MSB8IFByb21pc2VMaWtlPFRSZXN1bHQxPiB8IENhbmNlbGxhYmxlUHJvbWlzZUxpa2U8VFJlc3VsdDE+KSB8IHVuZGVmaW5lZCB8IG51bGwsIG9ucmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiBUUmVzdWx0MiB8IFByb21pc2VMaWtlPFRSZXN1bHQyPiB8IENhbmNlbGxhYmxlUHJvbWlzZUxpa2U8VFJlc3VsdDI+KSB8IHVuZGVmaW5lZCB8IG51bGwpOiBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFRSZXN1bHQxIHwgVFJlc3VsdDI+O1xyXG4gICAgY2FuY2VsKGNhdXNlPzogYW55KTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+O1xyXG59XHJcblxyXG4vKipcclxuICogV3JhcHMgYSBjYW5jZWxsYWJsZSBwcm9taXNlIGFsb25nIHdpdGggaXRzIHJlc29sdXRpb24gbWV0aG9kcy5cclxuICogVGhlIGBvbmNhbmNlbGxlZGAgZmllbGQgd2lsbCBiZSBudWxsIGluaXRpYWxseSBidXQgbWF5IGJlIHNldCB0byBwcm92aWRlIGEgY3VzdG9tIGNhbmNlbGxhdGlvbiBmdW5jdGlvbi5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiB7XHJcbiAgICBwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2U8VD47XHJcbiAgICByZXNvbHZlOiBDYW5jZWxsYWJsZVByb21pc2VSZXNvbHZlcjxUPjtcclxuICAgIHJlamVjdDogQ2FuY2VsbGFibGVQcm9taXNlUmVqZWN0b3I7XHJcbiAgICBvbmNhbmNlbGxlZDogQ2FuY2VsbGFibGVQcm9taXNlQ2FuY2VsbGVyIHwgbnVsbDtcclxufVxyXG5cclxuaW50ZXJmYWNlIENhbmNlbGxhYmxlUHJvbWlzZVN0YXRlIHtcclxuICAgIHJlYWRvbmx5IHJvb3Q6IENhbmNlbGxhYmxlUHJvbWlzZVN0YXRlO1xyXG4gICAgcmVzb2x2aW5nOiBib29sZWFuO1xyXG4gICAgc2V0dGxlZDogYm9vbGVhbjtcclxuICAgIHJlYXNvbj86IENhbmNlbEVycm9yO1xyXG59XHJcblxyXG4vLyBQcml2YXRlIGZpZWxkIG5hbWVzLlxyXG5jb25zdCBiYXJyaWVyU3ltID0gU3ltYm9sKFwiYmFycmllclwiKTtcclxuY29uc3QgY2FuY2VsSW1wbFN5bSA9IFN5bWJvbChcImNhbmNlbEltcGxcIik7XHJcbmNvbnN0IHNwZWNpZXM6IHR5cGVvZiBTeW1ib2wuc3BlY2llcyA9IFN5bWJvbC5zcGVjaWVzID8/IFN5bWJvbChcInNwZWNpZXNQb2x5ZmlsbFwiKTtcclxuXHJcbi8qKlxyXG4gKiBBIHByb21pc2Ugd2l0aCBhbiBhdHRhY2hlZCBtZXRob2QgZm9yIGNhbmNlbGxpbmcgbG9uZy1ydW5uaW5nIG9wZXJhdGlvbnMgKHNlZSB7QGxpbmsgQ2FuY2VsbGFibGVQcm9taXNlI2NhbmNlbH0pLlxyXG4gKiBDYW5jZWxsYXRpb24gY2FuIG9wdGlvbmFsbHkgYmUgYm91bmQgdG8gYW4ge0BsaW5rIEFib3J0U2lnbmFsfVxyXG4gKiBmb3IgYmV0dGVyIGNvbXBvc2FiaWxpdHkgKHNlZSB7QGxpbmsgQ2FuY2VsbGFibGVQcm9taXNlI2NhbmNlbE9ufSkuXHJcbiAqXHJcbiAqIENhbmNlbGxpbmcgYSBwZW5kaW5nIHByb21pc2Ugd2lsbCByZXN1bHQgaW4gYW4gaW1tZWRpYXRlIHJlamVjdGlvblxyXG4gKiB3aXRoIGFuIGluc3RhbmNlIG9mIHtAbGluayBDYW5jZWxFcnJvcn0gYXMgcmVhc29uLFxyXG4gKiBidXQgd2hvZXZlciBzdGFydGVkIHRoZSBwcm9taXNlIHdpbGwgYmUgcmVzcG9uc2libGVcclxuICogZm9yIGFjdHVhbGx5IGFib3J0aW5nIHRoZSB1bmRlcmx5aW5nIG9wZXJhdGlvbi5cclxuICogVG8gdGhpcyBwdXJwb3NlLCB0aGUgY29uc3RydWN0b3IgYW5kIGFsbCBjaGFpbmluZyBtZXRob2RzXHJcbiAqIGFjY2VwdCBvcHRpb25hbCBjYW5jZWxsYXRpb24gY2FsbGJhY2tzLlxyXG4gKlxyXG4gKiBJZiBhIGBDYW5jZWxsYWJsZVByb21pc2VgIHN0aWxsIHJlc29sdmVzIGFmdGVyIGhhdmluZyBiZWVuIGNhbmNlbGxlZCxcclxuICogdGhlIHJlc3VsdCB3aWxsIGJlIGRpc2NhcmRlZC4gSWYgaXQgcmVqZWN0cywgdGhlIHJlYXNvblxyXG4gKiB3aWxsIGJlIHJlcG9ydGVkIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24sXHJcbiAqIHdyYXBwZWQgaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGluc3RhbmNlLlxyXG4gKiBUbyBmYWNpbGl0YXRlIHRoZSBoYW5kbGluZyBvZiBjYW5jZWxsYXRpb24gcmVxdWVzdHMsXHJcbiAqIGNhbmNlbGxlZCBgQ2FuY2VsbGFibGVQcm9taXNlYHMgd2lsbCBfbm90XyByZXBvcnQgdW5oYW5kbGVkIGBDYW5jZWxFcnJvcmBzXHJcbiAqIHdob3NlIGBjYXVzZWAgZmllbGQgaXMgdGhlIHNhbWUgYXMgdGhlIG9uZSB3aXRoIHdoaWNoIHRoZSBjdXJyZW50IHByb21pc2Ugd2FzIGNhbmNlbGxlZC5cclxuICpcclxuICogQWxsIHVzdWFsIHByb21pc2UgbWV0aG9kcyBhcmUgZGVmaW5lZCBhbmQgcmV0dXJuIGEgYENhbmNlbGxhYmxlUHJvbWlzZWBcclxuICogd2hvc2UgY2FuY2VsIG1ldGhvZCB3aWxsIGNhbmNlbCB0aGUgcGFyZW50IG9wZXJhdGlvbiBhcyB3ZWxsLCBwcm9wYWdhdGluZyB0aGUgY2FuY2VsbGF0aW9uIHJlYXNvblxyXG4gKiB1cHdhcmRzIHRocm91Z2ggcHJvbWlzZSBjaGFpbnMuXHJcbiAqIENvbnZlcnNlbHksIGNhbmNlbGxpbmcgYSBwcm9taXNlIHdpbGwgbm90IGF1dG9tYXRpY2FsbHkgY2FuY2VsIGRlcGVuZGVudCBwcm9taXNlcyBkb3duc3RyZWFtOlxyXG4gKiBgYGB0c1xyXG4gKiBsZXQgcm9vdCA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4geyAuLi4gfSk7XHJcbiAqIGxldCBjaGlsZDEgPSByb290LnRoZW4oKCkgPT4geyAuLi4gfSk7XHJcbiAqIGxldCBjaGlsZDIgPSBjaGlsZDEudGhlbigoKSA9PiB7IC4uLiB9KTtcclxuICogbGV0IGNoaWxkMyA9IHJvb3QuY2F0Y2goKCkgPT4geyAuLi4gfSk7XHJcbiAqIGNoaWxkMS5jYW5jZWwoKTsgLy8gQ2FuY2VscyBjaGlsZDEgYW5kIHJvb3QsIGJ1dCBub3QgY2hpbGQyIG9yIGNoaWxkM1xyXG4gKiBgYGBcclxuICogQ2FuY2VsbGluZyBhIHByb21pc2UgdGhhdCBoYXMgYWxyZWFkeSBzZXR0bGVkIGlzIHNhZmUgYW5kIGhhcyBubyBjb25zZXF1ZW5jZS5cclxuICpcclxuICogVGhlIGBjYW5jZWxgIG1ldGhvZCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IF9hbHdheXMgZnVsZmlsbHNfXHJcbiAqIGFmdGVyIHRoZSB3aG9sZSBjaGFpbiBoYXMgcHJvY2Vzc2VkIHRoZSBjYW5jZWwgcmVxdWVzdFxyXG4gKiBhbmQgYWxsIGF0dGFjaGVkIGNhbGxiYWNrcyB1cCB0byB0aGF0IG1vbWVudCBoYXZlIHJ1bi5cclxuICpcclxuICogQWxsIEVTMjAyNCBwcm9taXNlIG1ldGhvZHMgKHN0YXRpYyBhbmQgaW5zdGFuY2UpIGFyZSBkZWZpbmVkIG9uIENhbmNlbGxhYmxlUHJvbWlzZSxcclxuICogYnV0IGFjdHVhbCBhdmFpbGFiaWxpdHkgbWF5IHZhcnkgd2l0aCBPUy93ZWJ2aWV3IHZlcnNpb24uXHJcbiAqXHJcbiAqIEluIGxpbmUgd2l0aCB0aGUgcHJvcG9zYWwgYXQgaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtcm0tYnVpbHRpbi1zdWJjbGFzc2luZyxcclxuICogYENhbmNlbGxhYmxlUHJvbWlzZWAgZG9lcyBub3Qgc3VwcG9ydCB0cmFuc3BhcmVudCBzdWJjbGFzc2luZy5cclxuICogRXh0ZW5kZXJzIHNob3VsZCB0YWtlIGNhcmUgdG8gcHJvdmlkZSB0aGVpciBvd24gbWV0aG9kIGltcGxlbWVudGF0aW9ucy5cclxuICogVGhpcyBtaWdodCBiZSByZWNvbnNpZGVyZWQgaW4gY2FzZSB0aGUgcHJvcG9zYWwgaXMgcmV0aXJlZC5cclxuICpcclxuICogQ2FuY2VsbGFibGVQcm9taXNlIGlzIGEgd3JhcHBlciBhcm91bmQgdGhlIERPTSBQcm9taXNlIG9iamVjdFxyXG4gKiBhbmQgaXMgY29tcGxpYW50IHdpdGggdGhlIFtQcm9taXNlcy9BKyBzcGVjaWZpY2F0aW9uXShodHRwczovL3Byb21pc2VzYXBsdXMuY29tLylcclxuICogKGl0IHBhc3NlcyB0aGUgW2NvbXBsaWFuY2Ugc3VpdGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy10ZXN0cykpXHJcbiAqIGlmIHNvIGlzIHRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENhbmNlbGxhYmxlUHJvbWlzZTxUPiBleHRlbmRzIFByb21pc2U8VD4gaW1wbGVtZW50cyBQcm9taXNlTGlrZTxUPiwgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUPiB7XHJcbiAgICAvLyBQcml2YXRlIGZpZWxkcy5cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIHByaXZhdGUgW2JhcnJpZXJTeW1dITogUGFydGlhbDxQcm9taXNlV2l0aFJlc29sdmVyczx2b2lkPj4gfCBudWxsO1xyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBbY2FuY2VsSW1wbFN5bV0hOiAocmVhc29uOiBDYW5jZWxFcnJvcikgPT4gdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBgQ2FuY2VsbGFibGVQcm9taXNlYC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZXhlY3V0b3IgLSBBIGNhbGxiYWNrIHVzZWQgdG8gaW5pdGlhbGl6ZSB0aGUgcHJvbWlzZS4gVGhpcyBjYWxsYmFjayBpcyBwYXNzZWQgdHdvIGFyZ3VtZW50czpcclxuICAgICAqICAgICAgICAgICAgICAgICAgIGEgYHJlc29sdmVgIGNhbGxiYWNrIHVzZWQgdG8gcmVzb2x2ZSB0aGUgcHJvbWlzZSB3aXRoIGEgdmFsdWVcclxuICAgICAqICAgICAgICAgICAgICAgICAgIG9yIHRoZSByZXN1bHQgb2YgYW5vdGhlciBwcm9taXNlIChwb3NzaWJseSBjYW5jZWxsYWJsZSksXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICBhbmQgYSBgcmVqZWN0YCBjYWxsYmFjayB1c2VkIHRvIHJlamVjdCB0aGUgcHJvbWlzZSB3aXRoIGEgcHJvdmlkZWQgcmVhc29uIG9yIGVycm9yLlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgSWYgdGhlIHZhbHVlIHByb3ZpZGVkIHRvIHRoZSBgcmVzb2x2ZWAgY2FsbGJhY2sgaXMgYSB0aGVuYWJsZSBfYW5kXyBjYW5jZWxsYWJsZSBvYmplY3RcclxuICAgICAqICAgICAgICAgICAgICAgICAgIChpdCBoYXMgYSBgdGhlbmAgX2FuZF8gYSBgY2FuY2VsYCBtZXRob2QpLFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIHdpbGwgYmUgZm9yd2FyZGVkIHRvIHRoYXQgb2JqZWN0IGFuZCB0aGUgb25jYW5jZWxsZWQgd2lsbCBub3QgYmUgaW52b2tlZCBhbnltb3JlLlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgSWYgYW55IG9uZSBvZiB0aGUgdHdvIGNhbGxiYWNrcyBpcyBjYWxsZWQgX2FmdGVyXyB0aGUgcHJvbWlzZSBoYXMgYmVlbiBjYW5jZWxsZWQsXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICB0aGUgcHJvdmlkZWQgdmFsdWVzIHdpbGwgYmUgY2FuY2VsbGVkIGFuZCByZXNvbHZlZCBhcyB1c3VhbCxcclxuICAgICAqICAgICAgICAgICAgICAgICAgIGJ1dCB0aGVpciByZXN1bHRzIHdpbGwgYmUgZGlzY2FyZGVkLlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgSG93ZXZlciwgaWYgdGhlIHJlc29sdXRpb24gcHJvY2VzcyB1bHRpbWF0ZWx5IGVuZHMgdXAgaW4gYSByZWplY3Rpb25cclxuICAgICAqICAgICAgICAgICAgICAgICAgIHRoYXQgaXMgbm90IGR1ZSB0byBjYW5jZWxsYXRpb24sIHRoZSByZWplY3Rpb24gcmVhc29uXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICB3aWxsIGJlIHdyYXBwZWQgaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9XHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICBhbmQgYnViYmxlZCB1cCBhcyBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIG9uY2FuY2VsbGVkIC0gSXQgaXMgdGhlIGNhbGxlcidzIHJlc3BvbnNpYmlsaXR5IHRvIGVuc3VyZSB0aGF0IGFueSBvcGVyYXRpb25cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ZWQgYnkgdGhlIGV4ZWN1dG9yIGlzIHByb3Blcmx5IGhhbHRlZCB1cG9uIGNhbmNlbGxhdGlvbi5cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIFRoaXMgb3B0aW9uYWwgY2FsbGJhY2sgY2FuIGJlIHVzZWQgdG8gdGhhdCBwdXJwb3NlLlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgSXQgd2lsbCBiZSBjYWxsZWQgX3N5bmNocm9ub3VzbHlfIHdpdGggYSBjYW5jZWxsYXRpb24gY2F1c2VcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIHdoZW4gY2FuY2VsbGF0aW9uIGlzIHJlcXVlc3RlZCwgX2FmdGVyXyB0aGUgcHJvbWlzZSBoYXMgYWxyZWFkeSByZWplY3RlZFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgd2l0aCBhIHtAbGluayBDYW5jZWxFcnJvcn0sIGJ1dCBfYmVmb3JlX1xyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgYW55IHtAbGluayB0aGVufS97QGxpbmsgY2F0Y2h9L3tAbGluayBmaW5hbGx5fSBjYWxsYmFjayBydW5zLlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgSWYgdGhlIGNhbGxiYWNrIHJldHVybnMgYSB0aGVuYWJsZSwgdGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB7QGxpbmsgY2FuY2VsfVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgd2lsbCBvbmx5IGZ1bGZpbGwgYWZ0ZXIgdGhlIGZvcm1lciBoYXMgc2V0dGxlZC5cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIFVuaGFuZGxlZCBleGNlcHRpb25zIG9yIHJlamVjdGlvbnMgZnJvbSB0aGUgY2FsbGJhY2sgd2lsbCBiZSB3cmFwcGVkXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICBpbiBhIHtAbGluayBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcn0gYW5kIGJ1YmJsZWQgdXAgYXMgdW5oYW5kbGVkIHJlamVjdGlvbnMuXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICBJZiB0aGUgYHJlc29sdmVgIGNhbGxiYWNrIGlzIGNhbGxlZCBiZWZvcmUgY2FuY2VsbGF0aW9uIHdpdGggYSBjYW5jZWxsYWJsZSBwcm9taXNlLFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIG9uIHRoaXMgcHJvbWlzZSB3aWxsIGJlIGRpdmVydGVkIHRvIHRoYXQgcHJvbWlzZSxcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIGFuZCB0aGUgb3JpZ2luYWwgYG9uY2FuY2VsbGVkYCBjYWxsYmFjayB3aWxsIGJlIGRpc2NhcmRlZC5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZXhlY3V0b3I6IENhbmNlbGxhYmxlUHJvbWlzZUV4ZWN1dG9yPFQ+LCBvbmNhbmNlbGxlZD86IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlcikge1xyXG4gICAgICAgIGxldCByZXNvbHZlITogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XHJcbiAgICAgICAgbGV0IHJlamVjdCE6IChyZWFzb24/OiBhbnkpID0+IHZvaWQ7XHJcbiAgICAgICAgc3VwZXIoKHJlcywgcmVqKSA9PiB7IHJlc29sdmUgPSByZXM7IHJlamVjdCA9IHJlajsgfSk7XHJcblxyXG4gICAgICAgIGlmICgodGhpcy5jb25zdHJ1Y3RvciBhcyBhbnkpW3NwZWNpZXNdICE9PSBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5jZWxsYWJsZVByb21pc2UgZG9lcyBub3Qgc3VwcG9ydCB0cmFuc3BhcmVudCBzdWJjbGFzc2luZy4gUGxlYXNlIHJlZnJhaW4gZnJvbSBvdmVycmlkaW5nIHRoZSBbU3ltYm9sLnNwZWNpZXNdIHN0YXRpYyBwcm9wZXJ0eS5cIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiA9IHtcclxuICAgICAgICAgICAgcHJvbWlzZTogdGhpcyxcclxuICAgICAgICAgICAgcmVzb2x2ZSxcclxuICAgICAgICAgICAgcmVqZWN0LFxyXG4gICAgICAgICAgICBnZXQgb25jYW5jZWxsZWQoKSB7IHJldHVybiBvbmNhbmNlbGxlZCA/PyBudWxsOyB9LFxyXG4gICAgICAgICAgICBzZXQgb25jYW5jZWxsZWQoY2IpIHsgb25jYW5jZWxsZWQgPSBjYiA/PyB1bmRlZmluZWQ7IH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZTogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGUgPSB7XHJcbiAgICAgICAgICAgIGdldCByb290KCkgeyByZXR1cm4gc3RhdGU7IH0sXHJcbiAgICAgICAgICAgIHJlc29sdmluZzogZmFsc2UsXHJcbiAgICAgICAgICAgIHNldHRsZWQ6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gU2V0dXAgY2FuY2VsbGF0aW9uIHN5c3RlbS5cclxuICAgICAgICB2b2lkIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcclxuICAgICAgICAgICAgW2JhcnJpZXJTeW1dOiB7XHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtjYW5jZWxJbXBsU3ltXToge1xyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNhbmNlbGxlckZvcihwcm9taXNlLCBzdGF0ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSdW4gdGhlIGFjdHVhbCBleGVjdXRvci5cclxuICAgICAgICBjb25zdCByZWplY3RvciA9IHJlamVjdG9yRm9yKHByb21pc2UsIHN0YXRlKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBleGVjdXRvcihyZXNvbHZlckZvcihwcm9taXNlLCBzdGF0ZSksIHJlamVjdG9yKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgaWYgKHN0YXRlLnJlc29sdmluZykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmhhbmRsZWQgZXhjZXB0aW9uIGluIENhbmNlbGxhYmxlUHJvbWlzZSBleGVjdXRvci5cIiwgZXJyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdG9yKGVycik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYW5jZWxzIGltbWVkaWF0ZWx5IHRoZSBleGVjdXRpb24gb2YgdGhlIG9wZXJhdGlvbiBhc3NvY2lhdGVkIHdpdGggdGhpcyBwcm9taXNlLlxyXG4gICAgICogVGhlIHByb21pc2UgcmVqZWN0cyB3aXRoIGEge0BsaW5rIENhbmNlbEVycm9yfSBpbnN0YW5jZSBhcyByZWFzb24sXHJcbiAgICAgKiB3aXRoIHRoZSB7QGxpbmsgQ2FuY2VsRXJyb3IjY2F1c2V9IHByb3BlcnR5IHNldCB0byB0aGUgZ2l2ZW4gYXJndW1lbnQsIGlmIGFueS5cclxuICAgICAqXHJcbiAgICAgKiBIYXMgbm8gZWZmZWN0IGlmIGNhbGxlZCBhZnRlciB0aGUgcHJvbWlzZSBoYXMgYWxyZWFkeSBzZXR0bGVkO1xyXG4gICAgICogcmVwZWF0ZWQgY2FsbHMgaW4gcGFydGljdWxhciBhcmUgc2FmZSwgYnV0IG9ubHkgdGhlIGZpcnN0IG9uZVxyXG4gICAgICogd2lsbCBzZXQgdGhlIGNhbmNlbGxhdGlvbiBjYXVzZS5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgYENhbmNlbEVycm9yYCBleGNlcHRpb24gX25lZWQgbm90XyBiZSBoYW5kbGVkIGV4cGxpY2l0bHkgX29uIHRoZSBwcm9taXNlcyB0aGF0IGFyZSBiZWluZyBjYW5jZWxsZWQ6X1xyXG4gICAgICogY2FuY2VsbGluZyBhIHByb21pc2Ugd2l0aCBubyBhdHRhY2hlZCByZWplY3Rpb24gaGFuZGxlciBkb2VzIG5vdCB0cmlnZ2VyIGFuIHVuaGFuZGxlZCByZWplY3Rpb24gZXZlbnQuXHJcbiAgICAgKiBUaGVyZWZvcmUsIHRoZSBmb2xsb3dpbmcgaWRpb21zIGFyZSBhbGwgZXF1YWxseSBjb3JyZWN0OlxyXG4gICAgICogYGBgdHNcclxuICAgICAqIG5ldyBDYW5jZWxsYWJsZVByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4geyAuLi4gfSkuY2FuY2VsKCk7XHJcbiAgICAgKiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgLi4uIH0pLnRoZW4oLi4uKS5jYW5jZWwoKTtcclxuICAgICAqIG5ldyBDYW5jZWxsYWJsZVByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4geyAuLi4gfSkudGhlbiguLi4pLmNhdGNoKC4uLikuY2FuY2VsKCk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqIFdoZW5ldmVyIHNvbWUgY2FuY2VsbGVkIHByb21pc2UgaW4gYSBjaGFpbiByZWplY3RzIHdpdGggYSBgQ2FuY2VsRXJyb3JgXHJcbiAgICAgKiB3aXRoIHRoZSBzYW1lIGNhbmNlbGxhdGlvbiBjYXVzZSBhcyBpdHNlbGYsIHRoZSBlcnJvciB3aWxsIGJlIGRpc2NhcmRlZCBzaWxlbnRseS5cclxuICAgICAqIEhvd2V2ZXIsIHRoZSBgQ2FuY2VsRXJyb3JgIF93aWxsIHN0aWxsIGJlIGRlbGl2ZXJlZF8gdG8gYWxsIGF0dGFjaGVkIHJlamVjdGlvbiBoYW5kbGVyc1xyXG4gICAgICogYWRkZWQgYnkge0BsaW5rIHRoZW59IGFuZCByZWxhdGVkIG1ldGhvZHM6XHJcbiAgICAgKiBgYGB0c1xyXG4gICAgICogbGV0IGNhbmNlbGxhYmxlID0gbmV3IENhbmNlbGxhYmxlUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7IC4uLiB9KTtcclxuICAgICAqIGNhbmNlbGxhYmxlLnRoZW4oKCkgPT4geyAuLi4gfSkuY2F0Y2goY29uc29sZS5sb2cpO1xyXG4gICAgICogY2FuY2VsbGFibGUuY2FuY2VsKCk7IC8vIEEgQ2FuY2VsRXJyb3IgaXMgcHJpbnRlZCB0byB0aGUgY29uc29sZS5cclxuICAgICAqIGBgYFxyXG4gICAgICogSWYgdGhlIGBDYW5jZWxFcnJvcmAgaXMgbm90IGhhbmRsZWQgZG93bnN0cmVhbSBieSB0aGUgdGltZSBpdCByZWFjaGVzXHJcbiAgICAgKiBhIF9ub24tY2FuY2VsbGVkXyBwcm9taXNlLCBpdCBfd2lsbF8gdHJpZ2dlciBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uIGV2ZW50LFxyXG4gICAgICoganVzdCBsaWtlIG5vcm1hbCByZWplY3Rpb25zIHdvdWxkOlxyXG4gICAgICogYGBgdHNcclxuICAgICAqIGxldCBjYW5jZWxsYWJsZSA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4geyAuLi4gfSk7XHJcbiAgICAgKiBsZXQgY2hhaW5lZCA9IGNhbmNlbGxhYmxlLnRoZW4oKCkgPT4geyAuLi4gfSkudGhlbigoKSA9PiB7IC4uLiB9KTsgLy8gTm8gY2F0Y2guLi5cclxuICAgICAqIGNhbmNlbGxhYmxlLmNhbmNlbCgpOyAvLyBVbmhhbmRsZWQgcmVqZWN0aW9uIGV2ZW50IG9uIGNoYWluZWQhXHJcbiAgICAgKiBgYGBcclxuICAgICAqIFRoZXJlZm9yZSwgaXQgaXMgaW1wb3J0YW50IHRvIGVpdGhlciBjYW5jZWwgd2hvbGUgcHJvbWlzZSBjaGFpbnMgZnJvbSB0aGVpciB0YWlsLFxyXG4gICAgICogYXMgc2hvd24gaW4gdGhlIGNvcnJlY3QgaWRpb21zIGFib3ZlLCBvciB0YWtlIGNhcmUgb2YgaGFuZGxpbmcgZXJyb3JzIGV2ZXJ5d2hlcmUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgQSBjYW5jZWxsYWJsZSBwcm9taXNlIHRoYXQgX2Z1bGZpbGxzXyBhZnRlciB0aGUgY2FuY2VsIGNhbGxiYWNrIChpZiBhbnkpXHJcbiAgICAgKiBhbmQgYWxsIGhhbmRsZXJzIGF0dGFjaGVkIHVwIHRvIHRoZSBjYWxsIHRvIGNhbmNlbCBoYXZlIHJ1bi5cclxuICAgICAqIElmIHRoZSBjYW5jZWwgY2FsbGJhY2sgcmV0dXJucyBhIHRoZW5hYmxlLCB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSBgY2FuY2VsYFxyXG4gICAgICogd2lsbCBhbHNvIHdhaXQgZm9yIHRoYXQgdGhlbmFibGUgdG8gc2V0dGxlLlxyXG4gICAgICogVGhpcyBlbmFibGVzIGNhbGxlcnMgdG8gd2FpdCBmb3IgdGhlIGNhbmNlbGxlZCBvcGVyYXRpb24gdG8gdGVybWluYXRlXHJcbiAgICAgKiB3aXRob3V0IGJlaW5nIGZvcmNlZCB0byBoYW5kbGUgcG90ZW50aWFsIGVycm9ycyBhdCB0aGUgY2FsbCBzaXRlLlxyXG4gICAgICogYGBgdHNcclxuICAgICAqIGNhbmNlbGxhYmxlLmNhbmNlbCgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICogICAgIC8vIENsZWFudXAgZmluaXNoZWQsIGl0J3Mgc2FmZSB0byBkbyBzb21ldGhpbmcgZWxzZS5cclxuICAgICAqIH0sIChlcnIpID0+IHtcclxuICAgICAqICAgICAvLyBVbnJlYWNoYWJsZTogdGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSBjYW5jZWwgd2lsbCBuZXZlciByZWplY3QuXHJcbiAgICAgKiB9KTtcclxuICAgICAqIGBgYFxyXG4gICAgICogTm90ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgX25vdF8gaGFuZGxlIGltcGxpY2l0bHkgYW55IHJlamVjdGlvblxyXG4gICAgICogdGhhdCBtaWdodCBoYXZlIG9jY3VycmVkIGFscmVhZHkgaW4gdGhlIGNhbmNlbGxlZCBjaGFpbi5cclxuICAgICAqIEl0IHdpbGwganVzdCB0cmFjayB3aGV0aGVyIHJlZ2lzdGVyZWQgaGFuZGxlcnMgaGF2ZSBiZWVuIGV4ZWN1dGVkIG9yIG5vdC5cclxuICAgICAqIFRoZXJlZm9yZSwgdW5oYW5kbGVkIHJlamVjdGlvbnMgd2lsbCBuZXZlciBiZSBzaWxlbnRseSBoYW5kbGVkIGJ5IGNhbGxpbmcgY2FuY2VsLlxyXG4gICAgICovXHJcbiAgICBjYW5jZWwoY2F1c2U/OiBhbnkpOiBDYW5jZWxsYWJsZVByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIElOVkFSSUFOVDogdGhlIHJlc3VsdCBvZiB0aGlzW2NhbmNlbEltcGxTeW1dIGFuZCB0aGUgYmFycmllciBkbyBub3QgZXZlciByZWplY3QuXHJcbiAgICAgICAgICAgIC8vIFVuZm9ydHVuYXRlbHkgbWFjT1MgSGlnaCBTaWVycmEgZG9lcyBub3Qgc3VwcG9ydCBQcm9taXNlLmFsbFNldHRsZWQuXHJcbiAgICAgICAgICAgIFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgICAgIHRoaXNbY2FuY2VsSW1wbFN5bV0obmV3IENhbmNlbEVycm9yKFwiUHJvbWlzZSBjYW5jZWxsZWQuXCIsIHsgY2F1c2UgfSkpLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudEJhcnJpZXIodGhpcylcclxuICAgICAgICAgICAgXSkudGhlbigoKSA9PiByZXNvbHZlKCksICgpID0+IHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyBwcm9taXNlIGNhbmNlbGxhdGlvbiB0byB0aGUgYWJvcnQgZXZlbnQgb2YgdGhlIGdpdmVuIHtAbGluayBBYm9ydFNpZ25hbH0uXHJcbiAgICAgKiBJZiB0aGUgc2lnbmFsIGhhcyBhbHJlYWR5IGFib3J0ZWQsIHRoZSBwcm9taXNlIHdpbGwgYmUgY2FuY2VsbGVkIGltbWVkaWF0ZWx5LlxyXG4gICAgICogV2hlbiBlaXRoZXIgY29uZGl0aW9uIGlzIHZlcmlmaWVkLCB0aGUgY2FuY2VsbGF0aW9uIGNhdXNlIHdpbGwgYmUgc2V0XHJcbiAgICAgKiB0byB0aGUgc2lnbmFsJ3MgYWJvcnQgcmVhc29uIChzZWUge0BsaW5rIEFib3J0U2lnbmFsI3JlYXNvbn0pLlxyXG4gICAgICpcclxuICAgICAqIEhhcyBubyBlZmZlY3QgaWYgY2FsbGVkIChvciBpZiB0aGUgc2lnbmFsIGFib3J0cykgX2FmdGVyXyB0aGUgcHJvbWlzZSBoYXMgYWxyZWFkeSBzZXR0bGVkLlxyXG4gICAgICogT25seSB0aGUgZmlyc3Qgc2lnbmFsIHRvIGFib3J0IHdpbGwgc2V0IHRoZSBjYW5jZWxsYXRpb24gY2F1c2UuXHJcbiAgICAgKlxyXG4gICAgICogRm9yIG1vcmUgZGV0YWlscyBhYm91dCB0aGUgY2FuY2VsbGF0aW9uIHByb2Nlc3MsXHJcbiAgICAgKiBzZWUge0BsaW5rIGNhbmNlbH0gYW5kIHRoZSBgQ2FuY2VsbGFibGVQcm9taXNlYCBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBlbmFibGVzIGBhd2FpdGBpbmcgY2FuY2VsbGFibGUgcHJvbWlzZXMgd2l0aG91dCBoYXZpbmdcclxuICAgICAqIHRvIHN0b3JlIHRoZW0gZm9yIGZ1dHVyZSBjYW5jZWxsYXRpb24sIGUuZy46XHJcbiAgICAgKiBgYGB0c1xyXG4gICAgICogYXdhaXQgbG9uZ1J1bm5pbmdPcGVyYXRpb24oKS5jYW5jZWxPbihzaWduYWwpO1xyXG4gICAgICogYGBgXHJcbiAgICAgKiBpbnN0ZWFkIG9mOlxyXG4gICAgICogYGBgdHNcclxuICAgICAqIGxldCBwcm9taXNlVG9CZUNhbmNlbGxlZCA9IGxvbmdSdW5uaW5nT3BlcmF0aW9uKCk7XHJcbiAgICAgKiBhd2FpdCBwcm9taXNlVG9CZUNhbmNlbGxlZDtcclxuICAgICAqIGBgYFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIFRoaXMgcHJvbWlzZSwgZm9yIG1ldGhvZCBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgY2FuY2VsT24oc2lnbmFsOiBBYm9ydFNpZ25hbCk6IENhbmNlbGxhYmxlUHJvbWlzZTxUPiB7XHJcbiAgICAgICAgaWYgKHNpZ25hbC5hYm9ydGVkKSB7XHJcbiAgICAgICAgICAgIHZvaWQgdGhpcy5jYW5jZWwoc2lnbmFsLnJlYXNvbilcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCAoKSA9PiB2b2lkIHRoaXMuY2FuY2VsKHNpZ25hbC5yZWFzb24pLCB7Y2FwdHVyZTogdHJ1ZX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBjYWxsYmFja3MgZm9yIHRoZSByZXNvbHV0aW9uIGFuZC9vciByZWplY3Rpb24gb2YgdGhlIGBDYW5jZWxsYWJsZVByb21pc2VgLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBvcHRpb25hbCBgb25jYW5jZWxsZWRgIGFyZ3VtZW50IHdpbGwgYmUgaW52b2tlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCxcclxuICAgICAqIHdpdGggdGhlIHNhbWUgc2VtYW50aWNzIGFzIHRoZSBgb25jYW5jZWxsZWRgIGFyZ3VtZW50IG9mIHRoZSBjb25zdHJ1Y3Rvci5cclxuICAgICAqIFdoZW4gdGhlIHBhcmVudCBwcm9taXNlIHJlamVjdHMgb3IgaXMgY2FuY2VsbGVkLCB0aGUgYG9ucmVqZWN0ZWRgIGNhbGxiYWNrIHdpbGwgcnVuLFxyXG4gICAgICogX2V2ZW4gYWZ0ZXIgdGhlIHJldHVybmVkIHByb21pc2UgaGFzIGJlZW4gY2FuY2VsbGVkOl9cclxuICAgICAqIGluIHRoYXQgY2FzZSwgc2hvdWxkIGl0IHJlamVjdCBvciB0aHJvdywgdGhlIHJlYXNvbiB3aWxsIGJlIHdyYXBwZWRcclxuICAgICAqIGluIGEge0BsaW5rIENhbmNlbGxlZFJlamVjdGlvbkVycm9yfSBhbmQgYnViYmxlZCB1cCBhcyBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBvbmZ1bGZpbGxlZCBUaGUgY2FsbGJhY2sgdG8gZXhlY3V0ZSB3aGVuIHRoZSBQcm9taXNlIGlzIHJlc29sdmVkLlxyXG4gICAgICogQHBhcmFtIG9ucmVqZWN0ZWQgVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZC5cclxuICAgICAqIEByZXR1cm5zIEEgYENhbmNlbGxhYmxlUHJvbWlzZWAgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHdoaWNoZXZlciBjYWxsYmFjayBpcyBleGVjdXRlZC5cclxuICAgICAqIFRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGhvb2tlZCB1cCB0byBwcm9wYWdhdGUgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIHVwIHRoZSBjaGFpbiwgYnV0IG5vdCBkb3duOlxyXG4gICAgICpcclxuICAgICAqICAgLSBpZiB0aGUgcGFyZW50IHByb21pc2UgaXMgY2FuY2VsbGVkLCB0aGUgYG9ucmVqZWN0ZWRgIGhhbmRsZXIgd2lsbCBiZSBpbnZva2VkIHdpdGggYSBgQ2FuY2VsRXJyb3JgXHJcbiAgICAgKiAgICAgYW5kIHRoZSByZXR1cm5lZCBwcm9taXNlIF93aWxsIHJlc29sdmUgcmVndWxhcmx5XyB3aXRoIGl0cyByZXN1bHQ7XHJcbiAgICAgKiAgIC0gY29udmVyc2VseSwgaWYgdGhlIHJldHVybmVkIHByb21pc2UgaXMgY2FuY2VsbGVkLCBfdGhlIHBhcmVudCBwcm9taXNlIGlzIGNhbmNlbGxlZCB0b287X1xyXG4gICAgICogICAgIHRoZSBgb25yZWplY3RlZGAgaGFuZGxlciB3aWxsIHN0aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgcGFyZW50J3MgYENhbmNlbEVycm9yYCxcclxuICAgICAqICAgICBidXQgaXRzIHJlc3VsdCB3aWxsIGJlIGRpc2NhcmRlZFxyXG4gICAgICogICAgIGFuZCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIHJlamVjdCB3aXRoIGEgYENhbmNlbEVycm9yYCBhcyB3ZWxsLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBwcm9taXNlIHJldHVybmVkIGZyb20ge0BsaW5rIGNhbmNlbH0gd2lsbCBmdWxmaWxsIG9ubHkgYWZ0ZXIgYWxsIGF0dGFjaGVkIGhhbmRsZXJzXHJcbiAgICAgKiB1cCB0aGUgZW50aXJlIHByb21pc2UgY2hhaW4gaGF2ZSBiZWVuIHJ1bi5cclxuICAgICAqXHJcbiAgICAgKiBJZiBlaXRoZXIgY2FsbGJhY2sgcmV0dXJucyBhIGNhbmNlbGxhYmxlIHByb21pc2UsXHJcbiAgICAgKiBjYW5jZWxsYXRpb24gcmVxdWVzdHMgd2lsbCBiZSBkaXZlcnRlZCB0byBpdCxcclxuICAgICAqIGFuZCB0aGUgc3BlY2lmaWVkIGBvbmNhbmNlbGxlZGAgY2FsbGJhY2sgd2lsbCBiZSBkaXNjYXJkZWQuXHJcbiAgICAgKi9cclxuICAgIHRoZW48VFJlc3VsdDEgPSBULCBUUmVzdWx0MiA9IG5ldmVyPihvbmZ1bGZpbGxlZD86ICgodmFsdWU6IFQpID0+IFRSZXN1bHQxIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDE+IHwgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUUmVzdWx0MT4pIHwgdW5kZWZpbmVkIHwgbnVsbCwgb25yZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQyIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDI+IHwgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUUmVzdWx0Mj4pIHwgdW5kZWZpbmVkIHwgbnVsbCwgb25jYW5jZWxsZWQ/OiBDYW5jZWxsYWJsZVByb21pc2VDYW5jZWxsZXIpOiBDYW5jZWxsYWJsZVByb21pc2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj4ge1xyXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDYW5jZWxsYWJsZVByb21pc2UpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5jZWxsYWJsZVByb21pc2UucHJvdG90eXBlLnRoZW4gY2FsbGVkIG9uIGFuIGludmFsaWQgb2JqZWN0LlwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5PVEU6IFR5cGVTY3JpcHQncyBidWlsdC1pbiB0eXBlIGZvciB0aGVuIGlzIGJyb2tlbixcclxuICAgICAgICAvLyBhcyBpdCBhbGxvd3Mgc3BlY2lmeWluZyBhbiBhcmJpdHJhcnkgVFJlc3VsdDEgIT0gVCBldmVuIHdoZW4gb25mdWxmaWxsZWQgaXMgbm90IGEgZnVuY3Rpb24uXHJcbiAgICAgICAgLy8gV2UgY2Fubm90IGZpeCBpdCBpZiB3ZSB3YW50IHRvIENhbmNlbGxhYmxlUHJvbWlzZSB0byBpbXBsZW1lbnQgUHJvbWlzZUxpa2U8VD4uXHJcblxyXG4gICAgICAgIGlmICghaXNDYWxsYWJsZShvbmZ1bGZpbGxlZCkpIHsgb25mdWxmaWxsZWQgPSBpZGVudGl0eSBhcyBhbnk7IH1cclxuICAgICAgICBpZiAoIWlzQ2FsbGFibGUob25yZWplY3RlZCkpIHsgb25yZWplY3RlZCA9IHRocm93ZXI7IH1cclxuXHJcbiAgICAgICAgaWYgKG9uZnVsZmlsbGVkID09PSBpZGVudGl0eSAmJiBvbnJlamVjdGVkID09IHRocm93ZXIpIHtcclxuICAgICAgICAgICAgLy8gU2hvcnRjdXQgZm9yIHRyaXZpYWwgYXJndW1lbnRzLlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENhbmNlbGxhYmxlUHJvbWlzZSgocmVzb2x2ZSkgPT4gcmVzb2x2ZSh0aGlzIGFzIGFueSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYmFycmllcjogUGFydGlhbDxQcm9taXNlV2l0aFJlc29sdmVyczx2b2lkPj4gPSB7fTtcclxuICAgICAgICB0aGlzW2JhcnJpZXJTeW1dID0gYmFycmllcjtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBDYW5jZWxsYWJsZVByb21pc2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB2b2lkIHN1cGVyLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpc1tiYXJyaWVyU3ltXSA9PT0gYmFycmllcikgeyB0aGlzW2JhcnJpZXJTeW1dID0gbnVsbDsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJhcnJpZXIucmVzb2x2ZT8uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob25mdWxmaWxsZWQhKHZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAocmVhc29uPykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzW2JhcnJpZXJTeW1dID09PSBiYXJyaWVyKSB7IHRoaXNbYmFycmllclN5bV0gPSBudWxsOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgYmFycmllci5yZXNvbHZlPy4oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvbnJlamVjdGVkIShyZWFzb24pKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0sIGFzeW5jIChjYXVzZT8pID0+IHtcclxuICAgICAgICAgICAgLy9jYW5jZWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9uY2FuY2VsbGVkPy4oY2F1c2UpO1xyXG4gICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jYW5jZWwoY2F1c2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhIGNhbGxiYWNrIGZvciBvbmx5IHRoZSByZWplY3Rpb24gb2YgdGhlIFByb21pc2UuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIG9wdGlvbmFsIGBvbmNhbmNlbGxlZGAgYXJndW1lbnQgd2lsbCBiZSBpbnZva2VkIHdoZW4gdGhlIHJldHVybmVkIHByb21pc2UgaXMgY2FuY2VsbGVkLFxyXG4gICAgICogd2l0aCB0aGUgc2FtZSBzZW1hbnRpY3MgYXMgdGhlIGBvbmNhbmNlbGxlZGAgYXJndW1lbnQgb2YgdGhlIGNvbnN0cnVjdG9yLlxyXG4gICAgICogV2hlbiB0aGUgcGFyZW50IHByb21pc2UgcmVqZWN0cyBvciBpcyBjYW5jZWxsZWQsIHRoZSBgb25yZWplY3RlZGAgY2FsbGJhY2sgd2lsbCBydW4sXHJcbiAgICAgKiBfZXZlbiBhZnRlciB0aGUgcmV0dXJuZWQgcHJvbWlzZSBoYXMgYmVlbiBjYW5jZWxsZWQ6X1xyXG4gICAgICogaW4gdGhhdCBjYXNlLCBzaG91bGQgaXQgcmVqZWN0IG9yIHRocm93LCB0aGUgcmVhc29uIHdpbGwgYmUgd3JhcHBlZFxyXG4gICAgICogaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGFuZCBidWJibGVkIHVwIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXHJcbiAgICAgKlxyXG4gICAgICogSXQgaXMgZXF1aXZhbGVudCB0b1xyXG4gICAgICogYGBgdHNcclxuICAgICAqIGNhbmNlbGxhYmxlUHJvbWlzZS50aGVuKHVuZGVmaW5lZCwgb25yZWplY3RlZCwgb25jYW5jZWxsZWQpO1xyXG4gICAgICogYGBgXHJcbiAgICAgKiBhbmQgdGhlIHNhbWUgY2F2ZWF0cyBhcHBseS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBBIFByb21pc2UgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHRoZSBjYWxsYmFjay5cclxuICAgICAqIENhbmNlbGxhdGlvbiByZXF1ZXN0cyBvbiB0aGUgcmV0dXJuZWQgcHJvbWlzZVxyXG4gICAgICogd2lsbCBwcm9wYWdhdGUgdXAgdGhlIGNoYWluIHRvIHRoZSBwYXJlbnQgcHJvbWlzZSxcclxuICAgICAqIGJ1dCBub3QgaW4gdGhlIG90aGVyIGRpcmVjdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgcHJvbWlzZSByZXR1cm5lZCBmcm9tIHtAbGluayBjYW5jZWx9IHdpbGwgZnVsZmlsbCBvbmx5IGFmdGVyIGFsbCBhdHRhY2hlZCBoYW5kbGVyc1xyXG4gICAgICogdXAgdGhlIGVudGlyZSBwcm9taXNlIGNoYWluIGhhdmUgYmVlbiBydW4uXHJcbiAgICAgKlxyXG4gICAgICogSWYgYG9ucmVqZWN0ZWRgIHJldHVybnMgYSBjYW5jZWxsYWJsZSBwcm9taXNlLFxyXG4gICAgICogY2FuY2VsbGF0aW9uIHJlcXVlc3RzIHdpbGwgYmUgZGl2ZXJ0ZWQgdG8gaXQsXHJcbiAgICAgKiBhbmQgdGhlIHNwZWNpZmllZCBgb25jYW5jZWxsZWRgIGNhbGxiYWNrIHdpbGwgYmUgZGlzY2FyZGVkLlxyXG4gICAgICogU2VlIHtAbGluayB0aGVufSBmb3IgbW9yZSBkZXRhaWxzLlxyXG4gICAgICovXHJcbiAgICBjYXRjaDxUUmVzdWx0ID0gbmV2ZXI+KG9ucmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiAoUHJvbWlzZUxpa2U8VFJlc3VsdD4gfCBUUmVzdWx0KSkgfCB1bmRlZmluZWQgfCBudWxsLCBvbmNhbmNlbGxlZD86IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlcik6IENhbmNlbGxhYmxlUHJvbWlzZTxUIHwgVFJlc3VsdD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvbnJlamVjdGVkLCBvbmNhbmNlbGxlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhIGNhbGxiYWNrIHRoYXQgaXMgaW52b2tlZCB3aGVuIHRoZSBDYW5jZWxsYWJsZVByb21pc2UgaXMgc2V0dGxlZCAoZnVsZmlsbGVkIG9yIHJlamVjdGVkKS4gVGhlXHJcbiAgICAgKiByZXNvbHZlZCB2YWx1ZSBjYW5ub3QgYmUgYWNjZXNzZWQgb3IgbW9kaWZpZWQgZnJvbSB0aGUgY2FsbGJhY2suXHJcbiAgICAgKiBUaGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIHNldHRsZSBpbiB0aGUgc2FtZSBzdGF0ZSBhcyB0aGUgb3JpZ2luYWwgb25lXHJcbiAgICAgKiBhZnRlciB0aGUgcHJvdmlkZWQgY2FsbGJhY2sgaGFzIGNvbXBsZXRlZCBleGVjdXRpb24sXHJcbiAgICAgKiB1bmxlc3MgdGhlIGNhbGxiYWNrIHRocm93cyBvciByZXR1cm5zIGEgcmVqZWN0aW5nIHByb21pc2UsXHJcbiAgICAgKiBpbiB3aGljaCBjYXNlIHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgcmVqZWN0IGFzIHdlbGwuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIG9wdGlvbmFsIGBvbmNhbmNlbGxlZGAgYXJndW1lbnQgd2lsbCBiZSBpbnZva2VkIHdoZW4gdGhlIHJldHVybmVkIHByb21pc2UgaXMgY2FuY2VsbGVkLFxyXG4gICAgICogd2l0aCB0aGUgc2FtZSBzZW1hbnRpY3MgYXMgdGhlIGBvbmNhbmNlbGxlZGAgYXJndW1lbnQgb2YgdGhlIGNvbnN0cnVjdG9yLlxyXG4gICAgICogT25jZSB0aGUgcGFyZW50IHByb21pc2Ugc2V0dGxlcywgdGhlIGBvbmZpbmFsbHlgIGNhbGxiYWNrIHdpbGwgcnVuLFxyXG4gICAgICogX2V2ZW4gYWZ0ZXIgdGhlIHJldHVybmVkIHByb21pc2UgaGFzIGJlZW4gY2FuY2VsbGVkOl9cclxuICAgICAqIGluIHRoYXQgY2FzZSwgc2hvdWxkIGl0IHJlamVjdCBvciB0aHJvdywgdGhlIHJlYXNvbiB3aWxsIGJlIHdyYXBwZWRcclxuICAgICAqIGluIGEge0BsaW5rIENhbmNlbGxlZFJlamVjdGlvbkVycm9yfSBhbmQgYnViYmxlZCB1cCBhcyBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGltcGxlbWVudGVkIGluIHRlcm1zIG9mIHtAbGluayB0aGVufSBhbmQgdGhlIHNhbWUgY2F2ZWF0cyBhcHBseS5cclxuICAgICAqIEl0IGlzIHBvbHlmaWxsZWQsIGhlbmNlIGF2YWlsYWJsZSBpbiBldmVyeSBPUy93ZWJ2aWV3IHZlcnNpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgQSBQcm9taXNlIGZvciB0aGUgY29tcGxldGlvbiBvZiB0aGUgY2FsbGJhY2suXHJcbiAgICAgKiBDYW5jZWxsYXRpb24gcmVxdWVzdHMgb24gdGhlIHJldHVybmVkIHByb21pc2VcclxuICAgICAqIHdpbGwgcHJvcGFnYXRlIHVwIHRoZSBjaGFpbiB0byB0aGUgcGFyZW50IHByb21pc2UsXHJcbiAgICAgKiBidXQgbm90IGluIHRoZSBvdGhlciBkaXJlY3Rpb24uXHJcbiAgICAgKlxyXG4gICAgICogVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB7QGxpbmsgY2FuY2VsfSB3aWxsIGZ1bGZpbGwgb25seSBhZnRlciBhbGwgYXR0YWNoZWQgaGFuZGxlcnNcclxuICAgICAqIHVwIHRoZSBlbnRpcmUgcHJvbWlzZSBjaGFpbiBoYXZlIGJlZW4gcnVuLlxyXG4gICAgICpcclxuICAgICAqIElmIGBvbmZpbmFsbHlgIHJldHVybnMgYSBjYW5jZWxsYWJsZSBwcm9taXNlLFxyXG4gICAgICogY2FuY2VsbGF0aW9uIHJlcXVlc3RzIHdpbGwgYmUgZGl2ZXJ0ZWQgdG8gaXQsXHJcbiAgICAgKiBhbmQgdGhlIHNwZWNpZmllZCBgb25jYW5jZWxsZWRgIGNhbGxiYWNrIHdpbGwgYmUgZGlzY2FyZGVkLlxyXG4gICAgICogU2VlIHtAbGluayB0aGVufSBmb3IgbW9yZSBkZXRhaWxzLlxyXG4gICAgICovXHJcbiAgICBmaW5hbGx5KG9uZmluYWxseT86ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCB8IG51bGwsIG9uY2FuY2VsbGVkPzogQ2FuY2VsbGFibGVQcm9taXNlQ2FuY2VsbGVyKTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcclxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ2FuY2VsbGFibGVQcm9taXNlKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2FuY2VsbGFibGVQcm9taXNlLnByb3RvdHlwZS5maW5hbGx5IGNhbGxlZCBvbiBhbiBpbnZhbGlkIG9iamVjdC5cIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWlzQ2FsbGFibGUob25maW5hbGx5KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50aGVuKG9uZmluYWxseSwgb25maW5hbGx5LCBvbmNhbmNlbGxlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy50aGVuKFxyXG4gICAgICAgICAgICAodmFsdWUpID0+IENhbmNlbGxhYmxlUHJvbWlzZS5yZXNvbHZlKG9uZmluYWxseSgpKS50aGVuKCgpID0+IHZhbHVlKSxcclxuICAgICAgICAgICAgKHJlYXNvbj8pID0+IENhbmNlbGxhYmxlUHJvbWlzZS5yZXNvbHZlKG9uZmluYWxseSgpKS50aGVuKCgpID0+IHsgdGhyb3cgcmVhc29uOyB9KSxcclxuICAgICAgICAgICAgb25jYW5jZWxsZWQsXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdlIHVzZSB0aGUgYFtTeW1ib2wuc3BlY2llc11gIHN0YXRpYyBwcm9wZXJ0eSwgaWYgYXZhaWxhYmxlLFxyXG4gICAgICogdG8gZGlzYWJsZSB0aGUgYnVpbHQtaW4gYXV0b21hdGljIHN1YmNsYXNzaW5nIGZlYXR1cmVzIGZyb20ge0BsaW5rIFByb21pc2V9LlxyXG4gICAgICogSXQgaXMgY3JpdGljYWwgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgdGhhdCBleHRlbmRlcnMgZG8gbm90IG92ZXJyaWRlIHRoaXMuXHJcbiAgICAgKiBPbmNlIHRoZSBwcm9wb3NhbCBhdCBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1ybS1idWlsdGluLXN1YmNsYXNzaW5nXHJcbiAgICAgKiBpcyBlaXRoZXIgYWNjZXB0ZWQgb3IgcmV0aXJlZCwgdGhpcyBpbXBsZW1lbnRhdGlvbiB3aWxsIGhhdmUgdG8gYmUgcmV2aXNlZCBhY2NvcmRpbmdseS5cclxuICAgICAqXHJcbiAgICAgKiBAaWdub3JlXHJcbiAgICAgKiBAaW50ZXJuYWxcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBbc3BlY2llc10oKSB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgQ2FuY2VsbGFibGVQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCBhbiBhcnJheSBvZiByZXN1bHRzXHJcbiAgICAgKiB3aGVuIGFsbCBvZiB0aGUgcHJvdmlkZWQgUHJvbWlzZXMgcmVzb2x2ZSwgb3IgcmVqZWN0ZWQgd2hlbiBhbnkgUHJvbWlzZSBpcyByZWplY3RlZC5cclxuICAgICAqXHJcbiAgICAgKiBFdmVyeSBvbmUgb2YgdGhlIHByb3ZpZGVkIG9iamVjdHMgdGhhdCBpcyBhIHRoZW5hYmxlIF9hbmRfIGNhbmNlbGxhYmxlIG9iamVjdFxyXG4gICAgICogd2lsbCBiZSBjYW5jZWxsZWQgd2hlbiB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBjYW5jZWxsZWQsIHdpdGggdGhlIHNhbWUgY2F1c2UuXHJcbiAgICAgKlxyXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhbGw8VD4odmFsdWVzOiBJdGVyYWJsZTxUIHwgUHJvbWlzZUxpa2U8VD4+KTogQ2FuY2VsbGFibGVQcm9taXNlPEF3YWl0ZWQ8VD5bXT47XHJcbiAgICBzdGF0aWMgYWxsPFQgZXh0ZW5kcyByZWFkb25seSB1bmtub3duW10gfCBbXT4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHsgLXJlYWRvbmx5IFtQIGluIGtleW9mIFRdOiBBd2FpdGVkPFRbUF0+OyB9PjtcclxuICAgIHN0YXRpYyBhbGw8VCBleHRlbmRzIEl0ZXJhYmxlPHVua25vd24+IHwgQXJyYXlMaWtlPHVua25vd24+Pih2YWx1ZXM6IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj4ge1xyXG4gICAgICAgIGxldCBjb2xsZWN0ZWQgPSBBcnJheS5mcm9tKHZhbHVlcyk7XHJcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGNvbGxlY3RlZC5sZW5ndGggPT09IDBcclxuICAgICAgICAgICAgPyBDYW5jZWxsYWJsZVByb21pc2UucmVzb2x2ZShjb2xsZWN0ZWQpXHJcbiAgICAgICAgICAgIDogbmV3IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2b2lkIFByb21pc2UuYWxsKGNvbGxlY3RlZCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgICAgICB9LCAoY2F1c2U/KTogUHJvbWlzZTx2b2lkPiA9PiBjYW5jZWxBbGwocHJvbWlzZSwgY29sbGVjdGVkLCBjYXVzZSkpO1xyXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIENhbmNlbGxhYmxlUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYW4gYXJyYXkgb2YgcmVzdWx0c1xyXG4gICAgICogd2hlbiBhbGwgb2YgdGhlIHByb3ZpZGVkIFByb21pc2VzIHJlc29sdmUgb3IgcmVqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEV2ZXJ5IG9uZSBvZiB0aGUgcHJvdmlkZWQgb2JqZWN0cyB0aGF0IGlzIGEgdGhlbmFibGUgX2FuZF8gY2FuY2VsbGFibGUgb2JqZWN0XHJcbiAgICAgKiB3aWxsIGJlIGNhbmNlbGxlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCwgd2l0aCB0aGUgc2FtZSBjYXVzZS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFsbFNldHRsZWQ8VD4odmFsdWVzOiBJdGVyYWJsZTxUIHwgUHJvbWlzZUxpa2U8VD4+KTogQ2FuY2VsbGFibGVQcm9taXNlPFByb21pc2VTZXR0bGVkUmVzdWx0PEF3YWl0ZWQ8VD4+W10+O1xyXG4gICAgc3RhdGljIGFsbFNldHRsZWQ8VCBleHRlbmRzIHJlYWRvbmx5IHVua25vd25bXSB8IFtdPih2YWx1ZXM6IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8eyAtcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFByb21pc2VTZXR0bGVkUmVzdWx0PEF3YWl0ZWQ8VFtQXT4+OyB9PjtcclxuICAgIHN0YXRpYyBhbGxTZXR0bGVkPFQgZXh0ZW5kcyBJdGVyYWJsZTx1bmtub3duPiB8IEFycmF5TGlrZTx1bmtub3duPj4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+IHtcclxuICAgICAgICBsZXQgY29sbGVjdGVkID0gQXJyYXkuZnJvbSh2YWx1ZXMpO1xyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBjb2xsZWN0ZWQubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgID8gQ2FuY2VsbGFibGVQcm9taXNlLnJlc29sdmUoY29sbGVjdGVkKVxyXG4gICAgICAgICAgICA6IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdm9pZCBQcm9taXNlLmFsbFNldHRsZWQoY29sbGVjdGVkKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgICAgIH0sIChjYXVzZT8pOiBQcm9taXNlPHZvaWQ+ID0+IGNhbmNlbEFsbChwcm9taXNlLCBjb2xsZWN0ZWQsIGNhdXNlKSk7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYW55IGZ1bmN0aW9uIHJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIGJ5IHRoZSBmaXJzdCBnaXZlbiBwcm9taXNlIHRvIGJlIGZ1bGZpbGxlZCxcclxuICAgICAqIG9yIHJlamVjdGVkIHdpdGggYW4gQWdncmVnYXRlRXJyb3IgY29udGFpbmluZyBhbiBhcnJheSBvZiByZWplY3Rpb24gcmVhc29uc1xyXG4gICAgICogaWYgYWxsIG9mIHRoZSBnaXZlbiBwcm9taXNlcyBhcmUgcmVqZWN0ZWQuXHJcbiAgICAgKiBJdCByZXNvbHZlcyBhbGwgZWxlbWVudHMgb2YgdGhlIHBhc3NlZCBpdGVyYWJsZSB0byBwcm9taXNlcyBhcyBpdCBydW5zIHRoaXMgYWxnb3JpdGhtLlxyXG4gICAgICpcclxuICAgICAqIEV2ZXJ5IG9uZSBvZiB0aGUgcHJvdmlkZWQgb2JqZWN0cyB0aGF0IGlzIGEgdGhlbmFibGUgX2FuZF8gY2FuY2VsbGFibGUgb2JqZWN0XHJcbiAgICAgKiB3aWxsIGJlIGNhbmNlbGxlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCwgd2l0aCB0aGUgc2FtZSBjYXVzZS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFueTxUPih2YWx1ZXM6IEl0ZXJhYmxlPFQgfCBQcm9taXNlTGlrZTxUPj4pOiBDYW5jZWxsYWJsZVByb21pc2U8QXdhaXRlZDxUPj47XHJcbiAgICBzdGF0aWMgYW55PFQgZXh0ZW5kcyByZWFkb25seSB1bmtub3duW10gfCBbXT4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPEF3YWl0ZWQ8VFtudW1iZXJdPj47XHJcbiAgICBzdGF0aWMgYW55PFQgZXh0ZW5kcyBJdGVyYWJsZTx1bmtub3duPiB8IEFycmF5TGlrZTx1bmtub3duPj4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+IHtcclxuICAgICAgICBsZXQgY29sbGVjdGVkID0gQXJyYXkuZnJvbSh2YWx1ZXMpO1xyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBjb2xsZWN0ZWQubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgID8gQ2FuY2VsbGFibGVQcm9taXNlLnJlc29sdmUoY29sbGVjdGVkKVxyXG4gICAgICAgICAgICA6IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdm9pZCBQcm9taXNlLmFueShjb2xsZWN0ZWQpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgfSwgKGNhdXNlPyk6IFByb21pc2U8dm9pZD4gPT4gY2FuY2VsQWxsKHByb21pc2UsIGNvbGxlY3RlZCwgY2F1c2UpKTtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQgd2hlbiBhbnkgb2YgdGhlIHByb3ZpZGVkIFByb21pc2VzIGFyZSByZXNvbHZlZCBvciByZWplY3RlZC5cclxuICAgICAqXHJcbiAgICAgKiBFdmVyeSBvbmUgb2YgdGhlIHByb3ZpZGVkIG9iamVjdHMgdGhhdCBpcyBhIHRoZW5hYmxlIF9hbmRfIGNhbmNlbGxhYmxlIG9iamVjdFxyXG4gICAgICogd2lsbCBiZSBjYW5jZWxsZWQgd2hlbiB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBjYW5jZWxsZWQsIHdpdGggdGhlIHNhbWUgY2F1c2UuXHJcbiAgICAgKlxyXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyByYWNlPFQ+KHZhbHVlczogSXRlcmFibGU8VCB8IFByb21pc2VMaWtlPFQ+Pik6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFQ+PjtcclxuICAgIHN0YXRpYyByYWNlPFQgZXh0ZW5kcyByZWFkb25seSB1bmtub3duW10gfCBbXT4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPEF3YWl0ZWQ8VFtudW1iZXJdPj47XHJcbiAgICBzdGF0aWMgcmFjZTxUIGV4dGVuZHMgSXRlcmFibGU8dW5rbm93bj4gfCBBcnJheUxpa2U8dW5rbm93bj4+KHZhbHVlczogVCk6IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPiB7XHJcbiAgICAgICAgbGV0IGNvbGxlY3RlZCA9IEFycmF5LmZyb20odmFsdWVzKTtcclxuICAgICAgICBjb25zdCBwcm9taXNlID0gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHZvaWQgUHJvbWlzZS5yYWNlKGNvbGxlY3RlZCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgIH0sIChjYXVzZT8pOiBQcm9taXNlPHZvaWQ+ID0+IGNhbmNlbEFsbChwcm9taXNlLCBjb2xsZWN0ZWQsIGNhdXNlKSk7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGNhbmNlbGxlZCBDYW5jZWxsYWJsZVByb21pc2UgZm9yIHRoZSBwcm92aWRlZCBjYXVzZS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNhbmNlbDxUID0gbmV2ZXI+KGNhdXNlPzogYW55KTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcclxuICAgICAgICBjb25zdCBwID0gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTxUPigoKSA9PiB7fSk7XHJcbiAgICAgICAgcC5jYW5jZWwoY2F1c2UpO1xyXG4gICAgICAgIHJldHVybiBwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBDYW5jZWxsYWJsZVByb21pc2UgdGhhdCBjYW5jZWxzXHJcbiAgICAgKiBhZnRlciB0aGUgc3BlY2lmaWVkIHRpbWVvdXQsIHdpdGggdGhlIHByb3ZpZGVkIGNhdXNlLlxyXG4gICAgICpcclxuICAgICAqIElmIHRoZSB7QGxpbmsgQWJvcnRTaWduYWwudGltZW91dH0gZmFjdG9yeSBtZXRob2QgaXMgYXZhaWxhYmxlLFxyXG4gICAgICogaXQgaXMgdXNlZCB0byBiYXNlIHRoZSB0aW1lb3V0IG9uIF9hY3RpdmVfIHRpbWUgcmF0aGVyIHRoYW4gX2VsYXBzZWRfIHRpbWUuXHJcbiAgICAgKiBPdGhlcndpc2UsIGB0aW1lb3V0YCBmYWxscyBiYWNrIHRvIHtAbGluayBzZXRUaW1lb3V0fS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHRpbWVvdXQ8VCA9IG5ldmVyPihtaWxsaXNlY29uZHM6IG51bWJlciwgY2F1c2U/OiBhbnkpOiBDYW5jZWxsYWJsZVByb21pc2U8VD4ge1xyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPFQ+KCgpID0+IHt9KTtcclxuICAgICAgICBpZiAoQWJvcnRTaWduYWwgJiYgdHlwZW9mIEFib3J0U2lnbmFsID09PSAnZnVuY3Rpb24nICYmIEFib3J0U2lnbmFsLnRpbWVvdXQgJiYgdHlwZW9mIEFib3J0U2lnbmFsLnRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgQWJvcnRTaWduYWwudGltZW91dChtaWxsaXNlY29uZHMpLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgKCkgPT4gdm9pZCBwcm9taXNlLmNhbmNlbChjYXVzZSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdm9pZCBwcm9taXNlLmNhbmNlbChjYXVzZSksIG1pbGxpc2Vjb25kcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBDYW5jZWxsYWJsZVByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciB0aGUgc3BlY2lmaWVkIHRpbWVvdXQuXHJcbiAgICAgKiBUaGUgcmV0dXJuZWQgcHJvbWlzZSBjYW4gYmUgY2FuY2VsbGVkIHdpdGhvdXQgY29uc2VxdWVuY2VzLlxyXG4gICAgICpcclxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2xlZXAobWlsbGlzZWNvbmRzOiBudW1iZXIpOiBDYW5jZWxsYWJsZVByb21pc2U8dm9pZD47XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlIHRoYXQgcmVzb2x2ZXMgYWZ0ZXJcclxuICAgICAqIHRoZSBzcGVjaWZpZWQgdGltZW91dCwgd2l0aCB0aGUgcHJvdmlkZWQgdmFsdWUuXHJcbiAgICAgKiBUaGUgcmV0dXJuZWQgcHJvbWlzZSBjYW4gYmUgY2FuY2VsbGVkIHdpdGhvdXQgY29uc2VxdWVuY2VzLlxyXG4gICAgICpcclxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2xlZXA8VD4obWlsbGlzZWNvbmRzOiBudW1iZXIsIHZhbHVlOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+O1xyXG4gICAgc3RhdGljIHNsZWVwPFQgPSB2b2lkPihtaWxsaXNlY29uZHM6IG51bWJlciwgdmFsdWU/OiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcclxuICAgICAgICByZXR1cm4gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTxUPigocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHJlc29sdmUodmFsdWUhKSwgbWlsbGlzZWNvbmRzKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmVqZWN0ZWQgQ2FuY2VsbGFibGVQcm9taXNlIGZvciB0aGUgcHJvdmlkZWQgcmVhc29uLlxyXG4gICAgICpcclxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmVqZWN0PFQgPSBuZXZlcj4ocmVhc29uPzogYW55KTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcclxuICAgICAgICByZXR1cm4gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTxUPigoXywgcmVqZWN0KSA9PiByZWplY3QocmVhc29uKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJlc29sdmVkIENhbmNlbGxhYmxlUHJvbWlzZS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJlc29sdmUoKTogQ2FuY2VsbGFibGVQcm9taXNlPHZvaWQ+O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJlc29sdmVkIENhbmNlbGxhYmxlUHJvbWlzZSBmb3IgdGhlIHByb3ZpZGVkIHZhbHVlLlxyXG4gICAgICpcclxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmVzb2x2ZTxUPih2YWx1ZTogVCk6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFQ+PjtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyByZXNvbHZlZCBDYW5jZWxsYWJsZVByb21pc2UgZm9yIHRoZSBwcm92aWRlZCB2YWx1ZS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJlc29sdmU8VD4odmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPik6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFQ+PjtcclxuICAgIHN0YXRpYyByZXNvbHZlPFQgPSB2b2lkPih2YWx1ZT86IFQgfCBQcm9taXNlTGlrZTxUPik6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFQ+PiB7XHJcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQ2FuY2VsbGFibGVQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIC8vIE9wdGltaXNlIGZvciBjYW5jZWxsYWJsZSBwcm9taXNlcy5cclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTxhbnk+KChyZXNvbHZlKSA9PiByZXNvbHZlKHZhbHVlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IENhbmNlbGxhYmxlUHJvbWlzZSBhbmQgcmV0dXJucyBpdCBpbiBhbiBvYmplY3QsIGFsb25nIHdpdGggaXRzIHJlc29sdmUgYW5kIHJlamVjdCBmdW5jdGlvbnNcclxuICAgICAqIGFuZCBhIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBjYW5jZWxsYXRpb24gY2FsbGJhY2suXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBtZXRob2QgaXMgcG9seWZpbGxlZCwgaGVuY2UgYXZhaWxhYmxlIGluIGV2ZXJ5IE9TL3dlYnZpZXcgdmVyc2lvbi5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHdpdGhSZXNvbHZlcnM8VD4oKTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiB7XHJcbiAgICAgICAgbGV0IHJlc3VsdDogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiA9IHsgb25jYW5jZWxsZWQ6IG51bGwgfSBhcyBhbnk7XHJcbiAgICAgICAgcmVzdWx0LnByb21pc2UgPSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgcmVzdWx0LnJlc29sdmUgPSByZXNvbHZlO1xyXG4gICAgICAgICAgICByZXN1bHQucmVqZWN0ID0gcmVqZWN0O1xyXG4gICAgICAgIH0sIChjYXVzZT86IGFueSkgPT4geyByZXN1bHQub25jYW5jZWxsZWQ/LihjYXVzZSk7IH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgY2FsbGJhY2sgdGhhdCBpbXBsZW1lbnRzIHRoZSBjYW5jZWxsYXRpb24gYWxnb3JpdGhtIGZvciB0aGUgZ2l2ZW4gY2FuY2VsbGFibGUgcHJvbWlzZS5cclxuICogVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB0aGUgcmVzdWx0aW5nIGZ1bmN0aW9uIGRvZXMgbm90IHJlamVjdC5cclxuICovXHJcbmZ1bmN0aW9uIGNhbmNlbGxlckZvcjxUPihwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2VXaXRoUmVzb2x2ZXJzPFQ+LCBzdGF0ZTogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGUpIHtcclxuICAgIGxldCBjYW5jZWxsYXRpb25Qcm9taXNlOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgcmV0dXJuIChyZWFzb246IENhbmNlbEVycm9yKTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+ID0+IHtcclxuICAgICAgICBpZiAoIXN0YXRlLnNldHRsZWQpIHtcclxuICAgICAgICAgICAgc3RhdGUuc2V0dGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHN0YXRlLnJlYXNvbiA9IHJlYXNvbjtcclxuICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QocmVhc29uKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEF0dGFjaCBhbiBlcnJvciBoYW5kbGVyIHRoYXQgaWdub3JlcyB0aGlzIHNwZWNpZmljIHJlamVjdGlvbiByZWFzb24gYW5kIG5vdGhpbmcgZWxzZS5cclxuICAgICAgICAgICAgLy8gSW4gdGhlb3J5LCBhIHNhbmUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBhdCB0aGlzIHBvaW50XHJcbiAgICAgICAgICAgIC8vIHNob3VsZCBhbHdheXMgcmVqZWN0IHdpdGggb3VyIGNhbmNlbGxhdGlvbiByZWFzb24sXHJcbiAgICAgICAgICAgIC8vIGhlbmNlIHRoZSBoYW5kbGVyIHdpbGwgbmV2ZXIgdGhyb3cuXHJcbiAgICAgICAgICAgIHZvaWQgUHJvbWlzZS5wcm90b3R5cGUudGhlbi5jYWxsKHByb21pc2UucHJvbWlzZSwgdW5kZWZpbmVkLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyICE9PSByZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgcmVhc29uIGlzIG5vdCBzZXQsIHRoZSBwcm9taXNlIHJlc29sdmVkIHJlZ3VsYXJseSwgaGVuY2Ugd2UgbXVzdCBub3QgY2FsbCBvbmNhbmNlbGxlZC5cclxuICAgICAgICAvLyBJZiBvbmNhbmNlbGxlZCBpcyB1bnNldCwgbm8gbmVlZCB0byBnbyBhbnkgZnVydGhlci5cclxuICAgICAgICBpZiAoIXN0YXRlLnJlYXNvbiB8fCAhcHJvbWlzZS5vbmNhbmNlbGxlZCkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgY2FuY2VsbGF0aW9uUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHByb21pc2Uub25jYW5jZWxsZWQhKHN0YXRlLnJlYXNvbiEuY2F1c2UpKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3IocHJvbWlzZS5wcm9taXNlLCBlcnIsIFwiVW5oYW5kbGVkIGV4Y2VwdGlvbiBpbiBvbmNhbmNlbGxlZCBjYWxsYmFjay5cIikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkuY2F0Y2goKHJlYXNvbj8pID0+IHtcclxuICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IENhbmNlbGxlZFJlamVjdGlvbkVycm9yKHByb21pc2UucHJvbWlzZSwgcmVhc29uLCBcIlVuaGFuZGxlZCByZWplY3Rpb24gaW4gb25jYW5jZWxsZWQgY2FsbGJhY2suXCIpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVW5zZXQgb25jYW5jZWxsZWQgdG8gcHJldmVudCByZXBlYXRlZCBjYWxscy5cclxuICAgICAgICBwcm9taXNlLm9uY2FuY2VsbGVkID0gbnVsbDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNhbmNlbGxhdGlvblByb21pc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgY2FsbGJhY2sgdGhhdCBpbXBsZW1lbnRzIHRoZSByZXNvbHV0aW9uIGFsZ29yaXRobSBmb3IgdGhlIGdpdmVuIGNhbmNlbGxhYmxlIHByb21pc2UuXHJcbiAqL1xyXG5mdW5jdGlvbiByZXNvbHZlckZvcjxUPihwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2VXaXRoUmVzb2x2ZXJzPFQ+LCBzdGF0ZTogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGUpOiBDYW5jZWxsYWJsZVByb21pc2VSZXNvbHZlcjxUPiB7XHJcbiAgICByZXR1cm4gKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHN0YXRlLnJlc29sdmluZykgeyByZXR1cm47IH1cclxuICAgICAgICBzdGF0ZS5yZXNvbHZpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAodmFsdWUgPT09IHByb21pc2UucHJvbWlzZSkge1xyXG4gICAgICAgICAgICBpZiAoc3RhdGUuc2V0dGxlZCkgeyByZXR1cm47IH1cclxuICAgICAgICAgICAgc3RhdGUuc2V0dGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2UgY2Fubm90IGJlIHJlc29sdmVkIHdpdGggaXRzZWxmLlwiKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsICYmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykpIHtcclxuICAgICAgICAgICAgbGV0IHRoZW46IGFueTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoZW4gPSAodmFsdWUgYXMgYW55KS50aGVuO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnNldHRsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGlzQ2FsbGFibGUodGhlbikpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNhbmNlbCA9ICh2YWx1ZSBhcyBhbnkpLmNhbmNlbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDYWxsYWJsZShjYW5jZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9uY2FuY2VsbGVkID0gKGNhdXNlPzogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWZsZWN0LmFwcGx5KGNhbmNlbCwgdmFsdWUsIFtjYXVzZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUucmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBhbHJlYWR5IGNhbmNlbGxlZCwgcHJvcGFnYXRlIGNhbmNlbGxhdGlvbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBwcm9taXNlIHJldHVybmVkIGZyb20gdGhlIGNhbmNlbGxlciBhbGdvcml0aG0gZG9lcyBub3QgcmVqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyBpdCBjYW4gYmUgZGlzY2FyZGVkIHNhZmVseS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgY2FuY2VsbGVyRm9yKHsgLi4ucHJvbWlzZSwgb25jYW5jZWxsZWQgfSwgc3RhdGUpKHN0YXRlLnJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlLm9uY2FuY2VsbGVkID0gb25jYW5jZWxsZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHt9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3U3RhdGU6IENhbmNlbGxhYmxlUHJvbWlzZVN0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvb3Q6IHN0YXRlLnJvb3QsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2aW5nOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBnZXQgc2V0dGxlZCgpIHsgcmV0dXJuIHRoaXMucm9vdC5zZXR0bGVkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0IHNldHRsZWQodmFsdWUpIHsgdGhpcy5yb290LnNldHRsZWQgPSB2YWx1ZTsgfSxcclxuICAgICAgICAgICAgICAgICAgICBnZXQgcmVhc29uKCkgeyByZXR1cm4gdGhpcy5yb290LnJlYXNvbiB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlamVjdG9yID0gcmVqZWN0b3JGb3IocHJvbWlzZSwgbmV3U3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBSZWZsZWN0LmFwcGx5KHRoZW4sIHZhbHVlLCBbcmVzb2x2ZXJGb3IocHJvbWlzZSwgbmV3U3RhdGUpLCByZWplY3Rvcl0pO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0b3IoZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gSU1QT1JUQU5UIVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUuc2V0dGxlZCkgeyByZXR1cm47IH1cclxuICAgICAgICBzdGF0ZS5zZXR0bGVkID0gdHJ1ZTtcclxuICAgICAgICBwcm9taXNlLnJlc29sdmUodmFsdWUpO1xyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBjYWxsYmFjayB0aGF0IGltcGxlbWVudHMgdGhlIHJlamVjdGlvbiBhbGdvcml0aG0gZm9yIHRoZSBnaXZlbiBjYW5jZWxsYWJsZSBwcm9taXNlLlxyXG4gKi9cclxuZnVuY3Rpb24gcmVqZWN0b3JGb3I8VD4ocHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiwgc3RhdGU6IENhbmNlbGxhYmxlUHJvbWlzZVN0YXRlKTogQ2FuY2VsbGFibGVQcm9taXNlUmVqZWN0b3Ige1xyXG4gICAgcmV0dXJuIChyZWFzb24/KSA9PiB7XHJcbiAgICAgICAgaWYgKHN0YXRlLnJlc29sdmluZykgeyByZXR1cm47IH1cclxuICAgICAgICBzdGF0ZS5yZXNvbHZpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUuc2V0dGxlZCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlYXNvbiBpbnN0YW5jZW9mIENhbmNlbEVycm9yICYmIHN0YXRlLnJlYXNvbiBpbnN0YW5jZW9mIENhbmNlbEVycm9yICYmIE9iamVjdC5pcyhyZWFzb24uY2F1c2UsIHN0YXRlLnJlYXNvbi5jYXVzZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTd2FsbG93IGxhdGUgcmVqZWN0aW9ucyB0aGF0IGFyZSBDYW5jZWxFcnJvcnMgd2hvc2UgY2FuY2VsbGF0aW9uIGNhdXNlIGlzIHRoZSBzYW1lIGFzIG91cnMuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIHt9XHJcblxyXG4gICAgICAgICAgICB2b2lkIFByb21pc2UucmVqZWN0KG5ldyBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcihwcm9taXNlLnByb21pc2UsIHJlYXNvbikpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YXRlLnNldHRsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENhbmNlbHMgYWxsIHZhbHVlcyBpbiBhbiBhcnJheSB0aGF0IGxvb2sgbGlrZSBjYW5jZWxsYWJsZSB0aGVuYWJsZXMuXHJcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgb25jZSBhbGwgY2FuY2VsbGF0aW9uIHByb2NlZHVyZXMgZm9yIHRoZSBnaXZlbiB2YWx1ZXMgaGF2ZSBzZXR0bGVkLlxyXG4gKi9cclxuZnVuY3Rpb24gY2FuY2VsQWxsKHBhcmVudDogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+LCB2YWx1ZXM6IGFueVtdLCBjYXVzZT86IGFueSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgcmVzdWx0czogUHJvbWlzZTx2b2lkPltdID0gW107XHJcblxyXG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcclxuICAgICAgICBsZXQgY2FuY2VsOiBDYW5jZWxsYWJsZVByb21pc2VDYW5jZWxsZXI7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKCFpc0NhbGxhYmxlKHZhbHVlLnRoZW4pKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGNhbmNlbCA9IHZhbHVlLmNhbmNlbDtcclxuICAgICAgICAgICAgaWYgKCFpc0NhbGxhYmxlKGNhbmNlbCkpIHsgY29udGludWU7IH1cclxuICAgICAgICB9IGNhdGNoIHsgY29udGludWU7IH1cclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdDogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+O1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFJlZmxlY3QuYXBwbHkoY2FuY2VsLCB2YWx1ZSwgW2NhdXNlXSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcihwYXJlbnQsIGVyciwgXCJVbmhhbmRsZWQgZXhjZXB0aW9uIGluIGNhbmNlbCBtZXRob2QuXCIpKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlc3VsdCkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgIHJlc3VsdHMucHVzaChcclxuICAgICAgICAgICAgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UgID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkpLmNhdGNoKChyZWFzb24/KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3IocGFyZW50LCByZWFzb24sIFwiVW5oYW5kbGVkIHJlamVjdGlvbiBpbiBjYW5jZWwgbWV0aG9kLlwiKSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cykgYXMgYW55O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBpdHMgYXJndW1lbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBpZGVudGl0eTxUPih4OiBUKTogVCB7XHJcbiAgICByZXR1cm4geDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRocm93cyBpdHMgYXJndW1lbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiB0aHJvd2VyKHJlYXNvbj86IGFueSk6IG5ldmVyIHtcclxuICAgIHRocm93IHJlYXNvbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEF0dGVtcHRzIHZhcmlvdXMgc3RyYXRlZ2llcyB0byBjb252ZXJ0IGFuIGVycm9yIHRvIGEgc3RyaW5nLlxyXG4gKi9cclxuZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGVycjogYW55KTogc3RyaW5nIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yIHx8IHR5cGVvZiBlcnIgIT09ICdvYmplY3QnIHx8IGVyci50b1N0cmluZyAhPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcIiArIGVycjtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIHt9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZXJyKTtcclxuICAgIH0gY2F0Y2gge31cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXJyKTtcclxuICAgIH0gY2F0Y2gge31cclxuXHJcbiAgICByZXR1cm4gXCI8Y291bGQgbm90IGNvbnZlcnQgZXJyb3IgdG8gc3RyaW5nPlwiO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyB0aGUgY3VycmVudCBiYXJyaWVyIHByb21pc2UgZm9yIHRoZSBnaXZlbiBjYW5jZWxsYWJsZSBwcm9taXNlLiBJZiBuZWNlc3NhcnksIGluaXRpYWxpc2VzIHRoZSBiYXJyaWVyLlxyXG4gKi9cclxuZnVuY3Rpb24gY3VycmVudEJhcnJpZXI8VD4ocHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBsZXQgcHdyOiBQYXJ0aWFsPFByb21pc2VXaXRoUmVzb2x2ZXJzPHZvaWQ+PiA9IHByb21pc2VbYmFycmllclN5bV0gPz8ge307XHJcbiAgICBpZiAoISgncHJvbWlzZScgaW4gcHdyKSkge1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24ocHdyLCBwcm9taXNlV2l0aFJlc29sdmVyczx2b2lkPigpKTtcclxuICAgIH1cclxuICAgIGlmIChwcm9taXNlW2JhcnJpZXJTeW1dID09IG51bGwpIHtcclxuICAgICAgICBwd3IucmVzb2x2ZSEoKTtcclxuICAgICAgICBwcm9taXNlW2JhcnJpZXJTeW1dID0gcHdyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHB3ci5wcm9taXNlITtcclxufVxyXG5cclxuLy8gUG9seWZpbGwgUHJvbWlzZS53aXRoUmVzb2x2ZXJzLlxyXG5sZXQgcHJvbWlzZVdpdGhSZXNvbHZlcnMgPSBQcm9taXNlLndpdGhSZXNvbHZlcnM7XHJcbmlmIChwcm9taXNlV2l0aFJlc29sdmVycyAmJiB0eXBlb2YgcHJvbWlzZVdpdGhSZXNvbHZlcnMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgIHByb21pc2VXaXRoUmVzb2x2ZXJzID0gcHJvbWlzZVdpdGhSZXNvbHZlcnMuYmluZChQcm9taXNlKTtcclxufSBlbHNlIHtcclxuICAgIHByb21pc2VXaXRoUmVzb2x2ZXJzID0gZnVuY3Rpb24gPFQ+KCk6IFByb21pc2VXaXRoUmVzb2x2ZXJzPFQ+IHtcclxuICAgICAgICBsZXQgcmVzb2x2ZSE6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xyXG4gICAgICAgIGxldCByZWplY3QhOiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzLCByZWopID0+IHsgcmVzb2x2ZSA9IHJlczsgcmVqZWN0ID0gcmVqOyB9KTtcclxuICAgICAgICByZXR1cm4geyBwcm9taXNlLCByZXNvbHZlLCByZWplY3QgfTtcclxuICAgIH1cclxufVxyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBDYW5jZWxsYWJsZVByb21pc2UsIHR5cGUgQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVycyB9IGZyb20gXCIuL2NhbmNlbGxhYmxlLmpzXCI7XHJcbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xyXG5pbXBvcnQgeyBuYW5vaWQgfSBmcm9tIFwiLi9uYW5vaWQuanNcIjtcclxuXHJcbi8vIFNldHVwXHJcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XHJcblxyXG5pZiAoaGFzRE9NKSB7XHJcbiAgICB3aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcclxufVxyXG5cclxudHlwZSBQcm9taXNlUmVzb2x2ZXJzID0gT21pdDxDYW5jZWxsYWJsZVByb21pc2VXaXRoUmVzb2x2ZXJzPGFueT4sIFwicHJvbWlzZVwiIHwgXCJvbmNhbmNlbGxlZFwiPlxyXG5cclxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQ2FsbCk7XHJcbmNvbnN0IGNhbmNlbENhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLkNhbmNlbENhbGwpO1xyXG5jb25zdCBjYWxsUmVzcG9uc2VzID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2VSZXNvbHZlcnM+KCk7XHJcblxyXG5jb25zdCBDYWxsQmluZGluZyA9IDA7XHJcbmNvbnN0IENhbmNlbE1ldGhvZCA9IDBcclxuXHJcbi8qKlxyXG4gKiBIb2xkcyBhbGwgcmVxdWlyZWQgaW5mb3JtYXRpb24gZm9yIGEgYmluZGluZyBjYWxsLlxyXG4gKiBNYXkgcHJvdmlkZSBlaXRoZXIgYSBtZXRob2QgSUQgb3IgYSBtZXRob2QgbmFtZSwgYnV0IG5vdCBib3RoLlxyXG4gKi9cclxuZXhwb3J0IHR5cGUgQ2FsbE9wdGlvbnMgPSB7XHJcbiAgICAvKiogVGhlIG51bWVyaWMgSUQgb2YgdGhlIGJvdW5kIG1ldGhvZCB0byBjYWxsLiAqL1xyXG4gICAgbWV0aG9kSUQ6IG51bWJlcjtcclxuICAgIC8qKiBUaGUgZnVsbHkgcXVhbGlmaWVkIG5hbWUgb2YgdGhlIGJvdW5kIG1ldGhvZCB0byBjYWxsLiAqL1xyXG4gICAgbWV0aG9kTmFtZT86IG5ldmVyO1xyXG4gICAgLyoqIEFyZ3VtZW50cyB0byBiZSBwYXNzZWQgaW50byB0aGUgYm91bmQgbWV0aG9kLiAqL1xyXG4gICAgYXJnczogYW55W107XHJcbn0gfCB7XHJcbiAgICAvKiogVGhlIG51bWVyaWMgSUQgb2YgdGhlIGJvdW5kIG1ldGhvZCB0byBjYWxsLiAqL1xyXG4gICAgbWV0aG9kSUQ/OiBuZXZlcjtcclxuICAgIC8qKiBUaGUgZnVsbHkgcXVhbGlmaWVkIG5hbWUgb2YgdGhlIGJvdW5kIG1ldGhvZCB0byBjYWxsLiAqL1xyXG4gICAgbWV0aG9kTmFtZTogc3RyaW5nO1xyXG4gICAgLyoqIEFyZ3VtZW50cyB0byBiZSBwYXNzZWQgaW50byB0aGUgYm91bmQgbWV0aG9kLiAqL1xyXG4gICAgYXJnczogYW55W107XHJcbn07XHJcblxyXG4vLyBydW50aW1lLmpzIG5lZWRzIHRvIHVzZSBSdW50aW1lRXJyb3IgaW50ZXJuYWxseSB0byBwcm9wZXJseSBwYXJzZSBhbmQgcmV0dXJuXHJcbi8vIGVycm9ycyBmb3IgYmluZGluZyBjYWxscywgc28gaXQgaGFkIHRvIG1vdmUgdGhlcmUuIEV4cG9ydGluZyBoZXJlIGFnYWluIHRvXHJcbi8vIGtlZXAgZnJvbSBicmVha2luZyB0aGUgcHVibGljIENhbGwgaW50ZXJmYWNlLlxyXG5leHBvcnQgeyBSdW50aW1lRXJyb3IgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgdW5pcXVlIElEIHVzaW5nIHRoZSBuYW5vaWQgbGlicmFyeS5cclxuICpcclxuICogQHJldHVybnMgQSB1bmlxdWUgSUQgdGhhdCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgY2FsbFJlc3BvbnNlcyBzZXQuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZW5lcmF0ZUlEKCk6IHN0cmluZyB7XHJcbiAgICBsZXQgcmVzdWx0O1xyXG4gICAgZG8ge1xyXG4gICAgICAgIHJlc3VsdCA9IG5hbm9pZCgpO1xyXG4gICAgfSB3aGlsZSAoY2FsbFJlc3BvbnNlcy5oYXMocmVzdWx0KSk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsbCBhIGJvdW5kIG1ldGhvZCBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGNhbGwgb3B0aW9ucy5cclxuICpcclxuICogSW4gY2FzZSBvZiBmYWlsdXJlLCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIHJlamVjdCB3aXRoIGFuIGV4Y2VwdGlvblxyXG4gKiBhbW9uZyBSZWZlcmVuY2VFcnJvciAodW5rbm93biBtZXRob2QpLCBUeXBlRXJyb3IgKHdyb25nIGFyZ3VtZW50IGNvdW50IG9yIHR5cGUpLFxyXG4gKiB7QGxpbmsgUnVudGltZUVycm9yfSAobWV0aG9kIHJldHVybmVkIGFuIGVycm9yKSwgb3Igb3RoZXIgKG5ldHdvcmsgb3IgaW50ZXJuYWwgZXJyb3JzKS5cclxuICogVGhlIGV4Y2VwdGlvbiBtaWdodCBoYXZlIGEgXCJjYXVzZVwiIGZpZWxkIHdpdGggdGhlIHZhbHVlIHJldHVybmVkXHJcbiAqIGJ5IHRoZSBhcHBsaWNhdGlvbi0gb3Igc2VydmljZS1sZXZlbCBlcnJvciBtYXJzaGFsaW5nIGZ1bmN0aW9ucy5cclxuICpcclxuICogQHBhcmFtIG9wdGlvbnMgLSBBIG1ldGhvZCBjYWxsIGRlc2NyaXB0b3IuXHJcbiAqIEByZXR1cm5zIFRoZSByZXN1bHQgb2YgdGhlIGNhbGwuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gQ2FsbChvcHRpb25zOiBDYWxsT3B0aW9ucyk6IENhbmNlbGxhYmxlUHJvbWlzZTxhbnk+IHtcclxuICAgIGNvbnN0IGlkID0gZ2VuZXJhdGVJRCgpO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IENhbmNlbGxhYmxlUHJvbWlzZS53aXRoUmVzb2x2ZXJzPGFueT4oKTtcclxuICAgIGNhbGxSZXNwb25zZXMuc2V0KGlkLCB7IHJlc29sdmU6IHJlc3VsdC5yZXNvbHZlLCByZWplY3Q6IHJlc3VsdC5yZWplY3QgfSk7XHJcblxyXG4gICAgY29uc3QgcmVxdWVzdCA9IGNhbGwoQ2FsbEJpbmRpbmcsIE9iamVjdC5hc3NpZ24oeyBcImNhbGwtaWRcIjogaWQgfSwgb3B0aW9ucykpO1xyXG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xyXG5cclxuICAgIHJlcXVlc3QudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgcnVubmluZyA9IGZhbHNlO1xyXG4gICAgICAgIGNhbGxSZXNwb25zZXMuZGVsZXRlKGlkKTtcclxuICAgICAgICByZXN1bHQucmVzb2x2ZShyZXMpO1xyXG4gICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcclxuICAgICAgICBjYWxsUmVzcG9uc2VzLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgcmVzdWx0LnJlamVjdChlcnIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgY2FuY2VsID0gKCkgPT4ge1xyXG4gICAgICAgIGNhbGxSZXNwb25zZXMuZGVsZXRlKGlkKTtcclxuICAgICAgICByZXR1cm4gY2FuY2VsQ2FsbChDYW5jZWxNZXRob2QsIHtcImNhbGwtaWRcIjogaWR9KS5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciB3aGlsZSByZXF1ZXN0aW5nIGJpbmRpbmcgY2FsbCBjYW5jZWxsYXRpb246XCIsIGVycik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJlc3VsdC5vbmNhbmNlbGxlZCA9ICgpID0+IHtcclxuICAgICAgICBpZiAocnVubmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gY2FuY2VsKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QudGhlbihjYW5jZWwpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdC5wcm9taXNlO1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsbHMgYSBib3VuZCBtZXRob2QgYnkgbmFtZSB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzLlxyXG4gKiBTZWUge0BsaW5rIENhbGx9IGZvciBkZXRhaWxzLlxyXG4gKlxyXG4gKiBAcGFyYW0gbWV0aG9kTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgaW4gdGhlIGZvcm1hdCAncGFja2FnZS5zdHJ1Y3QubWV0aG9kJy5cclxuICogQHBhcmFtIGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cclxuICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGNhbGwuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gQnlOYW1lKG1ldGhvZE5hbWU6IHN0cmluZywgLi4uYXJnczogYW55W10pOiBDYW5jZWxsYWJsZVByb21pc2U8YW55PiB7XHJcbiAgICByZXR1cm4gQ2FsbCh7IG1ldGhvZE5hbWUsIGFyZ3MgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxscyBhIG1ldGhvZCBieSBpdHMgbnVtZXJpYyBJRCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzLlxyXG4gKiBTZWUge0BsaW5rIENhbGx9IGZvciBkZXRhaWxzLlxyXG4gKlxyXG4gKiBAcGFyYW0gbWV0aG9kSUQgLSBUaGUgSUQgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxyXG4gKiBAcGFyYW0gYXJncyAtIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kLlxyXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIG1ldGhvZCBjYWxsLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEJ5SUQobWV0aG9kSUQ6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBDYW5jZWxsYWJsZVByb21pc2U8YW55PiB7XHJcbiAgICByZXR1cm4gQ2FsbCh7IG1ldGhvZElELCBhcmdzIH0pO1xyXG59XHJcbiIsIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbmltcG9ydCB7bmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXN9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuXHJcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLkNsaXBib2FyZCk7XHJcblxyXG5jb25zdCBDbGlwYm9hcmRTZXRUZXh0ID0gMDtcclxuY29uc3QgQ2xpcGJvYXJkVGV4dCA9IDE7XHJcblxyXG4vKipcclxuICogU2V0cyB0aGUgdGV4dCB0byB0aGUgQ2xpcGJvYXJkLlxyXG4gKlxyXG4gKiBAcGFyYW0gdGV4dCAtIFRoZSB0ZXh0IHRvIGJlIHNldCB0byB0aGUgQ2xpcGJvYXJkLlxyXG4gKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIG9wZXJhdGlvbiBpcyBzdWNjZXNzZnVsLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFNldFRleHQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gY2FsbChDbGlwYm9hcmRTZXRUZXh0LCB7dGV4dH0pO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRoZSBDbGlwYm9hcmQgdGV4dFxyXG4gKlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSB0ZXh0IGZyb20gdGhlIENsaXBib2FyZC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICByZXR1cm4gY2FsbChDbGlwYm9hcmRUZXh0KTtcclxufVxyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG4vKipcclxuICogQW55IGlzIGEgZHVtbXkgY3JlYXRpb24gZnVuY3Rpb24gZm9yIHNpbXBsZSBvciB1bmtub3duIHR5cGVzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEFueTxUID0gYW55Pihzb3VyY2U6IGFueSk6IFQge1xyXG4gICAgcmV0dXJuIHNvdXJjZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEJ5dGVTbGljZSBpcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIHRoYXQgcmVwbGFjZXNcclxuICogbnVsbCBzdHJpbmdzIHdpdGggZW1wdHkgc3RyaW5ncy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBCeXRlU2xpY2Uoc291cmNlOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuICgoc291cmNlID09IG51bGwpID8gXCJcIiA6IHNvdXJjZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBcnJheSB0YWtlcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBhcmJpdHJhcnkgdHlwZVxyXG4gKiBhbmQgcmV0dXJucyBhbiBpbi1wbGFjZSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJyYXlcclxuICogd2hvc2UgZWxlbWVudHMgYXJlIG9mIHRoYXQgdHlwZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBBcnJheTxUID0gYW55PihlbGVtZW50OiAoc291cmNlOiBhbnkpID0+IFQpOiAoc291cmNlOiBhbnkpID0+IFRbXSB7XHJcbiAgICBpZiAoZWxlbWVudCA9PT0gQW55KSB7XHJcbiAgICAgICAgcmV0dXJuIChzb3VyY2UpID0+IChzb3VyY2UgPT09IG51bGwgPyBbXSA6IHNvdXJjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIChzb3VyY2UpID0+IHtcclxuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgc291cmNlW2ldID0gZWxlbWVudChzb3VyY2VbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc291cmNlO1xyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1hcCB0YWtlcyBjcmVhdGlvbiBmdW5jdGlvbnMgZm9yIHR3byBhcmJpdHJhcnkgdHlwZXNcclxuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIG9iamVjdFxyXG4gKiB3aG9zZSBrZXlzIGFuZCB2YWx1ZXMgYXJlIG9mIHRob3NlIHR5cGVzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIE1hcDxLIGV4dGVuZHMgUHJvcGVydHlLZXkgPSBhbnksIFYgPSBhbnk+KGtleTogKHNvdXJjZTogYW55KSA9PiBLLCB2YWx1ZTogKHNvdXJjZTogYW55KSA9PiBWKTogKHNvdXJjZTogYW55KSA9PiBSZWNvcmQ8SywgVj4ge1xyXG4gICAgaWYgKHZhbHVlID09PSBBbnkpIHtcclxuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IHt9IDogc291cmNlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xyXG4gICAgICAgIGlmIChzb3VyY2UgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcclxuICAgICAgICAgICAgc291cmNlW2tleV0gPSB2YWx1ZShzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzb3VyY2U7XHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogTnVsbGFibGUgdGFrZXMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJiaXRyYXJ5IHR5cGVcclxuICogYW5kIHJldHVybnMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYSBudWxsYWJsZSB2YWx1ZSBvZiB0aGF0IHR5cGUuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gTnVsbGFibGU8VCA9IGFueT4oZWxlbWVudDogKHNvdXJjZTogYW55KSA9PiBUKTogKHNvdXJjZTogYW55KSA9PiAoVCB8IG51bGwpIHtcclxuICAgIGlmIChlbGVtZW50ID09PSBBbnkpIHtcclxuICAgICAgICByZXR1cm4gQW55O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAoc291cmNlKSA9PiAoc291cmNlID09PSBudWxsID8gbnVsbCA6IGVsZW1lbnQoc291cmNlKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdHJ1Y3QgdGFrZXMgYW4gb2JqZWN0IG1hcHBpbmcgZmllbGQgbmFtZXMgdG8gY3JlYXRpb24gZnVuY3Rpb25zXHJcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhIHN0cnVjdC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBTdHJ1Y3QoY3JlYXRlRmllbGQ6IFJlY29yZDxzdHJpbmcsIChzb3VyY2U6IGFueSkgPT4gYW55Pik6XHJcbiAgICA8VSBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSBhbnk+KHNvdXJjZTogYW55KSA9PiBVXHJcbntcclxuICAgIGxldCBhbGxBbnkgPSB0cnVlO1xyXG4gICAgZm9yIChjb25zdCBuYW1lIGluIGNyZWF0ZUZpZWxkKSB7XHJcbiAgICAgICAgaWYgKGNyZWF0ZUZpZWxkW25hbWVdICE9PSBBbnkpIHtcclxuICAgICAgICAgICAgYWxsQW55ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChhbGxBbnkpIHtcclxuICAgICAgICByZXR1cm4gQW55O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAoc291cmNlKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIGNyZWF0ZUZpZWxkKSB7XHJcbiAgICAgICAgICAgIGlmIChuYW1lIGluIHNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgc291cmNlW25hbWVdID0gY3JlYXRlRmllbGRbbmFtZV0oc291cmNlW25hbWVdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc291cmNlO1xyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERhdGVGcm9tVGltZSBpcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIHRoYXQgY29udmVydHMgUkZDMzMzOSBzdHJpbmdzXHJcbiAqIChmcm9tIEdvJ3MgdGltZS5UaW1lIEpTT04gbWFyc2hhbGluZykgdG8gSmF2YVNjcmlwdCBEYXRlIG9iamVjdHMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gRGF0ZUZyb21UaW1lKHNvdXJjZTogYW55KTogRGF0ZSB7XHJcbiAgICByZXR1cm4gbmV3IERhdGUoc291cmNlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1hcHMga25vd24gZXZlbnQgbmFtZXMgdG8gY3JlYXRpb24gZnVuY3Rpb25zIGZvciB0aGVpciBkYXRhIHR5cGVzLlxyXG4gKiBXaWxsIGJlIG1vbmtleS1wYXRjaGVkIGJ5IHRoZSBiaW5kaW5nIGdlbmVyYXRvci5cclxuICovXHJcbmV4cG9ydCBjb25zdCBFdmVudHM6IFJlY29yZDxzdHJpbmcsIChzb3VyY2U6IGFueSkgPT4gYW55PiA9IHt9O1xyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQge25ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XHJcblxyXG4vLyBzZXR1cFxyXG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xyXG5cclxuaWYgKGhhc0RPTSkge1xyXG4gICAgd2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XHJcbn1cclxuXHJcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLkRpYWxvZyk7XHJcblxyXG4vLyBEZWZpbmUgY29uc3RhbnRzIGZyb20gdGhlIGBtZXRob2RzYCBvYmplY3QgaW4gVGl0bGUgQ2FzZVxyXG5jb25zdCBEaWFsb2dJbmZvID0gMDtcclxuY29uc3QgRGlhbG9nV2FybmluZyA9IDE7XHJcbmNvbnN0IERpYWxvZ0Vycm9yID0gMjtcclxuY29uc3QgRGlhbG9nUXVlc3Rpb24gPSAzO1xyXG5jb25zdCBEaWFsb2dPcGVuRmlsZSA9IDQ7XHJcbmNvbnN0IERpYWxvZ1NhdmVGaWxlID0gNTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3BlbkZpbGVEaWFsb2dPcHRpb25zIHtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgZGlyZWN0b3JpZXMgY2FuIGJlIGNob3Nlbi4gKi9cclxuICAgIENhbkNob29zZURpcmVjdG9yaWVzPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgZmlsZXMgY2FuIGJlIGNob3Nlbi4gKi9cclxuICAgIENhbkNob29zZUZpbGVzPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgZGlyZWN0b3JpZXMgY2FuIGJlIGNyZWF0ZWQuICovXHJcbiAgICBDYW5DcmVhdGVEaXJlY3Rvcmllcz86IGJvb2xlYW47XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIGhpZGRlbiBmaWxlcyBzaG91bGQgYmUgc2hvd24uICovXHJcbiAgICBTaG93SGlkZGVuRmlsZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBhbGlhc2VzIHNob3VsZCBiZSByZXNvbHZlZC4gKi9cclxuICAgIFJlc29sdmVzQWxpYXNlcz86IGJvb2xlYW47XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIG11bHRpcGxlIHNlbGVjdGlvbiBpcyBhbGxvd2VkLiAqL1xyXG4gICAgQWxsb3dzTXVsdGlwbGVTZWxlY3Rpb24/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiB0aGUgZXh0ZW5zaW9uIHNob3VsZCBiZSBoaWRkZW4uICovXHJcbiAgICBIaWRlRXh0ZW5zaW9uPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgaGlkZGVuIGV4dGVuc2lvbnMgY2FuIGJlIHNlbGVjdGVkLiAqL1xyXG4gICAgQ2FuU2VsZWN0SGlkZGVuRXh0ZW5zaW9uPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgZmlsZSBwYWNrYWdlcyBzaG91bGQgYmUgdHJlYXRlZCBhcyBkaXJlY3Rvcmllcy4gKi9cclxuICAgIFRyZWF0c0ZpbGVQYWNrYWdlc0FzRGlyZWN0b3JpZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBvdGhlciBmaWxlIHR5cGVzIGFyZSBhbGxvd2VkLiAqL1xyXG4gICAgQWxsb3dzT3RoZXJGaWxldHlwZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEFycmF5IG9mIGZpbGUgZmlsdGVycy4gKi9cclxuICAgIEZpbHRlcnM/OiBGaWxlRmlsdGVyW107XHJcbiAgICAvKiogVGl0bGUgb2YgdGhlIGRpYWxvZy4gKi9cclxuICAgIFRpdGxlPzogc3RyaW5nO1xyXG4gICAgLyoqIE1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLiAqL1xyXG4gICAgTWVzc2FnZT86IHN0cmluZztcclxuICAgIC8qKiBUZXh0IHRvIGRpc3BsYXkgb24gdGhlIGJ1dHRvbi4gKi9cclxuICAgIEJ1dHRvblRleHQ/OiBzdHJpbmc7XHJcbiAgICAvKiogRGlyZWN0b3J5IHRvIG9wZW4gaW4gdGhlIGRpYWxvZy4gKi9cclxuICAgIERpcmVjdG9yeT86IHN0cmluZztcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93LiAqL1xyXG4gICAgRGV0YWNoZWQ/OiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNhdmVGaWxlRGlhbG9nT3B0aW9ucyB7XHJcbiAgICAvKiogRGVmYXVsdCBmaWxlbmFtZSB0byB1c2UgaW4gdGhlIGRpYWxvZy4gKi9cclxuICAgIEZpbGVuYW1lPzogc3RyaW5nO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBkaXJlY3RvcmllcyBjYW4gYmUgY2hvc2VuLiAqL1xyXG4gICAgQ2FuQ2hvb3NlRGlyZWN0b3JpZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBmaWxlcyBjYW4gYmUgY2hvc2VuLiAqL1xyXG4gICAgQ2FuQ2hvb3NlRmlsZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBkaXJlY3RvcmllcyBjYW4gYmUgY3JlYXRlZC4gKi9cclxuICAgIENhbkNyZWF0ZURpcmVjdG9yaWVzPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgaGlkZGVuIGZpbGVzIHNob3VsZCBiZSBzaG93bi4gKi9cclxuICAgIFNob3dIaWRkZW5GaWxlcz86IGJvb2xlYW47XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIGFsaWFzZXMgc2hvdWxkIGJlIHJlc29sdmVkLiAqL1xyXG4gICAgUmVzb2x2ZXNBbGlhc2VzPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgdGhlIGV4dGVuc2lvbiBzaG91bGQgYmUgaGlkZGVuLiAqL1xyXG4gICAgSGlkZUV4dGVuc2lvbj86IGJvb2xlYW47XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIGhpZGRlbiBleHRlbnNpb25zIGNhbiBiZSBzZWxlY3RlZC4gKi9cclxuICAgIENhblNlbGVjdEhpZGRlbkV4dGVuc2lvbj86IGJvb2xlYW47XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIGZpbGUgcGFja2FnZXMgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZGlyZWN0b3JpZXMuICovXHJcbiAgICBUcmVhdHNGaWxlUGFja2FnZXNBc0RpcmVjdG9yaWVzPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgb3RoZXIgZmlsZSB0eXBlcyBhcmUgYWxsb3dlZC4gKi9cclxuICAgIEFsbG93c090aGVyRmlsZXR5cGVzPzogYm9vbGVhbjtcclxuICAgIC8qKiBBcnJheSBvZiBmaWxlIGZpbHRlcnMuICovXHJcbiAgICBGaWx0ZXJzPzogRmlsZUZpbHRlcltdO1xyXG4gICAgLyoqIFRpdGxlIG9mIHRoZSBkaWFsb2cuICovXHJcbiAgICBUaXRsZT86IHN0cmluZztcclxuICAgIC8qKiBNZXNzYWdlIHRvIHNob3cgaW4gdGhlIGRpYWxvZy4gKi9cclxuICAgIE1lc3NhZ2U/OiBzdHJpbmc7XHJcbiAgICAvKiogVGV4dCB0byBkaXNwbGF5IG9uIHRoZSBidXR0b24uICovXHJcbiAgICBCdXR0b25UZXh0Pzogc3RyaW5nO1xyXG4gICAgLyoqIERpcmVjdG9yeSB0byBvcGVuIGluIHRoZSBkaWFsb2cuICovXHJcbiAgICBEaXJlY3Rvcnk/OiBzdHJpbmc7XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIHRoZSBkaWFsb2cgc2hvdWxkIGFwcGVhciBkZXRhY2hlZCBmcm9tIHRoZSBtYWluIHdpbmRvdy4gKi9cclxuICAgIERldGFjaGVkPzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBNZXNzYWdlRGlhbG9nT3B0aW9ucyB7XHJcbiAgICAvKiogVGhlIHRpdGxlIG9mIHRoZSBkaWFsb2cgd2luZG93LiAqL1xyXG4gICAgVGl0bGU/OiBzdHJpbmc7XHJcbiAgICAvKiogVGhlIG1haW4gbWVzc2FnZSB0byBzaG93IGluIHRoZSBkaWFsb2cuICovXHJcbiAgICBNZXNzYWdlPzogc3RyaW5nO1xyXG4gICAgLyoqIEFycmF5IG9mIGJ1dHRvbiBvcHRpb25zIHRvIHNob3cgaW4gdGhlIGRpYWxvZy4gKi9cclxuICAgIEJ1dHRvbnM/OiBCdXR0b25bXTtcclxuICAgIC8qKiBUcnVlIGlmIHRoZSBkaWFsb2cgc2hvdWxkIGFwcGVhciBkZXRhY2hlZCBmcm9tIHRoZSBtYWluIHdpbmRvdyAoaWYgYXBwbGljYWJsZSkuICovXHJcbiAgICBEZXRhY2hlZD86IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnV0dG9uIHtcclxuICAgIC8qKiBUZXh0IHRoYXQgYXBwZWFycyB3aXRoaW4gdGhlIGJ1dHRvbi4gKi9cclxuICAgIExhYmVsPzogc3RyaW5nO1xyXG4gICAgLyoqIFRydWUgaWYgdGhlIGJ1dHRvbiBzaG91bGQgY2FuY2VsIGFuIG9wZXJhdGlvbiB3aGVuIGNsaWNrZWQuICovXHJcbiAgICBJc0NhbmNlbD86IGJvb2xlYW47XHJcbiAgICAvKiogVHJ1ZSBpZiB0aGUgYnV0dG9uIHNob3VsZCBiZSB0aGUgZGVmYXVsdCBhY3Rpb24gd2hlbiB0aGUgdXNlciBwcmVzc2VzIGVudGVyLiAqL1xyXG4gICAgSXNEZWZhdWx0PzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlRmlsdGVyIHtcclxuICAgIC8qKiBEaXNwbGF5IG5hbWUgZm9yIHRoZSBmaWx0ZXIsIGl0IGNvdWxkIGJlIFwiVGV4dCBGaWxlc1wiLCBcIkltYWdlc1wiIGV0Yy4gKi9cclxuICAgIERpc3BsYXlOYW1lPzogc3RyaW5nO1xyXG4gICAgLyoqIFBhdHRlcm4gdG8gbWF0Y2ggZm9yIHRoZSBmaWx0ZXIsIGUuZy4gXCIqLnR4dDsqLm1kXCIgZm9yIHRleHQgbWFya2Rvd24gZmlsZXMuICovXHJcbiAgICBQYXR0ZXJuPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogUHJlc2VudHMgYSBkaWFsb2cgb2Ygc3BlY2lmaWVkIHR5cGUgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cclxuICpcclxuICogQHBhcmFtIHR5cGUgLSBEaWFsb2cgdHlwZS5cclxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIGZvciB0aGUgZGlhbG9nLlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHJlc3VsdCBvZiBkaWFsb2cuXHJcbiAqL1xyXG5mdW5jdGlvbiBkaWFsb2codHlwZTogbnVtYmVyLCBvcHRpb25zOiBNZXNzYWdlRGlhbG9nT3B0aW9ucyB8IE9wZW5GaWxlRGlhbG9nT3B0aW9ucyB8IFNhdmVGaWxlRGlhbG9nT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHJldHVybiBjYWxsKHR5cGUsIG9wdGlvbnMpO1xyXG59XHJcblxyXG4vKipcclxuICogUHJlc2VudHMgYW4gaW5mbyBkaWFsb2cuXHJcbiAqXHJcbiAqIEBwYXJhbSBvcHRpb25zIC0gRGlhbG9nIG9wdGlvbnNcclxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgbGFiZWwgb2YgdGhlIGNob3NlbiBidXR0b24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSW5mbyhvcHRpb25zOiBNZXNzYWdlRGlhbG9nT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7IHJldHVybiBkaWFsb2coRGlhbG9nSW5mbywgb3B0aW9ucyk7IH1cclxuXHJcbi8qKlxyXG4gKiBQcmVzZW50cyBhIHdhcm5pbmcgZGlhbG9nLlxyXG4gKlxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIERpYWxvZyBvcHRpb25zLlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBsYWJlbCBvZiB0aGUgY2hvc2VuIGJ1dHRvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBXYXJuaW5nKG9wdGlvbnM6IE1lc3NhZ2VEaWFsb2dPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHsgcmV0dXJuIGRpYWxvZyhEaWFsb2dXYXJuaW5nLCBvcHRpb25zKTsgfVxyXG5cclxuLyoqXHJcbiAqIFByZXNlbnRzIGFuIGVycm9yIGRpYWxvZy5cclxuICpcclxuICogQHBhcmFtIG9wdGlvbnMgLSBEaWFsb2cgb3B0aW9ucy5cclxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgbGFiZWwgb2YgdGhlIGNob3NlbiBidXR0b24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gRXJyb3Iob3B0aW9uczogTWVzc2FnZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4geyByZXR1cm4gZGlhbG9nKERpYWxvZ0Vycm9yLCBvcHRpb25zKTsgfVxyXG5cclxuLyoqXHJcbiAqIFByZXNlbnRzIGEgcXVlc3Rpb24gZGlhbG9nLlxyXG4gKlxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIERpYWxvZyBvcHRpb25zLlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBsYWJlbCBvZiB0aGUgY2hvc2VuIGJ1dHRvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBRdWVzdGlvbihvcHRpb25zOiBNZXNzYWdlRGlhbG9nT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7IHJldHVybiBkaWFsb2coRGlhbG9nUXVlc3Rpb24sIG9wdGlvbnMpOyB9XHJcblxyXG4vKipcclxuICogUHJlc2VudHMgYSBmaWxlIHNlbGVjdGlvbiBkaWFsb2cgdG8gcGljayBvbmUgb3IgbW9yZSBmaWxlcyB0byBvcGVuLlxyXG4gKlxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIERpYWxvZyBvcHRpb25zLlxyXG4gKiBAcmV0dXJucyBTZWxlY3RlZCBmaWxlIG9yIGxpc3Qgb2YgZmlsZXMsIG9yIGEgYmxhbmsgc3RyaW5nL2VtcHR5IGxpc3QgaWYgbm8gZmlsZSBoYXMgYmVlbiBzZWxlY3RlZC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBPcGVuRmlsZShvcHRpb25zOiBPcGVuRmlsZURpYWxvZ09wdGlvbnMgJiB7IEFsbG93c011bHRpcGxlU2VsZWN0aW9uOiB0cnVlIH0pOiBQcm9taXNlPHN0cmluZ1tdPjtcclxuZXhwb3J0IGZ1bmN0aW9uIE9wZW5GaWxlKG9wdGlvbnM6IE9wZW5GaWxlRGlhbG9nT3B0aW9ucyAmIHsgQWxsb3dzTXVsdGlwbGVTZWxlY3Rpb24/OiBmYWxzZSB8IHVuZGVmaW5lZCB9KTogUHJvbWlzZTxzdHJpbmc+O1xyXG5leHBvcnQgZnVuY3Rpb24gT3BlbkZpbGUob3B0aW9uczogT3BlbkZpbGVEaWFsb2dPcHRpb25zKTogUHJvbWlzZTxzdHJpbmcgfCBzdHJpbmdbXT47XHJcbmV4cG9ydCBmdW5jdGlvbiBPcGVuRmlsZShvcHRpb25zOiBPcGVuRmlsZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZyB8IHN0cmluZ1tdPiB7IHJldHVybiBkaWFsb2coRGlhbG9nT3BlbkZpbGUsIG9wdGlvbnMpID8/IFtdOyB9XHJcblxyXG4vKipcclxuICogUHJlc2VudHMgYSBmaWxlIHNlbGVjdGlvbiBkaWFsb2cgdG8gcGljayBhIGZpbGUgdG8gc2F2ZS5cclxuICpcclxuICogQHBhcmFtIG9wdGlvbnMgLSBEaWFsb2cgb3B0aW9ucy5cclxuICogQHJldHVybnMgU2VsZWN0ZWQgZmlsZSwgb3IgYSBibGFuayBzdHJpbmcgaWYgbm8gZmlsZSBoYXMgYmVlbiBzZWxlY3RlZC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBTYXZlRmlsZShvcHRpb25zOiBTYXZlRmlsZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4geyByZXR1cm4gZGlhbG9nKERpYWxvZ1NhdmVGaWxlLCBvcHRpb25zKTsgfVxyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG4vLyBUaGUgZm9sbG93aW5nIHV0aWxpdGllcyBoYXZlIGJlZW4gZmFjdG9yZWQgb3V0IG9mIC4vZXZlbnRzLnRzXHJcbi8vIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxyXG5cclxuZXhwb3J0IGNvbnN0IGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIExpc3RlbmVyW10+KCk7XHJcblxyXG5leHBvcnQgY2xhc3MgTGlzdGVuZXIge1xyXG4gICAgZXZlbnROYW1lOiBzdHJpbmc7XHJcbiAgICBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gdm9pZDtcclxuICAgIG1heENhbGxiYWNrczogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gdm9pZCwgbWF4Q2FsbGJhY2tzOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgdGhpcy5tYXhDYWxsYmFja3MgPSBtYXhDYWxsYmFja3MgfHwgLTE7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcGF0Y2goZGF0YTogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayhkYXRhKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWF4Q2FsbGJhY2tzID09PSAtMSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHRoaXMubWF4Q2FsbGJhY2tzIC09IDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWF4Q2FsbGJhY2tzID09PSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuZXJPZmYobGlzdGVuZXI6IExpc3RlbmVyKTogdm9pZCB7XHJcbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGxpc3RlbmVyLmV2ZW50TmFtZSk7XHJcbiAgICBpZiAoIWxpc3RlbmVycykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuZmlsdGVyKGwgPT4gbCAhPT0gbGlzdGVuZXIpO1xyXG4gICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICBldmVudExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIuZXZlbnROYW1lKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZXZlbnRMaXN0ZW5lcnMuc2V0KGxpc3RlbmVyLmV2ZW50TmFtZSwgbGlzdGVuZXJzKTtcclxuICAgIH1cclxufVxyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIMOCIE1PRElXTFxyXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXHJcblxyXG5leHBvcnQgY29uc3QgVHlwZXMgPSBPYmplY3QuZnJlZXplKHtcclxuXHRXaW5kb3dzOiBPYmplY3QuZnJlZXplKHtcclxuXHRcdEFQTVBvd2VyU2V0dGluZ0NoYW5nZTogXCJ3aW5kb3dzOkFQTVBvd2VyU2V0dGluZ0NoYW5nZVwiLFxyXG5cdFx0QVBNUG93ZXJTdGF0dXNDaGFuZ2U6IFwid2luZG93czpBUE1Qb3dlclN0YXR1c0NoYW5nZVwiLFxyXG5cdFx0QVBNUmVzdW1lQXV0b21hdGljOiBcIndpbmRvd3M6QVBNUmVzdW1lQXV0b21hdGljXCIsXHJcblx0XHRBUE1SZXN1bWVTdXNwZW5kOiBcIndpbmRvd3M6QVBNUmVzdW1lU3VzcGVuZFwiLFxyXG5cdFx0QVBNU3VzcGVuZDogXCJ3aW5kb3dzOkFQTVN1c3BlbmRcIixcclxuXHRcdEFwcGxpY2F0aW9uU3RhcnRlZDogXCJ3aW5kb3dzOkFwcGxpY2F0aW9uU3RhcnRlZFwiLFxyXG5cdFx0U3lzdGVtVGhlbWVDaGFuZ2VkOiBcIndpbmRvd3M6U3lzdGVtVGhlbWVDaGFuZ2VkXCIsXHJcblx0XHRXZWJWaWV3TmF2aWdhdGlvbkNvbXBsZXRlZDogXCJ3aW5kb3dzOldlYlZpZXdOYXZpZ2F0aW9uQ29tcGxldGVkXCIsXHJcblx0XHRXaW5kb3dBY3RpdmU6IFwid2luZG93czpXaW5kb3dBY3RpdmVcIixcclxuXHRcdFdpbmRvd0JhY2tncm91bmRFcmFzZTogXCJ3aW5kb3dzOldpbmRvd0JhY2tncm91bmRFcmFzZVwiLFxyXG5cdFx0V2luZG93Q2xpY2tBY3RpdmU6IFwid2luZG93czpXaW5kb3dDbGlja0FjdGl2ZVwiLFxyXG5cdFx0V2luZG93Q2xvc2luZzogXCJ3aW5kb3dzOldpbmRvd0Nsb3NpbmdcIixcclxuXHRcdFdpbmRvd0RpZE1vdmU6IFwid2luZG93czpXaW5kb3dEaWRNb3ZlXCIsXHJcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwid2luZG93czpXaW5kb3dEaWRSZXNpemVcIixcclxuXHRcdFdpbmRvd0RQSUNoYW5nZWQ6IFwid2luZG93czpXaW5kb3dEUElDaGFuZ2VkXCIsXHJcblx0XHRXaW5kb3dEcmFnRHJvcDogXCJ3aW5kb3dzOldpbmRvd0RyYWdEcm9wXCIsXHJcblx0XHRXaW5kb3dEcmFnRW50ZXI6IFwid2luZG93czpXaW5kb3dEcmFnRW50ZXJcIixcclxuXHRcdFdpbmRvd0RyYWdMZWF2ZTogXCJ3aW5kb3dzOldpbmRvd0RyYWdMZWF2ZVwiLFxyXG5cdFx0V2luZG93RHJhZ092ZXI6IFwid2luZG93czpXaW5kb3dEcmFnT3ZlclwiLFxyXG5cdFx0V2luZG93RW5kTW92ZTogXCJ3aW5kb3dzOldpbmRvd0VuZE1vdmVcIixcclxuXHRcdFdpbmRvd0VuZFJlc2l6ZTogXCJ3aW5kb3dzOldpbmRvd0VuZFJlc2l6ZVwiLFxyXG5cdFx0V2luZG93RnVsbHNjcmVlbjogXCJ3aW5kb3dzOldpbmRvd0Z1bGxzY3JlZW5cIixcclxuXHRcdFdpbmRvd0hpZGU6IFwid2luZG93czpXaW5kb3dIaWRlXCIsXHJcblx0XHRXaW5kb3dJbmFjdGl2ZTogXCJ3aW5kb3dzOldpbmRvd0luYWN0aXZlXCIsXHJcblx0XHRXaW5kb3dLZXlEb3duOiBcIndpbmRvd3M6V2luZG93S2V5RG93blwiLFxyXG5cdFx0V2luZG93S2V5VXA6IFwid2luZG93czpXaW5kb3dLZXlVcFwiLFxyXG5cdFx0V2luZG93S2lsbEZvY3VzOiBcIndpbmRvd3M6V2luZG93S2lsbEZvY3VzXCIsXHJcblx0XHRXaW5kb3dOb25DbGllbnRIaXQ6IFwid2luZG93czpXaW5kb3dOb25DbGllbnRIaXRcIixcclxuXHRcdFdpbmRvd05vbkNsaWVudE1vdXNlRG93bjogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlRG93blwiLFxyXG5cdFx0V2luZG93Tm9uQ2xpZW50TW91c2VMZWF2ZTogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlTGVhdmVcIixcclxuXHRcdFdpbmRvd05vbkNsaWVudE1vdXNlTW92ZTogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlTW92ZVwiLFxyXG5cdFx0V2luZG93Tm9uQ2xpZW50TW91c2VVcDogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlVXBcIixcclxuXHRcdFdpbmRvd1BhaW50OiBcIndpbmRvd3M6V2luZG93UGFpbnRcIixcclxuXHRcdFdpbmRvd1Jlc3RvcmU6IFwid2luZG93czpXaW5kb3dSZXN0b3JlXCIsXHJcblx0XHRXaW5kb3dTZXRGb2N1czogXCJ3aW5kb3dzOldpbmRvd1NldEZvY3VzXCIsXHJcblx0XHRXaW5kb3dTaG93OiBcIndpbmRvd3M6V2luZG93U2hvd1wiLFxyXG5cdFx0V2luZG93U3RhcnRNb3ZlOiBcIndpbmRvd3M6V2luZG93U3RhcnRNb3ZlXCIsXHJcblx0XHRXaW5kb3dTdGFydFJlc2l6ZTogXCJ3aW5kb3dzOldpbmRvd1N0YXJ0UmVzaXplXCIsXHJcblx0XHRXaW5kb3dVbkZ1bGxzY3JlZW46IFwid2luZG93czpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcclxuXHRcdFdpbmRvd1pPcmRlckNoYW5nZWQ6IFwid2luZG93czpXaW5kb3daT3JkZXJDaGFuZ2VkXCIsXHJcblx0XHRXaW5kb3dNaW5pbWlzZTogXCJ3aW5kb3dzOldpbmRvd01pbmltaXNlXCIsXHJcblx0XHRXaW5kb3dVbk1pbmltaXNlOiBcIndpbmRvd3M6V2luZG93VW5NaW5pbWlzZVwiLFxyXG5cdFx0V2luZG93TWF4aW1pc2U6IFwid2luZG93czpXaW5kb3dNYXhpbWlzZVwiLFxyXG5cdFx0V2luZG93VW5NYXhpbWlzZTogXCJ3aW5kb3dzOldpbmRvd1VuTWF4aW1pc2VcIixcclxuXHR9KSxcclxuXHRNYWM6IE9iamVjdC5mcmVlemUoe1xyXG5cdFx0QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQmVjb21lQWN0aXZlXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUVmZmVjdGl2ZUFwcGVhcmFuY2U6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZVwiLFxyXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VJY29uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUljb25cIixcclxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGVcIixcclxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlU2NyZWVuUGFyYW1ldGVyczogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0Jhck9yaWVudGF0aW9uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0Jhck9yaWVudGF0aW9uXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVRoZW1lOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVRoZW1lXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZzogXCJtYWM6QXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmdcIixcclxuXHRcdEFwcGxpY2F0aW9uRGlkSGlkZTogXCJtYWM6QXBwbGljYXRpb25EaWRIaWRlXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZFJlc2lnbkFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25EaWRSZXNpZ25BY3RpdmVcIixcclxuXHRcdEFwcGxpY2F0aW9uRGlkVW5oaWRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZFVuaGlkZVwiLFxyXG5cdFx0QXBwbGljYXRpb25EaWRVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkVXBkYXRlXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZFdha2U6IFwibWFjOkFwcGxpY2F0aW9uRGlkV2FrZVwiLFxyXG5cdFx0QXBwbGljYXRpb25TY3JlZW5zRGlkU2xlZXA6IFwibWFjOkFwcGxpY2F0aW9uU2NyZWVuc0RpZFNsZWVwXCIsXHJcblx0XHRBcHBsaWNhdGlvblNjcmVlbnNEaWRXYWtlOiBcIm1hYzpBcHBsaWNhdGlvblNjcmVlbnNEaWRXYWtlXCIsXHJcblx0XHRBcHBsaWNhdGlvblNob3VsZEhhbmRsZVJlb3BlbjogXCJtYWM6QXBwbGljYXRpb25TaG91bGRIYW5kbGVSZW9wZW5cIixcclxuXHRcdEFwcGxpY2F0aW9uV2lsbEJlY29tZUFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsQmVjb21lQWN0aXZlXCIsXHJcblx0XHRBcHBsaWNhdGlvbldpbGxGaW5pc2hMYXVuY2hpbmc6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEZpbmlzaExhdW5jaGluZ1wiLFxyXG5cdFx0QXBwbGljYXRpb25XaWxsSGlkZTogXCJtYWM6QXBwbGljYXRpb25XaWxsSGlkZVwiLFxyXG5cdFx0QXBwbGljYXRpb25XaWxsUmVzaWduQWN0aXZlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmVcIixcclxuXHRcdEFwcGxpY2F0aW9uV2lsbFNsZWVwOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxTbGVlcFwiLFxyXG5cdFx0QXBwbGljYXRpb25XaWxsVGVybWluYXRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxUZXJtaW5hdGVcIixcclxuXHRcdEFwcGxpY2F0aW9uV2lsbFVuaGlkZTogXCJtYWM6QXBwbGljYXRpb25XaWxsVW5oaWRlXCIsXHJcblx0XHRBcHBsaWNhdGlvbldpbGxVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFVwZGF0ZVwiLFxyXG5cdFx0TWVudURpZEFkZEl0ZW06IFwibWFjOk1lbnVEaWRBZGRJdGVtXCIsXHJcblx0XHRNZW51RGlkQmVnaW5UcmFja2luZzogXCJtYWM6TWVudURpZEJlZ2luVHJhY2tpbmdcIixcclxuXHRcdE1lbnVEaWRDbG9zZTogXCJtYWM6TWVudURpZENsb3NlXCIsXHJcblx0XHRNZW51RGlkRGlzcGxheUl0ZW06IFwibWFjOk1lbnVEaWREaXNwbGF5SXRlbVwiLFxyXG5cdFx0TWVudURpZEVuZFRyYWNraW5nOiBcIm1hYzpNZW51RGlkRW5kVHJhY2tpbmdcIixcclxuXHRcdE1lbnVEaWRIaWdobGlnaHRJdGVtOiBcIm1hYzpNZW51RGlkSGlnaGxpZ2h0SXRlbVwiLFxyXG5cdFx0TWVudURpZE9wZW46IFwibWFjOk1lbnVEaWRPcGVuXCIsXHJcblx0XHRNZW51RGlkUG9wVXA6IFwibWFjOk1lbnVEaWRQb3BVcFwiLFxyXG5cdFx0TWVudURpZFJlbW92ZUl0ZW06IFwibWFjOk1lbnVEaWRSZW1vdmVJdGVtXCIsXHJcblx0XHRNZW51RGlkU2VuZEFjdGlvbjogXCJtYWM6TWVudURpZFNlbmRBY3Rpb25cIixcclxuXHRcdE1lbnVEaWRTZW5kQWN0aW9uVG9JdGVtOiBcIm1hYzpNZW51RGlkU2VuZEFjdGlvblRvSXRlbVwiLFxyXG5cdFx0TWVudURpZFVwZGF0ZTogXCJtYWM6TWVudURpZFVwZGF0ZVwiLFxyXG5cdFx0TWVudVdpbGxBZGRJdGVtOiBcIm1hYzpNZW51V2lsbEFkZEl0ZW1cIixcclxuXHRcdE1lbnVXaWxsQmVnaW5UcmFja2luZzogXCJtYWM6TWVudVdpbGxCZWdpblRyYWNraW5nXCIsXHJcblx0XHRNZW51V2lsbERpc3BsYXlJdGVtOiBcIm1hYzpNZW51V2lsbERpc3BsYXlJdGVtXCIsXHJcblx0XHRNZW51V2lsbEVuZFRyYWNraW5nOiBcIm1hYzpNZW51V2lsbEVuZFRyYWNraW5nXCIsXHJcblx0XHRNZW51V2lsbEhpZ2hsaWdodEl0ZW06IFwibWFjOk1lbnVXaWxsSGlnaGxpZ2h0SXRlbVwiLFxyXG5cdFx0TWVudVdpbGxPcGVuOiBcIm1hYzpNZW51V2lsbE9wZW5cIixcclxuXHRcdE1lbnVXaWxsUG9wVXA6IFwibWFjOk1lbnVXaWxsUG9wVXBcIixcclxuXHRcdE1lbnVXaWxsUmVtb3ZlSXRlbTogXCJtYWM6TWVudVdpbGxSZW1vdmVJdGVtXCIsXHJcblx0XHRNZW51V2lsbFNlbmRBY3Rpb246IFwibWFjOk1lbnVXaWxsU2VuZEFjdGlvblwiLFxyXG5cdFx0TWVudVdpbGxTZW5kQWN0aW9uVG9JdGVtOiBcIm1hYzpNZW51V2lsbFNlbmRBY3Rpb25Ub0l0ZW1cIixcclxuXHRcdE1lbnVXaWxsVXBkYXRlOiBcIm1hYzpNZW51V2lsbFVwZGF0ZVwiLFxyXG5cdFx0V2ViVmlld0RpZENvbW1pdE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRDb21taXROYXZpZ2F0aW9uXCIsXHJcblx0XHRXZWJWaWV3RGlkRmluaXNoTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZEZpbmlzaE5hdmlnYXRpb25cIixcclxuXHRcdFdlYlZpZXdEaWRSZWNlaXZlU2VydmVyUmVkaXJlY3RGb3JQcm92aXNpb25hbE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRSZWNlaXZlU2VydmVyUmVkaXJlY3RGb3JQcm92aXNpb25hbE5hdmlnYXRpb25cIixcclxuXHRcdFdlYlZpZXdEaWRTdGFydFByb3Zpc2lvbmFsTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZFN0YXJ0UHJvdmlzaW9uYWxOYXZpZ2F0aW9uXCIsXHJcblx0XHRXaW5kb3dEaWRCZWNvbWVLZXk6IFwibWFjOldpbmRvd0RpZEJlY29tZUtleVwiLFxyXG5cdFx0V2luZG93RGlkQmVjb21lTWFpbjogXCJtYWM6V2luZG93RGlkQmVjb21lTWFpblwiLFxyXG5cdFx0V2luZG93RGlkQmVnaW5TaGVldDogXCJtYWM6V2luZG93RGlkQmVnaW5TaGVldFwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlQWxwaGE6IFwibWFjOldpbmRvd0RpZENoYW5nZUFscGhhXCIsXHJcblx0XHRXaW5kb3dEaWRDaGFuZ2VCYWNraW5nTG9jYXRpb246IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdMb2NhdGlvblwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlQmFja2luZ1Byb3BlcnRpZXM6IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzXCIsXHJcblx0XHRXaW5kb3dEaWRDaGFuZ2VDb2xsZWN0aW9uQmVoYXZpb3I6IFwibWFjOldpbmRvd0RpZENoYW5nZUNvbGxlY3Rpb25CZWhhdmlvclwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZVwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGU6IFwibWFjOldpbmRvd0RpZENoYW5nZU9jY2x1c2lvblN0YXRlXCIsXHJcblx0XHRXaW5kb3dEaWRDaGFuZ2VPcmRlcmluZ01vZGU6IFwibWFjOldpbmRvd0RpZENoYW5nZU9yZGVyaW5nTW9kZVwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5cIixcclxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblBhcmFtZXRlcnM6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblBhcmFtZXRlcnNcIixcclxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblByb2ZpbGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblByb2ZpbGVcIixcclxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2VQcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVByb3BlcnRpZXNcIixcclxuXHRcdFdpbmRvd0RpZENoYW5nZVNoYXJpbmdUeXBlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTaGFyaW5nVHlwZVwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlU3BhY2U6IFwibWFjOldpbmRvd0RpZENoYW5nZVNwYWNlXCIsXHJcblx0XHRXaW5kb3dEaWRDaGFuZ2VTcGFjZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU3BhY2VPcmRlcmluZ01vZGVcIixcclxuXHRcdFdpbmRvd0RpZENoYW5nZVRpdGxlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VUaXRsZVwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlVG9vbGJhcjogXCJtYWM6V2luZG93RGlkQ2hhbmdlVG9vbGJhclwiLFxyXG5cdFx0V2luZG93RGlkRGVtaW5pYXR1cml6ZTogXCJtYWM6V2luZG93RGlkRGVtaW5pYXR1cml6ZVwiLFxyXG5cdFx0V2luZG93RGlkRW5kU2hlZXQ6IFwibWFjOldpbmRvd0RpZEVuZFNoZWV0XCIsXHJcblx0XHRXaW5kb3dEaWRFbnRlckZ1bGxTY3JlZW46IFwibWFjOldpbmRvd0RpZEVudGVyRnVsbFNjcmVlblwiLFxyXG5cdFx0V2luZG93RGlkRW50ZXJWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93RGlkRW50ZXJWZXJzaW9uQnJvd3NlclwiLFxyXG5cdFx0V2luZG93RGlkRXhpdEZ1bGxTY3JlZW46IFwibWFjOldpbmRvd0RpZEV4aXRGdWxsU2NyZWVuXCIsXHJcblx0XHRXaW5kb3dEaWRFeGl0VmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd0RpZEV4aXRWZXJzaW9uQnJvd3NlclwiLFxyXG5cdFx0V2luZG93RGlkRXhwb3NlOiBcIm1hYzpXaW5kb3dEaWRFeHBvc2VcIixcclxuXHRcdFdpbmRvd0RpZEZvY3VzOiBcIm1hYzpXaW5kb3dEaWRGb2N1c1wiLFxyXG5cdFx0V2luZG93RGlkTWluaWF0dXJpemU6IFwibWFjOldpbmRvd0RpZE1pbmlhdHVyaXplXCIsXHJcblx0XHRXaW5kb3dEaWRNb3ZlOiBcIm1hYzpXaW5kb3dEaWRNb3ZlXCIsXHJcblx0XHRXaW5kb3dEaWRPcmRlck9mZlNjcmVlbjogXCJtYWM6V2luZG93RGlkT3JkZXJPZmZTY3JlZW5cIixcclxuXHRcdFdpbmRvd0RpZE9yZGVyT25TY3JlZW46IFwibWFjOldpbmRvd0RpZE9yZGVyT25TY3JlZW5cIixcclxuXHRcdFdpbmRvd0RpZFJlc2lnbktleTogXCJtYWM6V2luZG93RGlkUmVzaWduS2V5XCIsXHJcblx0XHRXaW5kb3dEaWRSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dEaWRSZXNpZ25NYWluXCIsXHJcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwibWFjOldpbmRvd0RpZFJlc2l6ZVwiLFxyXG5cdFx0V2luZG93RGlkVXBkYXRlOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVcIixcclxuXHRcdFdpbmRvd0RpZFVwZGF0ZUFscGhhOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVBbHBoYVwiLFxyXG5cdFx0V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3JcIixcclxuXHRcdFdpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllc1wiLFxyXG5cdFx0V2luZG93RGlkVXBkYXRlU2hhZG93OiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVTaGFkb3dcIixcclxuXHRcdFdpbmRvd0RpZFVwZGF0ZVRpdGxlOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVUaXRsZVwiLFxyXG5cdFx0V2luZG93RGlkVXBkYXRlVG9vbGJhcjogXCJtYWM6V2luZG93RGlkVXBkYXRlVG9vbGJhclwiLFxyXG5cdFx0V2luZG93RGlkWm9vbTogXCJtYWM6V2luZG93RGlkWm9vbVwiLFxyXG5cdFx0V2luZG93RmlsZURyYWdnaW5nRW50ZXJlZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nRW50ZXJlZFwiLFxyXG5cdFx0V2luZG93RmlsZURyYWdnaW5nRXhpdGVkOiBcIm1hYzpXaW5kb3dGaWxlRHJhZ2dpbmdFeGl0ZWRcIixcclxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ1BlcmZvcm1lZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nUGVyZm9ybWVkXCIsXHJcblx0XHRXaW5kb3dIaWRlOiBcIm1hYzpXaW5kb3dIaWRlXCIsXHJcblx0XHRXaW5kb3dNYXhpbWlzZTogXCJtYWM6V2luZG93TWF4aW1pc2VcIixcclxuXHRcdFdpbmRvd1VuTWF4aW1pc2U6IFwibWFjOldpbmRvd1VuTWF4aW1pc2VcIixcclxuXHRcdFdpbmRvd01pbmltaXNlOiBcIm1hYzpXaW5kb3dNaW5pbWlzZVwiLFxyXG5cdFx0V2luZG93VW5NaW5pbWlzZTogXCJtYWM6V2luZG93VW5NaW5pbWlzZVwiLFxyXG5cdFx0V2luZG93U2hvdWxkQ2xvc2U6IFwibWFjOldpbmRvd1Nob3VsZENsb3NlXCIsXHJcblx0XHRXaW5kb3dTaG93OiBcIm1hYzpXaW5kb3dTaG93XCIsXHJcblx0XHRXaW5kb3dXaWxsQmVjb21lS2V5OiBcIm1hYzpXaW5kb3dXaWxsQmVjb21lS2V5XCIsXHJcblx0XHRXaW5kb3dXaWxsQmVjb21lTWFpbjogXCJtYWM6V2luZG93V2lsbEJlY29tZU1haW5cIixcclxuXHRcdFdpbmRvd1dpbGxCZWdpblNoZWV0OiBcIm1hYzpXaW5kb3dXaWxsQmVnaW5TaGVldFwiLFxyXG5cdFx0V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZVwiLFxyXG5cdFx0V2luZG93V2lsbENsb3NlOiBcIm1hYzpXaW5kb3dXaWxsQ2xvc2VcIixcclxuXHRcdFdpbmRvd1dpbGxEZW1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dXaWxsRGVtaW5pYXR1cml6ZVwiLFxyXG5cdFx0V2luZG93V2lsbEVudGVyRnVsbFNjcmVlbjogXCJtYWM6V2luZG93V2lsbEVudGVyRnVsbFNjcmVlblwiLFxyXG5cdFx0V2luZG93V2lsbEVudGVyVmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd1dpbGxFbnRlclZlcnNpb25Ccm93c2VyXCIsXHJcblx0XHRXaW5kb3dXaWxsRXhpdEZ1bGxTY3JlZW46IFwibWFjOldpbmRvd1dpbGxFeGl0RnVsbFNjcmVlblwiLFxyXG5cdFx0V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlclwiLFxyXG5cdFx0V2luZG93V2lsbEZvY3VzOiBcIm1hYzpXaW5kb3dXaWxsRm9jdXNcIixcclxuXHRcdFdpbmRvd1dpbGxNaW5pYXR1cml6ZTogXCJtYWM6V2luZG93V2lsbE1pbmlhdHVyaXplXCIsXHJcblx0XHRXaW5kb3dXaWxsTW92ZTogXCJtYWM6V2luZG93V2lsbE1vdmVcIixcclxuXHRcdFdpbmRvd1dpbGxPcmRlck9mZlNjcmVlbjogXCJtYWM6V2luZG93V2lsbE9yZGVyT2ZmU2NyZWVuXCIsXHJcblx0XHRXaW5kb3dXaWxsT3JkZXJPblNjcmVlbjogXCJtYWM6V2luZG93V2lsbE9yZGVyT25TY3JlZW5cIixcclxuXHRcdFdpbmRvd1dpbGxSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dXaWxsUmVzaWduTWFpblwiLFxyXG5cdFx0V2luZG93V2lsbFJlc2l6ZTogXCJtYWM6V2luZG93V2lsbFJlc2l6ZVwiLFxyXG5cdFx0V2luZG93V2lsbFVuZm9jdXM6IFwibWFjOldpbmRvd1dpbGxVbmZvY3VzXCIsXHJcblx0XHRXaW5kb3dXaWxsVXBkYXRlOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlXCIsXHJcblx0XHRXaW5kb3dXaWxsVXBkYXRlQWxwaGE6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVBbHBoYVwiLFxyXG5cdFx0V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvclwiLFxyXG5cdFx0V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXNcIixcclxuXHRcdFdpbmRvd1dpbGxVcGRhdGVTaGFkb3c6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVTaGFkb3dcIixcclxuXHRcdFdpbmRvd1dpbGxVcGRhdGVUaXRsZTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVRpdGxlXCIsXHJcblx0XHRXaW5kb3dXaWxsVXBkYXRlVG9vbGJhcjogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVRvb2xiYXJcIixcclxuXHRcdFdpbmRvd1dpbGxVcGRhdGVWaXNpYmlsaXR5OiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlVmlzaWJpbGl0eVwiLFxyXG5cdFx0V2luZG93V2lsbFVzZVN0YW5kYXJkRnJhbWU6IFwibWFjOldpbmRvd1dpbGxVc2VTdGFuZGFyZEZyYW1lXCIsXHJcblx0XHRXaW5kb3dab29tSW46IFwibWFjOldpbmRvd1pvb21JblwiLFxyXG5cdFx0V2luZG93Wm9vbU91dDogXCJtYWM6V2luZG93Wm9vbU91dFwiLFxyXG5cdFx0V2luZG93Wm9vbVJlc2V0OiBcIm1hYzpXaW5kb3dab29tUmVzZXRcIixcclxuXHRcdFdlYlZpZXdXZWJDb250ZW50UHJvY2Vzc0RpZFRlcm1pbmF0ZTogXCJtYWM6V2ViVmlld1dlYkNvbnRlbnRQcm9jZXNzRGlkVGVybWluYXRlXCIsXHJcblx0fSksXHJcblx0TGludXg6IE9iamVjdC5mcmVlemUoe1xyXG5cdFx0QXBwbGljYXRpb25TdGFydHVwOiBcImxpbnV4OkFwcGxpY2F0aW9uU3RhcnR1cFwiLFxyXG5cdFx0U3lzdGVtRGlkV2FrZTogXCJsaW51eDpTeXN0ZW1EaWRXYWtlXCIsXHJcblx0XHRTeXN0ZW1UaGVtZUNoYW5nZWQ6IFwibGludXg6U3lzdGVtVGhlbWVDaGFuZ2VkXCIsXHJcblx0XHRTeXN0ZW1XaWxsU2xlZXA6IFwibGludXg6U3lzdGVtV2lsbFNsZWVwXCIsXHJcblx0XHRXaW5kb3dEZWxldGVFdmVudDogXCJsaW51eDpXaW5kb3dEZWxldGVFdmVudFwiLFxyXG5cdFx0V2luZG93RGlkTW92ZTogXCJsaW51eDpXaW5kb3dEaWRNb3ZlXCIsXHJcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwibGludXg6V2luZG93RGlkUmVzaXplXCIsXHJcblx0XHRXaW5kb3dGb2N1c0luOiBcImxpbnV4OldpbmRvd0ZvY3VzSW5cIixcclxuXHRcdFdpbmRvd0ZvY3VzT3V0OiBcImxpbnV4OldpbmRvd0ZvY3VzT3V0XCIsXHJcblx0XHRXaW5kb3dMb2FkU3RhcnRlZDogXCJsaW51eDpXaW5kb3dMb2FkU3RhcnRlZFwiLFxyXG5cdFx0V2luZG93TG9hZFJlZGlyZWN0ZWQ6IFwibGludXg6V2luZG93TG9hZFJlZGlyZWN0ZWRcIixcclxuXHRcdFdpbmRvd0xvYWRDb21taXR0ZWQ6IFwibGludXg6V2luZG93TG9hZENvbW1pdHRlZFwiLFxyXG5cdFx0V2luZG93TG9hZEZpbmlzaGVkOiBcImxpbnV4OldpbmRvd0xvYWRGaW5pc2hlZFwiLFxyXG5cdH0pLFxyXG5cdGlPUzogT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRBcHBsaWNhdGlvbkRpZEJlY29tZUFjdGl2ZTogXCJpb3M6QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmVcIixcclxuXHRcdEFwcGxpY2F0aW9uRGlkRW50ZXJCYWNrZ3JvdW5kOiBcImlvczpBcHBsaWNhdGlvbkRpZEVudGVyQmFja2dyb3VuZFwiLFxyXG5cdFx0QXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmc6IFwiaW9zOkFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZFJlY2VpdmVNZW1vcnlXYXJuaW5nOiBcImlvczpBcHBsaWNhdGlvbkRpZFJlY2VpdmVNZW1vcnlXYXJuaW5nXCIsXHJcblx0XHRBcHBsaWNhdGlvbldpbGxFbnRlckZvcmVncm91bmQ6IFwiaW9zOkFwcGxpY2F0aW9uV2lsbEVudGVyRm9yZWdyb3VuZFwiLFxyXG5cdFx0QXBwbGljYXRpb25XaWxsUmVzaWduQWN0aXZlOiBcImlvczpBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmVcIixcclxuXHRcdEFwcGxpY2F0aW9uV2lsbFRlcm1pbmF0ZTogXCJpb3M6QXBwbGljYXRpb25XaWxsVGVybWluYXRlXCIsXHJcblx0XHRXaW5kb3dEaWRMb2FkOiBcImlvczpXaW5kb3dEaWRMb2FkXCIsXHJcblx0XHRXaW5kb3dXaWxsQXBwZWFyOiBcImlvczpXaW5kb3dXaWxsQXBwZWFyXCIsXHJcblx0XHRXaW5kb3dEaWRBcHBlYXI6IFwiaW9zOldpbmRvd0RpZEFwcGVhclwiLFxyXG5cdFx0V2luZG93V2lsbERpc2FwcGVhcjogXCJpb3M6V2luZG93V2lsbERpc2FwcGVhclwiLFxyXG5cdFx0V2luZG93RGlkRGlzYXBwZWFyOiBcImlvczpXaW5kb3dEaWREaXNhcHBlYXJcIixcclxuXHRcdFdpbmRvd1NhZmVBcmVhSW5zZXRzQ2hhbmdlZDogXCJpb3M6V2luZG93U2FmZUFyZWFJbnNldHNDaGFuZ2VkXCIsXHJcblx0XHRXaW5kb3dPcmllbnRhdGlvbkNoYW5nZWQ6IFwiaW9zOldpbmRvd09yaWVudGF0aW9uQ2hhbmdlZFwiLFxyXG5cdFx0V2luZG93VG91Y2hCZWdhbjogXCJpb3M6V2luZG93VG91Y2hCZWdhblwiLFxyXG5cdFx0V2luZG93VG91Y2hNb3ZlZDogXCJpb3M6V2luZG93VG91Y2hNb3ZlZFwiLFxyXG5cdFx0V2luZG93VG91Y2hFbmRlZDogXCJpb3M6V2luZG93VG91Y2hFbmRlZFwiLFxyXG5cdFx0V2luZG93VG91Y2hDYW5jZWxsZWQ6IFwiaW9zOldpbmRvd1RvdWNoQ2FuY2VsbGVkXCIsXHJcblx0XHRXZWJWaWV3RGlkU3RhcnROYXZpZ2F0aW9uOiBcImlvczpXZWJWaWV3RGlkU3RhcnROYXZpZ2F0aW9uXCIsXHJcblx0XHRXZWJWaWV3RGlkRmluaXNoTmF2aWdhdGlvbjogXCJpb3M6V2ViVmlld0RpZEZpbmlzaE5hdmlnYXRpb25cIixcclxuXHRcdFdlYlZpZXdEaWRGYWlsTmF2aWdhdGlvbjogXCJpb3M6V2ViVmlld0RpZEZhaWxOYXZpZ2F0aW9uXCIsXHJcblx0XHRXZWJWaWV3RGVjaWRlUG9saWN5Rm9yTmF2aWdhdGlvbkFjdGlvbjogXCJpb3M6V2ViVmlld0RlY2lkZVBvbGljeUZvck5hdmlnYXRpb25BY3Rpb25cIixcclxuXHRcdEJhdHRlcnlDaGFuZ2VkOiBcImlvczpCYXR0ZXJ5Q2hhbmdlZFwiLFxyXG5cdFx0TmV0d29ya0NoYW5nZWQ6IFwiaW9zOk5ldHdvcmtDaGFuZ2VkXCIsXHJcblx0XHRUaGVtZUNoYW5nZWQ6IFwiaW9zOlRoZW1lQ2hhbmdlZFwiLFxyXG5cdFx0U2NyZWVuTG9ja2VkOiBcImlvczpTY3JlZW5Mb2NrZWRcIixcclxuXHRcdFNjcmVlblVubG9ja2VkOiBcImlvczpTY3JlZW5VbmxvY2tlZFwiLFxyXG5cdH0pLFxyXG5cdEFuZHJvaWQ6IE9iamVjdC5mcmVlemUoe1xyXG5cdFx0QWN0aXZpdHlDcmVhdGVkOiBcImFuZHJvaWQ6QWN0aXZpdHlDcmVhdGVkXCIsXHJcblx0XHRBY3Rpdml0eVN0YXJ0ZWQ6IFwiYW5kcm9pZDpBY3Rpdml0eVN0YXJ0ZWRcIixcclxuXHRcdEFjdGl2aXR5UmVzdW1lZDogXCJhbmRyb2lkOkFjdGl2aXR5UmVzdW1lZFwiLFxyXG5cdFx0QWN0aXZpdHlQYXVzZWQ6IFwiYW5kcm9pZDpBY3Rpdml0eVBhdXNlZFwiLFxyXG5cdFx0QWN0aXZpdHlTdG9wcGVkOiBcImFuZHJvaWQ6QWN0aXZpdHlTdG9wcGVkXCIsXHJcblx0XHRBY3Rpdml0eURlc3Ryb3llZDogXCJhbmRyb2lkOkFjdGl2aXR5RGVzdHJveWVkXCIsXHJcblx0XHRBcHBsaWNhdGlvbkxvd01lbW9yeTogXCJhbmRyb2lkOkFwcGxpY2F0aW9uTG93TWVtb3J5XCIsXHJcblx0XHRXZWJWaWV3UGFnZVN0YXJ0ZWQ6IFwiYW5kcm9pZDpXZWJWaWV3UGFnZVN0YXJ0ZWRcIixcclxuXHRcdFdlYlZpZXdQYWdlRmluaXNoZWQ6IFwiYW5kcm9pZDpXZWJWaWV3UGFnZUZpbmlzaGVkXCIsXHJcblx0XHRCYXR0ZXJ5Q2hhbmdlZDogXCJhbmRyb2lkOkJhdHRlcnlDaGFuZ2VkXCIsXHJcblx0XHROZXR3b3JrQ2hhbmdlZDogXCJhbmRyb2lkOk5ldHdvcmtDaGFuZ2VkXCIsXHJcblx0XHRUaGVtZUNoYW5nZWQ6IFwiYW5kcm9pZDpUaGVtZUNoYW5nZWRcIixcclxuXHRcdFNjcmVlbkxvY2tlZDogXCJhbmRyb2lkOlNjcmVlbkxvY2tlZFwiLFxyXG5cdFx0U2NyZWVuVW5sb2NrZWQ6IFwiYW5kcm9pZDpTY3JlZW5VbmxvY2tlZFwiLFxyXG5cdH0pLFxyXG5cdENvbW1vbjogT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRBcHBsaWNhdGlvbk9wZW5lZFdpdGhGaWxlOiBcImNvbW1vbjpBcHBsaWNhdGlvbk9wZW5lZFdpdGhGaWxlXCIsXHJcblx0XHRBcHBsaWNhdGlvblN0YXJ0ZWQ6IFwiY29tbW9uOkFwcGxpY2F0aW9uU3RhcnRlZFwiLFxyXG5cdFx0QXBwbGljYXRpb25MYXVuY2hlZFdpdGhVcmw6IFwiY29tbW9uOkFwcGxpY2F0aW9uTGF1bmNoZWRXaXRoVXJsXCIsXHJcblx0XHRUaGVtZUNoYW5nZWQ6IFwiY29tbW9uOlRoZW1lQ2hhbmdlZFwiLFxyXG5cdFx0U3lzdGVtRGlkV2FrZTogXCJjb21tb246U3lzdGVtRGlkV2FrZVwiLFxyXG5cdFx0U3lzdGVtV2lsbFNsZWVwOiBcImNvbW1vbjpTeXN0ZW1XaWxsU2xlZXBcIixcclxuXHRcdFdpbmRvd0Nsb3Npbmc6IFwiY29tbW9uOldpbmRvd0Nsb3NpbmdcIixcclxuXHRcdFdpbmRvd0RpZE1vdmU6IFwiY29tbW9uOldpbmRvd0RpZE1vdmVcIixcclxuXHRcdFdpbmRvd0RpZFJlc2l6ZTogXCJjb21tb246V2luZG93RGlkUmVzaXplXCIsXHJcblx0XHRXaW5kb3dEUElDaGFuZ2VkOiBcImNvbW1vbjpXaW5kb3dEUElDaGFuZ2VkXCIsXHJcblx0XHRXaW5kb3dGaWxlc0Ryb3BwZWQ6IFwiY29tbW9uOldpbmRvd0ZpbGVzRHJvcHBlZFwiLFxyXG5cdFx0V2luZG93Rm9jdXM6IFwiY29tbW9uOldpbmRvd0ZvY3VzXCIsXHJcblx0XHRXaW5kb3dGdWxsc2NyZWVuOiBcImNvbW1vbjpXaW5kb3dGdWxsc2NyZWVuXCIsXHJcblx0XHRXaW5kb3dIaWRlOiBcImNvbW1vbjpXaW5kb3dIaWRlXCIsXHJcblx0XHRXaW5kb3dMb3N0Rm9jdXM6IFwiY29tbW9uOldpbmRvd0xvc3RGb2N1c1wiLFxyXG5cdFx0V2luZG93TWF4aW1pc2U6IFwiY29tbW9uOldpbmRvd01heGltaXNlXCIsXHJcblx0XHRXaW5kb3dNaW5pbWlzZTogXCJjb21tb246V2luZG93TWluaW1pc2VcIixcclxuXHRcdFdpbmRvd1RvZ2dsZUZyYW1lbGVzczogXCJjb21tb246V2luZG93VG9nZ2xlRnJhbWVsZXNzXCIsXHJcblx0XHRXaW5kb3dSZXN0b3JlOiBcImNvbW1vbjpXaW5kb3dSZXN0b3JlXCIsXHJcblx0XHRXaW5kb3dSdW50aW1lUmVhZHk6IFwiY29tbW9uOldpbmRvd1J1bnRpbWVSZWFkeVwiLFxyXG5cdFx0V2luZG93U2hvdzogXCJjb21tb246V2luZG93U2hvd1wiLFxyXG5cdFx0V2luZG93VW5GdWxsc2NyZWVuOiBcImNvbW1vbjpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcclxuXHRcdFdpbmRvd1VuTWF4aW1pc2U6IFwiY29tbW9uOldpbmRvd1VuTWF4aW1pc2VcIixcclxuXHRcdFdpbmRvd1VuTWluaW1pc2U6IFwiY29tbW9uOldpbmRvd1VuTWluaW1pc2VcIixcclxuXHRcdFdpbmRvd1pvb206IFwiY29tbW9uOldpbmRvd1pvb21cIixcclxuXHRcdFdpbmRvd1pvb21JbjogXCJjb21tb246V2luZG93Wm9vbUluXCIsXHJcblx0XHRXaW5kb3dab29tT3V0OiBcImNvbW1vbjpXaW5kb3dab29tT3V0XCIsXHJcblx0XHRXaW5kb3dab29tUmVzZXQ6IFwiY29tbW9uOldpbmRvd1pvb21SZXNldFwiLFxyXG5cdFx0QmF0dGVyeUNoYW5nZWQ6IFwiY29tbW9uOkJhdHRlcnlDaGFuZ2VkXCIsXHJcblx0XHROZXR3b3JrQ2hhbmdlZDogXCJjb21tb246TmV0d29ya0NoYW5nZWRcIixcclxuXHRcdFNjcmVlbkxvY2tlZDogXCJjb21tb246U2NyZWVuTG9ja2VkXCIsXHJcblx0XHRTY3JlZW5VbmxvY2tlZDogXCJjb21tb246U2NyZWVuVW5sb2NrZWRcIixcclxuXHRcdExvd01lbW9yeTogXCJjb21tb246TG93TWVtb3J5XCIsXHJcblx0fSksXHJcbn0pO1xyXG4iLCIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuaW1wb3J0IHsgZXZlbnRMaXN0ZW5lcnMsIExpc3RlbmVyLCBsaXN0ZW5lck9mZiB9IGZyb20gXCIuL2xpc3RlbmVyLmpzXCI7XHJcbmltcG9ydCB7IEV2ZW50cyBhcyBDcmVhdGUgfSBmcm9tIFwiLi9jcmVhdGUuanNcIjtcclxuaW1wb3J0IHsgVHlwZXMgfSBmcm9tIFwiLi9ldmVudF90eXBlcy5qc1wiO1xyXG5cclxuLy8gU2V0dXBcclxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcclxuXHJcbmlmIChoYXNET00pIHtcclxuICAgIHdpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xyXG4gICAgd2luZG93Ll93YWlscy5kaXNwYXRjaFdhaWxzRXZlbnQgPSBkaXNwYXRjaFdhaWxzRXZlbnQ7XHJcbn1cclxuXHJcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLkV2ZW50cyk7XHJcbmNvbnN0IEVtaXRNZXRob2QgPSAwO1xyXG5cclxuZXhwb3J0ICogZnJvbSBcIi4vZXZlbnRfdHlwZXMuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHRhYmxlIG9mIGRhdGEgdHlwZXMgZm9yIGFsbCBrbm93biBldmVudHMuXHJcbiAqIFdpbGwgYmUgbW9ua2V5LXBhdGNoZWQgYnkgdGhlIGJpbmRpbmcgZ2VuZXJhdG9yLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDdXN0b21FdmVudHMge31cclxuXHJcbi8qKlxyXG4gKiBFaXRoZXIgYSBrbm93biBldmVudCBuYW1lIG9yIGFuIGFyYml0cmFyeSBzdHJpbmcuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBXYWlsc0V2ZW50TmFtZTxFIGV4dGVuZHMga2V5b2YgQ3VzdG9tRXZlbnRzID0ga2V5b2YgQ3VzdG9tRXZlbnRzPiA9IEUgfCAoc3RyaW5nICYge30pO1xyXG5cclxuLyoqXHJcbiAqIFVuaW9uIG9mIGFsbCBrbm93biBzeXN0ZW0gZXZlbnQgbmFtZXMuXHJcbiAqL1xyXG50eXBlIFN5c3RlbUV2ZW50TmFtZSA9IHtcclxuICAgIFtLIGluIGtleW9mICh0eXBlb2YgVHlwZXMpXTogKHR5cGVvZiBUeXBlcylbS11ba2V5b2YgKCh0eXBlb2YgVHlwZXMpW0tdKV1cclxufSBleHRlbmRzIChpbmZlciBNKSA/IE1ba2V5b2YgTV0gOiBuZXZlcjtcclxuXHJcbi8qKlxyXG4gKiBUaGUgZGF0YSB0eXBlIGFzc29jaWF0ZWQgdG8gYSBnaXZlbiBldmVudC5cclxuICovXHJcbmV4cG9ydCB0eXBlIFdhaWxzRXZlbnREYXRhPEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPiA9XHJcbiAgICBFIGV4dGVuZHMga2V5b2YgQ3VzdG9tRXZlbnRzID8gQ3VzdG9tRXZlbnRzW0VdIDogKEUgZXh0ZW5kcyBTeXN0ZW1FdmVudE5hbWUgPyB2b2lkIDogYW55KTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgdHlwZSBvZiBoYW5kbGVycyBmb3IgYSBnaXZlbiBldmVudC5cclxuICovXHJcbmV4cG9ydCB0eXBlIFdhaWxzRXZlbnRDYWxsYmFjazxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4gPSAoZXY6IFdhaWxzRXZlbnQ8RT4pID0+IHZvaWQ7XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHN5c3RlbSBldmVudCBvciBhIGN1c3RvbSBldmVudCBlbWl0dGVkIHRocm91Z2ggd2FpbHMtcHJvdmlkZWQgZmFjaWxpdGllcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBXYWlsc0V2ZW50PEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPiB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cclxuICAgICAqL1xyXG4gICAgbmFtZTogRTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wdGlvbmFsIGRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoZSBlbWl0dGVkIGV2ZW50LlxyXG4gICAgICovXHJcbiAgICBkYXRhOiBXYWlsc0V2ZW50RGF0YTxFPjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE5hbWUgb2YgdGhlIG9yaWdpbmF0aW5nIHdpbmRvdy4gT21pdHRlZCBmb3IgYXBwbGljYXRpb24gZXZlbnRzLlxyXG4gICAgICogV2lsbCBiZSBvdmVycmlkZGVuIGlmIHNldCBtYW51YWxseS5cclxuICAgICAqL1xyXG4gICAgc2VuZGVyPzogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IEUsIGRhdGE6IFdhaWxzRXZlbnREYXRhPEU+KTtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IFdhaWxzRXZlbnREYXRhPEU+IGV4dGVuZHMgbnVsbCB8IHZvaWQgPyBFIDogbmV2ZXIpXHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBFLCBkYXRhPzogYW55KSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhID8/IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc3BhdGNoV2FpbHNFdmVudChldmVudDogYW55KSB7XHJcbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50Lm5hbWUpO1xyXG4gICAgaWYgKCFsaXN0ZW5lcnMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHdhaWxzRXZlbnQgPSBuZXcgV2FpbHNFdmVudChcclxuICAgICAgICBldmVudC5uYW1lLFxyXG4gICAgICAgIChldmVudC5uYW1lIGluIENyZWF0ZSkgPyBDcmVhdGVbZXZlbnQubmFtZV0oZXZlbnQuZGF0YSkgOiBldmVudC5kYXRhXHJcbiAgICApO1xyXG4gICAgaWYgKCdzZW5kZXInIGluIGV2ZW50KSB7XHJcbiAgICAgICAgd2FpbHNFdmVudC5zZW5kZXIgPSBldmVudC5zZW5kZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGlzcGF0Y2ggdG8gYSBzbmFwc2hvdCwgdGhlbiByZW1vdmUgYWxsIGV4cGlyZWQgbGlzdGVuZXJzIGluIGEgc2luZ2xlXHJcbiAgICAvLyBwb3N0LWRpc3BhdGNoIGZpbHRlciBvZiB0aGUgbGl2ZSBtYXAuXHJcbiAgICAvLyAtIFdyaXRpbmcgdGhlIHNuYXBzaG90IGJhY2sgd2hvbGVzYWxlIHdvdWxkIHVuZG8gc3Vic2NyaXB0aW9uIGNoYW5nZXNcclxuICAgIC8vICAgbWFkZSBpbnNpZGUgYSBoYW5kbGVyICgjNDM5MykuXHJcbiAgICAvLyAtIENhbGxpbmcgbGlzdGVuZXJPZmYoKSBwZXIgZXhwaXJlZCBsaXN0ZW5lciBpbnNpZGUgdGhlIGxvb3AgaXMgTyhuwrIpXHJcbiAgICAvLyAgIHdoZW4gbWFueSBsaXN0ZW5lcnMgZXhwaXJlIG9uIHRoZSBzYW1lIGV2ZW50LlxyXG4gICAgLy8gRmlsdGVyaW5nIHRoZSBsaXZlIGFycmF5IG9uY2UgYWZ0ZXIgZGlzcGF0Y2ggaXMgTyhuKSBhbmQgc3RpbGwgaG9ub3Vyc1xyXG4gICAgLy8gYW55IGxpc3RlbmVycyBhZGRlZCBvciByZW1vdmVkIGJ5IGhhbmRsZXJzIGR1cmluZyBkaXNwYXRjaC5cclxuICAgIGNvbnN0IGV4cGlyZWQgPSBuZXcgU2V0PExpc3RlbmVyPigpO1xyXG4gICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMuc2xpY2UoKSkge1xyXG4gICAgICAgIGlmIChsaXN0ZW5lci5kaXNwYXRjaCh3YWlsc0V2ZW50KSkge1xyXG4gICAgICAgICAgICBleHBpcmVkLmFkZChsaXN0ZW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGV4cGlyZWQuc2l6ZSA+IDApIHtcclxuICAgICAgICBjb25zdCBsaXZlID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50Lm5hbWUpO1xyXG4gICAgICAgIGlmIChsaXZlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IGxpdmUuZmlsdGVyKGwgPT4gIWV4cGlyZWQuaGFzKGwpKTtcclxuICAgICAgICAgICAgaWYgKHJlbWFpbmluZy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJzLmRlbGV0ZShldmVudC5uYW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJzLnNldChldmVudC5uYW1lLCByZW1haW5pbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmVnaXN0ZXIgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZm9yIGEgc3BlY2lmaWMgZXZlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZvci5cclxuICogQHBhcmFtIGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuXHJcbiAqIEBwYXJhbSBtYXhDYWxsYmFja3MgLSBUaGUgbWF4aW11bSBudW1iZXIgb2YgdGltZXMgdGhlIGNhbGxiYWNrIGNhbiBiZSBjYWxsZWQgZm9yIHRoZSBldmVudC4gT25jZSB0aGUgbWF4aW11bSBudW1iZXIgaXMgcmVhY2hlZCwgdGhlIGNhbGxiYWNrIHdpbGwgbm8gbG9uZ2VyIGJlIGNhbGxlZC5cclxuICogQHJldHVybnMgQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBPbk11bHRpcGxlPEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPihldmVudE5hbWU6IEUsIGNhbGxiYWNrOiBXYWlsc0V2ZW50Q2FsbGJhY2s8RT4sIG1heENhbGxiYWNrczogbnVtYmVyKSB7XHJcbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50TmFtZSkgfHwgW107XHJcbiAgICBjb25zdCB0aGlzTGlzdGVuZXIgPSBuZXcgTGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaywgbWF4Q2FsbGJhY2tzKTtcclxuICAgIGxpc3RlbmVycy5wdXNoKHRoaXNMaXN0ZW5lcik7XHJcbiAgICBldmVudExpc3RlbmVycy5zZXQoZXZlbnROYW1lLCBsaXN0ZW5lcnMpO1xyXG4gICAgcmV0dXJuICgpID0+IGxpc3RlbmVyT2ZmKHRoaXNMaXN0ZW5lcik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZWdpc3RlcnMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBzcGVjaWZpZWQgZXZlbnQgb2NjdXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmb3IuXHJcbiAqIEBwYXJhbSBjYWxsYmFjayAtIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlxyXG4gKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIE9uPEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPihldmVudE5hbWU6IEUsIGNhbGxiYWNrOiBXYWlsc0V2ZW50Q2FsbGJhY2s8RT4pOiAoKSA9PiB2b2lkIHtcclxuICAgIHJldHVybiBPbk11bHRpcGxlKGV2ZW50TmFtZSwgY2FsbGJhY2ssIC0xKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIG9ubHkgb25jZSBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cclxuICpcclxuICogQHBhcmFtIGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byByZWdpc3RlciB0aGUgY2FsbGJhY2sgZm9yLlxyXG4gKiBAcGFyYW0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5cclxuICogQHJldHVybnMgQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBPbmNlPEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPihldmVudE5hbWU6IEUsIGNhbGxiYWNrOiBXYWlsc0V2ZW50Q2FsbGJhY2s8RT4pOiAoKSA9PiB2b2lkIHtcclxuICAgIHJldHVybiBPbk11bHRpcGxlKGV2ZW50TmFtZSwgY2FsbGJhY2ssIDEpO1xyXG59XHJcblxyXG4vKipcclxuICogUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgbmFtZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSBldmVudE5hbWVzIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50cyB0byByZW1vdmUgbGlzdGVuZXJzIGZvci5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBPZmYoLi4uZXZlbnROYW1lczogW1dhaWxzRXZlbnROYW1lLCAuLi5XYWlsc0V2ZW50TmFtZVtdXSk6IHZvaWQge1xyXG4gICAgZXZlbnROYW1lcy5mb3JFYWNoKGV2ZW50TmFtZSA9PiBldmVudExpc3RlbmVycy5kZWxldGUoZXZlbnROYW1lKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gT2ZmQWxsKCk6IHZvaWQge1xyXG4gICAgZXZlbnRMaXN0ZW5lcnMuY2xlYXIoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEVtaXRzIGFuIGV2ZW50LlxyXG4gKlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCB3aWxsIGJlIGZ1bGZpbGxlZCBvbmNlIHRoZSBldmVudCBoYXMgYmVlbiBlbWl0dGVkLiAgUmVzb2x2ZXMgdG8gdHJ1ZSBpZiB0aGUgZXZlbnQgd2FzIGNhbmNlbGxlZC5cclxuICogQHBhcmFtIG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gZW1pdFxyXG4gKiBAcGFyYW0gZGF0YSAtIFRoZSBkYXRhIHRoYXQgd2lsbCBiZSBzZW50IHdpdGggdGhlIGV2ZW50XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gRW1pdDxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4obmFtZTogRSwgZGF0YTogV2FpbHNFdmVudERhdGE8RT4pOiBQcm9taXNlPGJvb2xlYW4+XHJcbmV4cG9ydCBmdW5jdGlvbiBFbWl0PEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPihuYW1lOiBXYWlsc0V2ZW50RGF0YTxFPiBleHRlbmRzIG51bGwgfCB2b2lkID8gRSA6IG5ldmVyKTogUHJvbWlzZTxib29sZWFuPlxyXG5leHBvcnQgZnVuY3Rpb24gRW1pdDxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4obmFtZTogV2FpbHNFdmVudERhdGE8RT4sIGRhdGE/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiBjYWxsKEVtaXRNZXRob2QsICBuZXcgV2FpbHNFdmVudChuYW1lLCBkYXRhKSlcclxufVxyXG5cclxuIiwiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTaXplIHtcclxuICAgIC8qKiBUaGUgd2lkdGggb2YgYSByZWN0YW5ndWxhciBhcmVhLiAqL1xyXG4gICAgV2lkdGg6IG51bWJlcjtcclxuICAgIC8qKiBUaGUgaGVpZ2h0IG9mIGEgcmVjdGFuZ3VsYXIgYXJlYS4gKi9cclxuICAgIEhlaWdodDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlY3Qge1xyXG4gICAgLyoqIFRoZSBYIGNvb3JkaW5hdGUgb2YgdGhlIG9yaWdpbi4gKi9cclxuICAgIFg6IG51bWJlcjtcclxuICAgIC8qKiBUaGUgWSBjb29yZGluYXRlIG9mIHRoZSBvcmlnaW4uICovXHJcbiAgICBZOiBudW1iZXI7XHJcbiAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSByZWN0YW5nbGUuICovXHJcbiAgICBXaWR0aDogbnVtYmVyO1xyXG4gICAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIHJlY3RhbmdsZS4gKi9cclxuICAgIEhlaWdodDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNjcmVlbiB7XHJcbiAgICAvKiogVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBzY3JlZW4uICovXHJcbiAgICBJRDogc3RyaW5nO1xyXG4gICAgLyoqIEh1bWFuLXJlYWRhYmxlIG5hbWUgb2YgdGhlIHNjcmVlbi4gKi9cclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIC8qKiBUaGUgc2NhbGUgZmFjdG9yIG9mIHRoZSBzY3JlZW4gKERQSS85NikuIDEgPSBzdGFuZGFyZCBEUEksIDIgPSBIaURQSSAoUmV0aW5hKSwgZXRjLiAqL1xyXG4gICAgU2NhbGVGYWN0b3I6IG51bWJlcjtcclxuICAgIC8qKiBUaGUgWCBjb29yZGluYXRlIG9mIHRoZSBzY3JlZW4uICovXHJcbiAgICBYOiBudW1iZXI7XHJcbiAgICAvKiogVGhlIFkgY29vcmRpbmF0ZSBvZiB0aGUgc2NyZWVuLiAqL1xyXG4gICAgWTogbnVtYmVyO1xyXG4gICAgLyoqIENvbnRhaW5zIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBzY3JlZW4uICovXHJcbiAgICBTaXplOiBTaXplO1xyXG4gICAgLyoqIENvbnRhaW5zIHRoZSBib3VuZHMgb2YgdGhlIHNjcmVlbiBpbiB0ZXJtcyBvZiBYLCBZLCBXaWR0aCwgYW5kIEhlaWdodC4gKi9cclxuICAgIEJvdW5kczogUmVjdDtcclxuICAgIC8qKiBDb250YWlucyB0aGUgcGh5c2ljYWwgYm91bmRzIG9mIHRoZSBzY3JlZW4gaW4gdGVybXMgb2YgWCwgWSwgV2lkdGgsIGFuZCBIZWlnaHQgKGJlZm9yZSBzY2FsaW5nKS4gKi9cclxuICAgIFBoeXNpY2FsQm91bmRzOiBSZWN0O1xyXG4gICAgLyoqIENvbnRhaW5zIHRoZSBhcmVhIG9mIHRoZSBzY3JlZW4gdGhhdCBpcyBhY3R1YWxseSB1c2FibGUgKGV4Y2x1ZGluZyB0YXNrYmFyIGFuZCBvdGhlciBzeXN0ZW0gVUkpLiAqL1xyXG4gICAgV29ya0FyZWE6IFJlY3Q7XHJcbiAgICAvKiogQ29udGFpbnMgdGhlIHBoeXNpY2FsIFdvcmtBcmVhIG9mIHRoZSBzY3JlZW4gKGJlZm9yZSBzY2FsaW5nKS4gKi9cclxuICAgIFBoeXNpY2FsV29ya0FyZWE6IFJlY3Q7XHJcbiAgICAvKiogVHJ1ZSBpZiB0aGlzIGlzIHRoZSBwcmltYXJ5IG1vbml0b3Igc2VsZWN0ZWQgYnkgdGhlIHVzZXIgaW4gdGhlIG9wZXJhdGluZyBzeXN0ZW0uICovXHJcbiAgICBJc1ByaW1hcnk6IGJvb2xlYW47XHJcbiAgICAvKiogVGhlIHJvdGF0aW9uIG9mIHRoZSBzY3JlZW4uICovXHJcbiAgICBSb3RhdGlvbjogbnVtYmVyO1xyXG59XHJcblxyXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuU2NyZWVucyk7XHJcblxyXG5jb25zdCBnZXRBbGwgPSAwO1xyXG5jb25zdCBnZXRQcmltYXJ5ID0gMTtcclxuY29uc3QgZ2V0Q3VycmVudCA9IDI7XHJcbmNvbnN0IGdldEJ5SUQgPSAzO1xyXG5jb25zdCBnZXRCeUluZGV4ID0gNDtcclxuXHJcbi8qKlxyXG4gKiBHZXRzIGFsbCBzY3JlZW5zLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBhcnJheSBvZiBTY3JlZW4gb2JqZWN0cy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBHZXRBbGwoKTogUHJvbWlzZTxTY3JlZW5bXT4ge1xyXG4gICAgcmV0dXJuIGNhbGwoZ2V0QWxsKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIHByaW1hcnkgc2NyZWVuLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgcHJpbWFyeSBzY3JlZW4uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gR2V0UHJpbWFyeSgpOiBQcm9taXNlPFNjcmVlbj4ge1xyXG4gICAgcmV0dXJuIGNhbGwoZ2V0UHJpbWFyeSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRoZSBjdXJyZW50IGFjdGl2ZSBzY3JlZW4uXHJcbiAqXHJcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGN1cnJlbnQgYWN0aXZlIHNjcmVlbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBHZXRDdXJyZW50KCk6IFByb21pc2U8U2NyZWVuPiB7XHJcbiAgICByZXR1cm4gY2FsbChnZXRDdXJyZW50KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgYSBzY3JlZW4gYnkgaXRzIHVuaXF1ZSBkaXNwbGF5IElELlxyXG4gKlxyXG4gKiBAcGFyYW0gaWQgLSBUaGUgdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIHNjcmVlbi5cclxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIG1hdGNoaW5nIFNjcmVlbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBHZXRCeUlEKGlkOiBzdHJpbmcpOiBQcm9taXNlPFNjcmVlbj4ge1xyXG4gICAgcmV0dXJuIGNhbGwoZ2V0QnlJRCwgeyBpZCB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgYSBzY3JlZW4gYnkgaXRzIGluZGV4IGluIHRoZSBzY3JlZW4gbGlzdC5cclxuICpcclxuICogQHBhcmFtIGluZGV4IC0gVGhlIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIHNjcmVlbi5cclxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIG1hdGNoaW5nIFNjcmVlbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBHZXRCeUluZGV4KGluZGV4OiBudW1iZXIpOiBQcm9taXNlPFNjcmVlbj4ge1xyXG4gICAgcmV0dXJuIGNhbGwoZ2V0QnlJbmRleCwgeyBpbmRleCB9KTtcclxufVxyXG4iLCIvKlxyXG4gXyAgICAgX18gICAgIF8gX19cclxufCB8ICAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuXHJcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLklPUyk7XHJcblxyXG4vLyBNZXRob2QgSURzXHJcbmNvbnN0IEhhcHRpY3NJbXBhY3QgPSAwO1xyXG5jb25zdCBEZXZpY2VJbmZvID0gMTtcclxuXHJcbmV4cG9ydCBuYW1lc3BhY2UgSGFwdGljcyB7XHJcbiAgICBleHBvcnQgdHlwZSBJbXBhY3RTdHlsZSA9IFwibGlnaHRcInxcIm1lZGl1bVwifFwiaGVhdnlcInxcInNvZnRcInxcInJpZ2lkXCI7XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gSW1wYWN0KHN0eWxlOiBJbXBhY3RTdHlsZSA9IFwibWVkaXVtXCIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gY2FsbChIYXB0aWNzSW1wYWN0LCB7IHN0eWxlIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgbmFtZXNwYWNlIERldmljZSB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIEluZm8ge1xyXG4gICAgICAgIG1vZGVsOiBzdHJpbmc7XHJcbiAgICAgICAgc3lzdGVtTmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHN5c3RlbVZlcnNpb246IHN0cmluZztcclxuICAgICAgICBpc1NpbXVsYXRvcjogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBJbmZvKCk6IFByb21pc2U8SW5mbz4ge1xyXG4gICAgICAgIHJldHVybiBjYWxsKERldmljZUluZm8pO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiBfICAgICBfXyAgICAgXyBfX1xyXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xyXG5cclxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQW5kcm9pZCk7XHJcblxyXG4vLyBNZXRob2QgSURzIChtdXN0IG1hdGNoIG1lc3NhZ2Vwcm9jZXNzb3JfYW5kcm9pZC5nbylcclxuY29uc3QgSGFwdGljc1ZpYnJhdGUgPSAwO1xyXG5jb25zdCBEZXZpY2VJbmZvID0gMTtcclxuY29uc3QgVG9hc3RTaG93ID0gMjtcclxuXHJcbmV4cG9ydCBuYW1lc3BhY2UgSGFwdGljcyB7XHJcbiAgICAvKiogVmlicmF0ZSB0aGUgZGV2aWNlIGZvciB0aGUgZ2l2ZW4gZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzLiAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIFZpYnJhdGUoZHVyYXRpb25NczogbnVtYmVyID0gMTAwKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIGNhbGwoSGFwdGljc1ZpYnJhdGUsIHsgZHVyYXRpb246IGR1cmF0aW9uTXMgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBuYW1lc3BhY2UgRGV2aWNlIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSW5mbyB7XHJcbiAgICAgICAgcGxhdGZvcm06IHN0cmluZztcclxuICAgICAgICBtYW51ZmFjdHVyZXI6IHN0cmluZztcclxuICAgICAgICBicmFuZDogc3RyaW5nO1xyXG4gICAgICAgIG1vZGVsOiBzdHJpbmc7XHJcbiAgICAgICAgZGV2aWNlOiBzdHJpbmc7XHJcbiAgICAgICAgdmVyc2lvbjogc3RyaW5nO1xyXG4gICAgICAgIHNka0ludDogbnVtYmVyO1xyXG4gICAgfVxyXG4gICAgLyoqIFJldHVybiBpbmZvcm1hdGlvbiBhYm91dCB0aGUgQW5kcm9pZCBkZXZpY2UuICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gSW5mbygpOiBQcm9taXNlPEluZm8+IHtcclxuICAgICAgICByZXR1cm4gY2FsbChEZXZpY2VJbmZvKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IG5hbWVzcGFjZSBUb2FzdCB7XHJcbiAgICAvKiogU2hvdyBhIHNob3J0IEFuZHJvaWQgdG9hc3QgbWVzc2FnZS4gKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBTaG93KG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiBjYWxsKFRvYXN0U2hvdywgeyBtZXNzYWdlIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGVyIGV2ZW50IG5hbWUgY29uc3RhbnRzLlxyXG4gKlxyXG4gKiBVc2UgdGhlc2UgaW5zdGVhZCBvZiBoYXJkLWNvZGluZyBzdHJpbmcgbGl0ZXJhbHMgd2hlbiBzdWJzY3JpYmluZyB0b1xyXG4gKiB1cGRhdGVyIGV2ZW50cyBmcm9tIEphdmFTY3JpcHQ6XHJcbiAqXHJcbiAqICAgICBpbXBvcnQgeyBFdmVudHMsIFVwZGF0ZXIgfSBmcm9tIFwiQHdhaWxzaW8vcnVudGltZVwiO1xyXG4gKlxyXG4gKiAgICAgRXZlbnRzLk9uKFVwZGF0ZXIuRXZlbnRzLlVwZGF0ZUF2YWlsYWJsZSwgKGUpID0+IHtcclxuICogICAgICAgICBjb25zb2xlLmxvZyhcInVwZGF0ZSBmb3VuZDpcIiwgZS5kYXRhLnZlcnNpb24pO1xyXG4gKiAgICAgfSk7XHJcbiAqXHJcbiAqICAgICBFdmVudHMuT24oVXBkYXRlci5FdmVudHMuRG93bmxvYWRQcm9ncmVzcywgKGUpID0+IHtcclxuICogICAgICAgICBjb25zdCBwID0gZS5kYXRhO1xyXG4gKiAgICAgICAgIGNvbnNvbGUubG9nKGAke3Aud3JpdHRlbn0gLyAke3AudG90YWx9IGJ5dGVzYCk7XHJcbiAqICAgICB9KTtcclxuICpcclxuICogTWlycm9ycyB0aGUgR28tc2lkZSBjb25zdGFudHMgaW4gYHBrZy91cGRhdGVyL2V2ZW50cy5nb2AgYW5kIHRoZVxyXG4gKiB1c2VyLWFjdGlvbiBjb25zdGFudHMgaW4gYHBrZy91cGRhdGVyL3dpbmRvd19saWZlY3ljbGUuZ29gLiBBbnlcclxuICogY2hhbmdlcyBoZXJlIG11c3Qgc3RheSBpbiBzeW5jIHdpdGggdGhvc2UgZmlsZXMg4oCUIHRoZXJlJ3MgYW5cclxuICogaW50ZWdyYXRpb24gdGVzdCB0aGF0IGFzc2VydHMgdGhlIHN0cmluZ3MgbWF0Y2guXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgRXZlbnRzID0gT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICAvKiogQSBDaGVjayByb3VuZC10cmlwIGlzIHN0YXJ0aW5nLiBQYXlsb2FkOiBudWxsLiAqL1xyXG4gICAgQ2hlY2tTdGFydGVkOiBcIndhaWxzOnVwZGF0ZXI6Y2hlY2stc3RhcnRlZFwiLFxyXG4gICAgLyoqIENoZWNrIGZvdW5kIGEgbmV3ZXIgcmVsZWFzZS4gUGF5bG9hZDogUmVsZWFzZS4gKi9cclxuICAgIFVwZGF0ZUF2YWlsYWJsZTogXCJ3YWlsczp1cGRhdGVyOnVwZGF0ZS1hdmFpbGFibGVcIixcclxuICAgIC8qKiBDaGVjayBjb25maXJtZWQgdGhlIGNhbGxlciBpcyB1cCB0byBkYXRlLiBQYXlsb2FkOiBudWxsLiAqL1xyXG4gICAgTm9VcGRhdGU6IFwid2FpbHM6dXBkYXRlcjpuby11cGRhdGVcIixcclxuICAgIC8qKiBEb3dubG9hZCBpcyBzdGFydGluZy4gUGF5bG9hZDogUmVsZWFzZS4gKi9cclxuICAgIERvd25sb2FkU3RhcnRlZDogXCJ3YWlsczp1cGRhdGVyOmRvd25sb2FkLXN0YXJ0ZWRcIixcclxuICAgIC8qKiBQZXJpb2RpYyBwcm9ncmVzcyB0aWNrIGR1cmluZyBkb3dubG9hZCAofjEwIEh6KS4gUGF5bG9hZDogUHJvZ3Jlc3MuICovXHJcbiAgICBEb3dubG9hZFByb2dyZXNzOiBcIndhaWxzOnVwZGF0ZXI6ZG93bmxvYWQtcHJvZ3Jlc3NcIixcclxuICAgIC8qKiBBbGwgYnl0ZXMgYXJlIG9uIGRpc2ssIGJ1dCB2ZXJpZmljYXRpb24gaGFzIG5vdCB5ZXQgc3RhcnRlZC4gUGF5bG9hZDogUmVsZWFzZS4gKi9cclxuICAgIERvd25sb2FkQ29tcGxldGU6IFwid2FpbHM6dXBkYXRlcjpkb3dubG9hZC1jb21wbGV0ZVwiLFxyXG4gICAgLyoqIFNpZ25hdHVyZSAvIGRpZ2VzdCB2ZXJpZmljYXRpb24gaGFzIHN0YXJ0ZWQuIFBheWxvYWQ6IFJlbGVhc2UuICovXHJcbiAgICBWZXJpZnlpbmc6IFwid2FpbHM6dXBkYXRlcjp2ZXJpZnlpbmdcIixcclxuICAgIC8qKiBUaGUgVXBkYXRlciBpcyBzd2FwcGluZyB0aGUgYmluYXJ5IGludG8gcGxhY2UuIFBheWxvYWQ6IFJlbGVhc2UuICovXHJcbiAgICBJbnN0YWxsaW5nOiBcIndhaWxzOnVwZGF0ZXI6aW5zdGFsbGluZ1wiLFxyXG4gICAgLyoqIFVwZGF0ZSBpcyBzdGFnZWQgYW5kIGEgcmVzdGFydCBpcyBwZW5kaW5nLiBQYXlsb2FkOiBSZWxlYXNlLiAqL1xyXG4gICAgVXBkYXRlUmVhZHk6IFwid2FpbHM6dXBkYXRlcjp1cGRhdGUtcmVhZHlcIixcclxuICAgIC8qKiBTb21ldGhpbmcgZmFpbGVkLiBQYXlsb2FkOiBFcnJvckluZm8geyBzdGFnZSwgbWVzc2FnZSwgcHJvdmlkZXIgfS4gKi9cclxuICAgIEVycm9yOiBcIndhaWxzOnVwZGF0ZXI6ZXJyb3JcIixcclxuICAgIC8qKiBIb3N0LXNpZGUgY29udGV4dCBkZWxpdmVyZWQgb25jZSBwZXIgc2Vzc2lvbi4gUGF5bG9hZDogTWV0YSB7IGN1cnJlbnRWZXJzaW9uLCBza2lwcGVkVmVyc2lvbiB9LiAqL1xyXG4gICAgTWV0YTogXCJ3YWlsczp1cGRhdGVyOm1ldGFcIixcclxuXHJcbiAgICAvKiogU3ViLW5hbWVzcGFjZTogdXNlci1hY3Rpb24gZXZlbnRzIHRoYXQgdGhlIFVJIGVtaXRzIEJBQ0sgdG8gdGhlIGhvc3QuICovXHJcbiAgICBVc2VyOiBPYmplY3QuZnJlZXplKHtcclxuICAgICAgICAvKiogVXNlciBjbGlja2VkIEluc3RhbGwgb24gYW4gQXZhaWxhYmxlIHVwZGF0ZS4gKi9cclxuICAgICAgICBJbnN0YWxsOiBcIndhaWxzOnVwZGF0ZXI6dXNlcjppbnN0YWxsXCIsXHJcbiAgICAgICAgLyoqIFVzZXIgY2xpY2tlZCBSZXN0YXJ0ICYgQXBwbHkgb24gYSBSZWFkeSB1cGRhdGUuICovXHJcbiAgICAgICAgUmVzdGFydDogXCJ3YWlsczp1cGRhdGVyOnVzZXI6cmVzdGFydFwiLFxyXG4gICAgICAgIC8qKiBVc2VyIGNsaWNrZWQgU2tpcCBUaGlzIFZlcnNpb24uICovXHJcbiAgICAgICAgU2tpcDogXCJ3YWlsczp1cGRhdGVyOnVzZXI6c2tpcFwiLFxyXG4gICAgICAgIC8qKiBVc2VyIGNsaWNrZWQgUmVtaW5kIE1lIExhdGVyLiAqL1xyXG4gICAgICAgIFJlbWluZDogXCJ3YWlsczp1cGRhdGVyOnVzZXI6cmVtaW5kXCIsXHJcbiAgICAgICAgLyoqIFVzZXIgY2xpY2tlZCBDbG9zZSAvIENhbmNlbC4gKi9cclxuICAgICAgICBDYW5jZWw6IFwid2FpbHM6dXBkYXRlcjp1c2VyOmNhbmNlbFwiLFxyXG4gICAgfSksXHJcblxyXG4gICAgLyoqIFN1Yi1uYW1lc3BhY2U6IGZyYW1ld29yay1pbnRlcm5hbCBldmVudHMgdGhlIFVJIGVtaXRzIHRvIGNvb3JkaW5hdGVcclxuICAgICAqICB3aXRoIHRoZSBob3N0LiBNb3N0IGFwcCBjb2RlIGNhbiBpZ25vcmUgdGhlc2UuICovXHJcbiAgICBXaW5kb3c6IE9iamVjdC5mcmVlemUoe1xyXG4gICAgICAgIC8qKiBUaGUgd2luZG93IGZpbmlzaGVkIGxvYWRpbmcgYW5kIGFza3MgdGhlIGhvc3QgdG8gcmVwbGF5IGN1cnJlbnQgc3RhdGUuICovXHJcbiAgICAgICAgUmVhZHk6IFwid2FpbHM6dXBkYXRlcjp3aW5kb3c6cmVhZHlcIixcclxuICAgIH0pLFxyXG59KTtcclxuIiwiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuaW1wb3J0IHtuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lc30gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xyXG5pbXBvcnQgdHlwZSB7IFNjcmVlbiB9IGZyb20gXCIuL3NjcmVlbnMuanNcIjtcclxuXHJcbi8vIERyb3AgdGFyZ2V0IGNvbnN0YW50c1xyXG5jb25zdCBEUk9QX1RBUkdFVF9BVFRSSUJVVEUgPSAnZGF0YS1maWxlLWRyb3AtdGFyZ2V0JztcclxuY29uc3QgRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTID0gJ2ZpbGUtZHJvcC10YXJnZXQtYWN0aXZlJztcclxubGV0IGN1cnJlbnREcm9wVGFyZ2V0OiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG5jb25zdCBQb3NpdGlvbk1ldGhvZCAgICAgICAgICAgICAgICAgICAgPSAwO1xyXG5jb25zdCBDZW50ZXJNZXRob2QgICAgICAgICAgICAgICAgICAgICAgPSAxO1xyXG5jb25zdCBDbG9zZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgPSAyO1xyXG5jb25zdCBEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzTWV0aG9kICAgICAgPSAzO1xyXG5jb25zdCBFbmFibGVTaXplQ29uc3RyYWludHNNZXRob2QgICAgICAgPSA0O1xyXG5jb25zdCBGb2N1c01ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgPSA1O1xyXG5jb25zdCBGb3JjZVJlbG9hZE1ldGhvZCAgICAgICAgICAgICAgICAgPSA2O1xyXG5jb25zdCBGdWxsc2NyZWVuTWV0aG9kICAgICAgICAgICAgICAgICAgPSA3O1xyXG5jb25zdCBHZXRTY3JlZW5NZXRob2QgICAgICAgICAgICAgICAgICAgPSA4O1xyXG5jb25zdCBHZXRab29tTWV0aG9kICAgICAgICAgICAgICAgICAgICAgPSA5O1xyXG5jb25zdCBIZWlnaHRNZXRob2QgICAgICAgICAgICAgICAgICAgICAgPSAxMDtcclxuY29uc3QgSGlkZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgID0gMTE7XHJcbmNvbnN0IElzRm9jdXNlZE1ldGhvZCAgICAgICAgICAgICAgICAgICA9IDEyO1xyXG5jb25zdCBJc0Z1bGxzY3JlZW5NZXRob2QgICAgICAgICAgICAgICAgPSAxMztcclxuY29uc3QgSXNNYXhpbWlzZWRNZXRob2QgICAgICAgICAgICAgICAgID0gMTQ7XHJcbmNvbnN0IElzTWluaW1pc2VkTWV0aG9kICAgICAgICAgICAgICAgICA9IDE1O1xyXG5jb25zdCBNYXhpbWlzZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgPSAxNjtcclxuY29uc3QgTWluaW1pc2VNZXRob2QgICAgICAgICAgICAgICAgICAgID0gMTc7XHJcbmNvbnN0IE5hbWVNZXRob2QgICAgICAgICAgICAgICAgICAgICAgICA9IDE4O1xyXG5jb25zdCBPcGVuRGV2VG9vbHNNZXRob2QgICAgICAgICAgICAgICAgPSAxOTtcclxuY29uc3QgUmVsYXRpdmVQb3NpdGlvbk1ldGhvZCAgICAgICAgICAgID0gMjA7XHJcbmNvbnN0IFJlbG9hZE1ldGhvZCAgICAgICAgICAgICAgICAgICAgICA9IDIxO1xyXG5jb25zdCBSZXNpemFibGVNZXRob2QgICAgICAgICAgICAgICAgICAgPSAyMjtcclxuY29uc3QgUmVzdG9yZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgID0gMjM7XHJcbmNvbnN0IFNldFBvc2l0aW9uTWV0aG9kICAgICAgICAgICAgICAgICA9IDI0O1xyXG5jb25zdCBTZXRBbHdheXNPblRvcE1ldGhvZCAgICAgICAgICAgICAgPSAyNTtcclxuY29uc3QgU2V0QmFja2dyb3VuZENvbG91ck1ldGhvZCAgICAgICAgID0gMjY7XHJcbmNvbnN0IFNldEZyYW1lbGVzc01ldGhvZCAgICAgICAgICAgICAgICA9IDI3O1xyXG5jb25zdCBTZXRGdWxsc2NyZWVuQnV0dG9uRW5hYmxlZE1ldGhvZCAgPSAyODtcclxuY29uc3QgU2V0TWF4U2l6ZU1ldGhvZCAgICAgICAgICAgICAgICAgID0gMjk7XHJcbmNvbnN0IFNldE1pblNpemVNZXRob2QgICAgICAgICAgICAgICAgICA9IDMwO1xyXG5jb25zdCBTZXRSZWxhdGl2ZVBvc2l0aW9uTWV0aG9kICAgICAgICAgPSAzMTtcclxuY29uc3QgU2V0UmVzaXphYmxlTWV0aG9kICAgICAgICAgICAgICAgID0gMzI7XHJcbmNvbnN0IFNldFNpemVNZXRob2QgICAgICAgICAgICAgICAgICAgICA9IDMzO1xyXG5jb25zdCBTZXRUaXRsZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgPSAzNDtcclxuY29uc3QgU2V0Wm9vbU1ldGhvZCAgICAgICAgICAgICAgICAgICAgID0gMzU7XHJcbmNvbnN0IFNob3dNZXRob2QgICAgICAgICAgICAgICAgICAgICAgICA9IDM2O1xyXG5jb25zdCBTaXplTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICAgPSAzNztcclxuY29uc3QgVG9nZ2xlRnVsbHNjcmVlbk1ldGhvZCAgICAgICAgICAgID0gMzg7XHJcbmNvbnN0IFRvZ2dsZU1heGltaXNlTWV0aG9kICAgICAgICAgICAgICA9IDM5O1xyXG5jb25zdCBUb2dnbGVGcmFtZWxlc3NNZXRob2QgICAgICAgICAgICAgPSA0MDsgXHJcbmNvbnN0IFVuRnVsbHNjcmVlbk1ldGhvZCAgICAgICAgICAgICAgICA9IDQxO1xyXG5jb25zdCBVbk1heGltaXNlTWV0aG9kICAgICAgICAgICAgICAgICAgPSA0MjtcclxuY29uc3QgVW5NaW5pbWlzZU1ldGhvZCAgICAgICAgICAgICAgICAgID0gNDM7XHJcbmNvbnN0IFdpZHRoTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICA9IDQ0O1xyXG5jb25zdCBab29tTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICAgPSA0NTtcclxuY29uc3QgWm9vbUluTWV0aG9kICAgICAgICAgICAgICAgICAgICAgID0gNDY7XHJcbmNvbnN0IFpvb21PdXRNZXRob2QgICAgICAgICAgICAgICAgICAgICA9IDQ3O1xyXG5jb25zdCBab29tUmVzZXRNZXRob2QgICAgICAgICAgICAgICAgICAgPSA0ODtcclxuY29uc3QgU25hcEFzc2lzdE1ldGhvZCAgICAgICAgICAgICAgICAgID0gNDk7XHJcbmNvbnN0IEZpbGVzRHJvcHBlZCAgICAgICAgICAgICAgICAgICAgICA9IDUwO1xyXG5jb25zdCBQcmludE1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgPSA1MTtcclxuY29uc3QgU2V0U2NyZWVuTWV0aG9kICAgICAgICAgICAgICAgICAgID0gNTI7XHJcblxyXG4vKipcclxuICogRmluZHMgdGhlIG5lYXJlc3QgZHJvcCB0YXJnZXQgZWxlbWVudCBieSB3YWxraW5nIHVwIHRoZSBET00gdHJlZS5cclxuICovXHJcbmZ1bmN0aW9uIGdldERyb3BUYXJnZXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsKTogRWxlbWVudCB8IG51bGwge1xyXG4gICAgaWYgKCFlbGVtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZWxlbWVudC5jbG9zZXN0KGBbJHtEUk9QX1RBUkdFVF9BVFRSSUJVVEV9XWApO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2sgaWYgd2UgY2FuIHVzZSBXZWJWaWV3MidzIHBvc3RNZXNzYWdlV2l0aEFkZGl0aW9uYWxPYmplY3RzIChXaW5kb3dzKVxyXG4gKiBBbHNvIGNoZWNrcyB0aGF0IEVuYWJsZUZpbGVEcm9wIGlzIHRydWUgZm9yIHRoaXMgd2luZG93LlxyXG4gKi9cclxuZnVuY3Rpb24gY2FuUmVzb2x2ZUZpbGVQYXRocygpOiBib29sZWFuIHtcclxuICAgIC8vIE11c3QgaGF2ZSBXZWJWaWV3MidzIHBvc3RNZXNzYWdlV2l0aEFkZGl0aW9uYWxPYmplY3RzIEFQSSAoV2luZG93cyBvbmx5KVxyXG4gICAgaWYgKCh3aW5kb3cgYXMgYW55KS5jaHJvbWU/LndlYnZpZXc/LnBvc3RNZXNzYWdlV2l0aEFkZGl0aW9uYWxPYmplY3RzID09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvLyBNdXN0IGhhdmUgRW5hYmxlRmlsZURyb3Agc2V0IHRvIHRydWUgZm9yIHRoaXMgd2luZG93XHJcbiAgICAvLyBUaGlzIGZsYWcgaXMgc2V0IGJ5IHRoZSBHbyBiYWNrZW5kIGR1cmluZyBydW50aW1lIGluaXRpYWxpemF0aW9uXHJcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSB0cnVlO1xyXG59XHJcblxyXG4vKipcclxuICogU2VuZCBmaWxlIGRyb3AgdG8gYmFja2VuZCB2aWEgV2ViVmlldzIgKFdpbmRvd3Mgb25seSlcclxuICovXHJcbmZ1bmN0aW9uIHJlc29sdmVGaWxlUGF0aHMoeDogbnVtYmVyLCB5OiBudW1iZXIsIGZpbGVzOiBGaWxlW10pOiB2b2lkIHtcclxuICAgIGlmICgod2luZG93IGFzIGFueSkuY2hyb21lPy53ZWJ2aWV3Py5wb3N0TWVzc2FnZVdpdGhBZGRpdGlvbmFsT2JqZWN0cykge1xyXG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5jaHJvbWUud2Vidmlldy5wb3N0TWVzc2FnZVdpdGhBZGRpdGlvbmFsT2JqZWN0cyhgZmlsZTpkcm9wOiR7eH06JHt5fWAsIGZpbGVzKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gTmF0aXZlIGRyYWcgc3RhdGUgKExpbnV4L21hY09TIGludGVyY2VwdCBET00gZHJhZyBldmVudHMpXHJcbmxldCBuYXRpdmVEcmFnQWN0aXZlID0gZmFsc2U7XHJcblxyXG4vKipcclxuICogQ2xlYW5zIHVwIG5hdGl2ZSBkcmFnIHN0YXRlIGFuZCBob3ZlciBlZmZlY3RzLlxyXG4gKiBDYWxsZWQgb24gZHJvcCBvciB3aGVuIGRyYWcgbGVhdmVzIHRoZSB3aW5kb3cuXHJcbiAqL1xyXG5mdW5jdGlvbiBjbGVhbnVwTmF0aXZlRHJhZygpOiB2b2lkIHtcclxuICAgIG5hdGl2ZURyYWdBY3RpdmUgPSBmYWxzZTtcclxuICAgIGlmIChjdXJyZW50RHJvcFRhcmdldCkge1xyXG4gICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKTtcclxuICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxsZWQgZnJvbSBHbyB3aGVuIGEgZmlsZSBkcmFnIGVudGVycyB0aGUgd2luZG93IG9uIExpbnV4L21hY09TLlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlRHJhZ0VudGVyKCk6IHZvaWQge1xyXG4gICAgLy8gQ2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcclxuICAgIGlmICgod2luZG93IGFzIGFueSkuX3dhaWxzPy5mbGFncz8uZW5hYmxlRmlsZURyb3AgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuOyAvLyBGaWxlIGRyb3BzIGRpc2FibGVkLCBkb24ndCBhY3RpdmF0ZSBkcmFnIHN0YXRlXHJcbiAgICB9XHJcbiAgICBuYXRpdmVEcmFnQWN0aXZlID0gdHJ1ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGxlZCBmcm9tIEdvIHdoZW4gYSBmaWxlIGRyYWcgbGVhdmVzIHRoZSB3aW5kb3cgb24gTGludXgvbWFjT1MuXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVEcmFnTGVhdmUoKTogdm9pZCB7XHJcbiAgICBjbGVhbnVwTmF0aXZlRHJhZygpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsbGVkIGZyb20gR28gZHVyaW5nIGZpbGUgZHJhZyB0byB1cGRhdGUgaG92ZXIgc3RhdGUgb24gTGludXgvbWFjT1MuXHJcbiAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlIGluIENTUyBwaXhlbHNcclxuICogQHBhcmFtIHkgLSBZIGNvb3JkaW5hdGUgaW4gQ1NTIHBpeGVsc1xyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlRHJhZ092ZXIoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmICghbmF0aXZlRHJhZ0FjdGl2ZSkgcmV0dXJuO1xyXG4gICAgXHJcbiAgICAvLyBDaGVjayBpZiBmaWxlIGRyb3BzIGFyZSBlbmFibGVkIGZvciB0aGlzIHdpbmRvd1xyXG4gICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm47IC8vIEZpbGUgZHJvcHMgZGlzYWJsZWQsIGRvbid0IHNob3cgaG92ZXIgZWZmZWN0c1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCB0YXJnZXRFbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcclxuICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBnZXREcm9wVGFyZ2V0RWxlbWVudCh0YXJnZXRFbGVtZW50KTtcclxuICAgIFxyXG4gICAgaWYgKGN1cnJlbnREcm9wVGFyZ2V0ICYmIGN1cnJlbnREcm9wVGFyZ2V0ICE9PSBkcm9wVGFyZ2V0KSB7XHJcbiAgICAgICAgY3VycmVudERyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoZHJvcFRhcmdldCkge1xyXG4gICAgICAgIGRyb3BUYXJnZXQuY2xhc3NMaXN0LmFkZChEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xyXG4gICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gZHJvcFRhcmdldDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3VycmVudERyb3BUYXJnZXQgPSBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcbi8vIEV4cG9ydCB0aGUgaGFuZGxlcnMgZm9yIHVzZSBieSBHbyB2aWEgaW5kZXgudHNcclxuZXhwb3J0IHsgaGFuZGxlRHJhZ0VudGVyLCBoYW5kbGVEcmFnTGVhdmUsIGhhbmRsZURyYWdPdmVyIH07XHJcblxyXG4vKipcclxuICogQSByZWNvcmQgZGVzY3JpYmluZyB0aGUgcG9zaXRpb24gb2YgYSB3aW5kb3cuXHJcbiAqL1xyXG5pbnRlcmZhY2UgUG9zaXRpb24ge1xyXG4gICAgLyoqIFRoZSBob3Jpem9udGFsIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuICovXHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICAvKiogVGhlIHZlcnRpY2FsIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuICovXHJcbiAgICB5OiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIHJlY29yZCBkZXNjcmliaW5nIHRoZSBzaXplIG9mIGEgd2luZG93LlxyXG4gKi9cclxuaW50ZXJmYWNlIFNpemUge1xyXG4gICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgd2luZG93LiAqL1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuICovXHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxufVxyXG5cclxuLy8gUHJpdmF0ZSBmaWVsZCBuYW1lcy5cclxuY29uc3QgY2FsbGVyU3ltID0gU3ltYm9sKFwiY2FsbGVyXCIpO1xyXG5cclxuY2xhc3MgV2luZG93IHtcclxuICAgIC8vIFByaXZhdGUgZmllbGRzLlxyXG4gICAgcHJpdmF0ZSBbY2FsbGVyU3ltXTogKG1lc3NhZ2U6IG51bWJlciwgYXJncz86IGFueSkgPT4gUHJvbWlzZTxhbnk+O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGlzZXMgYSB3aW5kb3cgb2JqZWN0IHdpdGggdGhlIHNwZWNpZmllZCBuYW1lLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB0YXJnZXQgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgPSAnJykge1xyXG4gICAgICAgIHRoaXNbY2FsbGVyU3ltXSA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuV2luZG93LCBuYW1lKVxyXG5cclxuICAgICAgICAvLyBiaW5kIGluc3RhbmNlIG1ldGhvZCB0byBtYWtlIHRoZW0gZWFzaWx5IHVzYWJsZSBpbiBldmVudCBoYW5kbGVyc1xyXG4gICAgICAgIGZvciAoY29uc3QgbWV0aG9kIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKFdpbmRvdy5wcm90b3R5cGUpKSB7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIG1ldGhvZCAhPT0gXCJjb25zdHJ1Y3RvclwiXHJcbiAgICAgICAgICAgICAgICAmJiB0eXBlb2YgKHRoaXMgYXMgYW55KVttZXRob2RdID09PSBcImZ1bmN0aW9uXCJcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAodGhpcyBhcyBhbnkpW21ldGhvZF0gPSAodGhpcyBhcyBhbnkpW21ldGhvZF0uYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIHNwZWNpZmllZCB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IHRvIGdldC5cclxuICAgICAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIHdpbmRvdyBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIEdldChuYW1lOiBzdHJpbmcpOiBXaW5kb3cge1xyXG4gICAgICAgIHJldHVybiBuZXcgV2luZG93KG5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBQb3NpdGlvbigpOiBQcm9taXNlPFBvc2l0aW9uPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShQb3NpdGlvbk1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDZW50ZXJzIHRoZSB3aW5kb3cgb24gdGhlIHNjcmVlbi5cclxuICAgICAqL1xyXG4gICAgQ2VudGVyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oQ2VudGVyTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsb3NlcyB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBDbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKENsb3NlTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERpc2FibGVzIG1pbi9tYXggc2l6ZSBjb25zdHJhaW50cy5cclxuICAgICAqL1xyXG4gICAgRGlzYWJsZVNpemVDb25zdHJhaW50cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKERpc2FibGVTaXplQ29uc3RyYWludHNNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5hYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXHJcbiAgICAgKi9cclxuICAgIEVuYWJsZVNpemVDb25zdHJhaW50cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKEVuYWJsZVNpemVDb25zdHJhaW50c01ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGb2N1c2VzIHRoZSB3aW5kb3cuXHJcbiAgICAgKi9cclxuICAgIEZvY3VzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oRm9jdXNNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRm9yY2VzIHRoZSB3aW5kb3cgdG8gcmVsb2FkIHRoZSBwYWdlIGFzc2V0cy5cclxuICAgICAqL1xyXG4gICAgRm9yY2VSZWxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShGb3JjZVJlbG9hZE1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTd2l0Y2hlcyB0aGUgd2luZG93IHRvIGZ1bGxzY3JlZW4gbW9kZS5cclxuICAgICAqL1xyXG4gICAgRnVsbHNjcmVlbigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKEZ1bGxzY3JlZW5NZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc2NyZWVuIHRoYXQgdGhlIHdpbmRvdyBpcyBvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgc2NyZWVuIHRoZSB3aW5kb3cgaXMgY3VycmVudGx5IG9uLlxyXG4gICAgICovXHJcbiAgICBHZXRTY3JlZW4oKTogUHJvbWlzZTxTY3JlZW4+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKEdldFNjcmVlbk1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHpvb20gbGV2ZWwgb2YgdGhlIHdpbmRvdy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCB6b29tIGxldmVsLlxyXG4gICAgICovXHJcbiAgICBHZXRab29tKCk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShHZXRab29tTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGUgd2luZG93LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIFRoZSBjdXJyZW50IGhlaWdodCBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBIZWlnaHQoKTogUHJvbWlzZTxudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKEhlaWdodE1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlcyB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBIaWRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oSGlkZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmb2N1c2VkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHdpbmRvdyBpcyBjdXJyZW50bHkgZm9jdXNlZC5cclxuICAgICAqL1xyXG4gICAgSXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oSXNGb2N1c2VkTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIGZ1bGxzY3JlZW4uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgd2luZG93IGlzIGN1cnJlbnRseSBmdWxsc2NyZWVuLlxyXG4gICAgICovXHJcbiAgICBJc0Z1bGxzY3JlZW4oKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShJc0Z1bGxzY3JlZW5NZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgbWF4aW1pc2VkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHdpbmRvdyBpcyBjdXJyZW50bHkgbWF4aW1pc2VkLlxyXG4gICAgICovXHJcbiAgICBJc01heGltaXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKElzTWF4aW1pc2VkTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIG1pbmltaXNlZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB3aW5kb3cgaXMgY3VycmVudGx5IG1pbmltaXNlZC5cclxuICAgICAqL1xyXG4gICAgSXNNaW5pbWlzZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShJc01pbmltaXNlZE1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXhpbWlzZXMgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgTWF4aW1pc2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShNYXhpbWlzZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNaW5pbWlzZXMgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgTWluaW1pc2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShNaW5pbWlzZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgVGhlIG5hbWUgb2YgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgTmFtZSgpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oTmFtZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPcGVucyB0aGUgZGV2ZWxvcG1lbnQgdG9vbHMgcGFuZS5cclxuICAgICAqL1xyXG4gICAgT3BlbkRldlRvb2xzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oT3BlbkRldlRvb2xzTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBSZWxhdGl2ZVBvc2l0aW9uKCk6IFByb21pc2U8UG9zaXRpb24+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFJlbGF0aXZlUG9zaXRpb25NZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVsb2FkcyB0aGUgcGFnZSBhc3NldHMuXHJcbiAgICAgKi9cclxuICAgIFJlbG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFJlbG9hZE1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyByZXNpemFibGUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgd2luZG93IGlzIGN1cnJlbnRseSByZXNpemFibGUuXHJcbiAgICAgKi9cclxuICAgIFJlc2l6YWJsZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFJlc2l6YWJsZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXN0b3JlcyB0aGUgd2luZG93IHRvIGl0cyBwcmV2aW91cyBzdGF0ZSBpZiBpdCB3YXMgcHJldmlvdXNseSBtaW5pbWlzZWQsIG1heGltaXNlZCBvciBmdWxsc2NyZWVuLlxyXG4gICAgICovXHJcbiAgICBSZXN0b3JlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oUmVzdG9yZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB4IC0gVGhlIGRlc2lyZWQgaG9yaXpvbnRhbCBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxyXG4gICAgICogQHBhcmFtIHkgLSBUaGUgZGVzaXJlZCB2ZXJ0aWNhbCBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBTZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0UG9zaXRpb25NZXRob2QsIHsgeCwgeSB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHdpbmRvdyB0byBiZSBhbHdheXMgb24gdG9wLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBhbHdheXNPblRvcCAtIFdoZXRoZXIgdGhlIHdpbmRvdyBzaG91bGQgc3RheSBvbiB0b3AuXHJcbiAgICAgKi9cclxuICAgIFNldEFsd2F5c09uVG9wKGFsd2F5c09uVG9wOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRBbHdheXNPblRvcE1ldGhvZCwgeyBhbHdheXNPblRvcCB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGJhY2tncm91bmQgY29sb3VyIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHIgLSBUaGUgZGVzaXJlZCByZWQgY29tcG9uZW50IG9mIHRoZSB3aW5kb3cgYmFja2dyb3VuZC5cclxuICAgICAqIEBwYXJhbSBnIC0gVGhlIGRlc2lyZWQgZ3JlZW4gY29tcG9uZW50IG9mIHRoZSB3aW5kb3cgYmFja2dyb3VuZC5cclxuICAgICAqIEBwYXJhbSBiIC0gVGhlIGRlc2lyZWQgYmx1ZSBjb21wb25lbnQgb2YgdGhlIHdpbmRvdyBiYWNrZ3JvdW5kLlxyXG4gICAgICogQHBhcmFtIGEgLSBUaGUgZGVzaXJlZCBhbHBoYSBjb21wb25lbnQgb2YgdGhlIHdpbmRvdyBiYWNrZ3JvdW5kLlxyXG4gICAgICovXHJcbiAgICBTZXRCYWNrZ3JvdW5kQ29sb3VyKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIsIGE6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0QmFja2dyb3VuZENvbG91ck1ldGhvZCwgeyByLCBnLCBiLCBhIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyB0aGUgd2luZG93IGZyYW1lIGFuZCB0aXRsZSBiYXIuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGZyYW1lbGVzcyAtIFdoZXRoZXIgdGhlIHdpbmRvdyBzaG91bGQgYmUgZnJhbWVsZXNzLlxyXG4gICAgICovXHJcbiAgICBTZXRGcmFtZWxlc3MoZnJhbWVsZXNzOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRGcmFtZWxlc3NNZXRob2QsIHsgZnJhbWVsZXNzIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGlzYWJsZXMgdGhlIHN5c3RlbSBmdWxsc2NyZWVuIGJ1dHRvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZW5hYmxlZCAtIFdoZXRoZXIgdGhlIGZ1bGxzY3JlZW4gYnV0dG9uIHNob3VsZCBiZSBlbmFibGVkLlxyXG4gICAgICovXHJcbiAgICBTZXRGdWxsc2NyZWVuQnV0dG9uRW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRGdWxsc2NyZWVuQnV0dG9uRW5hYmxlZE1ldGhvZCwgeyBlbmFibGVkIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgbWF4aW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHdpZHRoIC0gVGhlIGRlc2lyZWQgbWF4aW11bSB3aWR0aCBvZiB0aGUgd2luZG93LlxyXG4gICAgICogQHBhcmFtIGhlaWdodCAtIFRoZSBkZXNpcmVkIG1heGltdW0gaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKi9cclxuICAgIFNldE1heFNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldE1heFNpemVNZXRob2QsIHsgd2lkdGgsIGhlaWdodCB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIG1pbmltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB3aWR0aCAtIFRoZSBkZXNpcmVkIG1pbmltdW0gd2lkdGggb2YgdGhlIHdpbmRvdy5cclxuICAgICAqIEBwYXJhbSBoZWlnaHQgLSBUaGUgZGVzaXJlZCBtaW5pbXVtIGhlaWdodCBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBTZXRNaW5TaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRNaW5TaXplTWV0aG9kLCB7IHdpZHRoLCBoZWlnaHQgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHggLSBUaGUgZGVzaXJlZCBob3Jpem9udGFsIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKiBAcGFyYW0geSAtIFRoZSBkZXNpcmVkIHZlcnRpY2FsIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKi9cclxuICAgIFNldFJlbGF0aXZlUG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldFJlbGF0aXZlUG9zaXRpb25NZXRob2QsIHsgeCwgeSB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgd2hldGhlciB0aGUgd2luZG93IGlzIHJlc2l6YWJsZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcmVzaXphYmxlIC0gV2hldGhlciB0aGUgd2luZG93IHNob3VsZCBiZSByZXNpemFibGUuXHJcbiAgICAgKi9cclxuICAgIFNldFJlc2l6YWJsZShyZXNpemFibGU6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldFJlc2l6YWJsZU1ldGhvZCwgeyByZXNpemFibGUgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHdpZHRoIC0gVGhlIGRlc2lyZWQgd2lkdGggb2YgdGhlIHdpbmRvdy5cclxuICAgICAqIEBwYXJhbSBoZWlnaHQgLSBUaGUgZGVzaXJlZCBoZWlnaHQgb2YgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgU2V0U2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0U2l6ZU1ldGhvZCwgeyB3aWR0aCwgaGVpZ2h0IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgdGl0bGUgb2YgdGhlIHdpbmRvdy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgLSBUaGUgZGVzaXJlZCB0aXRsZSBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBTZXRUaXRsZSh0aXRsZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRUaXRsZU1ldGhvZCwgeyB0aXRsZSB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdpbmRvdy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9vbSAtIFRoZSBkZXNpcmVkIHpvb20gbGV2ZWwuXHJcbiAgICAgKi9cclxuICAgIFNldFpvb20oem9vbTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRab29tTWV0aG9kLCB7IHpvb20gfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93cyB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBTaG93KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2hvd01ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgc2l6ZSBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBTaXplKCk6IFByb21pc2U8U2l6ZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2l6ZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBmdWxsc2NyZWVuIGFuZCBub3JtYWwuXHJcbiAgICAgKi9cclxuICAgIFRvZ2dsZUZ1bGxzY3JlZW4oKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShUb2dnbGVGdWxsc2NyZWVuTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIG1heGltaXNlZCBhbmQgbm9ybWFsLlxyXG4gICAgICovXHJcbiAgICBUb2dnbGVNYXhpbWlzZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFRvZ2dsZU1heGltaXNlTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIGZyYW1lbGVzcyBhbmQgbm9ybWFsLlxyXG4gICAgICovXHJcbiAgICBUb2dnbGVGcmFtZWxlc3MoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShUb2dnbGVGcmFtZWxlc3NNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW4tZnVsbHNjcmVlbnMgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgVW5GdWxsc2NyZWVuKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oVW5GdWxsc2NyZWVuTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVuLW1heGltaXNlcyB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBVbk1heGltaXNlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oVW5NYXhpbWlzZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbi1taW5pbWlzZXMgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgVW5NaW5pbWlzZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFVuTWluaW1pc2VNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIHdpbmRvdy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCB3aWR0aCBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBXaWR0aCgpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oV2lkdGhNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogWm9vbXMgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgWm9vbSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21NZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5jcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXHJcbiAgICAgKi9cclxuICAgIFpvb21JbigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21Jbk1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWNyZWFzZXMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdlYnZpZXcgY29udGVudC5cclxuICAgICAqL1xyXG4gICAgWm9vbU91dCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21PdXRNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzZXRzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXHJcbiAgICAgKi9cclxuICAgIFpvb21SZXNldCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21SZXNldE1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIGZpbGUgZHJvcHMgb3JpZ2luYXRpbmcgZnJvbSBwbGF0Zm9ybS1zcGVjaWZpYyBjb2RlIChlLmcuLCBtYWNPUy9MaW51eCBuYXRpdmUgZHJhZy1hbmQtZHJvcCkuXHJcbiAgICAgKiBHYXRoZXJzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBkcm9wIHRhcmdldCBlbGVtZW50IGFuZCBzZW5kcyBpdCBiYWNrIHRvIHRoZSBHbyBiYWNrZW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBmaWxlbmFtZXMgLSBBbiBhcnJheSBvZiBmaWxlIHBhdGhzIChzdHJpbmdzKSB0aGF0IHdlcmUgZHJvcHBlZC5cclxuICAgICAqIEBwYXJhbSB4IC0gVGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgZHJvcCBldmVudCwgaW4gbG9naWNhbCAoQ1NTKSBwaXhlbHMgcmVsYXRpdmUgdG8gdGhlIHdlYnZpZXcuXHJcbiAgICAgKiBAcGFyYW0geSAtIFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIGRyb3AgZXZlbnQsIGluIGxvZ2ljYWwgKENTUykgcGl4ZWxzIHJlbGF0aXZlIHRvIHRoZSB3ZWJ2aWV3LlxyXG4gICAgICovXHJcbiAgICBIYW5kbGVQbGF0Zm9ybUZpbGVEcm9wKGZpbGVuYW1lczogc3RyaW5nW10sIHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcclxuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIEZpbGUgZHJvcHMgZGlzYWJsZWQsIGlnbm9yZSB0aGUgZHJvcFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcclxuICAgICAgICBjb25zdCBkcm9wVGFyZ2V0ID0gZ2V0RHJvcFRhcmdldEVsZW1lbnQoZWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmICghZHJvcFRhcmdldCkge1xyXG4gICAgICAgICAgICAvLyBEcm9wIHdhcyBub3Qgb24gYSBkZXNpZ25hdGVkIGRyb3AgdGFyZ2V0IC0gaWdub3JlXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnREZXRhaWxzID0ge1xyXG4gICAgICAgICAgICBpZDogZHJvcFRhcmdldC5pZCxcclxuICAgICAgICAgICAgY2xhc3NMaXN0OiBBcnJheS5mcm9tKGRyb3BUYXJnZXQuY2xhc3NMaXN0KSxcclxuICAgICAgICAgICAgYXR0cmlidXRlczoge30gYXMgeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZHJvcFRhcmdldC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSBkcm9wVGFyZ2V0LmF0dHJpYnV0ZXNbaV07XHJcbiAgICAgICAgICAgIGVsZW1lbnREZXRhaWxzLmF0dHJpYnV0ZXNbYXR0ci5uYW1lXSA9IGF0dHIudmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgICAgICAgICBmaWxlbmFtZXMsXHJcbiAgICAgICAgICAgIHgsXHJcbiAgICAgICAgICAgIHksXHJcbiAgICAgICAgICAgIGVsZW1lbnREZXRhaWxzLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXNbY2FsbGVyU3ltXShGaWxlc0Ryb3BwZWQsIHBheWxvYWQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENsZWFuIHVwIG5hdGl2ZSBkcmFnIHN0YXRlIGFmdGVyIGRyb3BcclxuICAgICAgICBjbGVhbnVwTmF0aXZlRHJhZygpO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgLyoqXHJcbiAgICAgKiBNb3ZlcyB0aGUgd2luZG93IHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNwZWNpZmllZCBzY3JlZW4ncyB3b3JrIGFyZWEuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHNjcmVlbklEIC0gVGhlIElEIG9mIHRoZSB0YXJnZXQgc2NyZWVuLlxyXG4gICAgICovXHJcbiAgICBTZXRTY3JlZW4oc2NyZWVuSUQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0U2NyZWVuTWV0aG9kLCB7IHNjcmVlbklEIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIFRyaWdnZXJzIFdpbmRvd3MgMTEgU25hcCBBc3Npc3QgZmVhdHVyZSAoV2luZG93cyBvbmx5KS5cclxuICAgICAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byBwcmVzc2luZyBXaW4rWiBhbmQgc2hvd3Mgc25hcCBsYXlvdXQgb3B0aW9ucy5cclxuICAgICAqL1xyXG4gICAgU25hcEFzc2lzdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNuYXBBc3Npc3RNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3BlbnMgdGhlIHByaW50IGRpYWxvZyBmb3IgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgUHJpbnQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShQcmludE1ldGhvZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgd2luZG93IHdpdGhpbiB3aGljaCB0aGUgc2NyaXB0IGlzIHJ1bm5pbmcuXHJcbiAqL1xyXG5jb25zdCB0aGlzV2luZG93ID0gbmV3IFdpbmRvdygnJyk7XHJcblxyXG4vKipcclxuICogU2V0cyB1cCBnbG9iYWwgZHJhZyBhbmQgZHJvcCBldmVudCBsaXN0ZW5lcnMgZm9yIGZpbGUgZHJvcHMuXHJcbiAqIEhhbmRsZXMgdmlzdWFsIGZlZWRiYWNrIChob3ZlciBzdGF0ZSkgYW5kIGZpbGUgZHJvcCBwcm9jZXNzaW5nLlxyXG4gKi9cclxuZnVuY3Rpb24gc2V0dXBEcm9wVGFyZ2V0TGlzdGVuZXJzKCkge1xyXG4gICAgY29uc3QgZG9jRWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgIGxldCBkcmFnRW50ZXJDb3VudGVyID0gMDtcclxuXHJcbiAgICBkb2NFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmICghZXZlbnQuZGF0YVRyYW5zZmVyPy50eXBlcy5pbmNsdWRlcygnRmlsZXMnKSkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIE9ubHkgaGFuZGxlIGZpbGUgZHJhZ3MsIGxldCBvdGhlciBkcmFncyBwYXNzIHRocm91Z2hcclxuICAgICAgICB9XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy8gQWx3YXlzIHByZXZlbnQgZGVmYXVsdCB0byBzdG9wIGJyb3dzZXIgbmF2aWdhdGlvblxyXG4gICAgICAgIC8vIE9uIFdpbmRvd3MsIGNoZWNrIGlmIGZpbGUgZHJvcHMgYXJlIGVuYWJsZWQgZm9yIHRoaXMgd2luZG93XHJcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbm9uZSc7IC8vIFNob3cgXCJubyBkcm9wXCIgY3Vyc29yXHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gRmlsZSBkcm9wcyBkaXNhYmxlZCwgZG9uJ3Qgc2hvdyBob3ZlciBlZmZlY3RzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYWdFbnRlckNvdW50ZXIrKztcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB0YXJnZXRFbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgICAgICBjb25zdCBkcm9wVGFyZ2V0ID0gZ2V0RHJvcFRhcmdldEVsZW1lbnQodGFyZ2V0RWxlbWVudCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBob3ZlciBzdGF0ZVxyXG4gICAgICAgIGlmIChjdXJyZW50RHJvcFRhcmdldCAmJiBjdXJyZW50RHJvcFRhcmdldCAhPT0gZHJvcFRhcmdldCkge1xyXG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZHJvcFRhcmdldCkge1xyXG4gICAgICAgICAgICBkcm9wVGFyZ2V0LmNsYXNzTGlzdC5hZGQoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKTtcclxuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnY29weSc7XHJcbiAgICAgICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gZHJvcFRhcmdldDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBldmVudC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdub25lJztcclxuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICBkb2NFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKCFldmVudC5kYXRhVHJhbnNmZXI/LnR5cGVzLmluY2x1ZGVzKCdGaWxlcycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gT25seSBoYW5kbGUgZmlsZSBkcmFnc1xyXG4gICAgICAgIH1cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBBbHdheXMgcHJldmVudCBkZWZhdWx0IHRvIHN0b3AgYnJvd3NlciBuYXZpZ2F0aW9uXHJcbiAgICAgICAgLy8gT24gV2luZG93cywgY2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcclxuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBldmVudC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdub25lJzsgLy8gU2hvdyBcIm5vIGRyb3BcIiBjdXJzb3JcclxuICAgICAgICAgICAgcmV0dXJuOyAvLyBGaWxlIGRyb3BzIGRpc2FibGVkLCBkb24ndCBzaG93IGhvdmVyIGVmZmVjdHNcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVXBkYXRlIGRyb3AgdGFyZ2V0IGFzIGN1cnNvciBtb3Zlc1xyXG4gICAgICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBnZXREcm9wVGFyZ2V0RWxlbWVudCh0YXJnZXRFbGVtZW50KTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoY3VycmVudERyb3BUYXJnZXQgJiYgY3VycmVudERyb3BUYXJnZXQgIT09IGRyb3BUYXJnZXQpIHtcclxuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoZHJvcFRhcmdldCkge1xyXG4gICAgICAgICAgICBpZiAoIWRyb3BUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUykpIHtcclxuICAgICAgICAgICAgICAgIGRyb3BUYXJnZXQuY2xhc3NMaXN0LmFkZChEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknO1xyXG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IGRyb3BUYXJnZXQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgZG9jRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnbGVhdmUnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICBpZiAoIWV2ZW50LmRhdGFUcmFuc2Zlcj8udHlwZXMuaW5jbHVkZXMoJ0ZpbGVzJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBBbHdheXMgcHJldmVudCBkZWZhdWx0IHRvIHN0b3AgYnJvd3NlciBuYXZpZ2F0aW9uXHJcbiAgICAgICAgLy8gT24gV2luZG93cywgY2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcclxuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE9uIExpbnV4L1dlYktpdEdUSyBhbmQgbWFjT1MsIGRyYWdsZWF2ZSBmaXJlcyBpbW1lZGlhdGVseSB3aXRoIHJlbGF0ZWRUYXJnZXQ9bnVsbCB3aGVuIG5hdGl2ZVxyXG4gICAgICAgIC8vIGRyYWcgaGFuZGxpbmcgaXMgaW52b2x2ZWQuIElnbm9yZSB0aGVzZSBzcHVyaW91cyBldmVudHMgLSB3ZSdsbCBjbGVhbiB1cCBvbiBkcm9wIGluc3RlYWQuXHJcbiAgICAgICAgaWYgKGV2ZW50LnJlbGF0ZWRUYXJnZXQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBkcmFnRW50ZXJDb3VudGVyLS07XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGRyYWdFbnRlckNvdW50ZXIgPT09IDAgfHwgXHJcbiAgICAgICAgICAgIChjdXJyZW50RHJvcFRhcmdldCAmJiAhY3VycmVudERyb3BUYXJnZXQuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCBhcyBOb2RlKSkpIHtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnREcm9wVGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ0VudGVyQ291bnRlciA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxuICAgIGRvY0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmICghZXZlbnQuZGF0YVRyYW5zZmVyPy50eXBlcy5pbmNsdWRlcygnRmlsZXMnKSkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIE9ubHkgaGFuZGxlIGZpbGUgZHJvcHNcclxuICAgICAgICB9XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy8gQWx3YXlzIHByZXZlbnQgZGVmYXVsdCB0byBzdG9wIGJyb3dzZXIgbmF2aWdhdGlvblxyXG4gICAgICAgIC8vIE9uIFdpbmRvd3MsIGNoZWNrIGlmIGZpbGUgZHJvcHMgYXJlIGVuYWJsZWQgZm9yIHRoaXMgd2luZG93XHJcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkcmFnRW50ZXJDb3VudGVyID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoY3VycmVudERyb3BUYXJnZXQpIHtcclxuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xyXG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPbiBXaW5kb3dzLCBoYW5kbGUgZmlsZSBkcm9wcyB2aWEgSmF2YVNjcmlwdFxyXG4gICAgICAgIC8vIE9uIG1hY09TL0xpbnV4LCBuYXRpdmUgY29kZSB3aWxsIGNhbGwgSGFuZGxlUGxhdGZvcm1GaWxlRHJvcFxyXG4gICAgICAgIC8vIENvbXBvc2l0aW9uLWhvc3RlZCB3aW5kb3dzIHJlc29sdmUgQ0ZfSERST1AgcGF0aHMgaW4gdGhlIG5hdGl2ZSBob3N0XHJcbiAgICAgICAgLy8gc28gYSBxdWljayBkcm9wIGNhbm5vdCBvdXRydW4gV2ViVmlldzIncyBET00gZHJhZyBldmVudCBkaXNwYXRjaC5cclxuICAgICAgICAvLyBUaGUgRE9NIGRyb3Agc3RpbGwgZmlyZXMgZm9yIGFwcGxpY2F0aW9uIGhhbmRsZXJzLCBidXQgcG9zdGluZyB0aGVcclxuICAgICAgICAvLyBGaWxlIG9iamVjdHMgaGVyZSB3b3VsZCBkdXBsaWNhdGUgdGhlIG5hdGl2ZSBXaW5kb3dGaWxlc0Ryb3BwZWQgZXZlbnQuXHJcbiAgICAgICAgaWYgKGNhblJlc29sdmVGaWxlUGF0aHMoKSAmJiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5mbGFncz8ubmF0aXZlQ29tcG9zaXRpb25GaWxlRHJvcCAhPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlczogRmlsZVtdID0gW107XHJcbiAgICAgICAgICAgIGlmIChldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IGl0ZW0uZ2V0QXNGaWxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlKSBmaWxlcy5wdXNoKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5kYXRhVHJhbnNmZXIuZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBldmVudC5kYXRhVHJhbnNmZXIuZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZUZpbGVQYXRocyhldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBmaWxlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LCBmYWxzZSk7XHJcbn1cclxuXHJcbi8vIEluaXRpYWxpemUgbGlzdGVuZXJzIHdoZW4gdGhlIHNjcmlwdCBsb2Fkc1xyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgZG9jdW1lbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgIHNldHVwRHJvcFRhcmdldExpc3RlbmVycygpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0aGlzV2luZG93O1xyXG4iLCIvKlxyXG4gXyAgICAgX18gICAgIF8gX19cclxufCB8ICAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBPcGVuVVJMIH0gZnJvbSBcIi4vYnJvd3Nlci5qc1wiO1xyXG5pbXBvcnQgeyBRdWVzdGlvbiB9IGZyb20gXCIuL2RpYWxvZ3MuanNcIjtcclxuaW1wb3J0IHsgRW1pdCB9IGZyb20gXCIuL2V2ZW50cy5qc1wiO1xyXG5pbXBvcnQgeyBjYW5BYm9ydExpc3RlbmVycywgd2hlblJlYWR5IH0gZnJvbSBcIi4vdXRpbHMuanNcIjtcclxuaW1wb3J0IFdpbmRvdyBmcm9tIFwiLi93aW5kb3cuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBTZW5kcyBhbiBldmVudCB3aXRoIHRoZSBnaXZlbiBuYW1lIGFuZCBvcHRpb25hbCBkYXRhLlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnROYW1lIC0gLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gc2VuZC5cclxuICogQHBhcmFtIFtkYXRhPW51bGxdIC0gLSBPcHRpb25hbCBkYXRhIHRvIHNlbmQgYWxvbmcgd2l0aCB0aGUgZXZlbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBzZW5kRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIGRhdGE6IGFueSA9IG51bGwpOiB2b2lkIHtcclxuICAgIEVtaXQoZXZlbnROYW1lLCBkYXRhKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGxzIGEgbWV0aG9kIG9uIGEgc3BlY2lmaWVkIHdpbmRvdy5cclxuICpcclxuICogQHBhcmFtIHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IHRvIGNhbGwgdGhlIG1ldGhvZCBvbi5cclxuICogQHBhcmFtIG1ldGhvZE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHRvIGNhbGwuXHJcbiAqL1xyXG5mdW5jdGlvbiBjYWxsV2luZG93TWV0aG9kKHdpbmRvd05hbWU6IHN0cmluZywgbWV0aG9kTmFtZTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCB0YXJnZXRXaW5kb3cgPSBXaW5kb3cuR2V0KHdpbmRvd05hbWUpO1xyXG4gICAgY29uc3QgbWV0aG9kID0gKHRhcmdldFdpbmRvdyBhcyBhbnkpW21ldGhvZE5hbWVdO1xyXG5cclxuICAgIGlmICh0eXBlb2YgbWV0aG9kICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBXaW5kb3cgbWV0aG9kICcke21ldGhvZE5hbWV9JyBub3QgZm91bmRgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBtZXRob2QuY2FsbCh0YXJnZXRXaW5kb3cpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGNhbGxpbmcgd2luZG93IG1ldGhvZCAnJHttZXRob2ROYW1lfSc6IGAsIGUpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmVzcG9uZHMgdG8gYSB0cmlnZ2VyaW5nIGV2ZW50IGJ5IHJ1bm5pbmcgYXBwcm9wcmlhdGUgV01MIGFjdGlvbnMgZm9yIHRoZSBjdXJyZW50IHRhcmdldC5cclxuICovXHJcbmZ1bmN0aW9uIG9uV01MVHJpZ2dlcmVkKGV2OiBFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgZWxlbWVudCA9IGV2LmN1cnJlbnRUYXJnZXQgYXMgRWxlbWVudDtcclxuXHJcbiAgICBmdW5jdGlvbiBydW5FZmZlY3QoY2hvaWNlID0gXCJZZXNcIikge1xyXG4gICAgICAgIGlmIChjaG9pY2UgIT09IFwiWWVzXCIpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1ldmVudCcpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC1ldmVudCcpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldFdpbmRvdyA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtdGFyZ2V0LXdpbmRvdycpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC10YXJnZXQtd2luZG93JykgfHwgXCJcIjtcclxuICAgICAgICBjb25zdCB3aW5kb3dNZXRob2QgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLXdpbmRvdycpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC13aW5kb3cnKTtcclxuICAgICAgICBjb25zdCB1cmwgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLW9wZW51cmwnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS13bWwtb3BlbnVybCcpO1xyXG5cclxuICAgICAgICBpZiAoZXZlbnRUeXBlICE9PSBudWxsKVxyXG4gICAgICAgICAgICBzZW5kRXZlbnQoZXZlbnRUeXBlKTtcclxuICAgICAgICBpZiAod2luZG93TWV0aG9kICE9PSBudWxsKVxyXG4gICAgICAgICAgICBjYWxsV2luZG93TWV0aG9kKHRhcmdldFdpbmRvdywgd2luZG93TWV0aG9kKTtcclxuICAgICAgICBpZiAodXJsICE9PSBudWxsKVxyXG4gICAgICAgICAgICB2b2lkIE9wZW5VUkwodXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb25maXJtID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1jb25maXJtJykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd21sLWNvbmZpcm0nKTtcclxuXHJcbiAgICBpZiAoY29uZmlybSkge1xyXG4gICAgICAgIFF1ZXN0aW9uKHtcclxuICAgICAgICAgICAgVGl0bGU6IFwiQ29uZmlybVwiLFxyXG4gICAgICAgICAgICBNZXNzYWdlOiBjb25maXJtLFxyXG4gICAgICAgICAgICBEZXRhY2hlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIEJ1dHRvbnM6IFtcclxuICAgICAgICAgICAgICAgIHsgTGFiZWw6IFwiWWVzXCIgfSxcclxuICAgICAgICAgICAgICAgIHsgTGFiZWw6IFwiTm9cIiwgSXNEZWZhdWx0OiB0cnVlIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pLnRoZW4ocnVuRWZmZWN0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcnVuRWZmZWN0KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIFByaXZhdGUgZmllbGQgbmFtZXMuXHJcbmNvbnN0IGNvbnRyb2xsZXJTeW0gPSBTeW1ib2woXCJjb250cm9sbGVyXCIpO1xyXG5jb25zdCB0cmlnZ2VyTWFwU3ltID0gU3ltYm9sKFwidHJpZ2dlck1hcFwiKTtcclxuY29uc3QgZWxlbWVudENvdW50U3ltID0gU3ltYm9sKFwiZWxlbWVudENvdW50XCIpO1xyXG5cclxuLyoqXHJcbiAqIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IGRvZXMgbm90IGFjdHVhbGx5IHJlbWVtYmVyIGFjdGl2ZSBldmVudCBsaXN0ZW5lcnM6IGluc3RlYWRcclxuICogaXQgdGllcyB0aGVtIHRvIGFuIEFib3J0U2lnbmFsIGFuZCB1c2VzIGFuIEFib3J0Q29udHJvbGxlciB0byByZW1vdmUgdGhlbSBhbGwgYXQgb25jZS5cclxuICovXHJcbmNsYXNzIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IHtcclxuICAgIC8vIFByaXZhdGUgZmllbGRzLlxyXG4gICAgW2NvbnRyb2xsZXJTeW1dOiBBYm9ydENvbnRyb2xsZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpc1tjb250cm9sbGVyU3ltXSA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gb3B0aW9ucyBvYmplY3QgZm9yIGFkZEV2ZW50TGlzdGVuZXIgdGhhdCB0aWVzIHRoZSBsaXN0ZW5lclxyXG4gICAgICogdG8gdGhlIEFib3J0U2lnbmFsIGZyb20gdGhlIGN1cnJlbnQgQWJvcnRDb250cm9sbGVyLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gQW4gSFRNTCBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gdHJpZ2dlcnMgLSBUaGUgbGlzdCBvZiBhY3RpdmUgV01MIHRyaWdnZXIgZXZlbnRzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIHNldChlbGVtZW50OiBFbGVtZW50LCB0cmlnZ2Vyczogc3RyaW5nW10pOiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyB7XHJcbiAgICAgICAgcmV0dXJuIHsgc2lnbmFsOiB0aGlzW2NvbnRyb2xsZXJTeW1dLnNpZ25hbCB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMgYW5kIHJlc2V0cyB0aGUgcmVnaXN0cnkuXHJcbiAgICAgKi9cclxuICAgIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXNbY29udHJvbGxlclN5bV0uYWJvcnQoKTtcclxuICAgICAgICB0aGlzW2NvbnRyb2xsZXJTeW1dID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogV2Vha01hcFJlZ2lzdHJ5IG1hcHMgYWN0aXZlIHRyaWdnZXIgZXZlbnRzIHRvIGVhY2ggRE9NIGVsZW1lbnQgdGhyb3VnaCBhIFdlYWtNYXAuXHJcbiAqIFRoaXMgZW5zdXJlcyB0aGF0IHRoZSBtYXBwaW5nIHJlbWFpbnMgcHJpdmF0ZSB0byB0aGlzIG1vZHVsZSwgd2hpbGUgc3RpbGwgYWxsb3dpbmcgZ2FyYmFnZVxyXG4gKiBjb2xsZWN0aW9uIG9mIHRoZSBpbnZvbHZlZCBlbGVtZW50cy5cclxuICovXHJcbmNsYXNzIFdlYWtNYXBSZWdpc3RyeSB7XHJcbiAgICAvKiogU3RvcmVzIHRoZSBjdXJyZW50IGVsZW1lbnQtdG8tdHJpZ2dlciBtYXBwaW5nLiAqL1xyXG4gICAgW3RyaWdnZXJNYXBTeW1dOiBXZWFrTWFwPEVsZW1lbnQsIHN0cmluZ1tdPjtcclxuICAgIC8qKiBDb3VudHMgdGhlIG51bWJlciBvZiBlbGVtZW50cyB3aXRoIGFjdGl2ZSBXTUwgdHJpZ2dlcnMuICovXHJcbiAgICBbZWxlbWVudENvdW50U3ltXTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcFN5bV0gPSBuZXcgV2Vha01hcCgpO1xyXG4gICAgICAgIHRoaXNbZWxlbWVudENvdW50U3ltXSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGFjdGl2ZSB0cmlnZ2VycyBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gQW4gSFRNTCBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gdHJpZ2dlcnMgLSBUaGUgbGlzdCBvZiBhY3RpdmUgV01MIHRyaWdnZXIgZXZlbnRzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgc2V0KGVsZW1lbnQ6IEVsZW1lbnQsIHRyaWdnZXJzOiBzdHJpbmdbXSk6IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zIHtcclxuICAgICAgICBpZiAoIXRoaXNbdHJpZ2dlck1hcFN5bV0uaGFzKGVsZW1lbnQpKSB7IHRoaXNbZWxlbWVudENvdW50U3ltXSsrOyB9XHJcbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwU3ltXS5zZXQoZWxlbWVudCwgdHJpZ2dlcnMpO1xyXG4gICAgICAgIHJldHVybiB7fTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAgICovXHJcbiAgICByZXNldCgpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpc1tlbGVtZW50Q291bnRTeW1dIDw9IDApXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzW2VsZW1lbnRDb3VudFN5bV0gPD0gMClcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdHJpZ2dlcnMgPSB0aGlzW3RyaWdnZXJNYXBTeW1dLmdldChlbGVtZW50KTtcclxuICAgICAgICAgICAgaWYgKHRyaWdnZXJzICE9IG51bGwpIHsgdGhpc1tlbGVtZW50Q291bnRTeW1dLS07IH1cclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycyB8fCBbXSlcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0cmlnZ2VyLCBvbldNTFRyaWdnZXJlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzW3RyaWdnZXJNYXBTeW1dID0gbmV3IFdlYWtNYXAoKTtcclxuICAgICAgICB0aGlzW2VsZW1lbnRDb3VudFN5bV0gPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCB0cmlnZ2VyUmVnaXN0cnkgPSBjYW5BYm9ydExpc3RlbmVycygpID8gbmV3IEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5KCkgOiBuZXcgV2Vha01hcFJlZ2lzdHJ5KCk7XHJcblxyXG4vKipcclxuICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gKi9cclxuZnVuY3Rpb24gYWRkV01MTGlzdGVuZXJzKGVsZW1lbnQ6IEVsZW1lbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IHRyaWdnZXJSZWdFeHAgPSAvXFxTKy9nO1xyXG4gICAgY29uc3QgdHJpZ2dlckF0dHIgPSAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC10cmlnZ2VyJykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd21sLXRyaWdnZXInKSB8fCBcImNsaWNrXCIpO1xyXG4gICAgY29uc3QgdHJpZ2dlcnM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgbGV0IG1hdGNoO1xyXG4gICAgd2hpbGUgKChtYXRjaCA9IHRyaWdnZXJSZWdFeHAuZXhlYyh0cmlnZ2VyQXR0cikpICE9PSBudWxsKVxyXG4gICAgICAgIHRyaWdnZXJzLnB1c2gobWF0Y2hbMF0pO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB0cmlnZ2VyUmVnaXN0cnkuc2V0KGVsZW1lbnQsIHRyaWdnZXJzKTtcclxuICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycylcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodHJpZ2dlciwgb25XTUxUcmlnZ2VyZWQsIG9wdGlvbnMpO1xyXG59XHJcblxyXG4vKipcclxuICogU2NoZWR1bGVzIGFuIGF1dG9tYXRpYyByZWxvYWQgb2YgV01MIHRvIGJlIHBlcmZvcm1lZCBhcyBzb29uIGFzIHRoZSBkb2N1bWVudCBpcyBmdWxseSBsb2FkZWQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gRW5hYmxlKCk6IHZvaWQge1xyXG4gICAgd2hlblJlYWR5KFJlbG9hZCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZWxvYWRzIHRoZSBXTUwgcGFnZSBieSBhZGRpbmcgbmVjZXNzYXJ5IGV2ZW50IGxpc3RlbmVycyBhbmQgYnJvd3NlciBsaXN0ZW5lcnMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gUmVsb2FkKCk6IHZvaWQge1xyXG4gICAgdHJpZ2dlclJlZ2lzdHJ5LnJlc2V0KCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1t3bWwtZXZlbnRdLCBbd21sLXdpbmRvd10sIFt3bWwtb3BlbnVybF0sIFtkYXRhLXdtbC1ldmVudF0sIFtkYXRhLXdtbC13aW5kb3ddLCBbZGF0YS13bWwtb3BlbnVybF0nKS5mb3JFYWNoKGFkZFdNTExpc3RlbmVycyk7XHJcbn1cclxuIiwiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuLyoqXHJcbiAqIEdvU3RyZWFtIOKAlCB0aGUgV2ViU29ja2V0IHByb2dyYW1taW5nIG1vZGVsIHdpdGhvdXQgYSBsaXN0ZW5pbmcgc29ja2V0LlxyXG4gKlxyXG4gKiBBIFdlYlNvY2tldCBjYW5ub3QgYmUgc3Bva2VuIG92ZXIgYSBjdXN0b20gVVJMIHNjaGVtZSwgc28gZ2V0dGluZyBvbmUgaW5zaWRlXHJcbiAqIGEgd2VidmlldyBtZWFucyBiaW5kaW5nIGEgcmVhbCBUQ1AgcG9ydC4gVGhpcyBzcGVha3MgdGhlIHNhbWUgc2hhcGUgb3ZlciB0aGVcclxuICogYXNzZXQgc2VydmVyIHRoZSBhcHAgYWxyZWFkeSBzZXJ2ZXM6IEdv4oaSSlMgb3ZlciBvbmUgaGVsZCBwb2xsIHBlciBwYWdlLCBKU+KGkkdvXHJcbiAqIG92ZXIgYSBub3JtYWwgUE9TVC5cclxuICpcclxuICoge0BsaW5rIFN0cmVhbX0gcmV0dXJucyBzeW5jaHJvbm91c2x5IHdpdGggYHJlYWR5U3RhdGUgPT09IENPTk5FQ1RJTkdgLCB0aGUgd2F5XHJcbiAqIGBuZXcgV2ViU29ja2V0KHVybClgIGRvZXMsIHNvIGEgY29ubmVjdGlvbiBjYW4gYmUgY3JlYXRlZCBhdCBtb2R1bGUgc2NvcGU6XHJcbiAqXHJcbiAqIGBgYGpzXHJcbiAqIGV4cG9ydCBjb25zdCBUZWxlbWV0cnkgPSBTdHJlYW0oXCJ0ZWxlbWV0cnlcIik7ICAgLy8gY29ubmVjdHMgaW4gdGhlIGJhY2tncm91bmRcclxuICogYGBgXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgbmFub2lkIH0gZnJvbSBcIi4vbmFub2lkLmpzXCI7XHJcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XHJcblxyXG4vLyBFdmVyeSBwaWVjZSBvZiBzdGF0ZSB0aGF0IHR3byBydW50aW1lIGluc3RhbmNlcyBtdXN0IGFncmVlIG9uIGxpdmVzIGhlcmUsIG9uXHJcbi8vIHdpbmRvdywgbm90IGluIG1vZHVsZSBzY29wZS4gVGhlIHJ1bnRpbWUgY2FuIGJlIGV2YWx1YXRlZCBtb3JlIHRoYW4gb25jZSBpbiBhXHJcbi8vIHBhZ2Ug4oCUIHRoZSBwbGF0Zm9ybSBpbmplY3RzIGEgY29weSBhbmQgYW4gYXBwIG1heSBpbXBvcnQgaXQgdG9vIOKAlCBhbmQgYVxyXG4vLyBwZXItbW9kdWxlIHJlZ2lzdHJ5IG1lYW50IGJvdGggaW5zdGFuY2VzIGFsbG9jYXRlZCBjb25uZWN0aW9uIGlkIDEsIHJhblxyXG4vLyBjb21wZXRpbmcgcG9sbHMgYWdhaW5zdCBvbmUgc2Vzc2lvbiwgYW5kIGRpc2NhcmRlZCBmcmFtZXMgYWRkcmVzc2VkIHRvIGlkc1xyXG4vLyBvbmx5IHRoZSBvdGhlciBpbnN0YW5jZSBrbmV3IGFib3V0LiBUaGUgc2Vzc2lvbiBpZCBhbG9uZSB3YXMgbm90IGVub3VnaC5cclxuaW50ZXJmYWNlIFN0cmVhbUdsb2JhbHMge1xyXG4gICAgc2Vzc2lvbjogc3RyaW5nO1xyXG4gICAgZ2VuZXJhdGlvbjogbnVtYmVyO1xyXG4gICAgbmV4dENvbm5JRDogbnVtYmVyO1xyXG4gICAgY29ubmVjdGlvbnM6IE1hcDxudW1iZXIsIFdhaWxzU29ja2V0PjtcclxuICAgIHBvbGxpbmc6IGJvb2xlYW47XHJcbiAgICBwb2xsQWJvcnQ/OiBBYm9ydENvbnRyb2xsZXI7XHJcbn1cclxuXHJcbmNvbnN0IEdFTkVSQVRJT05fS0VZID0gXCJfX3dhaWxzX3N0cmVhbV9nZW5lcmF0aW9uXCI7XHJcbmNvbnN0IEdFTkVSQVRJT05fTkFNRV9NQVJLRVIgPSBcIlxcdTAwMWZfX3dhaWxzX3N0cmVhbV9nZW5lcmF0aW9uX186XCI7XHJcblxyXG4vLyB3aW5kb3cubmFtZSBiZWxvbmdzIHRvIHRoZSBicm93c2luZyBjb250ZXh0IHJhdGhlciB0aGFuIHRoZSBEb2N1bWVudCwgc28gaXRcclxuLy8gc3Vydml2ZXMgYSByZWxvYWQgZXZlbiB3aGVuIFdlYiBTdG9yYWdlIGlzIGRpc2FibGVkLiBQcmVzZXJ2ZSBhbnkgbmFtZSB0aGVcclxuLy8gYXBwbGljYXRpb24gYXNzaWduZWQgYW5kIHJlc2VydmUgb25seSBhIHN1ZmZpeCBmb3IgdGhlIFN0cmVhbSBnZW5lcmF0aW9uLlxyXG5mdW5jdGlvbiBuYW1lZFBhZ2VHZW5lcmF0aW9uKCk6IG51bWJlciB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IG1hcmtlciA9IHdpbmRvdy5uYW1lLmxhc3RJbmRleE9mKEdFTkVSQVRJT05fTkFNRV9NQVJLRVIpO1xyXG4gICAgICAgIGlmIChtYXJrZXIgPCAwKSByZXR1cm4gMDtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IE51bWJlcih3aW5kb3cubmFtZS5zbGljZShtYXJrZXIgKyBHRU5FUkFUSU9OX05BTUVfTUFSS0VSLmxlbmd0aCkpO1xyXG4gICAgICAgIHJldHVybiBOdW1iZXIuaXNTYWZlSW50ZWdlcih2YWx1ZSkgJiYgdmFsdWUgPiAwID8gdmFsdWUgOiAwO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbWVtYmVyTmFtZWRQYWdlR2VuZXJhdGlvbihnZW5lcmF0aW9uOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgbWFya2VyID0gd2luZG93Lm5hbWUubGFzdEluZGV4T2YoR0VORVJBVElPTl9OQU1FX01BUktFUik7XHJcbiAgICAgICAgY29uc3QgYXBwbGljYXRpb25OYW1lID0gbWFya2VyIDwgMCA/IHdpbmRvdy5uYW1lIDogd2luZG93Lm5hbWUuc2xpY2UoMCwgbWFya2VyKTtcclxuICAgICAgICB3aW5kb3cubmFtZSA9IGFwcGxpY2F0aW9uTmFtZSArIEdFTkVSQVRJT05fTkFNRV9NQVJLRVIgKyBnZW5lcmF0aW9uO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgLy8gU29tZSBlbWJlZGRlZCBicm93c2VyIHBvbGljaWVzIGNhbiBkZW55IGFjY2VzcyB0byB0aGUgYnJvd3NpbmdcclxuICAgICAgICAvLyBjb250ZXh0IG5hbWUuIFRoZSB0aW1lIG9yaWdpbiByZW1haW5zIHRoZSBsYXN0LXJlc29ydCBmYWxsYmFjay5cclxuICAgIH1cclxufVxyXG5cclxuLy8gUmVxdWVzdCBhcnJpdmFsIG9yZGVyIGlzIG5vdCBwYWdlIG9yZGVyOiBhIHJlcXVlc3Qgc3RhcnRlZCBqdXN0IGJlZm9yZSBhXHJcbi8vIG5hdmlnYXRpb24gY2FuIHJlYWNoIEdvIGFmdGVyIHRoZSByZXBsYWNlbWVudCBwYWdlJ3MgZmlyc3QgcmVxdWVzdC4gS2VlcCBhXHJcbi8vIG1vbm90b25pYyBjb3VudGVyIGluIHRoaXMgdG9wLWxldmVsIGJyb3dzaW5nIGNvbnRleHQgc28gR28gY2FuIGRpc3Rpbmd1aXNoXHJcbi8vIHRob3NlIHBhZ2UgaW5jYXJuYXRpb25zIHdpdGhvdXQgdHJ1c3Rpbmcgc2VydmVyIHNjaGVkdWxpbmcgb3JkZXIuXHJcbmZ1bmN0aW9uIG5leHRQYWdlR2VuZXJhdGlvbigpOiBudW1iZXIge1xyXG4gICAgaWYgKCFoYXNET00pIHJldHVybiAxO1xyXG4gICAgLy8gQW5jaG9yIHRoZSB2YWx1ZSB0byB0aGUgcGFnZSdzIGNyZWF0aW9uIHRpbWUgYXMgd2VsbCBhcyB0aGUgc3RvcmVkXHJcbiAgICAvLyBjb3VudGVyLiBJZiBhcHBsaWNhdGlvbiBjb2RlIGNsZWFycyBzZXNzaW9uU3RvcmFnZSwgdGhlIG5leHQgcmVsb2FkIG11c3RcclxuICAgIC8vIHN0aWxsIGJlIG5ld2VyIHRoYW4gdGhlIGdlbmVyYXRpb24gR28gaGFzIGFscmVhZHkgcmV0aXJlZDsgcmVzdGFydGluZ1xyXG4gICAgLy8gZnJvbSAxIHdvdWxkIG1ha2UgZXZlcnkgc3RyZWFtIHJlcXVlc3QgcmVjZWl2ZSA0MTAgdW50aWwgdGhlIGhvc3QgZXhpdHMuXHJcbiAgICAvLyBQZXJmb3JtYW5jZS50aW1lT3JpZ2luIGlzIGFic2VudCBvbiBvbGRlciBXZWJLaXQgcmVsZWFzZXMgdGhhdCBXYWlsc1xyXG4gICAgLy8gc3RpbGwgdGFyZ2V0cy4gRGF0ZS5ub3cga2VlcHMgdGhvc2UgZW5naW5lcyBvbiB0aGUgcHJvdG9jb2w7IHRoZSBzdG9yZWRcclxuICAgIC8vIGNvdW50ZXIgZGlzYW1iaWd1YXRlcyByZWxvYWRzIHRoYXQgaGFwcGVuIHdpdGhpbiB0aGUgc2FtZSBtaWxsaXNlY29uZC5cclxuICAgIGNvbnN0IG9yaWdpbiA9IHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBOdW1iZXIuaXNGaW5pdGUocGVyZm9ybWFuY2UudGltZU9yaWdpbilcclxuICAgICAgICA/IHBlcmZvcm1hbmNlLnRpbWVPcmlnaW5cclxuICAgICAgICA6IERhdGUubm93KCk7XHJcbiAgICBjb25zdCBwYWdlVGltZSA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3Iob3JpZ2luICogMTAwMCkpO1xyXG4gICAgbGV0IGN1cnJlbnQgPSBuYW1lZFBhZ2VHZW5lcmF0aW9uKCk7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJhdyA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKEdFTkVSQVRJT05fS0VZKTtcclxuICAgICAgICBjb25zdCBzdG9yZWQgPSByYXcgPT09IG51bGwgPyAwIDogTnVtYmVyKHJhdyk7XHJcbiAgICAgICAgaWYgKE51bWJlci5pc1NhZmVJbnRlZ2VyKHN0b3JlZCkgJiYgc3RvcmVkID4gY3VycmVudCkgY3VycmVudCA9IHN0b3JlZDtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIFN0b3JhZ2UgY2FuIGJlIGRpc2FibGVkIGJ5IHBvbGljeS4gd2luZG93Lm5hbWUgc3VwcGxpZXMgdGhlXHJcbiAgICAgICAgLy8gYnJvd3NpbmctY29udGV4dCBjb3VudGVyIGluIHRoYXQgY2FzZS5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXh0ID0gTnVtYmVyLmlzU2FmZUludGVnZXIoY3VycmVudCkgJiYgY3VycmVudCA+PSAwICYmIGN1cnJlbnQgPCBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxyXG4gICAgICAgID8gTWF0aC5tYXgoY3VycmVudCArIDEsIHBhZ2VUaW1lKVxyXG4gICAgICAgIDogcGFnZVRpbWU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKEdFTkVSQVRJT05fS0VZLCBTdHJpbmcobmV4dCkpO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgLy8gVGhlIGJyb3dzaW5nLWNvbnRleHQgZmFsbGJhY2sgYmVsb3cgaXMgc3VmZmljaWVudCB3aGVuIHN0b3JhZ2UgaXNcclxuICAgICAgICAvLyB1bmF2YWlsYWJsZS5cclxuICAgIH1cclxuICAgIHJlbWVtYmVyTmFtZWRQYWdlR2VuZXJhdGlvbihuZXh0KTtcclxuICAgIHJldHVybiBuZXh0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdHJlYW1HbG9iYWxzKCk6IFN0cmVhbUdsb2JhbHMge1xyXG4gICAgY29uc3QgZnJlc2ggPSAoKTogU3RyZWFtR2xvYmFscyA9PiAoe1xyXG4gICAgICAgIHNlc3Npb246IG5hbm9pZCgpLFxyXG4gICAgICAgIGdlbmVyYXRpb246IG5leHRQYWdlR2VuZXJhdGlvbigpLFxyXG4gICAgICAgIG5leHRDb25uSUQ6IDEsXHJcbiAgICAgICAgY29ubmVjdGlvbnM6IG5ldyBNYXA8bnVtYmVyLCBXYWlsc1NvY2tldD4oKSxcclxuICAgICAgICBwb2xsaW5nOiBmYWxzZSxcclxuICAgIH0pO1xyXG4gICAgaWYgKCFoYXNET00pIHJldHVybiBmcmVzaCgpO1xyXG4gICAgY29uc3QgdyA9ICh3aW5kb3cgYXMgYW55KS5fd2FpbHMgPSAod2luZG93IGFzIGFueSkuX3dhaWxzIHx8IHt9O1xyXG4gICAgcmV0dXJuICh3Ll9fc3RyZWFtID0gdy5fX3N0cmVhbSB8fCBmcmVzaCgpKTtcclxufVxyXG5cclxuY29uc3QgRyA9IHN0cmVhbUdsb2JhbHMoKTtcclxuXHJcbmNvbnN0IEhEUl9TRVNTSU9OID0gXCJ4LXdhaWxzLXN0cmVhbS1zZXNzaW9uXCI7XHJcbmNvbnN0IEhEUl9HRU5FUkFUSU9OID0gXCJ4LXdhaWxzLXN0cmVhbS1nZW5lcmF0aW9uXCI7XHJcbmNvbnN0IEhEUl9DT05OID0gXCJ4LXdhaWxzLXN0cmVhbS1jb25uXCI7XHJcbmNvbnN0IEhEUl9LSU5EID0gXCJ4LXdhaWxzLXN0cmVhbS1raW5kXCI7XHJcbmNvbnN0IEhEUl9OQU1FID0gXCJ4LXdhaWxzLXN0cmVhbS1uYW1lXCI7XHJcbmNvbnN0IEhEUl9DSFVOSyA9IFwieC13YWlscy1zdHJlYW0tY2h1bmtcIjtcclxuY29uc3QgSERSX0NIVU5LX0lOREVYID0gXCJ4LXdhaWxzLXN0cmVhbS1jaHVuay1pbmRleFwiO1xyXG5jb25zdCBIRFJfQ0hVTktfVE9UQUwgPSBcIngtd2FpbHMtc3RyZWFtLWNodW5rLXRvdGFsXCI7XHJcbmNvbnN0IEhEUl9CQVRDSCA9IFwieC13YWlscy1zdHJlYW0tYmF0Y2hcIjtcclxuXHJcbmNvbnN0IEtJTkRfREFUQSA9IDA7XHJcbmNvbnN0IEtJTkRfT1BFTiA9IDE7XHJcbmNvbnN0IEtJTkRfQ0xPU0UgPSAyO1xyXG5jb25zdCBLSU5EX0VSUk9SID0gMztcclxuXHJcbi8vIE1hdGNoZXMgdGhlIHJ1bnRpbWUncyBvd24gbGltaXQ6IHN0YXkgdW5kZXIgV2ViVmlldzIncyB+Mk1CIHJlcXVlc3QgYm9keVxyXG4vLyBidWZmZXJpbmcgbGltaXQgaW4gV2ViUmVzb3VyY2VSZXF1ZXN0ZWQuXHJcbmNvbnN0IENIVU5LX1RIUkVTSE9MRCA9IDUxMiAqIDEwMjQ7XHJcbmNvbnN0IE1BWF9CQVRDSF9GUkFNRVMgPSA0MDk2O1xyXG5cclxuLy8gQmFja29mZiBmbG9vciBhbmQgY2VpbGluZyBmb3IgYSBmYWlsaW5nIHBvbGwuIFRoaXMgaXMgdGhlIFwicmVhc29uYWJsZSBsb3dlclxyXG4vLyBsaW1pdFwiIG9uIHBvbGxpbmcg4oCUIGFuIGVycm9yIGJhY2tvZmYsIG5vdCBhIHN0ZWFkeS1zdGF0ZSBpbnRlcnZhbC4gSW4gbm9ybWFsXHJcbi8vIG9wZXJhdGlvbiB0aGUgcG9sbCByZS1pc3N1ZXMgaW1tZWRpYXRlbHksIGJlY2F1c2UgdGhlIHNlcnZlciBob2xkIGhhcyBhbHJlYWR5XHJcbi8vIHByb3ZpZGVkIHdoYXRldmVyIGRlbGF5IHdhcyBhcHByb3ByaWF0ZS5cclxuY29uc3QgQkFDS09GRl9NSU4gPSAyNTA7XHJcbmNvbnN0IEJBQ0tPRkZfTUFYID0gNTAwMDtcclxuY29uc3QgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuXHJcbmZ1bmN0aW9uIHN0cmVhbVVSTChlbmRwb2ludDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgXCIvd2FpbHMvc3RyZWFtL1wiICsgZW5kcG9pbnQ7XHJcbn1cclxuXHJcblxyXG5jbGFzcyBTdHJlYW1SZXF1ZXN0Q2FuY2VsbGVkIGV4dGVuZHMgRXJyb3Ige1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoXCJzdHJlYW0gcmVxdWVzdCBjYW5jZWxsZWRcIik7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJBYm9ydEVycm9yXCI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNsZWVwKG1zOiBudW1iZXIsIHNpZ25hbD86IEFib3J0U2lnbmFsKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoIXNpZ25hbCkgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XHJcbiAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgU3RyZWFtUmVxdWVzdENhbmNlbGxlZCgpKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9uQWJvcnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICAgICAgICAgIHJlamVjdChuZXcgU3RyZWFtUmVxdWVzdENhbmNlbGxlZCgpKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCk7XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCBtcyk7XHJcbiAgICAgICAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBvbkFib3J0LCB7IG9uY2U6IHRydWUgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgc3RyZWFtIGNvbm5lY3Rpb24uIEltcGxlbWVudHMgdGhlIHVzZWZ1bCBzdWJzZXQgb2YgdGhlIGBXZWJTb2NrZXRgXHJcbiAqIGludGVyZmFjZSwgc28gdGhlIHNhbWUgYXBwbGljYXRpb24gY29kZSB3b3JrcyBhZ2FpbnN0IGEgcmVhbCBXZWJTb2NrZXQgaW5cclxuICogc2VydmVyIGJ1aWxkcy5cclxuICpcclxuICogT25lIGRlbGliZXJhdGUgZGl2ZXJnZW5jZSBmcm9tIHRoZSBzdGFuZGFyZDogYGJpbmFyeVR5cGVgIGRlZmF1bHRzIHRvXHJcbiAqIGBcImFycmF5YnVmZmVyXCJgIHJhdGhlciB0aGFuIGBcImJsb2JcImAsIGJlY2F1c2Ugc3RyZWFtIGZyYW1lcyBhcmUgYWx3YXlzXHJcbiAqIGJpbmFyeSBhbmQgYSBCbG9iIHdvdWxkIGZvcmNlIGFuIGV4dHJhIGFzeW5jIGhvcCB0byByZWFkIGV2ZXJ5IG1lc3NhZ2UuXHJcbiAqIFNldHRpbmcgaXQgdG8gYFwiYmxvYlwiYCBiZWhhdmVzIGFzIHRoZSBzdGFuZGFyZCBkZXNjcmliZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgV2FpbHNTb2NrZXQgZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgQ09OTkVDVElORyA9IDA7XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgT1BFTiA9IDE7XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgQ0xPU0lORyA9IDI7XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgQ0xPU0VEID0gMztcclxuXHJcbiAgICByZWFkb25seSBDT05ORUNUSU5HID0gMDtcclxuICAgIHJlYWRvbmx5IE9QRU4gPSAxO1xyXG4gICAgcmVhZG9ubHkgQ0xPU0lORyA9IDI7XHJcbiAgICByZWFkb25seSBDTE9TRUQgPSAzO1xyXG5cclxuICAgIC8qKiBUaGUgc3RyZWFtIG5hbWUgdGhpcyBjb25uZWN0aW9uIHdhcyBvcGVuZWQgYWdhaW5zdC4gKi9cclxuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcclxuICAgIHJlYWRvbmx5IHVybDogc3RyaW5nO1xyXG5cclxuICAgIC8qKiBBbHdheXMgZW1wdHk6IHN1YnByb3RvY29scyBhbmQgZXh0ZW5zaW9ucyBhcmUgbm90IG5lZ290aWF0ZWQuICovXHJcbiAgICByZWFkb25seSBwcm90b2NvbCA9IFwiXCI7XHJcbiAgICByZWFkb25seSBleHRlbnNpb25zID0gXCJcIjtcclxuXHJcbiAgICBiaW5hcnlUeXBlOiBcImFycmF5YnVmZmVyXCIgfCBcImJsb2JcIiA9IFwiYXJyYXlidWZmZXJcIjtcclxuICAgIHJlYWR5U3RhdGU6IG51bWJlciA9IFdhaWxzU29ja2V0LkNPTk5FQ1RJTkc7XHJcblxyXG4gICAgLy8gRGVjbGFyZWQgZm9yIHRoZSB0eXBlOyB0aGUgY29uc3RydWN0b3IgcmVwbGFjZXMgZWFjaCB3aXRoIGFuIGFjY2Vzc29yXHJcbiAgICAvLyB0aGF0IHJlZ2lzdGVycyBhIHJlYWwgbGlzdGVuZXIuIENhbGxpbmcgdGhlbSBkaXJlY3RseSBpbnN0ZWFkIHdvdWxkIG1ha2VcclxuICAgIC8vIGFueSB3cmFwcGVyIChzZWUgSlNPTlN0cmVhbSkgcmVjZWl2ZSBib3RoIHRoZSByYXcgYW5kIHRoZSBkZWNvZGVkIGV2ZW50LlxyXG4gICAgb25vcGVuOiAoKGV2OiBFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuICAgIG9ubWVzc2FnZTogKChldjogTWVzc2FnZUV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG4gICAgb25jbG9zZTogKChldjogQ2xvc2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuICAgIG9uZXJyb3I6ICgoZXY6IEV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGludGVybmFsIEFwcGxpZWQgdG8gZXZlcnkgaW5ib3VuZCBwYXlsb2FkIGJlZm9yZSBkaXNwYXRjaC4gSlNPTlN0cmVhbVxyXG4gICAgICogcmVwbGFjZXMgaXQsIHNvIGBvbm1lc3NhZ2VgIGFuZCBgYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwg4oCmKWAgc2VlIHRoZVxyXG4gICAgICogc2FtZSBkZWNvZGVkIHZhbHVlIOKAlCBpbnRlcmNlcHRpbmcgb25seSBgb25tZXNzYWdlYCBtYWRlIHRoZSB0d28gZGlzYWdyZWUuXHJcbiAgICAgKi9cclxuICAgIF9kZWNvZGU6IChwYXlsb2FkOiBBcnJheUJ1ZmZlcikgPT4gdW5rbm93biA9IChwYXlsb2FkKSA9PiBwYXlsb2FkO1xyXG5cclxuICAgIC8qKiBAaW50ZXJuYWwgKi8gcmVhZG9ubHkgX2lkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9idWZmZXJlZCA9IDA7XHJcbiAgICAvLyBTZW5kcyBhcmUgc2VyaWFsaXNlZCBwZXIgY29ubmVjdGlvbjogY29uY3VycmVudCBmZXRjaCgpIFBPU1RzIGRvIG5vdFxyXG4gICAgLy8gcHJlc2VydmUgb3JkZXIsIGFuZCBHbyByZWxpZXMgb24gc2VuZCBvcmRlciBiZWluZyB0aGUgb3JkZXIgaXQgb2JzZXJ2ZXMuXHJcbiAgICBwcml2YXRlIF9jaGFpbjogUHJvbWlzZTx2b2lkPiA9IFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgcHJpdmF0ZSBfcGVuZGluZzogUHJvbWlzZTxVaW50OEFycmF5PltdID0gW107XHJcbiAgICBwcml2YXRlIF9mbHVzaGluZyA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfb3BlbkFib3J0ID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG4gICAgcHJpdmF0ZSBfc2VuZEFib3J0ID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG5cclxuICAgIC8qKiBCeXRlcyBxdWV1ZWQgYnkgc2VuZCgpIHRoYXQgaGF2ZSBub3QgeWV0IHJlYWNoZWQgR28uICovXHJcbiAgICBnZXQgYnVmZmVyZWRBbW91bnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYnVmZmVyZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuX2lkID0gRy5uZXh0Q29ubklEKys7XHJcbiAgICAgICAgdGhpcy51cmwgPSBoYXNET00gPyBzdHJlYW1VUkwoXCJwb2xsXCIpICsgXCIjXCIgKyBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgOiBcIlwiO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgW1wib3BlblwiLCBcIm1lc3NhZ2VcIiwgXCJjbG9zZVwiLCBcImVycm9yXCJdKSB7XHJcbiAgICAgICAgICAgIGRlZmluZUhhbmRsZXJQcm9wZXJ0eSh0aGlzLCB0eXBlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEcuY29ubmVjdGlvbnMuc2V0KHRoaXMuX2lkLCB0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gRmlyZSBhbmQgZm9yZ2V0OiB0aGUgYWNrIGFycml2ZXMgYXMgYW4gb3BlbiBmcmFtZSBvbiB0aGUgcG9sbCwgd2hpY2hcclxuICAgICAgICAvLyBpcyB3aGF0IG1vdmVzIHJlYWR5U3RhdGUgdG8gT1BFTi5cclxuICAgICAgICB0aGlzLl9jaGFpbiA9IHRoaXMuX2NoYWluLnRoZW4oKCkgPT5cclxuICAgICAgICAgICAgcG9zdEZyYW1lKHRoaXMuX2lkLCBLSU5EX09QRU4sIG5ldyBVaW50OEFycmF5KDApLCBuYW1lLCB0aGlzLl9vcGVuQWJvcnQuc2lnbmFsKVxyXG4gICAgICAgICkuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9mYWlsKGVycik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHN0YXJ0UG9sbGluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VuZCBhIGZyYW1lIHRvIEdvLiBBY2NlcHRzIGFueXRoaW5nIGEgV2ViU29ja2V0IGRvZXM7IHN0cmluZ3MgYXJlXHJcbiAgICAgKiBlbmNvZGVkIGFzIFVURi04LCBzaW5jZSBHbyByZWNlaXZlcyBldmVyeSBmcmFtZSBhcyBhIGJ5dGUgc2xpY2UuXHJcbiAgICAgKi9cclxuICAgIHNlbmQoZGF0YTogc3RyaW5nIHwgQXJyYXlCdWZmZXJMaWtlIHwgQXJyYXlCdWZmZXJWaWV3IHwgQmxvYik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNPTk5FQ1RJTkcpIHtcclxuICAgICAgICAgICAgLy8gTWF0Y2hlcyB0aGUgV2ViU29ja2V0IHNwZWNpZmljYXRpb24uXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oXCJTdGlsbCBpbiBDT05ORUNUSU5HIHN0YXRlLlwiLCBcIkludmFsaWRTdGF0ZUVycm9yXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBXYWlsc1NvY2tldC5PUEVOKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc29sdmUgbm93IHJhdGhlciB0aGFuIGluc2lkZSB0aGUgY2hhaW4uIE11dGFibGUgYmluYXJ5IGlucHV0cyBhcmVcclxuICAgICAgICAvLyBjb3BpZWQgc3luY2hyb25vdXNseSBzbyBzZW5kKCkgc25hcHNob3RzIHRoZWlyIGJ5dGVzIGxpa2UgYSBuYXRpdmVcclxuICAgICAgICAvLyBXZWJTb2NrZXQsIGV2ZW4gd2hlbiBhIGJhdGNoIHdhaXRzIGJlaGluZCBhbiBpbi1mbGlnaHQgcmVxdWVzdC4gQVxyXG4gICAgICAgIC8vIEJsb2IgaXMgaW1tdXRhYmxlIGFuZCBpcyB0aGVyZWZvcmUgc2FmZSB0byByZWFkIGFzeW5jaHJvbm91c2x5IG9uY2UuXHJcbiAgICAgICAgY29uc3QgaW1tZWRpYXRlID0gdG9CeXRlc1N5bmMoZGF0YSk7XHJcbiAgICAgICAgY29uc3Qgc25hcHNob3QgPSBpbW1lZGlhdGVcclxuICAgICAgICAgICAgPyBQcm9taXNlLnJlc29sdmUoaW1tZWRpYXRlKVxyXG4gICAgICAgICAgICA6IHRvQnl0ZXMoZGF0YSwgdGhpcy5fc2VuZEFib3J0LnNpZ25hbCk7XHJcbiAgICAgICAgLy8gY2xvc2UoKSBtYXkgZGlzY2FyZCB0aGlzIHByb21pc2UgYmVmb3JlIHRoZSBmbHVzaCBoYXMgZGVxdWV1ZWQgaXQuXHJcbiAgICAgICAgLy8gQXR0YWNoIGEgcmVqZWN0aW9uIG9ic2VydmVyIGltbWVkaWF0ZWx5IHNvIGNhbmNlbGxpbmcgYW4gYXN5bmNocm9ub3VzXHJcbiAgICAgICAgLy8gQmxvYiByZWFkIGNhbm5vdCBiZWNvbWUgYW4gdW5oYW5kbGVkIHJlamVjdGlvbjsgUHJvbWlzZS5hbGwgc3RpbGxcclxuICAgICAgICAvLyBvYnNlcnZlcyB0aGUgb3JpZ2luYWwgcmVqZWN0aW9uIHdoZW4gdGhlIGZsdXNoIGFscmVhZHkgb3ducyBpdC5cclxuICAgICAgICB2b2lkIHNuYXBzaG90LmNhdGNoKCgpID0+IHt9KTtcclxuXHJcbiAgICAgICAgLy8gQSBCbG9iIGNhbm5vdCBiZSBjb252ZXJ0ZWQgc3luY2hyb25vdXNseSwgYnV0IEJsb2Iuc2l6ZSBpcyBhdmFpbGFibGVcclxuICAgICAgICAvLyBub3csIHNvIGl0cyBieXRlcyBhcmUgc3RpbGwgY291bnRlZCB0aGUgbW9tZW50IHNlbmQoKSByZXR1cm5zLiBXYWl0aW5nXHJcbiAgICAgICAgLy8gZm9yIGFycmF5QnVmZmVyKCkgdG8gcmVzb2x2ZSBsZXQgYSBsYXJnZSBCbG9iIHNsaXAgcGFzdCBjb2RlIHVzaW5nXHJcbiAgICAgICAgLy8gYnVmZmVyZWRBbW91bnQgZm9yIGJhY2twcmVzc3VyZS5cclxuICAgICAgICBjb25zdCBibG9iU2l6ZSA9XHJcbiAgICAgICAgICAgICFpbW1lZGlhdGUgJiYgdHlwZW9mIEJsb2IgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIEJsb2IgPyBkYXRhLnNpemUgOiAwO1xyXG4gICAgICAgIGlmIChibG9iU2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9idWZmZXJlZCArPSBibG9iU2l6ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFjY291bnQgZm9yIHRoZSBieXRlcyBub3csIG5vdCB3aGVuIHRoZSBjaGFpbiByZWFjaGVzIHRoZW0uIFJlcG9ydGluZ1xyXG4gICAgICAgIC8vIHplcm8gd2hpbGUgZnJhbWVzIHdhaXQgYmVoaW5kIGFuIGluLWZsaWdodCBiYXRjaCB3b3VsZCB0ZWxsIGFuXHJcbiAgICAgICAgLy8gYXBwbGljYXRpb24gdXNpbmcgYnVmZmVyZWRBbW91bnQgZm9yIGJhY2twcmVzc3VyZSB0aGF0IGl0IG1heSBrZWVwXHJcbiAgICAgICAgLy8gc2VuZGluZy5cclxuICAgICAgICBpZiAoaW1tZWRpYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlcmVkICs9IGltbWVkaWF0ZS5ieXRlTGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wZW5kaW5nLnB1c2goc25hcHNob3QpO1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSByYXRoZXIgdGhhbiBwb3N0LiBXaGF0ZXZlciBhY2N1bXVsYXRlcyB3aGlsZSBhIHJlcXVlc3QgaXMgaW5cclxuICAgICAgICAvLyBmbGlnaHQgZ29lcyBvdXQgdG9nZXRoZXIgaW4gdGhlIG5leHQgb25lLCBzbyB0aGUgcGVyLXJlcXVlc3QgY29zdCDigJRcclxuICAgICAgICAvLyBhIHNjaGVtZS1oYW5kbGVyIHJvdW5kIHRyaXAsIGFib3V0IGVsZXZlbiBjZ28gY2FsbHMgb24gbWFjT1Mg4oCUIGlzXHJcbiAgICAgICAgLy8gZGl2aWRlZCBhY3Jvc3MgdGhlIGJhdGNoLiBVbmRlciBsaWdodCBsb2FkIGEgYmF0Y2ggaXMgb25lIGZyYW1lIGFuZFxyXG4gICAgICAgIC8vIHRoaXMgYmVoYXZlcyBleGFjdGx5IGFzIGJlZm9yZTsgdGhlIGJhdGNoaW5nIG9ubHkgYXBwZWFycyB3aGVuIHRoZVxyXG4gICAgICAgIC8vIHNlbmRlciBpcyBvdXRydW5uaW5nIHRoZSB0cmFuc3BvcnQsIHdoaWNoIGlzIHdoZW4gaXQgaXMgbmVlZGVkLlxyXG4gICAgICAgIGlmICh0aGlzLl9mbHVzaGluZykgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2ZsdXNoaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fY2hhaW4gPSB0aGlzLl9jaGFpbi50aGVuKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wZW5kaW5nLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBCb3VuZCB0aGUgd29yayBhbmQgdGVtcG9yYXJ5IHByb21pc2UgYXJyYXkgZm9yIG9uZSBwYXNzLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBvc3RCYXRjaCBhcHBsaWVzIHRoZSB3aXJlLXNpemUgYm91bmQgYWZ0ZXIgcmVzb2x1dGlvbi5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBxdWV1ZWQgPSB0aGlzLl9wZW5kaW5nLnNwbGljZSgwLCBNQVhfQkFUQ0hfRlJBTUVTKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYXRjaCA9IGF3YWl0IFByb21pc2UuYWxsKHF1ZXVlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcmVtb3RlIGNsb3NlIG1heSBhcnJpdmUgd2hpbGUgYSBCbG9iIGlzIGJlaW5nIHJlYWQuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBnb25lIGluIHRoYXQgY2FzZSwgc28gZG8gbm90XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaXNzdWUgYSBsYXRlIFBPU1QgZm9yIGJ5dGVzIHRoZSBwZWVyIGNhbiBubyBsb25nZXIgdGFrZS5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBXYWlsc1NvY2tldC5DTE9TRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b3RhbCA9IGJhdGNoLnJlZHVjZSgobiwgYikgPT4gbiArIGIuYnl0ZUxlbmd0aCwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcG9zdEJhdGNoKHRoaXMuX2lkLCBiYXRjaCwgdGhpcy5fc2VuZEFib3J0LnNpZ25hbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gX2Nsb3NlZCByZXNldHMgdGhlIGNvdW50ZXIgaW1tZWRpYXRlbHkuIEEgcmVxdWVzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbHJlYWR5IGluIGZsaWdodCBtYXkgZmluaXNoIGFmdGVyd2FyZHMsIGFuZCBtdXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBkcml2ZSBidWZmZXJlZEFtb3VudCBiZWxvdyB6ZXJvLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9idWZmZXJlZCA9IE1hdGgubWF4KDAsIHRoaXMuX2J1ZmZlcmVkIC0gdG90YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZsdXNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZhaWwoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQ2xvc2UgdGhlIGNvbm5lY3Rpb24uIEdvJ3MgaGFuZGxlciBzZWVzIFJlY2VpdmUgZmFpbCBhbmQgcmV0dXJucy4gKi9cclxuICAgIGNsb3NlKGNvZGU6IG51bWJlciA9IDEwMDAsIHJlYXNvbjogc3RyaW5nID0gXCJcIik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NJTkcgfHwgdGhpcy5yZWFkeVN0YXRlID09PSBXYWlsc1NvY2tldC5DTE9TRUQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBXYWlsc1NvY2tldC5DTE9TSU5HO1xyXG4gICAgICAgIHRoaXMuX3BlbmRpbmcubGVuZ3RoID0gMDtcclxuICAgICAgICB0aGlzLl9idWZmZXJlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5fb3BlbkFib3J0LmFib3J0KCk7XHJcblxyXG4gICAgICAgIC8vIEEgZGF0YSBmcmFtZSB3YWl0aW5nIGZvciByZWNlaXZlciBjYXBhY2l0eSBtdXN0IG5vdCBwcmV2ZW50IHRoZVxyXG4gICAgICAgIC8vIHJlc2VydmVkIGNsb3NlIGNvbnRyb2wgZnJvbSBldmVyIHJlYWNoaW5nIEdvLiBDYW5jZWwgb25seSB0aGUgZGF0YVxyXG4gICAgICAgIC8vIHJldHJ5IHBhdGg7IHRoZSBjaGFpbiBiZWxvdyBzdGlsbCBvcmRlcnMgdGhlIGNsb3NlIGFmdGVyIHRoYXQgcGF0aFxyXG4gICAgICAgIC8vIGhhcyB1bndvdW5kLCBwcmVzZXJ2aW5nIG5vcm1hbCBzZW5kLWJlZm9yZS1jbG9zZSBvcmRlcmluZy5cclxuICAgICAgICB0aGlzLl9zZW5kQWJvcnQuYWJvcnQoKTtcclxuICAgICAgICB0aGlzLl9jaGFpbiA9IHRoaXMuX2NoYWluLnRoZW4oKCkgPT5cclxuICAgICAgICAgICAgcG9zdEZyYW1lKHRoaXMuX2lkLCBLSU5EX0NMT1NFLCBuZXcgVWludDhBcnJheSgwKSlcclxuICAgICAgICApLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAgICAgLy8gVGhlIHBlZXIgaXMgYWxyZWFkeSBnb25lOyB0aGUgbG9jYWwgY2xvc2UgYmVsb3cgaXMgd2hhdCBtYXR0ZXJzLlxyXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9jbG9zZWQoY29kZSwgcmVhc29uLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQGludGVybmFsIENhbGxlZCB3aGVuIHRoZSBvcGVuIGZyYW1lIGNvbWVzIGJhY2sgZnJvbSBHby4gKi9cclxuICAgIF9vcGVuZWQoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gV2FpbHNTb2NrZXQuQ09OTkVDVElORykgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdhaWxzU29ja2V0Lk9QRU47XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcIm9wZW5cIikpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBAaW50ZXJuYWwgQ2FsbGVkIGZvciBlYWNoIGRhdGEgZnJhbWUgYWRkcmVzc2VkIHRvIHRoaXMgY29ubmVjdGlvbi4gKi9cclxuICAgIF9tZXNzYWdlKHBheWxvYWQ6IEFycmF5QnVmZmVyKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gV2FpbHNTb2NrZXQuT1BFTikgcmV0dXJuO1xyXG4gICAgICAgIGxldCBkYXRhOiB1bmtub3duO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9kZWNvZGUocGF5bG9hZCk7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJlcnJvclwiKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IHBheWxvYWQgJiYgdGhpcy5iaW5hcnlUeXBlID09PSBcImJsb2JcIikge1xyXG4gICAgICAgICAgICBkYXRhID0gbmV3IEJsb2IoW3BheWxvYWRdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBNZXNzYWdlRXZlbnQoXCJtZXNzYWdlXCIsIHsgZGF0YSB9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX2ZhaWwoZXJyOiB1bmtub3duKTogdm9pZCB7XHJcbiAgICAgICAgLy8gQW4gaW4tZmxpZ2h0IHNlbmQgY2FuIHJlamVjdCBhZnRlciBhIGNsZWFuIGNsb3NlIGhhcyBhbHJlYWR5IGFycml2ZWQuXHJcbiAgICAgICAgLy8gVGhlIHNvY2tldCdzIGxpZmVjeWNsZSBpcyBjb21wbGV0ZSB0aGVuOiBlbWl0dGluZyBlcnJvciBhZnRlciBjbG9zZVxyXG4gICAgICAgIC8vIHJldmVyc2VzIHRoZSBXZWJTb2NrZXQgZXZlbnQgb3JkZXIgYW5kIHJlcG9ydHMgYSBmYWxzZSBmYWlsdXJlLlxyXG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NFRCB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NJTkcpIHJldHVybjtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiZXJyb3JcIikpO1xyXG4gICAgICAgIC8vIDEwMDY6IGNsb3NlZCBhYm5vcm1hbGx5LCBubyBjbG9zZSBmcmFtZS4gU2FtZSBjb2RlIGEgcmVhbCBXZWJTb2NrZXRcclxuICAgICAgICAvLyByZXBvcnRzIHdoZW4gdGhlIGNvbm5lY3Rpb24gZHJvcHMgd2l0aG91dCBhIGhhbmRzaGFrZS5cclxuICAgICAgICB0aGlzLl9jbG9zZWQoMTAwNiwgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX2Nsb3NlZChjb2RlOiBudW1iZXIsIHJlYXNvbjogc3RyaW5nLCB3YXNDbGVhbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NFRCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdhaWxzU29ja2V0LkNMT1NFRDtcclxuICAgICAgICB0aGlzLl9vcGVuQWJvcnQuYWJvcnQoKTtcclxuICAgICAgICB0aGlzLl9zZW5kQWJvcnQuYWJvcnQoKTtcclxuICAgICAgICBHLmNvbm5lY3Rpb25zLmRlbGV0ZSh0aGlzLl9pZCk7XHJcbiAgICAgICAgaWYgKEcuY29ubmVjdGlvbnMuc2l6ZSA9PT0gMCkgRy5wb2xsQWJvcnQ/LmFib3J0KCk7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZy5sZW5ndGggPSAwO1xyXG4gICAgICAgIHRoaXMuX2J1ZmZlcmVkID0gMDtcclxuXHJcbiAgICAgICAgY29uc3QgZXYgPSB0eXBlb2YgQ2xvc2VFdmVudCA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgICAgID8gbmV3IENsb3NlRXZlbnQoXCJjbG9zZVwiLCB7IGNvZGUsIHJlYXNvbiwgd2FzQ2xlYW4gfSlcclxuICAgICAgICAgICAgOiBPYmplY3QuYXNzaWduKG5ldyBFdmVudChcImNsb3NlXCIpLCB7IGNvZGUsIHJlYXNvbiwgd2FzQ2xlYW4gfSkgYXMgQ2xvc2VFdmVudDtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXYpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ29ubmVjdCB0byBhIHN0cmVhbSBkZWNsYXJlZCBpbiBHbyB3aXRoIGBhcHAuSGFuZGxlU3RyZWFtKG5hbWUsIGhhbmRsZXIpYC5cclxuICpcclxuICogUmV0dXJucyBpbW1lZGlhdGVseSB3aXRoIGByZWFkeVN0YXRlID09PSBDT05ORUNUSU5HYDsgbGlzdGVuIGZvciBgb3BlbmAsIG9yXHJcbiAqIGp1c3QgY2FsbCB7QGxpbmsgV2FpbHNTb2NrZXQuc2VuZH0gb25jZSBvcGVuLiBDcmVhdGluZyBhIGNvbm5lY3Rpb24gYXQgbW9kdWxlXHJcbiAqIHNjb3BlIGlzIHN1cHBvcnRlZCBhbmQgaXMgdGhlIGludGVuZGVkIHNoYXBlIGZvciBnZW5lcmF0ZWQgYmluZGluZ3MuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gU3RyZWFtKG5hbWU6IHN0cmluZyk6IFdhaWxzU29ja2V0IHwgV2ViU29ja2V0IHtcclxuICAgIC8vIFNlcnZlciBidWlsZHMgaW5zdGFsbCBhIGZhY3RvcnkgcmV0dXJuaW5nIGEgcmVhbCBXZWJTb2NrZXQsIHNpbmNlIHRoZXJlXHJcbiAgICAvLyBpcyBhIGxpc3RlbmVyIHRoZXJlIHRvIHVwZ3JhZGUgb24gYW5kIG5vdGhpbmcgdG8gZW11bGF0ZS4gQm90aCBvYmplY3RzXHJcbiAgICAvLyBwcmVzZW50IHRoZSBzYW1lIGludGVyZmFjZSwgc28gbm90aGluZyBhYm92ZSB0aGlzIGxpbmUgY2FyZXMgd2hpY2ggaXQgaXMuXHJcbiAgICBpZiAoaGFzRE9NKSB7XHJcbiAgICAgICAgY29uc3QgZmFjdG9yeSA9ICh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LnN0cmVhbUZhY3Rvcnk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBmYWN0b3J5ID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhY3RvcnkobmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBXYWlsc1NvY2tldChuYW1lKTtcclxufVxyXG5cclxuLy8gRGVmaW5lcyBhbiBgb248dHlwZT5gIHByb3BlcnR5IHRoYXQgcmVnaXN0ZXJzIGFuZCB1bnJlZ2lzdGVycyBhIHJlYWwgZXZlbnRcclxuLy8gbGlzdGVuZXIsIHRoZSB3YXkgdGhlIERPTSBkZWZpbmVzIHRoZW0uIEFzc2lnbmluZyByZXBsYWNlcyB0aGUgcHJldmlvdXNcclxuLy8gaGFuZGxlcjsgcmVhZGluZyByZXR1cm5zIGl0LlxyXG5mdW5jdGlvbiBkZWZpbmVIYW5kbGVyUHJvcGVydHkodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBsZXQgY3VycmVudDogKChldjogYW55KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgXCJvblwiICsgdHlwZSwge1xyXG4gICAgICAgIGdldDogKCkgPT4gY3VycmVudCxcclxuICAgICAgICBzZXQoZm46ICgoZXY6IGFueSkgPT4gdm9pZCkgfCBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50KSB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjdXJyZW50KTtcclxuICAgICAgICAgICAgY3VycmVudCA9IHR5cGVvZiBmbiA9PT0gXCJmdW5jdGlvblwiID8gZm4gOiBudWxsO1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudCkgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY3VycmVudCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIG9iamVjdC1zaGFwZWQgdmlldyBvZiBhIHN0cmVhbSByZXR1cm5lZCBieSB7QGxpbmsgSlNPTlN0cmVhbX06IGBzZW5kYFxyXG4gKiB0YWtlcyBhIHZhbHVlIHRvIHN0cmluZ2lmeSwgYW5kIGBldi5kYXRhYCBvbiBhIG1lc3NhZ2UgaXMgdGhlIHBhcnNlZCByZXN1bHQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEpTT05Tb2NrZXQgZXh0ZW5kcyBPbWl0PFdhaWxzU29ja2V0LCBcInNlbmRcIiB8IFwib25tZXNzYWdlXCIgfCBcImFkZEV2ZW50TGlzdGVuZXJcIiB8IFwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiPiB7XHJcbiAgICBzZW5kKHZhbHVlOiB1bmtub3duKTogdm9pZDtcclxuICAgIG9ubWVzc2FnZTogKChldjogTWVzc2FnZUV2ZW50PGFueT4pID0+IHZvaWQpIHwgbnVsbDtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXHJcbiAgICAgICAgbGlzdGVuZXI6ICgodGhpczogSlNPTlNvY2tldCwgZXY6IE1lc3NhZ2VFdmVudDxhbnk+KSA9PiBhbnkpIHwgRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsXHJcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyxcclxuICAgICk6IHZvaWQ7XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgIHR5cGU6IHN0cmluZyxcclxuICAgICAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsXHJcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyxcclxuICAgICk6IHZvaWQ7XHJcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKFxyXG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxyXG4gICAgICAgIGxpc3RlbmVyOiAoKHRoaXM6IEpTT05Tb2NrZXQsIGV2OiBNZXNzYWdlRXZlbnQ8YW55PikgPT4gYW55KSB8IEV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxyXG4gICAgICAgIG9wdGlvbnM/OiBib29sZWFuIHwgRXZlbnRMaXN0ZW5lck9wdGlvbnMsXHJcbiAgICApOiB2b2lkO1xyXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICB0eXBlOiBzdHJpbmcsXHJcbiAgICAgICAgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxyXG4gICAgICAgIG9wdGlvbnM/OiBib29sZWFuIHwgRXZlbnRMaXN0ZW5lck9wdGlvbnMsXHJcbiAgICApOiB2b2lkO1xyXG59XHJcblxyXG4vKipcclxuICogQSB7QGxpbmsgU3RyZWFtfSB0aGF0IHNwZWFrcyBvYmplY3RzIGluc3RlYWQgb2YgYnl0ZXMuXHJcbiAqXHJcbiAqIGBzZW5kKHZhbHVlKWAgbWFyc2hhbHMgd2l0aCBgSlNPTi5zdHJpbmdpZnlgLCBhbmQgYGV2LmRhdGFgIGluIGFuIGBvbm1lc3NhZ2VgXHJcbiAqIGhhbmRsZXIgaXMgdGhlIHBhcnNlZCBvYmplY3QgcmF0aGVyIHRoYW4gYW4gYEFycmF5QnVmZmVyYC4gUGFpcnMgd2l0aFxyXG4gKiBgU3RyZWFtQ29ubi5TZW5kSlNPTmAgLyBgUmVjZWl2ZUpTT05gIG9uIHRoZSBHbyBzaWRlLlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiBjb25zdCBzID0gSlNPTlN0cmVhbShcInRlbGVtZXRyeVwiKTtcclxuICogcy5vbm1lc3NhZ2UgPSAoZXYpID0+IGNvbnNvbGUubG9nKGV2LmRhdGEudGVtcGVyYXR1cmUpO1xyXG4gKiBzLm9ub3BlbiAgICA9ICgpID0+IHMuc2VuZCh7IHN1YnNjcmliZTogXCJzZW5zb3JzXCIgfSk7XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBBIGZyYW1lIHRoYXQgaXMgbm90IHZhbGlkIEpTT04gcmFpc2VzIGFuIGBlcnJvcmAgZXZlbnQgYW5kIGlzIGRyb3BwZWQsIHJhdGhlclxyXG4gKiB0aGFuIHRocm93aW5nIGZyb20gdGhlIHBvbGwgbG9vcCBhbmQgdGFraW5nIHRoZSBjb25uZWN0aW9uIGRvd24gd2l0aCBpdC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBKU09OU3RyZWFtKG5hbWU6IHN0cmluZyk6IEpTT05Tb2NrZXQge1xyXG4gICAgY29uc3Qgc29ja2V0ID0gU3RyZWFtKG5hbWUpO1xyXG4gICAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xyXG4gICAgY29uc3QgcGFyc2UgPSAocGF5bG9hZDogQXJyYXlCdWZmZXIgfCBzdHJpbmcpID0+XHJcbiAgICAgICAgSlNPTi5wYXJzZSh0eXBlb2YgcGF5bG9hZCA9PT0gXCJzdHJpbmdcIiA/IHBheWxvYWQgOiBkZWNvZGVyLmRlY29kZShwYXlsb2FkKSk7XHJcblxyXG4gICAgaWYgKHNvY2tldCBpbnN0YW5jZW9mIFdhaWxzU29ja2V0KSB7XHJcbiAgICAgICAgLy8gRGVjb2RpbmcgdGhyb3VnaCB0aGUgaG9vayByYXRoZXIgdGhhbiBieSB3cmFwcGluZyBvbm1lc3NhZ2UgbWVhbnNcclxuICAgICAgICAvLyBhZGRFdmVudExpc3RlbmVyIGxpc3RlbmVycyBzZWUgdGhlIHBhcnNlZCBvYmplY3QgdG9vLlxyXG4gICAgICAgIHNvY2tldC5fZGVjb2RlID0gKHBheWxvYWQpID0+IHBhcnNlKHBheWxvYWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBTZXJ2ZXIgYnVpbGRzIGdldCBhIG5hdGl2ZSBXZWJTb2NrZXQsIHdob3NlIGRpc3BhdGNoIG5ldmVyIGNvbnN1bHRzXHJcbiAgICAgICAgLy8gX2RlY29kZS4gUGF0Y2ggYm90aCBsaXN0ZW5lciBzdHlsZXMgb24gdGhpcyBpbnN0YW5jZSBzbyBKU09OU3RyZWFtXHJcbiAgICAgICAgLy8gbWVhbnMgdGhlIHNhbWUgdGhpbmcgb24gZWl0aGVyIHRyYW5zcG9ydCwgd2hpY2ggaXMgdGhlIHBvaW50IG9mIHRoZVxyXG4gICAgICAgIC8vIHNoYXJlZCBBUEkuXHJcbiAgICAgICAgY29uc3QgbmF0aXZlID0gc29ja2V0IGFzIFdlYlNvY2tldDtcclxuICAgICAgICBuYXRpdmUuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuXHJcbiAgICAgICAgY29uc3Qgd3JhcHBlZCA9IG5ldyBXZWFrTWFwPG9iamVjdCwgRXZlbnRMaXN0ZW5lcj4oKTtcclxuICAgICAgICBjb25zdCBkZWNvZGVkRXZlbnRzID0gbmV3IFdlYWtNYXA8RXZlbnQsIE1lc3NhZ2VFdmVudCB8IG51bGw+KCk7XHJcbiAgICAgICAgY29uc3QgYWRkID0gbmF0aXZlLmFkZEV2ZW50TGlzdGVuZXIuYmluZChuYXRpdmUpO1xyXG4gICAgICAgIGNvbnN0IHJlbW92ZSA9IG5hdGl2ZS5yZW1vdmVFdmVudExpc3RlbmVyLmJpbmQobmF0aXZlKTtcclxuXHJcbiAgICAgICAgY29uc3QgZGVjb2RlRXZlbnQgPSAoZXY6IEV2ZW50KTogTWVzc2FnZUV2ZW50IHwgbnVsbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkZWNvZGVkRXZlbnRzLmhhcyhldikpIHJldHVybiBkZWNvZGVkRXZlbnRzLmdldChldikgPz8gbnVsbDtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2UoKGV2IGFzIE1lc3NhZ2VFdmVudCkuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZWNvZGVkID0gbmV3IE1lc3NhZ2VFdmVudChcIm1lc3NhZ2VcIiwgeyBkYXRhOiB2YWx1ZSB9KTtcclxuICAgICAgICAgICAgICAgIGRlY29kZWRFdmVudHMuc2V0KGV2LCBkZWNvZGVkKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVkO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIGRlY29kZWRFdmVudHMuc2V0KGV2LCBudWxsKTtcclxuICAgICAgICAgICAgICAgIG5hdGl2ZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImVycm9yXCIpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgZGVjb2RlID0gKGxpc3RlbmVyOiBhbnkpOiBFdmVudExpc3RlbmVyID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSB3cmFwcGVkLmdldChsaXN0ZW5lciBhcyBvYmplY3QpO1xyXG4gICAgICAgICAgICBpZiAoZXhpc3RpbmcpIHJldHVybiBleGlzdGluZztcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGZuOiBFdmVudExpc3RlbmVyID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZWNvZGVkID0gZGVjb2RlRXZlbnQoZXYpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFkZWNvZGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyID09PSBcImZ1bmN0aW9uXCIpIGxpc3RlbmVyLmNhbGwobmF0aXZlLCBkZWNvZGVkKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgbGlzdGVuZXIuaGFuZGxlRXZlbnQoZGVjb2RlZCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdyYXBwZWQuc2V0KGxpc3RlbmVyIGFzIG9iamVjdCwgZm4pO1xyXG4gICAgICAgICAgICByZXR1cm4gZm47XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbmF0aXZlLmFkZEV2ZW50TGlzdGVuZXIgPSAoKHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IGFueSwgb3B0cz86IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBhZGQodHlwZSwgdHlwZSA9PT0gXCJtZXNzYWdlXCIgJiYgbGlzdGVuZXIgPyBkZWNvZGUobGlzdGVuZXIpIDogbGlzdGVuZXIsIG9wdHMpO1xyXG4gICAgICAgIH0pIGFzIHR5cGVvZiBuYXRpdmUuYWRkRXZlbnRMaXN0ZW5lcjtcclxuXHJcbiAgICAgICAgbmF0aXZlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSAoKHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IGFueSwgb3B0cz86IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBmbiA9IHR5cGUgPT09IFwibWVzc2FnZVwiICYmIGxpc3RlbmVyID8gd3JhcHBlZC5nZXQobGlzdGVuZXIpIDogdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICByZW1vdmUodHlwZSwgZm4gPz8gbGlzdGVuZXIsIG9wdHMpO1xyXG4gICAgICAgIH0pIGFzIHR5cGVvZiBuYXRpdmUucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcclxuXHJcbiAgICAgICAgbGV0IGhhbmRsZXI6ICgoZXY6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobmF0aXZlLCBcIm9ubWVzc2FnZVwiLCB7XHJcbiAgICAgICAgICAgIGdldDogKCkgPT4gaGFuZGxlcixcclxuICAgICAgICAgICAgc2V0KGZuKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlcikgbmF0aXZlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGhhbmRsZXIgYXMgRXZlbnRMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gdHlwZW9mIGZuID09PSBcImZ1bmN0aW9uXCIgPyBmbiA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlcikgbmF0aXZlLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGhhbmRsZXIgYXMgRXZlbnRMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZW5kID0gc29ja2V0LnNlbmQuYmluZChzb2NrZXQpO1xyXG4gICAgKHNvY2tldCBhcyB1bmtub3duIGFzIEpTT05Tb2NrZXQpLnNlbmQgPSAodmFsdWU6IHVua25vd24pID0+IHNlbmQoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcclxuXHJcbiAgICByZXR1cm4gc29ja2V0IGFzIHVua25vd24gYXMgSlNPTlNvY2tldDtcclxufVxyXG5cclxuLy8gU3luY2hyb25vdXMgY29udmVyc2lvbiBmb3IgZXZlcnl0aGluZyBidXQgYSBCbG9iLiBBdm9pZHMgYSBwcm9taXNlIHBlciBzZW5kXHJcbi8vIGFuZCwgbW9yZSBpbXBvcnRhbnRseSwgbGV0cyBidWZmZXJlZEFtb3VudCBiZSBleGFjdCB0aGUgbW9tZW50IHNlbmQoKSByZXR1cm5zLlxyXG5mdW5jdGlvbiB0b0J5dGVzU3luYyhkYXRhOiBzdHJpbmcgfCBBcnJheUJ1ZmZlckxpa2UgfCBBcnJheUJ1ZmZlclZpZXcgfCBCbG9iKTogVWludDhBcnJheSB8IG51bGwge1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRleHRFbmNvZGVyLmVuY29kZShkYXRhKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgQmxvYiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgQmxvYikge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpLnNsaWNlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YSBhcyBBcnJheUJ1ZmZlckxpa2UpLnNsaWNlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFib3J0YWJsZTxUPihwcm9taXNlOiBQcm9taXNlPFQ+LCBzaWduYWw/OiBBYm9ydFNpZ25hbCk6IFByb21pc2U8VD4ge1xyXG4gICAgaWYgKCFzaWduYWwpIHJldHVybiBwcm9taXNlO1xyXG4gICAgaWYgKHNpZ25hbC5hYm9ydGVkKSByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFN0cmVhbVJlcXVlc3RDYW5jZWxsZWQoKSk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBjb25zdCBvbkFib3J0ID0gKCkgPT4gcmVqZWN0KG5ldyBTdHJlYW1SZXF1ZXN0Q2FuY2VsbGVkKCkpO1xyXG4gICAgICAgIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCwgeyBvbmNlOiB0cnVlIH0pO1xyXG4gICAgICAgIHByb21pc2UudGhlbihcclxuICAgICAgICAgICAgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIG9uQWJvcnQpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCk7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICApO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHRvQnl0ZXMoXHJcbiAgICBkYXRhOiBzdHJpbmcgfCBBcnJheUJ1ZmZlckxpa2UgfCBBcnJheUJ1ZmZlclZpZXcgfCBCbG9iLFxyXG4gICAgc2lnbmFsPzogQWJvcnRTaWduYWwsXHJcbik6IFByb21pc2U8VWludDhBcnJheT4ge1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRleHRFbmNvZGVyLmVuY29kZShkYXRhKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgQmxvYiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgQmxvYikge1xyXG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCBhYm9ydGFibGUoZGF0YS5hcnJheUJ1ZmZlcigpLCBzaWduYWwpKTtcclxuICAgIH1cclxuICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKS5zbGljZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGRhdGEgYXMgQXJyYXlCdWZmZXJMaWtlKS5zbGljZSgpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBwb3N0RnJhbWUoY29ubklEOiBudW1iZXIsIGtpbmQ6IG51bWJlciwgYm9keTogVWludDhBcnJheSwgbmFtZT86IHN0cmluZywgc2lnbmFsPzogQWJvcnRTaWduYWwpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgW0hEUl9TRVNTSU9OXTogRy5zZXNzaW9uLFxyXG4gICAgICAgIFtIRFJfR0VORVJBVElPTl06IFN0cmluZyhHLmdlbmVyYXRpb24pLFxyXG4gICAgICAgIFtIRFJfQ09OTl06IFN0cmluZyhjb25uSUQpLFxyXG4gICAgICAgIFtIRFJfS0lORF06IFN0cmluZyhraW5kKSxcclxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxyXG4gICAgfTtcclxuICAgIGlmIChuYW1lICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBoZWFkZXJzW0hEUl9OQU1FXSA9IG5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJvZHkuYnl0ZUxlbmd0aCA8PSBDSFVOS19USFJFU0hPTEQpIHtcclxuICAgICAgICBhd2FpdCBwb3N0V2l0aFJldHJ5KGhlYWRlcnMsIGJvZHksIHNpZ25hbCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNwbGl0IG92ZXJzaXplZCBmcmFtZXMgdGhlIHNhbWUgd2F5IHRoZSBydW50aW1lIHNwbGl0cyBvdmVyc2l6ZWQgY2FsbHMuXHJcbiAgICBjb25zdCBjaHVua0lEID0gbmFub2lkKCk7XHJcbiAgICBjb25zdCB0b3RhbCA9IE1hdGguY2VpbChib2R5LmJ5dGVMZW5ndGggLyBDSFVOS19USFJFU0hPTEQpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3RhbDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgc2xpY2UgPSBib2R5LnN1YmFycmF5KGkgKiBDSFVOS19USFJFU0hPTEQsIChpICsgMSkgKiBDSFVOS19USFJFU0hPTEQpO1xyXG4gICAgICAgIGF3YWl0IHBvc3RXaXRoUmV0cnkoe1xyXG4gICAgICAgICAgICAuLi5oZWFkZXJzLFxyXG4gICAgICAgICAgICBbSERSX0NIVU5LXTogY2h1bmtJRCxcclxuICAgICAgICAgICAgW0hEUl9DSFVOS19JTkRFWF06IFN0cmluZyhpKSxcclxuICAgICAgICAgICAgW0hEUl9DSFVOS19UT1RBTF06IFN0cmluZyh0b3RhbCksXHJcbiAgICAgICAgfSwgc2xpY2UsIHNpZ25hbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIEEgNDI5IG1lYW5zIHRoZSBHbyBoYW5kbGVyIGhhcyBub3QgdGFrZW4gZGVsaXZlcnkgb2Ygd2hhdCBpcyBhbHJlYWR5IHF1ZXVlZC5cclxuLy8gUmV0cnlpbmcgdGhlIHNhbWUgZnJhbWUga2VlcHMgb3JkZXJpbmcgKHRoZSBzZW5kIGNoYWluIGhhcyBub3QgbW92ZWQgb24pIGFuZFxyXG4vLyBsZWF2ZXMgdGhlIHJlcXVlc3Qgc2xvdCBmcmVlLCB3aGljaCBpcyB3aGF0IHN0b3BzIGEgYmFja2VkLXVwIGNvbm5lY3Rpb24gZnJvbVxyXG4vLyBzdGFydmluZyB0aGUgd2luZG93J3MgcG9sbC5cclxuYXN5bmMgZnVuY3Rpb24gcG9zdFdpdGhSZXRyeShoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LCBib2R5OiBVaW50OEFycmF5LCBzaWduYWw/OiBBYm9ydFNpZ25hbCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgLy8gTmV2ZXIgcmV0cnkgd2l0aCB6ZXJvIGRlbGF5LiBUaGUgcmVjZWl2ZXIgYmVpbmcgYmVoaW5kIGlzIGEgY29uZGl0aW9uXHJcbiAgICAvLyB0aGF0IHRha2VzIHRpbWUgdG8gY2xlYXIsIGFuZCBhbiBpbW1lZGlhdGUgcmV0cnkgaXMgYSBidXN5IGxvb3Agb2ZcclxuICAgIC8vIGZldGNoZXMg4oCUIGVhY2ggb25lIGEgc2NoZW1lLWhhbmRsZXIgcm91bmQgdHJpcCwgYW5kIG9uIHRoZSBob3N0IGEgY2dvXHJcbiAgICAvLyBjYWxsLiBTdGFydCBhdCAxIG1zIGFuZCByYW1wLlxyXG4gICAgbGV0IHdhaXQgPSAxO1xyXG4gICAgZm9yICg7Oykge1xyXG4gICAgICAgIGlmIChzaWduYWw/LmFib3J0ZWQpIHRocm93IG5ldyBTdHJlYW1SZXF1ZXN0Q2FuY2VsbGVkKCk7XHJcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKHN0cmVhbVVSTChcInNlbmRcIiksIHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgaGVhZGVycyxcclxuICAgICAgICAgICAgYm9keTogYm9keSBhcyBCb2R5SW5pdCxcclxuICAgICAgICAgICAgc2lnbmFsLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChyZXNwLm9rKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHJlc3Auc3RhdHVzICE9PSA0MjkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGF3YWl0IHJlc3AudGV4dCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgc2xlZXAod2FpdCwgc2lnbmFsKTtcclxuICAgICAgICB3YWl0ID0gTWF0aC5taW4od2FpdCAqIDIsIDUwKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gcG9zdEJhdGNoIHNlbmRzIHNldmVyYWwgZGF0YSBmcmFtZXMgZm9yIG9uZSBjb25uZWN0aW9uIGluIGJvdW5kZWQgcmVxdWVzdHMuXHJcbi8vIEJvZHk6IGNvdW50IHUzMiwgdGhlbiBjb3VudCB4ICggbGVuIHUzMiB8IHBheWxvYWQgKS4gVGhlIGNvbWJpbmVkIGJvZHkgc3RheXNcclxuLy8gd2l0aGluIENIVU5LX1RIUkVTSE9MRDogc2V2ZXJhbCBpbmRpdmlkdWFsbHkgc21hbGwgZnJhbWVzIG11c3Qgbm90IHJlY3JlYXRlXHJcbi8vIHRoZSBXZWJWaWV3MiBib2R5LXNpemUgcHJvYmxlbSB0aGF0IGNodW5raW5nIHNpbmdsZSBsYXJnZSBmcmFtZXMgYXZvaWRzLlxyXG5hc3luYyBmdW5jdGlvbiBwb3N0QmF0Y2goY29ubklEOiBudW1iZXIsIGZyYW1lczogVWludDhBcnJheVtdLCBzaWduYWw/OiBBYm9ydFNpZ25hbCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgIHdoaWxlIChzdGFydCA8IGZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgICBpZiAoZnJhbWVzW3N0YXJ0XS5ieXRlTGVuZ3RoID4gQ0hVTktfVEhSRVNIT0xEKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHBvc3RGcmFtZShjb25uSUQsIEtJTkRfREFUQSwgZnJhbWVzW3N0YXJ0XSwgdW5kZWZpbmVkLCBzaWduYWwpO1xyXG4gICAgICAgICAgICBzdGFydCsrO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBlbmQgPSBzdGFydDtcclxuICAgICAgICBsZXQgc2l6ZSA9IDQ7IC8vIGZyYW1lIGNvdW50XHJcbiAgICAgICAgd2hpbGUgKGVuZCA8IGZyYW1lcy5sZW5ndGggJiYgZW5kIC0gc3RhcnQgPCBNQVhfQkFUQ0hfRlJBTUVTKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gZnJhbWVzW2VuZF07XHJcbiAgICAgICAgICAgIGlmIChmcmFtZS5ieXRlTGVuZ3RoID4gQ0hVTktfVEhSRVNIT0xEIHx8IHNpemUgKyA0ICsgZnJhbWUuYnl0ZUxlbmd0aCA+IENIVU5LX1RIUkVTSE9MRCkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2l6ZSArPSA0ICsgZnJhbWUuYnl0ZUxlbmd0aDtcclxuICAgICAgICAgICAgZW5kKys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBIG5lYXItdGhyZXNob2xkIGZyYW1lIGZpdHMgYXMgYSBub3JtYWwgUE9TVCBib2R5IGJ1dCBub3QgaW5zaWRlIGFcclxuICAgICAgICAvLyBiYXRjaCBvbmNlIGl0cyBjb3VudCBhbmQgbGVuZ3RoIGhlYWRlcnMgYXJlIGluY2x1ZGVkLlxyXG4gICAgICAgIGlmIChlbmQgPT09IHN0YXJ0KSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHBvc3RGcmFtZShjb25uSUQsIEtJTkRfREFUQSwgZnJhbWVzW3N0YXJ0XSwgdW5kZWZpbmVkLCBzaWduYWwpO1xyXG4gICAgICAgICAgICBzdGFydCsrO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGdyb3VwID0gZnJhbWVzLnNsaWNlKHN0YXJ0LCBlbmQpO1xyXG4gICAgICAgIGlmIChncm91cC5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgYXdhaXQgcG9zdEZyYW1lKGNvbm5JRCwgS0lORF9EQVRBLCBncm91cFswXSwgdW5kZWZpbmVkLCBzaWduYWwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHBvc3RCYXRjaEdyb3VwKGNvbm5JRCwgZ3JvdXAsIHNpZ25hbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXJ0ID0gZW5kO1xyXG4gICAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBwb3N0QmF0Y2hHcm91cChjb25uSUQ6IG51bWJlciwgZnJhbWVzOiBVaW50OEFycmF5W10sIHNpZ25hbD86IEFib3J0U2lnbmFsKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoZnJhbWVzLmxlbmd0aCA9PT0gMCB8fCBmcmFtZXMubGVuZ3RoID4gTUFYX0JBVENIX0ZSQU1FUykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgc3RyZWFtIGJhdGNoIHNpemVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGJvZHkgPSBidWlsZEJhdGNoKGZyYW1lcyk7XHJcbiAgICBsZXQgc2VudCA9IDA7XHJcbiAgICBsZXQgd2FpdCA9IDE7XHJcbiAgICBmb3IgKDs7KSB7XHJcbiAgICAgICAgaWYgKHNpZ25hbD8uYWJvcnRlZCkgdGhyb3cgbmV3IFN0cmVhbVJlcXVlc3RDYW5jZWxsZWQoKTtcclxuICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goc3RyZWFtVVJMKFwic2VuZFwiKSwge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICBbSERSX1NFU1NJT05dOiBHLnNlc3Npb24sXHJcbiAgICAgICAgICAgICAgICBbSERSX0dFTkVSQVRJT05dOiBTdHJpbmcoRy5nZW5lcmF0aW9uKSxcclxuICAgICAgICAgICAgICAgIFtIRFJfQ09OTl06IFN0cmluZyhjb25uSUQpLFxyXG4gICAgICAgICAgICAgICAgW0hEUl9LSU5EXTogU3RyaW5nKEtJTkRfREFUQSksXHJcbiAgICAgICAgICAgICAgICBbSERSX0JBVENIXTogU3RyaW5nKGZyYW1lcy5sZW5ndGggLSBzZW50KSxcclxuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IGJvZHkgYXMgQm9keUluaXQsXHJcbiAgICAgICAgICAgIHNpZ25hbCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAocmVzcC5vaykgcmV0dXJuO1xyXG4gICAgICAgIGlmIChyZXNwLnN0YXR1cyAhPT0gNDI5KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihhd2FpdCByZXNwLnRleHQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFRoZSByZWNlaXZlciB0b29rIGEgcHJlZml4IG9mIHRoZSBiYXRjaC4gUmVzZW5kIG9ubHkgd2hhdCBpcyBsZWZ0LFxyXG4gICAgICAgIC8vIHdoaWNoIGtlZXBzIG9yZGVyaW5nIHdpdGhvdXQgcmUtZGVsaXZlcmluZyBhbnl0aGluZy5cclxuICAgICAgICBjb25zdCBhY2NlcHRlZCA9IE51bWJlcihyZXNwLmhlYWRlcnMuZ2V0KEhEUl9CQVRDSCkgPz8gMCk7XHJcbiAgICAgICAgY29uc3QgcmVtYWluaW5nID0gZnJhbWVzLmxlbmd0aCAtIHNlbnQ7XHJcbiAgICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGFjY2VwdGVkKSB8fCBhY2NlcHRlZCA8IDAgfHwgYWNjZXB0ZWQgPj0gcmVtYWluaW5nKSB7XHJcbiAgICAgICAgICAgIC8vIFplcm8gaXMgdmFsaWQgKG5vIHByb2dyZXNzKSwgYnV0IGFuIG91dC1vZi1yYW5nZSBhY2tub3dsZWRnZW1lbnRcclxuICAgICAgICAgICAgLy8gaXMgYSBwcm90b2NvbCBlcnJvci4gS2VlcCB6ZXJvIG9uIHRoZSByZXRyeSBwYXRoIGJlbG93LlxyXG4gICAgICAgICAgICBpZiAoYWNjZXB0ZWQgIT09IDApIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgc3RyZWFtIGJhdGNoIGFja25vd2xlZGdlbWVudFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VudCArPSBhY2NlcHRlZDtcclxuICAgICAgICBib2R5ID0gYnVpbGRCYXRjaChmcmFtZXMuc2xpY2Uoc2VudCkpO1xyXG4gICAgICAgIGF3YWl0IHNsZWVwKHdhaXQsIHNpZ25hbCk7XHJcbiAgICAgICAgd2FpdCA9IE1hdGgubWluKHdhaXQgKiAyLCA1MCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJ1aWxkQmF0Y2goZnJhbWVzOiBVaW50OEFycmF5W10pOiBVaW50OEFycmF5IHtcclxuICAgIGxldCBzaXplID0gNDtcclxuICAgIGZvciAoY29uc3QgZiBvZiBmcmFtZXMpIHNpemUgKz0gNCArIGYuYnl0ZUxlbmd0aDtcclxuICAgIGNvbnN0IG91dCA9IG5ldyBVaW50OEFycmF5KHNpemUpO1xyXG4gICAgY29uc3QgdmlldyA9IG5ldyBEYXRhVmlldyhvdXQuYnVmZmVyKTtcclxuICAgIHZpZXcuc2V0VWludDMyKDAsIGZyYW1lcy5sZW5ndGgpO1xyXG4gICAgbGV0IG9mZiA9IDQ7XHJcbiAgICBmb3IgKGNvbnN0IGYgb2YgZnJhbWVzKSB7XHJcbiAgICAgICAgdmlldy5zZXRVaW50MzIob2ZmLCBmLmJ5dGVMZW5ndGgpO1xyXG4gICAgICAgIG9mZiArPSA0O1xyXG4gICAgICAgIG91dC5zZXQoZiwgb2ZmKTtcclxuICAgICAgICBvZmYgKz0gZi5ieXRlTGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnRQb2xsaW5nKCk6IHZvaWQge1xyXG4gICAgaWYgKEcucG9sbGluZyB8fCAhaGFzRE9NKSByZXR1cm47XHJcbiAgICBHLnBvbGxpbmcgPSB0cnVlO1xyXG4gICAgdm9pZCBwb2xsTG9vcCgpO1xyXG59XHJcblxyXG4vKipcclxuICogT25lIHBvbGwgZm9yIHRoZSB3aG9sZSBwYWdlLCBzaGFyZWQgYnkgZXZlcnkgY29ubmVjdGlvbi5cclxuICpcclxuICogVGhlcmUgaXMgbm8gcG9sbGluZyBpbnRlcnZhbCBhbmQgbm90aGluZyBhZGFwdGl2ZSBoZXJlIG9uIHB1cnBvc2UuIFRoZSBzZXJ2ZXJcclxuICogaG9sZHMgdGhlIHJlcXVlc3QgdW50aWwgYSBmcmFtZSBleGlzdHMsIHNvIGRlbGl2ZXJ5IGxhdGVuY3kgaXMgYWxyZWFkeSB+MCBhbmRcclxuICogYSBjbGllbnQtc2lkZSBpbnRlcnZhbCBjb3VsZCBvbmx5IGFkZCB0byBpdC4gRnJhbWVzIHRoYXQgYXJyaXZlIHdoaWxlIGFcclxuICogcmVzcG9uc2UgaXMgaW4gZmxpZ2h0IHNpbXBseSBhY2N1bXVsYXRlIGFuZCByaWRlIHRoZSBuZXh0IG9uZSwgd2hpY2ggbWFrZXNcclxuICogdGhlIHJvdW5kIHRyaXAgaXRzZWxmIHRoZSBiYXRjaGluZyB3aW5kb3cg4oCUIGl0IHdpZGVucyBhcyBsb2FkIHJpc2VzIHdpdGhvdXRcclxuICogYW55dGhpbmcgaGF2aW5nIHRvIG1lYXN1cmUgaXQuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBwb2xsTG9vcCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGxldCBiYWNrb2ZmID0gMDtcclxuICAgIGNvbnN0IGFib3J0ID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG4gICAgRy5wb2xsQWJvcnQgPSBhYm9ydDtcclxuXHJcbiAgICB3aGlsZSAoRy5jb25uZWN0aW9ucy5zaXplID4gMCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChzdHJlYW1VUkwoXCJwb2xsXCIpLCB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgW0hEUl9TRVNTSU9OXTogRy5zZXNzaW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIFtIRFJfR0VORVJBVElPTl06IFN0cmluZyhHLmdlbmVyYXRpb24pLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNhY2hlOiBcIm5vLXN0b3JlXCIsXHJcbiAgICAgICAgICAgICAgICBzaWduYWw6IGFib3J0LnNpZ25hbCxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT09IDQxMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIHNlc3Npb24gaXMgZ29uZTogYXBwIHNodXR0aW5nIGRvd24sIHdpbmRvdyBjbG9zZWQsIG9yIHdlXHJcbiAgICAgICAgICAgICAgICAvLyB3ZXJlIHJlYXBlZCBhcyB1bnJlYWNoYWJsZS4gTm90aGluZyB0byByZXRyeS5cclxuICAgICAgICAgICAgICAgIGNsb3NlQWxsKDEwMDEsIFwic2Vzc2lvbiBjbG9zZWRcIik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXJlc3Aub2sgJiYgcmVzcC5zdGF0dXMgIT09IDIwNCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc1JldHJ5YWJsZVBvbGxTdGF0dXMocmVzcC5zdGF0dXMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFpbEFsbChcInN0cmVhbSBwb2xsIGZhaWxlZDogXCIgKyByZXNwLnN0YXR1cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXRyeWFibGUgc3RyZWFtIHBvbGwgZmFpbHVyZTogXCIgKyByZXNwLnN0YXR1cyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGJhY2tvZmYgPSAwO1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgIT09IDIwNCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJ1ZjogQXJyYXlCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZiA9IGF3YWl0IHJlc3AuYXJyYXlCdWZmZXIoKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBHbyBxdWV1ZSB3YXMgY29uc3VtZWQgd2hlbiB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdhcyBwcm9kdWNlZC4gUmV0cnlpbmcgY2Fubm90IHJlY292ZXIgYSBib2R5IHRoYXQgd2FzXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaW50ZXJydXB0ZWQgYWZ0ZXIgdGhhdCBwb2ludCwgc28gc3VyZmFjZSB0aGUgbG9zcyBhbmRcclxuICAgICAgICAgICAgICAgICAgICAvLyBzdG9wIGluc3RlYWQgb2Ygc2lsZW50bHkgY29udGludWluZyB3aXRoIG1pc3NpbmcgZnJhbWVzLlxyXG4gICAgICAgICAgICAgICAgICAgIGZhaWxBbGwoXCJzdHJlYW0gcG9sbCByZXNwb25zZSBib2R5IGZhaWxlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGZyYW1lcyA9IGRlY29kZUZyYW1lcyhidWYpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZyYW1lcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEEgZnJhbWluZyBtaXNtYXRjaCBtZWFucyBhIHN0YWxlIGNhY2hlZCBydW50aW1lIGFnYWluc3QgYVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5ld2VyIEdvIHNpZGUuIFJldHJ5aW5nIGNhbm5vdCBmaXggdGhhdCwgYW5kIGxldHRpbmcgaXRcclxuICAgICAgICAgICAgICAgICAgICAvLyBmYWxsIGludG8gdGhlIGJhY2tvZmYgYmVsb3cgd291bGQgc3BpbiBzaWxlbnRseSBmb3JldmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvIGZhaWwgZXZlcnkgY29ubmVjdGlvbiB3aXRoIGEgcmVhc29uIGluc3RlYWQuXHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VBbGwoMTAwMiwgXCJ1bnJlY29nbmlzZWQgc3RyZWFtIGZyYW1pbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWxpdmVyKGZyYW1lcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUmUtcG9sbCBpbW1lZGlhdGVseSwgb24gZGF0YSBhbmQgb24gYW4gZXhwaXJlZCBob2xkIGFsaWtlLlxyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBpZiAoYWJvcnQuc2lnbmFsLmFib3J0ZWQgfHwgRy5jb25uZWN0aW9ucy5zaXplID09PSAwKSBicmVhaztcclxuICAgICAgICAgICAgYmFja29mZiA9IGJhY2tvZmYgPyBNYXRoLm1pbihiYWNrb2ZmICogMiwgQkFDS09GRl9NQVgpIDogQkFDS09GRl9NSU47XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcChiYWNrb2ZmLCBhYm9ydC5zaWduYWwpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChHLnBvbGxBYm9ydCA9PT0gYWJvcnQpIEcucG9sbEFib3J0ID0gdW5kZWZpbmVkO1xyXG4gICAgRy5wb2xsaW5nID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQSBjb25uZWN0aW9uIG9wZW5lZCB3aGlsZSB3ZSB3ZXJlIHdpbmRpbmcgZG93bjogcGljayB0aGUgbG9vcCBiYWNrIHVwLlxyXG4gICAgaWYgKEcuY29ubmVjdGlvbnMuc2l6ZSA+IDApIHtcclxuICAgICAgICBzdGFydFBvbGxpbmcoKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaXNSZXRyeWFibGVQb2xsU3RhdHVzKHN0YXR1czogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gc3RhdHVzID09PSA0MDggfHwgc3RhdHVzID09PSA0MjUgfHwgc3RhdHVzID09PSA0MjkgfHwgKHN0YXR1cyA+PSA1MDAgJiYgc3RhdHVzIDw9IDU5OSk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBJbkZyYW1lIHtcclxuICAgIGNvbm5JRDogbnVtYmVyO1xyXG4gICAga2luZDogbnVtYmVyO1xyXG4gICAgcGF5bG9hZDogQXJyYXlCdWZmZXI7XHJcbn1cclxuXHJcbi8vIFZhbGlkYXRlIHRoZSBjb21wbGV0ZSByZXNwb25zZSBiZWZvcmUgZGlzcGF0Y2hpbmcgYW55IHBhcnQgb2YgaXQuIEEgc2hvcnRcclxuLy8gcGxhdGZvcm0gcmVzcG9uc2UgbXVzdCBub3QgZGVsaXZlciBhIHZhbGlkIHByZWZpeCBhbmQgdGhlbiB0aHJvdyBSYW5nZUVycm9yOlxyXG4vLyB0aGUgR28gcXVldWUgaGFzIGFscmVhZHkgYmVlbiBkcmFpbmVkLCBzbyByZXRyeWluZyBjYW5ub3QgcmVjb3ZlciB0aG9zZVxyXG4vLyBmcmFtZXMuIFRyZWF0IHRoZSB3aG9sZSByZXNwb25zZSBhcyBhIHByb3RvY29sIGVycm9yIGluc3RlYWQuXHJcbmZ1bmN0aW9uIGRlY29kZUZyYW1lcyhidWY6IEFycmF5QnVmZmVyKTogSW5GcmFtZVtdIHwgbnVsbCB7XHJcbiAgICBpZiAoYnVmLmJ5dGVMZW5ndGggPCA5KSByZXR1cm4gbnVsbDtcclxuICAgIGNvbnN0IGR2ID0gbmV3IERhdGFWaWV3KGJ1Zik7XHJcbiAgICBpZiAoZHYuZ2V0VWludDgoMCkgIT09IDB4NTcgfHwgZHYuZ2V0VWludDgoMSkgIT09IDB4NTMgfHxcclxuICAgICAgICBkdi5nZXRVaW50OCgyKSAhPT0gMHgzMSB8fCBkdi5nZXRVaW50OCgzKSAhPT0gMHgwMCB8fFxyXG4gICAgICAgIChkdi5nZXRVaW50OCg0KSAmIH4xKSAhPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvdW50ID0gZHYuZ2V0VWludDMyKDUpO1xyXG4gICAgY29uc3QgZnJhbWVzOiBJbkZyYW1lW10gPSBbXTtcclxuICAgIGxldCBvZmYgPSA5O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgIGlmIChvZmYgKyA5ID4gYnVmLmJ5dGVMZW5ndGgpIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNvbnN0IGNvbm5JRCA9IGR2LmdldFVpbnQzMihvZmYpOyBvZmYgKz0gNDtcclxuICAgICAgICBjb25zdCBraW5kID0gZHYuZ2V0VWludDgob2ZmKTsgb2ZmICs9IDE7XHJcbiAgICAgICAgY29uc3QgbGVuID0gZHYuZ2V0VWludDMyKG9mZik7IG9mZiArPSA0O1xyXG4gICAgICAgIGlmIChraW5kID4gS0lORF9FUlJPUiB8fCBsZW4gPiBidWYuYnl0ZUxlbmd0aCAtIG9mZikgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGJ1Zi5zbGljZShvZmYsIG9mZiArIGxlbik7IG9mZiArPSBsZW47XHJcbiAgICAgICAgZnJhbWVzLnB1c2goeyBjb25uSUQsIGtpbmQsIHBheWxvYWQgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9mZiA9PT0gYnVmLmJ5dGVMZW5ndGggPyBmcmFtZXMgOiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkZWxpdmVyKGZyYW1lczogSW5GcmFtZVtdKTogdm9pZCB7XHJcbiAgICBmb3IgKGNvbnN0IGZyYW1lIG9mIGZyYW1lcykge1xyXG4gICAgICAgIGNvbnN0IGNvbm5JRCA9IGZyYW1lLmNvbm5JRDtcclxuICAgICAgICBjb25zdCBraW5kID0gZnJhbWUua2luZDtcclxuICAgICAgICBjb25zdCBwYXlsb2FkID0gZnJhbWUucGF5bG9hZDtcclxuICAgICAgICBjb25zdCBjb25uID0gRy5jb25uZWN0aW9ucy5nZXQoY29ubklEKTtcclxuICAgICAgICBpZiAoIWNvbm4pIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKGtpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBLSU5EX0RBVEE6XHJcbiAgICAgICAgICAgICAgICBjb25uLl9tZXNzYWdlKHBheWxvYWQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS0lORF9PUEVOOlxyXG4gICAgICAgICAgICAgICAgY29ubi5fb3BlbmVkKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLSU5EX0NMT1NFOlxyXG4gICAgICAgICAgICAgICAgY29ubi5fY2xvc2VkKDEwMDAsIFwiXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS0lORF9FUlJPUjpcclxuICAgICAgICAgICAgICAgIGNvbm4uX2ZhaWwobmV3IEVycm9yKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwYXlsb2FkKSkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjbG9zZUFsbChjb2RlOiBudW1iZXIsIHJlYXNvbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBmb3IgKGNvbnN0IGNvbm4gb2YgWy4uLkcuY29ubmVjdGlvbnMudmFsdWVzKCldKSB7XHJcbiAgICAgICAgY29ubi5fY2xvc2VkKGNvZGUsIHJlYXNvbiwgZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBmYWlsQWxsKHJlYXNvbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBmb3IgKGNvbnN0IGNvbm4gb2YgWy4uLkcuY29ubmVjdGlvbnMudmFsdWVzKCldKSB7XHJcbiAgICAgICAgY29ubi5fZmFpbChuZXcgRXJyb3IocmVhc29uKSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuaW1wb3J0ICogYXMgUnVudGltZSBmcm9tIFwiLi4vQHdhaWxzaW8vcnVudGltZS9zcmNcIjtcclxuXHJcbmltcG9ydCB7IEVuYWJsZSBhcyBFbmFibGVXTUwgfSBmcm9tIFwiLi4vQHdhaWxzaW8vcnVudGltZS9zcmMvd21sXCI7XHJcbmltcG9ydCB7IGRlYnVnTG9nIH0gZnJvbSBcIi4uL0B3YWlsc2lvL3J1bnRpbWUvc3JjL3V0aWxzXCI7XHJcblxyXG53aW5kb3cud2FpbHMgPSBSdW50aW1lO1xyXG5FbmFibGVXTUwoKTtcclxuXHJcbmlmIChERUJVRykge1xyXG4gICAgZGVidWdMb2coXCJXYWlscyBSdW50aW1lIExvYWRlZFwiKVxyXG59XHJcbiIsIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbi8vIFNldHVwXHJcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XHJcblxyXG5pZiAoaGFzRE9NKSB7XHJcbiAgICB3aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcclxufVxyXG5cclxuaW1wb3J0IFwiLi9jb250ZXh0bWVudS5qc1wiO1xyXG5pbXBvcnQgXCIuL2RyYWcuanNcIjtcclxuaW1wb3J0IFwiLi9hcHByZWdpb24uanNcIjtcclxuXHJcbi8vIFJlLWV4cG9ydCBwdWJsaWMgQVBJXHJcbmltcG9ydCAqIGFzIEFwcGxpY2F0aW9uIGZyb20gXCIuL2FwcGxpY2F0aW9uLmpzXCI7XHJcbmltcG9ydCAqIGFzIEJyb3dzZXIgZnJvbSBcIi4vYnJvd3Nlci5qc1wiO1xyXG5pbXBvcnQgKiBhcyBDYWxsIGZyb20gXCIuL2NhbGxzLmpzXCI7XHJcbmltcG9ydCAqIGFzIENsaXBib2FyZCBmcm9tIFwiLi9jbGlwYm9hcmQuanNcIjtcclxuaW1wb3J0ICogYXMgQ3JlYXRlIGZyb20gXCIuL2NyZWF0ZS5qc1wiO1xyXG5pbXBvcnQgKiBhcyBEaWFsb2dzIGZyb20gXCIuL2RpYWxvZ3MuanNcIjtcclxuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gXCIuL2V2ZW50cy5qc1wiO1xyXG5pbXBvcnQgKiBhcyBGbGFncyBmcm9tIFwiLi9mbGFncy5qc1wiO1xyXG5pbXBvcnQgKiBhcyBTY3JlZW5zIGZyb20gXCIuL3NjcmVlbnMuanNcIjtcclxuaW1wb3J0ICogYXMgU3lzdGVtIGZyb20gXCIuL3N5c3RlbS5qc1wiO1xyXG5pbXBvcnQgKiBhcyBJT1MgZnJvbSBcIi4vaW9zLmpzXCI7XHJcbmltcG9ydCAqIGFzIEFuZHJvaWQgZnJvbSBcIi4vYW5kcm9pZC5qc1wiO1xyXG5pbXBvcnQgKiBhcyBVcGRhdGVyIGZyb20gXCIuL3VwZGF0ZXIuanNcIjtcclxuaW1wb3J0IFdpbmRvdywgeyBoYW5kbGVEcmFnRW50ZXIsIGhhbmRsZURyYWdMZWF2ZSwgaGFuZGxlRHJhZ092ZXIgfSBmcm9tIFwiLi93aW5kb3cuanNcIjtcclxuaW1wb3J0ICogYXMgV01MIGZyb20gXCIuL3dtbC5qc1wiO1xyXG5pbXBvcnQgeyBTdHJlYW0sIEpTT05TdHJlYW0sIFdhaWxzU29ja2V0LCB0eXBlIEpTT05Tb2NrZXQgfSBmcm9tIFwiLi9zdHJlYW0uanNcIjtcclxuXHJcbmV4cG9ydCB7XHJcbiAgICBBcHBsaWNhdGlvbixcclxuICAgIEJyb3dzZXIsXHJcbiAgICBDYWxsLFxyXG4gICAgQ2xpcGJvYXJkLFxyXG4gICAgRGlhbG9ncyxcclxuICAgIEV2ZW50cyxcclxuICAgIEZsYWdzLFxyXG4gICAgU2NyZWVucyxcclxuICAgIFN5c3RlbSxcclxuICAgIElPUyxcclxuICAgIEFuZHJvaWQsXHJcbiAgICBVcGRhdGVyLFxyXG4gICAgV2luZG93LFxyXG4gICAgV01MLFxyXG4gICAgU3RyZWFtLFxyXG4gICAgSlNPTlN0cmVhbSxcclxuICAgIFdhaWxzU29ja2V0LFxyXG4gICAgdHlwZSBKU09OU29ja2V0XHJcbn07XHJcblxyXG4vKipcclxuICogQW4gaW50ZXJuYWwgdXRpbGl0eSBjb25zdW1lZCBieSB0aGUgYmluZGluZyBnZW5lcmF0b3IuXHJcbiAqXHJcbiAqIEBpZ25vcmVcclxuICovXHJcbmV4cG9ydCB7IENyZWF0ZSB9O1xyXG5cclxuZXhwb3J0ICogZnJvbSBcIi4vY2FuY2VsbGFibGUuanNcIjtcclxuXHJcbi8vIEV4cG9ydCB0cmFuc3BvcnQgaW50ZXJmYWNlcyBhbmQgdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICBzZXRUcmFuc3BvcnQsXHJcbiAgICBnZXRUcmFuc3BvcnQsXHJcbiAgICB0eXBlIFJ1bnRpbWVUcmFuc3BvcnQsXHJcbiAgICBvYmplY3ROYW1lcyxcclxuICAgIGNsaWVudElkLFxyXG59IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuXHJcbmltcG9ydCB7IGNsaWVudElkIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xyXG5cclxuLy8gTm90aWZ5IGJhY2tlbmRcclxuaWYgKGhhc0RPTSkge1xyXG4gICAgd2luZG93Ll93YWlscy5pbnZva2UgPSBTeXN0ZW0uaW52b2tlO1xyXG4gICAgd2luZG93Ll93YWlscy5jbGllbnRJZCA9IGNsaWVudElkO1xyXG59XHJcblxyXG4vLyBSZWdpc3RlciBwbGF0Zm9ybSBoYW5kbGVycyAoaW50ZXJuYWwgQVBJKVxyXG4vLyBOb3RlOiBXaW5kb3cgaXMgdGhlIHRoaXNXaW5kb3cgaW5zdGFuY2UgKGRlZmF1bHQgZXhwb3J0IGZyb20gd2luZG93LnRzKVxyXG4vLyBCaW5kaW5nIGVuc3VyZXMgJ3RoaXMnIGNvcnJlY3RseSByZWZlcnMgdG8gdGhlIGN1cnJlbnQgd2luZG93IGluc3RhbmNlXHJcbmlmIChoYXNET00pIHtcclxuICAgIHdpbmRvdy5fd2FpbHMuaGFuZGxlUGxhdGZvcm1GaWxlRHJvcCA9IFdpbmRvdy5IYW5kbGVQbGF0Zm9ybUZpbGVEcm9wLmJpbmQoV2luZG93KTtcclxufVxyXG5cclxuLy8gTGludXgtc3BlY2lmaWMgZHJhZyBoYW5kbGVycyAoR1RLIGludGVyY2VwdHMgRE9NIGRyYWcgZXZlbnRzKVxyXG5pZiAoaGFzRE9NKSB7XHJcbiAgICB3aW5kb3cuX3dhaWxzLmhhbmRsZURyYWdFbnRlciA9IGhhbmRsZURyYWdFbnRlcjtcclxuICAgIHdpbmRvdy5fd2FpbHMuaGFuZGxlRHJhZ0xlYXZlID0gaGFuZGxlRHJhZ0xlYXZlO1xyXG4gICAgd2luZG93Ll93YWlscy5oYW5kbGVEcmFnT3ZlciA9IGhhbmRsZURyYWdPdmVyO1xyXG59XHJcblxyXG5pZiAoaGFzRE9NKSB7XHJcbiAgICBTeXN0ZW0uaW52b2tlKFwid2FpbHM6cnVudGltZTpyZWFkeVwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIExvYWRzIGEgc2NyaXB0IGZyb20gdGhlIGdpdmVuIFVSTCBpZiBpdCBleGlzdHMuXHJcbiAqIFVzZXMgSEVBRCByZXF1ZXN0IHRvIGNoZWNrIGV4aXN0ZW5jZSwgdGhlbiBpbmplY3RzIGEgc2NyaXB0IHRhZy5cclxuICogU2lsZW50bHkgaWdub3JlcyBpZiB0aGUgc2NyaXB0IGRvZXNuJ3QgZXhpc3QuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9hZE9wdGlvbmFsU2NyaXB0KHVybDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7IG1ldGhvZDogJ0hFQUQnIH0pXHJcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgIC8vIFZlcmlmeSB0aGUgcmVzcG9uc2UgaXMgYWN0dWFsbHkgSmF2YVNjcmlwdCBhbmQgbm90IGFuIEhUTUwgZmFsbGJhY2tcclxuICAgICAgICAgICAgICAgIC8vIChlLmcuIFZpdGUgZGV2IHNlcnZlciByZXR1cm5zIGluZGV4Lmh0bWwgZm9yIHVua25vd24gcm91dGVzKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSAocmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRlbnRUeXBlLmluY2x1ZGVzKCdqYXZhc2NyaXB0JykpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzY3JpcHQuc3JjID0gdXJsO1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKCgpID0+IHt9KTsgLy8gU2lsZW50bHkgaWdub3JlIC0gc2NyaXB0IGlzIG9wdGlvbmFsXHJcbn1cclxuXHJcbi8vIExvYWQgY3VzdG9tLmpzIGlmIGF2YWlsYWJsZSAodXNlZCBieSBzZXJ2ZXIgbW9kZSBmb3IgV2ViU29ja2V0IGV2ZW50cywgZXRjLilcclxuaWYgKGhhc0RPTSkge1xyXG4gICAgbG9hZE9wdGlvbmFsU2NyaXB0KCcvd2FpbHMvY3VzdG9tLmpzJyk7XHJcbn1cclxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBaUJhLFNBQVMsT0FBTyxXQUFXLGVBQWUsT0FBTyxhQUFhOzs7OztBQ3NCM0UsU0FBZ0IsT0FBTyxPQUFlLElBQVk7Q0FDOUMsTUFBTSxTQUFTLE9BQU8sV0FBVyxlQUFlLE9BQU8sT0FBTyxvQkFBb0IsYUFDNUUsU0FDQTtDQUVOLElBQUksUUFBUTtFQUNSLE1BQU0sUUFBUSxJQUFJLFdBQVcsSUFBSTtF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