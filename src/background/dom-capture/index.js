import browser from 'webextension-polyfill'

let domCapture, domSnapshot
if (process.env.NODE_ENV !== 'test') {
  domCapture = require('raw-loader!@applitools/dom-capture/dist/captureDom.js')
  domSnapshot = require('raw-loader!@applitools/dom-capture/dist/processPage.js')
}

export async function getDomCapture(tabId) {
  const { disableDomCapture } = await browser.storage.local.get([
    'disableDomCapture',
  ])
  if (disableDomCapture) return false
  return parseOutExternalFrames(await runDomScript(tabId, domCapture))
}

export async function getDomSnapshot(tabId) {
  return await runDomScript(tabId, domSnapshot)
}

let scriptCount = 0

async function runDomScript(tabId, script) {
  scriptCount++
  const id = scriptCount
  browser.tabs.executeScript(tabId, {
    code: `(${script})().then(result => { window.__eyes__${id} = result; }).catch()`,
  })

  return new Promise((res, rej) => {
    let count = 0
    const domCapRetry = setInterval(() => {
      if (count >= 5000) {
        clearInterval(domCapRetry)
        rej('Unable to capture DOM within the timeout specified')
      }
      browser.tabs
        .executeScript(tabId, {
          code: `window.__eyes__${id};`,
        })
        .then(result => {
          // eslint-disable-next-line
          console.log(
            `[${count}ms]: ${
              result && result[0] ? result : 'No DOM Capture result yet'
            }`
          )
          if (result && result[0]) {
            browser.tabs.executeScript(tabId, {
              code: `delete window.__eyes__${id};`,
            })
            clearInterval(domCapRetry)
            res(result)
          }
        })
      count += 100
    }, 100)
  })
}

export function parseOutExternalFrames(input = []) {
  if (input && input[0]) {
    return input[0]
      .replace(/@@@@@(.|\n)*-----/, '')
      .replace(/@@@@@.*?@@@@@/g, '')
      .trim()
  }
}
