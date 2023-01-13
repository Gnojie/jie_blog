import fs from 'fs'
import path from 'path'
import { execaCommand } from 'execa'
import { findUp } from 'find-up'
import { AGENTS } from '../agents'

// the order here matters, more specific one comes first
export const LOCKS: Record<string, Agent> = {
  'bun.lockb': 'bun',
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
  'npm-shrinkwrap.json': 'npm',
}

async function detect({ autoInstall, cwd }: DetectOptions) {
  let agent: Agent | null = null

  const lockPath = await findUp(Object.keys(LOCKS), { cwd })
  let packageJsonPath: string | undefined

  if (lockPath)
    packageJsonPath = path.resolve(lockPath, '../package.json')
  else
    packageJsonPath = await findUp('package.json', { cwd })

  // read `packageManager` field in package.json
  if (packageJsonPath && fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      if (typeof pkg.packageManager === 'string') {
        const [name, version] = pkg.packageManager.split('@')
        if (name === 'yarn' && parseInt(version) > 1)
          agent = 'yarn@berry'
        else if (name === 'pnpm' && parseInt(version) < 7)
          agent = 'pnpm@6'
        else if (name in AGENTS)
          agent = name
        else
          console.warn('[ni] Unknown packageManager:', pkg.packageManager)
      }
    }
    catch {}
  }

  // detect based on lock
  if (!agent && lockPath)
    agent = LOCKS[path.basename(lockPath)]

  // auto install
  if (agent && !cmdExists(agent.split('@')[0])) {
    if (!autoInstall) {
      console.warn(`[ni] Detected ${agent} but it doesn't seem to be installed.\n`)
      process.exit(1)
    }

    await execaCommand(`npm i -g ${agent}`, { stdio: 'inherit', cwd })
  }

  return agent
}

async function run(fn: Runner) {
  let agent = await detect({ cwd })
  const command = await fn(agent as Agent, {}, {
    hasLock: Boolean(agent),
    cwd,
  })

  if (!command) return

  await execaCommand(command, { stdio: 'inherit', encoding: 'utf-8', cwd })
}

function getCommand(
  agent: Agent,
  command: Command,
  args: string[] = [],
) {
  // 匹配指令
  const c = AGENTS[agent][command]

  if (typeof c === 'function')
    return c(args)

  if (!c)
    throw new Error(`Command "${command}" is not support by agent "${agent}"`)

  return c.replace('{0}', args.join(' ')).trim()
}

run(getCommand(agent, 'add', args))

