// 全屏功能修复版本
console.log(
    '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
    'color:orangered;font-weight:bolder'
);

// 很重要的原始代码部分 - 阻止新窗口打开
const hookClick = (e) => {
    const origin = e.target.closest('a');
    const isBaseTargetBlank = document.querySelector('head base[target="_blank"]');
    
    console.log('origin', origin, isBaseTargetBlank);
    
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault();
        console.log('handle origin', origin);
        location.href = origin.href;
    } else {
        console.log('not handle origin', origin);
    }
};

window.open = function (url, target, features) {
    console.log('open', url, target, features);
    location.href = url;
};

document.addEventListener('click', hookClick, { capture: true });


// 全屏功能处理函数
function handleFullscreen() {
    // 方法1: 尝试点击全屏按钮
    //const fullscreenBtn = document.querySelector('#player_pagefullscreen_yes_player');
    const fullscreenBtn = document.querySelector('#player_fullscreen_player');
    if (fullscreenBtn) {
        console.log('找到全屏按钮，尝试点击');
        fullscreenBtn.click();
        return true;
    }
    
    // 方法2: 查找其他可能的全屏按钮
    // const alternativeSelectors = [
    //     '.fullscreen-btn',
    //     '[title*="全屏"]',
    //     '[title*="fullscreen"]',
    //     '.player-fullscreen',
    //     'button[aria-label*="fullscreen"]',
    //     'video + div button:last-child'
    // ];
    
    // for (const selector of alternativeSelectors) {
    //     const btn = document.querySelector(selector);
    //     if (btn) {
    //         console.log(`找到替代全屏按钮: ${selector}`);
    //         btn.click();
    //         return true;
    //     }
    // }
    
    // 方法3: 直接使用浏览器全屏API
    const videoElement = document.querySelector('video') || 
                        document.querySelector('.video-container') || 
                        document.documentElement;
    
    if (videoElement) {
        console.log('使用原生全屏API');
        enterFullscreenNative(videoElement);
        return true;
    }
    
    return false;
}

// 原生全屏API封装
function enterFullscreenNative(element) {
    try {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else {
            console.log('浏览器不支持全屏API');
        }
    } catch (error) {
        console.error('全屏失败:', error);
    }
}

// 等待页面加载并尝试全屏
function initFullscreen() {
    // 立即尝试
    if (handleFullscreen()) {
        console.log('全屏执行成功');
        return;
    }
    
    // 延时重试
    const retryIntervals = [500, 1000, 2000, 5000];
    retryIntervals.forEach(delay => {
        setTimeout(() => {
            if (!document.fullscreenElement) { // 检查是否已经全屏
                console.log(`${delay}ms后重试全屏`);
                handleFullscreen();
            }
        }, delay);
    });
    
    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(() => {
        if (!document.fullscreenElement && handleFullscreen()) {
            observer.disconnect();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });
    
    // 10秒后停止监听
    setTimeout(() => observer.disconnect(), 10000);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFullscreen);
} else {
    initFullscreen();
}

// 用户首次交互时尝试全屏（解决浏览器安全策略限制）
let hasUserInteracted = false;
const userInteractionHandler = () => {
    if (!hasUserInteracted) {
        hasUserInteracted = true;
        console.log('检测到用户交互，尝试全屏');
        if (!document.fullscreenElement) {
            handleFullscreen();
        }
        // 移除监听器
        document.removeEventListener('click', userInteractionHandler, true);
        document.removeEventListener('keydown', userInteractionHandler, true);
        document.removeEventListener('touchstart', userInteractionHandler, true);
    }
};

document.addEventListener('click', userInteractionHandler, true);
document.addEventListener('keydown', userInteractionHandler, true);
document.addEventListener('touchstart', userInteractionHandler, true);