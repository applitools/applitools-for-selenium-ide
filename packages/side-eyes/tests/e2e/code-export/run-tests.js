const { exec } = require('child_process')
const { writeFileSync } = require('fs')
const { generateSuite } = require('./generate-test-code')
const path = require('path')

/* eslint-disable no-alert, no-console */

if (!process.argv[2]) {
  console.log('No language provided!')
  console.log('')
  console.log('Options include:')
  console.log('  - csharp-nunit')
  console.log('  - java-junit')
  console.log('  - javascript-mocha')
  console.log('  - python-pytest')
  console.log('  - ruby-rspec')
  console.log('')
  process.exit(1)
}

generateSuite(process.argv[2], process.argv[3])
console.log('Test code generated!')

console.log('Starting node for testing.')
const workingDir = path.join(__dirname, process.argv[2])
const up = exec(`cd ${workingDir}; docker-compose up`)
let log = ''

console.log('Tests are running. Please wait...')

function getCode(message) {
  const match = message.match(/exited with code (\d)\n/)
  if (match) return match[1]
}

up.stderr.on('data', data => {
  console.log('stderr: ' + data.toString())
})

up.stdout.on('data', data => {
  console.log(data)
  log += data
  if (data.includes('exited with code')) {
    const code = getCode(data)
    const down = exec(`cd ${workingDir}; docker-compose down`)
    writeFileSync('run-tests.log', log)
    console.log('Logs written to run-tests.log')
    down.on('close', _code => {
      console.log(`Terminating session with exit code ${code}`)
      process.exit(code)
    })
  }
})
