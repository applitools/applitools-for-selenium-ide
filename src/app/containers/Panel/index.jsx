import browser from "webextension-polyfill";
import React from "react";
import FlatButton from "../../components/FlatButton";
import { sendMessage } from "../../../IO/message-port";
import applitools from "../../assets/images/applitools.png";

export default class Panel extends React.Component {
  openOptionsPage() {
    browser.runtime.openOptionsPage();
  }
  handleRecordCheckWindow() {
    sendMessage({
      uri: "/record/command",
      verb: "post",
      payload: {
        command: "checkWindow",
        target: "a new check",
        value: ""
      }
    }).then(console.log).catch(console.error);
  }
  handleRecordCheckRegion() {
    sendMessage({
      uri: "/record/command",
      verb: "post",
      payload: {
        command: "checkRegion",
        target: "",
        value: "a new check",
        select: true
      }
    }).then(console.log).catch(console.error);
  }
  handleRecordCheckElement() {
    sendMessage({
      uri: "/record/command",
      verb: "post",
      payload: {
        command: "checkElement",
        target: "",
        value: "a new check",
        select: true
      }
    }).then(console.log).catch(console.error);
  }
  render() {
    return (
      <div>
        <div style={{
          margin: "10px"
        }}>
          <img src={applitools} />
          <a href="#" onClick={this.openOptionsPage} style={{
            float: "right"
          }}>cog icon goes here</a>
        </div>
        <FlatButton onClick={this.handleRecordCheckWindow}>Verify a window</FlatButton>
        <FlatButton onClick={this.handleRecordCheckRegion}>Verify a region</FlatButton>
        <FlatButton onClick={this.handleRecordCheckElement}>Verify an element</FlatButton>
      </div>
    );
  }
}
