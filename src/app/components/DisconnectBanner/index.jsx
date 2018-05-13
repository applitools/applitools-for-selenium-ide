import React from "react";
import "./style.css";

export default class DiconnectBanner extends React.Component {
  render() {
    return (
      <div className="disconnect-banner">
        <span className="loader"></span><span>Trying to connect with Selenium IDE...<br />Please make sure the Selenium IDE extension window is open.</span>
      </div>
    );
  }
}
