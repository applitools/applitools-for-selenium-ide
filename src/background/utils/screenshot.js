import browser from "webextension-polyfill";
import Debugger from "../debugger";

import { isChrome, isFirefox } from "./userAgent";

export async function getScreenshot(tabId) {
  const size = await getEntirePageSize(tabId);
  if (isChrome) {
    return getChromeScreenshot(tabId, {
      clip: {
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        scale: 1 / window.devicePixelRatio
      },
      fromSurface: true
    });
  } else if (isFirefox) {
    return getFirefoxScreenshot(tabId, {
      x: 0,
      y: 0,
      width: size.width,
      height: size.height
    });
  } else {
    throw new Error("Unsupported in this browser");
  }
}

export function getRegionScreenshot(tabId, rect) {
  if (isChrome) {
    return getChromeScreenshot(tabId, {
      clip: Object.assign({
        scale: 1 / window.devicePixelRatio
      }, rect)
    });
  } else if (isFirefox) {
    return getFirefoxScreenshot(tabId, rect);
  } else {
    throw new Error("Unsupported in this browser");
  }
}

async function getChromeScreenshot(tabId, options) {
  const dbg = new Debugger(tabId);
  await dbg.attach();
  await dbg.sendCommand("Page.enable");
  const { width, height } = (await dbg.sendCommand("Page.getLayoutMetrics")).contentSize;
  await dbg.sendCommand("Emulation.setVisibleSize", {width, height});
  await dbg.sendCommand("Emulation.setDeviceMetricsOverride", {
    mobile: false,
    width,
    height,
    deviceScaleFactor: window.devicePixelRatio
  });
  await dbg.sendCommand("Emulation.setScrollbarsHidden", { hidden: true });
  let opt = { ...options,
    clip: {
      ...options.clip,
      height: Math.min(options.clip.height, 10000),
      width: Math.min(options.clip.width, 10000)
    }
  };
  const screenshot = await dbg.captureScreenshot(opt);
  await dbg.detach();
  return screenshot;
}

async function getFirefoxScreenshot(tabId, options) {
  return browser.tabs.sendMessage(tabId, {
    getFirefoxScreenshot: true,
    rect: options
  });
}

export function getEntirePageSize(tabId) {
  const scrollWidthPromise = browser.tabs.executeScript(tabId, { code: "document.documentElement.scrollWidth" });
  const bodyScrollWidthPromise = browser.tabs.executeScript(tabId, { code: "document.body.scrollWidth" });

  // IMPORTANT: Notice there's a major difference between scrollWidth
  // and scrollHeight. While scrollWidth is the maximum between an
  // element's width and its content width, scrollHeight might be
  // smaller (!) than the clientHeight, which is why we take the
  // maximum between them.
  const clientHeightPromise = browser.tabs.executeScript(tabId, { code: "document.documentElement.clientHeight" });
  const bodyClientHeightPromise = browser.tabs.executeScript(tabId, { code: "document.body.clientHeight" });
  const scrollHeightPromise = browser.tabs.executeScript(tabId, { code: "document.documentElement.scrollHeight" });
  const bodyScrollHeightPromise = browser.tabs.executeScript(tabId, { code: "document.body.scrollHeight" });

  return Promise.all([scrollWidthPromise, bodyScrollWidthPromise, clientHeightPromise, bodyClientHeightPromise, scrollHeightPromise, bodyScrollHeightPromise]).then((results) => {
    // Notice that each result is itself actually an array (since executeScript returns an Array).
    // Also, we since 'parseInt' (and in turn 'max') might return NaN, we add the "|| 0" to each such call.
    const scrollWidth = parseInt(results[0][0]) || 0;
    const bodyScrollWidth = parseInt(results[1][0]) || 0;
    const totalWidth = Math.max(scrollWidth, bodyScrollWidth) || 0;

    const clientHeight = parseInt(results[2][0]) || 0;
    const bodyClientHeight = parseInt(results[3][0]) || 0;
    const scrollHeight = parseInt(results[4][0]) || 0;
    const bodyScrollHeight = parseInt(results[5][0]) || 0;

    const maxDocumentElementHeight = Math.max(clientHeight, scrollHeight) || 0;
    const maxBodyHeight = Math.max(bodyClientHeight, bodyScrollHeight) || 0;
    const totalHeight = Math.max(maxDocumentElementHeight, maxBodyHeight) || 0;

    return ({width: totalWidth, height: totalHeight});
  });
}
