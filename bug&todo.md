# Bug 和 todolist

## Short term

- keyboard 操作, 类似不背
- 结尾的 bug

## Medium term

- 随机背单词
- 优化布局，也许先用 iPad 画一下？或者 figma？
- 像不背一样, 用户在答对之后能够有正反馈, 例如闪卡背面是绿色的、有动效之类的; 或者可以看到记忆次数变多(这个也可以加动效! 强调正反馈). 至于打错之后, 就不管了, 就当是没有负反馈了哈哈哈哈 😂
- 像不背一样要求听写, 拼写
- 增加记笔记的功能

## Long term

- 像 Cling 一样, 增加 AI 帮助解释单词、用故事讲单词等个性化的帮助自然地记忆单词的能力
  - 甚至可以模仿薄荷阅读,直接让 AI 生成几篇带有这些词的文章, 且匹配用户阅读水平(让用户输入词汇量+蓝思值), 甚至有望促进用户阅读水平

---

---

这个项目的随机起始单词实现主要依赖于两个关键函数：

1. 数组洗牌算法 ：通过 shuffleArray 函数实现 Fisher-Yates 洗牌算法
2. 批次初始化 ：在 initCurrentBatch 函数中调用洗牌函数
   具体实现代码段如下：

```javascript
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
 * 初始化当前批次池
 */
function initCurrentBatch() {
  // ... 其他初始化代码 ...

  // 从原始词库中筛选未完成记忆的单词（记忆次数<4）
  wordList.forEach((word) => {
    if (word.memoryCount < 4) {
      currentBatchPool.push({ ...word });
    }
  });

  // 打乱顺序（核心随机化代码）
  shuffleArray(currentBatchPool);

  // ... 后续代码 ...
}
```

实现原理说明：

1. 每次初始化批次池时，会筛选出需要记忆的单词
2. 使用 Fisher-Yates 算法对批次池进行随机洗牌，该算法的时间复杂度为 O(n)，且保证每个排列出现的概率相等
3. 洗牌后的数组第一个元素即为随机起始单词
4. 在 showNextCard 函数中，通过 currentCardIndex 索引访问洗牌后的数组元素
   这种实现方式确保了：

- 每次学习会话都会生成新的随机顺序
- 相同记忆状态的单词在不同学习会话中会以不同顺序出现
- 起始单词的完全随机性