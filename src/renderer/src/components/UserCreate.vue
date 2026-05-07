<!-- src/renderer/src/components/UserCreate.vue
  新增用户弹窗
-->
<template>
  <div class="user-create-overlay" @click.self="$emit('cancel')">
    <div class="user-create card">
      <h3>新增用户</h3>

      <!-- 用户名输入 -->
      <div class="form-group">
        <label>用户名</label>
        <input
          v-model="name"
          type="text"
          class="name-input"
          placeholder="请输入用户名"
          maxlength="12"
          @keyup.enter="confirm"
        />
      </div>

      <!-- 头像选择 -->
      <div class="form-group">
        <label>选择头像</label>
        <div class="avatar-grid">
          <button
            v-for="avatar in avatarOptions"
            :key="avatar"
            class="avatar-option"
            :class="{ selected: selectedAvatar === avatar }"
            @click="selectedAvatar = avatar"
          >
            {{ avatar }}
          </button>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="form-actions">
        <button class="btn btn-secondary" @click="$emit('cancel')">取消</button>
        <button class="btn" :disabled="!name.trim()" @click="confirm">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['created', 'cancel'])

const userStore = useUserStore()
const avatarOptions = userStore.avatarOptions

const name = ref('')
const selectedAvatar = ref(avatarOptions[0])

async function confirm() {
  if (!name.value.trim()) return
  const user = await userStore.createUser(name.value.trim(), selectedAvatar.value)
  emit('created', user)
}
</script>

<style scoped>
.user-create-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.user-create {
  width: 360px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-create h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.name-input {
  padding: 10px 14px;
  font-size: 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  outline: none;
  background: var(--color-bg);
  color: var(--color-text);
}

.name-input:focus {
  border-color: var(--color-primary);
}

.avatar-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.avatar-option {
  width: 48px;
  height: 48px;
  font-size: 28px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--color-bg-dark);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-option.selected {
  border-color: var(--color-primary);
  background: var(--color-highlight);
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
