- 增量计算 `incremental computation` (在 `Turborepo` 上已经应用)
- 函数级别的缓存 `Function-level caching`

要解决 `Webpack` 大型应用构建慢的问题, 着手点都是希望：
- 运行时来决定按需编译
- 修改文件 `HMR` 编译维度最小化 (`Vite`把工作交给浏览器基于 `ESM`)
- 编译产物缓存/更新
- 使用 `Rust` 语言工具替换 `js` 语言工具 - 如 `SWC` 替代 `babel` 做转译工作
- 插件生态

> Turbopack is an incremental bundler optimized for JavaScript and TypeScript, written in `Rust`.
> 
> Turbopack 是增量的高性能的打包 JavaScript 和 TypeScript 打包器, 用 Rust 编写的

> Turbopack is so fast because it’s built on a `reusable library for Rust` which enables `incremental computation` known as the Turbo engine
> 
> 快的原因是使用 可重复利用的Rust库, 这个库至此 Turbo引擎 所谓的 增量计算

函数级别缓存
`Vite` 基于 `ESM` 实现文件级别缓存(HMR不需要重新编译)

`Turbopack` 通过 `Rust` 编译时实现文件级别缓存, 和运行时原理差不多, 只不过 `Turbopack` 要自己实现文件级别编译时缓存
👆 但是这是文件级别的吧？难道编译时还给文件内部的函数做缓存和HMR？🤯


因为是只有转译工具基于有点熟悉的 `SWC`, 打包工具没有用 `esbuild`
也就是其他部分都是自己编写的 `Rust`

