
[重学webpack-02模块化原理](./重学webpack-02模块化原理.md)

### 安装并引入依赖
```bash
yarn add babylon babel-traverse babel-core babel-preset-env
```

```js
const fs = require('fs')
const path = require('path')
const babylon = require('babylon')
const traverse = require('babel-traverse').default
const { transformFromAst } = require('babel-core')
```

### babel转化代码 并获取扫描引用关系

ES6 -> ES5

```js
function readCode(filePath) {
  // 读取文件内容
  const content = fs.readFileSync(filePath, 'utf-8')
  // 生成 AST
  const ast = babylon.parse(content, {
    sourceType: 'module'
  })
  // 寻找当前文件的依赖关系
  const dependencies = []
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value)
    }
  })
  // 通过 AST 将代码转为 ES5
  const { code } = transformFromAst(ast, null, {
    presets: ['env']
  })
  return {
    filePath,
    dependencies,
    code
  }
}
```
👆 
- 传入一个文件路径参数，通过 fs 将文件中的内容读取出来
- 通过 babylon 解析代码获取 AST，目的是为了分析代码中是否还引入了别的文件
- 通过 dependencies 来存储文件中的依赖，再将 AST 转换为 ES5 代码
- 返回当前文件路径、当前文件依赖和当前文件转换后的代码

这里babel转化后的代码把ES6的ESM语法转化为CJS语法
```js
// entry.js 工具函数判断 取内容的default 还是直接取内容
var _a = require('./a.js')
var _a2 = _interopRequireDefault(_a)
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj }
}
console.log(_a2.default)

// a.js 改写ESM的import 为CJS的exports
Object.defineProperty(exports, '__esModule', {
    value: true
})
var a = 1
exports.default = a
```


### 遍历所有涉及文件，处理js和css
```js
function getDependencies(entry) {
  // 读取入口文件
  const entryObject = readCode(entry)
  const dependencies = [entryObject]
  // 遍历所有文件依赖关系
  for (const asset of dependencies) {
    // 获得文件目录
    const dirname = path.dirname(asset.filePath)
    // 遍历当前文件依赖关系
    asset.dependencies.forEach(relativePath => {
      // 获得绝对路径
      const absolutePath = path.join(dirname, relativePath)
      // CSS 文件逻辑就是将代码插入到 `style` 标签中
      if (/\.css$/.test(absolutePath)) {
        const content = fs.readFileSync(absolutePath, 'utf-8')
        const code = `
          const style = document.createElement('style')
          style.innerText = ${JSON.stringify(content).replace(/\\r\\n/g, '')}
          document.head.appendChild(style)
        `
        dependencies.push({
          filePath: absolutePath,
          relativePath,
          dependencies: [],
          code
        })
      } else {
        // JS 代码需要继续查找是否有依赖关系
        const child = readCode(absolutePath)
        child.relativePath = relativePath
        dependencies.push(child)
      }
    })
  }
  return dependencies
}
```
- 创建一个数组，存储代码中涉及到的所有文件
- 遍历这个数组，一开始这个数组中只有入口文件，在遍历的过程中，如果入口文件有依-赖其他的文件，那么就会被 push 到这个数组中
- 在遍历的过程中，我们先获得该文件对应的目录，然后遍历当前文件的依赖关系
- 在遍历当前文件依赖关系的过程中，首先生成依赖文件的绝对路径，然后判断当前文件是 CSS 文件还是 JS 文件
  - 如果是 CSS 文件的话，不能用 Babel 去编译了，只需要读取 CSS 文件中的代码，然后创建一个 style 标签，将代码插入进标签并且放入 head 中即可
  - 如果是 JS 文件的话，还需要分析 JS 文件是否还有别的依赖关系
  - 将读取文件后的对象 push 进数组中

### 注入CJS模块化工具函数 生成打包后文件

```js
function bundle(dependencies, entry) {
  let modules = ''
  // 构建函数参数，生成的结构为
  // { './entry.js': function(module, exports, require) { 代码 } }
  dependencies.forEach(dep => {
    const filePath = dep.relativePath || entry
    modules += `'${filePath}': (
      function (module, exports, require) { ${dep.code} }
    ),`
  })
  // 构建 require 函数，目的是为了获取模块暴露出来的内容
  const result = `
    (function(modules) {
      function require(id) {
        const module = { exports : {} }
        modules[id](module, module.exports, require)
        return module.exports
      }
      require('${entry}')
    })({${modules}})
  `
  // 当生成的内容写入到文件中
  fs.writeFileSync('./bundle.js', result)
}
```

- 遍历所有依赖文件，构建出一个函数参数对象
- 对象的属性就是当前文件的相对路径，属性值是一个函数，函数体是当前文件下的代码，函数接受三个参数 module、exports、 require
  - module 参数对应 CommonJS 中的 module
  - exports 参数对应 CommonJS 中的 module.export
  - require 参数对应我们自己创建的 require 函数
- 构造一个使用参数的函数了，函数做的事情很简单，就是内部创建一个 require 函数，然后调用 require(entry)，也就是 require('./entry.js')，这样就会从函数参数中找到 ./entry.js 对应的函数并执行，最后将导出的内容通过 module.export 的方式让外部获取到
- 将打包出来的内容写入到单独的文件中

打包后内容
```js
;(function(modules) {
  function require(id) {
    // 构造一个 CommonJS 导出代码
    const module = { exports: {} }
    // 去参数中获取文件对应的函数并执行
    modules[id](module, module.exports, require)
    return module.exports
  }
  require('./entry.js')
})({
  './entry.js': function(module, exports, require) {
    // 这里继续通过构造的 require 去找到 a.js 文件对应的函数
    var _a = require('./a.js')
    console.log(_a2.default)
  },
  './a.js': function(module, exports, require) {
    var a = 1
    // 将 require 函数中的变量 module 变成了这样的结构
    // module.exports = 1
    // 这样就能在外部取到导出的内容了
    exports.default = a
  }
  // 省略
})
```