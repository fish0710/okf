# OKF Knowledge Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chinese OKF methodology knowledge bundle, an interactive static knowledge map, and a GitHub Pages deployment pipeline in the empty `okf` repository.

**Architecture:** Markdown files under `knowledge/` are the canonical OKF source. A Node content pipeline validates frontmatter and internal links, then writes `web/public/content.json`; a Vite-powered vanilla JavaScript UI consumes that JSON to render search, filters, graph relationships, details, and backlinks. GitHub Actions builds `dist/` and deploys it to GitHub Pages.

**Tech Stack:** Node 22, npm, Vite, Vitest, `gray-matter`, `marked`, `dompurify`, browser-native DOM/SVG APIs, GitHub Actions Pages artifacts.

## Global Constraints

- Keep OKF source documents in `knowledge/`; do not make the UI the source of truth.
- Use Chinese copy for first-party knowledge content and UI labels; preserve external source URLs.
- Validate `type`, `title`, `description`, `tags`, and `timestamp` on every knowledge document.
- Treat the path without `.md` as the stable concept ID.
- Resolve and validate relative `.md` links; fail the build on a broken internal link.
- Use Node 22 in local documentation and GitHub Actions.
- Do not modify or stage the pre-existing untracked file `如何做好研究-中文翻译.md`.
- Do not add a backend, authentication, database, comments, online editing, or runtime API calls.
- Keep published assets under `dist/` and source assets under `web/`; never commit generated `dist/`.
- Use explicit `git add` paths for every implementation commit because the worktree contains an unrelated untracked file.

---

### Task 1: Scaffold the package and content validation pipeline

**Files:**
- Create: `package.json`
- Create: `web/index.html`
- Create: `web/vite.config.js`
- Create: `scripts/build-content.mjs`
- Create: `scripts/check-content.mjs`
- Create: `tests/content.test.mjs`
- Create: `tests/build.test.mjs`
- Create: `knowledge/index.md`
- Create: `knowledge/foundations/index.md`
- Create: `knowledge/examples/index.md`
- Create: `knowledge/practices/index.md`

**Interfaces:**
- `scripts/build-content.mjs` exports `parseMarkdownFile(filePath, contentRoot)`, `resolveInternalLink(sourceId, href, knownIds)`, and `buildContent({ contentDir, outputFile })`.
- `scripts/check-content.mjs` exports `checkContent({ contentDir })` and exits non-zero when the returned `errors` array is not empty.
- `buildContent()` returns `{ concepts, errors }`, where each concept contains `id`, `path`, `type`, `title`, `description`, `resource`, `tags`, `timestamp`, `markdown`, `links`, and `backlinks`.
- `package.json` scripts are `dev`, `test`, `check`, `build`, and `preview`.

- [ ] **Step 1: Write failing content-pipeline tests**

Add temporary Markdown fixtures and assert parsing, required fields, link normalization, backlinks, and missing-link failures:

```js
it('parses frontmatter and normalizes a relative internal link', async () => {
  const result = parseMarkdownFile('knowledge/a.md', 'knowledge')
  expect(result.id).toBe('a')
  expect(result.tags).toEqual(['okf'])
  expect(result.links).toEqual([{ label: 'B', targetId: 'b' }])
})

it('rejects missing required frontmatter', async () => {
  expect(() => parseMarkdownFile('knowledge/a.md', 'knowledge')).toThrow(/title/)
})

it('builds backlinks from the forward link set', async () => {
  const { concepts } = await buildContent({ contentDir: fixtureDir, outputFile })
  expect(concepts.find((item) => item.id === 'b').backlinks)
    .toEqual([{ sourceId: 'a', label: 'B' }])
})
```

- [ ] **Step 2: Run the focused tests and verify they fail**

```bash
npm test -- --run tests/content.test.mjs tests/build.test.mjs
```

Expected: FAIL because the package and exported pipeline functions do not exist yet.

