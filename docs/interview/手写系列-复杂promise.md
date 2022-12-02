根据Promise的调用方式，写出大体框架

```js
const p = new Promise((resolve, reject) => {
  console.log('do something')
  resolve()
})

p.then(
  res => console.log(res),
  err => console.log(err)
)
```

大体框架
```js
// Promise 内部的3个状态
const PENDING = 'pending' // 等待状态
const RESOLVED = 'resolved' // 完成状态
const REJECTED = 'rejected' // 拒绝状态


function MyPromise(fn) {
  this.state = PENDING
  this.res = null
}
MyPromise.prototype.then = function (onFulfilled, onRejected){}
```

在 `new Promise()` 时传递进来的回调函数，有两个参数 `resolve函数` `reject函数`

传递进 Promise 的回调函数的参数由 Promise 提供

```js
// Promise 内部的3个状态
const PENDING = 'pending' // 等待状态
const RESOLVED = 'resolved' // 完成状态
const REJECTED = 'rejected' // 拒绝状态


function MyPromise(fn) {
  this.state = PENDING
  this.res = null

  // Promise 提供回调函数的2个参数 resolve函数 reject函数
  function resolve(value) {
    // 只从等待状态 修改为 完成，已经修改过状态的不会执行
    if (this.state === PENDING) {
      this.state = RESOLVED // 修改状态为 完成
      this.res = value // 记录res
    }
  }
  function reject(value) {
    if (this.state === PENDING) {
      this.state = REJECTED // 修改状态为 拒绝
      this.res = value // 记录res
    }
  }
}
MyPromise.prototype.then = function (onFulfilled, onRejected){}
```

完成或者拒绝状态触发时，找到then中相应的回调函数执行
因此then函数，其实是把回调函数存起来，到时机了由修改状态时触发

```js
MyPromise.prototype.then = function (onFulfilled, onRejected){
  this.onFulfilled = onFulfilled
  this.onRejected = onRejected
}
```

在resolve函数和reject函数触发修改状态时触发 then 中存储的回调函数

```js
// Promise 内部的3个状态
const PENDING = 'pending' // 等待状态
const RESOLVED = 'resolved' // 完成状态
const REJECTED = 'rejected' // 拒绝状态


function MyPromise(fn) {
  this.state = PENDING
  this.res = null

  this.onFulfilled = null
  this.onRejected = null

  // Promise 提供回调函数的2个参数 resolve函数 reject函数
  function resolve(value) {
    // 只从等待状态 修改为 完成，已经修改过状态的不会执行
    if (this.state === PENDING) {
      this.state = RESOLVED // 修改状态为 完成
      this.res = value // 记录res
      this.onFulfilled()
    }
  }
  function reject(value) {
    if (this.state === PENDING) {
      this.state = REJECTED // 修改状态为 拒绝
      this.res = value // 记录res
      this.onRejected()
    }
  }
}
MyPromise.prototype.then = function (onFulfilled, onRejected){
  this.onFulfilled = onFulfilled
  this.onRejected = onRejected
}
```
再加上执行fn
```js
// Promise 内部的3个状态
const PENDING = 'pending' // 等待状态
const RESOLVED = 'resolved' // 完成状态
const REJECTED = 'rejected' // 拒绝状态


function MyPromise(fn) {
  this.state = PENDING
  this.res = null

  this.onFulfilled = null
  this.onRejected = null

  // Promise 提供回调函数的2个参数 resolve函数 reject函数
  function resolve(value) {}
  function reject(value) {}

  fn(resolve, reject)
}
MyPromise.prototype.then = function (onFulfilled, onRejected){}
```

👇 测试代码
```js
new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 0)
}).then(value => {
  console.log(value)
})
```

运行会发现没有执行到then里面，断点发现
执行到resolve的if判断状态 this是window，而不是promise对象
这是因为 resolve 在回调函数中执行，this指向是window

这里我们修改resolve和reject的this指向
```js
fn(resolve.bind(this), reject.bind(this))
```

最终

```js
// Promise 内部的3个状态
const PENDING = 'pending' // 等待状态
const RESOLVED = 'resolved' // 完成状态
const REJECTED = 'rejected' // 拒绝状态

function MyPromise(fn) {
  this.state = PENDING
  this.res = null

  this.onFulfilled = null
  this.onRejected = null

  // Promise 提供回调函数的2个参数 resolve函数 reject函数
  function resolve(value) {
    // 只从等待状态 修改为 完成，已经修改过状态的不会执行
    if (this.state === PENDING) {
      this.state = RESOLVED // 修改状态为 完成
      this.res = value // 记录res
      this.onFulfilled(this.res)
    }
  }
  function reject(value) {
    if (this.state === PENDING) {
      this.state = REJECTED // 修改状态为 拒绝
      this.res = value // 记录res
      this.onRejected()
    }
  }
  
  // 开始
  fn(resolve.bind(this),reject.bind(this))
}
MyPromise.prototype.then = function (onFulfilled, onRejected){
  this.onFulfilled = onFulfilled
  this.onRejected = onRejected
}

// 测试代码
new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 0)
}).then(value => {
  console.log(value)
})
```

👆 不是符合规范的完整版
存在的问题
- then 的回调函数是可选的，而且要做好非函数的处理
- 链式调用
- then 的回调要放异步队列中，不影响同步代码执行
- resolve 传入的结果是一个 Promise





