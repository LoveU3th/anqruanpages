# 🚀 快速启动指南

欢迎使用安全管理交互学习平台！本指南将帮助您在几分钟内启动并运行项目。

## 📋 前置要求

在开始之前，请确保您的系统已安装：

- **Node.js** >= 18.0.0 ([下载地址](https://nodejs.org/))
- **npm** >= 8.0.0 (随 Node.js 一起安装)
- **Git** ([下载地址](https://git-scm.com/))
- **Cloudflare 账户** ([注册地址](https://dash.cloudflare.com/sign-up))

## 🛠️ 快速安装

### 1. 克隆项目

```bash
git clone <your-repository-url>
cd safety-learning-platform
```

### 2. 安装依赖

```bash
npm install
```

### 3. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 4. 登录 Cloudflare

```bash
wrangler login
```

## ⚡ 本地开发

### 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:8788` 启动。

### 可用的开发命令

```bash
# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 运行测试
npm run test

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 🌐 部署到 Cloudflare Pages

### 通过GitHub连接实现自动部署

#### 1. 准备GitHub仓库

```bash
# 如果还没有Git仓库，先初始化
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit"

# 设置主分支
git branch -M main

# 添加GitHub远程仓库（替换为您的仓库地址）
git remote add origin https://github.com/your-username/safety-learning-platform.git

# 推送到GitHub
git push -u origin main
```

#### 2. 连接Cloudflare Pages

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Pages" 部分
3. 点击 "Create a project"
4. 选择 "Connect to Git"
5. 授权GitHub并选择您的仓库
6. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `public`
   - **Root directory**: `/` (留空)

#### 3. 配置Cloudflare资源

```bash
# 安装Wrangler CLI（如果还没有）
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 创建KV命名空间
wrangler kv:namespace create "SAFETY_KV"
wrangler kv:namespace create "SAFETY_KV" --preview

# 创建D1数据库
wrangler d1 create safety-learning-db
```

#### 4. 更新配置文件

将创建的资源ID更新到 `wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "SAFETY_KV"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

[[d1_databases]]
binding = "SAFETY_DB"
database_name = "safety-learning-db"
database_id = "your-database-id"
```

#### 5. 运行数据库迁移

```bash
# 运行数据库迁移
wrangler d1 execute safety-learning-db --file=./scripts/migrate.sql

# 填充示例数据
wrangler d1 execute safety-learning-db --file=./scripts/seed.sql
```

#### 6. 自动部署

配置完成后，每次推送到main分支都会自动触发部署！

### 使用准备脚本

您也可以使用我们提供的准备脚本：

```bash
npm run prepare-deploy
```

这个脚本会：
- 检查环境
- 构建项目
- 生成GitHub Actions工作流
- 创建部署指南

## 🔧 配置说明

### 环境变量

在 Cloudflare Pages 控制台中设置以下环境变量：

```
ENVIRONMENT=production
API_BASE_URL=https://your-domain.pages.dev
```

### 数据库配置

项目使用 Cloudflare D1 (SQLite) 数据库。数据库结构在 `scripts/migrate.sql` 中定义。

### KV 存储配置

项目使用 Cloudflare KV 存储用户会话和缓存数据。

## 👥 默认账户

系统预设了一个管理员账户：

- **用户名**: `admin`
- **邮箱**: `admin@safety-learning.com`
- **密码**: `admin123`

⚠️ **重要**: 部署到生产环境前，请务必修改默认密码！

## 📁 项目结构

```
safety-learning-platform/
├── public/                 # 静态文件
│   ├── index.html         # 主页面
│   ├── manifest.json      # PWA 配置
│   ├── sw.js             # Service Worker
│   └── assets/           # 资源文件
│       ├── css/          # 样式文件
│       ├── js/           # JavaScript 文件
│       └── images/       # 图片文件
├── functions/             # Cloudflare Functions
│   └── api/              # API 端点
├── scripts/              # 脚本文件
│   ├── deploy.js         # 部署脚本
│   ├── migrate.sql       # 数据库迁移
│   └── seed.sql          # 示例数据
├── package.json          # 项目配置
├── wrangler.toml         # Cloudflare 配置
└── README.md             # 详细文档
```

## 🎯 功能特性

- ✅ **视频学习**: 支持视频播放和进度跟踪
- ✅ **知识测试**: 多种题型的在线测试
- ✅ **学习统计**: 详细的学习数据分析
- ✅ **管理后台**: 内容和用户管理
- ✅ **PWA 支持**: 离线访问和推送通知
- ✅ **响应式设计**: 支持各种设备
- ✅ **高性能**: 基于 Cloudflare 边缘计算

## 🔍 常见问题

### Q: 本地开发时无法访问数据库？
A: 确保已创建本地 D1 数据库并运行了迁移脚本。

### Q: 部署后页面显示错误？
A: 检查环境变量是否正确设置，KV 和 D1 资源 ID 是否匹配。

### Q: 如何添加新的学习内容？
A: 登录管理后台，在内容管理中添加新的视频或文档。

### Q: 如何自定义主题？
A: 修改 `public/assets/css/main.css` 中的 CSS 变量。

## 📞 获取帮助

- 📖 [完整文档](./README.md)
- 🐛 [问题反馈](https://github.com/your-repo/issues)
- 💬 [讨论区](https://github.com/your-repo/discussions)
- 📧 [邮件支持](mailto:support@safety-learning.com)

## 🎉 下一步

1. 浏览示例内容和测试
2. 自定义品牌和主题
3. 添加您的学习内容
4. 配置用户权限
5. 设置通知和提醒

祝您使用愉快！🎊 