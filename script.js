/**
 * 单词闪卡记忆系统
 * 基于艾宾浩斯记忆原理的四次正确记忆验证机制
 */

// 全局变量
let wordList = []; // 原始词库
let currentBatchPool = []; // 当前批次池
let masteredWords = []; // 标熟词库（仅当次有效）
let currentCardIndex = 0; // 当前卡片索引
let isEnglishFirst = true; // 学习模式：true为英文优先，false为中文优先
let isCardFlipped = false; // 卡片是否翻转

// DOM元素
const fileInput = document.getElementById("wordFile");
const fileName = document.getElementById("fileName");
const errorLog = document.getElementById("errorLog");
const errorList = document.getElementById("errorList");
const englishFirstBtn = document.getElementById("englishFirst");
const chineseFirstBtn = document.getElementById("chineseFirst");
const studySection = document.getElementById("studySection");
const flashcard = document.getElementById("flashcard");
const cardFront = document.getElementById("cardFront");
const cardBack = document.getElementById("cardBack");
const showAnswerBtn = document.getElementById("showAnswer");
const feedbackBtns = document.getElementById("feedbackBtns");
const knewItBtn = document.getElementById("knewIt");
const didntKnowBtn = document.getElementById("didntKnow");
const markAsMasteredBtn = document.getElementById("markAsMastered");
const currentBatchElem = document.getElementById("currentBatch");
const remainingWordsElem = document.getElementById("remainingWords");
const masteredWordsElem = document.getElementById("masteredWords");

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  // 绑定事件监听器
  fileInput.addEventListener("change", handleFileUpload);
  englishFirstBtn.addEventListener("click", () => setMode(true));
  chineseFirstBtn.addEventListener("click", () => setMode(false));
  showAnswerBtn.addEventListener("click", flipCard);
  knewItBtn.addEventListener("click", () => handleFeedback("knew"));
  didntKnowBtn.addEventListener("click", () => handleFeedback("didnt"));
  markAsMasteredBtn.addEventListener("click", () => handleFeedback("mastered"));

  // 从本地存储加载学习进度
  loadProgress();
});

/**
 * 处理文件上传
 */
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  fileName.textContent = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    parseWordFile(content);
  };
  reader.readAsText(file);
}

/**
 * 解析单词文件
 * 格式：单词 词性. 中文释义
 * 示例：profound adj. 深刻的；深奥的
 */
function parseWordFile(content) {
  // 清空错误日志
  errorList.innerHTML = "";
  errorLog.classList.add("hidden");

  const lines = content.split("\n");
  const parsedWords = [];
  const errors = [];

  // 正则表达式匹配格式：单词 词性. 中文释义
  const regex = /^([a-zA-Z-]+)\s+([a-zA-Z\.]+)\s+(.+)$/;

  lines.forEach((line, index) => {
    // 跳过空行
    if (!line.trim()) return;

    const match = line.match(regex);
    if (match) {
      const [, word, pos, meaning] = match;
      parsedWords.push({
        word,
        pos,
        meaning,
        memoryCount: 0, // 初始记忆次数为0
      });
    } else {
      errors.push(`第${index + 1}行: ${line} (格式错误)`);
    }
  });

  // 显示解析错误（如果有）
  if (errors.length > 0) {
    errorLog.classList.remove("hidden");
    errors.forEach((error) => {
      const li = document.createElement("li");
      li.textContent = error;
      errorList.appendChild(li);
    });
  }

  // 如果成功解析了单词，开始学习
  if (parsedWords.length > 0) {
    wordList = parsedWords;
    startLearning();
  }
}

/**
 * 设置学习模式
 * @param {boolean} isEnglish - true为英文优先，false为中文优先
 */
function setMode(isEnglish) {
  isEnglishFirst = isEnglish;

  // 更新UI
  if (isEnglish) {
    englishFirstBtn.classList.add("active");
    chineseFirstBtn.classList.remove("active");
  } else {
    englishFirstBtn.classList.remove("active");
    chineseFirstBtn.classList.add("active");
  }

  // 如果已经有单词，重新开始学习
  if (wordList.length > 0) {
    startLearning();
  }
}

/**
 * 开始学习
 */
function startLearning() {
  // 显示学习区域
  studySection.classList.remove("hidden");

  // 初始化当前批次池
  initCurrentBatch();

  // 显示第一张卡片
  showNextCard();

  // 更新统计信息
  updateStats();
}

