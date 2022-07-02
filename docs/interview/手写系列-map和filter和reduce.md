> 不管对数组方法有多熟悉，强烈建议完整看一遍MDN文档(包括所有的示例)

我们从输入输出看这些数组方法其实都比较容易手写实现出来

感觉考察更多的是对数组方法所有参数的了解程度，毕竟有些参数是真的不怎么用，但是能用上时又特别好用

以及对不同数组方法应用场景的熟悉

## map
`map`只接收一个回调函数
重点是**回调函数接收3个参数**

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220405143447.png)

```js
function myMap(arr, cb) {
  let newArr = []
  for(let i=0; i < arr.length; i++) {
    const res = cb(arr[i], i, arr)
    newArr.push(res)
  }
  return newArr
}
```

```js
Array.prototype.myMap(cb) {
  let newArr = []
  for(let i=0; i < this.length; i++) {
    const res = cb(this[i], i, this)
    newArr.push(res)
  }
  return newArr
}
```

## filter
> 和`map`很相似，`filter`是回调函数为`true`的项进入新数组

```js
function myFilter(arr, cb) {
  const newArr = []
  for(let i=0; i < this.length; i++) {
    const res = cb(this[i], i, this)
    if(res) {
      newArr.push(arr[i])
    }
  }
  return newArr
}
```

```js
Array.prototype.myMap(cb) {
  const newArr = []
  for(let i=0; i < this.length; i++) {
    const res = cb(this[i], i, this)
    if(res) {
      newArr.push(arr[i])
    }
  }
  return newArr
}
```

## reduce
> 同样手写`reduce`并不难，考察的更多的是对`reduce`的所有参数了解和使用`reduce`的场景
>
> 在MDN文档上，列出了很多`reduce`的示例，这些都是有实际应用场景而且典型的例子

如👇 遍历1次无法满足需求而需要遍历多次时，可以考虑`reduce`是否适用
```js
// Array.map 和 Array.filter 组合
console.log(
  arrTest
    .filter(item => item.type === "a")
    .map(item => item.add = '1')
)
```
👆 这也是[reduce-mdn文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#使用_.reduce_替换_.filter.map)上说的例子

> 使用 `.reduce()` 替换 `.filter().map()`
> 
> 使用 `Array.filter()` 和 `Array.map()` 会遍历数组两次，而使用具有相同效果的 `Array.reduce()` 只需要遍历一次，这样做更加高效。（如果你喜欢 `for` 循环，你可用使用 `Array.forEach()` 以在一次遍历中实现过滤和映射数组）

[按顺序运行 Promise-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#按顺序运行_Promise)

> 关于promise与循环的故事，我们会另外专门讲TODO:

[使用函数组合实现管道-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#使用函数组合实现管道)

> 关于管道函数我们在[vue的过滤器](../vue/重学vue-05filter多余吗.md)中讲到过

👇 开始手写实现`reduce`
```js
function reduce(arr, cb, initVal) {
  // 1. 没有初始值时取数组第1项为初始值
  let res = initVal === undefined ? arr[0]: initVal;
  // 2. 没有初始值时index为第2项 即1
  let i = initVal == undefined? 1: 0
  // 3. 遍历触发传入的回调函数
  for (i; i< arr.length; i++){
    num = cb(res, arr[i], i)
  }
  return res
}
```
```js
Array.prototype.myReduce = function(cb, initVal) {
  // 1. 没有初始值时取数组第1项为初始值
  let res = initVal === undefined ? arr[0]: initVal;
  // 2. 没有初始值时index为第2项 即1
  let i = initVal == undefined? 1: 0
  // 3. 遍历触发传入的回调函数
  for (i; i< arr.length; i++){
    num = this(res, arr[i], i)
  }
  return res
}
```