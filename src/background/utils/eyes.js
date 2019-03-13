import { Eyes } from '@applitools/eyes-images'
import { ConsoleLogHandler } from '@applitools/eyes-sdk-core'
import { makeVisualGridClient } from '@applitools/visual-grid-client'
import { parseApiServer } from './parsers.js'
import { browserName } from './userAgent'
import { getCurrentProject } from './ide-project'
import { parseBrowsers, parseMatchLevel } from './parsers'
import storage from '../../IO/storage'

const DEFAULT_EYES_API_SERVER = 'https://eyesapi.applitools.com'
const eyes = {}
let lastResults = {
  url: '',
  batchId: '',
}

function createDefaultSettings() {
  return {
    enableVisualGrid: false,
  }
}

export async function getExtensionSettings() {
  const {
    apiKey,
    eyesServer,
    projectSettings,
    eulaSignDate,
    isFree,
  } = await storage.get([
    'apiKey',
    'eyesServer',
    'projectSettings',
    'eulaSignDate',
    'isFree',
  ])
  const { id } = await getCurrentProject()
  let settings = projectSettings && projectSettings[id]
  if (!settings) {
    settings = createDefaultSettings()
  }
  return { apiKey, eyesServer, projectSettings: settings, isFree, eulaSignDate }
}

export async function makeEyes(
  id,
  batchId,
  appName,
  batchName,
  testName,
  options = {}
) {
  if (lastResults.batchId !== batchId) {
    lastResults.batchId = batchId
    lastResults.url = ''
  }
  const settings = await getExtensionSettings()
  if (!settings.apiKey) {
    throw new Error(
      'No API key was provided, please set one in the options page'
    )
  }
  const eyesApiServerUrl = settings.eyesServer
    ? parseApiServer(settings.eyesServer)
    : undefined
  const branch = (settings ? settings.projectSettings.branch : '') || ''
  const parentBranch =
    (settings ? settings.projectSettings.parentBranch : '') || ''
  let eye

  if (settings.projectSettings.enableVisualGrid && !options.useNativeOverride) {
    eye = await createVisualGridEyes(
      batchId,
      appName,
      batchName,
      testName,
      eyesApiServerUrl,
      settings.apiKey,
      branch,
      parentBranch,
      settings.projectSettings
        ? settings.projectSettings.selectedBrowsers
        : undefined,
      settings.projectSettings
        ? settings.projectSettings.selectedViewportSizes
        : undefined,
      settings.projectSettings
        ? settings.projectSettings.selectedDevices
        : undefined,
      settings.projectSettings
        ? settings.projectSettings.selectedDeviceOrientations
        : undefined,
      options.baselineEnvName,
      settings.isFree,
      settings.eulaSignDate
    )
  } else {
    eye = await createImagesEyes(
      batchId,
      appName,
      batchName,
      testName,
      eyesApiServerUrl,
      settings.apiKey,
      branch,
      parentBranch,
      options.baselineEnvName
    )
  }
  eyes[id] = eye
  return eye
}

async function createImagesEyes(
  batchId,
  appName,
  batchName,
  testName,
  eyesServer,
  apiKey,
  branch,
  parentBranch,
  baselineEnvName
) {
  const eyes = new Eyes(eyesServer)
  if (process.env.NODE_ENV !== 'production')
    eyes.setLogHandler(new ConsoleLogHandler(true))
  eyes.setApiKey(apiKey)
  eyes.setBranchName(branch)
  eyes.setParentBranchName(parentBranch)
  eyes.getBaseAgentId = () => `eyes.seleniumide.${browserName.toLowerCase()}`
  eyes.setAgentId(`eyes.seleniumide.${browserName.toLowerCase()}`)
  eyes.setInferredEnvironment(`useragent:${navigator.userAgent}`)
  eyes.setBatch(batchName, batchId)
  if (baselineEnvName) eyes.setBaselineEnvName(baselineEnvName)
  decorateEyes(eyes)
  await eyes.open(appName, testName)
  return eyes
}

export function hasValidVisualGridSettings(settings) {
  if (!settings) return false
  if (
    settings.selectedBrowsers ||
    settings.selectedViewportSizes ||
    settings.selectedDevices ||
    settings.selectedDeviceOrientations
  ) {
    // projectSettings object passed in,
    // assign values to the correct keys
    settings.browsers = settings.selectedBrowsers
    settings.viewports = settings.selectedViewportSizes
    settings.devices = settings.selectedDevices
    settings.orientations = settings.selectedDeviceOrientations
  }
  let count = [
    settings.browsers ? !!settings.browsers.length : false,
    settings.viewports ? !!settings.viewports.length : false,
    settings.devices ? !!settings.devices.length : false,
    settings.orientations ? !!settings.orientations.length : false,
  ]
  switch (count.join()) {
    case 'true,true,false,false':
    case 'false,false,true,true':
    case 'true,true,true,true':
      return true
    default:
      return false
  }
}

