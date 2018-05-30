import browser from "webextension-polyfill";
import Modes from "../commons/modes";
import ideLogger from "./utils/ide-logger";
import { getExternalState, setExternalState, resetMode, validateOptions } from "./external-state";
import { sendMessage, startPolling } from "../IO/message-port";
import { isEyesCommand } from "./commands";
import { getViewportSize, setViewportSize } from "./commands/viewport";
import { checkWindow, checkRegion, checkElement, endTest } from "./commands/check";
import { getEyes, hasEyes } from "./utils/eyes";
import { parseViewport, parseRegion } from "./utils/parsers";

startPolling({
  name: "Applitools",
  version: "1.0.0",
  commands: [
    {
      id: "checkWindow",
      name: "check window"
    },
    {
      id: "checkRegion",
      name: "check region",
      type: "region"
    },
    {
      id: "checkElement",
      name: "check element",
      type: "locator"
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
}, (err) => {
  if (err) {
    setExternalState({
      mode: Modes.DISCONNECTED
    });
  } else {
    resetMode();
  }
});

validateOptions().then(() => {
  resetMode();
});

function updateBrowserActionIcon(disableVisualCheckpoints) {
  return browser.browserAction.setIcon({
    path: {
      52: disableVisualCheckpoints ? "icons/icon_menu_disabled.png" : "icons/icon_menu.png"
    }
  });
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => { // eslint-disable-line no-unused-vars
  if (message.requestExternalState) {
    return sendResponse({ state: getExternalState() });
  }
  if (message.setVisualChecks) {
    browser.storage.local.set({
      disableVisualCheckpoints: message.disableVisualCheckpoints
    });
    updateBrowserActionIcon(message.disableVisualCheckpoints);
    setExternalState({
      disableVisualCheckpoints: message.disableVisualCheckpoints
    });
  }
  if (message.optionsUpdated) {
    browser.storage.local.get(["disableVisualCheckpoints"]).then(({disableVisualCheckpoints}) => {
      updateBrowserActionIcon(disableVisualCheckpoints);
      setExternalState({ disableVisualCheckpoints });
    });
    validateOptions().then(() => {
      resetMode();
    });
  }
});

browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.event === "recordingStarted") {
    setExternalState({
      mode: Modes.RECORD,
      record: {
        testName: message.testName
      }
    });
  }
  if (message.event === "recordingStopped") {
    resetMode();
  }
  if (message.event === "projectLoaded") {
    browser.storage.local.get(["branch", "parentBranch"]).then(({ branch, parentBranch }) => {
      if (branch || parentBranch) {
        sendMessage({
          uri: "/popup/alert",
          verb: "post",
          payload: {
            message: `Your applitools' branches are not at the default state,${branch ? " branch: " + branch : ""}${parentBranch ? " parent branch: " + parentBranch : ""}.  \n` +
                     "Would you like to reset them?",
            confirm: "Reset branches",
            cancel: "Continue"
          }
        }).then((shouldReset) => {
          if (shouldReset) {
            browser.storage.local.set({
              branch: "",
              parentBranch: ""
            });
          }
        });
      }
    });
  }
  if (message.event === "playbackStarted" && message.options.runId) {
    getEyes(`${message.options.runId}${message.options.testId}`, message.options.runId, message.options.projectName, message.options.suiteName, message.options.testName).then(() => {
      if (getExternalState().disableVisualCheckpoints) {
        ideLogger.log("visual checkpoints are disabled").then(() => {
          return sendResponse(true);
        });
      } else {
        return sendResponse(true);
      }
    }).catch(() => {
      return sendResponse(true);
    });
    return true;
  }
  if (message.event === "playbackStopped" && message.options.runId && hasEyes(`${message.options.runId}${message.options.testId}`)) {
    endTest(`${message.options.runId}${message.options.testId}`).catch(r => (r)).then(results => {
      resetMode();
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
        if (getExternalState().disableVisualCheckpoints) {
          return sendResponse(true);
        } else if (message.options.runId) {
          getViewportSize(message.options.tabId).then(viewport => {
            checkWindow(
              message.options.runId,
              message.options.testId,
              message.options.commandId,
              message.options.tabId,
              message.options.windowId,
              message.command.target,
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
      case "checkRegion": {
        if (getExternalState().disableVisualCheckpoints) {
          return sendResponse(true);
        } else if (message.options.runId) {
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
        if (getExternalState().disableVisualCheckpoints) {
          return sendResponse(true);
        } else if (message.options.runId) {
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
      case "project": {
        const { project } = message;
        const hasEyesCommands = project.tests.reduce((commands, test) => {
          return [...commands, ...test.commands];
        }, []).find(({command}) => (isEyesCommand(command)));
        return sendResponse({ canEmit: !!hasEyesCommands });
      }
      case "config": {
        return sendResponse(`const Eyes = require('eyes.selenium').Eyes;let eyes, apiKey = process.env.APPLITOOLS_API_KEY, serverUrl = process.env.APPLITOOLS_SERVER_URL, appName = "${message.project.name}", batchId = configuration.runId, batchName;`);
      }
      case "suite": {
        return sendResponse({
          beforeAll: `batchName = "${message.suite.name}";`,
          before: "eyes = new Eyes(serverUrl, configuration.params.eyesDisabled);eyes.setApiKey(apiKey);eyes.setBatch(batchName, batchId);",
          after: "if (eyes._isOpen) {await eyes.close();}"
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
          return sendResponse(`eyes.setForceFullPageScreenshot(true);eyes.checkWindow("${target}").then(() => {eyes.setForceFullPageScreenshot(false);});`);
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
