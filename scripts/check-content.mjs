import { buildContent } from './build-content.mjs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function checkContent({ contentDir }) {
  try {
    const result = await buildContent({ contentDir: resolve(contentDir), outputFile: null })
    return { concepts: result.concepts, errors: [] }
  } catch (error) {
    return { concepts: [], errors: [error instanceof Error ? error.message : String(error)] }
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const { concepts, errors } = await checkContent({
    contentDir: process.env.OKF_CONTENT_DIR ?? 'knowledge',
  })
  if (errors.length > 0) {
    for (const error of errors) console.error(`Content error: ${error}`)
    process.exitCode = 1
  } else {
    console.log(`Content check passed: ${concepts.length} concepts`)
  }
}
