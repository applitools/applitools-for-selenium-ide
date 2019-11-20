const { exec } = require('child_process')
const { writeFileSync } = require('fs')

if (!process.argv[2]) {
  console.log('No language provided!')
  console.log('')
  console.log('Options include:')
  console.log('  - java-junit')
  console.log('  - javascript-mocha')
  console.log('  - ruby-rspec')
  console.log('')
  process.exit(1)
}

const up = exec(`cd ${process.argv[2]}; docker-compose up`);
let log = ''

process.stdin.pipe(up.stdin)

console.log('Tests are running. Please wait...')

function getCode(message) {
  const match = message.match(/exited with code (\d)\n/)
  if (match) return match[1]
}

up.stdout.on('data', (data) => {
  console.log(data)
  log += data
  if (data.includes('exited with code')) {
    const code = getCode(data)
    const down = exec(`cd ${process.argv[2]}; docker-compose down`)
    writeFileSync('run-tests.log', log)
    console.log('Logs written to run-tests.log')
    down.on('close', (_code) => {
      console.log(`Terminating session with exit code ${code}`)
      process.exit(code)
    })
  }
});
