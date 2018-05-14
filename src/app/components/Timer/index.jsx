import React from "react";
import PropTypes from "prop-types";

export default class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.intervalDisposer = setInterval(() => {
      if (this.props.time) {
        // This fails when DST is on, but we calculate under 1 hour, thus its fine.
        const diff = new Date(new Date() - this.props.time);
        this.setState({
          time: `${diff.getMinutes()} min, ${diff.getSeconds()} seconds`
        });
      } else {
        this.setState({
          time: this.props.placeholder || "idle"
        });
      }
    }, 1000);
  }
  static propTypes = {
    time: PropTypes.instanceOf(Date),
    placeholder: PropTypes.string
  };
  componentWillUnmount() {
    clearInterval(this.intervalDisposer);
  }
  render() {
    return (
      <span>{this.state.time}</span>
    );
  }
}
