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
      x: Math.round(elementRects.x + window.scrollX),
      y: Math.round(elementRects.y + window.scrollY),
      width: Math.round(elementRects.width),
      height: Math.round(elementRects.height),
    })
  }
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
browser.runtime.onMessage.addListener(getElementRect)
