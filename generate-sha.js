const fs = require('fs')
const domCapture = fs.readFileSync(
  './node_modules/@applitools/dom-capture/dist/captureDom.js',
  'utf8'
)
const domSnapshot = fs.readFileSync(
  './node_modules/@applitools/dom-snapshot/dist/processPage.js',
  'utf8'
)
const crypto = require('crypto')

function generateEvalString(input) {
  return `(${input})()`
}

function generateSha(input) {
  const result = crypto
    .createHash('sha256')
    .update(input, 'utf8')
    .digest('base64')
  return `sha256-${result}`
}

console.log(generateSha(generateEvalString(domCapture)))
console.log(generateSha(generateEvalString(domSnapshot)))
