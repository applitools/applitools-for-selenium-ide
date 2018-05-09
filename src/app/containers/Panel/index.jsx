import browser from "webextension-polyfill";
import React from "react";
import Modes from "../../../commons/modes";
import RecordToolbar from "../RecordToolbar";
import DisconnectBanner from "../../components/DisconnectBanner";
import applitools from "../../assets/images/applitools.png";

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
        <div style={{
          margin: "5px 10px"
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
        {this.state.mode === Modes.RECORD && <RecordToolbar />}
        {this.state.mode === Modes.DISCONNECTED && <DisconnectBanner />}
      </div>
    );
  }
}
