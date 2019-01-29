import React from 'react'
import PropTypes from 'prop-types'
import ActionButton from '../ActionButton'
import DownloadIcon from '../../../assets/images/ic_download.svg'
import Tooltip from '../../../../commons/components/Tooltip'
import './style.css'

export default class DownloadButton extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
  }
  render() {
    return (
      <React.Fragment>
        <ActionButton
          className="download"
          type="close"
          size="25px"
          position="center"
          imgPath={DownloadIcon}
          onClick={this.props.onClick}
        />
        <Tooltip />
      </React.Fragment>
    )
  }
}
