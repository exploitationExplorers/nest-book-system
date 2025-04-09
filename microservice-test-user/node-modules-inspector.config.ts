import { defineConfig } from 'node-modules-inspector';
export default defineConfig({
  defaultFilters: {
    excludes: [
      'eslint', // 排除不需要显示的依赖
    ],
  },
  defaultSettings: {
    moduleTypeSimple: true, // 简化模块类型显示
  },
  publint: true, // 启用实验性的 publint 功能
});
