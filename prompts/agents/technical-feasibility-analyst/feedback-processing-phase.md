# Technical Feasibility Analyst - 反馈处理阶段

## 输入文档

- **PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md**: Product Designer Agent 对调整建议的反馈

## 输出文档

- **TECH-FEASIBILITY-REPORT.md**: 更新后的报告（全部达成一致时）
- **TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md**: 确认结果信号文档（全部达成一致时）
- **PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK-{n}.md**: 继续追问文档（仍有问题时）

## 工作流程

1. 阅读 PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md
2. 逐一审阅每个调整建议的反馈
3. 判断:
   - **接受调整**: 确认调整后方案可行，更新报告
   - **接受替代方案**: 替代方案可行，更新报告
   - **继续讨论**: 替代方案仍有问题，继续提出理由
4. 处理结果:
   - 全部达成一致 → 更新报告结论为"技术可行性确认通过" + 输出 TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md
   - 仍有问题 → 生成 PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK-1.md

**Artifact 失效判定**:
> 全部达成一致时，需检查 PD 的调整是否使已批准产物失效：
> - PD 修改了已批准的 PRODUCT-DESIGN* → 在确认文档中标记 PRODUCT-DESIGN*_APPROVE.md 失效
> - PD 修改了已批准的 UI* / UI-STYLE-GUIDE* → 在确认文档中标记 UI 相关 APPROVE 失效
> - 无批准产物受影响 → 在确认文档中标记"无失效产物"

## 提示词样例

```
请阅读当前项目目录下的 PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK.md 文档，这是 Product Designer 对你调整建议的回复。

请逐一审阅每个调整建议的反馈:

1. 如果 Product Designer 已接受调整建议:
   - 确认调整后的方案技术可行性
   - 更新 TECH-FEASIBILITY-REPORT.md 中的分析结果

2. 如果 Product Designer 不接受调整建议:
   - 审阅其拒绝原因或替代方案
   - 如果替代方案技术可行，接受替代方案
   - 如果替代方案仍有问题，继续提出你的理由

处理结果:
- 如果所有调整建议已达成一致，且技术可行性确认:
  1. 更新 TECH-FEASIBILITY-REPORT.md 的结论为"技术可行性确认通过"
  2. 输出 TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md，包含:
     - 调整摘要（每个建议的 PD 反馈和 TFA 确认）
     - Artifact 失效声明（检查 PD 的调整是否使已批准产物失效）
- 如果仍有未解决的问题，生成 PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK-1.md 文档，继续讨论

Artifact 失效声明规则:
- 检查 PD 是否修改了已批准的 PRODUCT-DESIGN*.md → 标记 PRODUCT-DESIGN*_APPROVE.md 失效
- 检查 PD 是否修改了已批准的 UI*.md / UI-STYLE-GUIDE*.md → 标记 UI 相关 APPROVE 失效
- 无批准产物受影响 → 标记"无失效产物"

只有当所有问题你和 Product Designer 都达成一致，并确认所有功能技术可行时，才能给出"通过"结论。
```

## PRODUCT-DESIGN_ADJUSTMENT_FEEDBACK-{n}.md 文档结构规范

```markdown
# 产品设计调整讨论 - 第[N]轮

## 反馈处理结果

### 调整建议 1: [功能名称]

**Designer Agent 反馈**: [接受 / 不接受，提供替代方案]

**处理结果**: [确认通过 / 接受替代方案 / 继续讨论]

**详细说明**:
[如果继续讨论: 替代方案仍有问题，理由是...]

---

### 调整建议 2: [功能名称]
...

---

## 待继续讨论的问题

- [问题1]
- [问题2]

---

## 技术可行性状态

- 已确认可行功能: [数量]
- 待解决功能: [数量]
- 状态: [继续讨论 / 准备通过]
```

## TECH-FEASIBILITY-ADJUSTMENT-CONFIRMATION.md 文档结构规范

```markdown
# 技术可行性调整确认文档

## 确认结果

- **状态**: 技术可行性确认通过
- **确认日期**: [日期]

## 调整摘要

| 调整建议 | PD 反馈 | TFA 确认 |
|---------|---------|---------|
| [建议1] | [接受/替代方案] | [确认通过] |
| [建议2] | [接受/替代方案] | [确认通过] |

## Artifact 失效声明

> PM 根据此声明决定是否回流重审。

- [ ] 无已批准产物受影响（直接推进 ARC）
- [ ] 以下已批准产物已失效，需回流重审：

| 失效产物 | 失效原因 | 回流目标 |
|---------|---------|---------|
| PRODUCT-DESIGN*_APPROVE.md | 产品设计已被修改 | PR 重审 |
| UI*_APPROVE.md / UI-STYLE-GUIDE*_APPROVE.md | UI 设计已被修改 | UID/UIR 重做 |
```