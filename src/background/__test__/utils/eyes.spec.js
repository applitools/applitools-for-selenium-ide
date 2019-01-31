import { hasValidVisualGridSettings } from '../../utils/eyes'

describe('hasValidVisualGridSettings', () => {
  it('should be invalid with no input', () => {
    expect(hasValidVisualGridSettings(undefined)).toBeFalsy()
  })
  it('should be invalid with no option groups populated', () => {
    let settings = {
      browsers: [],
      viewports: [],
      devices: [],
      orientations: [],
    }
    expect(hasValidVisualGridSettings(settings)).toBeFalsy()
  })
  it('should be invalid with just one option group populated', () => {
    let settings = {
      browsers: ['Chrome', 'Firefox'],
      viewports: [],
      devices: [],
      orientations: [],
    }
    expect(hasValidVisualGridSettings(settings)).toBeFalsy()
    settings = {
      browsers: [],
      viewports: ['123x456', '789x012', '111x222'],
      devices: [],
      orientations: [],
    }
    expect(hasValidVisualGridSettings(settings)).toBeFalsy()
    settings = {
      browsers: [],
      viewports: [],
      devices: ['iPhone X', 'Galaxy Somethingorother'],
      orientations: [],
    }
    expect(hasValidVisualGridSettings(settings)).toBeFalsy()
    settings = {
      browsers: [],
      viewports: [],
      devices: [],
      orientations: ['portrait', 'landscape'],
    }
    expect(hasValidVisualGridSettings(settings)).toBeFalsy()
  })
  it('should be valid with a joint option group being populated', () => {
    let settings = {
      browsers: ['Chrome', 'Firefox'],
      viewports: ['123x456', '789x012', '111x222'],
      devices: [],
      orientations: [],
    }
    expect(hasValidVisualGridSettings(settings)).toBeTruthy()
    settings = {
      browsers: [],
      viewports: [],
      devices: ['iPhone X', 'Galaxy Somethingorother'],
      orientations: ['portrait', 'landscape'],
    }
    expect(hasValidVisualGridSettings(settings)).toBeTruthy()
  })
  it('should be valid with all option groups populated', () => {
    let settings = {
      browsers: ['Chrome', 'Firefox'],
      viewports: ['123x456', '789x012', '111x222'],
      devices: ['iPhone X', 'Galaxy Somethingorother'],
      orientations: ['portrait', 'landscape'],
    }
    expect(hasValidVisualGridSettings(settings)).toBeTruthy()
  })
  it('should be invalid with a complete option group and an incomplete option group', () => {
    let settings = {
      browsers: ['Chrome', 'Firefox'],
      viewports: ['123x456', '789x012', '111x222'],
      devices: ['iPhone X', 'Galaxy Somethingorother'],
      orientations: [],
    }
    expect(hasValidVisualGridSettings(settings)).toBeFalsy()
  })
  it('should be invalid with a mismatched option groups', () => {
    let settings = {
      browsers: ['Chrome', 'Firefox'],
      viewports: [],
      devices: [],
      orientations: ['portrait', 'landscape'],
    }
    expect(hasValidVisualGridSettings(settings)).toBeFalsy()
    settings = {
      browsers: [],
      viewports: ['123x456', '789x012', '111x222'],
      devices: ['iPhone X', 'Galaxy Somethingorother'],
      orientations: [],
    }
    expect(hasValidVisualGridSettings(settings)).toBeFalsy()
  })
})
