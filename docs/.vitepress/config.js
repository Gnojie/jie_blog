import { defineConfig } from 'vitepress'
import initPage from './initPage'

export default defineConfig({
  base: "/notepage/",
  title: "罗锦安的blog",
  description: "vue、js、nodejs等等的学习记录",
  lang: 'zh',
  ignoreDeadLinks: true,
  themeConfig: {
    //   头部导航
    nav: [
      { text: "gitee", link: "https://gitee.com/luojinan1" },
    ],
    
    socialLinks: [
      
      {
        icon: "github",
        link: 'https://gitee.com/luojinan1'
      }
    ],
    //   侧边导航
    sidebar: {
      '/': [
        {
          text: ' 介绍',
          items: [
            { text: '介绍', link: '/'},
          ],
        },
        ...initPage()
      ],
    },
    algolia: {
      appId: '...',
      apiKey: '...',
      indexName: '...'
    }
  },
})