import { PositionMemento, Location } from '@applitools/eyes-images'

export default class ScrollPositionMemento extends PositionMemento {
  constructor(position) {
    super()

    this._position = new Location(position)
  }

  getX() {
    return this._position.getX()
  }

  getY() {
    return this._position.getY()
  }
}
