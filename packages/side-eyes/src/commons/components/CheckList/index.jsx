import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '../../../commons/components/Checkbox'

export default class CheckList extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    optionSelected: PropTypes.func.isRequired,
    handleOptionChange: PropTypes.func.isRequired,
  }
  render() {
    return (
      <React.Fragment>
        {this.props.items.map(function(item) {
          return (
            <React.Fragment key={item}>
              <Checkbox
                id={item}
                label={item}
                checked={this.props.optionSelected(item)}
                onChange={this.props.handleOptionChange.bind(this, item)}
              />
            </React.Fragment>
          )
        }, this)}
      </React.Fragment>
    )
  }
}
