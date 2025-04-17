<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  frontContent: String, // 卡片正面内容（单词或中文释义）
  backContent: String, // 卡片背面内容（单词或中文释义）
  // 新增 props 以接收完整单词信息
  word: String,
  partOfSpeech: String,
  definition: String,
  memoryCount: Number, // 记忆次数
});

const emit = defineEmits(["know", "dontKnow", "markAsMastered"]);

const isFlipped = ref(false);
const showAnswer = ref(false);
const answered = ref(false);
const dontKnowSelected = ref(false); // 跟踪用户是否选择了"不认识"
const showEnhancedFeedback = ref(false); // 新增状态：是否显示增强反馈

// 计算属性，用于显示增强反馈内容
const enhancedBackContent = computed(() => {
  if (props.word && props.partOfSpeech && props.definition) {
    // 使用 &nbsp;&nbsp; 作为分隔符
    return `${props.word}&nbsp;&nbsp;${props.partOfSpeech}&nbsp;&nbsp;${props.definition}`;
  }
  return props.backContent; // 默认回退到普通背面内容
});

const flipCard = () => {
  // 只有在回答后且未显示增强反馈时才允许翻转
  if (answered.value && !showEnhancedFeedback.value) {
    isFlipped.value = !isFlipped.value;
  }
};

const handleKnow = () => {
  answered.value = true;
  showAnswer.value = true;
  isFlipped.value = true;
  dontKnowSelected.value = false; // 用户选择了"认识"
  showEnhancedFeedback.value = false; // 认识时不需要增强反馈
};

const handleDontKnow = () => {
  answered.value = true;
  showAnswer.value = true;
  isFlipped.value = true;
  dontKnowSelected.value = true; // 用户选择了"不认识"
  showEnhancedFeedback.value = true; // 不认识时需要增强反馈
};

const handleMarkAsMastered = () => {
  emit("markAsMastered");
  // 重置状态
  answered.value = false;
  showAnswer.value = false;
  isFlipped.value = false;
  dontKnowSelected.value = false;
  showEnhancedFeedback.value = false;
};

const handleNext = () => {
  // 根据之前的选择（包括是否触发了增强反馈）决定发送什么事件
  if (dontKnowSelected.value || showEnhancedFeedback.value) {
    emit("dontKnow"); // 如果是不认识或答错了（触发了增强反馈），都算dontKnow
  } else {
    emit("know");
  }
  // 重置所有状态
  answered.value = false;
  showAnswer.value = false;
  isFlipped.value = false;
  dontKnowSelected.value = false;
  showEnhancedFeedback.value = false; // 重置增强反馈状态
  // 确保卡片回到正面
  setTimeout(() => {
    isFlipped.value = false;
  }, 50); // 稍微延迟以避免闪烁
};

const handleWrong = () => {
  // 用户点击“答错了”，标记需要显示增强反馈，并确保卡片翻到背面
  showEnhancedFeedback.value = true;
  isFlipped.value = true; // 强制翻到背面显示答案
  // 注意：不再直接 emit('dontKnow') 或重置状态，这些移到 handleNext 中处理
};

onMounted(() => {
  const keyHandler = (e) => {
    if (answered.value) {
      // 如果已回答
      if (e.key === 'n') { // 按 'n' 进入下一个
        handleNext();
      } else if (e.key === 'm' && !dontKnowSelected.value && !showEnhancedFeedback.value) {
        // 按 'm' 标记为答错了 (仅在认识且未显示增强反馈时有效)
        handleWrong();
      } else if (e.key === ' ' && !showEnhancedFeedback.value) { // 修改为按空格键
        // 按空格键翻转卡片 (仅在未显示增强反馈时有效)
        flipCard();
      }
    } else {
      // 如果未回答
      if (e.key === 'q') { // 按 'q' 认识
        handleKnow();
      } else if (e.key === 'w') { // 按 'w' 不认识
        handleDontKnow();
      } else if (e.key === 'e') { // 按 'e' 标熟
        handleMarkAsMastered();
      }
    }
  };
  window.addEventListener("keydown", keyHandler);
  onUnmounted(() => {
    window.removeEventListener("keydown", keyHandler);
  });
});
</script>

