# Product Reviewer - 反馈处理阶段

> 本阶段处理 Product Designer 对评审问题的反馈，支持三种评审场景。

## 输入文档

| 评审场景 | 输入文档 |
|---------|---------|
| 完整设计 | PRODUCT-DESIGN_REVIEW_FEEDBACK.md + 修改后的 PRODUCT-DESIGN.md |
| 高层设计 | PRODUCT-DESIGN-HIGH-LEVEL_REVIEW_FEEDBACK.md + 修改后的 PRODUCT-DESIGN-HIGH-LEVEL.md |
| 模块设计 | PRODUCT-DESIGN-{M}_REVIEW_FEEDBACK.md + 修改后的 PRODUCT-DESIGN-{M}.md |

## 输出文档

| 评审场景 | 通过时输出 | 未通过时输出 |
|---------|----------|------------|
| 完整设计 | PRODUCT-DESIGN_APPROVE.md | PRODUCT-DESIGN_REVIEW_FEEDBACK-RESPONSE-{n}.md |
| 高层设计 | PRODUCT-DESIGN-HIGH-LEVEL_APPROVE.md | PRODUCT-DESIGN-HIGH-LEVEL_REVIEW_FEEDBACK-RESPONSE-{n}.md |
| 模块设计 | PRODUCT-DESIGN-{M}_APPROVE.md | PRODUCT-DESIGN-{M}_REVIEW_FEEDBACK-RESPONSE-{n}.md |

**度量数据**（评审通过时写入）:
- PROJECT-STATUS-PR.md: PR 评审度量数据

## 工作流程

### Step 1: 确认评审场景

与 review-phase 保持一致，确认当前是哪种评审场景。

### Step 2: 阅读反馈

1. 阅读对应的 REVIEW_FEEDBACK.md
2. 逐一审阅每个评审问题的反馈

### Step 3: 评估反馈

对每个问题判断：

```
1. 接受修改:
   - Designer 已按要求修改文档
   - 确认修改解决了评审问题
   - 记录确认

2. 接受拒绝:
   - Designer 的拒绝理由合理
   - 撤回该问题

3. 继续追问:
   - 不接受拒绝理由
   - 继续提出理由
```

### Step 4: 输出处理结果

```
全部达成一致 → 输出对应的 APPROVE.md
仍有问题 → 输出对应的 REVIEW_FEEDBACK-RESPONSE-{n}.md
```

## 提示词样例

```
你需要阅读 Designer Agent 对你评审问题的回复。

请逐一审阅每个问题的反馈:

1. 如果 Designer Agent 已接受问题:
   - 确认是否已修改对应文档
   - 验证修改是否符合评审要求

2. 如果 Designer Agent 不接受问题:
   - 审阅其拒绝原因
   - 如果拒绝原因合理，撤回该问题
   - 如果不接受其拒绝原因，继续提出你的理由

处理结果:
- 如果所有问题已达成一致 → 输出对应的 APPROVE.md
- 如果仍有未解决问题 → 输出对应的 REVIEW_FEEDBACK-RESPONSE-{n}.md

只有当所有问题都达成一致，才输出 APPROVE.md。

通过后，请更新 PROJECT-STATUS-PR.md，记录本轮评审的度量数据（评审场景、评审对象、日期、轮次、问题数、接受/拒绝数）。
```

## APPROVE.md 文档结构规范

### PRODUCT-DESIGN_APPROVE.md（完整设计）

```markdown
# Product Design 批准文档

## 文档信息

- **被批准文档**: PRODUCT-DESIGN.md
- **批准日期**: [日期]
- **批准状态**: ✅ 已通过

## 评审过程摘要

| 轮次 | 评审文档 | 反馈文档 | 问题数 | 解决数 |
|-----|---------|---------|-------|-------|
| 第1轮 | PRODUCT-DESIGN_REVIEW.md | PRODUCT-DESIGN_REVIEW_FEEDBACK.md | [N] | [N] |

### 主要讨论事项

1. [事项简述及结论]

## 最终确认

- [x] 所有评审问题已解决
- [x] PRODUCT-DESIGN.md 已按要求完成修改
- [x] 文档内容符合质量标准

## 下一阶段

UI Designer Agent 开始高保真界面设计。
```

### PRODUCT-DESIGN-HIGH-LEVEL_APPROVE.md（高层设计）

```markdown
# 高层产品设计批准文档

## 文档信息

- **被批准文档**: PRODUCT-DESIGN-HIGH-LEVEL.md
- **批准日期**: [日期]
- **批准状态**: ✅ 已通过

## 评审过程摘要

| 轮次 | 评审文档 | 反馈文档 | 问题数 | 解决数 |
|-----|---------|---------|-------|-------|
| 第1轮 | PRODUCT-DESIGN-HIGH-LEVEL_REVIEW.md | ... | [N] | [N] |

### 主要讨论事项

1. [事项简述及结论]

## 最终确认

- [x] 所有评审问题已解决
- [x] 模块划分合理，边界清晰
- [x] 依赖关系正确，无循环依赖
- [x] 可独立验证

## 下一阶段

Project Manager 按模块依赖关系编排，派遣 Product Designer 进行各模块详细设计。
```

### PRODUCT-DESIGN-{M}_APPROVE.md（模块设计）

```markdown
# 模块产品设计批准文档 - {ModuleName}

## 文档信息

- **被批准文档**: PRODUCT-DESIGN-{ModuleName}.md
- **批准日期**: [日期]
- **批准状态**: ✅ 已通过

## 评审过程摘要

| 轮次 | 评审文档 | 反馈文档 | 问题数 | 解决数 |
|-----|---------|---------|-------|-------|
| 第1轮 | PRODUCT-DESIGN-{M}_REVIEW.md | ... | [N] | [N] |

## 最终确认

- [x] 所有评审问题已解决
- [x] 模块设计与高层设计一致
- [x] 模块依赖关系已正确体现
- [x] 功能描述完整

## 下一阶段

等待 Project Manager 检查所有模块是否通过评审。
如所有模块通过 → 推进后续流程（UI Designer 等）。
```
