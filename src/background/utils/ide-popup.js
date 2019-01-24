import { sendMessage } from '../../IO/message-port'

export default function popup(message) {
  return sendMessage({
    uri: '/popup/alert',
    verb: 'post',
    payload: {
      message: message.message,
      cancel: message.cancelLabel,
      confirm: message.confirmLabel,
    },
  })
}
