// src/renderer/src/data/levels.js
// 关卡定义（4 阶段 + 子关卡层级结构）

export const stages = [
  // ===== Stage 1: 基础练习（单指训练） =====
  {
    id: 'basic',
    name: '基础练习',
    icon: '🎯',
    description: '单独练习每个手指',
    order: 1,
    subLevels: [
      {
        id: 'basic-tutorial',
        name: '基准位置',
        type: 'tutorial',
        letters: ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'],
        practiceCount: 8,
        targetAccuracy: null,
        unlockCondition: null
      },
      {
        id: 'basic-left-pinky',
        name: '左手小指',
        type: 'finger',
        finger: 'left-pinky',
        letters: ['Q', 'A', 'Z', '1'],
        practiceCount: 50,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'basic-tutorial' }
      },
      {
        id: 'basic-left-ring',
        name: '左手无名指',
        type: 'finger',
        finger: 'left-ring',
        letters: ['W', 'S', 'X', '2'],
        practiceCount: 50,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'basic-left-pinky', accuracy: 80 }
      },
      {
        id: 'basic-left-middle',
        name: '左手中指',
        type: 'finger',
        finger: 'left-middle',
        letters: ['E', 'D', 'C', '3'],
        practiceCount: 50,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'basic-left-ring', accuracy: 80 }
      },
      {
        id: 'basic-left-index',
        name: '左手食指',
        type: 'finger',
        finger: 'left-index',
        letters: ['R', 'F', 'V', 'T', 'G', 'B', '4', '5'],
        practiceCount: 80,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'basic-left-middle', accuracy: 80 }
      },
      {
        id: 'basic-right-index',
        name: '右手食指',
        type: 'finger',
        finger: 'right-index',
        letters: ['U', 'J', 'M', 'Y', 'H', 'N', '6', '7'],
        practiceCount: 80,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'basic-left-index', accuracy: 80 }
      },
      {
        id: 'basic-right-middle',
        name: '右手中指',
        type: 'finger',
        finger: 'right-middle',
        letters: ['I', 'K', ',', '8'],
        practiceCount: 50,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'basic-right-index', accuracy: 80 }
      },
      {
        id: 'basic-right-ring',
        name: '右手无名指',
        type: 'finger',
        finger: 'right-ring',
        letters: ['O', 'L', '.', '9'],
        practiceCount: 50,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'basic-right-middle', accuracy: 80 }
      },
      {
        id: 'basic-right-pinky',
        name: '右手小指',
        type: 'finger',
        finger: 'right-pinky',
        letters: ['P', ';', '/', '0'],
        practiceCount: 50,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'basic-right-ring', accuracy: 80 }
      }
    ]
  },

  // ===== Stage 2: 初步集成（双指组合） =====
  {
    id: 'integration',
    name: '初步集成',
    icon: '🤝',
    description: '组合练习两个手指',
    order: 2,
    subLevels: [
      {
        id: 'integration-left-hand',
        name: '左手组合',
        type: 'finger-pair',
        letters: ['Q', 'A', 'Z', '1', 'W', 'S', 'X', '2', 'E', 'D', 'C', '3', 'R', 'F', 'V', 'T', 'G', 'B', '4', '5'],
        practiceCount: 60,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'basic-right-pinky', accuracy: 80 }
      },
      {
        id: 'integration-right-hand',
        name: '右手组合',
        type: 'finger-pair',
        letters: ['U', 'J', 'M', 'Y', 'H', 'N', '6', '7', 'I', 'K', ',', '8', 'O', 'L', '.', '9', 'P', ';', '/', '0'],
        practiceCount: 60,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'integration-left-hand', accuracy: 80 }
      },
      {
        id: 'integration-both-index',
        name: '双食指练习',
        type: 'finger-pair',
        letters: ['R', 'F', 'V', 'T', 'G', 'B', '4', '5', 'U', 'J', 'M', 'Y', 'H', 'N', '6', '7'],
        practiceCount: 60,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'integration-right-hand', accuracy: 80 }
      },
      {
        id: 'integration-both-pinky',
        name: '双小指练习',
        type: 'finger-pair',
        letters: ['Q', 'A', 'Z', '1', 'P', ';', '/', '0'],
        practiceCount: 50,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'integration-both-index', accuracy: 80 }
      },
      {
        id: 'integration-mixed',
        name: '混合练习',
        type: 'finger-pair',
        letters: 'all',
        practiceCount: 60,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'integration-both-pinky', accuracy: 80 }
      }
    ]
  },

  // ===== Stage 3: 组合练习（三指 + Shift 大写） =====
  {
    id: 'combination',
    name: '组合练习',
    icon: '🔥',
    description: '三指组合 + Shift 大写字母',
    order: 3,
    subLevels: [
      {
        id: 'combination-shift-basic',
        name: 'Shift 基础',
        type: 'finger-triple',
        letters: ['A', 'S', 'D', 'F', 'J', 'K', 'L'],
        requireShift: true,
        practiceCount: 40,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'integration-mixed', accuracy: 80 }
      },
      {
        id: 'combination-left-shift',
        name: '右 Shift + 左字母',
        type: 'finger-triple',
        letters: ['Q', 'W', 'E', 'R', 'T', 'A', 'S', 'D', 'F', 'G', 'Z', 'X', 'C', 'V', 'B'],
        requireShift: true,
        practiceCount: 50,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'combination-shift-basic', accuracy: 80 }
      },
      {
        id: 'combination-right-shift',
        name: '左 Shift + 右字母',
        type: 'finger-triple',
        letters: ['Y', 'U', 'I', 'O', 'P', 'H', 'J', 'K', 'L', 'N', 'M'],
        requireShift: true,
        practiceCount: 50,
        targetAccuracy: 80,
        unlockCondition: { subLevel: 'combination-left-shift', accuracy: 80 }
      },
      {
        id: 'combination-three-finger',
        name: '三指组合',
        type: 'finger-triple',
        letters: 'all',
        requireShift: true,
        practiceCount: 60,
        targetAccuracy: 85,
        unlockCondition: { subLevel: 'combination-right-shift', accuracy: 80 }
      }
    ]
  },

  // ===== Stage 4: 综合练习（所有手指 + 词组） =====
  {
    id: 'comprehensive',
    name: '综合练习',
    icon: '🏆',
    description: '所有手指配合，词组和短句',
    order: 4,
    subLevels: [
      {
        id: 'comprehensive-words',
        name: '词组练习',
        type: 'word',
        words: ['the', 'and', 'is', 'it', 'to', 'in', 'of', 'for', 'on', 'with', 'hello', 'world', 'good', 'morning'],
        practiceCount: 20,
        targetAccuracy: 85,
        unlockCondition: { subLevel: 'combination-three-finger', accuracy: 85 }
      },
      {
        id: 'comprehensive-sentences',
        name: '短句练习',
        type: 'sentence',
        sentences: [
          'Hello World',
          'Good morning',
          'Thank you',
          'Nice to meet you',
          'How are you'
        ],
        practiceCount: 10,
        targetAccuracy: 85,
        unlockCondition: { subLevel: 'comprehensive-words', accuracy: 85 }
      },
      {
        id: 'comprehensive-master',
        name: '键盘大师',
        type: 'comprehensive',
        sections: [
          { type: 'letter', count: 15 },
          { type: 'word', count: 8 },
          { type: 'sentence', count: 3 }
        ],
        practiceCount: 30,
        targetAccuracy: 90,
        unlockCondition: { subLevel: 'comprehensive-sentences', accuracy: 85 }
      }
    ]
  }
]

