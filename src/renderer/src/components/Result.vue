<!-- src/renderer/src/components/Result.vue
  结果反馈页面（基于 Stitch 设计参考）
-->
<template>
  <div class="result page">
    <!-- 庆祝背景 -->
    <div class="celebration-bg">
      <div class="confetti c1">&#10022;</div>
      <div class="confetti c2">&#9733;</div>
      <div class="confetti c3">&#10022;</div>
      <div class="confetti c4">&#9733;</div>
    </div>

    <div class="result-container">
      <!-- 奖杯图标区域 -->
      <div class="trophy-area">
        <div class="trophy-glow"></div>
        <div class="trophy-circle">
          <span class="trophy-icon">{{ isPassed ? '🏆' : '💪' }}</span>
        </div>
        <div class="deco-star deco-1">&#9733;</div>
        <div class="deco-sparkle deco-2">&#10022;</div>
      </div>

      <!-- 标题 + 副标题 + 解锁提示 -->
      <div class="title-section">
        <h2 class="result-title">{{ isPassed ? '练习完成！' : '继续加油！' }}</h2>
        <p class="result-subtitle">{{ isPassed ? '太棒了，你又进了一步！' : '别灰心，再试一次吧！' }}</p>
        <span v-if="isPassed && difficultyLabel" class="difficulty-tag">{{ difficultyLabel }}通过</span>
        <span v-if="isPassed && canUnlockNext" class="unlock-inline">解锁下一关！</span>
      </div>

      <!-- 评级徽章 -->
      <div v-if="currentRating" class="rating-badge">
        <span class="rating-icon">{{ currentRating.icon }}</span>
        <span class="rating-name">{{ currentRating.name }}</span>
      </div>

      <!-- 统计数据 -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-bar green"></div>
          <span class="stat-emoji">✅</span>
          <div class="stat-value-group">
            <span class="stat-value green">{{ result?.accuracy }}</span>
            <span class="stat-unit green">%</span>
          </div>
          <span class="stat-label">正确率</span>
        </div>
        <div class="stat-card">
          <div class="stat-bar blue"></div>
          <span class="stat-emoji">⏱️</span>
          <div class="stat-value-group">
            <span class="stat-value blue">{{ formatTime(result?.time) }}</span>
          </div>
          <span class="stat-label">用时</span>
        </div>
        <div class="stat-card">
          <div class="stat-bar amber"></div>
          <span class="stat-emoji">👆</span>
          <div class="stat-value-group">
            <span class="stat-value amber">{{ result?.totalInputs }}</span>
          </div>
          <span class="stat-label">输入次数</span>
        </div>
      </div>

      <!-- 未达标提示 -->
      <div v-if="!isPassed && result" class="fail-tip">
        正确率需达到 {{ targetAccuracy }}% 才能解锁下一关
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <!-- Primary：难度递进 / 继续下一关（蓝色） -->
        <button
          v-if="isPassed && nextAction === 'difficulty'"
          class="result-btn primary"
          @click="goNextDifficulty"
        >
          <span>进入{{ nextDifficultyLabel }}模式</span>
          <span class="btn-arrow">→</span>
        </button>
        <button
          v-else-if="isPassed && nextAction === 'next-level' && hasNextLevel"
          class="result-btn primary"
          @click="goNextLevel"
        >
          <span>继续下一关</span>
          <span class="btn-arrow">→</span>
        </button>

        <!-- Secondary：我的进度（绿色） -->
        <button class="result-btn secondary" @click="goProgress">
          <span class="btn-icon">📊</span>
          <span>我的进度</span>
        </button>

        <!-- Tertiary：再练一次（灰色） -->
        <button class="result-btn tertiary" @click="retryLevel">
          <span class="btn-icon">🔄</span>
          <span>再练一次</span>
        </button>

        <!-- Ghost：返回首页（纯文字） -->
        <button class="result-btn ghost" @click="goHome">
          <span class="btn-icon-sm">🏠</span>
          <span>返回首页</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import { getSubLevel, getNextSubLevelId, getDifficultyLabel } from '@/data/levels'
import { getRating } from '@/data/ratings'
import { formatTime } from '@/utils/formatTime'

// Props
const props = defineProps({
  result: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['next-level', 'retry', 'home', 'progress', 'next-difficulty'])

// Store
const progressStore = useProgressStore()

// 计算属性
const isPassed = computed(() => props.result?.unlocked)

const level = computed(() => {
  if (!props.result) return null
  return getSubLevel(props.result.levelId)
})

const targetAccuracy = computed(() => level.value?.targetAccuracy || 0)

const currentRating = computed(() => {
  if (!props.result) return null
  return getRating(props.result.accuracy)
})

const hasNextLevel = computed(() => {
  if (!props.result) return false
  return !!getNextSubLevelId(props.result.levelId)
})

// 当前通过的难度标签
const difficultyLabel = computed(() => {
  if (!props.result?.difficulty) return ''
  return getDifficultyLabel(props.result.difficulty)
})

// 是否可以解锁下一关（需要通过挑战模式）
const canUnlockNext = computed(() => {
  if (!isPassed.value) return false
  return props.result?.difficulty === 'challenge'
})

// 下一步动作：'difficulty' = 进入下一个难度，'next-level' = 解锁下一关
const nextAction = computed(() => {
  if (!isPassed.value) return null
  if (props.result?.difficulty === 'challenge') return 'next-level'
  if (props.result?.difficulty === 'beginner') return 'difficulty'
  if (props.result?.difficulty === 'intermediate') return 'difficulty'
  return 'next-level'
})

// 下一个难度的中文标签
const nextDifficultyLabel = computed(() => {
  if (props.result?.difficulty === 'beginner') return getDifficultyLabel('intermediate')
  if (props.result?.difficulty === 'intermediate') return getDifficultyLabel('challenge')
  return ''
})

function goNextLevel() { emit('next-level') }
function goNextDifficulty() { emit('next-difficulty') }
function retryLevel() { emit('retry') }
function goHome() { emit('home') }
function goProgress() { emit('progress') }
</script>

<style scoped>
.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--color-bg);
}

