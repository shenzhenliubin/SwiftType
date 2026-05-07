# SwiftType 架构设计文档 Review

**Review 日期**: 2026-04-21
**Review 视角**: 架构设计合理性、代码可行性、与产品设计一致性
**Review 目标**: 识别架构设计中的问题、遗漏和风险

---

## 一、总体评价

**文档质量**: ⭐⭐⭐⭐ (优秀)

这份架构设计文档整体质量很高：
- 三层架构图清晰，进程职责边界明确
- 数据流向图完整，便于理解系统运作
- 模块划分合理，依赖关系清晰
- 组件 Props/Events 定义详细
- 项目目录结构规范，命名统一

但仍存在若干需要修复的问题。

---

## 二、关键问题（必须修复）

### 2.1 usePractice 中 generateSequence 逻辑错误

**问题描述**:

第739-756行的 `generateSequence` 函数存在逻辑错误：

```javascript
// 单字母练习：先单字母各10次，后混合
const single = []
level.value.letters.forEach(letter => {
  for (let i = 0; i < 10; i++) single.push(letter)
})
const mixed = shuffleArray(single.slice())  // ❌ 错误：这里复制了整个 single
practiceSequence.value = [...single, ...mixed]  // 结果：30 + 30 = 60，而不是 50
```

**产品设计要求**:
- 单手指关卡：单字母各10次 + 混合20次 = **50次**
- 不是：单字母各10次 + 混合又是30次 = 60次

**正确实现**:

```javascript
function generateSequence() {
  if (level.value.type === 'letter') {
    if (level.value.letters === 'all') {
      // 所有26字母随机（关卡9）
      practiceSequence.value = generateRandomLetters(30)
    } else {
      // 单手指关卡：单字母各10次 + 混合20次 = 50次
      const letters = level.value.letters
      const single = []
      letters.forEach(letter => {
        for (let i = 0; i < 10; i++) single.push(letter)
      })
      // 混合部分：随机取20个，不是复制整个 single
      const mixed = []
      for (let i = 0; i < 20; i++) {
        mixed.push(letters[Math.floor(Math.random() * letters.length)])
      }
      practiceSequence.value = [...single, ...shuffleArray(mixed)]
    }
  }
}
```

**严重程度**: 🔴 **高** - 直接影响练习次数，与产品设计不一致

---

### 2.2 generateSequence 缺少其他关卡类型的处理

**问题描述**:

`generateSequence` 函数只处理了 `letter` 类型，缺少以下类型：

| 缺失类型 | 关卡 | 说明 |
|----------|------|------|
| `word` | 关卡10 | 词组练习，没有生成逻辑 |
| `sentence` | 关卡11 | 短句练习，没有生成逻辑 |
| `article` | 关卡12 | 文章练习，没有生成逻辑 |
| `comprehensive` | 关卡13 | 综合挑战，没有生成逻辑 |
| `tutorial` | 关卡0 | 基准位置教学，没有生成逻辑 |

**建议补充**:

```javascript
function generateSequence() {
  const type = level.value.type
  
  switch (type) {
    case 'tutorial':
      // 关卡0：基准位置，按顺序输入每个键一次
      practiceSequence.value = level.value.letters.slice()
      break
      
    case 'letter':
      // 已有逻辑（修复后）
      break
      
    case 'word':
      // 关卡10：词组练习
      practiceSequence.value = level.value.words.slice()
      break
      
    case 'sentence':
      // 关卡11：句子练习
      practiceSequence.value = level.value.sentences.slice()
      break
      
    case 'article':
      // 关卡12：文章练习，每个文章的字符序列
      const articles = level.value.articles
      practiceSequence.value = articles.map(article => article.split(''))
      break
      
    case 'comprehensive':
      // 关卡13：综合挑战
      const sections = level.value.sections
      const sequence = []
      sections.forEach(section => {
        if (section.type === 'letter') {
          for (let i = 0; i < section.count; i++) {
            sequence.push(randomLetter())
          }
        } else if (section.type === 'word') {
          // 从词库中随机取
        }
        // ...
      })
      practiceSequence.value = sequence
      break
  }
}
```

**严重程度**: 🔴 **高** - 关卡10-13 无法正常工作

---

### 2.3 缺少 preload.js 完整代码

**问题描述**:

架构文档第1040-1042行只描述了 preload.js 的职责：
```
│   │   └── preload.js              # 预加载脚本
│   │                               # - contextBridge.exposeInMainWorld
│   │                               # - 暴露 swifttypeAPI
```

