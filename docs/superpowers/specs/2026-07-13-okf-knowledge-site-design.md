# OKF 知识库可视站点设计

**日期：** 2026-07-13  
**状态：** 已获用户确认，待 spec 审阅  
**目标仓库：** `fish0710/okf`（默认公开仓库）

## 1. 背景

本仓库作为 OKF（Open Knowledge Format）方法论知识仓库。OKF v0.1 将知识表达为目录化 Markdown 文件，每个概念文件使用 YAML frontmatter 提供可查询字段，并通过普通 Markdown 链接表达概念关系。仓库需要同时服务两类消费者：

- 人：通过 GitHub 和 GitHub Pages 阅读、搜索和浏览知识。
- Agent/工具：直接读取 `knowledge/` 下的原始 Markdown 文件，不依赖站点运行时或专有 SDK。

因此，站点不是知识源本身，而是 OKF bundle 的一个静态可视化消费者。

## 2. 目标

第一版交付以下结果：

1. 在 `knowledge/` 建立一组中文 OKF 方法论入门条目。
2. 每个条目可独立阅读、可通过 frontmatter 查询，并能使用相对 Markdown 链接互相连接。
3. 构建一个静态、无后端的可视化站点，提供知识地图、全文搜索、类型筛选、详情阅读和反向引用。
4. 使用 GitHub Actions 自动构建并发布到 GitHub Pages。
5. 在本地和 GitHub Actions 中都能验证 frontmatter、链接、构建产物和关键页面行为。

## 3. 非目标

- 第一版不接入数据库、登录、评论、在线编辑或远程 API。
- 第一版不实现通用 OKF 编辑器或 Agent 运行时。
- 第一版不复制 Google Cloud 或官方 OKF 仓库的完整内容，只引用并总结公开规范，保留来源链接。
- 不把构建产物提交回 `knowledge/`；源知识与站点产物分离。

## 4. 设计原则

### 4.1 OKF 文件优先

`knowledge/` 下的 Markdown 是规范化源数据。站点通过构建脚本读取文件并生成静态索引；任何 UI 状态都不能成为知识的唯一来源。

### 4.2 渐进式披露

首页先展示知识库轮廓、概念统计和关系图；选中节点后再展示摘要和正文。目录中的 `index.md` 用于提供层级导航和给 Agent 使用的入口。

### 4.3 关系可见

文件系统表示层级，正文中的 Markdown 链接表示跨层级关系。站点从这些链接生成有向关系图，同时计算每个概念的反向引用。

### 4.4 静态和可移植

构建结果只包含 HTML、CSS、JavaScript、字体/图标和序列化知识数据，可以被 GitHub Pages 或任意静态文件服务器托管。

## 5. 总体架构

```text
knowledge/**/*.md
        │
        ▼
scripts/build-content.mjs
  - 解析 YAML frontmatter
  - 解析 Markdown 标题、链接和正文
  - 校验 required fields 与内部链接
  - 生成 web/public/content.json
        │
        ▼
web/（Vite + 原生前端）
  - 过滤与搜索
  - 关系图谱布局
  - Markdown 渲染
  - 详情、反向引用与 hash 路由
        │
        ▼
dist/（纯静态产物）
        │
        ▼
GitHub Pages（GitHub Actions）
```

构建阶段生成 `web/public/content.json`，Vite 将其复制到 `dist/content.json`；文件包含概念的标准化 frontmatter、正文 Markdown、内部链接和反向引用。浏览器不需要读取仓库文件系统，也不需要网络 API。

## 6. 目录与文件职责

```text
.
├── knowledge/
│   ├── index.md
│   ├── foundations/
│   │   ├── index.md
│   │   ├── what-is-okf.md
│   │   ├── format-not-service.md
│   │   ├── concept-document.md
│   │   ├── frontmatter.md
│   │   ├── links-and-graph.md
│   │   ├── progressive-disclosure.md
│   │   ├── producer-consumer.md
│   │   └── version-control.md
│   ├── examples/
│   │   ├── index.md
│   │   ├── table-orders.md
│   │   └── metric-weekly-active-users.md
│   ├── practices/
│   │   ├── index.md
│   │   ├── authoring-checklist.md
│   │   └── maintenance.md
│   ├── glossary.md
│   └── faq.md
├── web/
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── content.js
│       ├── graph.js
│       ├── markdown.js
│       └── styles.css
├── scripts/
│   ├── build-content.mjs
│   └── check-content.mjs
├── tests/
│   ├── content.test.mjs
│   └── build.test.mjs
├── docs/superpowers/specs/
├── .github/workflows/pages.yml
├── package.json
├── package-lock.json
└── README.md
```

