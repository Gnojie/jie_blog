TODO: 过一遍官方文档,包括所有插件转译后代码是如何替代高级语法的
看看github中的preset集成了什么

转译过程：ES6 -> AST -> ES5
[toc]

- babylon解析 `ES6` 成 `AST`
- babel的插件`plugin` 遍历转译 `AST` 成`ES5`的`AST`
- babel的`generator`生成器 把`AST`转成`ES5`

因为babel的设计原则是原子化的，所以我们用的时候会发现写好几个babel的东西，实际上还可以写得更多...



要用babel实现`ES6的AST`转`ES5的AST`转译，我们需要很多babel的插件(原子化)

- 转译语法类型(let、class、箭头函数等)的plugin
- 转译api类型(promise)的plugin

这两类的plugin都很零散，babel提供了plugin的集合给我们使用，而我们的工程里面经常配置的babel相关的配置就是配置集合的参数

语法类型的集合是预设preset
api类型的集合是垫片polyfill
(渐渐抛弃polyfill，都由preset配置了)

@babel/cli 是为了在node环境运行转译的启动工具
@babel/core 是所有转译的核心代码

@babel/preset-env 预设插件组合 包含generrx-time？
⬆️已经包含了polyfill的功能并且不需要手动安装polyfill而是内部集成了？


### 预设preset
> 预设是一组`babel`插件的集合，用大白话讲就是插件包

假如我们引用了一组预设preset，又引用了一个plugin
我们已经知道预设preset就是一组plugin，如果再引入进来的plugin处理的对象和preset处理的对象相同
那么处理顺序是怎样的？谁会覆盖谁？
- plugin比preset先执行
- plugin之间的顺序是:从前往后
- preset之间的顺序是:从后往前

#### 配置：browserslistrc
在工程包里，打包工具有很多`webpack-loader`或者`webpack-plugin`依赖到一个配置`browserslistrc`的配置，可以是单独的文件也可以是`package.json`里的配置
`Autoprefixer、postcss`这些loader就用到了这个配置判断编译css是否要加前缀
而babel的presetenv也用到工程下的这个配置，当然也可以在babel中配置覆盖掉工程的配置
很多脚手架默认会配置成`>1% not ie<=8`
可以配置成谷歌具体的版本 `chrome 60` 这样就不会去编译箭头函数等语法，减少打包体积

⬇️并且可以给`useBuiltins`配置自动按浏览器版本引入转译api用的plugin组合
#### 配置：useBuiltins
- entry会按需(根据浏览器配置)引入polyfill?需要配合import和webpack的treeshaking
- usage不需要手动引入polyfill，会自动根据代码中用到的高级api按需(根据浏览器配置和代码实际使用)引入`corejs`中的工具方法

#### 配置：corejs 2/3
默认2
? 配了2，工程里只有3怎么办？这个配置没必要吧。工程的corejs是几就是几吧，又不会同时存在

TODO: ?注意：这些配置，可以让转译过程按浏览器和配置需要按需转译，但是`polyfill`或者`corejs`和`generator-runtime`还是要手动引入打包工具中的

babel可以设置把esm编译成其他模块化
但是一般不建议，保留esm可以给其他阶段做treeshaking
不设置会默认转成require，Commonjs的模块化规范，那么以前webpack是对require做treeshaking的吗？

#### plugin-transform-runtime
presetenv编译语法时可能会往文件注入辅助函数，如class。这样会导致大量重复代码，@babel/runtime提前把所有辅助函数打包起来了，用到的辅助函数去引用这个包相应的辅助函数即可。

plugin-transform-runtime就是识别到需要辅助函数时去引用@babel/runtime里的辅助函数，让persetenv不要直接注入函数。(还是要手动安装@babel/runtime，但是不用配置它，配置了transform-runtime会自动找它)

