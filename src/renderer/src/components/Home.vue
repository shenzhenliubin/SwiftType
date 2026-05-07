<!-- src/renderer/src/components/Home.vue
  首页组件（侧边栏布局下的内容区）
-->
<template>
  <div class="home page">
    <!-- Logo 和标题 -->
    <header class="home-header">
      <div class="logo">
        <span class="logo-icon">⌨️</span>
        <h1 class="logo-title">SwiftType</h1>
      </div>
      <p class="subtitle">儿童键盘打字学习软件</p>
    </header>

    <!-- 练习进度卡片 -->
    <section class="progress-summary card">
      <h3 class="card-title">练习进度</h3>
      <div class="stat-row">
        <div class="stat">
          <span class="stat-value">{{ currentLevelName }}</span>
          <span class="stat-label">当前关卡</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ completedCount }}/{{ totalLevels }}</span>
          <span class="stat-label">已完成</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ totalAccuracy }}%</span>
          <span class="stat-label">总正确率</span>
        </div>
      </div>
      <!-- 总进度条 -->
      <div class="overall-progress">
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: `${overallPercent}%` }"></div>
        </div>
        <span class="progress-text">{{ overallPercent }}%</span>
      </div>
    </section>

    <!-- 操作按钮 -->
    <section class="actions">
      <button class="btn btn-large action-btn" @click="startPractice">
        开始练习
      </button>
      <button class="btn btn-secondary btn-large action-btn" @click="selectLevel">
        选择关卡
      </button>
    </section>

    <!-- 提示 -->
    <footer class="home-footer">
      <p class="tip">按键盘上的字母键开始练习</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import { getSubLevel, getTotalSubLevelCount } from '@/data/levels'

const emit = defineEmits(['start-practice', 'select-level', 'switch-user'])

const progressStore = useProgressStore()

const currentLevelName = computed(() => {
  const level = getSubLevel(progressStore.currentSubLevel)
  return level?.name || '基准位置'
})

const completedCount = computed(() => progressStore.completedCount)
const totalLevels = computed(() => getTotalSubLevelCount())
const totalAccuracy = computed(() => progressStore.totalAccuracy)

const overallPercent = computed(() => {
  if (totalLevels.value === 0) return 0
  return Math.round((completedCount.value / totalLevels.value) * 100)
})

function startPractice() {
  emit('start-practice', progressStore.currentSubLevel)
}

function selectLevel() {
  emit('select-level')
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 48px 32px;
}

.home-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 48px;
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
}

.subtitle {
  font-size: 16px;
  color: var(--color-text-light);
}

.progress-summary {
  width: 100%;
  max-width: 420px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-light);
}

.overall-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.overall-progress .progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg-dark);
  border-radius: 4px;
  overflow: hidden;
}

.overall-progress .progress-bar-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width var(--transition-normal);
}

.progress-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  min-width: 36px;
  text-align: right;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 300px;
}

.action-btn {
  width: 100%;
  padding: 16px 32px;
  font-size: 20px;
}

.home-footer {
  margin-top: 16px;
}

.tip {
  font-size: 14px;
  color: var(--color-text-muted);
}
</style>
