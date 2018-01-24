import browser from "webextension-polyfill";
import { Buffer } from "buffer/";
import GeometryUtils from "eyes.utils/src/GeometryUtils";

const _MAX_SCROLL_BAR_SIZE = 50;
const _MIN_SCREENSHOT_PART_SIZE = 10;

export function getCurrentScrollPosition(tabId) {
  const left = browser.tabs.executeScript(tabId, {
    code: "var doc = document.documentElement; var resultX = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0); resultX"
  });
  const top = browser.tabs.executeScript(tabId, {
    code: "var doc = document.documentElement; var resultY = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0); resultY"
  });

  return Promise.all([left, top]).then(results => ({x: parseInt(results[0][0]), y: parseInt(results[1][0])}));
}

export function scrollTo(tabId, x, y) {
  return browser.tabs.executeScript(tabId, { code: `window.scrollTo(${x},${y})` });
}

export function getCurrentTransform(tabId) {
  return browser.tabs.executeScript(tabId, { code: "document.documentElement.style.transform" }).then(res => (res[0]));
}

export function setTransform(tabId, transformToSet = "") {
  return browser.tabs.executeScript(tabId,
    { code: `var originalTransform = document.documentElement.style.transform;
    document.documentElement.style.transform = '${transformToSet}';
    originalTransform` }).then((results) => (results[0]));
}

export function translateTo(tabId, x, y) {
  return setTransform(tabId, { code: `translate(-${x}px, -${y}px)` });
}

export function getEntirePageSize(tabId) {
  console.log(tabId);
  const scrollWidthPromise = browser.tabs.executeScript(tabId, { code: "document.documentElement.scrollWidth" });
  const bodyScrollWidthPromise = browser.tabs.executeScript(tabId, { code: "document.body.scrollWidth" });

  // IMPORTANT: Notice there's a major difference between scrollWidth
  // and scrollHeight. While scrollWidth is the maximum between an
  // element's width and its content width, scrollHeight might be
  // smaller (!) than the clientHeight, which is why we take the
  // maximum between them.
  const clientHeightPromise = browser.tabs.executeScript(tabId, { code: "document.documentElement.clientHeight" });
  const bodyClientHeightPromise = browser.tabs.executeScript(tabId, { code: "document.body.clientHeight" });
  const scrollHeightPromise = browser.tabs.executeScript(tabId, { code: "document.documentElement.scrollHeight" });
  const bodyScrollHeightPromise = browser.tabs.executeScript(tabId, { code: "document.body.scrollHeight" });

  return Promise.all([scrollWidthPromise, bodyScrollWidthPromise, clientHeightPromise, bodyClientHeightPromise, scrollHeightPromise, bodyScrollHeightPromise]).then((results) => {
    // Notice that each result is itself actually an array (since executeScript returns an Array).
    // Also, we since 'parseInt' (and in turn 'max') might return NaN, we add the "|| 0" to each such call.
    const scrollWidth = parseInt(results[0][0]) || 0;
    const bodyScrollWidth = parseInt(results[1][0]) || 0;
    const totalWidth = Math.max(scrollWidth, bodyScrollWidth) || 0;

    const clientHeight = parseInt(results[2][0]) || 0;
    const bodyClientHeight = parseInt(results[3][0]) || 0;
    const scrollHeight = parseInt(results[4][0]) || 0;
    const bodyScrollHeight = parseInt(results[5][0]) || 0;

    const maxDocumentElementHeight = Math.max(clientHeight, scrollHeight) || 0;
    const maxBodyHeight = Math.max(bodyClientHeight, bodyScrollHeight) || 0;
    const totalHeight = Math.max(maxDocumentElementHeight, maxBodyHeight) || 0;

    return ({width: totalWidth, height: totalHeight});
  });
}

export function getDevicePixelRatio(tabId) {
  return browser.tabs.executeScript(tabId, { code: "window.devicePixelRatio" }).then((results) => (parseFloat(results[0])));
}

export function scaleImage(dataUri, scaleRatio) {
  return new Promise((resolve) => {
  // If there's no need to scale, resolve to the original dataUri
    if (scaleRatio === 1.0) {
      return resolve(dataUri);
    }


    const image = new Image();
    image.onload = function () {
      // We use canvas for scaling.
      const canvas = document.createElement("canvas");
      canvas.width = image.width * scaleRatio;
      canvas.height = image.height * scaleRatio;
      const ctx = canvas.getContext("2d");

      // This will cause the image to be drawn in the scaled size.
      ctx.scale(scaleRatio, scaleRatio);
      ctx.drawImage(image, 0, 0);

      resolve(canvas.toDataURL());
    };
    image.src = dataUri;
  });
}

export function getZoom(tabId) {
  return browser.tabs.getZoom(tabId);
}

export function setZoom(tabId, zoomFactor) {
  return browser.tabs.setZoom(tabId, zoomFactor);
}

