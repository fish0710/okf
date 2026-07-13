export function createDisclosureState(initialOpen = false) {
  return { open: initialOpen === true }
}

export function toggleDisclosure(state) {
  return { open: !state.open }
}

export function getDisclosureLayout(state) {
  return state.open
    ? { panelClass: 'is-expanded', workspaceClass: 'map-expanded' }
    : { panelClass: 'is-collapsed', workspaceClass: 'map-collapsed' }
}
