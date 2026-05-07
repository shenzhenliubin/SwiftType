<!-- src/renderer/src/components/MyPractice.vue
  我的练习统计页面
-->
<template>
  <div class="my-practice page">
    <h2 class="page-title">我的练习</h2>

    <!-- 核心统计 -->
    <div class="stats-grid">
      <div class="stat-card card">
        <span class="stat-icon">⏱️</span>
        <span class="stat-value">{{ formatTime(totalPracticeTime) }}</span>
        <span class="stat-label">总练习时间</span>
      </div>
      <div class="stat-card card">
        <span class="stat-icon">⌨️</span>
        <span class="stat-value">{{ totalKeystrokes }}</span>
        <span class="stat-label">总击键次数</span>
      </div>
      <div class="stat-card card">
        <span class="stat-icon">🎯</span>
        <span class="stat-value">{{ totalAccuracy }}%</span>
        <span class="stat-label">总正确率</span>
      </div>
      <div class="stat-card card">
        <span class="stat-icon">✅</span>
        <span class="stat-value">{{ completedCount }}</span>
        <span class="stat-label">已完成关卡</span>
      </div>
    </div>

    <!-- 评级统计 -->
    <div class="rating-section card">
      <h3 class="section-title">评级统计</h3>
      <div class="rating-list">
        <div
          v-for="rating in ratingList"
          :key="rating.id"
          class="rating-row"
        >
          <span class="rating-icon">{{ rating.icon }}</span>
          <span class="rating-name">{{ rating.name }}</span>
          <div class="rating-bar-container">
            <div
              class="rating-bar-fill"
              :style="{ width: getRatingPercent(rating.id) + '%', background: rating.color }"
            ></div>
          </div>
          <span class="rating-count">{{ getRatingCount(rating.id) }} 关</span>
        </div>
      </div>
    </div>

    <!-- 字母熟练度 -->
    <div class="letter-section card">
      <h3 class="section-title">字母熟练度</h3>
      <div class="letter-grid">
        <div
          v-for="letter in alphabetLetters"
          :key="letter"
          class="letter-item"
          :class="getLetterClass(letter)"
        >
          <span class="letter-char">{{ letter }}</span>
          <span class="letter-accuracy">{{ getLetterAccuracy(letter) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import { ratingList } from '@/data/ratings'
import { getTotalSubLevelCount } from '@/data/levels'
import { formatTime } from '@/utils/formatTime'

const progressStore = useProgressStore()

const totalPracticeTime = computed(() => progressStore.totalPracticeTime)
const totalAccuracy = computed(() => progressStore.totalAccuracy)
const completedCount = computed(() => progressStore.completedCount)
const levels = computed(() => progressStore.levels)
const letterStats = computed(() => progressStore.letterStats)

// 总击键次数
const totalKeystrokes = computed(() => {
  let total = 0
  Object.values(letterStats.value).forEach(s => {
    total += s.total
  })
  return total
})

// 字母 + 数字
const alphabetLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')

// 各评级数量
function getRatingCount(ratingId) {
  return Object.values(levels.value).filter(l => l.completed && l.rating === ratingId).length
}

// 评级百分比（用于进度条）
function getRatingPercent(ratingId) {
  const total = getTotalSubLevelCount()
  if (total === 0) return 0
  return Math.round((getRatingCount(ratingId) / total) * 100)
}

// 字母正确率
function getLetterAccuracy(letter) {
  const stats = letterStats.value[letter]
  if (!stats || stats.total === 0) return '--'
  return Math.round((stats.correct / stats.total) * 100) + '%'
}

// 字母熟练度等级
function getLetterClass(letter) {
  const stats = letterStats.value[letter]
  if (!stats || stats.total === 0) return 'empty'
  const accuracy = stats.correct / stats.total
  if (accuracy >= 0.9) return 'mastered'
  if (accuracy >= 0.8) return 'proficient'
  if (accuracy >= 0.6) return 'beginner'
  return 'needs-practice'
}
</script>

<style scoped>
.my-practice {
  padding: 24px;
  overflow-y: auto;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 20px;
}

/* 核心统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
}

.stat-icon {
  font-size: 28px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-light);
}

/* 评级统计 */
.rating-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 16px;
}

.rating-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-icon {
  font-size: 20px;
  width: 28px;
  text-align: center;
}

.rating-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  width: 50px;
}

.rating-bar-container {
  flex: 1;
  height: 8px;
  background: var(--color-bg-dark);
  border-radius: 4px;
  overflow: hidden;
}

.rating-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.rating-count {
  font-size: 13px;
  color: var(--color-text-light);
  width: 40px;
  text-align: right;
}

/* 字母熟练度 */
.letter-section {
  margin-bottom: 20px;
}

.letter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.letter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 42px;
  padding: 6px 0;
  border-radius: 8px;
  background: var(--color-bg-dark);
}

.letter-item.mastered {
  background: #FEF3C7;
}

.letter-item.proficient {
  background: #D1FAE5;
}

.letter-item.beginner {
  background: #E0E7FF;
}

.letter-item.needs-practice {
  background: #FEE2E2;
}

.letter-item.empty {
  background: var(--color-bg-dark);
}

.letter-char {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.letter-accuracy {
  font-size: 11px;
  color: var(--color-text-light);
}
</style>