但没有给出完整的代码实现。IPC 通道清单（第979-987行）列出了通道，但没有展示 preload.js 如何暴露这些 API。

**建议补充**:

```javascript
// src/main/preload.js 完整实现

import { contextBridge, ipcRenderer } from 'electron'

/**
 * 暴露给渲染进程的安全 API
 * 所有 API 都通过 IPC 与主进程通信
 */
contextBridge.exposeInMainWorld('swifttypeAPI', {
  // 数据存储操作
  getStore: (key) => ipcRenderer.invoke('store:get', key),
  setStore: (key, value) => ipcRenderer.invoke('store:set', key, value),
  getAllData: () => ipcRenderer.invoke('store:getAll'),
  
  // 应用信息
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // 平台信息（不需要 IPC，preload 可以访问 process）
  getPlatform: () => process.platform
})
```

**严重程度**: 🔴 **高** - 缺少关键代码，无法实现 IPC 通信

---

### 2.4 缺少主进程 index.js 完整代码

**问题描述**:

架构文档第1034-1039行只描述了主进程的职责，但没有给出完整代码：
- BrowserWindow 创建配置缺失
- IPC 处理器缺失
- electron-store 配置缺失
- 安全配置说明缺失

**建议补充**:

```javascript
// src/main/index.js 完整实现（关键部分）

import { app, BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import path from 'path'

// electron-store 配置
const store = new Store({
  name: 'swifttype-data',
  defaults: {
    version: '1.0',
    currentLevel: 0,
    levels: {},
    letterStats: {},
    totalPracticeTime: 0,
    settings: {
      soundEnabled: true,
      restReminder: false,
      restReminderMinutes: 10,
      showHeatmap: true
    }
  }
})

// 创建窗口
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,        // 产品设计要求的最小宽度
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // 安全：必须开启
      nodeIntegration: false,   // 安全：必须关闭
      sandbox: true             // 安全：启用沙箱
    }
  })
  
  mainWindow.loadFile('renderer/index.html')
}

// IPC 处理器
ipcMain.handle('store:get', (event, key) => store.get(key))
ipcMain.handle('store:set', (event, key, value) => store.set(key, value))
ipcMain.handle('store:getAll', () => store.store)
ipcMain.handle('app:getVersion', () => app.getVersion())

// 数据迁移
function migrateData() {
  const version = store.get('version')
  if (!version) {
    store.set('version', '1.0')
  }
}

// 应用生命周期
app.whenReady().then(() => {
  migrateData()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

**严重程度**: 🔴 **高** - 缺少关键代码和安全配置

---

## 三、与产品设计文档的不一致

### 3.1 关卡数据结构字段命名不一致

**产品设计文档**（关卡表）:
```
| ID | 关卡名称 | 练习内容 | 解锁条件 | 目标正确率 |
```

**架构文档**（第236-240行）:
```javascript
unlockCondition: {
  level: 0,                 // 前置关卡 ID
  completed: true           // 完成状态
}
```

**不一致**: 产品设计中关卡0的解锁条件是"默认解锁"，架构文档用 `unlockCondition: null` 表示，但关卡1的解锁条件描述不一致。

产品设计：关卡1解锁条件 = "关卡0完成"
架构文档：关卡1 unlockCondition = `{ level: 0, completed: true }`

**建议**: 保持一致，使用统一的解锁条件描述方式

---

### 3.2 热力图缺少分号 ';' 的处理

**问题描述**:

关卡0包含分号 ';'（右手基准位置），但热力图颜色计算（第407-414行）只处理 A-Z：

```javascript
// 正确率计算公式
accuracy = stats.correct / stats.total

