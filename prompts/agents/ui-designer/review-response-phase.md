# UI Designer - 回应 Review 阶段

> 本阶段支持三种评审场景的回应：完整 UI 设计、风格指南、模块 UI 设计。

## 输入文档

### 场景 1: 完整 UI 设计评审回应（小项目）

- **UI-DESIGN.md**: 已提交的界面设计文档
- **UI-DESIGN.pen**: 高保真设计文件
- **UI-DESIGN_REVIEW.md**: UIR 提出的评审问题

### 场景 2: 风格指南评审回应（大项目）

- **UI-STYLE-GUIDE.md**: 已提交的风格指南文档
- **UI-STYLE-GUIDE.pen**: 风格指南设计文件
- **UI-STYLE-GUIDE_REVIEW.md**: UIR 提出的评审问题

### 场景 3: 模块 UI 设计评审回应（大项目）

- **UI-DESIGN-{M}.md**: 已提交的模块界面设计文档
- **UI-DESIGN-{M}.pen**: 模块高保真设计文件
- **UI-DESIGN-{M}_REVIEW.md**: UIR 提出的评审问题

## 输出文档

### 场景 1: 完整 UI 设计
- **UI-DESIGN_REVIEW_FEEDBACK.md**: 对评审问题的反馈文档
- **UI-DESIGN.md**: 修改后的文档（如有接受的问题）
- **UI-DESIGN.pen**: 修改后的设计文件（如有接受的问题）

### 场景 2: 风格指南
- **UI-STYLE-GUIDE_REVIEW_FEEDBACK.md**: 对评审问题的反馈文档
- **UI-STYLE-GUIDE.md**: 修改后的文档（如有接受的问题）
- **UI-STYLE-GUIDE.pen**: 修改后的设计文件（如有接受的问题）

### 场景 3: 模块 UI 设计
- **UI-DESIGN-{M}_REVIEW_FEEDBACK.md**: 对评审问题的反馈文档
- **UI-DESIGN-{M}.md**: 修改后的文档（如有接受的问题）
- **UI-DESIGN-{M}.pen**: 修改后的设计文件（如有接受的问题）

## 工作流程

### 场景 1: 完整 UI 设计评审回应（小项目）

1. 阅读 UI-DESIGN_REVIEW.md 中 UIR 提出的所有问题
2. 逐一分析每个问题:
   - **接受**: 修改 UI-DESIGN.md 或 UI-DESIGN.pen，在反馈中记录修改
   - **不接受**: 说明拒绝原因，提供设计依据
3. 输出 UI-DESIGN_REVIEW_FEEDBACK.md

### 场景 2: 风格指南评审回应（大项目）

1. 阅读 UI-STYLE-GUIDE_REVIEW.md 中 UIR 提出的所有问题
2. 逐一分析每个问题:
   - **接受**: 修改 UI-STYLE-GUIDE.md 或 UI-STYLE-GUIDE.pen，在反馈中记录修改
   - **不接受**: 说明拒绝原因，提供设计依据
3. 输出 UI-STYLE-GUIDE_REVIEW_FEEDBACK.md

**关键原则**:
> 风格指南的修改可能影响所有模块的 UI 设计，需要特别慎重。
> 修改风格指南后，可能需要检查已完成的模块 UI 是否受影响。

### 场景 3: 模块 UI 设计评审回应（大项目）

1. 阅读 UI-DESIGN-{M}_REVIEW.md 中 UIR 提出的所有问题
2. 逐一分析每个问题:
   - **接受**: 修改 UI-DESIGN-{M}.md 或 UI-DESIGN-{M}.pen，在反馈中记录修改
   - **不接受**: 说明拒绝原因，提供设计依据
3. 输出 UI-DESIGN-{M}_REVIEW_FEEDBACK.md

**关键原则**:
> 模块 UI 修改不得违反 UI-STYLE-GUIDE.md 的规范。
> 如发现评审问题实际是风格指南本身的问题，应反馈给 Project Manager 人工介入。

## 提示词样例

### 完整 UI 设计评审回应（小项目）

