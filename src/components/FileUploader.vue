<script setup>
import { ref } from "vue";

const emit = defineEmits(["wordsLoaded", "parseError"]);

const fileName = ref("未选择文件");
const errorList = ref([]);
const showErrorLog = ref(false);

// 复制提示到剪贴板
const copyPrompt = async () => {
  const promptText = `请将以下单词列表转换为“单词/短语++词性.++中文释义”的格式，即：[单词][+][+][词性.][+][+][中文释义]，每行一个：\n[在此处粘贴你的单词列表]\n例如：\nprofound++adj.++深刻的；深奥的\nwork-life balance++n.++工作与生活平衡`;
  try {
    await navigator.clipboard.writeText(promptText);
    alert('提示已复制到剪贴板！');
  } catch (err) {
    console.error('无法复制提示: ', err);
    alert('复制失败，请手动复制。');
  }
};

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
    <details class="details">
      <summary style="cursor: pointer; font-weight: bold; margin-bottom: 10px;">如何准备单词文件？ (点击展开)</summary>
      <p class="instruction">支持TXT格式：单词/短语++词性.++中文释义</p>
      <p class="example">示例：profound++adj.++深刻的；深奥的</p>
      <p class="example">示例：work-life balance++n.++工作与生活平衡</p>
      <p class="">💡Tips: 将你要背的单词收集到一个txt文档里(每行一个)然后给DeepSeek</p>
      <button class="prompt" @click="copyPrompt">Copy Prompt</button>
      <p class="more-info">更多信息见底部GitHub仓库的Readme</p>
    </details>
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
  flex-wrap: wrap; /* Allow items to wrap on smaller screens */
  align-items: center;
  justify-content: center;
  gap: 10px; /* Add some space between items when wrapped */
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
  /* margin-right: 10px; Removed margin, using gap now */
  transition: background-color 0.3s;
  white-space: nowrap; /* Prevent label text from wrapping */
}

.file-label:hover {
  background-color: #0069d9;
}

#fileName {
  color: #495057;
  word-break: break-all; /* Allow long file names to break */
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

.more-info {
  color: #6c757d;
}

.details {
  margin-bottom: 20px;
}

/* Media query for very narrow screens */
@media (max-width: 420px) {
  .file-upload-section {
    padding: 10px; /* Reduce padding on very small screens */
  }
  .upload-area {
    flex-direction: column; /* Stack items vertically */
    align-items: stretch; /* Stretch items to full width */
  }
  .file-label {
    text-align: center; /* Center text in button */
  }
  #fileName {
    text-align: center; /* Center file name */
    margin-top: 5px;
  }
}
</style>
