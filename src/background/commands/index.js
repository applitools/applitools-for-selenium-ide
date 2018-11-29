export function isEyesCommand(command) {
  return (
    command === 'checkWindow' ||
    command === 'checkRegion' ||
    command === 'checkElement' ||
    command === 'setViewportSize' ||
    command === 'setMatchLevel'
  )
}
