---
type: faq
title: OKF 常见问题
description: 关于 OKF 依赖、可视化和 Agent 消费方式的快速回答。
resource: https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing
tags: [okf, faq, getting-started]
timestamp: 2026-07-13T00:00:00Z
---

# OKF 常见问题

## OKF 是否要求使用 Google Cloud？

不要求。OKF 是文件格式，不绑定 Google Cloud、BigQuery、某个模型或 Agent 框架。云平台可以生产或消费它，但不是前提。参考 [为什么是格式，而不是另一个服务](foundations/format-not-service.md)。

## OKF 是否必须配一个图谱 UI？

不必须。图谱只是一个消费者形态，Markdown 文件本身才是知识源。你可以用 GitHub、静态文档站、搜索索引或脚本读取同一个 bundle。

## Agent 如何消费 OKF？

Agent 可以先读取入口 `index.md`，再沿着相关概念的 Markdown 链接渐进式加载正文和 frontmatter。这样既保留了人的阅读路径，也避免把整个知识库一次性塞进上下文。参见 [渐进式披露](foundations/progressive-disclosure.md)。

## 为什么不把所有字段都放进 YAML？

YAML 适合少量稳定、可查询的字段；定义、示例和例外更适合 Markdown。这个分工正是 [概念文件模型](foundations/concept-document.md) 的核心。
