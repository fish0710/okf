import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildContent, parseMarkdownFile } from '../scripts/build-content.mjs'

const validFrontmatter = (title, tags = '[okf]') => `---
type: concept
title: ${title}
description: A valid concept.
tags: ${tags}
timestamp: 2026-07-13T00:00:00Z
---
`

async function makeFixture(files) {
  const root = await mkdtemp(join(tmpdir(), 'okf-content-'))
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = join(root, relativePath)
    await mkdir(join(filePath, '..'), { recursive: true })
    await writeFile(filePath, content, 'utf8')
  }
  return root
}

test('parses frontmatter and normalizes a relative internal link', async () => {
  const root = await makeFixture({
    'a.md': `${validFrontmatter('A')}
[B](b.md)
`,
    'b.md': validFrontmatter('B'),
  })

  try {
    const result = parseMarkdownFile(join(root, 'a.md'), root)
    assert.equal(result.id, 'a')
    assert.deepEqual(result.tags, ['okf'])
    assert.deepEqual(result.links, [{ label: 'B', targetId: 'b' }])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('rejects missing required frontmatter', async () => {
  const root = await makeFixture({ 'a.md': '---\ntype: concept\n---\n# A\n' })

  try {
    assert.throws(() => parseMarkdownFile(join(root, 'a.md'), root), /title/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('builds backlinks from the forward link set', async () => {
  const root = await makeFixture({
    'a.md': `${validFrontmatter('A')}
[B](b.md)
`,
    'b.md': validFrontmatter('B'),
  })
  const outputFile = join(root, 'content.json')

  try {
    const { concepts } = await buildContent({ contentDir: root, outputFile })
    assert.deepEqual(concepts.find((item) => item.id === 'b').backlinks, [
      { sourceId: 'a', label: 'B' },
    ])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('fails on a missing internal target', async () => {
  const root = await makeFixture({
    'a.md': `${validFrontmatter('A')}
[Missing](missing.md)
`,
  })

  try {
    await assert.rejects(
      buildContent({ contentDir: root, outputFile: join(root, 'content.json') }),
      /missing target/,
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('rejects a non-array tags field', async () => {
  const root = await makeFixture({ 'a.md': validFrontmatter('A', 'okf') })

  try {
    assert.throws(() => parseMarkdownFile(join(root, 'a.md'), root), /tags/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
