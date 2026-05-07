<!-- src/renderer/src/components/LevelSelect.vue
  关卡选择页面（Tab 难度切换 + 阶段分组 + 进度条）
-->
<template>
  <div class="level-select page">
    <!-- 顶部标题栏 -->
    <header class="level-select-header">
      <button class="btn btn-small btn-back" @click="goHome">&larr; 返回</button>
      <h2 class="page-title">选择关卡</h2>
    </header>

    <!-- Tab 样式难度选择 -->
    <div class="difficulty-tabs">
      <button
        v-for="d in difficultyList"
        :key="d.id"
        class="tab-item"
        :class="{ 'is-active': currentDifficulty === d.id }"
        @click="changeDifficulty(d.id)"
      >
        {{ d.name }}
      </button>
    </div>

    <!-- 阶段列表 -->
    <div class="stage-list">
      <div
        v-for="stage in stageStates"
        :key="stage.id"
        class="stage-section"
      >
        <!-- 阶段标题（可折叠） -->
        <div
          class="stage-header"
          @click="toggleStage(stage.id)"
        >
          <div class="stage-info">
            <span class="stage-order">{{ stage.order }}</span>
            <div>
              <span class="stage-name">{{ stage.name }}</span>
              <span class="stage-desc">{{ stage.description }}</span>
            </div>
          </div>
          <div class="stage-meta">
            <span class="stage-progress">{{ stage.completedCount }}/{{ stage.totalCount }}</span>
            <span class="stage-toggle">{{ expandedStages[stage.id] ? '▾' : '▸' }}</span>
          </div>
        </div>

        <!-- 子关卡列表（折叠内容） -->
        <div v-if="expandedStages[stage.id]" class="sub-level-list">
          <div
            v-for="item in stage.subLevels"
            :key="item.id"
            class="level-card"
            :class="{
              'is-locked': !item.unlocked,
              'is-completed': item.completed,
              'is-current': item.isCurrent
            }"
            @click="selectLevel(item)"
          >
            <div class="level-left">
              <!-- 状态图标 -->
              <span class="level-status-icon" :class="getStatusClass(item)">
                {{ getStatusIcon(item) }}
              </span>
              <div class="level-info">
                <span class="level-name">{{ item.name }}</span>
                <span class="level-type">{{ getTypeLabel(item.type) }}</span>
              </div>
            </div>

            <div class="level-right">
              <!-- 评级图标 + 正确率（已完成） -->
              <template v-if="item.completed">
                <span class="rating-badge">{{ getRatingIcon(item.rating) }}</span>
                <span class="status-accuracy">{{ item.accuracy }}%</span>
              </template>
              <!-- 迷你进度条 -->
              <div class="mini-progress">
                <div
                  class="mini-progress-fill"
                  :class="getProgressClass(item)"
                  :style="{ width: getProgressWidth(item) }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue'
import { stages, getSubLevel } from '@/data/levels'
import { useProgressStore } from '@/stores/progress'
import { useSettingsStore } from '@/stores/settings'
import { difficultyList } from '@/data/difficultySettings'
import { RATING } from '@/data/ratings'

// Emits
const emit = defineEmits(['start-practice', 'home'])

// Stores
const progressStore = useProgressStore()
const settingsStore = useSettingsStore()

// 当前难度
const currentDifficulty = computed(() => settingsStore.difficulty)

// 折叠状态
const expandedStages = reactive({})

function toggleStage(stageId) {
  expandedStages[stageId] = !expandedStages[stageId]
}

// 预计算阶段和子关卡状态
const stageStates = computed(() => {
  return stages.map(stage => {
    const stageProgress = progressStore.getStageProgress(stage.id)
    const subLevels = stage.subLevels.map(sl => {
      const progress = progressStore.getLevelProgress(sl.id)
      return {
        ...sl,
        unlocked: progressStore.checkLevelUnlocked(sl.id),
        completed: progress?.completed === true,
        isCurrent: progressStore.currentSubLevel === sl.id,
        accuracy: progress?.accuracy,
        rating: progress?.rating || null
      }
    })
    return {
      ...stage,
      subLevels,
      completedCount: stageProgress.completed,
      totalCount: stageProgress.total
    }
  })
})

// 类型标签映射
function getTypeLabel(type) {
  const labels = {
    tutorial: '教学',
    finger: '手指练习',
    'finger-pair': '双指组合',
    'finger-triple': '三指组合',
    word: '词组',
    sentence: '短句',
    comprehensive: '综合'
  }
  return labels[type] || type
}

