import browser from "webextension-polyfill";
import { setViewportSize } from "./commands/viewport";
import { checkWindow } from "./commands/check";

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
        },
        {
          id: "setViewportSize",
          name: "set viewport size"
        }
      ]
    }
  }).then(console.log).catch(console.error);
});

browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.action === "execute") {
    console.log(message.options);
    switch (message.command.command) {
      case "setViewportSize": {
        const [width, height] = message.command.value.split(",").map((s) => parseInt(s));
        setViewportSize(width, height, message.options).then(() => (
          sendResponse(true)
        )).catch(error => (
          sendResponse({ error, status: "fatal" })
        ));
        return true;
      }
      case "checkPlugin": {
        if (message.options.runId) {
          checkWindow(message.options.runId, message.options.tabId, message.options.windowId, { width: 750, height: 500 }, false).then((results) => {
            sendResponse(results);
          });
          return true;
        } else {
          sendResponse({ status: "fatal", error: "This command can't be run individually, please run the test case." });
        }
      }
    }
  }
});
