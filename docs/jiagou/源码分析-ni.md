# 源码分析-ni
[antfu/ni](https://github.com/antfu/ni)

## 总体思路
👇 思路很简单

```text
1. 根据锁文件猜测用哪个包管理器 `npm/yarn/pnpm`
2. 抹平不同的包管理器的命令差异
3. 最终运行相应的脚本
```

难点在怎么代理并运行全局的指令 `pnpm xx`
以及如何打包纯ts库

判断项目用的是什么包管理器反而不难, 抹平会繁琐一点, 但是也不是难点

先设置为项目内部使用的指令, 工具就不安装到全局了

因为是通过指令运行, 所以这个工具的执行逻辑应该是 `bin` 执行

> bin 在工作中封装 `cli` 脚手架工具时常用

因为不像包管理器那样 `pnpm xxx` 指令(`pnpm`)相同 参数(`add/remove`)不同来执行逻辑

而是 `ni xx` `nr xx` ... 指令不同 也就需要创建出不同的对应的 `bin`

```json
{
   "name": "@antfu/ni",
   "bin": {
      "ni": "bin/ni.mjs",
      "nci": "bin/nci.mjs",
      "nr": "bin/nr.mjs",
      "nu": "bin/nu.mjs",
      "nx": "bin/nx.mjs",
      "na": "bin/na.mjs",
      "nun": "bin/nun.mjs"
   },
}
```

👇 `bin/ni.mjs` 引入一个 `dist` 模块 该模块应是 `IIFE` 立即执行

```js
#!/usr/bin/env node
'use strict'
import '../dist/ni.mjs'
```

---

🤔 TODO:  `bin` 用 `nodejs` 执行 `js` 和 `sh` 执行 `shell` 有什么区别吗 ???

---

用 `unbuild` 打包 `ts`
用 `tsno` 运行 `ts`

## 搭建js库环境

### 搭建ts环境

安装 `typescript` 和 `nodejs` 直接运行 `ts` 的工具 `esno`( `es-node` 不好用)

```bash
pnpm add -D typescript esno
```

👇 `tsconfig.json` 从源代码里粘贴出来, 不用 `tsc init`
```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "esnext",
    "lib": ["esnext"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "strictNullChecks": true,
    "resolveJsonModule": true
  }
}
```
TODO: ts配置项含义另外讲解

`Ts` 引用 `nodejs` 模块如 `fs` `path` 没有类型提示

安装 `pnpm add -D @types/node` 即可, 不需要配置

🤔 `Vite` 项目中是内置到 `@vite/client` 了, 所以看不出来

不用设置 `package.json` `"type": "module"`, 因为 `tsno` 执行ts代码, 认识 `ESM`, 不需要像 `nodejs` 执行代码一样需要知道是 `ESM` 还是 `CJS`


### 搭建基础目录结构

因为对外的产物会经过打包的 `mjs` `cjs`
分别对应 `package.json`

- `"main": "dist/index.cjs",`
- `"module": "dist/index.mjs",`

以多入口打包, 每个指令对应一个入口

- 入口文件在 `src/commands/xx`
- 核心方法在 `src/xx`

因为库的使用方式 所以目录结构感觉和常规的确实不同

👇 一般的目录结构我会设计为:
- 入口文件 `src/index.js`
- 核心方法 `src/core/xx`
- 辅助方法 `src/help/xx`

### 初步运行

配置 `package.json` 中的 `script`

通过 `esno` 执行 `ts` 入口文件 `"dev": "tsno src/commands/ni.ts"`

命令行执行 `pnpm dev` 是期望效果即可

## 匹配项目目录下的 lockfiles 文件

`findUp` 的使用 传入文件名字符串数组匹配
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230113171722.png)

👇 因此我们列出所有 `lockfiles` 的完整文件名常量枚举

