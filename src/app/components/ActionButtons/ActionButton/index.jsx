import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class ActionButton extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    imgPath: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }
  render() {
    return (
      <div
        className={classNames(this.props.type, 'outer')}
        onClick={this.props.onClick}
      >
        <div
          className={classNames(this.props.type, 'inner')}
          style={{
            mask: `url(${this.props.imgPath})`,
            maskSize: this.props.size,
            maskPosition: this.props.position,
            WebkitMaskImage: `url(${this.props.imgPath})`,
            WebkitMaskSize: this.props.size,
            WebkitMaskPosition: this.props.position,
          }}
        />
      </div>
    )
  }
}
