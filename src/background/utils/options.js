import browser from 'webextension-polyfill'

export function setupOptions() {
  return browser.storage.local.get(['openUrls']).then(options => {
    return browser.storage.local.set({
      enableVisualCheckpoints: options.hasOwnProperty('enableVisualCheckpoints')
        ? options.enableVisualCheckpoints
        : true,
      openUrls: options.hasOwnProperty('openUrls') ? options.openUrls : true,
    })
  })
}
