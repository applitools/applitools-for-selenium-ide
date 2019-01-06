import UAParser from 'ua-parser-js'
const parser = new UAParser()

export function parseBrowsers(
  _browsers = [{ name: 'chrome', type: 'browser' }],
  viewports = ['1920x1080'],
  orientations
) {
  const browsers = parseBrowserNames(_browsers)
  const devices = parseDeviceNames(_browsers)
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
  devices.forEach(device => {
    orientations.forEach(orientation => {
      matrix.push({
        screenOrientation: orientation.toLowerCase(),
        deviceName: device,
      })
    })
  })
  return matrix
}

export function parseViewport(vp) {
  const [width, height] = vp.split('x').map(s => parseInt(s))
  return { width, height }
}

function parseBrowserNames(browsers) {
  return browsers.filter(b => b.type === 'browser').map(b => b.name)
}

function parseDeviceNames(browsers) {
  return browsers.filter(b => b.type === 'device').map(b => b.name)
}

export function parseRegion(region) {
  const x = +(region.match(/x:\s*(\d*)/) || [])[1]
  const y = +(region.match(/y:\s*(\d*)/) || [])[1]
  const width = +(region.match(/width:\s*(\d*)/) || [])[1]
  const height = +(region.match(/height:\s*(\d*)/) || [])[1]
  return { x, y, width, height }
}

export function parseEnvironment(userAgent, viewport) {
  parser.setUA(userAgent)
  return `${parser.getBrowser().name} ${parser.getOS().name} ${
    viewport.width
  }x${viewport.height}`
}

export function parseApiServer(server) {
  if (/^(?!.*(api)\.).*\.applitools\.com\/?$/.test(server)) {
    return server.replace('.applitools.com', 'api.applitools.com')
  }
  return server
}
