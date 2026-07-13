import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildContent } from '../scripts/build-content.mjs'

test('writes a JSON bundle with stable concept fields', async () => {
  const contentDir = join(process.cwd(), 'knowledge')
  const outputFile = join(process.cwd(), 'web', 'public', 'content.json')
  const { concepts } = await buildContent({ contentDir, outputFile })
  const written = JSON.parse(await readFile(outputFile, 'utf8'))

  assert.ok(concepts.length > 0)
  assert.deepEqual(Object.keys(written), ['generatedAt', 'concepts'])
  assert.deepEqual(Object.keys(written.concepts[0]), [
    'id',
    'path',
    'type',
    'title',
    'description',
    'resource',
    'tags',
    'timestamp',
    'markdown',
    'links',
    'backlinks',
  ])
})

test('publishes only the industry benchmark article requested for the live bundle', async () => {
  const { concepts } = await buildContent({
    contentDir: join(process.cwd(), 'knowledge'),
    outputFile: null,
  })

  assert.equal(concepts.length, 1)
  assert.equal(concepts[0].path, '如何做好研究-中文翻译.md')
  assert.equal(concepts[0].type, 'industry-benchmark-article')
  assert.equal(concepts[0].title, '如何做好研究')
})
