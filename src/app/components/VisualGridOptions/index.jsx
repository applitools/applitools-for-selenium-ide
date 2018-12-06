import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '../../../commons/components/Checkbox'
import AddButton from '../ActionButtons/AddButton'
import CloseButton from '../ActionButtons/CloseButton'
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
            {this.browsers.map(function(browserName) {
              return (
                <React.Fragment key={browserName}>
                  <Checkbox
                    id={browserName}
                    label={browserName}
                    isChecked={this.props.optionSelected.bind(
                      this,
                      'selectedBrowsers',
                      browserName
                    )}
                    onChange={this.props.handleOptionChange.bind(
                      this,
                      'selectedBrowsers',
                      browserName
                    )}
                  />
                </React.Fragment>
              )
            }, this)}
          </AddButton>
        </div>
        {this.props.selectedBrowsers.map(function(browserName) {
          return (
            <div className="option" key={browserName}>
              <div className="option-text">{browserName}</div>
              <CloseButton
                onClick={this.props.deleteOption.bind(
                  this,
                  'selectedBrowsers',
                  browserName
                )}
              />
            </div>
          )
        }, this)}
        <br />
        <div className="option-header">
          <div className="title">Viewport size</div>
          <AddButton>
            {this.viewportSizes.map(function(viewportSize) {
              return (
                <React.Fragment key={viewportSize}>
                  <Checkbox
                    id={viewportSize}
                    label={viewportSize}
                    isChecked={this.props.optionSelected.bind(
                      this,
                      'selectedViewportSizes',
                      viewportSize
                    )}
                    onChange={this.props.handleOptionChange.bind(
                      this,
                      'selectedViewportSizes',
                      viewportSize
                    )}
                  />
                </React.Fragment>
              )
            }, this)}
          </AddButton>
        </div>
        {this.props.selectedViewportSizes.map(function(viewportSize) {
          return (
            <div className="option" key={viewportSize}>
              <div className="option-text">{viewportSize}</div>
              <CloseButton
                onClick={this.props.deleteOption.bind(
                  this,
                  'selectedViewportSizes',
                  viewportSize
                )}
              />
            </div>
          )
        }, this)}
      </div>
    )
  }
}
