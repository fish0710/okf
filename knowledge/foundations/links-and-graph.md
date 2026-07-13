---
type: concept
title: Markdown 互链与知识图谱
description: 普通 Markdown 链接把文件系统的树扩展为可导航的知识关系图。
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf
tags: [okf, links, graph]
timestamp: 2026-07-13T00:00:00Z
---

# Markdown 互链与知识图谱

## 一句话

目录表达层级，正文里的相对 Markdown 链接表达关系，两者合起来形成可导航的知识图。

## 关系来自哪里

```markdown
指标 [周活跃用户](../examples/metric-weekly-active-users.md)
依赖 [Orders 表](../examples/table-orders.md) 的去重用户字段。
```

可视化工具可以把链接解析为有向边，反向遍历就得到“被哪些概念引用”。这比只依赖父子目录更丰富，因为一个指标可以同时关联多个表、定义或实践。

## 链接检查

链接应优先指向仓库内真实的 `.md` 文件；外部链接用于保留权威出处。新增关系时同时确认目标概念是否存在，并在 [维护流程](../practices/maintenance.md) 中运行断链检查。
