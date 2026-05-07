// src/renderer/src/stores/settings.js
// 设置状态管理（Pinia Store）

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { DIFFICULTY } from '@/data/difficultySettings'

/**
 * 设置状态管理 Store
 * 负责：
 * - 音效开关
 * - 热力图显示开关
 * - 手指提示开关
 * - 休息提醒设置
 */
export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const soundEnabled = ref(true)           // 音效开关
  const heatmapEnabled = ref(true)         // 热力图显示开关
  const fingerHintEnabled = ref(true)      // 手指提示开关
  const restReminderEnabled = ref(false)   // 休息提醒开关（与主进程默认值一致）
  const restReminderMinutes = ref(30)      // 休息提醒间隔（分钟）
  const difficulty = ref(DIFFICULTY.BEGINNER) // 难度模式

  // Storage composable
  const storage = useStorage()

  // 加载设置
  async function loadSettings() {
    const settings = await storage.getSettings()
    if (settings) {
      soundEnabled.value = settings.soundEnabled ?? true
      heatmapEnabled.value = settings.heatmapEnabled ?? true
      fingerHintEnabled.value = settings.fingerHintEnabled ?? true
      restReminderEnabled.value = settings.restReminderEnabled ?? false
      restReminderMinutes.value = settings.restReminderMinutes ?? 30
      difficulty.value = settings.difficulty ?? DIFFICULTY.BEGINNER
    }
  }

  // 更新音效设置
  async function setSoundEnabled(value) {
    soundEnabled.value = value
    await storage.updateSettings('soundEnabled', value)
  }

  // 更新热力图设置
  async function setHeatmapEnabled(value) {
    heatmapEnabled.value = value
    await storage.updateSettings('heatmapEnabled', value)
  }

  // 更新手指提示设置
  async function setFingerHintEnabled(value) {
    fingerHintEnabled.value = value
    await storage.updateSettings('fingerHintEnabled', value)
  }

  // 更新休息提醒开关
  async function setRestReminderEnabled(value) {
    restReminderEnabled.value = value
    await storage.updateSettings('restReminderEnabled', value)
  }

  // 更新休息提醒间隔
  async function setRestReminderMinutes(value) {
    restReminderMinutes.value = value
    await storage.updateSettings('restReminderMinutes', value)
  }

  // 更新难度
  async function setDifficulty(value) {
    difficulty.value = value
    await storage.updateSettings('difficulty', value)
  }

  return {
    // 状态
    soundEnabled,
    heatmapEnabled,
    fingerHintEnabled,
    restReminderEnabled,
    restReminderMinutes,
    difficulty,

    // Actions
    loadSettings,
    setSoundEnabled,
    setHeatmapEnabled,
    setFingerHintEnabled,
    setRestReminderEnabled,
    setRestReminderMinutes,
    setDifficulty
  }
})