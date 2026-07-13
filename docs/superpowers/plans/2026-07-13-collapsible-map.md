# Collapsible Knowledge Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the knowledge map panel collapsed by default while preserving an accessible toggle for showing and hiding the existing relationship graph.

**Architecture:** Add a tiny pure disclosure-state module for testable open/closed transitions. The page shell will keep the map heading and toggle visible, while wrapping the legend, SVG mount, and hint in a `hidden` content region controlled by `aria-expanded`. Existing graph data and rendering remain unchanged.

**Tech Stack:** Browser-native ES modules, HTML `hidden`, CSS, Node `node:test`.

## Global Constraints

- Default state must be collapsed.
- The map heading and toggle must remain visible when collapsed.
- The toggle must expose `aria-expanded` and `aria-controls`.
- Existing concept search, filtering, selection, and graph rendering must remain unchanged.
- Do not add runtime dependencies or change the graph data model.

---

### Task 1: Add the disclosure state contract

**Files:**
- Create: `web/src/disclosure.js`
- Modify: `tests/ui-state.test.mjs`

**Interfaces:**
- `createDisclosureState(initialOpen = false)` returns `{ open: boolean }` and defaults to `{ open: false }`.
- `toggleDisclosure(state)` returns a new state with `open` inverted and does not mutate the input.

- [ ] **Step 1: Write the failing test**

Add:

```js
import { createDisclosureState, toggleDisclosure } from '../web/src/disclosure.js'

test('starts collapsed and toggles without mutating disclosure state', () => {
  const collapsed = createDisclosureState()
  assert.deepEqual(collapsed, { open: false })

  const expanded = toggleDisclosure(collapsed)
  assert.deepEqual(expanded, { open: true })
  assert.deepEqual(collapsed, { open: false })
  assert.deepEqual(toggleDisclosure(expanded), { open: false })
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- tests/ui-state.test.mjs
```

Expected: FAIL because `web/src/disclosure.js` does not exist.

- [ ] **Step 3: Implement the minimal state module**

Create:

```js
export function createDisclosureState(initialOpen = false) {
  return { open: initialOpen === true }
}

export function toggleDisclosure(state) {
  return { open: !state.open }
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npm test -- tests/ui-state.test.mjs
```

Expected: all UI-state tests pass.

### Task 2: Connect the toggle to the existing map panel

**Files:**
- Modify: `web/src/main.js`
- Modify: `web/src/styles.css`

**Interfaces:**
- `state.mapDisclosure` stores the disclosure state created by `createDisclosureState()`.
- `renderGraphDisclosure()` synchronizes the button text, `aria-expanded`, panel state, and `hidden` content region.

- [ ] **Step 1: Add the collapsed shell markup and state wiring**

Import the disclosure helpers, add `mapDisclosure: createDisclosureState()` to state, and change the map section to:

```html
<section class="graph-panel" aria-labelledby="map-title">
  <div class="panel-heading">
    <div><p class="eyebrow">RELATIONSHIP SURFACE</p><h2 id="map-title">知识地图</h2></div>
    <button id="map-toggle" class="panel-toggle" type="button" aria-expanded="false" aria-controls="graph-content">展开知识地图</button>
  </div>
  <div id="graph-content" class="graph-content" hidden>
    <div id="graph-legend" class="graph-legend"></div>
    <div id="graph-mount" class="graph-mount"><p class="empty-state">加载关系图…</p></div>
    <p class="graph-hint">点击节点聚焦关系 · 按 <kbd>/</kbd> 开始搜索</p>
  </div>
</section>
```

Add a synchronizer:

```js
function renderGraphDisclosure() {
  const isOpen = state.mapDisclosure.open
  const content = document.querySelector('#graph-content')
  const toggle = document.querySelector('#map-toggle')
  content.hidden = !isOpen
  toggle.setAttribute('aria-expanded', String(isOpen))
  toggle.textContent = isOpen ? '收起知识地图' : '展开知识地图'
}
```

Bind the button to `state.mapDisclosure = toggleDisclosure(state.mapDisclosure)`, call `renderGraphDisclosure()` during setup and after `render()`, and leave `renderGraph()` unchanged.

- [ ] **Step 2: Add focused styles**

Add styles that keep the collapsed header visible and hide only the content region:

```css
.graph-content[hidden] { display: none; }
.panel-toggle { padding: 8px 10px; border: 1px solid var(--line); background: var(--surface); color: var(--muted-strong); font: 10px "SFMono-Regular", monospace; letter-spacing: .06em; }
.panel-toggle:hover { border-color: var(--mint); color: var(--ink); background: var(--surface-soft); }
.panel-toggle:focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; }
```

Keep the existing graph sizing rules for the expanded state.

- [ ] **Step 3: Run the full local verification**

Run:

```bash
npm run check
npm run build
git diff --check
```

Expected: all tests pass, content validation passes, static output is generated, and no whitespace errors are reported.

### Task 3: Browser acceptance and publish

**Files:**
- No additional source files.

- [ ] **Step 1: Verify default collapsed state**

Open the local preview and confirm:

- the “知识地图” heading is visible;
- the button says “展开知识地图”;
- `aria-expanded="false"`;
- `#graph-content` is hidden.

- [ ] **Step 2: Verify toggle behavior**

Click the toggle and confirm it changes to “收起知识地图”, sets `aria-expanded="true"`, and reveals the SVG relationship graph. Click again and confirm the inverse state.

- [ ] **Step 3: Commit and push**

```bash
git add web/src/disclosure.js web/src/main.js web/src/styles.css tests/ui-state.test.mjs
git commit -m "feat: make knowledge map collapsible"
git push origin main
```

Verify the GitHub Pages workflow succeeds before reporting the live URL.
