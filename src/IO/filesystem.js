import browser from 'webextension-polyfill'

export function downloadFile(input) {
  browser.downloads.download({
    filename: 'visual-grid-config.yml',
    url: createBlob('application/yaml', input),
    saveAs: false,
    conflictAction: 'overwrite',
  })
}

let previousFile
function createBlob(_mimeType, data) {
  const blob = new Blob([data], {
    type: 'text/plain',
  })
  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (previousFile !== null) {
    window.URL.revokeObjectURL(previousFile)
  }
  previousFile = window.URL.createObjectURL(blob)
  return previousFile
}
