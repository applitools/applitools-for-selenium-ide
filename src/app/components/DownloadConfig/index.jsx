import React from 'react'
import PropTypes from 'prop-types'
import { parseBrowsers } from '../../../background/utils/parsers'
import { downloadFile } from '../../../IO/filesystem'
import DownloadButton from '../ActionButtons/DownloadButton'
const yaml = require('js-yaml')

export default class DownloadConfig extends React.Component {
  static propTypes = {
    projectSettings: PropTypes.object.isRequired,
  }
  generateYaml() {
    return yaml.dump({
      params: {
        eyesRendering: parseBrowsers(
          this.props.projectSettings.selectedBrowsers,
          this.props.projectSettings.selectedViewportSizes,
          this.props.projectSettings.selectedDevices,
          this.props.projectSettings.selectedDeviceOrientations
        ),
      },
    })
  }
  render() {
    return (
      <div
        className="download-config"
        data-tip="<p>Download visual grid configuration</p>"
      >
        <DownloadButton
          onClick={() => {
            downloadFile(this.generateYaml())
          }}
        />
      </div>
    )
  }
}
