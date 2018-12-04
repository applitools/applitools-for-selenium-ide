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
      enableVisualGrid: true,
    }
    browser.storage.local
      .get(['eyesServer', 'branch', 'parentBranch', 'enableVisualGrid'])
      .then(({ eyesServer, branch, parentBranch, enableVisualGrid }) => {
        this.setState({
          eyesServer,
          branch: branch || '',
          parentBranch: parentBranch || '',
          enableVisualGrid: enableVisualGrid,
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
  handleCheckboxChange(name, e) {
    if (name === 'enableVisualGrid')
      this.handleInputChange('enableVisualGrid', e.target.checked)
    else if (this.props.visualCheckpointsChanged)
      this.props.visualCheckpointsChanged(e.target.checked)
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
          id="enable-checks"
          className="checkbox"
          name="enable-checks"
          label="Enable visual checkpoints"
          checked={this.props.enableVisualCheckpoints}
          onChange={this.handleCheckboxChange.bind(this, undefined)}
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
        <Checkbox
          id="enable-visual-grid"
          className="checkbox"
          name="enable-visual-grid"
          label="Execute using visual grid"
          checked={this.state.enableVisualGrid}
          onChange={this.handleCheckboxChange.bind(this, 'enableVisualGrid')}
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
