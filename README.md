# OKF Knowledge Map

这是一个以 [Open Knowledge Format（OKF）](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing?utm_source=chatgpt.com) 为方法论入口的中文知识仓库与可视化站点。

## 这是什么

知识源在 [`knowledge/`](knowledge/) 中以 Markdown 文件保存。每个文件使用 YAML frontmatter 描述类型、标题、标签和时间戳，再通过普通 Markdown 链接连接到其他概念。构建脚本会校验元数据与内部链接，并生成供浏览器消费的静态 JSON bundle。

站点提供：

- 按标题、标签和正文搜索概念
- 按概念类型筛选
- 可点击的关系图与一跳邻居聚焦
- Markdown 详情、来源链接与反向引用
- GitHub Pages 静态部署

## 本地运行

要求 Node.js 22 或更高版本。本项目没有运行时依赖，不需要安装 npm 包。

```bash
npm run check
npm run build
npm run preview
```

然后打开 <http://localhost:4173>。

## 内容结构

```text
knowledge/             # OKF Markdown 知识源
scripts/               # 校验、构建和预览服务
web/src/               # 浏览器端索引、Markdown 渲染和 SVG 关系图
.github/workflows/     # GitHub Pages 部署工作流
```

新增知识文件后运行 `npm run check`。如果 frontmatter 缺字段、标签格式错误，或内部 `.md` 链接无法解析，检查会失败。

## 参考资料

- [Google Cloud：How the Open Knowledge Format can improve data sharing](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing?utm_source=chatgpt.com)
- [GoogleCloudPlatform/knowledge-catalog 中的 OKF 规范](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)
