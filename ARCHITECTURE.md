# SwiftType 架构设计文档

**设计日期**: 2026-04-21
**版本**: 1.0
**状态**: 完成

---

## 一、系统整体架构

### 1.1 三层架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron 应用架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  主进程 (Main Process)               │   │
│  │                                                     │   │
│  │  - BrowserWindow 窗口管理                           │   │
│  │  - electron-store 数据存储                          │   │
│  │  - IPC 处理 (ipcMain.handle)                        │   │
│  │  - 应用生命周期管理                                  │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                 │
│                          │ IPC 通信                        │
│                          ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                预加载脚本 (Preload Script)           │   │
│  │                                                     │   │
│  │  - contextBridge.exposeInMainWorld                  │   │
│  │  - 暴露安全 API (swifttypeAPI)                       │   │
│  │  - 隔离渲染进程与 Node.js                            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                 │
│                          │ window.swifttypeAPI             │
│                          ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                渲染进程 (Renderer Process)           │   │
│  │                                                     │   │
│  │  Vue 3 应用                                         │   │
│  │  ├── 组件层 (Components)                            │   │
│  │  ├── Composables (业务逻辑)                          │   │
│  │  ├── Pinia Stores (状态管理)                         │   │
│  │  ├── 数据层 (静态数据)                               │   │
│  │  └── Composables (IPC 调用)                          │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 各进程职责边界

| 进程 | 职责 | 可访问资源 | 禁止访问 |
|------|------|------------|----------|
| 主进程 | 窗口管理、数据存储、应用生命周期 | Node.js API、文件系统、electron-store | DOM、Vue 组件 |
| 预加载脚本 | 暴露安全 API、隔离层 | 有限的 Node.js API（contextBridge、ipcRenderer） | 文件系统、electron-store |
| 渲染进程 | UI 渲染、用户交互、业务逻辑 | DOM、Vue API、swifttypeAPI | Node.js API、文件系统 |

### 1.3 数据流向图

```
用户输入（键盘事件）
       │
       ▼
┌──────────────────┐
│   useKeyboardInput │  ← DOM keydown 事件
│   (Composable)     │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│    usePractice    │  ← 处理输入，计算正确率
│   (Composable)     │
└──────────────────┘
       │
       ├──────────────────────┐
       ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│  Pinia Store     │   │    useSound      │  ← 播放音效
│  (progress.js)   │   │   (Composable)    │     (本地 Audio)
└──────────────────┘   └──────────────────┘
       │
       ▼
┌──────────────────┐
│   useStorage     │  ← 调用 window.swifttypeAPI
│   (Composable)     │
└──────────────────┘
       │
       ▼ IPC 调用 (ipcRenderer.invoke)
       │
┌──────────────────┐
│   preload.js     │  ← contextBridge 暴露的 API
└──────────────────┘
       │
       ▼ IPC 通道 (store:set)
       │
┌──────────────────┐
│   main/index.js  │  ← ipcMain.handle 处理
│   (IPC Handler)   │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  electron-store  │  ← 本地文件持久化
└──────────────────┘
```

---

## 二、模块划分

### 2.1 核心模块清单

| 模块 | 类型 | 职责 | 文件位置 |
|------|------|------|----------|
| App.vue | 组件 | 应用入口，路由容器 | renderer/src/App.vue |
| Home.vue | 组件 | 首页界面 | renderer/src/components/Home.vue |
| LevelSelect.vue | 组件 | 关卡选择界面 | renderer/src/components/LevelSelect.vue |
| Practice.vue | 组件 | 练习界面（核心） | renderer/src/components/Practice.vue |
| Keyboard.vue | 组件 | 键盘布局可视化 | renderer/src/components/Keyboard.vue |
| Key.vue | 组件 | 单个键显示 | renderer/src/components/Key.vue |
| Result.vue | 组件 | 结果反馈界面 | renderer/src/components/Result.vue |
| Stats.vue | 组件 | 统计页面 | renderer/src/components/Stats.vue |
| Settings.vue | 组件 | 设置页面 | renderer/src/components/Settings.vue |
| ErrorBoundary.vue | 组件 | 错误边界 | renderer/src/components/ErrorBoundary.vue |
| useKeyboardInput | Composable | 键盘输入监听 | renderer/src/composables/useKeyboardInput.js |
| usePractice | Composable | 练习流程逻辑 | renderer/src/composables/usePractice.js |
| useStorage | Composable | IPC 数据存储 | renderer/src/composables/useStorage.js |
| useSound | Composable | 音效播放 | renderer/src/composables/useSound.js |
| progressStore | Pinia Store | 进度状态管理 | renderer/src/stores/progress.js |
| settingsStore | Pinia Store | 设置状态管理 | renderer/src/stores/settings.js |
| levels | 数据 | 关卡定义 | renderer/src/data/levels.js |
| keyboardLayout | 数据 | 键盘布局数据 | renderer/src/data/keyboardLayout.js |
| fingerMap | 数据 | 手指-键位映射 | renderer/src/data/fingerMap.js |
| texts | 数据 | 练习文本 | renderer/src/data/texts.js |
| main/index.js | 主进程 | Electron 主进程入口 | src/main/index.js |
| preload.js | 预加载脚本 | API 暴露层 | src/main/preload.js |

### 2.2 模块依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                        App.vue                               │
│                     (路由容器 + ErrorBoundary)                │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐       ┌─────────┐
   │ Home.vue│      │LevelSelect│      │Practice.vue│
   └─────────┘      │   .vue   │       └─────────┘
        │           └─────────┘            │
        │                 │                │
        │                 ▼                ▼
        │            ┌─────────┐      ┌─────────┐
        │            │Result.vue│      │Keyboard.vue│
        │            └─────────┘      └─────────┘
        │                 │                │
        │                 │                ▼
        │                 │           ┌─────────┐
        │                 │           │ Key.vue │
        │                 │           └─────────┘
        │                 │                │
        └─────────────────┼────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │   Composables 层     │
              ├─────────────────────┤
              │ useKeyboardInput    │
              │ usePractice         │
              │ useSound            │
              │ useStorage          │
              └─────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐       ┌─────────┐
   │ 数据层   │      │Pinia Store│      │ IPC API │
   ├─────────┤      ├─────────┤       │(swifttypeAPI)│
   │ levels  │      │progress │       └─────────┘
   │keyboardLayout│   │settings │            │
   │fingerMap│      └─────────┘            │
   │ texts   │            │                │
   └─────────┘            │                │
        │                 │                │
        └─────────────────┼────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │   electron-store    │
              │   (主进程数据存储)    │
              └─────────────────────┘
