import browser from "webextension-polyfill";
import { sendMessage } from "../../IO/message-port";
import { getScreenshot, getRegionScreenshot, isRegionInViewport, scrollTo } from "../utils/screenshot";
import { getEyes, closeEyes } from "../utils/eyes";
import ideLogger from "../utils/ide-logger";

export function checkWindow(runId, testId, commandId, tabId, windowId, stepName, viewport, forceFullPageScreenshot = false, removeScrollBars = false) {
  return new Promise((resolve, reject) => {
    getEyes(`${runId}${testId}`).then(eyes => {
      if (!eyes.didSetViewportSize) {
        ideLogger.warn("a visual check was called without setting a viewport size, results may be inconsistent");
      }
      eyes.commands.push(commandId);
      eyes.setViewportSize(viewport);
      getScreenshot(tabId, windowId, forceFullPageScreenshot, removeScrollBars, viewport).then((image) => {
        const image64 = image.replace("data:image/png;base64,", "");
        return eyes.checkImage(image64, stepName);
      }).then((imageResult) => {
        return imageResult.asExpected ? resolve(true) : resolve({ status: "undetermined" });
      }).catch(reject);
    }).catch(reject);
  });
}

export function checkRegion(runId, testId, commandId, tabId, windowId, region, stepName, viewport, removeScrollBars = false) {
  if (!region || !region.left || !region.top || !region.width || !region.height) return Promise.reject("Invalid region. Region should be x: [number], y: [number], width: [number], height: [number]");
  return new Promise((resolve, reject) => {
    getEyes(`${runId}${testId}`).then(eyes => {
      if (!eyes.didSetViewportSize) {
        ideLogger.warn("a visual check was called without setting a viewport size, results may be inconsistent");
      }
      eyes.commands.push(commandId);
      eyes.setViewportSize(viewport);
      let scrollToTopTarget = region.top - 100;
      if (scrollToTopTarget < 0) {
        scrollToTopTarget = 0;
      } else {
        region.top = 100;
      }
      scrollTo(tabId, region.left, scrollToTopTarget).then(() => {
        if (isRegionInViewport(region, viewport)) {
          getRegionScreenshot(tabId, windowId, region, removeScrollBars, viewport).then((image) => {
            const image64 = image.replace("data:image/png;base64,", "");
            return eyes.checkImage(image64, stepName);
          }).then((imageResult) => {
            return imageResult.asExpected ? resolve(true) : resolve({ status: "undetermined" });
          }).catch(reject);
        } else {
          reject(new Error("Region is out of bounds, try setting the viewport size to a bigger one."));
        }
      });
    }).catch(reject);
  });
}

export function checkElement(runId, testId, commandId, tabId, windowId, elementXPath, stepName, viewport, removeScrollBars = false) {
  return new Promise((resolve, reject) => {
    getEyes(`${runId}${testId}`).then(eyes => {
      if (!eyes.didSetViewportSize) {
        ideLogger.warn("a visual check was called without setting a viewport size, results may be inconsistent");
      }
      eyes.commands.push(commandId);
      eyes.setViewportSize(viewport);
      browser.tabs.sendMessage(tabId, {
        getElementRect: true,
        path: elementXPath
      }).then((rect) => {
        if (isRegionInViewport(rect, viewport)) {
          getRegionScreenshot(tabId, windowId, rect, removeScrollBars, viewport).then((image) => {
            const image64 = image.replace("data:image/png;base64,", "");
            return eyes.checkImage(image64, stepName);
          }).then((imageResult) => {
            return imageResult.asExpected ? resolve(true) : resolve({ status: "undetermined" });
          }).catch(reject);
        } else {
          reject(new Error("Element is out of bounds, try setting the viewport size to a bigger one."));
        }
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
        : { error: `There are visual tests failures,\nresults: ${results.appUrls.session}` };
    });
  });
}
