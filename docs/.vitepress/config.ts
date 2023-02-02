import { defineConfig } from 'vitepress'
// import initPage from './initPage'
import { getSidebarData, getNavData } from './initPage'

export default defineConfig({
  base: "/notepage/",
  title: "罗锦安的blog",
  description: "vue、js、nodejs等等的学习记录",
  lang: 'zh',
  ignoreDeadLinks: true,
  themeConfig: {

    nav: getNavData({ enableDirActiveMatch: true }),
    sidebar: getSidebarData(),
    //   头部导航
    // nav: [
    //   { text: "gitee", link: "https://gitee.com/luojinan1" },
    // ],
    
    socialLinks: [
      {
        icon: "github",
        link: 'https://gitee.com/luojinan1'
      }
    ],
    //   侧边导航
    // sidebar: {
    //   '/': [
    //     {
    //       text: ' 介绍',
    //       items: [
    //         { text: '介绍', link: '/'},
    //       ],
    //     },
    //     ...initPage()
    //   ],
    // },
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