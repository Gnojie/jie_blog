import Koa from 'koa'
import koaStatic from 'koa-static'
import { fileURLToPath, URL } from 'node:url' // 用于配置目录别名
import { build } from 'esbuild'

const app = new Koa()

// 静态资源路由
app.use(koaStatic(fileURLToPath(new URL('.', import.meta.url))))

// ----------------------------------
// 1. 用 esbuild 扫描输出依赖清单
// 2. 用 esbuild 遍历依赖清单对内部依赖进行整合打包 并 遇到 CJS/UMD 转化为 ESM
// 3. 手动让js import 转译后的资源 而不是资源源码
// ----------------------------------

/**
 * esbuild 的 plugin 也是定义一个包含 name 和 setup 函数的对象
 * setup函数会被 esbuild 注入一个 build 对象参数，往这里面挂载东西就能自定义 esbuild 的处理逻辑
 */
function createEsbuildScanPlugin(depImports) {
  return {
    name: 'dep-scan',
    setup(build) {
      build.onResolve({ filter: /^[\w@][^:]/ }, async ({ path, importer }) => {
        
        // 获取 第三方模块的绝对路径
        // const resolved = await resolve(path, importer)
        const afterUrl = fileURLToPath(new URL('./node_modules/lodash-es/lodash.js', import.meta.url))
        console.log('dep-scan check this', path,afterUrl)
        
        const resolved = path === 'lodash-es' ? afterUrl : path
        // ERROR: Plugin "dep-scan" returned a non-absolute path: lodash-es (set a namespace if this is not a file path)
        // 只对 node_modules 目录下的模块用 esbuild 处理
        if (resolved && resolved.includes('node_modules')) {
          // 记录 pre-bundle 清单
          // 🤔 TODO: 如果只是为了记录清单给后面的esbuild 转译， 为什么还要设置 true，转译步骤本身就会输出相应的文件吧
          // 扫描这一步主要是处理其他后缀文件的吧，整合打包主要还是靠后面一步
          depImports[path] = resolved

          // 这里只是为了返回 external: true 选项
          return {
            path, // 模块路径
            external: true, // 入口文件外的属于 node_modules 的模块设置为 true
          }
        }
      })
    },
  }
}

async function scanImports() {
  // 确认入口，这里写死不支持配置，也不支持多入口
  const entry = './index.js'
  
  // 创建 esbuildScanPlugin 插件
  const depImports = {} // key为 bare import, value 为 absolute url
  const plugin = createEsbuildScanPlugin(depImports)

  await build({
    absWorkingDir: process.cwd(),
    write: false,
    entryPoints: [entry], // 传入入口
    bundle: true,
    format: 'esm',
    logLevel: 'error',
    plugins: [plugin], // Vite 支持配置其他插件
    // outfile: 'dist.js',
    allowOverwrite: true,
  })
  return {depImports}
}


async function doBuild({depImports}) {
  // esubild 的同一个 api build 参数加上 metafile: true 可以得到 res.metafile
  const result = await build({
    absWorkingDir: process.cwd(),
    entryPoints: Object.keys(depImports),
    bundle: true, // 这里为 true，可以将有许多内部模块的 ESM 依赖关系转换为单个模块
    format: 'esm',
    // target: config.build.target || undefined,
    // external: config.optimizeDeps?.exclude, // 配置项 排除预编译
    logLevel: 'error',
    splitting: true,
    sourcemap: true,
    outdir: fileURLToPath(new URL('./dist', import.meta.url)),
    platform: 'browser',
    ignoreAnnotations: true,
    metafile: true,
    // define, // 环境变量转真实值字符串
    plugins: [],
  })
  // console.log('res.metafile', result.metafile)
}

await doBuild(await scanImports())

app.listen(3001, () => {
  console.log('build success')
})