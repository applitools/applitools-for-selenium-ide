;(() => {
  const domCapture = require('@applitools/dom-capture/dist/captureDomCjs.js')
  const domSnapshot = require('@applitools/dom-snapshot/dist/processPageCjs.js')
  window.addEventListener('message', event => {
    if (event.data && event.data.direction == 'from-eyes-content-script') {
      if (event.data.scriptType) {
        let p
        if (event.data.scriptType == 'domCapture') {
          p = domCapture()
        } else if (event.data.scriptType == 'domSnapshot') {
          p = domSnapshot()
        }
        p.then(result => {
          event.source.postMessage(
            {
              id: event.data.id,
              direction: 'from-page',
              result,
            },
            '*'
          )
        }).catch(error => {
          event.source.postMessage(
            {
              id: event.data.id,
              direction: 'from-page',
              error,
            },
            '*'
          )
        })
      }
    }
  })
})()
