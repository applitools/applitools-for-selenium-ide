import browser from "webextension-polyfill";

export function setViewportSize(width, height, playbackOptions) {
  if (!width || !height) return Promise.reject("Invalid value. Value should be WidthxHeight (e.g. 1280x800)");
  const compensatedSize = {};
  return browser.tabs.sendMessage(playbackOptions.tabId, {
    compensateSize: true
  }).then(compensation => {
    compensatedSize.width = width + compensation.width;
    compensatedSize.height = height + compensation.height;
    return browser.windows.update(playbackOptions.windowId, compensatedSize);
  }).then(() => fixInaccuracies({
    wantedSize: {
      width,
      height
    },
    compensatedSize
  }, playbackOptions));
}

export function getViewportSize(tabId) {
  return browser.tabs.get(tabId).then(tab => ({
    height: tab.height,
    width: tab.width
  }));
}

function fixInaccuracies(sizes, playbackOptions, retries = 3) {
  if (!retries) return Promise.reject(`Can not accurately set viewport size, set as ${sizes.actualSize.width}x${sizes.actualSize.height}`);
  return getViewportSize(playbackOptions.tabId).then(actualSize => {
    if (actualSize.width === sizes.wantedSize.width && actualSize.height === sizes.wantedSize.height) {
      return Promise.resolve(true);
    } else {
      let resizedWidth = sizes.compensatedSize.width + (sizes.wantedSize.width - actualSize.width);
      let resizedHeight = sizes.compensatedSize.height + (sizes.wantedSize.height - actualSize.height);
      return browser.windows.update(playbackOptions.windowId, {
        width: resizedWidth,
        height: resizedHeight
      }).then(() => fixInaccuracies({
        compensatedSize: {
          height: resizedHeight,
          width: resizedWidth
        },
        wantedSize: sizes.wantedSize,
        actualSize
      }, playbackOptions, --retries));
    }
  });
}
