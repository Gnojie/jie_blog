> 没有ES6的Class前，我们如何写一个类？


### Class 的本质
JS语言并不存在类， Class只是ES6提供的语法糖，本质是一个函数

```js
class Person {}
Person instanceof Function // true
```
用 [instanceof-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/instanceof) 判断class声明的[变量是什么类型](../interview/前端面试之道-JS数据类型.md#类型判断)

👆 证明 `Class` 本质是函数

