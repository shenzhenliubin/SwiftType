// src/renderer/src/stores/user.js
// 用户管理 Store

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@/composables/useStorage'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const currentUserId = ref('default')

  const storage = useStorage()

  // 当前用户对象
  const currentUser = computed(() => {
    return users.value.find(u => u.id === currentUserId.value) || users.value[0] || null
  })

  // 预设头像列表
  const avatarOptions = [
    // 人物
    '👤', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧓', '👴', '👵',
    '😎', '🤓', '🥳', '🤖', '👻', '🧙', '🧑‍🚀', '🦸', '🥷', '🧑‍🎨',
    '😺', '🤠', '🧛', '🤹', '💃', '🕺', '🧊', '🫠', '🥶', '🥸',
    // 动物
    '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🐰', '🐲', '🦄', '🐧',
    '🦉', '🐙', '🦋', '🐝', '🦈', '🐬', '🦜', '🐿️', '🐹', '🦝',
    '🐨', '🦥', '🐻', '🦩', '🦖', '🐳', '🦒', '🐘', '🦙', '🐡',
    // 自然/物品
    '🌸', '🌻', '⭐', '🌙', '🌈', '☀️', '🍀', '🔥', '💎', '🎯',
    '🎨', '⚽', '🎸', '🚀', '❄️', '🍀', '🧸', '🪐', '🎵', '🍎'
  ]

  // 加载用户列表
  async function loadUsers() {
    const data = await storage.loadUsers()
    users.value = data.users
    currentUserId.value = data.currentUserId
  }

  // 创建新用户
  async function createUser(name, avatar) {
    const id = 'user-' + Date.now()
    const user = {
      id,
      name: name || '新用户',
      avatar: avatar || '👤',
      createdAt: new Date().toISOString().split('T')[0]
    }
    await storage.createUser(user)
    users.value = [...users.value, user]
    return user
  }

  // 删除用户
  async function deleteUser(userId) {
    const success = await storage.deleteUser(userId)
    if (success) {
      users.value = users.value.filter(u => u.id !== userId)
      // 如果删除的是当前用户，切换到第一个
      if (currentUserId.value === userId && users.value.length > 0) {
        await switchUser(users.value[0].id)
      }
    }
    return success
  }

  // 切换当前用户
  async function switchUser(userId) {
    await storage.switchUser(userId)
    currentUserId.value = userId
  }

  // 更新用户头像
  async function updateAvatar(userId, avatar) {
    const updated = users.value.map(u => u.id === userId ? { ...u, avatar } : u)
    await storage.saveUsers(updated)
    users.value = updated
  }

  return {
    users,
    currentUserId,
    currentUser,
    avatarOptions,
    loadUsers,
    createUser,
    deleteUser,
    switchUser,
    updateAvatar
  }
})
