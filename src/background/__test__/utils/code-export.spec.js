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
// NOTE: baselineEnvName used in setup, does not have its own emitter
describe('code-export', () => {
  describe('java-junit', () => {
    describe('commands', () => {
      it('checkWindow', () => {
        expect(emitCheckWindow('java-junit', 'blah')).toMatchSnapshot()
        expect(emitCheckWindow('java-junit')).toMatchSnapshot()
      })
      it('checkElement', () => {
        expect(
          emitCheckElement('java-junit', 'By.id("blah")', 'blah')
        ).toMatchSnapshot()
        expect(
          emitCheckElement('java-junit', 'By.id("blah")')
        ).toMatchSnapshot()
      })
      it('setMatchLevel', () => {
        expect(emitSetMatchLevel('java-junit', 'Layout')).toMatchSnapshot()
      })
      it('setViewportSize', () => {
        expect(emitSetViewportSize('java-junit', 1024, 768)).toMatchSnapshot()
      })
      it('setMatchTimeout', () => {
        expect(emitSetMatchTimeout('java-junit', 10000)).toMatchSnapshot()
      })
      it('setPreRenderHook', () => {
        expect(
          emitSetPreRenderHook('java-junit', 'console.log("blah");', {
            isVisualGridEnabled: true,
          })
        ).toMatchSnapshot()
        expect(
          emitSetPreRenderHook('java-junit', 'console.log("blah");')
        ).toMatchSnapshot()
      })
    })
    describe('hooks', () => {
      it('afterEach', () => {
        expect(
          emitAfterEach('java-junit', { isVisualGridEnabled: true })
        ).toMatchSnapshot()
        expect(emitAfterEach('java-junit')).toMatchSnapshot()
      })
      it('beforeEach', () => {
        expect(
          emitBeforeEach('java-junit', 'project blah', 'test blah')
        ).toMatchSnapshot()
        expect(
          emitBeforeEach('java-junit', 'project blah', 'test blah', {
            baselineEnvName: 'blah',
          })
        ).toMatchSnapshot()
        expect(
          emitBeforeEach('java-junit', 'project blah', 'test blah', {
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
          emitBeforeEach('java-junit', 'project blah', 'test blah', {
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
          emitDependency('java-junit', { isVisualGridEnabled: true })
        ).toMatchSnapshot()
        expect(emitDependency('java-junit')).toMatchSnapshot()
      })
      it('inEachEnd', () => {
        expect(emitInEachEnd('java-junit')).toMatchSnapshot()
        expect(
          emitInEachEnd('java-junit', { isVisualGridEnabled: true })
        ).toBeUndefined()
      })
      it('variable', () => {
        expect(
          emitVariable('java-junit', { isVisualGridEnabled: true })
        ).toMatchSnapshot()
        expect(emitVariable('java-junit')).toMatchSnapshot()
      })
    })
  })
  describe('javascript-mocha', () => {})
  describe('python-pytest', () => {})
  describe('ruby-rspec', () => {})
  describe('csharp-nunit', () => {})
  describe('csharp-xunit', () => {})
})
