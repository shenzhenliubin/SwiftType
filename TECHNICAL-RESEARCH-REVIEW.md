# SwiftType 技术调研文档 Review

**Review 日期**: 2026-04-21
**Review 视角**: 技术实现可行性
**Review 目标**: 识别技术文档中的问题、遗漏和风险

---

## 一、关键问题（必须修复）

### 1.1 electron-store 在渲染进程中的使用方式错误

**问题描述**:

文档第159-183行展示了在渲染进程中直接使用 electron-store 的代码示例：

```javascript
import Store from 'electron-store'
const store = new Store({ ... })
```

**技术事实**:
- electron-store **默认只能在主进程中使用**
- 渲染进程（Vue 应用）无法直接访问 Node.js API（包括 electron-store）
- 需要通过 preload.js 暂时暴露 API，或使用 IPC 通信

**正确实现方式**:

方案1：通过 preload.js 暴露 API（推荐）

```javascript
// preload.js
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('swifttypeAPI', {
  getStore: (key) => ipcRenderer.invoke('store:get', key),
  setStore: (key, value) => ipcRenderer.invoke('store:set', key, value)
})

// main/index.js
import Store from 'electron-store'
const store = new Store({ ... })

ipcMain.handle('store:get', (event, key) => store.get(key))
ipcMain.handle('store:set', (event, key, value) => store.set(key, value))

// renderer/composables/useStorage.js
export function useStorage() {
  return {
    loadProgress: () => window.swifttypeAPI.getStore('progress'),
    saveProgress: (data) => window.swifttypeAPI.setStore('progress', data)
  }
}
```

方案2：使用 electron-store 的渲染进程版本（需要配置 nodeIntegration）

```javascript
// 在 BrowserWindow 配置中启用 nodeIntegration（不推荐，安全风险）
new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false  // 不推荐
  }
})
```

**严重程度**: 🔴 **高** - 直接影响代码实现

**建议修复**:
- 更新数据存储代码示例，使用 preload.js + IPC 方案
- 补充 preload.js 的具体实现内容

---

### 1.2 缺少 Electron 安全配置说明

**问题描述**:

文档缺少 Electron 安全配置的关键说明：

| 缺失配置 | 默认值 | 建议值 | 说明 |
|----------|--------|--------|------|
| contextIsolation | true | true | 必须开启，隔离预加载脚本和渲染进程 |
| nodeIntegration | false | false | 必须关闭，渲染进程不能直接访问 Node.js |
| sandbox | true | true | 启用沙箱模式 |
| webSecurity | true | true | 启用 Web 安全 |

**建议补充**:

```javascript
// main/index.js - BrowserWindow 配置
const mainWindow = new BrowserWindow({
  width: 800,
  height: 600,
  minWidth: 600,  // 产品设计要求的最小宽度
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,   // 安全：必须开启
    nodeIntegration: false,   // 安全：必须关闭
    sandbox: true             // 安全：启用沙箱
  }
})
```

**严重程度**: 🔴 **高** - 安全相关

---

### 1.3 preload.js 内容缺失

**问题描述**:

项目结构（第502-503行）提到了 preload.js，但没有给出具体内容和实现。

preload.js 是 Electron 应用的关键组件，需要：
- 暴露 electron-store 操作 API
- 暴露可能的系统级操作（如获取应用版本）

**建议补充**:

```javascript
// preload.js 完整示例
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('swifttypeAPI', {
  // 数据存储
  getData: () => ipcRenderer.invoke('store:getAll'),
  setData: (key, value) => ipcRenderer.invoke('store:set', key, value),
  
  // 应用信息
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // 平台信息
  getPlatform: () => process.platform
})
```

---

## 二、设计细节缺失

### 2.1 缺少窗口配置说明

**问题描述**:

产品设计文档提到：
- 最小宽度：600px（第563行）
- 键盘布局固定比例

技术文档缺少对应的窗口配置说明。

**建议补充**:

```javascript
// 窗口配置建议
const mainWindow = new BrowserWindow({
  width: 900,
  height: 700,
  minWidth: 600,        // 产品设计要求
  minHeight: 500,
  resizable: true,
  fullscreenable: false, // 儿童应用不建议全屏
  title: 'SwiftType - 敏捷打字练习'
})
```

