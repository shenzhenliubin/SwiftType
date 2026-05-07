# Project Manager - 阶段推进阶段

> 本阶段是 Project Manager 的核心持续工作。PM 始终监控信号文档，根据前置条件推进下一阶段。

## 输入文档

- 所有 *_APPROVE.md、*_COMPLETE.md 信号文档
- PRODUCT-DESIGN-HIGH-LEVEL.md（大项目时，读取模块依赖关系）
- PROJECT-STATUS.md（当前项目状态）

## 输出文档

- **PROJECT-STATUS.md**: 更新项目进度状态（每次推进后更新）

## 工作流程

### Step 1: 监控信号文档

持续检查项目中是否产生了新的信号文档。

### Step 2: 确认前置条件并推进

根据产生的信号文档，按以下规则推进：

| 产生的信号文档 | 推进动作 |
|-------------|---------|
| BRD.md | 推进 BAR 开始需求评审 |
| BRD_APPROVE.md | 推进 PD 开始产品设计 |
| PRODUCT-DESIGN.md（小项目） | 推进 PR 评审完整设计 |
| PRODUCT-DESIGN-HIGH-LEVEL.md（大项目） | 推进 PR 评审高层设计 |
| PRODUCT-DESIGN-HIGH-LEVEL_APPROVE.md | 读取模块依赖，按优先级推进 PD 做各模块设计 |
| PRODUCT-DESIGN-{M}.md | 推进 PR 评审对应模块设计 |
| PRODUCT-DESIGN-{M}_APPROVE.md | 更新模块完成状态，检查所有模块是否完成 |
| PRODUCT-DESIGN_APPROVE.md（小项目） | 推进 UID 开始 UI 设计 |
| 所有 PRODUCT-DESIGN-{M}_APPROVE（大项目） | 推进 UID 开始风格指南设计 |
| UI-DESIGN.md/.pen（小项目） | 推进 UIR 开始 UI 评审（输出 UI-DESIGN_REVIEW.md） |
| UI-DESIGN_APPROVE.md（小项目） | 推进 TFA 开始技术可行性分析 |
| UI-STYLE-GUIDE.md/.pen（大项目） | 推进 UIR 评审风格指南（输出 UI-STYLE-GUIDE_REVIEW.md） |
| UI-STYLE-GUIDE_APPROVE.md（大项目） | 按模块编排，推进 UID 做各模块 UI 设计 |
| UI-DESIGN-{M}.md/.pen（大项目） | 推进 UIR 评审对应模块 UI（输出 UI-DESIGN-{M}_REVIEW.md） |
| UI-DESIGN-{M}_APPROVE.md（大项目） | 更新模块 UI 完成状态，检查所有模块是否完成 |
| 所有 UI-DESIGN-{M}_APPROVE（大项目） | 推进 TFA 开始技术可行性分析 |
| TECH-FEASIBILITY-REPORT.md（通过） | 推进 ARC 开始架构设计 |
| TECH-FEASIBILITY-REPORT.md（需调整） | 推进 PD 进入技术调整回应阶段 |
| PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md | 推进 TFA 确认调整 |
| TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md（无失效） | 推进 ARC 开始架构设计 |
| TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md（有 PRODUCT-DESIGN* 失效） | 标记原 APPROVE 失效，回流 PR 重审 |
| TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md（有 UI* 失效） | 标记原 APPROVE 失效，回流 UID/UIR |
| ARCHITECTURE.md | 推进 ARCR 开始架构评审 |
| ARCHITECTURE_APPROVE.md（小项目） | 推进 IMPD 开始实现设计 |
| ARCHITECTURE_APPROVE.md（大项目） | 按模块依赖关系推进 IMPD 做各模块实现设计 |
| API-SPEC-{M}.md + FRONTEND-DESIGN-{M}.md + BACKEND-DESIGN-{M}.md + TEST-CASES-{M}-*.md | 推进 IMPR 评审对应模块实现设计 |
| IMPLEMENTATION_APPROVE.md（小项目） | 读取 TASK-UNITS.md，按依赖关系逐个创建 TASK-UNIT-{name}.md 并推进 Coding Agent |
| IMPLEMENTATION-{M}_APPROVE.md（大项目） | 更新模块实现设计完成状态，读取 TASK-UNITS-{M}.md 创建 TASK-UNIT-{name}.md 并推进 |
| 所有 IMPLEMENTATION-{M}_APPROVE（大项目） | 确认所有模块任务单元已创建，按依赖关系推进 Coding Agent |
| TASK_UNIT_{name}_CODING_COMPLETE.md | 推进 CR 评审该任务单元 |
| TASK_UNIT_{name}_CODING_APPROVE.md | 更新任务完成状态，检查可推进的后续任务 |
| 所有 CODING_APPROVE.md | 通知人类进行代码集成（merge） |
| CODE-INTEGRATION-COMPLETE.md | 推进 E2ET 开始 E2E 测试设计 |
| E2E-TEST-CASES.md + E2E test code | 推进 E2ER 评审 E2E 测试设计 |
| E2E-DESIGN-APPROVE.md | 推进 E2ET 执行测试 |
| E2E-BUG-REPORT-R{N}.md | 推进 BFA 开始修复 |
| BUG-FIX-REPORT.md | 推进 CR 评审修复代码 |
| BUG-FIX_APPROVE.md | 推进 E2ET 重新测试 |
| E2E_APPROVE.md | 进入 project-completion-phase |
| E2E-TEST-PAUSED.md | 向人类发出介入信号 |

