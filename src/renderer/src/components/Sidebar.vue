<!-- src/renderer/src/components/Sidebar.vue
  侧边栏导航组件
-->
<template>
  <aside class="sidebar">
    <!-- 用户信息 -->
    <div class="sidebar-user" @click="$emit('switch-user')">
      <div class="user-avatar-circle">{{ currentUser?.avatar }}</div>
      <div class="user-info">
        <span class="user-name">{{ currentUser?.name }}</span>
        <span class="user-level-tag">{{ levelLabel }}</span>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ 'is-active': activeNav === item.id }"
        @click="onNavClick(item)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- 底部退出按钮 -->
    <button class="nav-item quit-item" @click="quitApp">
      <span class="nav-icon">⏻</span>
      <span class="nav-label">退出应用</span>
    </button>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useProgressStore } from '@/stores/progress'
import { getTotalSubLevelCount } from '@/data/levels'
import { useStorage } from '@/composables/useStorage'

const storage = useStorage()

defineProps({
  activeNav: {
    type: String,
    default: 'home'
  }
})

const emit = defineEmits(['navigate', 'switch-user'])

const userStore = useUserStore()
const progressStore = useProgressStore()

const currentUser = computed(() => userStore.currentUser)

const navItems = [
  { id: 'home', label: '首页', icon: '🏠', page: 'home' },
  { id: 'progress', label: '我的进度', icon: '📊', page: 'progress' },
  { id: 'myPractice', label: '我的练习', icon: '🏆', page: 'myPractice' },
  { id: 'settings', label: '设置', icon: '⚙️', page: 'settings' }
]

// 根据完成关卡数计算等级标签
const levelLabel = computed(() => {
  const total = getTotalSubLevelCount()
  const completed = progressStore.completedCount
  const ratio = total > 0 ? completed / total : 0
  if (ratio >= 0.9) return `等级${completed}·打字大师`
  if (ratio >= 0.6) return `等级${completed}·明星选手`
  if (ratio >= 0.3) return `等级${completed}·进步之星`
  if (completed > 0) return `等级${completed}·初学者`
  return '新手打字员'
})

function onNavClick(item) {
  emit('navigate', item.page)
}

function quitApp() {
  storage.quitApp()
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  height: 100%;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  gap: var(--spacing-md);
  overflow-y: auto;
}

/* 用户信息 */
.sidebar-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-sm);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-fast);
}

.sidebar-user:hover {
  background: var(--sidebar-active-bg);
}

.user-avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.user-name {
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.user-level-tag {
  font-size: 12px;
  color: var(--color-primary);
  background: var(--sidebar-active-bg);
  padding: 2px 8px;
  border-radius: 10px;
}

/* 导航菜单 */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-light);
  font-family: var(--font-family);
  transition: all var(--transition-fast);
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  background: var(--sidebar-active-bg);
  color: var(--color-text);
}

.nav-item.is-active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: var(--font-weight-medium);
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.nav-label {
  font-size: 14px;
}

/* 退出按钮 */
.quit-item {
  margin-top: auto;
  color: var(--color-text-muted);
  border-top: 1px solid var(--sidebar-border);
  padding-top: 12px;
  border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm);
}

.quit-item:hover {
  color: var(--color-error);
  background: #FEF2F2;
}
</style>
