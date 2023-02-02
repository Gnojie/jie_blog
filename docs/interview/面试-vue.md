黄老师的 [vue技术揭秘](https://ustbhuangyi.github.io/vue-analysis/)

> 面试题，回答可能不详细。详细原理和发散思维可以另开文章分析

## 什么是 MVVM？比之 MVC 有什么区别？

> 不管是 React 还是 Vue，它们都不是 MVVM 框架，只是有借鉴 MVVM 的思路

- View 很简单，就是用户看到的视图
- Model 同样很简单，一般就是本地数据和数据库中的数据

`视图模型双向绑定`，是`Model-View-ViewModel`的缩写，也就是把`MVC`中的`Controller`演变成`ViewModel。`
- `Model`层代表数据模型
- `View`代表UI组件
- `ViewModel`是`View`和`Model`层的桥梁
数据会绑定到`viewModel`层并自动将数据渲染到页面中，视图变化的时候会通知`viewModel`层更新数据。以前是操作DOM结构更新视图，现在是`数据驱动视图`。

背景
将数据经过处理展现到用户看到的视图上。
从视图上读取用户的输入，将用户的输入写入到数据库

如何将数据展示到视图上，然后又如何将用户的输入写入到数据中，不同的人就产生了不同的看法，从此出现了很多种架构设计

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221212151105.png)

👆 MVC 架构通常是使用控制器更新模型，视图从模型中获取数据去渲染。当用户有输入时，会通过控制器去更新模型，并且通知视图进行更新

缺陷: 控制器承担的责任太大了，随着项目愈加复杂，控制器中的代码会越来越臃肿，导致出现不利于维护的情况

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221212151148.png)

👆 MVVM 架构中，引入了 ViewModel 的概念

ViewModel 只关心数据和业务的处理，不关心 View 如何处理数据，因为view已经是绑定着自动变化了

在这种情况下，View 和 Model 都可以独立出来，任何一方改变了也不一定需要改变另一方，并且可以将一些可复用的逻辑放在一个 ViewModel 中，让多个 View 复用这个 ViewModel

以 Vue 框架来举例，ViewModel 就是组件的实例。View 就是模板，Model 的话在引入 Vuex 的情况下是完全可以和组件分离的。

优点：
1.`低耦合`。视图（View）可以独立于Model变化和修改，一个Model可以绑定到不同的View上，当View变化的时候Model可以不变化，当Model变化的时候View也可以不变
2.`可重用性`。你可以把一些视图逻辑放在一个Model里面，让很多View重用这段视图逻辑
3.`独立开发`。开发人员可以专注于业务逻辑和数据的开发(ViewModel)，设计人员可以专注于页面设计
4.`可测试`

除了view model viewModel
在 MVVM 中还引入了一个隐式的 Binder 层，实现了 View 和 ViewModel 的绑定

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221212151422.png)

以 Vue 框架来举例，这个隐式的 Binder 层就是 Vue 通过解析模板中的插值和指令从而实现 View 与 ViewModel 的绑定。

MVVM 最重要的并不是通过双向绑定或者其他的方式将 View 与 ViewModel 绑定起来
而是通过 ViewModel 将视图中的状态和用户的行为分离出一个抽象，这才是 MVVM 的精髓

## 什么是 Virtual DOM？为什么 Virtual DOM 比原生 DOM 快？

TODO: 单独深入虚拟DOM，以及diff算法

操作 DOM 是慢的，相较于 DOM 来说，操作 JS 对象会快很多

通过 JS 对象来模拟DOM，就可以通过 JS 对象来渲染出对应的 DOM。

---

🤔 为什么操作DOM慢？jQuery？

---

操作虚拟DOM，难点在于如何判断新旧两个 JS 对象的最小差异并且实现局部更新 DOM

DOM 是一个多叉树的结构
如果完整的对比两颗树的差异，需要的时间复杂度会是 O(n ^ 3)，这个复杂度肯定是不能接受的。

