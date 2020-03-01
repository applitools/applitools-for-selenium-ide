import { getSnapshot } from './dom-snapshot'

export function buildCheckUsingVisualGrid(eyes, tabId) {
  return async (params = {}) =>
    eyes.checkWindow({
      ...(await getSnapshot(tabId)),
      ...params,
    })
}
