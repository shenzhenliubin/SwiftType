# SwiftType 流程执行规范

> 本文档是管理系统的**正式执行合同**，定义 Artifact、状态机、转换规则、失效规则和人工介入规则。
> 真源为各 Agent 的 `agent-definition.md` + `*-phase.md`，本文档从中抽取归并，不做发明。

---

## 1. Artifact Registry

### 1.1 设计产物

| Artifact | 生产者 | 消费者 | 作用域 | 可失效 |
|----------|--------|--------|--------|--------|
| BRD.md | BA | BAR, PD | 全局 | 否 |
| PRODUCT-DESIGN.md | PD（小项目） | PR, UID, TFA, ARC, IMPD | 全局 | 是 |
| PRODUCT-DESIGN-HIGH-LEVEL.md | PD（大项目 L0） | PR, PM | 全局 | 是 |
| PRODUCT-DESIGN-{M}.md | PD（大项目 L1+） | PR, UID | 模块 | 是 |
| UI-DESIGN.md/.pen | UID（小项目） | UIR, TFA, ARC, IMPD | 全局 | 是 |
| DEMO.md/.pen | UID（小项目） | UIR | 全局 | 是 |
| UI-STYLE-GUIDE.md/.pen | UID（大项目） | UIR, PM | 全局 | 是 |
| UI-DESIGN-{M}.md/.pen | UID（大项目） | UIR, IMPD | 模块 | 是 |
| DEMO-{M}.md/.pen | UID（大项目） | UIR | 模块 | 是 |
| TECH-FEASIBILITY-REPORT.md | TFA | ARC, PM | 全局 | 否（最终版） |
| PRODUCT-DESIGN_ADJUSTMENT.md | TFA | PD | 全局 | 否（中间产物） |
| PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md | PD | TFA | 全局 | 否（中间产物） |
| TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md | TFA | PM | 全局 | 否 |
| ARCHITECTURE.md | ARC | ARCR, IMPD | 全局 | 否 |
| MODULE-DEPENDENCIES.md | ARC（大项目） | PM, IMPD | 全局 | 否 |
| TASK-UNITS.md | IMPD（小项目） | PM | 全局 | 否 |
| TASK-UNITS-{M}.md | IMPD（大项目） | PM | 模块 | 否 |
| TASK-UNIT-{name}.md | PM/System | CA, CR | 任务 | 否 |
| API-SPEC.md | IMPD（小项目） | IMPR, CA, CR | 全局 | 否 |
| FRONTEND-DESIGN.md | IMPD（小项目） | IMPR, CA, CR | 全局 | 否 |
| BACKEND-DESIGN.md | IMPD（小项目） | IMPR, CA, CR | 全局 | 否 |
| TEST-CASES-API.md | IMPD（小项目） | IMPR, CA, CR | 全局 | 否 |
| TEST-CASES-FRONTEND.md | IMPD（小项目） | IMPR, CA, CR | 全局 | 否 |
| TEST-CASES-BACKEND.md | IMPD（小项目） | IMPR, CA, CR | 全局 | 否 |
| API-SPEC-{M}.md | IMPD（大项目） | IMPR, 下游 IMPD, CA, CR | 模块 | 否 |
| FRONTEND-DESIGN-{M}.md | IMPD（大项目） | IMPR, CA, CR | 模块 | 否 |
| BACKEND-DESIGN-{M}.md | IMPD（大项目） | IMPR, CA, CR | 模块 | 否 |
| TEST-CASES-{M}-API.md | IMPD（大项目） | IMPR, CA, CR | 模块 | 否 |
| TEST-CASES-{M}-FRONTEND.md | IMPD（大项目） | IMPR, CA, CR | 模块 | 否 |
| TEST-CASES-{M}-BACKEND.md | IMPD（大项目） | IMPR, CA, CR | 模块 | 否 |

### 1.2 信号文档

