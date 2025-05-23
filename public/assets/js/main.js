/**
 * 安全管理交互页面 - 主JavaScript文件
 * 包含页面初始化、导航交互、数据管理等核心功能
 */

// 全局应用状态管理
window.SafetyApp = {
    // 应用配置
    config: {
        apiBaseUrl: '/api',
        storagePrefix: 'safety_app_',
        version: '1.0.0',
        debug: false
    },

    // 应用状态
    state: {
        isInitialized: false,
        currentUser: null,
        userStats: {
            videosWatched: 0,
            quizzesCompleted: 0,
            totalScore: 0,
            lastActivity: null
        },
        notifications: [],
        isOnline: navigator.onLine
    },

    // 缓存管理
    cache: new Map(),

    // 事件监听器
    listeners: new Map()
};

/**
 * 应用初始化类
 */
class AppInitializer {
    constructor() {
        this.initPromise = null;
    }

    /**
     * 初始化应用
     */
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._performInit();
        return this.initPromise;
    }

    /**
     * 执行初始化流程
     */
    async _performInit() {
        try {
            console.log('🚀 开始初始化安全管理应用...');

            // 1. 检查浏览器兼容性
            this._checkBrowserCompatibility();

            // 2. 初始化服务工作者（PWA支持）
            await this._initServiceWorker();

            // 3. 加载用户数据
            await this._loadUserData();

            // 4. 初始化UI组件
            this._initUIComponents();

            // 5. 绑定事件监听器
            this._bindEventListeners();

            // 6. 初始化路由系统
            this._initRouter();

            // 7. 加载统计数据
            await this._loadStatistics();

            // 8. 隐藏加载界面
            this._hideLoadingScreen();

            SafetyApp.state.isInitialized = true;
            console.log('✅ 应用初始化完成');

            // 触发初始化完成事件
            this._dispatchEvent('app:initialized');

        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this._showErrorMessage('应用初始化失败，请刷新页面重试');
        }
    }

    /**
     * 检查浏览器兼容性
     */
    _checkBrowserCompatibility() {
        const requiredFeatures = [
            'fetch',
            'Promise',
            'localStorage',
            'sessionStorage',
            'addEventListener'
        ];

        const missingFeatures = requiredFeatures.filter(feature =>
            !(feature in window) && !(feature in window.prototype)
        );

        if (missingFeatures.length > 0) {
            throw new Error(`浏览器不支持以下功能: ${missingFeatures.join(', ')}`);
        }
    }

    /**
     * 初始化Service Worker
     */
    async _initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker 注册成功:', registration);
            } catch (error) {
                console.warn('Service Worker 注册失败:', error);
            }
        }
    }

    /**
     * 加载用户数据
     */
    async _loadUserData() {
        try {
            const userData = this._getStorageItem('user_data');
            if (userData) {
                SafetyApp.state.currentUser = userData;
            }

            const userStats = this._getStorageItem('user_stats');
            if (userStats) {
                SafetyApp.state.userStats = { ...SafetyApp.state.userStats, ...userStats };
            }
        } catch (error) {
            console.warn('加载用户数据失败:', error);
        }
    }

    /**
     * 初始化UI组件
     */
    _initUIComponents() {
        // 初始化导航组件
        this._initNavigation();

        // 初始化下拉菜单
        this._initDropdowns();

        // 初始化工具提示
        this._initTooltips();

        // 初始化模态框
        this._initModals();
    }

    /**
     * 初始化导航组件
     */
    _initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // 点击导航链接时关闭移动端菜单
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }
    }

    /**
     * 初始化下拉菜单
     */
    _initDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');

        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');

            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // 关闭其他下拉菜单
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            other.classList.remove('active');
                        }
                    });

                    // 切换当前下拉菜单
                    dropdown.classList.toggle('active');
                });
            }
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', () => {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        });
    }

    /**
     * 初始化工具提示
     */
    _initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', this._showTooltip.bind(this));
            element.addEventListener('mouseleave', this._hideTooltip.bind(this));
        });
    }

    /**
     * 初始化模态框
     */
    _initModals() {
        const modalTriggers = document.querySelectorAll('[data-modal]');

        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                this._openModal(modalId);
            });
        });
    }

    /**
     * 绑定事件监听器
     */
    _bindEventListeners() {
        // 网络状态监听
        window.addEventListener('online', () => {
            SafetyApp.state.isOnline = true;
            this._dispatchEvent('network:online');
        });

        window.addEventListener('offline', () => {
            SafetyApp.state.isOnline = false;
            this._dispatchEvent('network:offline');
        });

        // 页面可见性监听
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this._dispatchEvent('page:visible');
            } else {
                this._dispatchEvent('page:hidden');
            }
        });

        // 窗口大小变化监听
        window.addEventListener('resize', this._debounce(() => {
            this._dispatchEvent('window:resize');
        }, 250));

        // 键盘快捷键监听
        document.addEventListener('keydown', this._handleKeyboardShortcuts.bind(this));
    }

    /**
     * 初始化路由系统
     */
    _initRouter() {
        if (window.Router) {
            window.router = new Router();
            window.router.init();
        }
    }

    /**
     * 加载统计数据
     */
    async _loadStatistics() {
        try {
            const stats = await this._fetchUserStats();
            this._updateStatsDisplay(stats);
        } catch (error) {
            console.warn('加载统计数据失败:', error);
        }
    }

    /**
     * 隐藏加载界面
     */
    _hideLoadingScreen() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }

    /**
     * 显示工具提示
     */
    _showTooltip(event) {
        const element = event.target;
        const text = element.getAttribute('data-tooltip');

        if (!text) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '9999';
        tooltip.style.background = '#333';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.pointerEvents = 'none';

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

        element._tooltip = tooltip;
    }

    /**
     * 隐藏工具提示
     */
    _hideTooltip(event) {
        const element = event.target;
        if (element._tooltip) {
            element._tooltip.remove();
            delete element._tooltip;
        }
    }

    /**
     * 打开模态框
     */
    _openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // 绑定关闭事件
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this._closeModal(modalId));
            }

            // 点击背景关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this._closeModal(modalId);
                }
            });
        }
    }

    /**
     * 关闭模态框
     */
    _closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * 处理键盘快捷键
     */
    _handleKeyboardShortcuts(event) {
        // Esc键关闭模态框
        if (event.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal-container[style*="flex"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = '';
        }

        // Ctrl+/ 显示快捷键帮助
        if (event.ctrlKey && event.key === '/') {
            event.preventDefault();
            this._showShortcutHelp();
        }
    }

    /**
     * 获取用户统计数据
     */
    async _fetchUserStats() {
        try {
            const response = await fetch(`${SafetyApp.config.apiBaseUrl}/user/stats`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('获取统计数据失败:', error);
        }

        // 返回默认统计数据
        return SafetyApp.state.userStats;
    }

    /**
     * 更新统计数据显示
     */
    _updateStatsDisplay(stats) {
        const statsElements = {
            videosWatched: document.querySelector('[data-stat="videos-watched"]'),
            quizzesCompleted: document.querySelector('[data-stat="quizzes-completed"]'),
            totalScore: document.querySelector('[data-stat="total-score"]')
        };

        Object.entries(statsElements).forEach(([key, element]) => {
            if (element && stats[key] !== undefined) {
                element.textContent = stats[key];
            }
        });

        // 更新应用状态
        SafetyApp.state.userStats = { ...SafetyApp.state.userStats, ...stats };
        this._setStorageItem('user_stats', SafetyApp.state.userStats);
    }

    /**
     * 显示错误消息
     */
    _showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
    `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    /**
     * 显示快捷键帮助
     */
    _showShortcutHelp() {
        const shortcuts = [
            { key: 'Esc', description: '关闭模态框' },
            { key: 'Ctrl + /', description: '显示快捷键帮助' },
            { key: 'Alt + H', description: '返回首页' },
            { key: 'Alt + V', description: '视频学习' },
            { key: 'Alt + Q', description: '知识测试' }
        ];

        const helpContent = shortcuts.map(shortcut =>
            `<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: 600;">${shortcut.key}</span>
        <span>${shortcut.description}</span>
      </div>`
        ).join('');

        const helpModal = document.createElement('div');
        helpModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

        helpModal.innerHTML = `
      <div style="background: white; padding: 24px; border-radius: 12px; max-width: 400px; width: 90%;">
        <h3 style="margin: 0 0 16px 0; color: #1f2937;">键盘快捷键</h3>
        ${helpContent}
        <button style="margin-top: 16px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">关闭</button>
      </div>
    `;

        const closeBtn = helpModal.querySelector('button');
        closeBtn.addEventListener('click', () => helpModal.remove());
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.remove();
        });

        document.body.appendChild(helpModal);
    }

    /**
     * 分发自定义事件
     */
    _dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * 防抖函数
     */
    _debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 获取本地存储项
     */
    _getStorageItem(key) {
        try {
            const item = localStorage.getItem(SafetyApp.config.storagePrefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.warn('读取存储失败:', error);
            return null;
        }
    }

    /**
     * 设置本地存储项
     */
    _setStorageItem(key, value) {
        try {
            localStorage.setItem(SafetyApp.config.storagePrefix + key, JSON.stringify(value));
        } catch (error) {
            console.warn('写入存储失败:', error);
        }
    }
}

/**
 * 通知系统类
 */
class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    /**
     * 显示通知
     */
    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
      background: ${this._getTypeColor(type)};
      color: white;
      padding: 16px 20px;
      margin-bottom: 12px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      cursor: pointer;
    `;

        notification.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span>${message}</span>
        <button style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 12px;">&times;</button>
      </div>
    `;

        const closeBtn = notification.querySelector('button');
        closeBtn.addEventListener('click', () => this.remove(notification));

        this.container.appendChild(notification);

        // 触发动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        this.notifications.push(notification);
        return notification;
    }

    /**
     * 移除通知
     */
    remove(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    /**
     * 获取类型颜色
     */
    _getTypeColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4'
        };
        return colors[type] || colors.info;
    }

    /**
     * 清除所有通知
     */
    clear() {
        this.notifications.forEach(notification => this.remove(notification));
    }
}

/**
 * 数据管理类
 */
class DataManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
    }

    /**
     * 获取数据
     */
    async get(endpoint, useCache = true) {
        const cacheKey = endpoint;

        // 检查缓存
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${SafetyApp.config.apiBaseUrl}${endpoint}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // 缓存数据
            if (useCache) {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }

            return data;
        } catch (error) {
            console.error('数据获取失败:', error);
            throw error;
        }
    }

    /**
     * 发送数据
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${SafetyApp.config.apiBaseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('数据发送失败:', error);
            throw error;
        }
    }

    /**
     * 清除缓存
     */
    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }
}

// 创建全局实例
window.SafetyApp.initializer = new AppInitializer();
window.SafetyApp.notifications = new NotificationSystem();
window.SafetyApp.dataManager = new DataManager();

// 工具函数
window.SafetyApp.utils = {
    /**
     * 格式化日期
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    },

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * 深拷贝对象
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * 节流函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// DOM加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SafetyApp.initializer.init();
    });
} else {
    SafetyApp.initializer.init();
} 