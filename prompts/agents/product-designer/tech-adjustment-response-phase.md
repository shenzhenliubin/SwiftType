# Product Designer - 回应技术可行性调整阶段

> 本阶段支持小项目和大项目两种模式。大项目时可能需要调整模块级产品设计文档。

## 输入文档

### 小项目

- **PRODUCT-DESIGN.md**: 已提交的产品设计文档
- **PRODUCT-DESIGN_ADJUSTMENT.md**: TFA 提出的调整建议

### 大项目

- **PRODUCT-DESIGN-HIGH-LEVEL.md**: 高层产品设计文档
- **PRODUCT-DESIGN-{M}.md**: 受影响的模块产品设计文档
- **PRODUCT-DESIGN_ADJUSTMENT.md**: TFA 提出的调整建议

## 输出文档

- **PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md**: 对调整建议的反馈文档
- **PRODUCT-DESIGN.md** 或 **PRODUCT-DESIGN-{M}.md**: 修改后的文档（如有接受的调整）

## 工作流程

### 小项目

1. 阅读 PRODUCT-DESIGN_ADJUSTMENT.md
2. 逐一审阅每个调整建议:
   - **接受**: 修改 PRODUCT-DESIGN.md，记录修改
   - **不接受**: 说明原因，或提供替代方案
3. 输出 PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md

### 大项目

1. 阅读 PRODUCT-DESIGN_ADJUSTMENT.md
2. 判断调整建议影响范围:
   - 影响高层设计 → 修改 PRODUCT-DESIGN-HIGH-LEVEL.md
   - 影响特定模块 → 修改对应的 PRODUCT-DESIGN-{M}.md
   - 影响多个模块 → 逐一修改受影响的模块文档
3. 逐一审阅每个调整建议:
   - **接受**: 修改对应文档，记录修改
   - **不接受**: 说明原因，或提供替代方案
4. 输出 PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md

**关键原则**:
> 大项目时，调整可能影响模块依赖关系，需要特别慎重。
> 如调整影响高层设计中的模块划分或依赖关系，应反馈给 Project Manager 人工介入。

## 提示词样例

### 小项目

```
请阅读当前项目目录下的 PRODUCT-DESIGN_ADJUSTMENT.md 文档，这是 Technical Feasibility Analyst 对你产品设计的技术可行性调整建议。

请逐一审阅每个调整建议:

1. 如果接受调整建议:
   - 修改当前目录下的 PRODUCT-DESIGN.md 文档
   - 在反馈中说明修改内容

2. 如果不接受调整建议:
   - 说明不接受的原因，或提供替代方案
   - 替代方案需考虑技术可行性约束

将反馈结果写到 PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md 文档中。

注意:
- 技术可行性调整建议是针对"能不能做"的问题，不是"产品设计合理性"的问题
- 如果 Analyst 指出某功能技术不可行或成本过高，你需要认真考虑调整
- 你可以提供替代方案，但需确保替代方案在技术上是可行的
```

### 大项目

```
请阅读当前项目目录下的 PRODUCT-DESIGN_ADJUSTMENT.md 文档，这是 Technical Feasibility Analyst 对产品设计的技术可行性调整建议。

当前项目为大项目模式。请先判断调整建议的影响范围:
- 是否影响高层设计（PRODUCT-DESIGN-HIGH-LEVEL.md）？
- 是否影响特定模块设计（PRODUCT-DESIGN-{M}.md）？
- 是否影响多个模块？

然后逐一审阅每个调整建议:

1. 如果接受调整建议:
   - 修改对应的文档（高层设计或受影响的模块设计）
   - 在反馈中说明修改内容和影响范围

2. 如果不接受调整建议:
   - 说明不接受的原因，或提供替代方案
   - 替代方案需考虑技术可行性约束

将反馈结果写到 PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md 文档中。

注意:
- 如调整影响模块划分或依赖关系，应反馈给 Project Manager 人工介入
```

## PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md 文档结构规范

### 小项目

```markdown
# 产品设计调整反馈文档

## 反馈轮次: 第1轮

## 调整建议反馈

### 调整建议 1: [功能名称]

**原调整建议**: [从 ADJUSTMENT 文档摘录]

**反馈结果**: [接受 / 不接受，提供替代方案]

**详细说明**:
[如果接受: 已修改 PRODUCT-DESIGN.md，修改内容为...]
[如果不接受: 拒绝原因或替代方案描述...]

---

## 修改确认

- [ ] 已按要求修改 PRODUCT-DESIGN.md（如有接受的建议）
- [ ] 所有调整建议已回应
```

### 大项目

```markdown
# 产品设计调整反馈文档

## 反馈轮次: 第1轮

## 影响范围评估

| 调整建议 | 影响范围 | 涉及文档 |
|---------|---------|---------|
| [建议1] | [高层/模块名] | [文档名] |

## 调整建议反馈

### 调整建议 1: [功能名称]

**原调整建议**: [从 ADJUSTMENT 文档摘录]

**影响范围**: [高层设计 / 模块 {M}]

**反馈结果**: [接受 / 不接受，提供替代方案]

**详细说明**:
[如果接受: 已修改 XXX.md，修改内容为...]
[如果不接受: 拒绝原因或替代方案描述...]

---

## 模块依赖影响

> 如调整影响了模块依赖关系，需在此说明

- [ ] 模块划分未受影响
- [ ] 模块依赖关系未受影响
- [ ] 如有影响，已标记需人工介入

## 修改确认

- [ ] 已按要求修改对应设计文档（如有接受的建议）
- [ ] 所有调整建议已回应
```
