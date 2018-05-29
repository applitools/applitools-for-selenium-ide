import UAParser from "ua-parser-js";
const parser = new UAParser();

export function parseViewport(vp) {
  const [ width, height ] = vp.split("x").map((s) => parseInt(s));
  return { width, height };
}

export function parseRegion(region) {
  const left = (region.match(/x:\s*(\d*)/) || [])[1];
  const top = (region.match(/y:\s*(\d*)/) || [])[1];
  const width = (region.match(/width:\s*(\d*)/) || [])[1];
  const height = (region.match(/height:\s*(\d*)/) || [])[1];
  return { left, top, width, height };
}

export function parseEnvironment(userAgent, viewport) {
  parser.setUA(userAgent);
  return `${parser.getBrowser().name} ${parser.getOS().name} ${viewport.width}x${viewport.height}`;
}

export function parseApiServer(server) {
  if (/^(?!.*(api)\.).*\.applitools\.com\/?$/.test(server)) {
    return server.replace(".applitools.com", "api.applitools.com");
  }
  return server;
}
