> 面试题，回答可能不详细。详细原理和发散思维可以另开文章分析

### 什么是 MVVM？比之 MVC 有什么区别？

> 不管是 React 还是 Vue，它们都不是 MVVM 框架，只是有借鉴 MVVM 的思路

- View 很简单，就是用户看到的视图
- Model 同样很简单，一般就是本地数据和数据库中的数据

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


除了view model viewModel
在 MVVM 中还引入了一个隐式的 Binder 层，实现了 View 和 ViewModel 的绑定

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221212151422.png)

以 Vue 框架来举例，这个隐式的 Binder 层就是 Vue 通过解析模板中的插值和指令从而实现 View 与 ViewModel 的绑定。

MVVM 最重要的并不是通过双向绑定或者其他的方式将 View 与 ViewModel 绑定起来
而是通过 ViewModel 将视图中的状态和用户的行为分离出一个抽象，这才是 MVVM 的精髓

### 什么是 Virtual DOM？为什么 Virtual DOM 比原生 DOM 快？

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


### 前端路由原理？两种实现方式有什么区别？

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


### Vue 和 React 之间的区别

Vue 的表单可以使用 v-model 支持双向绑定，相比于 React 来说开发上更加方便，当然了 v-model 其实就是个语法糖，本质上和 React 写表单的方式没什么区别。

Vue 修改状态相比来说要简单许多，React 需要使用 setState 来改变状态，并且使用这个 API 也有一些坑点。并且 Vue 的底层使用了依赖追踪，页面更新渲染已经是最优的了，但是 React 还是需要用户手动去优化这方面的问题。


### 生命周期钩子函数

在 beforeCreate 钩子函数调用的时候，是获取不到 props 或者 data 中的数据的，因为这些数据的初始化都在 initState 中。

执行 created 钩子函数，在这一步的时候已经可以访问到之前不能访问到的数据，但是这时候组件还没被挂载，所以是看不到的。

执行 beforeMount 钩子函数，开始创建 VDOM

执行 mounted 钩子，并将 VDOM 渲染为真实 DOM 并且渲染数据。组件中如果有子组件的话，会递归挂载子组件，只有当所有子组件全部挂载完毕，才会执行根组件的挂载钩子。

数据更新时会调用的钩子函数 beforeUpdate 和 updated，分别在数据更新前和更新后会调用。

另外还有 keep-alive 独有的生命周期，分别为 activated 和 deactivated 。
用 keep-alive 包裹的组件在切换时不会进行销毁，而是缓存到内存中并执行 deactivated 钩子函数，命中缓存渲染后会执行 actived 钩子函数。

销毁组件的钩子函数 beforeDestroy 和 destroyed。前者适合移除事件、定时器等等，否则可能会引起内存泄露的问题。然后进行一系列的销毁操作，如果有子组件的话，也会递归销毁子组件，所有子组件都销毁完毕后才会执行根组件的 destroyed 钩子函数。

### 组件通信

- 父子组件通信
  - 典型的单向数据流，父组件通过 props 传递数据，子组件不能直接修改 props， 而是必须通过发送事件的方式告知父组件修改数据。
  - 语法糖 v-model 来直接实现，因为 v-model 默认会解析成名为 value 的 prop 和名为 input 的事件
  - 可以通过访问 $parent 或者 $children 对象来访问组件实例中的方法和数据
  - $listeners 属性会将父组件中的 (不含 .native 修饰器的) v-on 事件监听器传递给子组件，子组件可以通过访问 $listeners 来自定义监听器
  - .sync 属性是个语法糖 ` @update:value="v => value = v"` `this.$emit('update:value', 1)`
- 兄弟组件通信
  - `this.$parent.$children`，在 `$children` 中可以通过组件 `name` 查询到需要的组件实例，进行通信
- 跨多层级组件通信
  - provide / inject
- 任意组件
  -  Vuex
  -  Event Bus 


### extend 能做什么

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

### mixin 和 mixins 区别

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

### computed 和 watch 区别

TODO: 原理 重学vue-computed/watch

computed 是计算属性，依赖其他属性计算值，并且 computed 的值有缓存，只有当计算值变化才会返回内容。

watch 监听到值的变化就会执行回调，在回调中可以进行一些逻辑操作。

一般来说需要依赖别的属性来动态获得值的时候可以使用 computed，对于监听到值的变化需要做一些复杂业务逻辑的情况可以使用 watch。


### keep-alive 组件有什么作用

组件切换，保存一些组件的状态防止多次渲染，就可以使用 keep-alive 组件包裹需要保存的组件。

对于 keep-alive 组件来说，它拥有两个独有的生命周期钩子函数，分别为 activated 和 deactivated 

用 keep-alive 包裹的组件在切换时不会进行销毁，而是缓存到内存中并执行 deactivated 钩子函数，命中缓存渲染后会执行 actived 钩子函数

### v-show 与 v-if 区别
v-show 只是在 display: none 和 display: block 之间切换。无论初始条件是什么都会被渲染出来，后面只需要切换 CSS，DOM 还是一直保留着的。所以总的来说 v-show 在初始渲染时有更高的开销，但是切换开销很小，更适合于频繁切换的场景。

v-if 控制 Vue 底层的编译。当属性初始为 false 时，组件就不会被渲染，直到条件为 true，并且切换条件时会触发销毁/挂载组件，所以总的来说在切换时开销更高，更适合不经常切换的场景。

可以基于 v-if 实现惰性渲染机制，如局部骨架等在必要的时候才去渲染组件，减少整个页面的初始渲染开销。

### 组件中 data 什么时候可以使用对象

考的是 JS 功底

组件复用时所有组件实例都会共享 data，如果 data 是对象的话，就会造成一个组件修改 data 以后会影响到其他所有组件，所以需要将 data 写成函数，每次用到就调用一次函数获得新的数据。深浅拷贝

当我们使用 new Vue() 的方式的时候，无论我们将 data 设置为对象还是函数都是可以的，因为 new Vue() 的方式是生成一个根组件，该组件不会复用，也就不存在共享 data 的情况了

### 响应式原理(数据变化，视图自动变化)

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


### Object.defineProperty 的缺陷

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


### 编译过程

指vue文件的html部分模板()代码怎么编译成真实DOM的

- 将模板解析为 AST
- 优化 AST
- 将 AST 转换为 render 函数
- 👆 编译时
- 👇 浏览器运行时
- 执行 render 函数生成 Virtual DOM
- 映射为真实 DOM

### NextTick 原理分析

TODO: 重学vue-nextTick

nextTick 可以让我们在下次 DOM 更新循环结束之后执行延迟回调，用于获得更新后的 DOM。

Vue 2.4 之前都是使用的 microtasks
但是 microtasks 的优先级过高
在某些情况下可能会出现比事件冒泡更快的情况

但如果都使用 macrotasks 又可能会出现渲染的性能问题。所以在新版本中，会默认使用 microtasks
但在特殊情况下会使用 macrotasks，比如 v-on

对于实现 macrotasks ，会先判断是否能使用 setImmediate ，不能的话降级为 MessageChannel ，以上都不行的话就使用 setTimeout

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

黄老师的 [vue技术揭秘](https://ustbhuangyi.github.io/vue-analysis/)