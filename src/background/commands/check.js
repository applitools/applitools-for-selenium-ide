import { getScreenshot } from "../utils/screenshot";
import { getEyes, closeEyes } from "../utils/eyes";

export function checkWindow(runId, tabId, windowId, viewport, forceFullPageScreenshot = true, removeScrollBars = false) {
  return new Promise((resolve, reject) => {
    getEyes(runId).then(eyes => {
      eyes.setViewportSize(viewport);
      getScreenshot(tabId, windowId, forceFullPageScreenshot, removeScrollBars, viewport).then((image) => {
        const image64 = image.replace("data:image/png;base64,", "");
        return eyes.checkImage(image64, "Education");
      }).then((imageResult) => {
        console.log(imageResult);
        return imageResult.asExpected ? resolve(true) : resolve({ status: "undetermined" });
      }).catch(reject);
    });
  });
}

export function endTest(runId) {
  return closeEyes(runId).then(results => (
    results.isPassed
      ? { message: `All visual tests have passed,\nresults: ${results.appUrls.session}` }
      : { error: `There are visual tests failures,\nresults: ${results.appUrls.session}` }
  ));
}
