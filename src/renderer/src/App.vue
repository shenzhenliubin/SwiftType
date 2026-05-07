<!-- src/renderer/src/App.vue
  Vue 根组件（页面路由 - 条件渲染 + 侧边栏布局）
-->
<template>
  <ErrorBoundary>
    <!-- 全屏页面：用户选择 -->
    <UserSelect
      v-if="currentPage === 'userSelect'"
      @selected="onUserSelected"
    />

    <!-- 侧边栏布局：所有其他页面 -->
    <div v-else class="app-layout">
      <Sidebar
        :active-nav="sidebarActiveNav"
        @navigate="onNavigate"
        @switch-user="showUserSelect"
      />
      <div class="main-content">
        <Home
          v-if="currentPage === 'home'"
          @start-practice="startPractice"
          @select-level="showProgress"
        />
        <MyProgress
          v-else-if="currentPage === 'progress'"
          @start-practice="startPractice"
        />
        <MyPractice
          v-else-if="currentPage === 'myPractice'"
        />
        <Settings
          v-else-if="currentPage === 'settings'"
        />
        <Practice
          v-else-if="currentPage === 'practice'"
          :level-id="currentLevelId"
          @complete="handlePracticeComplete"
          @back="goHome"
        />
        <Result
          v-else-if="currentPage === 'result'"
          :result="practiceResult"
          @next-level="goNextLevel"
          @next-difficulty="goNextDifficulty"
          @retry="retryLevel"
          @home="goHome"
          @progress="showProgress"
        />
      </div>
    </div>
  </ErrorBoundary>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import UserSelect from './components/UserSelect.vue'
import Home from './components/Home.vue'
import Practice from './components/Practice.vue'
import Result from './components/Result.vue'
import Sidebar from './components/Sidebar.vue'
import MyProgress from './components/MyProgress.vue'
import MyPractice from './components/MyPractice.vue'
import Settings from './components/Settings.vue'
import { useProgressStore } from './stores/progress'
import { useSettingsStore } from './stores/settings'
import { useUserStore } from './stores/user'
import { getNextSubLevelId } from '@/data/levels'

// Stores
const progressStore = useProgressStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

// 状态
const currentPage = ref('userSelect')
const currentLevelId = ref('basic-tutorial')
const practiceResult = ref(null)

// 侧边栏高亮：练习和结果页面高亮首页
const sidebarActiveNav = computed(() => {
  if (currentPage.value === 'practice' || currentPage.value === 'result') return 'home'
  return currentPage.value
})

// 方法
function startPractice(levelId) {
  currentLevelId.value = levelId || progressStore.currentSubLevel
  currentPage.value = 'practice'
}

function showProgress() {
  currentPage.value = 'progress'
}

function handlePracticeComplete(result) {
  practiceResult.value = result
  currentPage.value = 'result'
}

async function goNextLevel() {
  const result = practiceResult.value
  if (!result?.unlocked) return

  // 所有关卡都需要通过挑战模式才能解锁下一关
  if (result.difficulty !== 'challenge') return

  const nextId = getNextSubLevelId(currentLevelId.value)
  if (nextId) {
    await progressStore.setCurrentSubLevel(nextId)
    currentLevelId.value = nextId
    currentPage.value = 'practice'
  }
}

function retryLevel() {
  currentPage.value = 'practice'
}

// 难度递进：重新进入同一关卡，Practice.vue 会根据进度自动切换到更高难度
function goNextDifficulty() {
  currentPage.value = 'practice'
}

function goHome() {
  currentPage.value = 'home'
}

function showUserSelect() {
  currentPage.value = 'userSelect'
}

function onUserSelected() {
  currentLevelId.value = progressStore.currentSubLevel
  currentPage.value = 'home'
}

function onNavigate(page) {
  currentPage.value = page
}

// 初始化
onMounted(async () => {
  await userStore.loadUsers()
  await settingsStore.loadSettings()
  currentPage.value = 'userSelect'
})
</script>

<style>
@import '../styles/global.css';
</style>
