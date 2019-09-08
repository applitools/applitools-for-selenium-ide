import browser from 'webextension-polyfill'
import { PositionProvider, Location } from '@applitools/eyes-images'
import ScrollPositionMemento from './ScrollPositionMemento'
import { getEntirePageSize, getCurrentScrollPosition } from './utils'

export default class ScrollPositionProvider extends PositionProvider {
  constructor(logger, tabId) {
    super()

    this._logger = logger
    this._tabId = tabId

    this._logger.verbose('creating ScrollPositionProvider')
  }

  async getCurrentPosition() {
    const result = await getCurrentScrollPosition(this._tabId)
    this._logger.verbose(`Current position: ${result}`)
    return result
  }

  async setPosition(location) {
    this._logger.verbose(`ScrollPositionProvider - Scrolling to ${location}`)
    await browser.tabs.executeScript(this._tabId, {
      code: `window.scrollTo(${location.getX()}, ${location.getY()})`,
    })
    this._logger.verbose('ScrollPositionProvider - Done scrolling!')
  }

  async getEntireSize() {
    const result = await getEntirePageSize(this._tabId)
    this._logger.verbose(`ScrollPositionProvider - Entire size: ${result}`)
    return result
  }

  async getState() {
    const position = await this.getCurrentPosition()
    return new ScrollPositionMemento(position)
  }

  async restoreState(state) {
    await this.setPosition(new Location(state.getX(), state.getY()))
    this._logger.verbose('Position restored.')
  }
}
