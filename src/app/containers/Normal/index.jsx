import browser from 'webextension-polyfill'
import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '../../../commons/components/Checkbox'
import Input from '../../../commons/components/Input'
import MoreInfo from '../../components/MoreInfo'
import Link from '../../../commons/components/Link'
import { DEFAULT_SERVER } from '../../../commons/api.js'
import './style.css'

export default class Normal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      branch: '',
      parentBranch: '',
    }
    browser.storage.local
      .get(['eyesServer', 'branch', 'parentBranch'])
      .then(({ eyesServer, branch, parentBranch }) => {
        this.setState({
          eyesServer,
          branch: branch || '',
          parentBranch: parentBranch || '',
        })
      })
  }
  static propTypes = {
    enableVisualCheckpoints: PropTypes.bool.isRequired,
    visualCheckpointsChanged: PropTypes.func.isRequired,
  }
  openOptionsPage() {
    browser.runtime.openOptionsPage()
  }
  handleCheckboxChange(e) {
    if (this.props.visualCheckpointsChanged) {
      this.props.visualCheckpointsChanged(e.target.checked)
    }
  }
  handleInputChange(name, value) {
    browser.storage.local.set({ [name]: value }).then(() => {
      this.setState({
        [name]: value,
      })
    })
  }
  render() {
    return (
      <div className="project-settings">
        <Checkbox
          id="disable-checks"
          className="checkbox"
          name="disable-checks"
          label="Enable visual checkpoints"
          checked={this.props.enableVisualCheckpoints}
          onChange={this.handleCheckboxChange.bind(this)}
        />
        <hr />
        <h4>Project settings</h4>
        <Input
          name="branch"
          label="Branch name"
          placeholder=""
          value={this.state.branch}
          onChange={this.handleInputChange.bind(this, 'branch')}
        />
        <Input
          name="parentBranch"
          label="Parent branch name"
          value={this.state.parentBranch}
          onChange={this.handleInputChange.bind(this, 'parentBranch')}
        />
        <hr />
        <div className="open-global-settings">
          <a href="#" onClick={this.openOptionsPage}>
            Open global settings
          </a>
          <Link
            href={
              new URL(
                '/app/test-results/',
                this.state.eyesServer || DEFAULT_SERVER
              ).href
            }
            style={{
              display: 'block',
              marginTop: '5px',
            }}
          >
            Open test manager
          </Link>
        </div>
        <footer>
          <p className="more-options">
            More options will be available when running or recording tests.{' '}
            <MoreInfo />
          </p>
        </footer>
      </div>
    )
  }
}
