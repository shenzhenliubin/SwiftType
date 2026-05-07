<!-- src/renderer/src/components/FallingZone.vue
  下落字母容器，使用 TransitionGroup 实现消失动画
-->
<template>
  <div class="falling-zone" ref="zoneRef">
    <TransitionGroup name="fall">
      <FallingLetter
        v-for="letter in letters"
        :key="letter.id"
        :letter="letter"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FallingLetter from './FallingLetter.vue'

defineProps({
  letters: {
    type: Array,
    required: true
  }
})

const zoneRef = ref(null)

// 暴露容器高度给父组件
function getContainerHeight() {
  return zoneRef.value?.offsetHeight || 300
}

defineExpose({ getContainerHeight, zoneRef })
</script>

<style scoped>
.falling-zone {
  position: relative;
  width: 100%;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* TransitionGroup 动画 */
.fall-enter-active {
  transition: opacity 0.15s ease;
}

.fall-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fall-enter-from {
  opacity: 0;
  transform: translateX(-50%) scale(0.5);
}

.fall-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(1.3);
}
</style>
