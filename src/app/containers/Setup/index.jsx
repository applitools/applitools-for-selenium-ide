import React from "react";
import Link from "../../components/Link";
import Input from "../../components/Input";
import FlatButton from "../../components/FlatButton";

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
  handleApiKeyChange(value) {
    this.setState({ apiKey: value });
  }
  handleServerUrlChange(value) {
    this.setState({ serverUrl: value });
  }
  submitInfo() {
    console.log(this.state);
  }
  render() {
    return (
      <div>
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <p>
            <Link href="https://applitools.com/users/register">Sign up for a free account</Link> if you don’t already have one
          </p>
          <Input name="apiKey" label="API key" onChange={this.handleApiKeyChange} />
          <Input name="serverUrl" label="Server URL" placeholder="https://eyes.applitools.com" onChange={this.handleServerUrlChange} />
          <FlatButton type="submit" onClick={this.submitInfo} style={{
            float: "right",
            margin: "0"
          }}>Apply</FlatButton>
        </form>
      </div>
    );
  }
}
