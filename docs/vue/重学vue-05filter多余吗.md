> 想实现filter的效果，完全可以有各种替代方式，仅仅是因为写着好看就设计这个API吗

比如静态的`methods`,mounted挂载一次之后fileter计算后的结果不会再动态变化(动态渲染如for时会是动态的)

比如动态的`computed`,每次计算都会触发filter计算后结果return

有趣的是👇

> 在 3.x 中，过滤器已移除，且不再支持。取而代之的是，我们建议用`方法调用`或`计算属性`来替换它们。


管道运算符的好处

什么是管道函数？管道函数，其作用是将前一步的结果直接传参给下一步的函数，从而省略了中间的赋值步骤，可以大量减少内存中的对象，节省内存。



一个值经过多重处理的写法
- `fn3(fn2(fn1(val)))`
- `fn1(val).fn2().fn3()`?
- `val | fn1 | fn2 | fn3`

## 函数柯里化
```js
// 柯里化函数
const curry = (fn) => {
  return function curriedFn (...args) {
    if (fn.length > args.length) {  // 未达到触发条件，继续收集参数
      return function () {
        // slice方法内部的this就会被替换成arguments，并循环遍历arguments，复制到新数组返回，这样就得到了一个复制arguments类数组的数组对象。
        return curriedFn(args.concat([].slice.call(arguments)))
      }
    }
    return fn(args)
  }
}

const multiply = (x, y, z) => x*y*z;

const curryMul = curry(multiply);
const result = curryMul(1)(2)(3); // 1*2*3 = 6
```

## 组合
> 把多个函数传递进一个组合工具中，调用组合工具来按顺序从右往左执行

```js
// 组合多个函数 compose
function compose(...fns){
  return (value) => {
    // 倒序执行
    fns.reverse().reduce((acc, fn) => fn(acc), value);
  }
}

const countWords = compose(fn1, fn2);
countWord("hello your reading about composition"); // 5
```

## 管道机制
```js
// pipeline 注意reduce参数的用法，将val作为reduce的第二个参数，也就是回调函数prev的默认值
function pipeLine(...methods) =>{
  return (val=0)=>{
    methods.reduce((prev,cur)=>cur(prev),val);
  }
}
function fn1(a){
  return a+5
}
function fn2(b){
  return b+10
}
function fn3(b){
  return b+10
}
console.log(pipeLine(fn1,fn2,fn3)(10));// 35
```

## 总结
> 组合和管道类似，都是串行处理数据。
> 传入一个初始数据，通过一系列特定顺序的不同函数处理成我们希望得到的数据
> 而函数柯里化则是，一个函数，传递多次不同参数得出结果数据