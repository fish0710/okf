import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createContentIndex, filterConcepts, resolveConceptLink, searchConcepts } from '../web/src/content.js'
import { createDisclosureState, getDisclosureLayout, toggleDisclosure } from '../web/src/disclosure.js'
import { renderMarkdown } from '../web/src/markdown.js'

const sampleConcepts = [
  {
    id: 'foundations/frontmatter',
    title: 'YAML frontmatter',
    description: '可查询元数据。',
    type: 'concept',
    tags: ['okf', 'yaml'],
    markdown: '文件顶部的 frontmatter。',
  },
  {
    id: 'examples/orders',
    title: 'Orders 表',
    description: '订单事实表。',
    type: 'example',
    tags: ['sales'],
    markdown: '订单和用户。',
  },
]

test('searches title, description, tags, id, and body text', () => {
  const index = createContentIndex(sampleConcepts)
  assert.deepEqual(searchConcepts(index, 'frontmatter').map((item) => item.id), [
    'foundations/frontmatter',
  ])
  assert.deepEqual(searchConcepts(index, 'sales').map((item) => item.id), ['examples/orders'])
})

test('filters by type without changing the source concepts', () => {
  const index = createContentIndex(sampleConcepts)
  assert.ok(filterConcepts(index, 'example').every((item) => item.type === 'example'))
  assert.equal(filterConcepts(index, 'all').length, 2)
  assert.equal(sampleConcepts.length, 2)
})

test('starts collapsed and toggles without mutating disclosure state', () => {
  const collapsed = createDisclosureState()
  assert.deepEqual(collapsed, { open: false })

  const expanded = toggleDisclosure(collapsed)
  assert.deepEqual(expanded, { open: true })
  assert.deepEqual(collapsed, { open: false })
  assert.deepEqual(toggleDisclosure(expanded), { open: false })
})

test('maps disclosure state to the compact or expanded grid layout', () => {
  assert.deepEqual(getDisclosureLayout(createDisclosureState()), {
    panelClass: 'is-collapsed',
    workspaceClass: 'map-collapsed',
  })
  assert.deepEqual(getDisclosureLayout(createDisclosureState(true)), {
    panelClass: 'is-expanded',
    workspaceClass: 'map-expanded',
  })
})

test('prefers the most specific nested index path when resolving links', () => {
  const concepts = [
    { id: 'index', path: 'index.md' },
    { id: 'practices', path: 'practices/index.md' },
  ]
  assert.equal(resolveConceptLink('practices/index.md', concepts), 'practices')
})

test('renders safe Markdown and rewrites internal links', () => {
  const html = renderMarkdown('# Title\n\nSee [Orders](../examples/orders.md).\n\n<script>alert(1)</script>', {
    resolveLink: (href) => (href.endsWith('orders.md') ? 'examples/orders' : null),
  })
  assert.match(html, /<h1>Title<\/h1>/)
  assert.match(html, /href="#concept\/examples%2Forders"/)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /&lt;script&gt;/)
})