```

### 2.3 模块间通信方式

| 通信方式 | 使用场景 | 示例 |
|----------|----------|------|
| Props | 父组件 → 子组件数据传递 | Keyboard.vue 接收 currentLetter prop |
| Events | 子组件 → 父组件事件通知 | Result.vue 发出 continue 事件 |
| Pinia Store | 跨组件共享状态 | progressStore 保存当前关卡进度 |
| Composables | 复用业务逻辑 | usePractice 提供练习流程方法 |
| IPC (swifttypeAPI) | 渲染进程 → 主进程通信 | useStorage 调用存储 API |

---

## 三、数据结构设计

### 3.1 关卡数据结构

```javascript
// renderer/src/data/levels.js

export const levels = [
  {
    id: 0,
    name: '基准位置',
    type: 'tutorial',          // 类型：tutorial | letter | word | sentence | article | comprehensive
    letters: ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'],
    practiceCount: 8,          // 练习次数
    unlockCondition: null,     // 解锁条件：null 表示默认解锁
    targetAccuracy: null       // 目标正确率：null 表示不计正确率
  },
  {
    id: 1,
    name: '新手村（左手中指）',
    type: 'letter',
    letters: ['E', 'D', 'C'],
    practiceCount: 50,
    unlockCondition: {
      level: 0,                 // 前置关卡 ID
      completed: true           // 完成状态
    },
    targetAccuracy: 80          // 目标正确率 80%
  },
  {
    id: 2,
    name: '左手小指',
    type: 'letter',
    letters: ['Q', 'A', 'Z'],
    practiceCount: 50,
    unlockCondition: {
      level: 1,
      accuracy: 80              // 前置关卡正确率要求
    },
    targetAccuracy: 80
  },
  // ... 关卡 3-8（单手指练习）
  {
    id: 9,
    name: '双手基础',
    type: 'letter',
    letters: 'all',             // 'all' 表示所有26个字母
    practiceCount: 30,
    unlockCondition: {
      level: 8,
      accuracy: 80
    },
    targetAccuracy: 85
  },
  {
    id: 10,
    name: '词组练习',
    type: 'word',
    words: ['the', 'and', 'is', 'it', 'to', 'in', 'of', 'for', 'on', 'with'],
    practiceCount: 20,
    unlockCondition: {
      level: 9,
      accuracy: 85
    },
    targetAccuracy: 85
  },
  {
    id: 11,
    name: '短句练习',
    type: 'sentence',
    sentences: [
      'Hello world',
      'Good morning',
      'Thank you',
      'Nice to meet you',
      'How are you'
    ],
    practiceCount: 10,
    unlockCondition: {
      level: 10,
      accuracy: 85
    },
    targetAccuracy: 85
  },
  {
    id: 12,
    name: '文章练习',
    type: 'article',
    articles: [
      'The quick brown fox jumps over the lazy dog.',
      'A journey of a thousand miles begins with a single step.',
      'Practice makes perfect.'
    ],
    practiceCount: 3,
    unlockCondition: {
      level: 11,
      accuracy: 85
    },
    targetAccuracy: 90
  },
  {
    id: 13,
    name: '键盘大师',
    type: 'comprehensive',
    sections: [
      { type: 'letter', count: 20 },
      { type: 'word', count: 10 },
      { type: 'sentence', count: 3 }
    ],
    practiceCount: 33,
    unlockCondition: {
      level: 12,
      accuracy: 90
    },
    targetAccuracy: 90
  }
]
```

### 3.2 用户进度数据结构

```javascript
// electron-store 存储结构
{
  version: '1.0',               // 数据版本号（用于迁移）
  currentLevel: 3,              // 当前进行中的关卡 ID
  
  levels: {
    '0': {
      completed: true,          // 是否完成
      completedAt: '2026-04-20' // 完成日期
    },
    '1': {
      completed: true,
      accuracy: 95,             // 最佳正确率
      bestTime: 180,            // 最佳完成时间（秒）
      attempts: 3,              // 尝试次数
      completedAt: '2026-04-20'
    },
    '2': {
      completed: true,
      accuracy: 88,
      bestTime: 210,
      attempts: 5,
      completedAt: '2026-04-21'
    },
    '3': {
      completed: false,
      progress: 12,             // 当前进度（已完成的练习次数）
      currentAccuracy: 85,      // 当前正确率
      startedAt: '2026-04-21'
    }
    // ... 其他关卡
  },
  
  letterStats: {
    'E': {
      total: 50,                // 总输入次数
      correct: 45               // 正确次数
    },
    'D': {
      total: 50,
      correct: 40
    },
    'C': {
      total: 50,
      correct: 42
    }
    // ... 其他字母
  },
  
  totalPracticeTime: 2700,      // 总练习时间（秒）
  
  settings: {
    soundEnabled: true,         // 音效开关
    restReminder: false,        // 休息提醒开关
    restReminderMinutes: 10,    // 休息提醒间隔（分钟）
    showHeatmap: true           // 热力图显示开关
  }
}
```

### 3.3 内容统计数据结构（含分号）

```javascript
// 热力图数据结构
// 支持所有可练习的字符：A-Z 和 ;（分号）
{
  'A': { total: 100, correct: 90 },   // 正确率 90% → 绿色
  'B': { total: 50, correct: 35 },    // 正确率 70% → 黄色
  'C': { total: 20, correct: 10 },    // 正确率 50% → 红色
  'D': { total: 0, correct: 0 },      // 无数据 → 灰色
  ';': { total: 10, correct: 8 }      // 关卡0基准位置包含分号
}

// 正确率计算公式
accuracy = stats.correct / stats.total