// 颜色映射（只处理字母）
if (stats.total === 0) return '#9E9E9E'
if (accuracy >= 0.9) return '#4CAF50'
if (accuracy >= 0.7) return '#FFC107'
return '#F44336'
```

**问题**: 分号 ';' 不是字母，但关卡0需要练习，热力图应该显示。

**建议**: 扩展热力图支持所有可练习的字符（A-Z 和 ;）

---

### 3.3 统计页面设计缺失

**问题描述**:

产品设计文档第822-828行定义了"家长统计页面"，但架构文档的 Stats.vue（第499-502行）只列出了基本结构：

```
│   ├── Stats.vue (统计页面)
│   │   ├── 总练习时间
│   │   ├── 关卡进度概览
│   │   └── 字母正确率图表
```

缺少：
- 正确率趋势图表的实现方式
- 统计数据的聚合逻辑

**建议补充**: Stats.vue 的详细设计或说明这是后续版本功能

---

## 四、设计细节缺失

### 4.1 缺少 electron.vite.config.mjs 配置内容

**问题描述**:

项目结构第1027行提到了 `electron.vite.config.mjs`，但没有给出配置内容。

electron-vite 的配置影响：
- 主进程、预加载脚本、渲染进程的分离构建
- 开发环境热重载
- 生产环境打包优化

**建议补充**:

```javascript
// electron.vite.config.mjs
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['electron', 'electron-store']
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer/src')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/renderer/index.html')
        }
      }
    }
  }
})
```

---

### 4.2 缺少错误边界组件的实现

**问题描述**:

架构文档列出了 ErrorBoundary.vue（第130行、第467行），但没有给出实现代码。

Vue 3 的错误边界实现需要特殊处理：

```vue
<!-- renderer/src/components/ErrorBoundary.vue -->
<template>
  <div v-if="error" class="error-container">
    <h2>出错了</h2>
    <p>请重启应用，如果问题持续请联系开发者</p>
    <button @click="resetError">重试</button>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

onErrorCaptured((err, instance, info) => {
  error.value = err
  console.error('Vue Error:', err, info)
  return false  // 阻止错误继续向上传播
})

function resetError() {
  error.value = null
}
</script>
```

---

### 4.3 缺少测试配置文件内容

**问题描述**:

项目结构第1028-1029行提到了配置文件：
```
├── vitest.config.js                # Vitest 单元测试配置
├── playwright.config.js            # Playwright E2E测试配置
```

但没有给出配置内容。

**建议补充**:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src')
    }
  }
})

// playwright.config.js
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'electron',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true
  }
})
```

---

### 4.4 组件 Props 使用 TypeScript 风格注释但项目不使用 TypeScript

**问题描述**:

第515-528行等 Props/Events 定义使用了 TypeScript 风格的类型注释：

```javascript
props: {
  levelId: Number              // 当前关卡 ID
}

events: {
  complete: {                  // 完成关卡
    levelId: Number,
    accuracy: Number,
    time: Number
  }
}
```

**问题**: 项目没有使用 TypeScript（技术决策第1228行标注为"可选建议"），这种伪类型注释可能导致混淆。

**建议**: 
- 方案1：使用 Vue 的 PropTypes 进行运行时验证
- 方案2：添加 TypeScript 支持（这是 Review 建议）

```javascript
// 方案1：使用 PropTypes
props: {
  levelId: {
    type: Number,
    required: true
  }
}

// 方案2：TypeScript（推荐）
interface PracticeProps {
  levelId: number
}
```

---

## 五、代码示例问题

### 5.1 useSound 的音效导入语法问题

**问题描述**:

第922-925行使用了 Vite 的 `?url` 后缀导入：

```javascript
import correctMp3 from '@/assets/sounds/correct.mp3?url'
```

**问题**: 
- 这种语法需要确认 electron-vite 是否支持
- 双格式备选的逻辑可能需要调整

**建议**: 确认 electron-vite 的静态资源处理方式，或使用 public 目录：

```javascript
// 使用 public 目录（更可靠）
const correctSound = new Audio('/sounds/correct.mp3')
const errorSound = new Audio('/sounds/error.mp3')

// 双格式支持
function getSoundPath(name) {
  const canMp3 = new Audio().canPlayType('audio/mpeg') !== ''
  return canMp3 ? `/sounds/${name}.mp3` : `/sounds/${name}.ogg`
}
```

---

### 5.2 usePractice 缺少字母统计更新逻辑

**问题描述**:

第778行调用了 `updateLetterStats`，但这个函数在 usePractice 中没有定义：

```javascript
// 更新字母统计
updateLetterStats(expected, isCorrect)  // ❌ 函数未定义
```

**建议**: 明确字母统计的更新时机：
- 在 usePractice 中调用 useStorage？
- 还是通过 Pinia Store？
- 还是返回结果后由 Practice.vue 调用？

```javascript
// 方案：返回统计信息，让调用者处理
function handleInput(inputLetter) {
  // ...
  return {
    letter: expected,
    isCorrect
  }
}

// Practice.vue 中处理统计
function onInputResult(result) {
  progressStore.updateLetterStats(result.letter, result.isCorrect)
}
```

