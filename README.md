# Flash Vocabulary System 🎴

这是一个 2 个小时仅靠：deepseek-r1 优化初始 prompt + Trae 的 ds-r1 做出来的项目。初心是辅助学业（老师上课提了一下可以让 ai 帮忙写这种程序，加之我其实早就想做了）
基于艾宾浩斯记忆曲线的智能单词记忆系统，通过科学的四次记忆验证机制帮助用户高效掌握词汇。

## 体验

`https://vocab.ganzhe.site`

## ✨ 核心功能

- **双语学习模式**：支持英文优先/中文优先两种学习模式
- **智能记忆算法**：采用四次正确记忆验证机制（记忆次数跟踪）
- **学习进度保存**：本地存储记忆进度（localStorage）
- **错误格式检测**：单词文件格式验证与错误提示
- **学习统计面板**：实时显示当前批次/剩余词汇/标熟词汇
- **交互式闪卡**：支持点击翻转卡片的三维动画效果

## 📁 文件格式要求

👇下面有说明, 同时建议直接参照[`sample_words.txt`](https://github.com/Ganzhe2028/Flash-Vocab/blob/dev/sample_words.txt)

## 🛠 使用说明

1. 先让 DeepSeek 等 AI 帮你整理单词表至特定格式, prompt:

   ```plaintext
   将上面的内容整理成如下形式：
   单词++词性.++中文释义
   即：[单词][+][+][词性.][+][+][中文释义]
   示例：
   profound++adj.++深刻的；深奥的
   ambiguous++adj.++模棱两可的
   paradox++n.++悖论
   ```

2. 上传单词文件（UTF-8 编码）
3. 选择学习模式：
   - 🇺🇸 英文优先：显示单词 → 点击显示词性释义
   - 🇨🇳 中文优先：显示释义 → 点击显示对应单词
4. 学习反馈：
   - ✅ 认识：增加记忆计数
   - ❌ 不认识：重置记忆计数
   - 🎯 标熟：标记为已掌握（记忆次数设为 4）

## 🖥 运行方式

```bash
# 使用现代浏览器打开（推荐 Chrome/Firefox）
open index.html
```

## 📚 技术栈

- 核心框架：Vanilla JavaScript
- 数据持久化：Browser localStorage
- 交互样式：CSS 3D Transform
- 构建工具：原生浏览器支持

## 📂 项目结构

```plaintext
/闪卡单词/
├── index.html          # 主界面
├── style.css           # 样式表
├── script.js           # 核心逻辑
├── sample_words.txt     # 示例单词库
├── .gitignore          # 版本控制排除项
└── README.md           # 项目文档
```

## ⚖️ 开源协议

MIT License © 2024 Ganzhe

```plaintext

关键要素说明：
1. 包含必要的使用说明和技术细节
2. 采用emoji图标提升可读性
3. 突出展示了项目的科学记忆算法特性
4. 添加了本地运行方式的指引
5. 文件结构树与实际项目完全匹配

建议后续可通过 `git add README.md` 将其加入版本控制，保持文档与代码同步更新。
```
