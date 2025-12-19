import ThemeAsync from "vitepress-theme-async";
import type { Theme } from "vitepress";
import { setupFaviconSwitcher } from "./faviconSwitcher";
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

// 扩展主题，添加 favicon 切换功能
export default {
  extends: ThemeAsync,
  enhanceApp() {
    // 在客户端初始化 favicon 切换器
    if (typeof window !== 'undefined') {
      setupFaviconSwitcher();
    }
  }
} as Theme;
