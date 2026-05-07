# Code Review - Phase 8 统一难度递进规则

**审查范围**: progress.js, App.vue, Result.vue, levels.js
**日期**: 2026-04-28

---

## 变更概述

本次修改统一了难度递进规则：**所有关卡（包括 Stage 1 基础练习）都需要通过挑战模式才算完成**，不再对 Stage 1 做特殊豁免。

### 具体变更

1. **progress.js:84-85** — `completed` 判断从 `isBeginnerOnly || newDP.challenge?.completed` 简化为 `newDP.challenge?.completed === true`，所有关卡一视同仁。
2. **progress.js:7** — 移除了 `getDifficultyForSubLevel` 导入（不再使用 `getStageForSubLevel`）。
3. **App.vue:106-107** — `goNextLevel` 从 `isBeginnerOnly || result.difficulty === 'challenge'` 简化为只检查 `result.difficulty !== 'challenge'`。
4. **App.vue:69** — 移除了 `getStageForSubLevel` 导入。
5. **Result.vue** — 移除了 `isBeginnerOnlyStage` / `getStageForSubLevel` 相关逻辑，`canUnlockNext` 和 `nextAction` 直接基于 `difficulty` 值判断。
6. **Result.vue** — 移除了 `getStageForSubLevel` 导入。
7. **levels.js** — `getDifficultyForSubLevel` 移除了 stage order 判断，所有关卡统一走难度递进。`getRequiredDifficulties` 简化为无参数，始终返回三个难度。`isSubLevelFullyCompleted` 移除了 Stage 1 特殊处理。

---

## HIGH-1: Stage 1 基础练习从 tutorial 开始就需要过 3 个难度

**文件**: `src/renderer/src/data/levels.js`, `src/renderer/src/stores/progress.js`
**严重级别**: HIGH

`basic-tutorial`（基准位置）的 `targetAccuracy` 为 `null`，`unlockCondition` 为 `null`——即首关无条件解锁、无正确率要求。但在新规则下，用户需要以新手、进阶、挑战三种模式各通过一次，`completed` 才会变为 `true`。

这意味着 `basic-tutorial` 后面的关卡 `basic-left-pinky` 的 `unlockCondition: { subLevel: 'basic-tutorial' }` 要求 `basic-tutorial.completed === true`（`isSubLevelUnlocked` 第 307 行），而 `completed` 只有通过挑战模式才为 `true`。

**影响**: 用户必须以挑战模式（字母快速下落）完成基准位置教学关，才能解锁左手小指练习。这对完全的新手用户可能门槛过高——刚学会基准位置就要应对快速下落字母。

**结论**: 已确认为有意的产品决策。所有关卡统一需要通过挑战模式才完成。

---

## MEDIUM-1: hasNextDifficulty 不再区分 Stage，但 progress.js 仍依赖旧的 stage 逻辑

**文件**: `src/renderer/src/stores/progress.js:150-154`

```javascript
function hasNextDifficulty(subLevelId) {
  const progress = levels.value[subLevelId]
  if (!progress?.difficultyProgress) return true
  return !progress.difficultyProgress.challenge?.completed
}
```

之前此函数检查 `stage.order === 1` 做早返回。现在移除了 stage 检查，所有关卡统一逻辑。这本身是正确的，只是记录变更。

---

## 总结

| 编号 | 严重级别 | 文件 | 问题 | 状态 |
|------|---------|------|------|------|
| HIGH-1 | HIGH | levels.js / progress.js | Stage 1 需通过挑战模式才完成 | **不修改 — 产品意图** |
| MEDIUM-1 | MEDIUM | progress.js | hasNextDifficulty 移除 stage 区分（记录） | 已完成 |
