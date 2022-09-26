- 手写 节流函数 - 如果想要最后一次必须执行的话怎么实现?
- 手写 批量请求函数 - 并限制并发量
- 手写 fetchWithRetry 会自动重试3次，任意一次成功直接返回
- 手写 数组转树状结构 `{id: 2, name: '部门B', parentId: 0}`
- 算法 去除字符串中出现次数最少的字符，不改变原字符串的顺序 `“aaabbbcceeff” —— “aaabbb”`
- 手写 将数字转换成汉语的输出，输入为不超过10000亿的数字 `trans(123456) —— 十二万三千四百五十六`
- 手写 使用Promise实现一个异步流量控制的函数, 比如一共10个请求, 每个请求的快慢不同, 最多同时3个请求发出, 快的一个请求返回后, 就从剩下的7个请求里再找一个放进请求池里, 如此循环
- 手写 实现compose函数, 类似于koa的中间件洋葱模型
```js
let middleware = []
middleware.push((next) => {
  console.log(1)
  next()
  console.log(1.1)
})
middleware.push((next) => {
  console.log(2)
  next()
  console.log(2.1)
})
middleware.push((next) => {
  console.log(3)
  next()
  console.log(3.1)
})

let fn = compose(middleware)
/* 1 2 3 3.1 2.1 1.1 */
fn()
```

- 手写 LRU算法
- 手写虚拟dom渲染函数


