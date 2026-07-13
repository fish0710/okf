---
type: example
title: Orders 表
description: 一个展示订单概念如何记录 schema、业务定义和关系的 OKF 示例。
resource: https://cloud.google.com/bigquery/docs/tables
tags: [okf, example, table, sales]
timestamp: 2026-07-13T00:00:00Z
---

# Orders 表

## 一句话

`orders` 每行代表一笔完成的客户订单，是指标概念可以引用的事实表。

## Schema

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `order_id` | `STRING` | 全局唯一订单 ID。 |
| `customer_id` | `STRING` | 客户 ID，可用于去重用户。 |
| `completed_at` | `TIMESTAMP` | 订单完成时间。 |
| `amount` | `NUMERIC` | 订单金额。 |

## 关系与边界

这个示例遵循 [概念文件模型](../foundations/concept-document.md) 和 [frontmatter 约定](../foundations/frontmatter.md)。它被 [周活跃用户指标](metric-weekly-active-users.md) 作为数据来源引用；真实项目还应补充资源 URI、所有者、刷新频率和敏感字段说明。
