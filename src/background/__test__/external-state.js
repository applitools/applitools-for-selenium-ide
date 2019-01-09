import {
  getExternalState,
  setExternalState,
  resetMode,
} from '../external-state'
jest.mock('webextension-polyfill')

describe('external-state', () => {
  it('defaults to normal mode', () => {
    expect(getExternalState()).toMatchObject({ mode: 'normal' })
  })

  it('can change the state', () => {
    setExternalState({ mode: 'recording' })
    expect(getExternalState()).toMatchObject({ mode: 'recording' })
  })

  it('resets to normal mode', () => {
    resetMode()
    expect(getExternalState()).toMatchObject({ mode: 'normal' })
  })
})
