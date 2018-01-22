import browser from "webextension-polyfill";

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.sendMessage(process.env.SIDE_ID, {
    uri: "/register",
    verb: "post",
    payload: {
      name: "Applitools",
      version: "1.0.0",
      commands: [
        {
          id: "checkWindow",
          name: "check window"
        },
        {
          id: "checkPlugin",
          name: "check plugin"
        }]
    }
  }).then(console.log).catch(console.error);
});

browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log(message);
  sendResponse({ error: "This command is no longer in use" });
});
