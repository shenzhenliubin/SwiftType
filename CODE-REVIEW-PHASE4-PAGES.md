# Code Review - Phase 4 页面组件

**审查范围**: MyProgress.vue, MyPractice.vue, Home.vue, Sidebar.vue, App.vue, ratings.js
**日期**: 2026-04-23

---

## MEDIUM-1: MyProgress.vue 引用不存在的 subLevel.stageId 属性

**文件**: `src/renderer/src/components/MyProgress.vue`
**严重级别**: MEDIUM
**行号**: 108, 120

**问题描述**:
`MyProgress.vue` 中两处代码引用了 `subLevel.stageId`，但 subLevel 对象并没有 `stageId` 属性。

```javascript
// 行 105-111: currentStageName
const currentStageName = computed(() => {
  const subLevel = getSubLevel(currentSubLevel.value)
  if (!subLevel) return ''
  const stage = getStage(subLevel.stageId)  // ← subLevel.stageId 为 undefined
  return stage ? stage.name : ''
})

// 行 118-121: isCurrentStage
function isCurrentStage(stageId) {
  const subLevel = getSubLevel(currentSubLevel.value)
  return subLevel?.stageId === stageId  // ← subLevel.stageId 为 undefined
}
```

**数据结构事实**: `levels.js` 中 subLevel 对象嵌套在 stage 的 subLevels 数组里，但 subLevel 本身没有 `stageId` 反向引用。

**影响**: `currentStageName` 始终返回空字符串，`isCurrentStage` 始终返回 false，导致"当前进度"概览区域和阶段高亮完全失效。

**修复方案**: `levels.js` 已提供 `getStageForSubLevel(subLevelId)` 函数，直接使用它：

```javascript
import { getStageForSubLevel } from '@/data/levels'

const currentStageName = computed(() => {
  const stage = getStageForSubLevel(currentSubLevel.value)
  return stage ? stage.name : ''
})

function isCurrentStage(stageId) {
  const stage = getStageForSubLevel(currentSubLevel.value)
  return stage?.id === stageId
}
```

---

## LOW-1: MyPractice.vue 重复定义 formatTime 函数

**文件**: `src/renderer/src/components/MyPractice.vue`
**严重级别**: LOW
**行号**: 129-135

**问题描述**:
`MyPractice.vue` 自定义了 `formatTime` 函数，而项目中已有 `utils/formatTime.js` 提供相同的工具函数。`Result.vue` 已正确从 utils 导入使用。

**对比**:
- `utils/formatTime.js`: 有输入校验（NaN、负数处理），但仅支持到分钟级别
- `MyPractice.vue` 本地版: 无输入校验，但支持小时级别

**修复方案**: 将小时支持添加到 `utils/formatTime.js`，然后 `MyPractice.vue` 直接导入使用。

---

## LOW-2: LevelSelect 页面从 UI 不可达

**文件**: `src/renderer/src/components/App.vue`
**严重级别**: LOW
**行号**: 26-29 (LevelSelect 路由)

**问题描述**:
`LevelSelect` 组件仍在 App.vue 中导入和路由，但：
- `Sidebar.vue` 的 navItems 已移除 `levelSelect` 入口
- `Home.vue` 已移除"选择关卡"按钮

用户无法通过任何 UI 操作到达 LevelSelect 页面，成为死代码路由。

**修复方案**: 如果 LevelSelect 功能已整合到 MyProgress 页面（子关卡列表），可以从 App.vue 中移除 LevelSelect 的导入和路由。如果后续还需要，保留也可接受。

---

## 总结

| 编号 | 严重级别 | 文件 | 问题 | 状态 |
|------|---------|------|------|------|
| MEDIUM-1 | MEDIUM | MyProgress.vue | `subLevel.stageId` 不存在，需用 `getStageForSubLevel()` | 待修复 |
| LOW-1 | LOW | MyPractice.vue | formatTime 函数重复，应使用 utils 工具函数 | 待修复 |
| LOW-2 | LOW | App.vue | LevelSelect 页面 UI 不可达（死路由） | 待确认 |
