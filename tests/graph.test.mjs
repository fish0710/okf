import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildGraphModel, focusNeighbors } from '../web/src/graph.js'

const sampleConcepts = [
  { id: 'a', type: 'concept', title: 'A', links: [{ targetId: 'b', label: 'B' }] },
  { id: 'b', type: 'example', title: 'B', links: [{ targetId: 'c', label: 'C' }] },
  { id: 'c', type: 'practice', title: 'C', links: [] },
]

test('creates one node per concept and one directed edge per link', () => {
  const model = buildGraphModel(sampleConcepts)
  assert.equal(model.nodes.length, sampleConcepts.length)
  assert.deepEqual(model.edges, [
    { sourceId: 'a', targetId: 'b', label: 'B' },
    { sourceId: 'b', targetId: 'c', label: 'C' },
  ])
})

test('focuses a selected node and its one-hop neighbors', () => {
  const model = buildGraphModel(sampleConcepts)
  const focus = focusNeighbors(model, 'b')
  assert.deepEqual(focus.visibleIds, new Set(['a', 'b', 'c']))
  assert.deepEqual(focus.visibleEdgeKeys, new Set(['a->b', 'b->c']))
})

test('does not mutate the graph model while focusing an unknown node', () => {
  const model = buildGraphModel(sampleConcepts)
  const focus = focusNeighbors(model, 'missing')
  assert.deepEqual(focus.visibleIds, new Set(['missing']))
  assert.deepEqual(model.nodes.map((node) => node.id), ['a', 'b', 'c'])
})
