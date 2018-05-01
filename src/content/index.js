import browser from "webextension-polyfill";

function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function getElementRect(request, sender, sendResponse) {
  if (request.getElementRect) {
    const element = getElementByXpath(request.path);
    element.scrollIntoView();
    const elementRects = element.getBoundingClientRect();
    const bodyRects = document.documentElement.getBoundingClientRect();
    sendResponse({
      left: elementRects.x - bodyRects.left,
      top: elementRects.top - bodyRects.top,
      width: elementRects.width,
      height: elementRects.height
    });
  }
}

function sizeMessenger(request, sender, sendResponse) {
  if (request.compensateSize) {
    const [width, height] = getInnerSize();
    sendResponse({
      width: window.outerWidth - width,
      height: window.outerHeight - height
    });
  } else if (request.getSize) {
    setTimeout(() => {
      const [width, height] = getInnerSize();
      sendResponse({
        width,
        height
      });
    }, 100);
    return true;
  }
}

function getInnerSize() {
  let height, width;
  if (window.innerHeight) {
    height = window.innerHeight;
  } else if (document.documentElement && document.documentElement.clientHeight) {
    height = document.documentElement.clientHeight;
  } else {
    let b = document.getElementsByTagName("body")[0];
    if (b.clientHeight) {
      height = b.clientHeight;
    }
  }
  if (window.innerWidth) {
    width = window.innerWidth;
  } else if (document.documentElement && document.documentElement.clientWidth) {
    width = document.documentElement.clientWidth;
  } else {
    let b = document.getElementsByTagName("body")[0];
    if (b.clientWidth) { width = b.clientWidth;
    }
  }
  return [width, height];
}


browser.runtime.onMessage.addListener(sizeMessenger);
browser.runtime.onMessage.addListener(getElementRect);