// 状态图标
function getStatusIcon(item) {
  if (item.completed) return '✓'
  if (item.unlocked) return '▶'
  return '🔒'
}

function getStatusClass(item) {
  if (item.completed) return 'status-completed'
  if (item.unlocked) return 'status-unlocked'
  return 'status-locked'
}

// 获取评级图标
function getRatingIcon(ratingId) {
  const icons = { 1: '🌱', 2: '🌿', 3: '🌳', 4: '⭐' }
  return icons[ratingId] || '🌱'
}

// 进度条样式
function getProgressClass(item) {
  if (item.completed) return 'fill-completed'
  if (item.unlocked) return 'fill-active'
  return 'fill-locked'
}

function getProgressWidth(item) {
  if (item.completed) return '100%'
  if (item.unlocked) return '0%'
  return '0%'
}

// 难度切换
async function changeDifficulty(difficultyId) {
  await settingsStore.setDifficulty(difficultyId)
}

// 选择关卡
function selectLevel(item) {
  if (!item.unlocked) return
  emit('start-practice', item.id)
}

// 返回首页
function goHome() {
  emit('home')
}

// 默认展开第一个未完成阶段
onMounted(() => {
  for (const stage of stageStates.value) {
    if (stage.completedCount < stage.totalCount) {
      expandedStages[stage.id] = true
      break
    }
  }
  if (Object.keys(expandedStages).length === 0 && stageStates.value.length > 0) {
    expandedStages[stageStates.value[0].id] = true
  }
})
</script>

<style scoped>
.level-select {
  padding: 0;
}

.level-select-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--color-bg-card);
}

.btn-back {
  font-size: 14px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

/* Tab 样式难度选择 */
.difficulty-tabs {
  display: flex;
  gap: 0;
  padding: 0 24px;
  border-bottom: 2px solid var(--color-bg-dark);
  background: var(--color-bg-card);
}

.tab-item {
  padding: 12px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-light);
  position: relative;
  transition: color var(--transition-fast);
}

.tab-item:hover {
  color: var(--color-primary);
}

.tab-item.is-active {
  color: var(--color-primary);
  font-weight: 600;
}

.tab-item.is-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-primary);
  border-radius: 3px 3px 0 0;
}

/* 阶段列表 */
.stage-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 阶段区块 */
.stage-section {
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  background: var(--color-bg-card);
}

/* 阶段标题 */
.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.stage-header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.stage-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stage-order {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 700;
}

.stage-name {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.stage-desc {
  display: block;
  font-size: 12px;
  color: var(--color-text-muted);
}

.stage-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stage-progress {
  font-size: 13px;
  color: var(--color-text-light);
  font-weight: 600;
}

.stage-toggle {
  font-size: 14px;
  color: var(--color-text-muted);
}

/* 子关卡列表 */
.sub-level-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border-color);
}

/* 关卡卡片 */
.level-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--border-color);
}

.level-card:last-child {
  border-bottom: none;
  border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm);
}

.level-card.is-locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.level-card.is-completed {
  border-left: 3px solid var(--color-success);
}

.level-card.is-current {
  border-left: 3px solid var(--color-primary);
  background: linear-gradient(135deg, rgba(30, 111, 186, 0.08), rgba(30, 111, 186, 0.02));
}

.level-card:not(.is-locked):hover {
  background: rgba(0, 0, 0, 0.03);
}

/* 左侧：状态图标 + 信息 */
.level-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.level-status-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.status-completed {
  background: var(--color-success);
  color: #FFFFFF;
}

.status-unlocked {
  background: var(--color-primary);
  color: #FFFFFF;
}

.status-locked {
  background: var(--color-bg-dark);
  color: var(--color-text-muted);
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.level-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.level-type {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 右侧：评级 + 正确率 + 进度条 */
.level-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.rating-badge {
  font-size: 18px;
}

.status-accuracy {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-success);
  min-width: 40px;
  text-align: right;
}

/* 迷你进度条 */
.mini-progress {
  width: 60px;
  height: 4px;
  background: var(--color-bg-dark);
  border-radius: 2px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width var(--transition-normal);
}

.fill-completed {
  background: var(--color-success);
}

.fill-active {
  background: var(--color-primary);
}

.fill-locked {
  background: var(--color-bg-dark);
}
</style>
