import browser from 'webextension-polyfill'
import './image-strategies/css-stitching/polyfills'
import {
  CommandIds,
  isEyesCommand,
  containsEyesCommands,
} from '../commons/commands'
import Modes from '../commons/modes'
import ideLogger from './utils/ide-logger'
import popup from './utils/ide-popup'
import {
  getExternalState,
  setExternalState,
  setExternalStateInternally,
  resetMode,
  validateOptions,
} from './external-state'
import { getCurrentProject } from './utils/ide-project'
import { sendMessage, startPolling } from '../IO/message-port'
import { recordCommand } from './commands/recorder'
import { getViewportSize, setViewportSize } from './commands/viewport'
import { checkWindow, checkElement, endTest } from './commands/check'
import {
  makeEyes,
  getEyes,
  hasEyes,
  getResultsUrl,
  hasValidVisualGridSettings,
  getExtensionSettings,
} from './utils/eyes'
import { parseViewport, parseMatchLevel } from './utils/parsers'
import { setupOptions } from './utils/options.js'
import manifest from '../manifest.json'
import pluginManifest from './plugin-manifest.json'
import { incompleteVisualGridSettings } from './modal-settings'

startPolling(pluginManifest, err => {
  if (err) {
    setExternalState({
      mode: Modes.DISCONNECTED,
      normalMode: Modes.NORMAL,
      isConnected: false,
    })
  } else if (!getExternalState().isConnected) {
    setExternalStateInternally({
      isConnected: true,
    })
    resetMode()
  }
})

setupOptions().then(() => {
  browser.storage.local
    .get(['enableVisualCheckpoints'])
    .then(({ enableVisualCheckpoints }) => {
      setExternalState({ enableVisualCheckpoints })
    })
  validateOptions().then(() => {
    resetMode()
  })
})

function updateBrowserActionIcon(enableVisualCheckpoints) {
  return browser.browserAction.setIcon({
    path: enableVisualCheckpoints
      ? {
          16: 'icons/icon_menu16.png',
          32: 'icons/icon_menu32.png',
          64: 'icons/icon_menu64.png',
        }
      : {
          16: 'icons/icon_menu16_disabled.png',
          32: 'icons/icon_menu32_disabled.png',
          64: 'icons/icon_menu64_disabled.png',
        },
  })
}

// BEWARE CONVOLUTED API AHEAD!!!
// When using onMessage or onMessageExternal listeners only one response can
// be returned, or else it will throw (sometimes throw in a different message at all!)
// When returning in the listener, the listener will treat this as the response:
// return 5 is the same as sendResponse(5)
// For that reason async operations are convoluted, if foo is async then this:
// return foo().then(sendRespnse) will throw, because foo returns a promise
// which will be used as the response value, and when the promise resolves
// another value is returned using sendResponse
// To use async operations with onMessage, return true, this will inform chrome
// to wait until the sendResponse callback is explicitly called, which results in:
// foo().then(sendResponse); return true
// PASTE THIS IN EVERY PLACE THAT LISTENS TO onMessage!!
browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.requestProject) {
    getCurrentProject().then(project => {
      sendResponse({ project })
    })
    return true
  }
  // eslint-disable-line no-unused-vars
  if (message.requestExternalState) {
    return sendResponse({ state: getExternalState() })
  }
  if (message.setVisualChecks) {
    browser.storage.local.set({
      enableVisualCheckpoints: message.enableVisualCheckpoints,
    })
    updateBrowserActionIcon(message.enableVisualCheckpoints)
    setExternalState({
      enableVisualCheckpoints: message.enableVisualCheckpoints,
    })
  }
  if (message.optionsUpdated) {
    browser.storage.local
      .get(['enableVisualCheckpoints'])
      .then(({ enableVisualCheckpoints }) => {
        updateBrowserActionIcon(enableVisualCheckpoints)
        setExternalState({ enableVisualCheckpoints })
      })
    validateOptions().then(() => {
      resetMode()
    })
  }
  if (message.recordCommand) {
    recordCommand(message.command)
  }
})

let useNativeOverride = undefined

