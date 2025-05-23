# 安全管理交互学习平台

一个基于 Cloudflare Pages 的企业安全管理交互式学习平台，提供视频学习、知识测试和数据统计功能。

## 🚀 项目特性

- **📱 PWA支持** - 支持离线使用和应用安装
- **🎥 视频学习** - 交互式安全培训视频
- **📝 知识测试** - 多种题型的安全知识测试
- **📊 数据统计** - 详细的学习进度和成绩分析
- **👨‍💼 管理后台** - 完整的内容和用户管理系统
- **🌐 响应式设计** - 支持桌面端和移动端
- **⚡ 高性能** - 基于 Cloudflare Pages 的全球CDN加速
- **🔒 安全可靠** - 企业级安全保障

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES2020+)
- **后端**: Cloudflare Pages Functions
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare KV
- **部署**: Cloudflare Pages
- **构建工具**: esbuild, PostCSS
- **测试**: Jest
- **代码质量**: ESLint, Prettier

## 📁 项目结构

```
safety-learning-platform/
├── public/                     # 静态资源目录
│   ├── assets/                 # 资源文件
│   │   ├── css/               # 样式文件
│   │   ├── js/                # JavaScript文件
│   │   ├── images/            # 图片资源
│   │   └── fonts/             # 字体文件
│   ├── index.html             # 主页面
│   ├── manifest.json          # PWA配置
│   └── sw.js                  # Service Worker
├── functions/                  # Cloudflare Pages Functions
│   └── api/                   # API路由
├── src/                       # 源代码
│   ├── components/            # 组件
│   ├── pages/                 # 页面
│   ├── utils/                 # 工具函数
│   └── styles/                # 样式源文件
├── scripts/                   # 构建和部署脚本
├── tests/                     # 测试文件
├── wrangler.toml              # Cloudflare配置
├── package.json               # 项目配置
└── README.md                  # 项目文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cloudflare账户

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-org/safety-learning-platform.git
cd safety-learning-platform

# 安装依赖
npm install
```

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 或者使用预览模式
npm run preview
```

访问 `http://localhost:8788` 查看应用。

### 构建项目

```bash
# 构建生产版本
npm run build

# 代码检查
npm run lint

# 运行测试
npm run test

# 格式化代码
npm run format
```

## 🌐 部署指南

### 通过GitHub连接Cloudflare Pages实现自动部署

#### 1. 准备GitHub仓库

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit"

# 创建main分支
git branch -M main

# 添加GitHub远程仓库
git remote add origin https://github.com/your-username/safety-learning-platform.git

# 推送到GitHub
git push -u origin main
```

#### 2. 连接Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Pages" 部分
3. 点击 "Create a project"
4. 选择 "Connect to Git"
5. 授权GitHub并选择您的仓库
6. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `public`
   - **Root directory**: `/` (留空)

#### 3. 配置环境变量

在Cloudflare Pages项目设置中添加以下环境变量：

```bash
ENVIRONMENT=production
API_BASE_URL=https://your-project-name.pages.dev
```

#### 4. 配置Cloudflare资源

```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 创建KV命名空间
wrangler kv:namespace create "SAFETY_KV"
wrangler kv:namespace create "SAFETY_KV" --preview

# 创建D1数据库
wrangler d1 create safety-learning-db
```

更新 `wrangler.toml` 中的资源ID：

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

配置完成后，每次推送到main分支都会自动触发部署。

### 使用GitHub Actions（可选）

项目包含GitHub Actions工作流配置，如需使用：

1. 在GitHub仓库设置中添加以下Secrets：
   - `CLOUDFLARE_API_TOKEN`: Cloudflare API令牌
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare账户ID

2. 推送代码时会自动触发构建和部署

## 📖 使用指南

### 用户功能

1. **视频学习**
   - 观看安全培训视频
   - 记录学习进度
   - 支持倍速播放和字幕

2. **知识测试**
   - 多选题、单选题、判断题
   - 实时评分和反馈
   - 错题回顾和解析

3. **学习统计**
   - 学习时长统计
   - 测试成绩分析
   - 进度跟踪图表

### 管理员功能

1. **内容管理**
   - 上传和管理视频
   - 创建和编辑测试题目
   - 设置学习路径

2. **用户管理**
   - 查看用户列表
   - 分析学习数据
   - 生成学习报告

3. **系统设置**
   - 配置系统参数
   - 管理权限设置
   - 数据备份和恢复

## 🔧 API 文档

### 统计数据 API

```javascript
// 获取用户统计
GET /api/stats?userId=123&range=7d

// 更新用户活动
POST /api/stats
{
  "userId": "123",
  "action": "video_completed",
  "data": { "videoId": "video1", "duration": 300 }
}
```

### 用户管理 API

```javascript
// 获取用户信息
GET /api/user?userId=123

// 更新用户信息
PUT /api/user
{
  "userId": "123",
  "name": "张三",
  "department": "技术部"
}
```

## 🧪 测试

```bash
# 运行所有测试
npm run test

# 监听模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行 Lighthouse 性能测试
npm run lighthouse
```

## 📊 性能优化

- **代码分割**: 使用动态导入减少初始加载时间
- **图片优化**: 自动压缩和格式转换
- **缓存策略**: 多层缓存提升访问速度
- **CDN加速**: Cloudflare 全球网络加速
- **Service Worker**: 离线缓存和后台同步

## 🔒 安全特性

- **HTTPS强制**: 全站HTTPS加密
- **CSP策略**: 内容安全策略防护
- **XSS防护**: 跨站脚本攻击防护
- **CSRF防护**: 跨站请求伪造防护
- **数据加密**: 敏感数据加密存储

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 更新日志

### v1.0.0 (2024-01-15)
- 🎉 初始版本发布
- ✨ 基础功能实现
- 📱 PWA支持
- 🚀 Cloudflare Pages部署

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 项目主页: https://safety-learning-platform.pages.dev
- 问题反馈: https://github.com/your-org/safety-learning-platform/issues
- 邮箱: support@your-domain.com

## 🙏 致谢

感谢以下开源项目的支持：

- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Chart.js](https://www.chartjs.org/)
- [Font Awesome](https://fontawesome.com/)
- [Jest](https://jestjs.io/)

---

**安全管理交互学习平台** - 让安全学习更简单、更有效！ 