# SwiftType 技术调研与可行性评估

**调研日期**: 2026-04-21
**技术栈**: Electron + Vue.js + electron-store
**状态**: 完成

---

## 一、技术栈概述

### 1.1 已确认的技术选择

| 组件 | 选择 | 版本建议 |
|------|------|----------|
| 桌面框架 | Electron | v33+ (最新稳定版) |
| 前端框架 | Vue.js | v3.4+ (Composition API) |
| 本地存储 | electron-store | v8+ |
| 构建工具 | Vite | v5+ (与 Vue 3 配合) |
| 打包工具 | electron-builder | v24+ |

### 1.2 技术栈选择理由

**Electron**
- 跨平台支持（macOS、Windows、Linux）
- 成熟稳定，社区活跃
- 开发调试方便（热重载）
- 与 Vue.js 集成简单（electron-vite）

**Vue.js 3**
- Composition API 更适合组件化开发
- 响应式数据管理简单
- 生态丰富（Vue Router、Pinia）
- 学习曲线平缓

**electron-store**
- 专为 Electron 设计
- 简单易用，自动持久化
- 支持加密存储（可选）

---

## 二、技术可行性评估

### 2.1 核心功能可行性

| 功能 | 可行性 | 实现难度 | 说明 |
|------|--------|----------|------|
| 键盘输入检测 | ✅ 高 | 低 | DOM 事件监听即可实现 |
| 键盘布局可视化 | ✅ 高 | 中 | CSS Grid + Vue 组件 |
| 手指位置映射 | ✅ 高 | 低 | 预定义数据结构 |
| 关卡解锁系统 | ✅ 高 | 低 | 状态管理 + 本地存储 |
| 进度保存 | ✅ 高 | 低 | electron-store 自动持久化 |
| 热力图显示 | ✅ 高 | 中 | CSS 动态样式绑定 |
| 音效反馈 | ✅ 高 | 低 | HTML5 Audio API |
| 打包分发 | ✅ 高 | 低 | electron-builder |

**总体评估**: 所有核心功能均可实现，技术可行性 **100%**。

---

### 2.2 详细可行性分析

#### 2.2.1 键盘输入检测

**实现方案**: 使用 DOM `keydown` 和 `keyup` 事件

```javascript
// Vue 3 Composition API 示例
import { ref, onMounted, onUnmounted } from 'vue'

export function useKeyboardInput() {
  const currentKey = ref('')
  const isCorrect = ref(null)
  
  function handleKeydown(event) {
    currentKey.value = event.key.toUpperCase()
    // 判断是否正确
  }
  
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
  
  return { currentKey, isCorrect }
}
```

**可行性**: ✅ 完全可行
- 浏览器原生支持
- 不需要特殊权限
- 响应速度快（毫秒级）

**注意事项**:
- 需要处理特殊键（Shift、CapsLock 等）
- 需要过滤非字母输入
- 窗口失焦时停止监听（避免干扰其他应用）

---

#### 2.2.2 键盘布局可视化

**实现方案**: CSS Grid + Vue 组件

```vue
<!-- Keyboard.vue 结构 -->
<template>
  <div class="keyboard">
    <div class="row row-1">
      <Key key-char="Q" :highlight="shouldHighlight('Q')" />
      <Key key-char="W" :highlight="shouldHighlight('W')" />
      <Key key-char="E" :highlight="shouldHighlight('E')" />
      ...
    </div>
    <div class="row row-2">
      <Key key-char="A" :highlight="shouldHighlight('A')" />
      ...
    </div>
    <div class="row row-3">
      <Key key-char="Z" :highlight="shouldHighlight('Z')" />
      ...
    </div>
  </div>
</template>

<style>
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: flex;
  justify-content: center;
  gap: 4px;
}
</style>
```

**可行性**: ✅ 完全可行
- CSS Grid/Flexbox 完全支持键盘布局
- Vue 组件化封装，易于维护
- 动态样式绑定实现高亮

**注意事项**:
- 键盘布局需要精确对齐
- 不同键盘布局（QWERTY/DVORAK）需要数据支持
- 间距和比例需要精确设计

---

#### 2.2.3 本地数据存储

**实现方案**: electron-store + preload.js + IPC

**重要说明**: electron-store 默认只能在主进程中使用。渲染进程（Vue 应用）无法直接访问 Node.js API，需要通过 preload.js 暴露 API 和 IPC 通信。

**主进程实现 (main/index.js)**:

