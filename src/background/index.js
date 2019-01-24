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
import { getViewportSize, setViewportSize } from './commands/viewport'
import {
  checkWindow,
  checkRegion,
  checkElement,
  endTest,
} from './commands/check'
import { makeEyes, getEyes, hasEyes, getResultsUrl } from './utils/eyes'
import { parseViewport, parseRegion } from './utils/parsers'
import { setupOptions } from './utils/options.js'
import pluginManifest from './plugin-manifest.json'

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
})

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
    if (message.event === 'commandRecorded') {
      if (message.options.command === 'setWindowSize') {
        browser.tabs.get(message.options.tabId).then(tab => {
          sendResponse({
            mutation: 'update',
            command: CommandIds.SetViewportSize,
            target: `${tab.width}x${tab.height}`,
            value: '',
          })
        })
        return true
      }
    }
    if (message.event === 'projectLoaded') {
      setExternalState({ projectId: message.options.projectId })
    }
    if (message.event === 'playbackStarted' && message.options.runId) {
      if (
        containsEyesCommands(
          message.options.commands.map(command => command.command)
        ) &&
        getExternalState().enableVisualCheckpoints
      ) {
        makeEyes(
          `${message.options.runId}${message.options.testId}`,
          message.options.runId,
          message.options.projectName,
          message.options.suiteName,
          message.options.testName
        )
          .then(() => {
            return sendResponse(true)
          })
          .catch(() => {
            popup({
              message:
                'You have incomplete visual grid settings in the Eyes extension. What would you like to do?',
              cancelLabel: 'Abort',
              confirmLabel: 'Use Native Eyes',
            }).then(result => {
              if (result) {
                makeEyes(
                  `${message.options.runId}${message.options.testId}`,
                  message.options.runId,
                  message.options.projectName,
                  message.options.suiteName,
                  message.options.testName,
                  true
                ).then(() => {
                  return sendResponse(true)
                })
              } else {
                return sendResponse({
                  message:
                    'User aborted playback due to incomplete visual grid settings',
                  status: 'fatal',
                })
              }
            })
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
        .catch(r => r)
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
        .catch(sendResponse)
      return true
    }
    if (message.event === 'suitePlaybackStopped' && message.options.runId) {
      browser.storage.local.get(['openUrls']).then(({ openUrls }) => {
        const url = getResultsUrl()
        if (openUrls && url) {
          browser.tabs.create({ url })
        }
      })
      return sendResponse(true)
    }
    if (message.action === 'execute') {
      switch (message.command.command) {
        case CommandIds.SetBaselineEnvName: {
          getEyes(`${message.options.runId}${message.options.testId}`)
            .then(eyes => {
              return eyes.setBaselineEnvName(message.command.target)
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
              return eyes.isVisualGrid
                ? ideLogger.log(
                    "'set match timeout' has no affect in Visual Grid tests."
                  )
                : eyes.setDefaultMatchTimeout(message.command.target)
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
          if (!getExternalState().enableVisualCheckpoints) {
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
        case CommandIds.CheckRegion: {
          if (!getExternalState().enableVisualCheckpoints) {
            return sendResponse(true)
          } else if (message.options.runId) {
            getViewportSize(message.options.tabId).then(viewport => {
              const region = parseRegion(message.command.target)
              checkRegion(
                message.options.runId,
                message.options.testId,
                message.options.commandId,
                message.options.tabId,
                message.options.windowId,
                region,
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
          if (!getExternalState().enableVisualCheckpoints) {
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
    if (message.action === 'emit') {
      switch (message.entity) {
        case 'project': {
          const { project } = message
          const hasEyesCommands = project.tests
            .reduce((commands, test) => {
              return [...commands, ...test.commands]
            }, [])
            .find(({ command }) => isEyesCommand(command))
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
            .find(({ command }) => isEyesCommand(command))
          if (hasEyesCommands) {
            return sendResponse({
              beforeAll: `batchName = "${message.suite.name}";`,
              before:
                'global.eyes = new Eyes(serverUrl, configuration.params.eyesDisabled);eyes.setApiKey(apiKey);eyes.setAgentId("eyes.seleniumide.runner");eyes.setBatch(new BatchInfo(batchName, undefined, batchId));if(!eyes._isVisualGrid){eyes.setHideScrollbars(true);eyes.setStitchMode("CSS");}eyes.setBaselineEnvName(configuration.params.eyesBaselineEnvName || null);eyes.setSendDom(configuration.params.eyesDomUploadDisabled ? false : true);if (configuration.params.eyesLogsEnabled) {eyes.setLogHandler(new ConsoleLogHandler(true));}',
              after: 'if (eyes._isOpen) {await eyes.close();}',
            })
          }
          break
        }
        case 'test': {
          const hasEyesCommands = message.test.commands.find(command =>
            isEyesCommand(command.command)
          )
          if (hasEyesCommands) {
            return sendResponse({
              setup: `const _driver = driver;driver = await eyes.open(driver, appName, "${
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
              `await eyes.check("${target}" || (new URL(await driver.getCurrentUrl())).pathname, Target.window().fully(true));`
            )
          } else if (command === CommandIds.CheckRegion) {
            const { x, y, width, height } = parseRegion(target)
            return sendResponse(
              `await eyes.check("${value}" || (new URL(await driver.getCurrentUrl())).pathname, Target.region({left:${x},top:${y},width:${width},height:${height}}));`
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
                  `await eyes.check("${value}" || (new URL(await driver.getCurrentUrl())).pathname, Target.region(${locator}));`
                )
              })
              .catch(console.error) // eslint-disable-line no-console
            return true
          } else if (command === CommandIds.SetMatchLevel) {
            return sendResponse(
              `eyes.setMatchLevel("${
                target === 'Layout' ? 'Layout2' : target
              }");`
            )
          } else if (command === CommandIds.SetMatchTimeout) {
            return sendResponse(`eyes.setMatchTimeout(${target});`)
          } else if (command === CommandIds.SetViewportSize) {
            const { width, height } = parseViewport(target)
            return sendResponse(
              `await eyes.setViewportSize({width: ${width}, height: ${height}});`
            )
          }
        }
      }
    }
    sendResponse(undefined)
  }
)
