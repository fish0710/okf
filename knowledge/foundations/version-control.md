---
type: practice
title: 用版本控制维护知识
description: 把知识当作代码一样通过 diff、评审和历史记录持续演进。
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf
tags: [okf, git, review]
timestamp: 2026-07-13T00:00:00Z
---

# 用版本控制维护知识

## 一句话

知识进入 Git 后，变更原因、审阅意见和历史版本都可以被追踪。

## 一个实用流程

1. 新增或修改一个概念文件。
2. 在同一变更中更新必要的入口和反向关系。
3. 运行字段、日期和断链校验。
4. 通过 pull request 让熟悉领域的人审阅语义。
5. 合并后自动刷新静态站点。

这种方式保持了 [生产者与消费者](producer-consumer.md) 的独立，也让 [维护流程](../practices/maintenance.md) 可以自动化。
