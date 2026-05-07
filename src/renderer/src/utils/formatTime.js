// src/renderer/src/utils/formatTime.js
// 时间格式化工具

/**
 * 将秒数格式化为可读字符串
 * @param {number} seconds - 秒数
 * @returns {string} - 格式化后的时间字符串（如 "2分15秒"）
 */
export function formatTime(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
    return '0秒'
  }

  const totalSeconds = Math.floor(seconds)

  if (totalSeconds < 60) {
    return `${totalSeconds}秒`
  }

  if (totalSeconds < 3600) {
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    if (remainingSeconds === 0) {
      return `${minutes}分`
    }
    return `${minutes}分${remainingSeconds}秒`
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (minutes === 0) {
    return `${hours}时`
  }
  return `${hours}时${minutes}分`
}

/**
 * 将秒数格式化为 mm:ss 格式
 * @param {number} seconds - 秒数
 * @returns {string} - 格式化后的时间字符串（如 "02:15"）
 */
export function formatTimeMMSS(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
    return '00:00'
  }

  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