/* ========== 庆祝背景 ========== */
.celebration-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(180deg, #DBEAFE 0%, #EFF6FF 60%, var(--color-bg) 100%);
  z-index: 0;
}

.confetti {
  position: absolute;
  font-size: 20px;
  opacity: 0.35;
}

.c1 { top: 12%; left: 15%; color: var(--color-primary); animation: float 3s ease-in-out infinite; }
.c2 { top: 8%; right: 20%; color: var(--color-success); animation: float 3s ease-in-out infinite 0.5s; }
.c3 { top: 25%; left: 30%; color: #F59E0B; animation: float 3s ease-in-out infinite 1s; }
.c4 { top: 20%; right: 10%; color: var(--color-primary); animation: float 3s ease-in-out infinite 1.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(15deg); }
}

/* ========== 容器 ========== */
.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 40px;
  gap: 20px;
  z-index: 1;
  width: 100%;
  max-width: 480px;
}

/* ========== 奖杯区域 ========== */
.trophy-area {
  position: relative;
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.trophy-glow {
  position: absolute;
  inset: 0;
  background: #FDE68A;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(24px);
}

.trophy-circle {
  position: relative;
  z-index: 1;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FDE68A 0%, #FBBF24 50%, #F59E0B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4);
  border: 4px solid #FFFFFF;
}

.trophy-icon {
  font-size: 48px;
}

/* 装饰星星 */
.deco-star, .deco-sparkle {
  position: absolute;
  z-index: 2;
}

.deco-1 {
  top: 0;
  right: 10px;
  background: #D9F99D;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #365314;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: rotate(12deg);
  animation: twinkle 2s ease-in-out infinite;
}

.deco-2 {
  bottom: 6px;
  left: 6px;
  background: #DBEAFE;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #1E3A5F;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: rotate(-12deg);
  animation: twinkle 2s ease-in-out infinite 0.7s;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.7; transform: rotate(12deg) scale(1); }
  50% { opacity: 1; transform: rotate(12deg) scale(1.15); }
}

/* ========== 标题区域 ========== */
.title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.result-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.result-subtitle {
  font-size: 16px;
  color: var(--color-text-light);
  margin: 0;
}

.unlock-inline {
  font-size: 14px;
  font-weight: 600;
  color: #065F46;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  padding: 3px 14px;
  border-radius: 20px;
  margin-top: 2px;
}

.difficulty-tag {
  font-size: 13px;
  font-weight: 600;
  color: #1E40AF;
  background: #DBEAFE;
  border: 1px solid #93C5FD;
  padding: 3px 12px;
  border-radius: 20px;
  margin-top: 2px;
}

/* ========== 评级徽章 ========== */
.rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 28px;
  background: var(--color-bg-card);
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
}

.rating-icon {
  font-size: 28px;
}

.rating-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

/* ========== 统计卡片 ========== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
}

.stat-card {
  background: var(--color-bg-card);
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.stat-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.8;
}

.stat-bar.green { background: #52C41A; }
.stat-bar.blue { background: #1E6FBA; }
.stat-bar.amber { background: #D97706; }

.stat-emoji {
  font-size: 20px;
  margin-bottom: 2px;
}

.stat-value-group {
  display: flex;
  align-items: baseline;
  gap: 1px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
}

.stat-value.green { color: #52C41A; }
.stat-value.blue { color: #1E6FBA; }
.stat-value.amber { color: #D97706; }

.stat-unit {
  font-size: 14px;
  font-weight: 500;
}

.stat-unit.green { color: #52C41A; }

.stat-label {
  font-size: 13px;
  color: var(--color-text-light);
  margin-top: 2px;
}

/* ========== 未达标提示 ========== */
.fail-tip {
  padding: 10px 24px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 10px;
  font-size: 14px;
  color: #991B1B;
}

/* ========== 按钮区域 ========== */
.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  width: 100%;
}

/* Primary：蓝色实心 */
.result-btn.primary {
  width: 100%;
  padding: 16px 24px;
  font-size: 18px;
  font-weight: 600;
  font-family: var(--font-family);
  color: #FFFFFF;
  background: #1E6FBA;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(30, 111, 186, 0.25);
  transition: all 0.15s ease;
}

.result-btn.primary:hover {
  background: #155FA0;
}

.result-btn.primary:active {
  transform: scale(0.98);
}

.btn-arrow {
  font-size: 18px;
}

/* Secondary：绿色实心 */
.result-btn.secondary {
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-family);
  color: #FFFFFF;
  background: #376B00;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(55, 107, 0, 0.2);
  transition: all 0.15s ease;
}

.result-btn.secondary:hover {
  background: #285000;
}

.result-btn.secondary:active {
  transform: scale(0.98);
}

/* Tertiary：灰色背景 */
.result-btn.tertiary {
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 500;
  font-family: var(--font-family);
  color: var(--color-text);
  background: #E5E9EB;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s ease;
}

.result-btn.tertiary:hover {
  background: #D5D9DB;
}

.result-btn.tertiary:active {
  transform: scale(0.98);
}

/* Ghost：纯文字 */
.result-btn.ghost {
  width: 100%;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-family);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
  transition: color 0.15s ease;
}

.result-btn.ghost:hover {
  color: var(--color-text);
}

.btn-icon {
  font-size: 18px;
}

.btn-icon-sm {
  font-size: 14px;
}
</style>
