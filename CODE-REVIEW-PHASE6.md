# Code Review - Phase 6 难度递进系统

**审查范围**: levels.js, progress.js, useStorage.js, Practice.vue, Result.vue, MyProgress.vue, Settings.vue, Sidebar.vue, App.vue, difficultySettings.js
**日期**: 2026-04-27

---

## 已修复确认（上一轮问题）

| 编号 | 问题 | 修复状态 |
|------|------|---------|
| MEDIUM-1 | Sidebar.vue 直接访问 window.swifttypeAPI | **已修复** — 改用 `useStorage().quitApp()` |
| LOW-1 | preload 路径变更 | 保持 `../preload/preload.js`（electron-vite 标准布局） |
| Settings 移除难度选择 | 原设置页的难度按钮已移除 | **正确** — 难度现在由进度系统自动管理 |

---

## HIGH-1: getDifficultyForSubLevel 逻辑错误，intermediate 完成后返回 challenge

**文件**: `src/renderer/src/data/levels.js:326-329`
**严重级别**: HIGH

```javascript
if (dp.challenge?.completed) return 'challenge'
if (dp.intermediate?.completed) return 'challenge'  // ← 应为 'intermediate'
if (dp.beginner?.completed) return 'intermediate'
return 'beginner'
```

用户完成 intermediate 后，此函数返回 `'challenge'` 而不是 `'intermediate'`。这意味着完成进阶难度后会直接跳到挑战难度，跳过了在进阶难度下的练习机会。

**修复方案**:
```javascript
if (dp.challenge?.completed) return 'challenge'
if (dp.intermediate?.completed) return 'intermediate'  // ← 修正
if (dp.beginner?.completed) return 'intermediate'
return 'beginner'
```

**注意**: 这个逻辑看起来可能是有意为之（完成某难度后自动进入下一难度）。但当前逻辑是"完成 intermediate 后当前难度变成 challenge"，意味着用户没有机会在 intermediate 难度下再次练习。如果这是有意设计（已完成则不再重复），则此条可忽略。但通常"当前应使用的难度"应反映用户接下来要练习的难度，而非已完成的最高的上一个难度。请确认业务意图。

---

## HIGH-2: Result.vue emit 'next-difficulty' 但 App.vue 用 retryLevel 处理

**文件**: `src/renderer/src/App.vue:45`
**严重级别**: HIGH

```html
<Result
  ...
  @next-difficulty="retryLevel"
  ...
/>
```

Result.vue 中 `goNextDifficulty()` emit `'next-difficulty'` 事件，但 App.vue 将其绑定到 `retryLevel()`——即重新进入当前关卡的同一难度。用户点击"进入进阶模式"按钮后，实际上会以**当前难度**重新开始练习，而非以新难度开始。

**根因**: `retryLevel()` 只是 `currentPage.value = 'practice'`，没有更新难度。Practice.vue 的 `currentDifficulty` 从 `getDifficultyForSubLevel` 读取，而该函数基于 `progressStore.levels` 的 `difficultyProgress` 计算。由于 `updateLevelComplete` 已经写入了新难度进度，理论上下次进入时 `getDifficultyForSubLevel` 应返回更高难度。但结合 HIGH-1 的 bug，实际行为可能不符预期。

**修复方案**: App.vue 中添加专门的 `goNextDifficulty` 处理函数，确保 `currentLevelId` 和进度数据正确更新后再进入练习。

---

## MEDIUM-1: progress.js updateLevelComplete 中未使用的变量 isPassed

**文件**: `src/renderer/src/stores/progress.js:72`
**严重级别**: MEDIUM

```javascript
const isPassed = isBeginnerOnly ? true : true // 只要调用就说明通过了
```

`isPassed` 变量被赋值但从未使用（下面的 `completed` 判断直接重新计算）。且三元表达式两个分支都是 `true`，没有实际意义。应删除此行。

---

## MEDIUM-2: Settings.vue 难度选择 UI 已移除，但 difficultyList 导入已清理

**文件**: `src/renderer/src/components/Settings.vue`

Settings.vue 已移除难度选择区块和 `difficultyList` 导入——难度现在由进度系统自动管理。这是正确的方向。

但设置页仍保留了音效和手指提示两个开关。如果后续不再需要难度手动设置，`difficultySettings.js` 中的 `difficultyList` 导出可能不再被任何 UI 引用（仍被 Result.vue 的 `getDifficultyLabel` 等间接使用）。目前无问题，仅记录。

---

## MEDIUM-3: useStorage.js 中 updateLevelComplete 与 progress.js 重复了相同的难度逻辑

**文件**: `src/renderer/src/composables/useStorage.js:119-161` 和 `src/renderer/src/stores/progress.js:68-109`

**严重级别**: MEDIUM

`updateLevelComplete` 函数在 storage 层和 store 层各自独立实现了相同的难度递进逻辑（判断 stage order、计算 difficultyProgress、判断 completed）。两份代码需保持同步，否则会出现内存状态和持久化数据不一致。

**建议**: storage 层只负责存储原始数据，业务逻辑（难度判断、完成判断）应集中在 store 层，storage 层直接接收 store 计算好的结果进行写入。

---

## LOW-1: getRequiredDifficulties 返回值未被用于解锁逻辑

**文件**: `src/renderer/src/data/levels.js:358-362`

`getRequiredDifficulties()` 返回各阶段所需的难度列表，MyProgress.vue 用它来显示难度进度点。但解锁下一关的逻辑（`isSubLevelUnlocked`、`isSubLevelFullyCompleted`）都只检查 `completed` 和 `challenge`，不依赖此函数。该函数目前纯 UI 用途，无逻辑问题。

---

## 总结

| 编号 | 严重级别 | 文件 | 问题 | 状态 |
|------|---------|------|------|------|
| HIGH-1 | HIGH | levels.js:328 | getDifficultyForSubLevel intermediate→challenge 逻辑可能有误 | 待确认/修复 |
| HIGH-2 | HIGH | App.vue:45 | next-difficulty 事件绑定到 retryLevel，未实现难度切换 | 待修复 |
| MEDIUM-1 | MEDIUM | progress.js:72 | 未使用的 isPassed 变量 | 待清理 |
| MEDIUM-2 | MEDIUM | Settings.vue | 难度选择 UI 已移除（记录） | 已完成 |
| MEDIUM-3 | MEDIUM | useStorage.js + progress.js | 难度逻辑重复实现，需同步维护 | 待重构 |
| LOW-1 | LOW | levels.js | getRequiredDifficulties 仅 UI 用途 | 无需修复 |
