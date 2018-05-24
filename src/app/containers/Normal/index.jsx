import browser from "webextension-polyfill";
import React from "react";
import PropTypes from "prop-types";
import Checkbox from "../../components/Checkbox";
import MoreInfo from "../../components/MoreInfo";

export default class Normal extends React.Component {
  static propTypes = {
    disableVisualCheckpoints: PropTypes.bool.isRequired,
    visualCheckpointsChanged: PropTypes.func.isRequired
  };
  openOptionsPage() {
    browser.runtime.openOptionsPage();
  }
  handleCheckboxChange(e) {
    if (this.props.visualCheckpointsChanged) {
      this.props.visualCheckpointsChanged(e.target.checked);
    }
  }
  render() {
    return (
      <div>
        <Checkbox
          id="disable-checks"
          className="checkbox"
          name="disable-checks"
          label="Disable visual checkpoints"
          checked={this.props.disableVisualCheckpoints}
          onChange={this.handleCheckboxChange.bind(this)}
        />
        <a href="#" onClick={this.openOptionsPage} style={{
          marginLeft: "30px"
        }}>Open settings</a>
        <footer>
          <p>More options will be available when running or recording tests. <MoreInfo /></p>
        </footer>
      </div>
    );
  }
}
