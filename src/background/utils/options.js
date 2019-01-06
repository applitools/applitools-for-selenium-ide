import storage from '../../IO/storage'

export function setupOptions() {
  return storage.get(['openUrls, enableVisualCheckpoints']).then(options => {
    return storage.set({
      enableVisualCheckpoints: options.hasOwnProperty('enableVisualCheckpoints')
        ? options.enableVisualCheckpoints
        : true,
      openUrls: options.hasOwnProperty('openUrls') ? options.openUrls : true,
    })
  })
}
