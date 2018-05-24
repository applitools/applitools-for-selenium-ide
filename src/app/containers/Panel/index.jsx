import browser from "webextension-polyfill";
import React from "react";
import Modes from "../../../commons/modes";
import Disconnect from "../Disconnect";
import Normal from "../Normal";
import Setup from "../Setup";
import RecordToolbar from "../RecordToolbar";
import SpinnerBanner, { SpinnerStates } from "../../components/SpinnerBanner";
import PlaybackBanner from "../../components/PlaybackBanner";
import DisconnectBanner from "../../components/DisconnectBanner";
import "../../styles/app.css";

export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: Modes.NORMAL,
      disableVisualCheckpoints: false
    };
    browser.runtime.sendMessage({
      requestExternalState: true
    }).then(({ state }) => {
      this.setState(state);
    });
    this.setExternalState = this.setExternalState.bind(this);
    this.visualCheckpointsChanged = this.visualCheckpointsChanged.bind(this);
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
  visualCheckpointsChanged(value) {
    this.setState({
      disableVisualCheckpoints: value
    });
    browser.runtime.sendMessage({
      setVisualChecks: true,
      disableVisualChecks: value
    }).catch();
  }
  render() {
    return (
      <div>
        {this.state.mode === Modes.DISCONNECTED && <DisconnectBanner />}
        {this.state.mode === Modes.NORMAL && (this.state.disableVisualCheckpoints
          ? <SpinnerBanner state={SpinnerStates.ERROR} spin={false}>Visual checkpoints are disabled.</SpinnerBanner>
          : <SpinnerBanner state={SpinnerStates.SUCCESS} spin={false}>Successfully connected with Selenium IDE.</SpinnerBanner>)}
        {this.state.mode === Modes.SETUP && (true
          ? <SpinnerBanner state={SpinnerStates.ERROR} spin={false}>Applitools account details are not set!</SpinnerBanner>
          : <SpinnerBanner state={SpinnerStates.ERROR}>Verifying account details...</SpinnerBanner>)}
        <div className="container">
          {this.state.mode === Modes.DISCONNECTED && <Disconnect />}
          {this.state.mode === Modes.NORMAL && <Normal disableVisualCheckpoints={this.state.disableVisualCheckpoints} visualCheckpointsChanged={this.visualCheckpointsChanged} />}
          {this.state.mode === Modes.SETUP && <Setup />}
        </div>
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
