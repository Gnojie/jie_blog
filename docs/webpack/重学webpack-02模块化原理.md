> `webpack` 是一个用于现代 `JavaScript` 应用程序的 `静态模块打包工具`--[webpack官方文档](https://webpack.docschina.org/concepts/)

## 前端js的模块化
先抛开打包工具的模块化，我们看看纯js的模块，`<script src="">、CMD、ESM、UMD`

[前端模块化](../js/前端模块化.md)
## webpack的模块化
webpack要做的是识别开发过程的nodejs模块化转为浏览器的模块化方式

webpack选择让浏览器支持模块化的方式是自己实现类似nodejs的CJS

### 搭一个简易webpack示例
安装`yarn add -D webpack webpack-cli`
```js
// webpack.config.js
module.exports = {
  entry: './index.js',
  mode: 'development'
}

// index.js
const a = require('./a.js')
const b = require('./b.js')
console.log(a,b)

// a.js
module.exports = {
  a: 'a'
}

// b.js
module.exports = {
  b: 'b'
}
```
运行`npx webpack`
只生成了`dist/main.js`一个文件
### 分析打包后产物
👇 我们把注释删掉看看
```js
(() => {
  var __webpack_modules__ = ({
    "./a.js": ((module) => {
      eval("module.exports = {\n  a: 'a'\n}\n\n//# sourceURL=webpack://origin-webpack/./a.js?");
    }),
    "./b.js": ((module) => {
      eval("module.exports = {\n  b: 'b'\n}\n\n//# sourceURL=webpack://origin-webpack/./b.js?");
    }),
    "./index.js": ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
      eval("const a = __webpack_require__(/*! ./a.js */ \"./a.js\")\nconst b = __webpack_require__(/*! ./b.js */ \"./b.js\")\nconsole.log(a,b)\n\n//# sourceURL=webpack://origin-webpack/./index.js?");
    })
	});

	var __webpack_module_cache__ = {};
	function __webpack_require__(moduleId) {
		var cachedModule = __webpack_module_cache__[moduleId];
		if (cachedModule !== undefined) {
			return cachedModule.exports;
		}
		var module = __webpack_module_cache__[moduleId] = {
			exports: {}
		};
		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
		return module.exports;
	}
  
	var __webpack_exports__ = __webpack_require__("./index.js");
})()
```
👇 我们再精简一下变量名
```js
(() => {
  const _modules = {
    './a.js': ((module) => {
      eval("module.exports = {a:'a'}");
    }),
    './b.js': ((module) => {
      eval("module.exports = {b:'b'}");
    }),
    './index.js': ((__unused_webpack_module, __unused_webpack_exports, _require) => {
      eval(`
        const a = _require("./a.js")
        const b = _require("./b.js")
        console.log(a,b)
      `);
    })
	};

  const  _cache = {};
  function _require(moduleName) {
    const cachedModule = _cache[moduleName];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    const module = _cache[moduleName] = {
      exports: {}
    };
    _modules[moduleName](module, module.exports, _require);
    return module.exports;
  }
  
  _require('./index.js');
})()
```
👆 把这段代码丢到浏览器就可以直接运行了
## webpack.require
> 不熟悉nodejs的CommonJs模块化的还是先熟悉一下，因为webpack的模块化就是一种CJS

和nodejs一样，webpack会把每个模块js包装一层注入模块化工具方法

```js
function wrap(fileContent) {
  // 拼接函数进行包装 注意要包一层()才不会被eval立即执行,而是返回一个字符串()内的函数
  const newfileContent = `(function (myrequire){
    ${fileContent}
  })`
  return eval(newfileContent)
}
```

👇 我们再去掉webpack的cache部分(在 [从0实现CommonJs](../js/前端模块化.html#从0实现简易commonjs) 里解释过cache用来解决重复引入的问题)

```js
const _modules = { a: ()=>{} }
function _require(moduleName) {
  const  module = {
    exports: {}
  };
  _modules[moduleName](module, module.exports, _require);
  return module.exports;
}
```
👆 和我们手写nodejs的CJS一模一样

---
当webpack配置 `mode:none` 的时候不会用eval包,eval会导致调试打包后产物无法断点调试模块内容

TODO:  `mode:none` 的时候为什么用数组和序列 而不是文件名（收集依赖关系更快？

---
## webpack4的打包产物分析
> 可能有人发现了，怎么跟网上很多的webpack打包产物不太一样，这是因为我们上面的是webpack5的打包产物，而以前webpack4是另一种结构

```js
((modules)=>{
  function _require(modelId){}
  require(0)
})(
  [
    function(){eval()},
    ...
  ]
)
```

## 手写模块化打包工具
> 参考 [simple_webpack --github](https://github.com/dykily/simple_webpack/blob/master/bundler.js)

不考虑代码转译，我们尝试实现一个**只具备实现模块化的打包工具**
和`从0实现nodejs的CJS`不一样，我们还需要解决的一个难点是**深度识别**文件内容中的`require`和`export`

- 收集：收集js的依赖关系成一个数组/对象(使用广度优先递归-队列)
- 注入：遍历模块依赖关系数组,用立即执行js注入require等参数实现浏览器支持CMD(参考手写CommonJs)
- 输出：立即执行函数是用字符串写成的，最终合并写入一个js文件中

> 不用AST，用正则处理文件内容来注入require并且整合成一个js也是可以的
> 正则也不失为一种收集依赖的办法
> 但是正则的效率和局限性也摆在那里，我们用更成熟的AST来收集吧

webpack的内部用的是改造后的 [acorn-npm](https://www.npmjs.com/package/acorn) / [acorn-github](https://github.com/acornjs/acorn) 来生成AST

`babel`也是基于`acorn`生成AST的

---
思考🤔: `acorn`和`babel-parser`都是js的解析器，有什么区别吗？

> `@babel/parser`（之前就是`babylon`）是从`acorn fork` 出来的，只是基本都被重写了，但是有些`acorn`的算法仍热被沿用下来了。

- @babel/parser不支持第三方的插件。
- acorn只支持第四阶段的提案(基本等于写入标准了，只是时间的问题 见此)。
- AST的格式不同，不过可以启动@babel/parser的estree插件来和acorn的AST格式匹配

---

因为 `webpack` 并没有把 `acorn` 部分的代码发布成包而是[内部的工具方法javascript/JavascriptParser.js](https://github.com/webpack/webpack/blob/a07a1269f0a0b23d40de6c9565eeaf962fbc8904/lib/javascript/JavascriptParser.js)

👇 因此我们选择用 `babel` 来生成`AST`
```js
// getAst.js
const fs = require('fs')
const Parser = require('@babel/parser')

function getAst(path) {
  const content = fs.readFileSync(path, 'utf-8')
  // 将文件内容转为AST抽象语法树
  return Parser.parse(content, {
    sourceType: 'module'
  })
}

module.exports = getAst
```
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220320204335.png)
👇 打印一个AST节点Node的内容子节点，我们有办法通过节点type识别出`import`，却没办法识别 `require`
- ImportDeclaration: 引入声明
- ExpressionStatement: 表达式语句

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220320210448.png)

我们希望识别出AST中的引入代码，把被引入资源路径收集到一个集合中
等待我们后续的处理

---
思考🤔: 手写nodejs的CJS为什么不需要识别require？
- 确实，我们要实现业务代码中写require，运行时require存在的形式，只要包装注入即可。在这里我们也可以不识别require直接往入口文件注入require，但是没办法找到深度的资源引用
- 在nodejs中的做法是包装注入后立即执行，因此可以自然形成递归注入
- 但是在打包工具里，我们要输出一个所有引入资源的模块集合，而不是要立即执行业务代码，因此要通过AST来识别所有引入资源整合到一个文件内容中输出

---

怎么让AST识别`require`,我们先放一下。。。(🥬🐶)

我们业务代码改为用import，识别出来后转成`require`，再注入我们的`require`。。。

👇 用babel识别业务代码中的import
```js
const traverse = require("@babel/traverse").default;
function findRequire(ast) {
  const dependencies = {} // key和value都用路径
  //遍历当前ast（抽象语法树）
  traverse(ast, {
    //找到有 import语法 的对应节点
    ImportDeclaration: ({ node }) => {
      //如果当前js文件 有一句 import message from './message.js'， 
      // node.source.value的值就是'./message.js'
      dependencies[node.source.value] = node.source.value
    },
  });
  return dependencies
}

module.exports = findRequire
```
👇 用babel把业务代码的import转为require输出
```js
// 用babel 把业务代码的import转为require输出
const { transformFromAst } = require("@babel/core");

const { code } = transformFromAst(ast, null, {
  presets: ["@babel/preset-env"]
})
```

到这里我们只是通过babel把入口文件转成AST来收集入口文件的依赖而已

我们还要递归入口文件的子依赖转成AST来收集其依赖

这里我们选择广度优先的递归(队列)

如👇 `deepRequire()`
```js
class Compiler {
  constructor(options) {
    const { entry, output } = options // webpack 配置
    this.entry = entry // 入口
    this.output = output // 出口
    this.modules = [] // 模块
  }
  parse(path) {
    const ast = getAst(path) // 入口文件的ast
    const dependencies = findRequire(ast) // 收集：遍历ast来识别require等引入资源(不影响原代码)
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"]
    })
    return { code, dependencies, fileName:path }
  }
  deepRequire() {
    for (const module of this.modules) {
      const dirname = path.dirname(module.fileName);
      for (const key in module.dependencies) {
        const absolutePath = path.join(dirname, key);
        //获得子依赖（子模块）的依赖项、代码、模块id，文件名
        const childMoule = this.parse(absolutePath);
        //将子依赖也加入队列中，广度遍历
        this.modules.push(childMoule);
      }
    }
  }
  // 构建启动
  run() {
    const res = this.parse(this.entry)
    this.modules.push(res) // 入口文件模块信息
    deepRequire()
  }
}
```
这样每个父模块的信息中就带着子模块的路径
而子模块对象则拍扁在了模块列表中

最后我们遍历所有模块注入require(包装一层),并整合起来
```js
// setRequire.js
// 包装函数注入require
function setRequire(module) {
  return `
    '${module.fileName}': function (require, module, exports){
      ${module.code}
    },
  `
}
module.exports = setRequire

// index.js
function wrap() {
  let modulesString = '' // 作为参数的模块列表-因为是写入文件的内容，因此是个字符串
  for (const module of this.modules) {
    modulesString += setRequire(module)// 注入：给所有模块注入require等参数实现浏览器支持CMD
  }
  return modulesString
}
```


包装成立即执行函数
```js
// generate.js
// 合并处理后的模块写入一个输出文件中
function generate(modules,entryPath) {
  return `
(function(modules){
  //创建require函数， 它接受一个模块ID（这个模块id是数字0，1，2） ，它会在我们上面定义 modules 中找到对应是模块.
  function require(fileName){
    const module = modules[fileName];
    const module = {exports:{}};
    //执行每个模块的代码。
    fn(require,module,module.exports);
    return module.exports;
  }
  //执行入口文件，
  require('${entryPath}');
})({${modules}})
  `
}

module.exports = generate
```

```js
// outputFile.js
const fs = require('fs')

function outputFile(fileContent) {
  // console.log(fileContent)
  fs.writeFileSync("./main.js", fileContent);
}

module.exports = outputFile
```
👇 最终的class类
```js
const path = require('path')
const {transformFromAst} = require("@babel/core");
const getAst = require('./getAst.js')
const findRequire = require('./findRequire.js')
const outputFile = require('./outputFile.js')
const setRequire = require('./setRequire.js')
const generate = require('./generate')

class Compiler {
  constructor(options) {
    const { entry, output } = options // webpack 配置
    this.entry = entry // 入口
    this.output = output // 出口
    this.modules = [] // 模块
  }
  parse(path) {
    const ast = getAst(path) // 入口文件的ast
    const dependencies = findRequire(ast) // 收集：遍历ast来识别require等引入资源(不影响原代码)
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"]
    })
    return {code,dependencies,fileName:path}
  }
  deepRequire() {
    for (const module of this.modules) {
      const dirname = path.dirname(module.fileName);
      for (const key in module.dependencies) {
        const absolutePath = path.join(dirname, key);
        //获得子依赖（子模块）的依赖项、代码、模块id，文件名
        const childMoule = this.parse(absolutePath);
        //将子依赖也加入队列中，广度遍历
        this.modules.push(childMoule);
      }
    }
  }
  wrap() {
    let modulesString = '' // 作为参数的模块列表-因为是写入文件的内容，因此是个字符串
    for (const module of this.modules) {
      modulesString += setRequire(module)// 注入：给所有模块注入require等参数实现浏览器支持CMD
    }
    return modulesString
  }
  // 构建启动
  run() {
    const res = this.parse(this.entry) // 入口依赖分析
    this.modules.push(res)
    this.deepRequire() // 入口依赖递归分析
    
    const moduleListString = this.wrap() // 包装所有依赖模块
    const fileRes = generate(moduleListString,this.entry)// 合并写入一个输出文件中
    outputFile(fileRes)
  }
}

module.exports = function (options) {
  new Compiler(options).run()
}
```
我们运行`node build/index.js` 后生成出了整合后的js


我们直接运行生成出来的js文件，发现报错找不到资源
这是因为我们modules的key值是转化后的绝对路径，而业务代码写的是相对路径
因此用相对路径作为key去匹配模块，将找不到资源
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220320234256.png)
你可能会说，那我们就用业务代码的相对路径做key存成modules不就行了吗？

相对路径是会冲突的，我们只有用绝对路径做key才能是准确的资源标识


- webpack5 会把业务代码的相对路径改写为绝对路径
- TODO: webpack4 好像是用自增ID来匹配资源而不是资源路径

问题出在唯一标识不匹配上

解决办法1

我们现在的模块列表是
`'path':function(){}`
我们改为
`'path': {code:function(){}, dependencies:{}}`

如👇
```js
// 深度扫描识别require等引入资源
function findRequire(ast, parentPath) {
  const dirname = path.dirname(parentPath);
  const dependencies = {}
  //遍历当前ast（抽象语法树）
  traverse(ast, {
    //找到有 import语法 的对应节点
    ImportDeclaration: ({ node }) => {
      //例如 如果当前js文件 有一句 import a from './a.js'， 
      dependencies[node.source.value] = path.join(dirname, node.source.value)
    },
  });
  return dependencies
}
```


在注入的require中用业务代码的相对路径去匹配 `dependencies` 出真实绝对路径

👇 这是一种运行时的思路
```js
// 合并处理后的模块写入一个输出文件中
function generate(modules,entryPath) {
  return `
(function(modules){
  function require(fileName) {
    const { dependencies,code } =  modules[fileName]
    // 要注入的真正require，包装了一层带上缓存的(闭包)
    function realRequire(relativePath) {
      return require(dependencies[relativePath])
    }
    const module = {exports:{}};
    //执行每个模块的代码。
    code(realRequire,module,module.exports);
    return module.exports;
  }
  //执行入口文件，
  require('${entryPath}');
})({${modules}})
  `
}

module.exports = generate
```

解决办法2

想在不动业务代码的前提下匹配上，通过一层枚举来中转匹配
这是编译时的思路
TODO: 

---

思考🤔: `webpack` 只实现让浏览器支持CJS的模块化打包而已,把很多功能都通过 `loader` 和 `plugin`开放出去了，为什么`纯webpack`还会这么重呢(因为工程庞大,依赖文件多？)

源码复杂的原因是配置多，并且配置支持的类型多，这样处理1个配置项写起来就很复杂
另外 `webpack` 还有很多很重要的功能是内置的，如 `热更新HMR、sourceMap、代码分割`等

---

## 总结

`webpack` 实现浏览器识别业务代码中的模块化，是通过合并到一个文件中，并通过注入 `require` 的CJS实现模块化

难点在于👇 
- 把文件内容转化为`AST树`,收集模块化语法,也就是开发阶段使用的`nodejs`的`CMD/AMD语法`
- 根据收集到的`AST树`,通过包装一层`注入方法`的形式，实现模块化(跟`nodejs`一致)
- 把收集到的依赖列表，整合到一起，通过`运行时方法`运行指定资源

我们还提到了一点运行时和编译时的概念，我们后续的分析也希望带着这是在运行时做的还是在编译时做的，各有什么优缺点的问题来学习