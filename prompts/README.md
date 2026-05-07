# SwiftType Agent 流程体系

> **唯一真源声明**: 各 Agent 的 `agent-definition.md` + `*-phase.md` 是职责、输入输出、协作关系、工作流程的唯一权威定义。本文档仅为导航索引。

---

## 这套文档是干什么的

定义 18 个 AI Agent 如何通过信号文档协作，完成从需求收集到项目复盘的完整软件开发流程。每个 Agent 有明确的职责边界、评审机制和人工介入点。

## 真源在哪里

```
prompts/agents/{agent-name}/
    agent-definition.md    ← 身份、职责、输入输出、协作关系
    *-phase.md             ← 每个阶段的工作流程、提示词、产出规范
```

其他文档的角色：

| 文档 | 性质 | 用途 |
|------|------|------|
| **PROCESS-SPEC.md** | 执行合同 | Artifact 注册表、状态机、转换规则、失效规则、人工介入规则 |
| **AGENT-FLOW.md** | 完整参考 | 流程图、产物表、执行模式详解 |
| **history/** | 历史资料 | 已归档的决策记录和问题清单 |

## 新人先读什么

1. **本文档** — 了解文档结构
2. **AGENT-FLOW.md 的"简化版流程"**（末尾）— 快速理解全链路
3. **PROCESS-SPEC.md §2 State Model** — 理解项目状态怎么流转
4. 挑一个感兴趣的 Agent，读它的 `agent-definition.md`

## 系统设计者先读什么

1. **PROCESS-SPEC.md** — 完整的执行合同（Artifact Registry + State Model + Transition Rules + Invalidation Rules + Human Intervention Rules）
2. **pm-agent/agent-definition.md** — 信号表和阶段序列是状态机的核心
3. **pm-agent/stage-transition-phase.md** — 每个信号对应的推进动作
4. **pm-agent/conflict-resolution-phase.md** — 异常处理逻辑
5. 按需深入各 Agent 的 phase 文件

## 目录结构

```
prompts/
├── README.md                           # 本文件（导航入口）
├── PROCESS-SPEC.md                     # 流程执行合同（系统实现者的权威参考）
├── AGENT-FLOW.md                       # 流程图 + 产物表（完整参考）
├── history/                            # 归档资料
│   ├── DECISIONS.md                    # 历史设计决策记录（PRV 复盘输入）
│   └── ISSUES.md                       # 历史问题清单（已全部解决）
├── templates/                          # 作者工具（非流程规范）
│
└── agents/
    ├── pm-agent/                       # 项目管理（流程编排）
    ├── business-analyst/               # 业务分析师
    ├── business-analyst-reviewer/      # 业务分析师评审
    ├── product-designer/               # 产品设计师
    ├── product-reviewer/               # 产品评审
    ├── ui-designer/                    # 界面设计师
    ├── ui-reviewer/                    # 界面评审
    ├── technical-feasibility-analyst/  # 技术可行性分析师
    ├── architect/                      # 架构师
    ├── architecture-reviewer/          # 架构评审
    ├── implementation-designer/        # 实现设计师
    ├── implementation-reviewer/        # 实现设计评审
    ├── coding-agent/                   # 代码实现
    ├── code-reviewer/                  # 代码评审
    ├── e2e-tester/                     # 端到端测试
    ├── e2e-reviewer/                   # 端到端测试评审
    ├── bug-fix-agent/                  # 缺陷修复
    └── project-reviewer/              # 项目复盘
```
