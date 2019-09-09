#!/usr/bin/env node
'use strict'
/* eslint-disable no-console */
const fs = require('fs').promises
const semver = require('semver')
const { spawnAsync, isCwdCorrect } = require('./utils')

const DEPLOY_BRANCH = process.env.DEPLOY_BRANCH || 'master'

async function shouldDeploy() {
  if (process.env.FORCE_DEPLOY) return true

  const prevPkg = JSON.parse(
    await spawnAsync('git', ['show', 'HEAD~:package.json'])
  )
  const pkg = JSON.parse((await fs.readFile('./package.json')).toString())

  return semver.gt(pkg.version, prevPkg.version)
}

async function isOnDeployBranch() {
  const branchName = (await spawnAsync('git', [
    'rev-parse',
    '--abbrev-ref',
    'HEAD',
  ])).trim()

  return branchName === DEPLOY_BRANCH
}

;(async () => {
  console.log('checking whether to deploy...')
  if (!(await isOnDeployBranch())) {
    console.log(`not on ${DEPLOY_BRANCH} branch skipping`)
  } else if ((await isCwdCorrect()) && (await shouldDeploy())) {
    console.log('starting deployment')
    process.exit(0)
  } else {
    console.log(
      'version was not changed since last commit (or is older), not deploying'
    )
  }
  process.exit(1)
})()
