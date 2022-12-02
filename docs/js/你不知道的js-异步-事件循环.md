
### JS单线程处理异步任务

> 进程和线程的区别？为什么JS设计成单线程

两个名词都是 CPU 工作时间片的一个描述

- **进程**: 描述了 CPU 在运行指令及加载和保存上下文所需的时间，放在应用上来说就代表了一个程序
- **线程**: 是进程中的更小单位，描述了执行一段指令所需的时间

把这些概念拿到浏览器中来说
- 打开一个 Tab 页时，其实就是创建了一个进程
- 一个进程中可以有多个线程
  - 渲染线程
  - JS 引擎线程
  - HTTP 请求线程(发起一个请求时，其实就是创建了一个线程，当请求结束后，该线程可能就会被销毁)
  - ...

在 JS 运行的时候可能会阻止 UI 渲染
这说明了 `渲染线程` `JS 引擎线程` 两个线程是互斥的

因为 JS 可以修改 DOM，如果不互斥，在 JS 执行的时候 UI 线程还在工作，就可能导致不能安全的渲染 UI

得益于 JS 是单线程运行的
- 可以节省内存?
- 节约上下文切换时间?
- 不需要手动上锁
  - 假设读取一个数字 15 的时候
  - 同时有两个操作对数字进行了加减，这时候结果就出现了错误
  - 解决办法，在读取的时候加锁，直到读取完毕之前都不能进行写入操作

### JS单线程的背景

> 因为 javescript 创建之初，只是为了运行在浏览器端
> 面对浏览器特有的操作DOM场景，不能因为各种并发多线程逻辑，导致DOM被操作得晕头转向
> 因此 javascript 设计为单线程语言 - 负责执行代码的只有一个线程

而我们现在编写的异步函数，是基于单线程的事件循环机制进行的逻辑顺序排队(阻塞)执行，形成一种延迟执行的效果

### 同步任务-执行栈

栈内存作用
- 执行代码（主线程）
- 存储变量和基本类型值

把执行栈认为是一个存储函数调用的**栈结构**，遵循**先进后出**的原则

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/1670d2d20ead32ec.gif)

- 首先会执行一个 main 函数
- 然后执行我们的代码
- 根据先进后出的原则，后执行的函数会先弹出栈
- foo 函数后执行，当执行完毕后就从栈中弹出了


![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/webcomponents.gif)

👇 平时也能控制台的函数异常信息中看到执行栈的函数关系

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221201204530.png)
👆 报错在 foo 函数，foo 函数又是在 bar 函数中调用的

👇 当执行栈存储过多函数，释放不掉就会导致爆栈(**栈可存放的函数是有限制**)

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221201204703.png)



### 异步

> setTimeout 0 并不是立即执行，可以看出JS处理异步是有一定顺序的


js(执行代码)是单线程的，浏览器并不是单线程的，js执行一些 webApi ，交给浏览器，浏览器可以开启别的线程
如 setTimeout 的 webApi 浏览器是在别的线程里倒计时

```js
function demo() {
  setInterval(function(){
    console.log(2)
  },1000)
  sleep(2000)
}
demo()
```
👆 多个回调函数会在耗时操作(2秒)结束以后同时执行，这样可能就会带来性能上的问题


👇 用 [requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/window/requestAnimationFrame) 实现一个准确的 `setInterval` 
```js
function setInterval(callback, interval) {
  let timer
  const now = Date.now
  let startTime = now()
  let endTime = startTime
  const loop = () => {
    timer = window.requestAnimationFrame(loop)
    endTime = now()
    if (endTime - startTime >= interval) {
      startTime = endTime = now()
      callback(timer)
    }
  }
  timer = window.requestAnimationFrame(loop)
  return timer
}

let a = 0
setInterval(timer => {
  console.log(1)
  a++
  if (a === 3) cancelAnimationFrame(timer)
}, 1000)
```
👆 `requestAnimationFrame` 自带函数节流功能，基本可以保证在 16.6 毫秒内只执行一次（不掉帧的情况下）
并且该函数的延时效果是精确的，没有其他定时器时间不准的问题

TODO: 通过该函数来实现 `setTimeout`


![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/webcomponents1.gif)


### 宏任务

宏任务包括 `script` ， `setTimeout` `，setInterval` `，setImmediate` ，`I/O`，`UI` `rendering。`


### 微任务

微任务包括 `process.nextTick` `，promise` ，`MutationObserver`

### 浏览器的事件循环

JS 引擎线程，执行 JS 代码往执行栈中放入函数，当遇到异步的代码时，会被挂起并在需要执行的时候加入到 Task（有多种 Task） 队列中(宏任务队列、微任务队列)