---

### 2.2 缺少 electron-vite 配置内容

**问题描述**:

项目结构（第499行）提到了 `electron.vite.config.mjs`，但没有给出具体配置内容。

electron-vite 是 Electron + Vue 项目的核心构建工具，配置影响：
- 开发环境热重载
- 生产环境打包
- 主进程/渲染进程/预加载脚本的分离

**建议补充**:

```javascript
// electron.vite.config.mjs 示例
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

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
  },
  renderer: {
    // 渲染进程配置
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve('src/renderer/src')
      }
    }
  }
})
```

---

### 2.3 缺少 IPC 通信机制说明

**问题描述**:

Electron 应用中，主进程和渲染进程通过 IPC（Inter-Process Communication）通信。文档没有详细说明：
- ipcMain.handle / ipcRenderer.invoke（异步通信）
- ipcMain.on / ipcRenderer.send（同步通信）

**建议补充**: 添加 IPC 通信机制说明章节

---

### 2.4 音效文件打包路径处理缺失

**问题描述**:

代码示例（第333-345行）使用相对路径加载音效：

```javascript
const correctSound = new Audio('./assets/correct.mp3')
```

**问题**: 打包后的路径可能不正确，需要特殊处理。

**正确实现**:

```javascript
// 使用 Vite 的静态资源处理
import correctSoundUrl from '@/assets/sounds/correct.mp3'
import errorSoundUrl from '@/assets/sounds/error.mp3'

const correctSound = new Audio(correctSoundUrl)
const errorSound = new Audio(errorSoundUrl)

// 或使用 public 目录（Vite 会直接复制）
const correctSound = new Audio('/sounds/correct.mp3')
```

---

### 2.5 音效格式选择建议

**问题描述**:

文档选择 mp3 格式（第530-533行），但没有考虑跨平台兼容性。

| 格式 | 优点 | 缺点 |
|------|------|------|
| mp3 | 体积小、兼容性好 | 专利问题（已过期，但仍需注意） |
| wav | 无专利问题、质量高 | 体积大 |
| ogg | 开源免费、体积适中 | 某些旧版本兼容性问题 |

**建议**:
- 使用 mp3 或 ogg 格式
- 音效文件体积很小（<50KB），wav 也可以接受
- 提供多种格式备选（mp3 + ogg）

---

## 三、与产品设计文档的不一致

### 3.1 数据时间单位不一致

**产品设计文档**（第689行）:
```json
"bestTime": 180  // 秒
```

**技术文档**: 没有明确说明时间单位

**建议**: 在技术文档中明确说明时间存储单位（秒）

---

### 3.2 关卡数据结构字段不一致

**产品设计文档关卡定义**:
```json
{
  "id": 1,
  "name": "新手村",
  "letters": ["E", "D", "C"],
  "practiceCount": 50
}
```

**技术文档关卡定义**（第402-412行）:
```javascript
{
  id: 1,
  name: '新手村',
  letters: ['E', 'D', 'C'],
  practiceCount: 50
}
```

**不一致**: 技术文档缺少产品设计中的完整字段：
- `unlockCondition`
- `targetAccuracy`

**建议修复**: 补充关卡定义的完整字段

---

### 3.3 关卡总数不一致

**产品设计**: 14个关卡（关卡0 + 关卡1-13）
**技术文档**: 代码示例只展示关卡0和关卡1

**建议**: 补充完整关卡数据结构示例

---

## 四、代码示例问题

### 4.1 Keyboard.vue 组件缺少手指标注实现

**问题描述**:

Keyboard.vue 示例（第108-141行）只展示了键的显示和高亮，缺少：
- 手指区域高亮的实现
- 手指提示文字的显示位置
- 手指图标标注（产品设计提到可选）

**建议补充**:

```vue
<template>
  <div class="keyboard">
    <div class="row" v-for="row in keyboardLayout">
      <Key 
        v-for="key in row"
        :key-char="key.char"
        :highlight="shouldHighlight(key.char)"
        :finger-color="getFingerColor(key.finger)"
      />
    </div>
    <div class="finger-hint">
      [提示] 用 {{ currentFinger }} 按 {{ currentLetter }} 键
    </div>
  </div>
</template>
```

---

### 4.2 缺少热力图颜色计算的边界处理

