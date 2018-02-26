import React from "react";
import FlatButton from "../../components/FlatButton";
import { sendMessage } from "../../../IO/message-port";
import applitools from "../../assets/images/applitools.png";

export default class Panel extends React.Component {
  handleRecordCheckWindow() {
    sendMessage({
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
        <img src={applitools} style={{
          display: "block",
          margin: "10px"
        }} />
        <FlatButton onClick={this.handleRecordCheckWindow}>Verify a window</FlatButton>
        <FlatButton>Verify a region</FlatButton>
        <FlatButton>Verify an element</FlatButton>
      </div>
    );
  }
}
