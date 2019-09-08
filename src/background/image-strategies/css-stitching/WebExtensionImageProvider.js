import browser from 'webextension-polyfill'
import { ImageProvider, MutableImage } from '@applitools/eyes-images'

export default class WebExtensionImageProvider extends ImageProvider {
  constructor(tabId) {
    super()

    this._tabId = tabId
    this._windowId
  }

  async getImage() {
    if (!this._windowId) {
      this._windowId = (await browser.tabs.get(this._tabId)).windowId
    }
    await browser.windows.update(this._windowId, {
      focused: true,
    })
    await psetTimeout(100)
    const dataURI = await browser.tabs.captureVisibleTab(this._windowId, {
      format: 'png',
    })
    const imageBase64 = dataURI.replace('data:image/png;base64,', '')
    return new MutableImage(imageBase64)
  }
}

const psetTimeout = timeout =>
  new Promise(res => {
    setTimeout(res, timeout)
  })
