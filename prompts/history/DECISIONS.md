# 关键设计决策记录

> **注意**: 本文档为历史讨论记录。流程唯一真源为各 Agent 的 `agent-definition.md` + `*-phase.md` 文件。
> 如本文档与 Agent 定义文件冲突，以 Agent 定义文件为准。

本文档记录 SwiftType Agent 流程设计过程中的关键决策，包括议题、思考过程和最终选择。

---

## 决策1：前后端设计是否分开

### 议题

Implementation Designer 是否应该分开为 Frontend Designer 和 Backend Designer？

### 思考过程

**方案A：合并设计（一个 Implementation Designer）**
- 优点：确保前后端接口一致性，一个 Agent 负责整体设计
- 缺点：设计文档可能过于庞大

**方案B：分开设计（Frontend Designer + Backend Designer）**
- 优点：职责清晰，各自专注
- 缺点：可能导致前后端接口定义不一致

### 关键问题

前后端分开设计是否可能导致前后端接口没有统一？

如果分开，两个 Designer 可能对同一 API 有不同理解，导致接口不一致。

### 最终选择

**方案A：合并设计（一个 Implementation Designer）**

但设计文档仍然分开产出：
- API-SPEC.md（前后端共享）
- FRONTEND-DESIGN.md
- BACKEND-DESIGN.md

设计顺序：
```
Step 1: 定义接口详细规范 → API-SPEC.md（前后端共享）
Step 2: 定义后端详细设计 → BACKEND-DESIGN.md（基于 API-SPEC.md）
Step 3: 定义前端详细设计 → FRONTEND-DESIGN.md（基于 API-SPEC.md）
```

---

## 决策2：Integration Test 时机

### 议题

Integration Test（前后端联调测试）应该在哪个阶段运行？

### 思考过程

**初始想法**：Integration Test 在测试阶段运行（E2E Tester）

**问题**：如果 Integration Test 推迟到测试阶段，前端开发阶段遇到的技术问题无法及时发现和解决。

**重新思考**：
- Integration Test 代码应该在开发阶段编写（使用 Mock Server）
- Integration Test（真实后端）应该在开发阶段运行，用于解决技术问题

### 测试类型澄清

| 测试类型 | 说明 | 运行时机 |
|---------|------|---------|
| **单元测试** | 单个函数、工具类测试 | 开发阶段 |
| **组件测试** | React/Vue/Angular 组件测试 | 开发阶段 |
| **Mock API 测试** | 使用 Mock Server 的 API 调用测试 | 开发阶段 |
| **Integration Test（真实后端）** | 前端调用真实后端的测试 | 开发阶段（后端服务启动后） |
| **E2E 测试** | 用户视角的端到端测试 | 测试阶段 |

### 最终选择

Integration Test（真实后端）在开发阶段运行，不属于 E2E 测试。

---

## 决策3：前后端并行开发的协调机制

### 议题

前后端并行开发时，前端如何知道后端已完成并可进行 Integration Test？

### 思考过程

**方案A：信号文档机制**
- Backend TDD Developer 完成后输出信号文档
- Frontend TDD Developer 等待信号文档后进行 Integration Test

**方案B：PM Agent 推进**
- PM Agent 监控流程状态
- PM Agent 推进前端进入 Integration Test 阶段

### 最终选择

**方案B：PM Agent 推进 + 信号文档**

```
Backend TDD Developer
    → 完成开发 + Code Review 通过
    → service-start-phase.md（启动后端服务）
    → BACKEND_SERVICE_RUNNING.md（信号）

PM Agent 监控 BACKEND_SERVICE_RUNNING.md
    → 推进 Frontend TDD Developer 进入 integration-phase.md

Frontend TDD Developer
    → integration-phase.md（运行真实后端 Integration Test）
    → FRONTEND_INTEGRATION_PASS.md（信号）
```

---

## 决策4：CR 阶段前后端是否交叉 Review

