import { fireEvent } from 'react-testing-library'

function findElement(selector) {
  return document.querySelector(selector)
}

function click(selector) {
  fireEvent.click(findElement(selector))
}

function sendKeys(selector, text) {
  fireEvent.input(findElement(selector), {
    target: { value: `${text}` },
  })
}

function mouseOver(selector) {
  fireEvent.mouseOver(findElement(selector))
}

export { click, findElement, sendKeys, mouseOver }