```javascript
import { app, BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import path from 'path'

const store = new Store({
  name: 'swifttype-data',
  defaults: {
    version: '1.0',
    currentLevel: 0,
    levels: {},
    letterStats: {},
    totalPracticeTime: 0,  // 单位：秒
    settings: {
      soundEnabled: true,
      restReminder: false,
      restReminderMinutes: 10
    }
  }
})

// IPC 处理 - 数据存储
ipcMain.handle('store:get', (event, key) => {
  return store.get(key)
})

ipcMain.handle('store:set', (event, key, value) => {
  store.set(key, value)
})

ipcMain.handle('store:getAll', () => {
  return store.store
})

// IPC 处理 - 应用信息
ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})
```

**预加载脚本 (preload.js)**:

```javascript
import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全 API 到渲染进程
contextBridge.exposeInMainWorld('swifttypeAPI', {
  // 数据存储
  getData: () => ipcRenderer.invoke('store:getAll'),
  getStore: (key) => ipcRenderer.invoke('store:get', key),
  setStore: (key, value) => ipcRenderer.invoke('store:set', key, value),
  
  // 应用信息
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // 平台信息
  getPlatform: () => process.platform
})
```

**渲染进程使用 (renderer/composables/useStorage.js)**:

```javascript
export function useStorage() {
  return {
    // 加载所有数据
    loadProgress: async () => {
      return await window.swifttypeAPI.getData()
    },
    
    // 保存进度
    saveProgress: async (data) => {
      await window.swifttypeAPI.setStore('progress', data)
    },
    
    // 获取字母统计
    getLetterStats: async () => {
      return await window.swifttypeAPI.getStore('letterStats')
    },
    
    // 更新字母统计
    updateLetterStats: async (letter, stats) => {
      await window.swifttypeAPI.setStore(`letterStats.${letter}`, stats)
    },
    
    // 获取设置
    getSettings: async () => {
      return await window.swifttypeAPI.getStore('settings')
    },
    
    // 更新设置
    updateSettings: async (key, value) => {
      await window.swifttypeAPI.setStore(`settings.${key}`, value)
    }
  }
}
```

**可行性**: ✅ 完全可行
- 自动持久化到本地文件
- 支持嵌套数据结构
- 安全的 IPC 通信机制
- 数据迁移支持

**存储位置**:
- macOS: `~/Library/Application Support/SwiftType/swifttype-data.json`
- Windows: `%APPDATA%\SwiftType\swifttype-data.json`
- Linux: `~/.config/SwiftType/swifttype-data.json`

---

## 三、Electron 安全配置与 IPC 通信

### 3.1 Electron 安全配置

**BrowserWindow 安全配置（必须）**:

```javascript
// main/index.js - 窗口配置
import { BrowserWindow } from 'electron'
import path from 'path'

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
```

**安全配置说明**:

| 配置项 | 默认值 | 建议值 | 说明 |
|--------|--------|--------|------|
| contextIsolation | true | true | 必须开启，隔离预加载脚本和渲染进程 |
| nodeIntegration | false | false | 必须关闭，渲染进程不能直接访问 Node.js |
| sandbox | true | true | 启用沙箱模式 |
| webSecurity | true | true | 启用 Web 安全 |

---

### 3.2 IPC 通信机制

**IPC（Inter-Process Communication）是 Electron 主进程和渲染进程通信的核心机制**。

**异步通信（推荐）**:

```javascript
// 主进程 - ipcMain.handle
ipcMain.handle('channel-name', (event, arg1, arg2) => {
  // 处理请求
  return result  // 返回结果给渲染进程
})

// 渲染进程 - ipcRenderer.invoke
const result = await ipcRenderer.invoke('channel-name', arg1, arg2)
```

**同步通信（不推荐）**:

```javascript
// 主进程 - ipcMain.on
ipcMain.on('channel-name', (event, arg) => {
  event.returnValue = result  // 同步返回
})

// 渲染进程 - ipcRenderer.sendSync
const result = ipcRenderer.sendSync('channel-name', arg)
```

**SwiftType IPC 通道设计**:

| 通道名称 | 方向 | 用途 |
|----------|------|------|
| `store:get` | 渲染→主 | 获取存储数据 |
| `store:set` | 渲染→主 | 设置存储数据 |
| `store:getAll` | 渲染→主 | 获取所有数据 |
| `app:getVersion` | 渲染→主 | 获取应用版本 |

---

## 四、技术难点分析

### 4.1 高难度问题

#### 问题1: 键盘布局精确对齐

**难度**: ⭐⭐⭐ (中等)

**问题描述**:
标准键盘的键位间距和大小不完全一致：
- 第一行（QWERTY）键位最密
- 第二行（ASDF）稍宽
- 第三行（ZXCV）最宽
- 特殊键（Tab、Caps、Shift）尺寸不同

**解决方案**:
```css
/* 使用固定尺寸 + 精确间距 */
.key {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

/* 特殊键调整 */
.key-backspace {
  width: 80px; /* 2倍宽度 */
}

.key-tab {
  width: 60px; /* 1.5倍宽度 */
}

.key-space {
  width: 240px; /* 6倍宽度 */
}
```