### 议题

Code Review 阶段，Frontend Code Reviewer 是否需要 merge 后端分支来运行 Integration Test？

这是否意味着前后端交叉 review？

### 思考过程

**初始想法**：Frontend Code Reviewer merge 后端分支运行 Integration Test

**问题**：
- 这要求后端代码已经准备好（接口已实现）
- 后端评审已经通过（否则后端代码可能有问题）
- 这不是交叉 review，只是技术需求（需要后端运行才能测试前端）

**重新思考**：Integration Test 不应该在 CR 阶段运行，应该在双方都通过 CR 后运行。

**新方案**：
```
Frontend TDD → Frontend Code Reviewer → FRONTEND_CODE_APPROVE.md
Backend TDD → Backend Code Reviewer → BACKEND_CODE_APPROVE.md
                                    ↓
                            双方都 APPROVE 后
                                    ↓
                            Integration Test 运行
                                    ↓
                            通过 → ✅ 完成
                            失败 → 双方修复各自代码
```

### 最终选择

各自 Code Reviewer 只评审各自代码，不交叉 review。

Integration Test 在双方都通过 CR 后运行，作为验收关卡。

---

## 决策5：Integration-phase 发现问题后的归属

### 议题

Integration Test 失败时，问题应该由谁负责修改？前端还是后端？还是只记录问题？

### 思考过程

**场景分析**：

| 场景 | 问题描述 | 问题归属 |
|------|---------|---------|
| 场景1 | 前端请求参数与 API-SPEC.md 不一致 | 前端负责 |
| 场景2 | 前端响应处理与 API-SPEC.md 不一致 | 前端负责 |
| 场景3 | 后端响应格式与 API-SPEC.md 不一致 | 后端负责 |
| 场景4 | 后端业务逻辑错误（数据不正确） | 后端负责 |
| 场景5 | API-SPEC.md 定义本身有问题 | Implementation Designer 负责（人工介入） |

**问题归属判断流程**：
```
Integration Test 失败
    ↓
Frontend TDD Developer 分析错误
    ↓
对照 API-SPEC.md 判断问题归属
    ↓
- 请求参数错误 → 自己修改（前端）
- 响应处理错误 → 自己修改（前端）
- 响应格式错误 → 反馈给后端
- 业务逻辑错误 → 反馈给后端
- 接口定义问题 → 反馈给 Implementation Designer（人工介入）
```

### 最终选择

Integration Test 失败时，由 Frontend TDD Developer 分析问题归属，根据归属反馈给对应 Agent。

---

## 决策6：前后端 TDD Developer 合并为 Coding Agent

### 议题

是否将 Frontend TDD Developer 和 Backend TDD Developer 合并为一个 Coding Agent？

### 思考过程

**回顾之前的讨论**：
- 之前考虑分开是因为前后端的技术栈不一样
- 但对一个 AI Agent 来说，其实都是全栈技术
- 当时另外的隐形考虑是前后端分开对上下文窗口大小可能更好
- 但这个问题其实是任务拆分问题，把任务垂直拆分更小，就不用在横向（前后端）拆分上考虑上下文问题

**新思考**：
- 垂直拆分（功能模块为单位）比横向拆分（前后端）更合理
- AI Agent 本身是全栈能力，技术栈差异对 AI 不是问题
- Integration 问题归属更清晰（同一个 Agent 负责，不需要判断"是谁的问题"）

**方案A：前后端分开（原方案）**
- 职责清晰，各自专注
- 可以并行开发
- 但 Integration 问题归属复杂
- 需要信号文档协调

**方案B：合并为 Coding Agent**
- Integration 问题归属清晰（都是自己负责）
- 前后端协调内部化，不需要外部信号文档
- 垂直拆分更符合软件开发本质（功能模块为单位）
- 但需要重新设计任务拆分机制

### 最终选择

