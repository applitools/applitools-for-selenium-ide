import browser from "webextension-polyfill";

export function sendMessage(payload) {
  return browser.runtime.sendMessage(getId(), payload);
}

function getId() {
  return process.env.SIDE_ID;
}
