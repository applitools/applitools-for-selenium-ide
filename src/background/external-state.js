import browser from 'webextension-polyfill'
import Modes from '../commons/modes'
import { verifyStoredAPIKey } from '../commons/api'

let state = {
  mode: Modes.NORMAL,
}

export function getExternalState() {
  return state
}

export function setExternalState(newState) {
  browser.runtime
    .sendMessage({
      state: Object.assign(state, newState, {
        mode: calculateMode(newState),
      }),
    })
    .catch(() => {})
}

function calculateMode(newState) {
  return newState.mode ? newState.mode : state.mode
}

let verificationMode = Modes.NORMAL
export function validateOptions() {
  return verifyStoredAPIKey()
    .then(() => (verificationMode = Modes.NORMAL))
    .catch(e => {
      if (e.message === "API key can't be empty") {
        return (verificationMode = Modes.SETUP)
      }
      return (verificationMode = Modes.INVALID)
    })
}

export function resetMode() {
  setExternalState({
    mode: verificationMode !== Modes.NORMAL ? verificationMode : Modes.NORMAL,
  })
}
