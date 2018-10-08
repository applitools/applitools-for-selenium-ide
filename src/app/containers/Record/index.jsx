import React from "react";
import ButtonList from "../../components/ButtonList";
import { sendMessage } from "../../../IO/message-port";

export default class Record extends React.Component {
  constructor(props) {
    super(props);
    this.commands = {
      ["Check window"]: {
        command: "checkWindow",
        target: "",
        value: ""
      },
      ["Check element"]: {
        command: "checkElement",
        target: "",
        value: "",
        select: true
      },
      ["Check region"]: {
        command: "checkRegion",
        target: "",
        value: "",
        select: true
      },
      ["Set viewport size"]: {
        command: "setViewportSize",
        target: "1280x800",
        value: ""
      },
      ["Set match timeout"]: {
        command: "setMatchTimeout",
        target: "2000",
        value: ""
      },
      ["Set match level"]: {
        command: "setMatchLevel",
        target: "Strict",
        value: ""
      }
    };
    this.handleCommandClick = this.handleCommandClick.bind(this);
  }
  handleCommandClick(command) {
    sendMessage({
      uri: "/record/command",
      verb: "post",
      payload: this.commands[command]
    }).then(console.log).catch(console.error);
  }
  render() {
    return (
      <div>
        <p style={{
          padding: "0 3px"
        }}>
          You can use the following Eyes commands in Selenium IDE or click them while recording your test:
        </p>
        <ButtonList
          items={Object.keys(this.commands)}
          label="Add to test"
          onClick={this.handleCommandClick}
        />
      </div>
    );
  }
}
