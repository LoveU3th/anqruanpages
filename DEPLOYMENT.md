# 部署指南

## 📋 部署准备

### 1. GitHub仓库设置

确保你的项目已经推送到GitHub仓库，并且拥有main分支。

### 2. Cloudflare账户准备

1. 注册Cloudflare账户：https://dash.cloudflare.com/sign-up
2. 进入Cloudflare Dashboard

## 🚀 部署步骤

### 第一步：创建Cloudflare Pages项目

1. 登录Cloudflare Dashboard
2. 进入 **Pages** 标签页
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权GitHub访问权限
6. 选择 `anquanpages` 仓库

### 第二步：配置构建设置

在项目配置页面：

- **Project name**: `anquanpages`
- **Production branch**: `main`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (保持默认)

### 第三步：配置环境变量（可选）

目前基础版本不需要环境变量，如果后续添加API功能再配置。

### 第四步：部署

1. 点击 **Save and Deploy**
2. 等待构建完成（通常需要2-5分钟）
3. 构建成功后会得到一个临时域名

### 第五步：配置自定义域名（可选）

1. 在项目设置中点击 **Custom domains**
2. 添加你的域名
3. 按照指示配置DNS记录

## 🔄 自动化部署

项目已配置GitHub Actions，每次推送代码到main分支时会自动部署：

1. 推送代码到GitHub
2. GitHub Actions自动触发
3. 构建项目
4. 部署到Cloudflare Pages

## 🛠️ 本地测试构建

在推送前可以本地测试构建：

```bash
npm run build
```

构建成功后会在`dist`目录生成可部署的文件。

## 📝 分支策略

- `main` 分支：生产环境，自动部署到主域名
- `develop` 分支：开发环境，自动部署到预览域名
- 其他分支：创建PR时会生成预览链接

## ⚠️ 注意事项

1. **构建时间**：首次部署可能需要5-10分钟
2. **缓存**：Cloudflare会缓存资源，更新可能需要等待几分钟
3. **域名**：免费版提供 `*.pages.dev` 域名
4. **限制**：免费版每月500次构建，对于个人项目足够使用

## 🔧 故障排除

### 构建失败
- 检查package.json中的build脚本
- 确保所有文件都已提交到Git
- 查看构建日志中的错误信息

### 页面无法访问
- 检查_redirects文件是否正确
- 确认dist目录包含index.html文件
- 等待DNS传播（新域名需要时间）

### 资源加载失败
- 检查文件路径是否正确（相对路径）
- 确认_headers文件配置正确
- 检查浏览器开发者工具的网络标签

## 📞 获取帮助

- [Cloudflare Pages文档](https://developers.cloudflare.com/pages/)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- 项目Issues：提交问题和建议

---

**提示**：部署成功后，你会得到一个类似 `https://anquanpages.pages.dev` 的网址，可以立即访问你的安全管理学习平台！ 