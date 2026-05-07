<!-- src/renderer/src/components/FallingLetter.vue
  单个下落字母组件
-->
<template>
  <div
    class="falling-letter"
    :style="{ left: `${letter.x}%`, top: `${letter.y}px` }"
  >
    {{ letter.char }}
  </div>
</template>

<script setup>
defineProps({
  letter: {
    type: Object,
    required: true
    // { id, char, x (%), y (px) }
  }
})
</script>

<style scoped>
.falling-letter {
  position: absolute;
  font-size: 36px;
  font-weight: 700;
  color: var(--color-primary);
  text-shadow: 0 2px 8px rgba(74, 144, 217, 0.3);
  pointer-events: none;
  user-select: none;
  transform: translateX(-50%);
  transition: opacity 0.15s ease;
}
</style>
