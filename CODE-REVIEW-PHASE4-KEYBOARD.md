# Code Review Report — Phase 4 键盘 UI 重构

**审查日期**: 2026-04-23
**审查范围**: Keyboard.vue / Key.vue / keyboardLayout.js 重构（完整键盘布局 + 样式重写）
**审查人**: Code Reviewer Agent

---

## 变更概述

- `keyboardLayout.js`: 从简单的字母行扩展为完整 5 行键盘（Esc/Back/Tab/Caps/Shift/Enter/Space/Ctrl/Alt）
- `Key.vue`: 完全重写，使用 `data-*` 属性驱动样式，新增手指颜色边框、热力图、正确/错误闪烁、抖动动画
- `Keyboard.vue`: 样式重写，键盘外观模拟物理键盘

---

### MEDIUM-1: Space 键在目标为空格时不会被高亮

**文件**: `Keyboard.vue:93-97`
**状态**: 待修复

```javascript
function isHighlighted(char) {
  if (!props.currentLetter) return false
  // 字母/数字键高亮
  if (char.toUpperCase() === props.currentLetter.toUpperCase()) return true
```

**问题**: 当 `currentLetter` 为 `' '`（空格）时，键盘上的 Space 键 char 为 `'Space'`。比较 `'Space'.toUpperCase()` 即 `'SPACE'` 与 `' '.toUpperCase()` 即 `' '`，永远不匹配。词组和短句练习中空格是高频字符，Space 键不会高亮，用户无法获得按键提示。

**修复方案**: 在 `isHighlighted` 中增加空格特殊处理：
```javascript
if (char === 'Space' && props.currentLetter === ' ') return true
```

---

### LOW-1: isSpecial 列表缺少 Esc/Back/Ctrl/Alt

**文件**: `Key.vue:66-68`

```javascript
const isSpecial = computed(() => {
  return ['Tab', 'Caps', 'ShiftL', 'ShiftR', 'Enter', 'Space'].includes(props.char)
})
```

`keyboardLayout.js` 中的 `Esc`、`Back`、`Ctrl`、`Alt` 不在此列表中，不会被应用 `.special` 样式（13px 字体 + 灰色）。这些键会以默认的 16px 粗体渲染，与 Tab/Caps/Shift 等特殊键的视觉风格不一致。

**修复方案**: 扩展列表：
```javascript
return ['Tab', 'Caps', 'ShiftL', 'ShiftR', 'Enter', 'Space', 'Esc', 'Back', 'Ctrl', 'Alt'].includes(props.char)
```

---

### LOW-2: 键盘组件使用硬编码颜色而非 CSS 变量

**文件**: `Key.vue` 全文 + `Keyboard.vue` CSS

键盘组件全部使用硬编码颜色（`#D1D5DB`、`#333333`、`#1E3A8A` 等），而应用其余部分使用 `var(--color-primary)` 等 CSS 变量。若将来调整主题色，键盘不会跟随变化。

**说明**: 这可能是设计意图（模拟物理键盘的固定外观）。如果是，可忽略此条。若需保持一致性，建议替换为 CSS 变量。

---

## 汇总

| 级别 | 数量 | 说明 |
|------|------|------|
| CRITICAL | 0 | — |
| HIGH | 0 | — |
| MEDIUM | 1 | Space 键高亮缺失 |
| LOW | 2 | isSpecial 列表不完整 + 硬编码颜色 |

**MEDIUM-1 影响词组/短句/综合练习模式，建议修复。**
