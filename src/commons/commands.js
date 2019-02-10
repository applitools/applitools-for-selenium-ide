import browser from 'webextension-polyfill'
import { sendMessage } from '../IO/message-port'

// If you change aynthing here make sure to also change plugin-manifest.json
export const CommandIds = {
  CheckWindow: 'eyesCheckWindow',
  CheckElement: 'eyesCheckElement',
  SetMatchLevel: 'eyesSetMatchLevel',
  SetMatchTimeout: 'eyesSetMatchTimeout',
  SetViewportSize: 'eyesSetViewportSize',
  SetBaselineEnvName: 'eyesSetBaselineEnvName',
}

const CommandNames = Object.values(CommandIds)

export function isEyesCommand(command) {
  return CommandNames.includes(command)
}

export function containsEyesCommands(commands) {
  if (!Array.isArray(commands)) return false
  const commandNames = [...CommandNames]
  commandNames.splice(
    commandNames.findIndex(name => name === 'eyesSetViewportSize'),
    1
  )
  return commands.map(command => commandNames.includes(command)).includes(true)
}

export async function elevateSetWindowSizeIfNecessary() {
  const { commands } = await sendMessage({
    uri: '/record/command',
    verb: 'get',
  })
  const hasSetViewportSize = !!commands.find(
    cmd => cmd.command === CommandIds.SetViewportSize
  )
  if (!hasSetViewportSize) {
    const tabId = (await sendMessage({
      uri: '/record/tab',
      verb: 'get',
    })).id
    const { width, height } = await getTabViewportSize(tabId)
    const setWindowSize = commands.find(cmd => cmd.command === 'setWindowSize')
    if (setWindowSize) {
      return sendMessage({
        uri: '/record/command',
        verb: 'put',
        payload: {
          id: setWindowSize.id,
          command: CommandIds.SetViewportSize,
          target: `${width}x${height}`,
          value: '',
        },
      })
    }
  }
}

export async function getTabViewportSize(tabId) {
  const tab = await browser.tabs.get(tabId)
  return {
    width: tab.width,
    height: Math.max(tab.height - 100, 100),
  }
}
