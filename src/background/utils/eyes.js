const { Eyes } = window.EyesImages;

export function getEyes() {
  const eyesApiServerUrl = undefined;
  const eyes = new Eyes(eyesApiServerUrl, undefined, {
    makePromise: (p) => (new Promise(p)),
    resolve: Promise.resolve.bind(Promise),
    reject: Promise.reject.bind(Promise)
  });
  eyes.setApiKey(process.env.API_KEY);
  eyes.setAgentId(navigator.userAgent);

  return eyes;
}
