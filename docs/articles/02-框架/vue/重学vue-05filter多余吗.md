## filter
> 想实现`filter`在vue中的效果，完全可以有各种其他的实现方式，仅仅是因为管道运算符写着好看就设计这个API吗

比如静态的`methods`,`mounted`挂载一次之后`fileter`计算后的结果不会再动态变化(动态渲染如for时会是动态的)

比如动态的`computed`,每次计算都会触发filter计算后结果return

有趣的是👇

> 在 3.x 中，过滤器已移除，且不再支持。取而代之的是，我们建议用`方法调用`或`计算属性`来替换它们。

## 管道运算
> 所以在讲`filter`之前，我们先讲讲管道运算

> 什么是管道函数？
> 
> 管道函数，其作用是将前一步的结果直接传参给下一步的函数，从而省略了中间的赋值步骤，可以大量减少内存中的对象，节省内存。

如👇 一个值经过多个函数处理的写法
- `fn3(fn2(fn1(val)))`

而用vue的管道运算符写出来就是👇
- `val | fn1 | fn2 | fn3`

当然这不是`js`的语法，也不是`ES6+`的语法

所以vue肯定是把这种语法编译成别的东西了

也就是我们的管道函数`pipeLine`
```js
function pipeLine(...fns) {
  return (val) => {
    fns.reduce( (prev, cur) => cur(prev), val);
  }
}

const pipe = pipeLine(fn1,fn2,fn3)
pipe('I am value');
```

## 组合compose
> 组合函数的概念: 简单地结合多个函数。从右向左流动，用上一个函数的输出调用每个函数
> 
> 把多个函数传递进一个组合工具中，调用组合工具来按顺序从右往左执行

```js
// 组合多个函数 compose
function compose(...fns){
  return (value) => {
    // 倒序执行
    fns.reverse().reduce((acc, fn) => fn(acc), value);
  }
}

const composefn = compose(fn1, fn2);
composefn('I am value');
```
👇 先反转再遍历执行的操作可以优化用ES6现成的 [reduceRight-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight)

```js
// 组合多个函数 compose
function compose(...fns){
  return (value) => {
    fns.reduceRight((acc, fn) => fn(acc), value);
  }
}

const composefn = compose(fn1, fn2);
composefn('I am value');
```

[MDN的示例](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight#定义可组合函数)中就有组合的介绍

**组合的实际应用**

这种顺序的执行，我们很容易联想到`webpack`从右往左的`loader`数组配置,如css的处理就需要一个资源内容经过 `scss-loader` `postcss-loader` `css-loader` `style-loader`

没错[webpack的loader](../webpack/重学webpack-03loader.md)执行就是组合函数风格

另外还有`Redux`的**中间件**也是这种风格

可以发现
- 组合和管道类似，都是串行处理数据
- 传入一个初始数据，通过不同函数处理初始数据
- 组合是从右往左, 管道是从左往右

---

思考🤔: `reduceRight` 的内部实现原理也是用反转吗？

显而易见的反转再遍历的空间复杂度是不够好的

`reduceRight` 的内部实现在MDN中也有介绍，其实就是[for循环从末尾开始执行](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight#兼容旧环境（polyfill）)而已

---

思考🤔: 为什么`webpack`和`中间件`要设计组合从右往左，而不是更符合我们思考习惯的从左往右的管道呢

TODO: 

---

## 函数柯里化
> 既然讲了`管道函数`和`组合函数`了，我们再偏个题，看看`函数柯里化`
>
> 同样的这个由专有名词的东西也是一个简单的概念
> 一个函数多次调用传入不同的参数，统一所有参数计算出结果

```js
// 柯里化函数
const curry = (fn) => {
  return function curriedFn (...args) {
    if (fn.length > args.length) {  // 未达到触发条件，继续收集参数
      return function () {
        // slice方法内部的this就会被替换成arguments，并循环遍历arguments，复制到新数组返回，这样就得到了一个复制arguments类数组的数组对象。
        return curriedFn(args.concat([].slice.call(arguments)))
      }
    }
    return fn(args)
  }
}

const multiply = (x, y, z) => x*y*z;

const curryMul = curry(multiply);
const result = curryMul(1)(2)(3); // 1*2*3 = 6
```

## vue的filter
上面我们提到了

vue的管道运算符写出来是👇
- `val | fn1 | fn2 | fn3`

当然这不是`js`的语法，也不是`ES6+`的语法

所以vue肯定是把这种语法编译成别的东西了

我们可以写一个简易vue的代码,在浏览器看看编译后的js
```js
new Vue({
  // render: h => h('h1','msg | testFilter'),
  template: '<h1>{{msg | testFilter}}</h1>',
  data: { msg: 'msg' },
  filters: {
    testFilter(val) {
      return `filter之后的${val}`
    }
  },
}).$mount('#app')
```
👆 顺便回顾一下`render`和`template`的区别

`filter`像上面那样写在`render`函数是普通的字符串，`render`不提供`filter`
要自己给实现

CDN的编译发生在浏览器运行时，我们看不了编译后的代码，要用打包工具本地编译才行`vue-loader`

我们发现vue并没用到管道函数来封装处理filter，编译后的代码是 `fn3(fn2(fn1(val)))`

仅仅是编译处理字符串用`|`分割并处理成包裹的那种调用方式
当然，因为定义的方法在组件作用域中，所以不能直接用函数名包完就完事，而应该是

`util('fn3')(util('fn2')(util('fn1')(val)))` 通过`util`函数传入过滤器函数名字符串再包裹，实现1个参数从左往右经过多个函数

TODO: 源码

## 总结
> 组合和管道类似，都是串行处理数据。
> 传入一个初始数据，通过一系列特定顺序的不同函数处理成我们希望得到的数据
> 而函数柯里化则是，一个函数，传递多次不同参数得出结果数据

## 参考资料
- [vue源码系列-filter](https://vue-js.com/learn-vue/filter/filterPrinciple.html#_1-前言)