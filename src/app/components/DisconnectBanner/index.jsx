import React from "react";
import "./style.css";

export default class DiconnectBanner extends React.Component {
  render() {
    return (
      <div className="disconnect-banner">
        <span className="loader"></span><span>Trying to reconnect to Selenium IDE...</span>
      </div>
    );
  }
}
