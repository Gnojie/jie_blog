> `this` 是能改的，`call` 和 `apply` 都可以修改 `this`，ES5里面还新增了一个`bind`函数

`this指向`相关笔记后续补 TODO:

## call、apply、bind用法
> 建议先看
> 
> [call - mdn文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
> 
> [apply - mdn文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
> 
> [bind - mdn文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

```js
function test(year) {
  console.log(this.name, year)
}

const obj1 = { name: 'obj1' }
test.call(obj1, year)
```
👆 在`test`上并没有定义`call`，但是我们可以用`test.call`来调用，证明`call`是`原型链`上的函数

注意在**非严格模式**下，目标对象是`null`或者`undefined`，`this`将指向`window`，而**严格模式**将会是`undefined`

原型链相关笔记后续补 TODO: 

## 实现call
上面例子，我们想要让`test`的`this`指向`obj1`，只需要用`obj1.test()`的形式调用即可,前提是`obj1上要有test`

所以修改`this`指向工具方法的思路就有了

```js
function call(fn, target) {
  target.fn = fn // 把函数挂到目标对象的临时变量上
  const res = target.fn() // 通过目标对象执行函数即可让this指向目标对象
  delete target.fn  // 清除为了修改this指向而挂上对象的函数
  return res // 需要返回运行结果
}
```
执行
```js
call(test, obj1)
```


👇 如mdn文档说的，这种情况**非严格模式**会是`window`
```js
function call(fn, target) {
  if (target === null || taget === undefined) {
    target = window
  }
  target.fn = fn // 把函数挂到目标对象的临时变量上
  const res = target.fn() // 通过目标对象执行函数即可让this指向目标对象
  delete target.fn  // 清除为了修改this指向而挂上对象的函数
  return res // 需要返回运行结果
}
```
为了减少实现的复杂度，我们以下的实现都忽略`target`是`null`和`undefined`的情况


我们把参数也补上
```js
function call(fn, target, ...arg) {
  target.fn = fn // 把函数挂到目标对象的临时变量上
  const res = target.fn(arg) // 通过目标对象执行函数即可让this指向目标对象
  delete target.fn  // 清除为了修改this指向而挂上对象的函数
  return res // 需要返回运行结果
}
```

👇 挂在`Function`原型上
```js
Function.prototype.myCall = function(target, ...arg) {
  target.fn = this // 如下调用 this就是test函数
  const res = target.fn(arg) // 通过目标对象执行函数即可让this指向目标对象
  delete target.fn  // 清除为了修改this指向而挂上对象的函数
  return res // 需要返回运行结果
}

test.myCall()
```

## 实现apply
> `apply` 和 `call` 基本一样，只是让参数通过数组传入
> 
> 可能是想方便封装工具的时候，参数未知，用`call`就不太方便，可以直接传入 `arguments`
> 
> 但是参数未知的时候，我们传入解构 `arguments` 传入不就行了吗...个人觉得是相同功能的东西设计2个API是多余的

```js
function apply(fn, target, params) {
  target.fn = fn // 把函数挂到目标对象的临时变量上
  const res = target.fn(...params) // 通过目标对象执行函数即可让this指向目标对象
  delete target.fn  // 清除为了修改this指向而挂上对象的函数
  return res // 需要返回运行结果
}
```

👇 我们复用一下`call`
```js
function apply(fn, target, params) {
  return call(fn, target, ...params)
}
```

👇 挂在`Function`原型上
```js
Function.prototype.myApply = function(target, params) {
  target.fn = this // 如下调用 this就是test函数
  const res = target.fn(...params) // 通过目标对象执行函数即可让this指向目标对象
  delete target.fn  // 清除为了修改this指向而挂上对象的函数
  return res // 需要返回运行结果
}

test.myApply()
```
## 实现bind
> `bind`不会立即执行，而是返回一个`this`指向**修改后的函数**

```js
function bind(fn, target, ...arg) {
  return function(...arg2) {
    target.fn = fn // 把函数挂到目标对象的临时变量上
    const res = target.fn(...arg,...arg2) // 通过目标对象执行函数即可让this指向目标对象
    delete target.fn  // 清除为了修改this指向而挂上对象的函数
    return res // 需要返回运行结果
  }
}
```

**new的问题**
> 由于bind返回的是函数，而这个函数被怎么调用就不是我们可以控制的了
> 而且bind是修改this指向，如果返回的函数被调用的时候又是另一种this指向的诉求就gg
> 而恰恰new一个函数就是这种情况

简单来说new的this指向优先级最高
```js
function test() {
  console.log(this.name)
}

const obj1 = { name: 'obj1' }
const newTest = bind(test)
new newTest() // 不是直接执行newTest 而是new
```
👆 此时的test虽然被修改了`this`指向，但是在`new`面前，this会是new出来的对象

关于new的原理，[手写系列-new原理](./手写系列-new原理.md)

👇 我们处理一下优先级的问题
通过执行时的`this`是不是函数自身来判断是new执行还是直接执行做不同的处理
```js
function bind(fn, target, ...arg) {
  return function F(...arg2) {
    // 通过执行时this是不是函数自身来判断是new
    if(this instanceof F) {
      return new fn(...arg,...arg2)
    }
    target.fn = fn // 把函数挂到目标对象的临时变量上
    const res = target.fn(...arg,...arg2) // 通过目标对象执行函数即可让this指向目标对象
    delete target.fn  // 清除为了修改this指向而挂上对象的函数
    return res // 需要返回运行结果
  }
}
```

👇 我们复用一下call

```js
function bind(fn, target, ...arg) {
  return function(...arg2) {
    // 通过执行时this是不是函数自身来判断是new
    if(this instanceof F) {
      return new fn(...arg,...arg2)
    }
    return call(fn, target, ...arg, ...arg2)
  }
}
```

👇 挂在Function原型上
```js
Function.prototype.myBind = function(target, ...arg) {
  const fn = this // 如下调用 this就是test函数
  return function(...arg2) {
    // 通过执行时this是不是函数自身来判断是new
    if(this instanceof F) {
      return new fn(...arg,...arg2)
    }
    target.fn = fn // 把函数挂到目标对象的临时变量上
    const res = target.fn(...arg,...arg2) // 通过目标对象执行函数即可让this指向目标对象
    delete target.fn  // 清除为了修改this指向而挂上对象的函数
    return res // 需要返回运行结果
  }
}

const newtest = test.myBind(obj1)
newtest()
```

## 拓展优化
我们把函数用一个临时变量挂在目标对象上，调用后就删除

这个临时变量我们可以利用 `Symbol` 数据类型实现

好处是这个临时变量做的属性名是**唯一**的，不会被业务代码覆盖

如👇 `call`改造
```js
Function.prototype.myCall = function(target, ...arg) {
  const fnKey = Symbol('fn') // 用Symbol做临时变量属性名
  target[fnKey] = this // 如下调用 this就是test函数
  const res = target[fnKey](arg) // 通过目标对象执行函数即可让this指向目标对象
  delete target[fnKey]  // 清除为了修改this指向而挂上对象的函数
  return res // 需要返回运行结果
}
```

关于 [Symbol - mdn文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol) 数据类型，后面补充


## 代码地址
[代码codepen](https://codepen.io/collection/kNgywB)

TODO: 实际上是复用apply实现，而不是call的吗？有什么区别？

## 参考资料
- [this指向](http://dennisgo.cn/Articles/JavaScript/this.html)
- [call - mdn文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
- [apply - mdn文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
- [bind - mdn文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
- [Symbol - mdn文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)