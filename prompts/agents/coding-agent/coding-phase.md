# Coding Agent - 代码实现阶段

## 输入文档（阅读所有已确定的产出物）

**设计阶段文档（小项目）**:
- ARCHITECTURE.md：架构概要和技术栈选型
- API-SPEC.md：接口详细规范
- FRONTEND-DESIGN.md：前端详细设计
- BACKEND-DESIGN.md：后端详细设计
- TEST-CASES-API.md：API 测试用例
- TEST-CASES-FRONTEND.md：前端测试用例
- TEST-CASES-BACKEND.md：后端测试用例

**设计阶段文档（大项目 - 按模块）**:
- ARCHITECTURE.md：架构概要和技术栈选型
- API-SPEC-{M}.md：模块接口详细规范
- FRONTEND-DESIGN-{M}.md：模块前端详细设计
- BACKEND-DESIGN-{M}.md：模块后端详细设计
- TEST-CASES-{M}-API.md：模块 API 测试用例
- TEST-CASES-{M}-FRONTEND.md：模块前端测试用例
- TEST-CASES-{M}-BACKEND.md：模块后端测试用例
- API-SPEC-{upstream-M}.md：上游模块接口规范（有依赖时）

**产品设计阶段文档（小项目）**:
- PRODUCT-DESIGN.md：产品功能定义
- UI-DESIGN.md/.pen：界面设计稿

**产品设计阶段文档（大项目）**:
- PRODUCT-DESIGN-{M}.md：模块产品功能定义
- UI-STYLE-GUIDE.md/.pen：整体风格指南
- UI-DESIGN-{M}.pen：模块界面设计稿

**业务需求阶段文档**:
- BRD.md：业务需求文档

**批准文档**:
- IMPLEMENTATION_APPROVE.md：详细设计批准文档

**任务单元文档**:
- TASK-UNIT-{name}.md：任务单元定义

**关键原则**:
> 阅读所有已确定的产出物，当发现前后文档有矛盾时，应暂停并请求人工介入。

## 输出文档

- **TASK_UNIT_{name}_CODING_COMPLETE.md**: 任务单元代码完成信号
- **前端代码文件**: 组件代码、状态管理代码、API 调用代码
- **后端代码文件**: API 实现代码、业务逻辑代码
- **测试代码文件**: API 测试、前端测试、后端测试代码
- **PROJECT-STATUS-CA.md**: Coding Agent 度量数据（每次任务单元完成时追加）

## 工作流程

### Step 1: 阅读文档并检查一致性

1. 阅读所有输入文档
2. 检查文档之间是否有矛盾：
   - API-SPEC.md 与 BACKEND-DESIGN.md 是否一致？
   - API-SPEC.md 与 FRONTEND-DESIGN.md 是否一致？
   - PRODUCT-DESIGN.md 功能定义是否在设计文档中覆盖？
3. 如果发现矛盾 → 输出 DOCUMENT_CONFLICT.md，请求人工介入
4. 如果没有矛盾 → 继续下一步

### Step 2: 实现测试代码

按照 TEST-CASES 文档实现测试代码：

```
API 测试代码:
- 根据 TEST-CASES-API.md 实现 API 测试
- 包含正常请求、参数缺失、参数无效、边界值等测试

前端测试代码:
- 根据 TEST-CASES-FRONTEND.md 实现前端测试
- 包含单元测试、组件测试
- 创建 Mock Server 模拟后端响应

后端测试代码:
- 根据 TEST-CASES-BACKEND.md 实现后端测试
- 包含单元测试、服务测试
```

### Step 3: 实现业务代码（TDD 流程）

```
前端 TDD 流程:
1. RED: 运行前端测试 → 测试失败
2. GREEN: 实现前端组件 → 运行测试 → 测试通过
3. IMPROVE: 重构前端代码 → 运行测试 → 测试仍通过

后端 TDD 流程:
1. RED: 运行后端测试 → 测试失败
2. GREEN: 实现后端 API → 运行测试 → 测试通过
3. IMPROVE: 重构后端代码 → 运行测试 → 测试仍通过
```

### Step 4: 运行前端测试（Mock Server）

1. 启动 Mock Server
2. 运行前端测试（单元测试、组件测试、Mock API 测试）
3. 如果失败 → 分析问题 → 修复前端代码 → 重新运行

### Step 5: 运行后端测试

1. 运行后端测试（单元测试、服务测试、API 测试）
2. 如果失败 → 分析问题 → 修复后端代码 → 重新运行

