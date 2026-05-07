# Code Review - Phase 5 修改

**审查范围**: index.js, preload.js, useStorage.js, user.js, userStore, settings.js, progress.js, Settings.vue, Sidebar.vue, App.vue, UserSelect.vue
**日期**: 2026-04-25

---

## 已修复确认（上一轮问题）

| 编号 | 问题 | 修复状态 |
|------|------|---------|
| HIGH-1 | `restReminderMinutes` 默认值不一致 (10 vs 30) | **已修复** — index.js:25 改为 30 |
| HIGH-2 | settings 缺少 difficulty 字段迁移 | **已修复** — index.js:91-100 补全逻辑 |
| MEDIUM-1 | deleteUser 整体覆写 userProgress | **已修复** — useStorage.js:62 改用 deleteStore |
| LOW-1 | Settings.vue 未使用的 DIFFICULTY 导入 | **已修复** — Settings.vue:107 已移除 |

---

## MEDIUM-1: Sidebar.vue 直接访问 window.swifttypeAPI

**文件**: `src/renderer/src/components/Sidebar.vue:81`
**严重级别**: MEDIUM

```javascript
function quitApp() {
  window.swifttypeAPI.quitApp()
}
```

直接通过 `window.swifttypeAPI` 调用，没有通过 composable/store 封装，也没有 try-catch 错误处理。虽然功能上可行，但与项目其他部分通过 `useStorage()` 等 composable 封装 IPC 调用的模式不一致。

**建议**: 在 `useStorage.js` 或新建 composable 中封装 `quitApp()`，并添加错误处理：
```javascript
// useStorage.js
async function quitApp() {
  try {
    await getAPI().quitApp()
  } catch (e) {
    console.warn('退出应用失败:', e)
  }
}
```

---

## LOW-1: preload.js 路径变更需确认构建配置

**文件**: `src/main/index.js:44`
**严重级别**: LOW

```javascript
preload: path.join(__dirname, '../preload/preload.js')
```

preload 路径从 `'preload.js'`（同目录）改为 `'../preload/preload.js'`（上级 preload 目录）。这在 `electron-vite` 标准布局下是正确的（`out/main/` 和 `out/preload/` 是平级目录）。但如果打包后目录结构变化，需要确认路径仍然有效。

**建议**: 运行 `npm run build` 后验证打包产物的 preload 路径是否正确。

---

## 总结

| 编号 | 严重级别 | 文件 | 问题 | 状态 |
|------|---------|------|------|------|
| MEDIUM-1 | MEDIUM | Sidebar.vue | 直接访问 window.swifttypeAPI，缺少错误处理 | 待修复 |
| LOW-1 | LOW | index.js | preload 路径变更需确认构建产物 | 需验证 |

**整体评价**: 上一轮所有 CRITICAL/HIGH/MEDIUM/LOW 问题均已修复。新增的 `store:delete` IPC 通道、`app:quit` 通道、头像选择器、退出按钮等功能实现良好。代码质量有提升。
