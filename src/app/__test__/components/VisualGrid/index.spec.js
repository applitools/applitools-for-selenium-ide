import { cleanup, render, fireEvent } from 'react-testing-library'
import React from 'react'
import VisualGrid from '../../../components/VisualGrid'
import uuidv4 from 'uuid/v4'
jest.mock('../../../../IO/storage')
import { waitForCompletion } from '../../../../IO/storage'

describe('Visual grid options', () => {
  afterEach(cleanup)

  it('select a browser', () => {
    const container = renderContainer()
    fireEvent.click(findElement(container, '.category.browsers .add.inner'))
    fireEvent.click(findElement(document, '.browsers .checkbox'))
    fireEvent.click(findElement(document, '.btn.confirm'))
    waitForCompletion().then(storage => {
      expect(storage.projectSettings[projectId].selectedBrowsers).toEqual([
        'Chrome',
      ])
    })
  })

  it('select a predefined viewport', () => {
    const container = renderContainer()
    fireEvent.click(findElement(container, '.category.viewports .add.inner'))
    fireEvent.click(
      findElement(document, '.predefined-viewport-sizes .checkbox')
    )
    fireEvent.click(findElement(document, '.btn.confirm'))
    waitForCompletion().then(storage => {
      expect(storage.projectSettings[projectId].selectedViewportSizes).toEqual([
        '2560x1440',
      ])
    })
  })

  it.skip('create a custom viewport', () => {})
  it.skip('select a custom viewport', () => {})
})

const settings = {
  branch: '',
  parentBranch: '',
  enableVisualGrid: true,
  selectedBrowsers: [],
  selectedViewportSizes: [],
  customViewportSizes: [],
}

const projectId = uuidv4()

function renderContainer() {
  const { container } = render(
    <VisualGrid projectId={projectId} projectSettings={settings} />
  )
  return container
}

function findElement(container, locator) {
  return container.querySelector(locator)
}
