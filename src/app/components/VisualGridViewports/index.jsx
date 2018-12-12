import browser from 'webextension-polyfill'
import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import CustomViewportSize from '../VisualGridCustomViewportSize'
import AddButton from '../ActionButtons/AddButton'
import FlatButton from '../../../commons/components/FlatButton'
import CheckList from '../../../commons/components/CheckList'
import uuidv4 from 'uuid/v4'

export default class VisualGridViewports extends React.Component {
  static propTypes = {
    isOptionSelected: PropTypes.func.isRequired,
    handleOptionChange: PropTypes.func.isRequired,
    modalIsOpen: PropTypes.bool.isRequired,
    modalClose: PropTypes.func.isRequired,
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
    }
    browser.storage.local
      .get(['customViewportSizes'])
      .then(({ customViewportSizes }) => {
        console.log(customViewportSizes)
        this.setState({
          customViewportSizes: customViewportSizes || [],
        })
      })
  }

  addCustomViewportSize() {
    this.setState({
      ['customViewportSizes']: [
        ...this.state['customViewportSizes'],
        { id: uuidv4(), width: '', height: '', selected: false },
      ],
    })
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

  isInCustomViewportSizes(input) {
    return !!this.state.customViewportSizes.filter(
      viewport =>
        input.width === viewport.width && input.height === viewport.height
    )[0]
  }

  isSelectedViewportSize(viewport) {
    if (viewport.width && viewport.height)
      return this.props.isOptionSelected(`${viewport.width}x${viewport.height}`)
    else return false
  }

  onViewportChange(id, width = '', height = '', selected = false) {
    this.setState({
      ['customViewportSizes']: this.state['customViewportSizes'].map(
        viewport =>
          viewport.id === id ? { id, width, height, selected } : viewport
      ),
    })
  }

  onViewportSubmit() {
    var that = this
    this.state.customViewportSizes.forEach(function(viewport) {
      if (!(viewport.width && viewport.height)) return
      const dimensions = `${viewport.width}x${viewport.height}`
      if (!that.isInCustomViewportSizes) {
        const result = {
          ['customViewportSizes']: [
            ...that.state.customViewportSizes,
            { ...viewport },
          ],
        }
        browser.storage.local.set(result).then(() => {
          this.setState({ result })
        })
      }
      that.props.handleOptionChange(dimensions, viewport.selected)
    })
    this.props.modalClose()
  }

  render() {
    return (
      <Modal
        modalIsOpen={this.props.modalIsOpen}
        onRequestClose={this.props.modalClose}
      >
        <CheckList
          items={this.viewportSizes}
          optionSelected={this.props.isOptionSelected.bind(this)}
          handleOptionChange={this.props.handleOptionChange.bind(this)}
        />
        <hr />
        <div className="custom-viewport-sizes">
          <div className="header">
            <h4>Custom</h4>
            <AddButton onClick={this.addCustomViewportSize.bind(this)} />
          </div>
          {this.state.customViewportSizes.map(function(viewport) {
            return (
              <CustomViewportSize
                key={viewport.id}
                id={viewport.id}
                width={viewport.width}
                height={viewport.height}
                selected={viewport.selected}
                onViewportChange={this.onViewportChange.bind(this)}
                deleteOption={this.deleteCustomViewport.bind(this)}
                isOptionSelected={this.props.isOptionSelected.bind(this)}
              />
            )
          }, this)}
        </div>
        <FlatButton
          type="submit"
          onClick={this.onViewportSubmit.bind(this)}
          style={{
            float: 'right',
            margin: '15px 0 0',
          }}
        >
          Confirm
        </FlatButton>
      </Modal>
    )
  }
}
