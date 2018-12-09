import browser from 'webextension-polyfill'
import { PositionProvider } from '@applitools/eyes-sdk-core'
import CSSTranslatePositionMemento from './CSSTranslatePositionMemento'
import { getEntirePageSize } from './utils.js'

export default class CSSTranslatePositionProvider extends PositionProvider {
  constructor(logger, tabId) {
    super()

    this._logger = logger
    this._tabId = tabId
    this._lastSetPosition

    this._logger.verbose('creating CssTranslatePositionProvider')
  }

  async getCurrentPosition() {
    this._logger.verbose('position to return: ', this._lastSetPosition)
    return this._lastSetPosition
  }

  async setPosition(location) {
    this._logger.verbose(
      `CssTranslatePositionProvider - Setting position to: ${location}`
    )
    const transform = `translate(-${location.getX()}px, -${location.getY()}px)`
    await this.setTransform(transform)
    this._logger.verbose('Done!')
    this._lastSetPosition = location
  }

  async getEntireSize() {
    const entireSize = await getEntirePageSize(this._tabId)
    this._logger.verbose(
      `CssTranslatePositionProvider - Entire size: ${entireSize}`
    )
    return entireSize
  }

  async getState() {
    return new CSSTranslatePositionMemento(
      await this.getTransform(),
      this._lastSetPosition
    )
  }

  async restoreState(state) {
    console.log(state)
    debugger
    await this.setTransform(state.getTransform())
    this._logger.verbose('Transform (position) restored.')
    this._lastSetPosition = state.getPosition()
  }

  async getTransform() {
    return (
      (await browser.tabs.executeScript({
        code: 'document.documentElement.style["transform"]',
      }))[0] || ''
    )
  }

  async setTransform(transform) {
    await browser.tabs.executeScript(this._tabId, {
      code: `document.documentElement.style['transform'] = '${transform}';`,
    })
  }
}