| Artifact | 生产者 | 消费者 | 含义 |
|----------|--------|--------|------|
| BRD_APPROVE.md | BAR | PM | 需求已批准 |
| PRODUCT-DESIGN_APPROVE.md | PR | PM | 完整产品设计已批准（小项目） |
| PRODUCT-DESIGN-HIGH-LEVEL_APPROVE.md | PR | PM | 高层设计已批准（大项目） |
| PRODUCT-DESIGN-{M}_APPROVE.md | PR | PM | 模块设计已批准 |
| UI-DESIGN_APPROVE.md | UIR | PM | UI 设计已批准（小项目） |
| UI-STYLE-GUIDE_APPROVE.md | UIR | PM | 风格指南已批准（大项目） |
| UI-DESIGN-{M}_APPROVE.md | UIR | PM | 模块 UI 已批准 |
| ARCHITECTURE_APPROVE.md | ARCR | PM | 架构已批准 |
| IMPLEMENTATION_APPROVE.md | IMPR | PM | 实现设计已批准（小项目） |
| IMPLEMENTATION-{M}_APPROVE.md | IMPR | PM | 模块实现设计已批准 |
| E2E-DESIGN-APPROVE.md | E2ER | PM, E2ET | E2E 测试设计已批准 |
| E2E_APPROVE.md | E2ET | PM | E2E 测试执行通过 |
| TASK_UNIT_{name}_CODING_COMPLETE.md | CA | PM, CR | 任务单元代码完成 |
| TASK_UNIT_{name}_CODING_APPROVE.md | CR | PM | 任务单元代码已批准 |
| CODE-INTEGRATION-COMPLETE.md | 人类 | PM, E2ET | 代码已集成到主分支 |
| E2E-TEST-REPORT-R{N}.md | E2ET | PM | E2E 测试执行报告 |
| E2E-BUG-REPORT-R{N}.md | E2ET | BFA, PM | E2E 缺陷报告 |
| BUG-FIX-REPORT.md | BFA | CR | 缺陷修复完成 |
| BUG-FIX_APPROVE.md | CR | E2ET, PM | 缺陷修复代码已批准 |
| E2E-TEST-PAUSED.md | E2ET | PM | 测试不收敛，需人工介入 |
| REVIEW_PAUSED.md | CR / E2ER | PM | 评审中发现设计文档矛盾 |
| DOCUMENT_CONFLICT.md | 任意 Agent | PM | 文档间矛盾 |

### 1.3 评审中间产物

| Artifact | 生产者 | 消费者 | 生命周期 |
|----------|--------|--------|---------|
| *_REVIEW.md | 各 Reviewer | 被评审 Agent | 评审通过后归档 |
| *_REVIEW_FEEDBACK.md | 被评审 Agent | Reviewer | 评审通过后归档 |
| *_REVIEW_FEEDBACK-{n}.md | 被评审 Agent | Reviewer | 多轮讨论时递增编号 |

### 1.4 状态跟踪产物

| Artifact | 维护者 | 说明 |
|----------|--------|------|
| PROJECT-STATUS.md | PM | 项目全局状态和里程碑 |
| PROJECT-STATUS-{AgentRole}.md | 各 Agent | 各 Agent 度量数据 |
| DOCUMENT_CONFLICTS.md | PM | 矛盾持久化记录 |
| PROJECT-COMPLETE.md | PM | 项目完成总结 |

---

## 2. State Model

### 2.1 项目级状态

```
INIT → REQUIREMENTS → PRODUCT_DESIGN → UI_DESIGN → TECH_FEASIBILITY
    → ARCHITECTURE → IMPLEMENTATION_DESIGN → CODING → CODE_INTEGRATION
    → E2E_TEST_DESIGN → E2E_TEST_EXECUTION → COMPLETE → REVIEW
```