async function createVisualGridEyes(
  batchId,
  appName,
  batchName,
  testName,
  serverUrl,
  apiKey,
  branchName,
  parentBranchName,
  browsers,
  viewports,
  devices,
  orientations,
  baselineEnvName,
  isFree,
  eulaSignDate
) {
  if (
    (!isFree && !eulaSignDate) ||
    !hasValidVisualGridSettings({
      browsers,
      viewports,
      devices,
      orientations,
    })
  )
    throw new Error('Incomplete visual grid settings')
  const eyes = await makeVisualGridClient({
    apiKey,
    serverUrl,
    agentId: `eyes.seleniumide.${browserName.toLowerCase()}`,
  }).openEyes({
    showLogs: true,
    appName,
    batchName,
    batchId,
    testName,
    branchName,
    parentBranchName,
    ignoreCaret: true,
    browser: parseBrowsers(browsers, viewports, devices, orientations),
    baselineEnvName,
  })
  decorateVisualEyes(
    eyes,
    batchId,
    appName,
    batchName,
    testName,
    serverUrl,
    apiKey,
    branchName,
    parentBranchName
  )
  window.e = eyes
  return eyes
}

export function hasEyes(id) {
  return !!eyes[id]
}

export function getEyes(id) {
  return new Promise((res, rej) => {
    if (!eyes[id]) {
      rej('No eyes session found')
    } else {
      res(eyes[id])
    }
  })
}

export async function closeEyes(id) {
  const eye = eyes[id]
  eyes[id] = undefined

  try {
    let results = await eye.close(false)
    // set it to the results in the hopes that it isn't a visual grid result
    let firstFailingResultOrLast = results,
      found = false
    // get the first failing test if available from visual grid
    if (Array.isArray(results) && eye.isVisualGrid) {
      for (let i = 0; i < results.length; i++) {
        let result = results[i]
        if (result._status !== 'Passed' || result._isNew) {
          firstFailingResultOrLast = result
          found = true
          break
        }
      }
      // set it to the first test since none failed
      if (!found) firstFailingResultOrLast = results[0]
    }
    // eslint-disable-next-line no-console
    console.log(results)
    // checking the length because we might not necessarily have checkpoints
    lastResults.url =
      eye.commands.length &&
      (firstFailingResultOrLast._status !== 'Passed' ||
        firstFailingResultOrLast._isNew)
        ? firstFailingResultOrLast._appUrls._session
        : lastResults.url
    return { results, firstFailingResultOrLast }
  } catch (e) {
    await eye.abortIfNotClosed().catch(e => {
      // eslint-disable-next-line no-console
      console.error(e)
    })
    throw e
  }
}

export function getResultsUrl() {
  return lastResults.url
}

export function getCommandsForEyes(id) {
  return eyes[id] ? eyes[id].commands : undefined
}

function decorateEyes(eyes) {
  eyes.isVisualGrid = false
  eyes.commands = []
  const setMatchLevel = eyes.setMatchLevel.bind(eyes)
  eyes.setMatchLevel = level => {
    verifyMatchLevel(level)
    setMatchLevel(parseMatchLevel(level))
  }
}

function decorateVisualEyes(
  eyes,
  _batchId,
  appName,
  batchName,
  testName,
  serverUrl = DEFAULT_EYES_API_SERVER,
  _apiKey,
  branchName,
  _parentBranchName
) {
  eyes.isVisualGrid = true
  eyes.commands = []
  eyes.getMatchLevel = () => eyes.matchLevel
  eyes.setMatchLevel = level => {
    verifyMatchLevel(level)
    eyes.matchLevel = parseMatchLevel(level)
  }
  eyes.getServerUrl = () => serverUrl
  eyes.getBranchName = () => branchName
  eyes.getTestName = () => testName
  eyes.getBatch = () => ({ name: batchName })
  eyes.getAppName = () => appName
  eyes.abortIfNotClosed = eyes.abort
}

function verifyMatchLevel(level) {
  if (!/^(Layout|Content|Strict|Exact)$/i.test(level)) {
    throw new Error(
      'Match level must be one of: Exact, Strict, Content or Layout.'
    )
  }
}
