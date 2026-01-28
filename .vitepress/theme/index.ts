import ThemeAsync from "vitepress-theme-async";
import type { Theme } from "vitepress";
import { setupFaviconSwitcher } from "./faviconSwitcher";
import CustomBannerBg from "./components/CustomBannerBg.vue";
import "./styles/custom.css";

// 过滤主题的控制台宣传信息
const originalLog = console.log;
console.log = (...args) => {
  const str = args[0];
  if (typeof str === "string" && str.includes("Vitepress-Theme-Async")) {
    return;
  }
  originalLog.apply(console, args);
};

// 扩展主题，添加 favicon 切换功能和自定义组件
export default {
  extends: ThemeAsync,
  enhanceApp({ app }) {
    // 注册自定义横幅组件，覆盖主题默认组件
    app.component('TrmBannerBg', CustomBannerBg);

    // 在客户端初始化 favicon 切换器
    if (typeof window !== 'undefined') {
      setupFaviconSwitcher();
    }
  }
} as Theme;