<template>
  <div class="flashcard-container">
    <!-- 移除 @click="flipCard" -->
    <div class="flashcard" :class="{ flipped: isFlipped }">
      <div class="flashcard-front">
        <div class="content">{{ frontContent }}</div>
        <div class="memory-count">记忆次数: {{ memoryCount }}/4</div>
      </div>
      <div class="flashcard-back">
        <!-- 条件渲染：优先显示增强反馈内容 -->
        <!-- 使用 v-html 来渲染包含 &nbsp; 的内容 -->
        <div class="content enhanced-feedback" :class="{ visible: showEnhancedFeedback }" v-html="enhancedBackContent">
        </div>
        <!-- 普通背面内容，仅在不显示增强反馈时通过遮罩显示/隐藏 -->
        <div class="content normal-back-content" v-if="!showEnhancedFeedback">
          {{ backContent }}
        </div>
        <!-- 遮罩层，仅在未回答时不显示背面内容 -->
        <div class="mask" v-if="!showAnswer && !showEnhancedFeedback"></div>
      </div>
    </div>

    <div class="action-buttons">
      <!-- 初始按钮 -->
      <button v-if="!answered" class="action-btn know" @click="handleKnow">
        ✅ 认识 (Q)
      </button>
      <button
        v-if="!answered"
        class="action-btn dont-know"
        @click="handleDontKnow"
      >
        ❌ 不认识 (W)
      </button>
      <button
        v-if="!answered"
        class="action-btn mastered"
        @click="handleMarkAsMastered"
      >
        🎯 标熟 (E)
      </button>

      <!-- 回答后显示的按钮 -->
      <div v-if="answered" class="answer-actions">
         <!-- 下一个按钮始终显示 -->
        <button class="action-btn next" @click="handleNext">➡️ 下一个 (N)</button>
        <!-- 仅在选择了“认识”且未显示增强反馈时，显示“答错了”按钮 -->
        <button
          v-if="!dontKnowSelected && !showEnhancedFeedback"
          class="action-btn wrong"
          @click="handleWrong"
        >
          ❌ 答错了 (M)
        </button>
         <!-- 仅在未显示增强反馈时，显示“翻转”提示或按钮 -->
        <span v-if="!showEnhancedFeedback" class="flip-hint">(按 空格键 翻转)</span>
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
  width: 90%; /* Use percentage for responsiveness */
  max-width: 300px; /* Keep a max width */
  height: 200px;
  perspective: 1000px;
  cursor: pointer;
  margin-bottom: 20px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.flashcard-front,
.flashcard-back {
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
  /* transform: translateZ(10px); // 移除或调整，可能影响动画 */
}

.flashcard-front {
  background-color: #f8f9fa;
  color: #333;
  z-index: 2;
  transform: rotateY(0deg);
}

.flashcard-back {
  background-color: #e9ecef;
  color: #333;
  transform: rotateY(180deg);
  z-index: 1;
  position: relative; /* 确保子元素定位正确 */
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #e9ecef; /* 与背景色相同以覆盖 */
  z-index: 3; /* 比内容高一级 */
  border-radius: 10px;
  pointer-events: none; /* 允许点击穿透 */
}

.flashcard.flipped .flashcard-front {
  transform: rotateY(-180deg);
}

.flashcard.flipped .flashcard-back {
  transform: rotateY(0deg);
  z-index: 2; /* 翻转后背面在上面 */
}

.content {
  font-size: 24px;
  text-align: center;
  margin-bottom: 10px;
  transition: opacity 0.5s ease-in-out; /* 为内容添加过渡效果 */
}

/* 新增：增强反馈内容的样式和过渡 */
.enhanced-feedback {
  position: absolute; /* 覆盖在普通内容之上 */
  width: calc(100% - 40px); /* 考虑 padding */
  height: calc(100% - 40px);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  pointer-events: none; /* 初始不可见时不允许交互 */
  z-index: 4; /* 最高层级 */
  font-size: 20px; /* 可以调整字体大小 */
}

.enhanced-feedback.visible {
  opacity: 1;
  pointer-events: auto;
}

/* 普通背面内容，在增强反馈显示时隐藏 */
.normal-back-content {
   /* 样式保持不变，通过 v-if 控制 */
}

.memory-count {
  font-size: 14px;
  color: #6c757d;
  position: absolute;
  bottom: 10px;
  right: 15px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap; /* Allow buttons to wrap */
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-items: center; /* 垂直居中 */
  min-height: 40px; /* 防止按钮切换时布局跳动 */
  width: 100%; /* Ensure container takes full width */
}

.answer-actions {
  display: flex;
  flex-wrap: wrap; /* Allow buttons to wrap */
  gap: 10px;
  justify-content: center; /* Center wrapped items */
  align-items: center; /* 垂直居中 */
  width: 100%; /* Ensure container takes full width */
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s, opacity 0.3s;
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
  background-color: #007bff; /* 改为信息蓝 */
  color: white;
}

.wrong {
  background-color: #dc3545; /* 改为警告黄 */
  color: white;
}

.action-btn:hover {
  opacity: 0.85;
}

.flip-hint {
  font-size: 12px;
  color: #6c757d;
  margin-left: 10px;
}

</style>
