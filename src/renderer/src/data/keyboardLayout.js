// src/renderer/src/data/keyboardLayout.js
// 键盘布局数据（完整键盘含特殊键）

export { fingerMap, getFingerForLetter } from './fingerMap'

// 键盘布局数组（5行）
// 每个键包含: char (字符), width (相对宽度), finger (负责的手指)
export const keyboardLayout = [
  // 第一行：Esc + 数字行 + Backspace
  [
    { char: 'Esc', width: 1, finger: null },
    { char: '1', width: 1, finger: 'left-pinky' },
    { char: '2', width: 1, finger: 'left-ring' },
    { char: '3', width: 1, finger: 'left-middle' },
    { char: '4', width: 1, finger: 'left-index' },
    { char: '5', width: 1, finger: 'left-index' },
    { char: '6', width: 1, finger: 'right-index' },
    { char: '7', width: 1, finger: 'right-index' },
    { char: '8', width: 1, finger: 'right-middle' },
    { char: '9', width: 1, finger: 'right-ring' },
    { char: '0', width: 1, finger: 'right-pinky' },
    { char: '-', width: 1, finger: 'right-pinky' },
    { char: '=', width: 1, finger: 'right-pinky' },
    { char: 'Back', width: 2, finger: null }
  ],
  // 第二行：Tab + QWERTY行
  [
    { char: 'Tab', width: 1.5, finger: null },
    { char: 'Q', width: 1, finger: 'left-pinky' },
    { char: 'W', width: 1, finger: 'left-ring' },
    { char: 'E', width: 1, finger: 'left-middle' },
    { char: 'R', width: 1, finger: 'left-index' },
    { char: 'T', width: 1, finger: 'left-index' },
    { char: 'Y', width: 1, finger: 'right-index' },
    { char: 'U', width: 1, finger: 'right-index' },
    { char: 'I', width: 1, finger: 'right-middle' },
    { char: 'O', width: 1, finger: 'right-ring' },
    { char: 'P', width: 1, finger: 'right-pinky' },
    { char: '[', width: 1, finger: 'right-pinky' },
    { char: ']', width: 1, finger: 'right-pinky' },
    { char: '\\', width: 1.5, finger: 'right-pinky' }
  ],
  // 第三行：Caps + ASDF行 + Enter
  [
    { char: 'Caps', width: 1.75, finger: null },
    { char: 'A', width: 1, finger: 'left-pinky' },
    { char: 'S', width: 1, finger: 'left-ring' },
    { char: 'D', width: 1, finger: 'left-middle' },
    { char: 'F', width: 1, finger: 'left-index' },
    { char: 'G', width: 1, finger: 'left-index' },
    { char: 'H', width: 1, finger: 'right-index' },
    { char: 'J', width: 1, finger: 'right-index' },
    { char: 'K', width: 1, finger: 'right-middle' },
    { char: 'L', width: 1, finger: 'right-ring' },
    { char: ';', width: 1, finger: 'right-pinky' },
    { char: "'", width: 1, finger: 'right-pinky' },
    { char: 'Enter', width: 2.25, finger: null }
  ],
  // 第四行：Shift + ZXCV行 + Shift
  [
    { char: 'ShiftL', width: 2.25, finger: null },
    { char: 'Z', width: 1, finger: 'left-pinky' },
    { char: 'X', width: 1, finger: 'left-ring' },
    { char: 'C', width: 1, finger: 'left-middle' },
    { char: 'V', width: 1, finger: 'left-index' },
    { char: 'B', width: 1, finger: 'left-index' },
    { char: 'N', width: 1, finger: 'right-index' },
    { char: 'M', width: 1, finger: 'right-index' },
    { char: ',', width: 1, finger: 'right-middle' },
    { char: '.', width: 1, finger: 'right-ring' },
    { char: '/', width: 1, finger: 'right-pinky' },
    { char: 'ShiftR', width: 2.75, finger: null }
  ],
  // 第五行：Ctrl + Alt + Space + Alt + Ctrl
  [
    { char: 'Ctrl', width: 1.25, finger: null },
    { char: 'Alt', width: 1.25, finger: null },
    { char: 'Space', width: 6.25, finger: null },
    { char: 'Alt', width: 1.25, finger: null },
    { char: 'Ctrl', width: 1.25, finger: null }
  ]
]