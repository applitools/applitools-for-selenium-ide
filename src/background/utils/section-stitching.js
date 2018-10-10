const {PNG} = require("pngjs");
const debug = console.log;

function range(from, to, step = 1) {
  if (from >= to) return [];

  return Array(Math.ceil((to - from) / step))
    .fill(0)
    .map((_, i) => i * step + from);
}

export default async function stitchSections({rect, maxSectionHeight, captureScreenshotFunc}) {
  const screenshotPng = makePng(rect);
  const numberOfSections = Math.ceil(rect.height / maxSectionHeight);

  if (numberOfSections === 1) {
    const clip = extractClipSection(rect, 0, maxSectionHeight);

    const screenshotResult = await captureScreenshotFunc({rect: clip});
    const png = await makePngFromBuffer(Buffer.from(screenshotResult.data, "base64"));

    return {
      png: () => png,
      buffer: () => PNG.sync.write(png)
    };
  }

  for (const i of range(0, numberOfSections)) {
    const clip = extractClipSection(rect, i, maxSectionHeight);

    debug(`Capturing section #${i}`);
    debug(clip);

    const screenshotResult = await captureScreenshotFunc({rect: clip});
    const section = await makePngFromBuffer(Buffer.from(screenshotResult.data, "base64"));

    bitBltSectionInto(section, screenshotPng, clip, maxSectionHeight, i);
  }
  debug("Captured whole screenshot");

  return {
    png: () => screenshotPng,
    buffer: () => PNG.sync.write(screenshotPng)
  };
}

function extractClipSection(clip, i, maxSectionHeight) {
  const x = clip.x;
  const width = clip.width;
  const y = clip.y + maxSectionHeight * i;
  const height = Math.min(maxSectionHeight, clip.height - maxSectionHeight * i);

  return {x, y, width, height};
}

function makePng({width, height}) {
  return new PNG({filterType: 4, colorType: 2, width, height}); // color, no alpha
}

function makePngFromBuffer(pngBuffer) {
  return new Promise((res, rej) => {
    const png = new PNG({filterType: 4, colorType: 2}); // color, no alpha

    png.parse(pngBuffer, (error) => {
      if (error) {
        rej(error);
      } else {
        res(png);
      }
    });
  });
}

function bitBltSectionInto(sectionPng, screenshotPng, {width, height}, sectionHeight, i) {
  const sourceX = 0;
  const sourceY = 0;
  const destinationX = 0;
  const destinationY = sectionHeight * i;

  sectionPng.bitblt(screenshotPng, sourceX, sourceY, width, height, destinationX, destinationY);
}