于是 React 团队优化了算法，实现了 O(n) 的复杂度来对比差异。
只对比同层的节点，而不是跨层对比，这也是考虑到在实际业务中很少会去跨层的移动 DOM 元素。 所以判断差异的算法就分为了两步
- 从上至下，从左往右遍历对象，也就是树的深度遍历，这一步中会给每个节点添加索引，便于最后渲染差异
  - 判断新旧节点的 tagName 是否相同
  - 如果不相同的话就代表节点被替换了
  - 如果没有更改 tagName 的话，就需要判断是否有子元素，有的话就进行第二步算法
- 一旦节点有子元素，就去判断子元素是否有不同
  - 判断原本的列表中是否有节点被移除，在新的列表中需要判断是否有新的节点加入，还需要判断节点是否有移动。

最大优势并不是操作DOM的性能而是
- 将 Virtual DOM 作为一个兼容层，让我们还能对接非 Web 端的系统，实现跨端开发。
- 通过 Virtual DOM 我们可以渲染到其他的平台，比如实现 SSR、同构渲染等等。
- 实现组件的高度抽象化


## 前端路由原理？两种实现方式有什么区别？

TODO: 单独深入前端应用路由原理

> 本质是监听 URL 的变化，然后匹配路由规则，显示相应的页面，并且无须刷新页面

- Hash 模式
  - 当 # 后面的哈希值发生变化时，通过 hashchange 事件来监听到 URL 的变化，从而进行跳转页面
  - `window.addEventListener('hashchange', () => { ... })`
  - 无论哈希值如何变化，服务端接收到的 URL 请求永远是 # 前端的域名
- History 模式
  - 使用 `history.pushState 和 history.replaceState` 改变 URL
  - 不会会引起页面的刷新，只会更新浏览器的历史记录
  - 新增历史记录 `history.pushState(stateObject, title, URL)`
  - 替换当前历史记录
 `history.replaceState(stateObject, title, URL)`
 - 监听浏览器后退事件 `window.addEventListener('popstate', e => { ... })` 


区别
- Hash 模式只可以更改 # 后面的内容，History 模式可以通过 API 设置任意的同源 URL
- History 模式可以通过 API 添加任意类型的数据到历史记录中， Hash 模式只能更改哈希值，也就是字符串
- Hash 模式无需后端配置，并且兼容性好。History 模式在用户手动输入地址或者刷新页面的时候会发起 URL 请求，后端需要配置 index.html 页面用于匹配不到静态资源的时候


## Vue 和 React 之间的区别

Vue 的表单可以使用 v-model 支持双向绑定，相比于 React 来说开发上更加方便，当然了 v-model 其实就是个语法糖，本质上和 React 写表单的方式没什么区别。

Vue 修改状态相比来说要简单许多，React 需要使用 setState 来改变状态，并且使用这个 API 也有一些坑点。并且 Vue 的底层使用了依赖追踪，页面更新渲染已经是最优的了，但是 React 还是需要用户手动去优化这方面的问题。


## 生命周期钩子函数

在 beforeCreate 钩子函数调用的时候，是获取不到 props 或者 data 中的数据的，因为这些数据的初始化都在 initState 中。

执行 created 钩子函数，在这一步的时候已经可以访问到之前不能访问到的数据，但是这时候组件还没被挂载，所以是看不到的。

执行 beforeMount 钩子函数，开始创建 VDOM

执行 mounted 钩子，并将 VDOM 渲染为真实 DOM 并且渲染数据。组件中如果有子组件的话，会递归挂载子组件，只有当所有子组件全部挂载完毕，才会执行根组件的挂载钩子。

数据更新时会调用的钩子函数 beforeUpdate 和 updated，分别在数据更新前和更新后会调用。

另外还有 keep-alive 独有的生命周期，分别为 activated 和 deactivated 。
用 keep-alive 包裹的组件在切换时不会进行销毁，而是缓存到内存中并执行 deactivated 钩子函数，命中缓存渲染后会执行 actived 钩子函数。

