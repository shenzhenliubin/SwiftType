<!-- src/renderer/src/components/Practice.vue
  练习界面（核心组件）
-->
<template>
  <div class="practice page">
    <!-- 顶部栏：返回按钮 + 关卡名 + 统计信息 -->
    <header class="practice-header">
      <button class="btn btn-small btn-back" @click="goBack">&larr; 返回</button>
      <h2 class="level-name">{{ level?.name }}</h2>
      <div class="header-stats">
        <div class="stat-chip">
          <span class="stat-value">{{ currentAccuracy }}%</span>
          <span class="stat-label">正确率</span>
        </div>
        <div class="stat-chip">
          <span class="stat-value">{{ correctCount }}</span>
          <span class="stat-label">正确</span>
        </div>
        <div class="stat-chip">
          <span class="stat-value">{{ errorCount }}</span>
          <span class="stat-label">错误</span>
        </div>
      </div>
    </header>

    <!-- 进度条 -->
    <div class="progress-bar-container">
      <span class="progress-text">{{ currentIndex }}/{{ practiceSequence.length }}</span>
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </div>

    <!-- 静态字母（新手入门模式） -->
    <div v-if="!fallingEnabled" class="display-area">
      <div class="letter-circle">
        <span class="display-letter">{{ currentContent }}</span>
      </div>
    </div>

    <!-- 下落字母区域（进阶/挑战模式） -->
    <FallingZone
      v-else
      ref="fallingZoneRef"
      :letters="fallingLetters"
      class="display-area falling-display"
    />

    <!-- 弹性空间，将键盘推到底部 -->
    <div v-if="!fallingEnabled" class="spacer"></div>

    <!-- 键盘布局 -->
    <Keyboard
      ref="keyboardRef"
      :current-letter="currentContent"
      :letter-stats="letterStats"
      :show-heatmap="showHeatmap"
      :show-finger-hint="showFingerHint && !hintMode"
      :hint-mode="hintMode"
    />

    <!-- 提示模式提示 -->
    <div v-if="hintMode" class="hint-tip">
      <span>提示模式已开启，请看键盘高亮的键</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Keyboard from './Keyboard.vue'
import FallingZone from './FallingZone.vue'
import { usePractice } from '@/composables/usePractice'
import { useKeyboardInput } from '@/composables/useKeyboardInput'
import { useFallingLetters } from '@/composables/useFallingLetters'
import { useSound } from '@/composables/useSound'
import { useProgressStore } from '@/stores/progress'
import { useSettingsStore } from '@/stores/settings'
import { difficultyConfig } from '@/data/difficultySettings'
import { getDifficultyForSubLevel } from '@/data/levels'

// Props
const props = defineProps({
  levelId: {
    type: String,
    default: 'basic-tutorial'
  }
})

// Emits
const emit = defineEmits(['complete', 'back'])

// Stores
const progressStore = useProgressStore()
const settingsStore = useSettingsStore()

// 难度配置（从进度数据自动获取，不再从设置读取）
const currentDifficulty = computed(() => {
  return getDifficultyForSubLevel(props.levelId, { levels: progressStore.levels })
})

const fallingEnabled = computed(() => {
  const config = difficultyConfig[currentDifficulty.value]
  return config?.fallingEnabled ?? false
})

const fallSpeed = computed(() => {
  const config = difficultyConfig[currentDifficulty.value]
  return config?.fallSpeed ?? 0
})

// Composables
const {
  level,
  currentContent,
  currentIndex,
  correctCount,
  errorCount,
  consecutiveErrors,
  hintMode,
  isComplete,
  progressPercent,
  currentAccuracy,
  practiceSequence,
  initPractice,
  handleInput,
  skipContent,
  completePractice
} = usePractice(props.levelId, { fallingMode: fallingEnabled.value })

const { playCorrect, playError, playComplete, setEnabled } = useSound()

// Refs
const keyboardRef = ref(null)
const fallingZoneRef = ref(null)
let initTimeoutId = null

// 下落字母动画
const {
  letters: fallingLetters,
  containerHeight: fallingContainerHeight,
  spawnLetter,
  removeLetter,
  clearLetters,
  startAnimation,
  stopAnimation
} = useFallingLetters({
  enabled: fallingEnabled,
  speed: fallSpeed,
  currentLetter: currentContent,
  onMiss(char) {
    // 字母落到底部未输入，算作错误
    playError()
    errorCount.value++
    // 更新 per-letter 统计，保持热力图数据准确
    progressStore.updateLetterStats(char.toUpperCase(), false).catch(() => {})
    // 触发键盘抖动提示
    keyboardRef.value?.flashError(char, 1)

    // 推进到下一个字母
    if (!isComplete.value) {
      skipContent()
    }

    // 练习完成
    if (isComplete.value) {
      stopAnimation()
      playComplete()
      const practiceResult = completePractice()
      practiceResult.difficulty = currentDifficulty.value
      progressStore.updateLevelComplete(practiceResult.levelId, practiceResult.accuracy, practiceResult.time, currentDifficulty.value).catch(e => {
        console.warn('保存练习结果失败:', e)
      })
      progressStore.updatePracticeTime(practiceResult.time).catch(() => {})
      emit('complete', practiceResult)
      return
    }

    // 立即生成新的下落字母
    spawnLetter()
  }
})

