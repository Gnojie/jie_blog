module.exports = {
  base: "/giteepage_blog/",
  title: "Hello VitePress",
  description: "Just playing around.",
  // 主题配置
  themeConfig: {
    //   头部导航
    nav: [
      // { text: "每周学习整理", link: "/vue/vue-router实现原理" },
      { text: "gitee", link: "https://gitee.com/luojinan1" },
    ],
    //   侧边导航
    sidebar: {
      '/': [
        {
          text: ' 面试题',
          children: [
            { text: 'vue面试题', link: '/'},
          ],
        },
        {
          text: 'vue',
          children: [
            { text: 'router实现原理', link: '/vue/vue-router实现原理' },
          ],
        },
        {
          text: '每周学习整理',
          children: [
            { text: '202110-1', link: '/week/202110-1' },
          ],
        },
      ],
    },
  },
};
