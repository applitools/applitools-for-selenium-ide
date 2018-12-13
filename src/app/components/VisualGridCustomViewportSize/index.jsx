import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '../../../commons/components/Checkbox'
import Input from '../../../commons/components/Input'
import DeleteButton from '../ActionButtons/DeleteButton'
import './style.css'

export default class CustomViewportSize extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    width: PropTypes.string,
    height: PropTypes.string,
    selected: PropTypes.bool,
    isSelected: PropTypes.func,
    onViewportChange: PropTypes.func.isRequired,
    deleteOption: PropTypes.func.isRequired,
  }
  onWidthChange(value) {
    this.props.onViewportChange(
      this.props.id,
      value,
      this.props.height,
      this.props.selected
    )
  }
  onHeightChange(value) {
    this.props.onViewportChange(
      this.props.id,
      this.props.width,
      value,
      this.props.selected
    )
  }
  onSelect(e) {
    this.props.onViewportChange(
      this.props.id,
      this.props.width,
      this.props.height,
      e.target.checked
    )
  }
  render() {
    return (
      <div className="custom-viewport-size">
        <Checkbox
          id={this.props.id}
          className="checkbox"
          name="enable-custom-viewport"
          label=""
          checked={this.props.selected}
          onChange={this.onSelect.bind(this)}
        />
        <Input
          type="number"
          name="custom-viewport-size-width"
          value={this.props.width}
          onChange={this.onWidthChange.bind(this)}
        />
        <div className="dimension-separator">x</div>
        <Input
          type="number"
          name="custom-viewport-size-height"
          value={this.props.height}
          onChange={this.onHeightChange.bind(this)}
        />
        <DeleteButton
          onClick={this.props.deleteOption.bind(this, this.props.id)}
        />
      </div>
    )
  }
}
