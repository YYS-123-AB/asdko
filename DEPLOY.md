# 📜 历史上的今天大事件站 - 部署教程

> 一个功能完整的纯前端「历史上的今天」大事件站项目，无需后端即可运行。

---

## 📁 项目结构

```
web17/
├── index.html                          # 主页面
├── css/
│   └── style.css                       # 样式文件（双主题+响应式+时间轴）
├── js/
│   └── app.js                          # 核心逻辑（筛选/搜索/排序/弹窗/主题）
├── data/
│   └── data.json                       # 历史事件数据（2173+条）
├── scripts/
│   ├── fetch-data.js                   # 在线获取/本地生成数据脚本
│   └── generate-data.js                # 内置数据生成器
├── .github/
│   └── workflows/
│       └── deploy.yml                  # GitHub Actions 自动化部署
├── vite.config.js                      # Vite 配置
├── package.json                        # 项目配置
├── .nojekyll                           # GitHub Pages 必需文件
├── .gitignore
└── DEPLOY.md                           # 本文档
```

---

## 🚀 快速开始（本地开发）

### 1. 环境要求

- **Node.js** >= 16.14（推荐 18.x / 20.x LTS）
- **npm** >= 8.x 或 **pnpm** / **yarn**

### 2. 安装依赖

```bash
cd web17
npm install
# 或使用 pnpm / yarn
# pnpm install
# yarn install
```

### 3. 启动开发服务器

```bash
npm run dev
# 或
npm start
```

启动后默认浏览器会自动打开：<http://localhost:5173>

Vite 配置了：
- 端口：5173（可在 vite.config.js 中修改）
- 自动打开浏览器
- 热模块替换（HMR）

### 4. 构建生产版本

```bash
npm run build
```

构建产物会输出到 `dist/` 目录下。

### 5. 预览生产构建

```bash
npx vite preview
```

---

## 📦 数据生成 / 更新

项目自带一个内置的数据生成器，可以生成覆盖全年 366 天、10 大分类的 2000+ 条历史事件数据。

### 生成数据

```bash
npm run fetch
```

脚本执行逻辑：

1. 优先尝试在线数据源（默认关闭，可在 `scripts/fetch-data.js` 中启用 Wikipedia API）
2. 在线获取失败时，自动调用内置生成器 `scripts/generate-data.js`
3. 数据输出到 `data/data.json`

**注意**：生成的数据是模板化的示例数据，用于演示项目功能。如果需要真实数据，可以：
- 接入维基百科的 On This Day API
- 自行编写爬虫采集公开历史数据
- 手动编辑 `data/data.json` 文件

### 数据格式说明

单条事件对象字段：

| 字段                | 类型            | 说明                                             |
| ------------------- | --------------- | ------------------------------------------------ |
| `id`                | number          | 全局唯一 ID                                      |
| `month`             | number          | 月份 1-12                                        |
| `day`               | number          | 日期 1-31                                        |
| `year`              | number          | 年份（正数）                                     |
| `isBC`              | boolean         | 是否公元前                                       |
| `title`             | string          | 事件标题                                         |
| `category`          | string          | 分类枚举值（见下方分类表）                       |
| `persons`           | Array\<Person>  | 涉及人物列表（含头像、生卒年、简介）             |
| `location`          | string          | 发生地点                                         |
| `importance`        | number          | 重要性 1-5 星                                    |
| `image`             | string          | 图片 URL（空则使用 picsum 占位图）               |
| `summary`           | string          | 事件摘要                                         |
| `content`           | string          | 详细内容（支持多行文本）                         |
| `impact`            | Array\<string>  | 影响分析列表                                     |
| `historicalMeaning` | string          | 历史意义                                         |
| `relatedIds`        | Array\<number>  | 相关事件 ID 列表                                 |
| `sourceUrl`         | string          | 维基百科原文链接                                 |
| `tags`              | Array\<string>  | 标签（用于搜索匹配）                             |
| `isBirthday`        | boolean         | 是否为诞辰事件                                   |
| `isAnniversary`     | boolean         | 是否为纪念日事件                                 |

