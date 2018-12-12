import browser from 'webextension-polyfill'
import React from 'react'
import AddButton from '../ActionButtons/AddButton'
import VisualGridSelectedOptions from '../VisualGridSelectedOptions'
import VisualGridBrowsers from '../VisualGridBrowsers'
import VisualGridViewports from '../VisualGridViewports'
import './style.css'

export default class VisualGrid extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      modal: {
        browsers: false,
        viewports: true,
      },
      selectedBrowsers: [],
      selectedViewportSizes: [],
    }
    browser.storage.local
      .get(['selectedBrowsers', 'selectedViewportSizes'])
      .then(({ selectedBrowsers, selectedViewportSizes }) => {
        this.setState({
          selectedBrowsers: selectedBrowsers || [],
          selectedViewportSizes: selectedViewportSizes || [],
        })
      })
    this._removeOption = this._removeOption.bind(this)
  }

  handleOptionChange(type, name, e) {
    if (e && e.target.checked) {
      if (!this.isOptionSelected(type, name)) {
        const result = { [type]: [...this.state[type], name] }
        browser.storage.local.set(result).then(() => {
          this.setState(result)
        })
      }
    } else this._removeOption(type, name)
  }

  handleSelectedBrowserChange(name, e) {
    return this.handleOptionChange('selectedBrowsers', name, e)
  }

  handleSelectedViewportChange(name, e) {
    if (e === true) e = { target: { checked: true } }
    return this.handleOptionChange('selectedViewportSizes', name, e)
  }

  isBrowserSelected(name) {
    return this.isOptionSelected('selectedBrowsers', name)
  }

  isViewportSelected(dimension) {
    return this.isOptionSelected('selectedViewportSizes', dimension)
  }

  isOptionSelected(type, name) {
    return !!this.state[type].filter(option => option === name)[0]
  }

  _setModal(type, value) {
    this.setState({ modal: { ...this.state.modal, [type]: value } })
  }

  modalOpen(type) {
    this._setModal(type, true)
  }

  modalClose(type) {
    this._setModal(type, false)
  }

  _removeOption(type, value) {
    const result = {
      [type]: this.state[type].filter(option => option !== value),
    }
    browser.storage.local.set(result)
    this.setState(result)
  }

  removeBrowser(value) {
    return this._removeOption('selectedBrowsers', value)
  }

  removeSelectedViewport(value) {
    return this._removeOption('selectedViewportSizes', value)
  }

  updatedSelectedViewportSizesFromCollection(collection) {
    this.setState({ ['selectedViewportSizes']: collection })
  }

  render() {
    return (
      <div className="visual-grid-options">
        <div className="category">
          <div
            className="option-header"
            style={{
              paddingBottom: this.state.selectedBrowsers ? '28px' : undefined,
            }}
          >
            <div className="title">Browser</div>
            <AddButton
              onClick={this.modalOpen.bind(this, 'browsers')}
              isSelected={this.state.modal.browsers}
            />
            <VisualGridBrowsers
              modalIsOpen={this.state.modal.browsers}
              modalClose={this.modalClose.bind(this, 'browsers')}
              optionSelected={this.isBrowserSelected.bind(this)}
              handleOptionChange={this.handleSelectedBrowserChange.bind(this)}
            />
          </div>
          <VisualGridSelectedOptions
            items={this.state.selectedBrowsers}
            removeOption={this.removeBrowser.bind(this)}
          />
        </div>
        <div className="category">
          <div
            className="option-header"
            style={{
              paddingBottom: this.state.selectedViewportSizes
                ? '28px'
                : undefined,
            }}
          >
            <div className="title">Viewport size</div>
            <AddButton
              onClick={this.modalOpen.bind(this, 'viewports')}
              isSelected={this.state.modal.viewports}
            />
            <VisualGridViewports
              modalIsOpen={this.state.modal.viewports}
              modalClose={this.modalClose.bind(this, 'viewports')}
              isOptionSelected={this.isViewportSelected.bind(this)}
              handleOptionChange={this.handleSelectedViewportChange.bind(this)}
            />
          </div>
          <VisualGridSelectedOptions
            items={this.state.selectedViewportSizes}
            removeOption={this.removeSelectedViewport.bind(this)}
          />
        </div>
      </div>
    )
  }
}
