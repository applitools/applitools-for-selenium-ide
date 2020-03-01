#!/usr/bin/env node
'use strict'
/* eslint-disable no-console */
const fs = require('fs').promises
const { spawnAsync, isCwdCorrect } = require('./utils')

const SDKS_TO_UPGRADE = [
  '@applitools/dom-capture',
  '@applitools/dom-snapshot',
  '@applitools/eyes-images',
  '@applitools/visual-grid-client',
]

async function upgradeSDKs() {
  await spawnAsync('yarn', ['upgrade', ...SDKS_TO_UPGRADE, '--json'])
}

async function upgradeEyesSeleniumSdk() {
  const EYES_SELENIUM_SDK_NAME = '@applitools/eyes-selenium'
  const PLUGIN_MANIFEST_PATH = './src/background/plugin-manifest.json'

  const latestVersion = await getLatestSdkVersion(EYES_SELENIUM_SDK_NAME)

  const pkg = JSON.parse((await fs.readFile(PLUGIN_MANIFEST_PATH)).toString())
  pkg.dependencies[EYES_SELENIUM_SDK_NAME] = latestVersion

  await fs.writeFile(PLUGIN_MANIFEST_PATH, JSON.stringify(pkg, undefined, 2))
}

async function getLatestSdkVersion(sdk) {
  const info = JSON.parse(await spawnAsync('yarn', ['info', sdk, '--json']))
  return info.data['dist-tags'].latest
}

async function writeChangelog() {
  const [pkg, changelog] = await Promise.all([
    JSON.parse((await fs.readFile('./package.json')).toString()),
    (await fs.readFile('./CHANGELOG.md')).toString(),
  ])

  await fs.writeFile(
    './CHANGELOG.md',
    changelog.replace(
      '# Changelog',
      `# Changelog\n\n## v${pkg.version}\n- Updated underlying Applitools SDKs`
    )
  )
}

async function stageFiles(files) {
  await spawnAsync('git', ['add', ...files])
}

async function versionAndTag() {
  await spawnAsync('yarn', ['version', '--patch'])
}

async function amendCommit() {
  await spawnAsync('git', ['commit', '--amend', '--no-edit'])
}

async function pushCommit() {
  await spawnAsync('git', ['push', 'origin', 'master', '--tags'])
}

;(async () => {
  if (isCwdCorrect()) {
    console.log('upgrading SDKs')
    await Promise.all([upgradeEyesSeleniumSdk(), upgradeSDKs()])
    console.log('preparing commit')
    await stageFiles(['yarn.lock', 'src/background/plugin-manifest.json'])
    console.log('commiting and creating tags')
    await versionAndTag()
    console.log('writing changelog')
    await writeChangelog()
    await stageFiles(['CHANGELOG.md'])
    await amendCommit()
    console.log('pushing...')
    await pushCommit()
    console.log('done CI will publish to the stores shortly')
  }
})()
