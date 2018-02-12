import browser from "webextension-polyfill";

export function log(message, type = undefined) {
  return browser.runtime.sendMessage(process.env.SIDE_ID, {
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
