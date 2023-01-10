[手写Vue-router核心原理，再也不怕面试官问我Vue-router原理](https://cloud.tencent.com/developer/article/1880448)

[vue-router源码分析-整体流程](https://github.com/DDFE/DDFE-blog/issues/9)


[【源码拾遗】从vue-router看前端路由的两种实现](https://zhuanlan.zhihu.com/p/27588422)


[vueRouter4 源码系列](https://juejin.cn/column/7140106983243251726)


👇 测试代码( `Vue2` 和 `VueRouter2` 都通过 `CDN` 引入 `UMD` 模块化风格资源)
```js
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Home = { template: '<div>home</div>' }
const Foo = { template: '<div>foo</div>' }

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', component: Home },
    { path: '/foo', component: Foo },
  ]
})

new Vue({
  router,
  template: `
    <div id="app">
      <h1>Basic</h1>
      <ul>
        <li><router-link to="/">/</router-link></li>
        <li><router-link to="/foo">/foo</router-link></li>
        <router-link tag="li" to="/foo">/foo</router-link>
      </ul>
      <router-view class="view"></router-view>
    </div>
  `
}).$mount('#app')
```

👇 `Vue.use(VueRouter)` 对应的插件结构

`install` 里要用到 `this` , 不能用箭头函数

```js
export default class VueRouter {
  
}

function install(vue) { }

VueRouter.install = install
```

👇 等价于

```js
export default {
  install(vue){

  }
}
```

`install` 函数设置为 单例模式 (函数式的单例)

限制调用 Vue实例插件机制调用 `install` 只能调一次
```js
function install (Vue) {
  if (install.installed) return

  install.installed = true
}
```

`vue` 的插件机制，允许我们往 `Vue实例` 上挂载东西

我们需要把 `vue实例` 上的 `_router` 和 `_route` 拷贝一份为 `$router` 和 `$route`

🤔 这...只是为了代码规范限制不要用 `_` 开头的内置变量/函数？

🤔 `Object.defineProperty` 的目的是什么, 普通的赋值不行吗？ `Vue.$router = this.$root._router`

```js
function install(Vue) {
  // 注入 $router $route
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this.$root._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this.$root._route }
  })
}
```

全局注册组件 `<router-view>`、`<router-link>`

> 这也是业务代码中常用的 全局注册组件 的 `Vue Plugin` 逻辑

```js
// router-view router-link 组件
import View from './components/view'
import Link from './components/link'

function install(Vue) {
  // 函数式单利
  // ...

  // 注入 $router $route
  // ...

  // 注册全局组件
  Vue.component('router-view', View)
  Vue.component('router-link', Link)
}
```

`Vue.mixin` 往所有组件中注入生命周期逻辑

```js
Vue.mixin({
  beforeCreate () {
    // 判断是否有 router
    if (this.$options.router) {
      // 赋值 _router
      this._router = this.$options.router

      // 初始化 init
      this._router.init(this)

      // 定义响应式的 _route 对象
      Vue.util.defineReactive(this, '_route', this._router.history.current)
    }
  }
})
```

- `this.$root._router`
- `this.$options.router`
  - `.init()`
  - `.history.current`
- `Vue.util.defineReactive()`

TODO: 太多不清楚的内部变量了 `this.$options.router` 是啥 `$option` 上一般是 `SFC` 文件中的 选项式API 的 key, 没听说过有 `router` 啊？

👆 是用于非 `plugin` 调用形式( `app.use()`)

而是作为一个参数传递

```js
const vueRouter = new VueRouter([])

new Vue({
  router: vueRouter
})
```

编写 `hash/history` 路由机制

`new Router()` 的时候会传入路由配置清单
```js
export default class VueRouter {
  constructor( routerOptions ) {
    this.routes = routerOptions.routes || []
    this.mode = routerOptions.mode || 'hash'

    if (this.mode === "hash") {
      // 先判断用户打开时有没有hash值，没有的话跳转到#/
      location.hash? '':location.hash = "/";

      window.addEventListener("load",()=>{
        this.history.current = location.hash.slice(1)
      })
      window.addEventListener("hashchange",()=>{
        this.history.current = location.hash.slice(1)
      })
      return
    }

    if(this.mode === 'history') {
      location.pathname? '':location.pathname = "/";

      window.addEventListener('load',()=>{
        this.history.current = location.pathname
      })
      window.addEventListener("popstate",()=>{
        this.history.current = location.pathname
      })
      return
    }

    console.log(`invalid mode: ${mode}`)
  }
}
```

👆 2种 `mode` 对应的逻辑，就是 [重学vue-router原理](./重学vue-router原理.md) 的原理

代码看起来比讲原理时简单，是因为
- `history` 时, 不做a标签的拦截默认事件
- `hash/history` 监听到 URL 上目标页面,只用存起来,而不用像原理文章中那样操作 DOM

原理文章中用了 `DOMContentLoaded` 而不是 `load`

🤔 区别
