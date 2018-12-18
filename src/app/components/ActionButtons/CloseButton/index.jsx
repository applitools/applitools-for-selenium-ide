import React from 'react'
import PropTypes from 'prop-types'
import ActionButton from '../ActionButton'
import XSymbol from '../../../assets/images/ic_x_close.svg'
import './style.css'

export default class CloseButton extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
  }
  render() {
    return (
      <ActionButton
        type="close"
        size="16px"
        position="center"
        imgPath={XSymbol}
        onClick={this.props.onClick}
      />
    )
  }
}
