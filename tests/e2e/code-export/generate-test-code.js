const { readFileSync, writeFileSync } = require('fs')
const path = require('path')
const {
  emitCheckWindow,
  emitCheckElement,
  emitSetMatchLevel,
  emitSetMatchTimeout,
  emitSetPreRenderHook,
  emitSetViewportSize,
  emitAfterEach,
  emitBeforeEach,
  emitDependency,
  emitInEachEnd,
  emitVariable,
} = require('../../../src/background/utils/code-export')
const { registerCommand } = require('@seleniumhq/side-model')
const { commands } = require('../../../src/background/plugin-manifest.json')
const projectFile = JSON.parse(
  readFileSync(path.join(__dirname, '..', '..', 'applitools-ext.side'))
)
const { project } = require('@seleniumhq/side-utils')
const exporter = require('@seleniumhq/code-export')

/* eslint-disable no-alert, no-console */

commands.forEach(command => {
  registerCommand(command.id, {
    name: command.name,
    description: command.docs.description,
    target: command.docs.target,
    value: command.docs.value,
  })
})

function registerEmitters(language) {
  exporter.default.register.command(
    language,
    'eyesCheckWindow',
    emitCheckWindow.bind(undefined, language)
  )
  exporter.default.register.command(
    language,
    'eyesCheckElement',
    emitCheckElement.bind(undefined, language)
  )
  exporter.default.register.command(
    language,
    'eyesSetMatchLevel',
    emitSetMatchLevel.bind(undefined, language)
  )
  exporter.default.register.command(
    language,
    'eyesSetMatchTimeout',
    emitSetMatchTimeout.bind(undefined, language)
  )
  exporter.default.register.command(
    language,
    'eyesSetPreRenderHook',
    emitSetPreRenderHook.bind(undefined, language)
  )
  exporter.default.register.command(
    language,
    'eyesSetViewportSize',
    emitSetViewportSize.bind(undefined, language)
  )
  exporter.default.register.afterEach(
    language,
    emitAfterEach.bind(undefined, language)
  )
  exporter.default.register.beforeEach(
    language,
    emitBeforeEach.bind(undefined, language)
  )
  exporter.default.register.dependency(
    language,
    emitDependency.bind(undefined, language)
  )
  exporter.default.register.inEachEnd(
    language,
    emitInEachEnd.bind(undefined, language)
  )
  exporter.default.register.variable(
    language,
    emitVariable.bind(undefined, language)
  )
}

function generateSuite(projectFile, language) {
  const suite = project.normalizeTestsInSuite({
    suite: projectFile.suites[0],
    tests: projectFile.tests,
  })
  registerEmitters(language)
  const options = {
    url: projectFile.url,
    suite,
    tests: projectFile.tests,
    project: projectFile,
    beforeEachOptions: {
      browserName: 'Chrome',
      gridUrl: 'http://localhost:4444/wd/hub',
    },
  }
  return exporter.default.emit
    .suite(language, options)
    .then(result => {
      const filePath = language.includes('java')
        ? path.join(
            __dirname,
            language,
            'tests',
            'src',
            'test',
            'java',
            result.filename
          )
        : path.join(__dirname, language, 'tests', result.filename)
      writeFileSync(filePath, result.body)
    })
    .catch(console.error)
}

//if (!process.argv[2]) {
//  console.log('No language provided!')
//  console.log('')
//  console.log('Options include:')
//  console.log('  - csharp-nunit')
//  console.log('  - java-junit')
//  console.log('  - javascript-mocha')
//  console.log('  - python-pytest')
//  console.log('  - ruby-rspec')
//  console.log('')
//  process.exit(1)
//}
// generateSuite(projectFile, process.argv[2])

module.exports = {
  generateSuite: generateSuite.bind(undefined, projectFile),
}
