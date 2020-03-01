import React from 'react'
import ReactModal from 'react-modal'
import PropTypes from 'prop-types'
import './style.css'

export default class Modal extends React.Component {
  static propTypes = {
    customStyles: PropTypes.object,
    modalIsOpen: PropTypes.bool,
    onRequestClose: PropTypes.func,
  }
  handleKeyDown(event) {
    if (event.nativeEvent.key === 'Escape') {
      event.stopPropagation()
      event.preventDefault()
      this.props.onRequestClose()
    }
  }
  render() {
    // react-modal doesn't fully support passing a callback through keyDown.
    // 	The library recommends the approach below (e.g., a parent div within
    // 	the modal, ref focusing on it, and setting the tab index to -1).
    //
    // For details see: https://github.com/reactjs/react-modal/issues/184.
    //
    // Also, to prevent React's focus auto-styling, style.css was added with the
    //	appropriate bits.
    return (
      <ReactModal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.props.onRequestClose}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        style={this.props.customStyles}
        onAfterOpen={() => this.myEl && this.myEl.focus()}
      >
        <div
          className="keydownHook"
          ref={el => {
            this.myEl = el
          }}
          tabIndex="-1" // Enables key handlers on div
          onKeyDown={this.handleKeyDown.bind(this)}
        >
          {this.props.children}
        </div>
      </ReactModal>
    )
  }
}