### 分类枚举

| 分类值         | 中文名     |
| -------------- | ---------- |
| `all`          | 全部       |
| `politics`     | 政治       |
| `military`     | 军事       |
| `tech`         | 科技       |
| `culture`      | 文化       |
| `sports`       | 体育       |
| `economy`      | 经济       |
| `birth`        | 名人诞辰   |
| `death`        | 名人逝世   |
| `disaster`     | 重大灾害   |
| `society`      | 社会事件   |

---

## 🌐 部署方式

### 方式一：GitHub Pages（推荐，自动化）

项目已内置 `.github/workflows/deploy.yml` 完整的 CI/CD 工作流，支持三触发、三 Job。

#### 步骤

1. **创建 GitHub 仓库**，将项目代码推送到 `main` 或 `master` 分支
2. **启用 GitHub Pages**：
   - 进入仓库 → Settings → Pages
   - Source 选择：**GitHub Actions**
3. **推送代码**即可自动触发部署
4. 或手动触发：进入仓库 → Actions → 选择 "Deploy History Today Site" → Run workflow
   - 可选择部署环境（production / staging）
   - 可选择是否重新生成数据

#### Workflow 三触发条件

- 📌 Push 到 `main` / `master` 分支（忽略 README、DEPLOY.md、.gitignore）
- 🔃 Pull Request 到 `main` / `master` 分支
- 🎮 手动点击 Run workflow（workflow_dispatch）

#### Workflow 三 Job

1. **build**：安装依赖 → 生成数据 → Vite 构建 → 上传产物
2. **deploy**：下载产物 → 配置 Pages → 部署到 GitHub Pages
3. **commit-data**：如重新生成了数据，自动 commit 回仓库

#### 官方 Actions 版本

- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/upload-artifact@v4`
- `actions/download-artifact@v4`
- `actions/configure-pages@v5`
- `actions/deploy-pages@v4`
- `stefanzweifel/git-auto-commit-action@v5`

---

### 方式二：Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. 点击上方按钮或登录 [vercel.com](https://vercel.com)
2. Import 你的 GitHub 仓库
3. 配置 Build Command：`npm run build`
4. 配置 Output Directory：`dist`
5. 点击 Deploy，30 秒内即可上线

---

### 方式三：Netlify 部署

1. 登录 [app.netlify.com](https://app.netlify.com)
2. Add new site → Import an existing project
3. 选择 GitHub 仓库
4. 配置：
   - Build command：`npm run build`
   - Publish directory：`dist`
5. 点击 Deploy site

---

### 方式四：Cloudflare Pages 部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages
2. Create → Pages → Connect to Git
3. 选择仓库与分支
4. Build settings：
   - Build command：`npm run build`
   - Build output directory：`dist`
5. Save and Deploy

---

### 方式五：静态文件 / 任意虚拟主机

**这是一个纯前端项目，任何能托管静态文件的空间都能跑！**

1. 执行 `npm run build` 生成 `dist/` 目录
2. 将 `dist/` 中的 **所有文件** 上传到你的服务器根目录或子目录
3. 若是子目录部署（如 `https://你的域名/history/`），需要修改 `vite.config.js`：
   ```js
   export default defineConfig({
     base: '/history/',  // 改成你的子路径，首尾都要有 /
   })
   ```
4. 配置 Web 服务器（Nginx / Apache）将 404 fallback 到 index.html（可选，单页友好）

**Nginx 示例配置**：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/web17/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

### 方式六：本地 file:// 直接打开

项目使用了相对路径（`vite.config.js` 中 `base: './'`），且使用动态 `fetch()` 读取 JSON。

