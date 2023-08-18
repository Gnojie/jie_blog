> 根组件
> 其他复用组件


解析template时发现组件标签，会去解析对应注册的vue组件


## data为什么是函数

```js
// 注册组件
Vue.component('comp-a',{
  data: {a:'1'}
})

// 注册后，vue通过template的<comp-a>实例化组件,实际上是编译层render函数就能看出来是这个时候才是真正创建组件，而不是注册就创建
// 调用2次
<comp-a />
<comp-a />

// 假设实例化的函数如👇
function newComponent(option) {
  // 根据option处理一系列东西渲染成dom
  return option; // 假设组件就是返回对象
}
// 👆外部实例化组件后对其中一个组件的data数据做操作
// 会发现2个组件的数据都发生了变化，原因是2个组件的data指向同一对象引用

// ------------------------------------

// 而data改为函数，注册组件
Vue.component('comp-a',{
  data(){return { a:'1' } }
})
// 实例化的函数改为先运行data函数
function newComponent(option) {
  // 根据option处理一系列东西渲染成dom
  const data = option.data
  option._data = typeof data === 'function' ? data() : data || {}
  return option;
}
// 👆每次实例化组件都会生成新的data对象数据，实现值时一样的，但是各自独立

```
所以以前以为data是函数的原因是封装成闭包实现变量互不干扰的想法是❌的
👇 理论上这种情况属于深浅拷贝的问题，常规做法是改成深拷贝的，但是vue的做法是把data做成函数
```js
// 实例化的函数改为先运行data函数
function newComponent(option) {
  // 根据option处理一系列东西渲染成dom
  option.$data = JSON.parse(JSON.stringfy(option.data))
  return option;
}
```
是吧。。。。所以原因是函数性能比深拷贝要好？

注册组件的本质其实就是建立一个组件构造器的引用

使用组件才是真正创建一个组件实例

注册组件其实并不产生新的组件类，但会产生一个可以用来实例化的新方式

这就有点像我们平时开发业务代码初始化数据一样，点击生成列表数据中的一项，生成的一项数据我们抽离成公用的
```js
const list = []
const obj = {
  a:'1', b:'2'
}

function initOneData() {
  return obj
}

function onClick() {
  const res = initOneData()
  list.push(res)
}
onClick()
console.log(list) // [{a:'1',b:'2'}]
list[0].a = 'a' // [{a:'a',b:'2'}]
onClick()
console.log(list) // [{a:'a',b:'2'},{a:'a',b:'2'}]
```
👇 解决办法
```js
const obj = {
  a:'1', b:'2'
}

function initOneData() {
  return JSON.parse(JSON.stringfy(obj))
}

function initOneData() {
  return {
    a:'1', b:'2'
  }
}
```

🤔 深拷贝的其他方式

## props
> 类似函数复用，需要参数
> 组件复用除了有内部状态data等，还要支持传入参数

## $emit
> 原理

## sync
自定义组件用 .sync 替代 v-model
show的那种？

拦截做特殊操作呢？

## 插槽
作用域插槽

## 注册组件的不同形式