**方案B：合并为 Coding Agent**

Coding Agent 的内部流程：
```
Coding Agent 接收一个任务单元:
    ↓
Step 1: 实现测试代码（前端 + 后端）
    ↓
Step 2: 实现业务代码（前端组件 + 后端 API）
    ↓
Step 3: 运行前端测试（Mock Server）
    ↓
Step 4: 运行后端测试
    ↓
Step 5: 启动后端服务
    ↓
Step 6: 运行 Integration Test（真实后端）
    ↓
Step 7: 如果失败 → 修复 → 回到 Step 3
    ↓
全部通过 → 输出 TASK_UNIT_{name}_CODING_COMPLETE.md
    ↓
等待 Code Reviewer 评审
```

---

## 决策7：测试用例文档是否分开

### 议题

测试用例文档是否要根据测试类型分开？

### 思考过程

**方案A：合并为一个 TEST-CASES.md**
- 文档简洁，一个文档看到全貌
- Frontend TDD 需阅读后端部分（无关内容）
- Backend TDD 需阅读前端部分（无关内容）

**方案B：分开为两个文档**
- TEST-CASES-FRONTEND.md → Frontend TDD + Frontend CR
- TEST-CASES-BACKEND.md → Backend TDD + Backend CR
- 各自 Developer 只读自己相关的内容
- API 测试用例可能重复描述

**方案C：分开为三个文档（用户提出）**
- TEST-CASES-API.md → 前后端共享
- TEST-CASES-FRONTEND.md → Frontend TDD + Frontend CR
- TEST-CASES-BACKEND.md → Backend TDD + Backend CR

**关键问题**：API 测试用例如何处理？

前后端都要测试 API，但视角不同：
- 前端：验证调用是否正确（请求参数、响应处理）
- 后端：验证实现是否正确（请求处理、响应生成）

### 最终选择

**方案C：分开为三个文档**

| 测试用例文档 | 对应设计文档 | 接收者 |
|------------|------------|-------|
| TEST-CASES-API.md | API-SPEC.md | Coding Agent + Code Reviewer（共享） |
| TEST-CASES-FRONTEND.md | FRONTEND-DESIGN.md | Coding Agent + Code Reviewer |
| TEST-CASES-BACKEND.md | BACKEND-DESIGN.md | Coding Agent + Code Reviewer |

---

## 决策8：Code Reviewer 是否成对出现

### 议题

Code Reviewer 是否应该和 Coding Agent 成对出现？是否需要等待所有任务单元完成后才进入 CR？

### 思考过程

**方案A：所有任务单元完成后统一 CR**
- 等待所有 Coding Agent 完成
- 一个 Code Reviewer 评审所有代码

**方案B：每个任务单元一个 CR（成对出现）**
- Coding Agent 输出 TASK_UNIT_{name}_CODING_COMPLETE.md 后直接进入 CR
- Code Reviewer 和 Coding Agent 成对出现
- 不需要等待其他任务单元

### 最终选择

**方案B：每个任务单元一个 CR（成对出现）**

```
任务单元 N:
    Coding Agent → TASK_UNIT_{name}_CODING_COMPLETE.md
            → Code Reviewer → TASK_UNIT_{name}_CODE_REVIEW.md
            → Coding Agent（回应）→ TASK_UNIT_{name}_CODE_REVIEW_FEEDBACK.md
            → Code Reviewer → TASK_UNIT_{name}_CODING_APPROVE.md
```

---

## 决策9：TASK-UNITS.md 产出者

### 议题

TASK-UNITS.md（任务单元列表）应该由谁产出？

### 思考过程

**方案A：Implementation Designer 产出**
- 设计阶段定义任务单元

**方案B：Architect 产出**
- 架构设计阶段定义任务单元
- 到 Implementation Designer 时已经是任务级的

**方案C：PM Agent 产出**
- PM Agent 根据架构和产品文档拆分任务单元

