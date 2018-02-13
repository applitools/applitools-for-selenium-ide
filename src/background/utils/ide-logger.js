import { sendMessage } from "../../IO/message-port";

export function log(message, type = undefined) {
  return sendMessage({
    uri: "/playback/log",
    verb: "post",
    payload: {
      message,
      type
    }
  });
}

export function warn(message) {
  return log(message, "warning");
}

export function error(message) {
  return log(message, "error");
}

export default {
  log,
  warn,
  error
};
