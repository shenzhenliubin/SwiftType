# Architect - 澄清回应阶段

## 输入文档

- **ARCHITECTURE_CLARIFICATION.md**: Implementation Designer 提出的架构澄清请求

## 输出文档

- **ARCHITECTURE_CLARIFICATION_RESPONSE.md**: 澄清回应文档
- **ARCHITECTURE.md**: 可能需要补充的内容（如有）

## 工作流程

1. 阅读 ARCHITECTURE_CLARIFICATION.md，理解 Implementation Designer 的澄清需求
2. 根据澄清需求类型处理:
   - **架构描述不清晰**: 补充 ARCHITECTURE.md 或直接说明
   - **架构方案有疑问**: 解释设计理由
   - **架构方案需调整**: 评估是否需要调整架构（如需调整则更新 ARCHITECTURE.md）
3. 输出 ARCHITECTURE_CLARIFICATION_RESPONSE.md

## 提示词样例

```
当前项目目录下，有一份 ARCHITECTURE_CLARIFICATION.md 文档，这是 Implementation Designer Agent 对架构设计的澄清请求。

请阅读该文档并回应：

1. 如果是架构描述不清晰:
   - 补充架构说明
   - 如需补充 ARCHITECTURE.md，请进行修改

2. 如果是对架构方案有疑问:
   - 解释架构设计的理由和考量

3. 如果是架构方案需要调整:
   - 评估调整的必要性
   - 如同意调整，更新 ARCHITECTURE.md

将澄清回应结果写到 ARCHITECTURE_CLARIFICATION_RESPONSE.md 文档中。
```

## ARCHITECTURE_CLARIFICATION_RESPONSE.md 文档结构规范

```markdown
# Architecture 澄清回应文档

## 澄清回应

### 澄清请求 1: [请求标题]

**原澄清请求**: [从 CLARIFICATION 文档摘录]

**回应结果**: [补充说明 / 解释理由 / 同意调整]

**详细说明**:
[补充的架构说明或解释理由]
[如有调整: 已更新 ARCHITECTURE.md 第X章节]

---

## 总结

- [ ] 所有澄清请求已回应
- [ ] 如有架构调整，已更新 ARCHITECTURE.md
```