- [ ] **Step 3: Add the minimal package and parser implementation**

Use `gray-matter` for YAML frontmatter and Node `fs/promises` for recursive file reads. Normalize links by resolving them relative to the source file, removing an optional `.md` suffix and `index` segment, then checking the resulting ID against the known ID set. Build backlinks in a second pass. Write JSON with two-space indentation to `web/public/content.json`.

Use this package contract:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node scripts/build-content.mjs && vite --config web/vite.config.js",
    "test": "vitest",
    "check": "npm test -- --run && node scripts/check-content.mjs",
    "build": "node scripts/build-content.mjs && vite build --config web/vite.config.js",
    "preview": "vite preview --config web/vite.config.js"
  },
  "dependencies": {
    "dompurify": "^3.2.6",
    "gray-matter": "^4.0.3",
    "marked": "^16.0.0"
  },
  "devDependencies": {
    "vite": "^7.0.0",
    "vitest": "^3.2.4"
  }
}
```

Configure Vite with `root: 'web'`, `publicDir: 'public'`, `build.outDir: '../dist'`, `build.emptyOutDir: true`, and a `base` value from `VITE_BASE_PATH` with `/` as the local default.

- [ ] **Step 4: Run the focused tests and content check**

```bash
npm test -- --run tests/content.test.mjs tests/build.test.mjs
node scripts/check-content.mjs
```

Expected: all focused tests pass and the four index documents pass required frontmatter and link checks.

- [ ] **Step 5: Commit the pipeline scaffold**

```bash
git add package.json package-lock.json web/index.html web/vite.config.js scripts/build-content.mjs scripts/check-content.mjs tests/content.test.mjs tests/build.test.mjs knowledge/index.md knowledge/foundations/index.md knowledge/examples/index.md knowledge/practices/index.md
git commit -m "feat: add OKF content validation pipeline"
```

### Task 2: Author the first OKF methodology bundle

**Files:**
- Create: `knowledge/foundations/what-is-okf.md`
- Create: `knowledge/foundations/format-not-service.md`
- Create: `knowledge/foundations/concept-document.md`
- Create: `knowledge/foundations/frontmatter.md`
- Create: `knowledge/foundations/links-and-graph.md`
- Create: `knowledge/foundations/progressive-disclosure.md`
- Create: `knowledge/foundations/producer-consumer.md`
- Create: `knowledge/foundations/version-control.md`
- Create: `knowledge/examples/table-orders.md`
- Create: `knowledge/examples/metric-weekly-active-users.md`
- Create: `knowledge/practices/authoring-checklist.md`
- Create: `knowledge/practices/maintenance.md`
- Create: `knowledge/glossary.md`
- Create: `knowledge/faq.md`
- Modify: `knowledge/index.md`
- Modify: `knowledge/foundations/index.md`
- Modify: `knowledge/examples/index.md`
- Modify: `knowledge/practices/index.md`

**Interfaces:**
- Every document uses the validated frontmatter profile from the spec.
- Every cross-reference uses a relative Markdown link to a real concept file.
- `knowledge/index.md` links to the three section indexes and the glossary/FAQ.

- [ ] **Step 1: Add the foundation documents with cross-links**

Write concise, self-contained Chinese explanations. Each file must include a short “一句话” summary, a concrete example or rule, and at least one useful internal link. Use the Google Cloud article and official `SPEC.md` as source links in `resource` or the body; do not copy long passages.

- [ ] **Step 2: Add examples and operational practice documents**

Model an `orders` table and `weekly_active_users` metric as OKF concepts. The metric must link to the table concept, and the table must link back to the concept/document-model and frontmatter guidance. The checklist must cover required fields, links, sources, review, and timestamp updates. The maintenance entry must describe pull-request review and stale-link/content checks.

- [ ] **Step 3: Add glossary, FAQ, and section indexes**

Indexes should provide progressive disclosure: a short section purpose followed by links with one-line descriptions. The FAQ must answer whether OKF requires Google Cloud, whether a graph UI is required, and how a bundle is consumed by an Agent.

- [ ] **Step 4: Run the content check and inspect generated data**

```bash
node scripts/check-content.mjs
node scripts/build-content.mjs
node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('web/public/content.json')); console.log(data.concepts.length, data.concepts.filter(x => x.links.length > 0).length)"
```

Expected: zero validation errors, at least 18 concepts, and at least 10 concepts with one or more links.

- [ ] **Step 5: Commit the knowledge bundle**

```bash
git add knowledge
git commit -m "content: add OKF methodology knowledge bundle"
```

### Task 3: Build the static site shell and safe Markdown detail view

**Files:**
- Create: `web/src/main.js`
- Create: `web/src/content.js`
- Create: `web/src/markdown.js`
- Create: `web/src/styles.css`
- Modify: `web/index.html`
- Create: `tests/ui-state.test.mjs`

**Interfaces:**
- `web/src/content.js` exports `createContentIndex(concepts)`, `searchConcepts(index, query)`, and `filterConcepts(index, type)`.
- `web/src/markdown.js` exports `renderMarkdown(markdown, { resolveLink })` and returns a DOM-safe HTML string.
- `web/src/main.js` owns `state = { selectedId, query, type }` and exposes `selectConcept(id)`, `updateSearch(query)`, and `updateType(type)` for testable UI state transitions.

- [ ] **Step 1: Write failing state and search tests**

```js
it('searches title, description, tags, id, and body text', () => {
  const index = createContentIndex(sampleConcepts)
  expect(searchConcepts(index, 'frontmatter').map((item) => item.id))
    .toContain('foundations/frontmatter')
})

