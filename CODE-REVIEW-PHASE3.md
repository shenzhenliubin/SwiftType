# Code Review Report — Phase 3

**审查日期**: 2026-04-23
**审查范围**: 下落字母动画 + 子关卡系统 + Shift 键支持 + 难度配置
**审查人**: Code Reviewer Agent

---

## 审查范围

| 文件 | 状态 |
|------|------|
| `src/renderer/src/components/Practice.vue` | 大幅重构 |
| `src/renderer/src/composables/usePractice.js` | 完全重写 |
| `src/renderer/src/composables/useKeyboardInput.js` | 已确认 C-1 修复 |
| `src/renderer/src/components/FallingZone.vue` | 新增 |
| `src/renderer/src/components/FallingLetter.vue` | 新增 |
| `src/renderer/src/composables/useFallingLetters.js` | 新增 |
| `src/renderer/src/data/difficultySettings.js` | 新增 |
| `src/renderer/src/stores/settings.js` | 新增 difficulty 属性 |
| `src/renderer/src/data/levels.js` | 新增子关卡层级导出 |

## 整体评价

架构设计合理：composable 职责清晰，FallingZone/FallingLetter 组件拆分得当，难度配置独立为数据文件。`useKeyboardInput` 的 C-1 正则 `i` flag 修复已确认生效。

---

## MEDIUM-1: `generateShiftSequence` 中 40%/60% 分支为死代码

**文件**: `usePractice.js:143-154`
**状态**: 待修复

```javascript
const letter = letters[Math.floor(Math.random() * letters.length)]
// 40% 大写（需要 Shift），60% 原样
if (Math.random() < 0.4) {
  sequence.push(letter.toUpperCase())  // ← letter 已经是大写，toUppercase() 无效
} else {
  sequence.push(letter)                // ← 同样是大写
}
```

**问题**: `resolveLetters()` 返回的字母全部为大写（`getAllLetters()` 或 level data），两个分支推入的值完全相同，结果 100% 大写。注释说"40% 大写，60% 原样"与实际行为不符。

**建议**: 如果设计意图是全部大写（即 Shift 练习始终需要 Shift），直接简化为：
```javascript
sequence.push(letter)
```
如果需要大小写混合练习，则 else 分支应改为 `letter.toLowerCase()`，但同时也需要修改 `useKeyboardInput` 中 `key.toUpperCase()` 的逻辑，否则小写 expected 永远无法匹配。

---

## MEDIUM-2: `completePractice()` 被调用两次

**文件**: `usePractice.js:253` + `Practice.vue:185`
**状态**: 待修复

**问题**: `nextContent()` 中当序列完成时调用 `completePractice()`（返回值被丢弃），然后 Practice.vue 检测 `isComplete` 后又调用一次。第二次调用会重新计算时间和正确率——虽然值基本一致，但属于冗余调用。

**建议**: 在 `nextContent()` 中仅设置 `isComplete.value = true`，不调用 `completePractice()`；或将其结果存入 ref 供 Practice.vue 直接读取。

---

## MEDIUM-3: 下落模式下 setTimeout 未在组件卸载时清理

**文件**: `Practice.vue:199-204`
**状态**: 待修复

```javascript
setTimeout(() => {
  if (!isComplete.value) {
    spawnLetter()
  }
}, 300)
```

**问题**: 组件卸载后这个 timeout 仍可能触发，导致修改已卸载组件的 reactive state。在 Vue dev 模式下会产生 warning。

**建议**: 将 timeout id 存入变量，在 `onUnmounted` 中 `clearTimeout`。

---

## LOW-1: FallingZone.vue 中存在未使用的导入

**文件**: `FallingZone.vue:17`
**状态**: 待修复

```javascript
import { ref, onMounted, onUnmounted } from 'vue'
```

`onMounted` 和 `onUnmounted` 被导入但未使用。只需 `import { ref } from 'vue'`。

---

## LOW-2: 字母 miss 未触发 `consecutiveErrors` 累加

**文件**: `Practice.vue:142-145`
**状态**: 待确认（可能是有意设计）

```javascript
onMiss(char) {
  playError()
  errorCount.value++
  // 缺少: consecutiveErrors 没有累加
}
```

**问题**: 按键错误时 `consecutiveErrors` 会累加（在 usePractice 中），3 次后触发 hintMode。但 miss（字母落到底部）不走 `handleInput`，所以不会累加。如果这是有意设计（miss 不等同于按错键），建议加注释说明。

---

## LOW-3: 异步 onKeyPress 中的未捕获异常风险

**文件**: `Practice.vue:161`
**状态**: 待修复

**问题**: `onKeyPress` 是 async 函数，但 `useKeyboardInput` 的 `handleKeydown` 同步调用 `onInput(onKeyPress)` 不 await 返回的 Promise。`onKeyPress` 内 try/catch 只覆盖了存储操作，其余路径（如 `keyboardRef.value?.flashCorrect`）如果抛异常，会产生 unhandled promise rejection。

---

## 汇总

| 级别 | 数量 | 是否阻塞 |
|------|------|----------|
| CRITICAL | 0 | — |
| HIGH | 0 | — |
| MEDIUM | 3 | 建议修复 |
| LOW | 3 | 可后续处理 |

**优先处理**: M-1（Shift 死代码）和 M-3（timeout 泄漏）。M-2 的双调用为冗余但无功能影响。

整体代码质量良好，无阻塞性问题。
