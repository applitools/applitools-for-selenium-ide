import { Eyes } from '@applitools/eyes-images'
import { ConsoleLogHandler } from '@applitools/eyes-sdk-core'
import { makeVisualGridClient } from '@applitools/visual-grid-client'
import { parseApiServer } from './parsers.js'
import { browserName } from './userAgent'
import { getCurrentProject } from './ide-project'
import { parseViewport } from './parsers'
import storage from '../../IO/storage'

const DEFAULT_EYES_API_SERVER = 'https://eyesapi.applitools.com'
const eyes = {}
let lastResults = {
  url: '',
  batchId: '',
}

async function makeEyes(batchId, appName, batchName, testName) {
  if (lastResults.batchId !== batchId) {
    lastResults.batchId = batchId
    lastResults.url = ''
  }
  const { apiKey, eyesServer, projectSettings } = await storage.get([
    'apiKey',
    'eyesServer',
    'projectSettings',
  ])
  if (!apiKey) {
    throw new Error(
      'No API key was provided, please set one in the options page'
    )
  }
  const projectId = (await getCurrentProject()).id
  const eyesApiServerUrl = eyesServer ? parseApiServer(eyesServer) : undefined
  const settings = projectSettings[projectId]
  const branch = settings ? settings.branch : ''
  const parentBranch = settings ? settings.parentBranch : ''

  if (settings && settings.enableVisualGrid) {
    return await createVisualGridEyes(
      batchId,
      appName,
      batchName,
      testName,
      eyesApiServerUrl,
      apiKey,
      branch,
      parentBranch,
      settings ? settings.selectedBrowsers : undefined,
      settings ? settings.selectedViewportSizes : undefined
    )
  } else {
    return await createImagesEyes(
      batchId,
      appName,
      batchName,
      testName,
      eyesApiServerUrl,
      apiKey,
      branch,
      parentBranch
    )
  }
}

async function createImagesEyes(
  batchId,
  appName,
  batchName,
  testName,
  eyesServer,
  apiKey,
  branch,
  parentBranch
) {
  const eyes = new Eyes(eyesServer)
  if (process.env.NODE_ENV !== 'production')
    eyes.setLogHandler(new ConsoleLogHandler(true))
  eyes.setApiKey(apiKey)
  eyes.setBranchName(branch)
  eyes.setParentBranchName(parentBranch)
  eyes.setAgentId(`eyes.seleniumide.${browserName.toLowerCase()}`)
  eyes.setInferredEnvironment(`useragent:${navigator.userAgent}`)
  eyes.setBatch(batchName, batchId)
  decorateEyes(eyes)
  await eyes.open(appName, testName)
  return eyes
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
  viewports
) {
  const eyes = await makeVisualGridClient({
    apiKey,
  }).openEyes({
    showLogs: true,
    appName,
    batchName,
    batchId,
    testName,
    branchName,
    parentBranchName,
    serverUrl,
    ignoreCaret: true,
    agentId: `eyes.seleniumide.${browserName.toLowerCase()}`,
    browser: parseBrowsers(browsers, viewports),
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

export function getEyes(id, batchId, appName, batchName, testName) {
  return new Promise((res, rej) => {
    if (!eyes[id]) {
      makeEyes(batchId, appName, batchName, testName)
        .then(eye => {
          eyes[id] = eye
          res(eye)
        })
        .catch(rej)
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
    if (Array.isArray(results) && eye.isVisualGrid) {
      results = results[0]
    }
    // eslint-disable-next-line no-console
    console.log(results)
    results.commands = eye.commands
    // checking the length because we might not necessarily have checkpoints
    lastResults.url =
      results.commands.length &&
      (results._status !== 'Passed' || results._isNew)
        ? results._appUrls._session
        : undefined
    return results
  } catch (e) {
    console.error(e) // eslint-disable-line no-console
    eye.abortIfNotClosed()
  }
}

export function getResultsUrl() {
  return lastResults.url
}

function decorateEyes(eyes) {
  eyes.isVisualGrid = false
  eyes.commands = []
  const setMatchLevel = eyes.setMatchLevel.bind(eyes)
  eyes.setMatchLevel = level => {
    if (level === 'Layout') {
      setMatchLevel('Layout2')
    } else {
      setMatchLevel(level)
    }
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
  eyes.setMatchLevel = level => {
    if (level === 'Layout') {
      eyes.matchLevel = 'Layout2'
    } else {
      eyes.matchLevel = level
    }
  }
  eyes.getServerUrl = () => serverUrl
  eyes.getBranchName = () => branchName
  eyes.getTestName = () => testName
  eyes.getBatch = () => ({ name: batchName })
  eyes.getAppName = () => appName
}

function parseBrowsers(browsers = ['chrome'], viewports = ['1920x1080']) {
  const matrix = []
  browsers.forEach(browser => {
    const name = browser.toLowerCase()
    viewports.forEach(viewport => {
      const { width, height } = parseViewport(viewport)
      matrix.push({
        width,
        height,
        name,
      })
    })
  })
  return matrix
}