it('filters by type without changing the source concepts', () => {
  const index = createContentIndex(sampleConcepts)
  expect(filterConcepts(index, 'example').every((item) => item.type === 'example')).toBe(true)
})
```

- [ ] **Step 2: Run the UI-state tests and verify they fail**

```bash
npm test -- --run tests/ui-state.test.mjs
```

Expected: FAIL because the content index module does not exist yet.

- [ ] **Step 3: Implement content indexing, safe Markdown rendering, and the page shell**

Load `/content.json` relative to `import.meta.env.BASE_URL`. Render the header, search input, type chips, concept list, graph mount, and detail panel using semantic elements. Parse Markdown with `marked`, sanitize the result with `DOMPurify`, rewrite internal links to `#concept/<targetId>`, and leave external links with `target="_blank"` and `rel="noreferrer"`.

Add responsive dark workbench styling: three columns above 1100px, stacked sections below 760px, CSS custom properties for colors, visible focus rings, and a reduced-motion media query.

- [ ] **Step 4: Run tests and build the static shell**

```bash
npm test -- --run tests/ui-state.test.mjs
npm run build
```

Expected: UI-state tests pass and `dist/index.html` plus `dist/content.json` are generated.

- [ ] **Step 5: Commit the site shell**

```bash
git add web/index.html web/src/main.js web/src/content.js web/src/markdown.js web/src/styles.css tests/ui-state.test.mjs web/public/content.json
git commit -m "feat: add OKF knowledge site shell"
```

### Task 4: Add the interactive concept graph and navigation behavior

**Files:**
- Create: `web/src/graph.js`
- Modify: `web/src/main.js`
- Modify: `web/src/styles.css`
- Create: `tests/graph.test.mjs`

**Interfaces:**
- `web/src/graph.js` exports `buildGraphModel(concepts)`, `renderGraph(container, model, { selectedId, onSelect })`, and `focusNeighbors(model, selectedId)`.
- `buildGraphModel()` returns `{ nodes, edges }`; each edge is `{ sourceId, targetId, label }`.
- `focusNeighbors()` returns `{ visibleIds, visibleEdgeKeys }` without mutating the input model.

- [ ] **Step 1: Write failing graph-model tests**

