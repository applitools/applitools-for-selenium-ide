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
    isSelected: PropTypes.bool,
    className: PropTypes.string,
  }
  render() {
    return (
      <div
        className={classNames(
          this.props.type,
          'outer',
          this.props.isSelected ? 'selected' : undefined,
          this.props.className ? this.props.className : undefined
        )}
        onClick={this.props.onClick}
      >
        <div
          className={classNames(
            this.props.type,
            'inner',
            this.props.isSelected ? 'selected' : undefined,
            this.props.className ? this.props.className : undefined
          )}
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
