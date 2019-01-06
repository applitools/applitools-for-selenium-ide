import { cleanup, render, waitForElement } from 'react-testing-library'
import {
  click,
  findElement,
  innerHtml,
  mouseOver,
  sendKeys,
} from '../../../../../tests/utils'
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

  // user flow

  it.only('disabling visual grid options hides them', async () => {
    click('#enable-visual-grid')
    //await waitForElement(() => !findElement('.visual-grid-options'))
    //expect(findElement('.visual-grid-options')).toBeNull()
    await waitForElement(() => !findElement('.disclaimer'))
    expect(findElement('.disclaimer')).toBeNull()
  })

  it('terms of service presented', () => {
    expect(innerHtml('.disclaimer')).toBeTruthy()
    click('.disclaimer button')
    expect(innerHtml('.disclaimer')).toBeFalsy()
  })

  it('browser is populated with a sensible default', () => {
    acceptEula()
    expect(
      innerHtml('.category.browsers .selected-options .option-text')
    ).toBeTruthy()
  })

  it('viewport size is displayed only when a browser is selected', async () => {
    acceptEula()
    await toggleSelectedBrowser()
    expect(innerHtml('.category.viewports')).toBeFalsy()
  })

  it('viewport size is populated with a sensible default', () => {
    acceptEula()
    expect(innerHtml('.category.viewports')).toBeTruthy()
    expect(
      innerHtml('.category.viewports .selected-options .option-text')
    ).toBeTruthy()
  })

  it('error displayed when no viewport size selected', async () => {
    acceptEula()
    click('.category.viewports .selected-options .close.outer')
    await waitForCompletion()
    expect(innerHtml('.category.viewports .error-message')).toBeTruthy()
  })

  it('device orientation is displayed when a device type is selected', async () => {
    acceptEula()
    expect(innerHtml('.category.device-orientations')).toBeFalsy()
    await toggleSelectedDevice()
    expect(innerHtml('.category.device-orientations')).toBeTruthy()
  })

  it('device orientation is populated with a sensible default', async () => {
    acceptEula()
    await toggleSelectedDevice()
    expect(
      innerHtml('.category.device-orientations .selected-options .option-text')
    ).toBeTruthy()
  })

  it('error displayed when no device orientation selected', async () => {
    acceptEula()
    await toggleSelectedDevice()
    click('.category.device-orientations .selected-options .close.outer')
    await waitForCompletion()
    expect(
      innerHtml('.category.device-orientations .error-message')
    ).toBeTruthy()
  })

  // browsers

  it('remove a selected browser', async () => {
    acceptEula()
    let storage
    click('.category.browsers .selected-options .close.inner')
    storage = await waitForCompletion()
    expect(
      storage.projectSettings[projectId].selectedBrowsers.length
    ).toBeFalsy()
    storage = await toggleSelectedBrowser()
    expect(
      storage.projectSettings[projectId].selectedBrowsers.length
    ).toBeTruthy()
    storage = await toggleSelectedBrowser()
    expect(
      storage.projectSettings[projectId].selectedBrowsers.length
    ).toBeFalsy()
  })

  // viewports

  it('remove a predefined viewport size', async () => {
    acceptEula()
    let storage
    click('.category.viewports .selected-options .close.inner')
    storage = await waitForCompletion()
    expect(
      storage.projectSettings[projectId].selectedViewportSizes.length
    ).toBeFalsy()

    click('.category.viewports .add.inner')
    const selectedSize = innerHtml('.predefined-viewport-sizes label div')
    click('.predefined-viewport-sizes .checkbox')
    click('.btn.confirm')
    storage = await waitForCompletion()
    expect(
      storage.projectSettings[projectId].selectedViewportSizes.includes(
        selectedSize
      )
    ).toBeTruthy()

    click('.category.viewports .add.inner')
    click('.predefined-viewport-sizes .checkbox')
    click('.btn.confirm')
    storage = await waitForCompletion()
    expect(
      storage.projectSettings[projectId].selectedViewportSizes.includes(
        selectedSize
      )
    ).toBeFalsy()
  })

  it('create and select a custom viewport', async () => {
    await acceptEula()
    await addCustomViewport(100, 100)
    click('.custom-viewport-size .checkbox')
    click('.btn.confirm')
    const storage = await waitForCompletion()
    expect(
      storage.projectSettings[projectId].selectedViewportSizes.includes(
        '100x100'
      )
    ).toBeTruthy()
  })

  it('create and delete a custom viewport', async () => {
    await acceptEula()
    await addCustomViewport(100, 100)
    mouseOver('.custom-viewport-size')
    click('.custom-viewport-size .close.inner')
    click('.btn.confirm')
    const storage = await waitForCompletion()
    expect(
      storage.projectSettings[projectId].selectedViewportSizes.includes(
        '100x100'
      )
    ).toBeFalsy()
  })

  it('negative numbers ignored when creating a custom viewport', async () => {
    await acceptEula()
    await addCustomViewport(-100, -100)
    click('.custom-viewport-size .checkbox')
    click('.btn.confirm')
    const storage = await waitForCompletion()
    expect(
      storage.projectSettings[projectId].selectedViewportSizes.includes(
        '100x100'
      )
    ).toBeTruthy()
  })

  // device orientations

  it('remove a selected device orientation', async () => {
    acceptEula()
    let storage
    await toggleSelectedDevice()

    click('.category.device-orientations .selected-options .close.inner')
    storage = await waitForCompletion()
    expect(
      storage.projectSettings[projectId].selectedDeviceOrientations.length
    ).toBeFalsy()

    click('.category.device-orientations .add.inner')
    click('.select-device-orientations .checkbox')
    click('.btn.confirm')
    storage = await waitForCompletion()
    expect(
      storage.projectSettings[projectId].selectedDeviceOrientations.length
    ).toBeTruthy()

    click('.category.device-orientations .add.inner')
    click('.select-device-orientations .checkbox')
    click('.btn.confirm')
    storage = await waitForCompletion()
    expect(
      storage.projectSettings[projectId].selectedDeviceOrientations.length
    ).toBeFalsy()
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

async function toggleSelectedBrowser() {
  click('.category.browsers .add.inner')
  click('.select-browsers .checkbox')
  click('.btn.confirm')
  return await waitForCompletion()
}

async function toggleSelectedDevice() {
  click('.category.browsers .add.inner')
  click('.select-devices .checkbox')
  click('.btn.confirm')
  await waitForCompletion()
}

async function addCustomViewport(width, height) {
  click('.category.viewports .add.inner')
  click('.custom-viewport-sizes .add.inner')
  await waitForElement(() => findElement('.custom-viewport-size'))
  sendKeys('.custom-viewport-size .width', width)
  sendKeys('.custom-viewport-size .height', height)
}

async function acceptEula() {
  click('.disclaimer button')
  await waitForElement(() => !findElement('.disclaimer'))
}
