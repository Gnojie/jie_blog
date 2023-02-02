[vite官方文档](https://vitejs.dev/) 移动的网络居然打不开，电信正常。。。
（据说已经从国外服务器部署到了gitee，感觉像是访问地址时没有重定向到国内服务器，多刷新几次就好了，为什么不把国内的域名地址公布出来，允许自己直接访问而不是靠重定向呢。。。）

概念：
- `bundler-based build setup` - 基于打包器的构建方式
- `native ESM base build setup` - 基于原生ESM的构建方式: `rollup`、`parcel`
- `improves DX` - `Developer Experience` 提高开发体验
- `bare module` - 裸模块 非路径式的 `import` 如 `node_modules`
- `Rebasing` - 变基 猜测是指自动拼接相对路径的 `baseUrl`

## 概念

[vite官方文档-why vite](https://vitejs.dev/guide/why.html)

> Vite aims to address these issues by leveraging new advancements in the ecosystem: the availability of native ES modules in the browser, and the rise of JavaScript tools written in compile-to-native languages.
> 
> Vite 旨在解决上述问题通过利用生态系统中的新进展：原生ES模块在浏览器上可用的，和越来越多 JavaScript 工具使用编译型语言编写
> 
> 👆 重点在于使用 **原生ESM模块化**、**编译型语言工具Rust**

### 解决 Slow Server Start

> Vite improves the dev server start time by first dividing the modules in an application into two categories: dependencies and source code.
> 
> Vite 改进了开发服务器启动时间，通过在一开始将应用中的模块区分为两类: 依赖 和 源码

- `Dependencies`: plain JavaScript that do not change often during development. 
  - large dependencies (e.g. component libraries with `hundreds of modules` or like lodash-es) 
  - various module `formats` (e.g. ESM or CommonJS).
  - Vite `pre-bundles` dependencies using `esbuild`. esbuild is written in Go and pre-bundles dependencies 10-100x faster than JavaScript-based bundlers.
- `Source code`: `non-plain` JavaScript
  - needs `transforming` (e.g. JSX, CSS or Vue/Svelte components)
  - will be `edited very often`
  - not all source code needs to be `loaded at the same time` (e.g. with route-based code-splitting).
  - Vite serves source code over `native ESM`. This is essentially letting the `browser take over part of the job of a bundler`: Vite only needs to transform and serve source code on demand, as the browser requests it. Code behind conditional dynamic imports is only processed if actually used on the current screen.

- 依赖: 纯js，不经常改动
  - 可能内部依赖大量模块(lodash-es、components libraries)
  - 可能是多种格式 CJS、ESM、UMD
  - 解决启动慢：vite 预编译这些依赖通过esbuild
- 源码: 非纯js，经常改动
  - 需要转译 JSX、CSS、VUE/Svelte、TS
  - 不需要全部加载
  - 解决启动慢：vite 基于原生ESM，相当于让浏览器接管打包程序的部分工作(模块化),vite只转译和按需提供源码

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

浏览器原生ESM不支持 `bare module` 引入(原生ESM其实可以靠 `importMap` 支持)

因此需要 `ViteDevServer`，拦截到相关的路径引入，转化为绝对路径

> Rewrite the imports to valid URLs like `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd`

👆 可以看到转化的路径带了`hash`，配合 `http强缓存`，可以缓存到浏览器而不经过 `ViteDevServer`

另外这个步骤同时会有预构建的处理(`esbuild`转化`CJS`等)，后补完整处理逻辑 TODO:

### HMR
> Frameworks with HMR capabilities can leverage the API to provide instant, precise updates without reloading the page or blowing away application state
>
> 👆 具有HMR能力的框架，可以利用Vite的API来提供实时的，精确的更新，而无需重载页面后者清除应用状态

源码分析部分讲解
Vite并不提供HMR功能，而是提供一套通用的HMR API，由插件根据不同框架以及框架自身来实现相应的HMR

### TS

#### 默认不做类型校验，可以另外配置开启

> Vite only performs transpilation on .ts files and does NOT perform type checking.
>
> 👆 vite默认支持ts转译，但是不会执行类型检查

> It assumes type checking is taken care of by your IDE and build process (you can run `tsc --noEmit` in the build script or `install vue-tsc` and run` vue-tsc --noEmit` to also type check your *.vue files).
> 
> 👆 vite假定类型检查已经通过编辑器和打包过程处理好了，打包过程处理的话，需要手动配置执行 `tsc --noEmit` 另外.vue文件需要安装vue-tsc并执行`vue-tsc --noEmit`

ts转译使用了`esbuild`，除了`first init项目`速度快，在`HMR`时也快

#### [仅含类型的import被不正确的打包]问题 TODO: p2-6

> avoid potential problems: `type-only imports being incorrectly bundled`
避免潜在的问题：`仅含类型的import被不正确的打包`
```ts
import type { T } from 'only/types'
export type { T }
```
Use the Type-Only Imports and Export syntax

🤔 TODO: why type-only imports will error in being incorrectly bundled

#### TS配置要求(create-vite 问答选中ts时会自动生成) TODO: p2-6
这里并不是讲解生成的`tsconfig`的每一项的含义(会在create-vite原理中讲解TODO:)

而是讲解一个vite项目支持ts的强制要求的配置项

- `isolatedModules`: true
  - because `esbuild` only performs transpilation without `type information` 🤔 什么是type information？？？
  - it doesn't support certain features like `const enum` and `implicit type-only imports` 🤔 什么是隐式纯类型引入
  - set true for TS warn you do not work with isolated transpilation. 设置来让TS警告不要使用isolated隔离转译功能 🤔 什么是isolated transpilation
  - 然而，一些库（如：vue）不能很好地与 "isolatedModules": true 共同工作。你可以在上游仓库修复好之前暂时使用 "skipLibCheck": true 来缓解这个错误。🤔 什么是上游仓库 修好什么
- `useDefineForClassFields`: true
  - It is consistent with the behavior of tsc 4.3.2 and later. It is also the standard ECMAScript runtime behavior.
  - 🤔 约定俗成？具体是什么

#### vite/client 提供业务代码API的types

> Vite's default types are for its `Node.js API`
> 👆 Vite是nodejs环境的构建工具，因此vite默认提供的types都是给构建脚本使用的
> 
> To shim the environment of `client side code` in a Vite application
> 👆 但是Vite同时也提供了一些业务代码的API(`import.meta.env`、`import.meta.hot`、`.svg`)，这些API的types需要手动导入

导入这些API的types方式有2种
- 新建`env.d.ts`文件
  - `/// <reference types="vite/client" />`
  - 在这一行前写类型声明可以覆盖 `declare module '*.svg' {}`
  - 在这一行后写类型声明可以扩展
- `tsconfig.json`配置项
  - `"compilerOptions": { "types": ["vite/client"] }`

🤔 TODO: `vite/client` 内部怎么定义类型,给外部使用的

### JSX/TSX

首先 `JSX/TSX` 语法是 `React` 创建的，所以纯的JSX语法是按照React的需要而定义的
也就不会有vue的模版语法功能(指令、指令、全局组件等)
所以vue需要额外的扩展 `vue-jsx`

vite内置提供 `JSX/TSX` 编译通过 `esbuild`，因此react不需要额外安装jsx相关插件，而vue则需要安装`@vitejs/plugin-jsx`

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
👆 vite基于 `esbuild` 来编译 `jsx`，因此如果需要`非react和非vue`，其他jsx语法，则可以配置[esbuild相关配置](https://esbuild.github.io/content-types/#jsx)来支持，包括一些额外的jsx编译功能

### CSS

在 `webpack` 中需要
- `style-loader`: 把处理后的css文件内容插入到`html`的`head`中
- `css-loader`: 处理css中的模块化,如`背景图`和`@import css`的操作
- `postcss-loader`: 类似 `babel` 对 `js` 的作用,通过给样式属性添加前缀来**兼容**各种高低版本的浏览器

#### style-loader
`viteDevServer` 内置处理inject css content to the html via a `<style>` tag with HMR support
👆 也就是通过js插入css到html中，也就是内置了 `style-loader`

#### css-loader
而 处理css中url的 `css-loader`，则内置为默认配置

> pre-configured to support CSS `@import` inlining via `postcss-import`. Vite aliases are also respected for CSS `@import`
>
> 👆 以前仅用于兼容浏览器添加css前缀的 postcss，现在还提供很多其他转译功能如 `postcss-import` 就提供了 `css-loader` 的功能
>
> 关于`postcss-import` 配置则由vite设置成了默认配置，并且支持vite配置中的路径别名如 `@`

> all CSS url() references, even if the imported files are in different directories, are always automatically rebased to ensure correctness.
>
> css 中的 `url()` 语法同样的处理，并且额外提供自动变基功能，即使不在根目录的路径也能被处理成功
>
> 🤔 不自动变基的话，不在根路径下的目录就引入不到了吗？需要额外做什么？

#### postcss-loader

Vite内置了读取[postcss配置文件](https://github.com/postcss/postcss-load-config)的逻辑，无需手动配置开启postcss，只需要在项目根路径创建相关配置文件即可
如 `postcss.config.js` `.postcssrc`

🤔 css压缩会发生在dev阶段吗？会的话这个内置逻辑是通过什么实现的？

#### CSS Modules

内置支持 `xx.module.css` 引入，通过 [css-modules github](https://github.com/css-modules/css-modules)这个库实现

把css文件内容转化成类似json的对象数据 🤔 TODO: 不太了解这种写法的作用

看起来是为了提供复用样式，webpack的 `postcss` 使用过给所有的css全局注入公共样式，当时是建议只注入变量而不使用className的

但是使用起来是，要js引入再作用于html，并不方便吧

为了复用样式，写成全局样式其实也不会造成很多浪费吧

同样可以通过配置`vite.config.js`对相关功能进行配置如

`css.modules.localsConvention: 'camelCaseOnly'` 可以实现驼峰命名方式获取css中的`xx-xx`形式的样式

#### CSS 预处理器

> Because Vite targets modern browsers only, it is recommended to use native CSS variables with PostCSS plugins that implement CSSWG drafts (e.g. [postcss-nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting)) and author plain, future-standards-compliant CSS.

目前有草案css支持嵌套写法，而postcss其实类似于css中的babel，提前支持草案语法因此可以引入并配置支持

但是草案还是有大改的可能

### Static Assets

相当于 webpack 的file-loader，处理如图片、字体、svg等资源引入在js的使用

图片、字体、svg等资源路径，按照标准仅支持写在特定的地方，如 `img标签中的src`，而不支持用import引入作为js逻辑使用

因此在构建工具中就要对这些内容做支持

🤔 TODO: Vite文档没有解释用什么实现的,找到内置逻辑在源码分析中讲解

另外Vite提供了url query params的方式修改js import 的资源内容
- url
- raw
- worker - worker是js，但是每次引入都需要写很多重复的初始化worker的内容，Vite做的是自动初始化好Worker实例
- ...

### JSON

```js
// import the entire object
import json from './example.json'
// import a root field as named exports - helps with tree-shaking!
import { field } from './example.json'
```
👆 TODO: 同样没有讲解怎么把json转译成js对象，并支持 tree-shaking

### Glob Import

[vite官方文档-Glob](https://vitejs.dev/guide/features.html#glob-import)

```js
const modules = import.meta.glob('./dir/*.js')

// 👇 编译后  code produced by vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js'),
}
```

因此使用该API返回到的 `modules` 是一个对象, 需要遍历对象或通过 `路径key` 取出

取出的 `value` 是一个函数执行 `import()` ，因此取到value需要执行一下 `value()`

关于这个工具方法的其他参数不一一讲解,需要时查看文档

> - This is a Vite-only feature and is not a web or ES standard.
> - The glob patterns are treated like import specifiers: they must be either relative (start with ./) or absolute (start with /, resolved relative to project root) or an alias path (see resolve.alias option).
> - The glob matching is done via fast-glob - check out its documentation for supported glob patterns.
> - You should also be aware that all the arguments in the import.meta.glob must be passed as literals. You can NOT use variables or expressions in them.
>
> 👆 `import.meta.glob()` 是vite内置逻辑往 `import.meta` 对象上挂载的自定义函数，不是JS官方API
> 
> Glob 模式会被当成导入标识符：必须是相对路径（以 ./ 开头）或绝对路径（以 / 开头，相对于项目根目录解析）或一个别名路径
> 
> 🤔 什么叫当成导入标识符，所以要写路径
> 
> 基于 [fast-glob](https://github.com/mrmlnc/fast-glob)
> 
> 如👆的code🌰中，glob方法发生在构建工具编译时，而不是运行时，因此不能写变量，感觉可以优化成支持常量的变量

和 Webpack 中的 `modules.resolve` 类似，发生在编译时
TODO: 运行时存不存在这个 API？

### WebAssenbly

[vite官方文档-wasm](https://vitejs.dev/guide/features.html#webassembly)

因为没有具体使用过，因此先略过

vite会提供初始化实例的代码包装成一个未执行的Promise函数
省去自己写初始化的重复代码

### Web Workers

同 WebAssenbly

### Build Optimizations

指 生产环境的打包优化，都基于rollup内置成默认配置了

#### Async Chunk CSS Code Splitting

默认把Async Chunk 中引入的CSS，也分割成单独的css文件，通过 JS用`<link>`插入html
(如懒加载的路由)

非懒加载的css都打成1个css吧

#### js 分割

rollup对js重复逻辑提取到 `common.js` 中

这时候的请求顺序是 👇

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230103130912.png)

需要等异步chunk加载并解析完成，才开始请求 common.js

🤔 但是 common.js 一般会在入口js的时候就依赖到并加载了吧

Vite 通过一个预加载步骤自动重写代码，来分割动态导入调用，以实现当 A 被请求时，C 也将 同时 被请求

common.js 也可能有更深的导入，在未优化的场景中，这会导致更多的网络往返。Vite 的优化会跟踪所有的直接导入，无论导入的深度如何，都能够完全消除不必要的往返

🤔 TODO: 什么原理

#### modulepreload

Vite 会为入口 `chunk` 和它们在打包出的 `HTML` 中的直接引入自动生成 `<link rel="modulepreload">` 指令。

🤔 什么原理？处理的是什么场景

- [翻译篇 - ES 模块预加载和完整性](https://zhuanlan.zhihu.com/p/388537104)
- [Using Native JavaScript Modules in Production Today](https://philipwalton.com/articles/using-native-javascript-modules-in-production-today/)
- [JavaScript的未来是模块化？-中文](https://mp.weixin.qq.com/s/uf88myQov-t7rDqbMkF5EQ)

通过打包工具生成入口文件的所有依赖文件清单，设置到 `modulepreload` 可以立即请求并在主线程外进行解析

但是兼容性不好，此时也可以考虑判断兼容性，让支持的浏览器用，不支持的则按照传统资源方式加载

## 环境变量 env

[vite官方文档-env and mode](https://vitejs.dev/guide/env-and-mode.html)

全局变量挂载在 `import.meta.env` 对象上
经过编译后，运行时访问对象上的属性，会被编译成常量而不是一个变量读取，因此不能写key不能写成变量`import.meta.env[key]`
即，运行时不存在 `import.meta.env` 对象

### build-in 内置环境变量
- `import.meta.env.MODE` {string}
- `import.meta.env.BASE_URL` {string}
- `import.meta.env.PROD` {boolean}
- `import.meta.env.DEV` {boolean}
- `import.meta.env.SSR` {boolean}
- 👆 根据运行构建脚本时相关配置自动生成对应的值

### 自定义环境变量

自动读取 `.env.[import.meta.env.MODE]` 文件 - 🤔 这种方式很常见，大家是都用一个底层库来实现吗？
> [dotenv - github](https://github.com/motdotla/dotenv) is a zero-dependency module that loads environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based on The [Twelve-Factor App](http://12factor.net/config) methodology.


`.ignoregit`文件中配置了`*.local` 因此👇
```bash
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

### 环境变量支持ts
可以在 `env.d.ts` 里配置 `import.meta.env` 的属性类型
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 覆盖模式mode相关环境变量

development/production 除了用于控制不同的环境变量，还用于控制不同的打包流程

- dev 对应环境变量 import.meta.env.MODE = development
- build 对应环境变量 import.meta.env.MODE = production

当build的时候希望打成其他的环境变量而不是production
`vite build --mode xxx` 读取的是 `.env.xxx`文件

当希望多个测试环境用不同的变量但是用同一种打包模式
```bash
# .env.testing
NODE_ENV=development
```
👆 非 `development/production` 模式时都要手动指定一下 `NODE_ENV` 用于打包流程

这个定义的是 `VITE_USER_NODE_ENV` 变量 而不是 `NODE_ENV`

---

🤔 `NODE_ENV` 的值只能由构建指令： `vite`、`vite build` 决定？

`NODE_ENV` 的值确实由 构建指令决定，但是对 `Vite` 来说env中自定义的 `VITE_USER_NODE_ENV` 优先级会更高

即: 当指令是 `build` 但是 `VITE_USER_NODE_ENV` 是 `development` 时 `Vite` 的构建逻辑将是 `dev` 而不是 `build` (可能只要有值且非 `production` 就会是 `dev`)

也就是自定义 `NODE_ENV=prod` 对于 Vite 来说就是提供 `development` 的构建方式

---


`NODE_ENV` 的作用？ `Vite` 内部逻辑才会使用到？并且内部先取了 `VITE_USER_NODE_ENV` 空时才取 `NODE_ENV` ？

👆 也就是，如果业务代码中希望使用到 `NODE_ENV` 也要有这段优先取 `VITE_USER_NODE_ENV` 的逻辑

环境变量有2种定义方式
1. 在 `vite.config.ts` 中的 `defind` 中配置
2. 在 `env` 相关文件中配置

读取方式也不同
1. `process_env`
2. `import.meta.env`

注意：在 `CommonJS` 中无法使用 `import.meta.env` 因为根本没有 `import` 这个全局变量

如果是在运行时经过 `ViteDevServer` 中的 `CJS` 会被转为 `ESM`，可能可以正常使用

但是当 `CJS` 时提供给其他库(如 `tailiwindCSS` 配置文件)使用的，而其他库不会转化成 `ESM`，更不会对生成 `import` 全局变量






## HMR

`Vite` 的 `HMR` 功能由具体语言的 `Vite` 插件 `plugin` 实现

如:
- `.vue` 文件的 `HMR` 由 `@vitejs/plugin-vue` 实现
- `VueJsx` 语法的 `HMR` 由 `@vitejs/plugin-vue-jsx`

用 `Vite` 创建出原生js工程

修改js文件内容，会发现整个页面自动刷新了一次(**并不是自动就是热更新，局部刷新才是**)

自动刷新是因为 `viteDevServer` 内置了 `nodejs` 的文件监听功能，当发现文件修改了，并且没有相应的热更新逻辑，将会通知( `websocket` )浏览器自动刷新整个页面

👆 可以看出 `HMR` 功能并不会被 `Vite` 内置提供, 即使有能力检测出变化的文件( `Rollup` 也是同理 )

但是 `Vite` 提供了一套通用热更新的 API (挂载在`import.meta.hot`对象中)

👇 把 `create-vite` 自动生成的示例代码，改造为调用函数的形式
```js
function render() {
  document.querySelector('#app').innerHTML = `
    <h1>Hello Vite</h1>
  `
}

render()
```

👇 当前文件中新增 HMR 逻辑

```js
// export 才能被 hot.accect 取到可用于调用的新代码
export function render() {
  document.querySelector('#app').innerHTML = `
    <h1>Hello Vite</h1>
  `
}
render()

if(import.meta.hot) {
  // 挂载在import.meta上是因为可以方便的跟当前文件路径关联上
  // 而不需要手动获取文件信息来关联
  import.meta.hot.accect((newModule) => {
    // Vite watch this file change will callback hot.accect
    // and do not refresh all page in brower
    // newModule is this file ESM export
    // .Vue 就是 export 整个组件实例， 因此可以猜想 plugin-vue 实现HMR 就是调用整个组件实例的 refresh 逻辑,而并不是精确到 .vue 的html部分各个小DOM
    newModule.render()
    // 👆 注意我们要取 newModule 中 export 的 render
    // 虽然在一个作用域 理论上可以直接调用render，但是不行！
    // 因为直接调用的 render 是旧的，并不是修改后的(因为当前模块是一个闭包的维度，触发回调时调用上下中的 render 是指向旧的作用域的 )
  })
}
```
加判断逻辑是因为 `build` 阶段，Vite不会挂载`hot对象`到 `import.meta` 中

即: 这段逻辑也会被打包到生产代码中


## SSR

有些文章会说实现 `SSR应用`, 需要后端配合

但实际需要后端配合的 `SSR应用` 是前后端不分离

现代的 `SSR应用`, 一般由前端编写 `nodejs` 处理 **SSR风格的前端打包产物**

### 前后端不分离的SSR项目

用户浏览器访问的 url 地址，对应的不是一个静态服务器的html, 而是一个后端服务的get请求

这个后端服务的get请求对应的html内容，由后端(模版引擎)编写

但是 js 资源还是由前端工程提供，现代 Web 应用都是通过一个主js逻辑处理页面渲染的，因此只要 js 资源提供所有如前端路由、动态渲染逻辑，这个后端服务就只需要处理 get请求到html的逻辑，其他不需要处理

👆 可以看出，这种不分离的场景，浏览器拿到的html内容依然是空的模板 HTML ,并不是实际意义上解决 SEO 问题的 SSR前端Web 方案

因此这里只提一下，相应的开发模式，不展开讲

- prod 环境下
  - 前端按照原打包工具的打包产物，提供给后端，除了 HTMl 文件
  - 并提供一份，模板 HTML 需要加载打包产物中的什么资源的清单，如入口js
  - 剩下的由后端编写逻辑处理清单生产对应的html内容(其实就是前端打包产物中的HTML的内容)
- dev 环境下
  - 前端按照原打包工具启动一个 devServer, 但是不直接访问这个 devServer
  - 后端编写dev 环境下, 前端的模板HTML内容(打包前的模板HTMl) 并设置get请求, 浏览器访问这个 get 请求
  - 后端编写的HTML内容，入口js等资源需要指向前端的 devServer
  - 后端需要代理静态资源(相对路径访问的图片等)目录，到前端 devServer，

### nodejs

流程: 
- nodejs SSR 实现的效果是, 浏览器访问 URL 时, 不再是访问静态服务器上的模板html
- 而是访问nodejs get请求, 这个get请求不仅仅是获取模板HTML返回,同时会拦截访问并对执行前端逻辑计算模板HTML的内容，再返回给浏览器, 浏览器拿到的将会是有内容的 HTML ,不再是模板 HTML

👆 nodejs 来得到 HTML 的内容是难点, 因为框架默认提供的各种浏览器运行时逻辑，由 nodejs 来执行, 会出问题, 如前端路由功能、页面init时调用接口获取数据, nodejs需要按照 get请求的路径和前端路由逻辑找到需要对应执行的事情, 以得到正确 HTML 内容


[Vite官方文档-SSR](https://vitejs.dev/guide/ssr.html)

实现步骤：

除了编写一个 nodejs 服务处理 get请求

还需要修改入口 HTML, 和入口 JS 来配合 nodejs 执行正确的计算 HTML 内容的逻辑

入口 JS 需要引入nodejs环境的路由逻辑，而不是前端的原路由

使用 express 或是 koa 等 nodejs静态服务功能

也正是因为把浏览器的逻辑转移到nodejs中，需要处理的情况是很多的，因此SSR方案的实现一般都得再套一层框架(一般不影响业务代码,仅从打包通用入口等地方入手)，如 `Nuxtjs`、`Nextjs`等

👇 的SSR也是同理，如 `VitePress`

## SSG

同样使用👆 SSR 的 nodejs 计算 HTML 内容的逻辑

prerender

多入口(所有路由)计算 HTML 内容

得到类似多页面应用的多 HTML的打包产物, 放到静态资源服务器里直接访问(不是 get请求)
