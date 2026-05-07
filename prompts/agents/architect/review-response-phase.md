# Architect - 回应 Review 阶段

## 输入文档

- **ARCHITECTURE.md**: 已提交的架构文档
- **ARCHITECTURE_REVIEW.md**: Architecture Reviewer 提出的评审问题

## 输出文档

- **ARCHITECTURE_REVIEW_FEEDBACK.md**: 对评审问题的反馈文档
- **ARCHITECTURE.md**: 修改后的文档（如有接受的问题）

## 工作流程

1. 阅读 ARCHITECTURE_REVIEW.md 中 Reviewer Agent 提出的所有问题
2. 逐一分析每个问题:
   - **接受**: 修改 ARCHITECTURE.md 对应内容，在反馈中记录修改
   - **不接受**: 说明拒绝原因，提供架构设计依据或合理解释
3. 输出 ARCHITECTURE_REVIEW_FEEDBACK.md

## 提示词样例

```
当前项目目录下，有一份 ARCHITECTURE_REVIEW.md 文档，请阅读这份文档，对该文档提出的问题进行回应：

1. 如果接受该问题:
   - 修改当前目录下的 ARCHITECTURE.md 文档
   - 在反馈中说明具体修改内容

2. 如果不接受该问题:
   - 说明不接受的原因
   - 提供架构设计依据或理由

将反馈结果写到 ARCHITECTURE_REVIEW_FEEDBACK.md 文档中。
```

## ARCHITECTURE_REVIEW_FEEDBACK.md 文档结构规范

```markdown
# Architecture Review 反馈文档

## 反馈轮次: 第1轮

## 问题反馈

### 问题 1: [问题标题]

**原问题描述**: [从 REVIEW 文档摘录]

**反馈结果**: [接受 / 不接受]

**详细说明**:
[如果接受: 已修改 ARCHITECTURE.md 第X章节，修改内容为...]
[如果不接受: 拒绝原因是...]

---

## 修改确认

- [ ] 已按要求修改 ARCHITECTURE.md
- [ ] 所有接受的问题已解决
```