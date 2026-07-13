import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const REQUIRED_FIELDS = ['type', 'title', 'description', 'tags', 'timestamp']

function parseScalar(raw) {
  const value = raw.trim()
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim()
    if (!inner) return []
    return inner.split(',').map((item) => parseScalar(item))
  }
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

function parseDocument(source, filePath) {
  if (!source.startsWith('---')) {
    throw new Error(`missing frontmatter in ${filePath}`)
  }

  const firstLineEnd = source.indexOf('\n')
  const closeMarker = source.indexOf('\n---', firstLineEnd)
  if (firstLineEnd === -1 || closeMarker === -1) {
    throw new Error(`unterminated frontmatter in ${filePath}`)
  }

  const frontmatterText = source.slice(firstLineEnd + 1, closeMarker)
  const markdown = source.slice(closeMarker + '\n---'.length).replace(/^\n/, '')
  const data = {}

  for (const line of frontmatterText.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf(':')
    if (separator <= 0) throw new Error(`invalid frontmatter line in ${filePath}: ${line}`)
    const key = trimmed.slice(0, separator).trim()
    data[key] = parseScalar(trimmed.slice(separator + 1))
  }

  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === '') {
      throw new Error(`missing required frontmatter field "${field}" in ${filePath}`)
    }
  }
  if (typeof data.type !== 'string') throw new Error(`frontmatter field "type" must be a string in ${filePath}`)
  if (typeof data.title !== 'string') throw new Error(`frontmatter field "title" must be a string in ${filePath}`)
  if (typeof data.description !== 'string') throw new Error(`frontmatter field "description" must be a string in ${filePath}`)
  if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== 'string')) {
    throw new Error(`frontmatter field "tags" must be a string array in ${filePath}`)
  }
  if (Number.isNaN(Date.parse(data.timestamp))) {
    throw new Error(`frontmatter field "timestamp" must be an ISO date in ${filePath}`)
  }

  return { data, markdown }
}

function conceptIdFromPath(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/')
  const withoutExtension = normalized.endsWith('.md') ? normalized.slice(0, -3) : normalized
  if (withoutExtension === 'index') return 'index'
  return withoutExtension.endsWith('/index')
    ? withoutExtension.slice(0, -6)
    : withoutExtension
}

function isExternalLink(href) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)
}

export function resolveInternalLink(sourceId, href, knownIds) {
  if (!href || isExternalLink(href)) return null
  const cleanHref = href.split('#')[0].split('?')[0]
  if (!cleanHref.endsWith('.md')) return null
  const sourcePath = sourceId.endsWith('.md') ? sourceId : `${sourceId}.md`
  const targetPath = join(dirname(sourcePath), cleanHref).replaceAll('\\', '/')
  const targetId = conceptIdFromPath(targetPath)
  if (knownIds && !knownIds.has(targetId)) {
    throw new Error(`missing target "${targetId}" referenced from "${sourceId}"`)
  }
  return targetId
}

function extractLinks(markdown, sourceId) {
  const links = []
  const pattern = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  for (const match of markdown.matchAll(pattern)) {
    const targetId = resolveInternalLink(sourceId, match[2])
    if (targetId) links.push({ label: match[1].trim(), targetId })
  }
  return links
}

async function listMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await listMarkdownFiles(entryPath))
    else if (entry.isFile() && extname(entry.name) === '.md') files.push(entryPath)
  }
  return files.sort()
}

export function parseMarkdownFile(filePath, contentRoot) {
  const root = resolve(contentRoot)
  const absoluteFilePath = resolve(filePath)
  const relativePath = relative(root, absoluteFilePath).replaceAll('\\', '/')
  const source = readFileSync(absoluteFilePath, 'utf8')
  const { data, markdown } = parseDocument(source, relativePath)
  return {
    id: conceptIdFromPath(relativePath),
    path: relativePath,
    type: data.type,
    title: data.title,
    description: data.description,
    resource: data.resource ?? null,
    tags: data.tags,
    timestamp: data.timestamp,
    markdown,
    links: extractLinks(markdown, relativePath),
  }
}

export async function buildContent({ contentDir, outputFile }) {
  const root = resolve(contentDir)
  const files = await listMarkdownFiles(root)
  const concepts = files.map((filePath) => parseMarkdownFile(filePath, root))
  const ids = new Set(concepts.map((concept) => concept.id))
  const duplicate = concepts.find((concept, index) => concepts.findIndex((item) => item.id === concept.id) !== index)
  if (duplicate) throw new Error(`duplicate concept id "${duplicate.id}"`)

  for (const concept of concepts) {
    for (const link of concept.links) {
      if (!ids.has(link.targetId)) {
        throw new Error(`missing target "${link.targetId}" referenced from "${concept.id}"`)
      }
    }
  }

  const backlinkMap = new Map(concepts.map((concept) => [concept.id, []]))
  for (const concept of concepts) {
    for (const link of concept.links) {
      backlinkMap.get(link.targetId).push({ sourceId: concept.id, label: link.label })
    }
  }

  const normalizedConcepts = concepts
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((concept) => ({ ...concept, backlinks: backlinkMap.get(concept.id) }))
  const output = { generatedAt: new Date().toISOString(), concepts: normalizedConcepts }

  if (outputFile) {
    await mkdir(dirname(resolve(outputFile)), { recursive: true })
    await writeFile(resolve(outputFile), `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  }
  return { concepts: normalizedConcepts, errors: [] }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const contentDir = resolve(process.env.OKF_CONTENT_DIR ?? 'knowledge')
  const outputFile = resolve(process.env.OKF_CONTENT_OUTPUT ?? 'web/public/content.json')
  await buildContent({ contentDir, outputFile })
  console.log(`Built ${outputFile}`)
}
