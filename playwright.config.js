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