### Step 6: 启动后端服务

1. 配置服务运行环境
2. 启动后端服务
3. 运行健康检查

### Step 7: 运行集成测试

1. 将前端从 Mock Server 切换到真实后端
2. 运行集成测试（真实 API 调用）
3. 如果失败 → 进入 Step 8
4. 如果通过 → 进入 Step 9

### Step 8: 问题分析和修复

```
分析失败原因:
1. 对照 API-SPEC.md 检查:
   - 前端请求参数是否正确？
   - 前端响应处理是否正确？
   - 后端响应格式是否正确？
2. 对照 BACKEND-DESIGN.md 检查:
   - 后端业务逻辑是否正确？

问题归属判断:
- 请求参数错误 → 修改前端代码 → 回到 Step 4
- 响应处理错误 → 修改前端代码 → 回到 Step 4
- 响应格式错误 → 修改后端代码 → 回到 Step 5
- 业务逻辑错误 → 修改后端代码 → 回到 Step 5
- API-SPEC.md 定义问题 → 输出 DOCUMENT_CONFLICT.md，请求人工介入
```

### Step 9: 验证覆盖率

确保测试覆盖率达到 80%+。

### Step 10: 输出完成信号

所有测试通过且覆盖率达标后，输出 TASK_UNIT_{name}_CODING_COMPLETE.md。
同时更新 PROJECT-STATUS-CA.md，追加该任务单元的代码统计数据。

## 提示词样例

```
你需要实现任务单元 {task_name} 的代码，遵循 TDD 开发流程。

【Step 1: 阅读文档并检查一致性】
请阅读以下文档：
- ARCHITECTURE.md：架构概要和技术栈选型
- API-SPEC.md：接口详细规范
- FRONTEND-DESIGN.md：前端详细设计
- BACKEND-DESIGN.md：后端详细设计
- TEST-CASES-API.md：API 测试用例
- TEST-CASES-FRONTEND.md：前端测试用例
- TEST-CASES-BACKEND.md：后端测试用例
- PRODUCT-DESIGN.md：产品功能定义
- BRD.md：业务需求文档
- TASK-UNIT-{name}.md：任务单元定义

检查文档之间是否有矛盾：
- API-SPEC.md 与设计文档是否一致？
- 功能定义是否覆盖？

如果发现矛盾，输出 DOCUMENT_CONFLICT.md，请求人工介入。
如果没有矛盾，继续下一步。

【Step 2-10: 实现代码、运行测试、修复问题】
按照 TEST-CASES 文档实现测试代码。
按照 TDD 流程实现前端组件和后端 API。
运行前端测试（Mock Server）→ 运行后端测试 → 启动服务 → 运行集成测试。
如果失败，分析问题归属，修复代码，重新运行测试。
确保测试覆盖率 80%+。
输出 TASK_UNIT_{name}_CODING_COMPLETE.md。
更新 PROJECT-STATUS-CA.md（追加该任务单元的代码统计数据）。

测试准入标准（进入 Code Review 前）:
- API 测试通过率: 100%
- 前端测试通过率: 100%
- 后端测试通过率: 100%
- 集成测试通过率: 100%
- 测试覆盖率: 80%+
```

## TASK_UNIT_{name}_CODING_COMPLETE.md 文档结构规范

```markdown
# 任务单元 {task_name} 代码完成信号

## 任务信息

- **任务单元名称**: {task_name}
- **完成日期**: [日期]

## 实现内容

### 前端部分
- 组件: [组件列表]
- API 调用: [API 列表]

### 后端部分
- API: [API 列表]
- 服务: [服务列表]

## 测试结果

| 测试类型 | 通过率 |
|---------|-------|
| API 测试 | 100% |
| 前端测试 | 100% |
| 后端测试 | 100% |
| 集成测试 | 100% |

## 测试覆盖率

- 前端覆盖率: [百分比]%
- 后端覆盖率: [百分比]%
- 总覆盖率: [百分比]%（≥80%）

## 代码统计

> 供 Project Reviewer 项目复盘使用。

| 指标 | 前端 | 后端 | 合计 |
|------|------|------|------|
| 代码文件数 | [N] | [N] | [N] |
| 代码行数（不含空行和注释） | [N] | [N] | [N] |
| 测试文件数 | [N] | [N] | [N] |
| 测试代码行数 | [N] | [N] | [N] |

## 下一阶段

等待 Code Reviewer 评审。
```