销毁组件的钩子函数 beforeDestroy 和 destroyed。前者适合移除事件、定时器等等，否则可能会引起内存泄露的问题。然后进行一系列的销毁操作，如果有子组件的话，也会递归销毁子组件，所有子组件都销毁完毕后才会执行根组件的 destroyed 钩子函数。

## 描述Vue组件生命周期(父子组件)
- 单组件生命周期图
- 父子组件生命周期关系

组件生命周期：
> 父组件beforeCreate --> 父组件created --> 父组件beforeMount --> 子组件beforeCreate --> 子组件created --> 子组件beforeMount --> 子组件 mounted --> 父组件mounted -->父组件beforeUpdate -->子组件beforeDestroy--> 子组件destroyed --> 父组件updated

## 组件通信

- 父子组件通信
  - `props`/`$emit`典型的单向数据流，父组件通过 props 传递数据，子组件不能直接修改 props， 而是必须通过发送事件的方式告知父组件修改数据。
  - 语法糖 v-model 来直接实现，因为 v-model 默认会解析成名为 value 的 prop 和名为 input 的事件
  - 可以通过访问 $parent 或者 $children 对象来访问组件实例中的方法和数据
  - `$attrs、$listeners` 属性会将父组件中的 (不含 .native 修饰器的) v-on 事件监听器传递给子组件，子组件可以通过访问 $listeners 来自定义监听器
  - .sync 属性是个语法糖 ` @update:value="v => value = v"` `this.$emit('update:value', 1)`
- 兄弟组件通信
  - `this.$parent.$children`，在 `$children` 中可以通过组件 `name` 查询到需要的组件实例，进行通信
- 跨多层级组件通信
  - provide / inject
- 任意组件
  -  Vuex
  -  Event Bus 

## extend 能做什么

作用是扩展组件生成一个构造器，通常会与 $mount 一起使用。

```js
// 创建组件构造器
let Component = Vue.extend({
  template: '<div>test</div>'
})
// 挂载到 #app 上
new Component().$mount('#app')
```


除了上面的方式，还可以用来扩展已有的组件
```js
let SuperComponent = Vue.extend(Component)
new SuperComponent({
    created() {
        console.log(1)
    }
})
new SuperComponent().$mount('#app')
```

## mixin 和 mixins 区别

mixin 用于全局混入，会影响到每个组件实例，通常插件都是这样做初始化的
```js
Vue.mixin({
 beforeCreate() {
  // ...逻辑
  // 这种方式会影响到每个组件的 beforeCreate 钩子函数
 }
})
```
mixins 用于局部混入代码，比如上拉下拉加载数据这种逻辑等等。

注意： mixins 混入的钩子函数会先于组件内的钩子函数执行，并且在遇到同名选项的时候也会有选择性的进行合并

## computed 和 watch 区别

TODO: 原理 重学vue-computed/watch

通俗来讲，既能用 computed 实现又可以用 watch 监听来实现的功能，推荐用 computed

重点在于 computed 的缓存功能 computed 计算属性是用来声明式的描述一个值依赖了其它的值，当所依赖的值或者变量 改变时，计算属性也会跟着改变

watch 监听的是已经在 data 中定义的变量，当该变量变化时，会触发 watch 中的方法。

**watch 属性监听** 是一个对象，键是需要观察的属性，值是对应回调函数，主要用来监听某些特定数据的变化，从而进行某些具体的业务逻辑操作,监听属性的变化，需要在数据变化时执行异步或开销较大的操作时使用

**computed 计算属性** 属性的结果会被`缓存`，当`computed`中的函数所依赖的属性没有发生改变的时候，那么调用当前函数的时候结果会从缓存中读取。除非依赖的响应式属性变化时才会重新计算，主要当做属性来使用 `computed`中的函数必须用`return`返回最终的结果 `computed`更高效，优先使用。`data 不改变，computed 不更新。`

