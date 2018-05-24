import browser from "webextension-polyfill";
import React from "react";
import Modes from "../../../commons/modes";
import RecordToolbar from "../RecordToolbar";
import PlaybackBanner from "../../components/PlaybackBanner";
import DisconnectBanner from "../../components/DisconnectBanner";
import "../../styles/app.css";

export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: Modes.NORMAL,
      checked: false
    };
    this.setExternalState = this.setExternalState.bind(this);
    this.onCheckChange = this.onCheckChange.bind(this);
  }
  componentDidMount() {
    browser.runtime.onMessage.addListener(this.setExternalState);
  }
  componentWillUnmount() {
    browser.runtime.onMessage.removeListener(this.setExternalState);
  }
  setExternalState(message, backgroundPage, sendResponse) { // eslint-disable-line no-unused-vars
    if (message.state) {
      this.setState(Object.assign({}, message.state));
    }
  }
  openOptionsPage() {
    browser.runtime.openOptionsPage();
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
        {this.state.mode === Modes.DISCONNECTED && <DisconnectBanner />}
        <div className="container">
          {this.state.mode === Modes.DISCONNECTED && <p>
            Please make sure the Selenium IDE window is open. For more information visit <a href="https://applitools.com">https://applitools.com</a>
          </p>}
        </div>
        <div style= {{
          height: "20px",
          margin: "5px 10px"
        }}>
          <div style={{
            display: "flex",
            float: "right"
          }}>
            <div style={{
              margin: "0 5px"
            }}>
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
            <a href="#" onClick={this.openOptionsPage}>options</a>
          </div>
        </div>
        {this.state.mode === Modes.NORMAL && <div>Successfully connected to Selenium IDE. More options will be available when running or recording tests.</div>}
        {this.state.mode === Modes.SETUP && <div>Your Eyes account information is not properly set up. Please go to <a href="#" onClick={this.openOptionsPage}>options</a> to configure your account details.</div>}
        {
          this.state.mode === Modes.PLAYBACK &&
            <PlaybackBanner
              testName={this.state.playback.testName}
              startTime={new Date(this.state.playback.startTime)}
              hasFailed={this.state.playback.hasFailed}
              batchName={this.state.playback.batchName}
              appName={this.state.playback.appName}
              eyesServer={this.state.playback.eyesServer}
              environment={this.state.playback.environment}
              branch={this.state.playback.branch}
            />
        }
        {this.state.mode === Modes.RECORD && <RecordToolbar />}
      </div>
    );
  }
}
