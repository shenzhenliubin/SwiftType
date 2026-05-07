// src/renderer/src/composables/usePractice.js
// 练习流程 Composable

import { ref, computed } from 'vue'
import { shuffleArray } from '@/utils/shuffle'
import { getSubLevel, getAllLetters } from '@/data/levels'
import { getFingerForLetter } from '@/data/fingerMap'
import { getFingerName } from '@/data/fingerNames'

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ALL_LETTERS_LOWER = 'abcdefghijklmnopqrstuvwxyz'

/**
 * 练习流程 Composable
 * 负责管理练习流程、正确率计算、解锁判定
 *
 * @param {string} subLevelId - 子关卡 ID
 * @param {Object} options - 配置选项
 * @param {boolean} options.fallingMode - 是否为下落模式（影响序列生成策略）
 * @returns {Object} - 练习状态和方法
 */
export function usePractice(subLevelId, options = {}) {
  const { fallingMode = false } = options
  const level = ref(getSubLevel(subLevelId))
  const currentIndex = ref(0)
  const currentContent = ref('')
  const correctCount = ref(0)
  const errorCount = ref(0)
  const startTime = ref(null)
  const consecutiveErrors = ref(0)
  const hintMode = ref(false)
  const isComplete = ref(false)
  const practiceSequence = ref([])

  // 当前手指（用于手指提示）
  const currentFinger = computed(() => {
    if (!currentContent.value) return null
    return getFingerForLetter(currentContent.value)
  })

  const currentFingerName = computed(() => {
    return getFingerName(currentFinger.value) || ''
  })

  const progressPercent = computed(() => {
    if (practiceSequence.value.length === 0) return 0
    return Math.round((currentIndex.value / practiceSequence.value.length) * 100)
  })

  const currentAccuracy = computed(() => {
    const total = correctCount.value + errorCount.value
    if (total === 0) return 0
    return Math.round((correctCount.value / total) * 100)
  })

  // 初始化练习
  function initPractice() {
    generateSequence()
    currentContent.value = practiceSequence.value[0]
    startTime.value = Date.now()
    consecutiveErrors.value = 0
    hintMode.value = false
    correctCount.value = 0
    errorCount.value = 0
    currentIndex.value = 0
    isComplete.value = false
  }

  // 生成练习序列
  function generateSequence() {
    if (!level.value) {
      console.error('关卡数据不存在，subLevelId:', subLevelId)
      practiceSequence.value = []
      return
    }

    // 下落模式：完全随机序列，不按字母分块
    if (fallingMode) {
      generateFallingSequence()
      return
    }

    const type = level.value.type

    switch (type) {
      case 'tutorial':
        // 教学关卡：小写字母
        practiceSequence.value = level.value.letters.map(l => l.toLowerCase())
        break

      case 'finger':
        generateFingerSequence()
        break

      case 'finger-pair':
        generateMixedSequence()
        break

      case 'finger-triple':
        generateShiftSequence()
        break

      case 'word':
        generateWordSequence()
        break

      case 'sentence':
        generateSentenceSequence()
        break

      case 'comprehensive':
        generateComprehensiveSequence()
        break

      default:
        console.error('未知关卡类型:', type)
    }
  }

  // 下落模式序列：完全随机，不按字母分块
  function generateFallingSequence() {
    const lvl = level.value
    const count = lvl.practiceCount || 50

    // 对于需要 Shift 的关卡，生成大写字母
    const needsShift = lvl.requireShift === true

    // 确定可用字符集
    let availableChars
    if (lvl.type === 'word' && lvl.words) {
      // 词组关卡：从所有词组的字母中随机选取
      availableChars = [...new Set(lvl.words.join('').split(''))].map(c => c.toLowerCase())
    } else if (lvl.type === 'sentence' && lvl.sentences) {
      // 短句关卡：从所有短句中随机选取（含大小写）
      availableChars = [...new Set(lvl.sentences.join('').split(''))].filter(c => c !== ' ')
    } else {
      // 其他关卡：从 letters 字段获取
      const resolved = resolveLetters()
      availableChars = needsShift
        ? resolved.filter(l => /^[A-Z]$/.test(l))
        : resolved.map(l => l.toLowerCase())
    }

    if (availableChars.length === 0) {
      availableChars = ALL_LETTERS_LOWER.split('')
    }

    const sequence = []
    for (let i = 0; i < count; i++) {
      sequence.push(availableChars[Math.floor(Math.random() * availableChars.length)])
    }
    practiceSequence.value = sequence
  }

  // 单指序列（小写，静态模式）
  function generateFingerSequence() {
    const letters = resolveLetters().map(l => l.toLowerCase())
    const single = []
    letters.forEach(letter => {
      for (let i = 0; i < 5; i++) single.push(letter)
    })
    const mixed = []
    const remaining = (level.value.practiceCount || 50) - single.length
    for (let i = 0; i < Math.max(0, remaining); i++) {
      mixed.push(letters[Math.floor(Math.random() * letters.length)])
    }
    practiceSequence.value = [...single, ...shuffleArray(mixed)]
  }

  // 双指/多指混合序列（小写）
  function generateMixedSequence() {
    const letters = resolveLetters().map(l => l.toLowerCase())
    const count = level.value.practiceCount || 60
    const sequence = []
    for (let i = 0; i < count; i++) {
      sequence.push(letters[Math.floor(Math.random() * letters.length)])
    }
    practiceSequence.value = sequence
  }

  // Shift（大写字母）序列
  // 所有字母均为大写，练习时必须按住 Shift 键输入
  function generateShiftSequence() {
    const letters = resolveLetters().filter(l => /^[A-Z]$/.test(l))
    if (letters.length === 0) {
      letters.push(...ALL_LETTERS.split(''))
    }
    const count = level.value.practiceCount || 40
    const sequence = []
    for (let i = 0; i < count; i++) {
      sequence.push(letters[Math.floor(Math.random() * letters.length)])
    }
    practiceSequence.value = sequence
  }

  // 词组序列（小写）
  function generateWordSequence() {
    const chars = []
    const words = shuffleArray(level.value.words.slice())
    words.forEach(word => {
      word.split('').forEach(c => chars.push(c.toLowerCase()))
      chars.push(' ')
    })
    practiceSequence.value = chars.slice(0, -1)
  }

  // 短句序列（保留原始大小写，如 "Hello World"）
  function generateSentenceSequence() {
    const chars = []
    const sentences = shuffleArray(level.value.sentences.slice())
    sentences.forEach(sentence => {
      sentence.split('').forEach(c => {
        chars.push(c)
      })
    })
    practiceSequence.value = chars
  }

  // 综合序列（小写字母 + 小写词组 + 正确大小写短句）
  function generateComprehensiveSequence() {
    const sequence = []
    level.value.sections.forEach(section => {
      if (section.type === 'letter') {
        for (let i = 0; i < section.count; i++) {
          sequence.push(randomLetter())
        }
      } else if (section.type === 'word') {
        const words = ['the', 'and', 'is', 'it', 'to', 'in', 'of', 'for']
        for (let i = 0; i < section.count; i++) {
          const word = words[Math.floor(Math.random() * words.length)]
          word.split('').forEach(c => sequence.push(c))
          sequence.push(' ')
        }
      } else if (section.type === 'sentence') {
        const sentences = ['Hello World', 'Good Morning', 'Thank You']
        for (let i = 0; i < section.count; i++) {
          const s = sentences[Math.floor(Math.random() * sentences.length)]
          s.split('').forEach(c => sequence.push(c))
          sequence.push(' ')
        }
      }
    })
    practiceSequence.value = sequence[sequence.length - 1] === ' '
      ? sequence.slice(0, -1)
      : sequence
  }

  // 解析 letters 字段（支持 'all' 字符串）
  function resolveLetters() {
    const letters = level.value.letters
    if (letters === 'all') return getAllLetters()
    return letters
  }

  function randomLetter() {
    return ALL_LETTERS_LOWER[Math.floor(Math.random() * ALL_LETTERS_LOWER.length)]
  }

  // 处理输入（接受事件对象）
  // inputEvent.shift 字段保留供后续扩展使用（如 Shift 组合键统计），
  // 当前大小写判定已通过 key 的 case-sensitive 比较隐式完成
  function handleInput(inputEvent) {
    if (isComplete.value) return null
    const expected = currentContent.value

    const isCorrect = inputEvent.key === expected

    if (isCorrect) {
      correctCount.value++
      consecutiveErrors.value = 0
      hintMode.value = false
      nextContent()
    } else {
      errorCount.value++
      consecutiveErrors.value++
      if (consecutiveErrors.value >= 3) {
        hintMode.value = true
      }
    }

    return {
      content: expected,
      isCorrect
    }
  }

  function nextContent() {
    currentIndex.value++
    if (currentIndex.value >= practiceSequence.value.length) {
      currentContent.value = ''
      isComplete.value = true
    } else {
      currentContent.value = practiceSequence.value[currentIndex.value]
    }
  }

  // 下落模式 miss 时跳到下一个字母（不计正确，但推进序列）
  function skipContent() {
    currentIndex.value++
    if (currentIndex.value >= practiceSequence.value.length) {
      currentContent.value = ''
      isComplete.value = true
    } else {
      currentContent.value = practiceSequence.value[currentIndex.value]
    }
  }

  function completePractice() {
    isComplete.value = true
    const totalTime = Math.floor((Date.now() - startTime.value) / 1000)
    const accuracy = calculateAccuracy()

    return {
      levelId: subLevelId,
      accuracy,
      time: totalTime,
      totalInputs: practiceSequence.value.length,
      unlocked: checkUnlock(accuracy)
    }
  }

  function calculateAccuracy() {
    const total = correctCount.value + errorCount.value
    if (total === 0) return 0
    return Math.round((correctCount.value / total) * 100)
  }

  function checkUnlock(accuracy) {
    if (level.value.targetAccuracy === null) return true
    return accuracy >= level.value.targetAccuracy
  }

  return {
    level,
    currentContent,
    currentIndex,
    correctCount,
    errorCount,
    consecutiveErrors,
    hintMode,
    isComplete,
    currentFinger,
    currentFingerName,
    progressPercent,
    currentAccuracy,
    practiceSequence,
    initPractice,
    handleInput,
    skipContent,
    completePractice
  }
}
