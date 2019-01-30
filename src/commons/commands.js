// If you change aynthing here make sure to also change plugin-manifest.json
export const CommandIds = {
  CheckWindow: 'eyesCheckWindow',
  CheckElement: 'eyesCheckElement',
  SetMatchLevel: 'eyesSetMatchLevel',
  SetMatchTimeout: 'eyesSetMatchTimeout',
  SetViewportSize: 'eyesSetViewportSize',
  SetBaselineEnvName: 'eyesSetBaselineEnvName',
}

const CommandNames = Object.values(CommandIds)

export function isEyesCommand(command) {
  return CommandNames.includes(command)
}

export function containsEyesCommands(commands) {
  if (!Array.isArray(commands)) return false
  const commandNames = [...CommandNames]
  commandNames.splice(
    commandNames.findIndex(name => name === 'eyesSetViewportSize'),
    1
  )
  return commands.map(command => commandNames.includes(command)).includes(true)
}
