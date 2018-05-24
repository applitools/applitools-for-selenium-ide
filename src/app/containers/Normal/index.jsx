import React from "react";
import MoreInfo from "../../components/MoreInfo";

export default class Normal extends React.Component {
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
        <input
          type="checkbox"
          className="checkbox"
          id="disable-checks"
          name="disable-checks"
          checked={this.state.checked}
          onChange={this.onCheckChange}
        />
        <label key="label" htmlFor="disable-checks">Disable visual checks</label>
        <a href="#" onClick={this.openOptionsPage}>options</a>
        <footer>
          <p>More options will be available when running or recording tests. <MoreInfo /></p>
        </footer>
      </div>
    );
  }
}