**使用场景** `computed`：当一个属性受多个属性影响的时候使用，例：购物车商品结算功能 `watch`：当一条数据影响多条数据的时候使用，例：搜索数据

## v-show 与 v-if 区别
v-show 只是在 `display: none` 和 `display: block` 之间切换。无论初始条件是什么都会被渲染出来，后面只需要切换 CSS，DOM 还是一直保留着的。所以总的来说 v-show 在初始渲染时有更高的开销，但是切换开销很小，更适合于频繁切换的场景。

v-if 控制 Vue 底层的编译。当属性初始为 false 时，组件就不会被渲染，直到条件为 true，并且切换条件时会触发销毁/挂载组件，所以总的来说在切换时开销更高，更适合不经常切换的场景。

可以基于 v-if 实现惰性渲染机制，如局部骨架等在必要的时候才去渲染组件，减少整个页面的初始渲染开销。

## 组件中 data 什么时候可以使用对象

考的是 JS 功底

组件复用时所有组件实例都会共享 data，如果 data 是对象的话，就会造成一个组件修改 data 以后会影响到其他所有组件，所以需要将 data 写成函数，每次用到就调用一次函数获得新的数据。深浅拷贝

当我们使用 new Vue() 的方式的时候，无论我们将 data 设置为对象还是函数都是可以的，因为 new Vue() 的方式是生成一个根组件，该组件不会复用，也就不存在共享 data 的情况了

## 响应式原理(数据变化，视图自动变化)

Object.defineProperty() 监听对象属性 set 和 get 的事件

```js
var data = { name: 'will be observer' }
observe(data)

let name = data.name // -> get value
data.name = 'yyy' // -> change value
```

```js
// 递归自身
function observe(obj) {
  // 判断类型
  if (!obj || typeof obj !== 'object') {
    return
  }
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

function defineReactive(obj, key, val) {
  // 递归子属性
  observe(val)
  Object.defineProperty(obj, key, {
    // 可枚举
    enumerable: true,
    // 可配置
    configurable: true,
    // 自定义函数
    get: function reactiveGetter() {
      console.log('get value')
      return val
    },
    set: function reactiveSetter(newVal) {
      console.log('change value')
      val = newVal
    }
  })
}
```

👆 实现了监听属性的get set事件，并插入了一句 `console.log`

再实现一个派发通知用的中央控制层

```js
// 通过 Dep 解耦属性的依赖和更新操作
class Dep {
  constructor() {
    this.subs = []
  }
  // 添加依赖
  addSub(sub) {
    this.subs.push(sub)
  }
  // 更新
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
// 全局属性，通过该属性配置 Watcher
Dep.target = null
```
👆 sub数组项，是一个对象，拥有`update函数`


有了中央控制层，需要知道哪些视图DOM依赖到了对应的数据
即
1. 根据模版语法`{{}}`使用到的变量名查找dom对应的数据属性，并形成关联关系，存储到中央控制层
2. 数据变化，触发中央控制层修改数据对应的dom

在组件挂载时，会先对所有需要的属性调用 Object.defineProperty()，然后实例化 Watcher，传入组件更新的回调。在实例化过程中，会对模板中的属性进行求值，触发依赖收集。

👇 跳过怎么实现模版语法对应数据，这是每个模板语法会触发的类
```js
class Watcher {
  constructor(obj, key, cb) {
    // 将 Dep.target 指向自己
    // 然后触发属性的 getter 添加监听
    // 最后将 Dep.target 置空
    Dep.target = this
    this.cb = cb
    this.obj = obj
    this.key = key
    this.value = obj[key]
    Dep.target = null
  }
  update() {
    // 获得新值
    this.value = this.obj[this.key]
    // 调用 update 方法更新 Dom
    this.cb(this.value)
  }
}
```
👆 执行构造函数的时候将 Dep.target 指向自身，从而使得收集到了对应的 Watcher，在派发更新的时候取出对应的 Watcher 然后执行 update 函数。


