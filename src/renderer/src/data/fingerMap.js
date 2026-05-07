// src/renderer/src/data/fingerMap.js
// 手指-键位映射

export const fingerMap = {
  'left-pinky': ['Q', 'A', 'Z', '1', '!', '`'],
  'left-ring': ['W', 'S', 'X', '2', '@'],
  'left-middle': ['E', 'D', 'C', '3', '#'],
  'left-index': ['R', 'F', 'V', 'T', 'G', 'B', '4', '5', '$', '%'],
  'right-index': ['U', 'J', 'M', 'Y', 'H', 'N', '6', '7', '^', '&'],
  'right-middle': ['I', 'K', ',', '8', '*'],
  'right-ring': ['O', 'L', '.', '9', '('],
  'right-pinky': ['P', ';', '/', '[', ']', "'", '-', '=', '\\', '0', ')']
}

// 根据字母获取负责的手指
export function getFingerForLetter(letter) {
  const upperLetter = letter.toUpperCase()
  for (const [finger, letters] of Object.entries(fingerMap)) {
    if (letters.includes(upperLetter)) {
      return finger
    }
  }
  return null
}