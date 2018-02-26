import browser from "webextension-polyfill";

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
    height: 100,
    width: 450
  };

  return browser.windows.create(Object.assign({
    url: browser.extension.getURL("assets/index.html"),
    type: "popup"
  }, size)).then((windowInfo) => {
    extensionWindow = windowInfo;
    return windowInfo;
  });
}
