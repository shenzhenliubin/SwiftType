# SwiftType 代码审查反馈

**反馈日期**: 2026-04-22
**反馈人**: Review Agent
**依据**: CODE-REVIEW.md + 源代码验证

---

## 一、CRITICAL 问题反馈

### C-1. word/sentence/article 类型序列与单字符比较不匹配

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `usePractice.js` 第101-103行：`word` 类型 `practiceSequence` 存入的是完整单词（如 `"the"`）
- `usePractice.js` 第106-113行：`sentence`/`article` 类型存入的是完整句子/文章
- `usePractice.js` 第163行：`handleInput` 执行 `inputContent === expected`，用户按单个键与完整单词比较

**确认影响**: 关卡 10-13 完全无法使用。

**修复建议**:

word 类型：不需要拆分为逐字符。应将 `handleInput` 改为支持逐字符匹配模式——当序列元素是多字符时，用户需要按顺序输入每个字符。

```javascript
// 方案：将 word/sentence/article 拆分为字符级序列
case 'word':
  // 将每个单词拆为字符序列，单词间插入空格
  const chars = []
  level.value.words.forEach(word => {
    word.split('').forEach(c => chars.push(c.toUpperCase()))
    chars.push(' ')  // 单词间空格
  })
  practiceSequence.value = chars.slice(0, -1)  // 去掉最后多余的空格
  break
```

sentence/article 同理。`comprehensive` 中 word/sentence 分支也需要同样处理。

---

### C-2. useStorage.js 直接修改从 store 获取的对象

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `useStorage.js` 第48-53行：`stats` 直接被修改
- `useStorage.js` 第33-43行：`levels` 直接被修改
- `useStorage.js` 第69-70行：`totalTime` 直接被修改

但有一个重要上下文：**electron-store 的 `store.get()` 返回的是 JSON 反序列化后的新对象**，每次调用都会创建新副本。因此这里的"修改"实际上不会影响 store 内部的数据——因为它是副本，最后通过 `setStore` 写回的是新的 JSON 序列化结果。

**结论**: 逻辑上没有 bug，但违反了不可变性编码规范。仍然建议修复，保持代码风格一致性。

**修复建议**: 采用展开运算符创建新对象：

```javascript
async function updateLetterStats(letter, isCorrect) {
  const stats = await window.swifttypeAPI.getStore('letterStats') || {}
  const current = stats[letter] || { total: 0, correct: 0 }
  const newStats = {
    ...stats,
    [letter]: {
      total: current.total + 1,
      correct: current.correct + (isCorrect ? 1 : 0)
    }
  }
  await window.swifttypeAPI.setStore('letterStats', newStats)
}
```

---

### C-3. fingerMap 和 getFingerForLetter() 完全重复定义

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `fingerMap.js` 第4-13行：定义了 `fingerMap` 对象
- `fingerMap.js` 第16-24行：定义了 `getFingerForLetter` 函数
- `keyboardLayout.js` 第83-103行：**完全相同**的 `fingerMap` 和 `getFingerForLetter`

更严重的是，`usePractice.js` 从 `fingerMap.js` 导入，而 `Keyboard.vue` 从 `keyboardLayout.js` 导入。如果只修改了其中一个，会导致行为不一致。

**修复建议**: 删除 `keyboardLayout.js` 中的重复定义（第82-103行），改为从 `fingerMap.js` 导入。

---

### C-4. completePractice() 被双重调用

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `usePractice.js` 第202-209行：`nextContent()` 中调用 `completePractice()` 设置 `isComplete = true`
- `Practice.vue` 第133-136行：手动检查 `currentIndex >= practiceSequence.length` 后调用 `onComplete()`
- `Practice.vue` 第139-148行：`onComplete()` 中再次调用 `completePractice()`

**实际影响**: `completePractice()` 第213行设置 `isComplete = true`，第214-224行计算统计数据并返回。第二次调用时 `startTime` 未变，统计数据也未重置，所以返回值相同。不会导致数据错误，但确实逻辑混乱。

**修复建议**: 使用 `watch(isComplete)` 替代 Practice.vue 的手动检查：

```javascript
// Practice.vue 中替代手动检查
watch(isComplete, (val) => {
  if (val) {
    const result = completePractice()
    progressStore.updateLevelComplete(result.levelId, result.accuracy, result.time)
    progressStore.updatePracticeTime(result.time)
    emit('complete', result)
  }
})
```

并删除 Practice.vue 第133-136行的手动检查。

---

## 二、HIGH 问题反馈

