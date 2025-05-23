// Service Worker for 安全管理交互学习平台
// Version: 1.0.0

const CACHE_NAME = 'safety-app-v1.0.0';
const STATIC_CACHE = 'safety-static-v1.0.0';
const DYNAMIC_CACHE = 'safety-dynamic-v1.0.0';
const API_CACHE = 'safety-api-v1.0.0';

// 静态资源缓存列表
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/main.css',
    '/assets/js/main.js',
    '/assets/js/router.js',
    '/assets/images/icons/icon-192x192.png',
    '/assets/images/icons/icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 动态缓存的URL模式
const DYNAMIC_CACHE_PATTERNS = [
    /^https:\/\/fonts\.googleapis\.com/,
    /^https:\/\/fonts\.gstatic\.com/,
    /^https:\/\/cdnjs\.cloudflare\.com/
];

// API缓存的URL模式
const API_CACHE_PATTERNS = [
    /^\/api\/stats/,
    /^\/api\/user/,
    /^\/api\/videos/
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        Promise.all([
            // 缓存静态资源
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[SW] Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            // 跳过等待，立即激活
            self.skipWaiting()
        ])
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        Promise.all([
            // 清理旧缓存
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE &&
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== API_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // 立即控制所有客户端
            self.clients.claim()
        ])
    );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // 跳过非GET请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过Chrome扩展请求
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    event.respondWith(handleFetch(request));
});

// 处理网络请求的核心逻辑
async function handleFetch(request) {
    const url = new URL(request.url);

    try {
        // 1. 静态资源 - 缓存优先策略
        if (isStaticAsset(request)) {
            return await cacheFirst(request, STATIC_CACHE);
        }

        // 2. API请求 - 网络优先策略
        if (isApiRequest(request)) {
            return await networkFirst(request, API_CACHE);
        }

        // 3. 动态资源 - 网络优先策略
        if (isDynamicAsset(request)) {
            return await networkFirst(request, DYNAMIC_CACHE);
        }

        // 4. 其他请求 - 网络优先策略
        return await networkFirst(request, DYNAMIC_CACHE);

    } catch (error) {
        console.error('[SW] Fetch error:', error);

        // 返回离线页面或默认响应
        if (request.destination === 'document') {
            const cache = await caches.open(STATIC_CACHE);
            return await cache.match('/') || new Response('离线模式', {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }

        return new Response('网络错误', { status: 503 });
    }
}

// 缓存优先策略
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        // 后台更新缓存
        updateCache(request, cacheName);
        return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
    }

    return networkResponse;
}

// 网络优先策略
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // 缓存成功的响应
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // 网络失败，尝试从缓存获取
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        throw error;
    }
}

// 后台更新缓存
async function updateCache(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            await cache.put(request, networkResponse);
        }
    } catch (error) {
        console.log('[SW] Background cache update failed:', error);
    }
}

// 判断是否为静态资源
function isStaticAsset(request) {
    const url = new URL(request.url);
    return STATIC_ASSETS.some(asset => url.pathname === asset) ||
        url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/);
}

// 判断是否为API请求
function isApiRequest(request) {
    const url = new URL(request.url);
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// 判断是否为动态资源
function isDynamicAsset(request) {
    const url = request.url;
    return DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// 推送通知事件
self.addEventListener('push', event => {
    console.log('[SW] Push received:', event);

    const options = {
        body: '您有新的学习任务待完成',
        icon: '/assets/images/icons/icon-192x192.png',
        badge: '/assets/images/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: '立即查看',
                icon: '/assets/images/icons/open-action.png'
            },
            {
                action: 'dismiss',
                title: '稍后提醒',
                icon: '/assets/images/icons/dismiss-action.png'
            }
        ],
        requireInteraction: true,
        silent: false
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            options.body = payload.body || options.body;
            options.data = { ...options.data, ...payload.data };
        } catch (error) {
            console.error('[SW] Push data parse error:', error);
        }
    }

    event.waitUntil(
        self.registration.showNotification('安全学习提醒', options)
    );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked:', event);

    event.notification.close();

    const action = event.action;
    const data = event.notification.data || {};

    if (action === 'dismiss') {
        // 稍后提醒逻辑
        return;
    }

    // 打开应用
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // 查找已打开的窗口
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin)) {
                        return client.focus();
                    }
                }

                // 打开新窗口
                return clients.openWindow(data.url || '/');
            })
    );
});

// 后台同步事件
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-user-progress') {
        event.waitUntil(syncUserProgress());
    } else if (event.tag === 'sync-quiz-results') {
        event.waitUntil(syncQuizResults());
    }
});

// 同步用户进度
async function syncUserProgress() {
    try {
        // 从IndexedDB获取待同步的数据
        const progressData = await getStoredProgressData();

        if (progressData.length > 0) {
            const response = await fetch('/api/sync/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(progressData)
            });

            if (response.ok) {
                // 清除已同步的数据
                await clearStoredProgressData();
                console.log('[SW] User progress synced successfully');
            }
        }
    } catch (error) {
        console.error('[SW] Progress sync failed:', error);
    }
}

// 同步测试结果
async function syncQuizResults() {
    try {
        const quizData = await getStoredQuizData();

        if (quizData.length > 0) {
            const response = await fetch('/api/sync/quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quizData)
            });

            if (response.ok) {
                await clearStoredQuizData();
                console.log('[SW] Quiz results synced successfully');
            }
        }
    } catch (error) {
        console.error('[SW] Quiz sync failed:', error);
    }
}

// IndexedDB操作辅助函数
async function getStoredProgressData() {
    // 实际实现中需要连接IndexedDB
    return [];
}

async function clearStoredProgressData() {
    // 实际实现中需要清除IndexedDB数据
}

async function getStoredQuizData() {
    // 实际实现中需要连接IndexedDB
    return [];
}

async function clearStoredQuizData() {
    // 实际实现中需要清除IndexedDB数据
}

// 消息事件处理
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);

    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;

        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;

        case 'CACHE_URLS':
            cacheUrls(payload.urls).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
    }
});

// 清除所有缓存
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
}

// 缓存指定URL
async function cacheUrls(urls) {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(urls);
} 