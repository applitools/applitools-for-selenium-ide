import React from 'react'
import Arrow from './arrow_sm.svg'

export default class ArrowIndicator extends React.Component {
  generateStyle() {
    let radian
    this.props.directionIsUp ? (radian = 270) : (radian = 90)
    return { transform: `rotate(${radian}deg)` }
  }
  render() {
    return <img src={Arrow} alt="arrow" style={this.generateStyle()} />
  }
}
