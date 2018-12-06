import React from 'react'
import PropTypes from 'prop-types'
import AddButton from '../ActionButtons/AddButton'
import CloseButton from '../ActionButtons/CloseButton'
import CheckList from '../../../commons/components/CheckList'
import './style.css'

export default class VisualGridOptions extends React.Component {
  constructor(props) {
    super(props)
    this.browsers = [
      'Chrome',
      'Safari',
      'Firefox',
      'Explorer',
      'Opera',
      'Edge',
      'Vivaldi',
    ]
    this.viewportSizes = [
      '2560x1440',
      '2048x1536',
      '1920x1080',
      '750x1334',
      '720x1280',
    ]
  }
  static propTypes = {
    selectedBrowsers: PropTypes.array.isRequired,
    selectedViewportSizes: PropTypes.array.isRequired,
    deleteOption: PropTypes.func.isRequired,
    handleOptionChange: PropTypes.func.isRequired,
  }
  render() {
    return (
      <div className="visual-grid-options">
        <div className="option-header">
          <div className="title">Browser</div>
          <AddButton>
            <CheckList
              type="selectedBrowsers"
              items={this.browsers}
              optionSelected={this.props.optionSelected.bind(this)}
              handleOptionChange={this.props.handleOptionChange.bind(this)}
            />
          </AddButton>
        </div>
        <SelectedOptions
          type="selectedBrowsers"
          items={this.props.selectedBrowsers}
          deleteOption={this.props.deleteOption.bind(this)}
        />
        <br />
        <div className="option-header">
          <div className="title">Viewport size</div>
          <AddButton>
            <CheckList
              type="selectedViewportSizes"
              items={this.viewportSizes}
              optionSelected={this.props.optionSelected.bind(this)}
              handleOptionChange={this.props.handleOptionChange.bind(this)}
            />
          </AddButton>
        </div>
        <SelectedOptions
          type="selectedViewportSizes"
          items={this.props.selectedViewportSizes}
          deleteOption={this.props.deleteOption.bind(this)}
        />
      </div>
    )
  }
}

class SelectedOptions extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    deleteOption: PropTypes.func.isRequired,
  }

  render() {
    return (
      <div className="selected-options">
        {this.props.items.map(function(item) {
          return (
            <div className="option" key={item}>
              <div className="option-text">{item}</div>
              <CloseButton
                onClick={this.props.deleteOption.bind(
                  this,
                  this.props.type,
                  item
                )}
              />
            </div>
          )
        }, this)}
      </div>
    )
  }
}
