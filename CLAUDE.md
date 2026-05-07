# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SwiftType 是一个儿童键盘打字学习 Electron 桌面应用。使用 Vue 3 Composition API + Pinia + electron-store 构建。中文界面。

## Commands

```bash
npm run dev          # 启动开发服务器（electron-vite dev，渲染进程在 localhost:5173）
npm run build        # 构建应用（输出到 out/）
npm run test         # 运行所有单元测试（Vitest watch 模式）
npm run test:unit    # 单次运行单元测试
npm run test:e2e     # 运行 E2E 测试（Playwright，目前无测试文件）
npm run pack         # 打包（不生成安装包）
npm run dist         # 生成可分发安装包
npm start            # 预览已构建的应用
```

运行单个测试文件：
```bash
npx vitest run tests/unit/path/to/file.test.js
```

## Architecture

### 三进程 Electron 架构

```
Main Process (src/main/index.js)
  ├── electron-store 持久化存储（swifttype-data）
  ├── IPC handlers: store:get/set/delete/getAll, app:getVersion/quit
  └── 数据版本迁移（v1→v2→v3）

Preload (src/main/preload.js)
  └── contextBridge 暴露 window.swifttypeAPI（安全边界）

Renderer (src/renderer/src/)
  └── Vue 3 SPA（条件渲染路由，无 vue-router）
```

安全配置：contextIsolation=true, nodeIntegration=false, sandbox=true。渲染进程只能通过 `window.swifttypeAPI` 访问数据。

### 渲染进程结构

**页面路由**：App.vue 通过 `currentPage` ref 做条件渲染，无 vue-router。页面有 userSelect → (home, practice, result, progress, myPractice, settings)。

**数据流**：
- `composables/useStorage.js` — IPC 通信层，封装所有 `swifttypeAPI` 调用
- `stores/` — Pinia stores（progress, settings, user），业务逻辑层
- `composables/usePractice.js` — 练习核心逻辑（序列生成、正确率、解锁判定）
- `composables/useKeyboardInput.js` — 键盘事件处理
- `composables/useFallingLetters.js` — 下落字母模式
- `composables/useSound.js` — 音效播放

**关卡系统** (`data/levels.js`)：
- 4 阶段（basic → word → sentence → paragraph），每阶段有多个子关卡
- 子关卡类型：tutorial, finger, finger-pair, finger-triple, word, sentence, comprehensive
- 顺序解锁机制，需在前一关卡达到 80% 正确率

**难度递进** (`data/difficultySettings.js`)：
- beginner（静止）→ intermediate（字母下落）→ challenge（快速下落）
- 每个子关卡需依次通过三种难度，challenge 通过才算完成
- 只有通过 challenge 才能解锁下一关

**手指映射** (`data/fingerMap.js`)：定义 8 个手指各自负责的键位。

### 多用户系统

用户数据存储在 `userProgress.{userId}` 路径下，每个用户独立进度。设置（settings）是全局共享的。

### 路径别名

`@` → `src/renderer/src`（Vite 和 Vitest 共用此别名）

## Key Conventions

- 纯 JavaScript 项目，无 TypeScript
- Vue 3 Composition API + `<script setup>`
- Pinia stores 使用 setup store 风格（函数式定义）
- 不可变更新模式（spread operator 更新 state）
- 代码注释使用中文
- electron-store 数据格式有版本迁移机制（当前 v3.0），修改数据结构时需考虑迁移
