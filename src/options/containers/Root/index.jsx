import browser from "webextension-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import TabBar from "../../../commons/components/TabBar";
import Input from "../../../commons/components/Input";
import Checkbox from "../../../commons/components/Checkbox";
import FlatButton from "../../../commons/components/FlatButton";
import Link from "../../../commons/components/Link";
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
    this.saveOptions = this.saveOptions.bind(this);
    browser.storage.local.get([
      "disableVisualCheckpoints",
      "openUrls",
      "apiKey",
      "eyesServer",
      "branch",
      "parentBranch",
      "seideId"]
    ).then(({disableVisualCheckpoints, openUrls, apiKey, eyesServer, branch, parentBranch, seideId}) => {
      this.setState({
        disableVisualCheckpoints,
        openUrls,
        apiKey: apiKey || "",
        eyesServer: eyesServer || "",
        branch: branch || "",
        parentBranch: parentBranch || "",
        seideId: seideId || ""
      });
    });
  }
  handleTabChange(tab) {
    this.setState({
      tab
    });
  }
  handleCheckboxChange(name, e) {
    this.setState({
      [name]: e.target.checked
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
      openUrls: this.state.openUrls,
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
                onChange={this.handleCheckboxChange.bind(this, "disableVisualCheckpoints")}
              />
              <Checkbox
                id="open-urls"
                className="checkbox"
                name="open-urls"
                label="Open test manager after test runs"
                checked={this.state.openUrls}
                onChange={this.handleCheckboxChange.bind(this, "openUrls")}
              />
              <Input name="branch" label="branch name" placeholder="default" value={this.state.branch} onChange={this.handleInputChange.bind(this,  "branch")} />
              <Input name="parentBranch" label="parent branch name" value={this.state.parentBranch} onChange={this.handleInputChange.bind(this, "parentBranch")} />
            </React.Fragment>}
            {this.state.tab === Tabs.ACCOUNT &&
            <React.Fragment>
              <Input name="apiKey" label="api key" value={this.state.apiKey} onChange={this.handleInputChange.bind(this, "apiKey")} />
              <Input name="serverUrl" label="server url" placeholder="https://eyes.applitools.com" value={this.state.eyesServer} onChange={this.handleInputChange.bind(this, "eyesServer")} />
              <Link className="secondary" href="https://applitools.com/docs/topics/overview/obtain-api-key.html">Where is my API key?</Link>
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
