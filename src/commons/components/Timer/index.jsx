import React from 'react'
import PropTypes from 'prop-types'

export default class Timer extends React.Component {
  constructor(props) {
    super(props)
    const parseTime = (time, placeholder) => {
      if (time) {
        // This fails when DST is on, but we calculate under 1 hour, thus its fine.
        const diff = new Date(new Date() - time)
        return `${diff.getMinutes()} min, ${diff.getSeconds()} seconds`
      } else {
        return placeholder || 'idle'
      }
    }
    this.state = {
      time: parseTime(props.time, props.placeholder),
    }
    this.intervalDisposer = setInterval(() => {
      this.setState({
        time: parseTime(this.props.time, this.props.placeholder),
      })
    }, 1000)
  }
  static propTypes = {
    time: PropTypes.instanceOf(Date),
    placeholder: PropTypes.string,
  }
  componentWillUnmount() {
    clearInterval(this.intervalDisposer)
  }
  render() {
    return <span>{this.state.time}</span>
  }
}
