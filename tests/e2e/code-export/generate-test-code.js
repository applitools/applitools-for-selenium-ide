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

function registerEmitters(
  language,
  appName,
  testName,
  {
    accessibilityLevel,
    isVisualGridEnabled,
    baselineEnvName,
    viewportSize,
  } = {}
) {
  exporter.default.register.command(
    language,
    'eyesCheckWindow',
    emitCheckWindow.bind(undefined, language, {
      accessibilityLevel,
      isVisualGridEnabled,
    })
  )
  exporter.default.register.command(
    language,
    'eyesCheckElement',
    emitCheckElement.bind(undefined, language, {
      accessibilityLevel,
      isVisualGridEnabled,
      locatorEmitter: exporter.default.emit.locator.bind(undefined, language),
    })
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
    emitSetPreRenderHook.bind(undefined, language, { isVisualGridEnabled })
  )
  exporter.default.register.command(
    language,
    'eyesSetViewportSize',
    emitSetViewportSize.bind(undefined, language)
  )
  exporter.default.register.afterEach(
    language,
    emitAfterEach.bind(undefined, language, {
      isVisualGridEnabled,
    })
  )
  exporter.default.register.beforeEach(
    language,
    emitBeforeEach.bind(undefined, language, appName, testName, {
      accessibilityLevel,
      baselineEnvName,
      viewportSize,
      visualGridOptions: isVisualGridEnabled
        ? [
            {
              name: 'Chrome',
              width: 1280,
              height: 800,
            },
            {
              deviceName: 'iPad',
              deviceId: 'iPad',
              screenOrientation: 'portrait',
            },
          ]
        : undefined,
    })
  )
  exporter.default.register.dependency(
    language,
    emitDependency.bind(undefined, language, { isVisualGridEnabled })
  )
  exporter.default.register.inEachEnd(
    language,
    emitInEachEnd.bind(undefined, language, { isVisualGridEnabled })
  )
  exporter.default.register.variable(
    language,
    emitVariable.bind(undefined, language, { isVisualGridEnabled })
  )
}

function generateSuite(projectFile, language, isVisualGridEnabled = false) {
  isVisualGridEnabled = isVisualGridEnabled
    ? JSON.parse(isVisualGridEnabled)
    : false
  const suite = project.normalizeTestsInSuite({
    suite: projectFile.suites[0],
    tests: projectFile.tests,
  })
  const setBaselineEnvNameCommand = projectFile.tests[0].commands.find(
    command => command.command === 'eyesSetBaselineEnvName'
  )
  const setViewportSizeCommand = projectFile.tests[0].commands.find(
    command => command.command === 'eyesSetViewportSize'
  )
  registerEmitters(language, projectFile.name, suite.name, {
    isVisualGridEnabled,
    baselineEnvName: setBaselineEnvNameCommand
      ? setBaselineEnvNameCommand.target
      : undefined,
    viewportSize: setViewportSizeCommand
      ? setViewportSizeCommand.target
      : '1280x800',
  })
  const options = {
    url: projectFile.url,
    suite,
    tests: projectFile.tests,
    project: projectFile,
    beforeEachOptions: {
      browserName: 'Chrome',
      gridUrl: 'http://selenium:4444/wd/hub',
    },
  }
  return exporter.default.emit
    .suite(language, options)
    .then(result => {
      const filePath =
        language === 'java-junit'
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

//if (process.argv[2]) {
//  generateSuite(projectFile, process.argv[2], process.argv[3])
//}

module.exports = {
  generateSuite: generateSuite.bind(undefined, projectFile),
}
