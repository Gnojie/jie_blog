import { defineConfig } from 'vitepress'
// import initPage from './initPage'
import { getSidebarData, getNavData } from './initPage'

export default defineConfig({
  base: "/notepage/",
  title: "coderJie",
  description: "vue、深度学习、算法等等的学习记录",
  lang: 'zh',
  ignoreDeadLinks: true,
  themeConfig: {

    nav: getNavData({ enableDirActiveMatch: true }),
    sidebar: getSidebarData(),
    socialLinks: [
      {
        icon: "github",
        link: 'https://github.com/Gnojie'
      }
    ],
    algolia: {
      appId: '...',
      apiKey: '...',
      indexName: '...'
    },
    // 配置顶部的文字(不配置则是英文)
    outlineTitle: '文章目录',
    // 表示显示h2-h6的标题
    outline: 'deep',
  },
})