### 用户观点

TASK-UNITS.md 不应该是 Implementation Designer 产出的，应该是 Architect 或 PM Agent 产出。到 Implementation Designer 时应该已经是任务级的了。

### 最终选择

**子模块 Implementation Designer 产出任务拆分**

根据进一步讨论，确定了层级化的任务拆分机制：
- Architect 产出模块级依赖关系（MODULE-DEPENDENCIES.md）
- 子模块 Implementation Designer 细化子任务级依赖关系和任务拆分
- PM Agent 根据依赖关系文档驱动流程

**状态**：已确认（框架层面），细节待讨论

---

## 决策13：子模块Agent对应关系

### 议题

是否应该引入子模块化的Agent体系？产品设计Agent和实现设计Agent是否应该一一对应？

### 思考过程

用户的思考：
1. 产品设计阶段就需要对模块进行拆分（子模块）
2. 系统架构针对整个产品做架构方案
3. 拆任务时是拆子模块的设计和开发任务
4. 设计agent应该和产品agent一一对应
5. 有多少产品设计子agent，就有多少子实现设计子agent
6. 由设计子agent来进行开发任务的拆分

这意味着：
```
Product Designer → 子模块1产品设计 + 子模块2产品设计 + ...
                        ↓                        ↓
                子模块1实现设计师            子模块2实现设计师
                        ↓                        ↓
                子模块1任务拆分              子模块2任务拆分
```

### 待讨论问题

1. 子模块的粒度在哪里确定？（Product Designer 还是 Architect 阶段？）
2. 子模块 Product Designer 和子模块 Implementation Designer 是否1:1？
3. 子模块之间如何协调接口一致性？
4. 子模块化是否只在大项目时启用？
5. 评审Agent是否也需要子模块化？

### 最终选择

**已确认**：采用 PD 自递归拆分机制，不引入 sub PD Agent

Product Designer 根据项目规模判断：
- 小项目：PD 直接完成整个产品设计
- 大项目：PD 做高层设计 + 模块划分 → PM 按依赖关系编排 → PD 自递归做各模块详细设计

关键设计：
1. **一个 PD Agent**，支持两种模式（完整设计 / 模块拆分设计）
2. **递归层级**：L0 高层设计 → L1 模块设计 → L2+ 子模块设计（自递归）
3. **模块依赖关系**：作为设计文档的一个章节，不单独维护
4. **每个层级独立 Review**：高层设计需 PR review，各模块设计也独立 review
5. **PM 编排**：PM 按模块依赖关系派遣 PD 做各模块设计

参见：product-designer/module-decomposition-phase.md

---

## 决策14：任务编排机制

### 议题

模块和子任务的依赖关系如何定义和驱动？

### 思考过程

用户提出的层级化依赖管理：

```
Architect → MODULE-DEPENDENCIES.md（模块级依赖关系）
    ↓
子模块1 Implementation Designer → 子任务1的依赖关系细化
子模块2 Implementation Designer → 子任务2的依赖关系细化
    ↓
PM Agent → 根据依赖关系文档驱动子模块设计和子任务实现
```

驱动机制：
- 通过子任务的信号文件（TASK_UNIT_{name}_CODING_APPROVE.md）来传递信息
- 人工和PM Agent协同
- PM Agent不负责merge git分支（由人工处理）

### 最终选择

**已确认（核心结论）**：
- Architect 产出模块级依赖关系
- 子模块 Implementation Designer 产出子任务级依赖关系
- PM Agent 根据依赖关系文档和信号文件驱动流程
- 人工和PM Agent协同处理

**细节待讨论**：
- PM Agent 如何处理git分支管理
- 是否需要独立系统来完成驱动

---

## 决策15：PM Agent 职责定义

### 议题

PM Agent 的身份和职责是什么？

### 最终选择

**已确认（初稿）**：

PM Agent 是"流程编排者"，不是"内容决策者"：

