/**
 * 视频播放器组件
 * 支持自定义控制、全屏播放、移动设备优化
 */
class VideoPlayer {
    constructor(options = {}) {
        this.options = {
            videoId: options.videoId || 'main-video',
            videoType: options.videoType || 'safety_training',
            videoTitle: options.videoTitle || '安全教育视频',
            nextVideoUrl: options.nextVideoUrl || null,
            quizUrl: options.quizUrl || null,
            isWarningVideo: options.isWarningVideo || false,
            autoplay: options.autoplay || false,
            showCustomControls: options.showCustomControls !== false,
            ...options
        };

        this.video = null;
        this.container = null;
        this.overlay = null;
        this.isPlaying = false;
        this.isDragging = false;
        this.isFullscreen = false;
        this.hideControlsTimeout = null;
        this.watchStartTime = null;
        this.totalWatchTime = 0;

        this.init();
    }

    /**
     * 初始化视频播放器
     */
    init() {
        this.video = document.getElementById(this.options.videoId);
        this.container = document.getElementById('video-container');
        this.overlay = document.getElementById('video-overlay');

        if (!this.video || !this.container) {
            console.error('视频播放器初始化失败：找不到必要的DOM元素');
            return;
        }

        this.setupEventListeners();
        this.setupCustomControls();
        this.setupKeyboardControls();
        this.setupMobileOptimizations();
        this.loadVideoData();

        console.log('✅ 视频播放器初始化成功');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 视频事件
        this.video.addEventListener('loadstart', () => this.showLoading());
        this.video.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('play', () => this.onPlay());
        this.video.addEventListener('pause', () => this.onPause());
        this.video.addEventListener('ended', () => this.onVideoEnded());
        this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.video.addEventListener('progress', () => this.onProgress());
        this.video.addEventListener('error', (e) => this.onError(e));

        // 容器事件
        this.container.addEventListener('mouseenter', () => this.showControls());
        this.container.addEventListener('mouseleave', () => this.hideControlsDelayed());
        this.container.addEventListener('mousemove', () => this.showControls());
        this.container.addEventListener('click', (e) => this.onContainerClick(e));

        // 全屏事件
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.onFullscreenChange());

