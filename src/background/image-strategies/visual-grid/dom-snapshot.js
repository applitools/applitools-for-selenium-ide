import { getDomSnapshot } from '../../dom-capture'

export async function getSnapshot(tabId) {
  const snapshot = await getDomSnapshot(tabId)
  removeCrossOriginIframes(snapshot.cdt, snapshot.frames)
  snapshot.resourceContents = mapResourceContents(snapshot)
  mapFrameResourceContents(snapshot.frames)

  return snapshot
}

function mapFrameResourceContents(frames) {
  frames.forEach(frame => {
    frame.resourceContents = mapResourceContents(frame)
    mapFrameResourceContents(frame.frames)
  })
}

function mapResourceContents(snapshot) {
  return snapshot.blobs.map(r => ({
    ...r,
    value: Buffer.from(r.value),
  }))
}

function removeCrossOriginIframes(cdt, frames) {
  const frameUrls = new Set(frames.map(frame => frame.srcAttr))
  cdt.map(node => {
    if (node.nodeName === 'IFRAME') {
      const srcAttr = node.attributes.find(attr => attr.name === 'src')
      if (srcAttr && !frameUrls.has(srcAttr.value)) {
        srcAttr.value = ''
      }
    }
    return node
  })

  frames.forEach(frame => {
    removeCrossOriginIframes(frame.cdt, frame.frames)
  })

  return cdt
}
