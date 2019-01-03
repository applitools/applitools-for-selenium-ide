import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import CheckList from '../../../commons/components/CheckList'
import FlatButton from '../../../commons/components/FlatButton'
import './style.css'

export default class VisualGridBrowsers extends React.Component {
  static propTypes = {
    modalIsOpen: PropTypes.bool.isRequired,
    modalClose: PropTypes.func.isRequired,
    selectedOptions: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.browsers = ['Chrome', 'Firefox']
    this.devices = [
      'iPhone 4',
      'iPhone 5/SE',
      'iPhone 6/7/8',
      'iPhone 6/7/8 Plus',
      'iPhone X',
      'BlackBerry Z30',
      'Nexus 4',
      'Nexus 5',
      'Nexus 5X',
      'Nexus 6',
      'Nexus 6P',
      'Pixel 2',
      'Pixel 2 XL',
      'LG Optimus L70',
      'Nokia N9',
      'Nokia Lumia 520',
      'Microsoft Lumia 550',
      'Microsoft Lumia 950',
      'Galaxy S III',
      'Galaxy S5',
      'Kindle Fire HDX',
      'iPad Mini',
      'iPad',
      'iPad Pro',
      'Blackberry PlayBook',
      'Nexus 10',
      'Nexus 7',
      'Galaxy Note 3',
      'Galaxy Note II',
    ]
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
          selectedOption => selectedOption.name !== option.name
        ),
      })
    }
  }

  handleBrowserChange(name, event) {
    this.handleOptionChange({ name: name, type: 'browser' }, event)
  }

  handleDeviceChange(name, event) {
    this.handleOptionChange({ name: name, type: 'device' }, event)
  }

  isOptionSelected(option) {
    return !!this.state.selectedOptions.filter(
      selectedOption => selectedOption.name === option
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
        right: '-30%',
        bottom: '-11%',
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
          <div className="select-browsers">
            <CheckList
              items={this.browsers}
              optionSelected={this.isOptionSelected.bind(this)}
              handleOptionChange={this.handleBrowserChange.bind(this)}
            />
          </div>
          <hr />
          <div className="select-devices">
            <CheckList
              items={this.devices}
              optionSelected={this.isOptionSelected.bind(this)}
              handleOptionChange={this.handleDeviceChange.bind(this)}
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
