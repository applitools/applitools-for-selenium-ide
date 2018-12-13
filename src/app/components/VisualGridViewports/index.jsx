import browser from 'webextension-polyfill'
import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import CustomViewportSize from '../VisualGridCustomViewportSize'
import AddButton from '../ActionButtons/AddButton'
import FlatButton from '../../../commons/components/FlatButton'
import CheckList from '../../../commons/components/CheckList'
import uuidv4 from 'uuid/v4'
import './style.css'

export default class VisualGridViewports extends React.Component {
  static propTypes = {
    selectedOptions: PropTypes.array.isRequired,
    modalIsOpen: PropTypes.bool.isRequired,
    modalClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.viewportSizes = [
      '2560x1440',
      '2048x1536',
      '1920x1080',
      '750x1334',
      '720x1280',
    ]
    this.state = {
      customViewportSizes: [],
      selectedViewportSizes: [...this.props.selectedOptions],
    }
    browser.storage.local
      .get(['customViewportSizes'])
      .then(({ customViewportSizes }) => {
        this.setState({
          customViewportSizes: customViewportSizes || [],
        })
      })
  }

  componentDidUpdate(prevProps) {
    // NOTE:
    // Refreshing the state since it is passed throught props and can be altered
    // in the parent component. Also because when the user closes the window
    // we toss the state, but selections from the parent component need to
    // persist into this window.
    //
    // TODO: Look into moving everything in the modal into its own component,
    // to leveraging unmounting/mounting that will leverage the constructor
    // without the need for tracking the update lifecycle like we're doing here
    if (
      prevProps.selectedOptions !== this.props.selectedOptions ||
      (!prevProps.modalIsOpen && this.props.modalIsOpen)
    )
      this.setState({ selectedViewportSizes: [...this.props.selectedOptions] })
  }

  addCustomViewportSize() {
    this.setState({
      ['customViewportSizes']: [
        ...this.state['customViewportSizes'],
        { id: uuidv4(), width: '', height: '', selected: false },
      ],
    })
  }

  close() {
    this.setState({ ['selectedViewportSizes']: [] })
    this.props.modalClose()
  }

  deleteCustomViewport(id) {
    const result = {
      ['customViewportSizes']: this.state.customViewportSizes.filter(
        viewport => viewport.id !== id
      ),
    }
    browser.storage.local.set(result)
    this.setState(result)
  }

  handleOptionChange(dimensions, event) {
    const isEnabled = typeof event === 'boolean' ? event : event.target.checked
    if (isEnabled) {
      if (!this.isOptionSelected(dimensions)) {
        this.setState({
          ['selectedViewportSizes']: [
            ...this.state.selectedViewportSizes,
            dimensions,
          ],
        })
      }
    } else {
      this.setState({
        ['selectedViewportSizes']: this.state.selectedViewportSizes.filter(
          option => option !== dimensions
        ),
      })
    }
  }

  isOptionSelected(dimensions) {
    return !!this.state.selectedViewportSizes.filter(
      option => option === dimensions
    )[0]
  }

  generateDimensions(viewport, width, height) {
    if (viewport) return `${viewport.width}x${viewport.height}`
    else return `${width}x${height}`
  }

  onViewportChange(id, width = '', height = '', selected = false) {
    this.setState({
      ['customViewportSizes']: this.state.customViewportSizes.map(
        viewport =>
          viewport.id === id ? { id, width, height, selected } : viewport
      ),
    })
    if (width.length && height.length) {
      this.handleOptionChange(
        this.generateDimensions(undefined, width, height),
        selected
      )
    }
  }

  onViewportSubmit() {
    this.props.onSubmit(this.state.selectedViewportSizes)
    this.props.modalClose()
  }

  render() {
    const customStyles = {
      content: {
        top: 'auto',
        left: 'auto',
        right: '-26%',
        bottom: '-25%',
        width: '175px',
        height: '370px',
        transform: 'translate(-50%, -50%)',
      },
    }
    return (
      <Modal
        customStyles={customStyles}
        modalIsOpen={this.props.modalIsOpen}
        onRequestClose={this.close.bind(this)}
      >
        <CheckList
          items={this.viewportSizes}
          optionSelected={this.isOptionSelected.bind(this)}
          handleOptionChange={this.handleOptionChange.bind(this)}
        />
        <hr />
        <div className="custom-viewport-sizes">
          <div className="header">
            <div className="title">Custom</div>
            <AddButton onClick={this.addCustomViewportSize.bind(this)} />
          </div>
          <div className="collection">
            {this.state.customViewportSizes.map(function(viewport) {
              return (
                <CustomViewportSize
                  key={viewport.id}
                  id={viewport.id}
                  width={viewport.width}
                  height={viewport.height}
                  selected={this.isOptionSelected(
                    this.generateDimensions(viewport)
                  )}
                  onViewportChange={this.onViewportChange.bind(this)}
                  deleteOption={this.deleteCustomViewport.bind(this)}
                />
              )
            }, this)}
          </div>
        </div>
        <FlatButton
          className="confirm"
          type="submit"
          onClick={this.onViewportSubmit.bind(this)}
        >
          Confirm
        </FlatButton>
      </Modal>
    )
  }
}
