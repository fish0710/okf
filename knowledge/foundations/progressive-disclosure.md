---
type: concept
title: 渐进式披露
description: 通过 index.md 和概念链接分层加载知识，避免一次性读取整个 bundle。
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf
tags: [okf, navigation, agents]
timestamp: 2026-07-13T00:00:00Z
---

# 渐进式披露

## 一句话

先读入口和摘要，再按需要深入具体概念，既适合人浏览，也适合 Agent 控制上下文大小。

## 目录入口

每个主题目录可以有一个 `index.md`，列出本层最重要的概念和一句话说明。Agent 先读取 [知识库首页](../index.md)，再根据任务选择 [基础概念](index.md) 或其他主题入口。

## 为什么重要

一次加载所有文件会增加噪声和上下文成本；完全依赖搜索又可能丢失概念之间的导航关系。入口文件提供稳定的阅读顺序，普通链接则允许从摘要逐步走到细节。