// 颜色映射（适用于所有可练习字符：A-Z 和 ;）
if (stats.total === 0) return '#9E9E9E'      // 灰色（无数据）
if (accuracy >= 0.9) return '#4CAF50'        // 绿色（熟练）
if (accuracy >= 0.7) return '#FFC107'        // 黄色（一般）
return '#F44336'                              // 红色（需要加强）
```

> **注意**: 关卡0（基准位置教学）包含分号 ';'（右手基准位置），热力图需要支持显示。统计键的范围为 `A-Z` 和 `;`。

### 3.4 设置数据结构

```javascript
{
  soundEnabled: true,           // 是否启用音效
  restReminder: false,          // 是否启用休息提醒
  restReminderMinutes: 10,      // 休息提醒间隔（分钟）
  showHeatmap: true,            // 是否显示热力图
  showFingerHint: true          // 是否显示手指提示
}
```

### 3.5 数据版本迁移策略

```javascript
// src/main/index.js - 数据迁移逻辑

function migrateData(store) {
  const version = store.get('version')
  
  // 当前版本，无需迁移
  if (version === '1.0') return
  
  // 首次使用，初始化数据
  if (!version) {
    store.set('version', '1.0')
    return
  }
  
  // 未来版本迁移示例
  // if (version === '1.0') {
  //   // 迁移到 1.1
  //   const oldStats = store.get('letterStats')
  //   const newStats = {}
  //   // 迁移逻辑...
  //   store.set('letterStats', newStats)
  //   store.set('version', '1.1')
  // }
}
```

---

## 四、组件架构

### 4.1 Vue 组件树图

```
App.vue (根组件)
│
├── ErrorBoundary.vue (错误边界包装)
│   │
│   ├── Home.vue (首页)
│   │   ├── Logo 图片
│   │   ├── 开始练习按钮
│   │   ├── 选择关卡按钮
│   │   └── 进度摘要 (ProgressBar.vue)
│   │
│   ├── LevelSelect.vue (关卡选择)
│   │   ├── 返回按钮
│   │   ├── 关卡列表 (LevelItem.vue × 14)
│   │   └── 解锁提示
│   │
│   ├── Practice.vue (练习界面 - 核心)
│   │   ├── 关卡标题
│   │   ├── 返回按钮
│   │   ├── 当前字母显示区 (LetterDisplay.vue)
│   │   ├── Keyboard.vue (键盘布局)
│   │   │   └── Key.vue × 50+ (单个键)
│   │   ├── 手指提示 (FingerHint.vue)
│   │   ├── 进度区 (ProgressInfo.vue)
│   │   │   ├── 进度条
│   │   │   ├── 正确率
│   │   │   └── 耗时
│   │   └── 热力图区 (可选)
│   │
│   ├── Result.vue (结果反馈)
│   │   ├── 完成祝贺
│   │   ├── 统计数据 (StatsDisplay.vue)
│   │   ├── 解锁提示 (UnlockNotice.vue)
│   │   ├── 继续下一关按钮
│   │   └── 返回关卡列表按钮
│   │
│   ├── Stats.vue (统计页面) [P2 功能]
│   │   ├── 总练习时间
│   │   ├── 关卡进度概览
│   │   └── 字母正确率图表
│   │   > 注：详细图表实现可在后续版本完善
│   │
│   └── Settings.vue (设置页面)
│       ├── 音效开关
│       ├── 休息提醒设置
│       ├── 热力图显示开关
│       └── 手指提示开关
```

### 4.2 组件 Props/Events 定义

> **说明**: 项目不使用 TypeScript，Props 使用 Vue 标准的 PropTypes 格式进行运行时验证。

#### Practice.vue

```javascript
// Props 定义（Vue PropTypes 格式）
const props = defineProps({
  levelId: {
    type: Number,
    required: true
  }
})

// Events 定义
const emit = defineEmits(['complete', 'exit'])

// emit('complete', { levelId, accuracy, time })
// emit('exit')
```

#### Keyboard.vue

```javascript
const props = defineProps({
  currentContent: {
    type: String,
    default: ''              // 当前要输入的内容（字母/词/句）
  },
  highlightFinger: {
    type: Boolean,
    default: true            // 是否高亮手指区域
  },
  contentStats: {
    type: Object,
    default: () => ({})      // 热力图数据 { content: { total, correct } }
  },
  showHeatmap: {
    type: Boolean,
    default: false           // 是否显示热力图
  },
  errorState: {
    type: Boolean,
    default: false           // 是否处于错误状态（闪烁效果）
  }
})

// 纯显示组件，无 Events
```

#### Key.vue

```javascript
const props = defineProps({
  keyChar: {
    type: String,
    required: true           // 键字符
  },
  width: {
    type: Number,
    default: 1               // 键宽度（相对单位）
  },
  highlight: {
    type: Boolean,
    default: false           // 是否高亮当前字母
  },
  fingerColor: {
    type: String,
    default: null            // 手指区域高亮颜色
  },
  heatmapColor: {
    type: String,
    default: null            // 热力图颜色
  },
  showHeatmap: {
    type: Boolean,
    default: false           // 是否显示热力图
  },
  errorState: {
    type: Boolean,
    default: false           // 是否闪烁
  }
})

// 纯显示组件，无 Events
```

#### LevelSelect.vue

```javascript
const props = defineProps({
  currentLevel: {
    type: Number,
    required: true           // 当前关卡
  },
  levels: {
    type: Array,
    required: true           // 关卡数据
  }
})

const emit = defineEmits(['select', 'back'])
// emit('select', levelId)
// emit('back')
```

#### Result.vue

```javascript
const props = defineProps({
  levelId: {
    type: Number,
    required: true           // 关卡 ID
  },
  accuracy: {
    type: Number,
    required: true           // 正确率
  },
  time: {
    type: Number,
    required: true           // 完成时间（秒）
  },
  totalInputs: {
    type: Number,
    required: true           // 总输入次数
  },
  unlocked: {
    type: Boolean,
    required: true           // 是否解锁下一关
  },
  nextLevelId: {
    type: Number,
    default: null            // 下一关卡 ID（如果解锁）
  },
  difficultItems: {
    type: Array,
    default: () => []        // 最困难的内容（正确率最低的）
  }
})

