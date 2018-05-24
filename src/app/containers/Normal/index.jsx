import React from "react";
import PropTypes from "prop-types";
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
        <input
          type="checkbox"
          className="checkbox"
          id="disable-checks"
          name="disable-checks"
          checked={this.props.disableVisualCheckpoints}
          onChange={this.handleCheckboxChange.bind(this)}
        />
        <label key="label" htmlFor="disable-checks">Disable visual checkpoints</label>
        <a href="#" onClick={this.openOptionsPage}>Open settings</a>
        <footer>
          <p>More options will be available when running or recording tests. <MoreInfo /></p>
        </footer>
      </div>
    );
  }
}
