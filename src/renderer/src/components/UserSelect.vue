<!-- src/renderer/src/components/UserSelect.vue
  用户选择页面
-->
<template>
  <div class="user-select page">
    <h2 class="select-title">谁在练习？</h2>

    <!-- 用户卡片列表 -->
    <div class="user-list">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-card card"
        @click="selectUser(user)"
      >
        <span class="user-avatar">{{ user.avatar }}</span>
        <span class="user-name">{{ user.name }}</span>
        <button
          v-if="users.length > 1"
          class="btn-delete"
          @click.stop="handleDelete(user)"
        >&times;</button>
      </div>

      <!-- 新增用户按钮 -->
      <div class="user-card card user-card-add" @click="showCreate = true">
        <span class="add-icon">+</span>
        <span class="user-name">新增用户</span>
      </div>
    </div>

    <!-- 新增用户弹窗 -->
    <UserCreate
      v-if="showCreate"
      @created="handleCreated"
      @cancel="showCreate = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useProgressStore } from '@/stores/progress'
import UserCreate from './UserCreate.vue'

const emit = defineEmits(['selected'])

const userStore = useUserStore()
const progressStore = useProgressStore()

const users = computed(() => userStore.users)
const showCreate = ref(false)

async function selectUser(user) {
  await userStore.switchUser(user.id)
  progressStore.setUserId(user.id)
  await progressStore.loadProgress()
  emit('selected')
}

async function handleCreated(user) {
  showCreate.value = false
  await selectUser(user)
}

async function handleDelete(user) {
  if (users.value.length <= 1) return
  if (!confirm(`确定删除用户"${user.name}"？所有练习进度将被清除。`)) return
  await userStore.deleteUser(user.id)
  if (user.id === progressStore.userId && users.value.length > 0) {
    progressStore.setUserId(users.value[0].id)
    await progressStore.loadProgress()
  }
}
</script>

<style scoped>
.user-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.select-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  max-width: 500px;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 28px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  min-width: 120px;
}

.user-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.user-avatar {
  font-size: 40px;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.btn-delete {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  font-size: 14px;
  line-height: 1;
  border: none;
  border-radius: 50%;
  background: var(--color-error-light);
  color: var(--color-error);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover {
  background: var(--color-error);
  color: #FFFFFF;
}

.user-card-add {
  border: 2px dashed var(--border-color);
  background: transparent;
}

.add-icon {
  font-size: 32px;
  color: var(--color-text-muted);
  font-weight: 300;
}
</style>
