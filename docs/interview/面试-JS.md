## 判断 Array


## DOMContentLoaded 事件和 Load 事件的区别


## 模块循环引用


## 浏览器如何判断是否支持 webp 格式图片


## class 相对于 es5 的继承有什么区别


## 500 张图片，如何实现预加载优化


## cors 简单请求和复杂请求的区别


## 类数组有哪些，如何转换

## For of 和 for in 、for await of 的区别

TODO:

## 23.script 标签中 defer 和 async 的区别？
> html加载js，有两个步骤:1.下载js 2.加载js
> `异步script`就控制`下载/加载时机`的

- `script` ：会阻碍 HTML 解析，只有下载好并执行完脚本才会继续解析 HTML。
- `async script` ：解析 HTML 过程中进行脚本的异步下载，下载成功立马执行，有可能会阻断 HTML 的解析。
- `defer script` ：完全不会阻碍 HTML 的解析，解析完成之后再按照顺序执行脚本


## new操作符做了什么
- 创建一个空对象
- 将对象的原型指向构造函数
- 修改构造函数的this指向，将空对象作为构造函数的上下文
- 根据构造函数return返回值是基础类型/引用类型做创建出来的对象值的处理

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220221205405.png)


## Promise then 第二个参数和catch的区别是什么?

## Promise finally 怎么实现的

## koa洋葱模型 - 中间件的异常处理是怎么做的？

## 在没有async await 的时候, koa是怎么实现的洋葱模型?

## 你觉得js里this的设计怎么样? 有没有什么缺点啥的

## 装饰器
