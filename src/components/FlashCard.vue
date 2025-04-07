<script setup>
import { ref } from 'vue';

const props = defineProps({
  frontContent: String,  // 卡片正面内容（单词或中文释义）
  backContent: String,   // 卡片背面内容（单词或中文释义）
  memoryCount: Number,   // 记忆次数
});

const emit = defineEmits(['know', 'dontKnow', 'markAsMastered']);

const isFlipped = ref(false);
const showAnswer = ref(false);
const answered = ref(false);

const flipCard = () => {
  if (answered.value) {
    isFlipped.value = !isFlipped.value;
  }
};

const handleKnow = () => {
  answered.value = true;
  showAnswer.value = true;
  isFlipped.value = true;
};

const handleDontKnow = () => {
  answered.value = true;
  showAnswer.value = true;
  isFlipped.value = true;
};

const handleMarkAsMastered = () => {
  emit('markAsMastered');
  isFlipped.value = false;
};

const handleNext = () => {
  emit('know');
  answered.value = false;
  showAnswer.value = false;
  isFlipped.value = false;
  setTimeout(() => {
    isFlipped.value = false;
  }, 100);
};

const handleWrong = () => {
  emit('dontKnow');
  answered.value = false;
  showAnswer.value = false;
  isFlipped.value = false;
  setTimeout(() => {
    isFlipped.value = false;
  }, 100);localStorage
};
</script>

<template>
  <div class="flashcard-container">
    <div class="flashcard" :class="{ flipped: isFlipped }" @click="flipCard">
      <div class="flashcard-front">
        <div class="content">{{ frontContent }}</div>
        <div class="memory-count">记忆次数: {{ memoryCount }}/4</div>
      </div>
      <div class="flashcard-back">
        <div class="content">{{ backContent }}</div>
        <div class="mask" v-if="!showAnswer"></div>
      </div>
    </div>
    
    <div class="action-buttons">
      <button v-if="!answered" class="action-btn know" @click="handleKnow">✅ 认识</button>
      <button v-if="!answered" class="action-btn dont-know" @click="handleDontKnow">❌ 不认识</button>
      <button v-if="!answered" class="action-btn mastered" @click="handleMarkAsMastered">🎯 标熟</button>
      
      <div v-if="showAnswer" class="answer-actions">
        <button class="action-btn next" @click="handleNext">➡️ 下一个</button>
        <button class="action-btn wrong" @click="handleWrong">❌ 答错了</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flashcard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
}

.flashcard {
  width: 300px;
  height: 200px;
  perspective: 1000px;
  cursor: pointer;
  margin-bottom: 20px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.flashcard-front, .flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  padding: 20px;
  box-sizing: border-box;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-style: preserve-3d;
  transform: translateZ(10px);
}

.flashcard-front {
  background-color: #f8f9fa;
  color: #333;
  z-index: 2;
}

.flashcard-back {
  background-color: #e9ecef;
  color: #333;
  transform: rotateY(180deg);
  z-index: 1;
  position: relative;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #e9ecef;
  z-index: 2;
  border-radius: 10px;
}

.flashcard.flipped .flashcard-front {
  transform: rotateY(180deg) translateZ(-10px);
}

.flashcard.flipped .flashcard-back {
  transform: rotateY(0deg) translateZ(10px);
}

.content {
  font-size: 24px;
  text-align: center;
  margin-bottom: 10px;
}

.memory-count {
  font-size: 14px;
  color: #6c757d;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
}

.answer-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.know {
  background-color: #28a745;
  color: white;
}

.dont-know {
  background-color: #dc3545;
  color: white;
}

.mastered {
  background-color: #007bff;
  color: white;
}

.next {
  background-color: #28a745;
  color: white;
}

.wrong {
  background-color: #dc3545;
  color: white;
}

.action-btn:hover {
  opacity: 0.9;
}
</style>