---
type: concept
title: 什么是 OKF
description: 用 Markdown 文件和 YAML frontmatter 表达可移植知识的开放格式。
resource: https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing
tags: [okf, format, knowledge]
timestamp: 2026-07-13T00:00:00Z
---

# 什么是 OKF

## 一句话

OKF（Open Knowledge Format）是一组让人和 Agent 都能直接读懂、交换和维护的知识文件约定。

## 它解决什么问题

组织里的表结构、指标定义、运行手册和 API 说明，往往分散在数据目录、Wiki、代码注释和个人经验中。Agent 每次回答问题都要重新拼装这些上下文，知识也容易被某个工具锁住。

OKF 把知识收敛为普通 Markdown 文件：frontmatter 保存少量可检索元数据，正文保存解释、示例和关系。它不要求某个模型、云厂商或运行时，因此可以和代码一起进入版本控制。

## 继续阅读

- [为什么是格式，而不是另一个服务](format-not-service.md)
- [一个概念文件长什么样](concept-document.md)
