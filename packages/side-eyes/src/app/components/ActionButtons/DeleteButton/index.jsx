import React from 'react'
import PropTypes from 'prop-types'
import ActionButton from '../ActionButton'
import TrashIcon from '../../../assets/images/ic_delete.svg'
import './style.css'

export default class DeleteButton extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
  }
  render() {
    return (
      <ActionButton
        className="delete"
        type="close"
        size="16px"
        position="center"
        imgPath={TrashIcon}
        onClick={this.props.onClick}
      />
    )
  }
}
