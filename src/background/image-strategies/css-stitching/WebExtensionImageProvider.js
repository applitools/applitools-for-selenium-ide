import browser from 'webextension-polyfill'
import { ImageProvider, MutableImage } from '@applitools/eyes-sdk-core'

export default class WebExtensionImageProvider extends ImageProvider {
  constructor(tabId) {
    super()

    this._tabId = tabId
    this._windowId
  }

  async getImage() {
    if (!this._windowId) {
      this._windowId = await browser.tabs.get(this._tabId).windowId
    }
    const dataURI = await browser.tabs.captureVisibleTab(this._windowId, {
      format: 'png',
    })
    const imageBase64 = dataURI.replace('data:image/png;base64,', '')
    return new MutableImage(imageBase64)
  }
}
