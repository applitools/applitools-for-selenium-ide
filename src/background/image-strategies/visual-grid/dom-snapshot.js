import { getDomSnapshot } from '../../dom-capture'

export async function getSnapshot(tabId) {
  const snapshot = await getDomSnapshot(tabId)
  removeCrossOriginIframes(snapshot.cdt, snapshot.frames)
  snapshot.resourceContents = snapshot.blobs.map(r => ({
    ...r,
    value: Buffer.from(r.value),
  }))

  return snapshot
}

function removeCrossOriginIframes(cdt, frames) {
  const frameUrls = new Set(frames.map(frame => frame.srcAttr))
  cdt.map(node => {
    if (node.nodeName === 'IFRAME') {
      const srcAttr = node.attributes.find(attr => attr.name === 'src')
      if (!frameUrls.has(srcAttr.value)) {
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