// 获取子关卡信息
export function getSubLevel(subLevelId) {
  for (const stage of stages) {
    const found = stage.subLevels.find(sl => sl.id === subLevelId)
    if (found) return found
  }
  return null
}

// 获取阶段信息
export function getStage(stageId) {
  return stages.find(s => s.id === stageId) || null
}

// 获取子关卡所属阶段
export function getStageForSubLevel(subLevelId) {
  for (const stage of stages) {
    if (stage.subLevels.some(sl => sl.id === subLevelId)) {
      return stage
    }
  }
  return null
}

// 获取下一个子关卡 ID
export function getNextSubLevelId(currentId) {
  let found = false
  for (const stage of stages) {
    for (const sl of stage.subLevels) {
      if (found) return sl.id
      if (sl.id === currentId) found = true
    }
  }
  return null
}

// 判断子关卡是否解锁
export function isSubLevelUnlocked(subLevelId, progress) {
  const subLevel = getSubLevel(subLevelId)
  if (!subLevel) return false
  if (!subLevel.unlockCondition) return true

  const { subLevel: prevId, accuracy } = subLevel.unlockCondition
  const prevProgress = progress.levels[prevId]
  if (!prevProgress) return false
  if (accuracy && (prevProgress.accuracy || 0) < accuracy) return false
  return prevProgress.completed === true
}

// 获取所有子关卡总数
export function getTotalSubLevelCount() {
  return stages.reduce((sum, s) => sum + s.subLevels.length, 0)
}

// 获取子关卡当前应使用的难度
export function getDifficultyForSubLevel(subLevelId, progress) {
  const levelProgress = progress?.levels?.[subLevelId]
  if (!levelProgress?.difficultyProgress) return 'beginner'

  const dp = levelProgress.difficultyProgress
  if (dp.challenge?.completed) return 'challenge'
  if (dp.intermediate?.completed) return 'challenge'
  if (dp.beginner?.completed) return 'intermediate'
  return 'beginner'
}

// 判断子关卡是否已完成全部难度递进（可以解锁下一关）
export function isSubLevelFullyCompleted(subLevelId, progress) {
  const levelProgress = progress?.levels?.[subLevelId]
  if (!levelProgress?.completed) return false
  return levelProgress.difficultyProgress?.challenge?.completed === true
}

// 获取当前难度的中文标签
export function getDifficultyLabel(difficultyId) {
  const labels = {
    beginner: '新手',
    intermediate: '进阶',
    challenge: '挑战'
  }
  return labels[difficultyId] || '新手'
}

// 获取子关卡所需的难度列表
export function getRequiredDifficulties() {
  return ['beginner', 'intermediate', 'challenge']
}

// 获取所有字母（用于 'all' 类型的 letters）
export function getAllLetters() {
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
}

// 向后兼容导出（UI 重写完成后可移除）
export const levels = stages.flatMap(s => s.subLevels)
export const getLevel = getSubLevel
export const isLevelUnlocked = isSubLevelUnlocked
