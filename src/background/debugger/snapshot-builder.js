import Debugger from "./index.js";

export function buildSnapshot(tabId) {
  const dbg = new Debugger(tabId);
  return dbg.attach().then(() => (
    dbg.getDOMSnapshot().then(snapshot => {
      const domNodes = reduceDOMNodes(snapshot.domNodes);
      return dbg.enablePageAgent().then(() => (
        getResources(dbg).then(({ frame, resources }) => (
          Promise.all(resources.map(resource => (
            dbg.getResourceContent(frame.id, resource.url)
          ))).then(contents => ({
            url: frame.url,
            domNodes: domNodes,
            resourceContents: resources.map((resource, i) => ({
              url: resource.url,
              mimeType: resource.mimeType,
              content: contents[i].content
            }))
          }))
        ))
      ));
    })
  )).then((r) => (
    dbg.detach().then(() => (r))
  )).catch((e) => (
    dbg.detach().then(() => {throw e;})
  ));
}

function getResources(dbg) {
  return dbg.getResourceTree().then(({ frameTree }) => {
    return {
      frame: frameTree.frame,
      resources: frameTree.resources.filter(resource => (
        resource.contentSize && resource.url !== frameTree.frame.url && !resource.type !== "Script"
      ))
    };
  });
}

function reduceDOMNodes(domNodes) {
  return domNodes.map(({nodeName, nodeType, attributes, childNodeIndexes}) => ({
    nodeName, nodeType, attributes, childNodeIndexes
  }));
}
