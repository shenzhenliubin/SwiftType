// src/renderer/src/composables/useStorage.js
// IPC 数据存储 Composable（多用户版）

function getAPI() {
  if (!window.swifttypeAPI) {
    throw new Error('swifttypeAPI 不可用，请确认 preload 脚本已正确加载')
  }
  return window.swifttypeAPI
}

// 获取用户进度存储路径前缀
function userPath(userId) {
  return `userProgress.${userId}`
}

export function useStorage() {
  // ========== 用户管理 ==========

  // 加载用户列表和当前用户 ID
  async function loadUsers() {
    try {
      const [users, currentUserId] = await Promise.all([
        getAPI().getStore('users'),
        getAPI().getStore('currentUserId')
      ])
      return {
        users: users || [],
        currentUserId: currentUserId || 'default'
      }
    } catch (e) {
      console.warn('加载用户列表失败:', e)
      return { users: [], currentUserId: 'default' }
    }
  }

  // 创建用户
  async function createUser(user) {
    try {
      const users = await getAPI().getStore('users') || []
      users.push(user)
      await getAPI().setStore('users', users)
      // 初始化该用户进度
      await getAPI().setStore(`userProgress.${user.id}`, {
        currentLevel: 'basic-tutorial',
        levels: {},
        letterStats: {},
        totalPracticeTime: 0
      })
    } catch (e) {
      console.warn('创建用户失败:', e)
      throw e
    }
  }

  // 删除用户（至少保留 1 个）
  async function deleteUser(userId) {
    try {
      const users = await getAPI().getStore('users') || []
      if (users.length <= 1) return false
      await getAPI().setStore('users', users.filter(u => u.id !== userId))
      // 删除用户进度（使用 deleteStore 删除子路径，避免整体覆写 userProgress）
      await getAPI().deleteStore(`userProgress.${userId}`)
      return true
    } catch (e) {
      console.warn('删除用户失败:', e)
      return false
    }
  }

  // 切换当前用户
  async function switchUser(userId) {
    try {
      await getAPI().setStore('currentUserId', userId)
    } catch (e) {
      console.warn('切换用户失败:', e)
    }
  }

  // 保存用户列表（用于更新头像等）
  async function saveUsers(users) {
    try {
      await getAPI().setStore('users', users)
    } catch (e) {
      console.warn('保存用户列表失败:', e)
    }
  }

  // ========== 进度（按用户） ==========

  // 加载指定用户进度
  async function loadUserProgress(userId) {
    try {
      const data = await getAPI().getStore(userPath(userId)) || {}
      return {
        currentLevel: data.currentLevel || 'basic-tutorial',
        levels: data.levels || {},
        letterStats: data.letterStats || {},
        totalPracticeTime: data.totalPracticeTime || 0
      }
    } catch (e) {
      console.warn('加载进度失败:', e)
      return { currentLevel: 'basic-tutorial', levels: {}, letterStats: {}, totalPracticeTime: 0 }
    }
  }

  // 保存进度（按用户）
  async function saveProgress(userId, progress) {
    try {
      await getAPI().setStore(`${userPath(userId)}.currentLevel`, progress.currentLevel)
      await getAPI().setStore(`${userPath(userId)}.levels`, progress.levels)
    } catch (e) {
      console.warn('保存进度失败:', e)
    }
  }

  // 保存单个关卡数据（store 层计算好后直接写入）
  async function saveLevelData(userId, levelId, data) {
    try {
      const levels = await getAPI().getStore(`${userPath(userId)}.levels`) || {}
      await getAPI().setStore(`${userPath(userId)}.levels`, {
        ...levels,
        [levelId]: data
      })
    } catch (e) {
      console.warn('保存关卡数据失败:', e)
    }
  }

  // 更新字母统计（按用户）
  async function updateLetterStats(userId, letter, isCorrect) {
    try {
      const stats = await getAPI().getStore(`${userPath(userId)}.letterStats`) || {}
      const current = stats[letter] || { total: 0, correct: 0 }

      await getAPI().setStore(`${userPath(userId)}.letterStats`, {
        ...stats,
        [letter]: {
          total: current.total + 1,
          correct: current.correct + (isCorrect ? 1 : 0)
        }
      })
    } catch (e) {
      console.warn('更新字母统计失败:', e)
    }
  }

  // 更新总练习时间（按用户）
  async function updatePracticeTime(userId, seconds) {
    try {
      const key = `${userPath(userId)}.totalPracticeTime`
      const totalTime = await getAPI().getStore(key) || 0
      await getAPI().setStore(key, totalTime + seconds)
    } catch (e) {
      console.warn('更新练习时间失败:', e)
    }
  }

  // ========== 设置（全局） ==========

  async function getSettings() {
    try {
      return await getAPI().getStore('settings')
    } catch (e) {
      console.warn('获取设置失败:', e)
      return null
    }
  }

  async function updateSettings(key, value) {
    try {
      await getAPI().setStore(`settings.${key}`, value)
    } catch (e) {
      console.warn('更新设置失败:', e)
    }
  }

  // ========== 应用操作 ==========

  async function quitApp() {
    try {
      await getAPI().quitApp()
    } catch (e) {
      console.warn('退出应用失败:', e)
    }
  }

  // ========== 通用 ==========

  async function loadAll() {
    return await getAPI().getAllData()
  }

  return {
    loadAll,
    // 用户管理
    loadUsers,
    createUser,
    deleteUser,
    switchUser,
    saveUsers,
    // 进度（按用户）
    loadUserProgress,
    saveProgress,
    saveLevelData,
    updateLetterStats,
    updatePracticeTime,
    // 设置（全局）
    getSettings,
    updateSettings,
    // 应用操作
    quitApp
  }
}
