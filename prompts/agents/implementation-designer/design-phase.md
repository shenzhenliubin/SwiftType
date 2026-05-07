# Implementation Designer - 设计阶段

> 本阶段用于：小项目的整体详细设计，或大项目中单个模块的详细设计。

## 输入文档

### 小项目（整体设计）

- **ARCHITECTURE.md**: 系统架构文档（技术栈选型、架构概要）
- **PRODUCT-DESIGN.md**: 产品设计文档（功能定义、EARS 描述）
- **UI-DESIGN.pen**: 高保真设计稿（界面实现参考）

### 大项目（模块设计）

- **ARCHITECTURE.md**: 系统架构文档（技术栈选型、架构概要）
- **PRODUCT-DESIGN-{M}.md**: 模块产品设计文档
- **UI-DESIGN-{M}.pen**: 模块高保真设计稿
- **UI-STYLE-GUIDE.md**: 整体风格指南
- **API-SPEC-{upstream-M}.md**: 上游模块接口规范（有依赖时，已通过 IMPR review）
- **Project Manager 的模块分配指令**: 指定本次设计的模块名称和范围

## 输出文档

### 小项目（整体设计）

- **API-SPEC.md**: 接口详细规范文档（前后端共享）
- **FRONTEND-DESIGN.md**: 前端详细设计文档
- **BACKEND-DESIGN.md**: 后端详细设计文档
- **TEST-CASES-API.md**: API 测试用例文档（前后端共享）
- **TEST-CASES-FRONTEND.md**: 前端测试用例文档
- **TEST-CASES-BACKEND.md**: 后端测试用例文档
- **TASK-UNITS.md**: 任务拆分清单（供 PM 派单，包含任务名称、依赖关系、实现要点）

### 大项目（模块设计）

- **API-SPEC-{M}.md**: 模块接口详细规范文档
- **FRONTEND-DESIGN-{M}.md**: 模块前端详细设计文档
- **BACKEND-DESIGN-{M}.md**: 模块后端详细设计文档
- **TEST-CASES-{M}-API.md**: 模块 API 测试用例文档
- **TEST-CASES-{M}-FRONTEND.md**: 模块前端测试用例文档
- **TEST-CASES-{M}-BACKEND.md**: 模块后端测试用例文档
- **TASK-UNITS-{M}.md**: 模块任务拆分清单（供 PM 派单，包含任务名称、依赖关系、实现要点）

## 设计顺序（重要）

为确保前后端接口一致性，请按以下顺序进行设计：

### 小项目

```
Step 1: 定义接口详细规范 → API-SPEC.md
        ↓
Step 2: 定义 API 测试用例 → TEST-CASES-API.md（基于 API-SPEC.md）
        ↓
Step 3: 定义后端详细设计 → BACKEND-DESIGN.md（基于 API-SPEC.md）
        ↓
Step 4: 定义后端测试用例 → TEST-CASES-BACKEND.md（基于 BACKEND-DESIGN.md）
        ↓
Step 5: 定义前端详细设计 → FRONTEND-DESIGN.md（基于 API-SPEC.md）
        ↓
Step 6: 定义前端测试用例 → TEST-CASES-FRONTEND.md（基于 FRONTEND-DESIGN.md）
```

### 大项目（模块设计）

```
Step 0: 如有上游依赖 → 阅读 API-SPEC-{upstream-M}.md，理解上游接口定义
        ↓
Step 1: 定义模块接口详细规范 → API-SPEC-{M}.md
        ↓
Step 2: 定义模块 API 测试用例 → TEST-CASES-{M}-API.md
        ↓
Step 3: 定义模块后端详细设计 → BACKEND-DESIGN-{M}.md
        ↓
Step 4: 定义模块后端测试用例 → TEST-CASES-{M}-BACKEND.md
        ↓
Step 5: 定义模块前端详细设计 → FRONTEND-DESIGN-{M}.md
        ↓
Step 6: 定义模块前端测试用例 → TEST-CASES-{M}-FRONTEND.md
```