const emit = defineEmits(['continue', 'back'])
// emit('continue', nextLevelId)
// emit('back')
```

### 4.3 组件状态管理方式

| 状态类型 | 管理方式 | 示例 |
|----------|----------|------|
| UI 局部状态 | 组件内部 ref | 当前字母、是否显示错误 |
| 跨组件共享状态 | Pinia Store | 进度、设置 |
| 业务逻辑 | Composables | 练习流程、键盘输入 |
| 持久化数据 | electron-store (IPC) | 用户进度、字母统计 |

### 4.4 页面路由设计

SwiftType 是单页应用，不使用 Vue Router，采用条件渲染切换页面：

```vue
<!-- App.vue -->
<template>
  <ErrorBoundary>
    <!-- 根据当前页面状态渲染不同组件 -->
    <Home v-if="currentPage === 'home'" />
    <LevelSelect v-else-if="currentPage === 'levelSelect'" />
    <Practice v-else-if="currentPage === 'practice'" :level-id="currentLevel" />
    <Result v-else-if="currentPage === 'result'" />
    <Stats v-else-if="currentPage === 'stats'" />
    <Settings v-else-if="currentPage === 'settings'" />
  </ErrorBoundary>
</template>

<script setup>
import { ref } from 'vue'

// 页面状态
const currentPage = ref('home')  // 'home' | 'levelSelect' | 'practice' | 'result' | 'stats' | 'settings'
const currentLevel = ref(0)
const resultData = ref(null)

// 页面切换函数
function navigateTo(page, data = null) {
  currentPage.value = page
  if (data) {
    resultData.value = data
  }
}
</script>
```

---

## 五、Composables 设计

### 5.1 useKeyboardInput

```javascript
// renderer/src/composables/useKeyboardInput.js

/**
 * 键盘输入监听 Composable
 * 负责监听键盘输入，处理窗口焦点状态
 */

export function useKeyboardInput(onInput) {
  const isActive = ref(true)        // 是否监听（窗口聚焦时）
  const lastKey = ref('')           // 最后输入的键
  
  // 窗口焦点处理
  function handleBlur() {
    isActive.value = false
  }
  
  function handleFocus() {
    isActive.value = true
  }
  
  // 键盘输入处理
  function handleKeydown(event) {
    if (!isActive.value) return
    
    // 过滤非字母输入（关卡0-8）
    const key = event.key.toUpperCase()
    if (!/[A-Z;]/.test(key)) return
    
    lastKey.value = key
    onInput(key)
  }
  
  // 生命周期
  onMounted(() => {
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('keydown', handleKeydown)
  })
  
  onUnmounted(() => {
    window.removeEventListener('blur', handleBlur)
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('keydown', handleKeydown)
  })
  
  return {
    isActive,
    lastKey
  }
}
```

### 5.2 usePractice

```javascript
// renderer/src/composables/usePractice.js

/**
 * 练习流程 Composable
 * 负责管理练习流程、正确率计算、解锁判定
 */

