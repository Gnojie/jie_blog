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

