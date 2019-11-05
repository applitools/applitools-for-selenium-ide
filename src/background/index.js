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
  experimentalBrowserWarningMessage,
} from './utils/eyes'
import { parseViewport, parseMatchLevel } from './utils/parsers'
import { setupOptions } from './utils/options.js'
import manifest from '../manifest.json'
import pluginManifest from './plugin-manifest.json'
import { incompleteVisualGridSettings } from './modal-settings'
import { parseBrowsers, isExperimentalBrowser } from './utils/parsers'
import {
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
} from './utils/code-export'

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

function makePlaybackOptions() {
  return {
    useNativeOverride: undefined,
    baselineEnvNameCommand: undefined,
  }
}

let playbackOptions = makePlaybackOptions()

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
              settings.projectSettings.enableVisualGrid &&
              (!settings.isFree && !settings.eulaSignDate) &&
              !hasValidVisualGridSettings(settings.projectSettings)
            ) {
              popup(incompleteVisualGridSettings).then(result => {
                if (result) {
                  playbackOptions.useNativeOverride = true
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
      Object.assign(playbackOptions, message.options)
      if (getExternalState().enableVisualCheckpoints) {
        playbackOptions.baselineEnvNameCommand = commands.find(
          command => command.command === CommandIds.SetBaselineEnvName
        )
        getExtensionSettings()
          .then(settings => {
            if (
              settings.projectSettings.enableVisualGrid &&
              (!settings.isFree && !settings.eulaSignDate) &&
              !hasValidVisualGridSettings(settings.projectSettings)
            ) {
              popup(incompleteVisualGridSettings).then(result => {
                if (result) {
                  playbackOptions.useNativeOverride = true
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
      playbackOptions = makePlaybackOptions()
      return true
    }
    if (message.action === 'execute') {
      switch (message.command.command) {
        case CommandIds.SetBaselineEnvName: {
          // this command gets hoisted
          return sendResponse(true)
        }
        case CommandIds.SetPreRenderHook: {
          getEyes(`${message.options.runId}${message.options.testId}`)
            .then(eyes => {
              if (!eyes.isVisualGrid) {
                return ideLogger.log(
                  "'eyes set pre render screenshot hook' only works on tests run on the Visual Grid."
                )
              } else {
                return eyes.setPreRenderHook(message.command.target)
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
            message.options.assertionsDisabled
          ) {
            return sendResponse(true)
          } else if (
            getExternalState().enableVisualCheckpoints &&
            !!message.options.runId
          ) {
            makeEyes(
              `${playbackOptions.runId}${message.options.originalTestId}`,
              playbackOptions.runId,
              playbackOptions.projectName,
              playbackOptions.suiteName,
              playbackOptions.testName,
              {
                baselineEnvName: playbackOptions.baselineEnvNameCommand
                  ? playbackOptions.baselineEnvNameCommand.target
                  : undefined,
                useNativeOverride: playbackOptions.useNativeOverride,
              }
            ).then(() => {
              getViewportSize(message.options.tabId).then(viewport => {
                checkWindow(
                  message.options.runId,
                  message.options.originalTestId,
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
            message.options.assertionsDisabled
          ) {
            return sendResponse(true)
          } else if (
            getExternalState().enableVisualCheckpoints &&
            message.options.runId
          ) {
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
                makeEyes(
                  `${playbackOptions.runId}${message.options.originalTestId}`,
                  playbackOptions.runId,
                  playbackOptions.projectName,
                  playbackOptions.suiteName,
                  playbackOptions.testName,
                  {
                    baselineEnvName: playbackOptions.baselineEnvNameCommand
                      ? playbackOptions.baselineEnvNameCommand.target
                      : undefined,
                    useNativeOverride: playbackOptions.useNativeOverride,
                  }
                ).then(() => {
                  getViewportSize(message.options.tabId).then(viewport => {
                    checkElement(
                      message.options.runId,
                      message.options.originalTestId,
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
              return sendResponse(emitCheckWindow(message.language, target))
            }
            case 'python-pytest': {
              return sendResponse(
                value
                  ? `self.eyes.check("${value}", Target.window().fully(True))`
                  : `self.eyes.check(urlparse(self.driver.current_url).path, Target.window().fully(True))`
              )
            }
            case 'javascript-mocha': {
              return sendResponse(
                target
                  ? `await eyes.check("${target}", Target.window().webHook(preRenderHook).fully(true))`
                  : `await eyes.check((new URL(await driver.getCurrentUrl())).pathname, Target.window().webHook(preRenderHook).fully(true))`
              )
            }
            case 'ruby-rspec': {
              return sendResponse(
                value
                  ? `@eyes.check("${value}", Applitools::Selenium::Target.window.fully.script_hook(@pre_render_hook))`
                  : `@eyes.check(URI.parse(@driver.current_url).path, Applitools::Selenium::Target.window.fully.script_hook(@pre_render_hook))`
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
                  sendResponse(
                    emitCheckElement(message.language, locator, value)
                  )
                })
                .catch(console.error) // eslint-disable-line no-console
              return true
            }
            case 'python-pytest': {
              sendMessage({
                uri: '/export/location',
                verb: 'get',
                payload: {
                  location: target,
                  language: message.language,
                },
              })
                .then(locator => {
                  let result
                  if (locator.includes('By.CSS')) {
                    const _target = target.replace(/^css=/, '')
                    result = value
                      ? `self.eyes.check("${value}", Target.region("${_target}"))`
                      : `self.eyes.check(urlparse(self.driver.current_url).path, Target.region("${_target}"))`
                  } else {
                    result = value
                      ? `self.eyes.check("${value}", Target.region([${locator}]))`
                      : `self.eyes.check(urlparse(self.driver.current_url).path, Target.region([${locator}]))`
                  }
                  sendResponse(result)
                })
                .catch(console.error) // eslint-disable-line no-console
              return true
            }
            case 'javascript-mocha': {
              sendMessage({
                uri: '/export/location',
                verb: 'get',
                payload: {
                  location: target,
                  language: message.language,
                },
              })
                .then(locator => {
                  sendResponse(
                    value
                      ? `await eyes.check("${value}", Target.region(${locator}).webHook(preRenderHook))`
                      : `await eyes.check((new URL(await driver.getCurrentUrl())).pathname, Target.region(${locator}).webHook(preRenderHook))`
                  )
                })
                .catch(console.error) // eslint-disable-line no-console
              return true
            }
            case 'ruby-rspec': {
              sendMessage({
                uri: '/export/location',
                verb: 'get',
                payload: {
                  location: target,
                  language: message.language,
                },
              })
                .then(locator => {
                  sendResponse(
                    value
                      ? `@eyes.check("${value}", Applitools::Selenium::Target.region(${locator}).script_hook(@pre_render_hook))`
                      : `@eyes.check(URI.parse(@driver.current_url).path, Applitools::Selenium::Target.region(${locator}).script_hook(@pre_render_hook))`
                  )
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
                emitSetViewportSize(message.language, width, height)
              )
            }
            case 'python-pytest': {
              const { width, height } = parseViewport(target)
              return sendResponse(
                `self.eyes.viewport_size = {'width': ${width}, 'height': ${height}}`
              )
            }
            case 'javascript-mocha': {
              const { width, height } = parseViewport(target)
              return sendResponse(
                `await eyes.setViewportSize({ width: ${width}, height: ${height} })`
              )
            }
            case 'ruby-rspec': {
              return sendResponse(true)
            }
          }
        } else if (command === CommandIds.SetMatchLevel) {
          switch (message.language) {
            case 'java-junit': {
              return sendResponse(emitSetMatchLevel(message.language, target))
            }
            case 'python-pytest': {
              return sendResponse(
                `self.eyes.match_level("${parseMatchLevel(target)}")`
              )
            }
            case 'javascript-mocha': {
              return sendResponse(
                `await eyes.setMatchLevel("${parseMatchLevel(target)}");`
              )
            }
            case 'ruby-rspec': {
              return sendResponse(
                `@eyes.match_level("${parseMatchLevel(target)}")`
              )
            }
          }
        } else if (command === CommandIds.SetMatchTimeout) {
          switch (message.language) {
            case 'java-junit': {
              return sendResponse(emitSetMatchTimeout(message.language, target))
            }
            case 'python-pytest': {
              return sendResponse(`self.eyes.match_timeout(${target})`)
            }
            case 'javascript-mocha': {
              return sendResponse(`eyes.setMatchTimeout(${target})`)
            }
            case 'ruby-rspec': {
              return sendResponse(`@eyes.match_timeout(${target})`)
            }
          }
        } else if (command === CommandIds.SetPreRenderHook) {
          switch (message.language) {
            case 'java-junit': {
              getExtensionSettings().then(settings => {
                const isVisualGridEnabled =
                  settings.projectSettings.enableVisualGrid
                return sendResponse(
                  emitSetPreRenderHook(message.language, target, {
                    isVisualGridEnabled,
                  })
                )
              })
              return true
            }
            case 'python-pytest': {
              //getExtensionSettings().then(settings => {
              //  let result = ''
              //  if (settings.projectSettings.enableVisualGrid)
              //    result += target
              //      ? `self.pre_render_hook = "${target}"`
              //      : `self.pre_render_hook = ""`
              //  return sendResponse(result)
              //})
              return sendResponse('')
            }
            case 'javascript-mocha': {
              getExtensionSettings().then(settings => {
                let result = ''
                if (settings.projectSettings.enableVisualGrid)
                  result += target
                    ? `preRenderHook = "${target}"`
                    : `preRenderHook = ""`
                return sendResponse(result)
              })
              return true
            }
            case 'ruby-rspec': {
              getExtensionSettings().then(settings => {
                let result = ''
                if (settings.projectSettings.enableVisualGrid)
                  result += target
                    ? `@pre_render_hook = '${target}'`
                    : `@pre_render_hook = ''`
                return sendResponse(result)
              })
              return true
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
                getExtensionSettings().then(settings => {
                  const isVisualGridEnabled =
                    settings.projectSettings.enableVisualGrid
                  return sendResponse(
                    emitAfterEach(message.language, { isVisualGridEnabled })
                  )
                })
                return true
              }
              case 'python-pytest': {
                getExtensionSettings().then(settings => {
                  if (settings.projectSettings.enableVisualGrid) {
                    return sendResponse(`self.vg_runner.get_all_test_results()`)
                  } else {
                    return sendResponse(`self.eyes.abort_if_not_closed()`)
                  }
                })
                return true
              }
              case 'javascript-mocha': {
                getExtensionSettings().then(settings => {
                  let result = ''
                  if (settings.projectSettings.enableVisualGrid) {
                    result += `const results = await eyes.getRunner().getAllTestResults()\n`
                    result += `console.log(results)\n`
                  }
                  result += `eyes.abortIfNotClosed()`
                  return sendResponse(result)
                })
                return true
              }
              case 'ruby-rspec': {
                getExtensionSettings().then(settings => {
                  if (settings.projectSettings.enableVisualGrid) {
                    return sendResponse(
                      `@visual_grid_runner.get_all_test_results`
                    )
                  } else {
                    return sendResponse(`@eyes.abort_if_not_closed`)
                  }
                })
                return true
              }
            }
            break
          }
          case 'beforeEach': {
            switch (message.language) {
              case 'java-junit': {
                const commands = message.options.tests
                  ? message.options.tests.reduce(
                      (_commands, test) => [...test.commands],
                      []
                    )
                  : []
                const baselineEnvNameCommand = commands.find(
                  command => command.command === CommandIds.SetBaselineEnvName
                )
                const baselineEnvName = baselineEnvNameCommand
                  ? baselineEnvNameCommand.target
                  : undefined
                getExtensionSettings().then(settings => {
                  let visualGridOptions
                  if (settings.projectSettings.enableVisualGrid) {
                    const browsers = parseBrowsers(
                      settings.projectSettings.selectedBrowsers,
                      settings.projectSettings.selectedViewportSizes,
                      settings.projectSettings.selectedDevices,
                      settings.projectSettings.selectedDeviceOrientations
                    )
                    visualGridOptions = [...browsers.matrix]
                  }
                  return sendResponse(
                    emitBeforeEach(
                      message.language,
                      message.options.project.name,
                      message.options.name,
                      { baselineEnvName, visualGridOptions }
                    )
                  )
                })
                return true
              }
              case 'python-pytest': {
                let result = ''
                //result += 'self.pre_render_hook = ""\n'
                const commands = message.options.tests
                  ? message.options.tests.reduce(
                      (_commands, test) => [...test.commands],
                      []
                    )
                  : []
                const baselineEnvNameCommand = commands.find(
                  command => command.command === CommandIds.SetBaselineEnvName
                )
                getExtensionSettings().then(settings => {
                  if (settings.projectSettings.enableVisualGrid) {
                    result += `concurrency = 10\n`
                    result += `self.vg_runner = VisualGridRunner(concurrency)\n`
                    result += `self.eyes = Eyes(self.vg_runner)\n`
                    result += `config = Configuration()`
                    const _browsers = parseBrowsers(
                      settings.projectSettings.selectedBrowsers,
                      settings.projectSettings.selectedViewportSizes,
                      settings.projectSettings.selectedDevices,
                      settings.projectSettings.selectedDeviceOrientations
                    )
                    let browsers = [..._browsers.matrix]
                    if (!settings.experimentalEnabled) {
                      browsers = browsers.filter(
                        b => !isExperimentalBrowser(b.name)
                      )
                    }
                    let isExperimentalBrowserWarningDisplayed = false
                    browsers.forEach(browser => {
                      if (browser.deviceName) {
                        result += `\nconfig.add_device_emulation(DeviceName.${
                          browser.deviceId
                        }, ScreenOrientation.${browser.screenOrientation.toUpperCase()})`
                      } else if (
                        settings.experimentalEnabled &&
                        isExperimentalBrowser(browser.name) &&
                        _browsers.didRemoveResolution &&
                        !isExperimentalBrowserWarningDisplayed
                      ) {
                        result += `\n// ${experimentalBrowserWarningMessage}`
                        isExperimentalBrowserWarningDisplayed = true
                      } else {
                        const browserId = browser.id
                          ? browser.id
                          : browser.name.toUpperCase()
                        result += `\nconfig.add_browser(${browser.width}, ${browser.height}, BrowserType.${browserId})`
                      }
                    })
                    result += `\nself.eyes.configuration = config`
                  } else {
                    result += `self.eyes = Eyes()`
                  }
                  result += `\nself.eyes.api_key = os.environ["APPLITOOLS_API_KEY"]`
                  if (baselineEnvNameCommand) {
                    result += `\neyes.baseline_env_name = "${baselineEnvNameCommand.target}"`
                  }
                  result += `\nself.eyes.open(self.driver, "${message.options.project.name}", "${message.options.name}")`
                  return sendResponse(result)
                })
                return true
              }
              case 'javascript-mocha': {
                let result = ''
                result += `preRenderHook = ""\n`
                const commands = message.options.tests
                  ? message.options.tests.reduce(
                      (_commands, test) => [...test.commands],
                      []
                    )
                  : []
                const baselineEnvNameCommand = commands.find(
                  command => command.command === CommandIds.SetBaselineEnvName
                )
                getExtensionSettings().then(settings => {
                  if (settings.projectSettings.enableVisualGrid) {
                    result += `eyes = new Eyes(new VisualGridRunner())\n`
                    result += `const config = new Configuration()\n`
                    result += 'config.setConcurrentSessions(10)'
                    const _browsers = parseBrowsers(
                      settings.projectSettings.selectedBrowsers,
                      settings.projectSettings.selectedViewportSizes,
                      settings.projectSettings.selectedDevices,
                      settings.projectSettings.selectedDeviceOrientations
                    )
                    let browsers = [..._browsers.matrix]
                    if (!settings.experimentalEnabled) {
                      browsers = browsers.filter(
                        b => !isExperimentalBrowser(b.name)
                      )
                    }
                    let isExperimentalBrowserWarningDisplayed = false
                    browsers.forEach(browser => {
                      if (browser.deviceName) {
                        result += `\nconfig.addDeviceEmulation(DeviceName.${
                          browser.deviceId
                        }, ScreenOrientation.${browser.screenOrientation.toUpperCase()})`
                      } else if (
                        settings.experimentalEnabled &&
                        isExperimentalBrowser(browser.name) &&
                        _browsers.didRemoveResolution &&
                        !isExperimentalBrowserWarningDisplayed
                      ) {
                        result += `\n// ${experimentalBrowserWarningMessage}`
                        isExperimentalBrowserWarningDisplayed = true
                      } else {
                        const browserId = browser.id
                          ? browser.id
                          : browser.name.toUpperCase()
                        result += `\nconfig.addBrowser(${browser.width}, ${browser.height}, BrowserType.${browserId})`
                      }
                    })
                    result += `\neyes.setConfiguration(config)`
                  } else {
                    result += `eyes = new Eyes()`
                  }
                  result += `\neyes.setApiKey(process.env["APPLITOOLS_API_KEY"])`
                  if (baselineEnvNameCommand) {
                    result += `\neyes.setBaselineEnvName("${baselineEnvNameCommand.target}")`
                  }
                  result += `\nawait eyes.open(driver, "${message.options.project.name}", "${message.options.name}")`
                  return sendResponse(result)
                })
                return true
              }
              case 'ruby-rspec': {
                let result = ''
                result += `@pre_render_hook = ''\n`
                const commands = message.options.tests
                  ? message.options.tests.reduce(
                      (_commands, test) => [...test.commands],
                      []
                    )
                  : []
                const baselineEnvNameCommand = commands.find(
                  command => command.command === CommandIds.SetBaselineEnvName
                )
                let setViewportSizeCommand = commands.find(
                  command => command.command === CommandIds.SetViewportSize
                )
                setViewportSizeCommand = setViewportSizeCommand
                  ? setViewportSizeCommand
                  : { target: '1024x768' }
                getExtensionSettings().then(settings => {
                  if (settings.projectSettings.enableVisualGrid) {
                    result += `@visual_grid_runner = Applitools::Selenium::VisualGridRunner.new(10)\n`
                    result += `@eyes = Applitools::Selenium::Eyes.new(visual_grid_runner: @visual_grid_runner)\n`
                    result += `config = Applitools::Selenium::Configuration.new.tap do |c|\n`
                    result += `  c.api_key = ENV['APPLITOOLS_API_KEY']\n`
                    result += `  c.app_name = '${message.options.project.name}'\n`
                    result += `  c.test_name = '${message.options.name}'\n`
                    result += `  c.viewport_size = Applitools::RectangleSize.for('${setViewportSizeCommand.target}')`
                    if (baselineEnvNameCommand)
                      result += `\n  c.baseline_env_name = '${baselineEnvNameCommand.target}'`
                    const _browsers = parseBrowsers(
                      settings.projectSettings.selectedBrowsers,
                      settings.projectSettings.selectedViewportSizes,
                      settings.projectSettings.selectedDevices,
                      settings.projectSettings.selectedDeviceOrientations
                    )
                    let browsers = [..._browsers.matrix]
                    if (!settings.experimentalEnabled) {
                      browsers = browsers.filter(
                        b => !isExperimentalBrowser(b.name)
                      )
                    }
                    let isExperimentalBrowserWarningDisplayed = false
                    browsers.forEach(browser => {
                      if (browser.deviceName) {
                        let deviceName = browser.deviceId.replace(/_/g, '')
                        result += `\n  c.add_device_emulation(Devices::${deviceName
                          .charAt(0)
                          .toUpperCase() +
                          deviceName.substring(
                            1
                          )}, Orientations::${browser.screenOrientation.toUpperCase()})`
                      } else if (
                        settings.experimentalEnabled &&
                        isExperimentalBrowser(browser.name) &&
                        _browsers.didRemoveResolution &&
                        !isExperimentalBrowserWarningDisplayed
                      ) {
                        result += `\n# ${experimentalBrowserWarningMessage}`
                        isExperimentalBrowserWarningDisplayed = true
                      } else {
                        const browserId = browser.id
                          ? browser.id
                          : browser.name.toUpperCase()
                        result += `\n  c.add_browser(${browser.width}, ${browser.height}, BrowserTypes::${browserId})`
                      }
                    })
                    result += `\nend`
                    result += `\n@eyes.config = config`
                    result += `\n@eyes.open(driver: @driver)`
                  } else {
                    result += `@eyes = Applitools::Selenium::Eyes.new`
                    result += `\n@eyes.api_key = ENV['APPLITOOLS_API_KEY']`
                    if (baselineEnvNameCommand)
                      result += `\n@eyes.baseline_env_name = '${baselineEnvNameCommand.target}'`
                    result += `\n@eyes.open(driver: @driver, app_name: '${message.options.project.name}', test_name: '${message.options.name}', viewport_size: '${setViewportSizeCommand.target}')`
                  }
                  return sendResponse(result)
                })
                return true
              }
            }
            break
          }
          case 'dependency': {
            switch (message.language) {
              case 'java-junit': {
                getExtensionSettings().then(settings => {
                  const isVisualGridEnabled =
                    settings.projectSettings.enableVisualGrid
                  return sendResponse(
                    emitDependency(message.language, { isVisualGridEnabled })
                  )
                })
                return true
              }
              case 'python-pytest': {
                let result = `import os\nfrom urllib.parse import urlparse\nfrom applitools.selenium import (Eyes, Target)\n`
                getExtensionSettings().then(settings => {
                  if (settings.projectSettings.enableVisualGrid) {
                    result += `from applitools.selenium import (Configuration, BrowserType, DeviceName, ScreenOrientation)\nfrom applitools.selenium.visual_grid import VisualGridRunner\n`
                  }
                  return sendResponse(result)
                })
                return true
              }
              case 'javascript-mocha': {
                let result = `const { Eyes, Target } = require('@applitools/eyes-selenium')`
                getExtensionSettings().then(settings => {
                  if (settings.projectSettings.enableVisualGrid) {
                    result += `\nconst { Configuration, VisualGridRunner, BrowserType, DeviceName, ScreenOrientation } = require('@applitools/eyes-selenium')`
                  }
                  return sendResponse(result)
                })
                return true
              }
              case 'ruby-rspec': {
                return sendResponse("require 'eyes_selenium'")
              }
            }
            break
          }
          case 'inEachEnd': {
            switch (message.language) {
              case 'java-junit': {
                getExtensionSettings().then(settings => {
                  const isVisualGridEnabled =
                    settings.projectSettings.enableVisualGrid
                  return sendResponse(
                    emitInEachEnd(message.language, { isVisualGridEnabled })
                  )
                })
                return true
              }
              case 'python-pytest': {
                getExtensionSettings().then(settings => {
                  if (settings.projectSettings.enableVisualGrid) {
                    return sendResponse(`self.eyes.close_async()`)
                  } else {
                    return sendResponse(`self.eyes.close()`)
                  }
                })
                return true
              }
              case 'javascript-mocha': {
                getExtensionSettings().then(settings => {
                  if (!settings.projectSettings.enableVisualGrid) {
                    return sendResponse(`await eyes.close()`)
                  } else {
                    return sendResponse(undefined)
                  }
                })
                return true
              }
              case 'ruby-rspec': {
                return sendResponse(`@eyes.close(false)`)
              }
            }
            break
          }
          case 'variable': {
            switch (message.language) {
              case 'java-junit': {
                getExtensionSettings().then(settings => {
                  const isVisualGridEnabled =
                    settings.projectSettings.enableVisualGrid
                  return sendResponse(
                    emitVariable(message.language, { isVisualGridEnabled })
                  )
                })
                return true
              }
              case 'javascript-mocha': {
                return sendResponse(`let eyes\nlet preRenderHook`)
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
            `const { Eyes, Target } = require('@applitools/eyes-selenium');global.Target = Target;const { ConsoleLogHandler, BatchInfo } = require('@applitools/eyes-sdk-core');let apiKey = process.env.APPLITOOLS_API_KEY, serverUrl = process.env.APPLITOOLS_SERVER_URL, appName = "${message.project.name}", batchId = configuration.runId, batchName;`
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
              before: `global.eyes = Eyes.fromBrowserInfo(serverUrl, configuration.params.eyesDisabled, configuration.params.eyesRendering ? { browser: configuration.params.eyesRendering } : undefined);eyes.setApiKey(apiKey);eyes.getBaseAgentId = () => ("eyes.seleniumide.runner ${manifest.version} " + (eyes._isVisualGrid ? "visualgrid" : "local"));eyes.setAgentId("eyes.seleniumide.runner ${manifest.version} " + (eyes._isVisualGrid ? "visualgrid" : "local"));eyes.setBatch(new BatchInfo(batchName, undefined, batchId));if(!eyes._isVisualGrid){eyes.setHideScrollbars(true);eyes.setStitchMode("CSS");}eyes.setSendDom(configuration.params.eyesDomUploadEnabled === undefined ? true : configuration.params.eyesDomUploadEnabled);if (configuration.params.eyesLogsEnabled) {eyes.setLogHandler(new ConsoleLogHandler(true));}`,
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
              baselineEnvName = `eyes.setBaselineEnvName("${baselineEnvNameCommand.target}" || null);`
            }
            return sendResponse({
              setup: `${baselineEnvName}const _driver = driver;driver = await eyes.open(driver, appName, "${message.test.name}");global.preRenderHook = "";`,
              teardown: 'driver = _driver;',
            })
          }
          break
        }
        case 'command': {
          const { command, target, value } = message.command // eslint-disable-line no-unused-vars
          if (command === CommandIds.CheckWindow) {
            return sendResponse(
              `if (!opts.isNested) {await eyes.check("${target}" || (new URL(await driver.getCurrentUrl())).pathname, Target.window().webHook(preRenderHook).accessibilityLevel(configuration.params.eyesAccessibilityLevel || "None").fully(true));}`
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
                  `if (!opts.isNested) {await driver.wait(until.elementLocated(${locator}), configuration.timeout); await eyes.check("${value}" || (new URL(await driver.getCurrentUrl())).pathname, Target.region(${locator}).webHook(preRenderHook).accessibilityLevel(configuration.params.eyesAccessibilityLevel || "None"));}`
                )
              })
              .catch(console.error) // eslint-disable-line no-console
            return true
          } else if (command === CommandIds.SetPreRenderHook) {
            return sendResponse(
              `if (eyes._isVisualGrid) preRenderHook = "${target}"`
            )
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
