<script setup>
import { ref, computed, onMounted, watch } from "vue";
import FileUploader from "./components/FileUploader.vue";
import ModeSelector from "./components/ModeSelector.vue";
import FlashCard from "./components/FlashCard.vue";
import StatsPanel from "./components/StatsPanel.vue";

// 状态管理
const words = ref([]);
const currentWordIndex = ref(0);
const studyMode = ref("english"); // 'english' 或 'chinese'
const showStudySection = ref(false);

// 统计数据
const totalWords = computed(() => words.value.length);
const remainingWords = computed(
  () => words.value.filter((word) => word.memoryCount < 4).length
);
const masteredWords = computed(
  () => words.value.filter((word) => word.memoryCount >= 4).length
);
const currentBatch = computed(() => {
  if (words.value.length === 0) return 0;
  return Math.floor(
    ((totalWords.value - remainingWords.value) / totalWords.value) * 100
  );
});

// 当前单词
const currentWord = computed(() => {
  if (
    words.value.length === 0 ||
    currentWordIndex.value >= words.value.length
  ) {
    return null;
  }
  return words.value[currentWordIndex.value];
});

// 卡片内容
const frontContent = computed(() => {
  if (!currentWord.value) return "";
  return studyMode.value === "english"
    ? currentWord.value.word
    : `${currentWord.value.partOfSpeech} ${currentWord.value.definition}`;
});

const backContent = computed(() => {
  if (!currentWord.value) return "";
  return studyMode.value === "english"
    ? `${currentWord.value.partOfSpeech} ${currentWord.value.definition}`
    : currentWord.value.word;
});

// 处理单词文件上传
const handleWordsLoaded = (loadedWords) => {
  // 从本地存储加载记忆进度
  const savedProgress = localStorage.getItem("flashVocabProgress");
  if (savedProgress) {
    try {
      const parsedProgress = JSON.parse(savedProgress);
      words.value = loadedWords.map((word) => {
        const savedWord = parsedProgress.find((w) => w.word === word.word);
        return savedWord
          ? { ...word, memoryCount: savedWord.memoryCount }
          : { ...word, memoryCount: 0 };
      });
    } catch (e) {
      console.error("Failed to parse saved progress:", e);
      words.value = loadedWords.map((word) => ({ ...word, memoryCount: 0 }));
    }
    const progressData = JSON.parse(savedProgress);

    // 合并加载的单词和保存的进度
    words.value = loadedWords.map((word) => {
      const savedWord = progressData.find(
        (saved) =>
          saved.word === word.word &&
          saved.partOfSpeech === word.partOfSpeech &&
          saved.definition === word.definition
      );

      if (savedWord) {
        return { ...word, memoryCount: savedWord.memoryCount };
      }
      return word;
    });
  } else {
    words.value = loadedWords;
  }

  // 找到第一个未掌握的单词
  const firstNotMasteredIndex = words.value.findIndex(
    (word) => word.memoryCount < 4
  );
  if (firstNotMasteredIndex !== -1) {
    currentWordIndex.value = firstNotMasteredIndex;
  } else {
    currentWordIndex.value = 0;
  }

  showStudySection.value = true;
};

// 处理解析错误
const handleParseError = (errors) => {
  showStudySection.value = false;
};

// 处理学习模式变更
const handleModeChange = (mode) => {
  studyMode.value = mode;
};

// 处理认识按钮
const handleKnow = () => {
  if (!currentWord.value) return;

  // 增加记忆计数
  words.value[currentWordIndex.value].memoryCount++;

  // 保存进度
  saveProgress();

  // 移动到下一个未掌握的单词
  moveToNextWord();
};

// 处理不认识按钮
const handleDontKnow = () => {
  if (!currentWord.value) return;

  // 重置记忆计数
  words.value[currentWordIndex.value].memoryCount = 0;

  // 保存进度
  saveProgress();

  // 移动到下一个未掌握的单词
  moveToNextWord();
};

// 处理标熟按钮
const handleMarkAsMastered = () => {
  if (!currentWord.value) return;

  // 将记忆计数设为4（已掌握）
  words.value[currentWordIndex.value].memoryCount = 4;

  // 保存进度
  saveProgress();

  // 移动到下一个未掌握的单词
  moveToNextWord();
};

