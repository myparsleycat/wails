var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};

// internal/runtime/desktop/@wailsio/runtime/src/index.ts
var index_exports = {};
__export(index_exports, {
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
  Window: () => window_default,
  clientId: () => clientId,
  getTransport: () => getTransport,
  loadOptionalScript: () => loadOptionalScript,
  objectNames: () => objectNames,
  setTransport: () => setTransport
});

// internal/runtime/desktop/@wailsio/runtime/src/wml.ts
var wml_exports = {};
__export(wml_exports, {
  Enable: () => Enable,
  Reload: () => Reload
});

// internal/runtime/desktop/@wailsio/runtime/src/browser.ts
var browser_exports = {};
__export(browser_exports, {
  OpenURL: () => OpenURL
});

// internal/runtime/desktop/@wailsio/runtime/src/nanoid.ts
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid(size = 21) {
  const source = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" ? crypto : null;
  if (source) {
    const bytes = new Uint8Array(size);
    source.getRandomValues(bytes);
    let id2 = "";
    for (let i2 = 0; i2 < size; i2++) {
      id2 += urlAlphabet[bytes[i2] & 63];
    }
    return id2;
  }
  let id = "";
  let i = size | 0;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
}

// internal/runtime/desktop/@wailsio/runtime/src/environment.ts
var hasDOM = typeof window !== "undefined" && typeof document !== "undefined";

// internal/runtime/desktop/@wailsio/runtime/src/runtime.ts
function runtimeURL() {
  return window.location.origin + "/wails/runtime";
}
var CHUNK_THRESHOLD = 512 * 1024;
var RuntimeError = class extends Error {
  /**
   * Constructs a new RuntimeError instance.
   * @param message - The error message.
   * @param options - Options to be forwarded to the Error constructor.
   */
  constructor(message, options) {
    super(message, options);
    this.name = "RuntimeError";
  }
};
var objectNames = Object.freeze({
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
var clientId = nanoid();
var customTransport = null;
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
  var _a3, _b;
  if (customTransport) {
    return customTransport.call(objectID, method, windowName, args);
  }
  let url = new URL(runtimeURL());
  let body = {
    object: objectID,
    method
  };
  if (args !== null && args !== void 0) {
    body.args = args;
  }
  let headers = {
    ["x-wails-client-id"]: clientId,
    ["Content-Type"]: "application/json"
  };
  if (windowName) {
    headers["x-wails-window-name"] = windowName;
  }
  const bodyStr = JSON.stringify(body);
  let response;
  if (bodyStr.length > CHUNK_THRESHOLD) {
    response = await sendChunked(url, headers, bodyStr);
  } else {
    response = await fetch(url, { method: "POST", headers, body: bodyStr });
  }
  if (!response.ok) {
    const ct = response.headers.get("Content-Type");
    if (ct == null ? void 0 : ct.includes("application/json")) {
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
        default:
          err = new Error(json.message);
      }
      err.cause = json.cause;
      throw err;
    }
    throw new Error(await response.text());
  }
  if (((_b = (_a3 = response.headers.get("Content-Type")) == null ? void 0 : _a3.indexOf("application/json")) != null ? _b : -1) !== -1) {
    return response.json();
  } else {
    return response.text();
  }
}
async function sendChunked(url, headers, bodyStr) {
  const chunkId = nanoid();
  const bodyBytes = new TextEncoder().encode(bodyStr);
  const totalChunks = Math.ceil(bodyBytes.length / CHUNK_THRESHOLD);
  for (let i = 0; i < totalChunks - 1; i++) {
    const chunk = bodyBytes.subarray(i * CHUNK_THRESHOLD, (i + 1) * CHUNK_THRESHOLD);
    const resp = await fetch(url, {
      method: "POST",
      headers: __spreadProps(__spreadValues({}, headers), {
        "x-wails-chunk-id": chunkId,
        "x-wails-chunk-index": String(i),
        "x-wails-chunk-total": String(totalChunks)
      }),
      body: chunk
    });
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
  }
  return fetch(url, {
    method: "POST",
    headers: __spreadProps(__spreadValues({}, headers), {
      "x-wails-chunk-id": chunkId,
      "x-wails-chunk-index": String(totalChunks - 1),
      "x-wails-chunk-total": String(totalChunks)
    }),
    body: bodyBytes.subarray((totalChunks - 1) * CHUNK_THRESHOLD)
  });
}
var _a;
var androidBridge = hasDOM && typeof ((_a = window.wails) == null ? void 0 : _a.invokeAsync) === "function" ? window.wails : null;
if (androidBridge) {
  const pending = /* @__PURE__ */ new Map();
  window._wailsAndroidCallback = (id, response, error) => {
    var _a3;
    const promise = pending.get(id);
    if (!promise) return;
    pending.delete(id);
    if (error) {
      promise.reject(new Error(error));
      return;
    }
    try {
      const envelope = JSON.parse(response != null ? response : "{}");
      if (!envelope.ok) {
        promise.reject(new Error((_a3 = envelope.error) != null ? _a3 : "unknown runtime call error"));
        return;
      }
      promise.resolve("text" in envelope ? envelope.text : envelope.data);
    } catch (e) {
      promise.reject(e);
    }
  };
  customTransport = {
    call(objectID, method, windowName, args) {
      return new Promise((resolve, reject) => {
        const id = nanoid();
        pending.set(id, { resolve, reject });
        try {
          androidBridge.invokeAsync(id, JSON.stringify({
            object: objectID,
            method,
            windowName,
            args: args != null ? args : null,
            clientId
          }));
        } catch (e) {
          pending.delete(id);
          reject(e);
        }
      });
    }
  };
}

// internal/runtime/desktop/@wailsio/runtime/src/browser.ts
var call = newRuntimeCaller(objectNames.Browser);
var BrowserOpenURL = 0;
function OpenURL(url) {
  return call(BrowserOpenURL, { url: url.toString() });
}

// internal/runtime/desktop/@wailsio/runtime/src/dialogs.ts
var dialogs_exports = {};
__export(dialogs_exports, {
  Error: () => Error2,
  Info: () => Info,
  OpenFile: () => OpenFile,
  Question: () => Question,
  SaveFile: () => SaveFile,
  Warning: () => Warning
});
if (hasDOM) {
  window._wails = window._wails || {};
}
var call2 = newRuntimeCaller(objectNames.Dialog);
var DialogInfo = 0;
var DialogWarning = 1;
var DialogError = 2;
var DialogQuestion = 3;
var DialogOpenFile = 4;
var DialogSaveFile = 5;
function dialog(type, options = {}) {
  return call2(type, options);
}
function Info(options) {
  return dialog(DialogInfo, options);
}
function Warning(options) {
  return dialog(DialogWarning, options);
}
function Error2(options) {
  return dialog(DialogError, options);
}
function Question(options) {
  return dialog(DialogQuestion, options);
}
function OpenFile(options) {
  var _a3;
  return (_a3 = dialog(DialogOpenFile, options)) != null ? _a3 : [];
}
function SaveFile(options) {
  return dialog(DialogSaveFile, options);
}

// internal/runtime/desktop/@wailsio/runtime/src/events.ts
var events_exports = {};
__export(events_exports, {
  Emit: () => Emit,
  Off: () => Off,
  OffAll: () => OffAll,
  On: () => On,
  OnMultiple: () => OnMultiple,
  Once: () => Once,
  Types: () => Types,
  WailsEvent: () => WailsEvent
});

// internal/runtime/desktop/@wailsio/runtime/src/listener.ts
var eventListeners = /* @__PURE__ */ new Map();
var Listener = class {
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
function listenerOff(listener) {
  let listeners = eventListeners.get(listener.eventName);
  if (!listeners) {
    return;
  }
  listeners = listeners.filter((l) => l !== listener);
  if (listeners.length === 0) {
    eventListeners.delete(listener.eventName);
  } else {
    eventListeners.set(listener.eventName, listeners);
  }
}

// internal/runtime/desktop/@wailsio/runtime/src/create.ts
var create_exports = {};
__export(create_exports, {
  Any: () => Any,
  Array: () => Array2,
  ByteSlice: () => ByteSlice,
  DateFromTime: () => DateFromTime,
  Events: () => Events,
  Map: () => Map2,
  Nullable: () => Nullable,
  Struct: () => Struct
});
function Any(source) {
  return source;
}
function ByteSlice(source) {
  return source == null ? "" : source;
}
function Array2(element) {
  if (element === Any) {
    return (source) => source === null ? [] : source;
  }
  return (source) => {
    if (source === null) {
      return [];
    }
    for (let i = 0; i < source.length; i++) {
      source[i] = element(source[i]);
    }
    return source;
  };
}
function Map2(key, value) {
  if (value === Any) {
    return (source) => source === null ? {} : source;
  }
  return (source) => {
    if (source === null) {
      return {};
    }
    for (const key2 in source) {
      source[key2] = value(source[key2]);
    }
    return source;
  };
}
function Nullable(element) {
  if (element === Any) {
    return Any;
  }
  return (source) => source === null ? null : element(source);
}
function Struct(createField) {
  let allAny = true;
  for (const name in createField) {
    if (createField[name] !== Any) {
      allAny = false;
      break;
    }
  }
  if (allAny) {
    return Any;
  }
  return (source) => {
    for (const name in createField) {
      if (name in source) {
        source[name] = createField[name](source[name]);
      }
    }
    return source;
  };
}
function DateFromTime(source) {
  return new Date(source);
}
var Events = {};

// internal/runtime/desktop/@wailsio/runtime/src/event_types.ts
var Types = Object.freeze({
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

// internal/runtime/desktop/@wailsio/runtime/src/events.ts
if (hasDOM) {
  window._wails = window._wails || {};
  window._wails.dispatchWailsEvent = dispatchWailsEvent;
}
var call3 = newRuntimeCaller(objectNames.Events);
var EmitMethod = 0;
var WailsEvent = class {
  constructor(name, data) {
    this.name = name;
    this.data = data != null ? data : null;
  }
};
function dispatchWailsEvent(event) {
  let listeners = eventListeners.get(event.name);
  if (!listeners) {
    return;
  }
  let wailsEvent = new WailsEvent(
    event.name,
    event.name in Events ? Events[event.name](event.data) : event.data
  );
  if ("sender" in event) {
    wailsEvent.sender = event.sender;
  }
  const expired = /* @__PURE__ */ new Set();
  for (const listener of listeners.slice()) {
    if (listener.dispatch(wailsEvent)) {
      expired.add(listener);
    }
  }
  if (expired.size > 0) {
    const live = eventListeners.get(event.name);
    if (live) {
      const remaining = live.filter((l) => !expired.has(l));
      if (remaining.length === 0) {
        eventListeners.delete(event.name);
      } else {
        eventListeners.set(event.name, remaining);
      }
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
  return call3(EmitMethod, new WailsEvent(name, data));
}

// internal/runtime/desktop/@wailsio/runtime/src/utils.ts
function debugLog(message) {
  console.log(
    "%c wails3 %c " + message + " ",
    "background: #aa0000; color: #fff; border-radius: 3px 0px 0px 3px; padding: 1px; font-size: 0.7rem",
    "background: #009900; color: #fff; border-radius: 0px 3px 3px 0px; padding: 1px; font-size: 0.7rem"
  );
}
function canTrackButtons() {
  return new MouseEvent("mousedown").buttons === 0;
}
function canAbortListeners() {
  if (!EventTarget || !AbortSignal || !AbortController)
    return false;
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
  var _a3;
  if (event.target instanceof HTMLElement) {
    return event.target;
  } else if (!(event.target instanceof HTMLElement) && event.target instanceof Node) {
    return (_a3 = event.target.parentElement) != null ? _a3 : document.body;
  } else {
    return document.body;
  }
}
var isReady = false;
if (hasDOM) {
  document.addEventListener("DOMContentLoaded", () => {
    isReady = true;
  });
}
function whenReady(callback) {
  if (isReady || document.readyState === "complete") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}

// internal/runtime/desktop/@wailsio/runtime/src/window.ts
var DROP_TARGET_ATTRIBUTE = "data-file-drop-target";
var DROP_TARGET_ACTIVE_CLASS = "file-drop-target-active";
var currentDropTarget = null;
var PositionMethod = 0;
var CenterMethod = 1;
var CloseMethod = 2;
var DisableSizeConstraintsMethod = 3;
var EnableSizeConstraintsMethod = 4;
var FocusMethod = 5;
var ForceReloadMethod = 6;
var FullscreenMethod = 7;
var GetScreenMethod = 8;
var GetZoomMethod = 9;
var HeightMethod = 10;
var HideMethod = 11;
var IsFocusedMethod = 12;
var IsFullscreenMethod = 13;
var IsMaximisedMethod = 14;
var IsMinimisedMethod = 15;
var MaximiseMethod = 16;
var MinimiseMethod = 17;
var NameMethod = 18;
var OpenDevToolsMethod = 19;
var RelativePositionMethod = 20;
var ReloadMethod = 21;
var ResizableMethod = 22;
var RestoreMethod = 23;
var SetPositionMethod = 24;
var SetAlwaysOnTopMethod = 25;
var SetBackgroundColourMethod = 26;
var SetFramelessMethod = 27;
var SetFullscreenButtonEnabledMethod = 28;
var SetMaxSizeMethod = 29;
var SetMinSizeMethod = 30;
var SetRelativePositionMethod = 31;
var SetResizableMethod = 32;
var SetSizeMethod = 33;
var SetTitleMethod = 34;
var SetZoomMethod = 35;
var ShowMethod = 36;
var SizeMethod = 37;
var ToggleFullscreenMethod = 38;
var ToggleMaximiseMethod = 39;
var ToggleFramelessMethod = 40;
var UnFullscreenMethod = 41;
var UnMaximiseMethod = 42;
var UnMinimiseMethod = 43;
var WidthMethod = 44;
var ZoomMethod = 45;
var ZoomInMethod = 46;
var ZoomOutMethod = 47;
var ZoomResetMethod = 48;
var SnapAssistMethod = 49;
var FilesDropped = 50;
var PrintMethod = 51;
var SetScreenMethod = 52;
function getDropTargetElement(element) {
  if (!element) {
    return null;
  }
  return element.closest("[".concat(DROP_TARGET_ATTRIBUTE, "]"));
}
function canResolveFilePaths() {
  var _a3, _b, _c, _d;
  if (((_b = (_a3 = window.chrome) == null ? void 0 : _a3.webview) == null ? void 0 : _b.postMessageWithAdditionalObjects) == null) {
    return false;
  }
  return ((_d = (_c = window._wails) == null ? void 0 : _c.flags) == null ? void 0 : _d.enableFileDrop) === true;
}
function resolveFilePaths(x, y, files) {
  var _a3, _b;
  if ((_b = (_a3 = window.chrome) == null ? void 0 : _a3.webview) == null ? void 0 : _b.postMessageWithAdditionalObjects) {
    window.chrome.webview.postMessageWithAdditionalObjects("file:drop:".concat(x, ":").concat(y), files);
  }
}
var nativeDragActive = false;
function cleanupNativeDrag() {
  nativeDragActive = false;
  if (currentDropTarget) {
    currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
    currentDropTarget = null;
  }
}
function handleDragEnter() {
  var _a3, _b;
  if (((_b = (_a3 = window._wails) == null ? void 0 : _a3.flags) == null ? void 0 : _b.enableFileDrop) === false) {
    return;
  }
  nativeDragActive = true;
}
function handleDragLeave() {
  cleanupNativeDrag();
}
function handleDragOver(x, y) {
  var _a3, _b;
  if (!nativeDragActive) return;
  if (((_b = (_a3 = window._wails) == null ? void 0 : _a3.flags) == null ? void 0 : _b.enableFileDrop) === false) {
    return;
  }
  const targetElement = document.elementFromPoint(x, y);
  const dropTarget = getDropTargetElement(targetElement);
  if (currentDropTarget && currentDropTarget !== dropTarget) {
    currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
  }
  if (dropTarget) {
    dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
    currentDropTarget = dropTarget;
  } else {
    currentDropTarget = null;
  }
}
var callerSym = /* @__PURE__ */ Symbol("caller");
callerSym;
var _Window = class _Window {
  /**
   * Initialises a window object with the specified name.
   *
   * @private
   * @param name - The name of the target window.
   */
  constructor(name = "") {
    this[callerSym] = newRuntimeCaller(objectNames.Window, name);
    for (const method of Object.getOwnPropertyNames(_Window.prototype)) {
      if (method !== "constructor" && typeof this[method] === "function") {
        this[method] = this[method].bind(this);
      }
    }
  }
  /**
   * Gets the specified window.
   *
   * @param name - The name of the window to get.
   * @returns The corresponding window object.
   */
  Get(name) {
    return new _Window(name);
  }
  /**
   * Returns the absolute position of the window.
   *
   * @returns The current absolute position of the window.
   */
  Position() {
    return this[callerSym](PositionMethod);
  }
  /**
   * Centers the window on the screen.
   */
  Center() {
    return this[callerSym](CenterMethod);
  }
  /**
   * Closes the window.
   */
  Close() {
    return this[callerSym](CloseMethod);
  }
  /**
   * Disables min/max size constraints.
   */
  DisableSizeConstraints() {
    return this[callerSym](DisableSizeConstraintsMethod);
  }
  /**
   * Enables min/max size constraints.
   */
  EnableSizeConstraints() {
    return this[callerSym](EnableSizeConstraintsMethod);
  }
  /**
   * Focuses the window.
   */
  Focus() {
    return this[callerSym](FocusMethod);
  }
  /**
   * Forces the window to reload the page assets.
   */
  ForceReload() {
    return this[callerSym](ForceReloadMethod);
  }
  /**
   * Switches the window to fullscreen mode.
   */
  Fullscreen() {
    return this[callerSym](FullscreenMethod);
  }
  /**
   * Returns the screen that the window is on.
   *
   * @returns The screen the window is currently on.
   */
  GetScreen() {
    return this[callerSym](GetScreenMethod);
  }
  /**
   * Returns the current zoom level of the window.
   *
   * @returns The current zoom level.
   */
  GetZoom() {
    return this[callerSym](GetZoomMethod);
  }
  /**
   * Returns the height of the window.
   *
   * @returns The current height of the window.
   */
  Height() {
    return this[callerSym](HeightMethod);
  }
  /**
   * Hides the window.
   */
  Hide() {
    return this[callerSym](HideMethod);
  }
  /**
   * Returns true if the window is focused.
   *
   * @returns Whether the window is currently focused.
   */
  IsFocused() {
    return this[callerSym](IsFocusedMethod);
  }
  /**
   * Returns true if the window is fullscreen.
   *
   * @returns Whether the window is currently fullscreen.
   */
  IsFullscreen() {
    return this[callerSym](IsFullscreenMethod);
  }
  /**
   * Returns true if the window is maximised.
   *
   * @returns Whether the window is currently maximised.
   */
  IsMaximised() {
    return this[callerSym](IsMaximisedMethod);
  }
  /**
   * Returns true if the window is minimised.
   *
   * @returns Whether the window is currently minimised.
   */
  IsMinimised() {
    return this[callerSym](IsMinimisedMethod);
  }
  /**
   * Maximises the window.
   */
  Maximise() {
    return this[callerSym](MaximiseMethod);
  }
  /**
   * Minimises the window.
   */
  Minimise() {
    return this[callerSym](MinimiseMethod);
  }
  /**
   * Returns the name of the window.
   *
   * @returns The name of the window.
   */
  Name() {
    return this[callerSym](NameMethod);
  }
  /**
   * Opens the development tools pane.
   */
  OpenDevTools() {
    return this[callerSym](OpenDevToolsMethod);
  }
  /**
   * Returns the relative position of the window to the screen.
   *
   * @returns The current relative position of the window.
   */
  RelativePosition() {
    return this[callerSym](RelativePositionMethod);
  }
  /**
   * Reloads the page assets.
   */
  Reload() {
    return this[callerSym](ReloadMethod);
  }
  /**
   * Returns true if the window is resizable.
   *
   * @returns Whether the window is currently resizable.
   */
  Resizable() {
    return this[callerSym](ResizableMethod);
  }
  /**
   * Restores the window to its previous state if it was previously minimised, maximised or fullscreen.
   */
  Restore() {
    return this[callerSym](RestoreMethod);
  }
  /**
   * Sets the absolute position of the window.
   *
   * @param x - The desired horizontal absolute position of the window.
   * @param y - The desired vertical absolute position of the window.
   */
  SetPosition(x, y) {
    return this[callerSym](SetPositionMethod, { x, y });
  }
  /**
   * Sets the window to be always on top.
   *
   * @param alwaysOnTop - Whether the window should stay on top.
   */
  SetAlwaysOnTop(alwaysOnTop) {
    return this[callerSym](SetAlwaysOnTopMethod, { alwaysOnTop });
  }
  /**
   * Sets the background colour of the window.
   *
   * @param r - The desired red component of the window background.
   * @param g - The desired green component of the window background.
   * @param b - The desired blue component of the window background.
   * @param a - The desired alpha component of the window background.
   */
  SetBackgroundColour(r, g, b, a) {
    return this[callerSym](SetBackgroundColourMethod, { r, g, b, a });
  }
  /**
   * Removes the window frame and title bar.
   *
   * @param frameless - Whether the window should be frameless.
   */
  SetFrameless(frameless) {
    return this[callerSym](SetFramelessMethod, { frameless });
  }
  /**
   * Disables the system fullscreen button.
   *
   * @param enabled - Whether the fullscreen button should be enabled.
   */
  SetFullscreenButtonEnabled(enabled) {
    return this[callerSym](SetFullscreenButtonEnabledMethod, { enabled });
  }
  /**
   * Sets the maximum size of the window.
   *
   * @param width - The desired maximum width of the window.
   * @param height - The desired maximum height of the window.
   */
  SetMaxSize(width, height) {
    return this[callerSym](SetMaxSizeMethod, { width, height });
  }
  /**
   * Sets the minimum size of the window.
   *
   * @param width - The desired minimum width of the window.
   * @param height - The desired minimum height of the window.
   */
  SetMinSize(width, height) {
    return this[callerSym](SetMinSizeMethod, { width, height });
  }
  /**
   * Sets the relative position of the window to the screen.
   *
   * @param x - The desired horizontal relative position of the window.
   * @param y - The desired vertical relative position of the window.
   */
  SetRelativePosition(x, y) {
    return this[callerSym](SetRelativePositionMethod, { x, y });
  }
  /**
   * Sets whether the window is resizable.
   *
   * @param resizable - Whether the window should be resizable.
   */
  SetResizable(resizable2) {
    return this[callerSym](SetResizableMethod, { resizable: resizable2 });
  }
  /**
   * Sets the size of the window.
   *
   * @param width - The desired width of the window.
   * @param height - The desired height of the window.
   */
  SetSize(width, height) {
    return this[callerSym](SetSizeMethod, { width, height });
  }
  /**
   * Sets the title of the window.
   *
   * @param title - The desired title of the window.
   */
  SetTitle(title) {
    return this[callerSym](SetTitleMethod, { title });
  }
  /**
   * Sets the zoom level of the window.
   *
   * @param zoom - The desired zoom level.
   */
  SetZoom(zoom) {
    return this[callerSym](SetZoomMethod, { zoom });
  }
  /**
   * Shows the window.
   */
  Show() {
    return this[callerSym](ShowMethod);
  }
  /**
   * Returns the size of the window.
   *
   * @returns The current size of the window.
   */
  Size() {
    return this[callerSym](SizeMethod);
  }
  /**
   * Toggles the window between fullscreen and normal.
   */
  ToggleFullscreen() {
    return this[callerSym](ToggleFullscreenMethod);
  }
  /**
   * Toggles the window between maximised and normal.
   */
  ToggleMaximise() {
    return this[callerSym](ToggleMaximiseMethod);
  }
  /**
   * Toggles the window between frameless and normal.
   */
  ToggleFrameless() {
    return this[callerSym](ToggleFramelessMethod);
  }
  /**
   * Un-fullscreens the window.
   */
  UnFullscreen() {
    return this[callerSym](UnFullscreenMethod);
  }
  /**
   * Un-maximises the window.
   */
  UnMaximise() {
    return this[callerSym](UnMaximiseMethod);
  }
  /**
   * Un-minimises the window.
   */
  UnMinimise() {
    return this[callerSym](UnMinimiseMethod);
  }
  /**
   * Returns the width of the window.
   *
   * @returns The current width of the window.
   */
  Width() {
    return this[callerSym](WidthMethod);
  }
  /**
   * Zooms the window.
   */
  Zoom() {
    return this[callerSym](ZoomMethod);
  }
  /**
   * Increases the zoom level of the webview content.
   */
  ZoomIn() {
    return this[callerSym](ZoomInMethod);
  }
  /**
   * Decreases the zoom level of the webview content.
   */
  ZoomOut() {
    return this[callerSym](ZoomOutMethod);
  }
  /**
   * Resets the zoom level of the webview content.
   */
  ZoomReset() {
    return this[callerSym](ZoomResetMethod);
  }
  /**
   * Handles file drops originating from platform-specific code (e.g., macOS/Linux native drag-and-drop).
   * Gathers information about the drop target element and sends it back to the Go backend.
   *
   * @param filenames - An array of file paths (strings) that were dropped.
   * @param x - The x-coordinate of the drop event, in logical (CSS) pixels relative to the webview.
   * @param y - The y-coordinate of the drop event, in logical (CSS) pixels relative to the webview.
   */
  HandlePlatformFileDrop(filenames, x, y) {
    var _a3, _b;
    if (((_b = (_a3 = window._wails) == null ? void 0 : _a3.flags) == null ? void 0 : _b.enableFileDrop) === false) {
      return;
    }
    const element = document.elementFromPoint(x, y);
    const dropTarget = getDropTargetElement(element);
    if (!dropTarget) {
      return;
    }
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
  /**
   * Moves the window to the center of the specified screen's work area.
   *
   * @param screenID - The ID of the target screen.
   */
  SetScreen(screenID) {
    return this[callerSym](SetScreenMethod, { screenID });
  }
  /* Triggers Windows 11 Snap Assist feature (Windows only).
   * This is equivalent to pressing Win+Z and shows snap layout options.
   */
  SnapAssist() {
    return this[callerSym](SnapAssistMethod);
  }
  /**
   * Opens the print dialog for the window.
   */
  Print() {
    return this[callerSym](PrintMethod);
  }
};
var Window = _Window;
var thisWindow = new Window("");
function setupDropTargetListeners() {
  const docElement = document.documentElement;
  let dragEnterCounter = 0;
  docElement.addEventListener("dragenter", (event) => {
    var _a3, _b, _c;
    if (!((_a3 = event.dataTransfer) == null ? void 0 : _a3.types.includes("Files"))) {
      return;
    }
    event.preventDefault();
    if (((_c = (_b = window._wails) == null ? void 0 : _b.flags) == null ? void 0 : _c.enableFileDrop) === false) {
      event.dataTransfer.dropEffect = "none";
      return;
    }
    dragEnterCounter++;
    const targetElement = document.elementFromPoint(event.clientX, event.clientY);
    const dropTarget = getDropTargetElement(targetElement);
    if (currentDropTarget && currentDropTarget !== dropTarget) {
      currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
    }
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
    var _a3, _b, _c;
    if (!((_a3 = event.dataTransfer) == null ? void 0 : _a3.types.includes("Files"))) {
      return;
    }
    event.preventDefault();
    if (((_c = (_b = window._wails) == null ? void 0 : _b.flags) == null ? void 0 : _c.enableFileDrop) === false) {
      event.dataTransfer.dropEffect = "none";
      return;
    }
    const targetElement = document.elementFromPoint(event.clientX, event.clientY);
    const dropTarget = getDropTargetElement(targetElement);
    if (currentDropTarget && currentDropTarget !== dropTarget) {
      currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
    }
    if (dropTarget) {
      if (!dropTarget.classList.contains(DROP_TARGET_ACTIVE_CLASS)) {
        dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
      }
      event.dataTransfer.dropEffect = "copy";
      currentDropTarget = dropTarget;
    } else {
      event.dataTransfer.dropEffect = "none";
      currentDropTarget = null;
    }
  }, false);
  docElement.addEventListener("dragleave", (event) => {
    var _a3, _b, _c;
    if (!((_a3 = event.dataTransfer) == null ? void 0 : _a3.types.includes("Files"))) {
      return;
    }
    event.preventDefault();
    if (((_c = (_b = window._wails) == null ? void 0 : _b.flags) == null ? void 0 : _c.enableFileDrop) === false) {
      return;
    }
    if (event.relatedTarget === null) {
      return;
    }
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
    var _a3, _b, _c, _d, _e;
    if (!((_a3 = event.dataTransfer) == null ? void 0 : _a3.types.includes("Files"))) {
      return;
    }
    event.preventDefault();
    if (((_c = (_b = window._wails) == null ? void 0 : _b.flags) == null ? void 0 : _c.enableFileDrop) === false) {
      return;
    }
    dragEnterCounter = 0;
    if (currentDropTarget) {
      currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
      currentDropTarget = null;
    }
    if (canResolveFilePaths() && ((_e = (_d = window._wails) == null ? void 0 : _d.flags) == null ? void 0 : _e.nativeCompositionFileDrop) !== true) {
      const files = [];
      if (event.dataTransfer.items) {
        for (const item of event.dataTransfer.items) {
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }
      } else if (event.dataTransfer.files) {
        for (const file of event.dataTransfer.files) {
          files.push(file);
        }
      }
      if (files.length > 0) {
        resolveFilePaths(event.clientX, event.clientY, files);
      }
    }
  }, false);
}
if (typeof window !== "undefined" && typeof document !== "undefined") {
  setupDropTargetListeners();
}
var window_default = thisWindow;

// internal/runtime/desktop/@wailsio/runtime/src/wml.ts
function sendEvent(eventName, data = null) {
  Emit(eventName, data);
}
function callWindowMethod(windowName, methodName) {
  const targetWindow = window_default.Get(windowName);
  const method = targetWindow[methodName];
  if (typeof method !== "function") {
    console.error("Window method '".concat(methodName, "' not found"));
    return;
  }
  try {
    method.call(targetWindow);
  } catch (e) {
    console.error("Error calling window method '".concat(methodName, "': "), e);
  }
}
function onWMLTriggered(ev) {
  const element = ev.currentTarget;
  function runEffect(choice = "Yes") {
    if (choice !== "Yes")
      return;
    const eventType = element.getAttribute("wml-event") || element.getAttribute("data-wml-event");
    const targetWindow = element.getAttribute("wml-target-window") || element.getAttribute("data-wml-target-window") || "";
    const windowMethod = element.getAttribute("wml-window") || element.getAttribute("data-wml-window");
    const url = element.getAttribute("wml-openurl") || element.getAttribute("data-wml-openurl");
    if (eventType !== null)
      sendEvent(eventType);
    if (windowMethod !== null)
      callWindowMethod(targetWindow, windowMethod);
    if (url !== null)
      void OpenURL(url);
  }
  const confirm = element.getAttribute("wml-confirm") || element.getAttribute("data-wml-confirm");
  if (confirm) {
    Question({
      Title: "Confirm",
      Message: confirm,
      Detached: false,
      Buttons: [
        { Label: "Yes" },
        { Label: "No", IsDefault: true }
      ]
    }).then(runEffect);
  } else {
    runEffect();
  }
}
var controllerSym = /* @__PURE__ */ Symbol("controller");
var triggerMapSym = /* @__PURE__ */ Symbol("triggerMap");
var elementCountSym = /* @__PURE__ */ Symbol("elementCount");
controllerSym;
var AbortControllerRegistry = class {
  constructor() {
    this[controllerSym] = new AbortController();
  }
  /**
   * Returns an options object for addEventListener that ties the listener
   * to the AbortSignal from the current AbortController.
   *
   * @param element - An HTML element
   * @param triggers - The list of active WML trigger events for the specified elements
   */
  set(element, triggers) {
    return { signal: this[controllerSym].signal };
  }
  /**
   * Removes all registered event listeners and resets the registry.
   */
  reset() {
    this[controllerSym].abort();
    this[controllerSym] = new AbortController();
  }
};
triggerMapSym, elementCountSym;
var WeakMapRegistry = class {
  constructor() {
    this[triggerMapSym] = /* @__PURE__ */ new WeakMap();
    this[elementCountSym] = 0;
  }
  /**
   * Sets active triggers for the specified element.
   *
   * @param element - An HTML element
   * @param triggers - The list of active WML trigger events for the specified element
   */
  set(element, triggers) {
    if (!this[triggerMapSym].has(element)) {
      this[elementCountSym]++;
    }
    this[triggerMapSym].set(element, triggers);
    return {};
  }
  /**
   * Removes all registered event listeners.
   */
  reset() {
    if (this[elementCountSym] <= 0)
      return;
    for (const element of document.body.querySelectorAll("*")) {
      if (this[elementCountSym] <= 0)
        break;
      const triggers = this[triggerMapSym].get(element);
      if (triggers != null) {
        this[elementCountSym]--;
      }
      for (const trigger of triggers || [])
        element.removeEventListener(trigger, onWMLTriggered);
    }
    this[triggerMapSym] = /* @__PURE__ */ new WeakMap();
    this[elementCountSym] = 0;
  }
};
var triggerRegistry = canAbortListeners() ? new AbortControllerRegistry() : new WeakMapRegistry();
function addWMLListeners(element) {
  const triggerRegExp = /\S+/g;
  const triggerAttr = element.getAttribute("wml-trigger") || element.getAttribute("data-wml-trigger") || "click";
  const triggers = [];
  let match;
  while ((match = triggerRegExp.exec(triggerAttr)) !== null)
    triggers.push(match[0]);
  const options = triggerRegistry.set(element, triggers);
  for (const trigger of triggers)
    element.addEventListener(trigger, onWMLTriggered, options);
}
function Enable() {
  whenReady(Reload);
}
function Reload() {
  triggerRegistry.reset();
  document.body.querySelectorAll("[wml-event], [wml-window], [wml-openurl], [data-wml-event], [data-wml-window], [data-wml-openurl]").forEach(addWMLListeners);
}

// internal/runtime/desktop/compiled/main.js
window.wails = index_exports;
Enable();
if (true) {
  debugLog("Wails Runtime Loaded");
}

// internal/runtime/desktop/@wailsio/runtime/src/system.ts
var system_exports = {};
__export(system_exports, {
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
var call4 = newRuntimeCaller(objectNames.System);
var SystemIsDarkMode = 0;
var SystemEnvironment = 1;
var SystemCapabilities = 2;
var _invoke = (function() {
  var _a3, _b, _c, _d, _e, _f;
  try {
    if ((_b = (_a3 = window.chrome) == null ? void 0 : _a3.webview) == null ? void 0 : _b.postMessage) {
      return window.chrome.webview.postMessage.bind(window.chrome.webview);
    } else if ((_e = (_d = (_c = window.webkit) == null ? void 0 : _c.messageHandlers) == null ? void 0 : _d["external"]) == null ? void 0 : _e.postMessage) {
      return window.webkit.messageHandlers["external"].postMessage.bind(window.webkit.messageHandlers["external"]);
    } else if ((_f = window.wails) == null ? void 0 : _f.invoke) {
      return (msg) => window.wails.invoke(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  } catch (e) {
  }
  console.warn(
    "\n%c\u26A0\uFE0F Browser Environment Detected %c\n\n%cOnly UI previews are available in the browser. For full functionality, please run the application in desktop mode.\nMore information at: https://v3.wails.io/learn/build/#using-a-browser-for-development\n",
    "background: #ffffff; color: #000000; font-weight: bold; padding: 4px 8px; border-radius: 4px; border: 2px solid #000000;",
    "background: transparent;",
    "color: #ffffff; font-style: italic; font-weight: bold;"
  );
  return null;
})();
function invoke(msg) {
  _invoke == null ? void 0 : _invoke(msg);
}
function IsDarkMode() {
  return call4(SystemIsDarkMode);
}
async function Capabilities() {
  return call4(SystemCapabilities);
}
function Environment() {
  return call4(SystemEnvironment);
}
function IsWindows() {
  var _a3, _b;
  return ((_b = (_a3 = window._wails) == null ? void 0 : _a3.environment) == null ? void 0 : _b.OS) === "windows";
}
function IsLinux() {
  var _a3, _b;
  return ((_b = (_a3 = window._wails) == null ? void 0 : _a3.environment) == null ? void 0 : _b.OS) === "linux";
}
function IsMac() {
  var _a3, _b;
  return ((_b = (_a3 = window._wails) == null ? void 0 : _a3.environment) == null ? void 0 : _b.OS) === "darwin";
}
function IsIOS() {
  var _a3, _b;
  return ((_b = (_a3 = window._wails) == null ? void 0 : _a3.environment) == null ? void 0 : _b.OS) === "ios";
}
function IsAndroid() {
  var _a3, _b;
  return ((_b = (_a3 = window._wails) == null ? void 0 : _a3.environment) == null ? void 0 : _b.OS) === "android";
}
function IsMobile() {
  return IsIOS() || IsAndroid();
}
function IsDesktop() {
  return IsMac() || IsWindows() || IsLinux();
}
function IsAMD64() {
  var _a3, _b;
  return ((_b = (_a3 = window._wails) == null ? void 0 : _a3.environment) == null ? void 0 : _b.Arch) === "amd64";
}
function IsARM() {
  var _a3, _b;
  return ((_b = (_a3 = window._wails) == null ? void 0 : _a3.environment) == null ? void 0 : _b.Arch) === "arm";
}
function IsARM64() {
  var _a3, _b;
  return ((_b = (_a3 = window._wails) == null ? void 0 : _a3.environment) == null ? void 0 : _b.Arch) === "arm64";
}
function IsDebug() {
  var _a3, _b;
  return Boolean((_b = (_a3 = window._wails) == null ? void 0 : _a3.environment) == null ? void 0 : _b.Debug);
}

// internal/runtime/desktop/@wailsio/runtime/src/contextmenu.ts
if (hasDOM) {
  window.addEventListener("contextmenu", contextMenuHandler);
}
var call5 = newRuntimeCaller(objectNames.ContextMenu);
var ContextMenuOpen = 0;
function openContextMenu(id, x, y, data) {
  void call5(ContextMenuOpen, { id, x, y, data });
}
function contextMenuHandler(event) {
  const target = eventTarget(event);
  const customContextMenu = window.getComputedStyle(target).getPropertyValue("--custom-contextmenu").trim();
  if (customContextMenu) {
    event.preventDefault();
    const data = window.getComputedStyle(target).getPropertyValue("--custom-contextmenu-data");
    openContextMenu(customContextMenu, event.clientX, event.clientY, data);
  } else {
    processDefaultContextMenu(event, target);
  }
}
function processDefaultContextMenu(event, target) {
  if (IsDebug()) {
    return;
  }
  switch (window.getComputedStyle(target).getPropertyValue("--default-contextmenu").trim()) {
    case "show":
      return;
    case "hide":
      event.preventDefault();
      return;
  }
  if (target.isContentEditable) {
    return;
  }
  const selection = window.getSelection();
  const hasSelection = selection && selection.toString().length > 0;
  if (hasSelection) {
    for (let i = 0; i < selection.rangeCount; i++) {
      const range = selection.getRangeAt(i);
      const rects = range.getClientRects();
      for (let j = 0; j < rects.length; j++) {
        const rect = rects[j];
        if (document.elementFromPoint(rect.left, rect.top) === target) {
          return;
        }
      }
    }
  }
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    if (hasSelection || !target.readOnly && !target.disabled) {
      return;
    }
  }
  event.preventDefault();
}

// internal/runtime/desktop/@wailsio/runtime/src/flags.ts
var flags_exports = {};
__export(flags_exports, {
  GetFlag: () => GetFlag
});
function GetFlag(key) {
  try {
    return window._wails.flags[key];
  } catch (e) {
    throw new Error("Unable to retrieve flag '" + key + "': " + e, { cause: e });
  }
}

// internal/runtime/desktop/@wailsio/runtime/src/drag.ts
var canDrag = false;
var dragging = false;
var resizable = false;
var canResize = false;
var resizing = false;
var resizeEdge = "";
var defaultCursor = "auto";
var buttons = 0;
var buttonsTracked = false;
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
var dragInitDone = false;
function isMobile() {
  var _a3, _b;
  const os = (_b = (_a3 = window._wails) == null ? void 0 : _a3.environment) == null ? void 0 : _b.OS;
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
  for (const ev of ["click", "contextmenu", "dblclick"]) {
    window.addEventListener(ev, suppressEvent, { capture: true });
  }
  dragInitDone = true;
}
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
    if (++dragEnvPolls > 100) {
      window.clearInterval(dragEnvPoll);
    }
  }, 50);
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
  const style = window.getComputedStyle(target);
  return style.getPropertyValue("--wails-draggable").trim() === "drag" && event.offsetX >= 0 && event.offsetX < target.clientWidth && event.offsetY >= 0 && event.offsetY < target.clientHeight;
}
var MouseDown = 0;
var MouseUp = 1;
var MouseMove = 2;
function update(event) {
  let eventType, eventButtons = event.buttons;
  switch (event.type) {
    case "mousedown":
      eventType = MouseDown;
      if (!buttonsTracked) {
        eventButtons = buttons | 1 << event.button;
      }
      break;
    case "mouseup":
      eventType = MouseUp;
      if (!buttonsTracked) {
        eventButtons = buttons & ~(1 << event.button);
      }
      break;
    default:
      eventType = MouseMove;
      if (!buttonsTracked) {
        eventButtons = buttons;
      }
      break;
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
  if (released & 1) {
    primaryUp(event);
  }
  if (pressed & 1) {
    primaryDown(event);
  }
  if (eventType === MouseMove) {
    onMouseMove(event);
  }
  ;
}
function primaryDown(event) {
  canDrag = false;
  canResize = false;
  if (!IsWindows()) {
    if (event.type === "mousedown" && event.button === 0 && event.detail !== 1) {
      return;
    }
  }
  if (resizeEdge) {
    if (event.type !== "mousedown") {
      return;
    }
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
var cursorForEdge = Object.freeze({
  "se-resize": "nwse-resize",
  "sw-resize": "nesw-resize",
  "nw-resize": "nwse-resize",
  "ne-resize": "nesw-resize",
  "w-resize": "ew-resize",
  "n-resize": "ns-resize",
  "s-resize": "ns-resize",
  "e-resize": "ew-resize"
});
function setResize(edge) {
  if (edge) {
    if (!resizeEdge) {
      defaultCursor = document.body.style.cursor;
    }
    document.body.style.cursor = cursorForEdge[edge];
  } else if (!edge && resizeEdge) {
    document.body.style.cursor = defaultCursor;
  }
  resizeEdge = edge || "";
}
function onMouseMove(event) {
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
    if (resizeEdge) {
      setResize();
    }
    return;
  }
  const resizeHandleHeight = GetFlag("system.resizeHandleHeight") || 5;
  const resizeHandleWidth = GetFlag("system.resizeHandleWidth") || 5;
  const cornerExtra = GetFlag("resizeCornerExtra") || 10;
  const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  const scrollbarHeight = Math.max(0, window.innerHeight - document.documentElement.clientHeight);
  const rightContentEdge = window.innerWidth - scrollbarWidth;
  const bottomContentEdge = window.innerHeight - scrollbarHeight;
  const rightBorder = event.clientX < rightContentEdge && rightContentEdge - event.clientX < resizeHandleWidth;
  const leftBorder = event.clientX < resizeHandleWidth;
  const topBorder = event.clientY < resizeHandleHeight;
  const bottomBorder = event.clientY < bottomContentEdge && bottomContentEdge - event.clientY < resizeHandleHeight;
  const rightCorner = event.clientX < rightContentEdge && rightContentEdge - event.clientX < resizeHandleWidth + cornerExtra;
  const leftCorner = event.clientX < resizeHandleWidth + cornerExtra;
  const topCorner = event.clientY < resizeHandleHeight + cornerExtra;
  const bottomCorner = event.clientY < bottomContentEdge && bottomContentEdge - event.clientY < resizeHandleHeight + cornerExtra;
  if (!leftCorner && !topCorner && !bottomCorner && !rightCorner) {
    setResize();
  } else if (rightCorner && bottomCorner) setResize("se-resize");
  else if (leftCorner && bottomCorner) setResize("sw-resize");
  else if (leftCorner && topCorner) setResize("nw-resize");
  else if (topCorner && rightCorner) setResize("ne-resize");
  else if (leftBorder) setResize("w-resize");
  else if (topBorder) setResize("n-resize");
  else if (bottomBorder) setResize("s-resize");
  else if (rightBorder) setResize("e-resize");
  else setResize();
}

// internal/runtime/desktop/@wailsio/runtime/src/appregion.ts
var regionProperty = "--wails-non-client-region";
var runtimeConfigReadyEvent = "wails:runtime-config-ready";
var validRegions = /* @__PURE__ */ new Set(["caption", "minimize", "maximize", "close"]);
if (hasDOM) {
  window._wails = window._wails || {};
}
var updatePending = false;
var lastPayload = "";
var observedElements = /* @__PURE__ */ new Set();
var resizeObserver;
var trackingStarted = false;
function normaliseRegionKind(value) {
  const region = value.trim().toLowerCase();
  if (validRegions.has(region)) {
    return region;
  }
  return void 0;
}
function nonClientRegionForElement(element) {
  if (!(element instanceof HTMLElement)) {
    return void 0;
  }
  const style = window.getComputedStyle(element);
  const region = normaliseRegionKind(style.getPropertyValue(regionProperty));
  if (!region) {
    return void 0;
  }
  const parent = element.parentElement;
  if (parent) {
    const parentStyle = window.getComputedStyle(parent);
    if (normaliseRegionKind(parentStyle.getPropertyValue(regionProperty)) === region) {
      return void 0;
    }
  }
  return region;
}
function isVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.contentVisibility !== "hidden";
}
function elementRegion(element) {
  if (!(element instanceof HTMLElement)) {
    return void 0;
  }
  const kind = nonClientRegionForElement(element);
  if (!kind || !isVisible(element)) {
    return void 0;
  }
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return void 0;
  }
  const scale = window.devicePixelRatio || 1;
  const left = Math.floor(rect.left * scale);
  const top = Math.floor(rect.top * scale);
  const right = Math.ceil(rect.right * scale);
  const bottom = Math.ceil(rect.bottom * scale);
  if (right <= left || bottom <= top) {
    return void 0;
  }
  return { kind, left, top, right, bottom };
}
function regionElements() {
  const elements = [];
  if (document.documentElement) {
    elements.push(document.documentElement);
  }
  if (document.body) {
    elements.push(document.body);
    for (const element of document.body.querySelectorAll("*")) {
      elements.push(element);
    }
  }
  return elements;
}
function observeRegionElements(elements) {
  if (typeof ResizeObserver === "undefined") {
    return;
  }
  resizeObserver != null ? resizeObserver : resizeObserver = new ResizeObserver(scheduleUpdate);
  const nextElements = new Set(elements);
  for (const element of observedElements) {
    if (!nextElements.has(element)) {
      resizeObserver.unobserve(element);
    }
  }
  for (const element of nextElements) {
    if (!observedElements.has(element)) {
      resizeObserver.observe(element);
    }
  }
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
  const payload = JSON.stringify({ version: 1, regions });
  if (payload === lastPayload) {
    return;
  }
  lastPayload = payload;
  invoke("wails:non-client-region:" + payload);
}
function scheduleUpdate() {
  if (updatePending) {
    return;
  }
  updatePending = true;
  window.requestAnimationFrame(updateNonClientRegions);
}
function startNonClientRegionTracking() {
  var _a3, _b;
  if (trackingStarted) {
    return;
  }
  trackingStarted = true;
  scheduleUpdate();
  const mutationObserver = new MutationObserver(scheduleUpdate);
  mutationObserver.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true
  });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("scroll", scheduleUpdate, true);
  (_a3 = window.visualViewport) == null ? void 0 : _a3.addEventListener("resize", scheduleUpdate);
  (_b = window.visualViewport) == null ? void 0 : _b.addEventListener("scroll", scheduleUpdate);
}
function tryStartNonClientRegionTracking() {
  var _a3, _b;
  const os = (_a3 = window._wails.environment) == null ? void 0 : _a3.OS;
  if (os === void 0) {
    return false;
  }
  const enabled = (_b = window._wails.flags) == null ? void 0 : _b.nonClientRegionTracking;
  if (os === "windows") {
    if (enabled === true) {
      whenReady(startNonClientRegionTracking);
    }
    return true;
  }
  return true;
}
if (hasDOM && !tryStartNonClientRegionTracking()) {
  window.addEventListener(runtimeConfigReadyEvent, tryStartNonClientRegionTracking, { once: true });
}

// internal/runtime/desktop/@wailsio/runtime/src/application.ts
var application_exports = {};
__export(application_exports, {
  Hide: () => Hide,
  Quit: () => Quit,
  Show: () => Show
});
var call6 = newRuntimeCaller(objectNames.Application);
var HideMethod2 = 0;
var ShowMethod2 = 1;
var QuitMethod = 2;
function Hide() {
  return call6(HideMethod2);
}
function Show() {
  return call6(ShowMethod2);
}
function Quit() {
  return call6(QuitMethod);
}

// internal/runtime/desktop/@wailsio/runtime/src/calls.ts
var calls_exports = {};
__export(calls_exports, {
  ByID: () => ByID,
  ByName: () => ByName,
  Call: () => Call,
  RuntimeError: () => RuntimeError
});

// internal/runtime/desktop/@wailsio/runtime/src/callable.ts
var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") {
  try {
    badArrayLike = Object.defineProperty({}, "length", {
      get: function() {
        throw isCallableMarker;
      }
    });
    isCallableMarker = {};
    reflectApply(function() {
      throw 42;
    }, null, badArrayLike);
  } catch (_) {
    if (_ !== isCallableMarker) {
      reflectApply = null;
    }
  }
} else {
  reflectApply = null;
}
var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
  try {
    var fnStr = fnToStr.call(value);
    return constructorRegex.test(fnStr);
  } catch (e) {
    return false;
  }
};
var tryFunctionObject = function tryFunctionToStr(value) {
  try {
    if (isES6ClassFn(value)) {
      return false;
    }
    fnToStr.call(value);
    return true;
  } catch (e) {
    return false;
  }
};
var toStr = Object.prototype.toString;
var objectClass = "[object Object]";
var fnClass = "[object Function]";
var genClass = "[object GeneratorFunction]";
var ddaClass = "[object HTMLAllCollection]";
var ddaClass2 = "[object HTML document.all class]";
var ddaClass3 = "[object HTMLCollection]";
var hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
var isIE68 = !(0 in [,]);
var isDDA = function isDocumentDotAll() {
  return false;
};
if (typeof document === "object") {
  all = document.all;
  if (toStr.call(all) === toStr.call(document.all)) {
    isDDA = function isDocumentDotAll2(value) {
      if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) {
        try {
          var str = toStr.call(value);
          return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
        } catch (e) {
        }
      }
      return false;
    };
  }
}
var all;
function isCallableRefApply(value) {
  if (isDDA(value)) {
    return true;
  }
  if (!value) {
    return false;
  }
  if (typeof value !== "function" && typeof value !== "object") {
    return false;
  }
  try {
    reflectApply(value, null, badArrayLike);
  } catch (e) {
    if (e !== isCallableMarker) {
      return false;
    }
  }
  return !isES6ClassFn(value) && tryFunctionObject(value);
}
function isCallableNoRefApply(value) {
  if (isDDA(value)) {
    return true;
  }
  if (!value) {
    return false;
  }
  if (typeof value !== "function" && typeof value !== "object") {
    return false;
  }
  if (hasToStringTag) {
    return tryFunctionObject(value);
  }
  if (isES6ClassFn(value)) {
    return false;
  }
  var strClass = toStr.call(value);
  if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) {
    return false;
  }
  return tryFunctionObject(value);
}
var callable_default = reflectApply ? isCallableRefApply : isCallableNoRefApply;

// internal/runtime/desktop/@wailsio/runtime/src/cancellable.ts
var CancelError = class extends Error {
  /**
   * Constructs a new `CancelError` instance.
   * @param message - The error message.
   * @param options - Options to be forwarded to the Error constructor.
   */
  constructor(message, options) {
    super(message, options);
    this.name = "CancelError";
  }
};
var CancelledRejectionError = class extends Error {
  /**
   * Constructs a new `CancelledRejectionError` instance.
   * @param promise - The promise that caused the error originally.
   * @param reason - The rejection reason.
   * @param info - An optional informative message specifying the circumstances in which the error was thrown.
   *               Defaults to the string `"Unhandled rejection in cancelled promise."`.
   */
  constructor(promise, reason, info) {
    super((info != null ? info : "Unhandled rejection in cancelled promise.") + " Reason: " + errorMessage(reason), { cause: reason });
    this.promise = promise;
    this.name = "CancelledRejectionError";
  }
};
var barrierSym = /* @__PURE__ */ Symbol("barrier");
var cancelImplSym = /* @__PURE__ */ Symbol("cancelImpl");
var _a2;
var species = (_a2 = Symbol.species) != null ? _a2 : /* @__PURE__ */ Symbol("speciesPolyfill");
var CancellablePromise = class _CancellablePromise extends Promise {
  /**
   * Creates a new `CancellablePromise`.
   *
   * @param executor - A callback used to initialize the promise. This callback is passed two arguments:
   *                   a `resolve` callback used to resolve the promise with a value
   *                   or the result of another promise (possibly cancellable),
   *                   and a `reject` callback used to reject the promise with a provided reason or error.
   *                   If the value provided to the `resolve` callback is a thenable _and_ cancellable object
   *                   (it has a `then` _and_ a `cancel` method),
   *                   cancellation requests will be forwarded to that object and the oncancelled will not be invoked anymore.
   *                   If any one of the two callbacks is called _after_ the promise has been cancelled,
   *                   the provided values will be cancelled and resolved as usual,
   *                   but their results will be discarded.
   *                   However, if the resolution process ultimately ends up in a rejection
   *                   that is not due to cancellation, the rejection reason
   *                   will be wrapped in a {@link CancelledRejectionError}
   *                   and bubbled up as an unhandled rejection.
   * @param oncancelled - It is the caller's responsibility to ensure that any operation
   *                      started by the executor is properly halted upon cancellation.
   *                      This optional callback can be used to that purpose.
   *                      It will be called _synchronously_ with a cancellation cause
   *                      when cancellation is requested, _after_ the promise has already rejected
   *                      with a {@link CancelError}, but _before_
   *                      any {@link then}/{@link catch}/{@link finally} callback runs.
   *                      If the callback returns a thenable, the promise returned from {@link cancel}
   *                      will only fulfill after the former has settled.
   *                      Unhandled exceptions or rejections from the callback will be wrapped
   *                      in a {@link CancelledRejectionError} and bubbled up as unhandled rejections.
   *                      If the `resolve` callback is called before cancellation with a cancellable promise,
   *                      cancellation requests on this promise will be diverted to that promise,
   *                      and the original `oncancelled` callback will be discarded.
   */
  constructor(executor, oncancelled) {
    let resolve;
    let reject;
    super((res, rej) => {
      resolve = res;
      reject = rej;
    });
    if (this.constructor[species] !== Promise) {
      throw new TypeError("CancellablePromise does not support transparent subclassing. Please refrain from overriding the [Symbol.species] static property.");
    }
    let promise = {
      promise: this,
      resolve,
      reject,
      get oncancelled() {
        return oncancelled != null ? oncancelled : null;
      },
      set oncancelled(cb) {
        oncancelled = cb != null ? cb : void 0;
      }
    };
    const state = {
      get root() {
        return state;
      },
      resolving: false,
      settled: false
    };
    void Object.defineProperties(this, {
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
      if (state.resolving) {
        console.log("Unhandled exception in CancellablePromise executor.", err);
      } else {
        rejector(err);
      }
    }
  }
  /**
   * Cancels immediately the execution of the operation associated with this promise.
   * The promise rejects with a {@link CancelError} instance as reason,
   * with the {@link CancelError#cause} property set to the given argument, if any.
   *
   * Has no effect if called after the promise has already settled;
   * repeated calls in particular are safe, but only the first one
   * will set the cancellation cause.
   *
   * The `CancelError` exception _need not_ be handled explicitly _on the promises that are being cancelled:_
   * cancelling a promise with no attached rejection handler does not trigger an unhandled rejection event.
   * Therefore, the following idioms are all equally correct:
   * ```ts
   * new CancellablePromise((resolve, reject) => { ... }).cancel();
   * new CancellablePromise((resolve, reject) => { ... }).then(...).cancel();
   * new CancellablePromise((resolve, reject) => { ... }).then(...).catch(...).cancel();
   * ```
   * Whenever some cancelled promise in a chain rejects with a `CancelError`
   * with the same cancellation cause as itself, the error will be discarded silently.
   * However, the `CancelError` _will still be delivered_ to all attached rejection handlers
   * added by {@link then} and related methods:
   * ```ts
   * let cancellable = new CancellablePromise((resolve, reject) => { ... });
   * cancellable.then(() => { ... }).catch(console.log);
   * cancellable.cancel(); // A CancelError is printed to the console.
   * ```
   * If the `CancelError` is not handled downstream by the time it reaches
   * a _non-cancelled_ promise, it _will_ trigger an unhandled rejection event,
   * just like normal rejections would:
   * ```ts
   * let cancellable = new CancellablePromise((resolve, reject) => { ... });
   * let chained = cancellable.then(() => { ... }).then(() => { ... }); // No catch...
   * cancellable.cancel(); // Unhandled rejection event on chained!
   * ```
   * Therefore, it is important to either cancel whole promise chains from their tail,
   * as shown in the correct idioms above, or take care of handling errors everywhere.
   *
   * @returns A cancellable promise that _fulfills_ after the cancel callback (if any)
   * and all handlers attached up to the call to cancel have run.
   * If the cancel callback returns a thenable, the promise returned by `cancel`
   * will also wait for that thenable to settle.
   * This enables callers to wait for the cancelled operation to terminate
   * without being forced to handle potential errors at the call site.
   * ```ts
   * cancellable.cancel().then(() => {
   *     // Cleanup finished, it's safe to do something else.
   * }, (err) => {
   *     // Unreachable: the promise returned from cancel will never reject.
   * });
   * ```
   * Note that the returned promise will _not_ handle implicitly any rejection
   * that might have occurred already in the cancelled chain.
   * It will just track whether registered handlers have been executed or not.
   * Therefore, unhandled rejections will never be silently handled by calling cancel.
   */
  cancel(cause) {
    return new _CancellablePromise((resolve) => {
      Promise.all([
        this[cancelImplSym](new CancelError("Promise cancelled.", { cause })),
        currentBarrier(this)
      ]).then(() => resolve(), () => resolve());
    });
  }
  /**
   * Binds promise cancellation to the abort event of the given {@link AbortSignal}.
   * If the signal has already aborted, the promise will be cancelled immediately.
   * When either condition is verified, the cancellation cause will be set
   * to the signal's abort reason (see {@link AbortSignal#reason}).
   *
   * Has no effect if called (or if the signal aborts) _after_ the promise has already settled.
   * Only the first signal to abort will set the cancellation cause.
   *
   * For more details about the cancellation process,
   * see {@link cancel} and the `CancellablePromise` constructor.
   *
   * This method enables `await`ing cancellable promises without having
   * to store them for future cancellation, e.g.:
   * ```ts
   * await longRunningOperation().cancelOn(signal);
   * ```
   * instead of:
   * ```ts
   * let promiseToBeCancelled = longRunningOperation();
   * await promiseToBeCancelled;
   * ```
   *
   * @returns This promise, for method chaining.
   */
  cancelOn(signal) {
    if (signal.aborted) {
      void this.cancel(signal.reason);
    } else {
      signal.addEventListener("abort", () => void this.cancel(signal.reason), { capture: true });
    }
    return this;
  }
  /**
   * Attaches callbacks for the resolution and/or rejection of the `CancellablePromise`.
   *
   * The optional `oncancelled` argument will be invoked when the returned promise is cancelled,
   * with the same semantics as the `oncancelled` argument of the constructor.
   * When the parent promise rejects or is cancelled, the `onrejected` callback will run,
   * _even after the returned promise has been cancelled:_
   * in that case, should it reject or throw, the reason will be wrapped
   * in a {@link CancelledRejectionError} and bubbled up as an unhandled rejection.
   *
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A `CancellablePromise` for the completion of whichever callback is executed.
   * The returned promise is hooked up to propagate cancellation requests up the chain, but not down:
   *
   *   - if the parent promise is cancelled, the `onrejected` handler will be invoked with a `CancelError`
   *     and the returned promise _will resolve regularly_ with its result;
   *   - conversely, if the returned promise is cancelled, _the parent promise is cancelled too;_
   *     the `onrejected` handler will still be invoked with the parent's `CancelError`,
   *     but its result will be discarded
   *     and the returned promise will reject with a `CancelError` as well.
   *
   * The promise returned from {@link cancel} will fulfill only after all attached handlers
   * up the entire promise chain have been run.
   *
   * If either callback returns a cancellable promise,
   * cancellation requests will be diverted to it,
   * and the specified `oncancelled` callback will be discarded.
   */
  then(onfulfilled, onrejected, oncancelled) {
    if (!(this instanceof _CancellablePromise)) {
      throw new TypeError("CancellablePromise.prototype.then called on an invalid object.");
    }
    if (!callable_default(onfulfilled)) {
      onfulfilled = identity;
    }
    if (!callable_default(onrejected)) {
      onrejected = thrower;
    }
    if (onfulfilled === identity && onrejected == thrower) {
      return new _CancellablePromise((resolve) => resolve(this));
    }
    const barrier = {};
    this[barrierSym] = barrier;
    return new _CancellablePromise((resolve, reject) => {
      void super.then(
        (value) => {
          var _a3;
          if (this[barrierSym] === barrier) {
            this[barrierSym] = null;
          }
          (_a3 = barrier.resolve) == null ? void 0 : _a3.call(barrier);
          try {
            resolve(onfulfilled(value));
          } catch (err) {
            reject(err);
          }
        },
        (reason) => {
          var _a3;
          if (this[barrierSym] === barrier) {
            this[barrierSym] = null;
          }
          (_a3 = barrier.resolve) == null ? void 0 : _a3.call(barrier);
          try {
            resolve(onrejected(reason));
          } catch (err) {
            reject(err);
          }
        }
      );
    }, async (cause) => {
      try {
        return oncancelled == null ? void 0 : oncancelled(cause);
      } finally {
        await this.cancel(cause);
      }
    });
  }
  /**
   * Attaches a callback for only the rejection of the Promise.
   *
   * The optional `oncancelled` argument will be invoked when the returned promise is cancelled,
   * with the same semantics as the `oncancelled` argument of the constructor.
   * When the parent promise rejects or is cancelled, the `onrejected` callback will run,
   * _even after the returned promise has been cancelled:_
   * in that case, should it reject or throw, the reason will be wrapped
   * in a {@link CancelledRejectionError} and bubbled up as an unhandled rejection.
   *
   * It is equivalent to
   * ```ts
   * cancellablePromise.then(undefined, onrejected, oncancelled);
   * ```
   * and the same caveats apply.
   *
   * @returns A Promise for the completion of the callback.
   * Cancellation requests on the returned promise
   * will propagate up the chain to the parent promise,
   * but not in the other direction.
   *
   * The promise returned from {@link cancel} will fulfill only after all attached handlers
   * up the entire promise chain have been run.
   *
   * If `onrejected` returns a cancellable promise,
   * cancellation requests will be diverted to it,
   * and the specified `oncancelled` callback will be discarded.
   * See {@link then} for more details.
   */
  catch(onrejected, oncancelled) {
    return this.then(void 0, onrejected, oncancelled);
  }
  /**
   * Attaches a callback that is invoked when the CancellablePromise is settled (fulfilled or rejected). The
   * resolved value cannot be accessed or modified from the callback.
   * The returned promise will settle in the same state as the original one
   * after the provided callback has completed execution,
   * unless the callback throws or returns a rejecting promise,
   * in which case the returned promise will reject as well.
   *
   * The optional `oncancelled` argument will be invoked when the returned promise is cancelled,
   * with the same semantics as the `oncancelled` argument of the constructor.
   * Once the parent promise settles, the `onfinally` callback will run,
   * _even after the returned promise has been cancelled:_
   * in that case, should it reject or throw, the reason will be wrapped
   * in a {@link CancelledRejectionError} and bubbled up as an unhandled rejection.
   *
   * This method is implemented in terms of {@link then} and the same caveats apply.
   * It is polyfilled, hence available in every OS/webview version.
   *
   * @returns A Promise for the completion of the callback.
   * Cancellation requests on the returned promise
   * will propagate up the chain to the parent promise,
   * but not in the other direction.
   *
   * The promise returned from {@link cancel} will fulfill only after all attached handlers
   * up the entire promise chain have been run.
   *
   * If `onfinally` returns a cancellable promise,
   * cancellation requests will be diverted to it,
   * and the specified `oncancelled` callback will be discarded.
   * See {@link then} for more details.
   */
  finally(onfinally, oncancelled) {
    if (!(this instanceof _CancellablePromise)) {
      throw new TypeError("CancellablePromise.prototype.finally called on an invalid object.");
    }
    if (!callable_default(onfinally)) {
      return this.then(onfinally, onfinally, oncancelled);
    }
    return this.then(
      (value) => _CancellablePromise.resolve(onfinally()).then(() => value),
      (reason) => _CancellablePromise.resolve(onfinally()).then(() => {
        throw reason;
      }),
      oncancelled
    );
  }
  /**
   * We use the `[Symbol.species]` static property, if available,
   * to disable the built-in automatic subclassing features from {@link Promise}.
   * It is critical for performance reasons that extenders do not override this.
   * Once the proposal at https://github.com/tc39/proposal-rm-builtin-subclassing
   * is either accepted or retired, this implementation will have to be revised accordingly.
   *
   * @ignore
   * @internal
   */
  static get [(barrierSym, cancelImplSym, species)]() {
    return Promise;
  }
  static all(values) {
    let collected = Array.from(values);
    const promise = collected.length === 0 ? _CancellablePromise.resolve(collected) : new _CancellablePromise((resolve, reject) => {
      void Promise.all(collected).then(resolve, reject);
    }, (cause) => cancelAll(promise, collected, cause));
    return promise;
  }
  static allSettled(values) {
    let collected = Array.from(values);
    const promise = collected.length === 0 ? _CancellablePromise.resolve(collected) : new _CancellablePromise((resolve, reject) => {
      void Promise.allSettled(collected).then(resolve, reject);
    }, (cause) => cancelAll(promise, collected, cause));
    return promise;
  }
  static any(values) {
    let collected = Array.from(values);
    const promise = collected.length === 0 ? _CancellablePromise.resolve(collected) : new _CancellablePromise((resolve, reject) => {
      void Promise.any(collected).then(resolve, reject);
    }, (cause) => cancelAll(promise, collected, cause));
    return promise;
  }
  static race(values) {
    let collected = Array.from(values);
    const promise = new _CancellablePromise((resolve, reject) => {
      void Promise.race(collected).then(resolve, reject);
    }, (cause) => cancelAll(promise, collected, cause));
    return promise;
  }
  /**
   * Creates a new cancelled CancellablePromise for the provided cause.
   *
   * @group Static Methods
   */
  static cancel(cause) {
    const p = new _CancellablePromise(() => {
    });
    p.cancel(cause);
    return p;
  }
  /**
   * Creates a new CancellablePromise that cancels
   * after the specified timeout, with the provided cause.
   *
   * If the {@link AbortSignal.timeout} factory method is available,
   * it is used to base the timeout on _active_ time rather than _elapsed_ time.
   * Otherwise, `timeout` falls back to {@link setTimeout}.
   *
   * @group Static Methods
   */
  static timeout(milliseconds, cause) {
    const promise = new _CancellablePromise(() => {
    });
    if (AbortSignal && typeof AbortSignal === "function" && AbortSignal.timeout && typeof AbortSignal.timeout === "function") {
      AbortSignal.timeout(milliseconds).addEventListener("abort", () => void promise.cancel(cause));
    } else {
      setTimeout(() => void promise.cancel(cause), milliseconds);
    }
    return promise;
  }
  static sleep(milliseconds, value) {
    return new _CancellablePromise((resolve) => {
      setTimeout(() => resolve(value), milliseconds);
    });
  }
  /**
   * Creates a new rejected CancellablePromise for the provided reason.
   *
   * @group Static Methods
   */
  static reject(reason) {
    return new _CancellablePromise((_, reject) => reject(reason));
  }
  static resolve(value) {
    if (value instanceof _CancellablePromise) {
      return value;
    }
    return new _CancellablePromise((resolve) => resolve(value));
  }
  /**
   * Creates a new CancellablePromise and returns it in an object, along with its resolve and reject functions
   * and a getter/setter for the cancellation callback.
   *
   * This method is polyfilled, hence available in every OS/webview version.
   *
   * @group Static Methods
   */
  static withResolvers() {
    let result = { oncancelled: null };
    result.promise = new _CancellablePromise((resolve, reject) => {
      result.resolve = resolve;
      result.reject = reject;
    }, (cause) => {
      var _a3;
      (_a3 = result.oncancelled) == null ? void 0 : _a3.call(result, cause);
    });
    return result;
  }
};
function cancellerFor(promise, state) {
  let cancellationPromise = void 0;
  return (reason) => {
    if (!state.settled) {
      state.settled = true;
      state.reason = reason;
      promise.reject(reason);
      void Promise.prototype.then.call(promise.promise, void 0, (err) => {
        if (err !== reason) {
          throw err;
        }
      });
    }
    if (!state.reason || !promise.oncancelled) {
      return;
    }
    cancellationPromise = new Promise((resolve) => {
      try {
        resolve(promise.oncancelled(state.reason.cause));
      } catch (err) {
        Promise.reject(new CancelledRejectionError(promise.promise, err, "Unhandled exception in oncancelled callback."));
      }
    }).catch((reason2) => {
      Promise.reject(new CancelledRejectionError(promise.promise, reason2, "Unhandled rejection in oncancelled callback."));
    });
    promise.oncancelled = null;
    return cancellationPromise;
  };
}
function resolverFor(promise, state) {
  return (value) => {
    if (state.resolving) {
      return;
    }
    state.resolving = true;
    if (value === promise.promise) {
      if (state.settled) {
        return;
      }
      state.settled = true;
      promise.reject(new TypeError("A promise cannot be resolved with itself."));
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
            if (state.reason) {
              void cancellerFor(__spreadProps(__spreadValues({}, promise), { oncancelled }), state)(state.reason);
            } else {
              promise.oncancelled = oncancelled;
            }
          }
        } catch (e) {
        }
        const newState = {
          root: state.root,
          resolving: false,
          get settled() {
            return this.root.settled;
          },
          set settled(value2) {
            this.root.settled = value2;
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
    if (state.settled) {
      return;
    }
    state.settled = true;
    promise.resolve(value);
  };
}
function rejectorFor(promise, state) {
  return (reason) => {
    if (state.resolving) {
      return;
    }
    state.resolving = true;
    if (state.settled) {
      try {
        if (reason instanceof CancelError && state.reason instanceof CancelError && Object.is(reason.cause, state.reason.cause)) {
          return;
        }
      } catch (e) {
      }
      void Promise.reject(new CancelledRejectionError(promise.promise, reason));
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
      if (!callable_default(value.then)) {
        continue;
      }
      cancel = value.cancel;
      if (!callable_default(cancel)) {
        continue;
      }
    } catch (e) {
      continue;
    }
    let result;
    try {
      result = Reflect.apply(cancel, value, [cause]);
    } catch (err) {
      Promise.reject(new CancelledRejectionError(parent, err, "Unhandled exception in cancel method."));
      continue;
    }
    if (!result) {
      continue;
    }
    results.push(
      (result instanceof Promise ? result : Promise.resolve(result)).catch((reason) => {
        Promise.reject(new CancelledRejectionError(parent, reason, "Unhandled rejection in cancel method."));
      })
    );
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
    if (err instanceof Error || typeof err !== "object" || err.toString !== Object.prototype.toString) {
      return "" + err;
    }
  } catch (e) {
  }
  try {
    return JSON.stringify(err);
  } catch (e) {
  }
  try {
    return Object.prototype.toString.call(err);
  } catch (e) {
  }
  return "<could not convert error to string>";
}
function currentBarrier(promise) {
  var _a3;
  let pwr = (_a3 = promise[barrierSym]) != null ? _a3 : {};
  if (!("promise" in pwr)) {
    Object.assign(pwr, promiseWithResolvers());
  }
  if (promise[barrierSym] == null) {
    pwr.resolve();
    promise[barrierSym] = pwr;
  }
  return pwr.promise;
}
var promiseWithResolvers = Promise.withResolvers;
if (promiseWithResolvers && typeof promiseWithResolvers === "function") {
  promiseWithResolvers = promiseWithResolvers.bind(Promise);
} else {
  promiseWithResolvers = function() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// internal/runtime/desktop/@wailsio/runtime/src/calls.ts
if (hasDOM) {
  window._wails = window._wails || {};
}
var call7 = newRuntimeCaller(objectNames.Call);
var cancelCall = newRuntimeCaller(objectNames.CancelCall);
var callResponses = /* @__PURE__ */ new Map();
var CallBinding = 0;
var CancelMethod = 0;
function generateID() {
  let result;
  do {
    result = nanoid();
  } while (callResponses.has(result));
  return result;
}
function Call(options) {
  const id = generateID();
  const result = CancellablePromise.withResolvers();
  callResponses.set(id, { resolve: result.resolve, reject: result.reject });
  const request = call7(CallBinding, Object.assign({ "call-id": id }, options));
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
    if (running) {
      return cancel();
    } else {
      return request.then(cancel);
    }
  };
  return result.promise;
}
function ByName(methodName, ...args) {
  return Call({ methodName, args });
}
function ByID(methodID, ...args) {
  return Call({ methodID, args });
}

// internal/runtime/desktop/@wailsio/runtime/src/clipboard.ts
var clipboard_exports = {};
__export(clipboard_exports, {
  SetText: () => SetText,
  Text: () => Text
});
var call8 = newRuntimeCaller(objectNames.Clipboard);
var ClipboardSetText = 0;
var ClipboardText = 1;
function SetText(text) {
  return call8(ClipboardSetText, { text });
}
function Text() {
  return call8(ClipboardText);
}

// internal/runtime/desktop/@wailsio/runtime/src/screens.ts
var screens_exports = {};
__export(screens_exports, {
  GetAll: () => GetAll,
  GetByID: () => GetByID,
  GetByIndex: () => GetByIndex,
  GetCurrent: () => GetCurrent,
  GetPrimary: () => GetPrimary
});
var call9 = newRuntimeCaller(objectNames.Screens);
var getAll = 0;
var getPrimary = 1;
var getCurrent = 2;
var getByID = 3;
var getByIndex = 4;
function GetAll() {
  return call9(getAll);
}
function GetPrimary() {
  return call9(getPrimary);
}
function GetCurrent() {
  return call9(getCurrent);
}
function GetByID(id) {
  return call9(getByID, { id });
}
function GetByIndex(index) {
  return call9(getByIndex, { index });
}

// internal/runtime/desktop/@wailsio/runtime/src/ios.ts
var ios_exports = {};
__export(ios_exports, {
  Device: () => Device,
  Haptics: () => Haptics
});
var call10 = newRuntimeCaller(objectNames.IOS);
var HapticsImpact = 0;
var DeviceInfo = 1;
var Haptics;
((Haptics3) => {
  function Impact(style = "medium") {
    return call10(HapticsImpact, { style });
  }
  Haptics3.Impact = Impact;
})(Haptics || (Haptics = {}));
var Device;
((Device3) => {
  function Info2() {
    return call10(DeviceInfo);
  }
  Device3.Info = Info2;
})(Device || (Device = {}));

// internal/runtime/desktop/@wailsio/runtime/src/android.ts
var android_exports = {};
__export(android_exports, {
  Device: () => Device2,
  Haptics: () => Haptics2,
  Toast: () => Toast
});
var call11 = newRuntimeCaller(objectNames.Android);
var HapticsVibrate = 0;
var DeviceInfo2 = 1;
var ToastShow = 2;
var Haptics2;
((Haptics3) => {
  function Vibrate(durationMs = 100) {
    return call11(HapticsVibrate, { duration: durationMs });
  }
  Haptics3.Vibrate = Vibrate;
})(Haptics2 || (Haptics2 = {}));
var Device2;
((Device3) => {
  function Info2() {
    return call11(DeviceInfo2);
  }
  Device3.Info = Info2;
})(Device2 || (Device2 = {}));
var Toast;
((Toast2) => {
  function Show2(message) {
    return call11(ToastShow, { message });
  }
  Toast2.Show = Show2;
})(Toast || (Toast = {}));

// internal/runtime/desktop/@wailsio/runtime/src/updater.ts
var updater_exports = {};
__export(updater_exports, {
  Events: () => Events2
});
var Events2 = Object.freeze({
  /** A Check round-trip is starting. Payload: null. */
  CheckStarted: "wails:updater:check-started",
  /** Check found a newer release. Payload: Release. */
  UpdateAvailable: "wails:updater:update-available",
  /** Check confirmed the caller is up to date. Payload: null. */
  NoUpdate: "wails:updater:no-update",
  /** Download is starting. Payload: Release. */
  DownloadStarted: "wails:updater:download-started",
  /** Periodic progress tick during download (~10 Hz). Payload: Progress. */
  DownloadProgress: "wails:updater:download-progress",
  /** All bytes are on disk, but verification has not yet started. Payload: Release. */
  DownloadComplete: "wails:updater:download-complete",
  /** Signature / digest verification has started. Payload: Release. */
  Verifying: "wails:updater:verifying",
  /** The Updater is swapping the binary into place. Payload: Release. */
  Installing: "wails:updater:installing",
  /** Update is staged and a restart is pending. Payload: Release. */
  UpdateReady: "wails:updater:update-ready",
  /** Something failed. Payload: ErrorInfo { stage, message, provider }. */
  Error: "wails:updater:error",
  /** Host-side context delivered once per session. Payload: Meta { currentVersion, skippedVersion }. */
  Meta: "wails:updater:meta",
  /** Sub-namespace: user-action events that the UI emits BACK to the host. */
  User: Object.freeze({
    /** User clicked Install on an Available update. */
    Install: "wails:updater:user:install",
    /** User clicked Restart & Apply on a Ready update. */
    Restart: "wails:updater:user:restart",
    /** User clicked Skip This Version. */
    Skip: "wails:updater:user:skip",
    /** User clicked Remind Me Later. */
    Remind: "wails:updater:user:remind",
    /** User clicked Close / Cancel. */
    Cancel: "wails:updater:user:cancel"
  }),
  /** Sub-namespace: framework-internal events the UI emits to coordinate
   *  with the host. Most app code can ignore these. */
  Window: Object.freeze({
    /** The window finished loading and asks the host to replay current state. */
    Ready: "wails:updater:window:ready"
  })
});

// internal/runtime/desktop/@wailsio/runtime/src/stream.ts
var GENERATION_KEY = "__wails_stream_generation";
var GENERATION_NAME_MARKER = "__wails_stream_generation__:";
function namedPageGeneration() {
  try {
    const marker = window.name.lastIndexOf(GENERATION_NAME_MARKER);
    if (marker < 0) return 0;
    const value = Number(window.name.slice(marker + GENERATION_NAME_MARKER.length));
    return Number.isSafeInteger(value) && value > 0 ? value : 0;
  } catch (e) {
    return 0;
  }
}
function rememberNamedPageGeneration(generation) {
  try {
    const marker = window.name.lastIndexOf(GENERATION_NAME_MARKER);
    const applicationName = marker < 0 ? window.name : window.name.slice(0, marker);
    window.name = applicationName + GENERATION_NAME_MARKER + generation;
  } catch (e) {
  }
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
  } catch (e) {
  }
  const next = Number.isSafeInteger(current) && current >= 0 && current < Number.MAX_SAFE_INTEGER ? Math.max(current + 1, pageTime) : pageTime;
  try {
    window.sessionStorage.setItem(GENERATION_KEY, String(next));
  } catch (e) {
  }
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
var G = streamGlobals();
var HDR_SESSION = "x-wails-stream-session";
var HDR_GENERATION = "x-wails-stream-generation";
var HDR_CONN = "x-wails-stream-conn";
var HDR_KIND = "x-wails-stream-kind";
var HDR_NAME = "x-wails-stream-name";
var HDR_CHUNK = "x-wails-stream-chunk";
var HDR_CHUNK_INDEX = "x-wails-stream-chunk-index";
var HDR_CHUNK_TOTAL = "x-wails-stream-chunk-total";
var HDR_BATCH = "x-wails-stream-batch";
var KIND_DATA = 0;
var KIND_OPEN = 1;
var KIND_CLOSE = 2;
var KIND_ERROR = 3;
var CHUNK_THRESHOLD2 = 512 * 1024;
var MAX_BATCH_FRAMES = 4096;
var BACKOFF_MIN = 250;
var BACKOFF_MAX = 5e3;
var textEncoder = new TextEncoder();
function streamURL(endpoint) {
  return window.location.origin + "/wails/stream/" + endpoint;
}
var StreamRequestCancelled = class extends Error {
  constructor() {
    super("stream request cancelled");
    this.name = "AbortError";
  }
};
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
var _WailsSocket = class _WailsSocket extends EventTarget {
  constructor(name) {
    super();
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;
    /** Always empty: subprotocols and extensions are not negotiated. */
    this.protocol = "";
    this.extensions = "";
    this.binaryType = "arraybuffer";
    this.readyState = _WailsSocket.CONNECTING;
    // Declared for the type; the constructor replaces each with an accessor
    // that registers a real listener. Calling them directly instead would make
    // any wrapper (see JSONStream) receive both the raw and the decoded event.
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    /**
     * @internal Applied to every inbound payload before dispatch. JSONStream
     * replaces it, so `onmessage` and `addEventListener("message", …)` see the
     * same decoded value — intercepting only `onmessage` made the two disagree.
     */
    this._decode = (payload) => payload;
    this._buffered = 0;
    // Sends are serialised per connection: concurrent fetch() POSTs do not
    // preserve order, and Go relies on send order being the order it observes.
    this._chain = Promise.resolve();
    this._pending = [];
    this._flushing = false;
    this._openAbort = new AbortController();
    this._sendAbort = new AbortController();
    this.name = name;
    this._id = G.nextConnID++;
    this.url = hasDOM ? streamURL("poll") + "#" + encodeURIComponent(name) : "";
    for (const type of ["open", "message", "close", "error"]) {
      defineHandlerProperty(this, type);
    }
    G.connections.set(this._id, this);
    this._chain = this._chain.then(
      () => postFrame(this._id, KIND_OPEN, new Uint8Array(0), name, this._openAbort.signal)
    ).catch((err) => {
      this._fail(err);
    });
    startPolling();
  }
  /** Bytes queued by send() that have not yet reached Go. */
  get bufferedAmount() {
    return this._buffered;
  }
  /**
   * Send a frame to Go. Accepts anything a WebSocket does; strings are
   * encoded as UTF-8, since Go receives every frame as a byte slice.
   */
  send(data) {
    if (this.readyState === _WailsSocket.CONNECTING) {
      throw new DOMException("Still in CONNECTING state.", "InvalidStateError");
    }
    if (this.readyState !== _WailsSocket.OPEN) {
      return;
    }
    const immediate = toBytesSync(data);
    const snapshot = immediate ? Promise.resolve(immediate) : toBytes(data, this._sendAbort.signal);
    void snapshot.catch(() => {
    });
    const blobSize = !immediate && typeof Blob !== "undefined" && data instanceof Blob ? data.size : 0;
    if (blobSize) {
      this._buffered += blobSize;
    }
    if (immediate) {
      this._buffered += immediate.byteLength;
    }
    this._pending.push(snapshot);
    if (this._flushing) return;
    this._flushing = true;
    this._chain = this._chain.then(async () => {
      try {
        while (this._pending.length > 0) {
          const queued = this._pending.splice(0, MAX_BATCH_FRAMES);
          const batch = await Promise.all(queued);
          if (this.readyState === _WailsSocket.CLOSED) {
            break;
          }
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
  /** Close the connection. Go's handler sees Receive fail and returns. */
  close(code = 1e3, reason = "") {
    if (this.readyState === _WailsSocket.CLOSING || this.readyState === _WailsSocket.CLOSED) {
      return;
    }
    this.readyState = _WailsSocket.CLOSING;
    this._pending.length = 0;
    this._buffered = 0;
    this._openAbort.abort();
    this._sendAbort.abort();
    this._chain = this._chain.then(
      () => postFrame(this._id, KIND_CLOSE, new Uint8Array(0))
    ).catch(() => {
    }).then(() => {
      this._closed(code, reason, true);
    });
  }
  /** @internal Called when the open frame comes back from Go. */
  _opened() {
    if (this.readyState !== _WailsSocket.CONNECTING) return;
    this.readyState = _WailsSocket.OPEN;
    this.dispatchEvent(new Event("open"));
  }
  /** @internal Called for each data frame addressed to this connection. */
  _message(payload) {
    if (this.readyState !== _WailsSocket.OPEN) return;
    let data;
    try {
      data = this._decode(payload);
    } catch (e) {
      this.dispatchEvent(new Event("error"));
      return;
    }
    if (data === payload && this.binaryType === "blob") {
      data = new Blob([payload]);
    }
    this.dispatchEvent(new MessageEvent("message", { data }));
  }
  /** @internal */
  _fail(err) {
    if (this.readyState === _WailsSocket.CLOSED || this.readyState === _WailsSocket.CLOSING) return;
    this.dispatchEvent(new Event("error"));
    this._closed(1006, err instanceof Error ? err.message : String(err), false);
  }
  /** @internal */
  _closed(code, reason, wasClean) {
    var _a3;
    if (this.readyState === _WailsSocket.CLOSED) return;
    this.readyState = _WailsSocket.CLOSED;
    this._openAbort.abort();
    this._sendAbort.abort();
    G.connections.delete(this._id);
    if (G.connections.size === 0) (_a3 = G.pollAbort) == null ? void 0 : _a3.abort();
    this._pending.length = 0;
    this._buffered = 0;
    const ev = typeof CloseEvent === "function" ? new CloseEvent("close", { code, reason, wasClean }) : Object.assign(new Event("close"), { code, reason, wasClean });
    this.dispatchEvent(ev);
  }
};
_WailsSocket.CONNECTING = 0;
_WailsSocket.OPEN = 1;
_WailsSocket.CLOSING = 2;
_WailsSocket.CLOSED = 3;
var WailsSocket = _WailsSocket;
function Stream(name) {
  var _a3;
  if (hasDOM) {
    const factory = (_a3 = window._wails) == null ? void 0 : _a3.streamFactory;
    if (typeof factory === "function") {
      return factory(name);
    }
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
  if (socket instanceof WailsSocket) {
    socket._decode = (payload) => parse(payload);
  } else {
    const native = socket;
    native.binaryType = "arraybuffer";
    const wrapped = /* @__PURE__ */ new WeakMap();
    const decodedEvents = /* @__PURE__ */ new WeakMap();
    const add = native.addEventListener.bind(native);
    const remove = native.removeEventListener.bind(native);
    const decodeEvent = (ev) => {
      var _a3;
      if (decodedEvents.has(ev)) return (_a3 = decodedEvents.get(ev)) != null ? _a3 : null;
      try {
        const value = parse(ev.data);
        const decoded = new MessageEvent("message", { data: value });
        decodedEvents.set(ev, decoded);
        return decoded;
      } catch (e) {
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
      remove(type, fn != null ? fn : listener, opts);
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
  if (typeof data === "string") {
    return textEncoder.encode(data);
  }
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return null;
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
  }
  return new Uint8Array(data).slice();
}
function abortable(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new StreamRequestCancelled());
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new StreamRequestCancelled());
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err);
      }
    );
  });
}
async function toBytes(data, signal) {
  if (typeof data === "string") {
    return textEncoder.encode(data);
  }
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return new Uint8Array(await abortable(data.arrayBuffer(), signal));
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
  }
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
  if (name !== void 0) {
    headers[HDR_NAME] = name;
  }
  if (body.byteLength <= CHUNK_THRESHOLD2) {
    await postWithRetry(headers, body, signal);
    return;
  }
  const chunkID = nanoid();
  const total = Math.ceil(body.byteLength / CHUNK_THRESHOLD2);
  for (let i = 0; i < total; i++) {
    const slice = body.subarray(i * CHUNK_THRESHOLD2, (i + 1) * CHUNK_THRESHOLD2);
    await postWithRetry(__spreadProps(__spreadValues({}, headers), {
      [HDR_CHUNK]: chunkID,
      [HDR_CHUNK_INDEX]: String(i),
      [HDR_CHUNK_TOTAL]: String(total)
    }), slice, signal);
  }
}
async function postWithRetry(headers, body, signal) {
  let wait = 1;
  for (; ; ) {
    if (signal == null ? void 0 : signal.aborted) throw new StreamRequestCancelled();
    const resp = await fetch(streamURL("send"), {
      method: "POST",
      headers,
      body,
      signal
    });
    if (resp.ok) return;
    if (resp.status !== 429) {
      throw new Error(await resp.text());
    }
    await sleep(wait, signal);
    wait = Math.min(wait * 2, 50);
  }
}
async function postBatch(connID, frames, signal) {
  let start = 0;
  while (start < frames.length) {
    if (frames[start].byteLength > CHUNK_THRESHOLD2) {
      await postFrame(connID, KIND_DATA, frames[start], void 0, signal);
      start++;
      continue;
    }
    let end = start;
    let size = 4;
    while (end < frames.length && end - start < MAX_BATCH_FRAMES) {
      const frame = frames[end];
      if (frame.byteLength > CHUNK_THRESHOLD2 || size + 4 + frame.byteLength > CHUNK_THRESHOLD2) {
        break;
      }
      size += 4 + frame.byteLength;
      end++;
    }
    if (end === start) {
      await postFrame(connID, KIND_DATA, frames[start], void 0, signal);
      start++;
      continue;
    }
    const group = frames.slice(start, end);
    if (group.length === 1) {
      await postFrame(connID, KIND_DATA, group[0], void 0, signal);
    } else {
      await postBatchGroup(connID, group, signal);
    }
    start = end;
  }
}
async function postBatchGroup(connID, frames, signal) {
  var _a3;
  if (frames.length === 0 || frames.length > MAX_BATCH_FRAMES) {
    throw new Error("invalid stream batch size");
  }
  let body = buildBatch(frames);
  let sent = 0;
  let wait = 1;
  for (; ; ) {
    if (signal == null ? void 0 : signal.aborted) throw new StreamRequestCancelled();
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
    if (resp.status !== 429) {
      throw new Error(await resp.text());
    }
    const accepted = Number((_a3 = resp.headers.get(HDR_BATCH)) != null ? _a3 : 0);
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
  void pollLoop();
}
async function pollLoop() {
  let backoff = 0;
  const abort = new AbortController();
  G.pollAbort = abort;
  while (G.connections.size > 0) {
    try {
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
        } catch (e) {
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
      } catch (e) {
        break;
      }
    }
  }
  if (G.pollAbort === abort) G.pollAbort = void 0;
  G.polling = false;
  if (G.connections.size > 0) {
    startPolling();
  }
}
function isRetryablePollStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500 && status <= 599;
}
function decodeFrames(buf) {
  if (buf.byteLength < 9) return null;
  const dv = new DataView(buf);
  if (dv.getUint8(0) !== 87 || dv.getUint8(1) !== 83 || dv.getUint8(2) !== 49 || dv.getUint8(3) !== 0 || (dv.getUint8(4) & ~1) !== 0) {
    return null;
  }
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
    frames.push({ connID, kind, payload });
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
      case KIND_ERROR:
        conn._fail(new Error(new TextDecoder().decode(payload)));
        break;
    }
  }
}
function closeAll(code, reason) {
  for (const conn of [...G.connections.values()]) {
    conn._closed(code, reason, false);
  }
}
function failAll(reason) {
  for (const conn of [...G.connections.values()]) {
    conn._fail(new Error(reason));
  }
}

// internal/runtime/desktop/@wailsio/runtime/src/index.ts
if (hasDOM) {
  window._wails = window._wails || {};
}
if (hasDOM) {
  window._wails.invoke = invoke;
  window._wails.clientId = clientId;
}
if (hasDOM) {
  window._wails.handlePlatformFileDrop = window_default.HandlePlatformFileDrop.bind(window_default);
}
if (hasDOM) {
  window._wails.handleDragEnter = handleDragEnter;
  window._wails.handleDragLeave = handleDragLeave;
  window._wails.handleDragOver = handleDragOver;
}
if (hasDOM) {
  invoke("wails:runtime:ready");
}
function loadOptionalScript(url) {
  return fetch(url, { method: "HEAD" }).then((response) => {
    if (response.ok) {
      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      if (contentType.includes("javascript")) {
        const script = document.createElement("script");
        script.src = url;
        document.head.appendChild(script);
      }
    }
  }).catch(() => {
  });
}
if (hasDOM) {
  loadOptionalScript("/wails/custom.js");
}
export {
  android_exports as Android,
  application_exports as Application,
  browser_exports as Browser,
  calls_exports as Call,
  CancelError,
  CancellablePromise,
  CancelledRejectionError,
  clipboard_exports as Clipboard,
  create_exports as Create,
  dialogs_exports as Dialogs,
  events_exports as Events,
  flags_exports as Flags,
  ios_exports as IOS,
  JSONStream,
  screens_exports as Screens,
  Stream,
  system_exports as System,
  updater_exports as Updater,
  wml_exports as WML,
  WailsSocket,
  window_default as Window,
  clientId,
  getTransport,
  loadOptionalScript,
  objectNames,
  setTransport
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2luZGV4LnRzIiwgIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy93bWwudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2Jyb3dzZXIudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL25hbm9pZC50cyIsICIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvZW52aXJvbm1lbnQudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL3J1bnRpbWUudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2RpYWxvZ3MudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2V2ZW50cy50cyIsICIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvbGlzdGVuZXIudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2NyZWF0ZS50cyIsICIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvZXZlbnRfdHlwZXMudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL3V0aWxzLnRzIiwgIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy93aW5kb3cudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL2NvbXBpbGVkL21haW4uanMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL3N5c3RlbS50cyIsICIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvY29udGV4dG1lbnUudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2ZsYWdzLnRzIiwgIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9kcmFnLnRzIiwgIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9hcHByZWdpb24udHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2FwcGxpY2F0aW9uLnRzIiwgIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9jYWxscy50cyIsICIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvY2FsbGFibGUudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2NhbmNlbGxhYmxlLnRzIiwgIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9jbGlwYm9hcmQudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL3NjcmVlbnMudHMiLCAiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2lvcy50cyIsICIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvYW5kcm9pZC50cyIsICIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvdXBkYXRlci50cyIsICIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvc3RyZWFtLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG4vLyBTZXR1cFxyXG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xyXG5cclxuaWYgKGhhc0RPTSkge1xyXG4gICAgd2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XHJcbn1cclxuXHJcbmltcG9ydCBcIi4vY29udGV4dG1lbnUuanNcIjtcclxuaW1wb3J0IFwiLi9kcmFnLmpzXCI7XHJcbmltcG9ydCBcIi4vYXBwcmVnaW9uLmpzXCI7XHJcblxyXG4vLyBSZS1leHBvcnQgcHVibGljIEFQSVxyXG5pbXBvcnQgKiBhcyBBcHBsaWNhdGlvbiBmcm9tIFwiLi9hcHBsaWNhdGlvbi5qc1wiO1xyXG5pbXBvcnQgKiBhcyBCcm93c2VyIGZyb20gXCIuL2Jyb3dzZXIuanNcIjtcclxuaW1wb3J0ICogYXMgQ2FsbCBmcm9tIFwiLi9jYWxscy5qc1wiO1xyXG5pbXBvcnQgKiBhcyBDbGlwYm9hcmQgZnJvbSBcIi4vY2xpcGJvYXJkLmpzXCI7XHJcbmltcG9ydCAqIGFzIENyZWF0ZSBmcm9tIFwiLi9jcmVhdGUuanNcIjtcclxuaW1wb3J0ICogYXMgRGlhbG9ncyBmcm9tIFwiLi9kaWFsb2dzLmpzXCI7XHJcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tIFwiLi9ldmVudHMuanNcIjtcclxuaW1wb3J0ICogYXMgRmxhZ3MgZnJvbSBcIi4vZmxhZ3MuanNcIjtcclxuaW1wb3J0ICogYXMgU2NyZWVucyBmcm9tIFwiLi9zY3JlZW5zLmpzXCI7XHJcbmltcG9ydCAqIGFzIFN5c3RlbSBmcm9tIFwiLi9zeXN0ZW0uanNcIjtcclxuaW1wb3J0ICogYXMgSU9TIGZyb20gXCIuL2lvcy5qc1wiO1xyXG5pbXBvcnQgKiBhcyBBbmRyb2lkIGZyb20gXCIuL2FuZHJvaWQuanNcIjtcclxuaW1wb3J0ICogYXMgVXBkYXRlciBmcm9tIFwiLi91cGRhdGVyLmpzXCI7XHJcbmltcG9ydCBXaW5kb3csIHsgaGFuZGxlRHJhZ0VudGVyLCBoYW5kbGVEcmFnTGVhdmUsIGhhbmRsZURyYWdPdmVyIH0gZnJvbSBcIi4vd2luZG93LmpzXCI7XHJcbmltcG9ydCAqIGFzIFdNTCBmcm9tIFwiLi93bWwuanNcIjtcclxuaW1wb3J0IHsgU3RyZWFtLCBKU09OU3RyZWFtLCBXYWlsc1NvY2tldCwgdHlwZSBKU09OU29ja2V0IH0gZnJvbSBcIi4vc3RyZWFtLmpzXCI7XHJcblxyXG5leHBvcnQge1xyXG4gICAgQXBwbGljYXRpb24sXHJcbiAgICBCcm93c2VyLFxyXG4gICAgQ2FsbCxcclxuICAgIENsaXBib2FyZCxcclxuICAgIERpYWxvZ3MsXHJcbiAgICBFdmVudHMsXHJcbiAgICBGbGFncyxcclxuICAgIFNjcmVlbnMsXHJcbiAgICBTeXN0ZW0sXHJcbiAgICBJT1MsXHJcbiAgICBBbmRyb2lkLFxyXG4gICAgVXBkYXRlcixcclxuICAgIFdpbmRvdyxcclxuICAgIFdNTCxcclxuICAgIFN0cmVhbSxcclxuICAgIEpTT05TdHJlYW0sXHJcbiAgICBXYWlsc1NvY2tldCxcclxuICAgIHR5cGUgSlNPTlNvY2tldFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFuIGludGVybmFsIHV0aWxpdHkgY29uc3VtZWQgYnkgdGhlIGJpbmRpbmcgZ2VuZXJhdG9yLlxyXG4gKlxyXG4gKiBAaWdub3JlXHJcbiAqL1xyXG5leHBvcnQgeyBDcmVhdGUgfTtcclxuXHJcbmV4cG9ydCAqIGZyb20gXCIuL2NhbmNlbGxhYmxlLmpzXCI7XHJcblxyXG4vLyBFeHBvcnQgdHJhbnNwb3J0IGludGVyZmFjZXMgYW5kIHV0aWxpdGllc1xyXG5leHBvcnQge1xyXG4gICAgc2V0VHJhbnNwb3J0LFxyXG4gICAgZ2V0VHJhbnNwb3J0LFxyXG4gICAgdHlwZSBSdW50aW1lVHJhbnNwb3J0LFxyXG4gICAgb2JqZWN0TmFtZXMsXHJcbiAgICBjbGllbnRJZCxcclxufSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XHJcblxyXG5pbXBvcnQgeyBjbGllbnRJZCB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuXHJcbi8vIE5vdGlmeSBiYWNrZW5kXHJcbmlmIChoYXNET00pIHtcclxuICAgIHdpbmRvdy5fd2FpbHMuaW52b2tlID0gU3lzdGVtLmludm9rZTtcclxuICAgIHdpbmRvdy5fd2FpbHMuY2xpZW50SWQgPSBjbGllbnRJZDtcclxufVxyXG5cclxuLy8gUmVnaXN0ZXIgcGxhdGZvcm0gaGFuZGxlcnMgKGludGVybmFsIEFQSSlcclxuLy8gTm90ZTogV2luZG93IGlzIHRoZSB0aGlzV2luZG93IGluc3RhbmNlIChkZWZhdWx0IGV4cG9ydCBmcm9tIHdpbmRvdy50cylcclxuLy8gQmluZGluZyBlbnN1cmVzICd0aGlzJyBjb3JyZWN0bHkgcmVmZXJzIHRvIHRoZSBjdXJyZW50IHdpbmRvdyBpbnN0YW5jZVxyXG5pZiAoaGFzRE9NKSB7XHJcbiAgICB3aW5kb3cuX3dhaWxzLmhhbmRsZVBsYXRmb3JtRmlsZURyb3AgPSBXaW5kb3cuSGFuZGxlUGxhdGZvcm1GaWxlRHJvcC5iaW5kKFdpbmRvdyk7XHJcbn1cclxuXHJcbi8vIExpbnV4LXNwZWNpZmljIGRyYWcgaGFuZGxlcnMgKEdUSyBpbnRlcmNlcHRzIERPTSBkcmFnIGV2ZW50cylcclxuaWYgKGhhc0RPTSkge1xyXG4gICAgd2luZG93Ll93YWlscy5oYW5kbGVEcmFnRW50ZXIgPSBoYW5kbGVEcmFnRW50ZXI7XHJcbiAgICB3aW5kb3cuX3dhaWxzLmhhbmRsZURyYWdMZWF2ZSA9IGhhbmRsZURyYWdMZWF2ZTtcclxuICAgIHdpbmRvdy5fd2FpbHMuaGFuZGxlRHJhZ092ZXIgPSBoYW5kbGVEcmFnT3ZlcjtcclxufVxyXG5cclxuaWYgKGhhc0RPTSkge1xyXG4gICAgU3lzdGVtLmludm9rZShcIndhaWxzOnJ1bnRpbWU6cmVhZHlcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBMb2FkcyBhIHNjcmlwdCBmcm9tIHRoZSBnaXZlbiBVUkwgaWYgaXQgZXhpc3RzLlxyXG4gKiBVc2VzIEhFQUQgcmVxdWVzdCB0byBjaGVjayBleGlzdGVuY2UsIHRoZW4gaW5qZWN0cyBhIHNjcmlwdCB0YWcuXHJcbiAqIFNpbGVudGx5IGlnbm9yZXMgaWYgdGhlIHNjcmlwdCBkb2Vzbid0IGV4aXN0LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRPcHRpb25hbFNjcmlwdCh1cmw6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIGZldGNoKHVybCwgeyBtZXRob2Q6ICdIRUFEJyB9KVxyXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBWZXJpZnkgdGhlIHJlc3BvbnNlIGlzIGFjdHVhbGx5IEphdmFTY3JpcHQgYW5kIG5vdCBhbiBIVE1MIGZhbGxiYWNrXHJcbiAgICAgICAgICAgICAgICAvLyAoZS5nLiBWaXRlIGRldiBzZXJ2ZXIgcmV0dXJucyBpbmRleC5odG1sIGZvciB1bmtub3duIHJvdXRlcylcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb250ZW50VHlwZS5pbmNsdWRlcygnamF2YXNjcmlwdCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHVybDtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7fSk7IC8vIFNpbGVudGx5IGlnbm9yZSAtIHNjcmlwdCBpcyBvcHRpb25hbFxyXG59XHJcblxyXG4vLyBMb2FkIGN1c3RvbS5qcyBpZiBhdmFpbGFibGUgKHVzZWQgYnkgc2VydmVyIG1vZGUgZm9yIFdlYlNvY2tldCBldmVudHMsIGV0Yy4pXHJcbmlmIChoYXNET00pIHtcclxuICAgIGxvYWRPcHRpb25hbFNjcmlwdCgnL3dhaWxzL2N1c3RvbS5qcycpO1xyXG59XHJcbiIsICIvKlxyXG4gXyAgICAgX18gICAgIF8gX19cclxufCB8ICAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBPcGVuVVJMIH0gZnJvbSBcIi4vYnJvd3Nlci5qc1wiO1xyXG5pbXBvcnQgeyBRdWVzdGlvbiB9IGZyb20gXCIuL2RpYWxvZ3MuanNcIjtcclxuaW1wb3J0IHsgRW1pdCB9IGZyb20gXCIuL2V2ZW50cy5qc1wiO1xyXG5pbXBvcnQgeyBjYW5BYm9ydExpc3RlbmVycywgd2hlblJlYWR5IH0gZnJvbSBcIi4vdXRpbHMuanNcIjtcclxuaW1wb3J0IFdpbmRvdyBmcm9tIFwiLi93aW5kb3cuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBTZW5kcyBhbiBldmVudCB3aXRoIHRoZSBnaXZlbiBuYW1lIGFuZCBvcHRpb25hbCBkYXRhLlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnROYW1lIC0gLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gc2VuZC5cclxuICogQHBhcmFtIFtkYXRhPW51bGxdIC0gLSBPcHRpb25hbCBkYXRhIHRvIHNlbmQgYWxvbmcgd2l0aCB0aGUgZXZlbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBzZW5kRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIGRhdGE6IGFueSA9IG51bGwpOiB2b2lkIHtcclxuICAgIEVtaXQoZXZlbnROYW1lLCBkYXRhKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGxzIGEgbWV0aG9kIG9uIGEgc3BlY2lmaWVkIHdpbmRvdy5cclxuICpcclxuICogQHBhcmFtIHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IHRvIGNhbGwgdGhlIG1ldGhvZCBvbi5cclxuICogQHBhcmFtIG1ldGhvZE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHRvIGNhbGwuXHJcbiAqL1xyXG5mdW5jdGlvbiBjYWxsV2luZG93TWV0aG9kKHdpbmRvd05hbWU6IHN0cmluZywgbWV0aG9kTmFtZTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCB0YXJnZXRXaW5kb3cgPSBXaW5kb3cuR2V0KHdpbmRvd05hbWUpO1xyXG4gICAgY29uc3QgbWV0aG9kID0gKHRhcmdldFdpbmRvdyBhcyBhbnkpW21ldGhvZE5hbWVdO1xyXG5cclxuICAgIGlmICh0eXBlb2YgbWV0aG9kICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBXaW5kb3cgbWV0aG9kICcke21ldGhvZE5hbWV9JyBub3QgZm91bmRgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBtZXRob2QuY2FsbCh0YXJnZXRXaW5kb3cpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGNhbGxpbmcgd2luZG93IG1ldGhvZCAnJHttZXRob2ROYW1lfSc6IGAsIGUpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmVzcG9uZHMgdG8gYSB0cmlnZ2VyaW5nIGV2ZW50IGJ5IHJ1bm5pbmcgYXBwcm9wcmlhdGUgV01MIGFjdGlvbnMgZm9yIHRoZSBjdXJyZW50IHRhcmdldC5cclxuICovXHJcbmZ1bmN0aW9uIG9uV01MVHJpZ2dlcmVkKGV2OiBFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgZWxlbWVudCA9IGV2LmN1cnJlbnRUYXJnZXQgYXMgRWxlbWVudDtcclxuXHJcbiAgICBmdW5jdGlvbiBydW5FZmZlY3QoY2hvaWNlID0gXCJZZXNcIikge1xyXG4gICAgICAgIGlmIChjaG9pY2UgIT09IFwiWWVzXCIpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1ldmVudCcpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC1ldmVudCcpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldFdpbmRvdyA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtdGFyZ2V0LXdpbmRvdycpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC10YXJnZXQtd2luZG93JykgfHwgXCJcIjtcclxuICAgICAgICBjb25zdCB3aW5kb3dNZXRob2QgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLXdpbmRvdycpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC13aW5kb3cnKTtcclxuICAgICAgICBjb25zdCB1cmwgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLW9wZW51cmwnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS13bWwtb3BlbnVybCcpO1xyXG5cclxuICAgICAgICBpZiAoZXZlbnRUeXBlICE9PSBudWxsKVxyXG4gICAgICAgICAgICBzZW5kRXZlbnQoZXZlbnRUeXBlKTtcclxuICAgICAgICBpZiAod2luZG93TWV0aG9kICE9PSBudWxsKVxyXG4gICAgICAgICAgICBjYWxsV2luZG93TWV0aG9kKHRhcmdldFdpbmRvdywgd2luZG93TWV0aG9kKTtcclxuICAgICAgICBpZiAodXJsICE9PSBudWxsKVxyXG4gICAgICAgICAgICB2b2lkIE9wZW5VUkwodXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb25maXJtID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1jb25maXJtJykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd21sLWNvbmZpcm0nKTtcclxuXHJcbiAgICBpZiAoY29uZmlybSkge1xyXG4gICAgICAgIFF1ZXN0aW9uKHtcclxuICAgICAgICAgICAgVGl0bGU6IFwiQ29uZmlybVwiLFxyXG4gICAgICAgICAgICBNZXNzYWdlOiBjb25maXJtLFxyXG4gICAgICAgICAgICBEZXRhY2hlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIEJ1dHRvbnM6IFtcclxuICAgICAgICAgICAgICAgIHsgTGFiZWw6IFwiWWVzXCIgfSxcclxuICAgICAgICAgICAgICAgIHsgTGFiZWw6IFwiTm9cIiwgSXNEZWZhdWx0OiB0cnVlIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pLnRoZW4ocnVuRWZmZWN0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcnVuRWZmZWN0KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIFByaXZhdGUgZmllbGQgbmFtZXMuXHJcbmNvbnN0IGNvbnRyb2xsZXJTeW0gPSBTeW1ib2woXCJjb250cm9sbGVyXCIpO1xyXG5jb25zdCB0cmlnZ2VyTWFwU3ltID0gU3ltYm9sKFwidHJpZ2dlck1hcFwiKTtcclxuY29uc3QgZWxlbWVudENvdW50U3ltID0gU3ltYm9sKFwiZWxlbWVudENvdW50XCIpO1xyXG5cclxuLyoqXHJcbiAqIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IGRvZXMgbm90IGFjdHVhbGx5IHJlbWVtYmVyIGFjdGl2ZSBldmVudCBsaXN0ZW5lcnM6IGluc3RlYWRcclxuICogaXQgdGllcyB0aGVtIHRvIGFuIEFib3J0U2lnbmFsIGFuZCB1c2VzIGFuIEFib3J0Q29udHJvbGxlciB0byByZW1vdmUgdGhlbSBhbGwgYXQgb25jZS5cclxuICovXHJcbmNsYXNzIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IHtcclxuICAgIC8vIFByaXZhdGUgZmllbGRzLlxyXG4gICAgW2NvbnRyb2xsZXJTeW1dOiBBYm9ydENvbnRyb2xsZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpc1tjb250cm9sbGVyU3ltXSA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gb3B0aW9ucyBvYmplY3QgZm9yIGFkZEV2ZW50TGlzdGVuZXIgdGhhdCB0aWVzIHRoZSBsaXN0ZW5lclxyXG4gICAgICogdG8gdGhlIEFib3J0U2lnbmFsIGZyb20gdGhlIGN1cnJlbnQgQWJvcnRDb250cm9sbGVyLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gQW4gSFRNTCBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gdHJpZ2dlcnMgLSBUaGUgbGlzdCBvZiBhY3RpdmUgV01MIHRyaWdnZXIgZXZlbnRzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIHNldChlbGVtZW50OiBFbGVtZW50LCB0cmlnZ2Vyczogc3RyaW5nW10pOiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyB7XHJcbiAgICAgICAgcmV0dXJuIHsgc2lnbmFsOiB0aGlzW2NvbnRyb2xsZXJTeW1dLnNpZ25hbCB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMgYW5kIHJlc2V0cyB0aGUgcmVnaXN0cnkuXHJcbiAgICAgKi9cclxuICAgIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXNbY29udHJvbGxlclN5bV0uYWJvcnQoKTtcclxuICAgICAgICB0aGlzW2NvbnRyb2xsZXJTeW1dID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogV2Vha01hcFJlZ2lzdHJ5IG1hcHMgYWN0aXZlIHRyaWdnZXIgZXZlbnRzIHRvIGVhY2ggRE9NIGVsZW1lbnQgdGhyb3VnaCBhIFdlYWtNYXAuXHJcbiAqIFRoaXMgZW5zdXJlcyB0aGF0IHRoZSBtYXBwaW5nIHJlbWFpbnMgcHJpdmF0ZSB0byB0aGlzIG1vZHVsZSwgd2hpbGUgc3RpbGwgYWxsb3dpbmcgZ2FyYmFnZVxyXG4gKiBjb2xsZWN0aW9uIG9mIHRoZSBpbnZvbHZlZCBlbGVtZW50cy5cclxuICovXHJcbmNsYXNzIFdlYWtNYXBSZWdpc3RyeSB7XHJcbiAgICAvKiogU3RvcmVzIHRoZSBjdXJyZW50IGVsZW1lbnQtdG8tdHJpZ2dlciBtYXBwaW5nLiAqL1xyXG4gICAgW3RyaWdnZXJNYXBTeW1dOiBXZWFrTWFwPEVsZW1lbnQsIHN0cmluZ1tdPjtcclxuICAgIC8qKiBDb3VudHMgdGhlIG51bWJlciBvZiBlbGVtZW50cyB3aXRoIGFjdGl2ZSBXTUwgdHJpZ2dlcnMuICovXHJcbiAgICBbZWxlbWVudENvdW50U3ltXTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcFN5bV0gPSBuZXcgV2Vha01hcCgpO1xyXG4gICAgICAgIHRoaXNbZWxlbWVudENvdW50U3ltXSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGFjdGl2ZSB0cmlnZ2VycyBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gQW4gSFRNTCBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gdHJpZ2dlcnMgLSBUaGUgbGlzdCBvZiBhY3RpdmUgV01MIHRyaWdnZXIgZXZlbnRzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgc2V0KGVsZW1lbnQ6IEVsZW1lbnQsIHRyaWdnZXJzOiBzdHJpbmdbXSk6IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zIHtcclxuICAgICAgICBpZiAoIXRoaXNbdHJpZ2dlck1hcFN5bV0uaGFzKGVsZW1lbnQpKSB7IHRoaXNbZWxlbWVudENvdW50U3ltXSsrOyB9XHJcbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwU3ltXS5zZXQoZWxlbWVudCwgdHJpZ2dlcnMpO1xyXG4gICAgICAgIHJldHVybiB7fTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAgICovXHJcbiAgICByZXNldCgpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpc1tlbGVtZW50Q291bnRTeW1dIDw9IDApXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzW2VsZW1lbnRDb3VudFN5bV0gPD0gMClcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdHJpZ2dlcnMgPSB0aGlzW3RyaWdnZXJNYXBTeW1dLmdldChlbGVtZW50KTtcclxuICAgICAgICAgICAgaWYgKHRyaWdnZXJzICE9IG51bGwpIHsgdGhpc1tlbGVtZW50Q291bnRTeW1dLS07IH1cclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycyB8fCBbXSlcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0cmlnZ2VyLCBvbldNTFRyaWdnZXJlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzW3RyaWdnZXJNYXBTeW1dID0gbmV3IFdlYWtNYXAoKTtcclxuICAgICAgICB0aGlzW2VsZW1lbnRDb3VudFN5bV0gPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCB0cmlnZ2VyUmVnaXN0cnkgPSBjYW5BYm9ydExpc3RlbmVycygpID8gbmV3IEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5KCkgOiBuZXcgV2Vha01hcFJlZ2lzdHJ5KCk7XHJcblxyXG4vKipcclxuICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gKi9cclxuZnVuY3Rpb24gYWRkV01MTGlzdGVuZXJzKGVsZW1lbnQ6IEVsZW1lbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IHRyaWdnZXJSZWdFeHAgPSAvXFxTKy9nO1xyXG4gICAgY29uc3QgdHJpZ2dlckF0dHIgPSAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC10cmlnZ2VyJykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd21sLXRyaWdnZXInKSB8fCBcImNsaWNrXCIpO1xyXG4gICAgY29uc3QgdHJpZ2dlcnM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgbGV0IG1hdGNoO1xyXG4gICAgd2hpbGUgKChtYXRjaCA9IHRyaWdnZXJSZWdFeHAuZXhlYyh0cmlnZ2VyQXR0cikpICE9PSBudWxsKVxyXG4gICAgICAgIHRyaWdnZXJzLnB1c2gobWF0Y2hbMF0pO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB0cmlnZ2VyUmVnaXN0cnkuc2V0KGVsZW1lbnQsIHRyaWdnZXJzKTtcclxuICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycylcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodHJpZ2dlciwgb25XTUxUcmlnZ2VyZWQsIG9wdGlvbnMpO1xyXG59XHJcblxyXG4vKipcclxuICogU2NoZWR1bGVzIGFuIGF1dG9tYXRpYyByZWxvYWQgb2YgV01MIHRvIGJlIHBlcmZvcm1lZCBhcyBzb29uIGFzIHRoZSBkb2N1bWVudCBpcyBmdWxseSBsb2FkZWQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gRW5hYmxlKCk6IHZvaWQge1xyXG4gICAgd2hlblJlYWR5KFJlbG9hZCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZWxvYWRzIHRoZSBXTUwgcGFnZSBieSBhZGRpbmcgbmVjZXNzYXJ5IGV2ZW50IGxpc3RlbmVycyBhbmQgYnJvd3NlciBsaXN0ZW5lcnMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gUmVsb2FkKCk6IHZvaWQge1xyXG4gICAgdHJpZ2dlclJlZ2lzdHJ5LnJlc2V0KCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1t3bWwtZXZlbnRdLCBbd21sLXdpbmRvd10sIFt3bWwtb3BlbnVybF0sIFtkYXRhLXdtbC1ldmVudF0sIFtkYXRhLXdtbC13aW5kb3ddLCBbZGF0YS13bWwtb3BlbnVybF0nKS5mb3JFYWNoKGFkZFdNTExpc3RlbmVycyk7XHJcbn1cclxuIiwgIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xyXG5cclxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQnJvd3Nlcik7XHJcblxyXG5jb25zdCBCcm93c2VyT3BlblVSTCA9IDA7XHJcblxyXG4vKipcclxuICogT3BlbiBhIGJyb3dzZXIgd2luZG93IHRvIHRoZSBnaXZlbiBVUkwuXHJcbiAqXHJcbiAqIEBwYXJhbSB1cmwgLSBUaGUgVVJMIHRvIG9wZW5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBPcGVuVVJMKHVybDogc3RyaW5nIHwgVVJMKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gY2FsbChCcm93c2VyT3BlblVSTCwge3VybDogdXJsLnRvU3RyaW5nKCl9KTtcclxufVxyXG4iLCAiLy8gU291cmNlOiBodHRwczovL2dpdGh1Yi5jb20vYWkvbmFub2lkXHJcblxyXG4vLyBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuLy9cclxuLy8gQ29weXJpZ2h0IDIwMTcgQW5kcmV5IFNpdG5payA8YW5kcmV5QHNpdG5pay5ydT5cclxuLy9cclxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZlxyXG4vLyB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluXHJcbi8vIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG9cclxuLy8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2ZcclxuLy8gdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLFxyXG4vLyAgICAgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbi8vXHJcbi8vICAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuLy8gY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuLy9cclxuLy8gICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1NcclxuLy8gRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SXHJcbi8vIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUlxyXG4vLyBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTlxyXG4vLyBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxyXG5cclxuLy8gVGhpcyBhbHBoYWJldCB1c2VzIGBBLVphLXowLTlfLWAgc3ltYm9scy5cclxuLy8gVGhlIG9yZGVyIG9mIGNoYXJhY3RlcnMgaXMgb3B0aW1pemVkIGZvciBiZXR0ZXIgZ3ppcCBhbmQgYnJvdGxpIGNvbXByZXNzaW9uLlxyXG4vLyBSZWZlcmVuY2VzIHRvIHRoZSBzYW1lIGZpbGUgKHdvcmtzIGJvdGggZm9yIGd6aXAgYW5kIGJyb3RsaSk6XHJcbi8vIGAndXNlYCwgYGFuZG9tYCwgYW5kIGByaWN0J2BcclxuLy8gUmVmZXJlbmNlcyB0byB0aGUgYnJvdGxpIGRlZmF1bHQgZGljdGlvbmFyeTpcclxuLy8gYC0yNlRgLCBgMTk4M2AsIGA0MHB4YCwgYDc1cHhgLCBgYnVzaGAsIGBqYWNrYCwgYG1pbmRgLCBgdmVyeWAsIGFuZCBgd29sZmBcclxuY29uc3QgdXJsQWxwaGFiZXQgPVxyXG4gICAgJ3VzZWFuZG9tLTI2VDE5ODM0MFBYNzVweEpBQ0tWRVJZTUlOREJVU0hXT0xGX0dRWmJmZ2hqa2xxdnd5enJpY3QnXHJcblxyXG4vLyBNT0RJRklFRCBGT1IgV0FJTFM6IHRoZSB1cHN0cmVhbSBpbXBsZW1lbnRhdGlvbiBkcmF3cyBmcm9tIE1hdGgucmFuZG9tKCksXHJcbi8vIHdoaWNoIGlzIG5vdCBhIGNyeXB0b2dyYXBoaWMgc291cmNlLiBUaGVzZSBpZHMgYXJlIHVzZWQgZm9yIHRoZSBydW50aW1lXHJcbi8vIGNsaWVudCBpZCwgYmluZGluZyBjYWxsIGlkcywgY2h1bmsgaWRzLCBhbmQgZGVza3RvcCBzdHJlYW0gc2Vzc2lvbiBpZHMuIFRoZXlcclxuLy8gYXJlIGNvcnJlbGF0aW9uIGlkZW50aWZpZXJzIHJhdGhlciB0aGFuIGF1dGhlbnRpY2F0aW9uIGNhcGFiaWxpdGllcywgYnV0IGFcclxuLy8gc3Ryb25nZXIgc291cmNlIG1ha2VzIGFjY2lkZW50YWwgY29sbGlzaW9ucyBuZWdsaWdpYmxlIGV2ZW4gYWNyb3NzIG1hbnlcclxuLy8gY29uY3VycmVudGx5IGxvYWRlZCBydW50aW1lcy4gVGhlIGFscGhhYmV0IGlzIDY0IGNoYXJhY3RlcnMsIHNvIG1hc2tpbmcgYVxyXG4vLyByYW5kb20gYnl0ZSB3aXRoIDYzIGlzIHVuaWZvcm0gXHUyMDE0IG5vIHJlamVjdGlvbiBzYW1wbGluZyBuZWVkZWQuXHJcbmV4cG9ydCBmdW5jdGlvbiBuYW5vaWQoc2l6ZTogbnVtYmVyID0gMjEpOiBzdHJpbmcge1xyXG4gICAgY29uc3Qgc291cmNlID0gdHlwZW9mIGNyeXB0byAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgPyBjcnlwdG9cclxuICAgICAgICA6IG51bGw7XHJcblxyXG4gICAgaWYgKHNvdXJjZSkge1xyXG4gICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSk7XHJcbiAgICAgICAgc291cmNlLmdldFJhbmRvbVZhbHVlcyhieXRlcyk7XHJcbiAgICAgICAgbGV0IGlkID0gJyc7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcclxuICAgICAgICAgICAgaWQgKz0gdXJsQWxwaGFiZXRbYnl0ZXNbaV0gJiA2M107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGYWxsYmFjayBmb3IgZW52aXJvbm1lbnRzIHdpdGhvdXQgV2ViIENyeXB0byAodmVyeSBvbGQgZW5naW5lcywgc29tZVxyXG4gICAgLy8gc2VydmVyLXNpZGUgcmVuZGVyaW5nIGNvbnRleHRzKS4gSWRzIHJlbWFpbiB1bmlxdWUgYnV0IG5vdCB1bmd1ZXNzYWJsZS5cclxuICAgIGxldCBpZCA9ICcnO1xyXG4gICAgbGV0IGkgPSBzaXplIHwgMDtcclxuICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICBpZCArPSB1cmxBbHBoYWJldFsoTWF0aC5yYW5kb20oKSAqIDY0KSB8IDBdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlkO1xyXG59XHJcbiIsICIvKlxyXG4gXyAgICAgX18gICAgIF8gX19cclxufCB8ICAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG4vKipcclxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgaW5zaWRlIGEgYnJvd3Nlci93ZWJ2aWV3IHdpdGggYSBET00gYXZhaWxhYmxlLlxyXG4gKiBGYWxzZSB1bmRlciBzZXJ2ZXItc2lkZSByZW5kZXJpbmcgKGUuZy4gYG5leHQgYnVpbGRgIHByZXJlbmRlcmluZyksXHJcbiAqIHdoZXJlIGFwcGxpY2F0aW9uIGNvZGUgbWF5IGltcG9ydCB0aGUgcnVudGltZSBtb2R1bGUgZXZlbiB0aG91Z2ggbm9cclxuICogV2FpbHMgQVBJcyBjYW4gYWN0dWFsbHkgYmUgdXNlZCAoIzQ2NzkpLiBNb2R1bGVzIG11c3Qgbm90IHRvdWNoXHJcbiAqIGB3aW5kb3dgL2Bkb2N1bWVudGAgYXQgaW1wb3J0IHRpbWUgZXhjZXB0IGJlaGluZCB0aGlzIGd1YXJkLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGhhc0RPTSA9IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGRvY3VtZW50ICE9PSBcInVuZGVmaW5lZFwiO1xyXG4iLCAiLypcclxuIF8gICAgIF9fICAgICBfIF9fXHJcbnwgfCAgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuaW1wb3J0IHsgbmFub2lkIH0gZnJvbSBcIi4vbmFub2lkLmpzXCI7XHJcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XHJcblxyXG4vLyBSZXNvbHZlZCBsYXppbHk6IHdpbmRvdyBkb2VzIG5vdCBleGlzdCB3aGVuIHRoZSBtb2R1bGUgaXMgaW1wb3J0ZWQgZHVyaW5nXHJcbi8vIHNlcnZlci1zaWRlIHJlbmRlcmluZyAoIzQ2NzkpLCBhbmQgbm90aGluZyBjYW4gY2FsbCB0aGUgcnVudGltZSB0aGVyZS5cclxuZnVuY3Rpb24gcnVudGltZVVSTCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyBcIi93YWlscy9ydW50aW1lXCI7XHJcbn1cclxuXHJcbi8vIFN0YXkgdW5kZXIgV2ViVmlldzIncyB+Mk1CIHJlcXVlc3QgYm9keSBidWZmZXJpbmcgbGltaXQgaW4gV2ViUmVzb3VyY2VSZXF1ZXN0ZWQuXHJcbmNvbnN0IENIVU5LX1RIUkVTSE9MRCA9IDUxMiAqIDEwMjQ7XHJcblxyXG4vLyBSZS1leHBvcnQgbmFub2lkIGZvciBjdXN0b20gdHJhbnNwb3J0IGltcGxlbWVudGF0aW9uc1xyXG5leHBvcnQgeyBuYW5vaWQgfTtcclxuXHJcbnR5cGUgQ2FsbEVycm9yVHlwZSA9IHtcclxuICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgIGNhdXNlPzogdW5rbm93bixcclxuICAgIGtpbmQ6IFwiUmVmZXJlbmNlRXJyb3JcIiB8IFwiVHlwZUVycm9yXCIgfCBcIlJ1bnRpbWVFcnJvclwiXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeGNlcHRpb24gY2xhc3MgdGhhdCB3aWxsIGJlIHRocm93biBpbiBjYXNlIHRoZSBib3VuZCBtZXRob2QgcmV0dXJucyBhbiBlcnJvci5cclxuICogVGhlIHZhbHVlIG9mIHRoZSB7QGxpbmsgUnVudGltZUVycm9yI25hbWV9IHByb3BlcnR5IGlzIFwiUnVudGltZUVycm9yXCIuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUnVudGltZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IFJ1bnRpbWVFcnJvciBpbnN0YW5jZS5cclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBFcnJvciBjb25zdHJ1Y3Rvci5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgb3B0aW9ucz86IEVycm9yT3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiUnVudGltZUVycm9yXCI7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIE9iamVjdCBOYW1lc1xyXG5leHBvcnQgY29uc3Qgb2JqZWN0TmFtZXMgPSBPYmplY3QuZnJlZXplKHtcclxuICAgIENhbGw6IDAsXHJcbiAgICBDbGlwYm9hcmQ6IDEsXHJcbiAgICBBcHBsaWNhdGlvbjogMixcclxuICAgIEV2ZW50czogMyxcclxuICAgIENvbnRleHRNZW51OiA0LFxyXG4gICAgRGlhbG9nOiA1LFxyXG4gICAgV2luZG93OiA2LFxyXG4gICAgU2NyZWVuczogNyxcclxuICAgIFN5c3RlbTogOCxcclxuICAgIEJyb3dzZXI6IDksXHJcbiAgICBDYW5jZWxDYWxsOiAxMCxcclxuICAgIElPUzogMTEsXHJcbiAgICBBbmRyb2lkOiAxMixcclxufSk7XHJcbmV4cG9ydCBsZXQgY2xpZW50SWQgPSBuYW5vaWQoKTtcclxuXHJcbi8qKlxyXG4gKiBSdW50aW1lVHJhbnNwb3J0IGRlZmluZXMgdGhlIGludGVyZmFjZSBmb3IgY3VzdG9tIElQQyB0cmFuc3BvcnQgaW1wbGVtZW50YXRpb25zLlxyXG4gKiBJbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgdG8gdXNlIFdlYlNvY2tldHMsIGN1c3RvbSBwcm90b2NvbHMsIG9yIGFueSBvdGhlclxyXG4gKiB0cmFuc3BvcnQgbWVjaGFuaXNtIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgSFRUUCBmZXRjaC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgUnVudGltZVRyYW5zcG9ydCB7XHJcbiAgICAvKipcclxuICAgICAqIFNlbmQgYSBydW50aW1lIGNhbGwgYW5kIHJldHVybiB0aGUgcmVzcG9uc2UuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG9iamVjdElEIC0gVGhlIFdhaWxzIG9iamVjdCBJRCAoMD1DYWxsLCAxPUNsaXBib2FyZCwgZXRjLilcclxuICAgICAqIEBwYXJhbSBtZXRob2QgLSBUaGUgbWV0aG9kIElEIHRvIGNhbGxcclxuICAgICAqIEBwYXJhbSB3aW5kb3dOYW1lIC0gT3B0aW9uYWwgd2luZG93IG5hbWVcclxuICAgICAqIEBwYXJhbSBhcmdzIC0gQXJndW1lbnRzIHRvIHBhc3MgKHdpbGwgYmUgSlNPTiBzdHJpbmdpZmllZCBpZiBwcmVzZW50KVxyXG4gICAgICogQHJldHVybnMgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHJlc3BvbnNlIGRhdGFcclxuICAgICAqL1xyXG4gICAgY2FsbChvYmplY3RJRDogbnVtYmVyLCBtZXRob2Q6IG51bWJlciwgd2luZG93TmFtZTogc3RyaW5nLCBhcmdzOiBhbnkpOiBQcm9taXNlPGFueT47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDdXN0b20gdHJhbnNwb3J0IGltcGxlbWVudGF0aW9uIChjYW4gYmUgc2V0IGJ5IHVzZXIpXHJcbiAqL1xyXG5sZXQgY3VzdG9tVHJhbnNwb3J0OiBSdW50aW1lVHJhbnNwb3J0IHwgbnVsbCA9IG51bGw7XHJcblxyXG4vKipcclxuICogU2V0IGEgY3VzdG9tIHRyYW5zcG9ydCBmb3IgYWxsIFdhaWxzIHJ1bnRpbWUgY2FsbHMuXHJcbiAqIFRoaXMgYWxsb3dzIHlvdSB0byByZXBsYWNlIHRoZSBkZWZhdWx0IEhUVFAgZmV0Y2ggdHJhbnNwb3J0IHdpdGhcclxuICogV2ViU29ja2V0cywgY3VzdG9tIHByb3RvY29scywgb3IgYW55IG90aGVyIG1lY2hhbmlzbS5cclxuICpcclxuICogQHBhcmFtIHRyYW5zcG9ydCAtIFlvdXIgY3VzdG9tIHRyYW5zcG9ydCBpbXBsZW1lbnRhdGlvblxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBgYGB0eXBlc2NyaXB0XHJcbiAqIGltcG9ydCB7IHNldFRyYW5zcG9ydCB9IGZyb20gJy93YWlscy9ydW50aW1lLmpzJztcclxuICpcclxuICogY29uc3Qgd3NUcmFuc3BvcnQgPSB7XHJcbiAqICAgY2FsbDogYXN5bmMgKG9iamVjdElELCBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpID0+IHtcclxuICogICAgIC8vIFlvdXIgV2ViU29ja2V0IGltcGxlbWVudGF0aW9uXHJcbiAqICAgfVxyXG4gKiB9O1xyXG4gKlxyXG4gKiBzZXRUcmFuc3BvcnQod3NUcmFuc3BvcnQpO1xyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRUcmFuc3BvcnQodHJhbnNwb3J0OiBSdW50aW1lVHJhbnNwb3J0IHwgbnVsbCk6IHZvaWQge1xyXG4gICAgY3VzdG9tVHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRoZSBjdXJyZW50IHRyYW5zcG9ydCAodXNlZnVsIGZvciBleHRlbmRpbmcvd3JhcHBpbmcpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNwb3J0KCk6IFJ1bnRpbWVUcmFuc3BvcnQgfCBudWxsIHtcclxuICAgIHJldHVybiBjdXN0b21UcmFuc3BvcnQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IHJ1bnRpbWUgY2FsbGVyIHdpdGggc3BlY2lmaWVkIElELlxyXG4gKlxyXG4gKiBAcGFyYW0gb2JqZWN0IC0gVGhlIG9iamVjdCB0byBpbnZva2UgdGhlIG1ldGhvZCBvbi5cclxuICogQHBhcmFtIHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93LlxyXG4gKiBAcmV0dXJuIFRoZSBuZXcgcnVudGltZSBjYWxsZXIgZnVuY3Rpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbmV3UnVudGltZUNhbGxlcihvYmplY3Q6IG51bWJlciwgd2luZG93TmFtZTogc3RyaW5nID0gJycpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAobWV0aG9kOiBudW1iZXIsIGFyZ3M6IGFueSA9IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gcnVudGltZUNhbGxXaXRoSUQob2JqZWN0LCBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpO1xyXG4gICAgfTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcnVudGltZUNhbGxXaXRoSUQob2JqZWN0SUQ6IG51bWJlciwgbWV0aG9kOiBudW1iZXIsIHdpbmRvd05hbWU6IHN0cmluZywgYXJnczogYW55KTogUHJvbWlzZTxhbnk+IHtcclxuICAgIC8vIFVzZSBjdXN0b20gdHJhbnNwb3J0IGlmIGF2YWlsYWJsZVxyXG4gICAgaWYgKGN1c3RvbVRyYW5zcG9ydCkge1xyXG4gICAgICAgIHJldHVybiBjdXN0b21UcmFuc3BvcnQuY2FsbChvYmplY3RJRCwgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEZWZhdWx0IEhUVFAgZmV0Y2ggdHJhbnNwb3J0XHJcbiAgICBsZXQgdXJsID0gbmV3IFVSTChydW50aW1lVVJMKCkpO1xyXG5cclxuICAgIGxldCBib2R5OiB7IG9iamVjdDogbnVtYmVyOyBtZXRob2Q6IG51bWJlciwgYXJncz86IGFueSB9ID0ge1xyXG4gICAgICBvYmplY3Q6IG9iamVjdElELFxyXG4gICAgICBtZXRob2RcclxuICAgIH1cclxuICAgIGlmIChhcmdzICE9PSBudWxsICYmIGFyZ3MgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBib2R5LmFyZ3MgPSBhcmdzO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgIFtcIngtd2FpbHMtY2xpZW50LWlkXCJdOiBjbGllbnRJZCxcclxuICAgICAgICBbXCJDb250ZW50LVR5cGVcIl06IFwiYXBwbGljYXRpb24vanNvblwiXHJcbiAgICB9XHJcbiAgICBpZiAod2luZG93TmFtZSkge1xyXG4gICAgICAgIGhlYWRlcnNbXCJ4LXdhaWxzLXdpbmRvdy1uYW1lXCJdID0gd2luZG93TmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBib2R5U3RyID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XHJcbiAgICBsZXQgcmVzcG9uc2U6IFJlc3BvbnNlO1xyXG4gICAgaWYgKGJvZHlTdHIubGVuZ3RoID4gQ0hVTktfVEhSRVNIT0xEKSB7XHJcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBzZW5kQ2h1bmtlZCh1cmwsIGhlYWRlcnMsIGJvZHlTdHIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyBtZXRob2Q6ICdQT1NUJywgaGVhZGVycywgYm9keTogYm9keVN0ciB9KTtcclxuICAgIH1cclxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgY29uc3QgY3QgPSByZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKTtcclxuICAgICAgaWYgKGN0Py5pbmNsdWRlcyhcImFwcGxpY2F0aW9uL2pzb25cIikpIHtcclxuICAgICAgICAgIGNvbnN0IGpzb246IENhbGxFcnJvclR5cGUgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICBsZXQgZXJyO1xyXG4gICAgICAgICAgc3dpdGNoIChqc29uLmtpbmQpIHtcclxuICAgICAgICAgICAgICBjYXNlIFwiUmVmZXJlbmNlRXJyb3JcIjogZXJyID0gbmV3IFJlZmVyZW5jZUVycm9yKGpzb24ubWVzc2FnZSk7IGJyZWFrO1xyXG4gICAgICAgICAgICAgIGNhc2UgXCJUeXBlRXJyb3JcIjogICAgICBlcnIgPSBuZXcgVHlwZUVycm9yKGpzb24ubWVzc2FnZSk7IGJyZWFrO1xyXG4gICAgICAgICAgICAgIGNhc2UgXCJSdW50aW1lRXJyb3JcIjogICBlcnIgPSBuZXcgUnVudGltZUVycm9yKGpzb24ubWVzc2FnZSk7IGJyZWFrO1xyXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICAgZXJyID0gbmV3IEVycm9yKGpzb24ubWVzc2FnZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlcnIuY2F1c2UgPSBqc29uLmNhdXNlO1xyXG4gICAgICAgICAgdGhyb3cgZXJyXHJcbiAgICAgIH1cclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGF3YWl0IHJlc3BvbnNlLnRleHQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKChyZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKT8uaW5kZXhPZihcImFwcGxpY2F0aW9uL2pzb25cIikgPz8gLTEpICE9PSAtMSkge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIHNlbmRDaHVua2VkIHNwbGl0cyBhIGxhcmdlIHNlcmlhbGlzZWQgcmVxdWVzdCBib2R5IGludG8gQ0hVTktfVEhSRVNIT0xELXNpemVkXHJcbi8vIGJ5dGUgY2h1bmtzIGFuZCBzZW5kcyB0aGVtIHNlcmlhbGx5LiAgRW5jb2RpbmcgdG8gVVRGLTggYnl0ZXMgYmVmb3JlIHNsaWNpbmdcclxuLy8gcHJldmVudHMgY29ycnVwdGlvbiBvZiBub24tQk1QIGNoYXJhY3RlcnMgKHN1cnJvZ2F0ZSBwYWlycykgdGhhdCB3b3VsZCBvY2N1clxyXG4vLyB3aGVuIHNwbGl0dGluZyBhdCBKYXZhU2NyaXB0IHN0cmluZyBpbmRpY2VzLiAgVGhlIEdvIHRyYW5zcG9ydCBhc3NlbWJsZXMgdGhlXHJcbi8vIHJhdyBieXRlcyBiZWZvcmUgcHJvY2Vzc2luZy4gIE9ubHkgdGhlIGZpbmFsIGNodW5rJ3MgcmVzcG9uc2UgY2FycmllcyB0aGUgUlBDIHJlc3VsdC5cclxuYXN5bmMgZnVuY3Rpb24gc2VuZENodW5rZWQodXJsOiBVUkwsIGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sIGJvZHlTdHI6IHN0cmluZyk6IFByb21pc2U8UmVzcG9uc2U+IHtcclxuICAgIGNvbnN0IGNodW5rSWQgPSBuYW5vaWQoKTtcclxuICAgIGNvbnN0IGJvZHlCeXRlcyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShib2R5U3RyKTtcclxuICAgIGNvbnN0IHRvdGFsQ2h1bmtzID0gTWF0aC5jZWlsKGJvZHlCeXRlcy5sZW5ndGggLyBDSFVOS19USFJFU0hPTEQpO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG90YWxDaHVua3MgLSAxOyBpKyspIHtcclxuICAgICAgICBjb25zdCBjaHVuayA9IGJvZHlCeXRlcy5zdWJhcnJheShpICogQ0hVTktfVEhSRVNIT0xELCAoaSArIDEpICogQ0hVTktfVEhSRVNIT0xEKTtcclxuICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2godXJsLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5oZWFkZXJzLFxyXG4gICAgICAgICAgICAgICAgJ3gtd2FpbHMtY2h1bmstaWQnOiBjaHVua0lkLFxyXG4gICAgICAgICAgICAgICAgJ3gtd2FpbHMtY2h1bmstaW5kZXgnOiBTdHJpbmcoaSksXHJcbiAgICAgICAgICAgICAgICAneC13YWlscy1jaHVuay10b3RhbCc6IFN0cmluZyh0b3RhbENodW5rcyksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IGNodW5rLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghcmVzcC5vaykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYXdhaXQgcmVzcC50ZXh0KCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAuLi5oZWFkZXJzLFxyXG4gICAgICAgICAgICAneC13YWlscy1jaHVuay1pZCc6IGNodW5rSWQsXHJcbiAgICAgICAgICAgICd4LXdhaWxzLWNodW5rLWluZGV4JzogU3RyaW5nKHRvdGFsQ2h1bmtzIC0gMSksXHJcbiAgICAgICAgICAgICd4LXdhaWxzLWNodW5rLXRvdGFsJzogU3RyaW5nKHRvdGFsQ2h1bmtzKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IGJvZHlCeXRlcy5zdWJhcnJheSgodG90YWxDaHVua3MgLSAxKSAqIENIVU5LX1RIUkVTSE9MRCksXHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFuZHJvaWQgV2ViVmlldyBjYW5ub3QgZGVsaXZlciBmZXRjaCgpIFBPU1QgYm9kaWVzIHRvXHJcbiAqIHNob3VsZEludGVyY2VwdFJlcXVlc3QsIHNvIHRoZSBkZWZhdWx0IEhUVFAgdHJhbnNwb3J0IGNhbm5vdCByZWFjaCBHby5cclxuICogV2hlbiB0aGUgQW5kcm9pZCBKYXZhc2NyaXB0SW50ZXJmYWNlIGJyaWRnZSAod2luZG93LndhaWxzKSBpcyBwcmVzZW50LFxyXG4gKiByb3V0ZSBydW50aW1lIGNhbGxzIHRocm91Z2ggaXQgaW5zdGVhZC4gUmVzcG9uc2VzIGFycml2ZSB2aWFcclxuICogd2luZG93Ll93YWlsc0FuZHJvaWRDYWxsYmFjaywgaW52b2tlZCBieSB0aGUgSmF2YSBzaWRlLlxyXG4gKi9cclxuaW50ZXJmYWNlIEFuZHJvaWRKU0JyaWRnZSB7XHJcbiAgICBpbnZva2VBc3luYyhjYWxsYmFja0lEOiBzdHJpbmcsIHBheWxvYWQ6IHN0cmluZyk6IHZvaWQ7XHJcbn1cclxuXHJcbmNvbnN0IGFuZHJvaWRCcmlkZ2U6IEFuZHJvaWRKU0JyaWRnZSB8IG51bGwgPSBoYXNET00gJiZcclxuICAgIHR5cGVvZiAod2luZG93IGFzIGFueSkud2FpbHM/Lmludm9rZUFzeW5jID09PSBcImZ1bmN0aW9uXCIgPyAod2luZG93IGFzIGFueSkud2FpbHMgOiBudWxsO1xyXG5cclxuaWYgKGFuZHJvaWRCcmlkZ2UpIHtcclxuICAgIGNvbnN0IHBlbmRpbmcgPSBuZXcgTWFwPHN0cmluZywgeyByZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZDsgcmVqZWN0OiAocmVhc29uOiBhbnkpID0+IHZvaWQgfT4oKTtcclxuXHJcbiAgICAod2luZG93IGFzIGFueSkuX3dhaWxzQW5kcm9pZENhbGxiYWNrID0gKGlkOiBzdHJpbmcsIHJlc3BvbnNlOiBzdHJpbmcgfCBudWxsLCBlcnJvcjogc3RyaW5nIHwgbnVsbCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBwZW5kaW5nLmdldChpZCk7XHJcbiAgICAgICAgaWYgKCFwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgcGVuZGluZy5kZWxldGUoaWQpO1xyXG4gICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZXJyb3IpKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBlbnZlbG9wZSA9IEpTT04ucGFyc2UocmVzcG9uc2UgPz8gXCJ7fVwiKTtcclxuICAgICAgICAgICAgaWYgKCFlbnZlbG9wZS5vaykge1xyXG4gICAgICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGVudmVsb3BlLmVycm9yID8/IFwidW5rbm93biBydW50aW1lIGNhbGwgZXJyb3JcIikpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZShcInRleHRcIiBpbiBlbnZlbG9wZSA/IGVudmVsb3BlLnRleHQgOiBlbnZlbG9wZS5kYXRhKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KGUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgY3VzdG9tVHJhbnNwb3J0ID0ge1xyXG4gICAgICAgIGNhbGwob2JqZWN0SUQ6IG51bWJlciwgbWV0aG9kOiBudW1iZXIsIHdpbmRvd05hbWU6IHN0cmluZywgYXJnczogYW55KTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gbmFub2lkKCk7XHJcbiAgICAgICAgICAgICAgICBwZW5kaW5nLnNldChpZCwgeyByZXNvbHZlLCByZWplY3QgfSk7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZHJvaWRCcmlkZ2UuaW52b2tlQXN5bmMoaWQsIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBvYmplY3RJRCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvd05hbWU6IHdpbmRvd05hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3MgPz8gbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQ6IGNsaWVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBsZWFrIHRoZSBwZW5kaW5nIGVudHJ5IGlmIGRpc3BhdGNoIHRocm93cyBzeW5jaHJvbm91c2x5XHJcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZy5kZWxldGUoaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbn1cclxuIiwgIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbmltcG9ydCB7bmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXN9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuXHJcbi8vIHNldHVwXHJcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XHJcblxyXG5pZiAoaGFzRE9NKSB7XHJcbiAgICB3aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcclxufVxyXG5cclxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuRGlhbG9nKTtcclxuXHJcbi8vIERlZmluZSBjb25zdGFudHMgZnJvbSB0aGUgYG1ldGhvZHNgIG9iamVjdCBpbiBUaXRsZSBDYXNlXHJcbmNvbnN0IERpYWxvZ0luZm8gPSAwO1xyXG5jb25zdCBEaWFsb2dXYXJuaW5nID0gMTtcclxuY29uc3QgRGlhbG9nRXJyb3IgPSAyO1xyXG5jb25zdCBEaWFsb2dRdWVzdGlvbiA9IDM7XHJcbmNvbnN0IERpYWxvZ09wZW5GaWxlID0gNDtcclxuY29uc3QgRGlhbG9nU2F2ZUZpbGUgPSA1O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPcGVuRmlsZURpYWxvZ09wdGlvbnMge1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBkaXJlY3RvcmllcyBjYW4gYmUgY2hvc2VuLiAqL1xyXG4gICAgQ2FuQ2hvb3NlRGlyZWN0b3JpZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBmaWxlcyBjYW4gYmUgY2hvc2VuLiAqL1xyXG4gICAgQ2FuQ2hvb3NlRmlsZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBkaXJlY3RvcmllcyBjYW4gYmUgY3JlYXRlZC4gKi9cclxuICAgIENhbkNyZWF0ZURpcmVjdG9yaWVzPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgaGlkZGVuIGZpbGVzIHNob3VsZCBiZSBzaG93bi4gKi9cclxuICAgIFNob3dIaWRkZW5GaWxlcz86IGJvb2xlYW47XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIGFsaWFzZXMgc2hvdWxkIGJlIHJlc29sdmVkLiAqL1xyXG4gICAgUmVzb2x2ZXNBbGlhc2VzPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgbXVsdGlwbGUgc2VsZWN0aW9uIGlzIGFsbG93ZWQuICovXHJcbiAgICBBbGxvd3NNdWx0aXBsZVNlbGVjdGlvbj86IGJvb2xlYW47XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIHRoZSBleHRlbnNpb24gc2hvdWxkIGJlIGhpZGRlbi4gKi9cclxuICAgIEhpZGVFeHRlbnNpb24/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBoaWRkZW4gZXh0ZW5zaW9ucyBjYW4gYmUgc2VsZWN0ZWQuICovXHJcbiAgICBDYW5TZWxlY3RIaWRkZW5FeHRlbnNpb24/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBmaWxlIHBhY2thZ2VzIHNob3VsZCBiZSB0cmVhdGVkIGFzIGRpcmVjdG9yaWVzLiAqL1xyXG4gICAgVHJlYXRzRmlsZVBhY2thZ2VzQXNEaXJlY3Rvcmllcz86IGJvb2xlYW47XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIG90aGVyIGZpbGUgdHlwZXMgYXJlIGFsbG93ZWQuICovXHJcbiAgICBBbGxvd3NPdGhlckZpbGV0eXBlcz86IGJvb2xlYW47XHJcbiAgICAvKiogQXJyYXkgb2YgZmlsZSBmaWx0ZXJzLiAqL1xyXG4gICAgRmlsdGVycz86IEZpbGVGaWx0ZXJbXTtcclxuICAgIC8qKiBUaXRsZSBvZiB0aGUgZGlhbG9nLiAqL1xyXG4gICAgVGl0bGU/OiBzdHJpbmc7XHJcbiAgICAvKiogTWVzc2FnZSB0byBzaG93IGluIHRoZSBkaWFsb2cuICovXHJcbiAgICBNZXNzYWdlPzogc3RyaW5nO1xyXG4gICAgLyoqIFRleHQgdG8gZGlzcGxheSBvbiB0aGUgYnV0dG9uLiAqL1xyXG4gICAgQnV0dG9uVGV4dD86IHN0cmluZztcclxuICAgIC8qKiBEaXJlY3RvcnkgdG8gb3BlbiBpbiB0aGUgZGlhbG9nLiAqL1xyXG4gICAgRGlyZWN0b3J5Pzogc3RyaW5nO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiB0aGUgZGlhbG9nIHNob3VsZCBhcHBlYXIgZGV0YWNoZWQgZnJvbSB0aGUgbWFpbiB3aW5kb3cuICovXHJcbiAgICBEZXRhY2hlZD86IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2F2ZUZpbGVEaWFsb2dPcHRpb25zIHtcclxuICAgIC8qKiBEZWZhdWx0IGZpbGVuYW1lIHRvIHVzZSBpbiB0aGUgZGlhbG9nLiAqL1xyXG4gICAgRmlsZW5hbWU/OiBzdHJpbmc7XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjaG9zZW4uICovXHJcbiAgICBDYW5DaG9vc2VEaXJlY3Rvcmllcz86IGJvb2xlYW47XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIGZpbGVzIGNhbiBiZSBjaG9zZW4uICovXHJcbiAgICBDYW5DaG9vc2VGaWxlcz86IGJvb2xlYW47XHJcbiAgICAvKiogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjcmVhdGVkLiAqL1xyXG4gICAgQ2FuQ3JlYXRlRGlyZWN0b3JpZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBoaWRkZW4gZmlsZXMgc2hvdWxkIGJlIHNob3duLiAqL1xyXG4gICAgU2hvd0hpZGRlbkZpbGVzPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgYWxpYXNlcyBzaG91bGQgYmUgcmVzb2x2ZWQuICovXHJcbiAgICBSZXNvbHZlc0FsaWFzZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiB0aGUgZXh0ZW5zaW9uIHNob3VsZCBiZSBoaWRkZW4uICovXHJcbiAgICBIaWRlRXh0ZW5zaW9uPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgaGlkZGVuIGV4dGVuc2lvbnMgY2FuIGJlIHNlbGVjdGVkLiAqL1xyXG4gICAgQ2FuU2VsZWN0SGlkZGVuRXh0ZW5zaW9uPzogYm9vbGVhbjtcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgZmlsZSBwYWNrYWdlcyBzaG91bGQgYmUgdHJlYXRlZCBhcyBkaXJlY3Rvcmllcy4gKi9cclxuICAgIFRyZWF0c0ZpbGVQYWNrYWdlc0FzRGlyZWN0b3JpZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEluZGljYXRlcyBpZiBvdGhlciBmaWxlIHR5cGVzIGFyZSBhbGxvd2VkLiAqL1xyXG4gICAgQWxsb3dzT3RoZXJGaWxldHlwZXM/OiBib29sZWFuO1xyXG4gICAgLyoqIEFycmF5IG9mIGZpbGUgZmlsdGVycy4gKi9cclxuICAgIEZpbHRlcnM/OiBGaWxlRmlsdGVyW107XHJcbiAgICAvKiogVGl0bGUgb2YgdGhlIGRpYWxvZy4gKi9cclxuICAgIFRpdGxlPzogc3RyaW5nO1xyXG4gICAgLyoqIE1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLiAqL1xyXG4gICAgTWVzc2FnZT86IHN0cmluZztcclxuICAgIC8qKiBUZXh0IHRvIGRpc3BsYXkgb24gdGhlIGJ1dHRvbi4gKi9cclxuICAgIEJ1dHRvblRleHQ/OiBzdHJpbmc7XHJcbiAgICAvKiogRGlyZWN0b3J5IHRvIG9wZW4gaW4gdGhlIGRpYWxvZy4gKi9cclxuICAgIERpcmVjdG9yeT86IHN0cmluZztcclxuICAgIC8qKiBJbmRpY2F0ZXMgaWYgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93LiAqL1xyXG4gICAgRGV0YWNoZWQ/OiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE1lc3NhZ2VEaWFsb2dPcHRpb25zIHtcclxuICAgIC8qKiBUaGUgdGl0bGUgb2YgdGhlIGRpYWxvZyB3aW5kb3cuICovXHJcbiAgICBUaXRsZT86IHN0cmluZztcclxuICAgIC8qKiBUaGUgbWFpbiBtZXNzYWdlIHRvIHNob3cgaW4gdGhlIGRpYWxvZy4gKi9cclxuICAgIE1lc3NhZ2U/OiBzdHJpbmc7XHJcbiAgICAvKiogQXJyYXkgb2YgYnV0dG9uIG9wdGlvbnMgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLiAqL1xyXG4gICAgQnV0dG9ucz86IEJ1dHRvbltdO1xyXG4gICAgLyoqIFRydWUgaWYgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93IChpZiBhcHBsaWNhYmxlKS4gKi9cclxuICAgIERldGFjaGVkPzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCdXR0b24ge1xyXG4gICAgLyoqIFRleHQgdGhhdCBhcHBlYXJzIHdpdGhpbiB0aGUgYnV0dG9uLiAqL1xyXG4gICAgTGFiZWw/OiBzdHJpbmc7XHJcbiAgICAvKiogVHJ1ZSBpZiB0aGUgYnV0dG9uIHNob3VsZCBjYW5jZWwgYW4gb3BlcmF0aW9uIHdoZW4gY2xpY2tlZC4gKi9cclxuICAgIElzQ2FuY2VsPzogYm9vbGVhbjtcclxuICAgIC8qKiBUcnVlIGlmIHRoZSBidXR0b24gc2hvdWxkIGJlIHRoZSBkZWZhdWx0IGFjdGlvbiB3aGVuIHRoZSB1c2VyIHByZXNzZXMgZW50ZXIuICovXHJcbiAgICBJc0RlZmF1bHQ/OiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVGaWx0ZXIge1xyXG4gICAgLyoqIERpc3BsYXkgbmFtZSBmb3IgdGhlIGZpbHRlciwgaXQgY291bGQgYmUgXCJUZXh0IEZpbGVzXCIsIFwiSW1hZ2VzXCIgZXRjLiAqL1xyXG4gICAgRGlzcGxheU5hbWU/OiBzdHJpbmc7XHJcbiAgICAvKiogUGF0dGVybiB0byBtYXRjaCBmb3IgdGhlIGZpbHRlciwgZS5nLiBcIioudHh0OyoubWRcIiBmb3IgdGV4dCBtYXJrZG93biBmaWxlcy4gKi9cclxuICAgIFBhdHRlcm4/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQcmVzZW50cyBhIGRpYWxvZyBvZiBzcGVjaWZpZWQgdHlwZSB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxyXG4gKlxyXG4gKiBAcGFyYW0gdHlwZSAtIERpYWxvZyB0eXBlLlxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBkaWFsb2cuXHJcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggcmVzdWx0IG9mIGRpYWxvZy5cclxuICovXHJcbmZ1bmN0aW9uIGRpYWxvZyh0eXBlOiBudW1iZXIsIG9wdGlvbnM6IE1lc3NhZ2VEaWFsb2dPcHRpb25zIHwgT3BlbkZpbGVEaWFsb2dPcHRpb25zIHwgU2F2ZUZpbGVEaWFsb2dPcHRpb25zID0ge30pOiBQcm9taXNlPGFueT4ge1xyXG4gICAgcmV0dXJuIGNhbGwodHlwZSwgb3B0aW9ucyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQcmVzZW50cyBhbiBpbmZvIGRpYWxvZy5cclxuICpcclxuICogQHBhcmFtIG9wdGlvbnMgLSBEaWFsb2cgb3B0aW9uc1xyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBsYWJlbCBvZiB0aGUgY2hvc2VuIGJ1dHRvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBJbmZvKG9wdGlvbnM6IE1lc3NhZ2VEaWFsb2dPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHsgcmV0dXJuIGRpYWxvZyhEaWFsb2dJbmZvLCBvcHRpb25zKTsgfVxyXG5cclxuLyoqXHJcbiAqIFByZXNlbnRzIGEgd2FybmluZyBkaWFsb2cuXHJcbiAqXHJcbiAqIEBwYXJhbSBvcHRpb25zIC0gRGlhbG9nIG9wdGlvbnMuXHJcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGxhYmVsIG9mIHRoZSBjaG9zZW4gYnV0dG9uLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFdhcm5pbmcob3B0aW9uczogTWVzc2FnZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4geyByZXR1cm4gZGlhbG9nKERpYWxvZ1dhcm5pbmcsIG9wdGlvbnMpOyB9XHJcblxyXG4vKipcclxuICogUHJlc2VudHMgYW4gZXJyb3IgZGlhbG9nLlxyXG4gKlxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIERpYWxvZyBvcHRpb25zLlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBsYWJlbCBvZiB0aGUgY2hvc2VuIGJ1dHRvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBFcnJvcihvcHRpb25zOiBNZXNzYWdlRGlhbG9nT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7IHJldHVybiBkaWFsb2coRGlhbG9nRXJyb3IsIG9wdGlvbnMpOyB9XHJcblxyXG4vKipcclxuICogUHJlc2VudHMgYSBxdWVzdGlvbiBkaWFsb2cuXHJcbiAqXHJcbiAqIEBwYXJhbSBvcHRpb25zIC0gRGlhbG9nIG9wdGlvbnMuXHJcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGxhYmVsIG9mIHRoZSBjaG9zZW4gYnV0dG9uLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFF1ZXN0aW9uKG9wdGlvbnM6IE1lc3NhZ2VEaWFsb2dPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHsgcmV0dXJuIGRpYWxvZyhEaWFsb2dRdWVzdGlvbiwgb3B0aW9ucyk7IH1cclxuXHJcbi8qKlxyXG4gKiBQcmVzZW50cyBhIGZpbGUgc2VsZWN0aW9uIGRpYWxvZyB0byBwaWNrIG9uZSBvciBtb3JlIGZpbGVzIHRvIG9wZW4uXHJcbiAqXHJcbiAqIEBwYXJhbSBvcHRpb25zIC0gRGlhbG9nIG9wdGlvbnMuXHJcbiAqIEByZXR1cm5zIFNlbGVjdGVkIGZpbGUgb3IgbGlzdCBvZiBmaWxlcywgb3IgYSBibGFuayBzdHJpbmcvZW1wdHkgbGlzdCBpZiBubyBmaWxlIGhhcyBiZWVuIHNlbGVjdGVkLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIE9wZW5GaWxlKG9wdGlvbnM6IE9wZW5GaWxlRGlhbG9nT3B0aW9ucyAmIHsgQWxsb3dzTXVsdGlwbGVTZWxlY3Rpb246IHRydWUgfSk6IFByb21pc2U8c3RyaW5nW10+O1xyXG5leHBvcnQgZnVuY3Rpb24gT3BlbkZpbGUob3B0aW9uczogT3BlbkZpbGVEaWFsb2dPcHRpb25zICYgeyBBbGxvd3NNdWx0aXBsZVNlbGVjdGlvbj86IGZhbHNlIHwgdW5kZWZpbmVkIH0pOiBQcm9taXNlPHN0cmluZz47XHJcbmV4cG9ydCBmdW5jdGlvbiBPcGVuRmlsZShvcHRpb25zOiBPcGVuRmlsZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZyB8IHN0cmluZ1tdPjtcclxuZXhwb3J0IGZ1bmN0aW9uIE9wZW5GaWxlKG9wdGlvbnM6IE9wZW5GaWxlRGlhbG9nT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nIHwgc3RyaW5nW10+IHsgcmV0dXJuIGRpYWxvZyhEaWFsb2dPcGVuRmlsZSwgb3B0aW9ucykgPz8gW107IH1cclxuXHJcbi8qKlxyXG4gKiBQcmVzZW50cyBhIGZpbGUgc2VsZWN0aW9uIGRpYWxvZyB0byBwaWNrIGEgZmlsZSB0byBzYXZlLlxyXG4gKlxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIERpYWxvZyBvcHRpb25zLlxyXG4gKiBAcmV0dXJucyBTZWxlY3RlZCBmaWxlLCBvciBhIGJsYW5rIHN0cmluZyBpZiBubyBmaWxlIGhhcyBiZWVuIHNlbGVjdGVkLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFNhdmVGaWxlKG9wdGlvbnM6IFNhdmVGaWxlRGlhbG9nT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7IHJldHVybiBkaWFsb2coRGlhbG9nU2F2ZUZpbGUsIG9wdGlvbnMpOyB9XHJcbiIsICIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuaW1wb3J0IHsgZXZlbnRMaXN0ZW5lcnMsIExpc3RlbmVyLCBsaXN0ZW5lck9mZiB9IGZyb20gXCIuL2xpc3RlbmVyLmpzXCI7XHJcbmltcG9ydCB7IEV2ZW50cyBhcyBDcmVhdGUgfSBmcm9tIFwiLi9jcmVhdGUuanNcIjtcclxuaW1wb3J0IHsgVHlwZXMgfSBmcm9tIFwiLi9ldmVudF90eXBlcy5qc1wiO1xyXG5cclxuLy8gU2V0dXBcclxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcclxuXHJcbmlmIChoYXNET00pIHtcclxuICAgIHdpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xyXG4gICAgd2luZG93Ll93YWlscy5kaXNwYXRjaFdhaWxzRXZlbnQgPSBkaXNwYXRjaFdhaWxzRXZlbnQ7XHJcbn1cclxuXHJcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLkV2ZW50cyk7XHJcbmNvbnN0IEVtaXRNZXRob2QgPSAwO1xyXG5cclxuZXhwb3J0ICogZnJvbSBcIi4vZXZlbnRfdHlwZXMuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHRhYmxlIG9mIGRhdGEgdHlwZXMgZm9yIGFsbCBrbm93biBldmVudHMuXHJcbiAqIFdpbGwgYmUgbW9ua2V5LXBhdGNoZWQgYnkgdGhlIGJpbmRpbmcgZ2VuZXJhdG9yLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDdXN0b21FdmVudHMge31cclxuXHJcbi8qKlxyXG4gKiBFaXRoZXIgYSBrbm93biBldmVudCBuYW1lIG9yIGFuIGFyYml0cmFyeSBzdHJpbmcuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBXYWlsc0V2ZW50TmFtZTxFIGV4dGVuZHMga2V5b2YgQ3VzdG9tRXZlbnRzID0ga2V5b2YgQ3VzdG9tRXZlbnRzPiA9IEUgfCAoc3RyaW5nICYge30pO1xyXG5cclxuLyoqXHJcbiAqIFVuaW9uIG9mIGFsbCBrbm93biBzeXN0ZW0gZXZlbnQgbmFtZXMuXHJcbiAqL1xyXG50eXBlIFN5c3RlbUV2ZW50TmFtZSA9IHtcclxuICAgIFtLIGluIGtleW9mICh0eXBlb2YgVHlwZXMpXTogKHR5cGVvZiBUeXBlcylbS11ba2V5b2YgKCh0eXBlb2YgVHlwZXMpW0tdKV1cclxufSBleHRlbmRzIChpbmZlciBNKSA/IE1ba2V5b2YgTV0gOiBuZXZlcjtcclxuXHJcbi8qKlxyXG4gKiBUaGUgZGF0YSB0eXBlIGFzc29jaWF0ZWQgdG8gYSBnaXZlbiBldmVudC5cclxuICovXHJcbmV4cG9ydCB0eXBlIFdhaWxzRXZlbnREYXRhPEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPiA9XHJcbiAgICBFIGV4dGVuZHMga2V5b2YgQ3VzdG9tRXZlbnRzID8gQ3VzdG9tRXZlbnRzW0VdIDogKEUgZXh0ZW5kcyBTeXN0ZW1FdmVudE5hbWUgPyB2b2lkIDogYW55KTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgdHlwZSBvZiBoYW5kbGVycyBmb3IgYSBnaXZlbiBldmVudC5cclxuICovXHJcbmV4cG9ydCB0eXBlIFdhaWxzRXZlbnRDYWxsYmFjazxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4gPSAoZXY6IFdhaWxzRXZlbnQ8RT4pID0+IHZvaWQ7XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHN5c3RlbSBldmVudCBvciBhIGN1c3RvbSBldmVudCBlbWl0dGVkIHRocm91Z2ggd2FpbHMtcHJvdmlkZWQgZmFjaWxpdGllcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBXYWlsc0V2ZW50PEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPiB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cclxuICAgICAqL1xyXG4gICAgbmFtZTogRTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wdGlvbmFsIGRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoZSBlbWl0dGVkIGV2ZW50LlxyXG4gICAgICovXHJcbiAgICBkYXRhOiBXYWlsc0V2ZW50RGF0YTxFPjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE5hbWUgb2YgdGhlIG9yaWdpbmF0aW5nIHdpbmRvdy4gT21pdHRlZCBmb3IgYXBwbGljYXRpb24gZXZlbnRzLlxyXG4gICAgICogV2lsbCBiZSBvdmVycmlkZGVuIGlmIHNldCBtYW51YWxseS5cclxuICAgICAqL1xyXG4gICAgc2VuZGVyPzogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IEUsIGRhdGE6IFdhaWxzRXZlbnREYXRhPEU+KTtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IFdhaWxzRXZlbnREYXRhPEU+IGV4dGVuZHMgbnVsbCB8IHZvaWQgPyBFIDogbmV2ZXIpXHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBFLCBkYXRhPzogYW55KSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhID8/IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc3BhdGNoV2FpbHNFdmVudChldmVudDogYW55KSB7XHJcbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50Lm5hbWUpO1xyXG4gICAgaWYgKCFsaXN0ZW5lcnMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHdhaWxzRXZlbnQgPSBuZXcgV2FpbHNFdmVudChcclxuICAgICAgICBldmVudC5uYW1lLFxyXG4gICAgICAgIChldmVudC5uYW1lIGluIENyZWF0ZSkgPyBDcmVhdGVbZXZlbnQubmFtZV0oZXZlbnQuZGF0YSkgOiBldmVudC5kYXRhXHJcbiAgICApO1xyXG4gICAgaWYgKCdzZW5kZXInIGluIGV2ZW50KSB7XHJcbiAgICAgICAgd2FpbHNFdmVudC5zZW5kZXIgPSBldmVudC5zZW5kZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGlzcGF0Y2ggdG8gYSBzbmFwc2hvdCwgdGhlbiByZW1vdmUgYWxsIGV4cGlyZWQgbGlzdGVuZXJzIGluIGEgc2luZ2xlXHJcbiAgICAvLyBwb3N0LWRpc3BhdGNoIGZpbHRlciBvZiB0aGUgbGl2ZSBtYXAuXHJcbiAgICAvLyAtIFdyaXRpbmcgdGhlIHNuYXBzaG90IGJhY2sgd2hvbGVzYWxlIHdvdWxkIHVuZG8gc3Vic2NyaXB0aW9uIGNoYW5nZXNcclxuICAgIC8vICAgbWFkZSBpbnNpZGUgYSBoYW5kbGVyICgjNDM5MykuXHJcbiAgICAvLyAtIENhbGxpbmcgbGlzdGVuZXJPZmYoKSBwZXIgZXhwaXJlZCBsaXN0ZW5lciBpbnNpZGUgdGhlIGxvb3AgaXMgTyhuXHUwMEIyKVxyXG4gICAgLy8gICB3aGVuIG1hbnkgbGlzdGVuZXJzIGV4cGlyZSBvbiB0aGUgc2FtZSBldmVudC5cclxuICAgIC8vIEZpbHRlcmluZyB0aGUgbGl2ZSBhcnJheSBvbmNlIGFmdGVyIGRpc3BhdGNoIGlzIE8obikgYW5kIHN0aWxsIGhvbm91cnNcclxuICAgIC8vIGFueSBsaXN0ZW5lcnMgYWRkZWQgb3IgcmVtb3ZlZCBieSBoYW5kbGVycyBkdXJpbmcgZGlzcGF0Y2guXHJcbiAgICBjb25zdCBleHBpcmVkID0gbmV3IFNldDxMaXN0ZW5lcj4oKTtcclxuICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgbGlzdGVuZXJzLnNsaWNlKCkpIHtcclxuICAgICAgICBpZiAobGlzdGVuZXIuZGlzcGF0Y2god2FpbHNFdmVudCkpIHtcclxuICAgICAgICAgICAgZXhwaXJlZC5hZGQobGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChleHBpcmVkLnNpemUgPiAwKSB7XHJcbiAgICAgICAgY29uc3QgbGl2ZSA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudC5uYW1lKTtcclxuICAgICAgICBpZiAobGl2ZSkge1xyXG4gICAgICAgICAgICBjb25zdCByZW1haW5pbmcgPSBsaXZlLmZpbHRlcihsID0+ICFleHBpcmVkLmhhcyhsKSk7XHJcbiAgICAgICAgICAgIGlmIChyZW1haW5pbmcubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVycy5kZWxldGUoZXZlbnQubmFtZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVycy5zZXQoZXZlbnQubmFtZSwgcmVtYWluaW5nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGZvciBhIHNwZWNpZmljIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmb3IuXHJcbiAqIEBwYXJhbSBjYWxsYmFjayAtIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlxyXG4gKiBAcGFyYW0gbWF4Q2FsbGJhY2tzIC0gVGhlIG1heGltdW0gbnVtYmVyIG9mIHRpbWVzIHRoZSBjYWxsYmFjayBjYW4gYmUgY2FsbGVkIGZvciB0aGUgZXZlbnQuIE9uY2UgdGhlIG1heGltdW0gbnVtYmVyIGlzIHJlYWNoZWQsIHRoZSBjYWxsYmFjayB3aWxsIG5vIGxvbmdlciBiZSBjYWxsZWQuXHJcbiAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIHdpbGwgdW5yZWdpc3RlciB0aGUgY2FsbGJhY2sgZnJvbSB0aGUgZXZlbnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gT25NdWx0aXBsZTxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4oZXZlbnROYW1lOiBFLCBjYWxsYmFjazogV2FpbHNFdmVudENhbGxiYWNrPEU+LCBtYXhDYWxsYmFja3M6IG51bWJlcikge1xyXG4gICAgbGV0IGxpc3RlbmVycyA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudE5hbWUpIHx8IFtdO1xyXG4gICAgY29uc3QgdGhpc0xpc3RlbmVyID0gbmV3IExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG1heENhbGxiYWNrcyk7XHJcbiAgICBsaXN0ZW5lcnMucHVzaCh0aGlzTGlzdGVuZXIpO1xyXG4gICAgZXZlbnRMaXN0ZW5lcnMuc2V0KGV2ZW50TmFtZSwgbGlzdGVuZXJzKTtcclxuICAgIHJldHVybiAoKSA9PiBsaXN0ZW5lck9mZih0aGlzTGlzdGVuZXIpO1xyXG59XHJcblxyXG4vKipcclxuICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgc3BlY2lmaWVkIGV2ZW50IG9jY3Vycy5cclxuICpcclxuICogQHBhcmFtIGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byByZWdpc3RlciB0aGUgY2FsbGJhY2sgZm9yLlxyXG4gKiBAcGFyYW0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5cclxuICogQHJldHVybnMgQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBPbjxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4oZXZlbnROYW1lOiBFLCBjYWxsYmFjazogV2FpbHNFdmVudENhbGxiYWNrPEU+KTogKCkgPT4gdm9pZCB7XHJcbiAgICByZXR1cm4gT25NdWx0aXBsZShldmVudE5hbWUsIGNhbGxiYWNrLCAtMSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZWdpc3RlcnMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCBvbmx5IG9uY2UgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZvci5cclxuICogQHBhcmFtIGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuXHJcbiAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIHdpbGwgdW5yZWdpc3RlciB0aGUgY2FsbGJhY2sgZnJvbSB0aGUgZXZlbnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gT25jZTxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4oZXZlbnROYW1lOiBFLCBjYWxsYmFjazogV2FpbHNFdmVudENhbGxiYWNrPEU+KTogKCkgPT4gdm9pZCB7XHJcbiAgICByZXR1cm4gT25NdWx0aXBsZShldmVudE5hbWUsIGNhbGxiYWNrLCAxKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IG5hbWVzLlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnROYW1lcyAtIFRoZSBuYW1lIG9mIHRoZSBldmVudHMgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gT2ZmKC4uLmV2ZW50TmFtZXM6IFtXYWlsc0V2ZW50TmFtZSwgLi4uV2FpbHNFdmVudE5hbWVbXV0pOiB2b2lkIHtcclxuICAgIGV2ZW50TmFtZXMuZm9yRWFjaChldmVudE5hbWUgPT4gZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGV2ZW50TmFtZSkpO1xyXG59XHJcblxyXG4vKipcclxuICogUmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIE9mZkFsbCgpOiB2b2lkIHtcclxuICAgIGV2ZW50TGlzdGVuZXJzLmNsZWFyKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFbWl0cyBhbiBldmVudC5cclxuICpcclxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgd2lsbCBiZSBmdWxmaWxsZWQgb25jZSB0aGUgZXZlbnQgaGFzIGJlZW4gZW1pdHRlZC4gIFJlc29sdmVzIHRvIHRydWUgaWYgdGhlIGV2ZW50IHdhcyBjYW5jZWxsZWQuXHJcbiAqIEBwYXJhbSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGVtaXRcclxuICogQHBhcmFtIGRhdGEgLSBUaGUgZGF0YSB0aGF0IHdpbGwgYmUgc2VudCB3aXRoIHRoZSBldmVudFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEVtaXQ8RSBleHRlbmRzIFdhaWxzRXZlbnROYW1lID0gV2FpbHNFdmVudE5hbWU+KG5hbWU6IEUsIGRhdGE6IFdhaWxzRXZlbnREYXRhPEU+KTogUHJvbWlzZTxib29sZWFuPlxyXG5leHBvcnQgZnVuY3Rpb24gRW1pdDxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4obmFtZTogV2FpbHNFdmVudERhdGE8RT4gZXh0ZW5kcyBudWxsIHwgdm9pZCA/IEUgOiBuZXZlcik6IFByb21pc2U8Ym9vbGVhbj5cclxuZXhwb3J0IGZ1bmN0aW9uIEVtaXQ8RSBleHRlbmRzIFdhaWxzRXZlbnROYW1lID0gV2FpbHNFdmVudE5hbWU+KG5hbWU6IFdhaWxzRXZlbnREYXRhPEU+LCBkYXRhPzogYW55KTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gY2FsbChFbWl0TWV0aG9kLCAgbmV3IFdhaWxzRXZlbnQobmFtZSwgZGF0YSkpXHJcbn1cclxuXHJcbiIsICIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG4vLyBUaGUgZm9sbG93aW5nIHV0aWxpdGllcyBoYXZlIGJlZW4gZmFjdG9yZWQgb3V0IG9mIC4vZXZlbnRzLnRzXHJcbi8vIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxyXG5cclxuZXhwb3J0IGNvbnN0IGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIExpc3RlbmVyW10+KCk7XHJcblxyXG5leHBvcnQgY2xhc3MgTGlzdGVuZXIge1xyXG4gICAgZXZlbnROYW1lOiBzdHJpbmc7XHJcbiAgICBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gdm9pZDtcclxuICAgIG1heENhbGxiYWNrczogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gdm9pZCwgbWF4Q2FsbGJhY2tzOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgdGhpcy5tYXhDYWxsYmFja3MgPSBtYXhDYWxsYmFja3MgfHwgLTE7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcGF0Y2goZGF0YTogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayhkYXRhKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWF4Q2FsbGJhY2tzID09PSAtMSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHRoaXMubWF4Q2FsbGJhY2tzIC09IDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWF4Q2FsbGJhY2tzID09PSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuZXJPZmYobGlzdGVuZXI6IExpc3RlbmVyKTogdm9pZCB7XHJcbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGxpc3RlbmVyLmV2ZW50TmFtZSk7XHJcbiAgICBpZiAoIWxpc3RlbmVycykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuZmlsdGVyKGwgPT4gbCAhPT0gbGlzdGVuZXIpO1xyXG4gICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICBldmVudExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIuZXZlbnROYW1lKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZXZlbnRMaXN0ZW5lcnMuc2V0KGxpc3RlbmVyLmV2ZW50TmFtZSwgbGlzdGVuZXJzKTtcclxuICAgIH1cclxufVxyXG4iLCAiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuLyoqXHJcbiAqIEFueSBpcyBhIGR1bW15IGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBzaW1wbGUgb3IgdW5rbm93biB0eXBlcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBBbnk8VCA9IGFueT4oc291cmNlOiBhbnkpOiBUIHtcclxuICAgIHJldHVybiBzb3VyY2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCeXRlU2xpY2UgaXMgYSBjcmVhdGlvbiBmdW5jdGlvbiB0aGF0IHJlcGxhY2VzXHJcbiAqIG51bGwgc3RyaW5ncyB3aXRoIGVtcHR5IHN0cmluZ3MuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gQnl0ZVNsaWNlKHNvdXJjZTogYW55KTogc3RyaW5nIHtcclxuICAgIHJldHVybiAoKHNvdXJjZSA9PSBudWxsKSA/IFwiXCIgOiBzb3VyY2UpO1xyXG59XHJcblxyXG4vKipcclxuICogQXJyYXkgdGFrZXMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJiaXRyYXJ5IHR5cGVcclxuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIGFycmF5XHJcbiAqIHdob3NlIGVsZW1lbnRzIGFyZSBvZiB0aGF0IHR5cGUuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gQXJyYXk8VCA9IGFueT4oZWxlbWVudDogKHNvdXJjZTogYW55KSA9PiBUKTogKHNvdXJjZTogYW55KSA9PiBUW10ge1xyXG4gICAgaWYgKGVsZW1lbnQgPT09IEFueSkge1xyXG4gICAgICAgIHJldHVybiAoc291cmNlKSA9PiAoc291cmNlID09PSBudWxsID8gW10gOiBzb3VyY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAoc291cmNlKSA9PiB7XHJcbiAgICAgICAgaWYgKHNvdXJjZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHNvdXJjZVtpXSA9IGVsZW1lbnQoc291cmNlW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYXAgdGFrZXMgY3JlYXRpb24gZnVuY3Rpb25zIGZvciB0d28gYXJiaXRyYXJ5IHR5cGVzXHJcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBvYmplY3RcclxuICogd2hvc2Uga2V5cyBhbmQgdmFsdWVzIGFyZSBvZiB0aG9zZSB0eXBlcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBNYXA8SyBleHRlbmRzIFByb3BlcnR5S2V5ID0gYW55LCBWID0gYW55PihrZXk6IChzb3VyY2U6IGFueSkgPT4gSywgdmFsdWU6IChzb3VyY2U6IGFueSkgPT4gVik6IChzb3VyY2U6IGFueSkgPT4gUmVjb3JkPEssIFY+IHtcclxuICAgIGlmICh2YWx1ZSA9PT0gQW55KSB7XHJcbiAgICAgICAgcmV0dXJuIChzb3VyY2UpID0+IChzb3VyY2UgPT09IG51bGwgPyB7fSA6IHNvdXJjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIChzb3VyY2UpID0+IHtcclxuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XHJcbiAgICAgICAgICAgIHNvdXJjZVtrZXldID0gdmFsdWUoc291cmNlW2tleV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc291cmNlO1xyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE51bGxhYmxlIHRha2VzIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIGFyYml0cmFyeSB0eXBlXHJcbiAqIGFuZCByZXR1cm5zIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGEgbnVsbGFibGUgdmFsdWUgb2YgdGhhdCB0eXBlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIE51bGxhYmxlPFQgPSBhbnk+KGVsZW1lbnQ6IChzb3VyY2U6IGFueSkgPT4gVCk6IChzb3VyY2U6IGFueSkgPT4gKFQgfCBudWxsKSB7XHJcbiAgICBpZiAoZWxlbWVudCA9PT0gQW55KSB7XHJcbiAgICAgICAgcmV0dXJuIEFueTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IG51bGwgOiBlbGVtZW50KHNvdXJjZSkpO1xyXG59XHJcblxyXG4vKipcclxuICogU3RydWN0IHRha2VzIGFuIG9iamVjdCBtYXBwaW5nIGZpZWxkIG5hbWVzIHRvIGNyZWF0aW9uIGZ1bmN0aW9uc1xyXG4gKiBhbmQgcmV0dXJucyBhbiBpbi1wbGFjZSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYSBzdHJ1Y3QuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gU3RydWN0KGNyZWF0ZUZpZWxkOiBSZWNvcmQ8c3RyaW5nLCAoc291cmNlOiBhbnkpID0+IGFueT4pOlxyXG4gICAgPFUgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0gYW55Pihzb3VyY2U6IGFueSkgPT4gVVxyXG57XHJcbiAgICBsZXQgYWxsQW55ID0gdHJ1ZTtcclxuICAgIGZvciAoY29uc3QgbmFtZSBpbiBjcmVhdGVGaWVsZCkge1xyXG4gICAgICAgIGlmIChjcmVhdGVGaWVsZFtuYW1lXSAhPT0gQW55KSB7XHJcbiAgICAgICAgICAgIGFsbEFueSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoYWxsQW55KSB7XHJcbiAgICAgICAgcmV0dXJuIEFueTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xyXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBjcmVhdGVGaWVsZCkge1xyXG4gICAgICAgICAgICBpZiAobmFtZSBpbiBzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgIHNvdXJjZVtuYW1lXSA9IGNyZWF0ZUZpZWxkW25hbWVdKHNvdXJjZVtuYW1lXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEYXRlRnJvbVRpbWUgaXMgYSBjcmVhdGlvbiBmdW5jdGlvbiB0aGF0IGNvbnZlcnRzIFJGQzMzMzkgc3RyaW5nc1xyXG4gKiAoZnJvbSBHbydzIHRpbWUuVGltZSBKU09OIG1hcnNoYWxpbmcpIHRvIEphdmFTY3JpcHQgRGF0ZSBvYmplY3RzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIERhdGVGcm9tVGltZShzb3VyY2U6IGFueSk6IERhdGUge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRlKHNvdXJjZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYXBzIGtub3duIGV2ZW50IG5hbWVzIHRvIGNyZWF0aW9uIGZ1bmN0aW9ucyBmb3IgdGhlaXIgZGF0YSB0eXBlcy5cclxuICogV2lsbCBiZSBtb25rZXktcGF0Y2hlZCBieSB0aGUgYmluZGluZyBnZW5lcmF0b3IuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgRXZlbnRzOiBSZWNvcmQ8c3RyaW5nLCAoc291cmNlOiBhbnkpID0+IGFueT4gPSB7fTtcclxuIiwgIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxyXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXHJcblxyXG5leHBvcnQgY29uc3QgVHlwZXMgPSBPYmplY3QuZnJlZXplKHtcclxuXHRXaW5kb3dzOiBPYmplY3QuZnJlZXplKHtcclxuXHRcdEFQTVBvd2VyU2V0dGluZ0NoYW5nZTogXCJ3aW5kb3dzOkFQTVBvd2VyU2V0dGluZ0NoYW5nZVwiLFxyXG5cdFx0QVBNUG93ZXJTdGF0dXNDaGFuZ2U6IFwid2luZG93czpBUE1Qb3dlclN0YXR1c0NoYW5nZVwiLFxyXG5cdFx0QVBNUmVzdW1lQXV0b21hdGljOiBcIndpbmRvd3M6QVBNUmVzdW1lQXV0b21hdGljXCIsXHJcblx0XHRBUE1SZXN1bWVTdXNwZW5kOiBcIndpbmRvd3M6QVBNUmVzdW1lU3VzcGVuZFwiLFxyXG5cdFx0QVBNU3VzcGVuZDogXCJ3aW5kb3dzOkFQTVN1c3BlbmRcIixcclxuXHRcdEFwcGxpY2F0aW9uU3RhcnRlZDogXCJ3aW5kb3dzOkFwcGxpY2F0aW9uU3RhcnRlZFwiLFxyXG5cdFx0U3lzdGVtVGhlbWVDaGFuZ2VkOiBcIndpbmRvd3M6U3lzdGVtVGhlbWVDaGFuZ2VkXCIsXHJcblx0XHRXZWJWaWV3TmF2aWdhdGlvbkNvbXBsZXRlZDogXCJ3aW5kb3dzOldlYlZpZXdOYXZpZ2F0aW9uQ29tcGxldGVkXCIsXHJcblx0XHRXaW5kb3dBY3RpdmU6IFwid2luZG93czpXaW5kb3dBY3RpdmVcIixcclxuXHRcdFdpbmRvd0JhY2tncm91bmRFcmFzZTogXCJ3aW5kb3dzOldpbmRvd0JhY2tncm91bmRFcmFzZVwiLFxyXG5cdFx0V2luZG93Q2xpY2tBY3RpdmU6IFwid2luZG93czpXaW5kb3dDbGlja0FjdGl2ZVwiLFxyXG5cdFx0V2luZG93Q2xvc2luZzogXCJ3aW5kb3dzOldpbmRvd0Nsb3NpbmdcIixcclxuXHRcdFdpbmRvd0RpZE1vdmU6IFwid2luZG93czpXaW5kb3dEaWRNb3ZlXCIsXHJcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwid2luZG93czpXaW5kb3dEaWRSZXNpemVcIixcclxuXHRcdFdpbmRvd0RQSUNoYW5nZWQ6IFwid2luZG93czpXaW5kb3dEUElDaGFuZ2VkXCIsXHJcblx0XHRXaW5kb3dEcmFnRHJvcDogXCJ3aW5kb3dzOldpbmRvd0RyYWdEcm9wXCIsXHJcblx0XHRXaW5kb3dEcmFnRW50ZXI6IFwid2luZG93czpXaW5kb3dEcmFnRW50ZXJcIixcclxuXHRcdFdpbmRvd0RyYWdMZWF2ZTogXCJ3aW5kb3dzOldpbmRvd0RyYWdMZWF2ZVwiLFxyXG5cdFx0V2luZG93RHJhZ092ZXI6IFwid2luZG93czpXaW5kb3dEcmFnT3ZlclwiLFxyXG5cdFx0V2luZG93RW5kTW92ZTogXCJ3aW5kb3dzOldpbmRvd0VuZE1vdmVcIixcclxuXHRcdFdpbmRvd0VuZFJlc2l6ZTogXCJ3aW5kb3dzOldpbmRvd0VuZFJlc2l6ZVwiLFxyXG5cdFx0V2luZG93RnVsbHNjcmVlbjogXCJ3aW5kb3dzOldpbmRvd0Z1bGxzY3JlZW5cIixcclxuXHRcdFdpbmRvd0hpZGU6IFwid2luZG93czpXaW5kb3dIaWRlXCIsXHJcblx0XHRXaW5kb3dJbmFjdGl2ZTogXCJ3aW5kb3dzOldpbmRvd0luYWN0aXZlXCIsXHJcblx0XHRXaW5kb3dLZXlEb3duOiBcIndpbmRvd3M6V2luZG93S2V5RG93blwiLFxyXG5cdFx0V2luZG93S2V5VXA6IFwid2luZG93czpXaW5kb3dLZXlVcFwiLFxyXG5cdFx0V2luZG93S2lsbEZvY3VzOiBcIndpbmRvd3M6V2luZG93S2lsbEZvY3VzXCIsXHJcblx0XHRXaW5kb3dOb25DbGllbnRIaXQ6IFwid2luZG93czpXaW5kb3dOb25DbGllbnRIaXRcIixcclxuXHRcdFdpbmRvd05vbkNsaWVudE1vdXNlRG93bjogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlRG93blwiLFxyXG5cdFx0V2luZG93Tm9uQ2xpZW50TW91c2VMZWF2ZTogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlTGVhdmVcIixcclxuXHRcdFdpbmRvd05vbkNsaWVudE1vdXNlTW92ZTogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlTW92ZVwiLFxyXG5cdFx0V2luZG93Tm9uQ2xpZW50TW91c2VVcDogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlVXBcIixcclxuXHRcdFdpbmRvd1BhaW50OiBcIndpbmRvd3M6V2luZG93UGFpbnRcIixcclxuXHRcdFdpbmRvd1Jlc3RvcmU6IFwid2luZG93czpXaW5kb3dSZXN0b3JlXCIsXHJcblx0XHRXaW5kb3dTZXRGb2N1czogXCJ3aW5kb3dzOldpbmRvd1NldEZvY3VzXCIsXHJcblx0XHRXaW5kb3dTaG93OiBcIndpbmRvd3M6V2luZG93U2hvd1wiLFxyXG5cdFx0V2luZG93U3RhcnRNb3ZlOiBcIndpbmRvd3M6V2luZG93U3RhcnRNb3ZlXCIsXHJcblx0XHRXaW5kb3dTdGFydFJlc2l6ZTogXCJ3aW5kb3dzOldpbmRvd1N0YXJ0UmVzaXplXCIsXHJcblx0XHRXaW5kb3dVbkZ1bGxzY3JlZW46IFwid2luZG93czpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcclxuXHRcdFdpbmRvd1pPcmRlckNoYW5nZWQ6IFwid2luZG93czpXaW5kb3daT3JkZXJDaGFuZ2VkXCIsXHJcblx0XHRXaW5kb3dNaW5pbWlzZTogXCJ3aW5kb3dzOldpbmRvd01pbmltaXNlXCIsXHJcblx0XHRXaW5kb3dVbk1pbmltaXNlOiBcIndpbmRvd3M6V2luZG93VW5NaW5pbWlzZVwiLFxyXG5cdFx0V2luZG93TWF4aW1pc2U6IFwid2luZG93czpXaW5kb3dNYXhpbWlzZVwiLFxyXG5cdFx0V2luZG93VW5NYXhpbWlzZTogXCJ3aW5kb3dzOldpbmRvd1VuTWF4aW1pc2VcIixcclxuXHR9KSxcclxuXHRNYWM6IE9iamVjdC5mcmVlemUoe1xyXG5cdFx0QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQmVjb21lQWN0aXZlXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUVmZmVjdGl2ZUFwcGVhcmFuY2U6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZVwiLFxyXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VJY29uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUljb25cIixcclxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGVcIixcclxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlU2NyZWVuUGFyYW1ldGVyczogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0Jhck9yaWVudGF0aW9uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0Jhck9yaWVudGF0aW9uXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVRoZW1lOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVRoZW1lXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZzogXCJtYWM6QXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmdcIixcclxuXHRcdEFwcGxpY2F0aW9uRGlkSGlkZTogXCJtYWM6QXBwbGljYXRpb25EaWRIaWRlXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZFJlc2lnbkFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25EaWRSZXNpZ25BY3RpdmVcIixcclxuXHRcdEFwcGxpY2F0aW9uRGlkVW5oaWRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZFVuaGlkZVwiLFxyXG5cdFx0QXBwbGljYXRpb25EaWRVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkVXBkYXRlXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZFdha2U6IFwibWFjOkFwcGxpY2F0aW9uRGlkV2FrZVwiLFxyXG5cdFx0QXBwbGljYXRpb25TY3JlZW5zRGlkU2xlZXA6IFwibWFjOkFwcGxpY2F0aW9uU2NyZWVuc0RpZFNsZWVwXCIsXHJcblx0XHRBcHBsaWNhdGlvblNjcmVlbnNEaWRXYWtlOiBcIm1hYzpBcHBsaWNhdGlvblNjcmVlbnNEaWRXYWtlXCIsXHJcblx0XHRBcHBsaWNhdGlvblNob3VsZEhhbmRsZVJlb3BlbjogXCJtYWM6QXBwbGljYXRpb25TaG91bGRIYW5kbGVSZW9wZW5cIixcclxuXHRcdEFwcGxpY2F0aW9uV2lsbEJlY29tZUFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsQmVjb21lQWN0aXZlXCIsXHJcblx0XHRBcHBsaWNhdGlvbldpbGxGaW5pc2hMYXVuY2hpbmc6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEZpbmlzaExhdW5jaGluZ1wiLFxyXG5cdFx0QXBwbGljYXRpb25XaWxsSGlkZTogXCJtYWM6QXBwbGljYXRpb25XaWxsSGlkZVwiLFxyXG5cdFx0QXBwbGljYXRpb25XaWxsUmVzaWduQWN0aXZlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmVcIixcclxuXHRcdEFwcGxpY2F0aW9uV2lsbFNsZWVwOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxTbGVlcFwiLFxyXG5cdFx0QXBwbGljYXRpb25XaWxsVGVybWluYXRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxUZXJtaW5hdGVcIixcclxuXHRcdEFwcGxpY2F0aW9uV2lsbFVuaGlkZTogXCJtYWM6QXBwbGljYXRpb25XaWxsVW5oaWRlXCIsXHJcblx0XHRBcHBsaWNhdGlvbldpbGxVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFVwZGF0ZVwiLFxyXG5cdFx0TWVudURpZEFkZEl0ZW06IFwibWFjOk1lbnVEaWRBZGRJdGVtXCIsXHJcblx0XHRNZW51RGlkQmVnaW5UcmFja2luZzogXCJtYWM6TWVudURpZEJlZ2luVHJhY2tpbmdcIixcclxuXHRcdE1lbnVEaWRDbG9zZTogXCJtYWM6TWVudURpZENsb3NlXCIsXHJcblx0XHRNZW51RGlkRGlzcGxheUl0ZW06IFwibWFjOk1lbnVEaWREaXNwbGF5SXRlbVwiLFxyXG5cdFx0TWVudURpZEVuZFRyYWNraW5nOiBcIm1hYzpNZW51RGlkRW5kVHJhY2tpbmdcIixcclxuXHRcdE1lbnVEaWRIaWdobGlnaHRJdGVtOiBcIm1hYzpNZW51RGlkSGlnaGxpZ2h0SXRlbVwiLFxyXG5cdFx0TWVudURpZE9wZW46IFwibWFjOk1lbnVEaWRPcGVuXCIsXHJcblx0XHRNZW51RGlkUG9wVXA6IFwibWFjOk1lbnVEaWRQb3BVcFwiLFxyXG5cdFx0TWVudURpZFJlbW92ZUl0ZW06IFwibWFjOk1lbnVEaWRSZW1vdmVJdGVtXCIsXHJcblx0XHRNZW51RGlkU2VuZEFjdGlvbjogXCJtYWM6TWVudURpZFNlbmRBY3Rpb25cIixcclxuXHRcdE1lbnVEaWRTZW5kQWN0aW9uVG9JdGVtOiBcIm1hYzpNZW51RGlkU2VuZEFjdGlvblRvSXRlbVwiLFxyXG5cdFx0TWVudURpZFVwZGF0ZTogXCJtYWM6TWVudURpZFVwZGF0ZVwiLFxyXG5cdFx0TWVudVdpbGxBZGRJdGVtOiBcIm1hYzpNZW51V2lsbEFkZEl0ZW1cIixcclxuXHRcdE1lbnVXaWxsQmVnaW5UcmFja2luZzogXCJtYWM6TWVudVdpbGxCZWdpblRyYWNraW5nXCIsXHJcblx0XHRNZW51V2lsbERpc3BsYXlJdGVtOiBcIm1hYzpNZW51V2lsbERpc3BsYXlJdGVtXCIsXHJcblx0XHRNZW51V2lsbEVuZFRyYWNraW5nOiBcIm1hYzpNZW51V2lsbEVuZFRyYWNraW5nXCIsXHJcblx0XHRNZW51V2lsbEhpZ2hsaWdodEl0ZW06IFwibWFjOk1lbnVXaWxsSGlnaGxpZ2h0SXRlbVwiLFxyXG5cdFx0TWVudVdpbGxPcGVuOiBcIm1hYzpNZW51V2lsbE9wZW5cIixcclxuXHRcdE1lbnVXaWxsUG9wVXA6IFwibWFjOk1lbnVXaWxsUG9wVXBcIixcclxuXHRcdE1lbnVXaWxsUmVtb3ZlSXRlbTogXCJtYWM6TWVudVdpbGxSZW1vdmVJdGVtXCIsXHJcblx0XHRNZW51V2lsbFNlbmRBY3Rpb246IFwibWFjOk1lbnVXaWxsU2VuZEFjdGlvblwiLFxyXG5cdFx0TWVudVdpbGxTZW5kQWN0aW9uVG9JdGVtOiBcIm1hYzpNZW51V2lsbFNlbmRBY3Rpb25Ub0l0ZW1cIixcclxuXHRcdE1lbnVXaWxsVXBkYXRlOiBcIm1hYzpNZW51V2lsbFVwZGF0ZVwiLFxyXG5cdFx0V2ViVmlld0RpZENvbW1pdE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRDb21taXROYXZpZ2F0aW9uXCIsXHJcblx0XHRXZWJWaWV3RGlkRmluaXNoTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZEZpbmlzaE5hdmlnYXRpb25cIixcclxuXHRcdFdlYlZpZXdEaWRSZWNlaXZlU2VydmVyUmVkaXJlY3RGb3JQcm92aXNpb25hbE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRSZWNlaXZlU2VydmVyUmVkaXJlY3RGb3JQcm92aXNpb25hbE5hdmlnYXRpb25cIixcclxuXHRcdFdlYlZpZXdEaWRTdGFydFByb3Zpc2lvbmFsTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZFN0YXJ0UHJvdmlzaW9uYWxOYXZpZ2F0aW9uXCIsXHJcblx0XHRXaW5kb3dEaWRCZWNvbWVLZXk6IFwibWFjOldpbmRvd0RpZEJlY29tZUtleVwiLFxyXG5cdFx0V2luZG93RGlkQmVjb21lTWFpbjogXCJtYWM6V2luZG93RGlkQmVjb21lTWFpblwiLFxyXG5cdFx0V2luZG93RGlkQmVnaW5TaGVldDogXCJtYWM6V2luZG93RGlkQmVnaW5TaGVldFwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlQWxwaGE6IFwibWFjOldpbmRvd0RpZENoYW5nZUFscGhhXCIsXHJcblx0XHRXaW5kb3dEaWRDaGFuZ2VCYWNraW5nTG9jYXRpb246IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdMb2NhdGlvblwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlQmFja2luZ1Byb3BlcnRpZXM6IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzXCIsXHJcblx0XHRXaW5kb3dEaWRDaGFuZ2VDb2xsZWN0aW9uQmVoYXZpb3I6IFwibWFjOldpbmRvd0RpZENoYW5nZUNvbGxlY3Rpb25CZWhhdmlvclwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZVwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGU6IFwibWFjOldpbmRvd0RpZENoYW5nZU9jY2x1c2lvblN0YXRlXCIsXHJcblx0XHRXaW5kb3dEaWRDaGFuZ2VPcmRlcmluZ01vZGU6IFwibWFjOldpbmRvd0RpZENoYW5nZU9yZGVyaW5nTW9kZVwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5cIixcclxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblBhcmFtZXRlcnM6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblBhcmFtZXRlcnNcIixcclxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblByb2ZpbGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblByb2ZpbGVcIixcclxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2VQcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVByb3BlcnRpZXNcIixcclxuXHRcdFdpbmRvd0RpZENoYW5nZVNoYXJpbmdUeXBlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTaGFyaW5nVHlwZVwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlU3BhY2U6IFwibWFjOldpbmRvd0RpZENoYW5nZVNwYWNlXCIsXHJcblx0XHRXaW5kb3dEaWRDaGFuZ2VTcGFjZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU3BhY2VPcmRlcmluZ01vZGVcIixcclxuXHRcdFdpbmRvd0RpZENoYW5nZVRpdGxlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VUaXRsZVwiLFxyXG5cdFx0V2luZG93RGlkQ2hhbmdlVG9vbGJhcjogXCJtYWM6V2luZG93RGlkQ2hhbmdlVG9vbGJhclwiLFxyXG5cdFx0V2luZG93RGlkRGVtaW5pYXR1cml6ZTogXCJtYWM6V2luZG93RGlkRGVtaW5pYXR1cml6ZVwiLFxyXG5cdFx0V2luZG93RGlkRW5kU2hlZXQ6IFwibWFjOldpbmRvd0RpZEVuZFNoZWV0XCIsXHJcblx0XHRXaW5kb3dEaWRFbnRlckZ1bGxTY3JlZW46IFwibWFjOldpbmRvd0RpZEVudGVyRnVsbFNjcmVlblwiLFxyXG5cdFx0V2luZG93RGlkRW50ZXJWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93RGlkRW50ZXJWZXJzaW9uQnJvd3NlclwiLFxyXG5cdFx0V2luZG93RGlkRXhpdEZ1bGxTY3JlZW46IFwibWFjOldpbmRvd0RpZEV4aXRGdWxsU2NyZWVuXCIsXHJcblx0XHRXaW5kb3dEaWRFeGl0VmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd0RpZEV4aXRWZXJzaW9uQnJvd3NlclwiLFxyXG5cdFx0V2luZG93RGlkRXhwb3NlOiBcIm1hYzpXaW5kb3dEaWRFeHBvc2VcIixcclxuXHRcdFdpbmRvd0RpZEZvY3VzOiBcIm1hYzpXaW5kb3dEaWRGb2N1c1wiLFxyXG5cdFx0V2luZG93RGlkTWluaWF0dXJpemU6IFwibWFjOldpbmRvd0RpZE1pbmlhdHVyaXplXCIsXHJcblx0XHRXaW5kb3dEaWRNb3ZlOiBcIm1hYzpXaW5kb3dEaWRNb3ZlXCIsXHJcblx0XHRXaW5kb3dEaWRPcmRlck9mZlNjcmVlbjogXCJtYWM6V2luZG93RGlkT3JkZXJPZmZTY3JlZW5cIixcclxuXHRcdFdpbmRvd0RpZE9yZGVyT25TY3JlZW46IFwibWFjOldpbmRvd0RpZE9yZGVyT25TY3JlZW5cIixcclxuXHRcdFdpbmRvd0RpZFJlc2lnbktleTogXCJtYWM6V2luZG93RGlkUmVzaWduS2V5XCIsXHJcblx0XHRXaW5kb3dEaWRSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dEaWRSZXNpZ25NYWluXCIsXHJcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwibWFjOldpbmRvd0RpZFJlc2l6ZVwiLFxyXG5cdFx0V2luZG93RGlkVXBkYXRlOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVcIixcclxuXHRcdFdpbmRvd0RpZFVwZGF0ZUFscGhhOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVBbHBoYVwiLFxyXG5cdFx0V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3JcIixcclxuXHRcdFdpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllc1wiLFxyXG5cdFx0V2luZG93RGlkVXBkYXRlU2hhZG93OiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVTaGFkb3dcIixcclxuXHRcdFdpbmRvd0RpZFVwZGF0ZVRpdGxlOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVUaXRsZVwiLFxyXG5cdFx0V2luZG93RGlkVXBkYXRlVG9vbGJhcjogXCJtYWM6V2luZG93RGlkVXBkYXRlVG9vbGJhclwiLFxyXG5cdFx0V2luZG93RGlkWm9vbTogXCJtYWM6V2luZG93RGlkWm9vbVwiLFxyXG5cdFx0V2luZG93RmlsZURyYWdnaW5nRW50ZXJlZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nRW50ZXJlZFwiLFxyXG5cdFx0V2luZG93RmlsZURyYWdnaW5nRXhpdGVkOiBcIm1hYzpXaW5kb3dGaWxlRHJhZ2dpbmdFeGl0ZWRcIixcclxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ1BlcmZvcm1lZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nUGVyZm9ybWVkXCIsXHJcblx0XHRXaW5kb3dIaWRlOiBcIm1hYzpXaW5kb3dIaWRlXCIsXHJcblx0XHRXaW5kb3dNYXhpbWlzZTogXCJtYWM6V2luZG93TWF4aW1pc2VcIixcclxuXHRcdFdpbmRvd1VuTWF4aW1pc2U6IFwibWFjOldpbmRvd1VuTWF4aW1pc2VcIixcclxuXHRcdFdpbmRvd01pbmltaXNlOiBcIm1hYzpXaW5kb3dNaW5pbWlzZVwiLFxyXG5cdFx0V2luZG93VW5NaW5pbWlzZTogXCJtYWM6V2luZG93VW5NaW5pbWlzZVwiLFxyXG5cdFx0V2luZG93U2hvdWxkQ2xvc2U6IFwibWFjOldpbmRvd1Nob3VsZENsb3NlXCIsXHJcblx0XHRXaW5kb3dTaG93OiBcIm1hYzpXaW5kb3dTaG93XCIsXHJcblx0XHRXaW5kb3dXaWxsQmVjb21lS2V5OiBcIm1hYzpXaW5kb3dXaWxsQmVjb21lS2V5XCIsXHJcblx0XHRXaW5kb3dXaWxsQmVjb21lTWFpbjogXCJtYWM6V2luZG93V2lsbEJlY29tZU1haW5cIixcclxuXHRcdFdpbmRvd1dpbGxCZWdpblNoZWV0OiBcIm1hYzpXaW5kb3dXaWxsQmVnaW5TaGVldFwiLFxyXG5cdFx0V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZVwiLFxyXG5cdFx0V2luZG93V2lsbENsb3NlOiBcIm1hYzpXaW5kb3dXaWxsQ2xvc2VcIixcclxuXHRcdFdpbmRvd1dpbGxEZW1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dXaWxsRGVtaW5pYXR1cml6ZVwiLFxyXG5cdFx0V2luZG93V2lsbEVudGVyRnVsbFNjcmVlbjogXCJtYWM6V2luZG93V2lsbEVudGVyRnVsbFNjcmVlblwiLFxyXG5cdFx0V2luZG93V2lsbEVudGVyVmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd1dpbGxFbnRlclZlcnNpb25Ccm93c2VyXCIsXHJcblx0XHRXaW5kb3dXaWxsRXhpdEZ1bGxTY3JlZW46IFwibWFjOldpbmRvd1dpbGxFeGl0RnVsbFNjcmVlblwiLFxyXG5cdFx0V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlclwiLFxyXG5cdFx0V2luZG93V2lsbEZvY3VzOiBcIm1hYzpXaW5kb3dXaWxsRm9jdXNcIixcclxuXHRcdFdpbmRvd1dpbGxNaW5pYXR1cml6ZTogXCJtYWM6V2luZG93V2lsbE1pbmlhdHVyaXplXCIsXHJcblx0XHRXaW5kb3dXaWxsTW92ZTogXCJtYWM6V2luZG93V2lsbE1vdmVcIixcclxuXHRcdFdpbmRvd1dpbGxPcmRlck9mZlNjcmVlbjogXCJtYWM6V2luZG93V2lsbE9yZGVyT2ZmU2NyZWVuXCIsXHJcblx0XHRXaW5kb3dXaWxsT3JkZXJPblNjcmVlbjogXCJtYWM6V2luZG93V2lsbE9yZGVyT25TY3JlZW5cIixcclxuXHRcdFdpbmRvd1dpbGxSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dXaWxsUmVzaWduTWFpblwiLFxyXG5cdFx0V2luZG93V2lsbFJlc2l6ZTogXCJtYWM6V2luZG93V2lsbFJlc2l6ZVwiLFxyXG5cdFx0V2luZG93V2lsbFVuZm9jdXM6IFwibWFjOldpbmRvd1dpbGxVbmZvY3VzXCIsXHJcblx0XHRXaW5kb3dXaWxsVXBkYXRlOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlXCIsXHJcblx0XHRXaW5kb3dXaWxsVXBkYXRlQWxwaGE6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVBbHBoYVwiLFxyXG5cdFx0V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvclwiLFxyXG5cdFx0V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXNcIixcclxuXHRcdFdpbmRvd1dpbGxVcGRhdGVTaGFkb3c6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVTaGFkb3dcIixcclxuXHRcdFdpbmRvd1dpbGxVcGRhdGVUaXRsZTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVRpdGxlXCIsXHJcblx0XHRXaW5kb3dXaWxsVXBkYXRlVG9vbGJhcjogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVRvb2xiYXJcIixcclxuXHRcdFdpbmRvd1dpbGxVcGRhdGVWaXNpYmlsaXR5OiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlVmlzaWJpbGl0eVwiLFxyXG5cdFx0V2luZG93V2lsbFVzZVN0YW5kYXJkRnJhbWU6IFwibWFjOldpbmRvd1dpbGxVc2VTdGFuZGFyZEZyYW1lXCIsXHJcblx0XHRXaW5kb3dab29tSW46IFwibWFjOldpbmRvd1pvb21JblwiLFxyXG5cdFx0V2luZG93Wm9vbU91dDogXCJtYWM6V2luZG93Wm9vbU91dFwiLFxyXG5cdFx0V2luZG93Wm9vbVJlc2V0OiBcIm1hYzpXaW5kb3dab29tUmVzZXRcIixcclxuXHRcdFdlYlZpZXdXZWJDb250ZW50UHJvY2Vzc0RpZFRlcm1pbmF0ZTogXCJtYWM6V2ViVmlld1dlYkNvbnRlbnRQcm9jZXNzRGlkVGVybWluYXRlXCIsXHJcblx0fSksXHJcblx0TGludXg6IE9iamVjdC5mcmVlemUoe1xyXG5cdFx0QXBwbGljYXRpb25TdGFydHVwOiBcImxpbnV4OkFwcGxpY2F0aW9uU3RhcnR1cFwiLFxyXG5cdFx0U3lzdGVtRGlkV2FrZTogXCJsaW51eDpTeXN0ZW1EaWRXYWtlXCIsXHJcblx0XHRTeXN0ZW1UaGVtZUNoYW5nZWQ6IFwibGludXg6U3lzdGVtVGhlbWVDaGFuZ2VkXCIsXHJcblx0XHRTeXN0ZW1XaWxsU2xlZXA6IFwibGludXg6U3lzdGVtV2lsbFNsZWVwXCIsXHJcblx0XHRXaW5kb3dEZWxldGVFdmVudDogXCJsaW51eDpXaW5kb3dEZWxldGVFdmVudFwiLFxyXG5cdFx0V2luZG93RGlkTW92ZTogXCJsaW51eDpXaW5kb3dEaWRNb3ZlXCIsXHJcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwibGludXg6V2luZG93RGlkUmVzaXplXCIsXHJcblx0XHRXaW5kb3dGb2N1c0luOiBcImxpbnV4OldpbmRvd0ZvY3VzSW5cIixcclxuXHRcdFdpbmRvd0ZvY3VzT3V0OiBcImxpbnV4OldpbmRvd0ZvY3VzT3V0XCIsXHJcblx0XHRXaW5kb3dMb2FkU3RhcnRlZDogXCJsaW51eDpXaW5kb3dMb2FkU3RhcnRlZFwiLFxyXG5cdFx0V2luZG93TG9hZFJlZGlyZWN0ZWQ6IFwibGludXg6V2luZG93TG9hZFJlZGlyZWN0ZWRcIixcclxuXHRcdFdpbmRvd0xvYWRDb21taXR0ZWQ6IFwibGludXg6V2luZG93TG9hZENvbW1pdHRlZFwiLFxyXG5cdFx0V2luZG93TG9hZEZpbmlzaGVkOiBcImxpbnV4OldpbmRvd0xvYWRGaW5pc2hlZFwiLFxyXG5cdH0pLFxyXG5cdGlPUzogT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRBcHBsaWNhdGlvbkRpZEJlY29tZUFjdGl2ZTogXCJpb3M6QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmVcIixcclxuXHRcdEFwcGxpY2F0aW9uRGlkRW50ZXJCYWNrZ3JvdW5kOiBcImlvczpBcHBsaWNhdGlvbkRpZEVudGVyQmFja2dyb3VuZFwiLFxyXG5cdFx0QXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmc6IFwiaW9zOkFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nXCIsXHJcblx0XHRBcHBsaWNhdGlvbkRpZFJlY2VpdmVNZW1vcnlXYXJuaW5nOiBcImlvczpBcHBsaWNhdGlvbkRpZFJlY2VpdmVNZW1vcnlXYXJuaW5nXCIsXHJcblx0XHRBcHBsaWNhdGlvbldpbGxFbnRlckZvcmVncm91bmQ6IFwiaW9zOkFwcGxpY2F0aW9uV2lsbEVudGVyRm9yZWdyb3VuZFwiLFxyXG5cdFx0QXBwbGljYXRpb25XaWxsUmVzaWduQWN0aXZlOiBcImlvczpBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmVcIixcclxuXHRcdEFwcGxpY2F0aW9uV2lsbFRlcm1pbmF0ZTogXCJpb3M6QXBwbGljYXRpb25XaWxsVGVybWluYXRlXCIsXHJcblx0XHRXaW5kb3dEaWRMb2FkOiBcImlvczpXaW5kb3dEaWRMb2FkXCIsXHJcblx0XHRXaW5kb3dXaWxsQXBwZWFyOiBcImlvczpXaW5kb3dXaWxsQXBwZWFyXCIsXHJcblx0XHRXaW5kb3dEaWRBcHBlYXI6IFwiaW9zOldpbmRvd0RpZEFwcGVhclwiLFxyXG5cdFx0V2luZG93V2lsbERpc2FwcGVhcjogXCJpb3M6V2luZG93V2lsbERpc2FwcGVhclwiLFxyXG5cdFx0V2luZG93RGlkRGlzYXBwZWFyOiBcImlvczpXaW5kb3dEaWREaXNhcHBlYXJcIixcclxuXHRcdFdpbmRvd1NhZmVBcmVhSW5zZXRzQ2hhbmdlZDogXCJpb3M6V2luZG93U2FmZUFyZWFJbnNldHNDaGFuZ2VkXCIsXHJcblx0XHRXaW5kb3dPcmllbnRhdGlvbkNoYW5nZWQ6IFwiaW9zOldpbmRvd09yaWVudGF0aW9uQ2hhbmdlZFwiLFxyXG5cdFx0V2luZG93VG91Y2hCZWdhbjogXCJpb3M6V2luZG93VG91Y2hCZWdhblwiLFxyXG5cdFx0V2luZG93VG91Y2hNb3ZlZDogXCJpb3M6V2luZG93VG91Y2hNb3ZlZFwiLFxyXG5cdFx0V2luZG93VG91Y2hFbmRlZDogXCJpb3M6V2luZG93VG91Y2hFbmRlZFwiLFxyXG5cdFx0V2luZG93VG91Y2hDYW5jZWxsZWQ6IFwiaW9zOldpbmRvd1RvdWNoQ2FuY2VsbGVkXCIsXHJcblx0XHRXZWJWaWV3RGlkU3RhcnROYXZpZ2F0aW9uOiBcImlvczpXZWJWaWV3RGlkU3RhcnROYXZpZ2F0aW9uXCIsXHJcblx0XHRXZWJWaWV3RGlkRmluaXNoTmF2aWdhdGlvbjogXCJpb3M6V2ViVmlld0RpZEZpbmlzaE5hdmlnYXRpb25cIixcclxuXHRcdFdlYlZpZXdEaWRGYWlsTmF2aWdhdGlvbjogXCJpb3M6V2ViVmlld0RpZEZhaWxOYXZpZ2F0aW9uXCIsXHJcblx0XHRXZWJWaWV3RGVjaWRlUG9saWN5Rm9yTmF2aWdhdGlvbkFjdGlvbjogXCJpb3M6V2ViVmlld0RlY2lkZVBvbGljeUZvck5hdmlnYXRpb25BY3Rpb25cIixcclxuXHRcdEJhdHRlcnlDaGFuZ2VkOiBcImlvczpCYXR0ZXJ5Q2hhbmdlZFwiLFxyXG5cdFx0TmV0d29ya0NoYW5nZWQ6IFwiaW9zOk5ldHdvcmtDaGFuZ2VkXCIsXHJcblx0XHRUaGVtZUNoYW5nZWQ6IFwiaW9zOlRoZW1lQ2hhbmdlZFwiLFxyXG5cdFx0U2NyZWVuTG9ja2VkOiBcImlvczpTY3JlZW5Mb2NrZWRcIixcclxuXHRcdFNjcmVlblVubG9ja2VkOiBcImlvczpTY3JlZW5VbmxvY2tlZFwiLFxyXG5cdH0pLFxyXG5cdEFuZHJvaWQ6IE9iamVjdC5mcmVlemUoe1xyXG5cdFx0QWN0aXZpdHlDcmVhdGVkOiBcImFuZHJvaWQ6QWN0aXZpdHlDcmVhdGVkXCIsXHJcblx0XHRBY3Rpdml0eVN0YXJ0ZWQ6IFwiYW5kcm9pZDpBY3Rpdml0eVN0YXJ0ZWRcIixcclxuXHRcdEFjdGl2aXR5UmVzdW1lZDogXCJhbmRyb2lkOkFjdGl2aXR5UmVzdW1lZFwiLFxyXG5cdFx0QWN0aXZpdHlQYXVzZWQ6IFwiYW5kcm9pZDpBY3Rpdml0eVBhdXNlZFwiLFxyXG5cdFx0QWN0aXZpdHlTdG9wcGVkOiBcImFuZHJvaWQ6QWN0aXZpdHlTdG9wcGVkXCIsXHJcblx0XHRBY3Rpdml0eURlc3Ryb3llZDogXCJhbmRyb2lkOkFjdGl2aXR5RGVzdHJveWVkXCIsXHJcblx0XHRBcHBsaWNhdGlvbkxvd01lbW9yeTogXCJhbmRyb2lkOkFwcGxpY2F0aW9uTG93TWVtb3J5XCIsXHJcblx0XHRXZWJWaWV3UGFnZVN0YXJ0ZWQ6IFwiYW5kcm9pZDpXZWJWaWV3UGFnZVN0YXJ0ZWRcIixcclxuXHRcdFdlYlZpZXdQYWdlRmluaXNoZWQ6IFwiYW5kcm9pZDpXZWJWaWV3UGFnZUZpbmlzaGVkXCIsXHJcblx0XHRCYXR0ZXJ5Q2hhbmdlZDogXCJhbmRyb2lkOkJhdHRlcnlDaGFuZ2VkXCIsXHJcblx0XHROZXR3b3JrQ2hhbmdlZDogXCJhbmRyb2lkOk5ldHdvcmtDaGFuZ2VkXCIsXHJcblx0XHRUaGVtZUNoYW5nZWQ6IFwiYW5kcm9pZDpUaGVtZUNoYW5nZWRcIixcclxuXHRcdFNjcmVlbkxvY2tlZDogXCJhbmRyb2lkOlNjcmVlbkxvY2tlZFwiLFxyXG5cdFx0U2NyZWVuVW5sb2NrZWQ6IFwiYW5kcm9pZDpTY3JlZW5VbmxvY2tlZFwiLFxyXG5cdH0pLFxyXG5cdENvbW1vbjogT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRBcHBsaWNhdGlvbk9wZW5lZFdpdGhGaWxlOiBcImNvbW1vbjpBcHBsaWNhdGlvbk9wZW5lZFdpdGhGaWxlXCIsXHJcblx0XHRBcHBsaWNhdGlvblN0YXJ0ZWQ6IFwiY29tbW9uOkFwcGxpY2F0aW9uU3RhcnRlZFwiLFxyXG5cdFx0QXBwbGljYXRpb25MYXVuY2hlZFdpdGhVcmw6IFwiY29tbW9uOkFwcGxpY2F0aW9uTGF1bmNoZWRXaXRoVXJsXCIsXHJcblx0XHRUaGVtZUNoYW5nZWQ6IFwiY29tbW9uOlRoZW1lQ2hhbmdlZFwiLFxyXG5cdFx0U3lzdGVtRGlkV2FrZTogXCJjb21tb246U3lzdGVtRGlkV2FrZVwiLFxyXG5cdFx0U3lzdGVtV2lsbFNsZWVwOiBcImNvbW1vbjpTeXN0ZW1XaWxsU2xlZXBcIixcclxuXHRcdFdpbmRvd0Nsb3Npbmc6IFwiY29tbW9uOldpbmRvd0Nsb3NpbmdcIixcclxuXHRcdFdpbmRvd0RpZE1vdmU6IFwiY29tbW9uOldpbmRvd0RpZE1vdmVcIixcclxuXHRcdFdpbmRvd0RpZFJlc2l6ZTogXCJjb21tb246V2luZG93RGlkUmVzaXplXCIsXHJcblx0XHRXaW5kb3dEUElDaGFuZ2VkOiBcImNvbW1vbjpXaW5kb3dEUElDaGFuZ2VkXCIsXHJcblx0XHRXaW5kb3dGaWxlc0Ryb3BwZWQ6IFwiY29tbW9uOldpbmRvd0ZpbGVzRHJvcHBlZFwiLFxyXG5cdFx0V2luZG93Rm9jdXM6IFwiY29tbW9uOldpbmRvd0ZvY3VzXCIsXHJcblx0XHRXaW5kb3dGdWxsc2NyZWVuOiBcImNvbW1vbjpXaW5kb3dGdWxsc2NyZWVuXCIsXHJcblx0XHRXaW5kb3dIaWRlOiBcImNvbW1vbjpXaW5kb3dIaWRlXCIsXHJcblx0XHRXaW5kb3dMb3N0Rm9jdXM6IFwiY29tbW9uOldpbmRvd0xvc3RGb2N1c1wiLFxyXG5cdFx0V2luZG93TWF4aW1pc2U6IFwiY29tbW9uOldpbmRvd01heGltaXNlXCIsXHJcblx0XHRXaW5kb3dNaW5pbWlzZTogXCJjb21tb246V2luZG93TWluaW1pc2VcIixcclxuXHRcdFdpbmRvd1RvZ2dsZUZyYW1lbGVzczogXCJjb21tb246V2luZG93VG9nZ2xlRnJhbWVsZXNzXCIsXHJcblx0XHRXaW5kb3dSZXN0b3JlOiBcImNvbW1vbjpXaW5kb3dSZXN0b3JlXCIsXHJcblx0XHRXaW5kb3dSdW50aW1lUmVhZHk6IFwiY29tbW9uOldpbmRvd1J1bnRpbWVSZWFkeVwiLFxyXG5cdFx0V2luZG93U2hvdzogXCJjb21tb246V2luZG93U2hvd1wiLFxyXG5cdFx0V2luZG93VW5GdWxsc2NyZWVuOiBcImNvbW1vbjpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcclxuXHRcdFdpbmRvd1VuTWF4aW1pc2U6IFwiY29tbW9uOldpbmRvd1VuTWF4aW1pc2VcIixcclxuXHRcdFdpbmRvd1VuTWluaW1pc2U6IFwiY29tbW9uOldpbmRvd1VuTWluaW1pc2VcIixcclxuXHRcdFdpbmRvd1pvb206IFwiY29tbW9uOldpbmRvd1pvb21cIixcclxuXHRcdFdpbmRvd1pvb21JbjogXCJjb21tb246V2luZG93Wm9vbUluXCIsXHJcblx0XHRXaW5kb3dab29tT3V0OiBcImNvbW1vbjpXaW5kb3dab29tT3V0XCIsXHJcblx0XHRXaW5kb3dab29tUmVzZXQ6IFwiY29tbW9uOldpbmRvd1pvb21SZXNldFwiLFxyXG5cdFx0QmF0dGVyeUNoYW5nZWQ6IFwiY29tbW9uOkJhdHRlcnlDaGFuZ2VkXCIsXHJcblx0XHROZXR3b3JrQ2hhbmdlZDogXCJjb21tb246TmV0d29ya0NoYW5nZWRcIixcclxuXHRcdFNjcmVlbkxvY2tlZDogXCJjb21tb246U2NyZWVuTG9ja2VkXCIsXHJcblx0XHRTY3JlZW5VbmxvY2tlZDogXCJjb21tb246U2NyZWVuVW5sb2NrZWRcIixcclxuXHRcdExvd01lbW9yeTogXCJjb21tb246TG93TWVtb3J5XCIsXHJcblx0fSksXHJcbn0pO1xyXG4iLCAiLypcclxuIF8gICAgIF9fICAgICBfIF9fXHJcbnwgfCAgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuLyoqXHJcbiAqIExvZ3MgYSBtZXNzYWdlIHRvIHRoZSBjb25zb2xlIHdpdGggY3VzdG9tIGZvcm1hdHRpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gYmUgbG9nZ2VkLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnTG9nKG1lc3NhZ2U6IGFueSkge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXHJcbiAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAnJWMgd2FpbHMzICVjICcgKyBtZXNzYWdlICsgJyAnLFxyXG4gICAgICAgICdiYWNrZ3JvdW5kOiAjYWEwMDAwOyBjb2xvcjogI2ZmZjsgYm9yZGVyLXJhZGl1czogM3B4IDBweCAwcHggM3B4OyBwYWRkaW5nOiAxcHg7IGZvbnQtc2l6ZTogMC43cmVtJyxcclxuICAgICAgICAnYmFja2dyb3VuZDogIzAwOTkwMDsgY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDBweCAzcHggM3B4IDBweDsgcGFkZGluZzogMXB4OyBmb250LXNpemU6IDAuN3JlbSdcclxuICAgICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgd2VidmlldyBzdXBwb3J0cyB0aGUge0BsaW5rIE1vdXNlRXZlbnQjYnV0dG9uc30gcHJvcGVydHkuXHJcbiAqIExvb2tpbmcgYXQgeW91IG1hY09TIEhpZ2ggU2llcnJhIVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNhblRyYWNrQnV0dG9ucygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAobmV3IE1vdXNlRXZlbnQoJ21vdXNlZG93bicpKS5idXR0b25zID09PSAwO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGJyb3dzZXIgc3VwcG9ydHMgcmVtb3ZpbmcgbGlzdGVuZXJzIGJ5IHRyaWdnZXJpbmcgYW4gQWJvcnRTaWduYWxcclxuICogKHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRXZlbnRUYXJnZXQvYWRkRXZlbnRMaXN0ZW5lciNzaWduYWwpLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNhbkFib3J0TGlzdGVuZXJzKCkge1xyXG4gICAgaWYgKCFFdmVudFRhcmdldCB8fCAhQWJvcnRTaWduYWwgfHwgIUFib3J0Q29udHJvbGxlcilcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgY29uc3QgdGFyZ2V0ID0gbmV3IEV2ZW50VGFyZ2V0KCk7XHJcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCAoKSA9PiB7IHJlc3VsdCA9IGZhbHNlOyB9LCB7IHNpZ25hbDogY29udHJvbGxlci5zaWduYWwgfSk7XHJcbiAgICBjb250cm9sbGVyLmFib3J0KCk7XHJcbiAgICB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3Rlc3QnKSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlc29sdmVzIHRoZSBjbG9zZXN0IEhUTUxFbGVtZW50IGFuY2VzdG9yIG9mIGFuIGV2ZW50J3MgdGFyZ2V0LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50VGFyZ2V0KGV2ZW50OiBFdmVudCk6IEhUTUxFbGVtZW50IHtcclxuICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiBldmVudC50YXJnZXQ7XHJcbiAgICB9IGVsc2UgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpICYmIGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHtcclxuICAgICAgICByZXR1cm4gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQgPz8gZG9jdW1lbnQuYm9keTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmJvZHk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKipcclxuIFRoaXMgdGVjaG5pcXVlIGZvciBwcm9wZXIgbG9hZCBkZXRlY3Rpb24gaXMgdGFrZW4gZnJvbSBIVE1YOlxyXG5cclxuIEJTRCAyLUNsYXVzZSBMaWNlbnNlXHJcblxyXG4gQ29weXJpZ2h0IChjKSAyMDIwLCBCaWcgU2t5IFNvZnR3YXJlXHJcbiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxyXG4gbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XHJcblxyXG4gMS4gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXHJcbiBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuXHJcbiAyLiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXHJcbiB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXHJcbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cclxuXHJcbiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxyXG4gQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRVxyXG4gSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXHJcbiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFXHJcbiBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTFxyXG4gREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1JcclxuIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSXHJcbiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLFxyXG4gT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcclxuIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXHJcblxyXG4gKioqL1xyXG5cclxubGV0IGlzUmVhZHkgPSBmYWxzZTtcclxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcclxuXHJcbmlmIChoYXNET00pIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7IGlzUmVhZHkgPSB0cnVlIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gd2hlblJlYWR5KGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICBpZiAoaXNSZWFkeSB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICAgICAgY2FsbGJhY2soKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGNhbGxiYWNrKTtcclxuICAgIH1cclxufVxyXG4iLCAiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuaW1wb3J0IHtuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lc30gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xyXG5pbXBvcnQgdHlwZSB7IFNjcmVlbiB9IGZyb20gXCIuL3NjcmVlbnMuanNcIjtcclxuXHJcbi8vIERyb3AgdGFyZ2V0IGNvbnN0YW50c1xyXG5jb25zdCBEUk9QX1RBUkdFVF9BVFRSSUJVVEUgPSAnZGF0YS1maWxlLWRyb3AtdGFyZ2V0JztcclxuY29uc3QgRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTID0gJ2ZpbGUtZHJvcC10YXJnZXQtYWN0aXZlJztcclxubGV0IGN1cnJlbnREcm9wVGFyZ2V0OiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG5jb25zdCBQb3NpdGlvbk1ldGhvZCAgICAgICAgICAgICAgICAgICAgPSAwO1xyXG5jb25zdCBDZW50ZXJNZXRob2QgICAgICAgICAgICAgICAgICAgICAgPSAxO1xyXG5jb25zdCBDbG9zZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgPSAyO1xyXG5jb25zdCBEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzTWV0aG9kICAgICAgPSAzO1xyXG5jb25zdCBFbmFibGVTaXplQ29uc3RyYWludHNNZXRob2QgICAgICAgPSA0O1xyXG5jb25zdCBGb2N1c01ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgPSA1O1xyXG5jb25zdCBGb3JjZVJlbG9hZE1ldGhvZCAgICAgICAgICAgICAgICAgPSA2O1xyXG5jb25zdCBGdWxsc2NyZWVuTWV0aG9kICAgICAgICAgICAgICAgICAgPSA3O1xyXG5jb25zdCBHZXRTY3JlZW5NZXRob2QgICAgICAgICAgICAgICAgICAgPSA4O1xyXG5jb25zdCBHZXRab29tTWV0aG9kICAgICAgICAgICAgICAgICAgICAgPSA5O1xyXG5jb25zdCBIZWlnaHRNZXRob2QgICAgICAgICAgICAgICAgICAgICAgPSAxMDtcclxuY29uc3QgSGlkZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgID0gMTE7XHJcbmNvbnN0IElzRm9jdXNlZE1ldGhvZCAgICAgICAgICAgICAgICAgICA9IDEyO1xyXG5jb25zdCBJc0Z1bGxzY3JlZW5NZXRob2QgICAgICAgICAgICAgICAgPSAxMztcclxuY29uc3QgSXNNYXhpbWlzZWRNZXRob2QgICAgICAgICAgICAgICAgID0gMTQ7XHJcbmNvbnN0IElzTWluaW1pc2VkTWV0aG9kICAgICAgICAgICAgICAgICA9IDE1O1xyXG5jb25zdCBNYXhpbWlzZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgPSAxNjtcclxuY29uc3QgTWluaW1pc2VNZXRob2QgICAgICAgICAgICAgICAgICAgID0gMTc7XHJcbmNvbnN0IE5hbWVNZXRob2QgICAgICAgICAgICAgICAgICAgICAgICA9IDE4O1xyXG5jb25zdCBPcGVuRGV2VG9vbHNNZXRob2QgICAgICAgICAgICAgICAgPSAxOTtcclxuY29uc3QgUmVsYXRpdmVQb3NpdGlvbk1ldGhvZCAgICAgICAgICAgID0gMjA7XHJcbmNvbnN0IFJlbG9hZE1ldGhvZCAgICAgICAgICAgICAgICAgICAgICA9IDIxO1xyXG5jb25zdCBSZXNpemFibGVNZXRob2QgICAgICAgICAgICAgICAgICAgPSAyMjtcclxuY29uc3QgUmVzdG9yZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgID0gMjM7XHJcbmNvbnN0IFNldFBvc2l0aW9uTWV0aG9kICAgICAgICAgICAgICAgICA9IDI0O1xyXG5jb25zdCBTZXRBbHdheXNPblRvcE1ldGhvZCAgICAgICAgICAgICAgPSAyNTtcclxuY29uc3QgU2V0QmFja2dyb3VuZENvbG91ck1ldGhvZCAgICAgICAgID0gMjY7XHJcbmNvbnN0IFNldEZyYW1lbGVzc01ldGhvZCAgICAgICAgICAgICAgICA9IDI3O1xyXG5jb25zdCBTZXRGdWxsc2NyZWVuQnV0dG9uRW5hYmxlZE1ldGhvZCAgPSAyODtcclxuY29uc3QgU2V0TWF4U2l6ZU1ldGhvZCAgICAgICAgICAgICAgICAgID0gMjk7XHJcbmNvbnN0IFNldE1pblNpemVNZXRob2QgICAgICAgICAgICAgICAgICA9IDMwO1xyXG5jb25zdCBTZXRSZWxhdGl2ZVBvc2l0aW9uTWV0aG9kICAgICAgICAgPSAzMTtcclxuY29uc3QgU2V0UmVzaXphYmxlTWV0aG9kICAgICAgICAgICAgICAgID0gMzI7XHJcbmNvbnN0IFNldFNpemVNZXRob2QgICAgICAgICAgICAgICAgICAgICA9IDMzO1xyXG5jb25zdCBTZXRUaXRsZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgPSAzNDtcclxuY29uc3QgU2V0Wm9vbU1ldGhvZCAgICAgICAgICAgICAgICAgICAgID0gMzU7XHJcbmNvbnN0IFNob3dNZXRob2QgICAgICAgICAgICAgICAgICAgICAgICA9IDM2O1xyXG5jb25zdCBTaXplTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICAgPSAzNztcclxuY29uc3QgVG9nZ2xlRnVsbHNjcmVlbk1ldGhvZCAgICAgICAgICAgID0gMzg7XHJcbmNvbnN0IFRvZ2dsZU1heGltaXNlTWV0aG9kICAgICAgICAgICAgICA9IDM5O1xyXG5jb25zdCBUb2dnbGVGcmFtZWxlc3NNZXRob2QgICAgICAgICAgICAgPSA0MDsgXHJcbmNvbnN0IFVuRnVsbHNjcmVlbk1ldGhvZCAgICAgICAgICAgICAgICA9IDQxO1xyXG5jb25zdCBVbk1heGltaXNlTWV0aG9kICAgICAgICAgICAgICAgICAgPSA0MjtcclxuY29uc3QgVW5NaW5pbWlzZU1ldGhvZCAgICAgICAgICAgICAgICAgID0gNDM7XHJcbmNvbnN0IFdpZHRoTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICA9IDQ0O1xyXG5jb25zdCBab29tTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICAgPSA0NTtcclxuY29uc3QgWm9vbUluTWV0aG9kICAgICAgICAgICAgICAgICAgICAgID0gNDY7XHJcbmNvbnN0IFpvb21PdXRNZXRob2QgICAgICAgICAgICAgICAgICAgICA9IDQ3O1xyXG5jb25zdCBab29tUmVzZXRNZXRob2QgICAgICAgICAgICAgICAgICAgPSA0ODtcclxuY29uc3QgU25hcEFzc2lzdE1ldGhvZCAgICAgICAgICAgICAgICAgID0gNDk7XHJcbmNvbnN0IEZpbGVzRHJvcHBlZCAgICAgICAgICAgICAgICAgICAgICA9IDUwO1xyXG5jb25zdCBQcmludE1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgPSA1MTtcclxuY29uc3QgU2V0U2NyZWVuTWV0aG9kICAgICAgICAgICAgICAgICAgID0gNTI7XHJcblxyXG4vKipcclxuICogRmluZHMgdGhlIG5lYXJlc3QgZHJvcCB0YXJnZXQgZWxlbWVudCBieSB3YWxraW5nIHVwIHRoZSBET00gdHJlZS5cclxuICovXHJcbmZ1bmN0aW9uIGdldERyb3BUYXJnZXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsKTogRWxlbWVudCB8IG51bGwge1xyXG4gICAgaWYgKCFlbGVtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZWxlbWVudC5jbG9zZXN0KGBbJHtEUk9QX1RBUkdFVF9BVFRSSUJVVEV9XWApO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2sgaWYgd2UgY2FuIHVzZSBXZWJWaWV3MidzIHBvc3RNZXNzYWdlV2l0aEFkZGl0aW9uYWxPYmplY3RzIChXaW5kb3dzKVxyXG4gKiBBbHNvIGNoZWNrcyB0aGF0IEVuYWJsZUZpbGVEcm9wIGlzIHRydWUgZm9yIHRoaXMgd2luZG93LlxyXG4gKi9cclxuZnVuY3Rpb24gY2FuUmVzb2x2ZUZpbGVQYXRocygpOiBib29sZWFuIHtcclxuICAgIC8vIE11c3QgaGF2ZSBXZWJWaWV3MidzIHBvc3RNZXNzYWdlV2l0aEFkZGl0aW9uYWxPYmplY3RzIEFQSSAoV2luZG93cyBvbmx5KVxyXG4gICAgaWYgKCh3aW5kb3cgYXMgYW55KS5jaHJvbWU/LndlYnZpZXc/LnBvc3RNZXNzYWdlV2l0aEFkZGl0aW9uYWxPYmplY3RzID09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvLyBNdXN0IGhhdmUgRW5hYmxlRmlsZURyb3Agc2V0IHRvIHRydWUgZm9yIHRoaXMgd2luZG93XHJcbiAgICAvLyBUaGlzIGZsYWcgaXMgc2V0IGJ5IHRoZSBHbyBiYWNrZW5kIGR1cmluZyBydW50aW1lIGluaXRpYWxpemF0aW9uXHJcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSB0cnVlO1xyXG59XHJcblxyXG4vKipcclxuICogU2VuZCBmaWxlIGRyb3AgdG8gYmFja2VuZCB2aWEgV2ViVmlldzIgKFdpbmRvd3Mgb25seSlcclxuICovXHJcbmZ1bmN0aW9uIHJlc29sdmVGaWxlUGF0aHMoeDogbnVtYmVyLCB5OiBudW1iZXIsIGZpbGVzOiBGaWxlW10pOiB2b2lkIHtcclxuICAgIGlmICgod2luZG93IGFzIGFueSkuY2hyb21lPy53ZWJ2aWV3Py5wb3N0TWVzc2FnZVdpdGhBZGRpdGlvbmFsT2JqZWN0cykge1xyXG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5jaHJvbWUud2Vidmlldy5wb3N0TWVzc2FnZVdpdGhBZGRpdGlvbmFsT2JqZWN0cyhgZmlsZTpkcm9wOiR7eH06JHt5fWAsIGZpbGVzKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gTmF0aXZlIGRyYWcgc3RhdGUgKExpbnV4L21hY09TIGludGVyY2VwdCBET00gZHJhZyBldmVudHMpXHJcbmxldCBuYXRpdmVEcmFnQWN0aXZlID0gZmFsc2U7XHJcblxyXG4vKipcclxuICogQ2xlYW5zIHVwIG5hdGl2ZSBkcmFnIHN0YXRlIGFuZCBob3ZlciBlZmZlY3RzLlxyXG4gKiBDYWxsZWQgb24gZHJvcCBvciB3aGVuIGRyYWcgbGVhdmVzIHRoZSB3aW5kb3cuXHJcbiAqL1xyXG5mdW5jdGlvbiBjbGVhbnVwTmF0aXZlRHJhZygpOiB2b2lkIHtcclxuICAgIG5hdGl2ZURyYWdBY3RpdmUgPSBmYWxzZTtcclxuICAgIGlmIChjdXJyZW50RHJvcFRhcmdldCkge1xyXG4gICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKTtcclxuICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxsZWQgZnJvbSBHbyB3aGVuIGEgZmlsZSBkcmFnIGVudGVycyB0aGUgd2luZG93IG9uIExpbnV4L21hY09TLlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlRHJhZ0VudGVyKCk6IHZvaWQge1xyXG4gICAgLy8gQ2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcclxuICAgIGlmICgod2luZG93IGFzIGFueSkuX3dhaWxzPy5mbGFncz8uZW5hYmxlRmlsZURyb3AgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuOyAvLyBGaWxlIGRyb3BzIGRpc2FibGVkLCBkb24ndCBhY3RpdmF0ZSBkcmFnIHN0YXRlXHJcbiAgICB9XHJcbiAgICBuYXRpdmVEcmFnQWN0aXZlID0gdHJ1ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGxlZCBmcm9tIEdvIHdoZW4gYSBmaWxlIGRyYWcgbGVhdmVzIHRoZSB3aW5kb3cgb24gTGludXgvbWFjT1MuXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVEcmFnTGVhdmUoKTogdm9pZCB7XHJcbiAgICBjbGVhbnVwTmF0aXZlRHJhZygpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsbGVkIGZyb20gR28gZHVyaW5nIGZpbGUgZHJhZyB0byB1cGRhdGUgaG92ZXIgc3RhdGUgb24gTGludXgvbWFjT1MuXHJcbiAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlIGluIENTUyBwaXhlbHNcclxuICogQHBhcmFtIHkgLSBZIGNvb3JkaW5hdGUgaW4gQ1NTIHBpeGVsc1xyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlRHJhZ092ZXIoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmICghbmF0aXZlRHJhZ0FjdGl2ZSkgcmV0dXJuO1xyXG4gICAgXHJcbiAgICAvLyBDaGVjayBpZiBmaWxlIGRyb3BzIGFyZSBlbmFibGVkIGZvciB0aGlzIHdpbmRvd1xyXG4gICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm47IC8vIEZpbGUgZHJvcHMgZGlzYWJsZWQsIGRvbid0IHNob3cgaG92ZXIgZWZmZWN0c1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCB0YXJnZXRFbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcclxuICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBnZXREcm9wVGFyZ2V0RWxlbWVudCh0YXJnZXRFbGVtZW50KTtcclxuICAgIFxyXG4gICAgaWYgKGN1cnJlbnREcm9wVGFyZ2V0ICYmIGN1cnJlbnREcm9wVGFyZ2V0ICE9PSBkcm9wVGFyZ2V0KSB7XHJcbiAgICAgICAgY3VycmVudERyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoZHJvcFRhcmdldCkge1xyXG4gICAgICAgIGRyb3BUYXJnZXQuY2xhc3NMaXN0LmFkZChEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xyXG4gICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gZHJvcFRhcmdldDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3VycmVudERyb3BUYXJnZXQgPSBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcbi8vIEV4cG9ydCB0aGUgaGFuZGxlcnMgZm9yIHVzZSBieSBHbyB2aWEgaW5kZXgudHNcclxuZXhwb3J0IHsgaGFuZGxlRHJhZ0VudGVyLCBoYW5kbGVEcmFnTGVhdmUsIGhhbmRsZURyYWdPdmVyIH07XHJcblxyXG4vKipcclxuICogQSByZWNvcmQgZGVzY3JpYmluZyB0aGUgcG9zaXRpb24gb2YgYSB3aW5kb3cuXHJcbiAqL1xyXG5pbnRlcmZhY2UgUG9zaXRpb24ge1xyXG4gICAgLyoqIFRoZSBob3Jpem9udGFsIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuICovXHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICAvKiogVGhlIHZlcnRpY2FsIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuICovXHJcbiAgICB5OiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIHJlY29yZCBkZXNjcmliaW5nIHRoZSBzaXplIG9mIGEgd2luZG93LlxyXG4gKi9cclxuaW50ZXJmYWNlIFNpemUge1xyXG4gICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgd2luZG93LiAqL1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuICovXHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxufVxyXG5cclxuLy8gUHJpdmF0ZSBmaWVsZCBuYW1lcy5cclxuY29uc3QgY2FsbGVyU3ltID0gU3ltYm9sKFwiY2FsbGVyXCIpO1xyXG5cclxuY2xhc3MgV2luZG93IHtcclxuICAgIC8vIFByaXZhdGUgZmllbGRzLlxyXG4gICAgcHJpdmF0ZSBbY2FsbGVyU3ltXTogKG1lc3NhZ2U6IG51bWJlciwgYXJncz86IGFueSkgPT4gUHJvbWlzZTxhbnk+O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGlzZXMgYSB3aW5kb3cgb2JqZWN0IHdpdGggdGhlIHNwZWNpZmllZCBuYW1lLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB0YXJnZXQgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgPSAnJykge1xyXG4gICAgICAgIHRoaXNbY2FsbGVyU3ltXSA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuV2luZG93LCBuYW1lKVxyXG5cclxuICAgICAgICAvLyBiaW5kIGluc3RhbmNlIG1ldGhvZCB0byBtYWtlIHRoZW0gZWFzaWx5IHVzYWJsZSBpbiBldmVudCBoYW5kbGVyc1xyXG4gICAgICAgIGZvciAoY29uc3QgbWV0aG9kIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKFdpbmRvdy5wcm90b3R5cGUpKSB7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIG1ldGhvZCAhPT0gXCJjb25zdHJ1Y3RvclwiXHJcbiAgICAgICAgICAgICAgICAmJiB0eXBlb2YgKHRoaXMgYXMgYW55KVttZXRob2RdID09PSBcImZ1bmN0aW9uXCJcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAodGhpcyBhcyBhbnkpW21ldGhvZF0gPSAodGhpcyBhcyBhbnkpW21ldGhvZF0uYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIHNwZWNpZmllZCB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IHRvIGdldC5cclxuICAgICAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIHdpbmRvdyBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIEdldChuYW1lOiBzdHJpbmcpOiBXaW5kb3cge1xyXG4gICAgICAgIHJldHVybiBuZXcgV2luZG93KG5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBQb3NpdGlvbigpOiBQcm9taXNlPFBvc2l0aW9uPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShQb3NpdGlvbk1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDZW50ZXJzIHRoZSB3aW5kb3cgb24gdGhlIHNjcmVlbi5cclxuICAgICAqL1xyXG4gICAgQ2VudGVyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oQ2VudGVyTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsb3NlcyB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBDbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKENsb3NlTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERpc2FibGVzIG1pbi9tYXggc2l6ZSBjb25zdHJhaW50cy5cclxuICAgICAqL1xyXG4gICAgRGlzYWJsZVNpemVDb25zdHJhaW50cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKERpc2FibGVTaXplQ29uc3RyYWludHNNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5hYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXHJcbiAgICAgKi9cclxuICAgIEVuYWJsZVNpemVDb25zdHJhaW50cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKEVuYWJsZVNpemVDb25zdHJhaW50c01ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGb2N1c2VzIHRoZSB3aW5kb3cuXHJcbiAgICAgKi9cclxuICAgIEZvY3VzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oRm9jdXNNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRm9yY2VzIHRoZSB3aW5kb3cgdG8gcmVsb2FkIHRoZSBwYWdlIGFzc2V0cy5cclxuICAgICAqL1xyXG4gICAgRm9yY2VSZWxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShGb3JjZVJlbG9hZE1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTd2l0Y2hlcyB0aGUgd2luZG93IHRvIGZ1bGxzY3JlZW4gbW9kZS5cclxuICAgICAqL1xyXG4gICAgRnVsbHNjcmVlbigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKEZ1bGxzY3JlZW5NZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc2NyZWVuIHRoYXQgdGhlIHdpbmRvdyBpcyBvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgc2NyZWVuIHRoZSB3aW5kb3cgaXMgY3VycmVudGx5IG9uLlxyXG4gICAgICovXHJcbiAgICBHZXRTY3JlZW4oKTogUHJvbWlzZTxTY3JlZW4+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKEdldFNjcmVlbk1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHpvb20gbGV2ZWwgb2YgdGhlIHdpbmRvdy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCB6b29tIGxldmVsLlxyXG4gICAgICovXHJcbiAgICBHZXRab29tKCk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShHZXRab29tTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGUgd2luZG93LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIFRoZSBjdXJyZW50IGhlaWdodCBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBIZWlnaHQoKTogUHJvbWlzZTxudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKEhlaWdodE1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlcyB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBIaWRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oSGlkZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmb2N1c2VkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHdpbmRvdyBpcyBjdXJyZW50bHkgZm9jdXNlZC5cclxuICAgICAqL1xyXG4gICAgSXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oSXNGb2N1c2VkTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIGZ1bGxzY3JlZW4uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgd2luZG93IGlzIGN1cnJlbnRseSBmdWxsc2NyZWVuLlxyXG4gICAgICovXHJcbiAgICBJc0Z1bGxzY3JlZW4oKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShJc0Z1bGxzY3JlZW5NZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgbWF4aW1pc2VkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHdpbmRvdyBpcyBjdXJyZW50bHkgbWF4aW1pc2VkLlxyXG4gICAgICovXHJcbiAgICBJc01heGltaXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKElzTWF4aW1pc2VkTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIG1pbmltaXNlZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB3aW5kb3cgaXMgY3VycmVudGx5IG1pbmltaXNlZC5cclxuICAgICAqL1xyXG4gICAgSXNNaW5pbWlzZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShJc01pbmltaXNlZE1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXhpbWlzZXMgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgTWF4aW1pc2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShNYXhpbWlzZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNaW5pbWlzZXMgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgTWluaW1pc2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShNaW5pbWlzZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgVGhlIG5hbWUgb2YgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgTmFtZSgpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oTmFtZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPcGVucyB0aGUgZGV2ZWxvcG1lbnQgdG9vbHMgcGFuZS5cclxuICAgICAqL1xyXG4gICAgT3BlbkRldlRvb2xzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oT3BlbkRldlRvb2xzTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBSZWxhdGl2ZVBvc2l0aW9uKCk6IFByb21pc2U8UG9zaXRpb24+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFJlbGF0aXZlUG9zaXRpb25NZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVsb2FkcyB0aGUgcGFnZSBhc3NldHMuXHJcbiAgICAgKi9cclxuICAgIFJlbG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFJlbG9hZE1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyByZXNpemFibGUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgd2luZG93IGlzIGN1cnJlbnRseSByZXNpemFibGUuXHJcbiAgICAgKi9cclxuICAgIFJlc2l6YWJsZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFJlc2l6YWJsZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXN0b3JlcyB0aGUgd2luZG93IHRvIGl0cyBwcmV2aW91cyBzdGF0ZSBpZiBpdCB3YXMgcHJldmlvdXNseSBtaW5pbWlzZWQsIG1heGltaXNlZCBvciBmdWxsc2NyZWVuLlxyXG4gICAgICovXHJcbiAgICBSZXN0b3JlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oUmVzdG9yZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB4IC0gVGhlIGRlc2lyZWQgaG9yaXpvbnRhbCBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxyXG4gICAgICogQHBhcmFtIHkgLSBUaGUgZGVzaXJlZCB2ZXJ0aWNhbCBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBTZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0UG9zaXRpb25NZXRob2QsIHsgeCwgeSB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHdpbmRvdyB0byBiZSBhbHdheXMgb24gdG9wLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBhbHdheXNPblRvcCAtIFdoZXRoZXIgdGhlIHdpbmRvdyBzaG91bGQgc3RheSBvbiB0b3AuXHJcbiAgICAgKi9cclxuICAgIFNldEFsd2F5c09uVG9wKGFsd2F5c09uVG9wOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRBbHdheXNPblRvcE1ldGhvZCwgeyBhbHdheXNPblRvcCB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGJhY2tncm91bmQgY29sb3VyIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHIgLSBUaGUgZGVzaXJlZCByZWQgY29tcG9uZW50IG9mIHRoZSB3aW5kb3cgYmFja2dyb3VuZC5cclxuICAgICAqIEBwYXJhbSBnIC0gVGhlIGRlc2lyZWQgZ3JlZW4gY29tcG9uZW50IG9mIHRoZSB3aW5kb3cgYmFja2dyb3VuZC5cclxuICAgICAqIEBwYXJhbSBiIC0gVGhlIGRlc2lyZWQgYmx1ZSBjb21wb25lbnQgb2YgdGhlIHdpbmRvdyBiYWNrZ3JvdW5kLlxyXG4gICAgICogQHBhcmFtIGEgLSBUaGUgZGVzaXJlZCBhbHBoYSBjb21wb25lbnQgb2YgdGhlIHdpbmRvdyBiYWNrZ3JvdW5kLlxyXG4gICAgICovXHJcbiAgICBTZXRCYWNrZ3JvdW5kQ29sb3VyKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIsIGE6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0QmFja2dyb3VuZENvbG91ck1ldGhvZCwgeyByLCBnLCBiLCBhIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyB0aGUgd2luZG93IGZyYW1lIGFuZCB0aXRsZSBiYXIuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGZyYW1lbGVzcyAtIFdoZXRoZXIgdGhlIHdpbmRvdyBzaG91bGQgYmUgZnJhbWVsZXNzLlxyXG4gICAgICovXHJcbiAgICBTZXRGcmFtZWxlc3MoZnJhbWVsZXNzOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRGcmFtZWxlc3NNZXRob2QsIHsgZnJhbWVsZXNzIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGlzYWJsZXMgdGhlIHN5c3RlbSBmdWxsc2NyZWVuIGJ1dHRvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZW5hYmxlZCAtIFdoZXRoZXIgdGhlIGZ1bGxzY3JlZW4gYnV0dG9uIHNob3VsZCBiZSBlbmFibGVkLlxyXG4gICAgICovXHJcbiAgICBTZXRGdWxsc2NyZWVuQnV0dG9uRW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRGdWxsc2NyZWVuQnV0dG9uRW5hYmxlZE1ldGhvZCwgeyBlbmFibGVkIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgbWF4aW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHdpZHRoIC0gVGhlIGRlc2lyZWQgbWF4aW11bSB3aWR0aCBvZiB0aGUgd2luZG93LlxyXG4gICAgICogQHBhcmFtIGhlaWdodCAtIFRoZSBkZXNpcmVkIG1heGltdW0gaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKi9cclxuICAgIFNldE1heFNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldE1heFNpemVNZXRob2QsIHsgd2lkdGgsIGhlaWdodCB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIG1pbmltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB3aWR0aCAtIFRoZSBkZXNpcmVkIG1pbmltdW0gd2lkdGggb2YgdGhlIHdpbmRvdy5cclxuICAgICAqIEBwYXJhbSBoZWlnaHQgLSBUaGUgZGVzaXJlZCBtaW5pbXVtIGhlaWdodCBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBTZXRNaW5TaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRNaW5TaXplTWV0aG9kLCB7IHdpZHRoLCBoZWlnaHQgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHggLSBUaGUgZGVzaXJlZCBob3Jpem9udGFsIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKiBAcGFyYW0geSAtIFRoZSBkZXNpcmVkIHZlcnRpY2FsIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKi9cclxuICAgIFNldFJlbGF0aXZlUG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldFJlbGF0aXZlUG9zaXRpb25NZXRob2QsIHsgeCwgeSB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgd2hldGhlciB0aGUgd2luZG93IGlzIHJlc2l6YWJsZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcmVzaXphYmxlIC0gV2hldGhlciB0aGUgd2luZG93IHNob3VsZCBiZSByZXNpemFibGUuXHJcbiAgICAgKi9cclxuICAgIFNldFJlc2l6YWJsZShyZXNpemFibGU6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldFJlc2l6YWJsZU1ldGhvZCwgeyByZXNpemFibGUgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHdpZHRoIC0gVGhlIGRlc2lyZWQgd2lkdGggb2YgdGhlIHdpbmRvdy5cclxuICAgICAqIEBwYXJhbSBoZWlnaHQgLSBUaGUgZGVzaXJlZCBoZWlnaHQgb2YgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgU2V0U2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0U2l6ZU1ldGhvZCwgeyB3aWR0aCwgaGVpZ2h0IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgdGl0bGUgb2YgdGhlIHdpbmRvdy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgLSBUaGUgZGVzaXJlZCB0aXRsZSBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBTZXRUaXRsZSh0aXRsZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRUaXRsZU1ldGhvZCwgeyB0aXRsZSB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdpbmRvdy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9vbSAtIFRoZSBkZXNpcmVkIHpvb20gbGV2ZWwuXHJcbiAgICAgKi9cclxuICAgIFNldFpvb20oem9vbTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRab29tTWV0aG9kLCB7IHpvb20gfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93cyB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBTaG93KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2hvd01ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgc2l6ZSBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBTaXplKCk6IFByb21pc2U8U2l6ZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2l6ZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBmdWxsc2NyZWVuIGFuZCBub3JtYWwuXHJcbiAgICAgKi9cclxuICAgIFRvZ2dsZUZ1bGxzY3JlZW4oKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShUb2dnbGVGdWxsc2NyZWVuTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIG1heGltaXNlZCBhbmQgbm9ybWFsLlxyXG4gICAgICovXHJcbiAgICBUb2dnbGVNYXhpbWlzZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFRvZ2dsZU1heGltaXNlTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIGZyYW1lbGVzcyBhbmQgbm9ybWFsLlxyXG4gICAgICovXHJcbiAgICBUb2dnbGVGcmFtZWxlc3MoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShUb2dnbGVGcmFtZWxlc3NNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW4tZnVsbHNjcmVlbnMgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgVW5GdWxsc2NyZWVuKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oVW5GdWxsc2NyZWVuTWV0aG9kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVuLW1heGltaXNlcyB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBVbk1heGltaXNlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oVW5NYXhpbWlzZU1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbi1taW5pbWlzZXMgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgVW5NaW5pbWlzZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFVuTWluaW1pc2VNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIHdpbmRvdy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCB3aWR0aCBvZiB0aGUgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBXaWR0aCgpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oV2lkdGhNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogWm9vbXMgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgWm9vbSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21NZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5jcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXHJcbiAgICAgKi9cclxuICAgIFpvb21JbigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21Jbk1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWNyZWFzZXMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdlYnZpZXcgY29udGVudC5cclxuICAgICAqL1xyXG4gICAgWm9vbU91dCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21PdXRNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzZXRzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXHJcbiAgICAgKi9cclxuICAgIFpvb21SZXNldCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21SZXNldE1ldGhvZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIGZpbGUgZHJvcHMgb3JpZ2luYXRpbmcgZnJvbSBwbGF0Zm9ybS1zcGVjaWZpYyBjb2RlIChlLmcuLCBtYWNPUy9MaW51eCBuYXRpdmUgZHJhZy1hbmQtZHJvcCkuXHJcbiAgICAgKiBHYXRoZXJzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBkcm9wIHRhcmdldCBlbGVtZW50IGFuZCBzZW5kcyBpdCBiYWNrIHRvIHRoZSBHbyBiYWNrZW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBmaWxlbmFtZXMgLSBBbiBhcnJheSBvZiBmaWxlIHBhdGhzIChzdHJpbmdzKSB0aGF0IHdlcmUgZHJvcHBlZC5cclxuICAgICAqIEBwYXJhbSB4IC0gVGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgZHJvcCBldmVudCwgaW4gbG9naWNhbCAoQ1NTKSBwaXhlbHMgcmVsYXRpdmUgdG8gdGhlIHdlYnZpZXcuXHJcbiAgICAgKiBAcGFyYW0geSAtIFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIGRyb3AgZXZlbnQsIGluIGxvZ2ljYWwgKENTUykgcGl4ZWxzIHJlbGF0aXZlIHRvIHRoZSB3ZWJ2aWV3LlxyXG4gICAgICovXHJcbiAgICBIYW5kbGVQbGF0Zm9ybUZpbGVEcm9wKGZpbGVuYW1lczogc3RyaW5nW10sIHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcclxuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIEZpbGUgZHJvcHMgZGlzYWJsZWQsIGlnbm9yZSB0aGUgZHJvcFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcclxuICAgICAgICBjb25zdCBkcm9wVGFyZ2V0ID0gZ2V0RHJvcFRhcmdldEVsZW1lbnQoZWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmICghZHJvcFRhcmdldCkge1xyXG4gICAgICAgICAgICAvLyBEcm9wIHdhcyBub3Qgb24gYSBkZXNpZ25hdGVkIGRyb3AgdGFyZ2V0IC0gaWdub3JlXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnREZXRhaWxzID0ge1xyXG4gICAgICAgICAgICBpZDogZHJvcFRhcmdldC5pZCxcclxuICAgICAgICAgICAgY2xhc3NMaXN0OiBBcnJheS5mcm9tKGRyb3BUYXJnZXQuY2xhc3NMaXN0KSxcclxuICAgICAgICAgICAgYXR0cmlidXRlczoge30gYXMgeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZHJvcFRhcmdldC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSBkcm9wVGFyZ2V0LmF0dHJpYnV0ZXNbaV07XHJcbiAgICAgICAgICAgIGVsZW1lbnREZXRhaWxzLmF0dHJpYnV0ZXNbYXR0ci5uYW1lXSA9IGF0dHIudmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgICAgICAgICBmaWxlbmFtZXMsXHJcbiAgICAgICAgICAgIHgsXHJcbiAgICAgICAgICAgIHksXHJcbiAgICAgICAgICAgIGVsZW1lbnREZXRhaWxzLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXNbY2FsbGVyU3ltXShGaWxlc0Ryb3BwZWQsIHBheWxvYWQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENsZWFuIHVwIG5hdGl2ZSBkcmFnIHN0YXRlIGFmdGVyIGRyb3BcclxuICAgICAgICBjbGVhbnVwTmF0aXZlRHJhZygpO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgLyoqXHJcbiAgICAgKiBNb3ZlcyB0aGUgd2luZG93IHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNwZWNpZmllZCBzY3JlZW4ncyB3b3JrIGFyZWEuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHNjcmVlbklEIC0gVGhlIElEIG9mIHRoZSB0YXJnZXQgc2NyZWVuLlxyXG4gICAgICovXHJcbiAgICBTZXRTY3JlZW4oc2NyZWVuSUQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0U2NyZWVuTWV0aG9kLCB7IHNjcmVlbklEIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIFRyaWdnZXJzIFdpbmRvd3MgMTEgU25hcCBBc3Npc3QgZmVhdHVyZSAoV2luZG93cyBvbmx5KS5cclxuICAgICAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byBwcmVzc2luZyBXaW4rWiBhbmQgc2hvd3Mgc25hcCBsYXlvdXQgb3B0aW9ucy5cclxuICAgICAqL1xyXG4gICAgU25hcEFzc2lzdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNuYXBBc3Npc3RNZXRob2QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3BlbnMgdGhlIHByaW50IGRpYWxvZyBmb3IgdGhlIHdpbmRvdy5cclxuICAgICAqL1xyXG4gICAgUHJpbnQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShQcmludE1ldGhvZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgd2luZG93IHdpdGhpbiB3aGljaCB0aGUgc2NyaXB0IGlzIHJ1bm5pbmcuXHJcbiAqL1xyXG5jb25zdCB0aGlzV2luZG93ID0gbmV3IFdpbmRvdygnJyk7XHJcblxyXG4vKipcclxuICogU2V0cyB1cCBnbG9iYWwgZHJhZyBhbmQgZHJvcCBldmVudCBsaXN0ZW5lcnMgZm9yIGZpbGUgZHJvcHMuXHJcbiAqIEhhbmRsZXMgdmlzdWFsIGZlZWRiYWNrIChob3ZlciBzdGF0ZSkgYW5kIGZpbGUgZHJvcCBwcm9jZXNzaW5nLlxyXG4gKi9cclxuZnVuY3Rpb24gc2V0dXBEcm9wVGFyZ2V0TGlzdGVuZXJzKCkge1xyXG4gICAgY29uc3QgZG9jRWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgIGxldCBkcmFnRW50ZXJDb3VudGVyID0gMDtcclxuXHJcbiAgICBkb2NFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmICghZXZlbnQuZGF0YVRyYW5zZmVyPy50eXBlcy5pbmNsdWRlcygnRmlsZXMnKSkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIE9ubHkgaGFuZGxlIGZpbGUgZHJhZ3MsIGxldCBvdGhlciBkcmFncyBwYXNzIHRocm91Z2hcclxuICAgICAgICB9XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy8gQWx3YXlzIHByZXZlbnQgZGVmYXVsdCB0byBzdG9wIGJyb3dzZXIgbmF2aWdhdGlvblxyXG4gICAgICAgIC8vIE9uIFdpbmRvd3MsIGNoZWNrIGlmIGZpbGUgZHJvcHMgYXJlIGVuYWJsZWQgZm9yIHRoaXMgd2luZG93XHJcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbm9uZSc7IC8vIFNob3cgXCJubyBkcm9wXCIgY3Vyc29yXHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gRmlsZSBkcm9wcyBkaXNhYmxlZCwgZG9uJ3Qgc2hvdyBob3ZlciBlZmZlY3RzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYWdFbnRlckNvdW50ZXIrKztcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB0YXJnZXRFbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgICAgICBjb25zdCBkcm9wVGFyZ2V0ID0gZ2V0RHJvcFRhcmdldEVsZW1lbnQodGFyZ2V0RWxlbWVudCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBob3ZlciBzdGF0ZVxyXG4gICAgICAgIGlmIChjdXJyZW50RHJvcFRhcmdldCAmJiBjdXJyZW50RHJvcFRhcmdldCAhPT0gZHJvcFRhcmdldCkge1xyXG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZHJvcFRhcmdldCkge1xyXG4gICAgICAgICAgICBkcm9wVGFyZ2V0LmNsYXNzTGlzdC5hZGQoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKTtcclxuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnY29weSc7XHJcbiAgICAgICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gZHJvcFRhcmdldDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBldmVudC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdub25lJztcclxuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICBkb2NFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKCFldmVudC5kYXRhVHJhbnNmZXI/LnR5cGVzLmluY2x1ZGVzKCdGaWxlcycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gT25seSBoYW5kbGUgZmlsZSBkcmFnc1xyXG4gICAgICAgIH1cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBBbHdheXMgcHJldmVudCBkZWZhdWx0IHRvIHN0b3AgYnJvd3NlciBuYXZpZ2F0aW9uXHJcbiAgICAgICAgLy8gT24gV2luZG93cywgY2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcclxuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBldmVudC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdub25lJzsgLy8gU2hvdyBcIm5vIGRyb3BcIiBjdXJzb3JcclxuICAgICAgICAgICAgcmV0dXJuOyAvLyBGaWxlIGRyb3BzIGRpc2FibGVkLCBkb24ndCBzaG93IGhvdmVyIGVmZmVjdHNcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVXBkYXRlIGRyb3AgdGFyZ2V0IGFzIGN1cnNvciBtb3Zlc1xyXG4gICAgICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBnZXREcm9wVGFyZ2V0RWxlbWVudCh0YXJnZXRFbGVtZW50KTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoY3VycmVudERyb3BUYXJnZXQgJiYgY3VycmVudERyb3BUYXJnZXQgIT09IGRyb3BUYXJnZXQpIHtcclxuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoZHJvcFRhcmdldCkge1xyXG4gICAgICAgICAgICBpZiAoIWRyb3BUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUykpIHtcclxuICAgICAgICAgICAgICAgIGRyb3BUYXJnZXQuY2xhc3NMaXN0LmFkZChEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknO1xyXG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IGRyb3BUYXJnZXQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgZG9jRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnbGVhdmUnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICBpZiAoIWV2ZW50LmRhdGFUcmFuc2Zlcj8udHlwZXMuaW5jbHVkZXMoJ0ZpbGVzJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBBbHdheXMgcHJldmVudCBkZWZhdWx0IHRvIHN0b3AgYnJvd3NlciBuYXZpZ2F0aW9uXHJcbiAgICAgICAgLy8gT24gV2luZG93cywgY2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcclxuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE9uIExpbnV4L1dlYktpdEdUSyBhbmQgbWFjT1MsIGRyYWdsZWF2ZSBmaXJlcyBpbW1lZGlhdGVseSB3aXRoIHJlbGF0ZWRUYXJnZXQ9bnVsbCB3aGVuIG5hdGl2ZVxyXG4gICAgICAgIC8vIGRyYWcgaGFuZGxpbmcgaXMgaW52b2x2ZWQuIElnbm9yZSB0aGVzZSBzcHVyaW91cyBldmVudHMgLSB3ZSdsbCBjbGVhbiB1cCBvbiBkcm9wIGluc3RlYWQuXHJcbiAgICAgICAgaWYgKGV2ZW50LnJlbGF0ZWRUYXJnZXQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBkcmFnRW50ZXJDb3VudGVyLS07XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGRyYWdFbnRlckNvdW50ZXIgPT09IDAgfHwgXHJcbiAgICAgICAgICAgIChjdXJyZW50RHJvcFRhcmdldCAmJiAhY3VycmVudERyb3BUYXJnZXQuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCBhcyBOb2RlKSkpIHtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnREcm9wVGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ0VudGVyQ291bnRlciA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxuICAgIGRvY0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmICghZXZlbnQuZGF0YVRyYW5zZmVyPy50eXBlcy5pbmNsdWRlcygnRmlsZXMnKSkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIE9ubHkgaGFuZGxlIGZpbGUgZHJvcHNcclxuICAgICAgICB9XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy8gQWx3YXlzIHByZXZlbnQgZGVmYXVsdCB0byBzdG9wIGJyb3dzZXIgbmF2aWdhdGlvblxyXG4gICAgICAgIC8vIE9uIFdpbmRvd3MsIGNoZWNrIGlmIGZpbGUgZHJvcHMgYXJlIGVuYWJsZWQgZm9yIHRoaXMgd2luZG93XHJcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkcmFnRW50ZXJDb3VudGVyID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoY3VycmVudERyb3BUYXJnZXQpIHtcclxuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xyXG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPbiBXaW5kb3dzLCBoYW5kbGUgZmlsZSBkcm9wcyB2aWEgSmF2YVNjcmlwdFxyXG4gICAgICAgIC8vIE9uIG1hY09TL0xpbnV4LCBuYXRpdmUgY29kZSB3aWxsIGNhbGwgSGFuZGxlUGxhdGZvcm1GaWxlRHJvcFxyXG4gICAgICAgIC8vIENvbXBvc2l0aW9uLWhvc3RlZCB3aW5kb3dzIHJlc29sdmUgQ0ZfSERST1AgcGF0aHMgaW4gdGhlIG5hdGl2ZSBob3N0XG4gICAgICAgIC8vIHNvIGEgcXVpY2sgZHJvcCBjYW5ub3Qgb3V0cnVuIFdlYlZpZXcyJ3MgRE9NIGRyYWcgZXZlbnQgZGlzcGF0Y2guXG4gICAgICAgIC8vIFRoZSBET00gZHJvcCBzdGlsbCBmaXJlcyBmb3IgYXBwbGljYXRpb24gaGFuZGxlcnMsIGJ1dCBwb3N0aW5nIHRoZVxuICAgICAgICAvLyBGaWxlIG9iamVjdHMgaGVyZSB3b3VsZCBkdXBsaWNhdGUgdGhlIG5hdGl2ZSBXaW5kb3dGaWxlc0Ryb3BwZWQgZXZlbnQuXG4gICAgICAgIGlmIChjYW5SZXNvbHZlRmlsZVBhdGhzKCkgJiYgKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZmxhZ3M/Lm5hdGl2ZUNvbXBvc2l0aW9uRmlsZURyb3AgIT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzOiBGaWxlW10gPSBbXTtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGFUcmFuc2Zlci5pdGVtcykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGV2ZW50LmRhdGFUcmFuc2Zlci5pdGVtcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmtpbmQgPT09ICdmaWxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gaXRlbS5nZXRBc0ZpbGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUpIGZpbGVzLnB1c2goZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGFUcmFuc2Zlci5maWxlcykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGV2ZW50LmRhdGFUcmFuc2Zlci5maWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlRmlsZVBhdGhzKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGZpbGVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sIGZhbHNlKTtcclxufVxyXG5cclxuLy8gSW5pdGlhbGl6ZSBsaXN0ZW5lcnMgd2hlbiB0aGUgc2NyaXB0IGxvYWRzXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgc2V0dXBEcm9wVGFyZ2V0TGlzdGVuZXJzKCk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRoaXNXaW5kb3c7XHJcbiIsICIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgKiBhcyBSdW50aW1lIGZyb20gXCIuLi9Ad2FpbHNpby9ydW50aW1lL3NyY1wiO1xyXG5cclxuLy8gTk9URTogdGhlIGZvbGxvd2luZyBtZXRob2RzIE1VU1QgYmUgaW1wb3J0ZWQgZXhwbGljaXRseSBiZWNhdXNlIG9mIGhvdyBlc2J1aWxkIGluamVjdGlvbiB3b3Jrc1xyXG5pbXBvcnQgeyBFbmFibGUgYXMgRW5hYmxlV01MIH0gZnJvbSBcIi4uL0B3YWlsc2lvL3J1bnRpbWUvc3JjL3dtbFwiO1xyXG5pbXBvcnQgeyBkZWJ1Z0xvZyB9IGZyb20gXCIuLi9Ad2FpbHNpby9ydW50aW1lL3NyYy91dGlsc1wiO1xyXG5cclxud2luZG93LndhaWxzID0gUnVudGltZTtcclxuRW5hYmxlV01MKCk7XHJcblxyXG5pZiAoREVCVUcpIHtcclxuICAgIGRlYnVnTG9nKFwiV2FpbHMgUnVudGltZSBMb2FkZWRcIilcclxufVxyXG4iLCAiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuaW1wb3J0IHsgbmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXMgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XHJcblxyXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5TeXN0ZW0pO1xyXG5cclxuY29uc3QgU3lzdGVtSXNEYXJrTW9kZSA9IDA7XHJcbmNvbnN0IFN5c3RlbUVudmlyb25tZW50ID0gMTtcclxuY29uc3QgU3lzdGVtQ2FwYWJpbGl0aWVzID0gMjtcclxuXHJcbmNvbnN0IF9pbnZva2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBXaW5kb3dzIFdlYlZpZXcyXHJcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5jaHJvbWU/LndlYnZpZXc/LnBvc3RNZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAod2luZG93IGFzIGFueSkuY2hyb21lLndlYnZpZXcucG9zdE1lc3NhZ2UuYmluZCgod2luZG93IGFzIGFueSkuY2hyb21lLndlYnZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBtYWNPUy9pT1MgV0tXZWJWaWV3XHJcbiAgICAgICAgZWxzZSBpZiAoKHdpbmRvdyBhcyBhbnkpLndlYmtpdD8ubWVzc2FnZUhhbmRsZXJzPy5bJ2V4dGVybmFsJ10/LnBvc3RNZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAod2luZG93IGFzIGFueSkud2Via2l0Lm1lc3NhZ2VIYW5kbGVyc1snZXh0ZXJuYWwnXS5wb3N0TWVzc2FnZS5iaW5kKCh3aW5kb3cgYXMgYW55KS53ZWJraXQubWVzc2FnZUhhbmRsZXJzWydleHRlcm5hbCddKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQW5kcm9pZCBXZWJWaWV3IC0gdXNlcyBhZGRKYXZhc2NyaXB0SW50ZXJmYWNlIHdoaWNoIGV4cG9zZXMgd2luZG93LndhaWxzLmludm9rZVxyXG4gICAgICAgIGVsc2UgaWYgKCh3aW5kb3cgYXMgYW55KS53YWlscz8uaW52b2tlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAobXNnOiBhbnkpID0+ICh3aW5kb3cgYXMgYW55KS53YWlscy5pbnZva2UodHlwZW9mIG1zZyA9PT0gJ3N0cmluZycgPyBtc2cgOiBKU09OLnN0cmluZ2lmeShtc2cpKTtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoKGUpIHt9XHJcblxyXG4gICAgY29uc29sZS53YXJuKCdcXG4lY1x1MjZBMFx1RkUwRiBCcm93c2VyIEVudmlyb25tZW50IERldGVjdGVkICVjXFxuXFxuJWNPbmx5IFVJIHByZXZpZXdzIGFyZSBhdmFpbGFibGUgaW4gdGhlIGJyb3dzZXIuIEZvciBmdWxsIGZ1bmN0aW9uYWxpdHksIHBsZWFzZSBydW4gdGhlIGFwcGxpY2F0aW9uIGluIGRlc2t0b3AgbW9kZS5cXG5Nb3JlIGluZm9ybWF0aW9uIGF0OiBodHRwczovL3YzLndhaWxzLmlvL2xlYXJuL2J1aWxkLyN1c2luZy1hLWJyb3dzZXItZm9yLWRldmVsb3BtZW50XFxuJyxcclxuICAgICAgICAnYmFja2dyb3VuZDogI2ZmZmZmZjsgY29sb3I6ICMwMDAwMDA7IGZvbnQtd2VpZ2h0OiBib2xkOyBwYWRkaW5nOiA0cHggOHB4OyBib3JkZXItcmFkaXVzOiA0cHg7IGJvcmRlcjogMnB4IHNvbGlkICMwMDAwMDA7JyxcclxuICAgICAgICAnYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7JyxcclxuICAgICAgICAnY29sb3I6ICNmZmZmZmY7IGZvbnQtc3R5bGU6IGl0YWxpYzsgZm9udC13ZWlnaHQ6IGJvbGQ7Jyk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxufSkoKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZva2UobXNnOiBhbnkpOiB2b2lkIHtcclxuICAgIF9pbnZva2U/Lihtc2cpO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0cmlldmVzIHRoZSBzeXN0ZW0gZGFyayBtb2RlIHN0YXR1cy5cclxuICpcclxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgaWYgdGhlIHN5c3RlbSBpcyBpbiBkYXJrIG1vZGUuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSXNEYXJrTW9kZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiBjYWxsKFN5c3RlbUlzRGFya01vZGUpO1xyXG59XHJcblxyXG4vKipcclxuICogRmV0Y2hlcyB0aGUgY2FwYWJpbGl0aWVzIG9mIHRoZSBhcHBsaWNhdGlvbiBmcm9tIHRoZSBzZXJ2ZXIuXHJcbiAqXHJcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBjYXBhYmlsaXRpZXMuXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gQ2FwYWJpbGl0aWVzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgYW55Pj4ge1xyXG4gICAgcmV0dXJuIGNhbGwoU3lzdGVtQ2FwYWJpbGl0aWVzKTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPU0luZm8ge1xyXG4gICAgLyoqIFRoZSBicmFuZGluZyBvZiB0aGUgT1MuICovXHJcbiAgICBCcmFuZGluZzogc3RyaW5nO1xyXG4gICAgLyoqIFRoZSBJRCBvZiB0aGUgT1MuICovXHJcbiAgICBJRDogc3RyaW5nO1xyXG4gICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBPUy4gKi9cclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIC8qKiBUaGUgdmVyc2lvbiBvZiB0aGUgT1MuICovXHJcbiAgICBWZXJzaW9uOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRW52aXJvbm1lbnRJbmZvIHtcclxuICAgIC8qKiBUaGUgYXJjaGl0ZWN0dXJlIG9mIHRoZSBzeXN0ZW0uICovXHJcbiAgICBBcmNoOiBzdHJpbmc7XHJcbiAgICAvKiogVHJ1ZSBpZiB0aGUgYXBwbGljYXRpb24gaXMgcnVubmluZyBpbiBkZWJ1ZyBtb2RlLCBvdGhlcndpc2UgZmFsc2UuICovXHJcbiAgICBEZWJ1ZzogYm9vbGVhbjtcclxuICAgIC8qKiBUaGUgb3BlcmF0aW5nIHN5c3RlbSBpbiB1c2UuICovXHJcbiAgICBPUzogc3RyaW5nO1xyXG4gICAgLyoqIERldGFpbHMgb2YgdGhlIG9wZXJhdGluZyBzeXN0ZW0uICovXHJcbiAgICBPU0luZm86IE9TSW5mbztcclxuICAgIC8qKiBBZGRpdGlvbmFsIHBsYXRmb3JtIGluZm9ybWF0aW9uLiAqL1xyXG4gICAgUGxhdGZvcm1JbmZvOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0cmlldmVzIGVudmlyb25tZW50IGRldGFpbHMuXHJcbiAqXHJcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIG9iamVjdCBjb250YWluaW5nIE9TIGFuZCBzeXN0ZW0gYXJjaGl0ZWN0dXJlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEVudmlyb25tZW50KCk6IFByb21pc2U8RW52aXJvbm1lbnRJbmZvPiB7XHJcbiAgICByZXR1cm4gY2FsbChTeXN0ZW1FbnZpcm9ubWVudCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBXaW5kb3dzLlxyXG4gKlxyXG4gKiBAcmV0dXJuIFRydWUgaWYgdGhlIG9wZXJhdGluZyBzeXN0ZW0gaXMgV2luZG93cywgb3RoZXJ3aXNlIGZhbHNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIElzV2luZG93cygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uT1MgPT09IFwid2luZG93c1wiO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgTGludXguXHJcbiAqXHJcbiAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIExpbnV4LCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSXNMaW51eCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uT1MgPT09IFwibGludXhcIjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBpcyBhIG1hY09TIG9wZXJhdGluZyBzeXN0ZW0uXHJcbiAqXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIG1hY09TLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSXNNYWMoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZW52aXJvbm1lbnQ/Lk9TID09PSBcImRhcndpblwiO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgaU9TLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlzIGlPUywgb3RoZXJ3aXNlIGZhbHNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIElzSU9TKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmVudmlyb25tZW50Py5PUyA9PT0gXCJpb3NcIjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIEFuZHJvaWQuXHJcbiAqXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIG9wZXJhdGluZyBzeXN0ZW0gaXMgQW5kcm9pZCwgb3RoZXJ3aXNlIGZhbHNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIElzQW5kcm9pZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uT1MgPT09IFwiYW5kcm9pZFwiO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIHRoZSBhcHAgaXMgcnVubmluZyBvbiBhIG1vYmlsZSBPUyAoaU9TIG9yIEFuZHJvaWQpLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBUcnVlIG9uIGlPUyBvciBBbmRyb2lkLCBvdGhlcndpc2UgZmFsc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSXNNb2JpbGUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gSXNJT1MoKSB8fCBJc0FuZHJvaWQoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiB0aGUgYXBwIGlzIHJ1bm5pbmcgb24gYSBkZXNrdG9wIE9TIChtYWNPUywgV2luZG93cyBvciBMaW51eCkuXHJcbiAqXHJcbiAqIEByZXR1cm5zIFRydWUgb24gbWFjT1MsIFdpbmRvd3Mgb3IgTGludXgsIG90aGVyd2lzZSBmYWxzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBJc0Rlc2t0b3AoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gSXNNYWMoKSB8fCBJc1dpbmRvd3MoKSB8fCBJc0xpbnV4KCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgYXJjaGl0ZWN0dXJlIGlzIEFNRDY0LlxyXG4gKlxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGFyY2hpdGVjdHVyZSBpcyBBTUQ2NCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIElzQU1ENjQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZW52aXJvbm1lbnQ/LkFyY2ggPT09IFwiYW1kNjRcIjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBhcmNoaXRlY3R1cmUgaXMgQVJNLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBjdXJyZW50IGFyY2hpdGVjdHVyZSBpcyBBUk0sIGZhbHNlIG90aGVyd2lzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBJc0FSTSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uQXJjaCA9PT0gXCJhcm1cIjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBpcyBBUk02NCBhcmNoaXRlY3R1cmUuXHJcbiAqXHJcbiAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiB0aGUgZW52aXJvbm1lbnQgaXMgQVJNNjQgYXJjaGl0ZWN0dXJlLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBJc0FSTTY0KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmVudmlyb25tZW50Py5BcmNoID09PSBcImFybTY0XCI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXBvcnRzIHdoZXRoZXIgdGhlIGFwcCBpcyBiZWluZyBydW4gaW4gZGVidWcgbW9kZS5cclxuICpcclxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgYXBwIGlzIGJlaW5nIHJ1biBpbiBkZWJ1ZyBtb2RlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIElzRGVidWcoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gQm9vbGVhbigod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uRGVidWcpO1xyXG59XHJcblxyXG4iLCAiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuaW1wb3J0IHsgbmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXMgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XHJcbmltcG9ydCB7IElzRGVidWcgfSBmcm9tIFwiLi9zeXN0ZW0uanNcIjtcclxuaW1wb3J0IHsgZXZlbnRUYXJnZXQgfSBmcm9tIFwiLi91dGlscy5qc1wiO1xyXG5cclxuLy8gc2V0dXBcclxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcclxuXHJcbmlmIChoYXNET00pIHtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGNvbnRleHRNZW51SGFuZGxlcik7XHJcbn1cclxuXHJcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLkNvbnRleHRNZW51KTtcclxuXHJcbmNvbnN0IENvbnRleHRNZW51T3BlbiA9IDA7XHJcblxyXG5mdW5jdGlvbiBvcGVuQ29udGV4dE1lbnUoaWQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIGRhdGE6IGFueSk6IHZvaWQge1xyXG4gICAgdm9pZCBjYWxsKENvbnRleHRNZW51T3Blbiwge2lkLCB4LCB5LCBkYXRhfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbnRleHRNZW51SGFuZGxlcihldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnRUYXJnZXQoZXZlbnQpO1xyXG5cclxuICAgIC8vIENoZWNrIGZvciBjdXN0b20gY29udGV4dCBtZW51XHJcbiAgICBjb25zdCBjdXN0b21Db250ZXh0TWVudSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tY3VzdG9tLWNvbnRleHRtZW51XCIpLnRyaW0oKTtcclxuXHJcbiAgICBpZiAoY3VzdG9tQ29udGV4dE1lbnUpIHtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudS1kYXRhXCIpO1xyXG4gICAgICAgIG9wZW5Db250ZXh0TWVudShjdXN0b21Db250ZXh0TWVudSwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgZGF0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQsIHRhcmdldCk7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4vKlxyXG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IGF1dG87IChkZWZhdWx0KSB3aWxsIHNob3cgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51IGlmIGNvbnRlbnRFZGl0YWJsZSBpcyB0cnVlIE9SIHRleHQgaGFzIGJlZW4gc2VsZWN0ZWQgT1IgZWxlbWVudCBpcyBpbnB1dCBvciB0ZXh0YXJlYVxyXG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IHNob3c7IHdpbGwgYWx3YXlzIHNob3cgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51XHJcbi0tZGVmYXVsdC1jb250ZXh0bWVudTogaGlkZTsgd2lsbCBhbHdheXMgaGlkZSB0aGUgZGVmYXVsdCBjb250ZXh0IG1lbnVcclxuXHJcblRoaXMgcnVsZSBpcyBpbmhlcml0ZWQgbGlrZSBub3JtYWwgQ1NTIHJ1bGVzLCBzbyBuZXN0aW5nIHdvcmtzIGFzIGV4cGVjdGVkXHJcbiovXHJcbmZ1bmN0aW9uIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQ6IE1vdXNlRXZlbnQsIHRhcmdldDogSFRNTEVsZW1lbnQpIHtcclxuICAgIC8vIERlYnVnIGJ1aWxkcyBhbHdheXMgc2hvdyB0aGUgbWVudVxyXG4gICAgaWYgKElzRGVidWcoKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm9jZXNzIGRlZmF1bHQgY29udGV4dCBtZW51XHJcbiAgICBzd2l0Y2ggKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tZGVmYXVsdC1jb250ZXh0bWVudVwiKS50cmltKCkpIHtcclxuICAgICAgICBjYXNlICdzaG93JzpcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNhc2UgJ2hpZGUnOlxyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgY29udGVudEVkaXRhYmxlIGlzIHRydWVcclxuICAgIGlmICh0YXJnZXQuaXNDb250ZW50RWRpdGFibGUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgdGV4dCBoYXMgYmVlbiBzZWxlY3RlZFxyXG4gICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgY29uc3QgaGFzU2VsZWN0aW9uID0gc2VsZWN0aW9uICYmIHNlbGVjdGlvbi50b1N0cmluZygpLmxlbmd0aCA+IDA7XHJcbiAgICBpZiAoaGFzU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rpb24ucmFuZ2VDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoaSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlY3RzID0gcmFuZ2UuZ2V0Q2xpZW50UmVjdHMoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWN0cy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVjdCA9IHJlY3RzW2pdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQocmVjdC5sZWZ0LCByZWN0LnRvcCkgPT09IHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBpZiB0YWcgaXMgaW5wdXQgb3IgdGV4dGFyZWEuXHJcbiAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCB8fCB0YXJnZXQgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKGhhc1NlbGVjdGlvbiB8fCAoIXRhcmdldC5yZWFkT25seSAmJiAhdGFyZ2V0LmRpc2FibGVkKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGhpZGUgZGVmYXVsdCBjb250ZXh0IG1lbnVcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbn1cclxuIiwgIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSBmcm9tIHRoZSBmbGFnIG1hcC5cclxuICpcclxuICogQHBhcmFtIGtleSAtIFRoZSBrZXkgdG8gcmV0cmlldmUgdGhlIHZhbHVlIGZvci5cclxuICogQHJldHVybiBUaGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEdldEZsYWcoa2V5OiBzdHJpbmcpOiBhbnkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gd2luZG93Ll93YWlscy5mbGFnc1trZXldO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byByZXRyaWV2ZSBmbGFnICdcIiArIGtleSArIFwiJzogXCIgKyBlLCB7IGNhdXNlOiBlIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsICIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBpbnZva2UsIElzV2luZG93cywgSXNMaW51eCwgSXNNYWMgfSBmcm9tIFwiLi9zeXN0ZW0uanNcIjtcclxuaW1wb3J0IHsgR2V0RmxhZyB9IGZyb20gXCIuL2ZsYWdzLmpzXCI7XHJcbmltcG9ydCB7IGNhblRyYWNrQnV0dG9ucywgZXZlbnRUYXJnZXQgfSBmcm9tIFwiLi91dGlscy5qc1wiO1xyXG5cclxuLy8gU2V0dXBcclxubGV0IGNhbkRyYWcgPSBmYWxzZTtcclxubGV0IGRyYWdnaW5nID0gZmFsc2U7XHJcblxyXG5sZXQgcmVzaXphYmxlID0gZmFsc2U7XHJcbmxldCBjYW5SZXNpemUgPSBmYWxzZTtcclxubGV0IHJlc2l6aW5nID0gZmFsc2U7XHJcbmxldCByZXNpemVFZGdlOiBzdHJpbmcgPSBcIlwiO1xyXG5sZXQgZGVmYXVsdEN1cnNvciA9IFwiYXV0b1wiO1xyXG5cclxubGV0IGJ1dHRvbnMgPSAwO1xyXG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xyXG5cclxubGV0IGJ1dHRvbnNUcmFja2VkID0gZmFsc2U7XHJcblxyXG5pZiAoaGFzRE9NKSB7XHJcbiAgICBidXR0b25zVHJhY2tlZCA9IGNhblRyYWNrQnV0dG9ucygpO1xyXG4gICAgd2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XHJcbiAgICB3aW5kb3cuX3dhaWxzLnNldFJlc2l6YWJsZSA9ICh2YWx1ZTogYm9vbGVhbik6IHZvaWQgPT4ge1xyXG4gICAgICAgIHJlc2l6YWJsZSA9IHZhbHVlO1xyXG4gICAgICAgIGlmICghcmVzaXphYmxlKSB7XHJcbiAgICAgICAgICAgIC8vIFN0b3AgcmVzaXppbmcgaWYgaW4gcHJvZ3Jlc3MuXHJcbiAgICAgICAgICAgIGNhblJlc2l6ZSA9IHJlc2l6aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNldFJlc2l6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbi8vIERlZmVyIGF0dGFjaGluZyBtb3VzZSBsaXN0ZW5lcnMgdW50aWwgd2Uga25vdyB3ZSdyZSBub3Qgb24gbW9iaWxlLlxyXG5sZXQgZHJhZ0luaXREb25lID0gZmFsc2U7XHJcbmZ1bmN0aW9uIGlzTW9iaWxlKCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qgb3MgPSAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uT1M7XHJcbiAgICBpZiAob3MgPT09IFwiaW9zXCIgfHwgb3MgPT09IFwiYW5kcm9pZFwiKSByZXR1cm4gdHJ1ZTtcclxuICAgIC8vIEZhbGxiYWNrIGhldXJpc3RpYyBpZiBlbnZpcm9ubWVudCBub3QgeWV0IHNldFxyXG4gICAgY29uc3QgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgKHdpbmRvdyBhcyBhbnkpLm9wZXJhIHx8IFwiXCI7XHJcbiAgICByZXR1cm4gL2FuZHJvaWR8aXBob25lfGlwYWR8aXBvZHxpZW1vYmlsZXx3cGRlc2t0b3AvaS50ZXN0KHVhKTtcclxufVxyXG5mdW5jdGlvbiB0cnlJbml0RHJhZ0hhbmRsZXJzKCk6IHZvaWQge1xyXG4gICAgaWYgKGRyYWdJbml0RG9uZSkgcmV0dXJuO1xyXG4gICAgaWYgKGlzTW9iaWxlKCkpIHJldHVybjtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB1cGRhdGUsIHsgY2FwdHVyZTogdHJ1ZSB9KTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB1cGRhdGUsIHsgY2FwdHVyZTogdHJ1ZSB9KTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdXBkYXRlLCB7IGNhcHR1cmU6IHRydWUgfSk7XHJcbiAgICBmb3IgKGNvbnN0IGV2IG9mIFsnY2xpY2snLCAnY29udGV4dG1lbnUnLCAnZGJsY2xpY2snXSkge1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGV2LCBzdXBwcmVzc0V2ZW50LCB7IGNhcHR1cmU6IHRydWUgfSk7XHJcbiAgICB9XHJcbiAgICBkcmFnSW5pdERvbmUgPSB0cnVlO1xyXG59XHJcbmlmIChoYXNET00pIHtcclxuICAgIC8vIEF0dGVtcHQgaW1tZWRpYXRlIGluaXQgKGluIGNhc2UgZW52aXJvbm1lbnQgYWxyZWFkeSBwcmVzZW50KVxyXG4gICAgdHJ5SW5pdERyYWdIYW5kbGVycygpO1xyXG4gICAgLy8gQWxzbyBhdHRlbXB0IG9uIERPTSByZWFkeVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHRyeUluaXREcmFnSGFuZGxlcnMsIHsgb25jZTogdHJ1ZSB9KTtcclxuICAgIC8vIEFzIGEgbGFzdCByZXNvcnQsIHBvbGwgZm9yIGVudmlyb25tZW50IGZvciBhIHNob3J0IHBlcmlvZFxyXG4gICAgbGV0IGRyYWdFbnZQb2xscyA9IDA7XHJcbiAgICBjb25zdCBkcmFnRW52UG9sbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYWdJbml0RG9uZSkgeyB3aW5kb3cuY2xlYXJJbnRlcnZhbChkcmFnRW52UG9sbCk7IHJldHVybjsgfVxyXG4gICAgICAgIHRyeUluaXREcmFnSGFuZGxlcnMoKTtcclxuICAgICAgICBpZiAoKytkcmFnRW52UG9sbHMgPiAxMDApIHsgd2luZG93LmNsZWFySW50ZXJ2YWwoZHJhZ0VudlBvbGwpOyB9XHJcbiAgICB9LCA1MCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN1cHByZXNzRXZlbnQoZXZlbnQ6IEV2ZW50KSB7XHJcbiAgICBpZiAoXHJcbiAgICAgICAgZXZlbnQudHlwZSA9PT0gXCJkYmxjbGlja1wiXHJcbiAgICAgICAgJiYgSXNNYWMoKVxyXG4gICAgICAgICYmIHdpbmRvdyA9PT0gd2luZG93LnRvcFxyXG4gICAgICAgICYmIGlzRHJhZ2dhYmxlRXZlbnQoZXZlbnQgYXMgTW91c2VFdmVudClcclxuICAgICkge1xyXG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgaW52b2tlKFwid2FpbHM6ZHJhZzpkb3VibGVjbGlja1wiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3VwcHJlc3MgY2xpY2sgZXZlbnRzIHdoaWxlIHJlc2l6aW5nIG9yIGRyYWdnaW5nLlxyXG4gICAgaWYgKGRyYWdnaW5nIHx8IHJlc2l6aW5nKSB7XHJcbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaXNEcmFnZ2FibGVFdmVudChldmVudDogTW91c2VFdmVudCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnRUYXJnZXQoZXZlbnQpO1xyXG4gICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS13YWlscy1kcmFnZ2FibGVcIikudHJpbSgpID09PSBcImRyYWdcIlxyXG4gICAgICAgICYmIGV2ZW50Lm9mZnNldFggPj0gMFxyXG4gICAgICAgICYmIGV2ZW50Lm9mZnNldFggPCB0YXJnZXQuY2xpZW50V2lkdGhcclxuICAgICAgICAmJiBldmVudC5vZmZzZXRZID49IDBcclxuICAgICAgICAmJiBldmVudC5vZmZzZXRZIDwgdGFyZ2V0LmNsaWVudEhlaWdodFxyXG4gICAgKTtcclxufVxyXG5cclxuLy8gVXNlIGNvbnN0YW50cyB0byBhdm9pZCBjb21wYXJpbmcgc3RyaW5ncyBtdWx0aXBsZSB0aW1lcy5cclxuY29uc3QgTW91c2VEb3duID0gMDtcclxuY29uc3QgTW91c2VVcCAgID0gMTtcclxuY29uc3QgTW91c2VNb3ZlID0gMjtcclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZShldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgLy8gV2luZG93cyBzdXBwcmVzc2VzIG1vdXNlIGV2ZW50cyBhdCB0aGUgZW5kIG9mIGRyYWdnaW5nIG9yIHJlc2l6aW5nLFxyXG4gICAgLy8gc28gd2UgbmVlZCB0byBiZSBzbWFydCBhbmQgc3ludGhlc2l6ZSBidXR0b24gZXZlbnRzLlxyXG5cclxuICAgIGxldCBldmVudFR5cGU6IG51bWJlciwgZXZlbnRCdXR0b25zID0gZXZlbnQuYnV0dG9ucztcclxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ21vdXNlZG93bic6XHJcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9IE1vdXNlRG93bjtcclxuICAgICAgICAgICAgaWYgKCFidXR0b25zVHJhY2tlZCkgeyBldmVudEJ1dHRvbnMgPSBidXR0b25zIHwgKDEgPDwgZXZlbnQuYnV0dG9uKTsgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdtb3VzZXVwJzpcclxuICAgICAgICAgICAgZXZlbnRUeXBlID0gTW91c2VVcDtcclxuICAgICAgICAgICAgaWYgKCFidXR0b25zVHJhY2tlZCkgeyBldmVudEJ1dHRvbnMgPSBidXR0b25zICYgfigxIDw8IGV2ZW50LmJ1dHRvbik7IH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgZXZlbnRUeXBlID0gTW91c2VNb3ZlO1xyXG4gICAgICAgICAgICBpZiAoIWJ1dHRvbnNUcmFja2VkKSB7IGV2ZW50QnV0dG9ucyA9IGJ1dHRvbnM7IH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHJlbGVhc2VkID0gYnV0dG9ucyAmIH5ldmVudEJ1dHRvbnM7XHJcbiAgICBsZXQgcHJlc3NlZCA9IGV2ZW50QnV0dG9ucyAmIH5idXR0b25zO1xyXG5cclxuICAgIGJ1dHRvbnMgPSBldmVudEJ1dHRvbnM7XHJcblxyXG4gICAgLy8gU3ludGhlc2l6ZSBhIHJlbGVhc2UtcHJlc3Mgc2VxdWVuY2UgaWYgd2UgZGV0ZWN0IGEgcHJlc3Mgb2YgYW4gYWxyZWFkeSBwcmVzc2VkIGJ1dHRvbi5cclxuICAgIGlmIChldmVudFR5cGUgPT09IE1vdXNlRG93biAmJiAhKHByZXNzZWQgJiBldmVudC5idXR0b24pKSB7XHJcbiAgICAgICAgcmVsZWFzZWQgfD0gKDEgPDwgZXZlbnQuYnV0dG9uKTtcclxuICAgICAgICBwcmVzc2VkIHw9ICgxIDw8IGV2ZW50LmJ1dHRvbik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3VwcHJlc3MgYWxsIGJ1dHRvbiBldmVudHMgZHVyaW5nIGRyYWdnaW5nIGFuZCByZXNpemluZyxcclxuICAgIC8vIHVubGVzcyB0aGlzIGlzIGEgbW91c2V1cCBldmVudCB0aGF0IGlzIGVuZGluZyBhIGRyYWcgYWN0aW9uLlxyXG4gICAgaWYgKFxyXG4gICAgICAgIGV2ZW50VHlwZSAhPT0gTW91c2VNb3ZlIC8vIEZhc3QgcGF0aCBmb3IgbW91c2Vtb3ZlXHJcbiAgICAgICAgJiYgcmVzaXppbmdcclxuICAgICAgICB8fCAoXHJcbiAgICAgICAgICAgIGRyYWdnaW5nXHJcbiAgICAgICAgICAgICYmIChcclxuICAgICAgICAgICAgICAgIGV2ZW50VHlwZSA9PT0gTW91c2VEb3duXHJcbiAgICAgICAgICAgICAgICB8fCBldmVudC5idXR0b24gIT09IDBcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIClcclxuICAgICkge1xyXG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIHJlbGVhc2VzXHJcbiAgICBpZiAocmVsZWFzZWQgJiAxKSB7IHByaW1hcnlVcChldmVudCk7IH1cclxuICAgIC8vIEhhbmRsZSBwcmVzc2VzXHJcbiAgICBpZiAocHJlc3NlZCAmIDEpIHsgcHJpbWFyeURvd24oZXZlbnQpOyB9XHJcblxyXG4gICAgLy8gSGFuZGxlIG1vdXNlbW92ZVxyXG4gICAgaWYgKGV2ZW50VHlwZSA9PT0gTW91c2VNb3ZlKSB7IG9uTW91c2VNb3ZlKGV2ZW50KTsgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJpbWFyeURvd24oZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIC8vIFJlc2V0IHJlYWRpbmVzcyBzdGF0ZS5cclxuICAgIGNhbkRyYWcgPSBmYWxzZTtcclxuICAgIGNhblJlc2l6ZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIElnbm9yZSByZXBlYXRlZCBjbGlja3Mgb24gbWFjT1MgYW5kIExpbnV4LlxyXG4gICAgaWYgKCFJc1dpbmRvd3MoKSkge1xyXG4gICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gPT09IDAgJiYgZXZlbnQuZGV0YWlsICE9PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc2l6ZUVkZ2UpIHtcclxuICAgICAgICAvLyBEbyBub3QgYXJtIGVkZ2UgcmVzaXplIGZyb20gc3ludGhlc2l6ZWQgcHJlc3NlcyBvYnNlcnZlZCBvbiBtb3ZlL3VwOlxyXG4gICAgICAgIC8vIGVudGVyaW5nIHRoZSB3aW5kb3cgd2l0aCB0aGUgcHJpbWFyeSBidXR0b24gYWxyZWFkeSBoZWxkIHNob3VsZCBub3RcclxuICAgICAgICAvLyBzdGVhbCBhbm90aGVyIGdlc3R1cmUgaW50byBhIHJlc2l6ZS5cclxuICAgICAgICBpZiAoZXZlbnQudHlwZSAhPT0gJ21vdXNlZG93bicpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVhZHkgdG8gcmVzaXplIGlmIHRoZSBwcmltYXJ5IGJ1dHRvbiB3YXMgcHJlc3NlZCBmb3IgdGhlIGZpcnN0IHRpbWUuXHJcbiAgICAgICAgY2FuUmVzaXplID0gdHJ1ZTtcclxuICAgICAgICAvLyBEbyBub3Qgc3RhcnQgZHJhZyBvcGVyYXRpb25zIHdoZW4gb24gcmVzaXplIGVkZ2VzLlxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXRyaWV2ZSB0YXJnZXQgZWxlbWVudFxyXG4gICAgLy8gUmVhZHkgdG8gZHJhZyBpZiB0aGUgcHJpbWFyeSBidXR0b24gd2FzIHByZXNzZWQgZm9yIHRoZSBmaXJzdCB0aW1lIG9uIGEgZHJhZ2dhYmxlIGVsZW1lbnQuXHJcbiAgICAvLyBJZ25vcmUgY2xpY2tzIG9uIHRoZSBzY3JvbGxiYXIuXHJcbiAgICBjYW5EcmFnID0gaXNEcmFnZ2FibGVFdmVudChldmVudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByaW1hcnlVcChldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgLy8gU3RvcCBkcmFnZ2luZyBhbmQgcmVzaXppbmcuXHJcbiAgICBjYW5EcmFnID0gZmFsc2U7XHJcbiAgICBkcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgY2FuUmVzaXplID0gZmFsc2U7XHJcbiAgICByZXNpemluZyA9IGZhbHNlO1xyXG59XHJcblxyXG5jb25zdCBjdXJzb3JGb3JFZGdlID0gT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICBcInNlLXJlc2l6ZVwiOiBcIm53c2UtcmVzaXplXCIsXHJcbiAgICBcInN3LXJlc2l6ZVwiOiBcIm5lc3ctcmVzaXplXCIsXHJcbiAgICBcIm53LXJlc2l6ZVwiOiBcIm53c2UtcmVzaXplXCIsXHJcbiAgICBcIm5lLXJlc2l6ZVwiOiBcIm5lc3ctcmVzaXplXCIsXHJcbiAgICBcInctcmVzaXplXCI6IFwiZXctcmVzaXplXCIsXHJcbiAgICBcIm4tcmVzaXplXCI6IFwibnMtcmVzaXplXCIsXHJcbiAgICBcInMtcmVzaXplXCI6IFwibnMtcmVzaXplXCIsXHJcbiAgICBcImUtcmVzaXplXCI6IFwiZXctcmVzaXplXCIsXHJcbn0pXHJcblxyXG5mdW5jdGlvbiBzZXRSZXNpemUoZWRnZT86IGtleW9mIHR5cGVvZiBjdXJzb3JGb3JFZGdlKTogdm9pZCB7XHJcbiAgICBpZiAoZWRnZSkge1xyXG4gICAgICAgIGlmICghcmVzaXplRWRnZSkgeyBkZWZhdWx0Q3Vyc29yID0gZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3I7IH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IGN1cnNvckZvckVkZ2VbZWRnZV07XHJcbiAgICB9IGVsc2UgaWYgKCFlZGdlICYmIHJlc2l6ZUVkZ2UpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IGRlZmF1bHRDdXJzb3I7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplRWRnZSA9IGVkZ2UgfHwgXCJcIjtcclxufVxyXG5cclxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmIChjYW5SZXNpemUgJiYgcmVzaXplRWRnZSkge1xyXG4gICAgICAgIC8vIFN0YXJ0IHJlc2l6aW5nLlxyXG4gICAgICAgIHJlc2l6aW5nID0gdHJ1ZTtcclxuICAgICAgICBpbnZva2UoXCJ3YWlsczpyZXNpemU6XCIgKyByZXNpemVFZGdlKTtcclxuICAgIH0gZWxzZSBpZiAoY2FuRHJhZykge1xyXG4gICAgICAgIC8vIFN0YXJ0IGRyYWdnaW5nLlxyXG4gICAgICAgIGRyYWdnaW5nID0gdHJ1ZTtcclxuICAgICAgICBpbnZva2UoXCJ3YWlsczpkcmFnXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkcmFnZ2luZyB8fCByZXNpemluZykge1xyXG4gICAgICAgIC8vIEVpdGhlciBkcmFnIG9yIHJlc2l6ZSBpcyBvbmdvaW5nLFxyXG4gICAgICAgIC8vIHJlc2V0IHJlYWRpbmVzcyBhbmQgc3RvcCBwcm9jZXNzaW5nLlxyXG4gICAgICAgIGNhbkRyYWcgPSBjYW5SZXNpemUgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyZXNpemFibGUgfHwgKCFJc1dpbmRvd3MoKSAmJiAhKElzTGludXgoKSAmJiBHZXRGbGFnKFwiZnJhbWVsZXNzXCIpKSkpIHtcclxuICAgICAgICBpZiAocmVzaXplRWRnZSkgeyBzZXRSZXNpemUoKTsgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXNpemVIYW5kbGVIZWlnaHQgPSBHZXRGbGFnKFwic3lzdGVtLnJlc2l6ZUhhbmRsZUhlaWdodFwiKSB8fCA1O1xyXG4gICAgY29uc3QgcmVzaXplSGFuZGxlV2lkdGggPSBHZXRGbGFnKFwic3lzdGVtLnJlc2l6ZUhhbmRsZVdpZHRoXCIpIHx8IDU7XHJcblxyXG4gICAgLy8gRXh0cmEgcGl4ZWxzIGZvciB0aGUgY29ybmVyIGFyZWFzLlxyXG4gICAgY29uc3QgY29ybmVyRXh0cmEgPSBHZXRGbGFnKFwicmVzaXplQ29ybmVyRXh0cmFcIikgfHwgMTA7XHJcblxyXG4gICAgLy8gV2hlbiBhIHNjcm9sbGJhciBpcyBwcmVzZW50IGF0IHRoZSB3aW5kb3cgZWRnZSBpdCBjb25zdW1lcyBtb3VzZSBldmVudHMgaW4gdGhhdCBzdHJpcC5cclxuICAgIC8vIFNoaWZ0IHRoZSBlZmZlY3RpdmUgY29udGVudCBlZGdlIGlud2FyZCBzbyB0aGUgcmVzaXplIHpvbmUgc2l0cyBqdXN0IGJlZm9yZSB0aGUgc2Nyb2xsYmFyLlxyXG4gICAgY29uc3Qgc2Nyb2xsYmFyV2lkdGggPSBNYXRoLm1heCgwLCB3aW5kb3cuaW5uZXJXaWR0aCAtIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCk7XHJcbiAgICBjb25zdCBzY3JvbGxiYXJIZWlnaHQgPSBNYXRoLm1heCgwLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcclxuICAgIGNvbnN0IHJpZ2h0Q29udGVudEVkZ2UgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIHNjcm9sbGJhcldpZHRoO1xyXG4gICAgY29uc3QgYm90dG9tQ29udGVudEVkZ2UgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBzY3JvbGxiYXJIZWlnaHQ7XHJcblxyXG4gICAgY29uc3QgcmlnaHRCb3JkZXIgPSBldmVudC5jbGllbnRYIDwgcmlnaHRDb250ZW50RWRnZSAmJiAocmlnaHRDb250ZW50RWRnZSAtIGV2ZW50LmNsaWVudFgpIDwgcmVzaXplSGFuZGxlV2lkdGg7XHJcbiAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZXZlbnQuY2xpZW50WCA8IHJlc2l6ZUhhbmRsZVdpZHRoO1xyXG4gICAgY29uc3QgdG9wQm9yZGVyID0gZXZlbnQuY2xpZW50WSA8IHJlc2l6ZUhhbmRsZUhlaWdodDtcclxuICAgIGNvbnN0IGJvdHRvbUJvcmRlciA9IGV2ZW50LmNsaWVudFkgPCBib3R0b21Db250ZW50RWRnZSAmJiAoYm90dG9tQ29udGVudEVkZ2UgLSBldmVudC5jbGllbnRZKSA8IHJlc2l6ZUhhbmRsZUhlaWdodDtcclxuXHJcbiAgICAvLyBBZGp1c3QgZm9yIGNvcm5lciBhcmVhcy5cclxuICAgIGNvbnN0IHJpZ2h0Q29ybmVyID0gZXZlbnQuY2xpZW50WCA8IHJpZ2h0Q29udGVudEVkZ2UgJiYgKHJpZ2h0Q29udGVudEVkZ2UgLSBldmVudC5jbGllbnRYKSA8IChyZXNpemVIYW5kbGVXaWR0aCArIGNvcm5lckV4dHJhKTtcclxuICAgIGNvbnN0IGxlZnRDb3JuZXIgPSBldmVudC5jbGllbnRYIDwgKHJlc2l6ZUhhbmRsZVdpZHRoICsgY29ybmVyRXh0cmEpO1xyXG4gICAgY29uc3QgdG9wQ29ybmVyID0gZXZlbnQuY2xpZW50WSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XHJcbiAgICBjb25zdCBib3R0b21Db3JuZXIgPSBldmVudC5jbGllbnRZIDwgYm90dG9tQ29udGVudEVkZ2UgJiYgKGJvdHRvbUNvbnRlbnRFZGdlIC0gZXZlbnQuY2xpZW50WSkgPCAocmVzaXplSGFuZGxlSGVpZ2h0ICsgY29ybmVyRXh0cmEpO1xyXG5cclxuICAgIGlmICghbGVmdENvcm5lciAmJiAhdG9wQ29ybmVyICYmICFib3R0b21Db3JuZXIgJiYgIXJpZ2h0Q29ybmVyKSB7XHJcbiAgICAgICAgLy8gT3B0aW1pc2F0aW9uOiBvdXQgb2YgYWxsIGNvcm5lciBhcmVhcyBpbXBsaWVzIG91dCBvZiBib3JkZXJzLlxyXG4gICAgICAgIHNldFJlc2l6ZSgpO1xyXG4gICAgfVxyXG4gICAgLy8gRGV0ZWN0IGNvcm5lcnMuXHJcbiAgICBlbHNlIGlmIChyaWdodENvcm5lciAmJiBib3R0b21Db3JuZXIpIHNldFJlc2l6ZShcInNlLXJlc2l6ZVwiKTtcclxuICAgIGVsc2UgaWYgKGxlZnRDb3JuZXIgJiYgYm90dG9tQ29ybmVyKSBzZXRSZXNpemUoXCJzdy1yZXNpemVcIik7XHJcbiAgICBlbHNlIGlmIChsZWZ0Q29ybmVyICYmIHRvcENvcm5lcikgc2V0UmVzaXplKFwibnctcmVzaXplXCIpO1xyXG4gICAgZWxzZSBpZiAodG9wQ29ybmVyICYmIHJpZ2h0Q29ybmVyKSBzZXRSZXNpemUoXCJuZS1yZXNpemVcIik7XHJcbiAgICAvLyBEZXRlY3QgYm9yZGVycy5cclxuICAgIGVsc2UgaWYgKGxlZnRCb3JkZXIpIHNldFJlc2l6ZShcInctcmVzaXplXCIpO1xyXG4gICAgZWxzZSBpZiAodG9wQm9yZGVyKSBzZXRSZXNpemUoXCJuLXJlc2l6ZVwiKTtcclxuICAgIGVsc2UgaWYgKGJvdHRvbUJvcmRlcikgc2V0UmVzaXplKFwicy1yZXNpemVcIik7XHJcbiAgICBlbHNlIGlmIChyaWdodEJvcmRlcikgc2V0UmVzaXplKFwiZS1yZXNpemVcIik7XHJcbiAgICAvLyBPdXQgb2YgYm9yZGVyIGFyZWEuXHJcbiAgICBlbHNlIHNldFJlc2l6ZSgpO1xyXG59XHJcbiIsICIvKlxyXG4gXyAgICAgX18gICAgXyBfX1xyXG58IHwgICAvIC9fX18oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuaW1wb3J0IHsgaW52b2tlIH0gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XHJcbmltcG9ydCB7IHdoZW5SZWFkeSB9IGZyb20gXCIuL3V0aWxzLmpzXCI7XHJcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XHJcblxyXG50eXBlIE5vbkNsaWVudFJlZ2lvbktpbmQgPSBcImNhcHRpb25cIiB8IFwibWluaW1pemVcIiB8IFwibWF4aW1pemVcIiB8IFwiY2xvc2VcIjtcclxuXHJcbmludGVyZmFjZSBOb25DbGllbnRSZWdpb24ge1xyXG4gICAga2luZDogTm9uQ2xpZW50UmVnaW9uS2luZDtcclxuICAgIGxlZnQ6IG51bWJlcjtcclxuICAgIHRvcDogbnVtYmVyO1xyXG4gICAgcmlnaHQ6IG51bWJlcjtcclxuICAgIGJvdHRvbTogbnVtYmVyO1xyXG59XHJcblxyXG4vKlxyXG4tLXdhaWxzLW5vbi1jbGllbnQtcmVnaW9uOiBjYXB0aW9uOyAgbWFya3MgYW4gYXJlYSB0aGF0IGNhbiBkcmFnIHRoZSB3aW5kb3dcclxuLS13YWlscy1ub24tY2xpZW50LXJlZ2lvbjogbWluaW1pemU7IG1hcmtzIGEgY3VzdG9tIG1pbmltaXplIGJ1dHRvblxyXG4tLXdhaWxzLW5vbi1jbGllbnQtcmVnaW9uOiBtYXhpbWl6ZTsgbWFya3MgYSBjdXN0b20gbWF4aW1pemUgYnV0dG9uXHJcbi0td2FpbHMtbm9uLWNsaWVudC1yZWdpb246IGNsb3NlOyAgICBtYXJrcyBhIGN1c3RvbSBjbG9zZSBidXR0b25cclxuKi9cclxuY29uc3QgcmVnaW9uUHJvcGVydHkgPSBcIi0td2FpbHMtbm9uLWNsaWVudC1yZWdpb25cIjtcclxuY29uc3QgcnVudGltZUNvbmZpZ1JlYWR5RXZlbnQgPSBcIndhaWxzOnJ1bnRpbWUtY29uZmlnLXJlYWR5XCI7XHJcbmNvbnN0IHZhbGlkUmVnaW9ucyA9IG5ldyBTZXQ8Tm9uQ2xpZW50UmVnaW9uS2luZD4oW1wiY2FwdGlvblwiLCBcIm1pbmltaXplXCIsIFwibWF4aW1pemVcIiwgXCJjbG9zZVwiXSk7XHJcblxyXG4vLyBTZXR1cFxyXG5pZiAoaGFzRE9NKSB7XHJcbiAgICB3aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcclxufVxyXG5cclxubGV0IHVwZGF0ZVBlbmRpbmcgPSBmYWxzZTtcclxubGV0IGxhc3RQYXlsb2FkID0gXCJcIjtcclxubGV0IG9ic2VydmVkRWxlbWVudHMgPSBuZXcgU2V0PEVsZW1lbnQ+KCk7XHJcbmxldCByZXNpemVPYnNlcnZlcjogUmVzaXplT2JzZXJ2ZXIgfCB1bmRlZmluZWQ7XHJcbmxldCB0cmFja2luZ1N0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGlzZVJlZ2lvbktpbmQodmFsdWU6IHN0cmluZyk6IE5vbkNsaWVudFJlZ2lvbktpbmQgfCB1bmRlZmluZWQge1xyXG4gICAgY29uc3QgcmVnaW9uID0gdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAodmFsaWRSZWdpb25zLmhhcyhyZWdpb24gYXMgTm9uQ2xpZW50UmVnaW9uS2luZCkpIHtcclxuICAgICAgICByZXR1cm4gcmVnaW9uIGFzIE5vbkNsaWVudFJlZ2lvbktpbmQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBub25DbGllbnRSZWdpb25Gb3JFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiBOb25DbGllbnRSZWdpb25LaW5kIHwgdW5kZWZpbmVkIHtcclxuICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XHJcbiAgICBjb25zdCByZWdpb24gPSBub3JtYWxpc2VSZWdpb25LaW5kKHN0eWxlLmdldFByb3BlcnR5VmFsdWUocmVnaW9uUHJvcGVydHkpKTtcclxuICAgIGlmICghcmVnaW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwYXJlbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgY29uc3QgcGFyZW50U3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShwYXJlbnQpO1xyXG4gICAgICAgIC8vIFRoZSBDU1MgcHJvcGVydHkgaXMgaW5oZXJpdGVkLiBPbmx5IHJlcG9ydCB0aGUgb3V0ZXJtb3N0IGVsZW1lbnQgZm9yXHJcbiAgICAgICAgLy8gZWFjaCBjb250aWd1b3VzIHJlZ2lvbiBzbyBuYXRpdmUgaGl0IHRlc3Rpbmcgc2VlcyBzdGFibGUgcmVjdGFuZ2xlcy5cclxuICAgICAgICBpZiAobm9ybWFsaXNlUmVnaW9uS2luZChwYXJlbnRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHJlZ2lvblByb3BlcnR5KSkgPT09IHJlZ2lvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVnaW9uO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1Zpc2libGUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XHJcbiAgICByZXR1cm4gc3R5bGUuZGlzcGxheSAhPT0gXCJub25lXCIgJiZcclxuICAgICAgICBzdHlsZS52aXNpYmlsaXR5ICE9PSBcImhpZGRlblwiICYmXHJcbiAgICAgICAgc3R5bGUuY29udGVudFZpc2liaWxpdHkgIT09IFwiaGlkZGVuXCI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVsZW1lbnRSZWdpb24oZWxlbWVudDogRWxlbWVudCk6IE5vbkNsaWVudFJlZ2lvbiB8IHVuZGVmaW5lZCB7XHJcbiAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBraW5kID0gbm9uQ2xpZW50UmVnaW9uRm9yRWxlbWVudChlbGVtZW50KTtcclxuICAgIGlmICgha2luZCB8fCAhaXNWaXNpYmxlKGVsZW1lbnQpKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIGlmIChyZWN0LndpZHRoIDw9IDAgfHwgcmVjdC5oZWlnaHQgPD0gMCkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTmF0aXZlIGhpdCB0ZXN0aW5nIHJ1bnMgaW4gcGh5c2ljYWwgcGl4ZWxzLCB3aGlsZSBET00gZ2VvbWV0cnkgaXMgaW4gQ1NTIHBpeGVscy5cclxuICAgIGNvbnN0IHNjYWxlID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcclxuICAgIGNvbnN0IGxlZnQgPSBNYXRoLmZsb29yKHJlY3QubGVmdCAqIHNjYWxlKTtcclxuICAgIGNvbnN0IHRvcCA9IE1hdGguZmxvb3IocmVjdC50b3AgKiBzY2FsZSk7XHJcbiAgICBjb25zdCByaWdodCA9IE1hdGguY2VpbChyZWN0LnJpZ2h0ICogc2NhbGUpO1xyXG4gICAgY29uc3QgYm90dG9tID0gTWF0aC5jZWlsKHJlY3QuYm90dG9tICogc2NhbGUpO1xyXG5cclxuICAgIGlmIChyaWdodCA8PSBsZWZ0IHx8IGJvdHRvbSA8PSB0b3ApIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7IGtpbmQsIGxlZnQsIHRvcCwgcmlnaHQsIGJvdHRvbSB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWdpb25FbGVtZW50cygpOiBFbGVtZW50W10ge1xyXG4gICAgY29uc3QgZWxlbWVudHM6IEVsZW1lbnRbXSA9IFtdO1xyXG5cclxuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcclxuICAgICAgICBlbGVtZW50cy5wdXNoKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XHJcbiAgICB9XHJcbiAgICBpZiAoZG9jdW1lbnQuYm9keSkge1xyXG4gICAgICAgIGVsZW1lbnRzLnB1c2goZG9jdW1lbnQuYm9keSk7XHJcbiAgICAgICAgLy8gQXBwZW5kIHZpYSBhIGxvb3A6IHNwcmVhZGluZyBhIGh1Z2UgTm9kZUxpc3QgaW50byBwdXNoKCkgb3ZlcmZsb3dzXHJcbiAgICAgICAgLy8gdGhlIGVuZ2luZSdzIGFyZ3VtZW50IGxpbWl0IG9uIHZlcnkgbGFyZ2UgZG9jdW1lbnRzLlxyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlbGVtZW50cztcclxufVxyXG5cclxuZnVuY3Rpb24gb2JzZXJ2ZVJlZ2lvbkVsZW1lbnRzKGVsZW1lbnRzOiBFbGVtZW50W10pOiB2b2lkIHtcclxuICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVHJhY2sgc2l6ZSBjaGFuZ2VzIG9ubHkgZm9yIGFjdGl2ZSByZWdpb24gZWxlbWVudHMuIERPTSBzdHJ1Y3R1cmUgYW5kIHN0eWxlXHJcbiAgICAvLyBjaGFuZ2VzIGFyZSBjb3ZlcmVkIGJ5IE11dGF0aW9uT2JzZXJ2ZXIgaW4gc3RhcnROb25DbGllbnRSZWdpb25UcmFja2luZygpLlxyXG4gICAgcmVzaXplT2JzZXJ2ZXIgPz89IG5ldyBSZXNpemVPYnNlcnZlcihzY2hlZHVsZVVwZGF0ZSk7XHJcbiAgICBjb25zdCBuZXh0RWxlbWVudHMgPSBuZXcgU2V0KGVsZW1lbnRzKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygb2JzZXJ2ZWRFbGVtZW50cykge1xyXG4gICAgICAgIGlmICghbmV4dEVsZW1lbnRzLmhhcyhlbGVtZW50KSkge1xyXG4gICAgICAgICAgICByZXNpemVPYnNlcnZlci51bm9ic2VydmUoZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBuZXh0RWxlbWVudHMpIHtcclxuICAgICAgICBpZiAoIW9ic2VydmVkRWxlbWVudHMuaGFzKGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUoZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9ic2VydmVkRWxlbWVudHMgPSBuZXh0RWxlbWVudHM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZU5vbkNsaWVudFJlZ2lvbnMoKTogdm9pZCB7XHJcbiAgICB1cGRhdGVQZW5kaW5nID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3QgZWxlbWVudHMgPSByZWdpb25FbGVtZW50cygpO1xyXG4gICAgY29uc3QgcmVnaW9uczogTm9uQ2xpZW50UmVnaW9uW10gPSBbXTtcclxuICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnRzOiBFbGVtZW50W10gPSBbXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICBjb25zdCByZWdpb24gPSBlbGVtZW50UmVnaW9uKGVsZW1lbnQpO1xyXG4gICAgICAgIGlmIChyZWdpb24pIHtcclxuICAgICAgICAgICAgcmVnaW9ucy5wdXNoKHJlZ2lvbik7XHJcbiAgICAgICAgICAgIGFjdGl2ZUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9ic2VydmVSZWdpb25FbGVtZW50cyhhY3RpdmVFbGVtZW50cyk7XHJcblxyXG4gICAgY29uc3QgcGF5bG9hZCA9IEpTT04uc3RyaW5naWZ5KHsgdmVyc2lvbjogMSwgcmVnaW9ucyB9KTtcclxuICAgIGlmIChwYXlsb2FkID09PSBsYXN0UGF5bG9hZCkge1xyXG4gICAgICAgIC8vIEF2b2lkIHNlbmRpbmcgZHVwbGljYXRlIG5hdGl2ZSBtZXNzYWdlcyBkdXJpbmcgcmVzaXplIG9yIHN0eWxlIGNodXJuLlxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsYXN0UGF5bG9hZCA9IHBheWxvYWQ7XHJcbiAgICBpbnZva2UoXCJ3YWlsczpub24tY2xpZW50LXJlZ2lvbjpcIiArIHBheWxvYWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzY2hlZHVsZVVwZGF0ZSgpOiB2b2lkIHtcclxuICAgIGlmICh1cGRhdGVQZW5kaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJhdGNoIHJlZ2lvbiB1cGRhdGVzIHRvIGFuaW1hdGlvbiBmcmFtZXMgc28gbGF5b3V0IGlzIG1lYXN1cmVkIG9uY2UgcGVyIGZyYW1lLlxyXG4gICAgdXBkYXRlUGVuZGluZyA9IHRydWU7XHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZU5vbkNsaWVudFJlZ2lvbnMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdGFydE5vbkNsaWVudFJlZ2lvblRyYWNraW5nKCk6IHZvaWQge1xyXG4gICAgaWYgKHRyYWNraW5nU3RhcnRlZCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0cmFja2luZ1N0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgLy8gU2VuZCBhbiBpbml0aWFsIGVtcHR5IG9yIHBvcHVsYXRlZCByZWdpb24gbGlzdCBvbmNlIHRoZSBET00gaXMgcmVhZHkuXHJcbiAgICBzY2hlZHVsZVVwZGF0ZSgpO1xyXG5cclxuICAgIGNvbnN0IG11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihzY2hlZHVsZVVwZGF0ZSk7XHJcbiAgICBtdXRhdGlvbk9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7XHJcbiAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcclxuICAgICAgICBjaGlsZExpc3Q6IHRydWUsXHJcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHNjaGVkdWxlVXBkYXRlKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHNjaGVkdWxlVXBkYXRlLCB0cnVlKTtcclxuICAgIHdpbmRvdy52aXN1YWxWaWV3cG9ydD8uYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBzY2hlZHVsZVVwZGF0ZSk7XHJcbiAgICB3aW5kb3cudmlzdWFsVmlld3BvcnQ/LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgc2NoZWR1bGVVcGRhdGUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cnlTdGFydE5vbkNsaWVudFJlZ2lvblRyYWNraW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qgb3MgPSB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Py5PUztcclxuICAgIGlmIChvcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGVuYWJsZWQgPSB3aW5kb3cuX3dhaWxzLmZsYWdzPy5ub25DbGllbnRSZWdpb25UcmFja2luZztcclxuICAgIGlmIChvcyA9PT0gXCJ3aW5kb3dzXCIpIHtcclxuICAgICAgICBpZiAoZW5hYmxlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB3aGVuUmVhZHkoc3RhcnROb25DbGllbnRSZWdpb25UcmFja2luZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5pZiAoaGFzRE9NICYmICF0cnlTdGFydE5vbkNsaWVudFJlZ2lvblRyYWNraW5nKCkpIHtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKHJ1bnRpbWVDb25maWdSZWFkeUV2ZW50LCB0cnlTdGFydE5vbkNsaWVudFJlZ2lvblRyYWNraW5nLCB7IG9uY2U6IHRydWUgfSk7XHJcbn1cclxuIiwgIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xyXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5BcHBsaWNhdGlvbik7XHJcblxyXG5jb25zdCBIaWRlTWV0aG9kID0gMDtcclxuY29uc3QgU2hvd01ldGhvZCA9IDE7XHJcbmNvbnN0IFF1aXRNZXRob2QgPSAyO1xyXG5cclxuLyoqXHJcbiAqIEhpZGVzIGEgY2VydGFpbiBtZXRob2QgYnkgY2FsbGluZyB0aGUgSGlkZU1ldGhvZCBmdW5jdGlvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBIaWRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIGNhbGwoSGlkZU1ldGhvZCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxscyB0aGUgU2hvd01ldGhvZCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFNob3coKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gY2FsbChTaG93TWV0aG9kKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGxzIHRoZSBRdWl0TWV0aG9kIHRvIHRlcm1pbmF0ZSB0aGUgcHJvZ3JhbS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBRdWl0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIGNhbGwoUXVpdE1ldGhvZCk7XHJcbn1cclxuIiwgIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbmltcG9ydCB7IENhbmNlbGxhYmxlUHJvbWlzZSwgdHlwZSBDYW5jZWxsYWJsZVByb21pc2VXaXRoUmVzb2x2ZXJzIH0gZnJvbSBcIi4vY2FuY2VsbGFibGUuanNcIjtcclxuaW1wb3J0IHsgbmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXMgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XHJcbmltcG9ydCB7IG5hbm9pZCB9IGZyb20gXCIuL25hbm9pZC5qc1wiO1xyXG5cclxuLy8gU2V0dXBcclxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcclxuXHJcbmlmIChoYXNET00pIHtcclxuICAgIHdpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xyXG59XHJcblxyXG50eXBlIFByb21pc2VSZXNvbHZlcnMgPSBPbWl0PENhbmNlbGxhYmxlUHJvbWlzZVdpdGhSZXNvbHZlcnM8YW55PiwgXCJwcm9taXNlXCIgfCBcIm9uY2FuY2VsbGVkXCI+XHJcblxyXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5DYWxsKTtcclxuY29uc3QgY2FuY2VsQ2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQ2FuY2VsQ2FsbCk7XHJcbmNvbnN0IGNhbGxSZXNwb25zZXMgPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZVJlc29sdmVycz4oKTtcclxuXHJcbmNvbnN0IENhbGxCaW5kaW5nID0gMDtcclxuY29uc3QgQ2FuY2VsTWV0aG9kID0gMFxyXG5cclxuLyoqXHJcbiAqIEhvbGRzIGFsbCByZXF1aXJlZCBpbmZvcm1hdGlvbiBmb3IgYSBiaW5kaW5nIGNhbGwuXHJcbiAqIE1heSBwcm92aWRlIGVpdGhlciBhIG1ldGhvZCBJRCBvciBhIG1ldGhvZCBuYW1lLCBidXQgbm90IGJvdGguXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBDYWxsT3B0aW9ucyA9IHtcclxuICAgIC8qKiBUaGUgbnVtZXJpYyBJRCBvZiB0aGUgYm91bmQgbWV0aG9kIHRvIGNhbGwuICovXHJcbiAgICBtZXRob2RJRDogbnVtYmVyO1xyXG4gICAgLyoqIFRoZSBmdWxseSBxdWFsaWZpZWQgbmFtZSBvZiB0aGUgYm91bmQgbWV0aG9kIHRvIGNhbGwuICovXHJcbiAgICBtZXRob2ROYW1lPzogbmV2ZXI7XHJcbiAgICAvKiogQXJndW1lbnRzIHRvIGJlIHBhc3NlZCBpbnRvIHRoZSBib3VuZCBtZXRob2QuICovXHJcbiAgICBhcmdzOiBhbnlbXTtcclxufSB8IHtcclxuICAgIC8qKiBUaGUgbnVtZXJpYyBJRCBvZiB0aGUgYm91bmQgbWV0aG9kIHRvIGNhbGwuICovXHJcbiAgICBtZXRob2RJRD86IG5ldmVyO1xyXG4gICAgLyoqIFRoZSBmdWxseSBxdWFsaWZpZWQgbmFtZSBvZiB0aGUgYm91bmQgbWV0aG9kIHRvIGNhbGwuICovXHJcbiAgICBtZXRob2ROYW1lOiBzdHJpbmc7XHJcbiAgICAvKiogQXJndW1lbnRzIHRvIGJlIHBhc3NlZCBpbnRvIHRoZSBib3VuZCBtZXRob2QuICovXHJcbiAgICBhcmdzOiBhbnlbXTtcclxufTtcclxuXHJcbi8vIHJ1bnRpbWUuanMgbmVlZHMgdG8gdXNlIFJ1bnRpbWVFcnJvciBpbnRlcm5hbGx5IHRvIHByb3Blcmx5IHBhcnNlIGFuZCByZXR1cm5cclxuLy8gZXJyb3JzIGZvciBiaW5kaW5nIGNhbGxzLCBzbyBpdCBoYWQgdG8gbW92ZSB0aGVyZS4gRXhwb3J0aW5nIGhlcmUgYWdhaW4gdG9cclxuLy8ga2VlcCBmcm9tIGJyZWFraW5nIHRoZSBwdWJsaWMgQ2FsbCBpbnRlcmZhY2UuXHJcbmV4cG9ydCB7IFJ1bnRpbWVFcnJvciB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSB1bmlxdWUgSUQgdXNpbmcgdGhlIG5hbm9pZCBsaWJyYXJ5LlxyXG4gKlxyXG4gKiBAcmV0dXJucyBBIHVuaXF1ZSBJRCB0aGF0IGRvZXMgbm90IGV4aXN0IGluIHRoZSBjYWxsUmVzcG9uc2VzIHNldC5cclxuICovXHJcbmZ1bmN0aW9uIGdlbmVyYXRlSUQoKTogc3RyaW5nIHtcclxuICAgIGxldCByZXN1bHQ7XHJcbiAgICBkbyB7XHJcbiAgICAgICAgcmVzdWx0ID0gbmFub2lkKCk7XHJcbiAgICB9IHdoaWxlIChjYWxsUmVzcG9uc2VzLmhhcyhyZXN1bHQpKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxsIGEgYm91bmQgbWV0aG9kIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gY2FsbCBvcHRpb25zLlxyXG4gKlxyXG4gKiBJbiBjYXNlIG9mIGZhaWx1cmUsIHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgcmVqZWN0IHdpdGggYW4gZXhjZXB0aW9uXHJcbiAqIGFtb25nIFJlZmVyZW5jZUVycm9yICh1bmtub3duIG1ldGhvZCksIFR5cGVFcnJvciAod3JvbmcgYXJndW1lbnQgY291bnQgb3IgdHlwZSksXHJcbiAqIHtAbGluayBSdW50aW1lRXJyb3J9IChtZXRob2QgcmV0dXJuZWQgYW4gZXJyb3IpLCBvciBvdGhlciAobmV0d29yayBvciBpbnRlcm5hbCBlcnJvcnMpLlxyXG4gKiBUaGUgZXhjZXB0aW9uIG1pZ2h0IGhhdmUgYSBcImNhdXNlXCIgZmllbGQgd2l0aCB0aGUgdmFsdWUgcmV0dXJuZWRcclxuICogYnkgdGhlIGFwcGxpY2F0aW9uLSBvciBzZXJ2aWNlLWxldmVsIGVycm9yIG1hcnNoYWxpbmcgZnVuY3Rpb25zLlxyXG4gKlxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIEEgbWV0aG9kIGNhbGwgZGVzY3JpcHRvci5cclxuICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgY2FsbC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBDYWxsKG9wdGlvbnM6IENhbGxPcHRpb25zKTogQ2FuY2VsbGFibGVQcm9taXNlPGFueT4ge1xyXG4gICAgY29uc3QgaWQgPSBnZW5lcmF0ZUlEKCk7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gQ2FuY2VsbGFibGVQcm9taXNlLndpdGhSZXNvbHZlcnM8YW55PigpO1xyXG4gICAgY2FsbFJlc3BvbnNlcy5zZXQoaWQsIHsgcmVzb2x2ZTogcmVzdWx0LnJlc29sdmUsIHJlamVjdDogcmVzdWx0LnJlamVjdCB9KTtcclxuXHJcbiAgICBjb25zdCByZXF1ZXN0ID0gY2FsbChDYWxsQmluZGluZywgT2JqZWN0LmFzc2lnbih7IFwiY2FsbC1pZFwiOiBpZCB9LCBvcHRpb25zKSk7XHJcbiAgICBsZXQgcnVubmluZyA9IHRydWU7XHJcblxyXG4gICAgcmVxdWVzdC50aGVuKChyZXMpID0+IHtcclxuICAgICAgICBydW5uaW5nID0gZmFsc2U7XHJcbiAgICAgICAgY2FsbFJlc3BvbnNlcy5kZWxldGUoaWQpO1xyXG4gICAgICAgIHJlc3VsdC5yZXNvbHZlKHJlcyk7XHJcbiAgICB9LCAoZXJyKSA9PiB7XHJcbiAgICAgICAgcnVubmluZyA9IGZhbHNlO1xyXG4gICAgICAgIGNhbGxSZXNwb25zZXMuZGVsZXRlKGlkKTtcclxuICAgICAgICByZXN1bHQucmVqZWN0KGVycik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBjYW5jZWwgPSAoKSA9PiB7XHJcbiAgICAgICAgY2FsbFJlc3BvbnNlcy5kZWxldGUoaWQpO1xyXG4gICAgICAgIHJldHVybiBjYW5jZWxDYWxsKENhbmNlbE1ldGhvZCwge1wiY2FsbC1pZFwiOiBpZH0pLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoaWxlIHJlcXVlc3RpbmcgYmluZGluZyBjYWxsIGNhbmNlbGxhdGlvbjpcIiwgZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcmVzdWx0Lm9uY2FuY2VsbGVkID0gKCkgPT4ge1xyXG4gICAgICAgIGlmIChydW5uaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjYW5jZWwoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdC50aGVuKGNhbmNlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0LnByb21pc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxscyBhIGJvdW5kIG1ldGhvZCBieSBuYW1lIHdpdGggdGhlIHNwZWNpZmllZCBhcmd1bWVudHMuXHJcbiAqIFNlZSB7QGxpbmsgQ2FsbH0gZm9yIGRldGFpbHMuXHJcbiAqXHJcbiAqIEBwYXJhbSBtZXRob2ROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCBpbiB0aGUgZm9ybWF0ICdwYWNrYWdlLnN0cnVjdC5tZXRob2QnLlxyXG4gKiBAcGFyYW0gYXJncyAtIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kLlxyXG4gKiBAcmV0dXJucyBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgY2FsbC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBCeU5hbWUobWV0aG9kTmFtZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IENhbmNlbGxhYmxlUHJvbWlzZTxhbnk+IHtcclxuICAgIHJldHVybiBDYWxsKHsgbWV0aG9kTmFtZSwgYXJncyB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGxzIGEgbWV0aG9kIGJ5IGl0cyBudW1lcmljIElEIHdpdGggdGhlIHNwZWNpZmllZCBhcmd1bWVudHMuXHJcbiAqIFNlZSB7QGxpbmsgQ2FsbH0gZm9yIGRldGFpbHMuXHJcbiAqXHJcbiAqIEBwYXJhbSBtZXRob2RJRCAtIFRoZSBJRCBvZiB0aGUgbWV0aG9kIHRvIGNhbGwuXHJcbiAqIEBwYXJhbSBhcmdzIC0gVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2QuXHJcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGNhbGwuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gQnlJRChtZXRob2RJRDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IENhbmNlbGxhYmxlUHJvbWlzZTxhbnk+IHtcclxuICAgIHJldHVybiBDYWxsKHsgbWV0aG9kSUQsIGFyZ3MgfSk7XHJcbn1cclxuIiwgIi8vIFNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL2luc3BlY3QtanMvaXMtY2FsbGFibGVcclxuXHJcbi8vIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4vL1xyXG4vLyBDb3B5cmlnaHQgKGMpIDIwMTUgSm9yZGFuIEhhcmJhbmRcclxuLy9cclxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuLy9cclxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbi8vIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbi8vXHJcbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbi8vIFNPRlRXQVJFLlxyXG5cclxudmFyIGZuVG9TdHIgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XHJcbnZhciByZWZsZWN0QXBwbHk6IHR5cGVvZiBSZWZsZWN0LmFwcGx5IHwgZmFsc2UgfCBudWxsID0gdHlwZW9mIFJlZmxlY3QgPT09ICdvYmplY3QnICYmIFJlZmxlY3QgIT09IG51bGwgJiYgUmVmbGVjdC5hcHBseTtcclxudmFyIGJhZEFycmF5TGlrZTogYW55O1xyXG52YXIgaXNDYWxsYWJsZU1hcmtlcjogYW55O1xyXG5pZiAodHlwZW9mIHJlZmxlY3RBcHBseSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgT2JqZWN0LmRlZmluZVByb3BlcnR5ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGJhZEFycmF5TGlrZSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2xlbmd0aCcsIHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBpc0NhbGxhYmxlTWFya2VyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaXNDYWxsYWJsZU1hcmtlciA9IHt9O1xyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10aHJvdy1saXRlcmFsXHJcbiAgICAgICAgcmVmbGVjdEFwcGx5KGZ1bmN0aW9uICgpIHsgdGhyb3cgNDI7IH0sIG51bGwsIGJhZEFycmF5TGlrZSk7XHJcbiAgICB9IGNhdGNoIChfKSB7XHJcbiAgICAgICAgaWYgKF8gIT09IGlzQ2FsbGFibGVNYXJrZXIpIHtcclxuICAgICAgICAgICAgcmVmbGVjdEFwcGx5ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gZWxzZSB7XHJcbiAgICByZWZsZWN0QXBwbHkgPSBudWxsO1xyXG59XHJcblxyXG52YXIgY29uc3RydWN0b3JSZWdleCA9IC9eXFxzKmNsYXNzXFxiLztcclxudmFyIGlzRVM2Q2xhc3NGbiA9IGZ1bmN0aW9uIGlzRVM2Q2xhc3NGdW5jdGlvbih2YWx1ZTogYW55KTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHZhciBmblN0ciA9IGZuVG9TdHIuY2FsbCh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yUmVnZXgudGVzdChmblN0cik7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBub3QgYSBmdW5jdGlvblxyXG4gICAgfVxyXG59O1xyXG5cclxudmFyIHRyeUZ1bmN0aW9uT2JqZWN0ID0gZnVuY3Rpb24gdHJ5RnVuY3Rpb25Ub1N0cih2YWx1ZTogYW55KTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGlmIChpc0VTNkNsYXNzRm4odmFsdWUpKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICAgIGZuVG9TdHIuY2FsbCh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xyXG52YXIgb2JqZWN0Q2xhc3MgPSAnW29iamVjdCBPYmplY3RdJztcclxudmFyIGZuQ2xhc3MgPSAnW29iamVjdCBGdW5jdGlvbl0nO1xyXG52YXIgZ2VuQ2xhc3MgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nO1xyXG52YXIgZGRhQ2xhc3MgPSAnW29iamVjdCBIVE1MQWxsQ29sbGVjdGlvbl0nOyAvLyBJRSAxMVxyXG52YXIgZGRhQ2xhc3MyID0gJ1tvYmplY3QgSFRNTCBkb2N1bWVudC5hbGwgY2xhc3NdJztcclxudmFyIGRkYUNsYXNzMyA9ICdbb2JqZWN0IEhUTUxDb2xsZWN0aW9uXSc7IC8vIElFIDktMTBcclxudmFyIGhhc1RvU3RyaW5nVGFnID0gdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiAhIVN5bWJvbC50b1N0cmluZ1RhZzsgLy8gYmV0dGVyOiB1c2UgYGhhcy10b3N0cmluZ3RhZ2BcclxuXHJcbnZhciBpc0lFNjggPSAhKDAgaW4gWyxdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zcGFyc2UtYXJyYXlzLCBjb21tYS1zcGFjaW5nXHJcblxyXG52YXIgaXNEREE6ICh2YWx1ZTogYW55KSA9PiBib29sZWFuID0gZnVuY3Rpb24gaXNEb2N1bWVudERvdEFsbCgpIHsgcmV0dXJuIGZhbHNlOyB9O1xyXG5pZiAodHlwZW9mIGRvY3VtZW50ID09PSAnb2JqZWN0Jykge1xyXG4gICAgLy8gRmlyZWZveCAzIGNhbm9uaWNhbGl6ZXMgRERBIHRvIHVuZGVmaW5lZCB3aGVuIGl0J3Mgbm90IGFjY2Vzc2VkIGRpcmVjdGx5XHJcbiAgICB2YXIgYWxsID0gZG9jdW1lbnQuYWxsO1xyXG4gICAgaWYgKHRvU3RyLmNhbGwoYWxsKSA9PT0gdG9TdHIuY2FsbChkb2N1bWVudC5hbGwpKSB7XHJcbiAgICAgICAgaXNEREEgPSBmdW5jdGlvbiBpc0RvY3VtZW50RG90QWxsKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8qIGdsb2JhbHMgZG9jdW1lbnQ6IGZhbHNlICovXHJcbiAgICAgICAgICAgIC8vIGluIElFIDYtOCwgdHlwZW9mIGRvY3VtZW50LmFsbCBpcyBcIm9iamVjdFwiIGFuZCBpdCdzIHRydXRoeVxyXG4gICAgICAgICAgICBpZiAoKGlzSUU2OCB8fCAhdmFsdWUpICYmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHIgPSB0b1N0ci5jYWxsKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgPT09IGRkYUNsYXNzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IHN0ciA9PT0gZGRhQ2xhc3MyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IHN0ciA9PT0gZGRhQ2xhc3MzIC8vIG9wZXJhIDEyLjE2XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IHN0ciA9PT0gb2JqZWN0Q2xhc3MgLy8gSUUgNi04XHJcbiAgICAgICAgICAgICAgICAgICAgKSAmJiB2YWx1ZSgnJykgPT0gbnVsbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgLyoqLyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQ2FsbGFibGVSZWZBcHBseTxUPih2YWx1ZTogVCB8IHVua25vd24pOiB2YWx1ZSBpcyAoLi4uYXJnczogYW55W10pID0+IGFueSAge1xyXG4gICAgaWYgKGlzRERBKHZhbHVlKSkgeyByZXR1cm4gdHJ1ZTsgfVxyXG4gICAgaWYgKCF2YWx1ZSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JykgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgKHJlZmxlY3RBcHBseSBhcyBhbnkpKHZhbHVlLCBudWxsLCBiYWRBcnJheUxpa2UpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGlmIChlICE9PSBpc0NhbGxhYmxlTWFya2VyKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuICFpc0VTNkNsYXNzRm4odmFsdWUpICYmIHRyeUZ1bmN0aW9uT2JqZWN0KHZhbHVlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNDYWxsYWJsZU5vUmVmQXBwbHk8VD4odmFsdWU6IFQgfCB1bmtub3duKTogdmFsdWUgaXMgKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkge1xyXG4gICAgaWYgKGlzRERBKHZhbHVlKSkgeyByZXR1cm4gdHJ1ZTsgfVxyXG4gICAgaWYgKCF2YWx1ZSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JykgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgIGlmIChoYXNUb1N0cmluZ1RhZykgeyByZXR1cm4gdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpOyB9XHJcbiAgICBpZiAoaXNFUzZDbGFzc0ZuKHZhbHVlKSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgIHZhciBzdHJDbGFzcyA9IHRvU3RyLmNhbGwodmFsdWUpO1xyXG4gICAgaWYgKHN0ckNsYXNzICE9PSBmbkNsYXNzICYmIHN0ckNsYXNzICE9PSBnZW5DbGFzcyAmJiAhKC9eXFxbb2JqZWN0IEhUTUwvKS50ZXN0KHN0ckNsYXNzKSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgIHJldHVybiB0cnlGdW5jdGlvbk9iamVjdCh2YWx1ZSk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCByZWZsZWN0QXBwbHkgPyBpc0NhbGxhYmxlUmVmQXBwbHkgOiBpc0NhbGxhYmxlTm9SZWZBcHBseTtcclxuIiwgIi8qXHJcbiBfXHQgICBfX1x0ICBfIF9fXHJcbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXHJcbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cclxufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXHJcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xyXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXHJcbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcclxuKi9cclxuXHJcbmltcG9ydCBpc0NhbGxhYmxlIGZyb20gXCIuL2NhbGxhYmxlLmpzXCI7XHJcblxyXG4vKipcclxuICogRXhjZXB0aW9uIGNsYXNzIHRoYXQgd2lsbCBiZSB1c2VkIGFzIHJlamVjdGlvbiByZWFzb25cclxuICogaW4gY2FzZSBhIHtAbGluayBDYW5jZWxsYWJsZVByb21pc2V9IGlzIGNhbmNlbGxlZCBzdWNjZXNzZnVsbHkuXHJcbiAqXHJcbiAqIFRoZSB2YWx1ZSBvZiB0aGUge0BsaW5rIG5hbWV9IHByb3BlcnR5IGlzIHRoZSBzdHJpbmcgYFwiQ2FuY2VsRXJyb3JcImAuXHJcbiAqIFRoZSB2YWx1ZSBvZiB0aGUge0BsaW5rIGNhdXNlfSBwcm9wZXJ0eSBpcyB0aGUgY2F1c2UgcGFzc2VkIHRvIHRoZSBjYW5jZWwgbWV0aG9kLCBpZiBhbnkuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2FuY2VsRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgYENhbmNlbEVycm9yYCBpbnN0YW5jZS5cclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBFcnJvciBjb25zdHJ1Y3Rvci5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgb3B0aW9ucz86IEVycm9yT3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiQ2FuY2VsRXJyb3JcIjtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEV4Y2VwdGlvbiBjbGFzcyB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgYXMgYW4gdW5oYW5kbGVkIHJlamVjdGlvblxyXG4gKiBpbiBjYXNlIGEge0BsaW5rIENhbmNlbGxhYmxlUHJvbWlzZX0gcmVqZWN0cyBhZnRlciBiZWluZyBjYW5jZWxsZWQsXHJcbiAqIG9yIHdoZW4gdGhlIGBvbmNhbmNlbGxlZGAgY2FsbGJhY2sgdGhyb3dzIG9yIHJlamVjdHMuXHJcbiAqXHJcbiAqIFRoZSB2YWx1ZSBvZiB0aGUge0BsaW5rIG5hbWV9IHByb3BlcnR5IGlzIHRoZSBzdHJpbmcgYFwiQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3JcImAuXHJcbiAqIFRoZSB2YWx1ZSBvZiB0aGUge0BsaW5rIGNhdXNlfSBwcm9wZXJ0eSBpcyB0aGUgcmVhc29uIHRoZSBwcm9taXNlIHJlamVjdGVkIHdpdGguXHJcbiAqXHJcbiAqIEJlY2F1c2UgdGhlIG9yaWdpbmFsIHByb21pc2Ugd2FzIGNhbmNlbGxlZCxcclxuICogYSB3cmFwcGVyIHByb21pc2Ugd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHVuaGFuZGxlZCByZWplY3Rpb24gbGlzdGVuZXIgaW5zdGVhZC5cclxuICogVGhlIHtAbGluayBwcm9taXNlfSBwcm9wZXJ0eSBob2xkcyBhIHJlZmVyZW5jZSB0byB0aGUgb3JpZ2luYWwgcHJvbWlzZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDYW5jZWxsZWRSZWplY3Rpb25FcnJvciBleHRlbmRzIEVycm9yIHtcclxuICAgIC8qKlxyXG4gICAgICogSG9sZHMgYSByZWZlcmVuY2UgdG8gdGhlIHByb21pc2UgdGhhdCB3YXMgY2FuY2VsbGVkIGFuZCB0aGVuIHJlamVjdGVkLlxyXG4gICAgICovXHJcbiAgICBwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcmAgaW5zdGFuY2UuXHJcbiAgICAgKiBAcGFyYW0gcHJvbWlzZSAtIFRoZSBwcm9taXNlIHRoYXQgY2F1c2VkIHRoZSBlcnJvciBvcmlnaW5hbGx5LlxyXG4gICAgICogQHBhcmFtIHJlYXNvbiAtIFRoZSByZWplY3Rpb24gcmVhc29uLlxyXG4gICAgICogQHBhcmFtIGluZm8gLSBBbiBvcHRpb25hbCBpbmZvcm1hdGl2ZSBtZXNzYWdlIHNwZWNpZnlpbmcgdGhlIGNpcmN1bXN0YW5jZXMgaW4gd2hpY2ggdGhlIGVycm9yIHdhcyB0aHJvd24uXHJcbiAgICAgKiAgICAgICAgICAgICAgIERlZmF1bHRzIHRvIHRoZSBzdHJpbmcgYFwiVW5oYW5kbGVkIHJlamVjdGlvbiBpbiBjYW5jZWxsZWQgcHJvbWlzZS5cImAuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHByb21pc2U6IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPiwgcmVhc29uPzogYW55LCBpbmZvPzogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIoKGluZm8gPz8gXCJVbmhhbmRsZWQgcmVqZWN0aW9uIGluIGNhbmNlbGxlZCBwcm9taXNlLlwiKSArIFwiIFJlYXNvbjogXCIgKyBlcnJvck1lc3NhZ2UocmVhc29uKSwgeyBjYXVzZTogcmVhc29uIH0pO1xyXG4gICAgICAgIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJDYW5jZWxsZWRSZWplY3Rpb25FcnJvclwiO1xyXG4gICAgfVxyXG59XHJcblxyXG50eXBlIENhbmNlbGxhYmxlUHJvbWlzZVJlc29sdmVyPFQ+ID0gKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4gfCBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xyXG50eXBlIENhbmNlbGxhYmxlUHJvbWlzZVJlamVjdG9yID0gKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcclxudHlwZSBDYW5jZWxsYWJsZVByb21pc2VDYW5jZWxsZXIgPSAoY2F1c2U/OiBhbnkpID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPjtcclxudHlwZSBDYW5jZWxsYWJsZVByb21pc2VFeGVjdXRvcjxUPiA9IChyZXNvbHZlOiBDYW5jZWxsYWJsZVByb21pc2VSZXNvbHZlcjxUPiwgcmVqZWN0OiBDYW5jZWxsYWJsZVByb21pc2VSZWplY3RvcikgPT4gdm9pZDtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUPiB7XHJcbiAgICB0aGVuPFRSZXN1bHQxID0gVCwgVFJlc3VsdDIgPSBuZXZlcj4ob25mdWxmaWxsZWQ/OiAoKHZhbHVlOiBUKSA9PiBUUmVzdWx0MSB8IFByb21pc2VMaWtlPFRSZXN1bHQxPiB8IENhbmNlbGxhYmxlUHJvbWlzZUxpa2U8VFJlc3VsdDE+KSB8IHVuZGVmaW5lZCB8IG51bGwsIG9ucmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiBUUmVzdWx0MiB8IFByb21pc2VMaWtlPFRSZXN1bHQyPiB8IENhbmNlbGxhYmxlUHJvbWlzZUxpa2U8VFJlc3VsdDI+KSB8IHVuZGVmaW5lZCB8IG51bGwpOiBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFRSZXN1bHQxIHwgVFJlc3VsdDI+O1xyXG4gICAgY2FuY2VsKGNhdXNlPzogYW55KTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+O1xyXG59XHJcblxyXG4vKipcclxuICogV3JhcHMgYSBjYW5jZWxsYWJsZSBwcm9taXNlIGFsb25nIHdpdGggaXRzIHJlc29sdXRpb24gbWV0aG9kcy5cclxuICogVGhlIGBvbmNhbmNlbGxlZGAgZmllbGQgd2lsbCBiZSBudWxsIGluaXRpYWxseSBidXQgbWF5IGJlIHNldCB0byBwcm92aWRlIGEgY3VzdG9tIGNhbmNlbGxhdGlvbiBmdW5jdGlvbi5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiB7XHJcbiAgICBwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2U8VD47XHJcbiAgICByZXNvbHZlOiBDYW5jZWxsYWJsZVByb21pc2VSZXNvbHZlcjxUPjtcclxuICAgIHJlamVjdDogQ2FuY2VsbGFibGVQcm9taXNlUmVqZWN0b3I7XHJcbiAgICBvbmNhbmNlbGxlZDogQ2FuY2VsbGFibGVQcm9taXNlQ2FuY2VsbGVyIHwgbnVsbDtcclxufVxyXG5cclxuaW50ZXJmYWNlIENhbmNlbGxhYmxlUHJvbWlzZVN0YXRlIHtcclxuICAgIHJlYWRvbmx5IHJvb3Q6IENhbmNlbGxhYmxlUHJvbWlzZVN0YXRlO1xyXG4gICAgcmVzb2x2aW5nOiBib29sZWFuO1xyXG4gICAgc2V0dGxlZDogYm9vbGVhbjtcclxuICAgIHJlYXNvbj86IENhbmNlbEVycm9yO1xyXG59XHJcblxyXG4vLyBQcml2YXRlIGZpZWxkIG5hbWVzLlxyXG5jb25zdCBiYXJyaWVyU3ltID0gU3ltYm9sKFwiYmFycmllclwiKTtcclxuY29uc3QgY2FuY2VsSW1wbFN5bSA9IFN5bWJvbChcImNhbmNlbEltcGxcIik7XHJcbmNvbnN0IHNwZWNpZXM6IHR5cGVvZiBTeW1ib2wuc3BlY2llcyA9IFN5bWJvbC5zcGVjaWVzID8/IFN5bWJvbChcInNwZWNpZXNQb2x5ZmlsbFwiKTtcclxuXHJcbi8qKlxyXG4gKiBBIHByb21pc2Ugd2l0aCBhbiBhdHRhY2hlZCBtZXRob2QgZm9yIGNhbmNlbGxpbmcgbG9uZy1ydW5uaW5nIG9wZXJhdGlvbnMgKHNlZSB7QGxpbmsgQ2FuY2VsbGFibGVQcm9taXNlI2NhbmNlbH0pLlxyXG4gKiBDYW5jZWxsYXRpb24gY2FuIG9wdGlvbmFsbHkgYmUgYm91bmQgdG8gYW4ge0BsaW5rIEFib3J0U2lnbmFsfVxyXG4gKiBmb3IgYmV0dGVyIGNvbXBvc2FiaWxpdHkgKHNlZSB7QGxpbmsgQ2FuY2VsbGFibGVQcm9taXNlI2NhbmNlbE9ufSkuXHJcbiAqXHJcbiAqIENhbmNlbGxpbmcgYSBwZW5kaW5nIHByb21pc2Ugd2lsbCByZXN1bHQgaW4gYW4gaW1tZWRpYXRlIHJlamVjdGlvblxyXG4gKiB3aXRoIGFuIGluc3RhbmNlIG9mIHtAbGluayBDYW5jZWxFcnJvcn0gYXMgcmVhc29uLFxyXG4gKiBidXQgd2hvZXZlciBzdGFydGVkIHRoZSBwcm9taXNlIHdpbGwgYmUgcmVzcG9uc2libGVcclxuICogZm9yIGFjdHVhbGx5IGFib3J0aW5nIHRoZSB1bmRlcmx5aW5nIG9wZXJhdGlvbi5cclxuICogVG8gdGhpcyBwdXJwb3NlLCB0aGUgY29uc3RydWN0b3IgYW5kIGFsbCBjaGFpbmluZyBtZXRob2RzXHJcbiAqIGFjY2VwdCBvcHRpb25hbCBjYW5jZWxsYXRpb24gY2FsbGJhY2tzLlxyXG4gKlxyXG4gKiBJZiBhIGBDYW5jZWxsYWJsZVByb21pc2VgIHN0aWxsIHJlc29sdmVzIGFmdGVyIGhhdmluZyBiZWVuIGNhbmNlbGxlZCxcclxuICogdGhlIHJlc3VsdCB3aWxsIGJlIGRpc2NhcmRlZC4gSWYgaXQgcmVqZWN0cywgdGhlIHJlYXNvblxyXG4gKiB3aWxsIGJlIHJlcG9ydGVkIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24sXHJcbiAqIHdyYXBwZWQgaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGluc3RhbmNlLlxyXG4gKiBUbyBmYWNpbGl0YXRlIHRoZSBoYW5kbGluZyBvZiBjYW5jZWxsYXRpb24gcmVxdWVzdHMsXHJcbiAqIGNhbmNlbGxlZCBgQ2FuY2VsbGFibGVQcm9taXNlYHMgd2lsbCBfbm90XyByZXBvcnQgdW5oYW5kbGVkIGBDYW5jZWxFcnJvcmBzXHJcbiAqIHdob3NlIGBjYXVzZWAgZmllbGQgaXMgdGhlIHNhbWUgYXMgdGhlIG9uZSB3aXRoIHdoaWNoIHRoZSBjdXJyZW50IHByb21pc2Ugd2FzIGNhbmNlbGxlZC5cclxuICpcclxuICogQWxsIHVzdWFsIHByb21pc2UgbWV0aG9kcyBhcmUgZGVmaW5lZCBhbmQgcmV0dXJuIGEgYENhbmNlbGxhYmxlUHJvbWlzZWBcclxuICogd2hvc2UgY2FuY2VsIG1ldGhvZCB3aWxsIGNhbmNlbCB0aGUgcGFyZW50IG9wZXJhdGlvbiBhcyB3ZWxsLCBwcm9wYWdhdGluZyB0aGUgY2FuY2VsbGF0aW9uIHJlYXNvblxyXG4gKiB1cHdhcmRzIHRocm91Z2ggcHJvbWlzZSBjaGFpbnMuXHJcbiAqIENvbnZlcnNlbHksIGNhbmNlbGxpbmcgYSBwcm9taXNlIHdpbGwgbm90IGF1dG9tYXRpY2FsbHkgY2FuY2VsIGRlcGVuZGVudCBwcm9taXNlcyBkb3duc3RyZWFtOlxyXG4gKiBgYGB0c1xyXG4gKiBsZXQgcm9vdCA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4geyAuLi4gfSk7XHJcbiAqIGxldCBjaGlsZDEgPSByb290LnRoZW4oKCkgPT4geyAuLi4gfSk7XHJcbiAqIGxldCBjaGlsZDIgPSBjaGlsZDEudGhlbigoKSA9PiB7IC4uLiB9KTtcclxuICogbGV0IGNoaWxkMyA9IHJvb3QuY2F0Y2goKCkgPT4geyAuLi4gfSk7XHJcbiAqIGNoaWxkMS5jYW5jZWwoKTsgLy8gQ2FuY2VscyBjaGlsZDEgYW5kIHJvb3QsIGJ1dCBub3QgY2hpbGQyIG9yIGNoaWxkM1xyXG4gKiBgYGBcclxuICogQ2FuY2VsbGluZyBhIHByb21pc2UgdGhhdCBoYXMgYWxyZWFkeSBzZXR0bGVkIGlzIHNhZmUgYW5kIGhhcyBubyBjb25zZXF1ZW5jZS5cclxuICpcclxuICogVGhlIGBjYW5jZWxgIG1ldGhvZCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IF9hbHdheXMgZnVsZmlsbHNfXHJcbiAqIGFmdGVyIHRoZSB3aG9sZSBjaGFpbiBoYXMgcHJvY2Vzc2VkIHRoZSBjYW5jZWwgcmVxdWVzdFxyXG4gKiBhbmQgYWxsIGF0dGFjaGVkIGNhbGxiYWNrcyB1cCB0byB0aGF0IG1vbWVudCBoYXZlIHJ1bi5cclxuICpcclxuICogQWxsIEVTMjAyNCBwcm9taXNlIG1ldGhvZHMgKHN0YXRpYyBhbmQgaW5zdGFuY2UpIGFyZSBkZWZpbmVkIG9uIENhbmNlbGxhYmxlUHJvbWlzZSxcclxuICogYnV0IGFjdHVhbCBhdmFpbGFiaWxpdHkgbWF5IHZhcnkgd2l0aCBPUy93ZWJ2aWV3IHZlcnNpb24uXHJcbiAqXHJcbiAqIEluIGxpbmUgd2l0aCB0aGUgcHJvcG9zYWwgYXQgaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtcm0tYnVpbHRpbi1zdWJjbGFzc2luZyxcclxuICogYENhbmNlbGxhYmxlUHJvbWlzZWAgZG9lcyBub3Qgc3VwcG9ydCB0cmFuc3BhcmVudCBzdWJjbGFzc2luZy5cclxuICogRXh0ZW5kZXJzIHNob3VsZCB0YWtlIGNhcmUgdG8gcHJvdmlkZSB0aGVpciBvd24gbWV0aG9kIGltcGxlbWVudGF0aW9ucy5cclxuICogVGhpcyBtaWdodCBiZSByZWNvbnNpZGVyZWQgaW4gY2FzZSB0aGUgcHJvcG9zYWwgaXMgcmV0aXJlZC5cclxuICpcclxuICogQ2FuY2VsbGFibGVQcm9taXNlIGlzIGEgd3JhcHBlciBhcm91bmQgdGhlIERPTSBQcm9taXNlIG9iamVjdFxyXG4gKiBhbmQgaXMgY29tcGxpYW50IHdpdGggdGhlIFtQcm9taXNlcy9BKyBzcGVjaWZpY2F0aW9uXShodHRwczovL3Byb21pc2VzYXBsdXMuY29tLylcclxuICogKGl0IHBhc3NlcyB0aGUgW2NvbXBsaWFuY2Ugc3VpdGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy10ZXN0cykpXHJcbiAqIGlmIHNvIGlzIHRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENhbmNlbGxhYmxlUHJvbWlzZTxUPiBleHRlbmRzIFByb21pc2U8VD4gaW1wbGVtZW50cyBQcm9taXNlTGlrZTxUPiwgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUPiB7XHJcbiAgICAvLyBQcml2YXRlIGZpZWxkcy5cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIHByaXZhdGUgW2JhcnJpZXJTeW1dITogUGFydGlhbDxQcm9taXNlV2l0aFJlc29sdmVyczx2b2lkPj4gfCBudWxsO1xyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBbY2FuY2VsSW1wbFN5bV0hOiAocmVhc29uOiBDYW5jZWxFcnJvcikgPT4gdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBgQ2FuY2VsbGFibGVQcm9taXNlYC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZXhlY3V0b3IgLSBBIGNhbGxiYWNrIHVzZWQgdG8gaW5pdGlhbGl6ZSB0aGUgcHJvbWlzZS4gVGhpcyBjYWxsYmFjayBpcyBwYXNzZWQgdHdvIGFyZ3VtZW50czpcclxuICAgICAqICAgICAgICAgICAgICAgICAgIGEgYHJlc29sdmVgIGNhbGxiYWNrIHVzZWQgdG8gcmVzb2x2ZSB0aGUgcHJvbWlzZSB3aXRoIGEgdmFsdWVcclxuICAgICAqICAgICAgICAgICAgICAgICAgIG9yIHRoZSByZXN1bHQgb2YgYW5vdGhlciBwcm9taXNlIChwb3NzaWJseSBjYW5jZWxsYWJsZSksXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICBhbmQgYSBgcmVqZWN0YCBjYWxsYmFjayB1c2VkIHRvIHJlamVjdCB0aGUgcHJvbWlzZSB3aXRoIGEgcHJvdmlkZWQgcmVhc29uIG9yIGVycm9yLlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgSWYgdGhlIHZhbHVlIHByb3ZpZGVkIHRvIHRoZSBgcmVzb2x2ZWAgY2FsbGJhY2sgaXMgYSB0aGVuYWJsZSBfYW5kXyBjYW5jZWxsYWJsZSBvYmplY3RcclxuICAgICAqICAgICAgICAgICAgICAgICAgIChpdCBoYXMgYSBgdGhlbmAgX2FuZF8gYSBgY2FuY2VsYCBtZXRob2QpLFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIHdpbGwgYmUgZm9yd2FyZGVkIHRvIHRoYXQgb2JqZWN0IGFuZCB0aGUgb25jYW5jZWxsZWQgd2lsbCBub3QgYmUgaW52b2tlZCBhbnltb3JlLlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgSWYgYW55IG9uZSBvZiB0aGUgdHdvIGNhbGxiYWNrcyBpcyBjYWxsZWQgX2FmdGVyXyB0aGUgcHJvbWlzZSBoYXMgYmVlbiBjYW5jZWxsZWQsXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICB0aGUgcHJvdmlkZWQgdmFsdWVzIHdpbGwgYmUgY2FuY2VsbGVkIGFuZCByZXNvbHZlZCBhcyB1c3VhbCxcclxuICAgICAqICAgICAgICAgICAgICAgICAgIGJ1dCB0aGVpciByZXN1bHRzIHdpbGwgYmUgZGlzY2FyZGVkLlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgSG93ZXZlciwgaWYgdGhlIHJlc29sdXRpb24gcHJvY2VzcyB1bHRpbWF0ZWx5IGVuZHMgdXAgaW4gYSByZWplY3Rpb25cclxuICAgICAqICAgICAgICAgICAgICAgICAgIHRoYXQgaXMgbm90IGR1ZSB0byBjYW5jZWxsYXRpb24sIHRoZSByZWplY3Rpb24gcmVhc29uXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICB3aWxsIGJlIHdyYXBwZWQgaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9XHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICBhbmQgYnViYmxlZCB1cCBhcyBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIG9uY2FuY2VsbGVkIC0gSXQgaXMgdGhlIGNhbGxlcidzIHJlc3BvbnNpYmlsaXR5IHRvIGVuc3VyZSB0aGF0IGFueSBvcGVyYXRpb25cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ZWQgYnkgdGhlIGV4ZWN1dG9yIGlzIHByb3Blcmx5IGhhbHRlZCB1cG9uIGNhbmNlbGxhdGlvbi5cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIFRoaXMgb3B0aW9uYWwgY2FsbGJhY2sgY2FuIGJlIHVzZWQgdG8gdGhhdCBwdXJwb3NlLlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgSXQgd2lsbCBiZSBjYWxsZWQgX3N5bmNocm9ub3VzbHlfIHdpdGggYSBjYW5jZWxsYXRpb24gY2F1c2VcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIHdoZW4gY2FuY2VsbGF0aW9uIGlzIHJlcXVlc3RlZCwgX2FmdGVyXyB0aGUgcHJvbWlzZSBoYXMgYWxyZWFkeSByZWplY3RlZFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgd2l0aCBhIHtAbGluayBDYW5jZWxFcnJvcn0sIGJ1dCBfYmVmb3JlX1xyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgYW55IHtAbGluayB0aGVufS97QGxpbmsgY2F0Y2h9L3tAbGluayBmaW5hbGx5fSBjYWxsYmFjayBydW5zLlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgSWYgdGhlIGNhbGxiYWNrIHJldHVybnMgYSB0aGVuYWJsZSwgdGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB7QGxpbmsgY2FuY2VsfVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgd2lsbCBvbmx5IGZ1bGZpbGwgYWZ0ZXIgdGhlIGZvcm1lciBoYXMgc2V0dGxlZC5cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIFVuaGFuZGxlZCBleGNlcHRpb25zIG9yIHJlamVjdGlvbnMgZnJvbSB0aGUgY2FsbGJhY2sgd2lsbCBiZSB3cmFwcGVkXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICBpbiBhIHtAbGluayBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcn0gYW5kIGJ1YmJsZWQgdXAgYXMgdW5oYW5kbGVkIHJlamVjdGlvbnMuXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICBJZiB0aGUgYHJlc29sdmVgIGNhbGxiYWNrIGlzIGNhbGxlZCBiZWZvcmUgY2FuY2VsbGF0aW9uIHdpdGggYSBjYW5jZWxsYWJsZSBwcm9taXNlLFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIG9uIHRoaXMgcHJvbWlzZSB3aWxsIGJlIGRpdmVydGVkIHRvIHRoYXQgcHJvbWlzZSxcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIGFuZCB0aGUgb3JpZ2luYWwgYG9uY2FuY2VsbGVkYCBjYWxsYmFjayB3aWxsIGJlIGRpc2NhcmRlZC5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZXhlY3V0b3I6IENhbmNlbGxhYmxlUHJvbWlzZUV4ZWN1dG9yPFQ+LCBvbmNhbmNlbGxlZD86IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlcikge1xyXG4gICAgICAgIGxldCByZXNvbHZlITogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XHJcbiAgICAgICAgbGV0IHJlamVjdCE6IChyZWFzb24/OiBhbnkpID0+IHZvaWQ7XHJcbiAgICAgICAgc3VwZXIoKHJlcywgcmVqKSA9PiB7IHJlc29sdmUgPSByZXM7IHJlamVjdCA9IHJlajsgfSk7XHJcblxyXG4gICAgICAgIGlmICgodGhpcy5jb25zdHJ1Y3RvciBhcyBhbnkpW3NwZWNpZXNdICE9PSBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5jZWxsYWJsZVByb21pc2UgZG9lcyBub3Qgc3VwcG9ydCB0cmFuc3BhcmVudCBzdWJjbGFzc2luZy4gUGxlYXNlIHJlZnJhaW4gZnJvbSBvdmVycmlkaW5nIHRoZSBbU3ltYm9sLnNwZWNpZXNdIHN0YXRpYyBwcm9wZXJ0eS5cIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiA9IHtcclxuICAgICAgICAgICAgcHJvbWlzZTogdGhpcyxcclxuICAgICAgICAgICAgcmVzb2x2ZSxcclxuICAgICAgICAgICAgcmVqZWN0LFxyXG4gICAgICAgICAgICBnZXQgb25jYW5jZWxsZWQoKSB7IHJldHVybiBvbmNhbmNlbGxlZCA/PyBudWxsOyB9LFxyXG4gICAgICAgICAgICBzZXQgb25jYW5jZWxsZWQoY2IpIHsgb25jYW5jZWxsZWQgPSBjYiA/PyB1bmRlZmluZWQ7IH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZTogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGUgPSB7XHJcbiAgICAgICAgICAgIGdldCByb290KCkgeyByZXR1cm4gc3RhdGU7IH0sXHJcbiAgICAgICAgICAgIHJlc29sdmluZzogZmFsc2UsXHJcbiAgICAgICAgICAgIHNldHRsZWQ6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gU2V0dXAgY2FuY2VsbGF0aW9uIHN5c3RlbS5cclxuICAgICAgICB2b2lkIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcclxuICAgICAgICAgICAgW2JhcnJpZXJTeW1dOiB7XHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtjYW5jZWxJbXBsU3ltXToge1xyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNhbmNlbGxlckZvcihwcm9taXNlLCBzdGF0ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSdW4gdGhlIGFjdHVhbCBleGVjdXRvci5cclxuICAgICAgICBjb25zdCByZWplY3RvciA9IHJlamVjdG9yRm9yKHByb21pc2UsIHN0YXRlKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBleGVjdXRvcihyZXNvbHZlckZvcihwcm9taXNlLCBzdGF0ZSksIHJlamVjdG9yKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgaWYgKHN0YXRlLnJlc29sdmluZykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmhhbmRsZWQgZXhjZXB0aW9uIGluIENhbmNlbGxhYmxlUHJvbWlzZSBleGVjdXRvci5cIiwgZXJyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdG9yKGVycik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYW5jZWxzIGltbWVkaWF0ZWx5IHRoZSBleGVjdXRpb24gb2YgdGhlIG9wZXJhdGlvbiBhc3NvY2lhdGVkIHdpdGggdGhpcyBwcm9taXNlLlxyXG4gICAgICogVGhlIHByb21pc2UgcmVqZWN0cyB3aXRoIGEge0BsaW5rIENhbmNlbEVycm9yfSBpbnN0YW5jZSBhcyByZWFzb24sXHJcbiAgICAgKiB3aXRoIHRoZSB7QGxpbmsgQ2FuY2VsRXJyb3IjY2F1c2V9IHByb3BlcnR5IHNldCB0byB0aGUgZ2l2ZW4gYXJndW1lbnQsIGlmIGFueS5cclxuICAgICAqXHJcbiAgICAgKiBIYXMgbm8gZWZmZWN0IGlmIGNhbGxlZCBhZnRlciB0aGUgcHJvbWlzZSBoYXMgYWxyZWFkeSBzZXR0bGVkO1xyXG4gICAgICogcmVwZWF0ZWQgY2FsbHMgaW4gcGFydGljdWxhciBhcmUgc2FmZSwgYnV0IG9ubHkgdGhlIGZpcnN0IG9uZVxyXG4gICAgICogd2lsbCBzZXQgdGhlIGNhbmNlbGxhdGlvbiBjYXVzZS5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgYENhbmNlbEVycm9yYCBleGNlcHRpb24gX25lZWQgbm90XyBiZSBoYW5kbGVkIGV4cGxpY2l0bHkgX29uIHRoZSBwcm9taXNlcyB0aGF0IGFyZSBiZWluZyBjYW5jZWxsZWQ6X1xyXG4gICAgICogY2FuY2VsbGluZyBhIHByb21pc2Ugd2l0aCBubyBhdHRhY2hlZCByZWplY3Rpb24gaGFuZGxlciBkb2VzIG5vdCB0cmlnZ2VyIGFuIHVuaGFuZGxlZCByZWplY3Rpb24gZXZlbnQuXHJcbiAgICAgKiBUaGVyZWZvcmUsIHRoZSBmb2xsb3dpbmcgaWRpb21zIGFyZSBhbGwgZXF1YWxseSBjb3JyZWN0OlxyXG4gICAgICogYGBgdHNcclxuICAgICAqIG5ldyBDYW5jZWxsYWJsZVByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4geyAuLi4gfSkuY2FuY2VsKCk7XHJcbiAgICAgKiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgLi4uIH0pLnRoZW4oLi4uKS5jYW5jZWwoKTtcclxuICAgICAqIG5ldyBDYW5jZWxsYWJsZVByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4geyAuLi4gfSkudGhlbiguLi4pLmNhdGNoKC4uLikuY2FuY2VsKCk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqIFdoZW5ldmVyIHNvbWUgY2FuY2VsbGVkIHByb21pc2UgaW4gYSBjaGFpbiByZWplY3RzIHdpdGggYSBgQ2FuY2VsRXJyb3JgXHJcbiAgICAgKiB3aXRoIHRoZSBzYW1lIGNhbmNlbGxhdGlvbiBjYXVzZSBhcyBpdHNlbGYsIHRoZSBlcnJvciB3aWxsIGJlIGRpc2NhcmRlZCBzaWxlbnRseS5cclxuICAgICAqIEhvd2V2ZXIsIHRoZSBgQ2FuY2VsRXJyb3JgIF93aWxsIHN0aWxsIGJlIGRlbGl2ZXJlZF8gdG8gYWxsIGF0dGFjaGVkIHJlamVjdGlvbiBoYW5kbGVyc1xyXG4gICAgICogYWRkZWQgYnkge0BsaW5rIHRoZW59IGFuZCByZWxhdGVkIG1ldGhvZHM6XHJcbiAgICAgKiBgYGB0c1xyXG4gICAgICogbGV0IGNhbmNlbGxhYmxlID0gbmV3IENhbmNlbGxhYmxlUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7IC4uLiB9KTtcclxuICAgICAqIGNhbmNlbGxhYmxlLnRoZW4oKCkgPT4geyAuLi4gfSkuY2F0Y2goY29uc29sZS5sb2cpO1xyXG4gICAgICogY2FuY2VsbGFibGUuY2FuY2VsKCk7IC8vIEEgQ2FuY2VsRXJyb3IgaXMgcHJpbnRlZCB0byB0aGUgY29uc29sZS5cclxuICAgICAqIGBgYFxyXG4gICAgICogSWYgdGhlIGBDYW5jZWxFcnJvcmAgaXMgbm90IGhhbmRsZWQgZG93bnN0cmVhbSBieSB0aGUgdGltZSBpdCByZWFjaGVzXHJcbiAgICAgKiBhIF9ub24tY2FuY2VsbGVkXyBwcm9taXNlLCBpdCBfd2lsbF8gdHJpZ2dlciBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uIGV2ZW50LFxyXG4gICAgICoganVzdCBsaWtlIG5vcm1hbCByZWplY3Rpb25zIHdvdWxkOlxyXG4gICAgICogYGBgdHNcclxuICAgICAqIGxldCBjYW5jZWxsYWJsZSA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4geyAuLi4gfSk7XHJcbiAgICAgKiBsZXQgY2hhaW5lZCA9IGNhbmNlbGxhYmxlLnRoZW4oKCkgPT4geyAuLi4gfSkudGhlbigoKSA9PiB7IC4uLiB9KTsgLy8gTm8gY2F0Y2guLi5cclxuICAgICAqIGNhbmNlbGxhYmxlLmNhbmNlbCgpOyAvLyBVbmhhbmRsZWQgcmVqZWN0aW9uIGV2ZW50IG9uIGNoYWluZWQhXHJcbiAgICAgKiBgYGBcclxuICAgICAqIFRoZXJlZm9yZSwgaXQgaXMgaW1wb3J0YW50IHRvIGVpdGhlciBjYW5jZWwgd2hvbGUgcHJvbWlzZSBjaGFpbnMgZnJvbSB0aGVpciB0YWlsLFxyXG4gICAgICogYXMgc2hvd24gaW4gdGhlIGNvcnJlY3QgaWRpb21zIGFib3ZlLCBvciB0YWtlIGNhcmUgb2YgaGFuZGxpbmcgZXJyb3JzIGV2ZXJ5d2hlcmUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgQSBjYW5jZWxsYWJsZSBwcm9taXNlIHRoYXQgX2Z1bGZpbGxzXyBhZnRlciB0aGUgY2FuY2VsIGNhbGxiYWNrIChpZiBhbnkpXHJcbiAgICAgKiBhbmQgYWxsIGhhbmRsZXJzIGF0dGFjaGVkIHVwIHRvIHRoZSBjYWxsIHRvIGNhbmNlbCBoYXZlIHJ1bi5cclxuICAgICAqIElmIHRoZSBjYW5jZWwgY2FsbGJhY2sgcmV0dXJucyBhIHRoZW5hYmxlLCB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSBgY2FuY2VsYFxyXG4gICAgICogd2lsbCBhbHNvIHdhaXQgZm9yIHRoYXQgdGhlbmFibGUgdG8gc2V0dGxlLlxyXG4gICAgICogVGhpcyBlbmFibGVzIGNhbGxlcnMgdG8gd2FpdCBmb3IgdGhlIGNhbmNlbGxlZCBvcGVyYXRpb24gdG8gdGVybWluYXRlXHJcbiAgICAgKiB3aXRob3V0IGJlaW5nIGZvcmNlZCB0byBoYW5kbGUgcG90ZW50aWFsIGVycm9ycyBhdCB0aGUgY2FsbCBzaXRlLlxyXG4gICAgICogYGBgdHNcclxuICAgICAqIGNhbmNlbGxhYmxlLmNhbmNlbCgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICogICAgIC8vIENsZWFudXAgZmluaXNoZWQsIGl0J3Mgc2FmZSB0byBkbyBzb21ldGhpbmcgZWxzZS5cclxuICAgICAqIH0sIChlcnIpID0+IHtcclxuICAgICAqICAgICAvLyBVbnJlYWNoYWJsZTogdGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSBjYW5jZWwgd2lsbCBuZXZlciByZWplY3QuXHJcbiAgICAgKiB9KTtcclxuICAgICAqIGBgYFxyXG4gICAgICogTm90ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgX25vdF8gaGFuZGxlIGltcGxpY2l0bHkgYW55IHJlamVjdGlvblxyXG4gICAgICogdGhhdCBtaWdodCBoYXZlIG9jY3VycmVkIGFscmVhZHkgaW4gdGhlIGNhbmNlbGxlZCBjaGFpbi5cclxuICAgICAqIEl0IHdpbGwganVzdCB0cmFjayB3aGV0aGVyIHJlZ2lzdGVyZWQgaGFuZGxlcnMgaGF2ZSBiZWVuIGV4ZWN1dGVkIG9yIG5vdC5cclxuICAgICAqIFRoZXJlZm9yZSwgdW5oYW5kbGVkIHJlamVjdGlvbnMgd2lsbCBuZXZlciBiZSBzaWxlbnRseSBoYW5kbGVkIGJ5IGNhbGxpbmcgY2FuY2VsLlxyXG4gICAgICovXHJcbiAgICBjYW5jZWwoY2F1c2U/OiBhbnkpOiBDYW5jZWxsYWJsZVByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIElOVkFSSUFOVDogdGhlIHJlc3VsdCBvZiB0aGlzW2NhbmNlbEltcGxTeW1dIGFuZCB0aGUgYmFycmllciBkbyBub3QgZXZlciByZWplY3QuXHJcbiAgICAgICAgICAgIC8vIFVuZm9ydHVuYXRlbHkgbWFjT1MgSGlnaCBTaWVycmEgZG9lcyBub3Qgc3VwcG9ydCBQcm9taXNlLmFsbFNldHRsZWQuXHJcbiAgICAgICAgICAgIFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgICAgIHRoaXNbY2FuY2VsSW1wbFN5bV0obmV3IENhbmNlbEVycm9yKFwiUHJvbWlzZSBjYW5jZWxsZWQuXCIsIHsgY2F1c2UgfSkpLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudEJhcnJpZXIodGhpcylcclxuICAgICAgICAgICAgXSkudGhlbigoKSA9PiByZXNvbHZlKCksICgpID0+IHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyBwcm9taXNlIGNhbmNlbGxhdGlvbiB0byB0aGUgYWJvcnQgZXZlbnQgb2YgdGhlIGdpdmVuIHtAbGluayBBYm9ydFNpZ25hbH0uXHJcbiAgICAgKiBJZiB0aGUgc2lnbmFsIGhhcyBhbHJlYWR5IGFib3J0ZWQsIHRoZSBwcm9taXNlIHdpbGwgYmUgY2FuY2VsbGVkIGltbWVkaWF0ZWx5LlxyXG4gICAgICogV2hlbiBlaXRoZXIgY29uZGl0aW9uIGlzIHZlcmlmaWVkLCB0aGUgY2FuY2VsbGF0aW9uIGNhdXNlIHdpbGwgYmUgc2V0XHJcbiAgICAgKiB0byB0aGUgc2lnbmFsJ3MgYWJvcnQgcmVhc29uIChzZWUge0BsaW5rIEFib3J0U2lnbmFsI3JlYXNvbn0pLlxyXG4gICAgICpcclxuICAgICAqIEhhcyBubyBlZmZlY3QgaWYgY2FsbGVkIChvciBpZiB0aGUgc2lnbmFsIGFib3J0cykgX2FmdGVyXyB0aGUgcHJvbWlzZSBoYXMgYWxyZWFkeSBzZXR0bGVkLlxyXG4gICAgICogT25seSB0aGUgZmlyc3Qgc2lnbmFsIHRvIGFib3J0IHdpbGwgc2V0IHRoZSBjYW5jZWxsYXRpb24gY2F1c2UuXHJcbiAgICAgKlxyXG4gICAgICogRm9yIG1vcmUgZGV0YWlscyBhYm91dCB0aGUgY2FuY2VsbGF0aW9uIHByb2Nlc3MsXHJcbiAgICAgKiBzZWUge0BsaW5rIGNhbmNlbH0gYW5kIHRoZSBgQ2FuY2VsbGFibGVQcm9taXNlYCBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBlbmFibGVzIGBhd2FpdGBpbmcgY2FuY2VsbGFibGUgcHJvbWlzZXMgd2l0aG91dCBoYXZpbmdcclxuICAgICAqIHRvIHN0b3JlIHRoZW0gZm9yIGZ1dHVyZSBjYW5jZWxsYXRpb24sIGUuZy46XHJcbiAgICAgKiBgYGB0c1xyXG4gICAgICogYXdhaXQgbG9uZ1J1bm5pbmdPcGVyYXRpb24oKS5jYW5jZWxPbihzaWduYWwpO1xyXG4gICAgICogYGBgXHJcbiAgICAgKiBpbnN0ZWFkIG9mOlxyXG4gICAgICogYGBgdHNcclxuICAgICAqIGxldCBwcm9taXNlVG9CZUNhbmNlbGxlZCA9IGxvbmdSdW5uaW5nT3BlcmF0aW9uKCk7XHJcbiAgICAgKiBhd2FpdCBwcm9taXNlVG9CZUNhbmNlbGxlZDtcclxuICAgICAqIGBgYFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIFRoaXMgcHJvbWlzZSwgZm9yIG1ldGhvZCBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgY2FuY2VsT24oc2lnbmFsOiBBYm9ydFNpZ25hbCk6IENhbmNlbGxhYmxlUHJvbWlzZTxUPiB7XHJcbiAgICAgICAgaWYgKHNpZ25hbC5hYm9ydGVkKSB7XHJcbiAgICAgICAgICAgIHZvaWQgdGhpcy5jYW5jZWwoc2lnbmFsLnJlYXNvbilcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCAoKSA9PiB2b2lkIHRoaXMuY2FuY2VsKHNpZ25hbC5yZWFzb24pLCB7Y2FwdHVyZTogdHJ1ZX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBjYWxsYmFja3MgZm9yIHRoZSByZXNvbHV0aW9uIGFuZC9vciByZWplY3Rpb24gb2YgdGhlIGBDYW5jZWxsYWJsZVByb21pc2VgLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBvcHRpb25hbCBgb25jYW5jZWxsZWRgIGFyZ3VtZW50IHdpbGwgYmUgaW52b2tlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCxcclxuICAgICAqIHdpdGggdGhlIHNhbWUgc2VtYW50aWNzIGFzIHRoZSBgb25jYW5jZWxsZWRgIGFyZ3VtZW50IG9mIHRoZSBjb25zdHJ1Y3Rvci5cclxuICAgICAqIFdoZW4gdGhlIHBhcmVudCBwcm9taXNlIHJlamVjdHMgb3IgaXMgY2FuY2VsbGVkLCB0aGUgYG9ucmVqZWN0ZWRgIGNhbGxiYWNrIHdpbGwgcnVuLFxyXG4gICAgICogX2V2ZW4gYWZ0ZXIgdGhlIHJldHVybmVkIHByb21pc2UgaGFzIGJlZW4gY2FuY2VsbGVkOl9cclxuICAgICAqIGluIHRoYXQgY2FzZSwgc2hvdWxkIGl0IHJlamVjdCBvciB0aHJvdywgdGhlIHJlYXNvbiB3aWxsIGJlIHdyYXBwZWRcclxuICAgICAqIGluIGEge0BsaW5rIENhbmNlbGxlZFJlamVjdGlvbkVycm9yfSBhbmQgYnViYmxlZCB1cCBhcyBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBvbmZ1bGZpbGxlZCBUaGUgY2FsbGJhY2sgdG8gZXhlY3V0ZSB3aGVuIHRoZSBQcm9taXNlIGlzIHJlc29sdmVkLlxyXG4gICAgICogQHBhcmFtIG9ucmVqZWN0ZWQgVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZC5cclxuICAgICAqIEByZXR1cm5zIEEgYENhbmNlbGxhYmxlUHJvbWlzZWAgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHdoaWNoZXZlciBjYWxsYmFjayBpcyBleGVjdXRlZC5cclxuICAgICAqIFRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGhvb2tlZCB1cCB0byBwcm9wYWdhdGUgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIHVwIHRoZSBjaGFpbiwgYnV0IG5vdCBkb3duOlxyXG4gICAgICpcclxuICAgICAqICAgLSBpZiB0aGUgcGFyZW50IHByb21pc2UgaXMgY2FuY2VsbGVkLCB0aGUgYG9ucmVqZWN0ZWRgIGhhbmRsZXIgd2lsbCBiZSBpbnZva2VkIHdpdGggYSBgQ2FuY2VsRXJyb3JgXHJcbiAgICAgKiAgICAgYW5kIHRoZSByZXR1cm5lZCBwcm9taXNlIF93aWxsIHJlc29sdmUgcmVndWxhcmx5XyB3aXRoIGl0cyByZXN1bHQ7XHJcbiAgICAgKiAgIC0gY29udmVyc2VseSwgaWYgdGhlIHJldHVybmVkIHByb21pc2UgaXMgY2FuY2VsbGVkLCBfdGhlIHBhcmVudCBwcm9taXNlIGlzIGNhbmNlbGxlZCB0b287X1xyXG4gICAgICogICAgIHRoZSBgb25yZWplY3RlZGAgaGFuZGxlciB3aWxsIHN0aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgcGFyZW50J3MgYENhbmNlbEVycm9yYCxcclxuICAgICAqICAgICBidXQgaXRzIHJlc3VsdCB3aWxsIGJlIGRpc2NhcmRlZFxyXG4gICAgICogICAgIGFuZCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIHJlamVjdCB3aXRoIGEgYENhbmNlbEVycm9yYCBhcyB3ZWxsLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBwcm9taXNlIHJldHVybmVkIGZyb20ge0BsaW5rIGNhbmNlbH0gd2lsbCBmdWxmaWxsIG9ubHkgYWZ0ZXIgYWxsIGF0dGFjaGVkIGhhbmRsZXJzXHJcbiAgICAgKiB1cCB0aGUgZW50aXJlIHByb21pc2UgY2hhaW4gaGF2ZSBiZWVuIHJ1bi5cclxuICAgICAqXHJcbiAgICAgKiBJZiBlaXRoZXIgY2FsbGJhY2sgcmV0dXJucyBhIGNhbmNlbGxhYmxlIHByb21pc2UsXHJcbiAgICAgKiBjYW5jZWxsYXRpb24gcmVxdWVzdHMgd2lsbCBiZSBkaXZlcnRlZCB0byBpdCxcclxuICAgICAqIGFuZCB0aGUgc3BlY2lmaWVkIGBvbmNhbmNlbGxlZGAgY2FsbGJhY2sgd2lsbCBiZSBkaXNjYXJkZWQuXHJcbiAgICAgKi9cclxuICAgIHRoZW48VFJlc3VsdDEgPSBULCBUUmVzdWx0MiA9IG5ldmVyPihvbmZ1bGZpbGxlZD86ICgodmFsdWU6IFQpID0+IFRSZXN1bHQxIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDE+IHwgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUUmVzdWx0MT4pIHwgdW5kZWZpbmVkIHwgbnVsbCwgb25yZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQyIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDI+IHwgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUUmVzdWx0Mj4pIHwgdW5kZWZpbmVkIHwgbnVsbCwgb25jYW5jZWxsZWQ/OiBDYW5jZWxsYWJsZVByb21pc2VDYW5jZWxsZXIpOiBDYW5jZWxsYWJsZVByb21pc2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj4ge1xyXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDYW5jZWxsYWJsZVByb21pc2UpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5jZWxsYWJsZVByb21pc2UucHJvdG90eXBlLnRoZW4gY2FsbGVkIG9uIGFuIGludmFsaWQgb2JqZWN0LlwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5PVEU6IFR5cGVTY3JpcHQncyBidWlsdC1pbiB0eXBlIGZvciB0aGVuIGlzIGJyb2tlbixcclxuICAgICAgICAvLyBhcyBpdCBhbGxvd3Mgc3BlY2lmeWluZyBhbiBhcmJpdHJhcnkgVFJlc3VsdDEgIT0gVCBldmVuIHdoZW4gb25mdWxmaWxsZWQgaXMgbm90IGEgZnVuY3Rpb24uXHJcbiAgICAgICAgLy8gV2UgY2Fubm90IGZpeCBpdCBpZiB3ZSB3YW50IHRvIENhbmNlbGxhYmxlUHJvbWlzZSB0byBpbXBsZW1lbnQgUHJvbWlzZUxpa2U8VD4uXHJcblxyXG4gICAgICAgIGlmICghaXNDYWxsYWJsZShvbmZ1bGZpbGxlZCkpIHsgb25mdWxmaWxsZWQgPSBpZGVudGl0eSBhcyBhbnk7IH1cclxuICAgICAgICBpZiAoIWlzQ2FsbGFibGUob25yZWplY3RlZCkpIHsgb25yZWplY3RlZCA9IHRocm93ZXI7IH1cclxuXHJcbiAgICAgICAgaWYgKG9uZnVsZmlsbGVkID09PSBpZGVudGl0eSAmJiBvbnJlamVjdGVkID09IHRocm93ZXIpIHtcclxuICAgICAgICAgICAgLy8gU2hvcnRjdXQgZm9yIHRyaXZpYWwgYXJndW1lbnRzLlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENhbmNlbGxhYmxlUHJvbWlzZSgocmVzb2x2ZSkgPT4gcmVzb2x2ZSh0aGlzIGFzIGFueSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYmFycmllcjogUGFydGlhbDxQcm9taXNlV2l0aFJlc29sdmVyczx2b2lkPj4gPSB7fTtcclxuICAgICAgICB0aGlzW2JhcnJpZXJTeW1dID0gYmFycmllcjtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBDYW5jZWxsYWJsZVByb21pc2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB2b2lkIHN1cGVyLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpc1tiYXJyaWVyU3ltXSA9PT0gYmFycmllcikgeyB0aGlzW2JhcnJpZXJTeW1dID0gbnVsbDsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJhcnJpZXIucmVzb2x2ZT8uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob25mdWxmaWxsZWQhKHZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAocmVhc29uPykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzW2JhcnJpZXJTeW1dID09PSBiYXJyaWVyKSB7IHRoaXNbYmFycmllclN5bV0gPSBudWxsOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgYmFycmllci5yZXNvbHZlPy4oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvbnJlamVjdGVkIShyZWFzb24pKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0sIGFzeW5jIChjYXVzZT8pID0+IHtcclxuICAgICAgICAgICAgLy9jYW5jZWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9uY2FuY2VsbGVkPy4oY2F1c2UpO1xyXG4gICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jYW5jZWwoY2F1c2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhIGNhbGxiYWNrIGZvciBvbmx5IHRoZSByZWplY3Rpb24gb2YgdGhlIFByb21pc2UuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIG9wdGlvbmFsIGBvbmNhbmNlbGxlZGAgYXJndW1lbnQgd2lsbCBiZSBpbnZva2VkIHdoZW4gdGhlIHJldHVybmVkIHByb21pc2UgaXMgY2FuY2VsbGVkLFxyXG4gICAgICogd2l0aCB0aGUgc2FtZSBzZW1hbnRpY3MgYXMgdGhlIGBvbmNhbmNlbGxlZGAgYXJndW1lbnQgb2YgdGhlIGNvbnN0cnVjdG9yLlxyXG4gICAgICogV2hlbiB0aGUgcGFyZW50IHByb21pc2UgcmVqZWN0cyBvciBpcyBjYW5jZWxsZWQsIHRoZSBgb25yZWplY3RlZGAgY2FsbGJhY2sgd2lsbCBydW4sXHJcbiAgICAgKiBfZXZlbiBhZnRlciB0aGUgcmV0dXJuZWQgcHJvbWlzZSBoYXMgYmVlbiBjYW5jZWxsZWQ6X1xyXG4gICAgICogaW4gdGhhdCBjYXNlLCBzaG91bGQgaXQgcmVqZWN0IG9yIHRocm93LCB0aGUgcmVhc29uIHdpbGwgYmUgd3JhcHBlZFxyXG4gICAgICogaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGFuZCBidWJibGVkIHVwIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXHJcbiAgICAgKlxyXG4gICAgICogSXQgaXMgZXF1aXZhbGVudCB0b1xyXG4gICAgICogYGBgdHNcclxuICAgICAqIGNhbmNlbGxhYmxlUHJvbWlzZS50aGVuKHVuZGVmaW5lZCwgb25yZWplY3RlZCwgb25jYW5jZWxsZWQpO1xyXG4gICAgICogYGBgXHJcbiAgICAgKiBhbmQgdGhlIHNhbWUgY2F2ZWF0cyBhcHBseS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBBIFByb21pc2UgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHRoZSBjYWxsYmFjay5cclxuICAgICAqIENhbmNlbGxhdGlvbiByZXF1ZXN0cyBvbiB0aGUgcmV0dXJuZWQgcHJvbWlzZVxyXG4gICAgICogd2lsbCBwcm9wYWdhdGUgdXAgdGhlIGNoYWluIHRvIHRoZSBwYXJlbnQgcHJvbWlzZSxcclxuICAgICAqIGJ1dCBub3QgaW4gdGhlIG90aGVyIGRpcmVjdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgcHJvbWlzZSByZXR1cm5lZCBmcm9tIHtAbGluayBjYW5jZWx9IHdpbGwgZnVsZmlsbCBvbmx5IGFmdGVyIGFsbCBhdHRhY2hlZCBoYW5kbGVyc1xyXG4gICAgICogdXAgdGhlIGVudGlyZSBwcm9taXNlIGNoYWluIGhhdmUgYmVlbiBydW4uXHJcbiAgICAgKlxyXG4gICAgICogSWYgYG9ucmVqZWN0ZWRgIHJldHVybnMgYSBjYW5jZWxsYWJsZSBwcm9taXNlLFxyXG4gICAgICogY2FuY2VsbGF0aW9uIHJlcXVlc3RzIHdpbGwgYmUgZGl2ZXJ0ZWQgdG8gaXQsXHJcbiAgICAgKiBhbmQgdGhlIHNwZWNpZmllZCBgb25jYW5jZWxsZWRgIGNhbGxiYWNrIHdpbGwgYmUgZGlzY2FyZGVkLlxyXG4gICAgICogU2VlIHtAbGluayB0aGVufSBmb3IgbW9yZSBkZXRhaWxzLlxyXG4gICAgICovXHJcbiAgICBjYXRjaDxUUmVzdWx0ID0gbmV2ZXI+KG9ucmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiAoUHJvbWlzZUxpa2U8VFJlc3VsdD4gfCBUUmVzdWx0KSkgfCB1bmRlZmluZWQgfCBudWxsLCBvbmNhbmNlbGxlZD86IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlcik6IENhbmNlbGxhYmxlUHJvbWlzZTxUIHwgVFJlc3VsdD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvbnJlamVjdGVkLCBvbmNhbmNlbGxlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhIGNhbGxiYWNrIHRoYXQgaXMgaW52b2tlZCB3aGVuIHRoZSBDYW5jZWxsYWJsZVByb21pc2UgaXMgc2V0dGxlZCAoZnVsZmlsbGVkIG9yIHJlamVjdGVkKS4gVGhlXHJcbiAgICAgKiByZXNvbHZlZCB2YWx1ZSBjYW5ub3QgYmUgYWNjZXNzZWQgb3IgbW9kaWZpZWQgZnJvbSB0aGUgY2FsbGJhY2suXHJcbiAgICAgKiBUaGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIHNldHRsZSBpbiB0aGUgc2FtZSBzdGF0ZSBhcyB0aGUgb3JpZ2luYWwgb25lXHJcbiAgICAgKiBhZnRlciB0aGUgcHJvdmlkZWQgY2FsbGJhY2sgaGFzIGNvbXBsZXRlZCBleGVjdXRpb24sXHJcbiAgICAgKiB1bmxlc3MgdGhlIGNhbGxiYWNrIHRocm93cyBvciByZXR1cm5zIGEgcmVqZWN0aW5nIHByb21pc2UsXHJcbiAgICAgKiBpbiB3aGljaCBjYXNlIHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgcmVqZWN0IGFzIHdlbGwuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIG9wdGlvbmFsIGBvbmNhbmNlbGxlZGAgYXJndW1lbnQgd2lsbCBiZSBpbnZva2VkIHdoZW4gdGhlIHJldHVybmVkIHByb21pc2UgaXMgY2FuY2VsbGVkLFxyXG4gICAgICogd2l0aCB0aGUgc2FtZSBzZW1hbnRpY3MgYXMgdGhlIGBvbmNhbmNlbGxlZGAgYXJndW1lbnQgb2YgdGhlIGNvbnN0cnVjdG9yLlxyXG4gICAgICogT25jZSB0aGUgcGFyZW50IHByb21pc2Ugc2V0dGxlcywgdGhlIGBvbmZpbmFsbHlgIGNhbGxiYWNrIHdpbGwgcnVuLFxyXG4gICAgICogX2V2ZW4gYWZ0ZXIgdGhlIHJldHVybmVkIHByb21pc2UgaGFzIGJlZW4gY2FuY2VsbGVkOl9cclxuICAgICAqIGluIHRoYXQgY2FzZSwgc2hvdWxkIGl0IHJlamVjdCBvciB0aHJvdywgdGhlIHJlYXNvbiB3aWxsIGJlIHdyYXBwZWRcclxuICAgICAqIGluIGEge0BsaW5rIENhbmNlbGxlZFJlamVjdGlvbkVycm9yfSBhbmQgYnViYmxlZCB1cCBhcyBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGltcGxlbWVudGVkIGluIHRlcm1zIG9mIHtAbGluayB0aGVufSBhbmQgdGhlIHNhbWUgY2F2ZWF0cyBhcHBseS5cclxuICAgICAqIEl0IGlzIHBvbHlmaWxsZWQsIGhlbmNlIGF2YWlsYWJsZSBpbiBldmVyeSBPUy93ZWJ2aWV3IHZlcnNpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgQSBQcm9taXNlIGZvciB0aGUgY29tcGxldGlvbiBvZiB0aGUgY2FsbGJhY2suXHJcbiAgICAgKiBDYW5jZWxsYXRpb24gcmVxdWVzdHMgb24gdGhlIHJldHVybmVkIHByb21pc2VcclxuICAgICAqIHdpbGwgcHJvcGFnYXRlIHVwIHRoZSBjaGFpbiB0byB0aGUgcGFyZW50IHByb21pc2UsXHJcbiAgICAgKiBidXQgbm90IGluIHRoZSBvdGhlciBkaXJlY3Rpb24uXHJcbiAgICAgKlxyXG4gICAgICogVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB7QGxpbmsgY2FuY2VsfSB3aWxsIGZ1bGZpbGwgb25seSBhZnRlciBhbGwgYXR0YWNoZWQgaGFuZGxlcnNcclxuICAgICAqIHVwIHRoZSBlbnRpcmUgcHJvbWlzZSBjaGFpbiBoYXZlIGJlZW4gcnVuLlxyXG4gICAgICpcclxuICAgICAqIElmIGBvbmZpbmFsbHlgIHJldHVybnMgYSBjYW5jZWxsYWJsZSBwcm9taXNlLFxyXG4gICAgICogY2FuY2VsbGF0aW9uIHJlcXVlc3RzIHdpbGwgYmUgZGl2ZXJ0ZWQgdG8gaXQsXHJcbiAgICAgKiBhbmQgdGhlIHNwZWNpZmllZCBgb25jYW5jZWxsZWRgIGNhbGxiYWNrIHdpbGwgYmUgZGlzY2FyZGVkLlxyXG4gICAgICogU2VlIHtAbGluayB0aGVufSBmb3IgbW9yZSBkZXRhaWxzLlxyXG4gICAgICovXHJcbiAgICBmaW5hbGx5KG9uZmluYWxseT86ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCB8IG51bGwsIG9uY2FuY2VsbGVkPzogQ2FuY2VsbGFibGVQcm9taXNlQ2FuY2VsbGVyKTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcclxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ2FuY2VsbGFibGVQcm9taXNlKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2FuY2VsbGFibGVQcm9taXNlLnByb3RvdHlwZS5maW5hbGx5IGNhbGxlZCBvbiBhbiBpbnZhbGlkIG9iamVjdC5cIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWlzQ2FsbGFibGUob25maW5hbGx5KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50aGVuKG9uZmluYWxseSwgb25maW5hbGx5LCBvbmNhbmNlbGxlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy50aGVuKFxyXG4gICAgICAgICAgICAodmFsdWUpID0+IENhbmNlbGxhYmxlUHJvbWlzZS5yZXNvbHZlKG9uZmluYWxseSgpKS50aGVuKCgpID0+IHZhbHVlKSxcclxuICAgICAgICAgICAgKHJlYXNvbj8pID0+IENhbmNlbGxhYmxlUHJvbWlzZS5yZXNvbHZlKG9uZmluYWxseSgpKS50aGVuKCgpID0+IHsgdGhyb3cgcmVhc29uOyB9KSxcclxuICAgICAgICAgICAgb25jYW5jZWxsZWQsXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdlIHVzZSB0aGUgYFtTeW1ib2wuc3BlY2llc11gIHN0YXRpYyBwcm9wZXJ0eSwgaWYgYXZhaWxhYmxlLFxyXG4gICAgICogdG8gZGlzYWJsZSB0aGUgYnVpbHQtaW4gYXV0b21hdGljIHN1YmNsYXNzaW5nIGZlYXR1cmVzIGZyb20ge0BsaW5rIFByb21pc2V9LlxyXG4gICAgICogSXQgaXMgY3JpdGljYWwgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgdGhhdCBleHRlbmRlcnMgZG8gbm90IG92ZXJyaWRlIHRoaXMuXHJcbiAgICAgKiBPbmNlIHRoZSBwcm9wb3NhbCBhdCBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1ybS1idWlsdGluLXN1YmNsYXNzaW5nXHJcbiAgICAgKiBpcyBlaXRoZXIgYWNjZXB0ZWQgb3IgcmV0aXJlZCwgdGhpcyBpbXBsZW1lbnRhdGlvbiB3aWxsIGhhdmUgdG8gYmUgcmV2aXNlZCBhY2NvcmRpbmdseS5cclxuICAgICAqXHJcbiAgICAgKiBAaWdub3JlXHJcbiAgICAgKiBAaW50ZXJuYWxcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBbc3BlY2llc10oKSB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgQ2FuY2VsbGFibGVQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCBhbiBhcnJheSBvZiByZXN1bHRzXHJcbiAgICAgKiB3aGVuIGFsbCBvZiB0aGUgcHJvdmlkZWQgUHJvbWlzZXMgcmVzb2x2ZSwgb3IgcmVqZWN0ZWQgd2hlbiBhbnkgUHJvbWlzZSBpcyByZWplY3RlZC5cclxuICAgICAqXHJcbiAgICAgKiBFdmVyeSBvbmUgb2YgdGhlIHByb3ZpZGVkIG9iamVjdHMgdGhhdCBpcyBhIHRoZW5hYmxlIF9hbmRfIGNhbmNlbGxhYmxlIG9iamVjdFxyXG4gICAgICogd2lsbCBiZSBjYW5jZWxsZWQgd2hlbiB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBjYW5jZWxsZWQsIHdpdGggdGhlIHNhbWUgY2F1c2UuXHJcbiAgICAgKlxyXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhbGw8VD4odmFsdWVzOiBJdGVyYWJsZTxUIHwgUHJvbWlzZUxpa2U8VD4+KTogQ2FuY2VsbGFibGVQcm9taXNlPEF3YWl0ZWQ8VD5bXT47XHJcbiAgICBzdGF0aWMgYWxsPFQgZXh0ZW5kcyByZWFkb25seSB1bmtub3duW10gfCBbXT4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHsgLXJlYWRvbmx5IFtQIGluIGtleW9mIFRdOiBBd2FpdGVkPFRbUF0+OyB9PjtcclxuICAgIHN0YXRpYyBhbGw8VCBleHRlbmRzIEl0ZXJhYmxlPHVua25vd24+IHwgQXJyYXlMaWtlPHVua25vd24+Pih2YWx1ZXM6IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj4ge1xyXG4gICAgICAgIGxldCBjb2xsZWN0ZWQgPSBBcnJheS5mcm9tKHZhbHVlcyk7XHJcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGNvbGxlY3RlZC5sZW5ndGggPT09IDBcclxuICAgICAgICAgICAgPyBDYW5jZWxsYWJsZVByb21pc2UucmVzb2x2ZShjb2xsZWN0ZWQpXHJcbiAgICAgICAgICAgIDogbmV3IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2b2lkIFByb21pc2UuYWxsKGNvbGxlY3RlZCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgICAgICB9LCAoY2F1c2U/KTogUHJvbWlzZTx2b2lkPiA9PiBjYW5jZWxBbGwocHJvbWlzZSwgY29sbGVjdGVkLCBjYXVzZSkpO1xyXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIENhbmNlbGxhYmxlUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYW4gYXJyYXkgb2YgcmVzdWx0c1xyXG4gICAgICogd2hlbiBhbGwgb2YgdGhlIHByb3ZpZGVkIFByb21pc2VzIHJlc29sdmUgb3IgcmVqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEV2ZXJ5IG9uZSBvZiB0aGUgcHJvdmlkZWQgb2JqZWN0cyB0aGF0IGlzIGEgdGhlbmFibGUgX2FuZF8gY2FuY2VsbGFibGUgb2JqZWN0XHJcbiAgICAgKiB3aWxsIGJlIGNhbmNlbGxlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCwgd2l0aCB0aGUgc2FtZSBjYXVzZS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFsbFNldHRsZWQ8VD4odmFsdWVzOiBJdGVyYWJsZTxUIHwgUHJvbWlzZUxpa2U8VD4+KTogQ2FuY2VsbGFibGVQcm9taXNlPFByb21pc2VTZXR0bGVkUmVzdWx0PEF3YWl0ZWQ8VD4+W10+O1xyXG4gICAgc3RhdGljIGFsbFNldHRsZWQ8VCBleHRlbmRzIHJlYWRvbmx5IHVua25vd25bXSB8IFtdPih2YWx1ZXM6IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8eyAtcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFByb21pc2VTZXR0bGVkUmVzdWx0PEF3YWl0ZWQ8VFtQXT4+OyB9PjtcclxuICAgIHN0YXRpYyBhbGxTZXR0bGVkPFQgZXh0ZW5kcyBJdGVyYWJsZTx1bmtub3duPiB8IEFycmF5TGlrZTx1bmtub3duPj4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+IHtcclxuICAgICAgICBsZXQgY29sbGVjdGVkID0gQXJyYXkuZnJvbSh2YWx1ZXMpO1xyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBjb2xsZWN0ZWQubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgID8gQ2FuY2VsbGFibGVQcm9taXNlLnJlc29sdmUoY29sbGVjdGVkKVxyXG4gICAgICAgICAgICA6IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdm9pZCBQcm9taXNlLmFsbFNldHRsZWQoY29sbGVjdGVkKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgICAgIH0sIChjYXVzZT8pOiBQcm9taXNlPHZvaWQ+ID0+IGNhbmNlbEFsbChwcm9taXNlLCBjb2xsZWN0ZWQsIGNhdXNlKSk7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYW55IGZ1bmN0aW9uIHJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIGJ5IHRoZSBmaXJzdCBnaXZlbiBwcm9taXNlIHRvIGJlIGZ1bGZpbGxlZCxcclxuICAgICAqIG9yIHJlamVjdGVkIHdpdGggYW4gQWdncmVnYXRlRXJyb3IgY29udGFpbmluZyBhbiBhcnJheSBvZiByZWplY3Rpb24gcmVhc29uc1xyXG4gICAgICogaWYgYWxsIG9mIHRoZSBnaXZlbiBwcm9taXNlcyBhcmUgcmVqZWN0ZWQuXHJcbiAgICAgKiBJdCByZXNvbHZlcyBhbGwgZWxlbWVudHMgb2YgdGhlIHBhc3NlZCBpdGVyYWJsZSB0byBwcm9taXNlcyBhcyBpdCBydW5zIHRoaXMgYWxnb3JpdGhtLlxyXG4gICAgICpcclxuICAgICAqIEV2ZXJ5IG9uZSBvZiB0aGUgcHJvdmlkZWQgb2JqZWN0cyB0aGF0IGlzIGEgdGhlbmFibGUgX2FuZF8gY2FuY2VsbGFibGUgb2JqZWN0XHJcbiAgICAgKiB3aWxsIGJlIGNhbmNlbGxlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCwgd2l0aCB0aGUgc2FtZSBjYXVzZS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFueTxUPih2YWx1ZXM6IEl0ZXJhYmxlPFQgfCBQcm9taXNlTGlrZTxUPj4pOiBDYW5jZWxsYWJsZVByb21pc2U8QXdhaXRlZDxUPj47XHJcbiAgICBzdGF0aWMgYW55PFQgZXh0ZW5kcyByZWFkb25seSB1bmtub3duW10gfCBbXT4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPEF3YWl0ZWQ8VFtudW1iZXJdPj47XHJcbiAgICBzdGF0aWMgYW55PFQgZXh0ZW5kcyBJdGVyYWJsZTx1bmtub3duPiB8IEFycmF5TGlrZTx1bmtub3duPj4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+IHtcclxuICAgICAgICBsZXQgY29sbGVjdGVkID0gQXJyYXkuZnJvbSh2YWx1ZXMpO1xyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBjb2xsZWN0ZWQubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgID8gQ2FuY2VsbGFibGVQcm9taXNlLnJlc29sdmUoY29sbGVjdGVkKVxyXG4gICAgICAgICAgICA6IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdm9pZCBQcm9taXNlLmFueShjb2xsZWN0ZWQpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgfSwgKGNhdXNlPyk6IFByb21pc2U8dm9pZD4gPT4gY2FuY2VsQWxsKHByb21pc2UsIGNvbGxlY3RlZCwgY2F1c2UpKTtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQgd2hlbiBhbnkgb2YgdGhlIHByb3ZpZGVkIFByb21pc2VzIGFyZSByZXNvbHZlZCBvciByZWplY3RlZC5cclxuICAgICAqXHJcbiAgICAgKiBFdmVyeSBvbmUgb2YgdGhlIHByb3ZpZGVkIG9iamVjdHMgdGhhdCBpcyBhIHRoZW5hYmxlIF9hbmRfIGNhbmNlbGxhYmxlIG9iamVjdFxyXG4gICAgICogd2lsbCBiZSBjYW5jZWxsZWQgd2hlbiB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBjYW5jZWxsZWQsIHdpdGggdGhlIHNhbWUgY2F1c2UuXHJcbiAgICAgKlxyXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyByYWNlPFQ+KHZhbHVlczogSXRlcmFibGU8VCB8IFByb21pc2VMaWtlPFQ+Pik6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFQ+PjtcclxuICAgIHN0YXRpYyByYWNlPFQgZXh0ZW5kcyByZWFkb25seSB1bmtub3duW10gfCBbXT4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPEF3YWl0ZWQ8VFtudW1iZXJdPj47XHJcbiAgICBzdGF0aWMgcmFjZTxUIGV4dGVuZHMgSXRlcmFibGU8dW5rbm93bj4gfCBBcnJheUxpa2U8dW5rbm93bj4+KHZhbHVlczogVCk6IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPiB7XHJcbiAgICAgICAgbGV0IGNvbGxlY3RlZCA9IEFycmF5LmZyb20odmFsdWVzKTtcclxuICAgICAgICBjb25zdCBwcm9taXNlID0gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHZvaWQgUHJvbWlzZS5yYWNlKGNvbGxlY3RlZCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgIH0sIChjYXVzZT8pOiBQcm9taXNlPHZvaWQ+ID0+IGNhbmNlbEFsbChwcm9taXNlLCBjb2xsZWN0ZWQsIGNhdXNlKSk7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGNhbmNlbGxlZCBDYW5jZWxsYWJsZVByb21pc2UgZm9yIHRoZSBwcm92aWRlZCBjYXVzZS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNhbmNlbDxUID0gbmV2ZXI+KGNhdXNlPzogYW55KTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcclxuICAgICAgICBjb25zdCBwID0gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTxUPigoKSA9PiB7fSk7XHJcbiAgICAgICAgcC5jYW5jZWwoY2F1c2UpO1xyXG4gICAgICAgIHJldHVybiBwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBDYW5jZWxsYWJsZVByb21pc2UgdGhhdCBjYW5jZWxzXHJcbiAgICAgKiBhZnRlciB0aGUgc3BlY2lmaWVkIHRpbWVvdXQsIHdpdGggdGhlIHByb3ZpZGVkIGNhdXNlLlxyXG4gICAgICpcclxuICAgICAqIElmIHRoZSB7QGxpbmsgQWJvcnRTaWduYWwudGltZW91dH0gZmFjdG9yeSBtZXRob2QgaXMgYXZhaWxhYmxlLFxyXG4gICAgICogaXQgaXMgdXNlZCB0byBiYXNlIHRoZSB0aW1lb3V0IG9uIF9hY3RpdmVfIHRpbWUgcmF0aGVyIHRoYW4gX2VsYXBzZWRfIHRpbWUuXHJcbiAgICAgKiBPdGhlcndpc2UsIGB0aW1lb3V0YCBmYWxscyBiYWNrIHRvIHtAbGluayBzZXRUaW1lb3V0fS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHRpbWVvdXQ8VCA9IG5ldmVyPihtaWxsaXNlY29uZHM6IG51bWJlciwgY2F1c2U/OiBhbnkpOiBDYW5jZWxsYWJsZVByb21pc2U8VD4ge1xyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPFQ+KCgpID0+IHt9KTtcclxuICAgICAgICBpZiAoQWJvcnRTaWduYWwgJiYgdHlwZW9mIEFib3J0U2lnbmFsID09PSAnZnVuY3Rpb24nICYmIEFib3J0U2lnbmFsLnRpbWVvdXQgJiYgdHlwZW9mIEFib3J0U2lnbmFsLnRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgQWJvcnRTaWduYWwudGltZW91dChtaWxsaXNlY29uZHMpLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgKCkgPT4gdm9pZCBwcm9taXNlLmNhbmNlbChjYXVzZSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdm9pZCBwcm9taXNlLmNhbmNlbChjYXVzZSksIG1pbGxpc2Vjb25kcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBDYW5jZWxsYWJsZVByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciB0aGUgc3BlY2lmaWVkIHRpbWVvdXQuXHJcbiAgICAgKiBUaGUgcmV0dXJuZWQgcHJvbWlzZSBjYW4gYmUgY2FuY2VsbGVkIHdpdGhvdXQgY29uc2VxdWVuY2VzLlxyXG4gICAgICpcclxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2xlZXAobWlsbGlzZWNvbmRzOiBudW1iZXIpOiBDYW5jZWxsYWJsZVByb21pc2U8dm9pZD47XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlIHRoYXQgcmVzb2x2ZXMgYWZ0ZXJcclxuICAgICAqIHRoZSBzcGVjaWZpZWQgdGltZW91dCwgd2l0aCB0aGUgcHJvdmlkZWQgdmFsdWUuXHJcbiAgICAgKiBUaGUgcmV0dXJuZWQgcHJvbWlzZSBjYW4gYmUgY2FuY2VsbGVkIHdpdGhvdXQgY29uc2VxdWVuY2VzLlxyXG4gICAgICpcclxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2xlZXA8VD4obWlsbGlzZWNvbmRzOiBudW1iZXIsIHZhbHVlOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+O1xyXG4gICAgc3RhdGljIHNsZWVwPFQgPSB2b2lkPihtaWxsaXNlY29uZHM6IG51bWJlciwgdmFsdWU/OiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcclxuICAgICAgICByZXR1cm4gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTxUPigocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHJlc29sdmUodmFsdWUhKSwgbWlsbGlzZWNvbmRzKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmVqZWN0ZWQgQ2FuY2VsbGFibGVQcm9taXNlIGZvciB0aGUgcHJvdmlkZWQgcmVhc29uLlxyXG4gICAgICpcclxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmVqZWN0PFQgPSBuZXZlcj4ocmVhc29uPzogYW55KTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcclxuICAgICAgICByZXR1cm4gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTxUPigoXywgcmVqZWN0KSA9PiByZWplY3QocmVhc29uKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJlc29sdmVkIENhbmNlbGxhYmxlUHJvbWlzZS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJlc29sdmUoKTogQ2FuY2VsbGFibGVQcm9taXNlPHZvaWQ+O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJlc29sdmVkIENhbmNlbGxhYmxlUHJvbWlzZSBmb3IgdGhlIHByb3ZpZGVkIHZhbHVlLlxyXG4gICAgICpcclxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmVzb2x2ZTxUPih2YWx1ZTogVCk6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFQ+PjtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyByZXNvbHZlZCBDYW5jZWxsYWJsZVByb21pc2UgZm9yIHRoZSBwcm92aWRlZCB2YWx1ZS5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJlc29sdmU8VD4odmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPik6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFQ+PjtcclxuICAgIHN0YXRpYyByZXNvbHZlPFQgPSB2b2lkPih2YWx1ZT86IFQgfCBQcm9taXNlTGlrZTxUPik6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFQ+PiB7XHJcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQ2FuY2VsbGFibGVQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIC8vIE9wdGltaXNlIGZvciBjYW5jZWxsYWJsZSBwcm9taXNlcy5cclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTxhbnk+KChyZXNvbHZlKSA9PiByZXNvbHZlKHZhbHVlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IENhbmNlbGxhYmxlUHJvbWlzZSBhbmQgcmV0dXJucyBpdCBpbiBhbiBvYmplY3QsIGFsb25nIHdpdGggaXRzIHJlc29sdmUgYW5kIHJlamVjdCBmdW5jdGlvbnNcclxuICAgICAqIGFuZCBhIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBjYW5jZWxsYXRpb24gY2FsbGJhY2suXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBtZXRob2QgaXMgcG9seWZpbGxlZCwgaGVuY2UgYXZhaWxhYmxlIGluIGV2ZXJ5IE9TL3dlYnZpZXcgdmVyc2lvbi5cclxuICAgICAqXHJcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHdpdGhSZXNvbHZlcnM8VD4oKTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiB7XHJcbiAgICAgICAgbGV0IHJlc3VsdDogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiA9IHsgb25jYW5jZWxsZWQ6IG51bGwgfSBhcyBhbnk7XHJcbiAgICAgICAgcmVzdWx0LnByb21pc2UgPSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgcmVzdWx0LnJlc29sdmUgPSByZXNvbHZlO1xyXG4gICAgICAgICAgICByZXN1bHQucmVqZWN0ID0gcmVqZWN0O1xyXG4gICAgICAgIH0sIChjYXVzZT86IGFueSkgPT4geyByZXN1bHQub25jYW5jZWxsZWQ/LihjYXVzZSk7IH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgY2FsbGJhY2sgdGhhdCBpbXBsZW1lbnRzIHRoZSBjYW5jZWxsYXRpb24gYWxnb3JpdGhtIGZvciB0aGUgZ2l2ZW4gY2FuY2VsbGFibGUgcHJvbWlzZS5cclxuICogVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB0aGUgcmVzdWx0aW5nIGZ1bmN0aW9uIGRvZXMgbm90IHJlamVjdC5cclxuICovXHJcbmZ1bmN0aW9uIGNhbmNlbGxlckZvcjxUPihwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2VXaXRoUmVzb2x2ZXJzPFQ+LCBzdGF0ZTogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGUpIHtcclxuICAgIGxldCBjYW5jZWxsYXRpb25Qcm9taXNlOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgcmV0dXJuIChyZWFzb246IENhbmNlbEVycm9yKTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+ID0+IHtcclxuICAgICAgICBpZiAoIXN0YXRlLnNldHRsZWQpIHtcclxuICAgICAgICAgICAgc3RhdGUuc2V0dGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHN0YXRlLnJlYXNvbiA9IHJlYXNvbjtcclxuICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QocmVhc29uKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEF0dGFjaCBhbiBlcnJvciBoYW5kbGVyIHRoYXQgaWdub3JlcyB0aGlzIHNwZWNpZmljIHJlamVjdGlvbiByZWFzb24gYW5kIG5vdGhpbmcgZWxzZS5cclxuICAgICAgICAgICAgLy8gSW4gdGhlb3J5LCBhIHNhbmUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBhdCB0aGlzIHBvaW50XHJcbiAgICAgICAgICAgIC8vIHNob3VsZCBhbHdheXMgcmVqZWN0IHdpdGggb3VyIGNhbmNlbGxhdGlvbiByZWFzb24sXHJcbiAgICAgICAgICAgIC8vIGhlbmNlIHRoZSBoYW5kbGVyIHdpbGwgbmV2ZXIgdGhyb3cuXHJcbiAgICAgICAgICAgIHZvaWQgUHJvbWlzZS5wcm90b3R5cGUudGhlbi5jYWxsKHByb21pc2UucHJvbWlzZSwgdW5kZWZpbmVkLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyICE9PSByZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgcmVhc29uIGlzIG5vdCBzZXQsIHRoZSBwcm9taXNlIHJlc29sdmVkIHJlZ3VsYXJseSwgaGVuY2Ugd2UgbXVzdCBub3QgY2FsbCBvbmNhbmNlbGxlZC5cclxuICAgICAgICAvLyBJZiBvbmNhbmNlbGxlZCBpcyB1bnNldCwgbm8gbmVlZCB0byBnbyBhbnkgZnVydGhlci5cclxuICAgICAgICBpZiAoIXN0YXRlLnJlYXNvbiB8fCAhcHJvbWlzZS5vbmNhbmNlbGxlZCkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgY2FuY2VsbGF0aW9uUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHByb21pc2Uub25jYW5jZWxsZWQhKHN0YXRlLnJlYXNvbiEuY2F1c2UpKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3IocHJvbWlzZS5wcm9taXNlLCBlcnIsIFwiVW5oYW5kbGVkIGV4Y2VwdGlvbiBpbiBvbmNhbmNlbGxlZCBjYWxsYmFjay5cIikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkuY2F0Y2goKHJlYXNvbj8pID0+IHtcclxuICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IENhbmNlbGxlZFJlamVjdGlvbkVycm9yKHByb21pc2UucHJvbWlzZSwgcmVhc29uLCBcIlVuaGFuZGxlZCByZWplY3Rpb24gaW4gb25jYW5jZWxsZWQgY2FsbGJhY2suXCIpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVW5zZXQgb25jYW5jZWxsZWQgdG8gcHJldmVudCByZXBlYXRlZCBjYWxscy5cclxuICAgICAgICBwcm9taXNlLm9uY2FuY2VsbGVkID0gbnVsbDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNhbmNlbGxhdGlvblByb21pc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgY2FsbGJhY2sgdGhhdCBpbXBsZW1lbnRzIHRoZSByZXNvbHV0aW9uIGFsZ29yaXRobSBmb3IgdGhlIGdpdmVuIGNhbmNlbGxhYmxlIHByb21pc2UuXHJcbiAqL1xyXG5mdW5jdGlvbiByZXNvbHZlckZvcjxUPihwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2VXaXRoUmVzb2x2ZXJzPFQ+LCBzdGF0ZTogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGUpOiBDYW5jZWxsYWJsZVByb21pc2VSZXNvbHZlcjxUPiB7XHJcbiAgICByZXR1cm4gKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHN0YXRlLnJlc29sdmluZykgeyByZXR1cm47IH1cclxuICAgICAgICBzdGF0ZS5yZXNvbHZpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAodmFsdWUgPT09IHByb21pc2UucHJvbWlzZSkge1xyXG4gICAgICAgICAgICBpZiAoc3RhdGUuc2V0dGxlZCkgeyByZXR1cm47IH1cclxuICAgICAgICAgICAgc3RhdGUuc2V0dGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2UgY2Fubm90IGJlIHJlc29sdmVkIHdpdGggaXRzZWxmLlwiKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsICYmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykpIHtcclxuICAgICAgICAgICAgbGV0IHRoZW46IGFueTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoZW4gPSAodmFsdWUgYXMgYW55KS50aGVuO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnNldHRsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGlzQ2FsbGFibGUodGhlbikpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNhbmNlbCA9ICh2YWx1ZSBhcyBhbnkpLmNhbmNlbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDYWxsYWJsZShjYW5jZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9uY2FuY2VsbGVkID0gKGNhdXNlPzogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWZsZWN0LmFwcGx5KGNhbmNlbCwgdmFsdWUsIFtjYXVzZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUucmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBhbHJlYWR5IGNhbmNlbGxlZCwgcHJvcGFnYXRlIGNhbmNlbGxhdGlvbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBwcm9taXNlIHJldHVybmVkIGZyb20gdGhlIGNhbmNlbGxlciBhbGdvcml0aG0gZG9lcyBub3QgcmVqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyBpdCBjYW4gYmUgZGlzY2FyZGVkIHNhZmVseS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgY2FuY2VsbGVyRm9yKHsgLi4ucHJvbWlzZSwgb25jYW5jZWxsZWQgfSwgc3RhdGUpKHN0YXRlLnJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlLm9uY2FuY2VsbGVkID0gb25jYW5jZWxsZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHt9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3U3RhdGU6IENhbmNlbGxhYmxlUHJvbWlzZVN0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvb3Q6IHN0YXRlLnJvb3QsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2aW5nOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBnZXQgc2V0dGxlZCgpIHsgcmV0dXJuIHRoaXMucm9vdC5zZXR0bGVkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0IHNldHRsZWQodmFsdWUpIHsgdGhpcy5yb290LnNldHRsZWQgPSB2YWx1ZTsgfSxcclxuICAgICAgICAgICAgICAgICAgICBnZXQgcmVhc29uKCkgeyByZXR1cm4gdGhpcy5yb290LnJlYXNvbiB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlamVjdG9yID0gcmVqZWN0b3JGb3IocHJvbWlzZSwgbmV3U3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBSZWZsZWN0LmFwcGx5KHRoZW4sIHZhbHVlLCBbcmVzb2x2ZXJGb3IocHJvbWlzZSwgbmV3U3RhdGUpLCByZWplY3Rvcl0pO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0b3IoZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gSU1QT1JUQU5UIVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUuc2V0dGxlZCkgeyByZXR1cm47IH1cclxuICAgICAgICBzdGF0ZS5zZXR0bGVkID0gdHJ1ZTtcclxuICAgICAgICBwcm9taXNlLnJlc29sdmUodmFsdWUpO1xyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBjYWxsYmFjayB0aGF0IGltcGxlbWVudHMgdGhlIHJlamVjdGlvbiBhbGdvcml0aG0gZm9yIHRoZSBnaXZlbiBjYW5jZWxsYWJsZSBwcm9taXNlLlxyXG4gKi9cclxuZnVuY3Rpb24gcmVqZWN0b3JGb3I8VD4ocHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiwgc3RhdGU6IENhbmNlbGxhYmxlUHJvbWlzZVN0YXRlKTogQ2FuY2VsbGFibGVQcm9taXNlUmVqZWN0b3Ige1xyXG4gICAgcmV0dXJuIChyZWFzb24/KSA9PiB7XHJcbiAgICAgICAgaWYgKHN0YXRlLnJlc29sdmluZykgeyByZXR1cm47IH1cclxuICAgICAgICBzdGF0ZS5yZXNvbHZpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUuc2V0dGxlZCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlYXNvbiBpbnN0YW5jZW9mIENhbmNlbEVycm9yICYmIHN0YXRlLnJlYXNvbiBpbnN0YW5jZW9mIENhbmNlbEVycm9yICYmIE9iamVjdC5pcyhyZWFzb24uY2F1c2UsIHN0YXRlLnJlYXNvbi5jYXVzZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTd2FsbG93IGxhdGUgcmVqZWN0aW9ucyB0aGF0IGFyZSBDYW5jZWxFcnJvcnMgd2hvc2UgY2FuY2VsbGF0aW9uIGNhdXNlIGlzIHRoZSBzYW1lIGFzIG91cnMuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIHt9XHJcblxyXG4gICAgICAgICAgICB2b2lkIFByb21pc2UucmVqZWN0KG5ldyBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcihwcm9taXNlLnByb21pc2UsIHJlYXNvbikpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YXRlLnNldHRsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENhbmNlbHMgYWxsIHZhbHVlcyBpbiBhbiBhcnJheSB0aGF0IGxvb2sgbGlrZSBjYW5jZWxsYWJsZSB0aGVuYWJsZXMuXHJcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgb25jZSBhbGwgY2FuY2VsbGF0aW9uIHByb2NlZHVyZXMgZm9yIHRoZSBnaXZlbiB2YWx1ZXMgaGF2ZSBzZXR0bGVkLlxyXG4gKi9cclxuZnVuY3Rpb24gY2FuY2VsQWxsKHBhcmVudDogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+LCB2YWx1ZXM6IGFueVtdLCBjYXVzZT86IGFueSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgcmVzdWx0czogUHJvbWlzZTx2b2lkPltdID0gW107XHJcblxyXG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcclxuICAgICAgICBsZXQgY2FuY2VsOiBDYW5jZWxsYWJsZVByb21pc2VDYW5jZWxsZXI7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKCFpc0NhbGxhYmxlKHZhbHVlLnRoZW4pKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGNhbmNlbCA9IHZhbHVlLmNhbmNlbDtcclxuICAgICAgICAgICAgaWYgKCFpc0NhbGxhYmxlKGNhbmNlbCkpIHsgY29udGludWU7IH1cclxuICAgICAgICB9IGNhdGNoIHsgY29udGludWU7IH1cclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdDogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+O1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFJlZmxlY3QuYXBwbHkoY2FuY2VsLCB2YWx1ZSwgW2NhdXNlXSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcihwYXJlbnQsIGVyciwgXCJVbmhhbmRsZWQgZXhjZXB0aW9uIGluIGNhbmNlbCBtZXRob2QuXCIpKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlc3VsdCkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgIHJlc3VsdHMucHVzaChcclxuICAgICAgICAgICAgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UgID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkpLmNhdGNoKChyZWFzb24/KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3IocGFyZW50LCByZWFzb24sIFwiVW5oYW5kbGVkIHJlamVjdGlvbiBpbiBjYW5jZWwgbWV0aG9kLlwiKSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cykgYXMgYW55O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBpdHMgYXJndW1lbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBpZGVudGl0eTxUPih4OiBUKTogVCB7XHJcbiAgICByZXR1cm4geDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRocm93cyBpdHMgYXJndW1lbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiB0aHJvd2VyKHJlYXNvbj86IGFueSk6IG5ldmVyIHtcclxuICAgIHRocm93IHJlYXNvbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEF0dGVtcHRzIHZhcmlvdXMgc3RyYXRlZ2llcyB0byBjb252ZXJ0IGFuIGVycm9yIHRvIGEgc3RyaW5nLlxyXG4gKi9cclxuZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGVycjogYW55KTogc3RyaW5nIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yIHx8IHR5cGVvZiBlcnIgIT09ICdvYmplY3QnIHx8IGVyci50b1N0cmluZyAhPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcIiArIGVycjtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIHt9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZXJyKTtcclxuICAgIH0gY2F0Y2gge31cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXJyKTtcclxuICAgIH0gY2F0Y2gge31cclxuXHJcbiAgICByZXR1cm4gXCI8Y291bGQgbm90IGNvbnZlcnQgZXJyb3IgdG8gc3RyaW5nPlwiO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyB0aGUgY3VycmVudCBiYXJyaWVyIHByb21pc2UgZm9yIHRoZSBnaXZlbiBjYW5jZWxsYWJsZSBwcm9taXNlLiBJZiBuZWNlc3NhcnksIGluaXRpYWxpc2VzIHRoZSBiYXJyaWVyLlxyXG4gKi9cclxuZnVuY3Rpb24gY3VycmVudEJhcnJpZXI8VD4ocHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBsZXQgcHdyOiBQYXJ0aWFsPFByb21pc2VXaXRoUmVzb2x2ZXJzPHZvaWQ+PiA9IHByb21pc2VbYmFycmllclN5bV0gPz8ge307XHJcbiAgICBpZiAoISgncHJvbWlzZScgaW4gcHdyKSkge1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24ocHdyLCBwcm9taXNlV2l0aFJlc29sdmVyczx2b2lkPigpKTtcclxuICAgIH1cclxuICAgIGlmIChwcm9taXNlW2JhcnJpZXJTeW1dID09IG51bGwpIHtcclxuICAgICAgICBwd3IucmVzb2x2ZSEoKTtcclxuICAgICAgICBwcm9taXNlW2JhcnJpZXJTeW1dID0gcHdyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHB3ci5wcm9taXNlITtcclxufVxyXG5cclxuLy8gUG9seWZpbGwgUHJvbWlzZS53aXRoUmVzb2x2ZXJzLlxyXG5sZXQgcHJvbWlzZVdpdGhSZXNvbHZlcnMgPSBQcm9taXNlLndpdGhSZXNvbHZlcnM7XHJcbmlmIChwcm9taXNlV2l0aFJlc29sdmVycyAmJiB0eXBlb2YgcHJvbWlzZVdpdGhSZXNvbHZlcnMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgIHByb21pc2VXaXRoUmVzb2x2ZXJzID0gcHJvbWlzZVdpdGhSZXNvbHZlcnMuYmluZChQcm9taXNlKTtcclxufSBlbHNlIHtcclxuICAgIHByb21pc2VXaXRoUmVzb2x2ZXJzID0gZnVuY3Rpb24gPFQ+KCk6IFByb21pc2VXaXRoUmVzb2x2ZXJzPFQ+IHtcclxuICAgICAgICBsZXQgcmVzb2x2ZSE6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xyXG4gICAgICAgIGxldCByZWplY3QhOiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzLCByZWopID0+IHsgcmVzb2x2ZSA9IHJlczsgcmVqZWN0ID0gcmVqOyB9KTtcclxuICAgICAgICByZXR1cm4geyBwcm9taXNlLCByZXNvbHZlLCByZWplY3QgfTtcclxuICAgIH1cclxufVxyXG4iLCAiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuaW1wb3J0IHtuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lc30gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xyXG5cclxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQ2xpcGJvYXJkKTtcclxuXHJcbmNvbnN0IENsaXBib2FyZFNldFRleHQgPSAwO1xyXG5jb25zdCBDbGlwYm9hcmRUZXh0ID0gMTtcclxuXHJcbi8qKlxyXG4gKiBTZXRzIHRoZSB0ZXh0IHRvIHRoZSBDbGlwYm9hcmQuXHJcbiAqXHJcbiAqIEBwYXJhbSB0ZXh0IC0gVGhlIHRleHQgdG8gYmUgc2V0IHRvIHRoZSBDbGlwYm9hcmQuXHJcbiAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgb3BlcmF0aW9uIGlzIHN1Y2Nlc3NmdWwuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gU2V0VGV4dCh0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBjYWxsKENsaXBib2FyZFNldFRleHQsIHt0ZXh0fSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIENsaXBib2FyZCB0ZXh0XHJcbiAqXHJcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHRleHQgZnJvbSB0aGUgQ2xpcGJvYXJkLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIHJldHVybiBjYWxsKENsaXBib2FyZFRleHQpO1xyXG59XHJcbiIsICIvKlxyXG4gX1x0ICAgX19cdCAgXyBfX1xyXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNpemUge1xyXG4gICAgLyoqIFRoZSB3aWR0aCBvZiBhIHJlY3Rhbmd1bGFyIGFyZWEuICovXHJcbiAgICBXaWR0aDogbnVtYmVyO1xyXG4gICAgLyoqIFRoZSBoZWlnaHQgb2YgYSByZWN0YW5ndWxhciBhcmVhLiAqL1xyXG4gICAgSGVpZ2h0OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVjdCB7XHJcbiAgICAvKiogVGhlIFggY29vcmRpbmF0ZSBvZiB0aGUgb3JpZ2luLiAqL1xyXG4gICAgWDogbnVtYmVyO1xyXG4gICAgLyoqIFRoZSBZIGNvb3JkaW5hdGUgb2YgdGhlIG9yaWdpbi4gKi9cclxuICAgIFk6IG51bWJlcjtcclxuICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIHJlY3RhbmdsZS4gKi9cclxuICAgIFdpZHRoOiBudW1iZXI7XHJcbiAgICAvKiogVGhlIGhlaWdodCBvZiB0aGUgcmVjdGFuZ2xlLiAqL1xyXG4gICAgSGVpZ2h0OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2NyZWVuIHtcclxuICAgIC8qKiBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIHNjcmVlbi4gKi9cclxuICAgIElEOiBzdHJpbmc7XHJcbiAgICAvKiogSHVtYW4tcmVhZGFibGUgbmFtZSBvZiB0aGUgc2NyZWVuLiAqL1xyXG4gICAgTmFtZTogc3RyaW5nO1xyXG4gICAgLyoqIFRoZSBzY2FsZSBmYWN0b3Igb2YgdGhlIHNjcmVlbiAoRFBJLzk2KS4gMSA9IHN0YW5kYXJkIERQSSwgMiA9IEhpRFBJIChSZXRpbmEpLCBldGMuICovXHJcbiAgICBTY2FsZUZhY3RvcjogbnVtYmVyO1xyXG4gICAgLyoqIFRoZSBYIGNvb3JkaW5hdGUgb2YgdGhlIHNjcmVlbi4gKi9cclxuICAgIFg6IG51bWJlcjtcclxuICAgIC8qKiBUaGUgWSBjb29yZGluYXRlIG9mIHRoZSBzY3JlZW4uICovXHJcbiAgICBZOiBudW1iZXI7XHJcbiAgICAvKiogQ29udGFpbnMgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHNjcmVlbi4gKi9cclxuICAgIFNpemU6IFNpemU7XHJcbiAgICAvKiogQ29udGFpbnMgdGhlIGJvdW5kcyBvZiB0aGUgc2NyZWVuIGluIHRlcm1zIG9mIFgsIFksIFdpZHRoLCBhbmQgSGVpZ2h0LiAqL1xyXG4gICAgQm91bmRzOiBSZWN0O1xyXG4gICAgLyoqIENvbnRhaW5zIHRoZSBwaHlzaWNhbCBib3VuZHMgb2YgdGhlIHNjcmVlbiBpbiB0ZXJtcyBvZiBYLCBZLCBXaWR0aCwgYW5kIEhlaWdodCAoYmVmb3JlIHNjYWxpbmcpLiAqL1xyXG4gICAgUGh5c2ljYWxCb3VuZHM6IFJlY3Q7XHJcbiAgICAvKiogQ29udGFpbnMgdGhlIGFyZWEgb2YgdGhlIHNjcmVlbiB0aGF0IGlzIGFjdHVhbGx5IHVzYWJsZSAoZXhjbHVkaW5nIHRhc2tiYXIgYW5kIG90aGVyIHN5c3RlbSBVSSkuICovXHJcbiAgICBXb3JrQXJlYTogUmVjdDtcclxuICAgIC8qKiBDb250YWlucyB0aGUgcGh5c2ljYWwgV29ya0FyZWEgb2YgdGhlIHNjcmVlbiAoYmVmb3JlIHNjYWxpbmcpLiAqL1xyXG4gICAgUGh5c2ljYWxXb3JrQXJlYTogUmVjdDtcclxuICAgIC8qKiBUcnVlIGlmIHRoaXMgaXMgdGhlIHByaW1hcnkgbW9uaXRvciBzZWxlY3RlZCBieSB0aGUgdXNlciBpbiB0aGUgb3BlcmF0aW5nIHN5c3RlbS4gKi9cclxuICAgIElzUHJpbWFyeTogYm9vbGVhbjtcclxuICAgIC8qKiBUaGUgcm90YXRpb24gb2YgdGhlIHNjcmVlbi4gKi9cclxuICAgIFJvdGF0aW9uOiBudW1iZXI7XHJcbn1cclxuXHJcbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xyXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5TY3JlZW5zKTtcclxuXHJcbmNvbnN0IGdldEFsbCA9IDA7XHJcbmNvbnN0IGdldFByaW1hcnkgPSAxO1xyXG5jb25zdCBnZXRDdXJyZW50ID0gMjtcclxuY29uc3QgZ2V0QnlJRCA9IDM7XHJcbmNvbnN0IGdldEJ5SW5kZXggPSA0O1xyXG5cclxuLyoqXHJcbiAqIEdldHMgYWxsIHNjcmVlbnMuXHJcbiAqXHJcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIGFycmF5IG9mIFNjcmVlbiBvYmplY3RzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEdldEFsbCgpOiBQcm9taXNlPFNjcmVlbltdPiB7XHJcbiAgICByZXR1cm4gY2FsbChnZXRBbGwpO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyB0aGUgcHJpbWFyeSBzY3JlZW4uXHJcbiAqXHJcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBwcmltYXJ5IHNjcmVlbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBHZXRQcmltYXJ5KCk6IFByb21pc2U8U2NyZWVuPiB7XHJcbiAgICByZXR1cm4gY2FsbChnZXRQcmltYXJ5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIGN1cnJlbnQgYWN0aXZlIHNjcmVlbi5cclxuICpcclxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgY3VycmVudCBhY3RpdmUgc2NyZWVuLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEdldEN1cnJlbnQoKTogUHJvbWlzZTxTY3JlZW4+IHtcclxuICAgIHJldHVybiBjYWxsKGdldEN1cnJlbnQpO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBhIHNjcmVlbiBieSBpdHMgdW5pcXVlIGRpc3BsYXkgSUQuXHJcbiAqXHJcbiAqIEBwYXJhbSBpZCAtIFRoZSB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgc2NyZWVuLlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgbWF0Y2hpbmcgU2NyZWVuLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEdldEJ5SUQoaWQ6IHN0cmluZyk6IFByb21pc2U8U2NyZWVuPiB7XHJcbiAgICByZXR1cm4gY2FsbChnZXRCeUlELCB7IGlkIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBhIHNjcmVlbiBieSBpdHMgaW5kZXggaW4gdGhlIHNjcmVlbiBsaXN0LlxyXG4gKlxyXG4gKiBAcGFyYW0gaW5kZXggLSBUaGUgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgc2NyZWVuLlxyXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgbWF0Y2hpbmcgU2NyZWVuLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEdldEJ5SW5kZXgoaW5kZXg6IG51bWJlcik6IFByb21pc2U8U2NyZWVuPiB7XHJcbiAgICByZXR1cm4gY2FsbChnZXRCeUluZGV4LCB7IGluZGV4IH0pO1xyXG59XHJcbiIsICIvKlxyXG4gXyAgICAgX18gICAgIF8gX19cclxufCB8ICAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuXHJcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLklPUyk7XHJcblxyXG4vLyBNZXRob2QgSURzXHJcbmNvbnN0IEhhcHRpY3NJbXBhY3QgPSAwO1xyXG5jb25zdCBEZXZpY2VJbmZvID0gMTtcclxuXHJcbmV4cG9ydCBuYW1lc3BhY2UgSGFwdGljcyB7XHJcbiAgICBleHBvcnQgdHlwZSBJbXBhY3RTdHlsZSA9IFwibGlnaHRcInxcIm1lZGl1bVwifFwiaGVhdnlcInxcInNvZnRcInxcInJpZ2lkXCI7XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gSW1wYWN0KHN0eWxlOiBJbXBhY3RTdHlsZSA9IFwibWVkaXVtXCIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gY2FsbChIYXB0aWNzSW1wYWN0LCB7IHN0eWxlIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgbmFtZXNwYWNlIERldmljZSB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIEluZm8ge1xyXG4gICAgICAgIG1vZGVsOiBzdHJpbmc7XHJcbiAgICAgICAgc3lzdGVtTmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHN5c3RlbVZlcnNpb246IHN0cmluZztcclxuICAgICAgICBpc1NpbXVsYXRvcjogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBJbmZvKCk6IFByb21pc2U8SW5mbz4ge1xyXG4gICAgICAgIHJldHVybiBjYWxsKERldmljZUluZm8pO1xyXG4gICAgfVxyXG59XHJcbiIsICIvKlxyXG4gXyAgICAgX18gICAgIF8gX19cclxufCB8ICAvIC9fX18gXyhfKSAvX19fX1xyXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXHJcbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxyXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cclxuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xyXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XHJcbiovXHJcblxyXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcclxuXHJcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLkFuZHJvaWQpO1xyXG5cclxuLy8gTWV0aG9kIElEcyAobXVzdCBtYXRjaCBtZXNzYWdlcHJvY2Vzc29yX2FuZHJvaWQuZ28pXHJcbmNvbnN0IEhhcHRpY3NWaWJyYXRlID0gMDtcclxuY29uc3QgRGV2aWNlSW5mbyA9IDE7XHJcbmNvbnN0IFRvYXN0U2hvdyA9IDI7XHJcblxyXG5leHBvcnQgbmFtZXNwYWNlIEhhcHRpY3Mge1xyXG4gICAgLyoqIFZpYnJhdGUgdGhlIGRldmljZSBmb3IgdGhlIGdpdmVuIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcy4gKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBWaWJyYXRlKGR1cmF0aW9uTXM6IG51bWJlciA9IDEwMCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiBjYWxsKEhhcHRpY3NWaWJyYXRlLCB7IGR1cmF0aW9uOiBkdXJhdGlvbk1zIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgbmFtZXNwYWNlIERldmljZSB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIEluZm8ge1xyXG4gICAgICAgIHBsYXRmb3JtOiBzdHJpbmc7XHJcbiAgICAgICAgbWFudWZhY3R1cmVyOiBzdHJpbmc7XHJcbiAgICAgICAgYnJhbmQ6IHN0cmluZztcclxuICAgICAgICBtb2RlbDogc3RyaW5nO1xyXG4gICAgICAgIGRldmljZTogc3RyaW5nO1xyXG4gICAgICAgIHZlcnNpb246IHN0cmluZztcclxuICAgICAgICBzZGtJbnQ6IG51bWJlcjtcclxuICAgIH1cclxuICAgIC8qKiBSZXR1cm4gaW5mb3JtYXRpb24gYWJvdXQgdGhlIEFuZHJvaWQgZGV2aWNlLiAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIEluZm8oKTogUHJvbWlzZTxJbmZvPiB7XHJcbiAgICAgICAgcmV0dXJuIGNhbGwoRGV2aWNlSW5mbyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBuYW1lc3BhY2UgVG9hc3Qge1xyXG4gICAgLyoqIFNob3cgYSBzaG9ydCBBbmRyb2lkIHRvYXN0IG1lc3NhZ2UuICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gU2hvdyhtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gY2FsbChUb2FzdFNob3csIHsgbWVzc2FnZSB9KTtcclxuICAgIH1cclxufVxyXG4iLCAiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZXIgZXZlbnQgbmFtZSBjb25zdGFudHMuXHJcbiAqXHJcbiAqIFVzZSB0aGVzZSBpbnN0ZWFkIG9mIGhhcmQtY29kaW5nIHN0cmluZyBsaXRlcmFscyB3aGVuIHN1YnNjcmliaW5nIHRvXHJcbiAqIHVwZGF0ZXIgZXZlbnRzIGZyb20gSmF2YVNjcmlwdDpcclxuICpcclxuICogICAgIGltcG9ydCB7IEV2ZW50cywgVXBkYXRlciB9IGZyb20gXCJAd2FpbHNpby9ydW50aW1lXCI7XHJcbiAqXHJcbiAqICAgICBFdmVudHMuT24oVXBkYXRlci5FdmVudHMuVXBkYXRlQXZhaWxhYmxlLCAoZSkgPT4ge1xyXG4gKiAgICAgICAgIGNvbnNvbGUubG9nKFwidXBkYXRlIGZvdW5kOlwiLCBlLmRhdGEudmVyc2lvbik7XHJcbiAqICAgICB9KTtcclxuICpcclxuICogICAgIEV2ZW50cy5PbihVcGRhdGVyLkV2ZW50cy5Eb3dubG9hZFByb2dyZXNzLCAoZSkgPT4ge1xyXG4gKiAgICAgICAgIGNvbnN0IHAgPSBlLmRhdGE7XHJcbiAqICAgICAgICAgY29uc29sZS5sb2coYCR7cC53cml0dGVufSAvICR7cC50b3RhbH0gYnl0ZXNgKTtcclxuICogICAgIH0pO1xyXG4gKlxyXG4gKiBNaXJyb3JzIHRoZSBHby1zaWRlIGNvbnN0YW50cyBpbiBgcGtnL3VwZGF0ZXIvZXZlbnRzLmdvYCBhbmQgdGhlXHJcbiAqIHVzZXItYWN0aW9uIGNvbnN0YW50cyBpbiBgcGtnL3VwZGF0ZXIvd2luZG93X2xpZmVjeWNsZS5nb2AuIEFueVxyXG4gKiBjaGFuZ2VzIGhlcmUgbXVzdCBzdGF5IGluIHN5bmMgd2l0aCB0aG9zZSBmaWxlcyBcdTIwMTQgdGhlcmUncyBhblxyXG4gKiBpbnRlZ3JhdGlvbiB0ZXN0IHRoYXQgYXNzZXJ0cyB0aGUgc3RyaW5ncyBtYXRjaC5cclxuICovXHJcbmV4cG9ydCBjb25zdCBFdmVudHMgPSBPYmplY3QuZnJlZXplKHtcclxuICAgIC8qKiBBIENoZWNrIHJvdW5kLXRyaXAgaXMgc3RhcnRpbmcuIFBheWxvYWQ6IG51bGwuICovXHJcbiAgICBDaGVja1N0YXJ0ZWQ6IFwid2FpbHM6dXBkYXRlcjpjaGVjay1zdGFydGVkXCIsXHJcbiAgICAvKiogQ2hlY2sgZm91bmQgYSBuZXdlciByZWxlYXNlLiBQYXlsb2FkOiBSZWxlYXNlLiAqL1xyXG4gICAgVXBkYXRlQXZhaWxhYmxlOiBcIndhaWxzOnVwZGF0ZXI6dXBkYXRlLWF2YWlsYWJsZVwiLFxyXG4gICAgLyoqIENoZWNrIGNvbmZpcm1lZCB0aGUgY2FsbGVyIGlzIHVwIHRvIGRhdGUuIFBheWxvYWQ6IG51bGwuICovXHJcbiAgICBOb1VwZGF0ZTogXCJ3YWlsczp1cGRhdGVyOm5vLXVwZGF0ZVwiLFxyXG4gICAgLyoqIERvd25sb2FkIGlzIHN0YXJ0aW5nLiBQYXlsb2FkOiBSZWxlYXNlLiAqL1xyXG4gICAgRG93bmxvYWRTdGFydGVkOiBcIndhaWxzOnVwZGF0ZXI6ZG93bmxvYWQtc3RhcnRlZFwiLFxyXG4gICAgLyoqIFBlcmlvZGljIHByb2dyZXNzIHRpY2sgZHVyaW5nIGRvd25sb2FkICh+MTAgSHopLiBQYXlsb2FkOiBQcm9ncmVzcy4gKi9cclxuICAgIERvd25sb2FkUHJvZ3Jlc3M6IFwid2FpbHM6dXBkYXRlcjpkb3dubG9hZC1wcm9ncmVzc1wiLFxyXG4gICAgLyoqIEFsbCBieXRlcyBhcmUgb24gZGlzaywgYnV0IHZlcmlmaWNhdGlvbiBoYXMgbm90IHlldCBzdGFydGVkLiBQYXlsb2FkOiBSZWxlYXNlLiAqL1xyXG4gICAgRG93bmxvYWRDb21wbGV0ZTogXCJ3YWlsczp1cGRhdGVyOmRvd25sb2FkLWNvbXBsZXRlXCIsXHJcbiAgICAvKiogU2lnbmF0dXJlIC8gZGlnZXN0IHZlcmlmaWNhdGlvbiBoYXMgc3RhcnRlZC4gUGF5bG9hZDogUmVsZWFzZS4gKi9cclxuICAgIFZlcmlmeWluZzogXCJ3YWlsczp1cGRhdGVyOnZlcmlmeWluZ1wiLFxyXG4gICAgLyoqIFRoZSBVcGRhdGVyIGlzIHN3YXBwaW5nIHRoZSBiaW5hcnkgaW50byBwbGFjZS4gUGF5bG9hZDogUmVsZWFzZS4gKi9cclxuICAgIEluc3RhbGxpbmc6IFwid2FpbHM6dXBkYXRlcjppbnN0YWxsaW5nXCIsXHJcbiAgICAvKiogVXBkYXRlIGlzIHN0YWdlZCBhbmQgYSByZXN0YXJ0IGlzIHBlbmRpbmcuIFBheWxvYWQ6IFJlbGVhc2UuICovXHJcbiAgICBVcGRhdGVSZWFkeTogXCJ3YWlsczp1cGRhdGVyOnVwZGF0ZS1yZWFkeVwiLFxyXG4gICAgLyoqIFNvbWV0aGluZyBmYWlsZWQuIFBheWxvYWQ6IEVycm9ySW5mbyB7IHN0YWdlLCBtZXNzYWdlLCBwcm92aWRlciB9LiAqL1xyXG4gICAgRXJyb3I6IFwid2FpbHM6dXBkYXRlcjplcnJvclwiLFxyXG4gICAgLyoqIEhvc3Qtc2lkZSBjb250ZXh0IGRlbGl2ZXJlZCBvbmNlIHBlciBzZXNzaW9uLiBQYXlsb2FkOiBNZXRhIHsgY3VycmVudFZlcnNpb24sIHNraXBwZWRWZXJzaW9uIH0uICovXHJcbiAgICBNZXRhOiBcIndhaWxzOnVwZGF0ZXI6bWV0YVwiLFxyXG5cclxuICAgIC8qKiBTdWItbmFtZXNwYWNlOiB1c2VyLWFjdGlvbiBldmVudHMgdGhhdCB0aGUgVUkgZW1pdHMgQkFDSyB0byB0aGUgaG9zdC4gKi9cclxuICAgIFVzZXI6IE9iamVjdC5mcmVlemUoe1xyXG4gICAgICAgIC8qKiBVc2VyIGNsaWNrZWQgSW5zdGFsbCBvbiBhbiBBdmFpbGFibGUgdXBkYXRlLiAqL1xyXG4gICAgICAgIEluc3RhbGw6IFwid2FpbHM6dXBkYXRlcjp1c2VyOmluc3RhbGxcIixcclxuICAgICAgICAvKiogVXNlciBjbGlja2VkIFJlc3RhcnQgJiBBcHBseSBvbiBhIFJlYWR5IHVwZGF0ZS4gKi9cclxuICAgICAgICBSZXN0YXJ0OiBcIndhaWxzOnVwZGF0ZXI6dXNlcjpyZXN0YXJ0XCIsXHJcbiAgICAgICAgLyoqIFVzZXIgY2xpY2tlZCBTa2lwIFRoaXMgVmVyc2lvbi4gKi9cclxuICAgICAgICBTa2lwOiBcIndhaWxzOnVwZGF0ZXI6dXNlcjpza2lwXCIsXHJcbiAgICAgICAgLyoqIFVzZXIgY2xpY2tlZCBSZW1pbmQgTWUgTGF0ZXIuICovXHJcbiAgICAgICAgUmVtaW5kOiBcIndhaWxzOnVwZGF0ZXI6dXNlcjpyZW1pbmRcIixcclxuICAgICAgICAvKiogVXNlciBjbGlja2VkIENsb3NlIC8gQ2FuY2VsLiAqL1xyXG4gICAgICAgIENhbmNlbDogXCJ3YWlsczp1cGRhdGVyOnVzZXI6Y2FuY2VsXCIsXHJcbiAgICB9KSxcclxuXHJcbiAgICAvKiogU3ViLW5hbWVzcGFjZTogZnJhbWV3b3JrLWludGVybmFsIGV2ZW50cyB0aGUgVUkgZW1pdHMgdG8gY29vcmRpbmF0ZVxyXG4gICAgICogIHdpdGggdGhlIGhvc3QuIE1vc3QgYXBwIGNvZGUgY2FuIGlnbm9yZSB0aGVzZS4gKi9cclxuICAgIFdpbmRvdzogT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICAgICAgLyoqIFRoZSB3aW5kb3cgZmluaXNoZWQgbG9hZGluZyBhbmQgYXNrcyB0aGUgaG9zdCB0byByZXBsYXkgY3VycmVudCBzdGF0ZS4gKi9cclxuICAgICAgICBSZWFkeTogXCJ3YWlsczp1cGRhdGVyOndpbmRvdzpyZWFkeVwiLFxyXG4gICAgfSksXHJcbn0pO1xyXG4iLCAiLypcclxuIF9cdCAgIF9fXHQgIF8gX19cclxufCB8XHQgLyAvX19fIF8oXykgL19fX19cclxufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xyXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcclxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXHJcblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cclxuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxyXG4qL1xyXG5cclxuLyoqXHJcbiAqIEdvU3RyZWFtIFx1MjAxNCB0aGUgV2ViU29ja2V0IHByb2dyYW1taW5nIG1vZGVsIHdpdGhvdXQgYSBsaXN0ZW5pbmcgc29ja2V0LlxyXG4gKlxyXG4gKiBBIFdlYlNvY2tldCBjYW5ub3QgYmUgc3Bva2VuIG92ZXIgYSBjdXN0b20gVVJMIHNjaGVtZSwgc28gZ2V0dGluZyBvbmUgaW5zaWRlXHJcbiAqIGEgd2VidmlldyBtZWFucyBiaW5kaW5nIGEgcmVhbCBUQ1AgcG9ydC4gVGhpcyBzcGVha3MgdGhlIHNhbWUgc2hhcGUgb3ZlciB0aGVcclxuICogYXNzZXQgc2VydmVyIHRoZSBhcHAgYWxyZWFkeSBzZXJ2ZXM6IEdvXHUyMTkySlMgb3ZlciBvbmUgaGVsZCBwb2xsIHBlciBwYWdlLCBKU1x1MjE5MkdvXHJcbiAqIG92ZXIgYSBub3JtYWwgUE9TVC5cclxuICpcclxuICoge0BsaW5rIFN0cmVhbX0gcmV0dXJucyBzeW5jaHJvbm91c2x5IHdpdGggYHJlYWR5U3RhdGUgPT09IENPTk5FQ1RJTkdgLCB0aGUgd2F5XHJcbiAqIGBuZXcgV2ViU29ja2V0KHVybClgIGRvZXMsIHNvIGEgY29ubmVjdGlvbiBjYW4gYmUgY3JlYXRlZCBhdCBtb2R1bGUgc2NvcGU6XHJcbiAqXHJcbiAqIGBgYGpzXHJcbiAqIGV4cG9ydCBjb25zdCBUZWxlbWV0cnkgPSBTdHJlYW0oXCJ0ZWxlbWV0cnlcIik7ICAgLy8gY29ubmVjdHMgaW4gdGhlIGJhY2tncm91bmRcclxuICogYGBgXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgbmFub2lkIH0gZnJvbSBcIi4vbmFub2lkLmpzXCI7XHJcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XHJcblxyXG4vLyBFdmVyeSBwaWVjZSBvZiBzdGF0ZSB0aGF0IHR3byBydW50aW1lIGluc3RhbmNlcyBtdXN0IGFncmVlIG9uIGxpdmVzIGhlcmUsIG9uXHJcbi8vIHdpbmRvdywgbm90IGluIG1vZHVsZSBzY29wZS4gVGhlIHJ1bnRpbWUgY2FuIGJlIGV2YWx1YXRlZCBtb3JlIHRoYW4gb25jZSBpbiBhXHJcbi8vIHBhZ2UgXHUyMDE0IHRoZSBwbGF0Zm9ybSBpbmplY3RzIGEgY29weSBhbmQgYW4gYXBwIG1heSBpbXBvcnQgaXQgdG9vIFx1MjAxNCBhbmQgYVxyXG4vLyBwZXItbW9kdWxlIHJlZ2lzdHJ5IG1lYW50IGJvdGggaW5zdGFuY2VzIGFsbG9jYXRlZCBjb25uZWN0aW9uIGlkIDEsIHJhblxyXG4vLyBjb21wZXRpbmcgcG9sbHMgYWdhaW5zdCBvbmUgc2Vzc2lvbiwgYW5kIGRpc2NhcmRlZCBmcmFtZXMgYWRkcmVzc2VkIHRvIGlkc1xyXG4vLyBvbmx5IHRoZSBvdGhlciBpbnN0YW5jZSBrbmV3IGFib3V0LiBUaGUgc2Vzc2lvbiBpZCBhbG9uZSB3YXMgbm90IGVub3VnaC5cclxuaW50ZXJmYWNlIFN0cmVhbUdsb2JhbHMge1xyXG4gICAgc2Vzc2lvbjogc3RyaW5nO1xyXG4gICAgZ2VuZXJhdGlvbjogbnVtYmVyO1xyXG4gICAgbmV4dENvbm5JRDogbnVtYmVyO1xyXG4gICAgY29ubmVjdGlvbnM6IE1hcDxudW1iZXIsIFdhaWxzU29ja2V0PjtcclxuICAgIHBvbGxpbmc6IGJvb2xlYW47XHJcbiAgICBwb2xsQWJvcnQ/OiBBYm9ydENvbnRyb2xsZXI7XHJcbn1cclxuXHJcbmNvbnN0IEdFTkVSQVRJT05fS0VZID0gXCJfX3dhaWxzX3N0cmVhbV9nZW5lcmF0aW9uXCI7XHJcbmNvbnN0IEdFTkVSQVRJT05fTkFNRV9NQVJLRVIgPSBcIlxcdTAwMWZfX3dhaWxzX3N0cmVhbV9nZW5lcmF0aW9uX186XCI7XHJcblxyXG4vLyB3aW5kb3cubmFtZSBiZWxvbmdzIHRvIHRoZSBicm93c2luZyBjb250ZXh0IHJhdGhlciB0aGFuIHRoZSBEb2N1bWVudCwgc28gaXRcclxuLy8gc3Vydml2ZXMgYSByZWxvYWQgZXZlbiB3aGVuIFdlYiBTdG9yYWdlIGlzIGRpc2FibGVkLiBQcmVzZXJ2ZSBhbnkgbmFtZSB0aGVcclxuLy8gYXBwbGljYXRpb24gYXNzaWduZWQgYW5kIHJlc2VydmUgb25seSBhIHN1ZmZpeCBmb3IgdGhlIFN0cmVhbSBnZW5lcmF0aW9uLlxyXG5mdW5jdGlvbiBuYW1lZFBhZ2VHZW5lcmF0aW9uKCk6IG51bWJlciB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IG1hcmtlciA9IHdpbmRvdy5uYW1lLmxhc3RJbmRleE9mKEdFTkVSQVRJT05fTkFNRV9NQVJLRVIpO1xyXG4gICAgICAgIGlmIChtYXJrZXIgPCAwKSByZXR1cm4gMDtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IE51bWJlcih3aW5kb3cubmFtZS5zbGljZShtYXJrZXIgKyBHRU5FUkFUSU9OX05BTUVfTUFSS0VSLmxlbmd0aCkpO1xyXG4gICAgICAgIHJldHVybiBOdW1iZXIuaXNTYWZlSW50ZWdlcih2YWx1ZSkgJiYgdmFsdWUgPiAwID8gdmFsdWUgOiAwO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbWVtYmVyTmFtZWRQYWdlR2VuZXJhdGlvbihnZW5lcmF0aW9uOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgbWFya2VyID0gd2luZG93Lm5hbWUubGFzdEluZGV4T2YoR0VORVJBVElPTl9OQU1FX01BUktFUik7XHJcbiAgICAgICAgY29uc3QgYXBwbGljYXRpb25OYW1lID0gbWFya2VyIDwgMCA/IHdpbmRvdy5uYW1lIDogd2luZG93Lm5hbWUuc2xpY2UoMCwgbWFya2VyKTtcclxuICAgICAgICB3aW5kb3cubmFtZSA9IGFwcGxpY2F0aW9uTmFtZSArIEdFTkVSQVRJT05fTkFNRV9NQVJLRVIgKyBnZW5lcmF0aW9uO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgLy8gU29tZSBlbWJlZGRlZCBicm93c2VyIHBvbGljaWVzIGNhbiBkZW55IGFjY2VzcyB0byB0aGUgYnJvd3NpbmdcclxuICAgICAgICAvLyBjb250ZXh0IG5hbWUuIFRoZSB0aW1lIG9yaWdpbiByZW1haW5zIHRoZSBsYXN0LXJlc29ydCBmYWxsYmFjay5cclxuICAgIH1cclxufVxyXG5cclxuLy8gUmVxdWVzdCBhcnJpdmFsIG9yZGVyIGlzIG5vdCBwYWdlIG9yZGVyOiBhIHJlcXVlc3Qgc3RhcnRlZCBqdXN0IGJlZm9yZSBhXHJcbi8vIG5hdmlnYXRpb24gY2FuIHJlYWNoIEdvIGFmdGVyIHRoZSByZXBsYWNlbWVudCBwYWdlJ3MgZmlyc3QgcmVxdWVzdC4gS2VlcCBhXHJcbi8vIG1vbm90b25pYyBjb3VudGVyIGluIHRoaXMgdG9wLWxldmVsIGJyb3dzaW5nIGNvbnRleHQgc28gR28gY2FuIGRpc3Rpbmd1aXNoXHJcbi8vIHRob3NlIHBhZ2UgaW5jYXJuYXRpb25zIHdpdGhvdXQgdHJ1c3Rpbmcgc2VydmVyIHNjaGVkdWxpbmcgb3JkZXIuXHJcbmZ1bmN0aW9uIG5leHRQYWdlR2VuZXJhdGlvbigpOiBudW1iZXIge1xyXG4gICAgaWYgKCFoYXNET00pIHJldHVybiAxO1xyXG4gICAgLy8gQW5jaG9yIHRoZSB2YWx1ZSB0byB0aGUgcGFnZSdzIGNyZWF0aW9uIHRpbWUgYXMgd2VsbCBhcyB0aGUgc3RvcmVkXHJcbiAgICAvLyBjb3VudGVyLiBJZiBhcHBsaWNhdGlvbiBjb2RlIGNsZWFycyBzZXNzaW9uU3RvcmFnZSwgdGhlIG5leHQgcmVsb2FkIG11c3RcclxuICAgIC8vIHN0aWxsIGJlIG5ld2VyIHRoYW4gdGhlIGdlbmVyYXRpb24gR28gaGFzIGFscmVhZHkgcmV0aXJlZDsgcmVzdGFydGluZ1xyXG4gICAgLy8gZnJvbSAxIHdvdWxkIG1ha2UgZXZlcnkgc3RyZWFtIHJlcXVlc3QgcmVjZWl2ZSA0MTAgdW50aWwgdGhlIGhvc3QgZXhpdHMuXHJcbiAgICAvLyBQZXJmb3JtYW5jZS50aW1lT3JpZ2luIGlzIGFic2VudCBvbiBvbGRlciBXZWJLaXQgcmVsZWFzZXMgdGhhdCBXYWlsc1xyXG4gICAgLy8gc3RpbGwgdGFyZ2V0cy4gRGF0ZS5ub3cga2VlcHMgdGhvc2UgZW5naW5lcyBvbiB0aGUgcHJvdG9jb2w7IHRoZSBzdG9yZWRcclxuICAgIC8vIGNvdW50ZXIgZGlzYW1iaWd1YXRlcyByZWxvYWRzIHRoYXQgaGFwcGVuIHdpdGhpbiB0aGUgc2FtZSBtaWxsaXNlY29uZC5cclxuICAgIGNvbnN0IG9yaWdpbiA9IHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBOdW1iZXIuaXNGaW5pdGUocGVyZm9ybWFuY2UudGltZU9yaWdpbilcclxuICAgICAgICA/IHBlcmZvcm1hbmNlLnRpbWVPcmlnaW5cclxuICAgICAgICA6IERhdGUubm93KCk7XHJcbiAgICBjb25zdCBwYWdlVGltZSA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3Iob3JpZ2luICogMTAwMCkpO1xyXG4gICAgbGV0IGN1cnJlbnQgPSBuYW1lZFBhZ2VHZW5lcmF0aW9uKCk7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJhdyA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKEdFTkVSQVRJT05fS0VZKTtcclxuICAgICAgICBjb25zdCBzdG9yZWQgPSByYXcgPT09IG51bGwgPyAwIDogTnVtYmVyKHJhdyk7XHJcbiAgICAgICAgaWYgKE51bWJlci5pc1NhZmVJbnRlZ2VyKHN0b3JlZCkgJiYgc3RvcmVkID4gY3VycmVudCkgY3VycmVudCA9IHN0b3JlZDtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIFN0b3JhZ2UgY2FuIGJlIGRpc2FibGVkIGJ5IHBvbGljeS4gd2luZG93Lm5hbWUgc3VwcGxpZXMgdGhlXHJcbiAgICAgICAgLy8gYnJvd3NpbmctY29udGV4dCBjb3VudGVyIGluIHRoYXQgY2FzZS5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXh0ID0gTnVtYmVyLmlzU2FmZUludGVnZXIoY3VycmVudCkgJiYgY3VycmVudCA+PSAwICYmIGN1cnJlbnQgPCBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxyXG4gICAgICAgID8gTWF0aC5tYXgoY3VycmVudCArIDEsIHBhZ2VUaW1lKVxyXG4gICAgICAgIDogcGFnZVRpbWU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKEdFTkVSQVRJT05fS0VZLCBTdHJpbmcobmV4dCkpO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgLy8gVGhlIGJyb3dzaW5nLWNvbnRleHQgZmFsbGJhY2sgYmVsb3cgaXMgc3VmZmljaWVudCB3aGVuIHN0b3JhZ2UgaXNcclxuICAgICAgICAvLyB1bmF2YWlsYWJsZS5cclxuICAgIH1cclxuICAgIHJlbWVtYmVyTmFtZWRQYWdlR2VuZXJhdGlvbihuZXh0KTtcclxuICAgIHJldHVybiBuZXh0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdHJlYW1HbG9iYWxzKCk6IFN0cmVhbUdsb2JhbHMge1xyXG4gICAgY29uc3QgZnJlc2ggPSAoKTogU3RyZWFtR2xvYmFscyA9PiAoe1xyXG4gICAgICAgIHNlc3Npb246IG5hbm9pZCgpLFxyXG4gICAgICAgIGdlbmVyYXRpb246IG5leHRQYWdlR2VuZXJhdGlvbigpLFxyXG4gICAgICAgIG5leHRDb25uSUQ6IDEsXHJcbiAgICAgICAgY29ubmVjdGlvbnM6IG5ldyBNYXA8bnVtYmVyLCBXYWlsc1NvY2tldD4oKSxcclxuICAgICAgICBwb2xsaW5nOiBmYWxzZSxcclxuICAgIH0pO1xyXG4gICAgaWYgKCFoYXNET00pIHJldHVybiBmcmVzaCgpO1xyXG4gICAgY29uc3QgdyA9ICh3aW5kb3cgYXMgYW55KS5fd2FpbHMgPSAod2luZG93IGFzIGFueSkuX3dhaWxzIHx8IHt9O1xyXG4gICAgcmV0dXJuICh3Ll9fc3RyZWFtID0gdy5fX3N0cmVhbSB8fCBmcmVzaCgpKTtcclxufVxyXG5cclxuY29uc3QgRyA9IHN0cmVhbUdsb2JhbHMoKTtcclxuXHJcbmNvbnN0IEhEUl9TRVNTSU9OID0gXCJ4LXdhaWxzLXN0cmVhbS1zZXNzaW9uXCI7XHJcbmNvbnN0IEhEUl9HRU5FUkFUSU9OID0gXCJ4LXdhaWxzLXN0cmVhbS1nZW5lcmF0aW9uXCI7XHJcbmNvbnN0IEhEUl9DT05OID0gXCJ4LXdhaWxzLXN0cmVhbS1jb25uXCI7XHJcbmNvbnN0IEhEUl9LSU5EID0gXCJ4LXdhaWxzLXN0cmVhbS1raW5kXCI7XHJcbmNvbnN0IEhEUl9OQU1FID0gXCJ4LXdhaWxzLXN0cmVhbS1uYW1lXCI7XHJcbmNvbnN0IEhEUl9DSFVOSyA9IFwieC13YWlscy1zdHJlYW0tY2h1bmtcIjtcclxuY29uc3QgSERSX0NIVU5LX0lOREVYID0gXCJ4LXdhaWxzLXN0cmVhbS1jaHVuay1pbmRleFwiO1xyXG5jb25zdCBIRFJfQ0hVTktfVE9UQUwgPSBcIngtd2FpbHMtc3RyZWFtLWNodW5rLXRvdGFsXCI7XHJcbmNvbnN0IEhEUl9CQVRDSCA9IFwieC13YWlscy1zdHJlYW0tYmF0Y2hcIjtcclxuXHJcbmNvbnN0IEtJTkRfREFUQSA9IDA7XHJcbmNvbnN0IEtJTkRfT1BFTiA9IDE7XHJcbmNvbnN0IEtJTkRfQ0xPU0UgPSAyO1xyXG5jb25zdCBLSU5EX0VSUk9SID0gMztcclxuXHJcbi8vIE1hdGNoZXMgdGhlIHJ1bnRpbWUncyBvd24gbGltaXQ6IHN0YXkgdW5kZXIgV2ViVmlldzIncyB+Mk1CIHJlcXVlc3QgYm9keVxyXG4vLyBidWZmZXJpbmcgbGltaXQgaW4gV2ViUmVzb3VyY2VSZXF1ZXN0ZWQuXHJcbmNvbnN0IENIVU5LX1RIUkVTSE9MRCA9IDUxMiAqIDEwMjQ7XHJcbmNvbnN0IE1BWF9CQVRDSF9GUkFNRVMgPSA0MDk2O1xyXG5cclxuLy8gQmFja29mZiBmbG9vciBhbmQgY2VpbGluZyBmb3IgYSBmYWlsaW5nIHBvbGwuIFRoaXMgaXMgdGhlIFwicmVhc29uYWJsZSBsb3dlclxyXG4vLyBsaW1pdFwiIG9uIHBvbGxpbmcgXHUyMDE0IGFuIGVycm9yIGJhY2tvZmYsIG5vdCBhIHN0ZWFkeS1zdGF0ZSBpbnRlcnZhbC4gSW4gbm9ybWFsXHJcbi8vIG9wZXJhdGlvbiB0aGUgcG9sbCByZS1pc3N1ZXMgaW1tZWRpYXRlbHksIGJlY2F1c2UgdGhlIHNlcnZlciBob2xkIGhhcyBhbHJlYWR5XHJcbi8vIHByb3ZpZGVkIHdoYXRldmVyIGRlbGF5IHdhcyBhcHByb3ByaWF0ZS5cclxuY29uc3QgQkFDS09GRl9NSU4gPSAyNTA7XHJcbmNvbnN0IEJBQ0tPRkZfTUFYID0gNTAwMDtcclxuY29uc3QgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuXHJcbmZ1bmN0aW9uIHN0cmVhbVVSTChlbmRwb2ludDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgXCIvd2FpbHMvc3RyZWFtL1wiICsgZW5kcG9pbnQ7XHJcbn1cclxuXHJcblxyXG5jbGFzcyBTdHJlYW1SZXF1ZXN0Q2FuY2VsbGVkIGV4dGVuZHMgRXJyb3Ige1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoXCJzdHJlYW0gcmVxdWVzdCBjYW5jZWxsZWRcIik7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJBYm9ydEVycm9yXCI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNsZWVwKG1zOiBudW1iZXIsIHNpZ25hbD86IEFib3J0U2lnbmFsKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoIXNpZ25hbCkgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XHJcbiAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgU3RyZWFtUmVxdWVzdENhbmNlbGxlZCgpKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9uQWJvcnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICAgICAgICAgIHJlamVjdChuZXcgU3RyZWFtUmVxdWVzdENhbmNlbGxlZCgpKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCk7XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCBtcyk7XHJcbiAgICAgICAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBvbkFib3J0LCB7IG9uY2U6IHRydWUgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgc3RyZWFtIGNvbm5lY3Rpb24uIEltcGxlbWVudHMgdGhlIHVzZWZ1bCBzdWJzZXQgb2YgdGhlIGBXZWJTb2NrZXRgXHJcbiAqIGludGVyZmFjZSwgc28gdGhlIHNhbWUgYXBwbGljYXRpb24gY29kZSB3b3JrcyBhZ2FpbnN0IGEgcmVhbCBXZWJTb2NrZXQgaW5cclxuICogc2VydmVyIGJ1aWxkcy5cclxuICpcclxuICogT25lIGRlbGliZXJhdGUgZGl2ZXJnZW5jZSBmcm9tIHRoZSBzdGFuZGFyZDogYGJpbmFyeVR5cGVgIGRlZmF1bHRzIHRvXHJcbiAqIGBcImFycmF5YnVmZmVyXCJgIHJhdGhlciB0aGFuIGBcImJsb2JcImAsIGJlY2F1c2Ugc3RyZWFtIGZyYW1lcyBhcmUgYWx3YXlzXHJcbiAqIGJpbmFyeSBhbmQgYSBCbG9iIHdvdWxkIGZvcmNlIGFuIGV4dHJhIGFzeW5jIGhvcCB0byByZWFkIGV2ZXJ5IG1lc3NhZ2UuXHJcbiAqIFNldHRpbmcgaXQgdG8gYFwiYmxvYlwiYCBiZWhhdmVzIGFzIHRoZSBzdGFuZGFyZCBkZXNjcmliZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgV2FpbHNTb2NrZXQgZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgQ09OTkVDVElORyA9IDA7XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgT1BFTiA9IDE7XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgQ0xPU0lORyA9IDI7XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgQ0xPU0VEID0gMztcclxuXHJcbiAgICByZWFkb25seSBDT05ORUNUSU5HID0gMDtcclxuICAgIHJlYWRvbmx5IE9QRU4gPSAxO1xyXG4gICAgcmVhZG9ubHkgQ0xPU0lORyA9IDI7XHJcbiAgICByZWFkb25seSBDTE9TRUQgPSAzO1xyXG5cclxuICAgIC8qKiBUaGUgc3RyZWFtIG5hbWUgdGhpcyBjb25uZWN0aW9uIHdhcyBvcGVuZWQgYWdhaW5zdC4gKi9cclxuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcclxuICAgIHJlYWRvbmx5IHVybDogc3RyaW5nO1xyXG5cclxuICAgIC8qKiBBbHdheXMgZW1wdHk6IHN1YnByb3RvY29scyBhbmQgZXh0ZW5zaW9ucyBhcmUgbm90IG5lZ290aWF0ZWQuICovXHJcbiAgICByZWFkb25seSBwcm90b2NvbCA9IFwiXCI7XHJcbiAgICByZWFkb25seSBleHRlbnNpb25zID0gXCJcIjtcclxuXHJcbiAgICBiaW5hcnlUeXBlOiBcImFycmF5YnVmZmVyXCIgfCBcImJsb2JcIiA9IFwiYXJyYXlidWZmZXJcIjtcclxuICAgIHJlYWR5U3RhdGU6IG51bWJlciA9IFdhaWxzU29ja2V0LkNPTk5FQ1RJTkc7XHJcblxyXG4gICAgLy8gRGVjbGFyZWQgZm9yIHRoZSB0eXBlOyB0aGUgY29uc3RydWN0b3IgcmVwbGFjZXMgZWFjaCB3aXRoIGFuIGFjY2Vzc29yXHJcbiAgICAvLyB0aGF0IHJlZ2lzdGVycyBhIHJlYWwgbGlzdGVuZXIuIENhbGxpbmcgdGhlbSBkaXJlY3RseSBpbnN0ZWFkIHdvdWxkIG1ha2VcclxuICAgIC8vIGFueSB3cmFwcGVyIChzZWUgSlNPTlN0cmVhbSkgcmVjZWl2ZSBib3RoIHRoZSByYXcgYW5kIHRoZSBkZWNvZGVkIGV2ZW50LlxyXG4gICAgb25vcGVuOiAoKGV2OiBFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuICAgIG9ubWVzc2FnZTogKChldjogTWVzc2FnZUV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG4gICAgb25jbG9zZTogKChldjogQ2xvc2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuICAgIG9uZXJyb3I6ICgoZXY6IEV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGludGVybmFsIEFwcGxpZWQgdG8gZXZlcnkgaW5ib3VuZCBwYXlsb2FkIGJlZm9yZSBkaXNwYXRjaC4gSlNPTlN0cmVhbVxyXG4gICAgICogcmVwbGFjZXMgaXQsIHNvIGBvbm1lc3NhZ2VgIGFuZCBgYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgXHUyMDI2KWAgc2VlIHRoZVxyXG4gICAgICogc2FtZSBkZWNvZGVkIHZhbHVlIFx1MjAxNCBpbnRlcmNlcHRpbmcgb25seSBgb25tZXNzYWdlYCBtYWRlIHRoZSB0d28gZGlzYWdyZWUuXHJcbiAgICAgKi9cclxuICAgIF9kZWNvZGU6IChwYXlsb2FkOiBBcnJheUJ1ZmZlcikgPT4gdW5rbm93biA9IChwYXlsb2FkKSA9PiBwYXlsb2FkO1xyXG5cclxuICAgIC8qKiBAaW50ZXJuYWwgKi8gcmVhZG9ubHkgX2lkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9idWZmZXJlZCA9IDA7XHJcbiAgICAvLyBTZW5kcyBhcmUgc2VyaWFsaXNlZCBwZXIgY29ubmVjdGlvbjogY29uY3VycmVudCBmZXRjaCgpIFBPU1RzIGRvIG5vdFxyXG4gICAgLy8gcHJlc2VydmUgb3JkZXIsIGFuZCBHbyByZWxpZXMgb24gc2VuZCBvcmRlciBiZWluZyB0aGUgb3JkZXIgaXQgb2JzZXJ2ZXMuXHJcbiAgICBwcml2YXRlIF9jaGFpbjogUHJvbWlzZTx2b2lkPiA9IFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgcHJpdmF0ZSBfcGVuZGluZzogUHJvbWlzZTxVaW50OEFycmF5PltdID0gW107XHJcbiAgICBwcml2YXRlIF9mbHVzaGluZyA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfb3BlbkFib3J0ID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG4gICAgcHJpdmF0ZSBfc2VuZEFib3J0ID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG5cclxuICAgIC8qKiBCeXRlcyBxdWV1ZWQgYnkgc2VuZCgpIHRoYXQgaGF2ZSBub3QgeWV0IHJlYWNoZWQgR28uICovXHJcbiAgICBnZXQgYnVmZmVyZWRBbW91bnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYnVmZmVyZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuX2lkID0gRy5uZXh0Q29ubklEKys7XHJcbiAgICAgICAgdGhpcy51cmwgPSBoYXNET00gPyBzdHJlYW1VUkwoXCJwb2xsXCIpICsgXCIjXCIgKyBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgOiBcIlwiO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgW1wib3BlblwiLCBcIm1lc3NhZ2VcIiwgXCJjbG9zZVwiLCBcImVycm9yXCJdKSB7XHJcbiAgICAgICAgICAgIGRlZmluZUhhbmRsZXJQcm9wZXJ0eSh0aGlzLCB0eXBlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEcuY29ubmVjdGlvbnMuc2V0KHRoaXMuX2lkLCB0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gRmlyZSBhbmQgZm9yZ2V0OiB0aGUgYWNrIGFycml2ZXMgYXMgYW4gb3BlbiBmcmFtZSBvbiB0aGUgcG9sbCwgd2hpY2hcclxuICAgICAgICAvLyBpcyB3aGF0IG1vdmVzIHJlYWR5U3RhdGUgdG8gT1BFTi5cclxuICAgICAgICB0aGlzLl9jaGFpbiA9IHRoaXMuX2NoYWluLnRoZW4oKCkgPT5cclxuICAgICAgICAgICAgcG9zdEZyYW1lKHRoaXMuX2lkLCBLSU5EX09QRU4sIG5ldyBVaW50OEFycmF5KDApLCBuYW1lLCB0aGlzLl9vcGVuQWJvcnQuc2lnbmFsKVxyXG4gICAgICAgICkuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9mYWlsKGVycik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHN0YXJ0UG9sbGluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VuZCBhIGZyYW1lIHRvIEdvLiBBY2NlcHRzIGFueXRoaW5nIGEgV2ViU29ja2V0IGRvZXM7IHN0cmluZ3MgYXJlXHJcbiAgICAgKiBlbmNvZGVkIGFzIFVURi04LCBzaW5jZSBHbyByZWNlaXZlcyBldmVyeSBmcmFtZSBhcyBhIGJ5dGUgc2xpY2UuXHJcbiAgICAgKi9cclxuICAgIHNlbmQoZGF0YTogc3RyaW5nIHwgQXJyYXlCdWZmZXJMaWtlIHwgQXJyYXlCdWZmZXJWaWV3IHwgQmxvYik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNPTk5FQ1RJTkcpIHtcclxuICAgICAgICAgICAgLy8gTWF0Y2hlcyB0aGUgV2ViU29ja2V0IHNwZWNpZmljYXRpb24uXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oXCJTdGlsbCBpbiBDT05ORUNUSU5HIHN0YXRlLlwiLCBcIkludmFsaWRTdGF0ZUVycm9yXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBXYWlsc1NvY2tldC5PUEVOKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc29sdmUgbm93IHJhdGhlciB0aGFuIGluc2lkZSB0aGUgY2hhaW4uIE11dGFibGUgYmluYXJ5IGlucHV0cyBhcmVcclxuICAgICAgICAvLyBjb3BpZWQgc3luY2hyb25vdXNseSBzbyBzZW5kKCkgc25hcHNob3RzIHRoZWlyIGJ5dGVzIGxpa2UgYSBuYXRpdmVcclxuICAgICAgICAvLyBXZWJTb2NrZXQsIGV2ZW4gd2hlbiBhIGJhdGNoIHdhaXRzIGJlaGluZCBhbiBpbi1mbGlnaHQgcmVxdWVzdC4gQVxyXG4gICAgICAgIC8vIEJsb2IgaXMgaW1tdXRhYmxlIGFuZCBpcyB0aGVyZWZvcmUgc2FmZSB0byByZWFkIGFzeW5jaHJvbm91c2x5IG9uY2UuXHJcbiAgICAgICAgY29uc3QgaW1tZWRpYXRlID0gdG9CeXRlc1N5bmMoZGF0YSk7XHJcbiAgICAgICAgY29uc3Qgc25hcHNob3QgPSBpbW1lZGlhdGVcclxuICAgICAgICAgICAgPyBQcm9taXNlLnJlc29sdmUoaW1tZWRpYXRlKVxyXG4gICAgICAgICAgICA6IHRvQnl0ZXMoZGF0YSwgdGhpcy5fc2VuZEFib3J0LnNpZ25hbCk7XHJcbiAgICAgICAgLy8gY2xvc2UoKSBtYXkgZGlzY2FyZCB0aGlzIHByb21pc2UgYmVmb3JlIHRoZSBmbHVzaCBoYXMgZGVxdWV1ZWQgaXQuXHJcbiAgICAgICAgLy8gQXR0YWNoIGEgcmVqZWN0aW9uIG9ic2VydmVyIGltbWVkaWF0ZWx5IHNvIGNhbmNlbGxpbmcgYW4gYXN5bmNocm9ub3VzXHJcbiAgICAgICAgLy8gQmxvYiByZWFkIGNhbm5vdCBiZWNvbWUgYW4gdW5oYW5kbGVkIHJlamVjdGlvbjsgUHJvbWlzZS5hbGwgc3RpbGxcclxuICAgICAgICAvLyBvYnNlcnZlcyB0aGUgb3JpZ2luYWwgcmVqZWN0aW9uIHdoZW4gdGhlIGZsdXNoIGFscmVhZHkgb3ducyBpdC5cclxuICAgICAgICB2b2lkIHNuYXBzaG90LmNhdGNoKCgpID0+IHt9KTtcclxuXHJcbiAgICAgICAgLy8gQSBCbG9iIGNhbm5vdCBiZSBjb252ZXJ0ZWQgc3luY2hyb25vdXNseSwgYnV0IEJsb2Iuc2l6ZSBpcyBhdmFpbGFibGVcclxuICAgICAgICAvLyBub3csIHNvIGl0cyBieXRlcyBhcmUgc3RpbGwgY291bnRlZCB0aGUgbW9tZW50IHNlbmQoKSByZXR1cm5zLiBXYWl0aW5nXHJcbiAgICAgICAgLy8gZm9yIGFycmF5QnVmZmVyKCkgdG8gcmVzb2x2ZSBsZXQgYSBsYXJnZSBCbG9iIHNsaXAgcGFzdCBjb2RlIHVzaW5nXHJcbiAgICAgICAgLy8gYnVmZmVyZWRBbW91bnQgZm9yIGJhY2twcmVzc3VyZS5cclxuICAgICAgICBjb25zdCBibG9iU2l6ZSA9XHJcbiAgICAgICAgICAgICFpbW1lZGlhdGUgJiYgdHlwZW9mIEJsb2IgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIEJsb2IgPyBkYXRhLnNpemUgOiAwO1xyXG4gICAgICAgIGlmIChibG9iU2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9idWZmZXJlZCArPSBibG9iU2l6ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFjY291bnQgZm9yIHRoZSBieXRlcyBub3csIG5vdCB3aGVuIHRoZSBjaGFpbiByZWFjaGVzIHRoZW0uIFJlcG9ydGluZ1xyXG4gICAgICAgIC8vIHplcm8gd2hpbGUgZnJhbWVzIHdhaXQgYmVoaW5kIGFuIGluLWZsaWdodCBiYXRjaCB3b3VsZCB0ZWxsIGFuXHJcbiAgICAgICAgLy8gYXBwbGljYXRpb24gdXNpbmcgYnVmZmVyZWRBbW91bnQgZm9yIGJhY2twcmVzc3VyZSB0aGF0IGl0IG1heSBrZWVwXHJcbiAgICAgICAgLy8gc2VuZGluZy5cclxuICAgICAgICBpZiAoaW1tZWRpYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlcmVkICs9IGltbWVkaWF0ZS5ieXRlTGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wZW5kaW5nLnB1c2goc25hcHNob3QpO1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSByYXRoZXIgdGhhbiBwb3N0LiBXaGF0ZXZlciBhY2N1bXVsYXRlcyB3aGlsZSBhIHJlcXVlc3QgaXMgaW5cclxuICAgICAgICAvLyBmbGlnaHQgZ29lcyBvdXQgdG9nZXRoZXIgaW4gdGhlIG5leHQgb25lLCBzbyB0aGUgcGVyLXJlcXVlc3QgY29zdCBcdTIwMTRcclxuICAgICAgICAvLyBhIHNjaGVtZS1oYW5kbGVyIHJvdW5kIHRyaXAsIGFib3V0IGVsZXZlbiBjZ28gY2FsbHMgb24gbWFjT1MgXHUyMDE0IGlzXHJcbiAgICAgICAgLy8gZGl2aWRlZCBhY3Jvc3MgdGhlIGJhdGNoLiBVbmRlciBsaWdodCBsb2FkIGEgYmF0Y2ggaXMgb25lIGZyYW1lIGFuZFxyXG4gICAgICAgIC8vIHRoaXMgYmVoYXZlcyBleGFjdGx5IGFzIGJlZm9yZTsgdGhlIGJhdGNoaW5nIG9ubHkgYXBwZWFycyB3aGVuIHRoZVxyXG4gICAgICAgIC8vIHNlbmRlciBpcyBvdXRydW5uaW5nIHRoZSB0cmFuc3BvcnQsIHdoaWNoIGlzIHdoZW4gaXQgaXMgbmVlZGVkLlxyXG4gICAgICAgIGlmICh0aGlzLl9mbHVzaGluZykgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2ZsdXNoaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fY2hhaW4gPSB0aGlzLl9jaGFpbi50aGVuKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wZW5kaW5nLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBCb3VuZCB0aGUgd29yayBhbmQgdGVtcG9yYXJ5IHByb21pc2UgYXJyYXkgZm9yIG9uZSBwYXNzLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBvc3RCYXRjaCBhcHBsaWVzIHRoZSB3aXJlLXNpemUgYm91bmQgYWZ0ZXIgcmVzb2x1dGlvbi5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBxdWV1ZWQgPSB0aGlzLl9wZW5kaW5nLnNwbGljZSgwLCBNQVhfQkFUQ0hfRlJBTUVTKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYXRjaCA9IGF3YWl0IFByb21pc2UuYWxsKHF1ZXVlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcmVtb3RlIGNsb3NlIG1heSBhcnJpdmUgd2hpbGUgYSBCbG9iIGlzIGJlaW5nIHJlYWQuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBnb25lIGluIHRoYXQgY2FzZSwgc28gZG8gbm90XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaXNzdWUgYSBsYXRlIFBPU1QgZm9yIGJ5dGVzIHRoZSBwZWVyIGNhbiBubyBsb25nZXIgdGFrZS5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBXYWlsc1NvY2tldC5DTE9TRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b3RhbCA9IGJhdGNoLnJlZHVjZSgobiwgYikgPT4gbiArIGIuYnl0ZUxlbmd0aCwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcG9zdEJhdGNoKHRoaXMuX2lkLCBiYXRjaCwgdGhpcy5fc2VuZEFib3J0LnNpZ25hbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gX2Nsb3NlZCByZXNldHMgdGhlIGNvdW50ZXIgaW1tZWRpYXRlbHkuIEEgcmVxdWVzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbHJlYWR5IGluIGZsaWdodCBtYXkgZmluaXNoIGFmdGVyd2FyZHMsIGFuZCBtdXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBkcml2ZSBidWZmZXJlZEFtb3VudCBiZWxvdyB6ZXJvLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9idWZmZXJlZCA9IE1hdGgubWF4KDAsIHRoaXMuX2J1ZmZlcmVkIC0gdG90YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZsdXNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZhaWwoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQ2xvc2UgdGhlIGNvbm5lY3Rpb24uIEdvJ3MgaGFuZGxlciBzZWVzIFJlY2VpdmUgZmFpbCBhbmQgcmV0dXJucy4gKi9cclxuICAgIGNsb3NlKGNvZGU6IG51bWJlciA9IDEwMDAsIHJlYXNvbjogc3RyaW5nID0gXCJcIik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NJTkcgfHwgdGhpcy5yZWFkeVN0YXRlID09PSBXYWlsc1NvY2tldC5DTE9TRUQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBXYWlsc1NvY2tldC5DTE9TSU5HO1xyXG4gICAgICAgIHRoaXMuX3BlbmRpbmcubGVuZ3RoID0gMDtcclxuICAgICAgICB0aGlzLl9idWZmZXJlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5fb3BlbkFib3J0LmFib3J0KCk7XHJcblxyXG4gICAgICAgIC8vIEEgZGF0YSBmcmFtZSB3YWl0aW5nIGZvciByZWNlaXZlciBjYXBhY2l0eSBtdXN0IG5vdCBwcmV2ZW50IHRoZVxyXG4gICAgICAgIC8vIHJlc2VydmVkIGNsb3NlIGNvbnRyb2wgZnJvbSBldmVyIHJlYWNoaW5nIEdvLiBDYW5jZWwgb25seSB0aGUgZGF0YVxyXG4gICAgICAgIC8vIHJldHJ5IHBhdGg7IHRoZSBjaGFpbiBiZWxvdyBzdGlsbCBvcmRlcnMgdGhlIGNsb3NlIGFmdGVyIHRoYXQgcGF0aFxyXG4gICAgICAgIC8vIGhhcyB1bndvdW5kLCBwcmVzZXJ2aW5nIG5vcm1hbCBzZW5kLWJlZm9yZS1jbG9zZSBvcmRlcmluZy5cclxuICAgICAgICB0aGlzLl9zZW5kQWJvcnQuYWJvcnQoKTtcclxuICAgICAgICB0aGlzLl9jaGFpbiA9IHRoaXMuX2NoYWluLnRoZW4oKCkgPT5cclxuICAgICAgICAgICAgcG9zdEZyYW1lKHRoaXMuX2lkLCBLSU5EX0NMT1NFLCBuZXcgVWludDhBcnJheSgwKSlcclxuICAgICAgICApLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAgICAgLy8gVGhlIHBlZXIgaXMgYWxyZWFkeSBnb25lOyB0aGUgbG9jYWwgY2xvc2UgYmVsb3cgaXMgd2hhdCBtYXR0ZXJzLlxyXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9jbG9zZWQoY29kZSwgcmVhc29uLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQGludGVybmFsIENhbGxlZCB3aGVuIHRoZSBvcGVuIGZyYW1lIGNvbWVzIGJhY2sgZnJvbSBHby4gKi9cclxuICAgIF9vcGVuZWQoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gV2FpbHNTb2NrZXQuQ09OTkVDVElORykgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdhaWxzU29ja2V0Lk9QRU47XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcIm9wZW5cIikpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBAaW50ZXJuYWwgQ2FsbGVkIGZvciBlYWNoIGRhdGEgZnJhbWUgYWRkcmVzc2VkIHRvIHRoaXMgY29ubmVjdGlvbi4gKi9cclxuICAgIF9tZXNzYWdlKHBheWxvYWQ6IEFycmF5QnVmZmVyKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gV2FpbHNTb2NrZXQuT1BFTikgcmV0dXJuO1xyXG4gICAgICAgIGxldCBkYXRhOiB1bmtub3duO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9kZWNvZGUocGF5bG9hZCk7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJlcnJvclwiKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IHBheWxvYWQgJiYgdGhpcy5iaW5hcnlUeXBlID09PSBcImJsb2JcIikge1xyXG4gICAgICAgICAgICBkYXRhID0gbmV3IEJsb2IoW3BheWxvYWRdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBNZXNzYWdlRXZlbnQoXCJtZXNzYWdlXCIsIHsgZGF0YSB9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX2ZhaWwoZXJyOiB1bmtub3duKTogdm9pZCB7XHJcbiAgICAgICAgLy8gQW4gaW4tZmxpZ2h0IHNlbmQgY2FuIHJlamVjdCBhZnRlciBhIGNsZWFuIGNsb3NlIGhhcyBhbHJlYWR5IGFycml2ZWQuXHJcbiAgICAgICAgLy8gVGhlIHNvY2tldCdzIGxpZmVjeWNsZSBpcyBjb21wbGV0ZSB0aGVuOiBlbWl0dGluZyBlcnJvciBhZnRlciBjbG9zZVxyXG4gICAgICAgIC8vIHJldmVyc2VzIHRoZSBXZWJTb2NrZXQgZXZlbnQgb3JkZXIgYW5kIHJlcG9ydHMgYSBmYWxzZSBmYWlsdXJlLlxyXG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NFRCB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NJTkcpIHJldHVybjtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiZXJyb3JcIikpO1xyXG4gICAgICAgIC8vIDEwMDY6IGNsb3NlZCBhYm5vcm1hbGx5LCBubyBjbG9zZSBmcmFtZS4gU2FtZSBjb2RlIGEgcmVhbCBXZWJTb2NrZXRcclxuICAgICAgICAvLyByZXBvcnRzIHdoZW4gdGhlIGNvbm5lY3Rpb24gZHJvcHMgd2l0aG91dCBhIGhhbmRzaGFrZS5cclxuICAgICAgICB0aGlzLl9jbG9zZWQoMTAwNiwgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX2Nsb3NlZChjb2RlOiBudW1iZXIsIHJlYXNvbjogc3RyaW5nLCB3YXNDbGVhbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NFRCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdhaWxzU29ja2V0LkNMT1NFRDtcclxuICAgICAgICB0aGlzLl9vcGVuQWJvcnQuYWJvcnQoKTtcclxuICAgICAgICB0aGlzLl9zZW5kQWJvcnQuYWJvcnQoKTtcclxuICAgICAgICBHLmNvbm5lY3Rpb25zLmRlbGV0ZSh0aGlzLl9pZCk7XHJcbiAgICAgICAgaWYgKEcuY29ubmVjdGlvbnMuc2l6ZSA9PT0gMCkgRy5wb2xsQWJvcnQ/LmFib3J0KCk7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZy5sZW5ndGggPSAwO1xyXG4gICAgICAgIHRoaXMuX2J1ZmZlcmVkID0gMDtcclxuXHJcbiAgICAgICAgY29uc3QgZXYgPSB0eXBlb2YgQ2xvc2VFdmVudCA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgICAgID8gbmV3IENsb3NlRXZlbnQoXCJjbG9zZVwiLCB7IGNvZGUsIHJlYXNvbiwgd2FzQ2xlYW4gfSlcclxuICAgICAgICAgICAgOiBPYmplY3QuYXNzaWduKG5ldyBFdmVudChcImNsb3NlXCIpLCB7IGNvZGUsIHJlYXNvbiwgd2FzQ2xlYW4gfSkgYXMgQ2xvc2VFdmVudDtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXYpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ29ubmVjdCB0byBhIHN0cmVhbSBkZWNsYXJlZCBpbiBHbyB3aXRoIGBhcHAuSGFuZGxlU3RyZWFtKG5hbWUsIGhhbmRsZXIpYC5cclxuICpcclxuICogUmV0dXJucyBpbW1lZGlhdGVseSB3aXRoIGByZWFkeVN0YXRlID09PSBDT05ORUNUSU5HYDsgbGlzdGVuIGZvciBgb3BlbmAsIG9yXHJcbiAqIGp1c3QgY2FsbCB7QGxpbmsgV2FpbHNTb2NrZXQuc2VuZH0gb25jZSBvcGVuLiBDcmVhdGluZyBhIGNvbm5lY3Rpb24gYXQgbW9kdWxlXHJcbiAqIHNjb3BlIGlzIHN1cHBvcnRlZCBhbmQgaXMgdGhlIGludGVuZGVkIHNoYXBlIGZvciBnZW5lcmF0ZWQgYmluZGluZ3MuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gU3RyZWFtKG5hbWU6IHN0cmluZyk6IFdhaWxzU29ja2V0IHwgV2ViU29ja2V0IHtcclxuICAgIC8vIFNlcnZlciBidWlsZHMgaW5zdGFsbCBhIGZhY3RvcnkgcmV0dXJuaW5nIGEgcmVhbCBXZWJTb2NrZXQsIHNpbmNlIHRoZXJlXHJcbiAgICAvLyBpcyBhIGxpc3RlbmVyIHRoZXJlIHRvIHVwZ3JhZGUgb24gYW5kIG5vdGhpbmcgdG8gZW11bGF0ZS4gQm90aCBvYmplY3RzXHJcbiAgICAvLyBwcmVzZW50IHRoZSBzYW1lIGludGVyZmFjZSwgc28gbm90aGluZyBhYm92ZSB0aGlzIGxpbmUgY2FyZXMgd2hpY2ggaXQgaXMuXHJcbiAgICBpZiAoaGFzRE9NKSB7XHJcbiAgICAgICAgY29uc3QgZmFjdG9yeSA9ICh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LnN0cmVhbUZhY3Rvcnk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBmYWN0b3J5ID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhY3RvcnkobmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBXYWlsc1NvY2tldChuYW1lKTtcclxufVxyXG5cclxuLy8gRGVmaW5lcyBhbiBgb248dHlwZT5gIHByb3BlcnR5IHRoYXQgcmVnaXN0ZXJzIGFuZCB1bnJlZ2lzdGVycyBhIHJlYWwgZXZlbnRcclxuLy8gbGlzdGVuZXIsIHRoZSB3YXkgdGhlIERPTSBkZWZpbmVzIHRoZW0uIEFzc2lnbmluZyByZXBsYWNlcyB0aGUgcHJldmlvdXNcclxuLy8gaGFuZGxlcjsgcmVhZGluZyByZXR1cm5zIGl0LlxyXG5mdW5jdGlvbiBkZWZpbmVIYW5kbGVyUHJvcGVydHkodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBsZXQgY3VycmVudDogKChldjogYW55KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgXCJvblwiICsgdHlwZSwge1xyXG4gICAgICAgIGdldDogKCkgPT4gY3VycmVudCxcclxuICAgICAgICBzZXQoZm46ICgoZXY6IGFueSkgPT4gdm9pZCkgfCBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50KSB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjdXJyZW50KTtcclxuICAgICAgICAgICAgY3VycmVudCA9IHR5cGVvZiBmbiA9PT0gXCJmdW5jdGlvblwiID8gZm4gOiBudWxsO1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudCkgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY3VycmVudCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIG9iamVjdC1zaGFwZWQgdmlldyBvZiBhIHN0cmVhbSByZXR1cm5lZCBieSB7QGxpbmsgSlNPTlN0cmVhbX06IGBzZW5kYFxyXG4gKiB0YWtlcyBhIHZhbHVlIHRvIHN0cmluZ2lmeSwgYW5kIGBldi5kYXRhYCBvbiBhIG1lc3NhZ2UgaXMgdGhlIHBhcnNlZCByZXN1bHQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEpTT05Tb2NrZXQgZXh0ZW5kcyBPbWl0PFdhaWxzU29ja2V0LCBcInNlbmRcIiB8IFwib25tZXNzYWdlXCIgfCBcImFkZEV2ZW50TGlzdGVuZXJcIiB8IFwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiPiB7XHJcbiAgICBzZW5kKHZhbHVlOiB1bmtub3duKTogdm9pZDtcclxuICAgIG9ubWVzc2FnZTogKChldjogTWVzc2FnZUV2ZW50PGFueT4pID0+IHZvaWQpIHwgbnVsbDtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXHJcbiAgICAgICAgbGlzdGVuZXI6ICgodGhpczogSlNPTlNvY2tldCwgZXY6IE1lc3NhZ2VFdmVudDxhbnk+KSA9PiBhbnkpIHwgRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsXHJcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyxcclxuICAgICk6IHZvaWQ7XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgIHR5cGU6IHN0cmluZyxcclxuICAgICAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsXHJcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyxcclxuICAgICk6IHZvaWQ7XHJcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKFxyXG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxyXG4gICAgICAgIGxpc3RlbmVyOiAoKHRoaXM6IEpTT05Tb2NrZXQsIGV2OiBNZXNzYWdlRXZlbnQ8YW55PikgPT4gYW55KSB8IEV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxyXG4gICAgICAgIG9wdGlvbnM/OiBib29sZWFuIHwgRXZlbnRMaXN0ZW5lck9wdGlvbnMsXHJcbiAgICApOiB2b2lkO1xyXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICB0eXBlOiBzdHJpbmcsXHJcbiAgICAgICAgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxyXG4gICAgICAgIG9wdGlvbnM/OiBib29sZWFuIHwgRXZlbnRMaXN0ZW5lck9wdGlvbnMsXHJcbiAgICApOiB2b2lkO1xyXG59XHJcblxyXG4vKipcclxuICogQSB7QGxpbmsgU3RyZWFtfSB0aGF0IHNwZWFrcyBvYmplY3RzIGluc3RlYWQgb2YgYnl0ZXMuXHJcbiAqXHJcbiAqIGBzZW5kKHZhbHVlKWAgbWFyc2hhbHMgd2l0aCBgSlNPTi5zdHJpbmdpZnlgLCBhbmQgYGV2LmRhdGFgIGluIGFuIGBvbm1lc3NhZ2VgXHJcbiAqIGhhbmRsZXIgaXMgdGhlIHBhcnNlZCBvYmplY3QgcmF0aGVyIHRoYW4gYW4gYEFycmF5QnVmZmVyYC4gUGFpcnMgd2l0aFxyXG4gKiBgU3RyZWFtQ29ubi5TZW5kSlNPTmAgLyBgUmVjZWl2ZUpTT05gIG9uIHRoZSBHbyBzaWRlLlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiBjb25zdCBzID0gSlNPTlN0cmVhbShcInRlbGVtZXRyeVwiKTtcclxuICogcy5vbm1lc3NhZ2UgPSAoZXYpID0+IGNvbnNvbGUubG9nKGV2LmRhdGEudGVtcGVyYXR1cmUpO1xyXG4gKiBzLm9ub3BlbiAgICA9ICgpID0+IHMuc2VuZCh7IHN1YnNjcmliZTogXCJzZW5zb3JzXCIgfSk7XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBBIGZyYW1lIHRoYXQgaXMgbm90IHZhbGlkIEpTT04gcmFpc2VzIGFuIGBlcnJvcmAgZXZlbnQgYW5kIGlzIGRyb3BwZWQsIHJhdGhlclxyXG4gKiB0aGFuIHRocm93aW5nIGZyb20gdGhlIHBvbGwgbG9vcCBhbmQgdGFraW5nIHRoZSBjb25uZWN0aW9uIGRvd24gd2l0aCBpdC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBKU09OU3RyZWFtKG5hbWU6IHN0cmluZyk6IEpTT05Tb2NrZXQge1xyXG4gICAgY29uc3Qgc29ja2V0ID0gU3RyZWFtKG5hbWUpO1xyXG4gICAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xyXG4gICAgY29uc3QgcGFyc2UgPSAocGF5bG9hZDogQXJyYXlCdWZmZXIgfCBzdHJpbmcpID0+XHJcbiAgICAgICAgSlNPTi5wYXJzZSh0eXBlb2YgcGF5bG9hZCA9PT0gXCJzdHJpbmdcIiA/IHBheWxvYWQgOiBkZWNvZGVyLmRlY29kZShwYXlsb2FkKSk7XHJcblxyXG4gICAgaWYgKHNvY2tldCBpbnN0YW5jZW9mIFdhaWxzU29ja2V0KSB7XHJcbiAgICAgICAgLy8gRGVjb2RpbmcgdGhyb3VnaCB0aGUgaG9vayByYXRoZXIgdGhhbiBieSB3cmFwcGluZyBvbm1lc3NhZ2UgbWVhbnNcclxuICAgICAgICAvLyBhZGRFdmVudExpc3RlbmVyIGxpc3RlbmVycyBzZWUgdGhlIHBhcnNlZCBvYmplY3QgdG9vLlxyXG4gICAgICAgIHNvY2tldC5fZGVjb2RlID0gKHBheWxvYWQpID0+IHBhcnNlKHBheWxvYWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBTZXJ2ZXIgYnVpbGRzIGdldCBhIG5hdGl2ZSBXZWJTb2NrZXQsIHdob3NlIGRpc3BhdGNoIG5ldmVyIGNvbnN1bHRzXHJcbiAgICAgICAgLy8gX2RlY29kZS4gUGF0Y2ggYm90aCBsaXN0ZW5lciBzdHlsZXMgb24gdGhpcyBpbnN0YW5jZSBzbyBKU09OU3RyZWFtXHJcbiAgICAgICAgLy8gbWVhbnMgdGhlIHNhbWUgdGhpbmcgb24gZWl0aGVyIHRyYW5zcG9ydCwgd2hpY2ggaXMgdGhlIHBvaW50IG9mIHRoZVxyXG4gICAgICAgIC8vIHNoYXJlZCBBUEkuXHJcbiAgICAgICAgY29uc3QgbmF0aXZlID0gc29ja2V0IGFzIFdlYlNvY2tldDtcclxuICAgICAgICBuYXRpdmUuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuXHJcbiAgICAgICAgY29uc3Qgd3JhcHBlZCA9IG5ldyBXZWFrTWFwPG9iamVjdCwgRXZlbnRMaXN0ZW5lcj4oKTtcclxuICAgICAgICBjb25zdCBkZWNvZGVkRXZlbnRzID0gbmV3IFdlYWtNYXA8RXZlbnQsIE1lc3NhZ2VFdmVudCB8IG51bGw+KCk7XHJcbiAgICAgICAgY29uc3QgYWRkID0gbmF0aXZlLmFkZEV2ZW50TGlzdGVuZXIuYmluZChuYXRpdmUpO1xyXG4gICAgICAgIGNvbnN0IHJlbW92ZSA9IG5hdGl2ZS5yZW1vdmVFdmVudExpc3RlbmVyLmJpbmQobmF0aXZlKTtcclxuXHJcbiAgICAgICAgY29uc3QgZGVjb2RlRXZlbnQgPSAoZXY6IEV2ZW50KTogTWVzc2FnZUV2ZW50IHwgbnVsbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkZWNvZGVkRXZlbnRzLmhhcyhldikpIHJldHVybiBkZWNvZGVkRXZlbnRzLmdldChldikgPz8gbnVsbDtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2UoKGV2IGFzIE1lc3NhZ2VFdmVudCkuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZWNvZGVkID0gbmV3IE1lc3NhZ2VFdmVudChcIm1lc3NhZ2VcIiwgeyBkYXRhOiB2YWx1ZSB9KTtcclxuICAgICAgICAgICAgICAgIGRlY29kZWRFdmVudHMuc2V0KGV2LCBkZWNvZGVkKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVkO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIGRlY29kZWRFdmVudHMuc2V0KGV2LCBudWxsKTtcclxuICAgICAgICAgICAgICAgIG5hdGl2ZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImVycm9yXCIpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgZGVjb2RlID0gKGxpc3RlbmVyOiBhbnkpOiBFdmVudExpc3RlbmVyID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSB3cmFwcGVkLmdldChsaXN0ZW5lciBhcyBvYmplY3QpO1xyXG4gICAgICAgICAgICBpZiAoZXhpc3RpbmcpIHJldHVybiBleGlzdGluZztcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGZuOiBFdmVudExpc3RlbmVyID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZWNvZGVkID0gZGVjb2RlRXZlbnQoZXYpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFkZWNvZGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyID09PSBcImZ1bmN0aW9uXCIpIGxpc3RlbmVyLmNhbGwobmF0aXZlLCBkZWNvZGVkKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgbGlzdGVuZXIuaGFuZGxlRXZlbnQoZGVjb2RlZCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdyYXBwZWQuc2V0KGxpc3RlbmVyIGFzIG9iamVjdCwgZm4pO1xyXG4gICAgICAgICAgICByZXR1cm4gZm47XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbmF0aXZlLmFkZEV2ZW50TGlzdGVuZXIgPSAoKHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IGFueSwgb3B0cz86IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBhZGQodHlwZSwgdHlwZSA9PT0gXCJtZXNzYWdlXCIgJiYgbGlzdGVuZXIgPyBkZWNvZGUobGlzdGVuZXIpIDogbGlzdGVuZXIsIG9wdHMpO1xyXG4gICAgICAgIH0pIGFzIHR5cGVvZiBuYXRpdmUuYWRkRXZlbnRMaXN0ZW5lcjtcclxuXHJcbiAgICAgICAgbmF0aXZlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSAoKHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IGFueSwgb3B0cz86IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBmbiA9IHR5cGUgPT09IFwibWVzc2FnZVwiICYmIGxpc3RlbmVyID8gd3JhcHBlZC5nZXQobGlzdGVuZXIpIDogdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICByZW1vdmUodHlwZSwgZm4gPz8gbGlzdGVuZXIsIG9wdHMpO1xyXG4gICAgICAgIH0pIGFzIHR5cGVvZiBuYXRpdmUucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcclxuXHJcbiAgICAgICAgbGV0IGhhbmRsZXI6ICgoZXY6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobmF0aXZlLCBcIm9ubWVzc2FnZVwiLCB7XHJcbiAgICAgICAgICAgIGdldDogKCkgPT4gaGFuZGxlcixcclxuICAgICAgICAgICAgc2V0KGZuKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlcikgbmF0aXZlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGhhbmRsZXIgYXMgRXZlbnRMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gdHlwZW9mIGZuID09PSBcImZ1bmN0aW9uXCIgPyBmbiA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlcikgbmF0aXZlLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGhhbmRsZXIgYXMgRXZlbnRMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZW5kID0gc29ja2V0LnNlbmQuYmluZChzb2NrZXQpO1xyXG4gICAgKHNvY2tldCBhcyB1bmtub3duIGFzIEpTT05Tb2NrZXQpLnNlbmQgPSAodmFsdWU6IHVua25vd24pID0+IHNlbmQoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcclxuXHJcbiAgICByZXR1cm4gc29ja2V0IGFzIHVua25vd24gYXMgSlNPTlNvY2tldDtcclxufVxyXG5cclxuLy8gU3luY2hyb25vdXMgY29udmVyc2lvbiBmb3IgZXZlcnl0aGluZyBidXQgYSBCbG9iLiBBdm9pZHMgYSBwcm9taXNlIHBlciBzZW5kXHJcbi8vIGFuZCwgbW9yZSBpbXBvcnRhbnRseSwgbGV0cyBidWZmZXJlZEFtb3VudCBiZSBleGFjdCB0aGUgbW9tZW50IHNlbmQoKSByZXR1cm5zLlxyXG5mdW5jdGlvbiB0b0J5dGVzU3luYyhkYXRhOiBzdHJpbmcgfCBBcnJheUJ1ZmZlckxpa2UgfCBBcnJheUJ1ZmZlclZpZXcgfCBCbG9iKTogVWludDhBcnJheSB8IG51bGwge1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRleHRFbmNvZGVyLmVuY29kZShkYXRhKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgQmxvYiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgQmxvYikge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpLnNsaWNlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YSBhcyBBcnJheUJ1ZmZlckxpa2UpLnNsaWNlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFib3J0YWJsZTxUPihwcm9taXNlOiBQcm9taXNlPFQ+LCBzaWduYWw/OiBBYm9ydFNpZ25hbCk6IFByb21pc2U8VD4ge1xyXG4gICAgaWYgKCFzaWduYWwpIHJldHVybiBwcm9taXNlO1xyXG4gICAgaWYgKHNpZ25hbC5hYm9ydGVkKSByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFN0cmVhbVJlcXVlc3RDYW5jZWxsZWQoKSk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBjb25zdCBvbkFib3J0ID0gKCkgPT4gcmVqZWN0KG5ldyBTdHJlYW1SZXF1ZXN0Q2FuY2VsbGVkKCkpO1xyXG4gICAgICAgIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCwgeyBvbmNlOiB0cnVlIH0pO1xyXG4gICAgICAgIHByb21pc2UudGhlbihcclxuICAgICAgICAgICAgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIG9uQWJvcnQpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCk7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICApO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHRvQnl0ZXMoXHJcbiAgICBkYXRhOiBzdHJpbmcgfCBBcnJheUJ1ZmZlckxpa2UgfCBBcnJheUJ1ZmZlclZpZXcgfCBCbG9iLFxyXG4gICAgc2lnbmFsPzogQWJvcnRTaWduYWwsXHJcbik6IFByb21pc2U8VWludDhBcnJheT4ge1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRleHRFbmNvZGVyLmVuY29kZShkYXRhKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgQmxvYiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgQmxvYikge1xyXG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCBhYm9ydGFibGUoZGF0YS5hcnJheUJ1ZmZlcigpLCBzaWduYWwpKTtcclxuICAgIH1cclxuICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKS5zbGljZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGRhdGEgYXMgQXJyYXlCdWZmZXJMaWtlKS5zbGljZSgpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBwb3N0RnJhbWUoY29ubklEOiBudW1iZXIsIGtpbmQ6IG51bWJlciwgYm9keTogVWludDhBcnJheSwgbmFtZT86IHN0cmluZywgc2lnbmFsPzogQWJvcnRTaWduYWwpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgW0hEUl9TRVNTSU9OXTogRy5zZXNzaW9uLFxyXG4gICAgICAgIFtIRFJfR0VORVJBVElPTl06IFN0cmluZyhHLmdlbmVyYXRpb24pLFxyXG4gICAgICAgIFtIRFJfQ09OTl06IFN0cmluZyhjb25uSUQpLFxyXG4gICAgICAgIFtIRFJfS0lORF06IFN0cmluZyhraW5kKSxcclxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxyXG4gICAgfTtcclxuICAgIGlmIChuYW1lICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBoZWFkZXJzW0hEUl9OQU1FXSA9IG5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJvZHkuYnl0ZUxlbmd0aCA8PSBDSFVOS19USFJFU0hPTEQpIHtcclxuICAgICAgICBhd2FpdCBwb3N0V2l0aFJldHJ5KGhlYWRlcnMsIGJvZHksIHNpZ25hbCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNwbGl0IG92ZXJzaXplZCBmcmFtZXMgdGhlIHNhbWUgd2F5IHRoZSBydW50aW1lIHNwbGl0cyBvdmVyc2l6ZWQgY2FsbHMuXHJcbiAgICBjb25zdCBjaHVua0lEID0gbmFub2lkKCk7XHJcbiAgICBjb25zdCB0b3RhbCA9IE1hdGguY2VpbChib2R5LmJ5dGVMZW5ndGggLyBDSFVOS19USFJFU0hPTEQpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3RhbDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgc2xpY2UgPSBib2R5LnN1YmFycmF5KGkgKiBDSFVOS19USFJFU0hPTEQsIChpICsgMSkgKiBDSFVOS19USFJFU0hPTEQpO1xyXG4gICAgICAgIGF3YWl0IHBvc3RXaXRoUmV0cnkoe1xyXG4gICAgICAgICAgICAuLi5oZWFkZXJzLFxyXG4gICAgICAgICAgICBbSERSX0NIVU5LXTogY2h1bmtJRCxcclxuICAgICAgICAgICAgW0hEUl9DSFVOS19JTkRFWF06IFN0cmluZyhpKSxcclxuICAgICAgICAgICAgW0hEUl9DSFVOS19UT1RBTF06IFN0cmluZyh0b3RhbCksXHJcbiAgICAgICAgfSwgc2xpY2UsIHNpZ25hbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIEEgNDI5IG1lYW5zIHRoZSBHbyBoYW5kbGVyIGhhcyBub3QgdGFrZW4gZGVsaXZlcnkgb2Ygd2hhdCBpcyBhbHJlYWR5IHF1ZXVlZC5cclxuLy8gUmV0cnlpbmcgdGhlIHNhbWUgZnJhbWUga2VlcHMgb3JkZXJpbmcgKHRoZSBzZW5kIGNoYWluIGhhcyBub3QgbW92ZWQgb24pIGFuZFxyXG4vLyBsZWF2ZXMgdGhlIHJlcXVlc3Qgc2xvdCBmcmVlLCB3aGljaCBpcyB3aGF0IHN0b3BzIGEgYmFja2VkLXVwIGNvbm5lY3Rpb24gZnJvbVxyXG4vLyBzdGFydmluZyB0aGUgd2luZG93J3MgcG9sbC5cclxuYXN5bmMgZnVuY3Rpb24gcG9zdFdpdGhSZXRyeShoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LCBib2R5OiBVaW50OEFycmF5LCBzaWduYWw/OiBBYm9ydFNpZ25hbCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgLy8gTmV2ZXIgcmV0cnkgd2l0aCB6ZXJvIGRlbGF5LiBUaGUgcmVjZWl2ZXIgYmVpbmcgYmVoaW5kIGlzIGEgY29uZGl0aW9uXHJcbiAgICAvLyB0aGF0IHRha2VzIHRpbWUgdG8gY2xlYXIsIGFuZCBhbiBpbW1lZGlhdGUgcmV0cnkgaXMgYSBidXN5IGxvb3Agb2ZcclxuICAgIC8vIGZldGNoZXMgXHUyMDE0IGVhY2ggb25lIGEgc2NoZW1lLWhhbmRsZXIgcm91bmQgdHJpcCwgYW5kIG9uIHRoZSBob3N0IGEgY2dvXHJcbiAgICAvLyBjYWxsLiBTdGFydCBhdCAxIG1zIGFuZCByYW1wLlxyXG4gICAgbGV0IHdhaXQgPSAxO1xyXG4gICAgZm9yICg7Oykge1xyXG4gICAgICAgIGlmIChzaWduYWw/LmFib3J0ZWQpIHRocm93IG5ldyBTdHJlYW1SZXF1ZXN0Q2FuY2VsbGVkKCk7XHJcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKHN0cmVhbVVSTChcInNlbmRcIiksIHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgaGVhZGVycyxcclxuICAgICAgICAgICAgYm9keTogYm9keSBhcyBCb2R5SW5pdCxcclxuICAgICAgICAgICAgc2lnbmFsLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChyZXNwLm9rKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHJlc3Auc3RhdHVzICE9PSA0MjkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGF3YWl0IHJlc3AudGV4dCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgc2xlZXAod2FpdCwgc2lnbmFsKTtcclxuICAgICAgICB3YWl0ID0gTWF0aC5taW4od2FpdCAqIDIsIDUwKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gcG9zdEJhdGNoIHNlbmRzIHNldmVyYWwgZGF0YSBmcmFtZXMgZm9yIG9uZSBjb25uZWN0aW9uIGluIGJvdW5kZWQgcmVxdWVzdHMuXHJcbi8vIEJvZHk6IGNvdW50IHUzMiwgdGhlbiBjb3VudCB4ICggbGVuIHUzMiB8IHBheWxvYWQgKS4gVGhlIGNvbWJpbmVkIGJvZHkgc3RheXNcclxuLy8gd2l0aGluIENIVU5LX1RIUkVTSE9MRDogc2V2ZXJhbCBpbmRpdmlkdWFsbHkgc21hbGwgZnJhbWVzIG11c3Qgbm90IHJlY3JlYXRlXHJcbi8vIHRoZSBXZWJWaWV3MiBib2R5LXNpemUgcHJvYmxlbSB0aGF0IGNodW5raW5nIHNpbmdsZSBsYXJnZSBmcmFtZXMgYXZvaWRzLlxyXG5hc3luYyBmdW5jdGlvbiBwb3N0QmF0Y2goY29ubklEOiBudW1iZXIsIGZyYW1lczogVWludDhBcnJheVtdLCBzaWduYWw/OiBBYm9ydFNpZ25hbCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgIHdoaWxlIChzdGFydCA8IGZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgICBpZiAoZnJhbWVzW3N0YXJ0XS5ieXRlTGVuZ3RoID4gQ0hVTktfVEhSRVNIT0xEKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHBvc3RGcmFtZShjb25uSUQsIEtJTkRfREFUQSwgZnJhbWVzW3N0YXJ0XSwgdW5kZWZpbmVkLCBzaWduYWwpO1xyXG4gICAgICAgICAgICBzdGFydCsrO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBlbmQgPSBzdGFydDtcclxuICAgICAgICBsZXQgc2l6ZSA9IDQ7IC8vIGZyYW1lIGNvdW50XHJcbiAgICAgICAgd2hpbGUgKGVuZCA8IGZyYW1lcy5sZW5ndGggJiYgZW5kIC0gc3RhcnQgPCBNQVhfQkFUQ0hfRlJBTUVTKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gZnJhbWVzW2VuZF07XHJcbiAgICAgICAgICAgIGlmIChmcmFtZS5ieXRlTGVuZ3RoID4gQ0hVTktfVEhSRVNIT0xEIHx8IHNpemUgKyA0ICsgZnJhbWUuYnl0ZUxlbmd0aCA+IENIVU5LX1RIUkVTSE9MRCkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2l6ZSArPSA0ICsgZnJhbWUuYnl0ZUxlbmd0aDtcclxuICAgICAgICAgICAgZW5kKys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBIG5lYXItdGhyZXNob2xkIGZyYW1lIGZpdHMgYXMgYSBub3JtYWwgUE9TVCBib2R5IGJ1dCBub3QgaW5zaWRlIGFcclxuICAgICAgICAvLyBiYXRjaCBvbmNlIGl0cyBjb3VudCBhbmQgbGVuZ3RoIGhlYWRlcnMgYXJlIGluY2x1ZGVkLlxyXG4gICAgICAgIGlmIChlbmQgPT09IHN0YXJ0KSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHBvc3RGcmFtZShjb25uSUQsIEtJTkRfREFUQSwgZnJhbWVzW3N0YXJ0XSwgdW5kZWZpbmVkLCBzaWduYWwpO1xyXG4gICAgICAgICAgICBzdGFydCsrO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGdyb3VwID0gZnJhbWVzLnNsaWNlKHN0YXJ0LCBlbmQpO1xyXG4gICAgICAgIGlmIChncm91cC5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgYXdhaXQgcG9zdEZyYW1lKGNvbm5JRCwgS0lORF9EQVRBLCBncm91cFswXSwgdW5kZWZpbmVkLCBzaWduYWwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHBvc3RCYXRjaEdyb3VwKGNvbm5JRCwgZ3JvdXAsIHNpZ25hbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXJ0ID0gZW5kO1xyXG4gICAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBwb3N0QmF0Y2hHcm91cChjb25uSUQ6IG51bWJlciwgZnJhbWVzOiBVaW50OEFycmF5W10sIHNpZ25hbD86IEFib3J0U2lnbmFsKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoZnJhbWVzLmxlbmd0aCA9PT0gMCB8fCBmcmFtZXMubGVuZ3RoID4gTUFYX0JBVENIX0ZSQU1FUykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgc3RyZWFtIGJhdGNoIHNpemVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGJvZHkgPSBidWlsZEJhdGNoKGZyYW1lcyk7XHJcbiAgICBsZXQgc2VudCA9IDA7XHJcbiAgICBsZXQgd2FpdCA9IDE7XHJcbiAgICBmb3IgKDs7KSB7XHJcbiAgICAgICAgaWYgKHNpZ25hbD8uYWJvcnRlZCkgdGhyb3cgbmV3IFN0cmVhbVJlcXVlc3RDYW5jZWxsZWQoKTtcclxuICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goc3RyZWFtVVJMKFwic2VuZFwiKSwge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICBbSERSX1NFU1NJT05dOiBHLnNlc3Npb24sXHJcbiAgICAgICAgICAgICAgICBbSERSX0dFTkVSQVRJT05dOiBTdHJpbmcoRy5nZW5lcmF0aW9uKSxcclxuICAgICAgICAgICAgICAgIFtIRFJfQ09OTl06IFN0cmluZyhjb25uSUQpLFxyXG4gICAgICAgICAgICAgICAgW0hEUl9LSU5EXTogU3RyaW5nKEtJTkRfREFUQSksXHJcbiAgICAgICAgICAgICAgICBbSERSX0JBVENIXTogU3RyaW5nKGZyYW1lcy5sZW5ndGggLSBzZW50KSxcclxuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IGJvZHkgYXMgQm9keUluaXQsXHJcbiAgICAgICAgICAgIHNpZ25hbCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAocmVzcC5vaykgcmV0dXJuO1xyXG4gICAgICAgIGlmIChyZXNwLnN0YXR1cyAhPT0gNDI5KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihhd2FpdCByZXNwLnRleHQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFRoZSByZWNlaXZlciB0b29rIGEgcHJlZml4IG9mIHRoZSBiYXRjaC4gUmVzZW5kIG9ubHkgd2hhdCBpcyBsZWZ0LFxyXG4gICAgICAgIC8vIHdoaWNoIGtlZXBzIG9yZGVyaW5nIHdpdGhvdXQgcmUtZGVsaXZlcmluZyBhbnl0aGluZy5cclxuICAgICAgICBjb25zdCBhY2NlcHRlZCA9IE51bWJlcihyZXNwLmhlYWRlcnMuZ2V0KEhEUl9CQVRDSCkgPz8gMCk7XHJcbiAgICAgICAgY29uc3QgcmVtYWluaW5nID0gZnJhbWVzLmxlbmd0aCAtIHNlbnQ7XHJcbiAgICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGFjY2VwdGVkKSB8fCBhY2NlcHRlZCA8IDAgfHwgYWNjZXB0ZWQgPj0gcmVtYWluaW5nKSB7XHJcbiAgICAgICAgICAgIC8vIFplcm8gaXMgdmFsaWQgKG5vIHByb2dyZXNzKSwgYnV0IGFuIG91dC1vZi1yYW5nZSBhY2tub3dsZWRnZW1lbnRcclxuICAgICAgICAgICAgLy8gaXMgYSBwcm90b2NvbCBlcnJvci4gS2VlcCB6ZXJvIG9uIHRoZSByZXRyeSBwYXRoIGJlbG93LlxyXG4gICAgICAgICAgICBpZiAoYWNjZXB0ZWQgIT09IDApIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgc3RyZWFtIGJhdGNoIGFja25vd2xlZGdlbWVudFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VudCArPSBhY2NlcHRlZDtcclxuICAgICAgICBib2R5ID0gYnVpbGRCYXRjaChmcmFtZXMuc2xpY2Uoc2VudCkpO1xyXG4gICAgICAgIGF3YWl0IHNsZWVwKHdhaXQsIHNpZ25hbCk7XHJcbiAgICAgICAgd2FpdCA9IE1hdGgubWluKHdhaXQgKiAyLCA1MCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJ1aWxkQmF0Y2goZnJhbWVzOiBVaW50OEFycmF5W10pOiBVaW50OEFycmF5IHtcclxuICAgIGxldCBzaXplID0gNDtcclxuICAgIGZvciAoY29uc3QgZiBvZiBmcmFtZXMpIHNpemUgKz0gNCArIGYuYnl0ZUxlbmd0aDtcclxuICAgIGNvbnN0IG91dCA9IG5ldyBVaW50OEFycmF5KHNpemUpO1xyXG4gICAgY29uc3QgdmlldyA9IG5ldyBEYXRhVmlldyhvdXQuYnVmZmVyKTtcclxuICAgIHZpZXcuc2V0VWludDMyKDAsIGZyYW1lcy5sZW5ndGgpO1xyXG4gICAgbGV0IG9mZiA9IDQ7XHJcbiAgICBmb3IgKGNvbnN0IGYgb2YgZnJhbWVzKSB7XHJcbiAgICAgICAgdmlldy5zZXRVaW50MzIob2ZmLCBmLmJ5dGVMZW5ndGgpO1xyXG4gICAgICAgIG9mZiArPSA0O1xyXG4gICAgICAgIG91dC5zZXQoZiwgb2ZmKTtcclxuICAgICAgICBvZmYgKz0gZi5ieXRlTGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnRQb2xsaW5nKCk6IHZvaWQge1xyXG4gICAgaWYgKEcucG9sbGluZyB8fCAhaGFzRE9NKSByZXR1cm47XHJcbiAgICBHLnBvbGxpbmcgPSB0cnVlO1xyXG4gICAgdm9pZCBwb2xsTG9vcCgpO1xyXG59XHJcblxyXG4vKipcclxuICogT25lIHBvbGwgZm9yIHRoZSB3aG9sZSBwYWdlLCBzaGFyZWQgYnkgZXZlcnkgY29ubmVjdGlvbi5cclxuICpcclxuICogVGhlcmUgaXMgbm8gcG9sbGluZyBpbnRlcnZhbCBhbmQgbm90aGluZyBhZGFwdGl2ZSBoZXJlIG9uIHB1cnBvc2UuIFRoZSBzZXJ2ZXJcclxuICogaG9sZHMgdGhlIHJlcXVlc3QgdW50aWwgYSBmcmFtZSBleGlzdHMsIHNvIGRlbGl2ZXJ5IGxhdGVuY3kgaXMgYWxyZWFkeSB+MCBhbmRcclxuICogYSBjbGllbnQtc2lkZSBpbnRlcnZhbCBjb3VsZCBvbmx5IGFkZCB0byBpdC4gRnJhbWVzIHRoYXQgYXJyaXZlIHdoaWxlIGFcclxuICogcmVzcG9uc2UgaXMgaW4gZmxpZ2h0IHNpbXBseSBhY2N1bXVsYXRlIGFuZCByaWRlIHRoZSBuZXh0IG9uZSwgd2hpY2ggbWFrZXNcclxuICogdGhlIHJvdW5kIHRyaXAgaXRzZWxmIHRoZSBiYXRjaGluZyB3aW5kb3cgXHUyMDE0IGl0IHdpZGVucyBhcyBsb2FkIHJpc2VzIHdpdGhvdXRcclxuICogYW55dGhpbmcgaGF2aW5nIHRvIG1lYXN1cmUgaXQuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBwb2xsTG9vcCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGxldCBiYWNrb2ZmID0gMDtcclxuICAgIGNvbnN0IGFib3J0ID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG4gICAgRy5wb2xsQWJvcnQgPSBhYm9ydDtcclxuXHJcbiAgICB3aGlsZSAoRy5jb25uZWN0aW9ucy5zaXplID4gMCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChzdHJlYW1VUkwoXCJwb2xsXCIpLCB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgW0hEUl9TRVNTSU9OXTogRy5zZXNzaW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIFtIRFJfR0VORVJBVElPTl06IFN0cmluZyhHLmdlbmVyYXRpb24pLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNhY2hlOiBcIm5vLXN0b3JlXCIsXHJcbiAgICAgICAgICAgICAgICBzaWduYWw6IGFib3J0LnNpZ25hbCxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT09IDQxMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIHNlc3Npb24gaXMgZ29uZTogYXBwIHNodXR0aW5nIGRvd24sIHdpbmRvdyBjbG9zZWQsIG9yIHdlXHJcbiAgICAgICAgICAgICAgICAvLyB3ZXJlIHJlYXBlZCBhcyB1bnJlYWNoYWJsZS4gTm90aGluZyB0byByZXRyeS5cclxuICAgICAgICAgICAgICAgIGNsb3NlQWxsKDEwMDEsIFwic2Vzc2lvbiBjbG9zZWRcIik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXJlc3Aub2sgJiYgcmVzcC5zdGF0dXMgIT09IDIwNCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc1JldHJ5YWJsZVBvbGxTdGF0dXMocmVzcC5zdGF0dXMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFpbEFsbChcInN0cmVhbSBwb2xsIGZhaWxlZDogXCIgKyByZXNwLnN0YXR1cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXRyeWFibGUgc3RyZWFtIHBvbGwgZmFpbHVyZTogXCIgKyByZXNwLnN0YXR1cyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGJhY2tvZmYgPSAwO1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgIT09IDIwNCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJ1ZjogQXJyYXlCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZiA9IGF3YWl0IHJlc3AuYXJyYXlCdWZmZXIoKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBHbyBxdWV1ZSB3YXMgY29uc3VtZWQgd2hlbiB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdhcyBwcm9kdWNlZC4gUmV0cnlpbmcgY2Fubm90IHJlY292ZXIgYSBib2R5IHRoYXQgd2FzXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaW50ZXJydXB0ZWQgYWZ0ZXIgdGhhdCBwb2ludCwgc28gc3VyZmFjZSB0aGUgbG9zcyBhbmRcclxuICAgICAgICAgICAgICAgICAgICAvLyBzdG9wIGluc3RlYWQgb2Ygc2lsZW50bHkgY29udGludWluZyB3aXRoIG1pc3NpbmcgZnJhbWVzLlxyXG4gICAgICAgICAgICAgICAgICAgIGZhaWxBbGwoXCJzdHJlYW0gcG9sbCByZXNwb25zZSBib2R5IGZhaWxlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGZyYW1lcyA9IGRlY29kZUZyYW1lcyhidWYpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZyYW1lcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEEgZnJhbWluZyBtaXNtYXRjaCBtZWFucyBhIHN0YWxlIGNhY2hlZCBydW50aW1lIGFnYWluc3QgYVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5ld2VyIEdvIHNpZGUuIFJldHJ5aW5nIGNhbm5vdCBmaXggdGhhdCwgYW5kIGxldHRpbmcgaXRcclxuICAgICAgICAgICAgICAgICAgICAvLyBmYWxsIGludG8gdGhlIGJhY2tvZmYgYmVsb3cgd291bGQgc3BpbiBzaWxlbnRseSBmb3JldmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvIGZhaWwgZXZlcnkgY29ubmVjdGlvbiB3aXRoIGEgcmVhc29uIGluc3RlYWQuXHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VBbGwoMTAwMiwgXCJ1bnJlY29nbmlzZWQgc3RyZWFtIGZyYW1pbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWxpdmVyKGZyYW1lcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUmUtcG9sbCBpbW1lZGlhdGVseSwgb24gZGF0YSBhbmQgb24gYW4gZXhwaXJlZCBob2xkIGFsaWtlLlxyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBpZiAoYWJvcnQuc2lnbmFsLmFib3J0ZWQgfHwgRy5jb25uZWN0aW9ucy5zaXplID09PSAwKSBicmVhaztcclxuICAgICAgICAgICAgYmFja29mZiA9IGJhY2tvZmYgPyBNYXRoLm1pbihiYWNrb2ZmICogMiwgQkFDS09GRl9NQVgpIDogQkFDS09GRl9NSU47XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcChiYWNrb2ZmLCBhYm9ydC5zaWduYWwpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChHLnBvbGxBYm9ydCA9PT0gYWJvcnQpIEcucG9sbEFib3J0ID0gdW5kZWZpbmVkO1xyXG4gICAgRy5wb2xsaW5nID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQSBjb25uZWN0aW9uIG9wZW5lZCB3aGlsZSB3ZSB3ZXJlIHdpbmRpbmcgZG93bjogcGljayB0aGUgbG9vcCBiYWNrIHVwLlxyXG4gICAgaWYgKEcuY29ubmVjdGlvbnMuc2l6ZSA+IDApIHtcclxuICAgICAgICBzdGFydFBvbGxpbmcoKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaXNSZXRyeWFibGVQb2xsU3RhdHVzKHN0YXR1czogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gc3RhdHVzID09PSA0MDggfHwgc3RhdHVzID09PSA0MjUgfHwgc3RhdHVzID09PSA0MjkgfHwgKHN0YXR1cyA+PSA1MDAgJiYgc3RhdHVzIDw9IDU5OSk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBJbkZyYW1lIHtcclxuICAgIGNvbm5JRDogbnVtYmVyO1xyXG4gICAga2luZDogbnVtYmVyO1xyXG4gICAgcGF5bG9hZDogQXJyYXlCdWZmZXI7XHJcbn1cclxuXHJcbi8vIFZhbGlkYXRlIHRoZSBjb21wbGV0ZSByZXNwb25zZSBiZWZvcmUgZGlzcGF0Y2hpbmcgYW55IHBhcnQgb2YgaXQuIEEgc2hvcnRcclxuLy8gcGxhdGZvcm0gcmVzcG9uc2UgbXVzdCBub3QgZGVsaXZlciBhIHZhbGlkIHByZWZpeCBhbmQgdGhlbiB0aHJvdyBSYW5nZUVycm9yOlxyXG4vLyB0aGUgR28gcXVldWUgaGFzIGFscmVhZHkgYmVlbiBkcmFpbmVkLCBzbyByZXRyeWluZyBjYW5ub3QgcmVjb3ZlciB0aG9zZVxyXG4vLyBmcmFtZXMuIFRyZWF0IHRoZSB3aG9sZSByZXNwb25zZSBhcyBhIHByb3RvY29sIGVycm9yIGluc3RlYWQuXHJcbmZ1bmN0aW9uIGRlY29kZUZyYW1lcyhidWY6IEFycmF5QnVmZmVyKTogSW5GcmFtZVtdIHwgbnVsbCB7XHJcbiAgICBpZiAoYnVmLmJ5dGVMZW5ndGggPCA5KSByZXR1cm4gbnVsbDtcclxuICAgIGNvbnN0IGR2ID0gbmV3IERhdGFWaWV3KGJ1Zik7XHJcbiAgICBpZiAoZHYuZ2V0VWludDgoMCkgIT09IDB4NTcgfHwgZHYuZ2V0VWludDgoMSkgIT09IDB4NTMgfHxcclxuICAgICAgICBkdi5nZXRVaW50OCgyKSAhPT0gMHgzMSB8fCBkdi5nZXRVaW50OCgzKSAhPT0gMHgwMCB8fFxyXG4gICAgICAgIChkdi5nZXRVaW50OCg0KSAmIH4xKSAhPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvdW50ID0gZHYuZ2V0VWludDMyKDUpO1xyXG4gICAgY29uc3QgZnJhbWVzOiBJbkZyYW1lW10gPSBbXTtcclxuICAgIGxldCBvZmYgPSA5O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgIGlmIChvZmYgKyA5ID4gYnVmLmJ5dGVMZW5ndGgpIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNvbnN0IGNvbm5JRCA9IGR2LmdldFVpbnQzMihvZmYpOyBvZmYgKz0gNDtcclxuICAgICAgICBjb25zdCBraW5kID0gZHYuZ2V0VWludDgob2ZmKTsgb2ZmICs9IDE7XHJcbiAgICAgICAgY29uc3QgbGVuID0gZHYuZ2V0VWludDMyKG9mZik7IG9mZiArPSA0O1xyXG4gICAgICAgIGlmIChraW5kID4gS0lORF9FUlJPUiB8fCBsZW4gPiBidWYuYnl0ZUxlbmd0aCAtIG9mZikgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGJ1Zi5zbGljZShvZmYsIG9mZiArIGxlbik7IG9mZiArPSBsZW47XHJcbiAgICAgICAgZnJhbWVzLnB1c2goeyBjb25uSUQsIGtpbmQsIHBheWxvYWQgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9mZiA9PT0gYnVmLmJ5dGVMZW5ndGggPyBmcmFtZXMgOiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkZWxpdmVyKGZyYW1lczogSW5GcmFtZVtdKTogdm9pZCB7XHJcbiAgICBmb3IgKGNvbnN0IGZyYW1lIG9mIGZyYW1lcykge1xyXG4gICAgICAgIGNvbnN0IGNvbm5JRCA9IGZyYW1lLmNvbm5JRDtcclxuICAgICAgICBjb25zdCBraW5kID0gZnJhbWUua2luZDtcclxuICAgICAgICBjb25zdCBwYXlsb2FkID0gZnJhbWUucGF5bG9hZDtcclxuICAgICAgICBjb25zdCBjb25uID0gRy5jb25uZWN0aW9ucy5nZXQoY29ubklEKTtcclxuICAgICAgICBpZiAoIWNvbm4pIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKGtpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBLSU5EX0RBVEE6XHJcbiAgICAgICAgICAgICAgICBjb25uLl9tZXNzYWdlKHBheWxvYWQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS0lORF9PUEVOOlxyXG4gICAgICAgICAgICAgICAgY29ubi5fb3BlbmVkKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLSU5EX0NMT1NFOlxyXG4gICAgICAgICAgICAgICAgY29ubi5fY2xvc2VkKDEwMDAsIFwiXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS0lORF9FUlJPUjpcclxuICAgICAgICAgICAgICAgIGNvbm4uX2ZhaWwobmV3IEVycm9yKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwYXlsb2FkKSkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjbG9zZUFsbChjb2RlOiBudW1iZXIsIHJlYXNvbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBmb3IgKGNvbnN0IGNvbm4gb2YgWy4uLkcuY29ubmVjdGlvbnMudmFsdWVzKCldKSB7XHJcbiAgICAgICAgY29ubi5fY2xvc2VkKGNvZGUsIHJlYXNvbiwgZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBmYWlsQWxsKHJlYXNvbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBmb3IgKGNvbnN0IGNvbm4gb2YgWy4uLkcuY29ubmVjdGlvbnMudmFsdWVzKCldKSB7XHJcbiAgICAgICAgY29ubi5fZmFpbChuZXcgRXJyb3IocmVhc29uKSk7XHJcbiAgICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FBO0FBQUE7QUFBQTtBQUFBOzs7QUM2QkEsSUFBTSxjQUNGO0FBU0csU0FBUyxPQUFPLE9BQWUsSUFBWTtBQUM5QyxRQUFNLFNBQVMsT0FBTyxXQUFXLGVBQWUsT0FBTyxPQUFPLG9CQUFvQixhQUM1RSxTQUNBO0FBRU4sTUFBSSxRQUFRO0FBQ1IsVUFBTSxRQUFRLElBQUksV0FBVyxJQUFJO0FBQ2pDLFdBQU8sZ0JBQWdCLEtBQUs7QUFDNUIsUUFBSUEsTUFBSztBQUNULGFBQVNDLEtBQUksR0FBR0EsS0FBSSxNQUFNQSxNQUFLO0FBQzNCLE1BQUFELE9BQU0sWUFBWSxNQUFNQyxFQUFDLElBQUksRUFBRTtBQUFBLElBQ25DO0FBQ0EsV0FBT0Q7QUFBQSxFQUNYO0FBSUEsTUFBSSxLQUFLO0FBQ1QsTUFBSSxJQUFJLE9BQU87QUFDZixTQUFPLEtBQUs7QUFDUixVQUFNLFlBQWEsS0FBSyxPQUFPLElBQUksS0FBTSxDQUFDO0FBQUEsRUFDOUM7QUFDQSxTQUFPO0FBQ1g7OztBQzdDTyxJQUFNLFNBQVMsT0FBTyxXQUFXLGVBQWUsT0FBTyxhQUFhOzs7QUNGM0UsU0FBUyxhQUFxQjtBQUMxQixTQUFPLE9BQU8sU0FBUyxTQUFTO0FBQ3BDO0FBR0EsSUFBTSxrQkFBa0IsTUFBTTtBQWV2QixJQUFNLGVBQU4sY0FB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QztBQUNKOzs7QTVCaDhCQSxJQUFJLFFBQVE7QUFDUixTQUFPLFNBQVMsT0FBTyxVQUFVLENBQUM7QUFDdEM7QUFrRUEsSUFBSSxRQUFRO0FBQ1IsU0FBTyxPQUFPLFNBQWdCO0FBQzlCLFNBQU8sT0FBTyxXQUFXO0FBQzdCO0FBS0EsSUFBSSxRQUFRO0FBQ1IsU0FBTyxPQUFPLHlCQUF5QixlQUFPLHVCQUF1QixLQUFLLGNBQU07QUFDcEY7QUFHQSxJQUFJLFFBQVE7QUFDUixTQUFPLE9BQU8sa0JBQWtCO0FBQ2hDLFNBQU8sT0FBTyxrQkFBa0I7QUFDaEMsU0FBTyxPQUFPLGlCQUFpQjtBQUNuQztBQUVBLElBQUksUUFBUTtBQUNSLEVBQU8sT0FBTyxxQkFBcUI7QUFDdkM7QUFPTyxTQUFTLG1CQUFtQixLQUE0QjtBQUMzRCxTQUFPLE1BQU0sS0FBSyxFQUFFLFFBQVEsT0FBTyxDQUFDLEVBQy9CLEtBQUssY0FBWTtBQUNkLFFBQUksU0FBUyxJQUFJO0FBR2IsWUFBTSxlQUFlLFNBQVMsUUFBUSxJQUFJLGNBQWMsS0FBSyxJQUFJLFlBQVk7QUFDN0UsVUFBSSxZQUFZLFNBQVMsWUFBWSxHQUFHO0FBQ3BDLGNBQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM5QyxlQUFPLE1BQU07QUFDYixpQkFBUyxLQUFLLFlBQVksTUFBTTtBQUFBLE1BQ3BDO0FBQUEsSUFDSjtBQUFBLEVBQ0osQ0FBQyxFQUNBLE1BQU0sTUFBTTtBQUFBLEVBQUMsQ0FBQztBQUN2QjtBQUdBLElBQUksUUFBUTtBQUNSLHFCQUFtQixrQkFBa0I7QUFDekM7IiwKICAibmFtZXMiOiBbImlkIiwgImkiLCAiX2EiLCAiRXJyb3IiLCAiY2FsbCIsICJFcnJvciIsICJfYSIsICJBcnJheSIsICJNYXAiLCAiQXJyYXkiLCAiTWFwIiwgImtleSIsICJjYWxsIiwgIl9hIiwgIl9hIiwgInJlc2l6YWJsZSIsICJfYSIsICJjYWxsIiwgIl9hIiwgImNhbGwiLCAiX2EiLCAiX2EiLCAiY2FsbCIsICJIaWRlTWV0aG9kIiwgIlNob3dNZXRob2QiLCAiaXNEb2N1bWVudERvdEFsbCIsICJfYSIsICJyZWFzb24iLCAidmFsdWUiLCAiY2FsbCIsICJjYWxsIiwgImNhbGwiLCAiY2FsbCIsICJIYXB0aWNzIiwgIkRldmljZSIsICJJbmZvIiwgIkRldmljZSIsICJIYXB0aWNzIiwgImNhbGwiLCAiRGV2aWNlSW5mbyIsICJIYXB0aWNzIiwgIkRldmljZSIsICJJbmZvIiwgIlRvYXN0IiwgIlNob3ciLCAiRXZlbnRzIiwgIkV2ZW50cyIsICJDSFVOS19USFJFU0hPTEQiLCAiX2EiXQp9Cg==
