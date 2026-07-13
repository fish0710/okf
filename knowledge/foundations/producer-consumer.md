---
type: concept
title: 生产者与消费者
description: OKF 用文件格式把知识的写入者和读取者解耦。
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf
tags: [okf, producer, consumer]
timestamp: 2026-07-13T00:00:00Z
---

# 生产者与消费者

## 一句话

谁负责写知识，不应该决定谁能够读取知识。

## 生产者

生产者可以是手工编辑、数据库导出脚本、元数据目录同步任务或 Agent。它们只需要生成符合 profile 的 Markdown 文件，并把来源和时间写清楚。

## 消费者

消费者可以是 GitHub、静态阅读器、全文索引、图谱可视化或另一个 Agent。它们可以只读取 `type` 和标题，也可以继续读取正文和互链。

这种边界让 [OKF 成为格式而不是服务](format-not-service.md)，也让 [版本控制协作](version-control.md) 可以成为默认的维护方式。