/**
 * 打乱数组顺序
 * @param {Array} array - 需要打乱顺序的数组
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * 翻转卡片
 */
function flipCard() {
  if (currentBatchPool.length === 0 || currentCardIndex === 0) return;

  const currentWord = currentBatchPool[currentCardIndex - 1];
  if (!currentWord) return;
  if (!isCardFlipped) {
    // 仅在翻转时设置背面内容
    const currentWord = currentBatchPool[currentCardIndex - 1];
    if (isEnglishFirst) {
      cardBack.innerHTML = `<p>${currentWord.pos} ${currentWord.meaning}</p>`;
    } else {
      cardBack.innerHTML = `<p>${currentWord.word} ${currentWord.pos}</p>`;
    }
  }

  isCardFlipped = !isCardFlipped;
  flashcard.classList.toggle("flipped");
  showAnswerBtn.classList.toggle("hidden");
  feedbackBtns.classList.toggle("hidden");
}

/**
 * 初始化当前批次池
 */
function initCurrentBatch() {
  // 清空当前批次池和标熟词库
  currentBatchPool = [];
  masteredWords = [];

  // 从原始词库中筛选未完成记忆的单词（记忆次数<4）
  wordList.forEach((word) => {
    if (word.memoryCount < 4) {
      currentBatchPool.push({ ...word });
    }
  });

  // 打乱顺序
  shuffleArray(currentBatchPool);

  // 重置当前卡片索引
  currentCardIndex = 0;
}

/**
 * 处理用户反馈
 * @param {string} feedbackType - 反馈类型: 'knew'|'didnt'|'mastered'
 */
function handleFeedback(feedbackType) {
  // 获取当前单词
  const currentWord = currentBatchPool[currentCardIndex - 1];

  // 根据反馈类型处理
  switch (feedbackType) {
    case "knew":
      // 认识: 增加记忆次数
      currentWord.memoryCount++;
      break;
    case "didnt":
      // 不认识: 重置记忆次数
      currentWord.memoryCount = 0;
      break;
    case "mastered":
      // 标熟: 标记为已掌握
      currentWord.memoryCount = 4;
      masteredWords.push(currentWord);
      break;
  }

  // 直接显示下一张卡片，跳过翻转动画
  showNextCard();
}

/**
 * 更新统计信息
 */
function updateStats() {
  // 计算当前批次单词数
  const currentBatchCount = currentBatchPool.length;

  // 计算剩余单词数（记忆次数<4的单词）
  const remainingCount = wordList.filter((word) => word.memoryCount < 4).length;

  // 计算已掌握单词数
  const masteredCount = masteredWords.length;

  // 更新UI
  currentBatchElem.textContent = currentBatchCount;
  remainingWordsElem.textContent = remainingCount;
  masteredWordsElem.textContent = masteredCount;
}

/**
 * 显示下一张卡片
 */
function showNextCard() {
  // 重置卡片状态
  isCardFlipped = false;
  if (currentBatchPool.length === 0) {
    initCurrentBatch(); // 确保重新初始化批次池
    currentCardIndex = 0; // 重置索引
  }
  flashcard.classList.remove("flipped");
  showAnswerBtn.classList.remove("hidden");
  feedbackBtns.classList.add("hidden");

  // 检查是否还有卡片
  if (currentBatchPool.length === 0) {
    // 所有单词都已学习完毕
    cardFront.innerHTML = "<p>恭喜！</p><p>当前批次的单词已全部学习完毕</p>";
    cardBack.innerHTML = '<p>点击"显示答案"重新开始</p>';
    showAnswerBtn.textContent = "重新开始";
    showAnswerBtn.onclick = () => {
      initCurrentBatch();
      showNextCard();
      updateStats();
    };
    return;
  }

  // 获取当前单词
  const currentWord = currentBatchPool[currentCardIndex];

  // 根据学习模式设置卡片内容
  if (isEnglishFirst) {
    cardFront.textContent = currentWord.word;
    // 清空背面内容
    cardBack.innerHTML = "";
  } else {
    cardFront.textContent = currentWord.meaning;
    cardBack.innerHTML = "";
  }

  // 更新当前卡片索引
  currentCardIndex = (currentCardIndex + 1) % currentBatchPool.length;

  // 更新统计信息
  updateStats();
}
