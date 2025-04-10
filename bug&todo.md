# Bug 和 todolist

1. 优化随机单词，并且注意原来的逻辑是否支持直接升级，还是需要推翻重写：
2. 结尾的 bug
3. 优化布局，也许先用 iPad 画一下？或者 figma？

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
