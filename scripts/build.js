#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 简单的构建脚本
 * 将src目录的内容复制到dist目录，并优化文件路径
 */

class Builder {
    constructor() {
        this.srcDir = path.join(__dirname, '..', 'src');
        this.distDir = path.join(__dirname, '..', 'dist');
    }

    /**
     * 开始构建过程
     */
    async build() {
        console.log('🔨 开始构建项目...');

        try {
            // 清理dist目录
            await this.cleanDist();

            // 创建dist目录
            await this.ensureDir(this.distDir);

            // 复制并处理文件
            await this.copyAssets();
            await this.processHTML();
            await this.createPWAFiles();
            await this.createCloudflareConfig();

            console.log('✅ 构建完成！');
            console.log(`📦 输出目录: ${this.distDir}`);

        } catch (error) {
            console.error('❌ 构建失败:', error.message);
            process.exit(1);
        }
    }

    /**
     * 清理dist目录
     */
    async cleanDist() {
        if (fs.existsSync(this.distDir)) {
            fs.rmSync(this.distDir, { recursive: true, force: true });
            console.log('🧹 清理了dist目录');
        }
    }

    /**
     * 确保目录存在
     */
    async ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    /**
     * 复制静态资源
     */
    async copyAssets() {
        const assetsDir = path.join(this.srcDir, 'assets');
        const distAssetsDir = path.join(this.distDir, 'assets');

        if (fs.existsSync(assetsDir)) {
            await this.copyDirectory(assetsDir, distAssetsDir);
            console.log('📄 复制了静态资源');
        }
    }

    /**
     * 处理HTML文件，修复路径引用
     */
    async processHTML() {
        const pagesDir = path.join(this.srcDir, 'pages');

        if (fs.existsSync(pagesDir)) {
            const files = fs.readdirSync(pagesDir);

            for (const file of files) {
                if (file.endsWith('.html')) {
                    const srcFile = path.join(pagesDir, file);
                    const distFile = path.join(this.distDir, file);

                    let content = fs.readFileSync(srcFile, 'utf-8');

                    // 修复资源路径
                    content = content.replace(/\.\.\/assets\//g, './assets/');
                    content = content.replace(/\.\.\/manifest\.json/g, './manifest.json');

                    fs.writeFileSync(distFile, content);
                }
            }
            console.log('🔧 处理了HTML文件路径');
        }
    }

    /**
     * 创建PWA配置文件
     */
    async createPWAFiles() {
        // 创建manifest.json
        const manifest = {
            name: "安全管理交互页面",
            short_name: "安全培训",
            description: "安全管理交互式学习和测试平台",
            start_url: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#2563eb",
            orientation: "portrait-primary",
            icons: [
                {
                    src: "/assets/images/icons/pwa/icon-192x192.png",
                    sizes: "192x192",
                    type: "image/png"
                },
                {
                    src: "/assets/images/icons/pwa/icon-512x512.png",
                    sizes: "512x512",
                    type: "image/png"
                }
            ],
            categories: ["education", "productivity"],
            lang: "zh-CN"
        };

        fs.writeFileSync(
            path.join(this.distDir, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );

        // 创建简单的Service Worker
        const swContent = `
// 安全管理应用 Service Worker
const CACHE_NAME = 'safety-app-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/js/core/app.js',
    '/manifest.json'
];

// 安装事件
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// 激活事件
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

// 请求拦截
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});
        `.trim();

        fs.writeFileSync(path.join(this.distDir, 'sw.js'), swContent);

        console.log('📱 创建了PWA配置文件');
    }

    /**
     * 创建Cloudflare特定配置文件
     */
    async createCloudflareConfig() {
        // 创建_headers文件
        const headers = `
# 安全头部
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

# 缓存配置
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/manifest.json
  Cache-Control: public, max-age=86400

/sw.js
  Cache-Control: public, max-age=0, must-revalidate
        `.trim();

        fs.writeFileSync(path.join(this.distDir, '_headers'), headers);

        // 创建_redirects文件
        const redirects = `
# SPA回退
/*    /index.html   200
        `.trim();

        fs.writeFileSync(path.join(this.distDir, '_redirects'), redirects);

        console.log('☁️ 创建了Cloudflare配置文件');
    }

    /**
     * 递归复制目录
     */
    async copyDirectory(src, dest) {
        await this.ensureDir(dest);

        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}

// 运行构建
if (require.main === module) {
    const builder = new Builder();
    builder.build();
}

module.exports = Builder; 