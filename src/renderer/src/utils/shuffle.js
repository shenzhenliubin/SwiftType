// src/renderer/src/utils/shuffle.js
// Fisher-Yates 随机打乱算法

/**
 * 随机打乱数组（Fisher-Yates 算法）
 * @param {Array} array - 要打乱的数组
 * @returns {Array} - 打乱后的新数组（不修改原数组）
 */
export function shuffleArray(array) {
  const result = array.slice()  // 复制数组
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // 交换元素
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result
}