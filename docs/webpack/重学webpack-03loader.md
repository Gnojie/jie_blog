## 分析css-loader
在webpack中配置使用loader，webpack编译过程就会把资源内容传递进loader，loader返回出js

没错所有资源经过loader都是返回js，如css、图片等

css会被css-loader处理好css中的模块化,如`背景图`和`@import css`的操作
返回一段没被使用的js
```js
// webpack.config.js
module.exports = {
  entry: './index.css',
  mode: 'development',
  
  module: {
    rules: [
      { test: /\.css$/, use: 'css-loader' },
    ],
  },
};

// index.css
p { color:red }
```
👇 输出文件依然是`main.js`
```js
(() => {
  const _modules = {
    "./index.css": (module, __webpack_exports__, _require) => {
      eval(""},
    "./node_modules/css-loader/dist/runtime/api.js": (module) => {
      eval(""},
    },
    "./node_modules/css-loader/dist/runtime/noSourceMaps.js": (module) => {
      eval(""},
    }
  };
  const _cache = {};
  function _require(moduleName) {
  const cachedModule = _cache[moduleName];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  const module = _cache[moduleName] = {
    id: moduleName,
    exports: {}
  };
    _modules[moduleName](module, module.exports, _require);
    return module.exports;
  }
  (() => {
    _require.n = (module) => {};
	})();
  (() => {
    _require.d = (exports, definition) => {};
  })();
  (() => {
    _require.o = (obj, prop) => {}
  })();
  (() => {
    _require.r = (exports) => {};
  })();
  _require("./index.css");
})()
```
我们把`_require`多出来的函数删除不看，这些函数会在`eval`内部使用
我们把注意力放在`"./index.css":`，可以看到css的内容字符串被存到了一个变量里
所以经过loader的资源都会以js的形式被引用,而不是其他可用的资源(`css`)

同理图片资源等，也是会变为一个普通的引用路径的js代码

## 实现一个markdown的loader
loader的编写也十分简单

```js
// mdLoader.js
module.exports = (source)=>{
  // 1. 处理md文件内容成html字符串
  return // 2. 返回结果要是合法js
}
```

## webpack怎么加载使用loader
> 可以看出`loader`就是一个辅助函数
> 加载使用`loader`，就是普通的js程序调用辅助函数
> 因此我们抛开`webpack`，自己写一个**编译脚本**


```js
// config.js
const mdLoader = require('./mdLoder.js')
module.exports = {
  entry: './index.md'
  module: {
    rules: [
      { test: /\.md$/, use: mdLoader },
    ],
  },
}

// build.js
const { entry, module:{rules} } = require('./config.js')

for(let item of rules) {
  if(item.test.test(entry)) {
    const source = fs.readerxx(entry)
    const res = item.use(source)
    console.log(res)
    // 输出loader后文件
  }
}
```

[深入 Vue Loader 原理](https://juejin.cn/post/7039918272111869988)
[Webpack 案例 —— vue-loader 原理分析](https://juejin.cn/post/6937125495439900685)