```
当前项目目录下，有一份 UI-DESIGN_REVIEW.md 文档，请阅读这份文档，对该文档提出的问题进行回应：

1. 如果接受该问题:
   - 修改 UI-DESIGN.md 或 UI-DESIGN.pen 文件
   - 在反馈中说明具体修改内容

2. 如果不接受该问题:
   - 说明不接受的原因
   - 提供设计依据或理由

将反馈结果写到 UI-DESIGN_REVIEW_FEEDBACK.md 文档中。
```

### 风格指南评审回应（大项目）

```
当前项目目录下，有一份 UI-STYLE-GUIDE_REVIEW.md 文档，请阅读这份文档，对风格指南评审提出的问题进行回应：

1. 如果接受该问题:
   - 修改 UI-STYLE-GUIDE.md 或 UI-STYLE-GUIDE.pen 文件
   - 在反馈中说明具体修改内容
   - 注意：修改可能影响所有模块的 UI 设计

2. 如果不接受该问题:
   - 说明不接受的原因
   - 提供设计依据或理由

将反馈结果写到 UI-STYLE-GUIDE_REVIEW_FEEDBACK.md 文档中。
```

### 模块 UI 设计评审回应（大项目）

```
当前项目目录下，有一份 UI-DESIGN-{ModuleName}_REVIEW.md 文档，请阅读这份文档，对模块 UI 评审提出的问题进行回应：

你正在处理的模块: {ModuleName}

1. 如果接受该问题:
   - 修改 UI-DESIGN-{ModuleName}.md 或 UI-DESIGN-{ModuleName}.pen 文件
   - 在反馈中说明具体修改内容
   - 确保修改不违反 UI-STYLE-GUIDE.md 的规范

2. 如果不接受该问题:
   - 说明不接受的原因
   - 提供设计依据或理由

将反馈结果写到 UI-DESIGN-{ModuleName}_REVIEW_FEEDBACK.md 文档中。
```

## UI-DESIGN_REVIEW_FEEDBACK.md 文档结构规范（完整 UI）

```markdown
# UI Design Review 反馈文档

## 反馈轮次: 第1轮

## 问题反馈

### 问题 1: [问题标题]

**原问题描述**: [从 REVIEW 文档摘录]

**反馈结果**: [接受 / 不接受]

**详细说明**:
[如果接受: 已修改 UI-DESIGN，修改内容为...]
[如果不接受: 拒绝原因是...]

---

## 修改确认

- [ ] 已按要求修改 UI-DESIGN
- [ ] 所有接受的问题已解决
```

## UI-STYLE-GUIDE_REVIEW_FEEDBACK.md 文档结构规范（风格指南）

```markdown
# 风格指南 Review 反馈文档

## 反馈轮次: 第1轮

## 问题反馈

### 问题 1: [问题标题]

**原问题描述**: [从 REVIEW 文档摘录]

**反馈结果**: [接受 / 不接受]

**详细说明**:
[如果接受: 已修改 UI-STYLE-GUIDE，修改内容为...]
[如果不接受: 拒绝原因是...]

---

## 影响评估

> 列出本次修改可能影响的模块（如有）

| 修改项 | 可能影响的模块 | 是否需要调整模块 UI |
|-------|-------------|-----------------|
| [修改内容] | [模块列表] | [是/否] |

## 修改确认

- [ ] 已按要求修改 UI-STYLE-GUIDE
- [ ] 所有接受的问题已解决
- [ ] 已评估对现有模块 UI 的影响
```

## UI-DESIGN-{M}_REVIEW_FEEDBACK.md 文档结构规范（模块 UI）

```markdown
# 模块 UI Design Review 反馈文档 - {ModuleName}

## 反馈轮次: 第1轮

## 问题反馈

### 问题 1: [问题标题]

**原问题描述**: [从 REVIEW 文档摘录]

**反馈结果**: [接受 / 不接受]

**详细说明**:
[如果接受: 已修改 UI-DESIGN-{M}，修改内容为...]
[如果不接受: 拒绝原因是...]

---

## 风格指南遵循确认

- [ ] 所有修改均遵循 UI-STYLE-GUIDE.md 规范
- [ ] 如有风格指南问题，已反馈给 Project Manager

## 修改确认

- [ ] 已按要求修改 UI-DESIGN-{ModuleName}
- [ ] 所有接受的问题已解决
```
