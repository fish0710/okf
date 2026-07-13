---
type: example
title: 周活跃用户
description: 用订单事件示范如何记录一个可计算、可审阅的业务指标。
resource: https://cloud.google.com/bigquery/docs/reference/standard-sql/date_functions
tags: [okf, example, metric, users]
timestamp: 2026-07-13T00:00:00Z
---

# 周活跃用户

## 一句话

周活跃用户（WAU）是指定自然周内至少完成一次有效行为的去重用户数。

## 计算口径

```sql
COUNT(DISTINCT customer_id)
WHERE completed_at >= week_start
  AND completed_at < week_start + INTERVAL 7 DAY
```

在这个最小示例中，有效行为来自 [Orders 表](table-orders.md) 的完成订单。真实业务需要继续定义时区、退款、测试账号和重复事件的处理方式。

## 为什么要写成概念

只保存 SQL 不足以表达指标的业务语义和适用边界。把口径写进 OKF 后，Agent 可以先理解定义，再决定是否生成查询；[Markdown 互链](../foundations/links-and-graph.md) 也能把指标和数据来源呈现成一条关系。
