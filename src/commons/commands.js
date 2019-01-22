// If you change aynthing here make sure to also change plugin-manifest.json
export const CommandIds = {
  CheckWindow: 'eyesCheckWindow',
  CheckRegion: 'eyesCheckRegion',
  CheckElement: 'eyesCheckElement',
  SetMatchLevel: 'eyesSetMatchLevel',
  SetMatchTimeout: 'eyesSetMatchTimeout',
  SetViewportSize: 'eyesSetViewportSize',
}

const CommandNames = Object.values(CommandIds)

export function isEyesCommand(command) {
  return CommandNames.includes(command)
}
