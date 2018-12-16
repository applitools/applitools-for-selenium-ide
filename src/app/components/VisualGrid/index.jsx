import browser from 'webextension-polyfill'
import React from 'react'
import PropTypes from 'prop-types'
import AddButton from '../ActionButtons/AddButton'
import VisualGridSelectedOptions from '../VisualGridSelectedOptions'
import VisualGridBrowsers from '../VisualGridBrowsers'
import VisualGridViewports from '../VisualGridViewports'
import './style.css'

export default class VisualGrid extends React.Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    projectSettings: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      modal: {
        browsers: false,
        viewports: false,
      },
      projectSettings: { ...props.projectSettings },
    }
    this.removeOption = this.removeOption.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.projectSettings !== this.props.projectSettings)
      this.setState({ projectSettings: this.props.projectSettings })
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
    const result = this.state['projectSettings'][type].filter(
      option => option !== value
    )
    this.save(type, result)
  }

  removeBrowser(value) {
    return this.removeOption('selectedBrowsers', value)
  }

  removeSelectedViewport(value) {
    return this.removeOption('selectedViewportSizes', value)
  }

  saveBrowsers(browsers) {
    this.save({ selectedBrowsers: browsers })
  }

  saveViewports(selectedViewports, customViewports) {
    this.save({
      selectedViewportSizes: selectedViewports,
      customViewportSizes: customViewports,
    })
  }

  save(result) {
    browser.storage.local
      .get(['projectSettings'])
      .then(({ projectSettings }) => {
        browser.storage.local
          .set({
            ['projectSettings']: {
              ...projectSettings,
              [this.props.projectId]: {
                ...this.state.projectSettings,
                ...result,
              },
            },
          })
          .then(() => {
            this.setState({
              ['projectSettings']: {
                ...this.state.projectSettings,
                ...result,
              },
            })
          })
      })
  }

  render() {
    return (
      <div className="visual-grid-options">
        <div className="category">
          <div
            className="option-header"
            style={{
              paddingBottom: this.state.projectSettings.selectedBrowsers
                ? '28px'
                : undefined,
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
              selectedOptions={this.state.projectSettings.selectedBrowsers}
              onSubmit={this.saveBrowsers.bind(this)}
            />
          </div>
          <VisualGridSelectedOptions
            items={this.state.projectSettings.selectedBrowsers}
            removeOption={this.removeBrowser.bind(this)}
          />
        </div>
        <div className="category">
          <div
            className="option-header"
            style={{
              paddingBottom: this.state.projectSettings.selectedViewportSizes
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
              selectedOptions={this.state.projectSettings.selectedViewportSizes}
              onSubmit={this.saveViewports.bind(this)}
              customViewportSizes={
                this.state.projectSettings.customViewportSizes
              }
            />
          </div>
          <VisualGridSelectedOptions
            items={this.state.projectSettings.selectedViewportSizes}
            removeOption={this.removeSelectedViewport.bind(this)}
          />
        </div>
      </div>
    )
  }
}