### H-1. useKeyboardInput.js 输入过滤正则不支持高关卡字符

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `useKeyboardInput.js` 第35行：`/[A-Z;]/` 只允许大写字母和分号
- 产品设计要求：关卡6包含 `.`，关卡7包含 `,`，关卡10+需要空格
- `event.key.toUpperCase()` 对空格返回 `' '`（空格），正则不会匹配

**修复建议**: 动态过滤，根据当前关卡类型调整允许的字符：

```javascript
function handleKeydown(event) {
  if (!isActive.value) return

  const key = event.key

  // 关卡类型决定允许的字符
  // letter/tutorial: A-Z 和 ;
  // word/sentence/article/comprehensive: A-Z, ;, 空格, ., ,, !, ? 等
  const allowedPattern = allowAllChars ? /[A-Z;\s.,!?']/i : /[A-Z;]/i

  if (!allowedPattern.test(key)) return

  const processedKey = key === ' ' ? ' ' : key.toUpperCase()
  lastKey.value = processedKey
  onInput(processedKey)
}
```

---

### H-2. useSound.js Audio 实例管理问题

**反馈结果**: ✅ **部分接受**

**验证结果**:

1. **"每次调用 useSound() 都会创建新的 Audio 实例"** — 问题属实。第26-27行在函数体内创建实例，每次调用 `useSound()` 都会创建新的。
   
2. **"getSoundPath() 内部创建 Audio 对象然后丢弃"** — 问题属实。第20行创建临时 Audio 对象用于格式检测，可以缓存。

3. **"public/sounds/ 目录为空"** — 属实，但这是 Phase 0 状态，音效文件应在 Phase 1 前添加。

**修复建议**: 将 Audio 实例和格式检测结果缓存为模块级变量：

```javascript
// 模块级缓存（单例模式）
let _canMp3 = null
let _correctSound = null
let _errorSound = null

function canPlayMp3() {
  if (_canMp3 === null) {
    _canMp3 = new Audio().canPlayType('audio/mpeg') !== ''
  }
  return _canMp3
}

export function useSound() {
  if (!_correctSound) {
    _correctSound = new Audio(canPlayMp3() ? '/sounds/correct.mp3' : '/sounds/correct.ogg')
    _errorSound = new Audio(canPlayMp3() ? '/sounds/error.mp3' : '/sounds/error.ogg')
    _correctSound.load()
    _errorSound.load()
  }
  // ...
}
```

---

### H-3. restReminder 默认值在主进程与渲染进程之间不一致

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `src/main/index.js` 第19行：`restReminder: false`
- `src/renderer/src/stores/settings.js` 第21行：`restReminderEnabled = ref(true)`
- `settings.js` 第34行加载时使用 `?? true`，如果 store 返回 `false`，会被正确覆盖

实际影响：首次加载时，electron-store 默认 `false`，但 Pinia store 初始值为 `true`。由于 `loadSettings` 在 `onMounted` 中异步调用，渲染进程会短暂显示 `true` 然后变为 `false`。

**修复建议**: 统一默认值。产品设计文档第387行说 `restReminder: false`，应保持 `false`：

```javascript
// settings.js 第21行
const restReminderEnabled = ref(false)  // 与主进程默认值一致
```

---

### H-4. 解锁条件基于历史最高正确率（Math.max）

**反馈结果**: ⚠️ **建议修改为取最近一次正确率**

**验证结果**: 问题属实。

- `useStorage.js` 第38行：`accuracy: Math.max(existing.accuracy || 0, accuracy)`
- `progress.js` 第80行：同样的 `Math.max` 逻辑

**分析**: 产品设计文档第644行说"正确率达到目标值"，但没有明确是取历史最高还是最近一次。从教育角度看，取历史最高合理——孩子曾经达到过 80%，说明掌握了技能。但从激励角度看，如果孩子后来退步了，关卡仍然保持解锁状态，可能不合适。

**建议**: 保持 `Math.max`（历史最高），但在结果页面同时显示本次正确率。这样既认可了孩子的历史成就，又展示了当前水平。

---

### H-5. useKeyboardInput.js 缺少 event.preventDefault()

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `useKeyboardInput.js` 第27-38行：`handleKeydown` 没有调用 `event.preventDefault()`
- 在 Electron 中，空格键会触发按钮点击/页面滚动，Tab 会切换焦点

**修复建议**: 对已处理的按键调用 `preventDefault()`：

