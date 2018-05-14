import React from "react";
import SpinnerBanner, { SpinnerStates } from "../SpinnerBanner";

export default class DiconnectBanner extends React.Component {
  render() {
    return (
      <SpinnerBanner state={SpinnerStates.ERROR} style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40px"
      }}>
        Trying to connect with Selenium IDE...<br />Please make sure the Selenium IDE extension window is open.
      </SpinnerBanner>
    );
  }
}
