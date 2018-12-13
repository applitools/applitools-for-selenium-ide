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
        browsers: true,
        viewports: false,
      },
      selectedBrowsers: [],
      selectedViewportSizes: [],
    }
    browser.storage.local.remove('selectedViewportSizes')
    browser.storage.local
      .get(['selectedBrowsers', 'selectedViewportSizes'])
      .then(({ selectedBrowsers, selectedViewportSizes }) => {
        this.setState({
          selectedBrowsers: selectedBrowsers || [],
          selectedViewportSizes: selectedViewportSizes || [],
        })
      })
    this.removeOption = this.removeOption.bind(this)
  }

  handleOptionChange(type, name, e) {
    if (e && e.target.checked) {
      if (!this.isOptionSelected(type, name)) {
        const result = { [type]: [...this.state[type], name] }
        browser.storage.local.set(result).then(() => {
          this.setState(result)
        })
      }
    } else this.removeOption(type, name)
  }

  handleSelectedBrowserChange(name, e) {
    return this.handleOptionChange('selectedBrowsers', name, e)
  }

  //handleSelectedViewportChange(name, e) {
  //  if (e === true) e = { target: { checked: true } }
  //  return this.handleOptionChange('selectedViewportSizes', name, e)
  //}

  isBrowserSelected(name) {
    return this.isOptionSelected('selectedBrowsers', name)
  }

  isViewportSelected(dimensions) {
    return this.isOptionSelected('selectedViewportSizes', dimensions)
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

  removeOption(type, value) {
    const result = this.state[type].filter(option => option !== value)
    this.save(type, result)
  }

  removeBrowser(value) {
    return this.removeOption('selectedBrowsers', value)
  }

  removeSelectedViewport(value) {
    return this.removeOption('selectedViewportSizes', value)
  }

  saveBrowsers(browsers) {
    this.save('selectedBrowsers', browsers)
  }

  saveViewports(viewports) {
    this.save('selectedViewportSizes', viewports)
  }

  save(type, collection) {
    this.setState({ [type]: collection })
    browser.storage.local.set({ [type]: collection })
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
              selectedOptions={this.state.selectedBrowsers}
              onSubmit={this.saveBrowsers.bind(this)}
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
              selectedOptions={this.state.selectedViewportSizes}
              onSubmit={this.saveViewports.bind(this)}
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