因此需留意`transform-runtime`和`runtime`的区别
babel-plugin-transform-runtime插件依赖babel-runtime，babel-runtime是真正提供runtime环境的包；也就是说transform-runtime插件是把js代码中使用到的高级语法转译低级语法的辅助函数转换成对runtime实现包的引用，举个例子如下：
```js
// 输入的ES6代码
var sym = Symbol();

// 通过transform-runtime转换后的ES5+runtime代码 
var _symbol = require("babel-runtime/core-js/symbol");
var sym = (0, _symbol.default)();
```
从上面这个例子可见，原本代码中使用的ES6新原生对象Symbol被transform-runtimec插件转换成了babel-runtime的实现，既保持了Symbol的功能，同时又没有像polyfill那样污染全局环境（因为最终生成的代码中，并没有对Symbol的引用）
另外，这里我们也可以隐约发现，babel-runtime其实也不是真正的实现代码所在，真正的代码实现是在core-js中

transform-runtime插件的功能
1. 把代码中的使用到的ES6引入的新原生对象和静态方法用babel-runtime/core-js导出的对象和方法替代
2. 当使用generators或async函数时，用babel-runtime/regenerator导出的函数取代（类似polyfill分成regenerator和core-js两个部分）
3. 把Babel生成的辅助函数改为用babel-runtime/helpers导出的函数来替代（babel默认会在每个文件顶部放置所需要的辅助函数，如果文件多的话，这些辅助函数就在每个文件中都重复了，通过引用babel-runtime/helpers就可以统一起来，减少代码体积）

上述三点就是transform-runtime插件所做的事情，由此也可见，babel-runtime就是一个提供了regenerator、core-js和helpers的运行时库。

此外，transform-runtime在.babelrc里配置的时候，还可以设置helpers、polyfill、regenerator这三个开关，以自行决定runtime是否要引入对应的功能。
最后补充一点：由于runtime不会污染全局空间，所以通过直接引入runtime里的方法来使用实例方法是无法工作的（因为这必须在原型链上添加这个方法，这是和polyfill最大的不同）

为什么不让presetenv注入到业务代码后，通过webpack打包时发现是重复代码，抽出成包，就可以节省一个babel的plugin？

这里对webpack的原理不清楚，以为webpack是通过扫描代码中的重复代码进行分包的。而实际上每个文件声明相同内容的函数或者引用类型变量，都是新的堆内存，没人可以说他们是重复。webpack也不能，webpack的分包是基于模块化的esm或者commonjs规范，所以要不同文件复用代码，就需要模块化打包，所以写法是通过一个完整包，再去按需引入内容，也就是手动分包。webpack的作用是模块化的本质是合并引入的文件内容，所以不同文件引入重复的文件会合并进去，而webpack就能把要合并多次的文件抽离到公共包，也是去重



### 垫片polyfill
> polyfill并不是babel特属的东西，而是指:为环境提供不支持的特性的一类文件或库。也就是polyfill是一种功能

`babel`的`polyfill`也和其他`polyfill`一样，支持直接引入一个js资源或者引用npm依赖

引入js资源形式没什么好讲的，主要看npm依赖形式。


#### @babel/polyfill
> `@babel/polyfill`的npm依赖，本质只是组合一下`corejs`和`regenerator-runtime`而已

babel7之后，官方建议不要使用`@babel/polyfill`，而是自己手动组合`corejs3`和`regenerator-runtime`
原因是`@babel/polyfill`使用的是`corejs2`，且表明不会更新成`corejs3`
所以`@babel/polyfill`一定会渐渐跟不上新的api

对于已经用着的。`@babel/polyfill`非常大，如果可以保证用户浏览器版本高足够支持大部分es6语法，就没必要引用整个使用`@babel/polyfill`。而是通过plugin和preset手动组合需要plugin

### corejs
core-js包才上述的polyfill、runtime的核心，因为polyfill和runtime其实都只是对core-js和regenerator的再封装，方便使用而已。
但是polyfill和runtime都是整体引入的，不能做细粒度的调整，如果我们的代码只是用到了小部分ES6而导致需要使用polyfill和runtime的话，会造成代码体积不必要的增大（runtime的影响较小）。所以，按需引入的需求就自然而然产生了，这个时候就得依靠core-js来实现了。

通过引入方式来实现不同的效果
⬇️都是按需引入，只引入需要的转译方法xxx
* 默认方式：require('core-js/xxx')
这种方式跟polyfill一样，是修改原型方法的
* 库的形式： var core = require('core-js/library/xxx')
这种方式只能用导出的方法来使用高级语法，而不能直接用原型方法
