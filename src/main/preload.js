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
  deleteStore: (key) => ipcRenderer.invoke('store:delete', key),
  getAllData: () => ipcRenderer.invoke('store:getAll'),

  // 应用信息
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  quitApp: () => ipcRenderer.invoke('app:quit'),

  // 平台信息（preload 可以访问 process，不需要 IPC）
  getPlatform: () => process.platform
})