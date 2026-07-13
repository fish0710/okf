---
type: practice
title: 知识库维护流程
description: 通过定期检查和 pull request 让 OKF bundle 保持可读、可链接和可发布。
resource: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests
tags: [okf, maintenance, workflow]
timestamp: 2026-07-13T00:00:00Z
---

# 知识库维护流程

## 每次变更

修改概念时说明变化原因，更新 `timestamp`，检查正文中的来源和内部链接，并让领域负责人审阅语义。自动校验负责发现字段错误和断链，不能替代人的事实判断。

## 定期检查

- 检查没有指向不存在文件的相对链接。
- 检查引用的概念是否仍然存在且定义一致。
- 检查长期未更新但仍被大量引用的概念，确认是否需要补充说明。
- 检查入口 `index.md` 是否覆盖新主题。
- 检查 GitHub Pages 构建是否成功。

这一流程依赖 [版本控制](../foundations/version-control.md) 的 diff 和审阅能力，也遵循 [渐进式披露](../foundations/progressive-disclosure.md) 的入口约定。
