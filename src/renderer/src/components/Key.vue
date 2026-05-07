<!-- src/renderer/src/components/Key.vue
  单个键组件
-->
<template>
  <div
    class="key"
    :data-width="width"
    :data-finger="finger"
    :data-accuracy="accuracyLevel"
    :class="[
      { highlight: isHighlight },
      { 'correct-flash': isCorrectFlash },
      { 'error-flash': isErrorFlash },
      { special: isSpecial }
    ]"
  >
    <span class="key-char">{{ displayChar }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

// Props
const props = defineProps({
  char: {
    type: String,
    required: true
  },
  width: {
    type: [Number, String],
    default: 1
  },
  finger: {
    type: String,
    default: null
  },
  accuracy: {
    type: Number,
    default: null
  },
  highlight: {
    type: Boolean,
    default: false
  }
})

// 状态
const isCorrectFlash = ref(false)
const isErrorFlash = ref(false)

// 计算属性
const displayChar = computed(() => {
  // 特殊键显示名称
  const specialNames = {
    'Tab': 'Tab',
    'Caps': 'Caps',
    'ShiftL': 'Shift',
    'ShiftR': 'Shift',
    'Enter': 'Enter',
    'Space': ''
  }
  return specialNames[props.char] || props.char
})

const isSpecial = computed(() => {
  return ['Tab', 'Caps', 'ShiftL', 'ShiftR', 'Enter', 'Space', 'Esc', 'Back', 'Ctrl', 'Alt'].includes(props.char)
})

const accuracyLevel = computed(() => {
  if (props.accuracy === null) return 'empty'
  if (props.accuracy >= 90) return 'high'
  if (props.accuracy >= 70) return 'medium'
  return 'low'
})

const isHighlight = computed(() => props.highlight)

// 监听正确/错误事件
function flashCorrect() {
  isCorrectFlash.value = true
  setTimeout(() => {
    isCorrectFlash.value = false
  }, 200)
}

function flashError() {
  isErrorFlash.value = true
  setTimeout(() => {
    isErrorFlash.value = false
  }, 300)
}

// 暴露方法供父组件调用
defineExpose({
  flashCorrect,
  flashError
})
</script>

<style scoped>
.key {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 42px;
  padding: 6px 10px;
  background: #E8E8E8;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.6),
    0 2px 3px rgba(0, 0, 0, 0.15);
  transition: all 0.12s ease;
  user-select: none;
}

.key-char {
  font-family: inherit;
}

/* 宽度变体 */
.key[data-width="1.5"] {
  min-width: 64px;
}

.key[data-width="2"] {
  min-width: 84px;
}

.key[data-width="2.5"] {
  min-width: 104px;
}

.key[data-width="3"] {
  min-width: 124px;
}

.key[data-width="6.25"] {
  min-width: 260px;
}

/* 特殊键 */
.key.special {
  font-size: 13px;
  font-weight: 500;
  color: #555555;
}

/* 高亮 */
.key.highlight {
  background: #1E3A8A;
  color: #FFFFFF;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.15),
    0 3px 8px rgba(30, 58, 138, 0.4);
  transform: scale(1.08);
  z-index: 1;
}

/* 正确闪烁 */
.key.correct-flash {
  background: #D1FAE5;
  color: #065F46;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.6),
    0 2px 3px rgba(0, 0, 0, 0.1);
}

/* 错误闪烁 */
.key.error-flash {
  background: #FEE2E2;
  color: #991B1B;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.5),
    0 2px 3px rgba(0, 0, 0, 0.1);
  animation: shake 0.3s ease;
}

/* 热力图 */
.key[data-accuracy="high"] {
  background: #6EE7B7;
  color: #065F46;
}

.key[data-accuracy="medium"] {
  background: #FCD34D;
  color: #92400E;
}

.key[data-accuracy="low"] {
  background: #FCA5A5;
  color: #991B1B;
}

.key[data-accuracy="empty"] {
  background: #F3F4F6;
  color: #9CA3AF;
}

/* 手指颜色边框 */
.key[data-finger="left-pinky"],
.key[data-finger="right-pinky"] {
  border-bottom: 3px solid #EF4444;
}

.key[data-finger="left-ring"],
.key[data-finger="right-ring"] {
  border-bottom: 3px solid #F59E0B;
}

.key[data-finger="left-middle"],
.key[data-finger="right-middle"] {
  border-bottom: 3px solid #10B981;
}

.key[data-finger="left-index"],
.key[data-finger="right-index"] {
  border-bottom: 3px solid #3B82F6;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>