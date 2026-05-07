// src/renderer/src/composables/useKeyboardInput.js
// 键盘输入监听 Composable

import { ref, onMounted, onUnmounted, toValue } from 'vue'

/**
 * 键盘输入监听 Composable
 * 负责监听键盘输入，处理窗口焦点状态
 *
 * @param {Function} onInput - 输入回调函数，接收 { key, shift } 对象
 * @param {Object} options - 配置选项
 * @param {boolean} options.allowAllChars - 是否允许所有练习字符（空格、标点等）
 * @returns {Object} - { isActive, lastKey }
 */
export function useKeyboardInput(onInput, options = {}) {
  const isActive = ref(true)
  const lastKey = ref('')
  const { allowAllChars = false } = options

  function handleBlur() {
    isActive.value = false
  }

  function handleFocus() {
    isActive.value = true
  }

  function handleKeydown(event) {
    if (!isActive.value) return

    // 忽略单独的修饰键
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return

    const key = event.key

    const allChars = toValue(allowAllChars)
    const allowedPattern = allChars
      ? /^[A-Z0-9;\s.,!?']$/i
      : /^[A-Z0-9;,.\/]$/i

    if (!allowedPattern.test(key)) return

    event.preventDefault()

    // 保留原始大小写：小写字母直接匹配小写目标，大写字母（需 Shift）匹配大写目标
    const processedKey = key === ' ' ? ' ' : key
    lastKey.value = processedKey

    onInput({
      key: processedKey,
      shift: event.shiftKey
    })
  }

  onMounted(() => {
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('blur', handleBlur)
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    isActive,
    lastKey
  }
}