// 移动到下一个未掌握的单词
const moveToNextWord = () => {
  // 如果所有单词都已掌握，显示完成信息
  if (remainingWords.value === 0) {
    alert("恭喜！您已掌握所有单词！");
    return;
  }

  // 查找下一个未掌握的单词
  let nextIndex = (currentWordIndex.value + 1) % words.value.length;
  const startIndex = nextIndex;

  // 循环查找直到找到未掌握的单词或回到起点
  while (words.value[nextIndex].memoryCount >= 4) {
    nextIndex = (nextIndex + 1) % words.value.length;
    if (nextIndex === startIndex) break; // 防止无限循环
  }

  currentWordIndex.value = nextIndex;
};

// 保存进度到本地存储
const saveProgress = () => {
  localStorage.setItem("flashVocabProgress", JSON.stringify(words.value));
};

// 加载示例单词
const loadSampleWords = async () => {
  try {
    const response = await fetch("/sample_words.txt");
    const content = await response.text();
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    const sampleWords = [];

    lines.forEach((line, index) => {
      // 更新正则表达式以支持多词短语和带连字符的词组，以及phr.等词性标记，以及词性后面有多个点号的情况
      // 使用更贪婪的匹配模式来确保捕获整个短语直到词性标记
      const match =
        line.match(
          /^(.+?)\s+([^\s.]+\.+|\/[^\s.]+\.+|\/v\.+|\/n\.+|\/adj\.+|\/adv\.+|\/phr\.+)\s+(.+)$/
        ) || line.match(/^(.+?)\s+(phr\.+)\s+(.+)$/);

      if (match) {
        const [, word, partOfSpeech, definition] = match;
        sampleWords.push({
          id: index,
          word: word.trim(),
          partOfSpeech: partOfSpeech.trim(),
          definition: definition.trim(),
          memoryCount: 0,
        });
      }
    });

    if (sampleWords.length > 0) {
      handleWordsLoaded(sampleWords);
    }
  } catch (error) {
    console.error("加载示例单词失败:", error);
  }
};

// 组件挂载时尝试加载示例单词
onMounted(() => {
  loadSampleWords();
});

// 监听单词列表变化，更新统计信息
watch(
  words,
  () => {
    // 如果所有单词都已掌握，显示完成信息
    if (words.value.length > 0 && remainingWords.value === 0) {
      alert("恭喜！您已掌握所有单词！");
    }
  },
  { deep: true }
);

// 重置学习进度
const resetProgress = () => {
  if (confirm("确定要重置学习进度吗？这将清除所有记忆次数。")) {
    words.value.forEach((word) => {
      word.memoryCount = 0;
    });
    localStorage.removeItem("flashVocabProgress");
    currentWordIndex.value = 0;
  }
};
</script>

<template>
  <div class="app-container">
    <header>
      <h1>单词闪卡记忆系统</h1>
      <p>基于艾宾浩斯记忆曲线，帮助你高效记忆单词</p>
      <button @click="resetProgress" class="reset-btn">重置进度</button>
    </header>

    <FileUploader
      @words-loaded="handleWordsLoaded"
      @parse-error="handleParseError"
    />

    <ModeSelector @mode-change="handleModeChange" />

    <div v-if="showStudySection" class="study-section">
      <StatsPanel
        :total-words="totalWords"
        :remaining-words="remainingWords"
        :mastered-words="masteredWords"
        :current-batch="currentBatch"
      />

      <FlashCard
        v-if="currentWord"
        :front-content="frontContent"
        :back-content="backContent"
        :memory-count="currentWord.memoryCount"
        @know="handleKnow"
        @dont-know="handleDontKnow"
        @mark-as-mastered="handleMarkAsMastered"
      />
    </div>
  </div>
</template>

<style>
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --body-bg: #f5f5f5;
  --card-bg: #ffffff;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--body-bg);
  color: var(--dark-color);
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

header p {
  color: var(--secondary-color);
  font-size: 18px;
}

.study-section {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    padding: 15px;
  }

  header h1 {
    font-size: 24px;
  }

  header p {
    font-size: 16px;
  }
}
</style>
