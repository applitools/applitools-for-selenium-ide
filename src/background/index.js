import browser from "webextension-polyfill";

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.sendMessage(process.env.SIDE_ID, {
    uri: "/register",
    verb: "post",
    payload: {
      name: "Applitools",
      version: "1.0.0",
      commands: [{
        id: "checkWindow",
        name: "check window"
      }]
    }
  }).then(console.log).catch(console.error);
});
