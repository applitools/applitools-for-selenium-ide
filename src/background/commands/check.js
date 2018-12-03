import browser from 'webextension-polyfill'
import Modes from '../../commons/modes'
import { sendMessage } from '../../IO/message-port'
import { getScreenshot, getRegionScreenshot } from '../utils/screenshot'
import { getEyes, closeEyes, promiseFactory } from '../utils/eyes'
import { getExternalState, setExternalState } from '../external-state'
import { parseEnvironment } from '../utils/parsers'
import ideLogger from '../utils/ide-logger'
import { getDomCapture } from '../dom-capture'
import { ImageProvider, MutableImage } from '@applitools/eyes-sdk-core'
import { Target } from '@applitools/eyes-images'

const imageProvider = new ImageProvider()

export async function checkWindow(
  runId,
  testId,
  commandId,
  tabId,
  _windowId,
  stepName,
  viewport
) {
  return new Promise((resolve, reject) => {
    getEyes(`${runId}${testId}`)
      .then(eyes => {
        preCheck(eyes, viewport).then(() => {
          getTabPathname(tabId).then(async pathname => {
            eyes.commands.push(commandId)
            eyes.setViewportSize(viewport)
            imageProvider.getImage = () => {
              return getScreenshot(tabId).then(image => {
                return new MutableImage(image.data, promiseFactory)
              })
            }

            const domCap = await getDomCapture(tabId)

            eyes
              .check(
                stepName || pathname,
                Target.image(imageProvider).withDom(domCap)
              )
              .then(imageResult => {
                return imageResult.asExpected
                  ? resolve(true)
                  : resolve({ status: 'undetermined' })
              })
              .catch(reject)
          })
        })
      })
      .catch(reject)
  })
}

export async function checkRegion(
  runId,
  testId,
  commandId,
  tabId,
  _windowId,
  region,
  stepName,
  viewport
) {
  if (!region || !region.x || !region.y || !region.width || !region.height)
    return Promise.reject(
      'Invalid region. Region should be x: [number], y: [number], width: [number], height: [number]'
    )
  return new Promise((resolve, reject) => {
    getEyes(`${runId}${testId}`)
      .then(eyes => {
        preCheck(eyes, viewport).then(() => {
          getTabPathname(tabId).then(async pathname => {
            eyes.commands.push(commandId)
            eyes.setViewportSize(viewport)
            imageProvider.getImage = () => {
              return getRegionScreenshot(tabId, region).then(image => {
                return new MutableImage(image.data, promiseFactory)
              })
            }

            const domCap = await getDomCapture(tabId)

            eyes
              .check(
                stepName || pathname,
                Target.image(imageProvider).withDom(domCap)
              )
              .then(imageResult => {
                return imageResult.asExpected
                  ? resolve(true)
                  : resolve({ status: 'undetermined' })
              })
              .catch(reject)
          })
        })
      })
      .catch(reject)
  })
}

export async function checkElement(
  runId,
  testId,
  commandId,
  tabId,
  _windowId,
  elementXPath,
  stepName,
  viewport
) {
  return new Promise((resolve, reject) => {
    getEyes(`${runId}${testId}`)
      .then(eyes => {
        preCheck(eyes, viewport).then(() => {
          getTabPathname(tabId).then(pathname => {
            eyes.commands.push(commandId)
            eyes.setViewportSize(viewport)
            browser.tabs
              .sendMessage(tabId, {
                getElementRect: true,
                path: elementXPath,
              })
              .then(async rect => {
                imageProvider.getImage = () => {
                  return getRegionScreenshot(tabId, rect).then(image => {
                    return new MutableImage(image.data, promiseFactory)
                  })
                }

                const domCap = await getDomCapture(tabId)

                eyes
                  .check(
                    stepName || pathname,
                    Target.image(imageProvider).withDom(domCap)
                  )
                  .then(imageResult => {
                    return imageResult.asExpected
                      ? resolve(true)
                      : resolve({ status: 'undetermined' })
                  })
                  .catch(reject)
              })
          })
        })
      })
      .catch(reject)
  })
}

export function endTest(id) {
  return closeEyes(id).then(results => {
    console.log(results)
    return Promise.all(
      results.commands.map((commandId, index) =>
        sendMessage({
          uri: '/playback/command',
          verb: 'post',
          payload: {
            commandId,
            state: results.stepsInfo[index].isDifferent ? 'failed' : 'passed',
          },
        })
      )
    ).then(commandStates => {
      console.log(commandStates)
      return results.status === 'Passed'
        ? {
            message: `All visual tests have passed,\nresults: ${
              results.appUrls.session
            }`,
          }
        : {
            error: `Diffs were found in visual tests,\nresults: ${
              results.appUrls.session
            }`,
          }
    })
  })
}

function preCheck(eyes, viewport) {
  if (getExternalState().mode !== Modes.PLAYBACK) {
    let notification = `connecting to ${eyes.getServerUrl()}`
    if (eyes.getBranchName()) {
      notification += `, running on branch ${eyes.getBranchName()}`
    }
    return ideLogger.log(notification).then(() => {
      return setExternalState({
        mode: Modes.PLAYBACK,
        playback: {
          testName: eyes._testName,
          startTime: new Date().toString(),
          hasFailed: false,
          batchName: eyes._batch.name || eyes._testName,
          appName: eyes._appName,
          eyesServer: eyes._serverUrl,
          environment: parseEnvironment(navigator.userAgent, viewport),
          branch: eyes.getBranchName(),
        },
      })
    })
  } else {
    return Promise.resolve()
  }
}

function getTabPathname(tab) {
  return browser.tabs.get(tab).then(data => new URL(data.url).pathname)
}
