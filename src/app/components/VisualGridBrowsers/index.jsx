import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import CheckList from '../../../commons/components/CheckList'

export default class VisualGridBrowsers extends React.Component {
  static propTypes = {
    modalIsOpen: PropTypes.bool.isRequired,
    modalClose: PropTypes.func.isRequired,
    optionSelected: PropTypes.func.isRequired,
    handleOptionChange: PropTypes.func.isRequired,
  }

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
  }

  render() {
    return (
      <Modal
        modalIsOpen={this.props.modalIsOpen}
        onRequestClose={this.props.modalClose}
      >
        <CheckList
          items={this.browsers}
          optionSelected={this.props.optionSelected}
          handleOptionChange={this.props.handleOptionChange}
        />
      </Modal>
    )
  }
}
