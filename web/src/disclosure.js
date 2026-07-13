export function createDisclosureState(initialOpen = false) {
  return { open: initialOpen === true }
}

export function toggleDisclosure(state) {
  return { open: !state.open }
}