**建议**: 使用相对单位（em/rem）而非固定像素，适配不同屏幕。

---

#### 问题2: 窗口失焦时的键盘监听

**难度**: ⭐⭐ (低-中)

**问题描述**:
当用户切换到其他窗口时，keydown 事件仍会触发，可能干扰其他应用。

**解决方案**:
```javascript
// 监听窗口焦点状态
import { onMounted, onUnmounted } from 'vue'

export function useKeyboardInput() {
  const isActive = ref(true)
  
  function handleBlur() {
    isActive.value = false
  }
  
  function handleFocus() {
    isActive.value = true
  }
  
  function handleKeydown(event) {
    if (!isActive.value) return
    // 处理输入
  }
  
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
}
```

---

#### 问题3: 热力图实时更新性能

**难度**: ⭐⭐ (低-中)

**问题描述**:
每次输入后更新所有键的颜色，可能影响性能。

**解决方案**:
```javascript
// 使用 Vue 的响应式系统，只更新变化的部分
const letterStats = reactive({})

function updateHeatmap(letter, correct) {
  if (!letterStats[letter]) {
    letterStats[letter] = { total: 0, correct: 0 }
  }
  letterStats[letter].total++
  if (correct) {
    letterStats[letter].correct++
  }
}

// 计算颜色（自动响应式更新）
function getHeatmapColor(letter) {
  const stats = letterStats[letter]
  if (!stats) return '#9E9E9E' // 灰色（无数据）
  
  const accuracy = stats.correct / stats.total
  if (accuracy >= 0.9) return '#4CAF50' // 绿色
  if (accuracy >= 0.7) return '#FFC107' // 黄色
  return '#F44336' // 红色
}
```

**性能评估**: 26个字母的状态更新，Vue 的响应式系统可以高效处理，不会影响性能。

---

### 4.2 中等难度问题

#### 问题4: 音效播放时机

**难度**: ⭐⭐ (低-中)

**问题描述**:
音效需要在输入瞬间播放，预加载可以避免延迟。

**解决方案**:

```javascript
// 使用 Vite 的静态资源处理（推荐）
import correctSoundUrl from '@/assets/sounds/correct.mp3?url'
import errorSoundUrl from '@/assets/sounds/error.mp3?url'

// 预加载音效
const correctSound = new Audio(correctSoundUrl)
const errorSound = new Audio(errorSoundUrl)

// 预加载
correctSound.load()
errorSound.load()

// 播放（不需要等待加载）
function playCorrectSound() {
  if (!settings.soundEnabled) return
  correctSound.currentTime = 0 // 重置播放位置
  correctSound.play()
}
```

**音效格式建议**:

| 格式 | 优点 | 缺点 | 建议 |
|------|------|------|------|
| mp3 | 体积小、兼容性好 | 专利问题（已过期） | 主格式 |
| ogg | 开源免费、体积适中 | 某些旧版本兼容性 | 备选格式 |

**建议**: 提供 mp3 + ogg 双格式，确保跨平台兼容。

---

#### 问题5: 数据迁移策略

**难度**: ⭐⭐ (低-中)

**问题描述**:
软件更新后，旧版本的数据结构可能不兼容。

**解决方案**:
```javascript
import Store from 'electron-store'

const store = new Store({
  name: 'swifttype-data',
  defaults: {
    version: '1.0', // 数据版本号
    // ...其他默认值
  }
})

// 启动时检查版本
function migrateData() {
  const version = store.get('version')
  
  if (version === '1.0') {
    // 当前版本，无需迁移
    return
  }
  
  if (!version) {
    // 首次使用或旧版本数据
    // 迁移逻辑...
    store.set('version', '1.0')
  }
}
```

---

### 4.3 低难度问题

#### 问题6: 练习内容管理

**难度**: ⭐ (低)

**解决方案**: 使用静态 JSON 文件存储练习内容

