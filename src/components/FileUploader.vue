<script setup>
import { ref } from "vue";

const emit = defineEmits(["wordsLoaded", "parseError"]);

const fileName = ref("未选择文件");
const errorList = ref([]);
const showErrorLog = ref(false);

// 解析单词文件
const parseWordFile = (file) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result;
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    const words = [];
    const errors = [];

    lines.forEach((line, index) => {
      // 使用简单的split方法按++分隔符拆分
      const parts = line.trim().split('++');
      const match = parts.length === 3 ? parts : null;

      if (match) {
        const [word, partOfSpeech, definition] = match;
        words.push({
          id: index,
          word: word.trim(),
          partOfSpeech: partOfSpeech.trim(),
          definition: definition.trim(),
          memoryCount: 0,
        });
      } else {
        errors.push(
          `第${
            index + 1
          }行: "${line}" 格式错误，应为: profound++adj.++深刻的；深奥的 `
        );
      }
    });

    if (errors.length > 0) {
      errorList.value = errors;
      showErrorLog.value = true;
      emit("parseError", errors);
    } else {
      showErrorLog.value = false;
      emit("wordsLoaded", words);
    }
  };

  reader.readAsText(file);
};

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    fileName.value = file.name;
    parseWordFile(file);
  } else {
    fileName.value = "未选择文件";
  }
};
</script>

<template>
  <div class="file-upload-section">
    <h2>上传单词文件</h2>
    <p class="instruction">支持TXT格式：单词/短语++词性.++中文释义</p>
    <p class="example">示例：profound++adj.++深刻的；深奥的</p>
    <p class="example">示例：work-life balance++n.++工作与生活平衡</p>
    <div class="upload-area">
      <input
        type="file"
        id="wordFile"
        accept=".txt"
        class="file-input"
        @change="handleFileChange"
      />
      <label for="wordFile" class="file-label">选择文件</label>
      <span id="fileName">{{ fileName }}</span>
    </div>
    <div v-if="showErrorLog" class="error-log">
      <h3>解析错误日志</h3>
      <ul>
        <li v-for="(error, index) in errorList" :key="index">{{ error }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.file-upload-section {
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

.instruction,
.example {
  margin: 10px 0;
  color: #6c757d;
}

.example {
  font-style: italic;
}

.upload-area {
  display: flex;
  align-items: center;
  margin: 15px 0;
}

.file-input {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.file-label {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-right: 10px;
  transition: background-color 0.3s;
}

.file-label:hover {
  background-color: #0069d9;
}

#fileName {
  color: #495057;
}

.error-log {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
  color: #721c24;
}

.error-log h3 {
  margin-top: 0;
  font-size: 18px;
}

.error-log ul {
  margin: 10px 0 0;
  padding-left: 20px;
}
</style>
