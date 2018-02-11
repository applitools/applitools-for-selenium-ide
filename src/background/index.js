import browser from "webextension-polyfill";
import { getViewportSize, setViewportSize } from "./commands/viewport";
import { checkWindow, endTest } from "./commands/check";
import { hasEyes } from "./utils/eyes";

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
  console.log(message);
  if (message.event === "playbackStopped" && message.options.runId && hasEyes(message.options.runId)) {
    endTest(message.options.runId).then(results => {
      return sendResponse(results);
    }).catch(sendResponse);
    return true;
  }
  if (message.action === "execute") {
    switch (message.command.command) {
      case "setViewportSize": {
        const [width, height] = message.command.value.split("x").map((s) => parseInt(s));
        setViewportSize(width, height, message.options).then(() => (
          sendResponse(true)
        )).catch(error => (
          sendResponse({ error, status: "fatal" })
        ));
        return true;
      }
      case "checkWindow": {
        if (message.options.runId) {
          getViewportSize(message.options.tabId).then(viewport => {
            checkWindow(message.options.runId, message.options.commandId, message.options.tabId, message.options.windowId, viewport, false).then((results) => {
              sendResponse(results);
            });
          });
          return true;
        } else {
          sendResponse({ status: "fatal", error: "This command can't be run individually, please run the test case." });
        }
      }
    }
  }
});