## 工作流程

### 小项目（整体设计）

1. 阅读 ARCHITECTURE.md，理解架构概要和技术栈选型
2. 判断是否需要向 Architect 提出澄清请求
3. 根据 ARCHITECTURE.md 技术栈选型选择对应的 Skill（如有安装）
4. 定义接口详细规范 → API-SPEC.md
5. 定义 API 测试用例 → TEST-CASES-API.md
6. 定义后端详细设计 → BACKEND-DESIGN.md
7. 定义后端测试用例 → TEST-CASES-BACKEND.md
8. 定义前端详细设计 → FRONTEND-DESIGN.md
9. 定义前端测试用例 → TEST-CASES-FRONTEND.md

### 大项目（模块设计）

1. 阅读 ARCHITECTURE.md，理解架构概要和技术栈选型
2. 阅读 PRODUCT-DESIGN-{M}.md，理解本模块的功能需求
3. 确认本次设计的模块范围（PM 指定）
4. **如有上游依赖**: 阅读 API-SPEC-{upstream-M}.md，确保接口调用一致
5. 判断是否需要向 Architect 提出澄清请求
6. 根据 ARCHITECTURE.md 技术栈选型选择对应的 Skill（如有安装）
7. 定义模块接口详细规范 → API-SPEC-{M}.md
8. 定义模块 API 测试用例 → TEST-CASES-{M}-API.md
9. 定义模块后端详细设计 → BACKEND-DESIGN-{M}.md
10. 定义模块后端测试用例 → TEST-CASES-{M}-BACKEND.md
11. 定义模块前端详细设计 → FRONTEND-DESIGN-{M}.md
12. 定义模块前端测试用例 → TEST-CASES-{M}-FRONTEND.md

**关键原则**:
> 模块设计时必须阅读上游模块的 API-SPEC，确保跨模块接口调用一致。
> 不允许在模块设计时修改上游模块的接口定义。
> 如发现上游接口定义不满足当前模块需求，应反馈给 Project Manager 人工介入。

## 可选：澄清请求

如果对架构描述有疑问，可以先输出澄清请求：

```
当前项目目录下，阅读 ARCHITECTURE.md 后，发现以下内容需要澄清：

[澄清问题列表]

请将澄清请求输出到 ARCHITECTURE_CLARIFICATION.md 文档。
```

## 提示词样例

### 小项目

```
请阅读以下文档进行详细设计：
- ARCHITECTURE.md：架构概要和技术栈选型
- PRODUCT-DESIGN.md：产品功能定义
- UI-DESIGN.pen：界面设计稿

设计要求：

【Step 1: 定义接口详细规范】
- 根据 ARCHITECTURE.md 的接口概要，定义每个 API 的详细参数和返回值
- 输出到 API-SPEC.md

【Step 2: 定义 API 测试用例】
- 根据 API-SPEC.md 定义每个 API 的测试用例
- 包含正常请求、参数缺失、参数无效、边界值等测试场景
- 输出到 TEST-CASES-API.md

【Step 3: 定义后端详细设计】
- 根据 ARCHITECTURE.md 的后端技术栈，设计后端服务结构
- 根据 API-SPEC.md，设计每个 API 的实现方案
- 根据 PRODUCT-DESIGN.md 的功能定义，设计业务逻辑
- 输出到 BACKEND-DESIGN.md

【Step 4: 定义后端测试用例】
- 根据 BACKEND-DESIGN.md 定义后端测试用例
- 包含单元测试、服务测试用例
- 输出到 TEST-CASES-BACKEND.md

【Step 5: 定义前端详细设计】
- 根据 ARCHITECTURE.md 的前端技术栈，设计前端组件结构
- 根据 API-SPEC.md，设计前端如何调用后端 API
- 根据 UI-DESIGN.pen，设计组件如何实现界面
- 输出到 FRONTEND-DESIGN.md

【Step 6: 定义前端测试用例】
- 根据 FRONTEND-DESIGN.md 定义前端测试用例
- 包含单元测试、组件测试用例
- 输出到 TEST-CASES-FRONTEND.md

注意：接口详细规范需前后端共享，确保一致性。
注意：测试用例文档用于指导 Coding Agent 编写测试代码，防止测试代码偏离设计意图。
```

