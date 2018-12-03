import { parseOutExternalFrames } from '../../dom-capture'
jest.mock('webextension-polyfill')

describe('dom-capture', () => {
  it('runs only when valid input is provided', () => {
    expect(parseOutExternalFrames(undefined)).toEqual(undefined)
  })

  it('removes external frames header', () => {
    const input = [
      `@@@@@
      HTML[1]/BODY[1]/IFRAME[1]
      HTML[1]/BODY[1]/DIV[1]/DIV[2]/DIV[1]/DIV[1]/IFRAME[1]
      HTML[1]/BODY[1]/DIV[1]/DIV[3]/DIV[1]/DIV[1]/DIV[1]/DIV[1]/DIV[1]/DIV[2]/DIV[2]/IFRAME[1]
      HTML[1]/BODY[1]/DIV[1]/DIV[3]/DIV[1]/DIV[1]/DIV[1]/DIV[1]/DIV[1]/DIV[2]/DIV[2]/DIV[1]/SPAN[1]/IFRAME[1]
      -----`,
    ]
    expect(parseOutExternalFrames(input)).toEqual('')
  })

  it('replaces frame tokens with empty strings', () => {
    const input = [
      `"childNodes":["@@@@@HTML[1]/BODY[1]/DIV[1]/DIV[2]/DIV[1]/DIV[1]/IFRAME[1]@@@@@"],
       "childNodes":["@@@@@HTML[1]/BODY[1]/DIV[1]/DIV[2]/DIV[1]/DIV[1]/IFRAME[2]@@@@@"]`,
    ]
    expect(parseOutExternalFrames(input)).toEqual(
      `"childNodes":[""],
       "childNodes":[""]`
    )
  })

  it('removes leading newline and whitespace', () => {
    const input = [
      `
      blah`,
    ]
    expect(parseOutExternalFrames(input)).toEqual('blah')
  })
})
