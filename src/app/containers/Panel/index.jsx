import browser from "webextension-polyfill";
import React from "react";
import FlatButton from "../../components/FlatButton";
import { sendMessage } from "../../../IO/message-port";
import applitools from "../../assets/images/applitools.png";

export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    };
    this.onCheckChange = this.onCheckChange.bind(this);
  }
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
  onCheckChange(e) {
    this.setState({
      checked: e.target.checked
    });
    browser.runtime.sendMessage({
      setVisualChecks: true,
      disableVisualChecks: e.target.checked
    });
  }
  render() {
    return (
      <div>
        <div style={{
          margin: "10px"
        }}>
          <img src={applitools} />
          <div style={{
            display: "flex",
            float: "right"
          }}>
            <div>
              <input
                type="checkbox"
                className="checkbox"
                id="disable-checks"
                name="disable-checks"
                checked={this.state.checked}
                onChange={this.onCheckChange}
              />
              <label key="label" htmlFor="disable-checks">Disable visual checks</label>
            </div>
            <a href="#" onClick={this.openOptionsPage}>cog</a>
          </div>
        </div>
        <FlatButton onClick={this.handleRecordCheckWindow}>Verify a window</FlatButton>
        <FlatButton onClick={this.handleRecordCheckRegion}>Verify a region</FlatButton>
        <FlatButton onClick={this.handleRecordCheckElement}>Verify an element</FlatButton>
      </div>
    );
  }
}
