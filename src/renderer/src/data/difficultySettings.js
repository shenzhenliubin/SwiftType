// src/renderer/src/data/difficultySettings.js
// 难度模式配置

export const DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  CHALLENGE: 'challenge'
}

export const difficultyConfig = {
  [DIFFICULTY.BEGINNER]: {
    id: 'beginner',
    name: '新手入门',
    description: '字母静止显示',
    fallingEnabled: false,
    fallSpeed: 0
  },
  [DIFFICULTY.INTERMEDIATE]: {
    id: 'intermediate',
    name: '进阶',
    description: '字母从上方落下，中等速度',
    fallingEnabled: true,
    fallSpeed: 1.5
  },
  [DIFFICULTY.CHALLENGE]: {
    id: 'challenge',
    name: '挑战',
    description: '字母快速落下',
    fallingEnabled: true,
    fallSpeed: 3.0
  }
}

export const difficultyList = Object.values(difficultyConfig)
