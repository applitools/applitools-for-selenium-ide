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
      uri: "/record/tab",
      verb: "get",
      payload: {}
    }).then((tab) => {
      if (!tab.error) {
        browser.tabs.sendMessage(tab.id, {
          drawRegion: true
        }).then(region => {
          if (region) {
            sendMessage({
              uri: "/record/command",
              verb: "post",
              payload: {
                command: "checkRegion",
                target: `left: ${region.left}, top: ${region.top}, width: ${region.width}, height: ${region.height}`,
                value: "a new check"
              }
            }).then(console.log).catch(console.error);
          }
        });
      } else {
        console.error(tab.error);
      }
    });
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
