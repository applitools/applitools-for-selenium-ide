import storage from '../../IO/storage'

export function setupOptions() {
  return storage
    .get([
      'openUrls, enableVisualCheckpoints, enableVisualGrid, enableDomCapture',
    ])
    .then(options => {
      return storage.set({
        enableVisualCheckpoints: options.hasOwnProperty(
          'enableVisualCheckpoints'
        )
          ? options.enableVisualCheckpoints
          : true,
        openUrls: options.hasOwnProperty('openUrls') ? options.openUrls : true,
        enableVisualGrid: options.hasOwnProperty('enableVisualGrid')
          ? options.enableVisualGrid
          : true,
        enableDomCapture: options.hasOwnProperty('enableDomCapture')
          ? options.enableDomCapture
          : true,
      })
    })
}
