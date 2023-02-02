> 列表架构学习


👇 封装的依赖库
```json
{
  "@ynet/ynet-cli": "file:npm_modules/ynet-cli",
  "@ynet/ynet-spa-cli": "file:npm_modules/ynet-spa-cli",

  "@ynet/ynet-bridge": "file:npm_modules/ynet-bridge",
  "@ynet/ynet-spa-bridge": "file:npm_modules/ynet-spa-bridge",

  "@ynet/ynet-components": "file:npm_modules/ynet-components",
  "@ynet/ynet-ui-floor": "file:npm_modules/ynet-ui-floor",

  "@ynet/ynet-template-view": "file:npm_modules/ynet-template-view",
  "@ynet/ynet-templateframe": "file:npm_modules/ynet-templateframe",
  "@ynet/fastclick": "file:npm_modules/fastclick",
}
```

👇 入口
```json
"scripts": {
  "dev": "ynet-dev --env=dev",
  "dev:mock": "ynet-dev --env=dev --mock",

  "common:develop": "ynet-common --env=develop",
  "common:uat": "ynet-common --env=uat",
  "common:poc": "ynet-common --env=poc",

  "build:develop": "ynet-bundle --env=develop",
  "build:uat": "ynet-bundle --env=uat",
  "build:poc": "ynet-bundle --env=poc",

  "zip": "ynet-zips",
  "source": "ynet-sourceZips",

  "clean": "rimraf dist",
  "clean:node": "rimraf node_modules",

  "releaseconfig": "ynet-releaseConf",
  "lint": "eslint --ext .js,.vue src/modules",
  "lint:fix": "eslint --ext .js,.vue src/modules --fix",
  "init-page": "node build/init-page.js -p"
}
```

指令分为
- dev工具 -- ynet-dev
- common工具 -- ynet-common
- build工具 -- ynet-build
- zip工具 -- ynet-zip
- clean工具 -- node

指令由`npx`执行，即执行项目 `node_modules` 下的 `bin` 指令
并不是对应一个指令对应一个依赖库

bin指令怎么找

## bin指令
> 依赖库的 `package.json` bin项用来指定各个内部命令对应的可执行文件的位置

常规的安装项目内依赖,如果依赖package.json中配置bin
那将在node_modules下的.bin下生成映射
bin的key映射value的目录

安装一个myNpm的依赖，通过`node node_modules/myNpm/entry/main.js`执行
映射之后就可以通过`node node_modules/.bin/myNpm` 执行
可以看到，映射之后还是需要指定到node_modules下的bin来执行

我们想要让指令一步到位直接知道bin的key就是一段node指令,需要给执行文件头添加一段注释

```js
#!/usr/bin/env node

// dosometing...
```
脚本的第一行通常是指定解释器，即这个脚本必须通过什么解释器执行。这一行以#!字符开头，这个字符称为 Shebang，所以这一行就叫做 Shebang 行。

#!后面就是脚本解释器的位置，Bash 脚本的解释器一般是/bin/sh或/bin/bash

#!/usr/bin/env xxx
这个语法的意思是，让 Shell 查找$PATH环境变量里面第一个匹配的NAME。

因此创建自定义指令
- 安装的依赖package.json里有bin指定
- 依赖是项目通过npm安装到node_modules，或者项目package.json指定依赖是目录下包

指定依赖是其他目录，要求目录下必须有package.json

```json
"dependencies": {
  "antd": "ant-design/ant-design#4.0.0-alpha.8",
  "axios": "^1.2.0",
  "test-js": "file:../test",
  "test2-js": "http://cdn.com/test2-js.tar.gz",
  "core-js": "^1.1.5",
}
```
- `依赖包名:VERSION`
VERSION 是一个遵循 SemVer 规范的版本号配置， npm install 时将到 npm 服务器下载符合指定版本范围的包。

- `依赖包名:DWONLOAD_URL`
DWONLOAD_URL 是一个可下载的 tarball 压缩包地址，模块安装时会将这个 .tar 下载并安装到本地。

- `依赖包名:LOCAL_PATH`
LOCAL_PATH 是一个本地的依赖包路径，例如 file:../pacakges/pkgName。适用于你在本地测试一个 npm 包，不应该将这种方法应用于线上。

- `依赖包名:GITHUB_URL`
GITHUB_URL 即 github 的 username/modulename 的写法，例如：ant-design/ant-design，你还可以在后面指定 tag 和 commit id。

