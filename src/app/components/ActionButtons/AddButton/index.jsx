import React from 'react'
import ActionButton from '../ActionButton'
import ReactModal from 'react-modal'
import PlusSymbol from '../../../assets/images/ic_add.svg'
import './style.css'

export default class AddButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = { modalIsOpen: false }
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }
  openModal() {
    this.setState({ modalIsOpen: true })
  }
  closeModal() {
    this.setState({ modalIsOpen: false })
  }
  render() {
    return (
      <React.Fragment>
        <ActionButton
          type="add"
          size="25px"
          position="center"
          imgPath={PlusSymbol}
          onClick={this.openModal}
        />
        <ReactModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          shouldCloseOnOverlayClick={true}
          ariaHideApp={false}
        >
          {this.props.children}
        </ReactModal>
      </React.Fragment>
    )
  }
}
