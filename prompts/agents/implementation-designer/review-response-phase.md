# Implementation Designer - 回应 Review 阶段

> 本阶段支持两种评审场景的回应：整体设计评审（小项目）和按模块设计评审（大项目）。

## 输入文档

### 场景 1: 整体设计评审回应（小项目）

- **API-SPEC.md**: 已提交的接口规范文档
- **FRONTEND-DESIGN.md**: 已提交的前端设计文档
- **BACKEND-DESIGN.md**: 已提交的后端设计文档
- **IMPLEMENTATION_REVIEW.md**: IMPR 提出的评审问题

### 场景 2: 按模块设计评审回应（大项目）

- **API-SPEC-{M}.md**: 已提交的模块接口规范文档
- **FRONTEND-DESIGN-{M}.md**: 已提交的模块前端设计文档
- **BACKEND-DESIGN-{M}.md**: 已提交的模块后端设计文档
- **IMPLEMENTATION-{M}_REVIEW.md**: IMPR 提出的评审问题

## 输出文档

### 场景 1: 整体设计评审
- **IMPLEMENTATION_REVIEW_FEEDBACK.md**: 对评审问题的反馈文档
- 修改后的设计文档（如有接受的问题）

### 场景 2: 按模块设计评审
- **IMPLEMENTATION-{M}_REVIEW_FEEDBACK.md**: 对评审问题的反馈文档
- 修改后的模块设计文档（如有接受的问题）

## 工作流程

### 场景 1: 整体设计评审回应（小项目）

1. 阅读 IMPLEMENTATION_REVIEW.md 中 IMPR 提出的所有问题
2. 逐一分析每个问题:
   - **接受**: 修改对应设计文档，在反馈中记录修改
   - **不接受**: 说明拒绝原因，提供设计依据或合理解释
3. 输出 IMPLEMENTATION_REVIEW_FEEDBACK.md

### 场景 2: 按模块设计评审回应（大项目）

1. 阅读 IMPLEMENTATION-{M}_REVIEW.md 中 IMPR 提出的所有问题
2. 逐一分析每个问题:
   - **接受**: 修改对应模块设计文档，在反馈中记录修改
   - **不接受**: 说明拒绝原因，提供设计依据或合理解释
3. 输出 IMPLEMENTATION-{M}_REVIEW_FEEDBACK.md

**关键原则**:
> 模块设计修改不得破坏与上游模块的接口一致性。
> 如发现评审问题实际是上游 API-SPEC 定义问题，应反馈给 Project Manager 人工介入。
> 不允许在模块设计时修改上游模块的 API-SPEC。

## 提示词样例

### 整体设计评审回应（小项目）

```
当前项目目录下，有一份 IMPLEMENTATION_REVIEW.md 文档，请阅读这份文档，对该文档提出的问题进行回应：

1. 如果接受该问题:
   - 修改对应的设计文档（API-SPEC.md / FRONTEND-DESIGN.md / BACKEND-DESIGN.md）
   - 在反馈中说明具体修改内容

2. 如果不接受该问题:
   - 说明不接受的原因
   - 提供设计依据或理由

将反馈结果写到 IMPLEMENTATION_REVIEW_FEEDBACK.md 文档中。
```

### 按模块设计评审回应（大项目）

```
当前项目目录下，有一份 IMPLEMENTATION-{ModuleName}_REVIEW.md 文档，请阅读这份文档，对模块实现设计评审提出的问题进行回应：

你正在处理的模块: {ModuleName}

1. 如果接受该问题:
   - 修改对应的设计文档（API-SPEC-{ModuleName}.md / FRONTEND-DESIGN-{ModuleName}.md / BACKEND-DESIGN-{ModuleName}.md）
   - 在反馈中说明具体修改内容
   - 确保修改不破坏与上游模块的接口一致性

2. 如果不接受该问题:
   - 说明不接受的原因
   - 提供设计依据或理由

将反馈结果写到 IMPLEMENTATION-{ModuleName}_REVIEW_FEEDBACK.md 文档中。
```

## IMPLEMENTATION_REVIEW_FEEDBACK.md 文档结构规范（整体评审）

```markdown
# Implementation Review 反馈文档

## 反馈轮次: 第1轮

## 问题反馈

### 问题 1: [问题标题]

**原问题描述**: [从 REVIEW 文档摘录]

**涉及文档**: [API-SPEC.md / FRONTEND-DESIGN.md / BACKEND-DESIGN.md]

**反馈结果**: [接受 / 不接受]

**详细说明**:
[如果接受: 已修改 XXX.md，修改内容为...]
[如果不接受: 拒绝原因是...]

---

## 修改确认

- [ ] 已按要求修改相关设计文档
- [ ] 所有接受的问题已解决
- [ ] 前后端接口一致性已确认
```

## IMPLEMENTATION-{M}_REVIEW_FEEDBACK.md 文档结构规范（模块评审）

```markdown
# 模块 Implementation Review 反馈文档 - {ModuleName}

## 反馈轮次: 第1轮

## 问题反馈

### 问题 1: [问题标题]

**原问题描述**: [从 REVIEW 文档摘录]

**涉及文档**: [API-SPEC-{M}.md / FRONTEND-DESIGN-{M}.md / BACKEND-DESIGN-{M}.md]

**反馈结果**: [接受 / 不接受]

**详细说明**:
[如果接受: 已修改 XXX-{M}.md，修改内容为...]
[如果不接受: 拒绝原因是...]

---

## 跨模块接口一致性确认

- [ ] 修改未破坏与上游模块的接口一致性
- [ ] 如有上游接口问题，已反馈给 Project Manager

## 修改确认

- [ ] 已按要求修改相关模块设计文档
- [ ] 所有接受的问题已解决
- [ ] 前后端接口一致性已确认
```