export function getOverflow(tabId) {
  browser.tabs.executeScript(tabId, { code: "document.documentElement.style.overflow" }).then((res) => (res[0]));
}

export function setOverflow(tabId, overflowValue) {
  browser.tabs.executeScript(tabId, { code: `var origOF = document.documentElement.style.overflow; document.documentElement.style.overflow = "${overflowValue}"; origOF` }).then((res) => (res[0]));
}

export function removeScrollBars(tabId) {
  return setOverflow(tabId, "hidden");
}

export function getTabScreenshot(windowId, withImage = false, scaleRatio = 1.0, sizesNotToScale) {
  let isScaled = true; // we'll scale unless we find that the size match in "sizesNotToScale".

  return new Promise((resolve) => {
    browser.tabs.captureVisibleTab(windowId, {format: "png"}).then(originalDataUri => {
      // If there are sizes not to scale, we compare them to the current size of the image.
      if (sizesNotToScale && sizesNotToScale.length) {
        // Create an image from the dataUri so we can get its width/height.
        const image = new Image();
        image.onload = function () {
          for (let i = 0; i < sizesNotToScale.length; ++i) {
            // Checking the width is enough for us.
            if (image.width === sizesNotToScale[i].width) {
              isScaled = false;
              break;
            }
          }
          if (isScaled) {
            return scaleImage(originalDataUri, scaleRatio).then(dataUri => (resolve(dataUri)));
          } else {
            return resolve(originalDataUri);
          }
        };
        image.src = originalDataUri;
      } else {
        // If there's no "sizesNotToScale" list, we scale the image.
        return scaleImage(originalDataUri, scaleRatio).then(dataUri => (resolve(dataUri)));
      }
    });
  }).then(dataUri => {
    // Whether or not we scaled the image, we should now return the result.
    return new Promise((resolve) => {
      // Create the image buffer.
      const image64 = dataUri.replace("data:image/png;base64,", "");
      const imageBuffer = new Buffer(image64, "base64");
      if (withImage) {
        const updatedImage = new Image();
        updatedImage.onload = function () {
          return resolve({imageBuffer, image: updatedImage, isScaled});
        };
        updatedImage.src = dataUri;
      } else {
        // If we don't need to return an Image object
        return resolve({imageBuffer, isScaled});
      }
    });
  });
}

function sleep(time = 300) {
  return new Promise(res => {
    setTimeout(() => {
      res(true);
    }, time);
  });
}

function getPagePart(partsPromise, tabId, windowId, partRegion, scaleRatio, viewportSize) {
  let currentScrollPosition, pagePartWaitTime = 300;
  const position = {left: partRegion.left, top: partRegion.top};
  const partSize = {width: partRegion.width, height: partRegion.height};
  return partsPromise.then(() => (
    // Try to scroll to the required position, and give it time to stabilize.
    translateTo(tabId, position.left, position.top).then(() => (
      sleep(pagePartWaitTime)
    ))
  )).then(() => {
    currentScrollPosition = {x: position.left, y: position.top};
    // We don't want to scale the image, as this will be performed in the final stitching.
    return getTabScreenshot(windowId, true, scaleRatio, [viewportSize]);
  }).then((imageObj) => {
    const pngImage = imageObj.image;
    const part = {image: pngImage,
      position: {left: currentScrollPosition.x, top: currentScrollPosition.y},
      size: partSize};
    return Promise.resolve(part);
  });
}

export function stitchImage(fullSize, parts) {
  // We'll use canvas for stitching an image.
  const canvas = document.createElement("canvas");
  canvas.width = fullSize.width;
  canvas.height = fullSize.height;
  const ctx = canvas.getContext("2d");

  for (let i = 0; i < parts.length; ++i) {
    const currentPart = parts[i];

    ctx.drawImage(currentPart.image, 0, 0, currentPart.size.width, currentPart.size.height,
      currentPart.position.left, currentPart.position.top, currentPart.size.width, currentPart.size.height);
  }

  const stitchedDataUri = canvas.toDataURL();
  // Create the image buffer.
  const image64 = stitchedDataUri.replace("data:image/png;base64,", "");
  return Promise.resolve(new Buffer(image64, "base64"));
}