### Step 3: 大项目模块编排

#### 3.1 产品设计模块编排

当收到 PRODUCT-DESIGN-HIGH-LEVEL_APPROVE.md 时：

1. 阅读 PRODUCT-DESIGN-HIGH-LEVEL.md 中的模块依赖关系和优先级
2. 确定可并行设计的模块（无依赖关系的模块）
3. 按优先级派遣 PD 做各模块详细设计
4. 监控各模块的 PRODUCT-DESIGN-{M}_APPROVE.md
5. 所有模块通过后推进 UID 风格指南设计

```
P0 模块（无上游依赖）→ 可并行派遣 PD 设计
P1 模块（依赖 P0）→ P0 通过后派遣
P2 模块（依赖 P0, P1）→ P0, P1 都通过后派遣
...
所有模块 PRODUCT-DESIGN-{M}_APPROVE → 推进 UID 风格指南设计
```

#### 3.2 UI 设计模块编排

当收到 UI-STYLE-GUIDE_APPROVE.md 时：

1. 阅读模块依赖关系（来自 PRODUCT-DESIGN-HIGH-LEVEL.md）
2. 派遣 UID 做各模块 UI 设计（可并行）
3. 监控各模块的 UI-DESIGN-{M}_APPROVE.md
4. 所有模块通过后推进 TFA

```
所有模块可并行派遣 UID 设计（风格指南已定义）
→ 每个模块输出 UI-DESIGN-{M}.md/.pen + DEMO-{M}.md/.pen
→ 每个模块独立走 UIR review
所有模块 UI-DESIGN-{M}_APPROVE → 推进 TFA
```

#### 3.3 实现设计模块编排

当收到 ARCHITECTURE_APPROVE.md 时：

1. 阅读模块依赖关系和 API 依赖关系
2. 按依赖顺序派遣 IMPD 做各模块实现设计
3. 下游模块必须等上游模块通过 IMPR review
4. 监控各模块的 IMPLEMENTATION-{M}_APPROVE.md
5. 所有模块通过后推进 Coding Agent

```
P0 模块（无上游依赖）→ 派遣 IMPD 设计（无上游 API-SPEC 需读取）
P1 模块（依赖 P0）→ P0 通过 IMPR review 后派遣，读取 API-SPEC-{P0}.md
P2 模块（依赖 P0, P1）→ P0, P1 都通过 IMPR review 后派遣，读取对应 API-SPEC
...
所有模块 IMPLEMENTATION-{M}_APPROVE → 推进 Coding Agent
```

**关键原则**:
> UID 模块编排：风格指南通过后，所有模块可并行 UI 设计。
> IMPD 模块编排：必须按依赖顺序，下游模块需要读取上游 API-SPEC。
> IMPD 的模块依赖顺序与 PD 的模块设计顺序一致。

### Step 4: 更新项目状态

每次推进后更新 PROJECT-STATUS.md，记录：
- 当前阶段
- 模块/任务单元完成状态
- 异常事件

> 注意：各 Agent 的度量数据由各 Agent 各自维护在 PROJECT-STATUS-{AgentRole}.md 中，PM 不负责收集各 Agent 的度量数据。PM 只记录全局视角的项目状态和里程碑。

## 提示词样例

```
你需要监控项目中的信号文档，根据产生的信号推进流程。

检查项目中是否存在新的信号文档（*_APPROVE.md, *_COMPLETE.md 等）:

1. 如果发现 BRD_APPROVE.md:
   - 推进 Product Designer 开始产品设计

2. 如果发现 PRODUCT-DESIGN-HIGH-LEVEL_APPROVE.md:
   - 阅读模块依赖关系
   - 按优先级派遣 PD 做各模块详细设计
   - 无依赖的模块可并行

3. 如果发现某个模块的 PRODUCT-DESIGN-{M}_APPROVE.md:
   - 更新模块完成状态
   - 检查是否有新模块可以开始设计

4. 如果发现所有模块的 PRODUCT-DESIGN-{M}_APPROVE.md（大项目）:
   - 推进 UID 设计整体风格指南
   - 等待 UI-STYLE-GUIDE_APPROVE.md

5. 如果发现 UI-STYLE-GUIDE_APPROVE.md（大项目）:
   - 按模块编排，派遣 UID 做各模块 UI 设计
   - 模块可并行

6. 如果发现某个模块的 UI-DESIGN-{M}_APPROVE.md（大项目）:
   - 更新模块 UI 完成状态
   - 检查所有模块 UI 是否完成

7. 如果发现 ARCHITECTURE_APPROVE.md（大项目）:
   - 按模块依赖顺序编排 IMPD
   - 下游模块必须等上游模块通过 IMPR review
   - 下游 IMPD 需要读取上游 API-SPEC

8. 如果发现某个模块的 IMPLEMENTATION-{M}_APPROVE.md（大项目）:
   - 更新模块实现设计完成状态
   - 检查是否有依赖此模块的下游模块可以开始设计

9. ...（其他信号文档按规则处理）

每次推进后更新 PROJECT-STATUS.md。

注意:
- 你只推进流程，不参与设计和实现
- 大项目时按模块依赖关系编排，不要跳过依赖
- IMPD 模块编排：下游模块必须等上游 API-SPEC 通过 review
- 发现 DOCUMENT_CONFLICT.md 时暂停并进入 conflict-resolution-phase
```
