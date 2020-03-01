import { sendMessage } from '../../IO/message-port'

export function getCurrentProject() {
  return sendMessage({
    uri: '/project',
    verb: 'get',
  })
}