// 判断是否需要支持所有字符（word/sentence/article/comprehensive 类型）
const allowAllChars = computed(() => {
  const type = level.value?.type
  return type === 'word' || type === 'sentence' || type === 'article' || type === 'comprehensive'
})

// 计算属性
// 练习中不显示热力图，避免按键后键变色干扰练习
const showHeatmap = computed(() => false)
const showFingerHint = computed(() => settingsStore.fingerHintEnabled)
const letterStats = computed(() => progressStore.letterStats)

// 键盘输入处理（必须在 useKeyboardInput 之前定义，避免生产构建 TDZ 错误）
async function onKeyPress(inputEvent) {
  try {
    if (!currentContent.value || isComplete.value) return

    const result = handleInput(inputEvent)
    if (!result) return

    if (result.isCorrect) {
      playCorrect()
      keyboardRef.value?.flashCorrect(inputEvent.key)
      await progressStore.updateLetterStats(result.content.toUpperCase(), true)

      // 下落模式：正确输入后移除当前字母
      if (fallingEnabled.value) {
        clearLetters()
      }
    } else {
      playError()
      keyboardRef.value?.flashError(result.content, consecutiveErrors.value)
      await progressStore.updateLetterStats(result.content.toUpperCase(), false)
    }

    // 练习完成后，保存结果并切换页面
    if (isComplete.value) {
      stopAnimation()
      playComplete()
      const practiceResult = completePractice()
      practiceResult.difficulty = currentDifficulty.value
      try {
        await progressStore.updateLevelComplete(practiceResult.levelId, practiceResult.accuracy, practiceResult.time, currentDifficulty.value)
        await progressStore.updatePracticeTime(practiceResult.time)
      } catch (e) {
        console.warn('保存练习结果失败:', e)
      }
      emit('complete', practiceResult)
      return
    }

    // 下落模式：立即生成下一个下落字母
    if (fallingEnabled.value && !isComplete.value) {
      spawnLetter()
    }
  } catch (e) {
    console.warn('按键处理异常:', e)
  }
}

const { isActive } = useKeyboardInput(onKeyPress, { allowAllChars })

// 返回
function goBack() {
  emit('back')
}

// 初始化
onMounted(() => {
  initPractice()
  // 下落模式：启动动画并生成第一个字母
  if (fallingEnabled.value) {
    // 等容器渲染后获取高度
    initTimeoutId = setTimeout(() => {
      initTimeoutId = null
      if (fallingZoneRef.value) {
        fallingContainerHeight.value = fallingZoneRef.value.getContainerHeight()
      }
      spawnLetter()
      startAnimation()
    }, 100)
  }
})

// 监听音效开关
watch(() => settingsStore.soundEnabled, (enabled) => {
  setEnabled(enabled)
}, { immediate: true })

// 组件卸载时停止动画并清理 timeout
onUnmounted(() => {
  stopAnimation()
  if (initTimeoutId) {
    clearTimeout(initTimeoutId)
    initTimeoutId = null
  }
})
</script>

<style scoped>
.practice {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
  position: relative;
  height: 100%;
  overflow: hidden;
}

/* 顶部栏 */
.practice-header {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 800px;
  gap: 12px;
}

.btn-back {
  font-size: 14px;
  white-space: nowrap;
}

.level-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  flex: 1;
  margin: 0;
}

/* 统计信息（右上角） */
.header-stats {
  display: flex;
  gap: 8px;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  background: var(--color-bg-card);
  border-radius: 6px;
}

.stat-chip .stat-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.stat-chip .stat-label {
  font-size: 11px;
  color: var(--color-text-light);
}

/* 进度条 */
.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 800px;
}

.progress-text {
  font-size: 13px;
  color: var(--color-text-light);
  white-space: nowrap;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-bg-dark);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

/* 当前字母 / 下落区域 */
.display-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  padding: 12px 0;
}

/* 下落模式下的区域：占据所有剩余空间 */
.display-area.falling-display {
  flex: 1;
  width: 100%;
  max-width: 800px;
  min-height: 0;
  padding: 0;
}

/* 字母圆形容器 */
.letter-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--color-bg-card);
  border: 3px solid var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(30, 111, 186, 0.2);
}

.display-letter {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  margin: 0;
}

/* 弹性空间，推键盘到底部 */
.spacer {
  flex: 1;
}

/* 提示模式（绝对定位，不影响键盘位置） */
.hint-tip {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: var(--color-error-light);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 14px;
  white-space: nowrap;
  z-index: 10;
}
</style>
