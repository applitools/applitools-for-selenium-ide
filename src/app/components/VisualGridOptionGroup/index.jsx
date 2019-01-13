import React from 'react'
import PropTypes from 'prop-types'
import Arrow from '../../assets/images/arrow_sm.svg'
import './style.css'

export default class VisualGridOptionGroup extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    selectedCount: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = { isSelected: false }
  }

  onClick() {
    this.setState({ isSelected: !this.state.isSelected })
  }

  render() {
    return (
      <div className="group">
        <div className="group-header" onClick={this.onClick.bind(this)}>
          <div className="title">{this.props.name}</div>
          <div className="selected-count">{this.props.selectedCount}</div>
          <div className="control">
            <ArrowIndicator directionIsUp={this.state.isSelected} />
          </div>
        </div>
        {this.state.isSelected && (
          <div className="contents">{this.props.children}</div>
        )}
      </div>
    )
  }
}

class ArrowIndicator extends React.Component {
  generateStyle() {
    let radian
    this.props.directionIsUp ? (radian = 270) : (radian = 90)
    return { transform: `rotate(${radian}deg)` }
  }
  render() {
    return <img src={Arrow} alt="arrow" style={this.generateStyle()} />
  }
}
