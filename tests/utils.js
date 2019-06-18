import { fireEvent } from '@testing-library/react'

function click(selector) {
  fireEvent.click(findElement(selector))
}

function findElement(selector) {
  return document.querySelector(selector)
}

function innerHtml(selector) {
  const result = findElement(selector)
  return result ? result.innerHTML : ''
}

function mouseOver(selector) {
  fireEvent.mouseOver(findElement(selector))
}

function sendKeys(selector, text) {
  fireEvent.input(findElement(selector), {
    target: { value: `${text}` },
  })
}

export { click, findElement, innerHtml, mouseOver, sendKeys }
