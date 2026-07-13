import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('GitHub Pages workflow validates, builds, and deploys the static bundle', async () => {
  const workflow = await readFile('.github/workflows/pages.yml', 'utf8')
  assert.match(workflow, /actions\/checkout@v6/)
  assert.match(workflow, /actions\/setup-node@v4/)
  assert.match(workflow, /node-version: 22/)
  assert.match(workflow, /npm run check/)
  assert.match(workflow, /npm run build/)
  assert.match(workflow, /actions\/upload-pages-artifact@v4/)
  assert.match(workflow, /actions\/deploy-pages@v4/)
})
