// src/renderer/src/stores/progress.js
// 进度状态管理（Pinia Store，多用户版）

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { isSubLevelUnlocked, getStage, getStageForSubLevel } from '@/data/levels'
import { getRating } from '@/data/ratings'

export const useProgressStore = defineStore('progress', () => {
  const currentSubLevel = ref('basic-tutorial')
  const levels = ref({})
  const letterStats = ref({})
  const totalPracticeTime = ref(0)

  const storage = useStorage()

  // 当前用户 ID（由外部设置）
  const userId = ref('default')

  const completedCount = computed(() => {
    return Object.values(levels.value).filter(l => l.completed).length
  })

  const totalAccuracy = computed(() => {
    const stats = letterStats.value
    let total = 0
    let correct = 0
    Object.values(stats).forEach(s => {
      total += s.total
      correct += s.correct
    })
    if (total === 0) return 0
    return Math.round((correct / total) * 100)
  })

  const isCurrentLevelUnlocked = computed(() => {
    return isSubLevelUnlocked(currentSubLevel.value, { levels: levels.value })
  })

  // 加载当前用户进度
  async function loadProgress() {
    const data = await storage.loadUserProgress(userId.value)
    currentSubLevel.value = data.currentLevel || 'basic-tutorial'
    levels.value = data.levels || {}
    letterStats.value = data.letterStats || {}
    totalPracticeTime.value = data.totalPracticeTime || 0
  }

  // 设置用户 ID（切换用户时调用）
  function setUserId(id) {
    userId.value = id
  }

  async function saveProgress() {
    await storage.saveProgress(userId.value, {
      currentLevel: currentSubLevel.value,
      levels: levels.value
    })
  }

  async function setCurrentSubLevel(subLevelId) {
    currentSubLevel.value = subLevelId
    await saveProgress()
  }

  // 更新关卡完成状态（含评级计算 + 难度递进）
  async function updateLevelComplete(subLevelId, accuracy, time, difficulty) {
    const rating = getRating(accuracy)
    const currentDifficulty = difficulty || 'beginner'

    const existing = levels.value[subLevelId] || {}
    const existingDP = existing.difficultyProgress || {}

    // 更新难度进度
    const newDP = {
      ...existingDP,
      [currentDifficulty]: {
        completed: true,
        accuracy: Math.max(existingDP[currentDifficulty]?.accuracy || 0, accuracy)
      }
    }

    // 所有关卡都需要通过挑战模式才算完成
    const completed = newDP.challenge?.completed === true

    // 构造新的关卡数据
    const newLevelData = {
      completed,
      accuracy: Math.max(existing.accuracy || 0, accuracy),
      bestTime: Math.min(existing.bestTime || Infinity, time),
      attempts: (existing.attempts || 0) + 1,
      rating: Math.max(existing.rating || 0, rating.id),
      completedAt: completed ? new Date().toISOString().split('T')[0] : existing.completedAt,
      difficultyProgress: newDP
    }

    // 更新 store 状态
    levels.value = {
      ...levels.value,
      [subLevelId]: newLevelData
    }

    // 存储层只负责写入计算好的数据
    await storage.saveLevelData(userId.value, subLevelId, newLevelData)
  }

  async function updateLetterStats(letter, isCorrect) {
    await storage.updateLetterStats(userId.value, letter, isCorrect)

    const current = letterStats.value[letter] || { total: 0, correct: 0 }
    letterStats.value = {
      ...letterStats.value,
      [letter]: {
        total: current.total + 1,
        correct: current.correct + (isCorrect ? 1 : 0)
      }
    }
  }

  async function updatePracticeTime(seconds) {
    await storage.updatePracticeTime(userId.value, seconds)
    totalPracticeTime.value += seconds
  }

  function getLevelProgress(subLevelId) {
    return levels.value[subLevelId] || null
  }

  function checkLevelUnlocked(subLevelId) {
    return isSubLevelUnlocked(subLevelId, { levels: levels.value })
  }

  function getStageProgress(stageId) {
    const stage = getStage(stageId)
    if (!stage) return { completed: 0, total: 0 }
    let completed = 0
    stage.subLevels.forEach(sl => {
      if (levels.value[sl.id]?.completed) completed++
    })
    return { completed, total: stage.subLevels.length }
  }

  // 获取子关卡当前应使用的难度
  function getDifficultyForLevel(subLevelId) {
    return getDifficultyForSubLevel(subLevelId, { levels: levels.value })
  }

  // 判断子关卡是否还有更高难度需要通过
  function hasNextDifficulty(subLevelId) {
    const progress = levels.value[subLevelId]
    if (!progress?.difficultyProgress) return true
    return !progress.difficultyProgress.challenge?.completed
  }

  // 获取下一个难度 ID
  function getNextDifficulty(subLevelId) {
    const progress = levels.value[subLevelId]
    const dp = progress?.difficultyProgress
    if (!dp?.beginner?.completed) return 'intermediate'
    if (!dp?.intermediate?.completed) return 'challenge'
    return null
  }

  function setCurrentLevel(subLevelId) {
    setCurrentSubLevel(subLevelId)
  }

  return {
    currentSubLevel,
    currentLevel: currentSubLevel,
    levels,
    letterStats,
    totalPracticeTime,
    userId,
    completedCount,
    totalAccuracy,
    isCurrentLevelUnlocked,
    loadProgress,
    setUserId,
    saveProgress,
    setCurrentSubLevel,
    setCurrentLevel,
    updateLevelComplete,
    updateLetterStats,
    updatePracticeTime,
    getLevelProgress,
    checkLevelUnlocked,
    getStageProgress,
    getDifficultyForLevel,
    hasNextDifficulty,
    getNextDifficulty
  }
})
