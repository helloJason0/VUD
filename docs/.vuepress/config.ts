import { defineConfig, PluginTuple } from "vuepress/config";
import { getChildren } from "vuepress-sidebar-atuo"

export default defineConfig({
  title: 'VUDUI',
  description: 'vue组件库',
  themeConfig: { // 新增代码
    nav: [ // 配置顶部导航栏
      {
        text: '首页',
        link: '/'
      },
      {
        text: '组件',
        link: '/basic/home'
      },
      { text: "GitHub", link: "https://github.com/SFTC/VUD" }
    ],
    sidebar: {
      '/basic/': [
        { title: '基础组件', children: getChildren('./docs/basic/') }
      ]
    }
  },
  plugins: ['demo-container', 'typescript', {
    tsLoaderOptions: {
      // ts-loader 的所有配置项
    },
  },] as PluginTuple[],
  markdown: {}
});