import browser from "webextension-polyfill";
const { Eyes } = window.EyesImages;

const promiseFactory = {
  makePromise: (p) => (new Promise(p)),
  resolve: Promise.resolve.bind(Promise),
  reject: Promise.reject.bind(Promise)
};

const eyes = {};

function makeEyes(batchId, appName, batchName, testName) {
  return new Promise((res, rej) => {
    browser.storage.local.get(["apiKey", "eyesServer"]).then(({ apiKey, eyesServer }) => {
      if (!apiKey) {
        return rej("No API key was provided, please set one in the options page");
      }
      const eyesApiServerUrl = eyesServer ? eyesServer : undefined;
      const eyes = new Eyes(eyesApiServerUrl, undefined, promiseFactory);
      eyes.setApiKey(apiKey);
      eyes.setAgentId(navigator.userAgent);
      eyes.setInferredEnvironment(`useragent:${navigator.userAgent}`);
      eyes.setBatch(batchName, batchId);
      eyes.commands = [];

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
    return results;
  }).catch((e) => {
    console.error(e);
    eye.abortIfNotClosed();
  });
}