```javascript
function handleKeydown(event) {
  if (!isActive.value) return
  const key = event.key.toUpperCase()
  if (!/[A-Z;]/.test(key)) return

  event.preventDefault()  // 阻止默认行为

  lastKey.value = key
  onInput(key)
}
```

---

## 三、MEDIUM 问题反馈

### M-1. completePractice() 返回值未被使用

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `usePractice.js` 第206行：`completePractice()` 返回值被忽略
- `Practice.vue` 第140行：再次调用 `completePractice()` 获取结果

这与 C-4 是同一个问题的不同表现。

---

### M-2. letter 类型混合部分多余的 shuffle 操作

**反馈结果**: ⚠️ **不接受**

**理由**: 虽然逻辑上 `Math.random()` 已经是随机的，但 `shuffleArray` 的作用不仅仅是随机化，还确保了**字母分布更均匀**。纯 `Math.random()` 可能连续出现相同字母（如 5 个 E），而 `shuffleArray`（Fisher-Yates）会打乱顺序，使得相邻字母不同。

对儿童学习体验来说，**混合练习中相邻字母不同**是有价值的——避免孩子在某个字母上连续输入形成短时记忆而非真正的肌肉记忆。

**结论**: 保留 `shuffleArray`，不做修改。

---

### M-3. generateRandomLetters 和 randomLetter 重复辅助函数

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `usePractice.js` 第145-152行：`generateRandomLetters(count)`
- `usePractice.js` 第155-158行：`randomLetter()`
- 两个函数都独立定义了 `'ABCDEFGHIJKLMNOPQRSTUVWXYZ'` 字符串

**修复建议**: 合并：

```javascript
const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomLetter() {
  return ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
}

function generateRandomLetters(count) {
  return Array.from({ length: count }, () => randomLetter())
}
```

---

### M-4. Keyboard.vue 所有手指使用相同图标

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `Keyboard.vue` 第102-115行：所有手指都返回 `'👆'`

**说明**: 这可能是占位实现（Phase 0 阶段）。但审查建议是合理的——至少区分左右手。

**修复建议**:

```javascript
function getFingerIcon(finger) {
  if (!finger) return ''
  const icons = {
    'left-pinky': '👈',    // 左手小指
    'left-ring': '👈',     // 左手无名指
    'left-middle': '👈',   // 左手中指
    'left-index': '👈',    // 左手食指
    'right-index': '👉',   // 右手食指
    'right-middle': '👉',  // 右手中指
    'right-ring': '👉',    // 右手无名指
    'right-pinky': '👉'    // 右手小指
  }
  return icons[finger] || ''
}
```

---

### M-5. keyboard.css 和 Key.vue scoped style 样式重复

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。两种样式来源同时存在，可能导致样式冲突。

**修复建议**: 选择其中一种方式。推荐保留 scoped style（组件内聚），删除 `keyboard.css` 中重复的部分，只在 `keyboard.css` 中保留布局相关的基础样式。

---

### M-6. progress.js store 中 updateLetterStats 直接修改 ref 内部属性

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `progress.js` 第92-96行：直接修改 `letterStats.value[letter].total`

与 C-2 同类问题。Vue 的响应式系统对直接属性修改可以检测到变化，但违反不可变性原则。

**修复建议**:

```javascript
async function updateLetterStats(letter, isCorrect) {
  await storage.updateLetterStats(letter, isCorrect)

  const current = letterStats.value[letter] || { total: 0, correct: 0 }
  letterStats.value = {
    ...letterStats.value,
    [letter]: {
      total: current.total + 1,
      correct: current.correct + (isCorrect ? 1 : 0)
    }
  }
}
```

---

### M-7. Home.vue 重复调用 loadProgress()

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。

- `App.vue` 第83-84行：`onMounted` 中调用 `progressStore.loadProgress()`
- `Home.vue` 第83-84行：`onMounted` 中又调用 `progressStore.loadProgress()`

**注意**: 由于 Vue 的组件生命周期，App.vue 的 `onMounted` 先于 Home.vue 的 `onMounted` 执行，但两者都是异步的。第二次调用会导致额外的 IPC 请求。

**修复建议**: 删除 `Home.vue` 第83-84行的 `loadProgress()` 调用。

---

### M-8. comprehensive 类型序列中元素粒度不一致

**反馈结果**: ✅ **接受**

**验证结果**: 问题属实。与 C-1 是同一类问题的不同表现。

`comprehensive` 类型（第119-135行）中：
- `letter` 分支放入单字符
- `word` 分支放入完整单词
- `sentence` 分支放入完整句子

