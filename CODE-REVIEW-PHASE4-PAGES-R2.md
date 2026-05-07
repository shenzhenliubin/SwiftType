# Code Review - Phase 4 页面组件 (Round 2)

**审查范围**: Result.vue, MyProgress.vue, MyPractice.vue, Sidebar.vue, App.vue
**日期**: 2026-04-24

---

## MEDIUM-1: MyProgress.vue 引用不存在的 stage.icon 属性

**文件**: `src/renderer/src/components/MyProgress.vue`
**严重级别**: MEDIUM
**行号**: 41

**问题描述**:
模板中 `{{ stage.icon }}` 引用了 `icon` 属性，但 `levels.js` 中所有 stage 对象都没有 `icon` 字段。

```javascript
// levels.js 中 stage 的实际结构
{ id: 'basic', name: '基础练习', description: '单独练习每个手指', order: 1, subLevels: [...] }
// 没有 icon 字段
```

```html
<!-- MyProgress.vue:41 -->
<span class="stage-emoji">{{ stage.icon }}</span>
```

**影响**: "我的进度"页面中，每个阶段卡片的 emoji 图标位置显示为空，用户看到空白区域。

**修复方案**: 在 `levels.js` 的每个 stage 对象中添加 `icon` 字段，例如：
```javascript
{ id: 'basic', name: '基础练习', icon: '🎯', ... }
{ id: 'integration', name: '初步集成', icon: '🤝', ... }
{ id: 'combination', name: '组合练习', icon: '🔥', ... }
{ id: 'comprehensive', name: '综合练习', icon: '🏆', ... }
```

---

## LOW-1: App.vue 中 showLevelSelect() 是死代码

**文件**: `src/renderer/src/App.vue`
**严重级别**: LOW
**行号**: 95-97

**问题描述**:
`showLevelSelect()` 函数已定义但从未在模板或其他函数中调用。

```javascript
function showLevelSelect() {
  currentPage.value = 'levelSelect'
}
```

Sidebar 已移除 levelSelect 导航项，Home.vue 也已移除"选择关卡"按钮，此函数不再有调用方。

**修复方案**: 删除该函数。

---

## LOW-2: Sidebar levelLabel 中"打字大师"等级标签显示不一致

**文件**: `src/renderer/src/components/Sidebar.vue`
**严重级别**: LOW
**行号**: 62

**问题描述**:
`levelLabel` 计算属性中，"打字大师"级别使用 `Math.ceil(total * 0.9)` 作为等级数字，而其他级别使用 `completed`。

```javascript
if (ratio >= 0.9) return `等级${Math.ceil(total * 0.9)}·打字大师`  // 固定阈值数字
if (ratio >= 0.6) return `等级${completed}·明星选手`                // 实际完成数
if (ratio >= 0.3) return `等级${completed}·进步之星`                // 实际完成数
if (completed > 0) return `等级${completed}·初学者`                 // 实际完成数
```

**影响**: 假设 total=21（当前子关卡总数），当用户完成 19 关时显示"等级19·打字大师"，但实际上 `Math.ceil(21*0.9) = 19` 恰好一致。当 total=20 时，显示"等级18·打字大师"，但用户可能已完成 18-20 关，数字可能不匹配实际完成数。

**修复方案**: 统一使用 `completed`：
```javascript
if (ratio >= 0.9) return `等级${completed}·打字大师`
```

---

## 总结

| 编号 | 严重级别 | 文件 | 问题 | 状态 |
|------|---------|------|------|------|
| MEDIUM-1 | MEDIUM | MyProgress.vue | `stage.icon` 不存在，阶段 emoji 不显示 | 待修复 |
| LOW-1 | LOW | App.vue | `showLevelSelect()` 死代码 | 待修复 |
| LOW-2 | LOW | Sidebar.vue | levelLabel "打字大师"等级数字与其他级别不一致 | 待修复 |
