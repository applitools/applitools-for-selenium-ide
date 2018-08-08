import browser from "webextension-polyfill";
import openEyes from "rendering-grid-browser-client";
import { buildSnapshot } from "../debugger/snapshot-builder.js";

const Buffer = openEyes.Buffer;

browser.tabs.query({
  index: 1
}).then((tabs) => {
  console.log(tabs[0].id);
});
window.b = buildSnapshot;

function checkWindow(tabId) {
  openEyes({
    appName: "some app",
    testName: "kaki",
    apiKey: "",
    url: "${baseUrl}/test.html",
    browser: [
      {width: 640, height: 480, name: "chrome"}
    ],
    showLogs: true
  }).then((eyes) => (
    buildSnapshot(tabId).then(({ url, domNodes, resourceContents }) => {
      const reducedResourcedContents = resourceContents.reduce((resources, resource) => {
        resources[resource.url] = {
          url: resource.url,
          type: resource.mimeType,
          value: Buffer.from(resource.content, resource.base64Encoded ? "base64" : "utf8")
        };
        return resources;
      }, {});
      return eyes.checkWindow({resourceUrls: [], resourceContents: reducedResourcedContents, url, cdt: domNodes, tag: "first"}).then(() => (
        eyes.close().then((r) => {
          window.results = r;
        })
      ));
    })
  ));
}

window.c = checkWindow;
