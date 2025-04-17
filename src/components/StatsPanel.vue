<script setup>
import { defineProps } from 'vue';

defineProps({
  totalWords: Number,
  remainingWords: Number,
  masteredWords: Number,
  currentBatch: Number
});
</script>

<template>
  <div class="stats-panel">
    <div class="progress-container">
      <div class="progress-bar" :style="{ width: currentBatch + '%' }"></div>
      <div class="progress-text">{{ currentBatch }}% 完成</div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">剩余词汇</div>
        <div class="stat-value" :class="{ 'highlight': remainingWords > 0 }">{{ remainingWords }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">标熟词汇</div>
        <div class="stat-value" :class="{ 'highlight': masteredWords > 0 }">{{ masteredWords }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">总词汇量</div>
        <div class="stat-value">{{ totalWords }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-container {
  position: relative;
  height: 24px;
  background-color: #e9ecef;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #28a745;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  /* Default to 3 columns */
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

/* Media query for smaller screens */
@media (max-width: 600px) {
  .stats-grid {
    /* Change to 1 column on smaller screens */
    grid-template-columns: 1fr;
  }
}

/* Media query for very narrow screens */
@media (max-width: 420px) {
  .stats-panel {
    padding: 15px; /* Reduce padding */
  }
  .progress-container {
    margin-bottom: 15px; /* Reduce margin */
  }
  .stat-value {
    font-size: 20px; /* Reduce font size */
  }
  .stats-grid {
    gap: 10px; /* Reduce gap */
  }
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #343a40;
  transition: color 0.3s;
}

.stat-value.highlight {
  color: #28a745;
}
</style>