get和set触发的事件改为传入中央控制层
```js
function defineReactive(obj, key, val) {
  // 递归子属性
  observe(val)
  let dp = new Dep() // 1. 创建中央控制层
  Object.defineProperty(obj, key, {
    // 可枚举
    enumerable: true,
    // 可配置
    configurable: true,
    // 自定义函数
    get: function reactiveGetter() {
      console.log('get value')
      // 2. 将 Watcher 添加到订阅
      if (Dep.target) {
        dp.addSub(Dep.target)
      }
      return val
    },
    set: function reactiveSetter(newVal) {
      console.log('change value')
      val = newVal
      // 3. 执行 watcher 的 update 方法
      dp.notify()
    }
  })
}
```


```js
var data = { name: 'yck' }

// 初始化数据与dom的关联
observe(data)
function update(value) {
  document.querySelector('div').innerText = value
}
// 模拟解析到 `{{name}}` 触发的操作
new Watcher(data, 'name', update)

// 触发渲染 update Dom innerText 
data.name = 'yyy' 
```


## Object.defineProperty 的缺陷

- 通过下标方式修改数组数据
- 对象新增属性
- 👆 不会触发数据变化的通知
- 因为 Object.defineProperty 不能拦截到这些操作
- 更精确的来说，对于数组而言，大部分操作都是拦截不到的

解决监听不到下标修改数组项/对象问题
👇 提供一个 `$set函数`
```ts
export function set (target: Array<any> | Object, key: any, val: any): any {
  // 判断是否为数组且下标是否有效
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 调用 splice 函数触发派发更新
    // 该函数已被重写
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  // 判断 key 是否已经存在
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = target.__ob__
  // 如果对象不是响应式对象，就赋值返回
  if (!ob) {
    target[key] = val
    return val
  }
  // 进行双向绑定
  defineReactive(ob.value, key, val)
  // 手动派发更新
  ob.dep.notify()
  return val
}
```

重写数组方法，触发变化通知
```js
// 获得数组原型
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)
// 重写以下函数
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
methodsToPatch.forEach(function (method) {
  // 缓存原生函数
  const original = arrayProto[method]
  // 重写函数
  def(arrayMethods, method, function mutator (...args) {
  // 先调用原生函数获得结果
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    // 调用以下几个函数时，监听新数据
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // 手动派发更新
    ob.dep.notify()
    return result
  })
})
```


## 编译过程

指vue文件的html部分模板()代码怎么编译成真实DOM的

- 将模板解析为 AST
- 优化 AST
- 将 AST 转换为 render 函数
- 👆 编译时
- 👇 浏览器运行时
- 执行 render 函数生成 Virtual DOM
- 映射为真实 DOM

## NextTick 原理分析

TODO: 重学vue-nextTick

> `nextTick`是`Vue`提供的一个全局`API`,是在下次`DOM`更新循环结束之后执行延迟回调，在修改数据之后使用`$nextTick`，则可以在回调中获取更新后的`DOM`；

1. Vue在更新 `DOM` 时是异步执行的。只要侦听到数据变化，`Vue`将开启1个队列，并缓冲在同一事件循环中发生的所有数据变更。如果同一个`watcher`被多次触发，只会被推入到队列中-次。这种在缓冲时去除重复数据对于避免不必要的计算和`DOM`操作是非常重要的。`nextTick`方法会在队列中加入一个回调函数，确保该函数在前面的dom操作完成后才调用；
1. 比如，我在干什么的时候就会使用 `nextTick` ，传一个回调函数进去，在里面执行dom操作即可；
1. 我也有简单了解`nextTick`实现，它会在`callbacks`里面加入我们传入的函数，然后用`timerFunc`异步方式调用它们，首选的异步方式会是`Promise`。这让我明白了为什么可以在`nextTick`中看到`dom`操作结果。

