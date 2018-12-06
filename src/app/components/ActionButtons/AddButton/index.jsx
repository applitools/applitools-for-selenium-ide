import React from 'react'
import ActionButton from '../ActionButton'
import ReactModal from 'react-modal'
import PlusSymbol from '../../../assets/images/ic_add.svg'
import './style.css'

const customStyles = {
  content: {
    top: 'auto',
    left: 'auto',
    right: '60px',
    bottom: '0%',
    marginRight: '-50%',
    width: '160px',
    transform: 'translate(-50%, -50%)',
  },
}

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
          style={customStyles}
        >
          {this.props.children}
        </ReactModal>
      </React.Fragment>
    )
  }
}
