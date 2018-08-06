import React from "react";
import SpinnerBanner, { SpinnerStates } from "../SpinnerBanner";

export default class DiconnectBanner extends React.Component {
  render() {
    return (
      <SpinnerBanner state={SpinnerStates.ERROR} style={{
        height: "75px"
      }}>
        Waiting for Selenium IDE to open...
      </SpinnerBanner>
    );
  }
}