职责边界：

- `knowledge/` 只保存知识和 OKF 目录导航，不保存 UI 逻辑。
- `scripts/build-content.mjs` 负责从 Markdown 构建可消费的数据，不负责页面布局。
- `scripts/check-content.mjs` 负责内容约束检查，在本地和 CI 中运行。
- `web/src/content.js` 负责加载、索引、搜索和筛选概念。
- `web/src/graph.js` 负责关系图的节点、边、布局和交互，不负责 Markdown 解析。
- `web/src/markdown.js` 负责安全地渲染正文并重写内部链接，不负责全局状态。
- `web/src/main.js` 负责页面状态、hash 路由和模块组合。
- `.github/workflows/pages.yml` 只负责安装、检查、构建和部署，不把发布逻辑塞进前端代码。

## 7. OKF 内容模型

每个概念文件使用以下 frontmatter 约定：

```yaml
---
type: concept
title: 什么是 OKF
description: 用 Markdown 和 YAML frontmatter 表达可移植知识的开放格式。
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf
tags: [okf, format, knowledge]
timestamp: 2026-07-13T00:00:00Z
---
```

`type`、`title`、`description`、`tags`、`timestamp` 为本知识库第一版的必需字段；这是本仓库在 OKF 最小互操作要求之上的内容校验 profile，不改变 OKF 规范本身仅要求 `type` 的原则。`resource` 用于指向外部规范、原始数据或权威来源。文件路径去掉 `.md` 后作为 `id`，站点使用该 `id` 作为稳定 hash 路由和图谱节点身份。

构建检查必须拒绝：

- 缺失必需 frontmatter 字段或字段类型错误。
- 同一 `id` 重复出现。
- 指向不存在概念的相对 `.md` 内部链接。
- `tags` 不是字符串数组，或 `timestamp` 不是可解析的 ISO 时间。

构建数据至少包含：

```js
{
  id,
  path,
  type,
  title,
  description,
  resource,
  tags,
  timestamp,
  markdown,
  links: [{ label, targetId }],
  backlinks: [{ sourceId, label }]
}
```

## 8. 第一批知识内容

首页和入口条目应解释 OKF 的用途与阅读路径；基础条目解释格式构成；实践条目解释如何维护；示例条目展示如何从真实问题建模为概念。

内容主题包括：

- OKF 是什么，以及它解决的 context fragmentation 问题。
- 为什么 OKF 是格式而不是另一个知识服务。
- 一个概念文件的 frontmatter 和 Markdown body 如何协作。
- 文件路径如何成为概念身份。
- 普通 Markdown 链接如何形成图关系和反向引用。
- `index.md` 如何支持渐进式披露。
- 生产者和消费者如何独立演进。
- Git 版本控制如何支持审阅、diff 和知识维护。
- 表、指标等数据概念的最小示例。
- 作者检查清单、维护节奏、术语表和 FAQ。

## 9. 站点交互设计

### 9.1 页面布局

- 顶部：品牌标识 `OKF / OPEN KNOWLEDGE FORMAT`、当前 bundle 名称、GitHub 仓库入口、搜索框。
- 左侧：概念总数、类型统计、目录导航和 type 筛选。
- 中间：关系图谱。节点颜色按 `type` 区分；选中节点高亮相邻节点和关系边；空状态提供“选择一个概念开始浏览”的提示。
- 右侧：选中概念的标题、类型、描述、标签、来源、正文和“被哪些概念引用”列表。
- 移动端：三栏变为顶部筛选、可横向滚动的图谱区域和单栏详情。

### 9.2 搜索与导航

