import {
  cleanup,
  fireEvent,
  render,
  waitForElement,
} from 'react-testing-library'
import React from 'react'
import Normal from '../../../containers/Normal'
import uuidv4 from 'uuid/v4'
jest.mock('../../../../IO/storage')
import { waitForCompletion } from '../../../../IO/storage'

describe('Visual grid options', () => {
  beforeEach(async () => {
    doRender()
    await waitForElement(() => findElement('#enable-visual-grid'))
  })

  afterEach(cleanup)

  it('disabling visual grid options hides them', async () => {
    click('#enable-visual-grid')
    await waitForElement(() => !findElement('.visual-grid-options'))
    expect(findElement('.visual-grid-options')).toBeNull()
  })

  it('select a browser', () => {
    click('.category.browsers .add.inner')
    click('.browsers .checkbox')
    click('.btn.confirm')
    waitForCompletion().then(storage => {
      expect(storage.projectSettings[projectId].selectedBrowsers).toEqual([
        'Chrome',
      ])
    })
  })

  it('select a predefined viewport', () => {
    click('.category.viewports .add.inner')
    click('.predefined-viewport-sizes .checkbox')
    click('.btn.confirm')
    waitForCompletion().then(storage => {
      expect(storage.projectSettings[projectId].selectedViewportSizes).toEqual([
        '2560x1440',
      ])
    })
  })

  it('create and select a custom viewport', async () => {
    click('.category.viewports .add.inner')
    click('.custom-viewport-sizes .add.inner')
    await waitForElement(() => findElement('.custom-viewport-size'))
    sendKeys('.custom-viewport-size .width', '100')
    sendKeys('.custom-viewport-size .height', '100')
    click('.custom-viewport-size .checkbox')
    click('.btn.confirm')
    waitForCompletion().then(storage => {
      expect(storage.projectSettings[projectId].selectedViewportSizes).toEqual([
        '100x100',
      ])
    })
  })

  it('create and delete a custom viewport', async () => {
    click('.category.viewports .add.inner')
    click('.custom-viewport-sizes .add.inner')
    await waitForElement(() => findElement('.custom-viewport-size'))
    sendKeys('.custom-viewport-size .width', '100')
    sendKeys('.custom-viewport-size .height', '100')
    mouseOver('.custom-viewport-size')
    click('.custom-viewport-size .close.inner')
    click('.btn.confirm')
    waitForCompletion().then(storage => {
      expect(storage.projectSettings[projectId].selectedViewportSizes).toEqual(
        []
      )
    })
  })
})

const projectId = uuidv4()

function doRender() {
  const { container } = render(
    <Normal
      enableVisualCheckpoints={true}
      visualCheckpointsChanged={() => {}}
      projectId={projectId}
    />
  )
  return container
}

function findElement(locator) {
  return document.querySelector(locator)
}

function click(locator) {
  fireEvent.click(findElement(locator))
}

function sendKeys(locator, text) {
  fireEvent.input(findElement(locator), {
    target: { value: `${text}` },
  })
}

function mouseOver(locator) {
  fireEvent.mouseOver(findElement('.custom-viewport-size'))
}
