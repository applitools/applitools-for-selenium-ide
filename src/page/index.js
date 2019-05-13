;(() => {
  const domCapture = require('raw-loader!@applitools/dom-capture/dist/captureDom.js')
  const domSnapshot = require('raw-loader!@applitools/dom-capture/dist/processPage.js')
  window.addEventListener('message', event => {
    if (event.data && event.data.direction == 'from-eyes-content-script') {
      if (event.data.scriptType) {
        let p
        if (event.data.scriptType == 'domCapture') {
          p = eval(`(${domCapture})()`)
        } else if (event.data.scriptType == 'domSnapshot') {
          p = eval(`(${domSnapshot})()`)
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
