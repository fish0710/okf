---
type: concept
title: YAML frontmatter
description: 用于标识、检索和更新时间的结构化元数据块。
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
tags: [okf, yaml, metadata]
timestamp: 2026-07-13T00:00:00Z
---

# YAML frontmatter

## 一句话

frontmatter 只保存需要被工具快速查询的字段，正文仍然保留完整语义。

## 推荐字段

本知识库要求每个文件包含：

- `type`：概念类型，例如 `concept`、`example` 或 `practice`。
- `title`：面向人的标题。
- `description`：一段可用于列表和搜索结果的摘要。
- `tags`：字符串数组，用于聚合和筛选。
- `timestamp`：最近一次确认内容的 ISO 时间。
- `resource`：可选的权威来源或原始资源链接。

OKF 的最小互操作要求只需要 `type`；这里更严格的字段是本知识库为了保持质量而设定的校验 profile。创建文件时可以参考 [概念文件模型](concept-document.md)，提交前使用 [作者检查清单](../practices/authoring-checklist.md)。

## 写作规则

字段名保持稳定，标签使用小写短词；不要把大段正文塞进 frontmatter，也不要把会频繁变化的临时状态冒充为概念元数据。