| 职责 | 说明 |
|-----|------|
| **流程推进** | 根据信号文档推进下一个Agent开始工作 |
| **任务编排** | 根据依赖关系文档调度任务执行顺序 |
| **矛盾处理** | 持久化矛盾到DOCUMENT_CONFLICTS.md，通知人工介入 |
| **状态监控** | 监控所有任务单元的完成状态 |

不负责：
- 不参与设计决策
- 不参与代码实现和评审
- 不修改任何设计文档或代码文件
- 不merge git分支

---

## 决策16：文档矛盾处理机制

### 议题

发现文档矛盾时如何处理？

### 最终选择

**已确认**：
- 矛盾信息持久化到 DOCUMENT_CONFLICTS.md
- 回到 PM Agent 处理
- PM Agent 通知人工介入
- 人工分析矛盾，做出决策
- 处理结果记录在 DOCUMENT_CONFLICTS.md

---

## 决策10：任务单元依赖关系和执行顺序

### 议题

任务单元是否有先后和依赖关系？如何编排执行顺序？

### 思考过程

任务单元之间确实有依赖关系：
- 某些任务单元依赖其他任务单元完成
- 例如：用户登录完成后才能进行订单管理

执行方式：
- 串行执行：有依赖关系的任务单元按顺序执行
- 并行执行：无依赖关系的任务单元可以并行执行

### 最终选择

**待讨论确认**（记录在 ISSUES.md）

可能性：
- PM Agent 负责任务编排（根据依赖关系调度 Coding Agent）
- TASK-UNITS.md 定义依赖关系

---

## 决策11：阶段输入设计原则

### 议题

每个阶段的输入是否只阅读上一个阶段的输出？

### 思考过程

**初始设计**：每个阶段只阅读上一个阶段的输出

**问题**：
- 这样可能导致阶段之间信息丢失
- 后面的阶段无法了解完整的上下文
- 可能导致代码实现与最初需求偏离

**新原则**：
每个阶段应该阅读之前所有流程中确定下来的产出物。

例如：
- Implementation Designer：不仅阅读 ARCHITECTURE.md，也需要阅读 PRODUCT-DESIGN.md、UI-DESIGN.md、BRD.md
- Coding Agent：不仅阅读设计文档，也需要阅读 ARCHITECTURE.md、PRODUCT-DESIGN.md、BRD.md
- Code Reviewer：阅读所有设计文档 + 产品文档 + 需求文档

**矛盾处理**：
当发现前后文档有矛盾时，应暂停并请求人工介入。

### 最终选择

**阶段输入设计原则**：
- 每个阶段阅读之前所有流程中确定下来的产出物
- 发现文档矛盾时，暂停并请求人工介入

示例：

| 阶段 | 应阅读的文档 |
|-----|------------|
| Implementation Designer | ARCHITECTURE.md + PRODUCT-DESIGN.md + UI-DESIGN.md + BRD.md |
| Coding Agent | 所有设计文档 + ARCHITECTURE.md + PRODUCT-DESIGN.md + BRD.md |
| Code Reviewer | 所有设计文档 + ARCHITECTURE.md + PRODUCT-DESIGN.md |

---

## 决策12：文档命名规范

### 议题

任务单元相关的文档命名规范？

### 思考过程

**初始想法**：TASK_UNIT_COMPLETE.md、TASK_UNIT_APPROVE.md

**问题**：无法区分不同任务单元

### 最终选择

**文档命名规范**：
- Coding Agent 输出：TASK_UNIT_{task_name}_CODING_COMPLETE.md
- Code Reviewer 输出：TASK_UNIT_{task_name}_CODE_REVIEW.md
- Coding Agent 回应：TASK_UNIT_{task_name}_CODE_REVIEW_FEEDBACK.md
- Code Reviewer 批准：TASK_UNIT_{task_name}_CODING_APPROVE.md

---