- `依赖包名:GIT_URL`
GIT_URL 即我们平时 clone 代码库的 git url


现在假设我要创建一个自己的cli依赖
在已有工程里怎么做调试，相关依赖是装到工程的node_modules里
但是cli的package.json也要记录相关依赖

还是说我应该独立创建并调试好依赖，再移到工程里，不能在工程里调试cli依赖


在 `ynet-cli` 的 `package.json` 中有一段 `bin` 配置
```json
"bin": {
  "ynet-dev": "bin/build.dev.js",
  "ynet-common": "bin/build.common.js",
  "ynet-bundle": "bin/build.prod.js",
  
  "ynet-zips": "bin/build.zips.js",
  "ynet-releaseConf": "bin/build.release.config.js",
  "ynet-sourceZips": "bin/build.source.zip.js"
},
```
相当于 `dev` 和 `build` 走不同的脚本，类似于
`node build/dev.js`
`node build/build.js`


关于[前端工程化 - 剖析npm的包管理机制](https://segmentfault.com/a/1190000021305625)


## dev
> `package.json` 中的参数支持 `--env=` 、 `--mock`、`--debug`、`--platform=`

* 参数(仅用于业务包) `for example: npm run ynet-bundle demo happy --env=uat --platform=weixing --debug` 
* 注意 `所有非--开头的参数视为需要构建的离线包，多个bundle空隔分开，不传时视为构建全部`

### devServer配置参数取项目目录
[配置参数默认取工程目录](./cli相关学习.md#配置参数默认取工程目录)

### 利用devserver加载vconsole
> 利用 `devserver` 加载 `vconsole` ，而不是通过运行时项目去加在 `vconsole`

加载vconsole的方式
- html模版中通过`<script src>`加载
- 入口js中通过import加载，被webpack编译为`webpack.__require`
- `devServer`启动的`node静态服务器`去发起get请求，这个get请求的资源要和`<srcipt>`的资源一样是挂在`window`下才行
- `webpack plugin` 往工程入口 `chunk` 中注入资源引用

```js
const server = new WebpackDevServer(compiler, devServer)
// server.app是node静态服务器 express
server.app.get('/vconsole.min.js', (req, res) => {
  const { env, debug } = this.command
  if(env === 'dev' || debug){
    const sourcePath = require.resolve('vconsole')
    const source = fs.readFileSync(sourcePath)
    source += ';window.VConsole = new VConsole()'
    res.send(source)
  }
})
```
`require.resolve`跟`require`的区别
都是写资源名不写路径时按node_modules的package.json中main目录猜测资源位置
- `require.resolve`,返回资源绝对路径,是webpack提供的CJS模块化拓展方法,在纯node环境并不支持
- `require`,返回资源内容, node的CJS模块化，

`require.resolve('vconsole')`,就会返回node_modules下的vconsole资源目录
这里不直接使用require是因为要用fs文件系统读取并修改文件内容,因此需要源文件字符串，而不能是模块抛出的内容？
不修改文件内容而是自己写`new Vconsole()`的写法也是可以的吧

### 利用webpack plugin注入vconsole的依赖
> TODO: 问题是怎么知道往那个chunk中注入vconsole？

单页的话只往入口注入
多页要往多入口注入
```js
const { resolve } = require('../helper')
const { OriginalSource } = require('webpack-sources')
const Chunk = require('webpack/lib/Chunk')
const fs = require('fs')

module.exports = class {
  constructor(env){
    this.env = env
  }
  apply(compiler){
    if(this.env !== 'dev') return

    // 读取并修改资源内容
    const vc = fs.readFileSync(resolve('node_modules/vconsole/dist/vconsole.min.js'), 'utf8')
    const sourceCode = vc + ';window.VConsole = new VConsole()'
    const fileName = 'vconsole.min.js'

    compiler.hooks.compilation.tap('compilation', compilation => {
    	compilation.hooks.additionalAssets.tapAsync('additionalAssets', next => {
        // additionalAssets的钩子上添加资源new chunk
        compilation.assets[fileName] = new OriginalSource(sourceCode, fileName)
        const chunk = new Chunk('vconsole.min')
        chunk.files = [fileName]
        chunk.ids = []
        compilation.chunks.push(chunk)
        next()
      })
    })
  }
}
```



## 参考材料
- [前端工程化 - 剖析npm的包管理机制](https://segmentfault.com/a/1190000021305625)


common
```js
[
  {
    optimization: {},
    resolveLoader: { modules: [Array] },
    resolve: { extensions: [Array], alias: [Object] },
    mode: 'development',
    devtool: false,
    output: {
      path: '/Users/luojinan/Desktop/code/Cheetah_Mobile/dist',
      filename: '[name].js',
      publicPath: '/',
      libraryExport: 'default',
      libraryTarget: 'umd',
      library: 'cssBundle'
    },
    module: { noParse: [Array], rules: [Array] },
    entry: {
      cssBundle: '/Users/luojinan/Desktop/code/Cheetah_Mobile/src/common/cssBundle'
    },
    plugins: [
      [LodashModuleReplacementPlugin],
      VueLoaderPlugin {},
      [HotModuleReplacementPlugin],
      [DefinePlugin],
      [DefinePlugin],
      [DefinePlugin],
      [ExtractTextPlugin],
      {}
    ]
  },
  {
    optimization: {},
    resolveLoader: { modules: [Array] },
    resolve: { extensions: [Array], alias: [Object] },
    mode: 'development',
    devtool: false,
    output: {
      path: '/Users/luojinan/Desktop/code/Cheetah_Mobile/dist',
      filename: '[name].js',
      publicPath: '/',
      libraryExport: 'default',
      libraryTarget: 'umd',
      library: 'initBundle'
    },
    module: { noParse: [Array], rules: [Array] },
    entry: {
      initBundle: '/Users/luojinan/Desktop/code/Cheetah_Mobile/src/common/initBundle'
    },
    plugins: [
      [LodashModuleReplacementPlugin],
      VueLoaderPlugin {},
      [HotModuleReplacementPlugin],
      [DefinePlugin],
      [DefinePlugin],
      [DefinePlugin],
      [ExtractTextPlugin]
    ]
  }
]
```
normal
```js
[
  {
    optimization: { splitChunks: [Object], runtimeChunk: [Object] },
    resolveLoader: { modules: [Array] },
    resolve: { extensions: [Array], alias: [Object] },
    mode: 'development',
    devtool: false,
    output: {
      path: '/Users/luojinan/Desktop/code/Cheetah_Mobile/dist',
      filename: '[name].[hash:8].js',
      publicPath: '/',
      sourceMapFilename: '[name].js.map'
    },
    externals: {
      vue: 'initBundle("vue")',
      vuex: 'initBundle("vuex")',
      fastclick: 'initBundle("fastclick")',
      'vue-init': 'initBundle("vue-init")'
    },
    module: { noParse: [Array], rules: [Array] },
    entry: {
      'demo/demo/button': '/Users/luojinan/Desktop/code/Cheetah_Mobile/src/modules/demo/demo/button/main',
      'demo/demo/viewbox': '/Users/luojinan/Desktop/code/Cheetah_Mobile/src/modules/demo/demo/viewbox/main',
      'demo/demo/countdown': '/Users/luojinan/Desktop/code/Cheetah_Mobile/src/modules/demo/demo/countdown/main',
      'demo/demo/swiperout': '/Users/luojinan/Desktop/code/Cheetah_Mobile/src/modules/demo/demo/swiperout/main',
      'demo/demo/circle': '/Users/luojinan/Desktop/code/Cheetah_Mobile/src/modules/demo/demo/circle/main',
      'demo/demo/pay': '/Users/luojinan/Desktop/code/Cheetah_Mobile/src/modules/demo/demo/pay/main',
      'demo/demo/indexbar': '/Users/luojinan/Desktop/code/Cheetah_Mobile/src/modules/demo/demo/indexbar/main'
    },
    plugins: [
      [HtmlWebpackPlugin],
      [HtmlWebpackPlugin],
      [HtmlWebpackPlugin],
      [HtmlWebpackPlugin],
      [HtmlWebpackPlugin],
      [HtmlWebpackPlugin],
      [HtmlWebpackPlugin],
      [LodashModuleReplacementPlugin],
      VueLoaderPlugin {},
      [HotModuleReplacementPlugin],
      [DefinePlugin],
      [DefinePlugin],
      {}
    ]
  }
]
```

## 读配置打包CommonModule
> 输出2个webpack进程配置
> - css
> - corejs

读取配置文件 `src/common/conf.json`
```json
{
  "cssBundle": {
    "type": "css"
  },
  "initBundle": {
    "exports":["vue", "vuex", "fastclick", "vue-init"],
    "required": true
  }
}
```

```js
this.commonMap = require(resolve(BaseModules.appConf.commonModules, 'conf'))
```
`BaseModules.appConf` 是根据项目配置和内置配置合并后的配置，关于[配置参数默认取工程目录](./cli相关学习.md#配置参数默认取工程目录)
`commonModules` 在内置配置设置为 `src/common`

因此`resolve(commonModules, 'conf'` 返回完整地址绝对路径
node环境 `require('xx.json')` 可以输出成对象

遍历对象使用key生成 bundleName 
👆 由配置文件，确定要单独打包的模块为js和css

用一份 `webpack` 的 `baseConfig` 再自定义一些内容的形式来配置 `webpack`
(更好的复用 `baseConfig` )

`baseConfig` 主要帮助根据 `dev` 和 `prod` 环境区分出基本通用的配置

```js
function getBastConfig() {
  const { env } = this.command
  const webpackEnvConf = require(`../webpackConf/webpack.${env == 'dev' ? 'dev' : 'prod'}`)
  return merge({},
  	webpackEnvConf, // devConfig ro prodConfig
  	{
      plugins: [
        new webpack.DefinePlugin(this.userEnvConf.envConfig),
      ]
    }
  )
}
```
```js
// webpack.base
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const { resolve } = require('../helper')
const AppConf = require('../lib/AppConfig')

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          chunks: 'initial',
          name: 'vendor',
          minChunks: 2
        }
      }
    },
    runtimeChunk: { name: 'manifest' }
  },
  resolveLoader: {
    modules: [resolve('node_modules'), resolve(__dirname, '../loader')]
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.scss', '.less', '.css', '.styl', '.stylus'],
    alias: {
      '@': resolve(AppConf.src),
      'vue$': 'vue/dist/vue.runtime.min.js'
    }
  },
  plugins: [
    new LodashModuleReplacementPlugin(),
    new VueLoaderPlugin()
  ]
}
```
```js
// webpack.dev
const merge = require('webpack-merge')
const webpack = require('webpack')
const { resolve } = require('../helper')
const webpackBaseConf = require('./webpack.base')
const AppConf = require('../lib/AppConfig')

module.exports = merge(webpackBaseConf,{
  mode: 'development',
  devtool: false,
  output: {
    path: resolve(AppConf.src),
    filename: '[name].[hash:8].js',
    publicPath: '/',
    sourceMapFilename: '[name].js.map'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
})
```


可以看到通用webpack配置是缺少loader的
因此外部合并配置还需要自定义
- entry
- output
- loader
- 其他视情况定义

css和js都是打成一个文件，不需要分包,所以需要覆盖掉通用配置的分包配置

```js
_createCommonWebpackConf(){
  const { env } = BaseModules.command
  const { output, alias = {} } = BaseModules.appConf
  const { plugins, ...other } = BaseModules.baseWebackConf

  const result = []
  for (key in this.commonMap) {
    const value = this.commonMap[key]

    const conf = Object.assign({},
      other,
      {
        module:{ noParse: [/\.min\.js$/], rules: loader('CommonLoaders') },
        entry: {}, optimization:{},
        plugins: [
          ...plugins,
          new webpack.DefinePlugin({
            'bundleStat': JSON.stringify(BaseModules.createBundleStat()),
            'bundleId': JSON.stringify(BaseModules.createAppList())
          }),
          new ExtractTextPlugin({
            filename: '[name].css'
          })
        ],
        output: {
          path: env === 'dev' ? resolve(output) : resolve(output, BaseModules.location.base),
          filename: '[name].js',
          publicPath: '/',
          libraryExport: 'default',
          libraryTarget: 'umd',
          library: key
        },
        resolve: {
          extensions: other.resolve.extensions,
          alias: {
            '@m': resolve(BaseModules.appConf.commonModules),
            ...alias,
            ...other.resolve.alias
          }
        }
      }
    )
    // 👆其他webpack配置公用
    // entry属性取决于配置的key
    conf.entry[this._transformFilename(value.output || key)] = resolve(BaseModules.appConf.commonModules, key)
    // value对象的type如果是css则push一个plugin
    if(value.type && value.type == 'css'){ conf.plugins.push(new replaceChunk()) } // 过滤非css的资源
    result.push(conf)
  }
}
```

CSS里的图片资源？

## normalWebpackConf