| 状态 | 入口信号 | 出口信号 |
|------|---------|---------|
| INIT | 用户想法 | PROJECT-STATUS.md 创建 |
| REQUIREMENTS | PROJECT-STATUS.md 创建 | BRD_APPROVE.md |
| PRODUCT_DESIGN | BRD_APPROVE.md | PRODUCT-DESIGN_APPROVE.md 或所有 PRODUCT-DESIGN-{M}_APPROVE.md |
| UI_DESIGN | 所有 PRODUCT-DESIGN* 已批准 | UI-DESIGN_APPROVE.md 或所有 UI-DESIGN-{M}_APPROVE.md |
| TECH_FEASIBILITY | UI* 已批准 | TECH-FEASIBILITY-REPORT.md（通过）或 TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md |
| ARCHITECTURE | TFA 通过 | ARCHITECTURE_APPROVE.md |
| IMPLEMENTATION_DESIGN | ARCHITECTURE_APPROVE.md | IMPLEMENTATION_APPROVE.md 或所有 IMPLEMENTATION-{M}_APPROVE.md |
| CODING | IMPD 已批准 | 所有 TASK_UNIT_{name}_CODING_APPROVE.md |
| CODE_INTEGRATION | 所有 CODING_APPROVE.md | CODE-INTEGRATION-COMPLETE.md |
| E2E_TEST_DESIGN | CODE-INTEGRATION-COMPLETE.md | E2E-DESIGN-APPROVE.md |
| E2E_TEST_EXECUTION | E2E-DESIGN-APPROVE.md | E2E_APPROVE.md |
| COMPLETE | E2E_APPROVE.md | PROJECT-COMPLETE.md |
| REVIEW | PROJECT-COMPLETE.md | PROJECT-REVIEW.md + AGENT-OPTIMIZATION.md |

### 2.2 模块级状态（大项目）

每个模块独立跟踪，PM 按依赖关系编排。

| 状态 | 含义 |
|------|------|
| PENDING | 等待上游依赖完成 |
| DESIGNING | PD 正在设计 |
| IN_REVIEW | PR 正在评审 |
| APPROVED | PRODUCT-DESIGN-{M}_APPROVE.md 已产生 |

状态适用于：产品设计模块、UI 设计模块、实现设计模块。

### 2.3 任务单元状态

| 状态 | 入口信号 | 出口信号 |
|------|---------|---------|
| PENDING | TASK-UNIT-{name}.md 已创建 | CA 开始编码 |
| CODING | CA 开始工作 | TASK_UNIT_{name}_CODING_COMPLETE.md |
| IN_REVIEW | CODING_COMPLETE.md | CR 输出 CODE_REVIEW.md 或直接 CODING_APPROVE.md |
| APPROVED | CODING_APPROVE.md | — |

### 2.4 评审环状态

```
REVIEW → FEEDBACK → (APPROVED | ANOTHER_ROUND)
```

| 状态 | 含义 |
|------|------|
| REVIEW | Reviewer 产出 *_REVIEW.md |
| FEEDBACK | 被评审 Agent 产出 *_REVIEW_FEEDBACK.md |
| APPROVED | Reviewer 产出 *_APPROVE.md |
| ANOTHER_ROUND | Reviewer 产出 *_REVIEW_FEEDBACK-{n}.md，回到 REVIEW |

### 2.5 E2E 修复循环状态

```
TEST_EXECUTION → (PASS | BUG_FOUND)
BUG_FOUND → BUG_FIX → BUG_REVIEW → RETEST
```

| 状态 | 入口信号 | 出口信号 |
|------|---------|---------|
| TEST_EXECUTION | E2ET 执行测试 | E2E-TEST-REPORT-R{N}.md |
| BUG_FOUND | E2E-BUG-REPORT-R{N}.md | BFA 开始修复 |
| BUG_FIX | BFA 修复完成 → BUG-FIX-REPORT.md | CR 评审 |
| BUG_REVIEW | CR 评审修复代码 | BUG-FIX_APPROVE.md |
| RETEST | BUG-FIX_APPROVE.md | E2ET 重新测试 → 回到 TEST_EXECUTION |
| PAUSED | 连续 4 轮不收敛 | E2E-TEST-PAUSED.md → 人工介入 |

---

## 3. Transition Rules

### 3.1 标准推进规则

