import React from "react";
import PropTypes from "prop-types";
import SpinnerBanner, { SpinnerStates } from "../SpinnerBanner";
import FormLabel from "../FormLabel";
import Timer from "../Timer";
import "./style.css";

export default class PlaybackBanner extends React.Component {
  static propTypes = {
    testName: PropTypes.string.isRequired,
    startTime: PropTypes.instanceOf(Date).isRequired,
    hasFailed: PropTypes.bool,
    batchName: PropTypes.string,
    appName: PropTypes.string,
    eyesServer: PropTypes.string,
    environment: PropTypes.string,
    branch: PropTypes.string
  };
  render() {
    return (
      <div>
        <SpinnerBanner state={this.props.hasFailed ? SpinnerStates.ERROR : SpinnerStates.SUCCESS}>
          Running {this.props.testName}<br />
          Duration <Timer time={this.props.startTime} />
        </SpinnerBanner>
        <div className="playback-info">
          <div>
            <FormLabel label="Batch name">
              {this.props.batchName}
            </FormLabel>
            <FormLabel label="App name">
              {this.props.appName}
            </FormLabel>
            <FormLabel label="Eyes">
              {this.props.eyesServer}
            </FormLabel>
          </div>
          <div>
            <FormLabel label="Env">
              {this.props.environment}
            </FormLabel>
            <FormLabel label="Branch">
              {this.props.branch}
            </FormLabel>
            <FormLabel label="Started at">
              {`${this.props.startTime.getHours()}:${this.props.startTime.getMinutes()}`}
            </FormLabel>
          </div>
        </div>
      </div>
    );
  }
}
