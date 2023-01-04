import Koa from 'koa'
import koaStatic from 'koa-static'
import { fileURLToPath, URL } from 'node:url' // 用于配置目录别名

const app = new Koa()

// 静态资源路由
app.use(koaStatic(fileURLToPath(new URL('.', import.meta.url))))

// ----------------------------------
// 1. 用 esbuild 扫描输出依赖清单
// 2. 用 esbuild 编译依赖清单对内部依赖进行整合打包 并 遇到 CJS/UMD 转化为 ESM
// 3. 手动让js import 转译后的资源 而不是资源源码
// ----------------------------------


app.listen(3001, () => {
  console.log('build success')
})