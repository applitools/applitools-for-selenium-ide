const { Eyes } = window.EyesImages;

const promiseFactory = {
  makePromise: (p) => (new Promise(p)),
  resolve: Promise.resolve.bind(Promise),
  reject: Promise.reject.bind(Promise)
};

const eyes = {};

function makeEyes() {
  const eyesApiServerUrl = undefined;
  const eyes = new Eyes(eyesApiServerUrl, undefined, promiseFactory);
  eyes.setApiKey(process.env.API_KEY);
  eyes.setAgentId(navigator.userAgent);
  eyes.setInferredEnvironment(`useragent:${navigator.userAgent}`);

  return eyes.open("Selenium IDE", "Visual test!!!!").then(() => (eyes));
}

export function getEyes(runId) {
  if (!eyes[runId]) {
    return makeEyes().then(eye => {
      eyes[runId] = eye;
      return eye;
    });
  } else {
    return Promise.resolve(eyes[runId]);
  }
}

export function closeEyes(runId) {
  const eye = eyes[runId];
  eyes[runId] = undefined;

  return eye.close(false).catch((e) => {
    console.error(e);
    eye.abortIfNotClosed();
  });
}
