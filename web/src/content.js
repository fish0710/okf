export function createContentIndex(concepts) {
  const ordered = [...concepts].sort((a, b) => a.id.localeCompare(b.id))
  return {
    concepts: ordered,
    byId: new Map(ordered.map((concept) => [concept.id, concept])),
  }
}

function searchableText(concept) {
  return [concept.id, concept.title, concept.description, ...(concept.tags ?? []), concept.markdown]
    .join(' ')
    .toLocaleLowerCase()
}

export function searchConcepts(index, query) {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) return [...index.concepts]
  return index.concepts
    .map((concept) => ({ concept, score: searchableText(concept).indexOf(needle) }))
    .filter(({ score }) => score >= 0)
    .sort((left, right) => left.score - right.score || left.concept.title.localeCompare(right.concept.title))
    .map(({ concept }) => concept)
}

export function filterConcepts(index, type) {
  if (!type || type === 'all') return [...index.concepts]
  return index.concepts.filter((concept) => concept.type === type)
}