## 决策记录表

| 决策编号 | 议题 | 最终选择 | 状态 |
|---------|-----|---------|------|
| 1 | 前后端设计分开 vs 合并 | 合并（一个 IMPD），但文档分开 | 已确认 |
| 2 | Integration Test 时机 | 开发阶段运行 | 已确认 |
| 3 | 前后端并行协调机制 | PM Agent + 信号文档（后被决策6取代） | 被取代 |
| 4 | CR 阶段交叉 review | 不交叉，各自评审各自代码（后被决策6取代） | 被取代 |
| 5 | Integration 问题归属 | Coding Agent 分析归属，反馈给对应方 | 已确认 |
| 6 | 前后端 TDD 合并为 Coding Agent | 合并为 Coding Agent | 已确认 |
| 7 | 测试用例文档分开 | 分开为三份：API + Frontend + Backend | 已确认 |
| 8 | Code Reviewer 成对出现 | 每个任务单元一个 CR，成对出现 | 已确认 |
| 9 | TASK-UNITS.md 产出者 | 子模块 Implementation Designer 产出任务拆分 | 已确认 |
| 10 | 任务单元依赖和执行顺序 | Architect 模块级 + 子IMPD 子任务级 + PM Agent 驱动 | 已确认 |
| 11 | 阶段输入设计原则 | 阅读所有已确定产出物，矛盾时人工介入 | 已确认 |
| 12 | 文档命名规范 | TASK_UNIT_{name}_CODING_COMPLETE/APPROVE.md | 已确认 |
| 13 | 子模块Agent对应关系 | PD 自递归拆分（不引入 sub Agent） | 已确认 |
| 14 | 任务编排机制 | 依赖关系文件 + 信号文件 + 人工协同 | 已确认 |
| 15 | PM Agent 职责定义 | 流程编排者（已重命名为 Project Manager） | 已确认 |
| 16 | 文档矛盾处理机制 | 持久化到DOCUMENT_CONFLICTS.md，人工介入 | 已确认 |
| 17 | E2E 测试范围 | 纯用户视角端到端测试，跨任务单元 | 已确认 |
| 18 | E2E Reviewer 机制 | 配套 E2E Reviewer，保持成对评审模式 | 已确认 |
| 19 | E2E 失败处理 | 独立 Bug Fix Agent 修复，不复用 Coding Agent | 已确认 |
| 20 | PD 递归拆分机制 | PD 评估项目规模，大项目做高层设计+模块划分，PM 编排各模块设计 | 已确认 |
| 21 | Project Manager phase 定义 | 4 个 phase：initiation, transition, conflict, completion | 已确认 |
| 22 | Bug Fix Agent phase 设计 | 单 phase（bug-fix），回归验证循环合并其中，不单独建 phase | 已确认 |
| 23 | Project Reviewer Agent | 项目完成后全面复盘，输出流程优化建议 | 已确认 |

---

## 讨论记录

| 日期 | 讨论内容 | 结论 |
|-----|---------|------|
| - | 前后端分开设计是否可能导致接口不一致 | 方案A（合并设计，文档分开） |
| - | Integration Test 应该在哪个阶段运行 | 开发阶段 |
| - | 前后端并行开发时前端如何知道后端已完成 | PM Agent + 信号文档 |
| - | CR 阶段前后端是否交叉 review | 不交叉 |
| - | Integration Test 发现问题后的归属 | 分析归属，反馈给对应方 |
| - | 是否合并前后端 TDD 为 Coding Agent | 方案B（合并） |
| - | 测试用例文档是否分开 | 方案C（分开为三份） |
| - | Code Reviewer 是否成对出现 | 方案B（成对出现） |
| - | TASK-UNITS.md 产出者 | 待讨论 |
| - | 任务单元依赖关系 | 待讨论 |
| - | 阶段输入设计原则 | 阅读所有产出物，矛盾时人工介入 |