import { createContentIndex, filterConcepts, resolveConceptLink, searchConcepts } from './content.js'
import { renderMarkdown } from './markdown.js'
import { buildGraphModel, renderGraph } from './graph.js'

const state = {
  index: null,
  selectedId: null,
  query: '',
  type: 'all',
}

const app = document.querySelector('#app')

function escapeAttribute(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}

function shellMarkup() {
  return `
    <div class="site-shell">
      <header class="topbar">
        <a id="brand-link" class="brand" href="#" aria-label="回到知识库首页">
          <span class="brand-mark">OKF</span>
          <span><strong>OPEN KNOWLEDGE FORMAT</strong><small>METHOD / MAP / MEMORY</small></span>
        </a>
        <div class="topbar-meta"><span class="status-dot"></span><span>静态知识 bundle</span><a href="https://github.com/fish0710/okf" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </header>
      <section class="hero">
        <div>
          <p class="eyebrow">A KNOWLEDGE FORMAT FOR HUMANS + AGENTS</p>
          <h1>把知识写成<br><em>可以流动的文件。</em></h1>
          <p class="hero-copy">OKF 方法论入门：从 Markdown、frontmatter 和互链开始，建立一套可被人阅读、被 Agent 消费、被 Git 审阅的知识地图。</p>
        </div>
        <div class="hero-stamp" aria-hidden="true"><span>18</span><small>CONCEPTS<br>CONNECTED</small></div>
      </section>
      <section class="controlbar" aria-label="知识库筛选">
        <label class="search-field"><span aria-hidden="true">⌕</span><input id="search-input" type="search" placeholder="搜索概念、标签或正文…" autocomplete="off"><kbd>/</kbd></label>
        <label class="type-field"><span>类型</span><select id="type-select"></select></label>
      </section>
      <div class="workspace-grid">
        <aside class="sidebar" aria-label="概念导航">
          <div class="sidebar-heading"><span>目录导航</span><span id="result-count" class="muted"></span></div>
          <div id="type-summary" class="type-summary"></div>
          <nav id="concept-list" class="concept-list"></nav>
        </aside>
        <section class="graph-panel" aria-labelledby="map-title">
          <div class="panel-heading"><div><p class="eyebrow">RELATIONSHIP SURFACE</p><h2 id="map-title">知识地图</h2></div><div id="graph-legend" class="graph-legend"></div></div>
          <div id="graph-mount" class="graph-mount"><p class="empty-state">加载关系图…</p></div>
          <p class="graph-hint">点击节点聚焦关系 · 按 <kbd>/</kbd> 开始搜索</p>
        </section>
        <aside id="detail-panel" class="detail-panel" aria-label="概念详情" tabindex="-1"></aside>
      </div>
      <footer class="footer"><span>OKF v0.1 · markdown + yaml + links</span><span>内容与可视化分离，知识源始终在 <code>knowledge/</code></span></footer>
    </div>`
}

function selectedConcept() {
  return state.index.byId.get(state.selectedId) ?? state.index.byId.get('index') ?? state.index.concepts[0]
}

function currentConcepts() {
  const byType = filterConcepts(state.index, state.type)
  const byQuery = new Set(searchConcepts(state.index, state.query))
  return byType.filter((concept) => byQuery.has(concept))
}

function conceptLinkTarget(href) {
  return resolveConceptLink(href, state.index.concepts)
}

function renderTypeSelect() {
  const select = document.querySelector('#type-select')
  const types = [...new Set(state.index.concepts.map((concept) => concept.type))].sort()
  select.innerHTML = ['all', ...types].map((type) => `<option value="${escapeAttribute(type)}">${type === 'all' ? '全部类型' : type}</option>`).join('')
  select.value = state.type
  select.addEventListener('change', (event) => {
    state.type = event.target.value
    render()
  })
}

function renderTypeSummary() {
  const counts = new Map()
  for (const concept of state.index.concepts) counts.set(concept.type, (counts.get(concept.type) ?? 0) + 1)
  document.querySelector('#type-summary').innerHTML = [...counts.entries()].sort().map(([type, count]) => `<button class="type-row" type="button" data-type="${escapeAttribute(type)}"><span class="type-dot type-${escapeAttribute(type)}"></span><span>${type}</span><strong>${count}</strong></button>`).join('')
  document.querySelectorAll('[data-type]').forEach((button) => button.addEventListener('click', () => {
    state.type = button.dataset.type
    document.querySelector('#type-select').value = state.type
    render()
  }))
}

function renderGraphLegend() {
  const types = [...new Set(state.index.concepts.map((concept) => concept.type))].sort()
  document.querySelector('#graph-legend').innerHTML = types.map((type) => `<span><i class="type-${escapeAttribute(type)}"></i>${escapeAttribute(type)}</span>`).join('')
}

