<!-- src/renderer/src/components/ErrorBoundary.vue
  错误边界组件
-->
<template>
  <div v-if="error" class="error-boundary">
    <h2 class="error-boundary-title">出错了</h2>
    <p class="error-boundary-message">{{ errorMessage }}</p>
    <button class="btn" @click="resetError">
      重试
    </button>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

// 状态
const error = ref(false)
const errorMessage = ref('')

// 捕获错误
onErrorCaptured((err) => {
  error.value = true
  errorMessage.value = err.message || '发生未知错误'
  console.error('ErrorBoundary captured:', err)
  return false  // 阻止错误继续传播
})

// 重置错误
function resetError() {
  error.value = false
  errorMessage.value = ''
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 48px;
  text-align: center;
  background: var(--color-bg);
}

.error-boundary-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-error);
  margin-bottom: 16px;
}

.error-boundary-message {
  font-size: 16px;
  color: var(--color-text-light);
  margin-bottom: 24px;
  max-width: 400px;
}
</style>