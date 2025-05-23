/**
 * 安全管理交互页面 - 核心应用文件
 * 包含基本的页面交互和导航功能
 */

class SafetyApp {
    constructor() {
        this.currentPage = 'home';
        this.isLoading = false;
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        console.log('🛡️ 安全管理交互页面已启动');
        this.setupEventListeners();
        this.setupNavigation();
        this.displayWelcomeMessage();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 主要操作按钮
        const startLearningBtn = document.getElementById('start-learning');
        const takeQuizBtn = document.getElementById('take-quiz');

        if (startLearningBtn) {
            startLearningBtn.addEventListener('click', () => {
                this.handleStartLearning();
            });
        }

        if (takeQuizBtn) {
            takeQuizBtn.addEventListener('click', () => {
                this.handleTakeQuiz();
            });
        }

        // 功能卡片按钮
        this.setupFeatureButtons();
    }

    /**
     * 设置功能按钮
     */
    setupFeatureButtons() {
        // 视频学习按钮
        const videoButtons = document.querySelectorAll('a[href^="#video"]');
        videoButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const videoId = btn.getAttribute('href').substring(1);
                this.handleVideoNavigation(videoId);
            });
        });

        // 测试按钮
        const quizButtons = document.querySelectorAll('a[href^="#quiz"]');
        quizButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const quizId = btn.getAttribute('href').substring(1);
                this.handleQuizNavigation(quizId);
            });
        });
    }

    /**
     * 设置导航
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.navigateToSection(targetSection);
            });
        });
    }

    /**
     * 处理开始学习
     */
    handleStartLearning() {
        this.showNotification('🎓 准备开始安全学习之旅！', 'info');

        // 模拟跳转到第一个视频
        setTimeout(() => {
            this.handleVideoNavigation('video1');
        }, 1500);
    }

    /**
     * 处理立即测试
     */
    handleTakeQuiz() {
        this.showNotification('📝 即将进入安全知识测试', 'info');

        // 模拟跳转到第一个测试
        setTimeout(() => {
            this.handleQuizNavigation('quiz1');
        }, 1500);
    }

    /**
     * 处理视频导航
     * @param {string} videoId - 视频ID
     */
    handleVideoNavigation(videoId) {
        const videoTitles = {
            'video1': '正确安全操作视频',
            'video2': '违规操作对比视频'
        };

        this.showNotification(`🎬 即将播放：${videoTitles[videoId] || '安全教育视频'}`, 'success');

        // 这里后续会实现真正的页面跳转
        console.log(`导航到视频: ${videoId}`);
    }

    /**
     * 处理测试导航
     * @param {string} quizId - 测试ID
     */
    handleQuizNavigation(quizId) {
        const quizTitles = {
            'quiz1': '主动安全意识测试',
            'quiz2': '违规操作识别测试'
        };

        this.showNotification(`📋 即将开始：${quizTitles[quizId] || '安全知识测试'}`, 'success');

        // 这里后续会实现真正的页面跳转
        console.log(`导航到测试: ${quizId}`);
    }

    /**
     * 导航到指定区域
     * @param {string} section - 目标区域
     */
    navigateToSection(section) {
        // 更新导航状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const targetLink = document.querySelector(`a[href="#${section}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        this.currentPage = section;
        console.log(`导航到区域: ${section}`);
    }

    /**
     * 显示通知消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;

        // 添加到页面
        document.body.appendChild(notification);

        // 动画显示
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 设置关闭事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.closeNotification(notification);
        });

        // 自动关闭
        setTimeout(() => {
            this.closeNotification(notification);
        }, 4000);
    }

    /**
     * 获取通知颜色
     * @param {string} type - 通知类型
     * @returns {string} 颜色值
     */
    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#2563eb'
        };
        return colors[type] || colors.info;
    }

    /**
     * 关闭通知
     * @param {HTMLElement} notification - 通知元素
     */
    closeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * 显示欢迎消息
     */
    displayWelcomeMessage() {
        setTimeout(() => {
            this.showNotification('👋 欢迎使用安全管理学习平台！', 'success');
        }, 1000);
    }

    /**
     * 获取当前页面信息
     * @returns {Object} 页面信息
     */
    getCurrentPageInfo() {
        return {
            page: this.currentPage,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.safetyApp = new SafetyApp();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafetyApp;
} 