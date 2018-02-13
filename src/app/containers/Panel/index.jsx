import React from "react";
import FlatButton from "../../components/FlatButton";
import { sendMessage } from "../../../IO/message-port";

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
        <FlatButton onClick={this.handleRecordCheckWindow}>Verify a window</FlatButton>
      </div>
    );
  }
}
