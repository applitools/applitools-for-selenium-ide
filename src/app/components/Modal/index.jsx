import React from 'react'
import ReactModal from 'react-modal'
import PropTypes from 'prop-types'

export default class Modal extends React.Component {
  static propTypes = {
    customStyles: PropTypes.object,
    modalIsOpen: PropTypes.bool,
    onRequestClose: PropTypes.func,
  }
  render() {
    return (
      <ReactModal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.props.onRequestClose}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        style={this.props.customStyles}
      >
        {this.props.children}
      </ReactModal>
    )
  }
}