| # | 触发信号 | 前置条件 | 状态变化 | PM 动作 |
|---|---------|---------|---------|--------|
| T1 | 用户想法 | 无 | INIT → REQUIREMENTS | 推进 BA |
| T2 | BRD.md | 无 | — | 推进 BAR |
| T3 | BRD_APPROVE.md | BRD.md 已评审 | REQUIREMENTS → PRODUCT_DESIGN | 推进 PD |
| T4 | PRODUCT-DESIGN.md（小项目） | BRD_APPROVE.md | — | 推进 PR |
| T5 | PRODUCT-DESIGN-HIGH-LEVEL.md（大项目） | BRD_APPROVE.md | — | 推进 PR |
| T6 | PRODUCT-DESIGN-HIGH-LEVEL_APPROVE.md | 大项目模式 | — | 读取模块依赖，按优先级推进 PD 做模块设计 |
| T7 | PRODUCT-DESIGN-{M}_APPROVE.md | 对应模块设计完成 | 模块状态更新 | 检查可并行的下游模块 |
| T8 | PRODUCT-DESIGN_APPROVE.md（小项目） | PR 已批准 | PRODUCT_DESIGN → UI_DESIGN | 推进 UID |
| T9 | 所有 PRODUCT-DESIGN-{M}_APPROVE（大项目） | 所有模块通过 | PRODUCT_DESIGN → UI_DESIGN | 推进 UID 做风格指南 |
| T10 | UI-DESIGN.md/.pen（小项目） | PD 已批准 | — | 推进 UIR |
| T11 | UI-DESIGN_APPROVE.md（小项目） | UIR 已批准 | UI_DESIGN → TECH_FEASIBILITY | 推进 TFA |
| T12 | UI-STYLE-GUIDE.md/.pen（大项目） | 所有 PD 模块通过 | — | 推进 UIR 评审风格指南 |
| T13 | UI-STYLE-GUIDE_APPROVE.md（大项目） | 风格指南已批准 | — | 按模块编排 UID |
| T14 | UI-DESIGN-{M}_APPROVE.md（大项目） | 对应模块 UI 完成 | 模块状态更新 | 检查所有模块是否完成 |
| T15 | 所有 UI-DESIGN-{M}_APPROVE（大项目） | 所有模块 UI 通过 | UI_DESIGN → TECH_FEASIBILITY | 推进 TFA |
| T16 | TECH-FEASIBILITY-REPORT.md（通过） | UI 已批准 | TECH_FEASIBILITY → ARCHITECTURE | 推进 ARC |
| T17 | TECH-FEASIBILITY-REPORT.md（需调整） | UI 已批准 | — | 推进 PD 进入技术调整回应 |
| T18 | PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md | PD 已回应 | — | 推进 TFA 确认 |
| T19 | TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md（无失效） | TFA 确认通过 | TECH_FEASIBILITY → ARCHITECTURE | 推进 ARC |
| T20 | TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md（有失效） | TFA 确认通过但产物失效 | — | 执行失效处理（见 §4） |
| T21 | ARCHITECTURE_APPROVE.md | TFA 已通过 | ARCHITECTURE → IMPLEMENTATION_DESIGN | 推进 IMPD（小项目）/ 按依赖编排模块 IMPD（大项目） |
| T22 | IMPLEMENTATION_APPROVE.md（小项目） | 架构已批准 | IMPLEMENTATION_DESIGN → CODING | 读取 TASK-UNITS.md，创建 TASK-UNIT-{name}.md，推进 CA |
| T23 | IMPLEMENTATION-{M}_APPROVE.md（大项目） | 模块实现设计完成 | 模块状态更新 | 读取 TASK-UNITS-{M}.md，创建 TASK-UNIT-{name}.md |
| T24 | 所有 IMPLEMENTATION-{M}_APPROVE（大项目） | 所有模块通过 | IMPLEMENTATION_DESIGN → CODING | 按依赖关系推进 CA |
| T25 | TASK_UNIT_{name}_CODING_COMPLETE.md | CA 完成编码 | 任务: CODING → IN_REVIEW | 推进 CR |
| T26 | TASK_UNIT_{name}_CODING_APPROVE.md | CR 通过 | 任务: IN_REVIEW → APPROVED | 更新依赖状态，检查可推进的后续任务 |
| T27 | 所有 CODING_APPROVE.md | 所有任务完成 | CODING → CODE_INTEGRATION | 通知人类进行 merge |
| T28 | CODE-INTEGRATION-COMPLETE.md | 人类完成 merge | CODE_INTEGRATION → E2E_TEST_DESIGN | 推进 E2ET |
| T29 | E2E-TEST-CASES.md + E2E test code | E2ET 完成测试设计 | — | 推进 E2ER |
| T30 | E2E-DESIGN-APPROVE.md | E2ER 通过 | E2E_TEST_DESIGN → E2E_TEST_EXECUTION | 推进 E2ET 执行 |
| T31 | E2E-BUG-REPORT-R{N}.md | E2ET 发现缺陷 | — | 推进 BFA |
| T32 | BUG-FIX-REPORT.md | BFA 完成修复 | — | 推进 CR 评审修复代码 |
| T33 | BUG-FIX_APPROVE.md | CR 通过 | — | 推进 E2ET 重新测试 |
| T34 | E2E-TEST-PAUSED.md | 连续 4 轮不收敛 | — | 向人类发出介入信号 |
| T35 | E2E_APPROVE.md | E2E 测试通过 | E2E_TEST_EXECUTION → COMPLETE | 进入 project-completion-phase |