**问题描述**:

热力图颜色计算（第306-314行）缺少边界处理：

```javascript
function getHeatmapColor(letter) {
  const stats = letterStats[letter]
  if (!stats) return '#9E9E9E'
  
  const accuracy = stats.correct / stats.total
  // 缺少 stats.total === 0 的处理
}
```

**建议修复**:

```javascript
function getHeatmapColor(letter) {
  const stats = letterStats[letter]
  if (!stats || stats.total === 0) return '#9E9E9E'
  
  const accuracy = stats.correct / stats.total
  if (accuracy >= 0.9) return '#4CAF50'
  if (accuracy >= 0.7) return '#FFC107'
  return '#F44336'
}
```

---

### 4.3 缺少键盘特殊键的处理

**问题描述**:

键盘布局数据（第432-438行）缺少特殊键：
- Tab、CapsLock、Shift、Enter、Backspace、Space

虽然产品设计只关注字母练习，但键盘可视化需要显示完整布局。

**建议补充**:

```javascript
const keyboardLayout = [
  // 第一行：包含 Esc、数字行、Backspace
  ['Esc', '1', '2', ..., 'Backspace'],
  // 第二行：包含 Tab、字母行
  ['Tab', 'q', 'w', ...],
  // 第三行：包含 CapsLock、字母行、Enter
  ['Caps', 'a', 's', ..., 'Enter'],
  // 第四行：包含 Shift、字母行
  ['Shift', 'z', 'x', ...],
  // 第五行：包含 Ctrl、Alt、Space
  ['Ctrl', 'Alt', 'Space', ...]
]
```

---

## 五、测试框架缺失

### 5.1 缺少测试框架选择

**问题描述**:

项目结构（第536-539行）有 tests/ 目录，但没有说明：
- 单元测试框架（建议： Vitest）
- E2E 测试框架（建议： Playwright）

**建议补充**:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js']
  }
})

// playwright.config.js
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    headless: true
  }
})
```

---

### 5.2 缺少 Electron 测试策略说明

**问题描述**:

Electron 应用的测试有特殊性：
- 主进程测试需要特殊环境
- 渲染进程测试可以使用 jsdom
- E2E 测试需要启动完整应用

**建议补充**: 添加 Electron 测试策略说明

---

## 六、其他建议

### 6.1 添加 TypeScript 支持

**建议**: 考虑添加 TypeScript 支持
- 类型安全
- 更好的 IDE 支持
- 减少运行时错误

对于儿童应用，稳定性很重要，TypeScript 可以帮助。

---

### 6.2 添加错误边界处理

**建议**: Vue 组件添加错误边界

```vue
<!-- ErrorBoundary.vue -->
<template>
  <div v-if="error">
    出错了，请重启应用
  </div>
  <slot v-else />
</template>

<script setup>
const error = ref(null)

onErrorCaptured((e) => {
  error.value = e
  return false
})
</script>
```

---

### 6.3 添加自动更新机制

**建议**: 考虑添加 electron-updater 自动更新

对于儿童应用，家长可能不会主动更新，自动更新可以确保使用最新版本。

```javascript
import { autoUpdater } from 'electron-updater'

autoUpdater.checkForUpdatesAndNotify()
```

---

## 七、Review 总结

### 问题优先级分类

| 优先级 | 问题数量 | 说明 |
|--------|----------|------|
| 🔴 高 | 3 | electron-store使用错误、安全配置缺失、preload.js缺失 |
| 🟡 中 | 8 | 设计细节缺失、代码示例不完整、测试框架缺失 |
| 🟢 低 | 3 | TypeScript支持、错误边界、自动更新（建议项） |

### 必须修复的问题

1. **修复 electron-store 使用方式**（最高优先）
2. **补充 Electron 安全配置说明**
3. **补充 preload.js 完整实现**
4. **补充窗口配置说明**
5. **补充 IPC 通信机制说明**

---

## 八、下一步建议

建议按以下顺序修复：

1. 更新数据存储实现方式（preload.js + IPC）
2. 补充 Electron 安全配置章节
3. 补充 preload.js 完整内容
4. 补充窗口配置说明
5. 补充 electron-vite 配置内容
6. 补充测试框架选择和配置

---

*技术 Review 完成，等待修复后确认*