Vue 2.4 之前都是使用的 `microtasks`
但是 `microtasks` 的优先级过高
在某些情况下可能会出现比事件冒泡更快的情况

但如果都使用 `microtasks` 又可能会出现渲染的性能问题。所以在新版本中，会默认使用 `microtasks`
但在特殊情况下会使用 `macrotasks`，比如 `v-on`

根据执行环境分别尝试采用 `Promise、MutationObserver、setImmediate` ，如果以上都不行则采用 `setTimeout` 定义了一个异步方法，多次调用 `nextTick` 会将方法存入队列中，通过这个异步方法清空当前队列。

```js
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (
  typeof MessageChannel !== 'undefined' &&
  (isNative(MessageChannel) ||
    // PhantomJS
    MessageChannel.toString() === '[object MessageChannelConstructor]')
) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

## v-for为什么要用key
- for用的key不能是 index 和唯一随机值
- diff算法通过选择器字符串和key来判断是否 sameNode
- 用key方便diff算法，做到减少渲染次数，提升渲染性能

key的作用主要是为了更高效的对比虚拟DOM中每个节点是否是相同节点;
Vue在patch过程中判断两个节点是否是相同节点,key是一个必要条件，渲染一组列表时，key往往是唯一标识，所以如果不定义key的话，Vue只能认为比较的两个节点是同一个，哪怕它们实际上不是，这导致了频繁更新元素，使得整个patch过程比较低效，影响性能;
从源码中可以知道，Vue判断两个节点是否相同时主要判断两者的key和元素类型等，因此如果不设置key,它的值就是undefined，则可能永    远认为这是两个相同的节点，只能去做更新操作，这造成了大量的dom更新操作，明显是不可取的。

## 描述组件渲染和更新过程/请描述响应式原理
- 官方文档图示
- 包含模版渲染成虚拟dom、数据双向绑定的getset拦截和观察、更新虚拟dom成真实dom的diff算法

## v-model的实现
- input元素的`value = this.xxx`
- 绑定input事件 `this.xxx = $even.target.value`
- data更新出发re-render

## computed的特点
- 有缓存，data不变不会重新计算(可以看看是怎么实现的)
- 提高性能

## 组件data为什么必须是一个函数
- 每个vue文件都会编译到同一个vue实例下，多个组件的属性如果是对象会互相干扰，函数则会是一个闭包

## 何时需要用到beforeDestory
- 解除eventbus自定义事件时 `event.$off`
- 清除定时器
- 解绑自定义的DOM事件，如 window scroll 等

## 什么是作用域插槽
- 父组件想拿到子组件的数据如data时用到
- TODO: 实现一个表格组件就可以知道了

## vuex和 action 和 mutation 有何区别
- Getter: 就像计算属性一样，会根据它的依赖被缓存起来， 且只有当它的依赖值发生了改变才会被重新计算
- Mutation：一般做原子操作, 是唯一更改 store 中状态的方法，且必须是同步函数
- Action：用于提交 mutation，而不是直接变更状态，可以整个多个mutation, 可以包含任意异步操作
- Module：允许将单一的 Store 拆分为多个 store 且同时保存在单一的状态树中

## vue-router模式
- hash模式
- history模式 (服务器支持)
- [SPA-router 实现原理](../vue/%E9%87%8D%E5%AD%A6vue-router%E5%8E%9F%E7%90%86.md)
- [vue-router 源码分析](../vue/%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90-vueRouter.md)

## 将中间组件所有的props传递给子组件
- `<child :topProps="$props">`
- $attr


## 用vNode描述一个dom结构
<!-- ![5f604da2d0b8a32f36d6ee7242a94f0f.png](evernotecid://A8CC14F8-F351-4473-9E82-5EFAB88A4F7D/appyinxiangcom/18783918/ENResource/p1757) -->
## 监听data变化的核心API
- `Object.defineProperty`
- 深度监听原理,监听数组的实现
- 有何缺点

## Vue如何监听数组变化
- `Object.defineProperty`不能监听数组变化
- 重新定义原型,重写`push、pop、splice`等方法
- `Proxy`原生支持监听数组变化

## Vue为何是异步渲染,$nextTick
- 异步渲染(以及合并data修改),用于提高渲染性能
- `$nextTick` 用于在DOM更新完之后,触发回调

## 简述diff算法过程
- `patch(elem,vnode)` 和 `patch(vnode,newVnode)`
- `patchVnode` 和 `addVnodes` 和 `removeVnodes`
- `updateChildren` (局部比对 key的重要性)

在js中,渲染真实DOM的开销是非常大的, 比如我们修改了某个数据,如果直接渲染到真实DOM, 会引起整个dom树的重绘和重排。那么有没有可能实现只更新我们修改的那一小块dom而不要更新整个dom呢？此时我们就需要先根据真实dom生成虚拟dom， 当虚拟dom某个节点的数据改变后会生成有一个新的Vnode, 然后新的Vnode和旧的Vnode作比较，发现有不一样的地方就直接修改在真实DOM上，然后使旧的Vnode的值为新的Vnode。

diff的过程就是调用patch函数，比较新旧节点，一边比较一边给真实的DOM打补丁。在采取diff算法比较新旧节点的时候，比较只会在同层级进行。
在patch方法中，首先进行树级别的比较
new Vnode不存在就删除 old Vnode
old Vnode 不存在就增加新的Vnode
都存在就执行diff更新
当确定需要执行diff算法时，比较两个Vnode，包括三种类型操作：属性更新，文本更新，子节点更新
新老节点均有子节点，则对子节点进行diff操作，调用updatechidren
如果老节点没有子节点而新节点有子节点，先清空老节点的文本内容，然后为其新增子节点
如果新节点没有子节点，而老节点有子节点的时候，则移除该节点的所有子节点
老新老节点都没有子节点的时候，进行文本的替换

updateChildren
将Vnode的子节点Vch和oldVnode的子节点oldCh提取出来。
oldCh和vCh各有两个头尾的变量StartIdx和EndIdx，它们的2个变量相互比较，一共有4种比较方式。如果4种比较都没匹配，如果设置了key，就会用key进行比较，在比较的过程中，变量会往中间靠，一旦StartIdx>EndIdx表明oldCh和vCh至少有一个已经遍历完了，就会结束比较。

## 虚拟dom是什么? 原理? 优缺点?
## vue 和 react 在虚拟dom的diff上，做了哪些改进使得速度很快?
> vue 和 react 里的key的作用是什么? 为什么不能用Index？用了会怎样? 如果不加key会怎样?

## vue 的keep-alive的作用是什么？怎么实现的？如何刷新的?

组件切换，保存一些组件的状态防止多次渲染，就可以使用 keep-alive 组件包裹需要保存的组件。

对于 keep-alive 组件来说，它拥有两个独有的生命周期钩子函数，分别为 activated 和 deactivated 

用 keep-alive 包裹的组件在切换时不会进行销毁，而是缓存到内存中并执行 deactivated 钩子函数，命中缓存渲染后会执行 actived 钩子函数

- 缓存组件，不需要重复渲染时,如多个静态tab页的切换
- 优化性能

原理：`Vue.js`内部将`DOM`节点抽象成了一个个的`VNode`节点，`keep-alive`组件的缓存也是基于`VNode`节点的而不是直接存储`DOM`结构。它将满足条件`（pruneCache与pruneCache）`的组件在`cache`对象中缓存起来，在需要重新渲染的时候再将`vnode`节点从`cache`对象中取出并渲染。

[keep-alive实现原理](https://www.jianshu.com/p/9523bb439950)

[Vue keep-alive的实现原理](https://blog.csdn.net/weixin_38189842/article/details/103999989)

## vue 是怎么解析template的? template会变成什么? 
> vue单文件组件 SFC 编译原理

## History路由配置 nginx

## vue的响应式开发比命令式有什么好处