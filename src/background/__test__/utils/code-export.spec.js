import {
  emitCheckWindow,
  emitCheckElement,
  emitSetMatchLevel,
  emitSetMatchTimeout,
  emitSetPreRenderHook,
  emitSetViewportSize,
  emitAfterEach,
  emitBeforeEach,
  emitDependency,
  emitInEachEnd,
  emitVariable,
} from '../../../background/utils/code-export'

// TODO: a11y
describe('code-export', () => {
  const languages = [
    'java-junit',
    'javascript-mocha',
    'python-pytest',
    'ruby-rspec',
    'csharp-nunit',
    'csharp-xunit',
  ]
  languages.forEach(language => {
    describe(language, () => {
      describe('commands', () => {
        it('checkWindow', () => {
          expect(emitCheckWindow(language, 'blah')).toMatchSnapshot()
          expect(emitCheckWindow(language)).toMatchSnapshot()
        })
        it('checkElement', () => {
          expect(
            emitCheckElement(language, 'By.id("blah")', 'blah')
          ).toMatchSnapshot()
          expect(emitCheckElement(language, 'By.id("blah")')).toMatchSnapshot()
        })
        it('setMatchLevel', () => {
          expect(emitSetMatchLevel(language, 'Layout')).toMatchSnapshot()
        })
        it('setViewportSize', () => {
          expect(emitSetViewportSize(language, 1024, 768)).toMatchSnapshot()
        })
        it('setMatchTimeout', () => {
          expect(emitSetMatchTimeout(language, 10000)).toMatchSnapshot()
        })
        it('setPreRenderHook', () => {
          expect(
            emitSetPreRenderHook(language, 'console.log("blah");', {
              isVisualGridEnabled: true,
            })
          ).toMatchSnapshot()
          expect(
            emitSetPreRenderHook(language, 'console.log("blah");')
          ).toMatchSnapshot()
        })
      })
      describe('hooks', () => {
        it('afterEach', () => {
          expect(
            emitAfterEach(language, { isVisualGridEnabled: true })
          ).toMatchSnapshot()
          expect(emitAfterEach(language)).toMatchSnapshot()
        })
        it('beforeEach', () => {
          expect(
            emitBeforeEach(language, 'project blah', 'test blah')
          ).toMatchSnapshot()
          expect(
            emitBeforeEach(language, 'project blah', 'test blah', {
              baselineEnvName: 'blah',
            })
          ).toMatchSnapshot()
          expect(
            emitBeforeEach(language, 'project blah', 'test blah', {
              visualGridOptions: [
                {
                  deviceName: 'ipad',
                  deviceId: 'IPAD',
                  screenOrientation: 'portrait',
                },
              ],
            })
          ).toMatchSnapshot()
          expect(
            emitBeforeEach(language, 'project blah', 'test blah', {
              visualGridOptions: [
                {
                  id: 'chrome',
                  width: '100',
                  height: '100',
                },
              ],
            })
          ).toMatchSnapshot()
        })
        it('dependency', () => {
          expect(
            emitDependency(language, { isVisualGridEnabled: true })
          ).toMatchSnapshot()
          expect(emitDependency(language)).toMatchSnapshot()
        })
        it('inEachEnd', () => {
          expect(emitInEachEnd(language)).toMatchSnapshot()
          expect(
            emitInEachEnd(language, { isVisualGridEnabled: true })
          ).toMatchSnapshot()
        })
        it('variable', () => {
          expect(
            emitVariable(language, { isVisualGridEnabled: true })
          ).toMatchSnapshot()
          expect(emitVariable(language)).toMatchSnapshot()
        })
      })
    })
  })
})
