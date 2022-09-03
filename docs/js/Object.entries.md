[MDN-Object.entries()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)

> 返回一个给定对象自身可枚举属性的键值对数组，其排列与使用 `for...in` 循环遍历该对象时返回的顺序一致（区别在于 `for-in` 循环还会枚举原型链中的属性）。

总结: 把对象数据结构转化为**二维数组**

如`{a:1, b:2}` --> `[ [a,1], [b,2] ]`

很语法糖的一个api，当然深层的知识点是 `【可枚举】`，这里暂且放下

我们遍历对象的时候
```js
const obj = {a:1, b:2}
for (let item in obj) {
  console.log(item)
}
// 输出: a b
// 通常的做法是 再赋值一遍拿到值 `const value = obj[item]`
```

有了`entries` 的语法糖之后
```js
for (let [key,value] of Object.entries(obj)) {
  console.log(key,value)
}
```
👆 不用赋值，可以直接解构取出值
注意转化后的遍历是数组用 `for of` ，而转化前的遍历是对象 `for in`

## 将Object转换为Map
借助`Object.entries`方法可以很容易的将Object转换为Map:
```js
const obj = { a: 1, b: 2 };
const map = new Map(Object.entries(obj));
/*
new Map([
  [a, 1],
  [b, 2],
])
*/
console.log(map); // Map { a: 1, b: 2 }
```

## polyfill
> 自己实现一个`entries`语法糖
```js
if (!Object.entries){
  Object.entries = function( obj ){
    const ownProps = Object.keys( obj );
    const i = ownProps.length;
    const resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}
```