<!-- src/renderer/src/components/MyProgress.vue
  我的进度页面（合并原 LevelSelect + MyProgress）
-->
<template>
  <div class="my-progress page">
    <h2 class="page-title">我的进度</h2>

    <!-- 进度概览 -->
    <div class="progress-overview card">
      <div class="overview-header">
        <span class="overview-icon">📍</span>
        <span class="overview-label">当前进度</span>
      </div>
      <div class="current-progress">
        <div class="progress-stage">
          <span class="stage-name">{{ currentStageName }}</span>
          <span class="stage-detail">{{ currentSubLevelName }}</span>
        </div>
        <div class="progress-numbers">
          <span class="big-number">{{ completedCount }}</span>
          <span class="divider">/</span>
          <span class="total-number">{{ totalSubLevels }}</span>
          <span class="unit">关卡已完成</span>
        </div>
      </div>
      <div class="overall-progress-bar">
        <div class="progress-bar" :style="{ width: overallPercent + '%' }"></div>
      </div>
      <span class="percent-text">{{ overallPercent }}%</span>
    </div>

    <!-- 阶段列表（可折叠） -->
    <div class="stage-list">
      <div
        v-for="stage in stageStates"
        :key="stage.id"
        class="stage-section"
      >
        <!-- 阶段标题 -->
        <div
          class="stage-header"
          @click="toggleStage(stage.id)"
        >
          <div class="stage-info">
            <span class="stage-emoji">{{ stage.icon }}</span>
            <div>
              <span class="stage-name-text">{{ stage.name }}</span>
              <span class="stage-desc">{{ stage.description }}</span>
            </div>
          </div>
          <div class="stage-meta">
            <span class="stage-progress-text">
              {{ stage.completedCount }}/{{ stage.totalCount }}
            </span>
            <span class="stage-toggle">{{ expandedStages[stage.id] ? '▾' : '▸' }}</span>
          </div>
        </div>

        <!-- 阶段进度条 -->
        <div class="stage-progress-bar">
          <div
            class="stage-bar-fill"
            :style="{ width: getStagePercent(stage) + '%' }"
          ></div>
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
              <span class="level-status-icon" :class="getStatusClass(item)">
                {{ getStatusIcon(item) }}
              </span>
              <div class="level-info">
                <span class="level-name">{{ item.name }}</span>
                <span class="level-type">{{ getTypeLabel(item.type) }}</span>
              </div>
            </div>
            <div class="level-right">
              <!-- 难度进度（Stage 2+ 显示） -->
              <div v-if="item.requiredDifficulties.length > 1" class="difficulty-dots">
                <span
                  v-for="d in item.requiredDifficulties"
                  :key="d"
                  class="diff-dot"
                  :class="{ completed: item.difficultyProgress?.[d]?.completed }"
                  :title="getDifficultyName(d)"
                >{{ getDifficultyShort(d) }}</span>
              </div>
              <template v-if="item.completed">
                <span class="rating-badge">{{ getRatingIcon(item.rating) }}</span>
                <span class="status-accuracy">{{ item.accuracy }}%</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue'
import { useProgressStore } from '@/stores/progress'
import { stages, getStageForSubLevel, getSubLevel, getTotalSubLevelCount, getRequiredDifficulties } from '@/data/levels'
import { getRatingById } from '@/data/ratings'

const emit = defineEmits(['start-practice'])

const progressStore = useProgressStore()

const totalSubLevels = getTotalSubLevelCount()
const completedCount = computed(() => progressStore.completedCount)
const currentSubLevel = computed(() => progressStore.currentSubLevel)

// 当前进度百分比
const overallPercent = computed(() => {
  if (totalSubLevels === 0) return 0
  return Math.round((completedCount.value / totalSubLevels) * 100)
})

// 当前阶段名称
const currentStageName = computed(() => {
  const stage = getStageForSubLevel(currentSubLevel.value)
  return stage ? stage.name : ''
})

