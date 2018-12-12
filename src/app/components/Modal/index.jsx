import React from 'react'
import ReactModal from 'react-modal'
import PropTypes from 'prop-types'

export default class Modal extends React.Component {
  static propTypes = {
    modalIsOpen: PropTypes.bool,
    onRequestClose: PropTypes.func,
  }
  render() {
    const customStyles = {
      content: {
        top: 'auto',
        left: 'auto',
        right: '-33%',
        bottom: '0%',
        width: '171px',
        height: '300px',
        transform: 'translate(-50%, -50%)',
      },
    }
    return (
      <ReactModal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.props.onRequestClose}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        style={customStyles}
      >
        {this.props.children}
      </ReactModal>
    )
  }
}
