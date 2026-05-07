# SwiftType Phase 2 关卡选择功能 Code Review

**审查日期**: 2026-04-22
**审查范围**: Phase 2 关卡选择功能相关代码变更
**涉及文件**: LevelSelect.vue, App.vue, Result.vue, Home.vue

---

## 一、变更概述

Phase 2 实现了关卡选择页面，将之前的 TODO 占位组件替换为完整功能。变更涉及 4 个文件：

| 文件 | 变更内容 |
|------|----------|
| `LevelSelect.vue` | 从 TODO 占位改为完整关卡选择页面（列表、锁定/解锁状态、解锁提示） |
| `App.vue` | 添加 `levelSelect` 页面路由分支，导入 LevelSelect 组件 |
| `Result.vue` | 添加"选择关卡"按钮，新增 `select-level` emit |
| `Home.vue` | "选择关卡"按钮去掉 `disabled`，连接到 `select-level` 事件 |

### 导航流程

```
Home ──→ LevelSelect ──→ Practice ──→ Result ──→ LevelSelect
  │           ↑                         │
  └─ startPractice ──→ Practice         └─ home ──→ Home
```

---

## 二、做得好的地方

1. **关卡状态展示齐全** — 已完成（绿条+正确率百分比）、已解锁（播放按钮）、锁定（锁图标+解锁提示），三种状态视觉区分清晰
2. **解锁提示友好** — `getUnlockHint()` 显示前置关卡名称和所需正确率（如"需通过: 左手小指 正确率 80%"），对儿童用户友好
3. **事件流完整** — Home → LevelSelect → Practice → Result → LevelSelect，所有导航路径畅通，无死胡同
4. **锁定关卡不可点击** — `selectLevel()` 检查 `isUnlocked`，锁定卡片设置 `cursor: not-allowed` + `opacity: 0.6`
5. **CSS 全部使用变量** — 颜色、间距、圆角引用 `variables.css`，与项目整体风格统一
6. **页面路由无破坏** — 新增 `levelSelect` 分支不影响原有 home/practice/result 页面路由

---

## 三、HIGH 问题（2项）

### H-1. `allLevels` 用 `computed` 包裹静态常量数组，无意义

**文件**: `src/renderer/src/components/LevelSelect.vue` 第 74 行

```javascript
const allLevels = computed(() => levels)
```

`levels` 是从 `levels.js` 导出的静态数组，永远不会变化。`computed` 包裹没有响应式收益，反而每次模板渲染都会触发 computed 的依赖追踪逻辑。

**修复**: 直接使用导入的 `levels`，删除 `allLevels` computed：

```javascript
// 删除第 74 行
// 模板中 v-for="level in allLevels" 改为 v-for="level in levels"
```

---

### H-2. Home.vue 导入了未使用的 `ref`

**文件**: `src/renderer/src/components/Home.vue` 第 51 行

```javascript
import { ref, computed } from 'vue'
```

该组件中没有使用 `ref`，只有 `computed`。

**修复**:

```javascript
import { computed } from 'vue'
```

---

## 四、MEDIUM 问题（4项）

### M-1. Result.vue "选择关卡"按钮无论结果如何都显示

**文件**: `src/renderer/src/components/Result.vue` 第 54-56 行

```html
<button class="btn btn-secondary btn-small" @click="goLevelSelect">
  选择关卡
</button>
```

练习通过和未通过时都显示"选择关卡"按钮。对于儿童用户，未通过时提供太多导航选项可能分散注意力（应聚焦在"再练一次"）。

**建议**: 仅在通过时显示，或将按钮放在次要位置：

```html
<button
  v-if="isPassed"
  class="btn btn-secondary btn-small"
  @click="goLevelSelect"
>
  选择关卡
</button>
```

---

### M-2. 关卡卡片的 `level-id` 圆圈对锁定关卡缺少视觉区分

**文件**: `src/renderer/src/components/LevelSelect.vue` 第 206-217 行

锁定关卡的 `level-id` 圆圈使用默认的 `var(--color-bg-dark)` 背景，与未解锁未完成关卡视觉相同。整个卡片仅有 `opacity: 0.6` 区分，对儿童来说不够直观。

**建议**: 为锁定关卡的圆圈增加灰色/虚线视觉区分：

```css
.is-locked .level-id {
  background: var(--border-color);
  color: var(--color-text-muted);
  border: 2px dashed var(--color-text-muted);
}
```