### 大项目模块设计

```
请阅读以下文档进行模块详细设计：
- ARCHITECTURE.md：架构概要和技术栈选型
- PRODUCT-DESIGN-{ModuleName}.md：模块产品功能定义
- UI-DESIGN-{ModuleName}.pen：模块界面设计稿
- UI-STYLE-GUIDE.md：整体风格指南
- [如有上游依赖] API-SPEC-{upstream-M}.md：上游模块接口规范

你本次需要设计模块: {ModuleName}。

设计要求：

【Step 0: 上游接口确认】
- 如有上游依赖模块，请阅读 API-SPEC-{upstream-M}.md
- 确保本模块的接口调用与上游定义一致

【Step 1: 定义模块接口详细规范】
- 定义本模块的所有 API 接口
- 如有上游依赖，确保数据结构一致
- 输出到 API-SPEC-{ModuleName}.md

【Step 2: 定义模块 API 测试用例】
- 输出到 TEST-CASES-{ModuleName}-API.md

【Step 3: 定义模块后端详细设计】
- 输出到 BACKEND-DESIGN-{ModuleName}.md

【Step 4: 定义模块后端测试用例】
- 输出到 TEST-CASES-{ModuleName}-BACKEND.md

【Step 5: 定义模块前端详细设计】
- 输出到 FRONTEND-DESIGN-{ModuleName}.md

【Step 6: 定义模块前端测试用例】
- 输出到 TEST-CASES-{ModuleName}-FRONTEND.md

注意：本模块接口如需调用上游模块，请严格遵循上游 API-SPEC-{upstream-M}.md 定义。
```

## API-SPEC.md 文档结构规范（小项目）

```markdown
# 接口详细规范文档

## 1. 接口概述

### 1.1 接口设计原则
- [设计原则]

### 1.2 通用规范
- 请求格式: JSON
- 返回格式: JSON
- 认证方式: [根据 ARCHITECTURE.md]

## 2. 接口详细定义

### 2.1 [接口名称]

**接口路径**: /api/xxx
**请求方法**: GET/POST/PUT/DELETE
**接口说明**: [功能说明]

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|-------|-----|-----|------|
| [参数1] | [类型] | [是/否] | [说明] |

#### 返回结果

```json
{
  "code": 200,
  "data": {
    [返回字段说明]
  },
  "message": "success"
}
```

#### 错误码说明

| 错误码 | 说明 |
|-------|------|
| [错误码] | [说明] |

---

### 2.2 [接口名称]
...

## 3. 数据结构定义

### 3.1 [数据结构名称]

| 字段名 | 类型 | 说明 |
|-------|-----|------|
| [字段1] | [类型] | [说明] |

---

## 4. 接口调用示例

### 4.1 [接口名称] 调用示例

```javascript
// 前端调用示例
fetch('/api/xxx', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer xxx' }
})
```
```

## API-SPEC-{M}.md 文档结构规范（大项目模块）

```markdown
# 模块接口详细规范文档 - {ModuleName}

## 1. 模块接口概述

### 1.1 模块说明
- **模块名称**: {ModuleName}
- **产品设计参考**: PRODUCT-DESIGN-{ModuleName}.md

### 1.2 通用规范
- 请求格式: JSON
- 返回格式: JSON
- 认证方式: [根据 ARCHITECTURE.md]

## 2. 上游模块依赖（如有）

### 2.1 依赖的上游模块

| 上游模块 | 接口规范 | 使用的接口 |
|---------|---------|-----------|
| [M1] | API-SPEC-{M1}.md | [使用的接口列表] |

## 3. 接口详细定义

[同小项目格式]

## 4. 数据结构定义

[同小项目格式]

## 5. 接口调用示例

[同小项目格式]
```