```ts
// the order here matters, more specific one comes first
export const LOCKS: Record<string, Agent> = {
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
}

type Agent = 'pnpm' | 'yarn' | 'npm'
```
👆 `Ts` 的类型定义, 当需要限制 `key` 和 `value` 时使用 `Record` ?TODO:

[find-up -github](https://github.com/sindresorhus/find-up)
- 第1个参数 送 `Object.keys(LOCKS)`
- 第2个参数对象属性 `cwd - The current working directory @default process.cwd()`

这里示例代码都通过项目目录的 `pnpm dev` 运行, 因此默认值 `process.cwd` 即可

```ts
import { findUp } from "find-up";

type Agent = 'pnpm' | 'yarn' | 'npm'

// the order here matters, more specific one comes first
const LOCKS: Record<string, Agent> = {
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
  'npm-shrinkwrap.json': 'npm',
}

// 查找档案项目下的 lockfiles 并获取内容字符串
async function detect() {
	// { cwd } The current working directory. default process.cwd()
  const lockPath = await findUp(Object.keys(LOCKS))
  console.log('匹配到的文件完整路径',lockPath)
}

detect()
```
👆 `pnpm dev` -> `esno src/commands/ni.ts` 输出 `'匹配到的文件完整路径 /Users/luojinan/Desktop/code/vitepress/test/ni/pnpm-lock.yaml'`

截取出文件名, 并匹配常量枚举即可知道是什么包管理器

利用 `nodejs` 内置模块 `path.basename(path)` 截取绝对路径中的文件名

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230113174945.png)

👆 `path.basename()` 的 `Ts` 类型不允许 `undefined` 类型, 而 `findUp` 输出的结果 `lockPath` 参数类型是 `string | undefined`

这种情况包一层 `if(lockPath)` 即可

这时候 `agent` 变量应该定义在外面

```ts
// 👇 这样 ts 会提示不能 Agent不包含null
let agent: Agent =  null // ❌

let agent: Agent | null = null
```

👇 最终
```ts
// 查找档案项目下的 lockfiles 并获取内容字符串
async function detect() {
  // 1. 匹配项目目录下的 lockfile 文件名取出绝对路径
  const lockPath = await findUp(Object.keys(LOCKS))

  // 2. package.json 中的 packageManager 优先级比 lockfiles 高 略

  // 3. 根据 lockfiles 文件路径取出包管理器名
  let agent: Agent | null = null

  if(lockPath) {
    agent = LOCKS[path.basename(lockPath)] || null
  }

  // 4. 判断电脑环境无该包管理器 尝试问答式自动安装 略

  return agent
}

detect().then(res=>console.log(res)) // --> 'pnpm'
```

## 抹平指令层相关配置

通过列出不同的包管理器的指令清单, 用一个参数匹配

如 参数 `add` 对应 `pnpm add` `yarn add` `npm install`

因为我们只做 `ni` 的功能因此列出的指令常量清单
```ts
const AGENTS = {
  'npm': {
    'add': 'npm i {0}'
  },
  'yarn': {
    'add': 'yarn add {0}'
  },
  'pnpm': {
    'add': 'pnpm add {0}'
  },
}
```

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230113181340.png)

👆 `command` 是指令清单中的 `'add'`

`Ts` 类型 我们需要列出 `AGENTS` 所有属性作为 `Ts` 枚举

利用 👇 特性
```ts
let colors = {
  red: 'Red',
  green:'Green',
  blue:'Blue'
}

type TColors = keyof typeof colors // 'red' | 'green' | 'blue'
```

那么
```ts
type Command = keyof typeof AGENTS.npm
```

你可能注意到了, 上面我们定义了 `type agent = 'pnpm' | 'yarn' | 'npm'`

也可以用这种方式

```ts
type Agent = keyof typeof AGENTS

// 等同于
type Agent = 'pnpm' | 'yarn' | 'npm'
```

👆 可以看出这种特性 只能按照其中一个包管理器的属性 `keyof typeof AGENTS.npm` 来定义 `type`

