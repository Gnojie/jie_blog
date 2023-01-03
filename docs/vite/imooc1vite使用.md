[vite官方文档](https://vitejs.dev/) 移动的网络居然打不开，电信正常。。。
（据说已经从国外服务器部署到了gitee，感觉像是访问地址时没有重定向到国内服务器，多刷新几次就好了，为什么不把国内的域名地址公布出来，允许自己直接访问而不是靠重定向呢。。。）

概念：
- `bundler-based build setup` - 基于打包器的构建方式
- `native ESM base build setup` - 基于原生ESM的构建方式
- `improves DX` - `Developer Experience` 提高开发体验
- `bare module` - 裸模块 非路径式的import如 node_modules
- `Rebasing` - 变基 猜测是指自动拼接相对路径的baseUrl

## 概念

[vite官方文档-why vite](https://vitejs.dev/guide/why.html)

> Vite aims to address these issues by leveraging new advancements in the ecosystem: the availability of native ES modules in the browser, and the rise of JavaScript tools written in compile-to-native languages.
> 
> Vite 旨在解决上述问题通过利用生态系统中的新进展：原生ES模块在浏览器上可用的，和越来越多 JavaScript 工具使用编译型语言编写
> 👆 重点在于使用 **原生ESM模块化**、**编译型语言工具Rust**

### 解决 Slow Server Start

> Vite improves the dev server start time by first dividing the modules in an application into two categories: dependencies and source code.
> 
> Vite 改进了开发服务器启动时间，通过在一开始将应用中的模块区分为两类: 依赖 和 源码

- **Dependencies**: plain JavaScript that do not change often during development. 
  - large dependencies (e.g. component libraries with **hundreds of modules** or like lodash-es) 
  - various module **formats** (e.g. ESM or CommonJS).
  - Vite **pre-bundles** dependencies using **esbuild**. esbuild is written in Go and pre-bundles dependencies 10-100x faster than JavaScript-based bundlers.
- **Source code**: **non-plain** JavaScript
  - needs **transforming** (e.g. JSX, CSS or Vue/Svelte components)
  - will be **edited very often**
  - not all source code needs to be **loaded at the same time** (e.g. with route-based code-splitting).
  - Vite serves source code over **native ESM**. This is essentially letting the **browser take over part of the job of a bundler**: Vite only needs to transform and serve source code on demand, as the browser requests it. Code behind conditional dynamic imports is only processed if actually used on the current screen.

- 依赖: 纯js，不经常改动
  - 可能内部依赖大量模块(lodash-es、components libraries)
  - 可能是多种格式 CJS、ESM、UMD
  - vite 预编译这些依赖通过esbuild
- 源码: 非纯js，经常改动
  - 需要转译 JSX、CSS、VUE/Svelte、TS
  - 不需要全部加载
  - vite 基于原生ESM，相当于让浏览器接管打包程序的部分工作(模块化),vite只转译和按需提供源码

### 解决 Slow Updates

> runs the bundling in memory so that it only needs to invalidate part of its module graph when a file changes, 
>
> 👆 有缓存功能的打包器构建方式，通过缓存打包结果来提升速度，只在文件更改时使模块图的一部分失活

没HMR时：
- re-construct the entire bundle and reload the web page 仍然需要从头运行运行构建流程(有缓存时会跳过)
- reloading the page blows away the current state of the application 重载模块图相关部分，会丢失js状态

有HMR后：
> in practice we've found that even HMR update speed deteriorates significantly as the size of the application grows.
>
> 👆 没有具体说明，大型应用 `bundle-base build setup` 有HMR后依然慢的原因TODO:

Vite，HMR 是在原生 ESM 上执行的
当编辑一个文件时，Vite 只需要精确地使已编辑的模块与其最近的 HMR 边界之间的链失活（大多数时候只是模块本身）
使得无论应用大小如何，HMR 始终能保持快速更新


![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230102131910.png)

### 生产环境仍然用 bundel-base build

> the additional network round trips caused by nested imports
> 
> 👆 生产环境如果是用ESM build，嵌套导入会导致额外的网络往返

> esbuild important features needed for bundling applications are still work in progress - like code-splitting and CSS handling. 
>
> 👆 不使用 esbuild 进行 bundle-base build的原因: esbuild 针对构建应用的重要功能仍然还在持续开发中 - 代码分割和 CSS 处理

### 思考

- 不需要像 `webpack` 那么多配置项
  - 🤔只是因为都内置成默认配置而已吧
  - 和 `webpack` 比较不是合理的，因为vite打包是基于rollup的，并不是提供一套新的打包工具
  - 更合理的是和脚手架工具比较如: `vue-cli`、`create-react-app`
  - 这些工具同样不需要很多配置项而是内置成默认配置
  - `vue-cli` 通过 `configureWebpack` 和 `chainWebpack` 修改默认配置
  - `create-react-app` 通过 `eject` 修改默认配置 

## 功能
[vite官方文档-features](https://vitejs.dev/guide/features.html)

### 支持 bare module import

浏览器原生ESM不支持 bare module 引入(原生ESM其实可以靠 importMap 支持)

因此需要 ViteDevServer，拦截到相关的路径引入，转化为绝对路径

> Rewrite the imports to valid URLs like `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd`

👆 可以看到转化的路径带了hash，配合http强缓存，可以缓存到浏览器而不经过 ViteDevServer

另外这个步骤同时会有预构建的处理(esbuild转化CJS等)，后补完整处理逻辑 TODO:


### HMR
> Frameworks with HMR capabilities can leverage the API to provide instant, precise updates without reloading the page or blowing away application state
>
> 👆 具有HMR能力的框架，可以利用Vite的API来提供实时的，精确的更新，而无需重载页面后者清除应用状态

源码分析部分讲解
Vite并不提供HMR功能，而是提供一套通用的HMR API，由插件根据不同框架以及框架自身来实现相应的HMR

### TS

#### 默认不做类型校验，可以另外配置开启

> Vite only performs transpilation on .ts files and does NOT perform type checking.
> 👆 vite默认支持ts转译，但是不会执行类型检查
>
> It assumes type checking is taken care of by your IDE and build process (you can run `tsc --noEmit` in the build script or `install vue-tsc` and run` vue-tsc --noEmit` to also type check your *.vue files).
> 👆 vite假定类型检查已经通过编辑器和打包过程处理好了，打包过程处理的话，需要手动配置执行 `tsc --noEmit` 另外.vue文件需要安装vue-tsc并执行`vue-tsc --noEmit`

ts转译使用了esbuild，除了first init项目块，在HMR时也快

#### [仅含类型的import被不正确的打包]问题

> avoid potential problems: `type-only imports being incorrectly bundled`
避免潜在的问题：`仅含类型的import被不正确的打包`
```ts
import type { T } from 'only/types'
export type { T }
```
Use the Type-Only Imports and Export syntax

🤔 TODO: why type-only imports will error in being incorrectly bundled

#### TS配置要求(create-vite 问答选中ts时会自动生成)
这里并不是讲解生成的tsconfig的每一项的含义(会在create-vite原理中讲解TODO:)
而是讲解一个vite项目支持ts的强制要求的配置项

- isolatedModules: true
  - because `esbuild` only performs transpilation without `type information` 🤔 什么是type information？？？
  - it doesn't support certain features like `const enum` and `implicit type-only imports` 🤔 什么是隐式纯类型引入
  - set true for TS warn you do not work with isolated transpilation. 设置来让TS警告不要使用isolated隔离转译功能 🤔 什么是isolated transpilation
  - 然而，一些库（如：vue）不能很好地与 "isolatedModules": true 共同工作。你可以在上游仓库修复好之前暂时使用 "skipLibCheck": true 来缓解这个错误。🤔 什么是上游仓库 修好什么
- useDefineForClassFields: true
  - It is consistent with the behavior of tsc 4.3.2 and later. It is also the standard ECMAScript runtime behavior.
  - 🤔 约定俗成？具体是什么

#### vite/client 提供业务代码API的types

> Vite's default types are for its Node.js API
> 👆 Vite是nodejs环境的构建工具，因此vite默认提供的types都是给构建脚本使用的
> 
> To shim the environment of client side code in a Vite application
> 👆 但是Vite同时也提供了一些业务代码的API(`import.meta.env`、`import.meta.hot`、`.svg`)，这些API的types需要手动导入

导入这些API的方式有2种
- 新建`env.d.ts`文件
  - `/// <reference types="vite/client" />`
  - 在这一行前写类型声明可以覆盖 `declare module '*.svg' {}`
  - 在这一行后写类型声明可以扩展
- `tsconfig.json`配置项
  - `"compilerOptions": { "types": ["vite/client"] }`

🤔 TODO: `vite/client` 内部怎么定义类型,给外部使用的

### JSX/TSX

首先JSX/TSX语法是React创建的，所以纯的JSX语法是按照React的需要而定义的
也就不会有vue的模版语法功能(指令、指令、全局组件等)
所以vue需要额外的扩展 `vue-jsx`

vite内置提供JSX/TSX编译通过esbuild，因此react不需要额外安装jsx相关插件，而vue则需要安装`@vitejs/plugin-jsx`

> If not using JSX with React or Vue, custom jsxFactory and jsxFragment can be configured using the esbuild option. For example for Preact:

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```
👆 vite基于esbuild来编译jsx，因此如果需要非react和非vue，其他jsx语法，则可以配置[esbuild相关配置](https://esbuild.github.io/content-types/#jsx)来支持，包括一些额外的jsx编译功能

### CSS

### Static Assets

### JSON

### Glob Import

### Dynamic Import

### WebAssenbly

### Web Workers

### Build Optimizations
