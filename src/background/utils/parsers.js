export function parseViewport(vp) {
  const [ width, height ] = vp.split("x").map((s) => parseInt(s));
  return { width, height };
}

export function parseRegion(region) {
  const left = (region.match(/left:\s*(\d*)/) || [])[1];
  const top = (region.match(/top:\s*(\d*)/) || [])[1];
  const width = (region.match(/width:\s*(\d*)/) || [])[1];
  const height = (region.match(/height:\s*(\d*)/) || [])[1];
  return { left, top, width, height };
}
