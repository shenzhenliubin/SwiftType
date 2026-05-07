// src/renderer/src/composables/useFallingLetters.js
// 下落字母动画 Composable

import { ref, onUnmounted } from 'vue'

/**
 * 下落字母动画 Composable
 * 管理字母从顶部随机位置下落的动画
 *
 * @param {Object} options
 * @param {import('vue').Ref<boolean>} options.enabled - 是否启用下落模式
 * @param {import('vue').Ref<number>} options.speed - 下落速度（px/帧）
 * @param {import('vue').Ref<string>} options.currentLetter - 当前要显示的字母
 * @param {Function} options.onMiss - 字母落到底部未输入时的回调
 */
export function useFallingLetters({ enabled, speed, currentLetter, onMiss }) {
  const letters = ref([])       // [{ id, char, x, y }]
  const containerHeight = ref(300)
  let animationFrameId = null
  let idCounter = 0

  // 在随机 X 位置生成新字母
  function spawnLetter() {
    const char = currentLetter.value
    if (!char) return

    // 移除旧字母，只保留一个
    letters.value = [{
      id: ++idCounter,
      char,
      x: Math.random() * 80 + 10,  // 10%-90% 宽度
      y: 0
    }]
  }

  // 移除指定字母
  function removeLetter(id) {
    letters.value = letters.value.filter(l => l.id !== id)
  }

  // 清除所有字母
  function clearLetters() {
    letters.value = []
  }

  // 动画循环
  function animate() {
    if (!enabled.value) {
      animationFrameId = null
      return
    }

    const bottomLimit = containerHeight.value - 20  // 键盘区偏移

    // 更新位置
    const updated = letters.value.map(l => ({
      ...l,
      y: l.y + speed.value
    }))

    // 检查是否到达底部
    const missed = updated.filter(l => l.y >= bottomLimit)
    const alive = updated.filter(l => l.y < bottomLimit)

    letters.value = alive

    // 触发未命中回调
    missed.forEach(l => {
      onMiss(l.char)
    })

    animationFrameId = requestAnimationFrame(animate)
  }

  function startAnimation() {
    if (animationFrameId) return
    if (!enabled.value) return
    animate()
  }

  function stopAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  // 组件卸载时停止动画
  onUnmounted(() => {
    stopAnimation()
  })

  return {
    letters,
    containerHeight,
    spawnLetter,
    removeLetter,
    clearLetters,
    startAnimation,
    stopAnimation
  }
}
