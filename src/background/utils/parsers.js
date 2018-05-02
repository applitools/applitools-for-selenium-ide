export function parseViewport(vp) {
  const [ width, height ] = vp.split("x").map((s) => parseInt(s));
  return { width, height };
}

export function parseRegion(region) {
  const r = /left:\s*(\d*),\s*top:\s*(\d*),\s*width:\s*(\d*),\s*height:\s*(\d*)\s*/;
  const [ input, left, top, width, height ] = region.match(r); // eslint-disable-line no-unused-vars
  return { left, top, width, height };
}