需要人为要求每添加一个指令, 应给每个包管理器的指令清单都相应添加

👇 最终
```ts
// 根据包管理器名称 以及需要匹配的key 输出完整指令
function getCommand(agent: Agent, command:Command) {
  const c = AGENTS[agent][command]
  return c
}

async function run() {
  const agent = await detect()
  if(!agent) return
  const command = getCommand(agent, 'add')
  console.log(command)
}

run() // --> 'pnpm add {0}'
```

## 处理命令行参数

[Boolean -MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
```js
const args = process.argv.slice(2).filter(Boolean)
```

```js
const a = [1, 2, "b", 0, {}, "", NaN, 3, undefined, null, 5];
const b = a.filter(Boolean); // [1, 2, "b", {}, 3, 5]

// 等价于
const b = a.filter(function (x) { return Boolean(x); });
```

`Boolean` 本质是一个接收参数的函数, 在 `filter` 中接收到数组项的参数并返回 `true/false` 被 `filter` 过滤

`pnpm dev vite -D` --> `‘pnpm add vite -D’`

至此, 我们已经用js逻辑处理好了区分包管理器和简写命令以及拼接参数得到目标命令字符串的逻辑

## js执行这段字符串命令行

`pnpm add execa -D`

[execa-github](https://github.com/sindresorhus/execa)

```ts
import { execaCommand } from 'execa'

// readonly cwd?: string | URL; Current working directory of the child process. @default process.cwd()
await execaCommand(command, { stdio: 'inherit', encoding: 'utf-8' })
```

至此通过 `npm script` 执行工具脚本(esno执行ts)的功能实现了

## 打包 📦

接着我们需要做成 `nodejs` 的 `bin` 脚本 只能用 `js` 或者 `sh`

也就是需要使用到js库打包工具(即使不打包至少也要转译ts), 第一印象里是使用优于 `webpack` `的rollup`

但是随着各种技术的进步, 我们可以试试其他不错的 js库打包工具

- `tsup` TODO: 
- `unbuild` 基于`rollup`, 又是一个内置默认配置的类似 `vue-cli` 的工具呀...

会根据 `package.json` 中的 `js` 库相关属性进行内置打包模式

命令行执行 `unbuild` 脚本 默认读取 `src` 下的入口文件

需要修改要新建 `build.config.ts` 配置文件

👇 `build.config.ts`
```ts
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/commands/ni'
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
})
```
👆 不配置 `declaration` `rollup` 将只生成 `dist/ni.mjs`

配置上才会生成 `ni.cjs` `ni.d.ts`

TODO: 具体配置含义

那 `package.json` 上的属性不自动读咯...

直接运行 `npx unbuild` 或配置 `"unbuild": "unbuild"` 通过`pnpm unbuild` 运行脚本

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230116115737.png)

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230116135546.png)

此时不再通过 `esno src/commands/ni.ts` 执行入口文件

而是 `node dist/ni.mjs vite -D` 执行


## bin 文件

👇 新建 `bin/ni.mjs` 直接引入 dist 文件
```js
#!/usr/bin/env node
'use strict'
import '../dist/ni.mjs'
```

运行 `node bin/ni.mjs`

TODO: 输出 bin 库的最佳实践

[源码 -github](https://github.com/luojinan/note-by-vitepress/tree/master/test/ni)

## 思考

🤔 为什么要打包📦

为了作为全局依赖吗？

别人安装了 ni包(打包集成一些外部库)，假如项目内部本身就有安装过那些外部库的话 就算重复安装了

假设 `ni` 不打包, 把这些作为前置依赖, 不是更好？ 还是说因为 `bin` 文件一定要没有外部依赖的代码？

## 参考资料

- [尤雨溪推荐神器 ni ，能替代 npm/yarn/pnpm ？简单好用！源码揭秘！](https://juejin.cn/post/7023910122770399269)