// BEWARE CONVOLUTED API AHEAD!!!
// When using onMessage or onMessageExternal listeners only one response can
// be returned, or else it will throw (sometimes throw in a different message at all!)
// When returning in the listener, the listener will treat this as the response:
// return 5 is the same as sendResponse(5)
// For that reason async operations are convoluted, if foo is async then this:
// return foo().then(sendRespnse) will throw, because foo returns a promise
// which will be used as the response value, and when the promise resolves
// another value is returned using sendResponse
// To use async operations with onMessage, return true, this will inform chrome
// to wait until the sendResponse callback is explicitly called, which results in:
// foo().then(sendResponse); return true
// PASTE THIS IN EVERY PLACE THAT LISTENS TO onMessage!!
browser.runtime.onMessageExternal.addListener(
  (message, _sender, sendResponse) => {
    if (message.event === 'recordingStarted') {
      setExternalState({
        normalMode: Modes.RECORD,
        record: {
          testName: message.options.testName,
        },
      })
    }
    if (message.event === 'recordingStopped') {
      setExternalState({
        normalMode: Modes.NORMAL,
      })
      resetMode()
    }
    if (message.event === 'projectLoaded') {
      setExternalState({ projectId: message.options.projectId })
    }
    if (message.event === 'suitePlaybackStarted' && message.options.runId) {
      const commands = message.options.tests.reduce(
        (cmds, test) => [...cmds, ...test.commands],
        []
      )
      if (
        containsEyesCommands(commands, [CommandIds.SetViewportSize]) &&
        getExternalState().enableVisualCheckpoints
      ) {
        getExtensionSettings()
          .then(settings => {
            if (
              (settings.projectSettings.enableVisualGrid &&
                (!settings.isFree && !settings.eulaSignDate)) ||
              !hasValidVisualGridSettings(settings.projectSettings)
            ) {
              popup(incompleteVisualGridSettings).then(result => {
                if (result) {
                  useNativeOverride = true
                  return sendResponse(true)
                } else {
                  return sendResponse({
                    message: 'User aborted playback.',
                    status: 'fatal',
                  })
                }
              })
            } else {
              return sendResponse(true)
            }
          })
          .catch(sendResponse) // eslint-disable-line
      } else {
        sendResponse(true)
      }
      return true
    }
    if (message.event === 'playbackStarted' && message.options.runId) {
      const commands = message.options.test.commands
      if (
        containsEyesCommands(commands, [CommandIds.SetViewportSize]) &&
        getExternalState().enableVisualCheckpoints
      ) {
        const baselineEnvNameCommand = commands.find(
          command => command.command === CommandIds.SetBaselineEnvName
        )
        makeEyes(
          `${message.options.runId}${message.options.testId}`,
          message.options.runId,
          message.options.projectName,
          message.options.suiteName,
          message.options.testName,
          {
            baselineEnvName: baselineEnvNameCommand
              ? baselineEnvNameCommand.target
              : undefined,
            useNativeOverride,
          }
        )
          .then(() => {
            return sendResponse(true)
          })
          .catch(error => {
            let modalSettings
            switch (error.message) {
              case 'Incomplete visual grid settings': {
                modalSettings = incompleteVisualGridSettings
                break
              }
              default: {
                return sendResponse({
                  message: error.message,
                  status: 'fatal',
                })
              }
            }
            if (modalSettings) {
              popup(modalSettings).then(result => {
                if (result) {
                  makeEyes(
                    `${message.options.runId}${message.options.testId}`,
                    message.options.runId,
                    message.options.projectName,
                    message.options.suiteName,
                    message.options.testName,
                    {
                      baselineEnvName: baselineEnvNameCommand
                        ? baselineEnvNameCommand.target
                        : undefined,
                      useNativeOverride: true,
                    }
                  ).then(() => {
                    return sendResponse(true)
                  })
                } else {
                  return sendResponse({
                    message: 'User aborted playback.',
                    status: 'fatal',
                  })
                }
              })
            }
          })
      } else {
        ideLogger.log('Visual checkpoints are disabled').then(() => {
          return sendResponse(true)
        })
      }
      return true
    }
    if (
      message.event === 'playbackStopped' &&
      message.options.runId &&
      hasEyes(`${message.options.runId}${message.options.testId}`)
    ) {
      endTest(`${message.options.runId}${message.options.testId}`)
        .then(results => {
          resetMode()
          browser.storage.local.get(['openUrls']).then(({ openUrls }) => {
            const url = getResultsUrl()
            if (openUrls && url && !message.options.suiteName) {
              browser.tabs.create({ url })
            }
          })
          return sendResponse(results)
        })
        .catch(e => {
          resetMode()
          return sendResponse({
            error: e.message,
            status: 'fatal',
          })
        })
      return true
    }
    if (message.event === 'suitePlaybackStopped' && message.options.runId) {
      browser.storage.local
        .get(['openUrls'])
        .then(({ openUrls }) => {
          const url = getResultsUrl()
          if (openUrls && url) {
            browser.tabs.create({ url })
          }
          sendResponse(true)
        })
        .catch(sendResponse)
      useNativeOverride = undefined
      return true
    }
    if (message.action === 'execute') {
      switch (message.command.command) {
        case CommandIds.SetBaselineEnvName: {
          // this command gets hoisted
          return sendResponse(true)
        }
        case CommandIds.SetMatchLevel: {
          getEyes(`${message.options.runId}${message.options.testId}`)
            .then(eyes => {
              return eyes.setMatchLevel(message.command.target)
            })
            .then(() => {
              return sendResponse(true)
            })
            .catch(error => {
              return sendResponse(
                error instanceof Error ? { error: error.message } : { error }
              )
            })
          return true
        }
        case CommandIds.SetMatchTimeout: {
          getEyes(`${message.options.runId}${message.options.testId}`)
            .then(eyes => {
              if (eyes.isVisualGrid) {
                return ideLogger.log(
                  "'set match timeout' has no affect in Visual Grid tests."
                )
              } else {
                const timeout = message.command.target.trim()
                if (!/^\d+$/.test(timeout)) {
                  throw new Error(
                    'Timeout is not an integer, pass a timeout in ms to the target field.'
                  )
                }
                return eyes.setMatchTimeout(parseInt(timeout))
              }
            })
            .then(() => {
              return sendResponse(true)
            })
            .catch(error => {
              return sendResponse(
                error instanceof Error ? { error: error.message } : { error }
              )
            })
          return true
        }
        case CommandIds.SetViewportSize: {
          const { width, height } = parseViewport(message.command.target)
          setViewportSize(width, height, message.options)
            .then(() => {
              return sendResponse(true)
            })
            .catch(error => {
              return sendResponse({
                error: error && error.message ? error.message : error,
                status: 'fatal',
              })
            })
          return true
        }
        case CommandIds.CheckWindow: {
          if (
            !getExternalState().enableVisualCheckpoints ||
            message.options.isNested
          ) {
            return sendResponse(true)
          } else if (message.options.runId) {
            getViewportSize(message.options.tabId).then(viewport => {
              checkWindow(
                message.options.runId,
                message.options.testId,
                message.options.commandId,
                message.options.tabId,
                message.options.windowId,
                message.command.target,
                viewport
              )
                .then(results => {
                  sendResponse(results)
                })
                .catch(error => {
                  sendResponse(
                    error instanceof Error
                      ? { error: error.message }
                      : { error }
                  )
                })
            })
            return true
          } else {
            return sendResponse({
              status: 'fatal',
              error:
                "This command can't be run individually, please run the test case.",
            })
          }
        }
        case CommandIds.CheckElement: {
          if (
            !getExternalState().enableVisualCheckpoints ||
            message.options.isNested
          ) {
            return sendResponse(true)
          } else if (message.options.runId) {
            sendMessage({
              uri: '/playback/location',
              verb: 'get',
              payload: {
                location: message.command.target,
              },
            }).then(target => {
              if (target.error) {
                sendResponse({ error: target.error })
              } else {
                getViewportSize(message.options.tabId).then(viewport => {
                  checkElement(
                    message.options.runId,
                    message.options.testId,
                    message.options.commandId,
                    message.options.frameId,
                    message.options.tabId,
                    message.options.windowId,
                    target,
                    message.command.value,
                    viewport
                  )
                    .then(results => {
                      sendResponse(results)
                    })
                    .catch(error => {
                      sendResponse(
                        error instanceof Error
                          ? { error: error.message }
                          : { error }
                      )
                    })
                })
              }
            })
            return true
          } else {
            return sendResponse({
              status: 'fatal',
              error:
                "This command can't be run individually, please run the test case.",
            })
          }
        }
      }
    }
    if (message.action === 'export') {
      if (message.entity === 'command') {
        const { command, target, value } = message.command // eslint-disable-line no-unused-vars
        if (command === CommandIds.SetBaselineEnvName) {
          // this command gets hoisted
          return sendResponse(false)
        } else if (command === CommandIds.CheckWindow) {
          switch (message.language) {
            case 'java-junit': {
              return sendResponse(
                target
                  ? `eyes.checkWindow("${target}");`
                  : `eyes.checkWindow();`
              )
            }
          }
        } else if (command === CommandIds.CheckElement) {
          switch (message.language) {
            case 'java-junit': {
              sendMessage({
                uri: '/export/location',
                verb: 'get',
                payload: {
                  location: target,
                  language: message.language,
                },
              })
                .then(locator => {
                  sendResponse(`eyes.checkElement(${locator});`)
                })
                .catch(console.error) // eslint-disable-line no-console
              return true
            }
          }
        } else if (command === CommandIds.SetViewportSize) {
          switch (message.language) {
            case 'java-junit': {
              const { width, height } = parseViewport(target)
              return sendResponse(
                `Eyes.setViewportSize(driver, new RectangleSize(${width}, ${height}));`
              )
            }
          }
        } else if (command === CommandIds.SetMatchLevel) {
          switch (message.language) {
            case 'java-junit': {
              return sendResponse(
                `eyes.setMatchLevel("${parseMatchLevel(target)}");`
              )
            }
          }
        } else if (command === CommandIds.SetMatchTimeout) {
          switch (message.language) {
            case 'java-junit': {
              return sendResponse(`eyes.setMatchTimeout(${target});`)
            }
          }
        }
      }
      const hasEyesCommands = message.options.tests
        ? message.options.tests
            .reduce((commands, test) => {
              return [...commands, ...test.commands]
            }, [])
            .find(command => isEyesCommand(command))
        : false
      if (hasEyesCommands) {
        switch (message.entity) {
          case 'afterEach': {
            switch (message.language) {
              case 'java-junit': {
                return sendResponse(`eyes.abortIfNotClosed();`)
              }
            }
            break
          }
          case 'beforeEach': {
            switch (message.language) {
              case 'java-junit': {
                let statement = `eyes = new Eyes();\neyes.setApiKey(System.getenv("APPLITOOLS_API_KEY"));`
                const commands = message.options.tests
                  ? message.options.tests.reduce(
                      (_commands, test) => [...test.commands],
                      []
                    )
                  : []
                const baselineEnvNameCommand = commands.find(
                  command => command.command === CommandIds.SetBaselineEnvName
                )
                if (baselineEnvNameCommand) {
                  statement += `\neyes.setBaseLineEnvName("${
                    baselineEnvNameCommand.target
                  }");`
                }
                statement += '\neyes.open(driver);'
                return sendResponse(statement)
              }
            }
            break
          }
          case 'dependency': {
            switch (message.language) {
              case 'java-junit': {
                return sendResponse(
                  `import com.applitools.eyes.selenium.Eyes;\nimport com.applitools.eyes.RectangleSize;`
                )
              }
            }
            break
          }
          case 'inEachEnd': {
            switch (message.language) {
              case 'java-junit': {
                return sendResponse(`eyes.close();`)
              }
            }
            break
          }
          case 'variable': {
            switch (message.language) {
              case 'java-junit': {
                return sendResponse(`private Eyes eyes;`)
              }
            }
            break
          }
        }
      }
      return sendResponse(undefined)
    }
    if (message.action === 'emit') {
      switch (message.entity) {
        case 'project': {
          const { project } = message
          const hasEyesCommands = project.tests
            .reduce((commands, test) => {
              return [...commands, ...test.commands]
            }, [])
            .find(command => isEyesCommand(command))
          return sendResponse({ canEmit: !!hasEyesCommands })
        }
        case 'config': {
          return sendResponse(
            `const { Eyes, Target } = configuration.params.eyesRendering ? require('@applitools/eyes-rendering') : require('@applitools/eyes-selenium');global.Target = Target;const { ConsoleLogHandler, BatchInfo } = require('@applitools/eyes-sdk-core');let apiKey = process.env.APPLITOOLS_API_KEY, serverUrl = process.env.APPLITOOLS_SERVER_URL, appName = "${
              message.project.name
            }", batchId = configuration.runId, batchName;`
          )
        }
        case 'suite': {
          const { suite } = message
          const hasEyesCommands = suite.tests
            .reduce((commands, test) => {
              return [...commands, ...test.commands]
            }, [])
            .find(command => isEyesCommand(command))
          if (hasEyesCommands) {
            return sendResponse({
              beforeAll: `batchName = "${message.suite.name}";`,
              before: `global.eyes = new Eyes(serverUrl, configuration.params.eyesDisabled);eyes.setApiKey(apiKey);eyes.getBaseAgentId = () => ("eyes.seleniumide.runner ${
                manifest.version
              } " + (eyes._isVisualGrid ? "visualgrid" : "local"));eyes.setAgentId("eyes.seleniumide.runner ${
                manifest.version
              } " + (eyes._isVisualGrid ? "visualgrid" : "local"));eyes.setBatch(new BatchInfo(batchName, undefined, batchId));if(!eyes._isVisualGrid){eyes.setHideScrollbars(true);eyes.setStitchMode("CSS");}eyes.setSendDom(configuration.params.eyesDomUploadEnabled === undefined ? true : configuration.params.eyesDomUploadEnabled);if (configuration.params.eyesLogsEnabled) {eyes.setLogHandler(new ConsoleLogHandler(true));}`,
              after:
                'if (eyes._isOpen) {eyes.getEyesRunner ? await eyes.getEyesRunner().getAllResults() : await eyes.close();}',
            })
          }
          break
        }
        case 'test': {
          if (containsEyesCommands(message.test.commands)) {
            let baselineEnvName = ''
            const baselineEnvNameCommand = message.test.commands.find(
              command => command.command === CommandIds.SetBaselineEnvName
            )
            if (baselineEnvNameCommand) {
              baselineEnvName = `eyes.setBaselineEnvName("${
                baselineEnvNameCommand.target
              }" || null);`
            }
            return sendResponse({
              setup: `${baselineEnvName}const _driver = driver;driver = await eyes.open(driver, appName, "${
                message.test.name
              }", null, configuration.params.eyesRendering ? { browser: configuration.params.eyesRendering } : null);`,
              teardown: 'driver = _driver;',
            })
          }
          break
        }
        case 'command': {
          const { command, target, value } = message.command // eslint-disable-line no-unused-vars
          if (command === CommandIds.CheckWindow) {
            return sendResponse(
              `if (!opts.isNested) {await eyes.check("${target}" || (new URL(await driver.getCurrentUrl())).pathname, Target.window().fully(true));}`
            )
          } else if (command === CommandIds.CheckElement) {
            sendMessage({
              uri: '/export/location',
              verb: 'get',
              payload: {
                location: target,
              },
            })
              .then(locator => {
                sendResponse(
                  `if (!opts.isNested) {await driver.wait(until.elementLocated(${locator}), configuration.timeout); await eyes.check("${value}" || (new URL(await driver.getCurrentUrl())).pathname, Target.region(${locator}));}`
                )
              })
              .catch(console.error) // eslint-disable-line no-console
            return true
          } else if (command === CommandIds.SetMatchLevel) {
            return sendResponse(
              `eyes.setMatchLevel("${parseMatchLevel(target)}");`
            )
          } else if (command === CommandIds.SetMatchTimeout) {
            return sendResponse(`eyes.setMatchTimeout(${target});`)
          } else if (command === CommandIds.SetViewportSize) {
            const { width, height } = parseViewport(target)
            return sendResponse(
              `await eyes.setViewportSize({width: ${width}, height: ${height}});`
            )
          } else if (command === CommandIds.SetBaselineEnvName) {
            // this command gets hoisted
            return sendResponse(' ')
          }
        }
      }
    }
    sendResponse(undefined)
  }
)
