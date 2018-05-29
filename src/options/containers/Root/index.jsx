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
      tab: Tabs.TESTS
    };
    this.tabs = Object.values(Tabs);
    this.handleTabChanged = this.handleTabChanged.bind(this);
  }
  handleTabChanged(tab) {
    this.setState({
      tab
    });
  }
  render() {
    return (
      <div>
        <TabBar tabs={this.tabs} tabChanged={this.handleTabChanged} />
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <div className="form-content">
            {this.state.tab === Tabs.TESTS &&
            <React.Fragment>
              <Checkbox
                id="disable-checks"
                className="checkbox"
                name="disable-checks"
                label="Disable visual checkpoints"
              />
              <Input name="branch" label="branch name" placeholder="default" />
              <Input name="parentBranch" label="parent branch name" />
            </React.Fragment>}
            {this.state.tab === Tabs.ACCOUNT &&
            <React.Fragment>
              <Input name="apiKey" label="api key" />
              <Input name="serverUrl" label="server url" placeholder="https://eyes.applitools.com" />
            </React.Fragment>}
            {this.state.tab === Tabs.ADVANCED &&
            <React.Fragment>
              <Input name="sideId" label="ide extension id" />
            </React.Fragment>}
          </div>
          <FlatButton type="submit">Confirm</FlatButton>
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
