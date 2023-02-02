> 现代前端工程离不开打包工具

打包工具的最核心功能，我认为是
- 模块化的实现(资源合并)
- 代码的转译(内容转换)

因此重学webpack的步骤不会从webpack源码的入口一步一步走
而是从设计一个打包工具的思路分析webpack
所以会从
- 要实现模块化，webpack怎么做，还能怎么做
- 要实现代码的转译，webpack怎么做，怎么做会更好


## webpack启动的方式
可以通过安装`webpack-cli`依赖, 即可在终端运行 npx webpack xx 启动
也可以不安装cli,通过nodejs 运行webpack构造函数

> `webpack-cli` 的作用是读取命令行参数合并到webpack参数中

这里通过`nodejs` 运行`webpack构造函数`形式学习webpack原理

```js
const webpack = require('webpack')
webpack({
  // config entry,output...
})
```

## 预习资料
[做了一夜动画，让大家十分钟搞懂Webpack](https://juejin.cn/post/6961961165656326152)
[webpack打包原理 ? 看完这篇你就懂了 !](https://juejin.cn/post/6844904038543130637)

[[万字总结] 一文吃透 Webpack 核心原理](https://zhuanlan.zhihu.com/p/363928061)
