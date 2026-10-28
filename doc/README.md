# Lab1 Phase 1：SVG 编辑器（CLI）

## 架构方案（初稿）

采用 TypeScript 类层次和多态。领域模型不依赖文件系统、CLI 或 XML 库；应用层通过存储接口调用基础设施。每个类一个同名文件。

| 模块 | 职责 | 允许依赖 |
|---|---|---|
| `src/domain` | 六种图形、组合树、几何、文档不变量 | 本模块 |
| `src/application` | Command、Memento、历史、存储端口 | domain、本模块 |
| `src/infrastructure` | SVG XML 编解码、文件适配器 | domain、application |
| `src/cli` | 分词、命令分发、REPL、组装 | application、domain；仅 Main 可引用 infrastructure |

设计选择：Composite 统一叶子与容器操作；Command 将每条编辑封装为命令对象；Memento 保存前后文档快照，用事务副本确保失败不修改状态；存储端口隔离 IO。

变化点：新增交互界面复用应用层；新增图形暂用唯一工厂注册表；新增命令暂用唯一命令分发表。两个按名字分派点后续可重构为插件注册，本阶段不实现 `box`。

## 过程记录

1. 阅读作业后确定 Phase 1 范围，排除后续插件类型 `box`。
2. 先记录分层和依赖，再分阶段实现模型、命令、IO 和验证；最终补充实际问题与修订依据。

## 一致性自查

实现后补充目录与依赖检查结果。

## 质量保证手段

计划以类型检查、领域与命令测试、真实 REPL 脚本及 SVG 保存读回验证完整性。
