重新学习webpack,旨在理解运行webpack，是怎么编译目录下的各种文件的,如何做到接入各种 loader 和plugin

在重新学习之前还是要明确webpack的概念，webpack是个模块打包工具

模块化编程催生了打包工具的产生


安装 `webpack-cli` , 是为了可以在命令行中运行webpack
`node_modules/.bin` 目录下的依赖不就是可以在命令行通过 `npx` 来运行了吗？
也就webpack依赖不会默认放到.bin中,而是单独通过一个 `webpack-cli`的依赖来支持命令行运行？

从 `webpack-cli` 依赖的作用可以得出：如果项目通过一个js脚本运行webpack打包,则不需要安装该依赖

> 小tips: 如果要研究打包后的js代码，可以把build阶段的mode环境配置成dev，让打包后代码不被压缩和混淆

---

### 各种cssloader的作用
- style-loader: 把处理后的css文件内容插入到`html`的`head`中
- css-loader: 处理css中的模块化,如`背景图`和`@import css`的操作
- sass-loader: 预处理器样式语法的解析器
- postcss-loader: 类似babel对js的作用,通过给样式属性添加前缀来兼容各种高低版本的浏览器


👆 提到的css-loader 处理css中的模块化, 是css中资源的模块化, 当在js中引入css并且想要模块化(局部样式互不影响)就是不同的概念了
[css-modules - github](https://github.com/css-modules/css-modules)的概念
> CSS的规则都是全局的，任何一个组件的样式规则，都对整个页面有效。
> 产生局部作用域的唯一方法，就是使用一个独一无二的class的名字，不会与其他选择器重名。这就是 CSS Modules 的做法。

[css-modules - vue](https://vue-loader.vuejs.org/zh/guide/css-modules.html)

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220206220430.png)
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220206213958.png)
`css-loader`提供此功能配置项,可以让css的`className`被编译成`hash`唯一值,`css-loader`针对这一功能还有更多配置项,如自定义编译后的`className`不至于是一大段很丑的`hash`,详细看[css modules - 阮一峰](https://www.ruanyifeng.com/blog/2016/06/css_modules.html)

> 感觉在`react`中用得更多，`vue2`中用`render`写`jsx`的`js文件`可能也需要用到
> 但是到`vue3`之后都是`.vue`文件中写`jsx`?



---

> `plugin`类似生命周期,如`htmlWebpackPlugin`在打包结束时生成一个html文件并引入出口js
> 所以编写`plugin`配置数组时并不需要在意编写顺序，`plugin`执行时机取决于`plugin`自身，可以去具体的`plugin`的文档中查看


---

sourceMap是如何在运行打包后代码还能定位到源代码位置的

配置`devTool`为`source-map`时, 打包后资源会多一个`.map`文件映射打包后代码和源代码
而`devTool`改为`inline-source-map`, 打包后资源不会多文件，而是多一段注释代码在打包后代码最末端，这段注释就是`base64`后的`.map`文件内容

> eval是怎么实现的？有一个特殊的配置为 eval, 这跟.map效果一样能定位到源代码的位置，但是是完全不同的原理不是通过.map或者注释的base64来定位，而是在  sourceURL=webpack://...


---

webpack-dev-server 为什么不像build一样生成一个dist, 因为电脑读写文件比起修改内存要更耗性能,因为为了提升频繁修改文件的编译速度,dev阶段会把资源生成到内存中

webpack5之后可以通过地址拼接dev-server在浏览器查看内存中的打包后目录情况


---

热更新
在业务代码里其实需要写一段webpack热更新代码
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220206232544.png)

但是很多loader会帮忙注入实现，就不用手写，如css-loader和vue-loader，只要开启devserver的热更新，就可以实现局部热更新(如果没有loader的支持,开启后还要手写一段热更新的代码)

> react 则是靠babel的预设preset实现的注入热更新代码


**热更新原理：**


--- 
treeShaking

webpack能让`CommonJs`支持`treeShaking`吗？怎么实现？


开启`treeShaking`后会摇掉没有使用的资源内容，而有些资源是不抛出内容或是挂载到全局变量上的,就会被摇掉, 而我们想要保留时配置 `sideEffects`
如在js中引入css 就会被摇掉
`sideEffects: ["*.css"]`


prod阶段自动开启`treeShaking`, dev阶段为了频繁修改的编译速度和`sourceMap`的映射关系会默认关闭`treeShaking`，可以通过配置让dev阶段开启`treeShaking`，查看打包后代码如下，dev阶段即使开启`treeShaking`也不会摇掉代码而是注释提示只用到了哪些内容
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220206234433.png)

理解chunk的概念，可以帮助我们配置webpack，因为webpack很多关键值key用了chunks
比如code spliting 中的minChunks 最小使用次数：指的是打包后的每个js文件对目标的使用次数，并不是源代码中的js文件使用次数

---

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220207210553.png)
视频漏了这个些部分

---

webpack打包速度优化
把第三方资源库只打包一次，后续都不用再对第三方资源进行打包
1. 手动打包或是使用官方CDN，在模板html上写死引入
2. 使用DDLplugin,手动运行一次打包第三方资源。再打包工程时跳过打包第三方资源，直接去打包后第三方资源中引入(还是要插入到html中,只不过节省了从node_modules打包资源的步骤)


ddlPlugin 跟 CDN比
ddlPlugin 跟 手动写loadResource('./swiper.min.js')比

---

webpack编写loader，对着文档并不是很难写,就是根据webpack提供的参数操作数据

重点要学的是webpack的底层如何支持loader的

---





---



讲解webpack原理的视频
- 收集js的依赖关系成一个数组对象(不使用递归而是队列)
- 遍历模块依赖关系数组,用立即执行js注入require等参数实现浏览器支持CMD(参考手写CommonJs)
- 立即执行函数是用字符串写成的，最终写入一个js文件中

- 扩展中间支持loader的调用
- 加入babel loader



从👆看，webpack把很多功能都通过loader和plugin开放出去了，自身只实现让浏览器支持CJS的模块化而已,为什么会这么重呢(因为工程庞大,依赖文件多？)



