import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createContentIndex, filterConcepts, searchConcepts } from '../web/src/content.js'
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

test('renders safe Markdown and rewrites internal links', () => {
  const html = renderMarkdown('# Title\n\nSee [Orders](../examples/orders.md).\n\n<script>alert(1)</script>', {
    resolveLink: (href) => (href.endsWith('orders.md') ? 'examples/orders' : null),
  })
  assert.match(html, /<h1>Title<\/h1>/)
  assert.match(html, /href="#concept\/examples%2Forders"/)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /&lt;script&gt;/)
})