export function getFullPageScreenshot(tabId, windowId, scaleRatio = 1.0, viewportSize, entirePageSize) {
  let originalScrollPosition, originalTransform, partSize;
  const imageParts = [];

  return new Promise((resolve, reject) => {

    // Saving the original scroll position.
    getCurrentScrollPosition(tabId).then((originalScrollPosition_) => {
      originalScrollPosition = originalScrollPosition_;
      // Scrolling to the top/left of the page.
      return scrollTo(tabId, 0, 0);
    }).then(() => (
      // Get the original transform value for the tab
      getCurrentTransform(tabId)
    )).then((originalTransform_) => {
      originalTransform = originalTransform_;
      return sleep(1000);
    }).then(() => (
      // Sleep time before initial screenshot.
      sleep()
    )).then(() => (
      // Capture the first image part, or entire screenshot.
      getTabScreenshot(windowId, true, scaleRatio, [viewportSize, entirePageSize])
    )).then((imageObj) => {
      const { image } = imageObj;

      // If the screenshot is already the full page screenshot, we go back to the original position and
      // return it.
      if (image.width >= (entirePageSize.width - 1) && image.height >= (entirePageSize.height - 1)) {
        return setTransform(tabId, originalTransform, 250).then(() => (
          scrollTo(tabId, originalScrollPosition.x, originalScrollPosition.y).then(() => (
            resolve(imageObj.imageBuffer)
          ))
        ));
      } else {

        // Calculate the parts size based on the captured image, notice it's smaller than the actual image
        // size, so we can overwrite fixed position footers or right bars (unfortunately, handling fixed
        // position headers/left bars).
        const partSizeWidth = Math.max(image.width - _MAX_SCROLL_BAR_SIZE, _MIN_SCREENSHOT_PART_SIZE);
        const partSizeHeight = Math.max(image.height - _MAX_SCROLL_BAR_SIZE, _MIN_SCREENSHOT_PART_SIZE);
        partSize = {width: partSizeWidth, height: partSizeHeight};

        // Create the part for the first image, and add it to the parts list.
        const part = {
          image: image,
          position: {left: 0, top: 0},
          size: partSize
        };
        imageParts.push(part);

        // Get the properties of the regions which will compose the stitched images.
        const entirePageRegion = {top: 0, left: 0, width: entirePageSize.width, height: entirePageSize.height};
        const subRegions = GeometryUtils.getSubRegions(entirePageRegion, partSize);

        let i, partRegion;
        let partsPromise = Promise.resolve();
        // Going over each sub region and capturing the respective image part.
        for (i = 0; i < subRegions.length; ++i) {
          partRegion = subRegions[i];

          if (partRegion.left === 0 && partRegion.top === 0) {
            continue;
          }

          // Since both the scrolling and the capturing operations are async, we must chain them.
          //noinspection JSLint
          partsPromise = getPagePart(partsPromise, tabId, windowId, partRegion, scaleRatio, viewportSize).then((part) => {
            imageParts.push(part);
            return resolve();
          });
        }

        return partsPromise.then(() => (
          setTransform(tabId, originalTransform, 250).then(() => (
            // Okay, we've got all the parts, return to the original location.
            scrollTo(tabId, originalScrollPosition.x, originalScrollPosition.y).then(() => (
              // Give the scrolling time to stabilize.
              sleep(250)
            ))
          ))
        )).then(() => (
          // Stitch the image from the parts we collected and return the stitched image buffer.
          stitchImage(entirePageSize, imageParts).then((stitchedImageBuffer) => (
            resolve(stitchedImageBuffer)
          ))
        ));
      }
    });
  });
}

export function getScreenshot(tabId, windowId, forceFullPageScreenshot, removeScrollBars, viewportSize) {
  let entirePageSize, scaleRatio, originalZoom;
  let imageBuffer;
  let originalOverflow = undefined;

  return new Promise((resolve) => {
    getZoom(tabId).then((originalZoom_) => {
      originalZoom = originalZoom_ ? originalZoom_ : 1.0;
      if (originalZoom !== 1.0) {
        // set the zoom to 100%
        return setZoom(tabId, 1.0, 300);
      } else {
        return Promise.resolve();
      }
    }).then(() => {
      if (removeScrollBars) {
        return removeScrollBars(tabId).then(() => (
          sleep(150)
        ));
      }
      return Promise.resolve();
    }).then((originalOverflow_) => {
      originalOverflow = originalOverflow_;
      return getEntirePageSize(tabId);
    }).then((entirePageSize_) => {
      entirePageSize = entirePageSize_;
      return getDevicePixelRatio(tabId).then((devicePixelRatio) => {
        scaleRatio = 1 / devicePixelRatio;
        if (forceFullPageScreenshot) {
          return getFullPageScreenshot(tabId, windowId, scaleRatio, viewportSize, entirePageSize);
        }
        return getTabScreenshot(windowId, false, scaleRatio, [viewportSize, entirePageSize]).then((imageObj) => (
          Promise.resolve(imageObj.imageBuffer)
        ));
      }).then((imageBuffer_) => {
        imageBuffer = imageBuffer_;
        // If we removed the scrollbars, we need to put back the original overflow value.
        if (originalOverflow) {
          return setOverflow(tabId, originalOverflow).then(() => sleep(150));
        }
      }).then(() => {
        // If needed, set the zoom back to its original factor.
        if (originalZoom !== 1.0) {
          return setZoom(tabId, originalZoom).then(() => sleep());
        }
      }).then(() => (
        resolve(imageBuffer)
      ));
    });
  });
}
