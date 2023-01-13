不用设置 `package.json` `"type": "module"`

因为对外的产物会经过打包的 `mjs` `cjs`
分别对应 `package.json`

- `"main": "dist/index.cjs",`
- `"module": "dist/index.mjs",`

以多入口打包, 每个指令对应一个入口

👇 `src/commands/ni.ts`
```ts
// 打包入口文件
import { parseNi } from '../parse'
import { runCli } from '../runner'

runCli(parseNi)
```

- 入口文件在 `src/commands/xx`
- 核心方法在 `src/xx`

因为库的使用方式 所以目录结构感觉和常规的不同

👇 一般的目录结构会是:
- 入口文件 src/index.js
- 核心方法 src/core/xx
- 辅助方法 src/help/xx

配置 ts 环境

安装 nodejs直接运行ts 的工具 esno( es-node 不好用)

```bash
pnpm add -D typescript esno
```

👇 tsconfig.json 从源代码里粘贴出来, 不用 tsc init
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

ts 引用 nodejs 模块没有类型提示

安装即可,不需要配置 `pnpm add -D @types/node`

vite 项目中内置了, 所以看不出来

安装 `excea` 执行 nodejs 字符串命令

安装 `find-up` 找出文件

## 一、匹配项目目录下的 lockfiles 文件

findUp的使用 传入文件名字符串数组匹配
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230113171722.png)

因此我们列出所有 lockfiles 的完整文件名

```ts
// the order here matters, more specific one comes first
export const LOCKS: Record<string, Agent> = {
  'bun.lockb': 'bun',
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
  'npm-shrinkwrap.json': 'npm',
}
```
👆 Ts 的类型定义, 当需要限制 key 和 value 时使用 Record ?

```ts
type Agent = 'pnpm' | 'yarn' | 'npm'
```

```ts
let colors = {
  red: 'Red',
  green:'Green',
  blue:'Blue'
}

type TColors = keyof typeof colors // 'red' | 'green' | 'blue'
```

findUp
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
  console.log('匹配到的文件名',lockPath)
}

detect()
```

👆 `pnpm dev` -> `esno src/commands/ni.ts` 输出 `匹配到的文件名 /Users/luojinan/Desktop/code/vitepress/test/ni/pnpm-lock.yaml`


![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230113174945.png)

利用 path.basename(path) 输出绝对路径的文件名

Ts 不允许 undefined 类型, 而 findUp 输出的结果 lockPath 类型是 string | undefined

包一层 `if(lockPath)` 即可

这时候 agent 变量应该定义在外面

```ts
// 👇 这样 ts 会提示不能 Agent不包含null
let agent: Agent =  null // ❌

let agent: Agent | null = null
```


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

## 二、抹平指令层相关配置

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

👆 command 是指令清单中的 'add'

我们需要列出所有枚举, 代码只能按照其中一个包管理器的属性来定义 type

需要人为要求没添加一个指令, 应给每个包管理器的指令清单都相应添加

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
