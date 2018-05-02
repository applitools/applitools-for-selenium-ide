import browser from "webextension-polyfill";
import { sendMessage } from "../IO/message-port";
import { openOrFocusPopup } from "./popup";
import { getViewportSize, setViewportSize } from "./commands/viewport";
import { checkWindow, checkRegion, checkElement, endTest } from "./commands/check";
import { getEyes, hasEyes } from "./utils/eyes";
import { parseViewport, parseRegion } from "./utils/parsers";

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
          id: "checkRegion",
          name: "check region"
        },
        {
          id: "checkElement",
          name: "check element"
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
        const {width, height} = parseViewport(message.command.target);
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
            checkWindow(
              message.options.runId,
              message.options.testId,
              message.options.commandId,
              message.options.tabId,
              message.options.windowId,
              message.command.target,
              viewport,
              false
            ).then((results) => {
              sendResponse(results);
            }).catch((error) => {
              sendResponse(error instanceof Error ? { error: error.message } : {error});
            });
          });
          return true;
        } else {
          return sendResponse({ status: "fatal", error: "This command can't be run individually, please run the test case." });
        }
      }
      case "checkRegion": {
        if (message.options.runId) {
          getViewportSize(message.options.tabId).then(viewport => {
            const region = parseRegion(message.command.target);
            checkRegion(
              message.options.runId,
              message.options.testId,
              message.options.commandId,
              message.options.tabId,
              message.options.windowId,
              region,
              message.command.value,
              viewport
            ).then((results) => {
              sendResponse(results);
            }).catch((error) => {
              sendResponse(error instanceof Error ? { error: error.message } : {error});
            });
          });
          return true;
        } else {
          return sendResponse({ status: "fatal", error: "This command can't be run individually, please run the test case." });
        }
      }
      case "checkElement": {
        if (message.options.runId) {
          sendMessage({
            uri: "/playback/location",
            verb: "get",
            payload: {
              location: message.command.target
            }
          }).then((target) => {
            if (target.error) {
              sendResponse({error: target.error});
            } else {
              getViewportSize(message.options.tabId).then(viewport => {
                checkElement(
                  message.options.runId,
                  message.options.testId,
                  message.options.commandId,
                  message.options.tabId,
                  message.options.windowId,
                  target,
                  message.command.value,
                  viewport
                ).then((results) => {
                  sendResponse(results);
                }).catch((error) => {
                  sendResponse(error instanceof Error ? { error: error.message } : {error});
                });
              });
            }
          });
          return true;
        } else {
          return sendResponse({ status: "fatal", error: "This command can't be run individually, please run the test case." });
        }
      }
    }
  }
  if (message.action === "emit") {
    switch (message.entity) {
      case "config": {
        return sendResponse(`const Eyes = require('eyes.selenium').Eyes;let eyes, apiKey = process.env.APPLITOOLS_API_KEY, serverUrl = process.env.APPLITOOLS_SERVER_URL, appName = "${message.project.name}", batchId = configuration.randomSeed, batchName;`);
      }
      case "suite": {
        return sendResponse({
          beforeAll: `batchName = "${message.suite.name}";`,
          before: "eyes = new Eyes(serverUrl);eyes.setApiKey(apiKey);eyes.setBatch(batchName, batchId);eyes.setForceFullPageScreenshot(false);",
          after: "if (eyes._isOpen) {return eyes.close();}"
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
        } else if (command === "checkRegion") {
          const { left, top, width, height } = parseRegion(target);
          return sendResponse(`eyes.checkRegion({left:${left},top:${top},width:${width},height:${height}}, "${value}");`);
        } else if (command === "checkElement") {
          sendMessage({
            uri: "/export/location",
            verb: "get",
            payload: {
              location: target
            }
          }).then((locator) => {
            sendResponse(`eyes.checkElementBy(${locator}, undefined, "${value}");`);
          }).catch(console.error);
          return true;
        } else if (command === "setMatchLevel") {
          return sendResponse(`eyes.setMatchLevel("${target === "Layout" ? "Layout2" : target}");`);
        } else if (command === "setViewportSize") {
          const {width, height} = parseViewport(target);
          return sendResponse(`eyes.setViewportSize({width: ${width}, height: ${height}});`);
        }
      }
    }
  }
});
