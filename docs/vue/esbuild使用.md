> [esbuild](https://esbuild.docschina.org/)是`GO语言`编写的前端打包工具
> 跟`webpack`、`rollup`、`vite`属于同类工具库
> [Esbuild 为什么那么快](https://zhuanlan.zhihu.com/p/379164359)

以前传统打包工具webpack、rollup都是使用nodejs即js编写的
**vite就是基于esbuild的打包工具**，通过换一种底层语言实现优化打包的性能，直接绕过js的局限
如：单线程不能并行、打包工具本身需要解析、读取AST次数导致的内存没有合理实现...
(传统js语言打包工具，在执行打包时需要先解析js成底层语言，才能开始打包。而GO更接近底层语言解析速度更快)
> JavaScript 本质上依然是一门解释型语言，JavaScript 程序每次执行都需要先由解释器一边将源码翻译成机器语言，一边调度执行；
> 而 Go 是一种编译型语言，在编译阶段就已经将源码转译为机器码，启动时只需要直接执行这些机器码即可。
> Go 语言编写的程序比 JavaScript 少了一个动态解释的过程。


另外esbuild原生支持编译typescript、压缩代码、tree-shaking