## BACKEND-DESIGN.md 文档结构规范（小项目）

```markdown
# 后端详细设计文档

## 1. 设计概述

### 1.1 技术栈
- 语言/框架: [根据 ARCHITECTURE.md]
- 数据库: [根据 ARCHITECTURE.md]

### 1.2 设计原则
- [设计原则]

## 2. 项目结构

```
project/
├── [目录结构]
└── ...
```

## 3. 模块设计

### 3.1 [模块名称]

#### 职责说明
[模块职责]

#### 关键类/函数设计

| 类名/函数名 | 职责 | 关键方法 |
|-----------|-----|---------|
| [类名] | [职责] | [方法列表] |

#### 业务逻辑设计
[业务逻辑流程图或伪代码]

---

## 4. API 实现设计

### 4.1 [API 名称]

**接口路径**: /api/xxx（引用 API-SPEC.md）

#### 实现方案
1. [步骤1]
2. [步骤2]

#### 数据处理
[数据处理逻辑]

---

## 5. 数据模型设计

### 5.1 数据库表结构

#### 表: [表名]

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|-----|------|
| [字段1] | [类型] | [约束] | [说明] |

#### 表关系
[表关系图或说明]

---

## 6. 配置设计

### 6.1 环境配置
[环境配置说明]

### 6.2 依赖配置
[依赖配置说明]
```

## BACKEND-DESIGN-{M}.md 文档结构规范（大项目模块）

```markdown
# 模块后端详细设计文档 - {ModuleName}

## 1. 模块设计概述

### 1.1 模块信息
- **模块名称**: {ModuleName}
- **接口规范参考**: API-SPEC-{ModuleName}.md
- **产品设计参考**: PRODUCT-DESIGN-{ProductName}.md

### 1.2 技术栈
- 语言/框架: [根据 ARCHITECTURE.md]
- 数据库: [根据 ARCHITECTURE.md]

## 2. 上游模块集成（如有）

### 2.1 上游接口调用

| 上游模块 | 调用接口 | 用途 |
|---------|---------|------|
| [M1] | [接口路径] | [用途说明] |

## 3. 模块结构

[同小项目模块设计格式]

## 4. API 实现设计

[同小项目 API 实现格式，引用 API-SPEC-{M}.md]

## 5. 数据模型设计

[同小项目数据模型格式]

## 6. 配置设计

[同小项目配置格式]
```

## FRONTEND-DESIGN.md 文档结构规范（小项目）

```markdown
# 前端详细设计文档

## 1. 设计概述

### 1.1 技术栈
- 框架: [根据 ARCHITECTURE.md]
- 状态管理: [根据 ARCHITECTURE.md]
- UI 组件库: [根据 ARCHITECTURE.md 或 UI-DESIGN.md]

### 1.2 设计原则
- [设计原则]

## 2. 项目结构

```
project/
├── src/
│   ├── components/    # 组件目录
│   ├── pages/         # 页面目录
│   ├── services/      # API 服务
│   ├── store/         # 状态管理
│   └── utils/         # 工具函数
└── ...
```

## 3. 页面设计

### 3.1 [页面名称]

#### 页面路由
- 路径: /xxx

#### 页面组件结构
```
[页面名称]/
├── index.tsx          # 页面入口
├── [组件A].tsx        # 子组件
├── [组件B].tsx        # 子组件
└── styles.ts          # 样式定义
```

#### 状态设计
| 状态名 | 类型 | 说明 |
|-------|-----|------|
| [状态1] | [类型] | [说明] |

#### API 调用
引用 API-SPEC.md 中定义的接口

---

## 4. 组件设计

### 4.1 [组件名称]

#### 组件职责
[组件职责说明]

#### Props 定义
| Prop名 | 类型 | 必填 | 说明 |
|-------|-----|-----|------|
| [Prop1] | [类型] | [是/否] | [说明] |

#### 组件状态
| 状态名 | 类型 | 说明 |
|-------|-----|------|
| [状态1] | [类型] | [说明] |

---

## 5. API 服务设计

### 5.1 [服务名称]

#### 服务职责
[服务职责说明]

#### API 方法设计
| 方法名 | 调用接口 | 说明 |
|-------|---------|------|
| [方法1] | /api/xxx | [说明] |

---

## 6. 状态管理设计

### 6.1 [Store 名称]

#### 状态定义
| 状态名 | 类型 | 说明 |
|-------|-----|------|
| [状态1] | [类型] | [说明] |

#### Actions 定义
| Action名 | 说明 |
|---------|------|
| [Action1] | [说明] |
```

