
[antfu/ni](https://github.com/antfu/ni)

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

因为不像包管理器那样 `pnpm xxx` 指令相同 参数不同来执行逻辑

而是 `ni xx` `nr xx` ... 指令不同 也就是需要创建出不同的对应的 bin

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

👇 `bin/ni.mjs` 引入一个dist模块 该模块应是 IIFE 立即执行

```js
#!/usr/bin/env node
'use strict'
import '../dist/ni.mjs'
```

---

🤔 `bin` 用 `nodejs` 执行 `js` 和 `sh` 执行 `shell` 有什么区别吗 ???


---

用 `unbuild` 打包 `ts`
用 `tsno` 运行 `ts`

已知包管理器名字符串 再根据一些特殊参数匹配一些特殊的指令
```ts
// 已知包管理器, 获取具体的 指令字符串
export const parseNi = <Runner>((agent, args, ctx) => {
  if (args.includes('-g'))
    return getCommand(agent, 'global', exclude(args, '-g'))

  if (args.includes('--frozen-if-present')) {
    args = exclude(args, '--frozen-if-present')
    return getCommand(agent, ctx?.hasLock ? 'frozen' : 'install', args)
  }

  if (args.includes('--frozen'))
    return getCommand(agent, 'frozen', exclude(args, '--frozen'))

  if (args.length === 0 || args.every(i => i.startsWith('-')))
    return getCommand(agent, 'install', args)

  return getCommand(agent, 'add', args)
})
```


根据 包管理器名字符串匹配相应的指令
```ts
// ni/src/agents.ts
// 一份配置，写个这三种包管理器中的命令字符串
export const AGENTS = {
  npm: {
    'install': 'npm i'
  },
  yarn: {
    'install': 'yarn install'
  },
  pnpm: {
    'install': 'pnpm i'
  },
}

// ni/src/commands.ts
export function getCommand(
  agent: Agent,
  command: Command,
  args: string[] = [],
) {
  // 包管理器不在 AGENTS 中则报错
  // 比如 npm 不在
  if (!(agent in AGENTS))
    throw new Error(`Unsupported agent "${agent}"`)

  // 获取命令 安装则对应 npm install
  const c = AGENTS[agent][command]

  // 如果是函数，则执行函数。
  if (typeof c === 'function')
    return c(args)

  // 命令 没找到，则报错
  if (!c)
    throw new Error(`Command "${command}" is not support by agent "${agent}"`)
  // 最终拼接成命令字符串
  return c.replace('{0}', args.join(' ')).trim()
}
```


```ts
export async function runCli(fn: Runner) {
  const args = process.argv.slice(2).filter(Boolean)
  try {
    await run(fn, args)
  }
  catch (error) {
    process.exit(1)
  }
}
```

运行指令的前置处理 参数 -v -h -C
```ts
export async function run(fn: Runner, args: string[]) {
  let cwd = process.cwd()
  let command
	// 处理 -v --version 参数逻辑
  if (args.length === 1 && (args[0] === '--version' || args[0] === '-v')) {
    console.log(`@antfu/ni v${version}`)
    return
  }

	// 处理 -h --help 参数逻辑
  if (args.length === 1 && ['-h', '--help'].includes(args[0])) {
    const dash = c.dim('-')
    console.log(c.green(c.bold('@antfu/ni')) + c.dim(` use the right package manager v${version}\n`))
    console.log(`ni   ${dash}  install`)
    console.log(`nr   ${dash}  run`)
    console.log(`nx   ${dash}  execute`)
    console.log(`nu   ${dash}  upgrade`)
    console.log(`nun  ${dash}  uninstall`)
    console.log(`nci  ${dash}  clean install`)
    console.log(`na   ${dash}  agent alias`)
    console.log(c.yellow('\ncheck https://github.com/antfu/ni for more documentation.'))
    return
  }

	// 处理 -C 参数逻辑
  if (args[0] === '-C') {
    cwd = resolve(cwd, args[1])
    args.splice(0, 2)
  }

	// 处理 -g 参数逻辑 TODO: 怎么处理 全局安装
  const isGlobal = args.includes('-g')
  if (isGlobal) {
    command = await fn(await getGlobalAgent(), args)
  }
}
```


index.js 1.获取包管理器名字符串 2.匹配相应的指令 3.execa运行
```ts
// 判断当前项目的包管理器 detect
let agent = await detect({ cwd }) || await getDefaultAgent()

// 执行回调 fn
command = await fn(agent as Agent, args, {
   hasLock: Boolean(agent),
   cwd,
})

if (!command) return

const voltaPrefix = getVoltaPrefix()
if (voltaPrefix)
 command = voltaPrefix.concat(' ').concat(command)

await execaCommand(command, { stdio: 'inherit', encoding: 'utf-8', cwd })
```


根据 lockfiles 判断当前包管理器输出字符串如 `'pnpm'` 并尝试自动全局安装

```ts
// ni/src/detect.ts
export async function detect({ autoInstall, cwd }: DetectOptions) {
  const result = await findUp(Object.keys(LOCKS), { cwd })
  const agent = (result ? LOCKS[path.basename(result)] : null)

  if (agent && !cmdExists(agent)) {
    if (!autoInstall) {
      console.warn(`Detected ${agent} but it doesn't seem to be installed.\n`)

      if (process.env.CI)
        process.exit(1)

      const link = terminalLink(agent, INSTALL_PAGE[agent])
      const { tryInstall } = await prompts({
        name: 'tryInstall',
        type: 'confirm',
        message: `Would you like to globally install ${link}?`,
      })
      if (!tryInstall)
        process.exit(1)
    }

      // execa: 一个库 Process execution for humans
      await execa.command(`npm i -g ${agent}`, { stdio: 'inherit', cwd })
  }

  return agent
}
```