export function usePractice(levelId) {
  const level = ref(levels[levelId])          // 当前关卡数据
  const currentIndex = ref(0)                  // 当前练习位置
  const currentContent = ref('')               // 当前要输入的内容（字母/词/句）
  const correctCount = ref(0)                  // 正确次数
  const errorCount = ref(0)                    // 错误次数
  const startTime = ref(null)                  // 开始时间
  const consecutiveErrors = ref(0)             // 连续错误次数
  const consecutiveCorrects = ref(0)           // 连续正确次数（鼓励机制）
  const hintMode = ref(false)                  // 提示模式
  const isComplete = ref(false)                // 是否完成
  const encouragement = ref('')                // 当前鼓励文字
  
  // 练习序列（根据关卡类型生成）
  const practiceSequence = ref([])
  
  // 初始化练习
  function initPractice() {
    generateSequence()
    currentContent.value = practiceSequence.value[0]
    startTime.value = Date.now()
    consecutiveErrors.value = 0
    consecutiveCorrects.value = 0
    hintMode.value = false
    encouragement.value = ''
  }
  
  // 生成练习序列（修复逻辑，支持所有关卡类型）
  function generateSequence() {
    const type = level.value.type
    
    switch (type) {
      case 'tutorial':
        // 关卡0：基准位置教学，按顺序输入每个键一次
        practiceSequence.value = level.value.letters.slice()
        break
        
      case 'letter':
        if (level.value.letters === 'all') {
          // 关卡9：所有26字母随机（30次）
          practiceSequence.value = generateRandomLetters(30)
        } else {
          // 单手指关卡：单字母各10次 + 混合20次 = 50次
          const letters = level.value.letters
          const single = []
          letters.forEach(letter => {
            for (let i = 0; i < 10; i++) single.push(letter)
          })
          // 混合部分：随机取20个（不是复制整个single）
          const mixed = []
          for (let i = 0; i < 20; i++) {
            mixed.push(letters[Math.floor(Math.random() * letters.length)])
          }
          practiceSequence.value = [...single, ...shuffleArray(mixed)]
        }
        break
        
      case 'word':
        // 关卡10：词组练习
        practiceSequence.value = shuffleArray(level.value.words.slice())
        break
        
      case 'sentence':
        // 关卡11：句子练习（拆分成字符序列）
        practiceSequence.value = level.value.sentences.map(s => s.split(''))
        break
        
      case 'article':
        // 关卡12：文章练习（拆分成字符序列）
        practiceSequence.value = level.value.articles.map(a => a.split(''))
        break
        
      case 'comprehensive':
        // 关卡13：综合挑战（混合字母、词组、句子）
        const sequence = []
        level.value.sections.forEach(section => {
          if (section.type === 'letter') {
            for (let i = 0; i < section.count; i++) {
              sequence.push(randomLetter())
            }
          } else if (section.type === 'word') {
            // 从词库随机取
            const words = ['the', 'and', 'is', 'it', 'to', 'in', 'of', 'for']
            for (let i = 0; i < section.count; i++) {
              sequence.push(words[Math.floor(Math.random() * words.length)])
            }
          } else if (section.type === 'sentence') {
            // 从句库随机取
            const sentences = ['Hello world', 'Good morning', 'Thank you']
            for (let i = 0; i < section.count; i++) {
              sequence.push(sentences[Math.floor(Math.random() * sentences.length)])
            }
          }
        })
        practiceSequence.value = sequence
        break
        
      default:
        console.error('未知关卡类型:', type)
    }
  }
  
  // 辅助函数：生成随机字母
  function generateRandomLetters(count) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const result = []
    for (let i = 0; i < count; i++) {
      result.push(letters[Math.floor(Math.random() * letters.length)])
    }
    return result
  }
  
  // 辅助函数：随机字母
  function randomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return letters[Math.floor(Math.random() * letters.length)]
  }
  
  // 处理输入
  function handleInput(inputContent) {
    const expected = currentContent.value
    const isCorrect = inputContent === expected
    
    if (isCorrect) {
      correctCount.value++
      consecutiveErrors.value = 0
      consecutiveCorrects.value++
      hintMode.value = false
      
      // 连续正确鼓励机制（产品设计要求）
      if (consecutiveCorrects.value === 5) {
        encouragement.value = '继续加油！'
      } else if (consecutiveCorrects.value === 10) {
        encouragement.value = '太棒了！'
        consecutiveCorrects.value = 0  // 重置计数
      } else {
        encouragement.value = ''
      }
      
      nextContent()
    } else {
      errorCount.value++
      consecutiveErrors.value++
      consecutiveCorrects.value = 0
      encouragement.value = ''
      
      // 连续错误3次 → 提示模式
      if (consecutiveErrors.value >= 3) {
        hintMode.value = true
      }
    }
    
    // 返回统计信息（由 Practice.vue 调用 progressStore 更新）
    return {
      content: expected,
      isCorrect
    }
  }
  
  // 下一个内容
  function nextContent() {
    currentIndex.value++
    
    if (currentIndex.value >= practiceSequence.value.length) {
      completePractice()
    } else {
      currentContent.value = practiceSequence.value[currentIndex.value]
    }
  }
  
  // 完成练习
  function completePractice() {
    isComplete.value = true
    const totalTime = Math.floor((Date.now() - startTime.value) / 1000)
    const accuracy = calculateAccuracy()
    
    return {
      levelId: level.value.id,
      accuracy,
      time: totalTime,
      totalInputs: practiceSequence.value.length,
      unlocked: checkUnlock(accuracy),
      difficultItems: getDifficultItems()  // 最困难的内容
    }
  }
  
  // 计算正确率
  function calculateAccuracy() {
    const total = correctCount.value + errorCount.value
    return Math.round((correctCount.value / total) * 100)
  }
  
  // 检查解锁
  function checkUnlock(accuracy) {
    return accuracy >= level.value.targetAccuracy
  }
  
  // 获取最困难的内容（正确率最低的）
  function getDifficultItems() {
    // 由 Practice.vue 根据字母统计计算
    return []
  }
  
  return {
    level,
    currentContent,
    currentIndex,
    correctCount,
    errorCount,
    consecutiveErrors,
    consecutiveCorrects,
    hintMode,
    isComplete,
    encouragement,
    initPractice,
    handleInput,
    completePractice
  }
}
```

### 5.3 useStorage

```javascript
// renderer/src/composables/useStorage.js

/**
 * IPC 数据存储 Composable
 * 负责与 electron-store 交互（通过 IPC）
 */

export function useStorage() {
  // 加载所有数据
  async function loadAll() {
    return await window.swifttypeAPI.getData()
  }
  
  // 加载进度
  async function loadProgress() {
    const data = await loadAll()
    return {
      currentLevel: data.currentLevel,
      levels: data.levels,
      letterStats: data.letterStats
    }
  }
  
  // 保存进度
  async function saveProgress(progress) {
    await window.swifttypeAPI.setStore('currentLevel', progress.currentLevel)
    await window.swifttypeAPI.setStore('levels', progress.levels)
  }
  
  // 更新关卡完成状态
  async function updateLevelComplete(levelId, accuracy, time) {
    const levels = await window.swifttypeAPI.getStore('levels')
    levels[levelId] = {
      completed: true,
      accuracy: Math.max(levels[levelId]?.accuracy || 0, accuracy),
      bestTime: Math.min(levels[levelId]?.bestTime || Infinity, time),
      attempts: (levels[levelId]?.attempts || 0) + 1,
      completedAt: new Date().toISOString().split('T')[0]
    }
    await window.swifttypeAPI.setStore('levels', levels)
  }
  
  // 更新字母统计
  async function updateLetterStats(letter, isCorrect) {
    const stats = await window.swifttypeAPI.getStore('letterStats')
    if (!stats[letter]) {
      stats[letter] = { total: 0, correct: 0 }
    }
    stats[letter].total++
    if (isCorrect) stats[letter].correct++
    await window.swifttypeAPI.setStore('letterStats', stats)
  }
  
  // 获取设置
  async function getSettings() {
    return await window.swifttypeAPI.getStore('settings')
  }
  
  // 更新设置
  async function updateSettings(key, value) {
    await window.swifttypeAPI.setStore(`settings.${key}`, value)
  }
  
  return {
    loadAll,
    loadProgress,
    saveProgress,
    updateLevelComplete,
    updateLetterStats,
    getSettings,
    updateSettings
  }
}
```

### 5.4 useSound

```javascript
// renderer/src/composables/useSound.js

/**
 * 音效播放 Composable
 * 负责播放正确/错误音效
 * 
 * 注意：音效文件放在 public/sounds/ 目录
 * 使用 public 目录更可靠，Vite 会直接复制到输出目录
 */

