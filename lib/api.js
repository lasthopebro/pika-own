// Firefox: browser.* (Promises). Chromium/Brave: chrome.* (MV3 liefert ebenfalls Promises).
export const B = globalThis.browser ?? globalThis.chrome
