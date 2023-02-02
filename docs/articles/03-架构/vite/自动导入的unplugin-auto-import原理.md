
  - TODO:待确认 vite启动编译时 扫描所有代码的 import 语句分析出需要预构建的模块
  - 当 import 语句，是在运行时访问到路由才生成的时候，源码中没有这个 import，则在启动编译时不会 预构建 到
  - 👆 自动import [unplugin-auto-import github](https://github.com/antfu/unplugin-auto-import) 的插件是这种情况吗？ 