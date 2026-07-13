import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const root = resolve(process.env.OKF_SITE_DIR ?? 'dist')
const port = Number(process.env.PORT ?? 4173)
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  const filePath = resolve(root, `.${decoded === '/' ? '/index.html' : decoded}`)
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) return null
  return filePath
}

const server = createServer(async (request, response) => {
  try {
    const filePath = safePath(request.url ?? '/')
    if (!filePath) {
      response.writeHead(403).end('Forbidden')
      return
    }
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) throw new Error('not a file')
    response.writeHead(200, { 'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream' })
    createReadStream(filePath).pipe(response)
  } catch {
    response.writeHead(404).end('Not found')
  }
})

server.listen(port, () => {
  console.log(`OKF site preview: http://localhost:${port}`)
})
