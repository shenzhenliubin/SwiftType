# Project Manager - 项目启动阶段

## 输入

- 用户提出项目想法（人工发起）

## 输出文档

- **PROJECT-STATUS.md**: 项目初始化状态

## 工作流程

### Step 1: 接收项目想法

确认收到用户的项目想法，初始化项目。

### Step 2: 初始化项目状态

1. 创建 PROJECT-STATUS.md，记录项目启动
2. 确认项目目录结构就绪

### Step 3: 推进 BA 开始需求收集

通知 Business Analyst 开始工作：
- 触发条件：用户想法已收到
- BA 进入 requirements-collection-phase

### 完整流程

```
用户提出项目想法
    ↓
初始化项目状态 → PROJECT-STATUS.md
    ↓
推进 BA 进入 requirements-collection-phase
    ↓
进入 stage-transition-phase（持续监控信号文档）
```

## 提示词样例

```
你收到一个新项目想法。请:

1. 初始化项目状态，输出 PROJECT-STATUS.md
2. 推进 Business Analyst 开始需求收集

注意:
- 你不参与需求分析，只负责推进流程
- 确认项目目录结构就绪后通知 BA
```
