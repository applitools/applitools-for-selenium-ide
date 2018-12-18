const storage = {}

let q = []

export function get(...argv) {
  const p = new Promise(res => {
    argv.reduce((data, key) => {
      data[key] = storage[key]
      return res(data)
    }, {})
  })
  q.push(p)
  return p
}

export function set(keys) {
  const p = new Promise(res => {
    Object.assign(storage, keys)
    return res()
  })
  q.push(p)
  return p
}

export function waitForCompletion() {
  return Promise.all(q).then(() => {
    q = []
    return storage
  })
}

export default { get, set }
