<!-- src/renderer/src/components/Keyboard.vue
  键盘布局组件
-->
<template>
  <div class="keyboard" :class="{ 'hint-mode': hintMode, 'shake-light': shakeLevel === 1, 'shake-medium': shakeLevel === 2, 'shake-heavy': shakeLevel === 3 }">
    <div
      v-for="(row, rowIndex) in keyboardLayout"
      :key="rowIndex"
      class="keyboard-row"
    >
      <Key
        v-for="(keyData, keyIndex) in row"
        :key="`${rowIndex}-${keyIndex}`"
        :char="keyData.char"
        :width="keyData.width"
        :finger="keyData.finger"
        :accuracy="getAccuracy(keyData.char)"
        :highlight="isHighlighted(keyData.char)"
        :ref="el => setKeyRef(keyData.char, el)"
      />
    </div>

    <!-- 手指提示（绝对定位，不影响键盘位置） -->
    <div v-if="showFingerHint && currentFinger" class="finger-hint">
      <span class="finger-icon">{{ getFingerIcon(currentFinger) }}</span>
      <span class="finger-text">使用 {{ currentFingerName }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Key from './Key.vue'
import { keyboardLayout, getFingerForLetter } from '@/data/keyboardLayout'
import { getFingerName } from '@/data/fingerNames'

// Props
const props = defineProps({
  currentLetter: {
    type: String,
    default: null
  },
  letterStats: {
    type: Object,
    default: () => ({})
  },
  showHeatmap: {
    type: Boolean,
    default: false
  },
  showFingerHint: {
    type: Boolean,
    default: true
  },
  hintMode: {
    type: Boolean,
    default: false
  }
})

// 键引用存储（用于触发闪烁）
const keyRefs = ref({})
const shakeLevel = ref(0)

function setKeyRef(char, el) {
  if (el) {
    keyRefs.value[char.toUpperCase()] = el
  }
}

// 计算属性：当前字母是否需要 Shift（大写字母）
const needsShift = computed(() => {
  if (!props.currentLetter) return false
  return /^[A-Z]$/.test(props.currentLetter)
})

// 大写字母应由哪只手的 Shift 负责（对侧手）
// 左手字母用右 Shift，右手字母用左 Shift
const LEFT_HAND_LETTERS = new Set(['Q','W','E','R','T','A','S','D','F','G','Z','X','C','V','B','1','2','3','4','5'])

// 计算属性：当前手指
const currentFinger = computed(() => {
  if (!props.currentLetter) return null
  return getFingerForLetter(props.currentLetter)
})

// 计算属性：当前手指名称
const currentFingerName = computed(() => {
  return getFingerName(currentFinger.value) || ''
})

// 判断键是否高亮（字母键 + Shift 键）
function isHighlighted(char) {
  if (!props.currentLetter) return false

  // 空格键高亮
  if (char === 'Space' && props.currentLetter === ' ') return true

  // 字母/数字键高亮
  if (char.toUpperCase() === props.currentLetter.toUpperCase()) return true

  // Shift 键高亮：目标为大写字母时
  if (needsShift.value) {
    const upper = props.currentLetter.toUpperCase()
    if (LEFT_HAND_LETTERS.has(upper)) {
      // 左手字母 → 右 Shift
      return char === 'ShiftR'
    } else {
      // 右手字母 → 左 Shift
      return char === 'ShiftL'
    }
  }

  return false
}

// 获取键的正确率
function getAccuracy(char) {
  if (!props.showHeatmap) return null

  const upperChar = char.toUpperCase()
  // 只显示字母和分号的热力图
  if (!/[A-Z;]/.test(upperChar)) return null

  const stats = props.letterStats[upperChar]
  if (!stats) return null

  return Math.round((stats.correct / stats.total) * 100)
}

// 获取手指图标
function getFingerIcon(finger) {
  if (!finger) return ''
  const icons = {
    'left-pinky': '👈',
    'left-ring': '👈',
    'left-middle': '👈',
    'left-index': '👈',
    'right-index': '👉',
    'right-middle': '👉',
    'right-ring': '👉',
    'right-pinky': '👉'
  }
  return icons[finger] || ''
}

// 触发正确闪烁
function flashCorrect(char) {
  const keyRef = keyRefs.value[char.toUpperCase()]
  if (keyRef) {
    keyRef.flashCorrect()
  }
}

// 触发错误闪烁 + 键盘抖动
function flashError(char, consecutiveErrors = 1) {
  const keyRef = keyRefs.value[char.toUpperCase()]
  if (keyRef) {
    keyRef.flashError()
  }

  // 键盘抖动：1-2次轻微，3次中等，4+剧烈
  shakeLevel.value = Math.min(consecutiveErrors >= 4 ? 3 : consecutiveErrors >= 3 ? 2 : 1, 3)
  setTimeout(() => {
    shakeLevel.value = 0
  }, 400)
}

// 暴露方法供父组件调用
defineExpose({
  flashCorrect,
  flashError
})
</script>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  background: #D1D5DB;
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.15);
  max-width: 700px;
  margin: 0 auto;
  position: relative;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.finger-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: #FEF3C7;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid #FDE68A;
}

/* 键盘抖动动画 */
.keyboard.shake-light {
  animation: shake-light 0.3s ease;
}

.keyboard.shake-medium {
  animation: shake-medium 0.4s ease;
}

.keyboard.shake-heavy {
  animation: shake-heavy 0.5s ease;
}

@keyframes shake-light {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

@keyframes shake-medium {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}

@keyframes shake-heavy {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-8px); }
  30% { transform: translateX(8px); }
  45% { transform: translateX(-8px); }
  60% { transform: translateX(8px); }
  75% { transform: translateX(-6px); }
  90% { transform: translateX(6px); }
}

.finger-icon {
  font-size: 20px;
}

.finger-text {
  font-size: 15px;
  font-weight: 600;
  color: #92400E;
}

/* 提示模式 */
.keyboard.hint-mode .key.highlight {
  animation: pulse 0.8s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>