⚠️ **直接双击 index.html 可能遇到问题**：
- 现代浏览器会阻止 `file://` 协议下的 `fetch()` 请求
- 数据文件可能加载失败导致页面显示 Loading

**正确姿势**：用任意静态服务器启动，例如：

```bash
# 方法1：Python 3 内置
cd dist
python -m http.server 8080

# 方法2：Node.js（需全局安装 serve）
npx serve dist

# 方法3：VS Code Live Server 插件
# 右键 index.html → Open with Live Server
```

然后访问 <http://localhost:8080>

---

## ✨ 功能特性总览

| 模块         | 特性说明                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| 📅 日期选择   | 月/日两个下拉选择器（12月 × 31日），默认自动定位今天                    |
| 🏷️ 分类筛选   | 10 大分类 Tab：全部/政治/军事/科技/文化/体育/经济/名人诞辰/名人逝世/重大灾害/社会事件 |
| 🔍 搜索       | 300ms 防抖，匹配事件标题/人物/地点/标签/内容关键词                       |
| ↕️ 排序       | 年份升序 / 年份降序 / 重要性从高到低                                     |
| 📜 时间轴     | 垂直时间轴布局，左侧圆点按分类着色，年份徽章                             |
| 💳 事件卡片   | 年份(AD/BC)、标题、分类标签色、人物、地点、⭐1-5星、picsum 图片        |
| 🪟 详情弹窗   | 大图 + 完整年份(公元前) + 详细内容 + 人物卡片 + 影响分析 + 历史意义 + 相关事件 + 维基链接 |
| 🔙 关闭弹窗   | 三方式：右上角按钮 / 点击遮罩 / ESC 键                                    |
| 📊 侧边栏     | 本月 TOP10 大事件 / 本年生肖+星座+朝代速查 / 随机跳转日期 + 随机事件   |
| 🌓 主题切换   | 明亮 / 暗黑 / 跟随系统 三模式，localStorage 持久化                       |
| ⭐ 收藏夹     | localStorage 持久化收藏，支持仅看收藏，收藏数量徽章                      |
| ⬆️ 回到顶部   | 滚动超过 400px 出现，平滑滚动                                            |
| 📱 响应式     | 三断点：1200px（两栏+侧栏） / 768px（单栏Tab横滑+抽屉侧栏） / 480px（精简） |
| ⏳ 状态管理   | 加载中 / 空结果 / 收藏夹为空 三种状态视图                                 |

---

## 🛠️ 常见问题

### Q1：为什么直接打开 index.html 没有数据？
A：因为浏览器安全策略阻止了 `file://` 协议的 `fetch()`。请用 `npm run dev` 启动开发服务器，或用任意静态服务器托管 dist 目录。

### Q2：如何修改主题配色？
A：编辑 `css/style.css` 顶部的 `:root` 和 `[data-theme="dark"]` 中的 CSS 变量即可快速改色。

### Q3：如何接入真实历史事件数据？
A：有三种方式：
1. 编辑 `scripts/fetch-data.js`，启用维基百科 On This Day API
2. 用其他编程语言写爬虫，然后将结果按 `data/data.json` 的格式写入
3. 直接用 Excel/脚本生成 JSON 覆盖 `data/data.json`

### Q4：想部署到子目录怎么办？
A：修改 `vite.config.js` 中的 `base`，改为 `'/你的子目录/'`，然后重新 `npm run build`。

### Q5：GitHub Pages 部署失败怎么办？
A：
- 检查仓库 Settings → Pages → Source 是否选择了 **GitHub Actions**
- 进入 Actions 页面查看 Job 日志定位错误
- 确保 `package.json` 中 vite 版本与 Node 兼容（推荐 Node 18+）

### Q6：本地生成数据脚本报错？
A：项目使用 ES Module（package.json 中 `"type": "module"`），请确保 Node.js >= 14.13.1。

---

## 📝 License

MIT License - 随意用于学习、商用、二次开发。

> 以史为鉴，可以知兴替。 📜