// 当前子关卡名称
const currentSubLevelName = computed(() => {
  const subLevel = getSubLevel(currentSubLevel.value)
  return subLevel ? subLevel.name : ''
})

// 折叠状态
const expandedStages = reactive({})

function toggleStage(stageId) {
  expandedStages[stageId] = !expandedStages[stageId]
}

// 预计算阶段和子关卡状态
const stageStates = computed(() => {
  return stages.map(stage => {
    const subLevels = stage.subLevels.map(sl => {
      const progress = progressStore.getLevelProgress(sl.id)
      return {
        ...sl,
        unlocked: progressStore.checkLevelUnlocked(sl.id),
        completed: progress?.completed === true,
        isCurrent: progressStore.currentSubLevel === sl.id,
        accuracy: progress?.accuracy,
        rating: progress?.rating || null,
        difficultyProgress: progress?.difficultyProgress || null,
        requiredDifficulties: getRequiredDifficulties(sl.id)
      }
    })
    const completedCount = subLevels.filter(sl => sl.completed).length
    return {
      ...stage,
      subLevels,
      completedCount,
      totalCount: stage.subLevels.length
    }
  })
})

// 阶段完成百分比
function getStagePercent(stage) {
  if (stage.totalCount === 0) return 0
  return Math.round((stage.completedCount / stage.totalCount) * 100)
}

// 类型标签
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

// 评级图标
function getRatingIcon(ratingId) {
  if (!ratingId) return ''
  const rating = getRatingById(ratingId)
  return rating ? rating.icon : ''
}

// 选择关卡
function selectLevel(item) {
  if (!item.unlocked) return
  emit('start-practice', item.id)
}

// 难度名称
function getDifficultyName(d) {
  return { beginner: '新手', intermediate: '进阶', challenge: '挑战' }[d] || d
}

// 难度短名
function getDifficultyShort(d) {
  return { beginner: '新', intermediate: '进', challenge: '挑' }[d] || d
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
.my-progress {
  padding: 24px;
  overflow-y: auto;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 20px;
}

/* 进度概览 */
.progress-overview {
  margin-bottom: 16px;
}

.overview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.overview-icon {
  font-size: 20px;
}

.overview-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.current-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.progress-stage {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stage-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
}

.stage-detail {
  font-size: 14px;
  color: var(--color-text-light);
}

.progress-numbers {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.big-number {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-primary);
}

.divider {
  font-size: 20px;
  color: var(--color-text-muted);
}

.total-number {
  font-size: 20px;
  color: var(--color-text-light);
}

.unit {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-left: 4px;
}

.overall-progress-bar {
  width: 100%;
  height: 10px;
  background: var(--color-bg-dark);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 6px;
}

.overall-progress-bar .progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.percent-text {
  font-size: 13px;
  color: var(--color-text-muted);
}

/* 阶段列表 */
.stage-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stage-section {
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  background: var(--color-bg-card);
  overflow: hidden;
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

.stage-emoji {
  font-size: 24px;
}

.stage-name-text {
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

.stage-progress-text {
  font-size: 13px;
  color: var(--color-text-light);
  font-weight: 600;
}

.stage-toggle {
  font-size: 14px;
  color: var(--color-text-muted);
}

/* 阶段进度条 */
.stage-progress-bar {
  width: calc(100% - 36px);
  height: 4px;
  background: var(--color-bg-dark);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 18px;
}

.stage-bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 子关卡列表 */
.sub-level-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border-color);
  margin-top: 10px;
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
}

.level-card.is-locked {
  opacity: 0.5;
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

/* 右侧：难度进度 + 评级 + 正确率 */
.level-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 难度进度点 */
.difficulty-dots {
  display: flex;
  gap: 3px;
}

.diff-dot {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: var(--color-bg-dark);
  color: var(--color-text-muted);
}

.diff-dot.completed {
  background: var(--color-success);
  color: #FFFFFF;
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
</style>