---

### M-3. 模板中每个关卡多次调用 store 方法

**文件**: `src/renderer/src/components/LevelSelect.vue` 第 19/43/54 行

`v-for` 循环内对每个关卡多次调用 `isUnlocked()`（CSS class 1 次 + status 区域 1-2 次 + lock-hint 条件 1 次），每个关卡至少 3 次调用 `progressStore.checkLevelUnlocked()`。14 个关卡共约 42 次函数调用。

虽然 14 个关卡性能影响可忽略，但更规范的做法是在 `computed` 中预计算：

```javascript
const levelStates = computed(() => {
  return levels.map(level => {
    const progress = progressStore.getLevelProgress(level.id)
    return {
      ...level,
      unlocked: progressStore.checkLevelUnlocked(level.id),
      completed: progress?.completed === true,
      isCurrent: progressStore.currentLevel === level.id,
      accuracy: progress?.accuracy
    }
  })
})
```

---

### M-4. `totalLevels` 硬编码为 14

**文件**: `src/renderer/src/components/Home.vue` 第 69 行

```javascript
const totalLevels = computed(() => 14)
```

`levels` 数据源中实际定义了 14 个关卡，但硬编码数字会导致数据源变化时不同步。

**修复**:

```javascript
import { levels } from '@/data/levels'
// ...
const totalLevels = computed(() => levels.length)
```

---

## 五、LOW 问题（2项）

### L-1. LevelSelect 没有自动滚动到当前关卡

14 个关卡列表在最小窗口高度（500px）中可能需要滚动。建议 `onMounted` 时自动滚动到 `currentLevel` 对应的卡片位置，提升儿童使用体验。

---

### L-2. `getUnlockHint` 对关卡 0 返回空字符串

关卡 0 的 `unlockCondition` 为 `null`，`getUnlockHint` 返回空字符串。逻辑正确（关卡 0 默认解锁不需要提示），且模板中 `v-if="!isUnlocked(level.id)"` 确保只有锁定关卡显示提示。无需修改，仅记录。

---

## 六、问题汇总表

| 编号 | 严重性 | 文件 | 简述 |
|------|--------|------|------|
| H-1 | HIGH | `LevelSelect.vue:74` | `computed` 包裹静态数组无意义 |
| H-2 | HIGH | `Home.vue:51` | 未使用的 `ref` 导入 |
| M-1 | MEDIUM | `Result.vue:54` | "选择关卡"按钮始终显示，未通过时可能分散儿童注意力 |
| M-2 | MEDIUM | `LevelSelect.vue` | 锁定关卡圆圈缺少视觉区分 |
| M-3 | MEDIUM | `LevelSelect.vue:19/43/54` | 模板中多次调用 store 方法 |
| M-4 | MEDIUM | `Home.vue:69` | `totalLevels` 硬编码为 14 |
| L-1 | LOW | `LevelSelect.vue` | 缺少自动滚动到当前关卡 |
| L-2 | LOW | `LevelSelect.vue:111` | 关卡 0 解锁提示返回空字符串（符合预期） |

---

## 七、修复优先级

### 立即修复（代码整洁，5 分钟内完成）

- [ ] **H-1** — 删除 `allLevels` computed，模板直接用 `levels`
- [ ] **H-2** — 删除 Home.vue 未使用的 `ref` 导入

### 建议修复（体验优化）

- [ ] **M-1** — Result.vue "选择关卡"按钮仅在通过时显示
- [ ] **M-2** — 锁定关卡圆圈增加虚线/灰色视觉区分
- [ ] **M-4** — `totalLevels` 改为 `levels.length`

### 可选优化

- [ ] **M-3** — 预计算关卡状态减少模板中的方法调用
- [ ] **L-1** — 自动滚动到当前关卡

---

## 八、总体评价

Phase 2 关卡选择功能实现完整，覆盖了所有必要的交互流程。2 个 HIGH 问题均为代码整洁度（不影响功能），MEDIUM 问题集中在用户体验细节。建议修复 HIGH 和 M-1/M-4 后即可合并。

**功能完整性**: ⭐⭐⭐⭐⭐
**代码质量**: ⭐⭐⭐⭐
**用户体验**: ⭐⭐⭐⭐
**安全性**: N/A（纯前端 UI 变更）

---

*Phase 2 Code Review 完成*
