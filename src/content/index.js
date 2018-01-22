import browser from "webextension-polyfill";

function sizeMessenger(request, sender, sendResponse) {
  if (request.compensateSize) {
    sendResponse({
      width: window.outerWidth - window.innerWidth,
      height: window.outerHeight - window.innerHeight
    });
  } else if (request.getSize) {
    setTimeout(() => {
      sendResponse({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 100);
    return true;
  }
}

browser.runtime.onMessage.addListener(sizeMessenger);
