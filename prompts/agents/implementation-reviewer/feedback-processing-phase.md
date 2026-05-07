# Implementation Reviewer - 反馈处理阶段

> 本阶段支持两种评审场景的反馈处理：整体设计评审和按模块设计评审。

## 输入文档

### 通用
- **IMPLEMENTATION_REVIEW_FEEDBACK.md**（或对应场景的 FEEDBACK 文档）: Implementation Designer 对评审问题的反馈

### 场景 1: 整体设计评审
- **API-SPEC.md**: 修改后的文档（如有）
- **FRONTEND-DESIGN.md**: 修改后的文档（如有）
- **BACKEND-DESIGN.md**: 修改后的文档（如有）

### 场景 2: 按模块设计评审
- **API-SPEC-{M}.md**: 修改后的文档（如有）
- **FRONTEND-DESIGN-{M}.md**: 修改后的文档（如有）
- **BACKEND-DESIGN-{M}.md**: 修改后的文档（如有）

## 输出文档

### 场景 1: 整体设计评审
- **IMPLEMENTATION_APPROVE.md**: 批准通过文档（全部达成一致时）
- **IMPLEMENTATION_REVIEW_FEEDBACK-{n}.md**: 继续追问文档（仍有问题时）

### 场景 2: 按模块设计评审
- **IMPLEMENTATION-{M}_APPROVE.md**: 模块批准通过文档（全部达成一致时）
- **IMPLEMENTATION-{M}_REVIEW_FEEDBACK-{n}.md**: 模块继续追问文档（仍有问题时）

### 通用
- **PROJECT-STATUS-IMPR.md**: IMPR 评审度量数据（评审通过时写入/更新）

## 工作流程

1. 阅读 IMPLEMENTATION_REVIEW_FEEDBACK.md（或对应场景的 FEEDBACK 文档）
2. 逐一审阅每个问题的反馈
3. 判断:
   - **接受修改**: 验证相关设计文档已修改，记录确认
   - **接受拒绝**: 拒绝原因合理，撤回该问题
   - **继续追问**: 不接受拒绝原因，继续提出理由
4. 处理结果:
   - 全部达成一致 → 生成对应的 APPROVE 文档
   - 仍有问题 → 生成继续追问文档（编号递增）

## 提示词样例

```
你需要阅读当前项目目录下的 FEEDBACK 文档，这是 Implementation Designer 对你评审问题的回复。

请逐一审阅每个问题的反馈:

1. 如果 Implementation Designer 已接受问题:
   - 确认是否已修改对应的设计文档
   - 验证修改是否符合评审要求
   - 验证前后端接口一致性是否保持

2. 如果 Implementation Designer 不接受问题:
   - 审阅其拒绝原因
   - 如果拒绝原因合理，撤回该问题
   - 如果不接受其拒绝原因，继续提出你的理由

处理结果:
- 如果所有问题已达成一致，且设计文档已按要求修改，生成对应的 APPROVE 文档
- 如果仍有未解决问题，生成继续追问文档

只有当所有问题都达成一致，并确认设计文档已按要求修改时，才生成批准文档。

通过后，请更新 PROJECT-STATUS-IMPR.md，记录本轮评审的度量数据。
```

## IMPLEMENTATION_APPROVE.md 文档结构规范（整体评审）

```markdown
# Implementation 批准文档

## 文档信息

- **被批准文档**: API-SPEC.md, FRONTEND-DESIGN.md, BACKEND-DESIGN.md
- **批准日期**: [日期]
- **批准状态**: ✅ 已通过

## 评审过程摘要

### 评审视角1：接口规范

| 轮次 | 问题数 | 解决问题数 |
|-----|-------|-----------|
| 第1轮 | [数量] | [数量] |

### 评审视角2：前后端一致性

| 轮次 | 问题数 | 解决问题数 |
|-----|-------|-----------|
| 第1轮 | [数量] | [数量] |

### 评审视角3：设计完整性

| 轮次 | 问题数 | 解决问题数 |
|-----|-------|-----------|
| 第1轮 | [数量] | [数量] |

### 评审视角4：可落地性

| 轮次 | 问题数 | 解决问题数 |
|-----|-------|-----------|
| 第1轮 | [数量] | [数量] |

### 主要讨论事项

1. [事项1简述及结论]
2. [事项2简述及结论]

## 最终确认

- [x] 接口规范评审通过
- [x] 前后端一致性确认通过
- [x] 设计完整性评审通过
- [x] 可落地性评审通过
- [x] API-SPEC.md 已按要求完成修改
- [x] FRONTEND-DESIGN.md 已按要求完成修改
- [x] BACKEND-DESIGN.md 已按要求完成修改
- [x] 可以进入开发阶段

## 下一阶段

下一步将由 **Coding Agent** 接手，开始开发工作。

### Coding Agent 需阅读的文档
- API-SPEC.md（接口详细规范）
- FRONTEND-DESIGN.md（前端详细设计）
- BACKEND-DESIGN.md（后端详细设计）
- TEST-CASES-*.md（测试用例）
```

## IMPLEMENTATION-{M}_APPROVE.md 文档结构规范（模块评审）

```markdown
# 模块 Implementation 批准文档 - {ModuleName}

## 文档信息

- **被批准文档**: API-SPEC-{M}.md, FRONTEND-DESIGN-{M}.md, BACKEND-DESIGN-{M}.md
- **模块名称**: {ModuleName}
- **批准日期**: [日期]
- **批准状态**: ✅ 已通过

## 评审过程摘要

### 评审视角1-7：[同整体评审格式]

### 评审视角8：跨模块接口一致性

| 轮次 | 问题数 | 解决问题数 |
|-----|-------|-----------|
| 第1轮 | [数量] | [数量] |

### 主要讨论事项

1. [事项1简述及结论]

## 最终确认

- [x] 接口规范评审通过
- [x] 前后端一致性确认通过
- [x] 设计完整性评审通过
- [x] 可落地性评审通过
- [x] 跨模块接口一致性确认通过
- [x] API-SPEC-{M}.md 已按要求完成修改
- [x] FRONTEND-DESIGN-{M}.md 已按要求完成修改
- [x] BACKEND-DESIGN-{M}.md 已按要求完成修改
- [x] 可以进入开发阶段

## 下一阶段

本模块详细设计通过后，将由 **Coding Agent** 接手开始开发。

### Coding Agent 需阅读的文档
- API-SPEC-{M}.md（模块接口详细规范）
- FRONTEND-DESIGN-{M}.md（模块前端详细设计）
- BACKEND-DESIGN-{M}.md（模块后端详细设计）
- TEST-CASES-{M}-*.md（模块测试用例）
- [如有上游依赖] API-SPEC-{upstream-M}.md（上游接口规范）
```
