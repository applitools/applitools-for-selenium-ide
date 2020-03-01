import React from 'react'
import PropTypes from 'prop-types'
import './style.css'

export default class FormLabel extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
  }
  render() {
    return (
      <div className="form-label">
        <div className="bold">{this.props.label}</div>
        <div>{this.props.children || this.props.placeholder}</div>
      </div>
    )
  }
}
