import { parseOutExternalFrames } from '../../dom-capture'

describe('dom-capture', () => {
  it('runs only when valid input is provided', () => {
    expect(parseOutExternalFrames(undefined)).toEqual(undefined)
  })

  it('parses dom capture', () => {
    const input = [
      `{"separator":"-----","cssStartToken":"#####","cssEndToken":"#####","iframeStartToken":"\\"@@@@@","iframeEndToken":"@@@@@\\""}
http://url/to/css/1
http://url/to/css/2
http://url/to/css/3
-----
html[1]/body[1]/iframe[2],html[1]/body[1]/iframe[1]
html[1]/body[1]/div[10]/div[3]/iframe[2],html[1]/body[1]/div[4]/iframe[6]
-----
{"tagName":"HTML","style":{...},"rect":{...},"childNodes":[
  {"tagName":"BODY","style":{...},"rect":{...},"childNodes":[
    {"tagName":"DIV","style":{...},"rect":{...},"childNodes":[
      {"tagName":"#text","text":"hello"}]},
    {"tagName":"IFRAME","style":{...},"rect":{...},"attributes":{"src":"some/url.html"},"childNodes":[
      {"tagName":"HTML","style":{...},"rect":{...},"childNodes":[
        {"tagName":"BODY","style":{...},"rect":{...},"childNodes":[
          {"tagName":"IFRAME","style":{...},"rect":{...},"attributes":{"src":"http://localhost:7272/iframe.html","width":"200","height":"100"},"childNodes":["@@@@@html[1]/body[1]/iframe[2],html[1]/body[1]/iframe[1]@@@@@"]}],
      "css":"","images":{}}]}]}],
  "css":\`/** http://some/url.css **/
         div{border: 5px solid salmon;}
         /** http://url/to/css/1 **/
         #####http://url/to/css/1#####
         /** http://url/to/css/2 **/
         #####http://url/to/css/2#####
         /** http://url/to/css/3 **/
         #####http://url/to/css/3#####\`,
  "images":{}}`,
    ]
    expect(parseOutExternalFrames(input)).toEqual(
      `{"tagName":"HTML","style":{...},"rect":{...},"childNodes":[
  {"tagName":"BODY","style":{...},"rect":{...},"childNodes":[
    {"tagName":"DIV","style":{...},"rect":{...},"childNodes":[
      {"tagName":"#text","text":"hello"}]},
    {"tagName":"IFRAME","style":{...},"rect":{...},"attributes":{"src":"some/url.html"},"childNodes":[
      {"tagName":"HTML","style":{...},"rect":{...},"childNodes":[
        {"tagName":"BODY","style":{...},"rect":{...},"childNodes":[
          {"tagName":"IFRAME","style":{...},"rect":{...},"attributes":{"src":"http://localhost:7272/iframe.html","width":"200","height":"100"},"childNodes":[]}],
      "css":"","images":{}}]}]}],
  "css":\`/** http://some/url.css **/
         div{border: 5px solid salmon;}
         /** http://url/to/css/1 **/
         #####http://url/to/css/1#####
         /** http://url/to/css/2 **/
         #####http://url/to/css/2#####
         /** http://url/to/css/3 **/
         #####http://url/to/css/3#####\`,
  "images":{}}`
    )
  })
})
