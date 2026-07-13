---
type: practice
title: OKF 作者检查清单
description: 新增或修改概念文件时可重复执行的最小检查步骤。
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
tags: [okf, authoring, checklist]
timestamp: 2026-07-13T00:00:00Z
---

# OKF 作者检查清单

提交一个概念前，逐项确认：

- 文件只描述一个清晰概念，路径稳定且不使用临时名称。
- frontmatter 包含 `type`、`title`、`description`、`tags` 和 `timestamp`。
- `tags` 是短小、可复用的字符串数组，时间是 ISO 格式。
- 正文解释定义、边界、示例和使用方式，而不是只留下一个标题。
- 重要关系使用真实的相对 `.md` 链接，外部来源保留 URL。
- 变更了口径时同时更新相关入口、指标和反向关系。
- 运行 `npm run check`，确认没有断链或字段错误。

字段细节参考 [YAML frontmatter](../foundations/frontmatter.md)，关系表达参考 [Markdown 互链](../foundations/links-and-graph.md)。
