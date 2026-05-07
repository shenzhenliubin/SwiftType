// src/renderer/src/composables/useSound.js
// 音效播放 Composable（混合方案：MP3 + Web Audio API 后备）

import { ref } from 'vue'

// ========== 模块级单例 ==========
const enabled = ref(true)
let _correctSound = null
let _errorSound = null
let _audioContext = null

// ========== Web Audio API 合成（后备方案） ==========

function getAudioContext() {
  if (!_audioContext) {
    _audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return _audioContext
}

function synthTone(frequency, type, duration, volume = 0.2) {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain).connect(ctx.destination)
    osc.frequency.value = frequency
    osc.type = type
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch (e) {
    // Web Audio API 不可用时静默失败
  }
}

function synthCorrect() {
  synthTone(880, 'sine', 0.08, 0.3)
}

function synthError() {
  synthTone(200, 'square', 0.15, 0.2)
}

function synthComplete() {
  // 三音上行：C5 → E5 → G5（胜利提示音）
  try {
    const ctx = getAudioContext()
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain).connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      const startTime = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0.25, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2)
      osc.start(startTime)
      osc.stop(startTime + 0.2)
    })
  } catch (e) {
    // 静默失败
  }
}

// ========== MP3 播放（主方案） ==========

function canPlayMp3() {
  try {
    return new Audio().canPlayType('audio/mpeg') !== ''
  } catch {
    return false
  }
}

function getSoundPath(name) {
  return canPlayMp3() ? `/sounds/${name}.mp3` : `/sounds/${name}.ogg`
}

function initSounds() {
  if (_correctSound) return
  try {
    _correctSound = new Audio(getSoundPath('correct'))
    _errorSound = new Audio(getSoundPath('error'))
    _correctSound.load()
    _errorSound.load()
  } catch (e) {
    // Audio 创建失败，将使用合成后备
  }
}

function playAudioFile(sound, fallback) {
  if (!enabled.value) return
  if (sound) {
    sound.currentTime = 0
    sound.play().catch(() => {
      // MP3 播放失败，降级到合成音
      fallback()
    })
  } else {
    // 无 Audio 实例，直接使用合成
    fallback()
  }
}

// ========== 导出 Composable ==========

export function useSound() {
  // 初始化音效实例（单例）
  initSounds()

  function playCorrect() {
    playAudioFile(_correctSound, synthCorrect)
  }

  function playError() {
    playAudioFile(_errorSound, synthError)
  }

  function playComplete() {
    if (!enabled.value) return
    // 关卡完成音效直接使用 Web Audio API 合成（三音上行）
    synthComplete()
  }

  function setEnabled(value) {
    enabled.value = value
  }

  return {
    enabled,
    playCorrect,
    playError,
    playComplete,
    setEnabled
  }
}