**修复建议**: 与 C-1 一并修复，所有多字符类型都拆分为字符级序列。

---

## 四、LOW 问题反馈

### L-1. App.vue 生产代码中使用 console.log

**反馈结果**: ✅ **接受**

**验证结果**: `App.vue` 第57行确实有 `console.log('关卡选择功能将在 Phase 2 实现')`。

**修复建议**: 移除或改为注释。

---

### L-2. formatTime 不处理负数和非整数输入

**反馈结果**: ✅ **接受**

**验证结果**: 合理建议。应添加输入校验。

---

### L-3. getLevel() 使用 find 而非索引查找

**反馈结果**: ⚠️ **不建议修改**

**理由**: 虽然当前 `id` 与数组索引一致，但使用 `find()` 更安全——如果未来关卡 ID 不连续（如删除某个关卡），索引查找会出错。O(n) 对 14 个元素的性能影响可忽略。保持 `find()` 更健壮。

---

### L-4. Keyboard.vue v-for 中 ref 回调可能存储数组

**反馈结果**: ✅ **接受**

**说明**: 当前键盘布局中没有重复字符（除了两个 Shift），但未来可能有问题。代码已正确处理了这一点（第64-68行 `setKeyRef` 只存储单个引用），审查报告的担忧不成立。但如果出现重复字符，需要改为存储数组。

**结论**: 当前实现正确，暂不修改，添加注释说明即可。

---

### L-5. playwright.config.js 缺少 Electron 启动配置

**反馈结果**: ✅ **接受**

**说明**: 属于 Phase 2 的工作，当前阶段不修改。记录为待办。

---

### L-6. fingerNames.js 建议合并到 fingerMap.js

**反馈结果**: ⚠️ **暂不接受**

**理由**: 
1. 两个文件职责不同：`fingerMap.js` 定义键位到手指的映射关系，`fingerNames.js` 定义手指的中英文名称。一个是"哪个键用哪个手指"，一个是"手指叫什么名字"。
2. 合并会增加文件复杂度，降低可读性。
3. 当前两个文件各自内聚，符合单一职责原则。

---

## 五、架构建议反馈

### 5.1 usePractice composable 职责过重

**反馈结果**: ✅ **认可这个方向**

**分析**: `usePractice` 确实承担了太多职责（序列生成、输入处理、正确率计算、解锁判定、鼓励机制）。但当前阶段（Phase 1）不建议拆分——代码量还在可控范围内，过早拆分会增加文件间通信复杂度。

**建议**: Phase 2 或 Phase 3 时，当功能稳定后，再考虑拆分为 `sequenceGenerator` + `practiceSession`。

### 5.2 缺少类型系统

**反馈结果**: ✅ **认可**

**说明**: 架构文档已将 TypeScript 列为 Phase 4 待决策项。当前阶段使用 JSDoc 类型注释作为过渡。

### 5.3 IPC 无验证

**反馈结果**: ✅ **接受**

**说明**: 主进程 IPC 处理器确实没有对 key/value 做验证。对于单机儿童应用，风险很低，但添加基本验证是好习惯。

```javascript
// 简单的 key 验证
ipcMain.handle('store:get', (event, key) => {
  if (typeof key !== 'string') throw new Error('Invalid key')
  return store.get(key)
})
```

---

## 六、反馈总结

### 处理结果统计

| 状态 | 数量 | 说明 |
|------|------|------|
| ✅ 完全接受 | 16 | 需要修复 |
| ⚠️ 部分接受/不接受 | 3 | M-2（保留shuffle）、L-3（保留find）、L-6（保持文件分离） |
| 📋 待后续迭代 | 2 | usePractice拆分、TypeScript |

### 修复优先级建议

**必须立即修复（阻塞核心功能）**:
1. C-1 + M-8 + H-1 — word/sentence/article 序列生成 + 键盘输入过滤（这三个问题关联）
2. C-3 — 删除 fingerMap 重复定义

**应尽快修复**:
3. C-4 + M-1 — 统一完成逻辑入口
4. H-2 — 音效单例缓存
5. H-3 — restReminder 默认值统一
6. H-5 — event.preventDefault()

**后续迭代中修复**:
7. C-2 + M-6 — 不可变性修复（useStorage + progress store）
8. M-3 — 合并重复辅助函数
9. M-4 — 手指图标区分
10. M-5 — CSS 样式去重
11. M-7 — 删除 Home.vue 重复 loadProgress
12. L-1 — 移除 console.log
13. L-2 — formatTime 输入校验

---

*反馈完成，等待修复确认*