- 搜索匹配 `title`、`id`、`description`、`tags` 和正文纯文本。
- 搜索结果按匹配相关性排序，结果项显示类型和路径。
- `#concept/<id>` 作为稳定详情地址；刷新后仍能打开同一概念。
- 点击正文内部链接时更新 hash、选中目标节点并滚动到详情顶部。
- 点击反向引用时跳转到引用来源概念。

### 9.3 视觉语言

- 深色背景，使用高对比文字保证长文阅读。
- 青绿色表示关系和可交互元素，暖黄色表示当前选中概念，紫色作为辅助类型色。
- 使用细边框、玻璃感面板和不依赖图片资源的几何装饰，保持静态站点轻量。
- 通过 `prefers-reduced-motion` 降低图谱和页面动画。

## 10. 构建与发布

`package.json` 提供：

- `npm run dev`：启动 Vite 本地开发服务器。
- `npm run check`：运行内容校验和单元测试。
- `npm run build`：先构建 `content.json`，再生成 `dist/`。
- `npm run preview`：预览生产构建。

`.github/workflows/pages.yml`：

1. 在 `main` push 或手动触发时运行。
2. 使用 Node 22 安装 `package-lock.json` 中的依赖，保证本地和 CI 的运行时一致。
3. 运行 `npm run check` 和 `npm run build`。
4. 使用 `actions/configure-pages`、`actions/upload-pages-artifact` 和 `actions/deploy-pages` 发布 `dist/`。
5. 为部署 job 声明 `contents: read`、`pages: write` 和 `id-token: write`，使用 `github-pages` environment。

Vite 的 base path 从 GitHub Actions 的 Pages 元数据或仓库名推导，确保项目站点在 `https://<owner>.github.io/okf/` 下加载 CSS、JavaScript、JSON 和 hash 路由。

## 11. 验证策略

### 内容校验

- 测试最小合法 frontmatter 可以构建。
- 测试缺失 `type`、`title`、`description`、`tags` 或 `timestamp` 时失败。
- 测试错误类型、非法时间和断链时失败。
- 测试跨目录内部链接会解析成正确的概念 ID。
- 测试 backlinks 是 links 的反向关系。

### 站点构建

- `npm run check` 退出码为 0。
- `npm run build` 退出码为 0，并生成 `dist/index.html`、静态资源和 `dist/content.json`。
- 生产预览能在项目路径下加载资源，不出现 404。

### 页面行为

- 首页能展示非零概念统计和图谱节点。
- 搜索可以命中标题、标签和正文。
- 点击节点显示正文和来源。
- 点击内部链接切换概念并更新 URL hash。
- 反向引用可以跳回来源概念。
- 移动宽度下不出现横向页面溢出。

### 发布验证

- GitHub Actions 的 Pages workflow 成功完成 build 和 deploy 两个 job。
- Pages URL 返回站点首页，且浏览器控制台没有资源加载错误。
- GitHub 仓库根目录保留可直接阅读的 `README.md` 和 `knowledge/`，站点发布不改变 OKF 源文件。

## 12. 风险与取舍

- 图谱节点过多会影响可读性；第一版通过 type 筛选、搜索聚焦和邻接节点高亮控制视觉噪声，不引入后端分页。
- Markdown 渲染必须避免把知识正文当作可执行 HTML；构建和渲染阶段都只允许安全的 Markdown 子集或明确转义原始 HTML。
- 项目站点 URL 包含仓库名；所有资源使用相对或由 Pages base path 生成的路径，避免根路径假设。
- GitHub Pages 是公开访问面，发布前不放入敏感业务知识；README 中明确这一约束。

## 13. 完成定义

当以下条件全部满足时，第一版完成：

1. `knowledge/` 包含可独立阅读的 OKF 方法论入门内容，所有条目通过内容校验。
2. 本地 `npm run check` 和 `npm run build` 均成功。
3. 站点具备搜索、筛选、图谱、详情、内部跳转和反向引用能力。
4. GitHub Actions 能从 `main` 自动部署到 Pages。
5. 使用 `gh` 创建并推送到 `fish0710/okf`，并能给出仓库 URL 与 Pages URL；若 GitHub 认证或网络仍不可用，则明确报告已完成的本地/提交状态和唯一外部阻塞点。
