import { sendMessage } from '../../IO/message-port'
import {
  CommandIds,
  isCheckCommand,
  dedupeSetWindowSizeIfNecessary,
  elevateSetWindowSizeIfNecessary,
} from '../../commons/commands'

export function recordCommand(command) {
  sendMessage({
    uri: '/record/command',
    verb: 'post',
    payload: command,
  })
    .then(() => {
      if (isCheckCommand(command)) {
        elevateSetWindowSizeIfNecessary()
      } else if (command.command === CommandIds.SetViewportSize) {
        dedupeSetWindowSizeIfNecessary()
      }
    })
    .catch(console.error) // eslint-disable-line no-console
}