### 3.2 大项目模块编排规则

#### 产品设计编排
```
触发: PRODUCT-DESIGN-HIGH-LEVEL_APPROVE.md
规则: 按依赖关系编排
  - P0 模块（无上游依赖）→ 可并行派遣 PD
  - P1 模块（依赖 P0）→ P0 通过后派遣
  - PN 模块 → 所有上游模块通过后派遣
完成条件: 所有 PRODUCT-DESIGN-{M}_APPROVE.md 已产生
```

#### UI 设计编排
```
触发: UI-STYLE-GUIDE_APPROVE.md
规则: 所有模块可并行（风格指南已定义）
完成条件: 所有 UI-DESIGN-{M}_APPROVE.md 已产生
```

#### 实现设计编排
```
触发: ARCHITECTURE_APPROVE.md
规则: 按依赖关系编排（与 PD 编排顺序一致）
  - 下游模块必须等上游 IMPLEMENTATION-{upstream-M}_APPROVE.md
  - 下游 IMPD 需读取上游 API-SPEC-{upstream-M}.md
完成条件: 所有 IMPLEMENTATION-{M}_APPROVE.md 已产生
```

### 3.3 异常转换

| 异常信号 | 产生者 | 处理 |
|---------|--------|------|
| DOCUMENT_CONFLICT.md | 任意 Agent | PM 暂停受影响流程 → 人工介入 |
| REVIEW_PAUSED.md | CR / E2ER | PM 暂停该评审 → 人工介入 |
| E2E-TEST-PAUSED.md | E2ET | PM 暂停 E2E 循环 → 人工介入 |
| BUG-FIX-REPORT.md 中标记设计问题 | BFA | PM 暂停修复 → 人工介入 |

---

## 4. Invalidation Rules

### 4.1 触发源

只有 TFA 调整确认阶段（TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md）会产生已批准产物失效。

### 4.2 失效判定

| 调整影响范围 | 失效产物 | 回流路径 | 恢复条件 |
|-------------|---------|---------|---------|
| 不影响已批准产物 | 无 | 直接推进 ARC | — |
| 修改已批准 PRODUCT-DESIGN* | PRODUCT-DESIGN*_APPROVE.md | 回流 PR 重审受影响部分 | PR 重新批准 |
| 修改已批准 UI-DESIGN* / UI-STYLE-GUIDE* | UI*_APPROVE.md / UI-STYLE-GUIDE*_APPROVE.md | 回流 UID 重做受影响部分 + UIR 评审 | UIR 重新批准 |

