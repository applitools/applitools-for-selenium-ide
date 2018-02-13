import browser from "webextension-polyfill";

export function sendMessage(payload) {
  return getId().then(id => (
    browser.runtime.sendMessage(id, payload)
  ));
}

function getId() {
  return browser.storage.local.get(["seideId"]).then(results => (
    results.seideId ? results.seideId : process.env.SIDE_ID
  ));
}