```js
it('creates one node per concept and one directed edge per link', () => {
  const model = buildGraphModel(sampleConcepts)
  expect(model.nodes).toHaveLength(sampleConcepts.length)
  expect(model.edges).toContainEqual({ sourceId: 'a', targetId: 'b', label: 'B' })
})

it('focuses a selected node and its one-hop neighbors', () => {
  const model = buildGraphModel(sampleConcepts)
  expect(focusNeighbors(model, 'a').visibleIds).toEqual(expect.arrayContaining(['a', 'b']))
})
```

- [ ] **Step 2: Run graph tests and verify they fail**

```bash
npm test -- --run tests/graph.test.mjs
```

Expected: FAIL because `graph.js` is not implemented.

- [ ] **Step 3: Implement a deterministic SVG graph renderer**

Place nodes in concentric rings based on their type and index, draw directed edges with marker arrows, color nodes by type, and attach accessible buttons/tooltips to nodes. On selection, use `focusNeighbors()` to dim unrelated nodes and edges. Keep the model deterministic so screenshots and tests are stable.

- [ ] **Step 4: Wire selection, search, filters, hash routing, backlinks, and keyboard behavior**

On load, read `#concept/<id>` and select it if it exists; otherwise select `knowledge/index`. On graph or list selection, update `history.replaceState` and render the detail view. Search and type filters update both list and graph focus. Internal detail links select the target concept and move focus to the detail heading. Add `/` to focus search and `Escape` to clear search when the input is focused.

- [ ] **Step 5: Run all tests and production build**

```bash
npm run check
npm run build
```

Expected: all tests pass, content validation passes, and `dist/` contains only deployable static files.

- [ ] **Step 6: Commit graph and navigation**

```bash
git add web/src/graph.js web/src/main.js web/src/styles.css tests/graph.test.mjs
git commit -m "feat: add interactive OKF concept graph"
```

### Task 5: Add README, Pages workflow, and repository metadata

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `.github/workflows/pages.yml`
- Modify: `package.json`
- Modify: `web/vite.config.js`
- Create: `tests/workflow.test.mjs`

**Interfaces:**
- `README.md` explains OKF, the source/content split, local commands, the Pages URL pattern, and the public-data warning.
- `.github/workflows/pages.yml` triggers on `main` pushes and manual dispatch, runs Node 22, checks content, builds `dist/`, uploads the artifact, and deploys with Pages permissions.
- The workflow passes the Pages base path into `VITE_BASE_PATH` and never commits build output.

- [ ] **Step 1: Write the workflow smoke test**

