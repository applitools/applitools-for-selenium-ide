import browser from "webextension-polyfill";
import { sendMessage } from "../IO/message-port";
import { openOrFocusPopup } from "./popup";
import { getViewportSize, setViewportSize } from "./commands/viewport";
import { checkWindow, endTest } from "./commands/check";
import { getEyes, hasEyes } from "./utils/eyes";

browser.browserAction.onClicked.addListener(() => {
  sendMessage({
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
          id: "setMatchLevel",
          name: "set match level"
        },
        {
          id: "setViewportSize",
          name: "set viewport size"
        }
      ],
      dependencies: {
        "eyes.selenium": "0.0.78"
      }
    }
  }).then(console.log).catch(console.error);
  openOrFocusPopup();
});

browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.event === "playbackStarted" && message.options.runId) {
    getEyes(`${message.options.runId}${message.options.testId}`, message.options.runId, message.options.projectName, message.options.suiteName, message.options.testName).then(() => {
      return sendResponse(true);
    }).catch(() => {
      return sendResponse(true);
    });
    return true;
  }
  if (message.event === "playbackStopped" && message.options.runId && hasEyes(`${message.options.runId}${message.options.testId}`)) {
    endTest(`${message.options.runId}${message.options.testId}`).then(results => {
      return sendResponse(results);
    }).catch(sendResponse);
    return true;
  }
  if (message.action === "execute") {
    switch (message.command.command) {
      case "setMatchLevel": {
        getEyes(`${message.options.runId}${message.options.testId}`).then((eyes) => {
          return eyes.setMatchLevel(message.command.target);
        }).then(() => {
          return sendResponse(true);
        }).catch((error) => {
          return sendResponse(error instanceof Error ? { error: error.message } : {error});
        });
        return true;
      }
      case "setViewportSize": {
        const [width, height] = message.command.target.split("x").map((s) => parseInt(s));
        setViewportSize(width, height, message.options).then(() => {
          // remember that we set the viewport size so we won't warn about that later
          if (hasEyes(`${message.options.runId}${message.options.testId}`)) {
            getEyes(`${message.options.runId}${message.options.testId}`).then((eyes) => {
              eyes.didSetViewportSize = true;
            });
          }
          return sendResponse(true);
        }).catch(error => {
          return sendResponse({ error: (error && error.message) ? error.message : error ,status: "fatal" });
        });
        return true;
      }
      case "checkWindow": {
        if (message.options.runId) {
          getViewportSize(message.options.tabId).then(viewport => {
            checkWindow(message.options.runId, message.options.testId, message.options.commandId, message.options.tabId, message.options.windowId, message.command.target, viewport, false).then((results) => {
              sendResponse(results);
            }).catch((error) => {
              sendResponse(error instanceof Error ? { error: error.message } : {error});
            });
          });
          return true;
        } else {
          sendResponse({ status: "fatal", error: "This command can't be run individually, please run the test case." });
        }
      }
    }
  }
  if (message.action === "emit") {
    switch (message.entity) {
      case "config": {
        return sendResponse(`const Eyes = require('eyes.selenium').Eyes;let eyes, apiKey = process.env.APPLITOOLS_API_KEY, appName = "${message.project.name}", batchId = configuration.randomSeed, batchName;`);
      }
      case "suite": {
        return sendResponse({
          beforeAll: `batchName = "${message.suite.name}";`,
          before: "eyes = new Eyes();eyes.setApiKey(apiKey);eyes.setBatch(batchName, batchId);eyes.setForceFullPageScreenshot(true);",
          after: "return eyes.close();"
        });
      }
      case "test": {
        return sendResponse({
          setup: `await eyes.open(driver, appName, "${message.test.name}");`,
          teardown: ""
        });
      }
      case "command": {
        const { command, target, value } = message.command; // eslint-disable-line no-unused-vars
        if (command === "checkWindow") {
          return sendResponse(`eyes.checkWindow("${target}");`);
        } else if (command === "setMatchLevel") {
          return sendResponse(`eyes.setMatchLevel("${target === "Layout" ? "Layout2" : target}");`);
        } else if (command === "setViewportSize") {
          const [width, height] = target.split("x").map((s) => parseInt(s));
          return sendResponse(`eyes.setViewportSize({width: ${width}, height: ${height}});`);
        }
      }
    }
  }
});
