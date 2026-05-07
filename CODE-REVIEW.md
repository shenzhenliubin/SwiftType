# SwiftType 代码审查报告

**审查日期**: 2026-04-22
**审查范围**: 所有已存在的源代码文件
**项目阶段**: Phase 0（项目初始化）

---

## 一、做得好的地方

1. **Electron 安全配置到位** — `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, `webSecurity: true` 四项关键安全设置全部正确开启
2. **Preload 脚本设计规范** — 只暴露了最小必要的 API，没有泄露任何 Node.js 能力到渲染进程
3. **CSP 策略合理** — `index.html` 中的 Content-Security-Policy 头配置正确限制了 `default-src 'self'`
4. **分层架构清晰** — 主进程 / 预加载 / 渲染进程的职责分离做得好，数据通过 IPC 桥接
5. **CSS 变量系统完整** — 变量定义完备、语义清晰，包含热力图、手指颜色等儿童应用特有的视觉元素
6. **Fisher-Yates 洗牌算法** — 实现正确，且没有修改原数组（不可变风格）

---

## 二、严重问题 (CRITICAL) — 4项

### C-1. word/sentence/article 类型序列生成与单字符比较逻辑不匹配

**文件**: `src/renderer/src/composables/usePractice.js` 第 101-114 行

**问题**: 对于 `word` 类型（关卡10），`practiceSequence` 的每个元素是一个完整的单词（如 `"the"`），而不是单个字符。但 `handleInput()` 在第 163 行执行 `inputContent === expected` 的比较，其中 `expected` 来自 `practiceSequence[currentIndex]`，即完整的单词。

用户按一次键（单个字母），与完整单词比较，永远不可能正确。`sentence` 和 `article` 类型同理。`comprehensive` 类型中的 `word` 和 `sentence` 分支也存在完全相同的问题（第 124-133 行）。

**影响**: 关卡 10-13 完全无法使用，用户每次按键都会被判为错误。

**修复建议**: 将 word/sentence/article 类型的文本拆分为逐字符序列，或将 `handleInput` 改为支持多字符输入的逐字符匹配模式。

---

### C-2. useStorage.js 直接修改从 store 获取的对象

**文件**: `src/renderer/src/composables/useStorage.js` 第 48-54 行

```javascript
async function updateLetterStats(letter, isCorrect) {
    const stats = await window.swifttypeAPI.getStore('letterStats') || {}
    // ...
    stats[letter].total++    // 直接修改了从 store 取出的对象
    if (isCorrect) stats[letter].correct++
    await window.swifttypeAPI.setStore('letterStats', stats)
}
```

同样的问题出现在 `updateLevelComplete`（第 33-43 行）和 `updatePracticeTime`（第 69-70 行）中。

**影响**: 违反不可变性原则，重构时容易引入 bug。

**修复建议**: 创建新对象再写回 store，如 `const newStats = { ...stats, [letter]: { ...stats[letter], total: stats[letter].total + 1 } }`。

---

### C-3. fingerMap 和 getFingerForLetter() 完全重复定义

**文件**:
- `src/renderer/src/data/fingerMap.js`
- `src/renderer/src/data/keyboardLayout.js` 第 83-103 行

**问题**: 两个文件中包含完全相同的 `fingerMap` 对象和 `getFingerForLetter` 函数。

**影响**: 未来如果只修改了其中一个文件，会导致手指映射数据不一致。

**修复建议**: 删除 `keyboardLayout.js` 中重复的 `fingerMap` 和 `getFingerForLetter`，改为从 `fingerMap.js` 导入。

---

### C-4. completePractice() 被双重调用

**文件**: `src/renderer/src/composables/usePractice.js` 第 202-209 行

**问题**: `usePractice.js` 的 `nextContent()` 方法在索引超出范围时调用 `completePractice()` 设置了 `isComplete.value = true`。Practice.vue 在 `onKeyPress` 中又手动检查序列长度来触发 `onComplete()`，导致完成逻辑分散在两处。

**影响**: 双重调用模式容易在未来引入 bug，违反单一职责原则。

**修复建议**: 统一完成逻辑入口，由 `usePractice` 内部通过 `watch(isComplete)` 或回调通知外部，Practice.vue 不再自行判断。

---

## 三、高级问题 (HIGH) — 5项

### H-1. useKeyboardInput.js 输入过滤正则不支持高关卡所需字符

**文件**: `src/renderer/src/composables/useKeyboardInput.js` 第 35 行

```javascript
if (!/[A-Z;]/.test(key)) return
```

**问题**: 关卡 10-13 需要输入空格、句号、逗号等字符，但这个正则只允许 A-Z 和分号通过。关卡 6 的字母包含 `.`，关卡 7 包含 `,`。空格键也会被过滤，导致 word/sentence/article 类型的练习完全无法输入空格。

**修复建议**: 根据当前关卡类型动态调整允许的字符范围，或扩展正则为 `/[A-Z;\s.,]/`。

---

### H-2. useSound.js 在模块顶层创建 Audio 对象，且音频文件不存在

**文件**: `src/renderer/src/composables/useSound.js` 第 26-27 行

```javascript
const correctSound = new Audio(getSoundPath('correct'))
const errorSound = new Audio(getSoundPath('error'))
```

**问题**:
1. 每次调用 `useSound()` composable 都会创建新的 Audio 实例，不复用，可能导致内存泄漏
2. `getSoundPath()` 内部创建了一个只用于格式检测的 `Audio` 对象然后丢弃
3. `public/sounds/` 目录为空，Audio 对象加载必然失败

**修复建议**: 将 Audio 实例缓存为单例，使用懒加载模式，并添加占位音频文件。

---

### H-3. restReminder 默认值在主进程与渲染进程之间不一致

**文件**:
- `src/main/index.js` 第 19 行: `restReminder: false`
- `src/renderer/src/stores/settings.js` 第 21 行: `restReminderEnabled = ref(true)`

**问题**: 主进程 electron-store 默认值设为 `false`，而渲染进程 Pinia store 默认值设为 `true`。加载前会短暂显示错误状态。

**修复建议**: 统一默认值为 `true`（主进程 index.js 中也应设为 `true`）。

---

### H-4. 解锁条件基于历史最高正确率（Math.max）

**文件**: `src/renderer/src/data/levels.js` 第 153 行

**问题**: `updateLevelComplete` 中取 `Math.max(existing.accuracy || 0, accuracy)` 存储历史最高正确率。这意味着如果用户第一次以 90% 完成关卡，后来以 75% 重新完成，解锁条件仍然满足。需确认这是否符合预期。

---

### H-5. useKeyboardInput.js 缺少 event.preventDefault()

**文件**: `src/renderer/src/composables/useKeyboardInput.js` 第 27-38 行

**问题**: `handleKeydown` 函数没有调用 `event.preventDefault()`。在 Electron 中，按键可能触发浏览器默认行为（如 Tab 切换焦点、空格滚动页面等）。

**修复建议**: 对已处理的按键调用 `event.preventDefault()`。

---

## 四、中级问题 (MEDIUM) — 8项

### M-1. completePractice() 返回值未被使用

**文件**: `src/renderer/src/composables/usePractice.js` 第 213 行

**问题**: `completePractice()` 函数返回了结果对象，但在 `nextContent()` 中（第 206 行）调用时返回值未被使用。Practice.vue 需要单独再次调用 `completePractice()` 获取结果。

---

### M-2. letter 类型混合部分多余的 shuffle 操作

**文件**: `src/renderer/src/composables/usePractice.js` 第 94-97 行

```javascript
const mixed = []
for (let i = 0; i < 20; i++) {
    mixed.push(letters[Math.floor(Math.random() * letters.length)])
}
practiceSequence.value = [...single, ...shuffleArray(mixed)]
```

**问题**: `mixed` 数组已经通过 `Math.random()` 随机生成了，再对它做 `shuffleArray` 是多余的操作。

---

### M-3. generateRandomLetters 和 randomLetter 重复辅助函数

**文件**: `src/renderer/src/composables/usePractice.js` 第 145-158 行

**问题**: `generateRandomLetters(count)` 本质上就是调用 `count` 次 `randomLetter()`，但两个函数都独立实现了字母表字符串。

**修复建议**: 合并为一个函数，`randomLetter` 内部调用 `generateRandomLetters(1)[0]` 或反过来。

---

### M-4. Keyboard.vue 所有手指使用相同图标

**文件**: `src/renderer/src/components/Keyboard.vue` 第 102-115 行

**问题**: `getFingerIcon` 函数对所有手指都返回相同的图标，失去了"手指提示"的意义。

**修复建议**: 为不同手指使用不同图标，至少区分左右手。

---

### M-5. keyboard.css 和 Key.vue scoped style 大量样式重复

**文件**:
- `src/renderer/styles/keyboard.css`
- `src/renderer/src/components/Key.vue` scoped style

**问题**: `Key.vue` 的 scoped style 几乎完全复制了 `keyboard.css` 中的所有样式（高亮、闪烁、热力图、手指颜色、宽度变体、shake 动画）。

**修复建议**: 选择其中一种方式——要么使用全局 CSS，要么只在组件 scoped style 中定义。

---

### M-6. progress.js store 中 updateLetterStats 直接修改 ref 内部属性

**文件**: `src/renderer/src/stores/progress.js` 第 92-96 行

```javascript
letterStats.value[letter].total++
if (isCorrect) letterStats.value[letter].correct++
```

**问题**: 直接修改了 `letterStats` ref 内部的对象属性，违反不可变性原则。

**修复建议**: 创建新对象替换整个 `letterStats.value`。

---

### M-7. Home.vue 重复调用 loadProgress()

**文件**: `src/renderer/src/components/Home.vue` 第 83-85 行

**问题**: `App.vue` 的 `onMounted` 中已经调用了 `progressStore.loadProgress()`，`Home.vue` 又在自己的 `onMounted` 中再次调用，导致不必要的重复 IPC 请求。

**修复建议**: 删除 `Home.vue` 中的 `loadProgress()` 调用，依赖 App.vue 的全局加载。

---

### M-8. comprehensive 类型序列中元素粒度不一致

**文件**: `src/renderer/src/composables/usePractice.js` 第 119-135 行

**问题**: `comprehensive` 类型生成的序列中，`letter` 分支放入单字符，`word` 分支放入完整单词，`sentence` 分支放入完整句子。同一个序列中混合了不同粒度的元素，`handleInput` 的单字符比较逻辑无法正确处理。

---

## 五、低级问题 / 建议 (LOW) — 6项

### L-1. App.vue 生产代码中使用 console.log

**文件**: `src/renderer/src/App.vue` 第 57 行

**建议**: 移除 `console.log`，或替换为条件编译的调试日志。

---

### L-2. formatTime 不处理负数和非整数输入

**文件**: `src/renderer/src/utils/formatTime.js`

**建议**: 增加输入校验，对负数返回 `0秒`，对浮点数使用 `Math.floor` 或 `Math.round`。

---

### L-3. getLevel() 使用 find 而非索引查找

**文件**: `src/renderer/src/data/levels.js` 第 148-150 行

**说明**: `levels` 数组中 `id` 与数组索引一致，`find()` 的 O(n) 可以改为 O(1) 的 `levels[id]`。当前 14 个元素性能影响可忽略。

---

### L-4. Keyboard.vue v-for 中 ref 回调可能存储数组

**文件**: `src/renderer/src/components/Keyboard.vue` 第 19 行

**说明**: 如果未来键盘中出现重复字符（如两个 Shift），`el` 可能是数组，需要处理。

---

### L-5. playwright.config.js 缺少 Electron 启动配置

**文件**: `playwright.config.js`

**说明**: `projects[0].use` 为空对象 `{}`，缺少必要的 Electron fixture 配置。属于 Phase 2 的工作。

---

### L-6. fingerNames.js 建议合并到 fingerMap.js

**说明**: `fingerNames.js` 和 `fingerMap.js` 都描述手指相关数据，合并后可减少文件数量，提升内聚性。

---

## 六、架构评估

### 整体架构合理性: 良好

Electron 三层架构标准规范，安全配置到位。Pinia store 作为渲染进程的状态管理中心，通过 `useStorage` composable 与 IPC 通信，数据流方向清晰。

### 需要改进的架构方面

1. **usePractice composable 职责过重** — 同时负责序列生成、输入处理、正确率计算、解锁判定、鼓励机制。建议拆分为 `sequenceGenerator` 和 `practiceSession` 两个关注点。
2. **缺少类型系统** — 整个项目使用纯 JavaScript，关卡数据结构、store 状态、IPC 消息等都没有类型约束。建议至少添加 JSDoc 类型注释。
3. **IPC 无验证** — 主进程的 IPC 处理器没有对传入的 key 和 value 做任何校验，恶意或错误的渲染进程调用可能破坏存储数据。

---

## 七、问题汇总表

| 编号 | 严重性 | 文件 | 简述 |
|------|--------|------|------|
| C-1 | CRITICAL | `usePractice.js` | word/sentence/article 类型序列与单字符比较不匹配 |
| C-2 | CRITICAL | `useStorage.js` | 直接修改从 store 获取的对象 |
| C-3 | CRITICAL | `fingerMap.js` + `keyboardLayout.js` | fingerMap 数据和函数完全重复 |
| C-4 | CRITICAL | `Practice.vue` + `usePractice.js` | 完成逻辑双重调用 |
| H-1 | HIGH | `useKeyboardInput.js` | 输入过滤正则不支持空格、句号等高关卡字符 |
| H-2 | HIGH | `useSound.js` | Audio 实例管理问题，音频文件不存在 |
| H-3 | HIGH | `settings.js` + `index.js` | restReminder 默认值不一致 |
| H-4 | HIGH | `levels.js` | 解锁条件基于历史最高正确率 |
| H-5 | HIGH | `useKeyboardInput.js` | 缺少 event.preventDefault() |
| M-1 | MEDIUM | `usePractice.js` | completePractice() 返回值未使用 |
| M-2 | MEDIUM | `usePractice.js` | 已随机数组再 shuffle 多余 |
| M-3 | MEDIUM | `usePractice.js` | generateRandomLetters 和 randomLetter 重复 |
| M-4 | MEDIUM | `Keyboard.vue` | 所有手指使用相同图标 |
| M-5 | MEDIUM | `keyboard.css` + `Key.vue` | CSS 样式大量重复 |
| M-6 | MEDIUM | `progress.js` | 直接修改 ref 内部属性 |
| M-7 | MEDIUM | `Home.vue` | 重复调用 loadProgress() |
| M-8 | MEDIUM | `usePractice.js` | comprehensive 类型序列粒度不一致 |
| L-1 | LOW | `App.vue` | 生产代码 console.log |
| L-2 | LOW | `formatTime.js` | 不处理负数和浮点数 |
| L-3 | LOW | `levels.js` | getLevel() 可用索引优化 |
| L-4 | LOW | `Keyboard.vue` | v-for ref 可能存储数组 |
| L-5 | LOW | `playwright.config.js` | 缺少 Electron 启动配置 |
| L-6 | LOW | 项目结构 | fingerNames.js 建议合并 |

---

## 八、修复优先级

### 必须立即修复（阻塞核心功能）

1. **C-1** — 修复 word/sentence/article 的序列生成逻辑
2. **H-1** — 动态调整键盘输入过滤规则
3. **C-3** — 删除重复的 fingerMap 定义

### 应尽快修复

4. **C-4** — 统一完成逻辑入口
5. **H-2** — 音效文件缺失 + Audio 实例管理
6. **H-3** — 统一 restReminder 默认值
7. **H-5** — 添加 event.preventDefault()

### 后续迭代中修复

8. **C-2** — useStorage 不可变性
9. **M-1 ~ M-8** — 中级问题
10. **L-1 ~ L-6** — 低级问题
