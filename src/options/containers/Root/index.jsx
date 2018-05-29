import browser from "webextension-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import TabBar from "../../../commons/components/TabBar";
import Input from "../../../commons/components/Input";
import Checkbox from "../../../commons/components/Checkbox";
import FlatButton from "../../../commons/components/FlatButton";
import "../../styles/options.css";
import "../../../commons/styles/elements.css";

const Tabs = {
  TESTS: "Tests",
  ACCOUNT: "Account",
  ADVANCED: "Advanced"
};

class Options extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: Tabs.TESTS,
      disableVisualCheckpoints: false,
      branch: "",
      parentBranch: "",
      apiKey: "",
      eyesServer: "",
      seideId: ""
    };
    this.tabs = Object.values(Tabs);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.saveOptions = this.saveOptions.bind(this);
    browser.storage.local.get([
      "disableVisualCheckpoints",
      "apiKey",
      "eyesServer",
      "branch",
      "parentBranch",
      "seideId"]
    ).then(({disableVisualCheckpoints, apiKey, eyesServer, branch, parentBranch, seideId}) => {
      this.setState({
        disableVisualCheckpoints,
        apiKey,
        eyesServer,
        branch,
        parentBranch,
        seideId
      });
    });
  }
  handleTabChange(tab) {
    this.setState({
      tab
    });
  }
  handleCheckboxChange(e) {
    this.setState({
      disableVisualCheckpoints: e.target.checked
    });
  }
  handleInputChange(name, value) {
    this.setState({
      [name]: value
    });
  }
  saveOptions() {
    browser.storage.local.set({
      disableVisualCheckpoints: this.state.disableVisualCheckpoints,
      apiKey: this.state.apiKey,
      eyesServer: this.state.eyesServer,
      branch: this.state.branch,
      parentBranch: this.state.parentBranch,
      seideId: this.state.seideId
    }).then(() => {
      browser.runtime.sendMessage({
        optionsUpdated: true
      });
      window.close();
    });
  }
  render() {
    return (
      <div>
        <TabBar tabs={this.tabs} tabChanged={this.handleTabChange} />
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <div className="form-contents">
            {this.state.tab === Tabs.TESTS &&
            <React.Fragment>
              <Checkbox
                id="disable-checks"
                className="checkbox"
                name="disable-checks"
                label="Disable visual checkpoints"
                checked={this.state.disableVisualCheckpoints}
                onChange={this.handleCheckboxChange}
              />
              <Input name="branch" label="branch name" placeholder="default" value={this.state.branch} onChange={this.handleInputChange.bind(this,  "branch")} />
              <Input name="parentBranch" label="parent branch name" value={this.state.parentBranch} onChange={this.handleInputChange.bind(this, "parentBranch")} />
            </React.Fragment>}
            {this.state.tab === Tabs.ACCOUNT &&
            <React.Fragment>
              <Input name="apiKey" label="api key" value={this.state.apiKey} onChange={this.handleInputChange.bind(this, "apiKey")} />
              <Input name="serverUrl" label="server url" placeholder="https://eyes.applitools.com" value={this.state.eyesServer} onChange={this.handleInputChange.bind(this, "eyesServer")} />
            </React.Fragment>}
            {this.state.tab === Tabs.ADVANCED &&
            <React.Fragment>
              <Input name="seideId" label="ide extension id" value={this.state.seideId} onChange={this.handleInputChange.bind(this, "seideId")} />
            </React.Fragment>}
          </div>
          <FlatButton type="submit" onClick={this.saveOptions}>Confirm</FlatButton>
          <div style={{clear: "both"}}></div>
        </form>
      </div>
    );
  }
}

ReactDOM.render(
  <Options />,
  document.getElementById("root")
);
