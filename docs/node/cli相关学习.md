## node指令参数优雅设置
自己实现 `command - 命令`
```js
function command(){
  const [run, env, ...args] = JSON.parse(process.env.npm_config_argv).original
  const userArgs = {
    platform: '', modules: [], env: 'dev'
  }
  if(_.isEmpty(processArgs)){
    processArgs = userArgs
    for(let arg of _.union(process.argv.splice(2), args)){
      if(/^\-\-/.test(arg)){
        let [key, val = true] = arg.split('=')
        key = key.replace(/\-\-/, '')
        userArgs[key] = val
      }else{
        userArgs.modules.push(arg)
      }
    }
  }
  return processArgs
}
```
[commander.js](https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md)


## 配置参数默认取工程目录
> 实现类似 `webpack` 的内置默认配置的处理
> 当不配置时取内置默认，当配置时与内置默认合并处理


👇 把相对路径处理成运行指令目录下的绝对路径(不一定存在)
```js
function resolve(...arg){
  const _path = path.join(...arg) // 支持传入多个参数，按顺序拼接成一个path
  if(path.isAbsolute(_path)) {
    return _path; // 直接取拼接后的path
  }else{
    return path.join(process.cwd(), _path) // 运行指令的目录+拼接后的path
  }
}
```
- [path.isAbsolute -node官方文档](http://nodejs.cn/api/path.html#path_path_isabsolute_path)，确定 `path` 是否为绝对路径

在window下目录的可能是`\\demo\\`、`C:\\foo\\`、`C:/foo/`
因此依靠node自带的判断是否绝对路径,比起自己写判断要少很多考虑
相对路径如: `./`、`xx/`

- [process.cwd() -node官方文档](http://nodejs.cn/api/process.html#processcwd) 输出执行指令的目录

👇 实现
```js
const defaultOpt = require('./defaule.js') // 内置默认配置
try {
  // 有指定自定义配置时取指定，没指定时猜测一个目录取自定义配置
  const userConfig = require(resolve(nodeArgs.config || 'userConfig'))
  // 合并自定义配置和默认配置
  return merge(defaultOpt, userConfig)
}catch(e) {
  // 没有自定义配置时，全部取默认配置
  return defaultOpt
}
```

## 使用plugin注入资源

## 打包umd类库并使用

打包业务代码入口时，使用到的资源不在node_modules下而是全局变量的方法返回的东西
```json
"externals": {
  "vue": "initBundle(\"vue\")",
  "vuex": "initBundle(\"vuex\")",
  "fastclick": "initBundle(\"fastclick\")",
  "vue-init": "initBundle(\"vue-init\")"
},
```