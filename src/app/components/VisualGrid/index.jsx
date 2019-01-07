import storage from '../../../IO/storage'
import React from 'react'
import PropTypes from 'prop-types'
import AddButton from '../ActionButtons/AddButton'
import VisualGridSelectedOptions from '../VisualGridSelectedOptions'
import VisualGridViewports from '../VisualGridViewports'
import VisualGridDeviceOrientations from '../VisualGridDeviceOrientations'
import './style.css'
import VisualGridOptionSelector from '../VisualGridOptionSelector'
import { browsers, devices } from '../VisualGridOptionSelector/options'

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

  remove(key, value) {
    const result = this.state['projectSettings'][key].filter(
      option => option !== value
    )
    this.save({ [key]: result })
  }

  removeBrowser(value) {
    this.remove('selectedBrowsers', value)
  }

  removeSelectedViewport(value) {
    this.remove('selectedViewportSizes', value)
  }

  removeDevice(value) {
    this.remove('selectedDevices', value)
  }

  removeSelectedDeviceOrientation(value) {
    this.remove('selectedDeviceOrientations', value)
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

  saveDevices(devices) {
    this.save({ selectedDevices: devices })
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
            <div className="title">Browsers</div>
            <AddButton
              onClick={this.modalOpen.bind(this, 'browsers')}
              isSelected={this.state.modal.browsers}
            />
            <VisualGridOptionSelector
              modalIsOpen={this.state.modal.browsers}
              modalClose={this.modalClose.bind(this, 'browsers')}
              options={browsers}
              selectedOptions={this.state.projectSettings.selectedBrowsers}
              onSubmit={this.saveBrowsers.bind(this)}
              customStyles={{
                content: {
                  top: 'auto',
                  left: 'auto',
                  right: '-30%',
                  bottom: '-11%',
                  width: '170px',
                  transform: 'translate(-50%, -50%)',
                },
              }}
            />
          </div>
          <VisualGridSelectedOptions
            items={this.state.projectSettings.selectedBrowsers}
            removeOption={this.removeBrowser.bind(this)}
          />
        </div>
        <div className="category viewports">
          <div
            className="option-header"
            style={{
              paddingBottom: this.state.projectSettings.selectedViewportSizes
                ? '28px'
                : undefined,
            }}
          >
            <div className="title">Viewport sizes</div>
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
        <div className="category devices">
          <div
            className="option-header"
            style={{
              paddingBottom: this.state.projectSettings.selectedDevices
                ? '28px'
                : undefined,
            }}
          >
            <div className="title">Devices</div>
            <AddButton
              onClick={this.modalOpen.bind(this, 'devices')}
              isSelected={this.state.modal.devices}
            />
            <VisualGridOptionSelector
              modalIsOpen={this.state.modal.devices}
              modalClose={this.modalClose.bind(this, 'devices')}
              options={devices}
              selectedOptions={this.state.projectSettings.selectedDevices}
              onSubmit={this.saveDevices.bind(this)}
              customStyles={{
                content: {
                  top: 'auto',
                  left: 'auto',
                  right: '-30%',
                  bottom: '-11%',
                  width: '170px',
                  transform: 'translate(-50%, -50%)',
                },
              }}
            />
          </div>
          <VisualGridSelectedOptions
            items={this.state.projectSettings.selectedDevices}
            removeOption={this.removeDevice.bind(this)}
          />
        </div>
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
            <div className="title">Orientations</div>
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
      </div>
    )
  }
}
