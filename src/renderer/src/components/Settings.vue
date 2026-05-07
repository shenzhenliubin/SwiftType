<!-- src/renderer/src/components/Settings.vue
  设置页面
-->
<template>
  <div class="settings page">
    <h2 class="page-title">设置</h2>

    <!-- 用户信息 -->
    <div class="setting-section card">
      <h3 class="section-title">用户信息</h3>
      <div class="user-profile">
        <div class="avatar-preview" @click="showAvatarPicker = true">
          <span class="avatar-emoji">{{ currentUser?.avatar }}</span>
          <span class="avatar-edit-badge">✏️</span>
        </div>
        <div class="user-detail">
          <span class="user-name-text">{{ currentUser?.name }}</span>
          <button class="change-avatar-btn" @click="showAvatarPicker = true">更换头像</button>
        </div>
      </div>
    </div>

    <!-- 音效设置 -->
    <div class="setting-section card">
      <h3 class="section-title">音效</h3>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-name">按键音效</span>
          <span class="setting-desc">练习时播放正确/错误提示音</span>
        </div>
        <button
          class="toggle-btn"
          :class="{ active: soundEnabled }"
          @click="toggleSound"
        >
          <span class="toggle-knob" />
        </button>
      </div>
    </div>

    <!-- 练习设置 -->
    <div class="setting-section card">
      <h3 class="section-title">练习</h3>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-name">手指提示</span>
          <span class="setting-desc">在键盘下方显示应该使用哪个手指</span>
        </div>
        <button
          class="toggle-btn"
          :class="{ active: fingerHintEnabled }"
          @click="toggleFingerHint"
        >
          <span class="toggle-knob" />
        </button>
      </div>
    </div>

    <!-- 头像选择弹窗 -->
    <div v-if="showAvatarPicker" class="avatar-overlay" @click.self="showAvatarPicker = false">
      <div class="avatar-picker card">
        <h3>选择头像</h3>
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
        <div class="picker-actions">
          <button class="btn btn-secondary" @click="showAvatarPicker = false">取消</button>
          <button class="btn" @click="confirmAvatar">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const settingsStore = useSettingsStore()
const userStore = useUserStore()

const soundEnabled = computed(() => settingsStore.soundEnabled)
const fingerHintEnabled = computed(() => settingsStore.fingerHintEnabled)
const currentUser = computed(() => userStore.currentUser)
const avatarOptions = userStore.avatarOptions

const showAvatarPicker = ref(false)
const selectedAvatar = ref('')

async function toggleSound() {
  await settingsStore.setSoundEnabled(!soundEnabled.value)
}

async function toggleFingerHint() {
  await settingsStore.setFingerHintEnabled(!fingerHintEnabled.value)
}

function confirmAvatar() {
  if (!selectedAvatar.value || !currentUser.value) return
  userStore.updateAvatar(currentUser.value.id, selectedAvatar.value)
  showAvatarPicker.value = false
}
</script>

<style scoped>
.settings {
  padding: 24px;
  overflow-y: auto;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 20px;
}

.setting-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 16px;
}

/* 用户信息 */
.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.avatar-preview {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.avatar-preview:hover {
  transform: scale(1.05);
}

.avatar-emoji {
  font-size: 32px;
}

.avatar-edit-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 22px;
  height: 22px;
  background: var(--color-bg-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.change-avatar-btn {
  font-size: 13px;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-family);
  padding: 0;
  text-align: left;
}

.change-avatar-btn:hover {
  text-decoration: underline;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.setting-item + .setting-item {
  border-top: 1px solid var(--color-bg-dark);
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.setting-desc {
  font-size: 13px;
  color: var(--color-text-light);
}

/* Toggle 开关 */
.toggle-btn {
  position: relative;
  width: 48px;
  height: 28px;
  border: none;
  border-radius: 14px;
  background: var(--color-bg-dark);
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.toggle-btn.active {
  background: var(--color-primary);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.toggle-btn.active .toggle-knob {
  transform: translateX(20px);
}

/* 头像选择弹窗 */
.avatar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.avatar-picker {
  width: 560px;
  max-height: 80vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.avatar-picker h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  margin: 0;
}

.avatar-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.avatar-option {
  width: 44px;
  height: 44px;
  font-size: 26px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--color-bg-dark);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-option:hover {
  border-color: var(--color-primary);
}

.avatar-option.selected {
  border-color: var(--color-primary);
  background: var(--color-highlight);
  transform: scale(1.1);
}

.picker-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 4px;
}
</style>