## FRONTEND-DESIGN-{M}.md 文档结构规范（大项目模块）

```markdown
# 模块前端详细设计文档 - {ModuleName}

## 1. 模块设计概述

### 1.1 模块信息
- **模块名称**: {ModuleName}
- **接口规范参考**: API-SPEC-{ModuleName}.md
- **UI 设计参考**: UI-DESIGN-{ModuleName}.pen
- **风格指南**: UI-STYLE-GUIDE.md

### 1.2 技术栈
- 框架: [根据 ARCHITECTURE.md]
- 状态管理: [根据 ARCHITECTURE.md]

## 2. 上游模块集成（如有）

### 2.1 上游接口调用

| 上游模块 | 调用接口 | 用途 |
|---------|---------|------|
| [M1] | [接口路径] | [用途说明] |

## 3. 页面设计

[同小项目页面设计格式，引用 API-SPEC-{M}.md]

## 4. 组件设计

[同小项目组件设计格式]

## 5. API 服务设计

[同小项目 API 服务设计格式，引用 API-SPEC-{M}.md 和上游 API-SPEC-{upstream-M}.md]

## 6. 状态管理设计

[同小项目状态管理格式]

## 7. 跨模块导航

> 描述与其他模块的页面跳转（如有）

| 目标模块 | 跳转路径 | 触发条件 |
|---------|---------|---------|
| [M2] | /m2/xxx | [条件] |
```

## TEST-CASES-API.md 文档结构规范（小项目）

```markdown
# API 测试用例文档

## 1. 测试概述

### 1.1 测试目标
- 验证前后端 API 接口符合 API-SPEC.md 定义

### 1.2 测试范围
- 所有 API 接口

## 2. API 测试用例

### 2.1 [API 名称] 测试用例

**接口路径**: /api/xxx（引用 API-SPEC.md）
**请求方法**: GET/POST/PUT/DELETE

#### 测试用例列表

| 测试用例ID | 测试场景 | 请求参数 | 预期响应状态 | 预期响应内容 |
|-----------|---------|---------|------------|------------|
| API-001 | 正常请求 | [参数] | 200 | [响应结构] |
| API-002 | 参数缺失 | [参数] | 400 | 错误信息 |
| API-003 | 参数无效 | [参数] | 400 | 错误信息 |
| API-004 | 边界值-最小 | [参数] | 200 | [响应] |
| API-005 | 边界值-最大 | [参数] | 200 | [响应] |
| API-006 | 空值/null | [参数] | 400 | 错误信息 |
| API-007 | 未授权访问 | 无token | 401 | 错误信息 |

---

### 2.2 [API 名称] 测试用例
...

## 3. 测试用例统计

| API 接口 | 测试用例数 |
|---------|-----------|
| [API1] | [数量] |
| [API2] | [数量] |
| **总计** | [数量] |

## 4. 测试覆盖率目标

- API 测试覆盖率: 100%（所有接口）
- 所有接口至少包含: 正常请求 + 参数缺失 + 参数无效
```

