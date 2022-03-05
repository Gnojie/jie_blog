> `webpack` 是一个用于现代 `JavaScript` 应用程序的 `静态模块打包工具`--[webpack官方文档](https://webpack.docschina.org/concepts/)


从👆看，自身只实现让浏览器支持CJS的模块化打包而已,webpack把很多功能都通过loader和plugin开放出去了，为什么会这么重呢(因为工程庞大,依赖文件多？)

- 收集js的依赖关系成一个数组对象(不使用递归而是队列)
- 遍历模块依赖关系数组,用立即执行js注入require等参数实现浏览器支持CMD(参考手写CommonJs)
- 立即执行函数是用字符串写成的，最终写入一个js文件中

## 运行webpack入口
可以通过安装`webpack-cli`依赖, 即可在终端运行 webpack xxx 启动
也可以不安装cli,通过nodejs 运行wenpack构造函数

TODO: 安装webpack依赖不会在node_modules中生成.bin支持指令吗?`webpack-cli`依赖的本质是.bin文件吗

这里通过nodejs 运行webpack构造函数形式学习webpack原理

```js
const webpack = require('webpack')
webpack({
  // config entry,output...
})
```


- 把文件内容转化为AST树,方便收集模块化语法,也就是开发阶段使用的nodejs的CMD/AMD语法
- 根据收集到的AST树,转译成自己实现的模块化方法,且不马上注入该方法
- 通过包装一层注入方法的形式，实现模块化(跟nodejs一致)

难点：
- AST收集和转译(演示就直接用babel提供的库来实现)
- 注入的自己实现的模块化方法需要支持在浏览器运行


[做了一夜动画，让大家十分钟搞懂Webpack](https://juejin.cn/post/6961961165656326152)
[webpack打包原理 ? 看完这篇你就懂了 !](https://juejin.cn/post/6844904038543130637)

[[万字总结] 一文吃透 Webpack 核心原理](https://zhuanlan.zhihu.com/p/363928061)

[深入 Vue Loader 原理](https://juejin.cn/post/7039918272111869988)
[Webpack 案例 —— vue-loader 原理分析](https://juejin.cn/post/6937125495439900685)