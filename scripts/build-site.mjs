import { cp, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function buildSite({ sourceDir = 'web', outputDir = 'dist' } = {}) {
  const source = resolve(sourceDir)
  const output = resolve(outputDir)
  await rm(output, { recursive: true, force: true })
  await mkdir(output, { recursive: true })
  await cp(resolve(source, 'index.html'), resolve(output, 'index.html'))
  await copyIfPresent(resolve(source, 'src'), resolve(output, 'src'), { recursive: true })
  await copyIfPresent(resolve(source, 'public'), resolve(output), { recursive: true, force: true })
  return output
}

async function copyIfPresent(source, target, options) {
  try {
    await cp(source, target, options)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  console.log(`Built static site at ${await buildSite()}`)
}
