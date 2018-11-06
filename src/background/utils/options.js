import browser from 'webextension-polyfill'

export function setupOptions() {
  return browser.storage.local.get(['openUrls']).then(options => {
    return browser.storage.local.set({
      disableVisualCheckpoints: options.hasOwnProperty(
        'disableVisualCheckpoints'
      )
        ? options.disableVisualCheckpoints
        : false,
      openUrls: options.hasOwnProperty('openUrls') ? options.openUrls : true,
    })
  })
}
