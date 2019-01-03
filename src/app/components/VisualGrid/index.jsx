import storage from '../../../IO/storage'
import React from 'react'
import PropTypes from 'prop-types'
import AddButton from '../ActionButtons/AddButton'
import VisualGridSelectedOptions from '../VisualGridSelectedOptions'
import VisualGridBrowsers from '../VisualGridBrowsers'
import VisualGridViewports from '../VisualGridViewports'
import VisualGridDeviceOrientations from '../VisualGridDeviceOrientations'
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
        deviceOrientations: false,
      },
      projectSettings: { ...props.projectSettings },
    }
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

  removeBrowser(value) {
    const result = this.state['projectSettings']['selectedBrowsers'].filter(
      option => option.name !== value
    )
    this.save({ ['selectedBrowsers']: result })
  }

  removeSelectedViewport(value) {
    const result = this.state['projectSettings'][
      'selectedViewportSizes'
    ].filter(option => option !== value)
    this.save({ ['selectedViewportSizes']: result })
  }

  removeSelectedDeviceOrientation(value) {
    const result = this.state['projectSettings'][
      'selectedDeviceOrientations'
    ].filter(option => option !== value)
    this.save({ ['selectedDeviceOrientations']: result })
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

  saveDeviceOrientations(deviceOrientations) {
    this.save({ selectedDeviceOrientations: deviceOrientations })
  }

  save(result) {
    storage.get(['projectSettings']).then(({ projectSettings }) => {
      storage
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
    const hasSelectedBrowsers = !!this.state.projectSettings.selectedBrowsers.filter(
      b => b.type === 'browser'
    ).length
    const hasSelectedDevices = !!this.state.projectSettings.selectedBrowsers.filter(
      b => b.type === 'device'
    ).length
    return (
      <div className="visual-grid-options">
        <div className="category browsers">
          <div
            className="option-header"
            style={{
              paddingBottom: this.state.projectSettings.selectedBrowsers
                ? '28px'
                : undefined,
            }}
          >
            <div className="title">Generate screenshot on</div>
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
            items={this.state.projectSettings.selectedBrowsers.map(s => s.name)}
            removeOption={this.removeBrowser.bind(this)}
          />
        </div>
        {hasSelectedBrowsers ? (
          <div className="category viewports">
            <div
              className="option-header"
              style={{
                paddingBottom: this.state.projectSettings.selectedViewportSizes
                  ? '28px'
                  : undefined,
              }}
            >
              <div className="title">With viewport sizes (browsers only)</div>
              <AddButton
                onClick={this.modalOpen.bind(this, 'viewports')}
                isSelected={this.state.modal.viewports}
              />
              <VisualGridViewports
                modalIsOpen={this.state.modal.viewports}
                modalClose={this.modalClose.bind(this, 'viewports')}
                selectedOptions={
                  this.state.projectSettings.selectedViewportSizes
                }
                onSubmit={this.saveViewports.bind(this)}
                customViewportSizes={
                  this.state.projectSettings.customViewportSizes
                }
              />
            </div>
            {this.state.projectSettings.selectedViewportSizes.length ? (
              <VisualGridSelectedOptions
                items={this.state.projectSettings.selectedViewportSizes}
                removeOption={this.removeSelectedViewport.bind(this)}
              />
            ) : (
              <div className="error-message">
                At least one viewport size is required.
              </div>
            )}
          </div>
        ) : (
          undefined
        )}
        {hasSelectedDevices ? (
          <div className="category device-orientations">
            <div
              className="option-header"
              style={{
                paddingBottom: this.state.projectSettings
                  .selectedDeviceOrientations
                  ? '28px'
                  : undefined,
              }}
            >
              <div className="title">With orientations (devices only)</div>
              <AddButton
                onClick={this.modalOpen.bind(this, 'deviceOrientations')}
                isSelected={this.state.modal.deviceOrientations}
              />
              <VisualGridDeviceOrientations
                modalIsOpen={this.state.modal.deviceOrientations}
                modalClose={this.modalClose.bind(this, 'deviceOrientations')}
                selectedOptions={
                  this.state.projectSettings.selectedDeviceOrientations
                }
                onSubmit={this.saveDeviceOrientations.bind(this)}
              />
            </div>
            {this.state.projectSettings.selectedDeviceOrientations.length ? (
              <VisualGridSelectedOptions
                items={this.state.projectSettings.selectedDeviceOrientations}
                removeOption={this.removeSelectedDeviceOrientation.bind(this)}
              />
            ) : (
              <div className="error-message">
                A device orientation is required.
              </div>
            )}
          </div>
        ) : (
          undefined
        )}
      </div>
    )
  }
}