```javascript
// data/levels.js - 完整14关卡数据
export const levels = [
  {
    id: 0,
    name: '基准位置',
    letters: ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'],
    practiceCount: 8,
    unlockCondition: null,
    targetAccuracy: null  // 关卡0不计正确率
  },
  {
    id: 1,
    name: '新手村（左手中指）',
    letters: ['E', 'D', 'C'],
    practiceCount: 50,
    unlockCondition: { level: 0, completed: true },
    targetAccuracy: 80
  },
  {
    id: 2,
    name: '左手小指',
    letters: ['Q', 'A', 'Z'],
    practiceCount: 50,
    unlockCondition: { level: 1, accuracy: 80 },
    targetAccuracy: 80
  },
  {
    id: 3,
    name: '左手无名指',
    letters: ['W', 'S', 'X'],
    practiceCount: 50,
    unlockCondition: { level: 2, accuracy: 80 },
    targetAccuracy: 80
  },
  {
    id: 4,
    name: '左手食指',
    letters: ['R', 'F', 'V', 'T', 'G', 'B'],
    practiceCount: 90,
    unlockCondition: { level: 3, accuracy: 80 },
    targetAccuracy: 80
  },
  {
    id: 5,
    name: '右手小指',
    letters: ['P'],
    practiceCount: 30,
    unlockCondition: { level: 4, accuracy: 80 },
    targetAccuracy: 80
  },
  {
    id: 6,
    name: '右手无名指',
    letters: ['O', 'L', '.'],
    practiceCount: 50,
    unlockCondition: { level: 5, accuracy: 80 },
    targetAccuracy: 80
  },
  {
    id: 7,
    name: '右手中指',
    letters: ['I', 'K', ','],
    practiceCount: 50,
    unlockCondition: { level: 6, accuracy: 80 },
    targetAccuracy: 80
  },
  {
    id: 8,
    name: '右手食指',
    letters: ['U', 'J', 'M', 'Y', 'H', 'N'],
    practiceCount: 90,
    unlockCondition: { level: 7, accuracy: 80 },
    targetAccuracy: 80
  },
  {
    id: 9,
    name: '双手基础',
    letters: 'all',  // 所有26个字母混合
    practiceCount: 30,
    unlockCondition: { level: 8, accuracy: 80 },
    targetAccuracy: 85
  },
  {
    id: 10,
    name: '词组练习',
    type: 'words',
    practiceCount: 20,
    unlockCondition: { level: 9, accuracy: 85 },
    targetAccuracy: 85
  },
  {
    id: 11,
    name: '短句练习',
    type: 'sentences',
    practiceCount: 10,
    unlockCondition: { level: 10, accuracy: 85 },
    targetAccuracy: 85
  },
  {
    id: 12,
    name: '文章练习',
    type: 'articles',
    practiceCount: 3,
    unlockCondition: { level: 11, accuracy: 85 },
    targetAccuracy: 90
  },
  {
    id: 13,
    name: '键盘大师',
    type: 'comprehensive',
    practiceCount: 33,  // 20字母 + 10词组 + 3句子
    unlockCondition: { level: 12, accuracy: 90 },
    targetAccuracy: 90
  }
]
```

---

## 五、开源项目参考

### 5.1 可参考的项目

| 项目 | GitHub | 参考价值 |
|------|--------|----------|
| MonkeyType | monkeytypegame/monkeytype | 键盘布局、输入检测、计时器 |
| Keyzen | wwwtyro/keyzen | 极简界面设计 |
| Klavaro | 开源跨平台 | 课程设计思路 |

### 5.2 MonkeyType 核心实现参考

**键盘布局实现**（完整布局，含特殊键）:

```javascript
// 键盘布局数据结构（完整键盘）
const keyboardLayout = [
  // 第一行：Esc + 数字行 + Backspace
  [
    { char: 'Esc', width: 1, finger: null },
    { char: '1', width: 1, finger: 'left-pinky' },
    { char: '2', width: 1, finger: 'left-ring' },
    { char: '3', width: 1, finger: 'left-middle' },
    { char: '4', width: 1, finger: 'left-index' },
    { char: '5', width: 1, finger: 'left-index' },
    { char: '6', width: 1, finger: 'right-index' },
    { char: '7', width: 1, finger: 'right-index' },
    { char: '8', width: 1, finger: 'right-middle' },
    { char: '9', width: 1, finger: 'right-ring' },
    { char: '0', width: 1, finger: 'right-pinky' },
    { char: '-', width: 1, finger: 'right-pinky' },
    { char: '=', width: 1, finger: 'right-pinky' },
    { char: 'Back', width: 2, finger: null }
  ],
  // 第二行：Tab + QWERTY行
  [
    { char: 'Tab', width: 1.5, finger: null },
    { char: 'Q', width: 1, finger: 'left-pinky' },
    { char: 'W', width: 1, finger: 'left-ring' },
    { char: 'E', width: 1, finger: 'left-middle' },
    { char: 'R', width: 1, finger: 'left-index' },
    { char: 'T', width: 1, finger: 'left-index' },
    { char: 'Y', width: 1, finger: 'right-index' },
    { char: 'U', width: 1, finger: 'right-index' },
    { char: 'I', width: 1, finger: 'right-middle' },
    { char: 'O', width: 1, finger: 'right-ring' },
    { char: 'P', width: 1, finger: 'right-pinky' },
    { char: '[', width: 1, finger: 'right-pinky' },
    { char: ']', width: 1, finger: 'right-pinky' },
    { char: '\\', width: 1.5, finger: 'right-pinky' }
  ],
  // 第三行：Caps + ASDF行 + Enter
  [
    { char: 'Caps', width: 1.75, finger: null },
    { char: 'A', width: 1, finger: 'left-pinky' },
    { char: 'S', width: 1, finger: 'left-ring' },
    { char: 'D', width: 1, finger: 'left-middle' },
    { char: 'F', width: 1, finger: 'left-index' },
    { char: 'G', width: 1, finger: 'left-index' },
    { char: 'H', width: 1, finger: 'right-index' },
    { char: 'J', width: 1, finger: 'right-index' },
    { char: 'K', width: 1, finger: 'right-middle' },
    { char: 'L', width: 1, finger: 'right-ring' },
    { char: ';', width: 1, finger: 'right-pinky' },
    { char: "'", width: 1, finger: 'right-pinky' },
    { char: 'Enter', width: 2.25, finger: null }
  ],
  // 第四行：Shift + ZXCV行 + Shift
  [
    { char: 'Shift', width: 2.25, finger: null },
    { char: 'Z', width: 1, finger: 'left-pinky' },
    { char: 'X', width: 1, finger: 'left-ring' },
    { char: 'C', width: 1, finger: 'left-middle' },
    { char: 'V', width: 1, finger: 'left-index' },
    { char: 'B', width: 1, finger: 'left-index' },
    { char: 'N', width: 1, finger: 'right-index' },
    { char: 'M', width: 1, finger: 'right-index' },
    { char: ',', width: 1, finger: 'right-middle' },
    { char: '.', width: 1, finger: 'right-ring' },
    { char: '/', width: 1, finger: 'right-pinky' },
    { char: 'Shift', width: 2.75, finger: null }
  ],
  // 第五行：Ctrl + Alt + Space + Alt + Ctrl
  [
    { char: 'Ctrl', width: 1.25, finger: null },
    { char: 'Alt', width: 1.25, finger: null },
    { char: 'Space', width: 6.25, finger: null },
    { char: 'Alt', width: 1.25, finger: null },
    { char: 'Ctrl', width: 1.25, finger: null }
  ]
]

// 手指-键位映射
const fingerMap = {
  'left-pinky': ['Q', 'A', 'Z', '1', '!', '`'],
  'left-ring': ['W', 'S', 'X', '2', '@'],
  'left-middle': ['E', 'D', 'C', '3', '#'],
  'left-index': ['R', 'F', 'V', 'T', 'G', 'B', '4', '5', '$', '%'],
  'right-index': ['U', 'J', 'M', 'Y', 'H', 'N', '6', '7', '^', '&'],
  'right-middle': ['I', 'K', ',', '8', '*'],
  'right-ring': ['O', 'L', '.', '9', '('],
  'right-pinky': ['P', ';', '/', '[', ']', "'", '-', '=', '\\', '0', ')']
}
```

**输入检测实现**（参考）:
```javascript
// 使用 keydown 事件
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase()
  if (key === currentLetter) {
    // 正确
    handleCorrect()
  } else {
    // 错误
    handleError()
  }
})
```

---

## 六、替代技术方案对比

### 6.1 Tauri vs Electron

| 对比项 | Electron | Tauri |
|--------|----------|-------|
| 打包体积 | ~50-80MB | ~10MB |
| 启动速度 | 2-3秒 | <1秒 |
| 内存占用 | ~150MB | ~30MB |
| 开发难度 | 低 | 中（需要 Rust） |
| 社区成熟度 | 高 | 中 |
| Vue.js 集成 | 简单 | 简单 |
| 本地存储 | electron-store | tauri-plugin-store |

**结论**: 
- 如果性能和体积是核心关注点，Tauri 更优
- 如果开发速度和成熟度是核心关注点，Electron 更优
- 用户已选择 Electron，建议保持（符合"渐进式开发"目标）

### 6.2 纯 Web 应用 vs 桌面应用

| 对比项 | 纯 Web | 桌面应用 |
|--------|--------|----------|
| 安装 | 无需安装 | 需要安装 |
| 离线使用 | 需要额外处理 | 完全支持 |
| 数据存储 | localStorage | 文件系统 |
| 分发 | URL | 安装包 |
| 跨平台 | 完全 | 完全 |

**结论**: 
- 产品设计要求"离线可用"，桌面应用是正确选择
- 纯 Web 应用可以作为后续补充（在线版本）

---

## 七、技术架构建议

### 7.1 项目结构建议

```
SwiftType/
├── package.json
├── electron.vite.config.mjs    # Vite + Electron 配置
├── src/
│   ├── main/                   # Electron 主进程
│   │   ├── index.js            # 主进程入口（含 IPC 处理）
│   │   └── preload.js          # 预加载脚本（暴露安全 API）
│   ├── renderer/               # 渲染进程（Vue 应用）
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   ├── main.js         # Vue 入口
│   │   │   ├── components/
│   │   │   │   ├── Keyboard.vue      # 键盘布局组件（含手指提示）
│   │   │   │   ├── Key.vue           # 单个键组件
│   │   │   │   ├── Practice.vue      # 练习界面
│   │   │   │   ├── LevelSelect.vue   # 关卡选择
│   │   │   │   ├── Result.vue        # 结果反馈
│   │   │   │   ├── Settings.vue      # 设置页面
│   │   │   │   ├── Stats.vue         # 统计页面
│   │   │   │   └── ErrorBoundary.vue # 错误边界组件
│   │   │   ├── composables/
│   │   │   │   ├── useKeyboardInput.js  # 键盘输入逻辑
│   │   │   │   ├── usePractice.js       # 练习流程逻辑
│   │   │   │   ├── useStorage.js        # 数据存储逻辑（IPC）
│   │   │   │   └── useSound.js          # 音效逻辑
│   │   │   ├── data/
│   │   │   │   ├── fingerMap.js         # 手指-键位映射
│   │   │   │   ├── keyboardLayout.js    # 键盘布局数据
│   │   │   │   ├── levels.js            # 关卡定义（完整14关卡）
│   │   │   │   └── texts.js             # 练习文本
│   │   │   └── stores/
│   │   │   │   ├── progress.js          # 进度状态
│   │   │   │   └── settings.js          # 设置状态
│   │   ├── assets/
│   │   │   ├── sounds/
│   │   │   │   ├── correct.mp3
│   │   │   │   ├── correct.ogg
│   │   │   │   ├── error.mp3
│   │   │   │   └── error.ogg
│   │   │   └── images/
│   ├── shared/                 # 共享代码
│   │   └── constants.js
├── tests/
│   ├── unit/                   # 单元测试（Vitest）
│   │   ├── components/
│   │   └── composables/
│   └── e2e/                    # E2E测试（Playwright）
│       ├── practice.spec.js
│       └── levels.spec.js
├── resources/                  # 打包资源
│   ├── icon.icns              # macOS 图标
│   ├── icon.ico               # Windows 图标
│   └── icon.png               # Linux 图标
└── dist/                      # 打包输出
```

### 7.2 electron-vite 配置

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
        external: ['electron', 'electron-store']
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

### 7.3 核心模块设计

#### 键盘组件 (Keyboard.vue)

**职责**: 显示键盘布局，处理高亮和热力图

**Props**:
- `currentLetter`: 当前要输入的字母
- `highlightFinger`: 是否高亮手指区域
- `letterStats`: 热力图数据
- `showHeatmap`: 是否显示热力图

**Events**:
- 无（纯显示组件）

**完整实现（含手指提示）**:

```vue
<template>
  <div class="keyboard">
    <div class="row" v-for="(row, rowIndex) in keyboardLayout" :key="rowIndex">
      <Key 
        v-for="key in row"
        :key="key.char"
        :key-char="key.char"
        :width="key.width"
        :highlight="shouldHighlight(key.char)"
        :finger-color="getFingerColor(key.finger)"
        :heatmap-color="getHeatmapColor(key.char)"
        :show-heatmap="showHeatmap"
      />
    </div>
    <div class="finger-hint" v-if="currentLetter && currentFinger">
      [提示] 用 {{ currentFingerName }} 按 {{ currentLetter }} 键
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Key from './Key.vue'
import { keyboardLayout, fingerMap, fingerNames } from '@/data/keyboardLayout'

