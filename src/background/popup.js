import browser from "webextension-polyfill";
import parser from "ua-parser-js";

let extensionWindow = undefined;

export function openOrFocusPopup() {
  if (extensionWindow) {
    return browser.windows.update(extensionWindow.id, {
      focused: true
    }).catch(openPage);
  } else {
    return openPage();
  }
}

function openPage() {
  let size = {
    height: 110,
    width: 470
  };

  let WindowsSize = {
    height: 150,
    width: 525
  };

  const parsedUA = parser(window.navigator.userAgent);

  return browser.windows.create(Object.assign({
    url: browser.extension.getURL("assets/index.html"),
    type: "popup"
  }, parsedUA.os.name === "Windows" ? WindowsSize : size)).then((windowInfo) => {
    extensionWindow = windowInfo;
    return windowInfo;
  });
}
