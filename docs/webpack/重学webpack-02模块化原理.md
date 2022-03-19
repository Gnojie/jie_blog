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

`mode:none` 的时候不用eval 编译eval会导致调试打包后产物无法断点调试模块内容

TODO: 为什么用数组和序列 而不是文件名（收集依赖关系更快？


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

---

思考🤔: webpack只实现让浏览器支持CJS的模块化打包而已,把很多功能都通过loader和plugin开放出去了，为什么纯webpack还会这么重呢(因为工程庞大,依赖文件多？)

---

- 收集js的依赖关系成一个数组对象(不使用递归而是队列)
- 遍历模块依赖关系数组,用立即执行js注入require等参数实现浏览器支持CMD(参考手写CommonJs)
- 立即执行函数是用字符串写成的，最终写入一个js文件中

## 运行webpack入口
可以通过安装`webpack-cli`依赖, 即可在终端运行 webpack xxx 启动
也可以不安装cli,通过nodejs 运行wenpack构造函数

TODO: 安装webpack依赖不会在node_modules中生成.bin支持指令吗?`webpack-cli`依赖的本质是.bin文件吗

这里通过nodejs 运行webpack构造函数形式学习webpack原理

```js
const webpack = require('webpack')
webpack({
  // config entry,output...
})
```


- 把文件内容转化为AST树,方便收集模块化语法,也就是开发阶段使用的nodejs的CMD/AMD语法
- 根据收集到的AST树,转译成自己实现的模块化方法,且不马上注入该方法
- 通过包装一层注入方法的形式，实现模块化(跟nodejs一致)

难点：
- AST收集和转译(演示就直接用babel提供的库来实现)
- 注入的自己实现的模块化方法需要支持在浏览器运行


[做了一夜动画，让大家十分钟搞懂Webpack](https://juejin.cn/post/6961961165656326152)
[webpack打包原理 ? 看完这篇你就懂了 !](https://juejin.cn/post/6844904038543130637)

[[万字总结] 一文吃透 Webpack 核心原理](https://zhuanlan.zhihu.com/p/363928061)

[深入 Vue Loader 原理](https://juejin.cn/post/7039918272111869988)
[Webpack 案例 —— vue-loader 原理分析](https://juejin.cn/post/6937125495439900685)