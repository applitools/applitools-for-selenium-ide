import browser from "webextension-polyfill";
import React from "react";
import PropTypes from "prop-types";
import Link from "../../../commons/components/Link";
import Input from "../../../commons/components/Input";
import FlatButton from "../../../commons/components/FlatButton";
import "./style.css";

export default class Setup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKey: "",
      serverUrl: ""
    };
    this.handleApiKeyChange = this.handleApiKeyChange.bind(this);
    this.handleServerUrlChange = this.handleServerUrlChange.bind(this);
    this.submitInfo = this.submitInfo.bind(this);
  }
  static propTypes = {
    isInvalid: PropTypes.bool,
    setSubmitMode: PropTypes.func
  };
  handleApiKeyChange(value) {
    this.setState({ apiKey: value });
  }
  handleServerUrlChange(value) {
    this.setState({ serverUrl: value });
  }
  submitInfo() {
    if (this.props.setSubmitMode) {
      this.props.setSubmitMode();
    }
    browser.storage.local.set({
      apiKey: this.state.apiKey,
      eyesServer: this.state.serverUrl
    }).then(() => {
      browser.runtime.sendMessage({
        optionsUpdated: true
      });
    });
  }
  render() {
    return (
      <div>
        <form className="setup" onSubmit={(e) => { e.preventDefault(); }}>
          <p>
            <Link href="https://applitools.com/users/register">Sign up for a free account</Link> if you don’t already have one
          </p>
          <Input name="apiKey" label="API key" onChange={this.handleApiKeyChange} />
          <Input name="serverUrl" label="Server URL" placeholder="https://eyes.applitools.com" onChange={this.handleServerUrlChange} />
          <Link className="secondary" href="https://applitools.com/docs/topics/overview/obtain-api-key.html">Where is my API key?</Link>
          <FlatButton type="submit" onClick={this.submitInfo} style={{
            float: "right",
            margin: "15px 0 0"
          }}>Apply</FlatButton>
        </form>
      </div>
    );
  }
}
