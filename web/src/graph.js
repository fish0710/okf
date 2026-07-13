const SVG_NS = 'http://www.w3.org/2000/svg'

export function buildGraphModel(concepts) {
  const nodes = concepts.map((concept) => ({
    id: concept.id,
    type: concept.type,
    title: concept.title,
  }))
  const edges = concepts.flatMap((concept) => (concept.links ?? []).map((link) => ({
    sourceId: concept.id,
    targetId: link.targetId,
    label: link.label,
  })))
  return { nodes, edges }
}

export function focusNeighbors(model, selectedId) {
  const visibleIds = new Set([selectedId])
  for (const edge of model.edges) {
    if (edge.sourceId === selectedId) visibleIds.add(edge.targetId)
    if (edge.targetId === selectedId) visibleIds.add(edge.sourceId)
  }
  const visibleEdgeKeys = new Set(model.edges
    .filter((edge) => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId))
    .map((edge) => `${edge.sourceId}->${edge.targetId}`))
  return { visibleIds, visibleEdgeKeys }
}

function nodeColor(type) {
  return {
    concept: 'var(--cyan)',
    example: 'var(--amber)',
    practice: 'var(--violet)',
    index: 'var(--mint)',
    glossary: 'var(--rose)',
    faq: 'var(--cyan)',
  }[type] ?? 'var(--muted-strong)'
}

function shortLabel(title) {
  return title.length > 12 ? `${title.slice(0, 11)}…` : title
}

function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name)
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
  return element
}

function layoutNodes(model, width, height) {
  const radius = Math.max(120, Math.min(width, height) * 0.34)
  const centerX = width / 2
  const centerY = height / 2
  return new Map(model.nodes.map((node, index) => {
    const angle = -Math.PI / 2 + (index / Math.max(model.nodes.length, 1)) * Math.PI * 2
    return [node.id, { ...node, x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius }]
  }))
}

export function renderGraph(container, model, { selectedId, activeIds = new Set(model.nodes.map((node) => node.id)), onSelect } = {}) {
  const width = Math.max(container.clientWidth || 640, 320)
  const height = width < 520 ? 420 : 580
  const positions = layoutNodes(model, width, height)
  const focus = selectedId ? focusNeighbors(model, selectedId) : { visibleIds: new Set(), visibleEdgeKeys: new Set() }
  const isFiltered = activeIds.size !== model.nodes.length
  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    role: 'img',
    'aria-label': 'OKF 概念关系图',
  })
  const title = createSvgElement('title')
  title.textContent = 'OKF 概念关系图'
  svg.append(title)
  const defs = createSvgElement('defs')
  const marker = createSvgElement('marker', { id: 'okf-arrow', markerWidth: '7', markerHeight: '7', refX: '5', refY: '3.5', orient: 'auto' })
  marker.append(createSvgElement('path', { d: 'M0,0 L7,3.5 L0,7 z', fill: 'currentColor' }))
  defs.append(marker)
  svg.append(defs)

  const edgeLayer = createSvgElement('g', { class: 'graph-edges' })
  for (const edge of model.edges) {
    const source = positions.get(edge.sourceId)
    const target = positions.get(edge.targetId)
    if (!source || !target) continue
    const key = `${edge.sourceId}->${edge.targetId}`
    const visible = !selectedId || focus.visibleEdgeKeys.has(key)
    const active = !isFiltered || (activeIds.has(edge.sourceId) && activeIds.has(edge.targetId))
    edgeLayer.append(createSvgElement('line', {
      x1: source.x,
      y1: source.y,
      x2: target.x,
      y2: target.y,
      class: `graph-edge ${visible && active ? 'is-visible' : 'is-dimmed'}`,
      'marker-end': 'url(#okf-arrow)',
    }))
  }
  svg.append(edgeLayer)

  const nodeLayer = createSvgElement('g', { class: 'graph-nodes' })
  for (const node of model.nodes) {
    const position = positions.get(node.id)
    const selected = node.id === selectedId
    const focused = !selectedId || focus.visibleIds.has(node.id)
    const active = !isFiltered || activeIds.has(node.id)
    const group = createSvgElement('g', {
      class: `graph-node ${selected ? 'is-selected' : ''} ${focused && active ? 'is-visible' : 'is-dimmed'}`,
      transform: `translate(${position.x} ${position.y})`,
      role: 'button',
      tabindex: '0',
      'aria-label': `打开概念：${node.title}`,
    })
    const circle = createSvgElement('circle', { r: selected ? '13' : '9', fill: nodeColor(node.type), class: 'graph-node-circle' })
    const label = createSvgElement('text', { x: '0', y: '29', 'text-anchor': 'middle', class: 'graph-node-label' })
    label.textContent = shortLabel(node.title)
    group.append(circle, label)
    group.addEventListener('click', () => onSelect?.(node.id))
    group.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect?.(node.id)
      }
    })
    nodeLayer.append(group)
  }
  svg.append(nodeLayer)
  container.replaceChildren(svg)
}
