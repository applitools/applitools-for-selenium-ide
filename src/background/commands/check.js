import browser from "webextension-polyfill";
import Modes from "../../commons/modes";
import { sendMessage } from "../../IO/message-port";
import { getScreenshot, getRegionScreenshot } from "../utils/screenshot";
import { getEyes, closeEyes, promiseFactory } from "../utils/eyes";
import { getExternalState, setExternalState } from "../external-state";
import { parseEnvironment } from "../utils/parsers";
import ideLogger from "../utils/ide-logger";

const imageProvider = new window.EyesImages.ImageProvider();

export function checkWindow(runId, testId, commandId, tabId, windowId, stepName, viewport) {
  return new Promise((resolve, reject) => {
    getEyes(`${runId}${testId}`).then(eyes => {
      preCheck(eyes, viewport).then(() => {
        getTabPathname(tabId).then(pathname => {
          eyes.commands.push(commandId);
          eyes.setViewportSize(viewport);
          imageProvider.getScreenshot = () => {
            return getScreenshot(tabId).then((image) => {
              return window.EyesImages.MutableImage.fromBase64(image.data, promiseFactory);
            });
          };

          eyes.checkImage(imageProvider, stepName || pathname).then((imageResult) => {
            return imageResult.asExpected ? resolve(true) : resolve({ status: "undetermined" });
          }).catch(reject);
        });
      });
    }).catch(reject);
  });
}

export function checkRegion(runId, testId, commandId, tabId, windowId, region, stepName, viewport) {
  if (!region || !region.x || !region.y || !region.width || !region.height) return Promise.reject("Invalid region. Region should be x: [number], y: [number], width: [number], height: [number]");
  return new Promise((resolve, reject) => {
    getEyes(`${runId}${testId}`).then(eyes => {
      preCheck(eyes, viewport).then(() => {
        getTabPathname(tabId).then(pathname => {
          eyes.commands.push(commandId);
          eyes.setViewportSize(viewport);
          imageProvider.getScreenshot = () => {
            return getRegionScreenshot(tabId, region).then((image) => {
              return window.EyesImages.MutableImage.fromBase64(image.data, promiseFactory);
            });
          };

          eyes.checkImage(imageProvider, stepName || pathname).then((imageResult) => {
            return imageResult.asExpected ? resolve(true) : resolve({ status: "undetermined" });
          }).catch(reject);
        });
      });
    }).catch(reject);
  });
}

export function checkElement(runId, testId, commandId, tabId, windowId, elementXPath, stepName, viewport) {
  return new Promise((resolve, reject) => {
    getEyes(`${runId}${testId}`).then(eyes => {
      preCheck(eyes, viewport).then(() => {
        getTabPathname(tabId).then(pathname => {
          eyes.commands.push(commandId);
          eyes.setViewportSize(viewport);
          browser.tabs.sendMessage(tabId, {
            getElementRect: true,
            path: elementXPath
          }).then((rect) => {
            imageProvider.getScreenshot = () => {
              return getRegionScreenshot(tabId, rect).then((image) => {
                return window.EyesImages.MutableImage.fromBase64(image.data, promiseFactory);
              });
            };

            eyes.checkImage(imageProvider, stepName || pathname).then((imageResult) => {
              return imageResult.asExpected ? resolve(true) : resolve({ status: "undetermined" });
            }).catch(reject);
          });
        });
      });
    }).catch(reject);
  });
}

export function endTest(id) {
  return closeEyes(id).then(results => {
    console.log(results);
    return Promise.all(results.commands.map((commandId, index) => (
      sendMessage({
        uri: "/playback/command",
        verb: "post",
        payload: {
          commandId,
          state: results.stepsInfo[index].isDifferent ? "failed" : "passed"
        }
      })
    ))).then((commandStates) => {
      console.log(commandStates);
      return results.status === "Passed"
        ? { message: `All visual tests have passed,\nresults: ${results.appUrls.session}` }
        : { error: `Diffs were found in visual tests,\nresults: ${results.appUrls.session}` };
    });
  });
}

function preCheck(eyes, viewport) {
  if (!eyes.didSetViewportSize) {
    ideLogger.warn("a visual check was called without setting a viewport size, results may be inconsistent, dismiss by using the `set viewport size` command.");
  }
  if (getExternalState().mode !== Modes.PLAYBACK) {
    let notification = `connecting to ${eyes._serverUrl}`;
    if (eyes.getBranchName()) {
      notification += `, running on branch ${eyes.getBranchName()}`;
    }
    return ideLogger.log(notification).then(() => {
      return setExternalState({
        mode: Modes.PLAYBACK,
        playback: {
          testName: eyes._testName,
          startTime: (new Date()).toString(),
          hasFailed: false,
          batchName: eyes._batch.name || eyes._testName,
          appName: eyes._appName,
          eyesServer: eyes._serverUrl,
          environment: parseEnvironment(navigator.userAgent, viewport),
          branch: eyes.getBranchName()
        }
      });
    });
  } else {
    return Promise.resolve();
  }
}

function getTabPathname(tab) {
  return browser.tabs.get(tab).then(data => ((new URL(data.url)).pathname));
}
