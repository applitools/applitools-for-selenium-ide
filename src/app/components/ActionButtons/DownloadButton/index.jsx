import React from 'react'
import PropTypes from 'prop-types'
import ActionButton from '../ActionButton'
import DownloadIcon from '../../../assets/images/ic_download.svg'
import './style.css'

export default class DownloadButton extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
  }
  render() {
    return (
      <ActionButton
        className="download"
        type="close"
        size="28px"
        position="center"
        imgPath={DownloadIcon}
        onClick={this.props.onClick}
      />
    )
  }
}
