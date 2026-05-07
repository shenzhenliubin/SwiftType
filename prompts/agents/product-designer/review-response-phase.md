# Product Designer - 回应 Review 阶段

> 本阶段回应 Product Reviewer 对设计方案的评审意见，支持三种评审场景。

## 输入文档

| 评审场景 | 输入文档 |
|---------|---------|
| 完整设计评审 | PRODUCT-DESIGN.md + PRODUCT-DESIGN_REVIEW.md |
| 高层设计评审 | PRODUCT-DESIGN-HIGH-LEVEL.md + PRODUCT-DESIGN-HIGH-LEVEL_REVIEW.md |
| 模块设计评审 | PRODUCT-DESIGN-{M}.md + PRODUCT-DESIGN-{M}_REVIEW.md |

## 输出文档

| 评审场景 | 输出文档 |
|---------|---------|
| 完整设计评审 | PRODUCT-DESIGN_REVIEW_FEEDBACK.md + 修改后的 PRODUCT-DESIGN.md |
| 高层设计评审 | PRODUCT-DESIGN-HIGH-LEVEL_REVIEW_FEEDBACK.md + 修改后的 PRODUCT-DESIGN-HIGH-LEVEL.md |
| 模块设计评审 | PRODUCT-DESIGN-{M}_REVIEW_FEEDBACK.md + 修改后的 PRODUCT-DESIGN-{M}.md |

## 工作流程

### Step 1: 确认评审场景

根据存在的 REVIEW 文档确认评审场景：

```
PRODUCT-DESIGN_REVIEW.md → 完整设计评审
PRODUCT-DESIGN-HIGH-LEVEL_REVIEW.md → 高层设计评审
PRODUCT-DESIGN-{M}_REVIEW.md → 模块设计评审
```

### Step 2: 阅读评审文档

阅读对应的 REVIEW 文档，理解每个评审问题的维度和具体建议。

### Step 3: 逐一回应评审问题

对每个评审问题判断：

```
1. 接受修改:
   - 按评审要求修改设计文档
   - 在反馈文档中记录修改内容

2. 拒绝修改:
   - 说明拒绝理由（如：与 BRD 需求不一致、用户体验考量等）
   - 提供设计依据

3. 需要澄清:
   - 如果评审问题与 BRD 有矛盾
   - 如果评审要求超出产品设计范围（如要求技术方案）
   - 输出 DOCUMENT_CONFLICT.md，请求人工介入
```

### Step 4: 修改设计文档

如果接受了评审问题，修改对应的设计文档。

**注意事项（按场景）**:

| 场景 | 注意事项 |
|------|---------|
| 完整设计 | 修改后确保整体设计一致性 |
| 高层设计 | 修改模块划分可能影响后续所有模块设计，需在反馈中说明影响 |
| 模块设计 | 修改时确保不破坏与其他模块的依赖关系，如有影响需在反馈中说明 |

### Step 5: 输出反馈文档

根据场景输出对应的 REVIEW_FEEDBACK.md。

## 提示词样例

### 完整设计评审回应

```
当前项目目录下，有一份 PRODUCT-DESIGN_REVIEW.md 文档，请阅读这份文档，对提出的问题进行回应：

1. 如果接受该问题:
   - 修改 PRODUCT-DESIGN.md 文档
   - 在反馈中说明具体修改内容

2. 如果不接受该问题:
   - 说明不接受的原因
   - 提供合理的设计依据或理由

将反馈结果写到 PRODUCT-DESIGN_REVIEW_FEEDBACK.md。
```

### 高层设计评审回应

```
当前项目目录下，有一份 PRODUCT-DESIGN-HIGH-LEVEL_REVIEW.md 文档，请阅读并对高层设计和模块划分的评审问题进行回应：

1. 如果接受该问题:
   - 修改 PRODUCT-DESIGN-HIGH-LEVEL.md
   - 在反馈中说明修改内容
   - **注意**: 修改模块划分可能影响后续所有模块设计，需说明影响范围

2. 如果不接受该问题:
   - 说明不接受的原因

将反馈结果写到 PRODUCT-DESIGN-HIGH-LEVEL_REVIEW_FEEDBACK.md。
```

### 模块设计评审回应

```
当前项目目录下，有一份 PRODUCT-DESIGN-{M}_REVIEW.md 文档，请阅读并对该模块设计的评审问题进行回应：

1. 如果接受该问题:
   - 修改 PRODUCT-DESIGN-{M}.md
   - 在反馈中说明修改内容
   - **注意**: 修改时确保不破坏与其他模块的依赖关系

2. 如果不接受该问题:
   - 说明不接受的原因

将反馈结果写到 PRODUCT-DESIGN-{M}_REVIEW_FEEDBACK.md。
```

## 反馈文档结构规范

### PRODUCT-DESIGN_REVIEW_FEEDBACK.md（完整设计）

```markdown
# Product Design Review 反馈文档

## 反馈轮次: 第1轮
## 评审场景: 完整设计评审

## 问题反馈

### 问题 1: [问题标题]

**原问题描述**: [从 REVIEW 文档摘录]
**评审维度**: [需求覆盖 / 功能完整性 / 用户流程 / 界面设计 / 交互设计 / 数据结构]

**反馈结果**: [接受 / 不接受 / 需要澄清]

**详细说明**:
[如果接受: 已修改 PRODUCT-DESIGN.md 第X章节，修改内容为...]
[如果不接受: 拒绝原因是...]
[如果需要澄清: 矛盾点是...]

---

### 问题 2: [问题标题]
...

---

## 修改确认

- [ ] 已按要求修改 PRODUCT-DESIGN.md
- [ ] 所有接受的问题已解决
```

### PRODUCT-DESIGN-HIGH-LEVEL_REVIEW_FEEDBACK.md（高层设计）

```markdown
# 高层产品设计 Review 反馈文档

## 反馈轮次: 第1轮
## 评审场景: 高层设计评审

## 问题反馈

### 问题 1: [问题标题]

**原问题描述**: [从 REVIEW 文档摘录]
**评审维度**: [模块划分合理性 / 依赖关系正确性 / 核心旅程完整性 / ...]

**反馈结果**: [接受 / 不接受 / 需要澄清]

**详细说明**:
[修改内容或拒绝理由]

**影响范围**: [说明此修改对后续模块设计的影响，如适用]

---

## 修改确认

- [ ] 已按要求修改 PRODUCT-DESIGN-HIGH-LEVEL.md
- [ ] 所有接受的问题已解决
- [ ] 已评估修改对模块设计的影响
```

### PRODUCT-DESIGN-{M}_REVIEW_FEEDBACK.md（模块设计）

```markdown
# 模块产品设计 Review 反馈文档 - {ModuleName}

## 反馈轮次: 第1轮
## 评审场景: 模块设计评审
## 评审模块: {ModuleName}

## 问题反馈

### 问题 1: [问题标题]

**原问题描述**: [从 REVIEW 文档摘录]
**评审维度**: [模块职责一致性 / 依赖关系实现 / 数据接口清晰性 / ...]

**反馈结果**: [接受 / 不接受 / 需要澄清]

**详细说明**:
[修改内容或拒绝理由]

**依赖影响**: [说明此修改对上下游模块依赖的影响，如适用]

---

## 修改确认

- [ ] 已按要求修改 PRODUCT-DESIGN-{M}.md
- [ ] 所有接受的问题已解决
- [ ] 模块依赖关系未受影响（或已更新）
```
