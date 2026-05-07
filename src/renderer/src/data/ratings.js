// src/renderer/src/data/ratings.js
// 关卡评级定义

export const RATING = {
  NEEDS_PRACTICE: { id: 1, name: '需练习', icon: '🌱', color: '#999999' },
  BEGINNER: { id: 2, name: '入门', icon: '🌿', color: '#FAAD14' },
  PROFICIENT: { id: 3, name: '熟练', icon: '🌳', color: '#52C41A' },
  MASTERED: { id: 4, name: '精通', icon: '⭐', color: '#FA8C16' }
}

export const ratingList = Object.values(RATING)

/**
 * 根据正确率返回评级
 * @param {number} accuracy - 正确率 0-100
 * @returns {Object} 评级对象
 */
export function getRating(accuracy) {
  if (accuracy == null || accuracy < 60) return RATING.NEEDS_PRACTICE
  if (accuracy < 80) return RATING.BEGINNER
  if (accuracy < 90) return RATING.PROFICIENT
  return RATING.MASTERED
}

/**
 * 根据 ID 返回评级对象
 * @param {number} id - 评级 ID (1-4)
 * @returns {Object|null} 评级对象
 */
export function getRatingById(id) {
  return ratingList.find(r => r.id === id) || null
}
