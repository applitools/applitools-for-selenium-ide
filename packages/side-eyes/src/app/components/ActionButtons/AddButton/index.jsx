import React from 'react'
import PropTypes from 'prop-types'
import ActionButton from '../ActionButton'
import PlusSymbol from '../../../assets/images/ic_add.svg'
import './style.css'

export default class AddButton extends React.Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    isSelected: PropTypes.bool,
  }
  render() {
    return (
      <ActionButton
        type="add"
        size="19px"
        position="center"
        imgPath={PlusSymbol}
        onClick={this.props.onClick}
        isSelected={this.props.isSelected}
      />
    )
  }
}