一旦执行栈为空，`Event Loop `就会从 Task 队列中拿出需要执行的代码并放入执行栈中执行

所以本质上来说 `JS` 中的异步还是**同步行为**

`Event Loop` 执行顺序如下所示：

- 首先执行同步代码，这属于宏任务
- 当执行完所有同步代码后，执行栈为空，查询是否有异步代码需要执行
- 执行所有微任务
- 当执行完所有微任务后，如有必要会渲染页面
- 然后开始下一轮 Event Loop，执行宏任务中的异步代码，也就是 setTimeout 中的回调函数

代码虽然 `setTimeout` 写在 `Promise` 之前，但是因为 `Promise` 属于微任务而 `setTimeout` 属于宏任务，所以会先执行 `Promise` 的回调

有个误区，认为微任务快于宏任务，其实是错误的

因为宏任务中如 `script` 
浏览器会先执行一个宏任务，内部产生异步代码的话才会先执行微任务(循环 ♻️)

### nodejs的事件循环

[掘金小册简单介绍](http://www.qianduan.site/html/7-Event-Loop.htm)

TODO: 找详细资料学习

> Node 中的 Event Loop 和浏览器中的有什么区别？process.nexttick 执行顺序？

`Node` 中的 `Event Loop` 和浏览器中的是完全不相同的东西

`Node` 的 `Event Loop` 分为 6 个阶段，它们会按照顺序反复运行
每1个阶段对应一个任务队列内存
当队列为空或者执行的回调函数数量到达系统设定的阈值，就会进入下一阶段

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221202111706.png)

- timers
  - 执行 setTimeout 和 setInterval 回调，并且由 poll 阶段控制
  - Node 中定时器指定的时间也不是准确时间，只能是尽快执行
- pending callbacks
- idle prepare
- poll
  - 回到 timer 阶段执行回调(time的时机到了的话)
  - 执行 I/O 回调
  - 如果没有设定了 timer 的话，会发生以下两件事情
    - 如果 `poll` 队列不为空，会遍历回调队列并同步执行，直到队列为空或者达到系统限制
    - 如果 `poll` 队列为空时，会有两件事发生
      - 如果有 `setImmediate` `回调需要执行，poll` 阶段会停止并且进入到 `check` 阶段执行回调
      - 如果没有 `setImmediate` 回调需要执行，会等待回调被加入到队列中并立即执行回调，这里同样会有个超时时间设置防止一直等待下去
- check
  - 执行 `setImmediate`
- close callbacks
  - 执行 `close` 事件


Node宏任务

```js
setTimeout(() => {
    console.log('setTimeout')
}, 0)
setImmediate(() => {
    console.log('setImmediate')
})
```
`setTimeout` 可能执行在前，也可能执行在后
- `setTimeout(fn, 0) ==> setTimeout(fn, 1)`，这是由源码决定的
进入事件循环也是需要成本的，如果在准备时候花费了大于 `1ms` 的时间，那么在 `timer` 阶段就会直接执行 `setTimeout` 回调
- 如果准备时间花费小于 `1ms`，那么就是 `setImmediate` 回调先执行了


```js
const fs = require('fs')

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('timeout');
    }, 0)
    setImmediate(() => {
        console.log('immediate')
    })
})
```
`setImmediate` 永远先执行
因为两个代码写在 `IO` 回调中
`IO` 回调是在 `poll` 阶段执行，当回调执行完毕后队列为空
发现存在 `setImmediate` 回调，所以就直接跳转到 check 阶段去执行回调了

Node微任务

在以上每个阶段完成前清空 `microtask` 队列，下图中的 `Tick` 就代表了 `microtask`
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221202114325.png)
```js
setTimeout(() => {
  console.log('timer21')
}, 0)

Promise.resolve().then(function() {
  console.log('promise1')
})
```
和浏览器中的输出是一样的，`microtask` 永远执行在 `macrotask` 前面

### Node 的 process.nextTick

独立于 `Node` 的 `Event Loop` 之外的，它有一个自己的队列，当每个阶段完成后
如果存在 `nextTick` 队列，就会清空队列中的所有回调函数，并且优先于其他 `microtask` 执行。

```js
setTimeout(() => {
 console.log('timer1')

 Promise.resolve().then(function() {
   console.log('promise1')
 })
}, 0)

process.nextTick(() => {
 console.log('nextTick')
 process.nextTick(() => {
   console.log('nextTick')
   process.nextTick(() => {
     console.log('nextTick')
     process.nextTick(() => {
       console.log('nextTick')
     })
   })
 })
})
```
永远都是先把 `nextTick` 全部打印出来。