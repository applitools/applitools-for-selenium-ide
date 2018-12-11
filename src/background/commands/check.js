import browser from 'webextension-polyfill'
import Modes from '../../commons/modes'
import { sendMessage } from '../../IO/message-port'
import { getEyes, closeEyes } from '../utils/eyes'
import { getExternalState, setExternalState } from '../external-state'
import { parseEnvironment } from '../utils/parsers'
import ideLogger from '../utils/ide-logger'
import { getDomCapture } from '../dom-capture'
import { ImageProvider } from '@applitools/eyes-sdk-core'
import { Target } from '@applitools/eyes-images'
import {
  buildCheckWindowFullFunction,
  buildCheckRegionFunction,
} from '../image-strategies/css-stitching'

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
  const eyes = await getEyes(`${runId}${testId}`)
  return await check(
    eyes,
    commandId,
    tabId,
    stepName,
    viewport,
    buildCheckWindowFullFunction(eyes, tabId, window.devicePixelRatio)
  )
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
    throw new Error(
      'Invalid region. Region should be x: [number], y: [number], width: [number], height: [number]'
    )
  const eyes = await getEyes(`${runId}${testId}`)
  return await check(
    eyes,
    commandId,
    tabId,
    stepName,
    viewport,
    buildCheckRegionFunction(eyes, tabId, window.devicePixelRatio, region)
  )
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
  const eyes = await getEyes(`${runId}${testId}`)
  const rect = await browser.tabs.sendMessage(tabId, {
    getElementRect: true,
    path: elementXPath,
  })
  return await check(
    eyes,
    commandId,
    tabId,
    stepName,
    viewport,
    buildCheckRegionFunction(eyes, tabId, window.devicePixelRatio, rect)
  )
}

async function check(
  eyes,
  commandId,
  tabId,
  stepName,
  viewport,
  checkFunction
) {
  await preCheck(eyes, viewport)
  eyes.commands.push(commandId)
  eyes.setViewportSize(viewport)

  imageProvider.getImage = checkFunction
  const domCap = await getDomCapture(tabId)

  let pathname
  if (!stepName) {
    pathname = await getTabPathname(tabId)
  }

  const target = Target.image(imageProvider)
  const imageResult = await eyes.check(
    stepName || pathname,
    domCap ? target.withDom(domCap) : target
  )
  return imageResult ? true : { status: 'undetermined' }
}

export function endTest(id) {
  return closeEyes(id).then(results => {
    // eslint-disable-next-line
    console.log(results)
    return Promise.all(
      results.commands.map((commandId, index) =>
        sendMessage({
          uri: '/playback/command',
          verb: 'post',
          payload: {
            commandId,
            state: results._stepsInfo[index]._isDifferent ? 'failed' : 'passed',
          },
        })
      )
    ).then(commandStates => {
      // eslint-disable-next-line
      console.log(commandStates)
      return results._status === 'Passed'
        ? {
            message: `All visual tests have passed,\nresults: ${
              results._appUrls._session
            }`,
          }
        : {
            error: `Diffs were found in visual tests,\nresults: ${
              results._appUrls._session
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
