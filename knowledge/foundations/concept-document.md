---
type: concept
title: 概念文件模型
description: 一个 OKF 概念由文件路径、frontmatter 和 Markdown body 共同组成。
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
tags: [okf, document, model]
timestamp: 2026-07-13T00:00:00Z
---

# 概念文件模型

## 一句话

一个文件表达一个概念：路径负责身份，frontmatter 负责结构化元数据，正文负责上下文。

## 最小形状

```markdown
---
type: concept
title: Orders
description: One row per completed order.
tags: [sales, table]
timestamp: 2026-07-13T00:00:00Z
---

# Orders

这里写 schema、业务定义、使用限制和相关链接。
```

实际写作时，先看 [frontmatter 字段](frontmatter.md)，再用 [Markdown 互链](links-and-graph.md) 表达概念关系。

## 为什么分成两部分

机器适合读取 `type`、标签和时间，人在正文里理解语义、例外和上下文。把所有内容塞进数据库字段会限制表达，把所有内容写成无结构长文又会增加索引成本。OKF 只约束两者之间的最小接口。
