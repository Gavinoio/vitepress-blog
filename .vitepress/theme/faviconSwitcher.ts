// Favicon 切换器配置
const FAVICON_CONFIG = {
  original: '/letter-g.png',      // 正常显示的图标
  gray: '/letter-g-gray.png',     // 页面隐藏时显示的灰度图标
};

export function setupFaviconSwitcher() {
  // 确保只在客户端运行
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // 缓存已加载的图标 URL，避免重复添加时间戳
  let cachedOriginalUrl = '';
  let cachedGrayUrl = '';
  let isInitialized = false;

  function updateFavicon(href: string, isGray: boolean) {
    if (!href) return;

    // 查找所有 favicon 元素
    const links = document.querySelectorAll("link[rel*='icon']") as NodeListOf<HTMLLinkElement>;

    // 删除所有现有的 favicon 元素
    links.forEach((link) => {
      link.remove();
    });

    // 使用缓存的 URL 或生成新的带时间戳的 URL（仅首次）
    let finalUrl: string;
    if (isGray) {
      if (!cachedGrayUrl) {
        // 只在首次初始化时添加时间戳，避免 hydration mismatch
        cachedGrayUrl = isInitialized ? href : href + '?t=' + Date.now();
      }
      finalUrl = cachedGrayUrl;
    } else {
      if (!cachedOriginalUrl) {
        // 只在首次初始化时添加时间戳，避免 hydration mismatch
        cachedOriginalUrl = isInitialized ? href : href + '?t=' + Date.now();
      }
      finalUrl = cachedOriginalUrl;
    }

    // 创建新的 favicon 元素
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.type = 'image/png';
    newLink.href = finalUrl;
    document.head.appendChild(newLink);
  }

  // 延迟初始化，避免 hydration mismatch
  requestAnimationFrame(() => {
    isInitialized = true;

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时，切换到灰度 favicon
        updateFavicon(FAVICON_CONFIG.gray, true);
      } else {
        // 页面显示时，恢复原始 favicon
        updateFavicon(FAVICON_CONFIG.original, false);
      }
    });
  });
}
