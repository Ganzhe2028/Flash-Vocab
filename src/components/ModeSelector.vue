<script setup>
import { ref } from 'vue';

const emit = defineEmits(['modeChange']);

const currentMode = ref('english'); // 默认为英文优先模式

const changeMode = (mode) => {
  currentMode.value = mode;
  emit('modeChange', mode);
};
</script>

<template>
  <div class="mode-selection">
    <h2>选择学习模式</h2>
    <div class="mode-buttons">
      <button 
        class="mode-btn" 
        :class="{ active: currentMode === 'english' }"
        @click="changeMode('english')"
      >
        🇺🇸 英文优先
      </button>
      <button 
        class="mode-btn" 
        :class="{ active: currentMode === 'chinese' }"
        @click="changeMode('chinese')"
      >
        🇨🇳 中文优先
      </button>
    </div>
    <p class="mode-description">
      <template v-if="currentMode === 'english'">
        显示单词 → 点击显示词性释义
      </template>
      <template v-else>
        显示释义 → 点击显示对应单词
      </template>
    </p>
  </div>
</template>

<style scoped>
.mode-selection {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  color: #333;
}

.mode-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
}

.mode-btn {
  padding: 10px 20px;
  border: 2px solid #dee2e6;
  background-color: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.mode-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.mode-btn:hover:not(.active) {
  border-color: #adb5bd;
  background-color: #f1f3f5;
}

.mode-description {
  color: #6c757d;
  font-style: italic;
  margin-top: 10px;
}
</style>