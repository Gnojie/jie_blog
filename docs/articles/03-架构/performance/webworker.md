# WebWorker


## 基本使用

`Worker` (包括`ServerWorker`) 只能引用远程在线地址, 不能使用本地文件系统的地址, 因此需要启一个本地静态服务才能使用

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230210112015.png)

👇 主线程
```html
<!DOCTYPE html>
<head><title>WebWorker</title></head>
<body>
  <h1>web worker</h1>
  <script>
    const worker1 = new Worker('./testWorker.js') // 调用 worker

    worker1.postMessage({name:'worker1', info: '主线程设置的参数'}) // 主线程 -> worker线程 发送信息
    // 主线程 接收 worker线程信息
    worker1.onmessage = ({ data }) => {
      console.log('主线程输出', data)
    }
  </script>
</body>
</html>
```

👇 `worker线程`
```js
self.onmessage = ({ data }) => {
  console.log('worker线程输出', data)
  self.postMessage({ name: data.name, info: `Worker处理后的info: ${data.info}` });
}
```
👆 注意 `onmessage` 和 `postMessage` 不同, 不是函数 而是一个变量 用于赋值一个函数

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230210113247.png)

## 实际案例

[一文彻底了解Web Worker，十万条数据都是弟弟](https://juejin.cn/post/7137728629986820126)

TODO: 示例 `vue` 编写

使用 `performance api` 测试耗时, 想要看看线程通信耗时(不是逻辑执行耗时)

发现通信耗时不对劲, 原因是 `performance` 是 `window` 下的api, 不同线程的 `window` 不一样, `worker` 中执行的 `performance.now()` 和 主线程中的 `performance.now()` 基准不一样

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230210144421.png)
👆 worker 线程 反而更耗时....

## 动态创建 worker 并调用

`Worker` 常规写法都是单独一个 `js静态文件`(在打包工具中体现为不打包或单独入口打包类似 `ServerWorker`)，在 `new Worker()` 中引用

但是和 `ServerWorker` 应用级别不同, `WebWorker` 更像业务开发中具体的模块级别, 因此手动创建很多的静态JS, 开发并不友好

所以更希望可以在业务代码中动态创建 `Worker` 而不需要关心构建过程

```js
const makeWorker = f => {
  let pendingJobs = {} // { jobid: resolve, ... } 存放各种 worker 的 promise 未执行 resolve 函数

  // 生成 未调用 worker
  const worker = new Worker(URL.createObjectURL(new Blob([
    `self.onmessage = ({ data: { jobId, params } }) => {
     const result = (${f.toString()})(...params)
     postMessage({ jobId, result })
    }`
  ])))

  // 配置主线程方 接收通知通用处理(格式化等
  worker.onmessage = ({ data: { result, jobId } }) => {
    pendingJobs[jobId](result)
    delete pendingJobs[jobId]
  }

  // 包裹成 promise
  return (...params) => new Promise(resolve => {
    // 触发 worker
    const jobId = String(Math.random()) // 1. 创建worker线程name用于接收通知时区分
    pendingJobs[jobId] = resolve // 2. 把resolve存起来由👆接收通知触发 
    worker.postMessage({ jobId, params }) // 3. 调用 worker
  })
}

// 只需要编写期望在 worker 中运行的逻辑 缺点是: 不能自定义 worker 内的其他功能逻辑
// 可以调整为 testFunction 编写完整的 worker 内容, 即👆的 self.onmessage 也自己写
const testFunction = num => num * 2
const testWorker = makeWorker(testFunction)

testWorker(122).then(console.log)
testWorker(233).then(console.log)
```
👆 `worker` 和 `主js进程` 是运行在不同空间的

1. 变量不共享
2. 能调用的浏览器API也是不同的

所以把 `worker` 写在一个常规函数里反而容易引起误解, 容易误使用了读取不到的变量/浏览器API

`ESLint` 之类的检查工具本可以检测出单独的 `worker` 文件内容有没有误使用变量, 但是写到常规函数里, 检查工具没办法识别这个函数是 `worker` 而检查出有没有误用

## vue-worker 源码分析

TODO: 改造👆实际案例的 vue 示例

[github](https://github.com/israelss/simple-web-worker/blob/master/src/createDisposableWorker.js)

## vue-worker ts及函数式改造

[vueuse-useWebWorkerFn](https://vueuse.org/core/useWebWorkerFn/)