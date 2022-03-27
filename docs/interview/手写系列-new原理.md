[new - mdn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new)

从微观的角度看对象的生成
```js
// 这个字面量内部也是使用了 new Object()
let a = { b: 1 }
```

```js
// function 就是个语法糖
// 内部等同于 new Function()
function Foo() {}
```
对于对象来说，其实都是通过 `new` 产生的
`function Foo() ==> new Function()`
`let a = { b : 1 } ==> new Object()` 

当然创建一个对象，更推荐使用字面量的方式创建对象,性能上
使用 `new Object()` 的方式创建对象需要通过作用域链一层层找到 `Object`，但是使用字面量的方式就没这个问题

👆 我们知道了除了我们自己写`类或者构造函数`需要 `new`，其实内部的很多东西都是在 `new`

## `new` 一个函数发生了什么
> 输入函数 输出对象

[new - mdn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new) 文档中指出在调用 `new` 的过程中会发生四件事情：
1. 创建一个空的对象（即 `{}` ）
2. 为创建的对象添加属性 `__proto__` ，将该属性链接至构造函数的原型对象 
3. 将创建的对象作为 `this` 的上下文 
4. 如果该函数没有返回对象，则返回`this`

## 实现new
```js
function myNew(fn, ...arg) {
  let obj = {} // 1. 创建一个空对象
  obj.__proto__ = fn.prototype // 2. 设置空对象的原型

  let res = fn.call(obj, ...arg) // 3. 绑定this并执行构造函数
  return result instanceof Object ? result : obj // 4. 构造函数不返回对象则返回创建的新对象
}

function test(name) {
  this.name = name
  console.log('test')
}
myNew(test, 'name')
```
## 构造函数
> 构造函数会在`class类`时详细分析 TODO: 
> 
> 这里还是提一下，构造函数主要帮助我们把重复的逻辑集成起来，也就是设计模式中的工厂模式
> 
> 通过在构造函数的原型链上定义公用方法，实现每个new出来的对象的原型链上都有这些公用方法

我们常常看到有一些构造函数**同时**支持new和直接调用
```js
const obj1 = new Object()
const obj2 = Object()
```
👆 要同时支持并且都能正常使用是需要**构造函数内部自己区分处理**的
```js
function Object() {
  if (!(this instanceof Object)) {
    // 直接调用构造函数时
    return new Object();
  }
  // 通过new 调用构造函数时
  // do somting
}
```
在 [手写bind](./手写系列-callbind.md#实现bind) 的时候我们用过这种写法

---
思考🤔: [new Vue()干了什么](../vue/重学vue-01模板语法.md#Vue构造函数)

---

## 参考资料
- [面试官问：能否模拟实现JS的new操作符](https://juejin.cn/post/6844903704663949325)