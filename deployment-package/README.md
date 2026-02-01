# 🪄 魔法家族网站

一个哈利波特风格的家族网站，采用霍格沃茨夜空配色（深靛蓝 + 星屑金），包含族谱、族章和聊天区功能。

## ✨ 功能特点

### 🏰 视觉设计
- **霍格沃茨夜空配色**：深靛蓝背景配以星屑金色点缀
- **动态星屑背景**：鼠标移动时星星会响应并飘动
- **魔法文字效果**：金色渐变文字带发光特效
- **羊皮纸质感的聊天区**：复古魔法日记风格

### 🧙‍♂️ 族谱功能（⭐ 可自定义）
- **星座网络可视化**：家族成员以星星节点展示
- **Markdown 数据源**：通过修改 `/data/family-members.md` 轻松添加/修改成员
- **交互式星图**：鼠标悬停时连线发光，显示成员关系
- **实时数据加载**：修改Markdown文件后刷新页面即可更新

### 💬 聊天区
- **GitHub 账号登录**：使用 GitHub OAuth 登录
- **巫师头像系统**：随机分配魔法风格头像
- **实时消息**：支持发送和接收家族消息
- **魔法界面**：哈利波特风格的聊天界面

### 🛡️ 族章
- **AI 生成族徽**：霍格沃茨纹章风格设计
- **3D 旋转效果**：鼠标悬停时徽章旋转
- **发光边框**：魔法光晕环绕效果

## 🚀 部署到 GitHub Pages

### 方法一：直接上传（最简单）

1. **创建新仓库**
   - 在 GitHub 上创建一个新的 **公开** 仓库
   - 仓库名建议：`magic-family` 或你喜欢的名字

2. **上传这些文件**
   - 进入仓库页面，点击 "Add file" → "Upload files"
   - 上传以下文件到仓库根目录：
     - `index.html`
     - `family_crest.png`
     - `assets/` 目录（整个文件夹）
     - `data/` 目录（整个文件夹）

3. **启用 GitHub Pages**
   - 进入仓库 Settings > Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main" 和 "/ (root)"
   - 点击 Save

4. **访问网站**
   - 等待2-3分钟
   - 访问：`https://你的用户名.github.io/你的仓库名`

### 方法二：使用 Git（推荐用于后续更新）

```bash
# 1. 克隆你刚创建的仓库
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名

# 2. 复制这些文件到仓库目录
cp /mnt/okcomputer/output/deployment-package/* ./ -r

# 3. 提交并推送
git add .
git commit -m "Initial deployment: 魔法家族网站"
git push origin main
```

## 📝 如何添加/修改家族成员

### 编辑族谱数据

打开 `data/family-members.md` 文件，按照以下格式编辑：

```markdown
## 第1代（始祖）

- **家族始祖** | relation:家族创始人 | x:50 | y:15 | avatar:👑 | isAncestor:true

## 第2代

- **父亲** | relation:第二代 | x:30 | y:35 | avatar:🧙‍♂️
- **母亲** | relation:第二代 | x:70 | y:35 | avatar:🧙‍♀️

## 第3代

- **儿子** | relation:第三代 | x:40 | y:55 | avatar:✨
- **女儿** | relation:第三代 | x:60 | y:55 | avatar:🌙
```

### 添加新成员

**在同一代中添加：**
```markdown
## 第3代

- **儿子** | relation:第三代 | x:40 | y:55 | avatar:✨
- **女儿** | relation:第三代 | x:60 | y:55 | avatar:🌙
- **新成员** | relation:第三代 | x:50 | y:55 | avatar:🎭  ← 添加这一行
```

**添加新一代：**
```markdown
## 第4代

- **孙子** | relation:第四代 | x:45 | y:75 | avatar:🦉
- **孙女** | relation:第四代 | x:55 | y:75 | avatar:⚡
```

### 可用头像

魔法风格头像：
- 👑 始祖/族长
- 🧙‍♂️ 男巫师
- 🧙‍♀️ 女巫师
- ✨ 星辰使者
- 🌙 月影行者
- 🔮 水晶预言家
- 📜 卷轴守护者
- 🦉 猫头鹰信使
- ⚡ 雷电法师
- 🌟 星光法师
- 💫 魔法学徒
- ⭐ 新成员

### 坐标参考

- **第1代（始祖）**: y ≈ 10-20
- **第2代**: y ≈ 30-40
- **第3代**: y ≈ 50-60
- **第4代**: y ≈ 70-80
- **第5代**: y ≈ 90-100

横向分布（x坐标）：
- 左侧: 10-30
- 中左: 30-45
- 中央: 45-55
- 中右: 55-70
- 右侧: 70-90

### 更新数据

1. 修改 `data/family-members.md`
2. 提交到 GitHub：
   ```bash
   git add data/family-members.md
   git commit -m "更新族谱：添加新成员"
   git push origin main
   ```
3. 刷新网站即可看到更新

## 🎨 自定义修改

### 修改家族名称
编辑 `index.html`，找到：
```html
<title>魔法家族</title>
```

### 修改配色方案
编辑 `assets/index-*.css`，搜索并修改颜色值（需要一定的CSS知识）

## 📱 响应式设计

- **桌面端**：完整星图交互体验
- **平板端**：适配触摸操作
- **手机端**：移动端优化，如"活点地图"般流畅

## 🔧 技术栈

- **React 18** + **TypeScript**
- **Tailwind CSS**
- **GSAP** - 动画效果
- **Vite** - 构建工具

## 📦 文件结构

```
├── index.html              # 主页文件
├── family_crest.png        # 族徽图片
├── assets/                 # CSS和JS文件
│   ├── index-*.css
│   └── index-*.js
└── data/                   # 数据文件
    └── family-members.md   # ⭐ 族谱数据文件
```

## 🎯 下一步建议

1. **添加真实族谱数据**：编辑 `data/family-members.md`
2. **自定义族徽**：替换 `family_crest.png`
3. **添加家族故事**：在聊天区分享家族历史
4. **集成真实后端**：连接数据库保存聊天消息

## 🪄 魔法彩蛋

在族谱星图上，将鼠标悬停在不同星星上，可以看到血脉连线的发光效果！

---

**祝你的魔法家族网站部署顺利！** ✨🪄

## 📖 更新日志

### v2.0 更新内容
- ✨ 新增 Markdown 数据源支持
- 🔄 实时加载族谱数据
- 📝 简化添加成员流程
- 🐛 修复图片加载问题
- 📱 优化移动端体验
