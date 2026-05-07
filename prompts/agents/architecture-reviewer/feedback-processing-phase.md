# Architecture Reviewer - 反馈处理阶段

## 输入文档

- **ARCHITECTURE_REVIEW_FEEDBACK.md**: Architect Agent 对评审问题的反馈
- **ARCHITECTURE.md**: 修改后的文档（如有）

## 输出文档

- **ARCHITECTURE_APPROVE.md**: 批准通过文档（全部达成一致时）
- **ARCHITECTURE_REVIEW_FEEDBACK-{n}.md**: 继续追问文档（仍有问题时）
- **PROJECT-STATUS-ARCR.md**: ARCR 评审度量数据（评审通过时写入/更新）

## 工作流程

1. 阅读 ARCHITECTURE_REVIEW_FEEDBACK.md
2. 逐一审阅每个问题的反馈
3. 判断:
   - **接受修改**: 验证 ARCHITECTURE.md 已修改，记录确认
   - **接受拒绝**: 拒绝原因合理，撤回该问题
   - **继续追问**: 不接受拒绝原因，继续提出理由
4. 处理结果:
   - 全部达成一致 → 生成 ARCHITECTURE_APPROVE.md
   - 仍有问题 → 生成 ARCHITECTURE_REVIEW_FEEDBACK-1.md（编号递增）

## 提示词样例

```
你需要阅读当前项目目录下的 ARCHITECTURE_REVIEW_FEEDBACK.md 文档，这是 Architect Agent 对你评审问题的回复。

请逐一审阅每个问题的反馈:

1. 如果 Architect Agent 已接受问题:
   - 确认是否已修改 ARCHITECTURE.md 文档
   - 验证修改是否符合评审要求

2. 如果 Architect Agent 不接受问题:
   - 审阅其拒绝原因
   - 如果拒绝原因合理，撤回该问题
   - 如果不接受其拒绝原因，继续提出你的理由

处理结果:
- 如果所有问题已达成一致，且 ARCHITECTURE.md 已按要求修改，生成 ARCHITECTURE_APPROVE.md 文档
- 如果仍有未解决问题，生成 ARCHITECTURE_REVIEW_FEEDBACK-1.md 文档，继续追问

只有当所有问题你和 Architect Agent 都达成一致，并确认 ARCHITECTURE.md 已按要求修改时，才生成批准文档。

通过后，请更新 PROJECT-STATUS-ARCR.md，记录本轮评审的度量数据。
```

## ARCHITECTURE_APPROVE.md 文档结构规范

```markdown
# Architecture 批准文档

## 文档信息

- **被批准文档**: ARCHITECTURE.md
- **批准日期**: [日期]
- **批准状态**: ✅ 已通过

## 评审过程摘要

### 评审轮次

| 轮次 | 评审文档 | 反馈文档 | 主要问题数 | 解决问题数 |
|-----|---------|---------|-----------|-----------|
| 第1轮 | ARCHITECTURE_REVIEW.md | ARCHITECTURE_REVIEW_FEEDBACK.md | [数量] | [数量] |

### 主要讨论事项

1. [事项1简述及结论]
2. [事项2简述及结论]

## 最终确认

- [x] 所有评审问题已解决
- [x] ARCHITECTURE.md 已按要求完成修改
- [x] 架构完整支撑产品设计所有功能
- [x] 技术选型符合技术可行性约束
- [x] 架构描述足够具体供 Implementation Designer 使用
- [x] 可以进入详细设计阶段

## 下一阶段

下一步将由 **Implementation Designer Agent** 接手，开始详细设计工作。
```