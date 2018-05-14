import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./style.css";

export const SpinnerStates = {
  SUCCESS: "success",
  ERROR: "error"
};

export default class SpinnerBanner extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    state: PropTypes.oneOf(Object.values(SpinnerStates)).isRequired,
    style: PropTypes.object
  };
  render() {
    return (
      <div className={classNames("banner", this.props.state)} style={this.props.style}>
        <span className="loader"></span><span>{this.props.children}</span>
      </div>
    );
  }
}
