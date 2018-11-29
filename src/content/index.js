import browser from 'webextension-polyfill'

const BASE64_PREFIX = 'data:image/png;base64,'

function getFirefoxScreenshot(request, _sender, sendResponse) {
  if (request.getFirefoxScreenshot) {
    const canvas = document.createElementNS(
      'http://www.w3.org/1999/xhtml',
      'canvas'
    )
    const { x, y, width, height } = request.rect
    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    ctx.scale(1, 1) // for some reason we don't need to scale ??

    ctx.drawWindow(window, x, y, width, height, '#fff')

    sendResponse({
      data: canvas.toDataURL('image/png', '').substr(BASE64_PREFIX.length),
    })
  }
}

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

browser.runtime.onMessage.addListener(sizeMessenger)
browser.runtime.onMessage.addListener(getElementRect)
browser.runtime.onMessage.addListener(getFirefoxScreenshot)
