const { Eyes } = window.EyesImages;

const promiseFactory = {
  makePromise: (p) => (new Promise(p)),
  resolve: Promise.resolve.bind(Promise),
  reject: Promise.reject.bind(Promise)
};

const eyes = {};

function makeEyes(batchId, appName, batchName, testName) {
  const eyesApiServerUrl = undefined;
  const eyes = new Eyes(eyesApiServerUrl, undefined, promiseFactory);
  eyes.setApiKey(process.env.API_KEY);
  eyes.setAgentId(navigator.userAgent);
  eyes.setInferredEnvironment(`useragent:${navigator.userAgent}`);
  eyes.setBatch(batchName, batchId);
  eyes.commands = [];

  return eyes.open(appName, testName).then(() => (eyes));
}

export function hasEyes(id) {
  return !!eyes[id];
}

export function getEyes(id, batchId, appName, batchName, testName) {
  if (!eyes[id]) {
    return makeEyes(batchId, appName, batchName, testName).then(eye => {
      eyes[id] = eye;
      return eye;
    });
  } else {
    return Promise.resolve(eyes[id]);
  }
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