## TEST-CASES-{M}-API.md 文档结构规范（大项目模块）

```markdown
# 模块 API 测试用例文档 - {ModuleName}

## 1. 测试概述

### 1.1 模块信息
- **模块名称**: {ModuleName}
- **接口规范参考**: API-SPEC-{ModuleName}.md

### 1.2 测试目标
- 验证本模块 API 接口符合 API-SPEC-{ModuleName}.md 定义

## 2. API 测试用例

[同小项目格式，引用 API-SPEC-{M}.md]

## 3. 跨模块接口测试（如有）

### 3.1 上游接口集成测试

| 测试用例ID | 测试场景 | 上游接口 | 预期结果 |
|-----------|---------|---------|---------|
| XAPI-001 | [场景] | [接口] | [预期] |

## 4. 测试用例统计

[同小项目格式]
```

## TEST-CASES-BACKEND.md 文档结构规范（小项目）

```markdown
# 后端测试用例文档

## 1. 测试概述

### 1.1 测试目标
- 验证后端服务实现符合 BACKEND-DESIGN.md 定义

### 1.2 测试范围
- 后端所有模块和服务

## 2. 单元测试用例

### 2.1 [模块名称] 单元测试

| 测试用例ID | 测试场景 | 输入条件 | 预期结果 |
|-----------|---------|---------|---------|
| UT-BE-001 | [场景] | [输入] | [预期] |

---

## 3. 服务测试用例

### 3.1 [服务名称] 服务测试

| 测试用例ID | 测试场景 | 输入条件 | 预期结果 |
|-----------|---------|---------|---------|
| ST-BE-001 | [场景] | [输入] | [预期] |

---

## 4. 测试用例统计

| 测试类型 | 测试用例数 |
|---------|-----------|
| 单元测试 | [数量] |
| 服务测试 | [数量] |
| **总计** | [数量] |

## 5. 测试覆盖率目标

- 单元测试覆盖率: 80%+
- 服务测试覆盖率: 80%+

## 6. 边界情况测试清单

| 测试场景 | 测试用例ID |
|---------|-----------|
| 空值/null | [用例ID] |
| 边界值 | [用例ID] |
| 异常情况 | [用例ID] |
| 并发情况 | [用例ID] |
```

## TEST-CASES-FRONTEND.md 文档结构规范（小项目）

```markdown
# 前端测试用例文档

## 1. 测试概述

### 1.1 测试目标
- 验证前端组件实现符合 FRONTEND-DESIGN.md 定义

### 1.2 测试范围
- 前端所有组件和模块

## 2. 单元测试用例

### 2.1 [模块名称] 单元测试

| 测试用例ID | 测试场景 | 输入条件 | 预期结果 |
|-----------|---------|---------|---------|
| UT-FE-001 | [场景] | [输入] | [预期] |

---

## 3. 组件测试用例

### 3.1 [组件名称] 组件测试

| 测试用例ID | 测试场景 | Props | 用户交互 | 预期行为 |
|-----------|---------|-------|---------|---------|
| CT-FE-001 | [场景] | [Props] | [交互] | [预期] |

---

## 4. 测试用例统计

| 测试类型 | 测试用例数 |
|---------|-----------|
| 单元测试 | [数量] |
| 组件测试 | [数量] |
| **总计** | [数量] |

## 5. 测试覆盖率目标

- 单元测试覆盖率: 80%+
- 组件测试覆盖率: 80%+

## 6. 边界情况测试清单

| 测试场景 | 测试用例ID |
|---------|-----------|
| 空值/null | [用例ID] |
| 边界值 | [用例ID] |
| 异常情况 | [用例ID] |
| 网络错误 | [用例ID] |
```

**注意**: 大项目模块的 TEST-CASES-{M}-BACKEND.md 和 TEST-CASES-{M}-FRONTEND.md 结构与小项目相同，但引用 BACKEND-DESIGN-{M}.md / FRONTEND-DESIGN-{M}.md。
