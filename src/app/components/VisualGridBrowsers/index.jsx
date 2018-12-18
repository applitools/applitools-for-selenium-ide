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
    this.state = {
      selectedBrowsers: [...this.props.selectedOptions],
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
      this.setState({ selectedBrowsers: [...this.props.selectedOptions] })
  }

  close() {
    this.setState({ ['selectedBrowsers']: [] })
    this.props.modalClose()
  }

  handleOptionChange(browser, event) {
    if (event && event.target.checked) {
      if (!this.isOptionSelected(browser)) {
        this.setState({
          ['selectedBrowsers']: [...this.state.selectedBrowsers, browser],
        })
      }
    } else {
      this.setState({
        ['selectedBrowsers']: this.state.selectedBrowsers.filter(
          option => option !== browser
        ),
      })
    }
  }

  isOptionSelected(browser) {
    return !!this.state.selectedBrowsers.filter(option => option === browser)[0]
  }

  onBrowserSubmit() {
    this.props.onSubmit(this.state.selectedBrowsers)
    this.props.modalClose()
  }

  render() {
    const customStyles = {
      content: {
        top: 'auto',
        left: 'auto',
        right: '-20%',
        bottom: '34%',
        width: '130px',
        height: '120px',
        transform: 'translate(-50%, -50%)',
      },
    }
    return (
      <Modal
        customStyles={customStyles}
        modalIsOpen={this.props.modalIsOpen}
        onRequestClose={this.close.bind(this)}
      >
        <div className="browsers">
          <CheckList
            items={this.browsers}
            optionSelected={this.isOptionSelected.bind(this)}
            handleOptionChange={this.handleOptionChange.bind(this)}
          />
          <FlatButton
            className="confirm"
            type="submit"
            onClick={this.onBrowserSubmit.bind(this)}
          >
            Confirm
          </FlatButton>
        </div>
      </Modal>
    )
  }
}