export function useSound() {
  const enabled = ref(true)
  
  // 获取支持的音效格式路径
  function getSoundPath(name) {
    // 检测浏览器支持的格式
    const audio = new Audio()
    const canMp3 = audio.canPlayType('audio/mpeg') !== ''
    return canMp3 ? `/sounds/${name}.mp3` : `/sounds/${name}.ogg`
  }
  
  // 预加载音效
  const correctSound = new Audio(getSoundPath('correct'))
  const errorSound = new Audio(getSoundPath('error'))
  
  correctSound.load()
  errorSound.load()
  
  // 播放正确音效
  function playCorrect() {
    if (!enabled.value) return
    correctSound.currentTime = 0
    correctSound.play().catch(() => {})  // 静默处理播放失败
  }
  
  // 播放错误音效
  function playError() {
    if (!enabled.value) return
    errorSound.currentTime = 0
    errorSound.play().catch(() => {})
  }
  
  // 设置开关
  function setEnabled(value) {
    enabled.value = value
  }
  
  return {
    enabled,
    playCorrect,
    playError,
    setEnabled
  }
}
```

---

## 六、IPC 通道设计

### 6.1 通道清单

| 通道名称 | 方向 | 请求参数 | 返回值 | 用途 |
|----------|------|----------|--------|------|
| `store:get` | 渲染→主 | key: string | any | 获取存储数据 |
| `store:set` | 渲染→主 | key: string, value: any | void | 设置存储数据 |
| `store:getAll` | 渲染→主 | 无 | object | 获取所有数据 |
| `app:getVersion` | 渲染→主 | 无 | string | 获取应用版本 |

### 6.2 请求/响应格式

所有 IPC 通信使用异步方式（`ipcRenderer.invoke` / `ipcMain.handle`）：

```javascript
// 渲染进程调用
const result = await window.swifttypeAPI.getStore('currentLevel')

// 主进程处理
ipcMain.handle('store:get', (event, key) => {
  return store.get(key)
})
```

### 6.3 错误处理策略

```javascript
// renderer/src/composables/useStorage.js

async function safeInvoke(channel, ...args) {
  try {
    return await window.swifttypeAPI[channel](...args)
  } catch (error) {
    console.error(`IPC 调用失败: ${channel}`, error)
    // 返回默认值或抛出错误
    throw error
  }
}
```

### 6.4 preload.js 完整实现

```javascript
// src/main/preload.js

import { contextBridge, ipcRenderer } from 'electron'

/**
 * 暴露给渲染进程的安全 API
 * 所有 API 都通过 IPC 与主进程通信
 * 
 * 重要说明：
 * - contextIsolation 必须开启（安全配置）
 * - 渲染进程只能通过此 API 访问数据
 * - 不暴露任何 Node.js API
 */
contextBridge.exposeInMainWorld('swifttypeAPI', {
  // 数据存储操作
  getStore: (key) => ipcRenderer.invoke('store:get', key),
  setStore: (key, value) => ipcRenderer.invoke('store:set', key, value),
  getAllData: () => ipcRenderer.invoke('store:getAll'),
  
  // 应用信息
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // 平台信息（preload 可以访问 process，不需要 IPC）
  getPlatform: () => process.platform
})
```

### 6.5 主进程 index.js 关键实现

```javascript
// src/main/index.js

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
      showHeatmap: true,
      showFingerHint: true
    }
  }
})

// 创建窗口（安全配置）
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,        // 产品设计要求的最小宽度
    minHeight: 500,
    resizable: true,
    fullscreenable: false, // 儿童应用不建议全屏
    title: 'SwiftType - 敏捷打字练习',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // 安全：必须开启，隔离预加载脚本和渲染进程
      nodeIntegration: false,   // 安全：必须关闭，渲染进程不能直接访问 Node.js
      sandbox: true,            // 安全：启用沙箱模式
      webSecurity: true         // 安全：启用 Web 安全
    }
  })
  
  // 加载渲染进程页面
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')  // Vite 开发服务器
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// IPC 处理器
ipcMain.handle('store:get', (event, key) => store.get(key))
ipcMain.handle('store:set', (event, key, value) => store.set(key, value))
ipcMain.handle('store:getAll', () => store.store)
ipcMain.handle('app:getVersion', () => app.getVersion())

// 数据迁移（启动时检查）
function migrateData() {
  const version = store.get('version')
  
  // 当前版本，无需迁移
  if (version === '1.0') return
  
  // 首次使用，初始化数据版本
  if (!version) {
    store.set('version', '1.0')
  }
  
  // 未来版本迁移逻辑在此添加
}