        // 窗口事件
        window.addEventListener('beforeunload', () => this.saveWatchProgress());
        window.addEventListener('visibilitychange', () => this.onVisibilityChange());
    }

    /**
     * 设置自定义控制按钮
     */
    setupCustomControls() {
        if (!this.options.showCustomControls) return;

        // 中央播放/暂停按钮
        const centerPlayBtn = document.getElementById('play-pause-btn');
        if (centerPlayBtn) {
            centerPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay();
            });
        }

        // 底部播放/暂停按钮
        const bottomPlayBtn = document.getElementById('play-pause-small');
        if (bottomPlayBtn) {
            bottomPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay();
            });
        }

        // 音量控制
        this.setupVolumeControls();

        // 进度条控制
        this.setupProgressControls();

        // 全屏按钮
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFullscreen();
            });
        }

        // 视频结束后的操作按钮
        this.setupEndedControls();
    }

    /**
     * 设置音量控制
     */
    setupVolumeControls() {
        const volumeBtn = document.getElementById('volume-btn');
        const volumeSlider = document.getElementById('volume-slider');

        if (volumeBtn) {
            volumeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMute();
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                e.stopPropagation();
                this.setVolume(parseFloat(e.target.value));
            });
        }
    }

    /**
     * 设置进度条控制
     */
    setupProgressControls() {
        const progressBar = document.getElementById('progress-bar');
        const progressContainer = document.querySelector('.progress-container');

        if (progressBar) {
            progressBar.addEventListener('input', (e) => {
                e.stopPropagation();
                this.isDragging = true;
                this.seekTo(parseFloat(e.target.value));
            });

            progressBar.addEventListener('change', () => {
                this.isDragging = false;
            });
        }

        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                const rect = progressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                this.seekTo(pos * 100);
            });
        }
    }

    /**
     * 设置视频结束后的控制按钮
     */
    setupEndedControls() {
        const replayBtn = document.getElementById('replay-video');
        const quizBtn = document.getElementById('go-to-quiz');
        const nextBtn = document.getElementById('next-video') || document.getElementById('back-to-safe');

        if (replayBtn) {
            replayBtn.addEventListener('click', () => this.replayVideo());
        }

        if (quizBtn && this.options.quizUrl) {
            quizBtn.addEventListener('click', () => {
                window.location.href = this.options.quizUrl;
            });
        }

        if (nextBtn && this.options.nextVideoUrl) {
            nextBtn.addEventListener('click', () => {
                window.location.href = this.options.nextVideoUrl;
            });
        }
    }

    /**
     * 设置键盘控制
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // 只在视频容器获得焦点时响应
            if (!this.container.contains(document.activeElement)) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.skip(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.skip(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.adjustVolume(0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.adjustVolume(-0.1);
                    break;
                case 'KeyF':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
            }
        });
    }

    /**
     * 移动设备优化
     */
    setupMobileOptimizations() {
        if (this.isMobile()) {
            // 移动设备上默认隐藏自定义控制
            this.overlay.style.opacity = '0';

            // 添加触摸事件
            this.container.addEventListener('touchstart', () => this.showControls());
            this.container.addEventListener('touchend', () => this.hideControlsDelayed(3000));

            // 设置移动设备友好的播放属性
            this.video.setAttribute('playsinline', 'true');
            this.video.setAttribute('webkit-playsinline', 'true');
        }
    }

    /**
     * 加载视频数据
     */
    async loadVideoData() {
        try {
            // 这里可以从API获取视频信息
            // const videoData = await this.fetchVideoData();

            // 暂时使用静态配置
            this.updateVideoTimer();
        } catch (error) {
            console.error('加载视频数据失败:', error);
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        const loading = document.getElementById('video-loading');
        if (loading) {
            loading.style.display = 'flex';
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loading = document.getElementById('video-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    /**
     * 元数据加载完成
     */
    onMetadataLoaded() {
        this.updateDuration();
        this.updateVideoTimer();
        console.log('📹 视频元数据加载完成');
    }

    /**
     * 视频开始播放
     */
    onPlay() {
        this.isPlaying = true;
        this.watchStartTime = Date.now();
        this.updatePlayButtons(true);
        this.hideControlsDelayed();

        // 记录播放事件
        this.recordEvent('video_play', {
            currentTime: this.video.currentTime,
            duration: this.video.duration
        });
    }

    /**
     * 视频暂停
     */
    onPause() {
        this.isPlaying = false;
        this.updateWatchTime();
        this.updatePlayButtons(false);
        this.showControls();

        // 记录暂停事件
        this.recordEvent('video_pause', {
            currentTime: this.video.currentTime,
            watchTime: this.totalWatchTime
        });
    }

    /**
     * 视频播放结束
     */
    onVideoEnded() {
        this.isPlaying = false;
        this.updateWatchTime();
        this.showVideoEndedScreen();

        // 记录完成事件
        this.recordEvent('video_completed', {
            duration: this.video.duration,
            totalWatchTime: this.totalWatchTime,
            completionRate: (this.totalWatchTime / this.video.duration) * 100
        });

        console.log('🎬 视频播放完成');
    }

    /**
     * 时间更新
     */
    onTimeUpdate() {
        if (!this.isDragging) {
            this.updateProgress();
            this.updateCurrentTime();
            this.updateVideoTimer();
        }
    }

    /**
     * 缓冲进度更新
     */
    onProgress() {
        // 可以在这里更新缓冲进度显示
    }

    /**
     * 视频错误处理
     */
    onError(error) {
        console.error('视频播放错误:', error);
        this.hideLoading();

        // 显示错误信息
        this.showErrorMessage('视频加载失败，请刷新页面重试');
    }

    /**
     * 容器点击事件
     */
    onContainerClick(e) {
        // 如果点击的是控制元素，不执行播放/暂停
        if (e.target.closest('.video-overlay') || e.target.closest('.control-btn')) {
            return;
        }

        this.togglePlay();
    }

    /**
     * 全屏状态改变
     */
    onFullscreenChange() {
        this.isFullscreen = !!document.fullscreenElement ||
            !!document.webkitFullscreenElement ||
            !!document.mozFullScreenElement ||
            !!document.msFullscreenElement;

        this.updateFullscreenButton();
    }

    /**
     * 页面可见性改变
     */
    onVisibilityChange() {
        if (document.hidden && this.isPlaying) {
            this.video.pause();
        }
    }

    /**
     * 切换播放/暂停
     */
    togglePlay() {
        if (this.video.paused) {
            this.video.play().catch(error => {
                console.error('播放失败:', error);
                this.showErrorMessage('播放失败，请检查网络连接');
            });
        } else {
            this.video.pause();
        }
    }

    /**
     * 切换静音
     */
    toggleMute() {
        this.video.muted = !this.video.muted;
        this.updateVolumeButton();
    }

    /**
     * 设置音量
     */
    setVolume(volume) {
        this.video.volume = Math.max(0, Math.min(1, volume));
        this.video.muted = volume === 0;
        this.updateVolumeButton();
    }

    /**
     * 调整音量
     */
    adjustVolume(delta) {
        this.setVolume(this.video.volume + delta);
    }

    /**
     * 跳转到指定位置
     */
    seekTo(percent) {
        const time = (percent / 100) * this.video.duration;
        if (isFinite(time)) {
            this.video.currentTime = time;
        }
    }

    /**
     * 快进/快退
     */
    skip(seconds) {
        this.video.currentTime = Math.max(0,
            Math.min(this.video.duration, this.video.currentTime + seconds));
    }

    /**
     * 切换全屏
     */
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    /**
     * 进入全屏
     */
    enterFullscreen() {
        const element = this.container;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    /**
     * 退出全屏
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    /**
     * 重播视频
     */
    replayVideo() {
        this.video.currentTime = 0;
        this.hideVideoEndedScreen();
        this.video.play();
    }

    /**
     * 显示控制栏
     */
    showControls() {
        if (this.overlay) {
            this.overlay.classList.add('show');
            clearTimeout(this.hideControlsTimeout);
        }
    }

    /**
     * 延迟隐藏控制栏
     */
    hideControlsDelayed(delay = 3000) {
        clearTimeout(this.hideControlsTimeout);
        this.hideControlsTimeout = setTimeout(() => {
            if (this.isPlaying && this.overlay) {
                this.overlay.classList.remove('show');
            }
        }, delay);
    }

    /**
     * 更新播放按钮状态
     */
    updatePlayButtons(isPlaying) {
        const playIcons = document.querySelectorAll('.play-icon');
        const pauseIcons = document.querySelectorAll('.pause-icon');

        playIcons.forEach(icon => {
            icon.style.display = isPlaying ? 'none' : 'block';
        });

        pauseIcons.forEach(icon => {
            icon.style.display = isPlaying ? 'block' : 'none';
        });
    }

    /**
     * 更新音量按钮
     */
    updateVolumeButton() {
        const volumeBtn = document.getElementById('volume-btn');
        const volumeSlider = document.getElementById('volume-slider');

        if (volumeBtn) {
            if (this.video.muted || this.video.volume === 0) {
                volumeBtn.textContent = '🔇';
            } else if (this.video.volume < 0.5) {
                volumeBtn.textContent = '🔉';
            } else {
                volumeBtn.textContent = '🔊';
            }
        }

        if (volumeSlider) {
            volumeSlider.value = this.video.muted ? 0 : this.video.volume;
        }
    }

    /**
     * 更新全屏按钮
     */
    updateFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.textContent = this.isFullscreen ? '⛶' : '⛶';
        }
    }

    /**
     * 更新进度条
     */
    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressFill = document.getElementById('progress-fill');

        if (progressBar && this.video.duration) {
            const percent = (this.video.currentTime / this.video.duration) * 100;
            progressBar.value = percent;

            if (progressFill) {
                progressFill.style.width = percent + '%';
            }
        }
    }

    /**
     * 更新当前时间显示
     */
    updateCurrentTime() {
        const currentTimeEl = document.getElementById('current-time');
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(this.video.currentTime);
        }
    }

    /**
     * 更新总时长显示
     */
    updateDuration() {
        const durationEl = document.getElementById('duration');
        if (durationEl && this.video.duration) {
            durationEl.textContent = this.formatTime(this.video.duration);
        }
    }

    /**
     * 更新视频计时器
     */
    updateVideoTimer() {
        const timerEl = document.getElementById('video-timer');
        if (timerEl && this.video.duration) {
            const current = this.formatTime(this.video.currentTime);
            const total = this.formatTime(this.video.duration);
            timerEl.textContent = `${current} / ${total}`;
        }
    }

    /**
     * 显示视频结束界面
     */
    showVideoEndedScreen() {
        const endedScreen = document.getElementById('video-ended');
        if (endedScreen) {
            endedScreen.style.display = 'flex';
        }
    }

    /**
     * 隐藏视频结束界面
     */
    hideVideoEndedScreen() {
        const endedScreen = document.getElementById('video-ended');
        if (endedScreen) {
            endedScreen.style.display = 'none';
        }
    }

    /**
     * 显示错误信息
     */
    showErrorMessage(message) {
        // 这里可以集成通知系统
        console.error(message);
        alert(message); // 临时使用alert
    }

    /**
     * 更新观看时间
     */
    updateWatchTime() {
        if (this.watchStartTime) {
            this.totalWatchTime += (Date.now() - this.watchStartTime) / 1000;
            this.watchStartTime = null;
        }
    }

    /**
     * 保存观看进度
     */
    saveWatchProgress() {
        this.updateWatchTime();

        const progress = {
            videoType: this.options.videoType,
            currentTime: this.video.currentTime,
            duration: this.video.duration,
            totalWatchTime: this.totalWatchTime,
            completionRate: this.video.duration ? (this.video.currentTime / this.video.duration) * 100 : 0,
            lastWatched: new Date().toISOString()
        };

        try {
            localStorage.setItem(`video_progress_${this.options.videoType}`, JSON.stringify(progress));
        } catch (error) {
            console.error('保存观看进度失败:', error);
        }
    }

    /**
     * 记录用户事件
     */
    recordEvent(eventType, data = {}) {
        const eventData = {
            type: eventType,
            videoType: this.options.videoType,
            timestamp: new Date().toISOString(),
            ...data
        };

        // 这里可以发送到分析API
        console.log('📊 视频事件:', eventData);
    }

    /**
     * 格式化时间显示
     */
    formatTime(seconds) {
        if (!isFinite(seconds)) return '00:00';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    /**
     * 检测是否为移动设备
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * 销毁播放器
     */
    destroy() {
        this.saveWatchProgress();

        // 清理定时器
        clearTimeout(this.hideControlsTimeout);

        // 移除事件监听器
        if (this.video) {
            this.video.pause();
        }

        console.log('🗑️ 视频播放器已销毁');
    }
}

// 导出给全局使用
window.VideoPlayer = VideoPlayer; 