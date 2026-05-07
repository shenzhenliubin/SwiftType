# Product Designer - 设计阶段

> 本阶段用于：小项目的完整产品设计，或大项目中单个模块的详细产品设计。

## 输入文档

### 小项目（完整设计）

- **BRD.md**: 业务需求文档
- **BRD_APPROVE.md**: BRD 批准文档

### 大项目（模块详细设计）

- **BRD.md**: 业务需求文档
- **PRODUCT-DESIGN-HIGH-LEVEL.md**: 高层产品设计（已通过 PR review）
- **Project Manager 的模块分配指令**: 指定本次设计的模块名称和范围

## 输出文档

| 模式 | 输出文档 |
|------|---------|
| 小项目 | PRODUCT-DESIGN.md |
| 大项目模块设计 | PRODUCT-DESIGN-{ModuleName}.md |

## 产出规范（EARS）

每个功能模块必须按以下结构描述：

### 1. Scenario (场景)
描述用户使用场景：
- 场景背景
- 用户角色
- 场景目标

### 2. UseCase (用例)
每个场景拆分为多个用例：
- 用例编号
- 用例名称
- 参与者
- 前置条件
- 后置条件

### 3. EARS 格式描述
每个用例用 EARS 语法描述：
- **Ubiquitous（普遍性）**: "The <system> shall <function>"
- **Event-driven（事件驱动）**: "When <trigger>, the <system> shall <response>"
- **Optional（可选）**: "Where <feature> is present, the <system> shall <function>"
- **State-driven（状态驱动）**: "While <state>, the <system> shall <function>"

## 工作流程

### 小项目（完整设计）

1. 启动 `/brainstorming` skill，进入产品设计探索模式
2. 分析 BRD 中的需求:
   - 核心功能需求 → 功能模块设计
   - 用户群体 → 用户流程设计
   - 验收标准 → 设计验收指标
3. 对每个功能模块进行 Scenario → UseCase → EARS 结构化描述
4. 输出 PRODUCT-DESIGN.md

### 大项目（模块详细设计）

1. 阅读 BRD.md + PRODUCT-DESIGN-HIGH-LEVEL.md
2. 确认本次设计的模块范围（Project Manager 指定）
3. 评估该模块是否需要进一步拆分:
   - 不需要 → 进行该模块的完整详细设计
   - 需要 → 进入 module-decomposition-phase（递归拆分）
4. 对该模块进行 Scenario → UseCase → EARS 结构化描述
5. 定义该模块与其他模块的依赖关系（数据接口、功能依赖）
6. 输出 PRODUCT-DESIGN-{ModuleName}.md

## 提示词样例

### 小项目

```
/brainstorming 请阅读当前项目目录下的 BRD.md 和 BRD_APPROVE.md，基于业务需求进行产品设计探索。

每个功能模块需要:
1. 定义 Scenario（用户使用场景）
2. 拆分 UseCase（具体用例）
3. 用 EARS 格式描述每个用例的行为
```

### 大项目模块设计

```
/brainstorming 请阅读当前项目目录下的 BRD.md 和 PRODUCT-DESIGN-HIGH-LEVEL.md。

你本次需要设计模块: [ModuleName]。

请先评估该模块是否需要进一步拆分:
- 如果模块规模仍较大，进入 module-decomposition-phase
- 如果模块规模适中，进行该模块的完整详细设计

每个功能需要:
1. 定义 Scenario（用户使用场景）
2. 拆分 UseCase（具体用例）
3. 用 EARS 格式描述每个用例的行为
4. 定义该模块与其他模块的依赖关系
```

## 文档结构规范

### PRODUCT-DESIGN.md（小项目完整设计）

```markdown
# 产品设计文档

## 1. 产品概述
- 产品名称
- 产品定位
- 目标用户
- 核心价值

## 2. 功能模块设计

### 2.1 模块 A: [模块名称]

#### Scenario: [场景名称]
- 场景背景: [描述]
- 用户角色: [描述]
- 场景目标: [描述]

#### UseCase 1: [用例名称]
- 用例编号: UC-001
- 参与者: [角色]
- 前置条件: [条件]
- 后置条件: [结果]

#### EARS 描述
- The system shall [功能描述]
- When [触发条件], the system shall [响应行为]

#### 界面原型说明
- [界面布局描述]

#### 交互设计说明
- [交互规则描述]

### 2.2 模块 B: [模块名称]
...

## 3. 用户流程设计
- 整体用户旅程
- 关键流程图
- 异常流程处理

## 4. 数据实体说明（业务视角）
- 核心数据实体: [实体名称及业务含义]
- 数据关系说明: [业务层面的关系]

## 5. 设计边界
- 包含范围
- 不包含范围（后续版本）
```

### PRODUCT-DESIGN-{ModuleName}.md（大项目模块设计）

```markdown
# 模块产品设计文档 - {ModuleName}

## 1. 模块概述

- **模块名称**: {ModuleName}
- **所属产品**: [产品名称]
- **模块职责**: [该模块负责什么]
- **高层设计参考**: PRODUCT-DESIGN-HIGH-LEVEL.md

## 2. 功能模块设计

[同完整设计的 Scenario → UseCase → EARS 结构]

## 3. 用户流程设计

[该模块内的用户流程]

## 4. 数据实体说明（业务视角）

[该模块涉及的数据实体]

## 5. 模块依赖关系

### 上游依赖

| 上游模块 | 依赖类型 | 依赖说明 | 需要的数据/功能 |
|---------|---------|---------|---------------|
| [M1] | 数据依赖 | [说明] | [具体依赖] |

### 下游依赖

| 下游模块 | 依赖类型 | 被依赖的数据/功能 |
|---------|---------|-----------------|
| [M2] | 功能依赖 | [说明] |

### 数据接口（业务视角）

> 描述本模块对外暴露的数据和功能（非技术接口定义）

- **提供给 [M2] 的数据**: [描述]
- **需要从 [M1] 获取的数据**: [描述]

## 6. 设计边界

- **包含范围**: [本模块覆盖的功能]
- **不包含范围**: [属于其他模块的功能]
```