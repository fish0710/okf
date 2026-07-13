---
type: concept
title: 为什么是格式，而不是另一个服务
description: OKF 通过文件级约定解耦知识生产者和消费者，而不是增加一个中心化平台。
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf/SPEC.md
tags: [okf, interoperability, portability]
timestamp: 2026-07-13T00:00:00Z
---

# 为什么是格式，而不是另一个服务

## 一句话

服务解决“在哪里运行”，格式解决“如何交换”，OKF 选择先把后者定义清楚。

## 三个边界

1. **生产者独立**：人、导出脚本或 Agent 都可以写 OKF 文件。
2. **消费者独立**：GitHub、静态站点、搜索索引或另一个 Agent 都可以读取同一 bundle。
3. **平台独立**：文件不要求特定云、数据库、模型供应商或 SDK。

这意味着团队可以先把知识写成文件，再按需要增加目录、图谱或检索服务。中心服务可以是一个消费者，但不应该成为知识唯一存在的地方。

## 和 [什么是 OKF](what-is-okf.md) 的关系

OKF 的价值不是增加一个知识门户，而是降低知识从一个工具移动到另一个工具的成本。生产者和消费者可以独立演进，边界由 [生产者与消费者](producer-consumer.md) 这份约定连接。
