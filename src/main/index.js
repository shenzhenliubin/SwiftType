// src/main/index.js

import { app, BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import path from 'path'

// electron-store 配置
const store = new Store({
  name: 'swifttype-data',
  defaults: {
    version: '3.0',
    users: [{ id: 'default', name: '默认用户', avatar: '👤', createdAt: new Date().toISOString().split('T')[0] }],
    currentUserId: 'default',
    userProgress: {
      default: {
        currentLevel: 'basic-tutorial',
        levels: {},
        letterStats: {},
        totalPracticeTime: 0
      }
    },
    settings: {
      soundEnabled: true,
      restReminder: false,
      restReminderMinutes: 30,
      showHeatmap: true,
      showFingerHint: true,
      difficulty: 'beginner'
    }
  }
})

// 创建窗口（安全配置）
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 820,
    minWidth: 600,        // 产品设计要求的最小宽度
    minHeight: 680,
    resizable: true,
    fullscreenable: true,
    title: 'SwiftType - 敏捷打字练习',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,   // 安全：必须开启，隔离预加载脚本和渲染进程
      nodeIntegration: false,   // 安全：必须关闭，渲染进程不能直接访问 Node.js
      sandbox: true,            // 安全：启用沙箱模式
      webSecurity: true         // 安全：启用 Web 安全
    }
  })

  // 加载渲染进程页面
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')  // Vite 开发服务器
    // DevTools 不自动打开，避免窗口焦点被抢占导致需要双击
    // 需要调试时手动取消注释下行：
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // 页面加载完成后再最大化并聚焦，避免 macOS 下首次点击被 OS 拦截
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.maximize()
    mainWindow.focus()
  })
}

// IPC 处理器
ipcMain.handle('store:get', (event, key) => {
  if (typeof key !== 'string') throw new Error('Invalid key')
  return store.get(key)
})
ipcMain.handle('store:set', (event, key, value) => {
  if (typeof key !== 'string') throw new Error('Invalid key')
  store.set(key, value)
})
ipcMain.handle('store:getAll', () => store.store)
ipcMain.handle('store:delete', (event, key) => {
  if (typeof key !== 'string') throw new Error('Invalid key')
  store.delete(key)
})
ipcMain.handle('app:getVersion', () => app.getVersion())
ipcMain.handle('app:quit', () => app.quit())

// 数据迁移（启动时检查）
function migrateData() {
  const version = store.get('version')

  // 当前版本，无需迁移
  if (version === '3.0') {
    // 补全老数据中可能缺失的 settings 字段
    const settings = store.get('settings') || {}
    if (settings.difficulty === undefined) {
      store.set('settings.difficulty', 'beginner')
    }
    if (settings.restReminderMinutes === undefined) {
      store.set('settings.restReminderMinutes', 30)
    }
    return
  }

  // v1 → v2：关卡系统从整数 ID 重构为字符串 ID，重置关卡进度
  if (version === '1.0') {
    store.set('levels', {})
    store.set('currentLevel', 'basic-tutorial')
    store.set('version', '2.0')
    // 继续迁移到 v3
  }

  // v2 → v3：引入多用户体系，将顶层进度数据移入 userProgress
  if (version === '2.0' || version === '1.0') {
    const oldProgress = {
      currentLevel: store.get('currentLevel') || 'basic-tutorial',
      levels: store.get('levels') || {},
      letterStats: store.get('letterStats') || {},
      totalPracticeTime: store.get('totalPracticeTime') || 0
    }
    store.set('users', [{ id: 'default', name: '默认用户', avatar: '👤', createdAt: new Date().toISOString().split('T')[0] }])
    store.set('currentUserId', 'default')
    store.set('userProgress', { default: oldProgress })
    // 清除旧顶层字段
    store.delete('currentLevel')
    store.delete('levels')
    store.delete('letterStats')
    store.delete('totalPracticeTime')
    // 确保 settings 包含新字段
    store.set('settings.difficulty', 'beginner')
    store.set('settings.restReminderMinutes', 30)
    store.set('version', '3.0')
    return
  }

  // 首次使用，初始化数据版本
  if (!version) {
    store.set('version', '3.0')
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

app.on('activate', () => {
  // macOS 点击 Dock 图标时重新创建窗口
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})