Read `.github/workflows/pages.yml` and assert it contains `actions/checkout`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`, `pages: write`, `id-token: write`, `npm run check`, and `npm run build`.

- [ ] **Step 2: Run the workflow test and verify it fails**

```bash
npm test -- --run tests/workflow.test.mjs
```

Expected: FAIL because the workflow file is not present.

- [ ] **Step 3: Add the Pages workflow and repository docs**

Use a two-job workflow with `build` and `deploy`. The deploy job must `needs: build`, use `environment.name: github-pages`, and set `contents: read`, `pages: write`, and `id-token: write`. Upload `./dist` with `actions/upload-pages-artifact@v4` and deploy with `actions/deploy-pages@v4`.

Document these commands:

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

Also explain that GitHub Pages is public and that OKF source files remain readable directly from GitHub.

- [ ] **Step 4: Run the workflow test and all local checks**

```bash
npm test -- --run tests/workflow.test.mjs
npm run check
npm run build
git diff --check
```

Expected: zero test failures, zero content errors, successful build, and no whitespace errors.

- [ ] **Step 5: Commit the deployment configuration**

```bash
git add README.md .gitignore .github/workflows/pages.yml package.json web/vite.config.js tests/workflow.test.mjs
git commit -m "ci: publish OKF site to GitHub Pages"
```

### Task 6: Local runtime and visual verification

**Files:**
- Modify only files required by verified findings.
- Create `tests/fixtures/` only if a focused regression fixture is needed.

**Interfaces:**
- The production preview must serve `dist/` with the `/okf/` base path simulation.
- The page must expose stable accessible labels for search, type filters, graph nodes, detail heading, and backlinks.

- [ ] **Step 1: Run the complete local validation suite**

```bash
npm run check
npm run build
```

- [ ] **Step 2: Start production preview and inspect the real page**

Start the preview server with the project base path, open the home page in the browser, and verify: non-zero stats; graph nodes; search hit; type filter; node selection; Markdown internal link navigation; backlink navigation; direct hash refresh; no console errors; and no horizontal overflow at desktop and mobile widths.

- [ ] **Step 3: Fix only verified failures and rerun the failing check**

For every issue, add or update a focused test before changing implementation. Rerun the focused test, then rerun `npm run check` and `npm run build`.

- [ ] **Step 4: Review the final diff and status**

```bash
git status -sb
git diff --stat HEAD~5..HEAD
git diff --check HEAD~5..HEAD
```

Expected: only intended OKF site files are committed; `如何做好研究-中文翻译.md` remains untracked and unchanged.

### Task 7: Create the GitHub repository and publish Pages

**Files:**
- No source-file changes expected unless the remote default branch or Pages configuration requires a documented correction.

**Interfaces:**
- Remote repository: `fish0710/okf`.
- Branch: `main`.
- Pages URL: `https://fish0710.github.io/okf/`.

- [ ] **Step 1: Verify GitHub CLI auth and network**

```bash
gh --version
gh auth status
gh api user --jq .login
```

Expected: authenticated login `fish0710`. If the command still fails through the local proxy, inspect proxy variables, retry with proxy variables removed, and report the external blocker if GitHub remains unreachable; do not claim repository creation.

- [ ] **Step 2: Create the public repository with `gh`**

```bash
gh repo create fish0710/okf --public --description "A visual OKF methodology knowledge base" --source=. --remote=origin
```

Expected: `origin` points to the GitHub repository and the repository exists.

- [ ] **Step 3: Push the committed main branch**

```bash
git push -u origin main
```

Expected: all local implementation commits are present on GitHub and the unrelated untracked file is not pushed.

- [ ] **Step 4: Enable GitHub Pages with Actions**

Use `gh api` against the repository Pages endpoint to set the source to GitHub Actions when the endpoint accepts the repository configuration; otherwise open the repository Pages settings URL and verify the workflow is the selected source. Do not change repository visibility or add secrets.

- [ ] **Step 5: Monitor the Pages workflow**

```bash
gh run list --repo fish0710/okf --workflow pages.yml --limit 5
gh run watch --repo fish0710/okf --exit-status
```

Expected: the latest `pages.yml` run completes successfully. If it fails, inspect the run logs before changing files.

- [ ] **Step 6: Verify the live Pages URL**

Open `https://fish0710.github.io/okf/` and verify the same critical behaviors from Task 6. Report the repository URL, Pages URL, commit SHA, workflow run, and any remaining external limitation separately.

## Plan self-review

- Spec coverage: Tasks 1–2 cover the OKF file model and initial Chinese methodology content; Tasks 3–4 cover the visual site, search, graph, detail, hash routing, and backlinks; Task 5 covers Actions and README; Task 6 covers local runtime verification; Task 7 covers `gh` creation, push, Pages, and live verification.
- Placeholder scan: no `TODO`, `TBD`, or unspecified “appropriate handling” steps are required; every external failure path is explicitly reported rather than assumed successful.
- Interface consistency: `content.json` is written to `web/public/` and copied by Vite to `dist/`; graph IDs use the same path-derived IDs as the content pipeline; the workflow uploads `dist/`.
- Scope: the plan is one cohesive static knowledge-site subsystem; it does not include an editor, backend, or unrelated repository refactor.
