import React from 'react'
import PropTypes from 'prop-types'
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
      <div className="group" onClick={this.onClick.bind(this)}>
        <div className="group-header">
          <div className="title">{this.props.name}</div>
          <div className="selected-count">{this.props.selectedCount}</div>
          <div className="control">{this.state.isSelected ? '∨' : '∧'}</div>
        </div>
        {this.state.isSelected && '<hr />' && this.props.children}
      </div>
    )
  }
}