const props = defineProps({
  currentLetter: String,
  highlightFinger: Boolean,
  letterStats: Object,
  showHeatmap: Boolean
})

// 判断是否需要高亮当前字母
function shouldHighlight(char) {
  return char === props.currentLetter?.toUpperCase()
}

// 获取手指颜色
function getFingerColor(finger) {
  if (!props.highlightFinger || !finger) return null
  const currentFinger = getCurrentFinger()
  return finger === currentFinger ? '#E8F5E9' : null
}

// 获取当前字母对应的手指
function getCurrentFinger() {
  if (!props.currentLetter) return null
  const letter = props.currentLetter.toUpperCase()
  for (const [finger, letters] of Object.entries(fingerMap)) {
    if (letters.includes(letter)) return finger
  }
  return null
}

// 当前手指名称（中文）
const currentFinger = computed(() => getCurrentFinger())
const currentFingerName = computed(() => {
  return fingerNames[currentFinger.value] || ''
})

// 热力图颜色计算（含边界处理）
function getHeatmapColor(char) {
  if (!props.showHeatmap || !props.letterStats) return null
  
  const stats = props.letterStats[char]
  if (!stats || stats.total === 0) return '#9E9E9E'  // 灰色（无数据）
  
  const accuracy = stats.correct / stats.total
  if (accuracy >= 0.9) return '#4CAF50'  // 绿色（熟练）
  if (accuracy >= 0.7) return '#FFC107'  // 黄色（一般）
  return '#F44336'  // 红色（需要加强）
}
</script>

