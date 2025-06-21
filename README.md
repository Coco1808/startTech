# 金融数据可视化应用

这是一个基于 Next.js 和 Material-UI 构建的交互式财务数据可视化仪表板。用户可以通过搜索选择不同的股票，查看其多年的每月营收和营收年增率，并进行交互式分析。

## ✨ 核心功能

- **动态股票搜索**: 支持通过股票代码或名称模糊搜索，并实时更新数据。
- **交互式图表**: 使用 Recharts 构建了柱状图与折线图结合的复合图表，展示每月营收和年增率。
- **数据视图切换**: 提供按钮动态切换图表内容（例如，只看营收或查看全部数据）。
- **时间范围选择**: 支持通过下拉菜单筛选不同的时间区间（如近1年、3年、5年）。
- **响应式表格**: 图表下方同步展示详细的财务数据表格。
- **自定义主题**: 项目集成了 Material-UI 的主题系统，方便统一修改全局样式。

## 🛠️ 技术栈

- **框架**: [Next.js](https://nextjs.org/) 14+ (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **UI 库**: [Material-UI (MUI)](https://mui.com/)
- **图表库**: [Recharts](https://recharts.org/)
- **数据来源**: [FinMind API](https://finmindtrade.com/docs/api/v4)

---

## 🚀 快速开始

### 1. 安装依赖

在项目根目录下，执行以下命令安装所有必需的依赖包：
```bash
npm install
```

### 2. 启动开发服务器

执行以下命令来启动本地开发环境：
```bash
npm run dev
```

启动成功后，在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可看到应用页面。

---

## 📁 文件目录与功能实现

以下是项目核心文件的结构和功能说明：

```
.
├── app
│   ├── financial-data
│   │   └── page.tsx      # 主要页面：负责获取数据、处理并渲染图表/表格
│   ├── layout.tsx        # 根布局：应用全局主题和字体
│   └── globals.css       # 全局 CSS 样式
├── components
│   └── ThemeRegistry.tsx # MUI 主题注册器，用于服务端渲染兼容
├── src
│   └── theme
│       └── theme.ts      # 全局 MUI 主题配置文件（颜色、字体等）
└── package.json          # 项目依赖和脚本配置
```

- **`app/financial-data/page.tsx`**: 这是应用的核心页面，包含了所有业务逻辑，如：
  -  从 FinMind API 获取股票列表和月营收数据。
  -  对数据进行处理，计算年增率（YoY）。
  -  使用 `Autocomplete` 组件实现股票搜索。
  -  使用 `ComposedChart` (Recharts) 渲染图表。
  -  管理所有交互状态（如时间范围、图表显示切换）。

- **`src/theme/theme.ts`**: 在这里你可以自定义整个应用的视觉风格，包括主色、次色、字体、组件默认样式等。

---

## ☁️ 部署规划

### 推荐平台

本项目为 Next.js 应用，最简单、高效的部署方式是使用 **[Vercel](https://vercel.com/)** 平台（Next.js 的母公司）。

### 部署步骤

1.  **代码托管**: 将项目代码推送到一个 Git 仓库（如 GitHub, GitLab, Bitbucket）。
2.  **连接 Vercel**: 在 Vercel 上登录并选择 "Add New... > Project"，然后选择你刚创建的 Git 仓库。
3.  **自动部署**: Vercel 会自动识别出这是一个 Next.js 项目，并使用默认配置进行构建和部署。后续每次推送到主分支时，Vercel 都会自动触发新的部署。

### 环境变量

如果未来 API 需要使用密钥（API Key），建议在 Vercel 的项目设置中配置环境变量，而不是将密钥硬编码在代码中，以确保安全性。
