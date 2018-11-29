import browser from "webextension-polyfill";

let domCapture;
if (process.env.NODE_ENV !== "test") {
  domCapture = require("raw-loader!@applitools/dom-capture/dist/captureDom.js");
}

export function getDomCapture(tabId) {
  browser.tabs.executeScript(tabId, {
    code: `(${domCapture})().then(result => { window.__eyes__domCapture = result; }).catch()`
  });

  return new Promise((res, rej) => {
    let count = 0;
    const domCapRetry = setInterval(() => {
      if (count >= 5000) {
        clearInterval(domCapRetry);
        rej("Unable to capture DOM within the timeout specified");
      }
      browser.tabs
        .executeScript(tabId, {
          code: "window.__eyes__domCapture;"
        })
        .then(result => {
          console.log(
            `[${count}ms]: ${
              result && result[0] ? result : "No DOM Capture result yet"
            }`
          );
          if (result && result[0]) {
            browser.tabs.executeScript(tabId, {
              code: "delete window.__eyes__domCapture;"
            });
            clearInterval(domCapRetry);
            res(parseOutExternalFrames(result));
          }
        });
      count += 100;
    }, 100);
  });
}

export function parseOutExternalFrames(input = []) {
  if (input && input[0]) {
    return input[0]
      .replace(/@@@@@(.|\n)*-----/, "")
      .replace(/@@@@@.*?@@@@@/g, "")
      .trim();
  }
}
