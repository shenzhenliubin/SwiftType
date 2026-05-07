# Code Review Report — Phase 4: 多用户系统 + UI 重构

**审查日期**: 2026-04-23
**审查范围**: 多用户系统（UserSelect/UserCreate/user store）、侧边栏布局（Sidebar）、评级系统（ratings）、数据迁移（v2→v3）、UI 重构（Home/LevelSelect/Result/progress store/useStorage）
**审查人**: Code Reviewer Agent

---

## Phase 3 遗留状态

Phase 3 审查中所有问题已修复，Practice.vue / usePractice.js / useKeyboardInput.js 无变更，仍然通过。

---

## 新增/重构文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `App.vue` | 重构 | 侧边栏布局 + 用户选择流程 |
| `Home.vue` | 重构 | 侧边栏内容区适配 |
| `LevelSelect.vue` | 重构 | Tab 难度切换 + 折叠阶段 + 评级显示 |
| `Result.vue` | 重构 | 评级显示 + 下一关/选择关卡按钮 |
| `Sidebar.vue` | 新增 | 侧边栏导航 + 用户信息 |
| `UserSelect.vue` | 新增 | 用户选择页面 |
| `UserCreate.vue` | 新增 | 新增用户弹窗 |
| `stores/user.js` | 新增 | 用户管理 Pinia Store |
| `stores/progress.js` | 重构 | 多用户版，按 userId 隔离 |
| `composables/useStorage.js` | 重构 | 多用户 API，按 userProgress.{userId} 路径存储 |
| `data/ratings.js` | 新增 | 评级定义 + getRating() |
| `main/index.js` | 修改 | v3 数据迁移，多用户数据结构 |
| `styles/variables.css` | 修改 | 新增侧边栏/黄色相关变量 |
| `styles/global.css` | 修改 | 新增 .app-layout / .main-content |

---

### MEDIUM-1: `setCurrentSubLevel` 异步保存未 await，可能丢数据

**文件**: `progress.js:62-65`
**状态**: 待修复

```javascript
function setCurrentSubLevel(subLevelId) {
  currentSubLevel.value = subLevelId
  saveProgress()   // ← async 但未 await，fire-and-forget
}
```

**问题**: `saveProgress` 是 async 函数，写入 IPC 存储。调用方 `App.vue:103` 在 `goNextLevel()` 中同步调用 `setCurrentSubLevel` 后立即切换页面。若保存失败（IPC 异常）或应用在写入前崩溃，本地状态已更新但存储未写入，重启后会退回旧关卡。

**修复方案**: 将 `setCurrentSubLevel` 改为 async 并 await：
```javascript
async function setCurrentSubLevel(subLevelId) {
  currentSubLevel.value = subLevelId
  await saveProgress()
}
```
调用方也需相应 `await`。

---

### LOW-1: user.js avatarOptions 有重复头像

**文件**: `stores/user.js:21`

```javascript
const avatarOptions = ['👤', '🧒', '👦', '👧', '🧒', '😎', '🦊', '🐱', '🐶', '🐼']
//                                         ^^^^ 重复
```

索引 1 和 4 都是 `'🧒'`，头像选择网格中会出现两个相同选项。建议替换其中一个为不同表情。

---

### LOW-2: 删除当前用户后 progressStore 未刷新

**文件**: `UserSelect.vue:70-73`

```javascript
async function handleDelete(user) {
  if (users.length <= 1) return
  await userStore.deleteUser(user.id)
  // ← 缺少: 若删除的是当前用户，progressStore 仍是旧用户数据
}
```

**问题**: `userStore.deleteUser()` 在删除当前用户时会自动切换到 users[0]，但 `progressStore.setUserId()` 和 `progressStore.loadProgress()` 未被调用。此时 progressStore 仍持有已删除用户的进度数据。用户在选择新用户后 `selectUser()` 会重载进度，所以在 UserSelect 页面上不可见，但 store 中数据不一致。

**修复方案**: 在删除后检查是否需要刷新 progressStore：
```javascript
if (user.id === progressStore.userId) {
  progressStore.setUserId(users[0].id)
  await progressStore.loadProgress()
}
```

---

### LOW-3: useStorage.saveProgress 非原子写入

**文件**: `useStorage.js:99-106`

```javascript
async function saveProgress(userId, progress) {
  await getAPI().setStore(`${userPath(userId)}.currentLevel`, progress.currentLevel)
  await getAPI().setStore(`${userPath(userId)}.levels`, progress.levels)
}
```

两次独立的 IPC 调用，非原子操作。若第一次成功、第二次失败，数据不一致。实际影响较低（electron-store 本地写入很快），但如果需要严格一致性，可改为一次性写入整个 progress 对象。

---

### LOW-4: Sidebar "我的进度" 和 "荣誉奖励" 导航项不可用

**文件**: `Sidebar.vue:61-62`

```javascript
{ id: 'progress', label: '我的进度', icon: '📊', page: null },
{ id: 'rewards', label: '荣誉奖励', icon: '🏆', page: null }
```

这两个导航项 `page: null`，点击后 `onNavClick` 不执行任何操作。用户看到可点击的按钮但无反馈。建议：加 `disabled` 样式或 `即将开放` 标签，或暂时隐藏。

---

### LOW-5: 删除用户无确认对话框

**文件**: `UserSelect.vue:70-73`

删除用户会永久移除其所有练习进度，但无确认步骤。对儿童应用而言，误操作风险较高。建议添加 `confirm('确定删除该用户？所有练习进度将被清除。')` 或自定义确认弹窗。

---

## 汇总

| 级别 | 数量 | 说明 |
|------|------|------|
| CRITICAL | 0 | — |
| HIGH | 0 | — |
| MEDIUM | 1 | 异步保存未 await |
| LOW | 5 | 重复头像、删除后 store 未刷新、非原子写入、无效导航项、无确认删除 |

**MEDIUM-1 建议修复**：异步保存未 await 是数据丢失隐患。LOW 级问题可按优先级处理。

**整体评价**：多用户系统架构设计合理，用户数据隔离到位（userProgress.{userId}），数据迁移覆盖 v1→v2→v3 全路径。新增的侧边栏布局、评级系统、Tab 难度切换等功能实现完整。
