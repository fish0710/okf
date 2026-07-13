function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function inlineMarkdown(source, resolveLink) {
  const tokens = []
  const token = (html) => {
    const marker = `@@OKF_TOKEN_${tokens.length}@@`
    tokens.push(html)
    return marker
  }
  let text = source
    .replace(/`([^`]+)`/g, (_, code) => token(`<code>${escapeHtml(code)}</code>`))
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, label, href) => {
      const target = resolveLink?.(href)
      if (target) {
        return token(`<a href="#concept/${encodeURIComponent(target)}">${escapeHtml(label)}</a>`)
      }
      if (/^(?:https?:|mailto:)/i.test(href)) {
        return token(`<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`)
      }
      return escapeHtml(label)
    })
  text = escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  return text.replace(/@@OKF_TOKEN_(\d+)@@/g, (_, index) => tokens[Number(index)])
}

function tableHtml(lines, resolveLink) {
  const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())
  const headers = cells(lines[0])
  const rows = lines.slice(2).map(cells)
  return `<table><thead><tr>${headers.map((cell) => `<th>${inlineMarkdown(cell, resolveLink)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_, index) => `<td>${inlineMarkdown(row[index] ?? '', resolveLink)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
}

export function renderMarkdown(markdown, { resolveLink } = {}) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n')
  const blocks = []
  let paragraph = []
  let list = []
  let orderedList = []
  let code = null

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(`<p>${inlineMarkdown(paragraph.join(' '), resolveLink)}</p>`)
      paragraph = []
    }
  }
  const flushList = () => {
    if (list.length) {
      blocks.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item, resolveLink)}</li>`).join('')}</ul>`)
      list = []
    }
    if (orderedList.length) {
      blocks.push(`<ol>${orderedList.map((item) => `<li>${inlineMarkdown(item, resolveLink)}</li>`).join('')}</ol>`)
      orderedList = []
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.startsWith('```')) {
      if (code === null) {
        flushParagraph()
        flushList()
        code = []
      } else {
        blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
        code = null
      }
      continue
    }
    if (code !== null) {
      code.push(line)
      continue
    }
    if (line.trim() === '') {
      flushParagraph()
      flushList()
      continue
    }
    const nextLine = lines[index + 1] ?? ''
    if (line.includes('|') && /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)+\|?\s*$/.test(nextLine)) {
      flushParagraph()
      flushList()
      const tableLines = [line, nextLine]
      index += 2
      while (index < lines.length && lines[index].includes('|') && lines[index].trim() !== '') {
        tableLines.push(lines[index])
        index += 1
      }
      index -= 1
      blocks.push(tableHtml(tableLines, resolveLink))
      continue
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      flushParagraph()
      flushList()
      const level = heading[1].length
      blocks.push(`<h${level}>${inlineMarkdown(heading[2], resolveLink)}</h${level}>`)
      continue
    }
    const bullet = /^\s*[-*]\s+(.+)$/.exec(line)
    if (bullet) {
      flushParagraph()
      orderedList = []
      list.push(bullet[1])
      continue
    }
    const ordered = /^\s*\d+\.\s+(.+)$/.exec(line)
    if (ordered) {
      flushParagraph()
      list = []
      orderedList.push(ordered[1])
      continue
    }
    flushList()
    paragraph.push(line)
  }
  if (code !== null) blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
  flushParagraph()
  flushList()
  return blocks.join('\n')
}
