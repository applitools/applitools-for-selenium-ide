import browser from 'webextension-polyfill'

export const DEFAULT_SERVER = 'https://eyesapi.applitools.com/'

export function verifyStoredAPIKey() {
  return browser.storage.local
    .get(['apiKey', 'eyesServer'])
    .then(({ apiKey, eyesServer }) => {
      if (!apiKey) {
        return Promise.reject(new Error("API key can't be empty"))
      } else {
        return fetch(
          `${
            new URL('/api/auth/access', eyesServer || DEFAULT_SERVER).href
          }?accessKey=${apiKey}`
        ).then(response => {
          if (response.ok) {
            return Promise.resolve()
          } else {
            return Promise.reject(
              new Error(
                'Unable to verify API check, verify the key and server correctness'
              )
            )
          }
        })
      }
    })
}
