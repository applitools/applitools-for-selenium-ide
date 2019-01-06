import { parseBrowsers } from '../../utils/parsers'

describe('parsersBrowsers', () => {
  it('has sensible defaults', () => {
    const result = parseBrowsers()[0]
    expect(result.width).toBeTruthy()
    expect(result.height).toBeTruthy()
    expect(result.name).toBeTruthy()
  })

  it('parses browsers and viewports', () => {
    const result = parseBrowsers(
      [{ name: 'Firefox', type: 'browser' }],
      ['800x600', '1024x768']
    )
    expect(result[0].width).toEqual(800)
    expect(result[0].height).toEqual(600)
    expect(result[0].name).toEqual('firefox')
    expect(result[1].width).toEqual(1024)
    expect(result[1].height).toEqual(768)
    expect(result[1].name).toEqual('firefox')
  })

  it('parses devices and orientations', () => {
    const result = parseBrowsers(
      [{ name: 'iPhone 4', type: 'device' }],
      [],
      ['Landscape', 'Portrait']
    )
    expect(result[0].deviceName).toEqual('iPhone 4')
    expect(result[0].screenOrientation).toEqual('landscape')
    expect(result[1].deviceName).toEqual('iPhone 4')
    expect(result[1].screenOrientation).toEqual('portrait')
  })

  it('parses browsers, viewports, devices, and orientations', () => {
    const result = parseBrowsers(
      [
        { name: 'iPhone 4', type: 'device' },
        { name: 'Chrome', type: 'browser' },
      ],
      ['800x600', '1024x768'],
      ['Portrait', 'Landscape']
    )
    expect(result).toEqual([
      { width: 800, height: 600, name: 'chrome' },
      { width: 1024, height: 768, name: 'chrome' },
      { screenOrientation: 'portrait', deviceName: 'iPhone 4' },
      { screenOrientation: 'landscape', deviceName: 'iPhone 4' },
    ])
  })
})
