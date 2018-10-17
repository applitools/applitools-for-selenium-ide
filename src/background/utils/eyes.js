import browser from "webextension-polyfill";
import { parseApiServer } from "./parsers.js";
const { Eyes } = window.EyesImages;
import { browserName } from "./userAgent";

export const promiseFactory = {
  makePromise: (p) => (new Promise(p)),
  resolve: Promise.resolve.bind(Promise),
  reject: Promise.reject.bind(Promise)
};

const eyes = {};
let lastResults = {
  url: "",
  batchId: ""
};

function makeEyes(batchId, appName, batchName, testName) {
  if (lastResults.batchId !== batchId) {
    lastResults.batchId = batchId;
    lastResults.url = "";
  }
  return new Promise((res, rej) => {
    browser.storage.local.get(["apiKey", "branch", "parentBranch", "eyesServer"]).then(({ apiKey, branch, parentBranch, eyesServer }) => {
      if (!apiKey) {
        return rej("No API key was provided, please set one in the options page");
      }
      const eyesApiServerUrl = eyesServer ? parseApiServer(eyesServer) : undefined;
      const eyes = new Eyes(eyesApiServerUrl, undefined, promiseFactory);
      if (process.env.NODE_ENV !== "production") eyes.setLogHandler(new window.EyesImages.ConsoleLogHandler(true));
      eyes.setApiKey(apiKey);
      eyes.setBranchName(branch);
      eyes.setParentBranchName(parentBranch);
      eyes.setAgentId(`eyes.seleniumide.${browserName.toLowerCase()}`);
      eyes.setInferredEnvironment(`useragent:${navigator.userAgent}`);
      eyes.setBatch(batchName, batchId);
      decorateEyes(eyes);

      eyes.open(appName, testName).then(() => {
        res(eyes);
      });
    });
  });
}

export function hasEyes(id) {
  return !!eyes[id];
}

export function getEyes(id, batchId, appName, batchName, testName) {
  return new Promise((res, rej) => {
    if (!eyes[id]) {
      makeEyes(batchId, appName, batchName, testName).then(eye => {
        eyes[id] = eye;
        res(eye);
      }).catch(rej);
    } else {
      res(eyes[id]);
    }
  });
}

export function closeEyes(id) {
  const eye = eyes[id];
  eyes[id] = undefined;

  return eye.close(false).then(results => {
    results.commands = eye.commands;
    // checking the length because we might not necessarily have checkpoints
    lastResults.url = results.commands.length && (results.status !== "Passed" || results.isNew) ? results.appUrls.session : undefined;
    return results;
  }).catch((e) => {
    console.error(e);
    eye.abortIfNotClosed();
  });
}

export function getResultsUrl() {
  return lastResults.url;
}

function decorateEyes(eyes) {
  eyes.commands = [];
  const setMatchLevel = eyes.setMatchLevel.bind(eyes);
  eyes.setMatchLevel = (level) => {
    if (level === "Layout") {
      setMatchLevel("Layout2");
    } else {
      setMatchLevel(level);
    }
  };
}
