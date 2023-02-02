## 面试中问的this指向

### 普通函数3种调用方式

```js
var a = 1

function foo() {
  console.log(this.a)
}

const obj = {
  a: 2,
  foo: foo
}

foo() // 1. 直接调用
obj.foo() // 2. 对象调用
const c = new foo() // 3. 实例化调用
```

- 直接调用，不管 `foo` 函数被放在了什么地方，`this` 一定是 `window`
- `obj.`调用`foo()`，我们只需要记住，谁调用了函数，谁就是 `this`，所以在这个场景下 `foo` 函数中的 `this` 就是 `obj` 对象
- `new` 的方式来说，`this` 被永远绑定在了 `c` 上面，不会被任何方式改变 `this`

### 箭头函数

箭头函数其实是没有 `this` 的
箭头函数中的 `this` 只取决包裹箭头函数的第一个普通函数

```js
function a() {
  return () => {
    return () => {
      console.log(this)
    }
  }
}
console.log(a()()()) // window
```
👆 因为包裹箭头函数的第一个普通函数是 `a`，所以此时的 `this` 不是a而是 `window`

另外对箭头函数使用 bind 这类函数是无效的。

### 人为修改this

> [手写call/bind](../%E6%89%8B%E5%86%99%E7%B3%BB%E5%88%97/手写系列-callbind.md)

---

🤔: 有意思的是 `fn.bind().bind(a)() // => ?` 此时的是`this` 是前面空的 `window` ，还是后面重置的`a`？

答案是 `window`

```js
fn.bind().bind(a)

// 等于

let fn2 = function fn1() {
  return function() {
    return fn.apply()
  }.apply(a)
}
fn2()
```
👆 不管我们给函数 `bind` 几次，`fn` 中的 `this` 永远由第一次 `bind` 决定，所以结果永远是 `window`

---

### 优先级

- `new` 的方式优先级最高
- `bind` 这些函数
- `obj.foo()` 这种调用方式
- `foo` 直接调用方式
- 同时，箭头函数的 `this` 一旦被绑定，就不会再被任何方式所改变


### 总结

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221130135035.png)