// 应用生命周期
app.whenReady().then(() => {
  migrateData()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  // macOS 点击 Dock 图标时重新创建窗口
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
```

> **完整实现参考**: TECHNICAL-RESEARCH.md 第155-270行有更详细的 IPC 处理和数据存储实现。

---

## 七、项目目录结构详细说明

### 7.1 完整目录树

```
SwiftType/
├── package.json                    # 项目配置、依赖、打包配置
├── electron.vite.config.mjs        # electron-vite 构建配置
├── vitest.config.js                # Vitest 单元测试配置
├── playwright.config.js            # Playwright E2E测试配置
├── .gitignore                      # Git忽略文件
│
├── src/
│   ├── main/                       # Electron 主进程
│   │   ├── index.js                # 主进程入口
│   │   │                           # - BrowserWindow 创建
│   │   │                           # - IPC 处理 (ipcMain.handle)
│   │   │                           # - electron-store 配置
│   │   │                           # - 数据迁移逻辑
│   │   │                           # - 应用生命周期
│   │   └── preload.js              # 预加载脚本
│   │                               # - contextBridge.exposeInMainWorld
│   │                               # - 暴露 swifttypeAPI
│   │
│   ├── renderer/                   # 渲染进程（Vue 应用）
│   │   ├── index.html              # HTML入口
│   │   ├── src/
│   │   │   ├── App.vue             # Vue根组件（页面路由）
│   │   │   ├── main.js             # Vue入口（创建应用实例）
│   │   │   │
│   │   │   ├── components/         # Vue组件
│   │   │   │   ├── Home.vue            # 首页
│   │   │   │   ├── LevelSelect.vue     # 关卡选择
│   │   │   │   ├── LevelItem.vue       # 单个关卡项
│   │   │   │   ├── Practice.vue        # 练习界面（核心）
│   │   │   │   ├── LetterDisplay.vue   # 当前字母显示
│   │   │   │   ├── Keyboard.vue        # 键盘布局
│   │   │   │   ├── Key.vue             # 单个键
│   │   │   │   ├── FingerHint.vue      # 手指提示
│   │   │   │   ├── ProgressInfo.vue    # 进度信息
│   │   │   │   ├── Result.vue          # 结果反馈
│   │   │   │   ├── StatsDisplay.vue    # 统计显示
│   │   │   │   ├── UnlockNotice.vue    # 解锁提示
│   │   │   │   ├── Stats.vue           # 统计页面
│   │   │   │   ├── Settings.vue        # 设置页面
│   │   │   │   └── ErrorBoundary.vue   # 错误边界
│   │   │   │
│   │   │   ├── composables/        # Composables（业务逻辑）
│   │   │   │   ├── useKeyboardInput.js  # 键盘输入监听
│   │   │   │   ├── usePractice.js       # 练习流程
│   │   │   │   ├── useStorage.js        # IPC数据存储
│   │   │   │   └── useSound.js          # 音效播放
│   │   │   │
│   │   │   ├── stores/             # Pinia状态管理
│   │   │   │   ├── progress.js         # 进度状态
│   │   │   │   └── settings.js         # 设置状态
│   │   │   │
│   │   │   ├── data/               # 静态数据
│   │   │   │   ├── levels.js           # 关卡定义（14关卡）
│   │   │   │   ├── keyboardLayout.js   # 键盘布局数据
│   │   │   │   ├── fingerMap.js        # 手指-键位映射
│   │   │   │   ├── fingerNames.js      # 手指名称（中英文）
│   │   │   │   └── texts.js            # 练习文本（词组、句子、文章）
│   │   │   │
│   │   │   └── utils/              # 工具函数
│   │   │       ├── shuffle.js          # 随机打乱数组
│   │   │       └── formatTime.js       # 时间格式化
│   │   │
│   │   ├── assets/                 # 静态资源
│   │   │   ├── sounds/             # 音效文件
│   │   │   │   ├── correct.mp3
│   │   │   │   ├── correct.ogg
│   │   │   │   ├── error.mp3
│   │   │   │   ├── error.ogg
│   │   │   │   └── README.md       # 音效来源说明
│   │   │   └
│   │   │   └── images/             # 图片资源
│   │   │       ├── logo.png            # 应用Logo
│   │   │       └── favicon.ico         # 网站图标
│   │   │
│   │   └── styles/                 # 全局样式
│   │       ├── variables.css           # CSS变量（颜色、间距）
│   │       └ keyboard.css              # 键盘布局样式
│   │       └── global.css              # 全局样式
│   │
│   └── shared/                     # 主进程与渲染进程共享
│       └── constants.js            # 共享常量
│
├── tests/                          # 测试
│   ├── unit/                       # 单元测试（Vitest）
│   │   ├── components/
│   │   │   ├── Keyboard.test.js
│   │   │   └── Key.test.js
│   │   └── composables/
│   │   │   ├── usePractice.test.js
│   │   │   └ useStorage.test.js
│   │   └── utils/
│   │   │   └ shuffle.test.js
│   │
│   └── e2e/                        # E2E测试（Playwright）
│   │   ├── practice.spec.js        # 练习流程测试
│   │   ├── levels.spec.js          # 关卡解锁测试
│   │   └ settings.spec.js          # 设置功能测试
│   │   └ fixtures/                 # 测试数据
│   │   │   └ mockStore.json
│   │
├── resources/                      # 打包资源
│   ├── icon.icns                   # macOS图标
│   ├── icon.ico                    # Windows图标
│   ├── icon.png                    # Linux图标
│   └── entitlements.mac.plist      # macOS权限配置
│
├── dist/                           # 打包输出（electron-builder）
│   ├── mac/                        # macOS应用
│   ├── win/                        # Windows安装包
│   └── linux/                      # Linux安装包
│
└── docs/                           # 项目文档
    ├── PRODUCT-DESIGN.md           # 产品设计文档
    ├── TECHNICAL-RESEARCH.md       # 技术调研文档
    ├── ARCHITECTURE.md             # 架构设计文档（本文件）
    ├── API.md                      # API文档（待创建）
    └── CHANGELOG.md                # 更新日志（待创建）
```

### 7.2 目录职责说明

| 目录 | 职责 | 谁使用 |
|------|------|--------|
| src/main/ | Electron主进程 | Node.js环境 |
| src/main/preload.js | 预加载脚本，API暴露层 | 主进程与渲染进程桥接 |
| src/renderer/ | Vue应用 | 浏览器环境（渲染进程） |
| src/renderer/components/ | Vue组件 | 渲染进程 |
| src/renderer/composables/ | 业务逻辑复用 | 渲染进程 |
| src/renderer/stores/ | Pinia状态管理 | 渲染进程 |
| src/renderer/data/ | 静态数据定义 | 渲染进程 |
| src/renderer/assets/ | 静态资源（音效、图片） | 渲染进程（Vite处理） |
| src/shared/ | 共享常量 | 主进程与渲染进程 |
| tests/unit/ | 单元测试 | Vitest |
| tests/e2e/ | E2E测试 | Playwright |
| resources/ | 打包资源（图标） | electron-builder |
| docs/ | 项目文档 | 开发者 |

### 7.3 文件命名规范

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| Vue组件 | PascalCase.vue | Keyboard.vue, LevelSelect.vue |
| Composables | use前缀 + camelCase.js | useKeyboardInput.js |
| Pinia Store | camelCase.js | progress.js, settings.js |
| 数据文件 | camelCase.js | levels.js, fingerMap.js |
| 工具函数 | camelCase.js | shuffle.js, formatTime.js |
| 测试文件 | 对应文件名 + .test.js / .spec.js | usePractice.test.js, practice.spec.js |
| 配置文件 | kebab-case.js / .mjs | vitest.config.js, electron.vite.config.mjs |

---

## 八、开发规范

### 8.1 组件开发规范

1. **单一职责**: 每个组件只做一件事
2. **Props向下，Events向上**: 数据通过 props 传递，事件通过 emit 向上
3. **纯显示组件无状态**: Keyboard.vue、Key.vue 等纯显示组件不管理状态
4. **状态提升**: 需要跨组件共享的状态提升到父组件或 Pinia Store
5. **使用 Composition API**: 统一使用 `<script setup>` 语法

### 8.2 状态管理规范

1. **本地状态优先**: 组件局部状态使用 ref/reactive
2. **共享状态用 Pinia**: 跨组件共享状态使用 Pinia Store
3. **持久化用 IPC**: 需要持久化的数据通过 useStorage 调用 IPC
4. **异步操作封装**: 所有异步操作封装在 Composables 或 Store actions

### 8.3 IPC 使用规范

1. **只使用 swifttypeAPI**: 渲染进程只通过 window.swifttypeAPI 访问 IPC
2. **异步调用**: 所有 IPC 调用使用 async/await
3. **错误处理**: 所有 IPC 调用需要错误处理
4. **不直接访问 Node.js**: 渲染进程永远不直接访问 Node.js API

### 8.4 测试规范

1. **单元测试覆盖 Composables**: usePractice、useStorage 等核心逻辑必须有测试
2. **组件测试用 Vitest**: 使用 jsdom 环境测试 Vue 组件
3. **E2E 测试关键流程**: 完整练习流程、关卡解锁必须有 E2E 测试
4. **Mock IPC**: 单元测试中 Mock window.swifttypeAPI

---

## 九、配置文件与关键组件实现

### 9.1 electron.vite.config.mjs

```javascript
// electron.vite.config.mjs

import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  main: {
    // 主进程配置
    build: {
      rollupOptions: {
        external: ['electron', 'electron-store']  // 不打包到主进程
      }
    }
  },
  preload: {
    // 预加载脚本配置
    build: {
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    // 渲染进程配置（Vue 应用）
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

### 9.2 vitest.config.js

```javascript
// vitest.config.js

import { defineConfig } from 'vitest'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',               // Vue 组件测试环境
    include: ['tests/unit/**/*.test.js'],
    globals: true,                       // 全局测试 API
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'src/main/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src')
    }
  }
})
```

### 9.3 playwright.config.js

```javascript
// playwright.config.js

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,  // Electron 测试需要串行
  retries: 2,
  use: {
    headless: false,  // Electron 需要显示窗口
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'electron',
      use: {}
    }
  ]
})
```

### 9.4 ErrorBoundary.vue 实现

```vue
<!-- src/renderer/src/components/ErrorBoundary.vue -->

<template>
  <div v-if="error" class="error-boundary">
    <h2>出错了</h2>
    <p>请重启应用，如果问题持续请联系开发者</p>
    <p class="error-detail">{{ error.message }}</p>
    <button @click="resetError">重试</button>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

// Vue 3 错误边界：捕获子组件错误
onErrorCaptured((err, instance, info) => {
  error.value = err
  console.error('Vue Error:', err, info)
  return false  // 阻止错误继续向上传播
})

function resetError() {
  error.value = null
}
</script>

<style>
.error-boundary {
  padding: 20px;
  text-align: center;
  background: #fff3f3;
  border-radius: 8px;
  max-width: 400px;
  margin: 50px auto;
}

.error-boundary h2 {
  color: #d32f2f;
  margin-bottom: 10px;
}

.error-detail {
  color: #666;
  font-size: 12px;
  margin: 10px 0;
}

.error-boundary button {
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

> **完整实现参考**: TECHNICAL-RESEARCH.md 第1218-1259行有更详细的错误边界实现。

---

## 十、技术决策记录

### 10.1 已确认决策

| 决策项 | 决策 | 原因 | 决策日期 |
|--------|------|------|----------|
| 桌面框架 | Electron | 跨平台、成熟、开发快 | 产品设计阶段 |
| 前端框架 | Vue.js 3 Composition API | 响应式简单、生态丰富 | 产品设计阶段 |
| 数据存储 | electron-store + preload.js + IPC | 安全隔离、简单易用 | 技术调研阶段 |
| 音效格式 | mp3 + ogg 双格式 | 跨平台兼容 | 技术调研阶段 |
| 测试框架 | Vitest + Playwright | Vue生态友好、E2E支持 | 技术调研阶段 |
| 状态管理 | Pinia | Vue官方推荐、Composition API友好 | 架构设计阶段 |
| 路由方案 | 条件渲染（不用Vue Router） | 页面少、简单直接 | 架构设计阶段 |

### 10.2 待决策项（Phase 4 或后续版本）

| 决策项 | 状态 | 备注 |
|--------|------|------|
| TypeScript 支持 | 可选建议 | Phase 4 考虑 |
| 自动更新机制 | 暂不实现 | 直接安装分发，不需要 |
| Vue Router | 可选 | 如果页面增多可考虑 |
| 多键盘布局支持 | 暂不实现 | 只做 QWERTY |

---

## 十一、架构风险与缓解

### 11.1 架构风险

| 风险 | 级别 | 缓解措施 |
|------|------|----------|
| IPC 通信性能 | 低 | 数据只在关卡完成时保存，不在每次输入时保存 |
| 状态同步复杂性 | 低 | Pinia 统一管理共享状态 |
| 组件间依赖过深 | 低 | Composables 抽离业务逻辑，减少直接依赖 |
| 数据结构变化 | 中 | 数据版本迁移机制预留 |
| 测试覆盖不足 | 中 | Phase 0 配置测试框架，Phase 1-3 逐步增加测试 |

### 11.2 架构优势

1. **三层隔离**: 主进程/预加载/渲染进程安全隔离
2. **Composables 复用**: 业务逻辑独立，易于测试和维护
3. **Pinia 集中管理**: 状态可追溯、易于调试
4. **静态数据分离**: 关卡、键盘布局等数据独立，易于修改
5. **渐进式开发**: MVP → 完整功能 → 打包分发

---

## 十二、下一步

**Phase 0: 项目初始化**（按照此架构设计执行）

1. 创建 Electron + Vue 项目骨架
2. 配置 electron-vite
3. 实现 preload.js + IPC 通信机制
4. 配置 electron-store
5. 创建基础组件结构（空文件）
6. 配置测试框架（Vitest + Playwright）

---

*架构设计完成，可以开始 Phase 0 项目初始化*