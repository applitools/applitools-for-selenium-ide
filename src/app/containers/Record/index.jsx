import React from "react";
import ButtonList from "../../components/ButtonList";
import { sendMessage } from "../../../IO/message-port";

export default class Record extends React.Component {
  handleCommandClick(command) {
    const commandsPayloads = {
      ["Check window"]: {
        command: "checkWindow",
        target: "a new check",
        value: ""
      },
      ["Check element"]: {
        command: "checkElement",
        target: "",
        value: "a new check",
        select: true
      },
      ["Check region"]: {
        command: "checkRegion",
        target: "",
        value: "a new check",
        select: true
      },
      ["Set viewport size"]: {
        command: "setViewportSize",
        target: "1280x800",
        value: ""
      },
      ["Set match level"]: {
        command: "setMatchLevel",
        target: "Strict",
        value: ""
      }
    };
    sendMessage({
      uri: "/record/command",
      verb: "post",
      payload: commandsPayloads[command]
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
          items={["Check window", "Check element", "Check region", "Set viewport size", "Set match level"]}
          label="Add to test"
          onClick={this.handleCommandClick}
        />
      </div>
    );
  }
}