<style>
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.row {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.finger-hint {
  margin-top: 16px;
  padding: 8px 16px;
  background: #E3F2FD;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}
</style>
```

#### 练习逻辑 (usePractice.js)

**职责**: 管理练习流程、正确率计算、解锁判定

**返回值**:
- `currentLevel`: 当前关卡
- `currentLetter`: 当前字母
- `progress`: 进度（已完成/总数）
- `accuracy`: 正确率
- `handleInput(letter)`: 处理输入
- `nextLetter()`: 下一个字母
- `completeLevel()`: 完成关卡

---

#### 数据存储 (useStorage.js)

**职责**: 与 electron-store 交互

**返回值**:
- `loadProgress()`: 加载进度
- `saveProgress(data)`: 保存进度
- `getLetterStats()`: 获取字母统计
- `updateLetterStats(letter, correct)`: 更新统计
- `getSettings()`: 获取设置
- `updateSettings(key, value)`: 更新设置

---

### 7.4 状态管理建议

使用 **Pinia** 进行状态管理：

```javascript
// stores/progress.js
import { defineStore } from 'pinia'
import { useStorage } from '@/composables/useStorage'

export const useProgressStore = defineStore('progress', () => {
  const storage = useStorage()
  
  const currentLevel = ref(0)
  const levels = ref({})
  const letterStats = ref({})
  
  // 加载存储数据
  function load() {
    const data = storage.loadProgress()
    currentLevel.value = data.currentLevel
    levels.value = data.levels
    letterStats.value = data.letterStats
  }
  
  // 保存
  function save() {
    storage.saveProgress({
      currentLevel: currentLevel.value,
      levels: levels.value,
      letterStats: letterStats.value
    })
  }
  
  return {
    currentLevel,
    levels,
    letterStats,
    load,
    save
  }
})
```

---

## 八、测试策略

### 8.1 测试框架选择

| 测试类型 | 框架 | 用途 |
|----------|------|------|
| 单元测试 | Vitest | 组件、composables、数据逻辑 |
| E2E测试 | Playwright | Electron 应用完整流程 |

### 8.2 Vitest 配置

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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src')
    }
  }
})
```

### 8.3 Playwright 配置

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,  // Electron 测试需要串行
  retries: 2,
  use: {
    headless: false,  // Electron 需要显示窗口
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'electron',
      use: {}
    }
  ]
})
```

### 8.4 Electron 测试策略

**主进程测试**:
- 使用 Node.js 测试环境
- Mock electron API
- 测试 IPC 处理逻辑

**渲染进程测试**:
- 使用 jsdom 环境
- Mock window.swifttypeAPI
- 测试 Vue 组件和 composables

**E2E 测试**:
- 启动完整 Electron 应用
- 测试用户完整流程（关卡选择 → 练习 → 完成）

```javascript
// tests/e2e/practice.spec.js 示例
import { test, expect, ElectronApplication } from '@playwright/test'
import { _electron as electron } from 'playwright'

let electronApp

test.beforeAll(async () => {
  electronApp = await electron.launch({
    path: './dist/mac-arm64/SwiftType.app/Contents/MacOS/SwiftType'
  })
})

test.afterAll(async () => {
  await electronApp.close()
})

test('完整练习流程', async () => {
  const window = await electronApp.firstWindow()
  
  // 点击开始练习
  await window.click('button:text("开始练习")')
  
  // 等待练习界面出现
  await expect(window.locator('.practice-area')).toBeVisible()
  
  // 输入字母
  await window.keyboard.press('E')
  
  // 验证反馈
  await expect(window.locator('.feedback')).toContainText('正确')
})
```

### 8.5 Vue 错误边界组件

```vue
<!-- ErrorBoundary.vue -->
<template>
  <div v-if="error" class="error-boundary">
    <p>出错了，请重启应用</p>
    <p class="error-detail">{{ error.message }}</p>
    <button @click="resetError">重试</button>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

