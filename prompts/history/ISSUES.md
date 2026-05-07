# 待讨论问题记录

## 问题1：任务拆分方式

**已确认结论**：按功能模块进行拆分。

**最新进展（已解决）**：
通过 PD 递归拆分机制解决（决策 20）：
- Product Designer 根据项目规模判断是否拆分
- 大项目时 PD 做高层设计 + 模块划分 + 依赖关系
- PM 按依赖关系编排 PD 做各模块详细设计
- 不引入 sub PD Agent，PD 自递归拆分
- 模块依赖关系作为设计文档的章节，不单独维护

**状态**：✅ 已解决

---

## 问题2：任务拆分定义位置

**已确认结论**：
- 任务单元由子模块 Implementation Designer 产出（而非 Architect 或 PM Agent）
- Architect 产出模块级依赖关系（MODULE-DEPENDENCIES.md）
- 子模块 Implementation Designer 细化子任务级依赖关系

**状态**：已确认（框架层面），细节待讨论

---

## 问题3：任务编排机制

**已确认结论**：
- 模块之间的依赖关系由 Architect 定义（MODULE-DEPENDENCIES.md）
- 子实现任务之间的依赖关系由子模块 Implementation Designer 定义
- Project Manager 根据依赖关系文档驱动子模块设计和子任务实现
- 通过子任务的信号文件（TASK_UNIT_{name}_CODING_APPROVE.md）来传递信息
- 人工和 Project Manager 协同

**待讨论细节**：
- Project Manager 如何处理各子任务的 git 分支？
- 是否需要一个独立的系统来完成驱动？
- 人工和 Project Manager 的协同具体机制？

**状态**：已确认（核心结论），细节待讨论

---

## 问题4：Project Manager 定义

**已确认结论**：
- 重命名为 Project Manager（不再叫 PM Agent）
- 职责包括：流程推进、模块编排、矛盾处理、状态监控
- 4 个 phase：project-initiation, stage-transition, conflict-resolution, project-completion

**状态**：✅ 已完成

---

## 问题5：阶段输入设计原则

**已确认结论**：
- 每个阶段阅读之前所有流程中确定下来的产出物
- 发现文档矛盾时，回到 Project Manager 处理或通知人进行协同
- 矛盾信息持久化到一个 md 文档（DOCUMENT_CONFLICTS.md）

**状态**：已确认

---

## 问题6：子模块Agent对应关系

**已确认结论（已解决）**：
不引入 sub Agent 体系，而是通过 PD 自递归拆分机制解决：
- Product Designer 自身根据项目规模决定是否拆分
- 大项目时做高层设计 + 模块划分，交给 PM 编排
- PM 按 PRODUCT-DESIGN-HIGH-LEVEL.md 中的依赖关系，派遣 PD 做各模块详细设计
- PD 在设计每个模块时，如果模块仍太大，可递归拆分
- Reviewer（PR）支持三种场景：完整设计、高层设计、模块设计

**状态**：✅ 已解决

---

## 问题7：Project Reviewer Agent（新增）

**已确认结论**：
- 项目完成后触发的全面复盘 Agent
- 关注：流程效率、产出物质量、Agent/Phase 优化建议、关键决策回顾
- 输出 AGENT-OPTIMIZATION.md（Agent 定义和 phase 优化建议）+ PROJECT-REVIEW.md（完整复盘报告）
- 只输出建议，不修改任何文件，由人类评估是否采纳

**状态**：✅ 已完成

---

## 新增问题

如有新问题，请在此添加。
