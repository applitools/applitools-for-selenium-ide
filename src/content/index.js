import browser from 'webextension-polyfill'

function getElementByXpath(path) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
}

function getElementRect(request, _sender, sendResponse) {
  if (request.getElementRect) {
    const element = getElementByXpath(request.path)
    const elementRects = element.getBoundingClientRect()
    sendResponse({
      x: Math.round(elementRects.left),
      y: Math.round(elementRects.top),
      width: Math.round(elementRects.width),
      height: Math.round(elementRects.height),
    })
  }
}

function sizeMessenger(request, _sender, sendResponse) {
  if (request.compensateSize) {
    const [width, height] = getInnerSize()
    sendResponse({
      width: window.outerWidth - width,
      height: window.outerHeight - height,
    })
  } else if (request.getSize) {
    setTimeout(() => {
      const [width, height] = getInnerSize()
      sendResponse({
        width,
        height,
      })
    }, 100)
    return true
  }
}

function getInnerSize() {
  let height, width
  if (window.innerHeight) {
    height = window.innerHeight
  } else if (
    document.documentElement &&
    document.documentElement.clientHeight
  ) {
    height = document.documentElement.clientHeight
  } else {
    let b = document.getElementsByTagName('body')[0]
    if (b.clientHeight) {
      height = b.clientHeight
    }
  }
  if (window.innerWidth) {
    width = window.innerWidth
  } else if (document.documentElement && document.documentElement.clientWidth) {
    width = document.documentElement.clientWidth
  } else {
    let b = document.getElementsByTagName('body')[0]
    if (b.clientWidth) {
      width = b.clientWidth
    }
  }
  return [width, height]
}

// BEWARE CONVOLUTED API AHEAD!!!
// When using onMessage or onMessageExternal listeners only one response can
// be returned, or else it will throw (sometimes throw in a different message at all!)
// When returning in the listener, the listener will treat this as the response:
// return 5 is the same as sendResponse(5)
// For that reason async operations are convoluted, if foo is async then this:
// return foo().then(sendRespnse) will throw, because foo returns a promise
// which will be used as the response value, and when the promise resolves
// another value is returned using sendResponse
// To use async operations with onMessage, return true, this will inform chrome
// to wait until the sendResponse callback is explicitly called, which results in:
// foo().then(sendResponse); return true
// PASTE THIS IN EVERY PLACE THAT LISTENS TO onMessage!!
browser.runtime.onMessage.addListener(sizeMessenger)
browser.runtime.onMessage.addListener(getElementRect)