onErrorCaptured((e) => {
  error.value = e
  console.error('组件错误:', e)
  return false  // 阻止错误继续传播
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
}

.error-detail {
  color: #666;
  font-size: 12px;
  margin: 8px 0;
}
</style>
```

---

## 九、性能评估

### 9.1 预期性能指标

| 指标 | 目标值 | 实现难度 |
|------|--------|----------|
| 启动时间 | <3秒 | 低 |
| 内存占用 | <200MB | 低 |
| 输入响应延迟 | <50ms | 低 |
| 界面渲染帧率 | 60fps | 低 |
| 打包体积 | <80MB | 低 |

### 9.2 性能优化建议

1. **延迟加载**: 练习文本和关卡数据按需加载
2. **事件防抖**: 键盘事件不防抖（需要即时响应）
3. **CSS优化**: 使用 CSS Grid 而非 Float/Layout
4. **音频预加载**: 启动时预加载音效文件
5. **存储优化**: 只在关卡完成时保存，不在每次输入时保存

---

## 十、安全性评估

### 10.1 安全风险分析

| 风险 | 级别 | 说明 |
|------|------|------|
| 本地数据泄露 | 低 | 数据仅存储在本地，不上传 |
| 键盘监听滥用 | 低 | 仅在窗口聚焦时监听 |
| 第三方依赖漏洞 | 低 | 使用官方稳定版本 |

### 10.2 安全建议

1. **不收集用户数据**: 完全本地存储
2. **限制键盘监听范围**: 只在应用窗口内监听
3. **定期更新依赖**: 使用 `npm audit` 检查漏洞
4. **不加载外部资源**: 所有资源本地化（音效、图片）

---

## 十一、打包与分发

### 11.1 打包配置建议

```json
// package.json
{
  "build": {
    "appId": "com.swifttype.app",
    "productName": "SwiftType",
    "directories": {
      "output": "dist"
    },
    "files": [
      "src/**/*",
      "resources/**/*"
    ],
    "mac": {
      "category": "public.app-category.education",
      "icon": "resources/icon.icns",
      "target": ["dmg", "zip"]
    },
    "win": {
      "icon": "resources/icon.ico",
      "target": ["nsis", "portable"]
    },
    "linux": {
      "icon": "resources/icon.png",
      "target": ["AppImage", "deb"]
    }
  }
}
```

### 11.2 分发方式

**当前阶段**: 直接安装给孩子使用
- macOS: DMG 安装包
- Windows: NSIS 安装包或 Portable 版本

**后续可选**: GitHub Releases 公开分发

---

## 十二、开发工具链

### 12.1 推荐开发工具

| 工具 | 用途 |
|------|------|
| VS Code | 代码编辑 |
| Vue DevTools | Vue 组件调试 |
| Electron DevTools | Electron 主进程调试 |
| Vite HMR | 热重载 |

### 12.2 推荐库/插件

| 库 | 用途 |
|------|------|
| electron-vite | Electron + Vite 集成 |
| Pinia | Vue 状态管理 |
| VueUse | Vue Composition API 工具集 |

**可选建议**: TypeScript 支持
- 类型安全，减少运行时错误
- 更好的 IDE 支持
- 建议在 Phase 4 或后续版本考虑添加

---

## 十三、技术风险总结

### 13.1 风险矩阵

| 风险类型 | 可能性 | 影响 | 应对措施 |
|----------|--------|------|----------|
| 键盘布局显示问题 | 低 | 中 | 精确设计 + 测试 |
| 数据丢失 | 低 | 高 | 自动保存 + 备份机制 |
| 性能问题 | 低 | 低 | 优化 + 监控 |
| 打包体积过大 | 中 | 低 | 可接受范围 |
| 跨平台兼容问题 | 低 | 中 | 测试多平台 |

### 13.2 总体风险评估

**风险等级**: ⭐⭐ (低)

**结论**: SwiftType 项目技术风险很低，所有核心功能均可使用成熟技术实现，没有需要特殊处理的技术难点。

---

## 十四、可行性总结

### 14.1 最终评估

| 评估项 | 结果 |
|--------|------|
| 技术可行性 | ✅ 100% |
| 实现难度 | ⭐⭐ 低-中 |
| 开发周期 | 符合预期（~6周） |
| 技术风险 | ⭐⭐ 低 |

### 14.2 建议

1. ✅ **保持现有技术栈**: Electron + Vue.js 完全满足需求
2. ✅ **优先完成 MVP**: 先实现单字母练习核心功能
3. ⚠️ **预留迁移空间**: 数据结构设计考虑版本升级
4. ⚠️ **测试多平台**: 打包后在 macOS 和 Windows 测试

---

## 十五、下一步

**Phase 0: 项目初始化**
1. 创建 Electron + Vue 项目骨架
2. 配置 electron-vite
3. 实现 preload.js + IPC 通信机制
4. 配置 electron-store
5. 创建基础组件结构
6. 配置测试框架（Vitest + Playwright）

---

*技术调研完成，所有功能可实现，风险可控*