### 4.3 失效恢复流程

```
TFA 输出 TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md（含失效声明）
    ↓
PM 读取失效声明
    ↓
标记对应 *_APPROVE.md 失效
    ↓
按回流路径派发重审任务
    ↓
重新获得 *_APPROVE.md
    ↓
所有失效产物恢复后 → 推进 ARC
```

---

## 5. Human Intervention Rules

### 5.1 必须人工介入的场景

| 场景 | 触发信号 | 人类职责 | 恢复条件 |
|------|---------|---------|---------|
| 文档矛盾 | DOCUMENT_CONFLICT.md | 分析矛盾，修改文档或做决策 | 人类确认已修复 |
| 评审中设计文档矛盾 | REVIEW_PAUSED.md | 解决设计文档矛盾 | 人类确认已修复 |
| E2E 测试不收敛 | E2E-TEST-PAUSED.md | 分析根因，调整策略 | 人类确认可继续 |
| 缺陷根因是设计问题 | BFA 在 BUG-FIX-REPORT.md 中标记 | 修改设计文档 | 人类确认已修复 |
| 代码集成（merge） | 所有 CODING_APPROVE.md | 人工 merge 到主分支 | CODE-INTEGRATION-COMPLETE.md |
| TFA 调整后产物失效 | TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md | PM 自动路由（无需人工） | 重审通过后自动恢复 |

### 5.2 暂停范围

| 矛盾类型 | 暂停范围 |
|---------|---------|
| 需求与设计矛盾 | 依赖该需求的所有下游流程 |
| 设计文档间矛盾 | 依赖这些文档的下游流程 |
| 接口定义矛盾 | 编码和测试 |
| 测试不收敛 | E2E 测试循环 |
| 设计文档本身有问题 | Bug Fix，等待设计修复 |
| 评审中设计文档矛盾 | 当前评审流程 |

### 5.3 恢复流程

```
人类处理完成
    ↓
PM 记录处理结果到 DOCUMENT_CONFLICTS.md
    ↓
通知受影响 Agent 重新阅读修改后的文档
    ↓
回到 stage-transition-phase 恢复正常推进
```

---

## 6. Review 环通用规则

### 6.1 零问题直接通过

所有 Reviewer：评审过程中未发现任何问题 → 直接输出 *_APPROVE.md，不输出 REVIEW 文档。

度量记录：零问题直接通过记作"第 1 轮、0 问题"，正常记录到 PROJECT-STATUS-{ReviewerRole}.md。

### 6.2 评审环状态机

```
Reviewer 评审
    ↓
有问题？
    ├─ 否 → 直接输出 *_APPROVE.md
    └─ 是 → 输出 *_REVIEW.md
                ↓
         被评审 Agent 回应
                ↓
         输出 *_REVIEW_FEEDBACK.md
                ↓
         Reviewer 处理反馈
                ↓
         全部一致？
             ├─ 是 → 输出 *_APPROVE.md
             └─ 否 → 输出 *_REVIEW_FEEDBACK-{n}.md（回到被评审 Agent）
                     或 REVIEW_PAUSED.md（设计文档矛盾 → 人工介入）
```

### 6.3 适用范围

| Reviewer | 评审对象 | APPROVE 文档 |
|----------|---------|-------------|
| BAR | BRD.md | BRD_APPROVE.md |
| PR | PRODUCT-DESIGN*.md | 对应 *_APPROVE.md |
| UIR | UI-DESIGN*.md / UI-STYLE-GUIDE*.md | 对应 *_APPROVE.md |
| ARCR | ARCHITECTURE.md | ARCHITECTURE_APPROVE.md |
| IMPR | 实现设计文档 | IMPLEMENTATION*_APPROVE.md |
| CR | 任务单元代码 / 缺陷修复代码 | TASK_UNIT_{name}_CODING_APPROVE.md / BUG-FIX_APPROVE.md |
| E2ER | E2E 测试设计 | E2E-DESIGN-APPROVE.md |
