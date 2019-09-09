'use strict'
const fs = require('fs').promises
const { spawn } = require('child_process')

function spawnAsync(command, args, options) {
  return new Promise((res, rej) => {
    let output = ''
    const proc = spawn(command, args, options)
      .on('error', rej)
      .on('close', code =>
        code === 0 ? res(output) : rej(new Error(`bad exit code ${code}`))
      )
    proc.stdout.on('data', data => {
      output += data
    })
  })
}

async function isCwdCorrect() {
  try {
    const pkg = JSON.parse((await fs.readFile('./package.json')).toString())

    if (pkg.name === 'applitools-for-selenium-ide') {
      return true
    }

    throw new Error('not found')
  } catch (err) {
    throw new Error(
      "Can't find applitools-for-selenium-ide package.json, make sure to run the script for the project's root"
    )
  }
}

module.exports = {
  spawnAsync,
  isCwdCorrect,
}