---

### 5.3 缺少连续正确鼓励机制的实现

**问题描述**:

产品设计要求连续正确5次显示"继续加油"，连续正确10次显示"太棒了"。

但 usePractice 中只有 `consecutiveErrors`（连续错误），没有 `consecutiveCorrects`（连续正确）：

```javascript
const consecutiveErrors = ref(0)             // 连续错误次数
// ❌ 缺少 consecutiveCorrects
```

**建议补充**:

```javascript
const consecutiveCorrects = ref(0)

function handleInput(inputLetter) {
  if (isCorrect) {
    consecutiveCorrects.value++
    consecutiveErrors.value = 0
    
    // 连续正确5次 → "继续加油"
    if (consecutiveCorrects.value === 5) {
      showEncouragement('继续加油！')
    }
    // 连续正确10次 → "太棒了"
    if (consecutiveCorrects.value === 10) {
      showEncouragement('太棒了！')
      consecutiveCorrects.value = 0  // 重置
    }
  } else {
    consecutiveErrors.value++
    consecutiveCorrects.value = 0
  }
}
```

---

## 六、架构设计建议

### 6.1 建议添加 TypeScript 支持

**理由**:
1. 儿童应用稳定性很重要，类型安全可以减少运行时错误
2. Props/Events 定义已经在使用伪类型注释
3. 数据结构复杂，TypeScript 可以帮助维护
4. Vue 3 + TypeScript 支持良好

**建议时机**: Phase 4 或后续版本

---

### 6.2 建议使用 Vue Router 替代条件渲染

**当前设计**（第612-644行）:
- 使用条件渲染切换页面：`v-if="currentPage === 'home'"`

**问题**:
- 虽然页面数量少（6个），但条件渲染有以下缺点：
  - 每次切换都重新渲染组件
  - 无法保持组件状态（如练习进度）
  - URL 不变，无法通过 URL 恢复状态

**建议**: 
- 保持当前设计（满足 MVP 需求）
- 后续版本考虑 Vue Router（如果页面增多或需要 URL 状态）

---

### 6.3 建议添加日志系统

**理由**: 
- 儿童应用需要快速定位问题
- IPC 通信失败需要日志记录
- 家长可能需要查看使用情况

**建议**:

```javascript
// src/main/logger.js
import { app } from 'electron'
import fs from 'fs'
import path from 'path'

const logPath = path.join(app.getPath('userData'), 'swifttype.log')

export function log(level, message, data = null) {
  const timestamp = new Date().toISOString()
  const entry = { timestamp, level, message, data }
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n')
}
```

---

## 七、Review 总结

### 问题优先级分类

| 优先级 | 问题数量 | 说明 |
|--------|----------|------|
| 🔴 高 | 4 | generateSequence逻辑错误、缺少关卡类型处理、缺少preload.js代码、缺少主进程代码 |
| 🟡 中 | 7 | 数据结构不一致、热力图缺少分号、配置文件内容缺失、错误边界缺失 |
| 🟢 低 | 5 | TypeScript建议、Vue Router建议、日志系统建议 |

### 必须修复的问题

1. **修复 generateSequence 逻辑**（最高优先）
2. **补充所有关卡类型的处理逻辑**
3. **补充 preload.js 完整代码**
4. **补充主进程 index.js 完整代码**
5. **补充 electron.vite.config.mjs 配置**
6. **补充测试配置文件内容**

---

## 八、与技术调研文档的关系

**修正说明**: 

架构文档已经修正了技术调研文档中的关键问题：
- ✅ electron-store 使用 preload.js + IPC（技术调研错误）
- ✅ 明确了进程职责边界（技术调研缺失）
- ✅ 补充了数据结构设计（技术调研简略）

**建议**: 在架构文档或技术调研文档中添加修正说明，避免后续开发者误用技术调研中的错误代码。

---

## 九、下一步建议

建议按以下顺序修复：

1. 补充 preload.js 和主进程 index.js 完整代码
2. 修复 generateSequence 逻辑，补充所有关卡类型处理
3. 补充 electron.vite.config.mjs 和测试配置内容
4. 补充错误边界组件实现
5. 添加连续正确鼓励机制
6. 扩展热力图支持分号

---

*架构 Review 完成，文档整体优秀，需要补充关键代码实现*