import path from 'path'
import { findUp } from "find-up";
import { execaCommand } from 'execa'

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
  // 1. 匹配项目目录下的 lockfile 文件名取出绝对路径
	// { cwd } The current working directory. default process.cwd()
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

type Command = keyof typeof AGENTS.npm

// 根据包管理器名称 以及需要匹配的key 输出完整指令
function getCommand(agent: Agent, command:Command, args:string[]) {
  const c = AGENTS[agent][command]
  // 拼接命令行参数如 ni xxx 命令行参数是 xxx
  return c.replace('{0}', args.join(' ')).trim()
  // return c
}

async function run() {
  const agent = await detect()
  if(!agent) return
  const args = process.argv.slice(2).filter(Boolean)
  const command = getCommand(agent, 'add', args)
  console.log(command)
  // readonly cwd?: string | URL; Current working directory of the child process. @default process.cwd()
  await execaCommand(command, { stdio: 'inherit', encoding: 'utf-8' })
}

run()