function renderConceptList(concepts) {
  const list = document.querySelector('#concept-list')
  list.innerHTML = concepts.length
    ? concepts.map((concept) => `<button type="button" class="concept-row ${concept.id === state.selectedId ? 'is-selected' : ''}" data-concept-id="${escapeAttribute(concept.id)}"><span class="concept-row-marker type-${escapeAttribute(concept.type)}"></span><span class="concept-row-copy"><strong>${escapeAttribute(concept.title)}</strong><small>${escapeAttribute(concept.path)}</small></span><span class="concept-row-arrow">↗</span></button>`).join('')
    : '<p class="empty-state">没有匹配的概念。</p>'
  list.querySelectorAll('[data-concept-id]').forEach((button) => button.addEventListener('click', () => selectConcept(button.dataset.conceptId)))
  document.querySelector('#result-count').textContent = `${concepts.length} / ${state.index.concepts.length}`
}

function renderDetail(concept) {
  const panel = document.querySelector('#detail-panel')
  if (!concept) {
    panel.innerHTML = '<p class="empty-state">选择一个概念查看详情。</p>'
    return
  }
  const body = renderMarkdown(concept.markdown, { resolveLink: conceptLinkTarget })
  const backlinks = concept.backlinks.length
    ? concept.backlinks.map((backlink) => `<button type="button" class="backlink" data-concept-id="${escapeAttribute(backlink.sourceId)}"><span>↖</span>${escapeAttribute(state.index.byId.get(backlink.sourceId)?.title ?? backlink.sourceId)}</button>`).join('')
    : '<p class="muted">暂无反向引用。</p>'
  panel.innerHTML = `
    <div class="detail-kicker"><span class="type-pill type-${escapeAttribute(concept.type)}">${escapeAttribute(concept.type)}</span><span class="muted">${escapeAttribute(concept.path)}</span></div>
    <h2 id="detail-title">${escapeAttribute(concept.title)}</h2>
    <p class="detail-description">${escapeAttribute(concept.description)}</p>
    <div class="tag-list">${concept.tags.map((tag) => `<span>#${escapeAttribute(tag)}</span>`).join('')}</div>
    ${concept.resource ? `<a class="resource-link" href="${escapeAttribute(concept.resource)}" target="_blank" rel="noreferrer">查看权威来源 ↗</a>` : ''}
    <article class="markdown-body">${body}</article>
    <section class="backlinks"><div class="section-label">被这些概念引用</div>${backlinks}</section>`
  panel.querySelectorAll('[data-concept-id]').forEach((button) => button.addEventListener('click', () => selectConcept(button.dataset.conceptId)))
  panel.querySelectorAll('a[href^="#concept/"]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault()
    selectConcept(decodeURIComponent(link.getAttribute('href').slice('#concept/'.length)))
  }))
}

function render() {
  const concepts = currentConcepts()
  const selected = selectedConcept()
  renderConceptList(concepts)
  renderDetail(selected)
  const graph = buildGraphModel(state.index.concepts)
  renderGraph(document.querySelector('#graph-mount'), graph, {
    selectedId: selected?.id,
    activeIds: new Set(concepts.map((concept) => concept.id)),
    onSelect: selectConcept,
  })
}

function selectConcept(id) {
  if (!state.index.byId.has(id)) return
  state.selectedId = id
  history.replaceState(null, '', `#concept/${encodeURIComponent(id)}`)
  render()
  document.querySelector('#detail-panel')?.focus({ preventScroll: true })
}

async function load() {
  app.innerHTML = shellMarkup()
  try {
    const response = await fetch(new URL('../content.json', import.meta.url))
    if (!response.ok) throw new Error(`无法读取 content.json（${response.status}）`)
    const payload = await response.json()
    state.index = createContentIndex(payload.concepts)
    document.querySelector('.hero-stamp span').textContent = state.index.concepts.length
    const hashId = decodeURIComponent(location.hash.match(/^#concept\/(.+)$/)?.[1] ?? '')
    state.selectedId = state.index.byId.has(hashId) ? hashId : state.index.concepts[0]?.id ?? null
    document.querySelector('#brand-link')?.setAttribute('href', state.selectedId ? `#concept/${encodeURIComponent(state.selectedId)}` : '#')
    renderTypeSelect()
    renderTypeSummary()
    renderGraphLegend()
    document.querySelector('#search-input').addEventListener('input', (event) => {
      state.query = event.target.value
      render()
    })
    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault()
        document.querySelector('#search-input').focus()
      }
      if (event.key === 'Escape' && document.activeElement?.id === 'search-input') {
        state.query = ''
        document.querySelector('#search-input').value = ''
        render()
      }
    })
    window.addEventListener('hashchange', () => {
      const nextId = decodeURIComponent(location.hash.match(/^#concept\/(.+)$/)?.[1] ?? '')
      if (state.index.byId.has(nextId) && nextId !== state.selectedId) {
        state.selectedId = nextId
        render()
      }
    })
    render()
  } catch (error) {
    app.innerHTML = `<div class="load-error"><p class="eyebrow">CONTENT LOAD ERROR</p><h1>知识地图暂时无法加载</h1><p>${escapeAttribute(error.message)}</p></div>`
  }
}

load()
