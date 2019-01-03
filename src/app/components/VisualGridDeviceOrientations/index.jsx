import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import CheckList from '../../../commons/components/CheckList'
import FlatButton from '../../../commons/components/FlatButton'
import './style.css'

export default class VisualGridDeviceOrientations extends React.Component {
  static propTypes = {
    modalIsOpen: PropTypes.bool.isRequired,
    modalClose: PropTypes.func.isRequired,
    selectedOptions: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.orientations = ['Portrait', 'Landscape']
    this.state = {
      selectedOptions: [...this.props.selectedOptions],
    }
  }

  componentDidUpdate(prevProps) {
    // NOTE:
    // Refreshing the state since it is passed throught props and is altered
    // in the parent component. Also because when the user closes the window
    // we discard the state, but selections from the parent component need to
    // persist into this window.
    //
    // TODO: Look into moving everything in the modal into its own component,
    // to leveraging unmounting/mounting that will leverage the constructor
    // without the need for tracking the update lifecycle like we're doing here
    if (
      prevProps.selectedOptions !== this.props.selectedOptions ||
      (!prevProps.modalIsOpen && this.props.modalIsOpen)
    )
      this.setState({ selectedOptions: [...this.props.selectedOptions] })
  }

  close() {
    this.setState({ ['selectedOptions']: [] })
    this.props.modalClose()
  }

  handleOptionChange(option, event) {
    if (event && event.target.checked) {
      if (!this.isOptionSelected(option)) {
        this.setState({
          ['selectedOptions']: [...this.state.selectedOptions, option],
        })
      }
    } else {
      this.setState({
        ['selectedOptions']: this.state.selectedOptions.filter(
          selectedOption => selectedOption !== option
        ),
      })
    }
  }

  isOptionSelected(option) {
    return !!this.state.selectedOptions.filter(
      selectedOption => selectedOption === option
    )[0]
  }

  onSubmit() {
    this.props.onSubmit(this.state.selectedOptions)
    this.props.modalClose()
  }

  render() {
    const customStyles = {
      content: {
        top: 'auto',
        left: 'auto',
        right: '-28%',
        bottom: '5%',
        width: '170px',
        transform: 'translate(-50%, -50%)',
      },
    }
    return (
      <Modal
        customStyles={customStyles}
        modalIsOpen={this.props.modalIsOpen}
        onRequestClose={this.close.bind(this)}
      >
        <div className="selections">
          <div className="select-device-orientations">
            <CheckList
              items={this.orientations}
              optionSelected={this.isOptionSelected.bind(this)}
              handleOptionChange={this.handleOptionChange.bind(this)}
            />
          </div>
        </div>
        <FlatButton
          className="confirm"
          type="submit"
          onClick={this.onSubmit.bind(this)}
        >
          Confirm
        </FlatButton>
      </Modal>
    )
  }
}
