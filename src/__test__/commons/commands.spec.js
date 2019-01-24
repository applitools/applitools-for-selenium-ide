import { isEyesCommand, containsEyesCommands } from '../../commons/commands'

describe('Commands', () => {
  describe('isEyesCommand', () => {
    it('should find a valid eyes command', () => {
      expect(isEyesCommand('eyesCheckWindow')).toBeTruthy()
    })
    it('should not find an invalid eyes command', () => {
      expect(isEyesCommand('open')).toBeFalsy()
    })
  })
  describe('containsEyesCommands', () => {
    it('should determine if a group of commands contains one or more valid eyes command', () => {
      const commands = [
        'open',
        'eyesSetViewportSize',
        'eyesSetBaselineEnvName',
        'click',
        'eyesCheckWindow',
      ]
      expect(containsEyesCommands(commands)).toBeTruthy()
    })
    it('should determine if a group of commands does not contain a valid eyes command', () => {
      // set viewport size is ignored
      expect(containsEyesCommands(['open', 'eyesSetViewportSize'])).toBeFalsy()
      expect(containsEyesCommands(undefined)).toBeFalsy()
    })
  })
})
