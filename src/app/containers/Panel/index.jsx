import browser from "webextension-polyfill";
import React from "react";
import FlatButton from "../../components/FlatButton";

export default class Panel extends React.Component {
  handleRecordCheckWindow() {
    browser.runtime.sendMessage(process.env.SIDE_ID, {
      uri: "/record/command",
      verb: "post",
      payload: {
        command: "checkWindow",
        target: "a target",
        value: "some value"
      }
    }).then(console.log).catch(console.error);
  }
  render() {
    return (
      <div>
        <FlatButton onClick={this.handleRecordCheckWindow}>Verify a window</FlatButton>
      </div>
    );
  }
}
