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
        external: ['electron'],
        input: {
          preload: path.resolve(__dirname, 'src/main/preload.js')
        }
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
    }
  }
})
