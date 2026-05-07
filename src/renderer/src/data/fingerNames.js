// src/renderer/src/data/fingerNames.js
// 手指名称（中英文）

export const fingerNames = {
  'left-pinky': '左手小指',
  'left-ring': '左手无名指',
  'left-middle': '左手中指',
  'left-index': '左手食指',
  'right-index': '右手食指',
  'right-middle': '右手中指',
  'right-ring': '右手无名指',
  'right-pinky': '右手小指'
}

// 获取手指名称
export function getFingerName(finger) {
  return fingerNames[finger] || ''
}