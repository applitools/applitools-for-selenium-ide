const DEBUGGER_PROTOCOL_VERSION = '1.3'

export default class Debugger {
  constructor(tabId) {
    this.tabId = tabId
    this.attach = this.attach.bind(this)
    this.detach = this.detach.bind(this)
    this.sendCommand = this.sendCommand.bind(this)
    this.captureScreenshot = this.captureScreenshot.bind(this)
  }
  attach() {
    return new Promise(res => {
      if (!this.connection) {
        const target = { tabId: this.tabId }
        chrome.debugger.attach(target, DEBUGGER_PROTOCOL_VERSION, () => {
          this.connection = target
          res(this.connection)
        })
      } else {
        res(this.connection)
      }
    })
  }

  detach() {
    return new Promise(res => {
      if (this.connection) {
        chrome.debugger.detach(this.connection, () => {
          this.connection = undefined
          res()
        })
      } else {
        res()
      }
    })
  }

  sendCommand(command, params) {
    return new Promise((res, rej) => {
      chrome.debugger.sendCommand(this.connection, command, params, r => {
        if (chrome.runtime.lastError && chrome.runtime.lastError.message) {
          rej(new Error(chrome.runtime.lastError.message))
        } else {
          res(r)
        }
      })
    })
  }

  captureScreenshot(options = {}) {
    return this.sendCommand('Page.captureScreenshot', options)
  }
}
