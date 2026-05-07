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