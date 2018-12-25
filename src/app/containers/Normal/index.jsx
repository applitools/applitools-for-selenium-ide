import browser from 'webextension-polyfill'
import storage from '../../../IO/storage'
import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '../../../commons/components/Checkbox'
import Input from '../../../commons/components/Input'
import MoreInfo from '../../components/MoreInfo'
import Link from '../../../commons/components/Link'
import { DEFAULT_SERVER } from '../../../commons/api.js'
import VisualGrid from '../../components/VisualGrid'
import VisualGridEula from '../../components/VisualGridEula'
import './style.css'

export default class Normal extends React.Component {
  static propTypes = {
    enableVisualCheckpoints: PropTypes.bool.isRequired,
    visualCheckpointsChanged: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
  }
  constructor(props) {
    super(props)
    this.state = {
      eyesServer: '',
    }
    this.setProjectSettings()
    this.setProjectSettings = this.setProjectSettings.bind(this)
    this.signEula = this.signEula.bind(this)
  }
  componentDidUpdate(prevProps) {
    if (prevProps.projectId !== this.props.projectId) {
      this.setProjectSettings()
    }
  }
  openOptionsPage() {
    browser.runtime.openOptionsPage()
  }
  handleCheckboxChange(name, e) {
    if (name === 'enableVisualGrid') {
      this.handleInputChange('enableVisualGrid', e.target.checked)
    } else if (this.props.visualCheckpointsChanged)
      this.props.visualCheckpointsChanged(e.target.checked)
  }
  handleInputChange(name, value) {
    const result = { ...this.state.projectSettings, [name]: value }
    storage.get(['projectSettings']).then(({ projectSettings }) => {
      storage
        .set({
          ['projectSettings']: {
            ...projectSettings,
            [this.props.projectId]: result,
          },
        })
        .then(() => {
          this.setState({ projectSettings: result })
        })
    })
  }
  setProjectSettings() {
    storage
      .get(['eyesServer', 'eulaSignDate', 'projectSettings'])
      .then(({ eyesServer, eulaSignDate, projectSettings }) => {
        const settings =
          projectSettings && projectSettings[this.props.projectId]
            ? projectSettings[this.props.projectId]
            : {
                branch: '',
                parentBranch: '',
                enableVisualGrid: true,
                selectedBrowsers: [],
                selectedViewportSizes: [],
                customViewportSizes: [],
              }
        this.setState({
          eyesServer,
          eulaSigned: !!eulaSignDate,
          projectSettings: settings,
        })
      })
  }
  signEula() {
    return this.setState({ eulaSigned: true })
    storage
      .set({
        eulaSignDate: new Date().toISOString(),
      })
      .then(() => {
        this.setState({ eulaSigned: true })
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
        {this.state.projectSettings && (
          <React.Fragment>
            <hr />
            <h4>Project settings</h4>
            <Input
              name="branch"
              label="Branch name"
              value={this.state.projectSettings.branch}
              onChange={this.handleInputChange.bind(this, 'branch')}
            />
            <Input
              name="parentBranch"
              label="Parent branch name"
              value={this.state.projectSettings.parentBranch}
              onChange={this.handleInputChange.bind(this, 'parentBranch')}
            />
            <Checkbox
              id="enable-visual-grid"
              className="checkbox"
              name="enable-visual-grid"
              label="Execute using visual grid"
              checked={
                this.state.projectSettings.enableVisualGrid ||
                !this.state.eulaSigned
              }
              onChange={this.handleCheckboxChange.bind(
                this,
                'enableVisualGrid'
              )}
            />
            {!this.state.eulaSigned && (
              <VisualGridEula onEulaSigned={this.signEula} />
            )}
            {this.state.projectSettings.enableVisualGrid &&
              this.state.eulaSigned && (
                <VisualGrid
                  projectId={this.props.projectId}
                  projectSettings={this.state.projectSettings}
                />
              )}
          </React.Fragment>
        )}
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
              lineHeight: '17px',
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
