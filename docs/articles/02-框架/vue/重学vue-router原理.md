# VueRouter 原理

## 手写前端路由背景

首先不局限在 `Vue` 框架里，扩大一点，前端为什么需要路由 `router`

通过不同的 `URL` 访问到不同的前端内容, 是前端在静态服务器中自带的功能(由静态服务器实现)

> 🤔 为什么现代前端应用还要手动 `Js` 实现路由逻辑？

> 前端路由一般是在 SPA 单页应用里才需要手动实现的。
> 
> 这是因为单页应用的概念就是希望页面不 `reload` 而是局部渲染页面。这就限制了不能由静态服务器来通过 `URL` 加载前端页面(会 `reload`)

> 👆 此时就产生了手动 `Js` 实现单页应用的页面加载路由逻辑需求

## 手写前端路由实现思路

因此有2个大难点：
1. 拦截浏览器原生的 切换 `URL`, 由自己 `Js` 实现的路由逻辑渲染目标页面内容
2. 禁用浏览器原生的 切换 `URL` 访问前端页面，防止 `reload` 整个单页

🤔 从这2个难点思考, 因为我们切换页面渲染逻辑只能通过 `URL` 变化, 并且 `URL` 能指出目标页面

👇 那就只能找 `URL` 变化但是不会触发浏览器 `reload` 的方法：
1. `URL Hash`
   - `hash` 是 `URL` 中 `#` 及后面的那部分，常用作锚点在页面内进行导航
   - 改变 `URL` 中的 `Hash` 部分不会引起页面刷新
   - `URl Query Params` `?` 参数的形式，会引起页面刷新 ❕
2. `Window History API`

## URL Hash

👆 我们知道 `URL Hash` 是不会引起浏览器页面刷新的, 因此不需要 `Js` 手动实现禁止 `页面reload`

只需要 `Js` 实现拦截 `URL` 变化，并按照指定页面渲染即可

拦截 `URL Hash` 变化可以通过监听 [hashchange](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/hashchange_event) 事件(由浏览器 `window` 事件监听器 `EventListener` 提供的 `API` 实现)

👇 原生 `HTMl/JS` 实现
```html
<html>
<body>
  <!-- 1. 通过a标签触发 URL 变化, 省去 Js 写跳转逻辑 -->
  <ul>
    <li><a href="#/home">home</a></li>
    <li><a href="#/about">about</a></li>
  </ul>

  <!-- 2. 根据 URL Hash 显示的页面内容 placeholder -->
  <!-- 当然可以不用 placeholder 直接往 body 下加 DOM -->
  <div id="routeView"></div>
</body>
<script>
let routerView = routeView

// 3. 监听 Hash 切换
window.addEventListener('hashchange', ()=>{
  let hash = location.hash; // 取出 URL 上的 Hash
  routerView.innerHTML = hash // 根据 Hash 渲染相应的页面内容 这一步可引入 Vue 组件
})

</script>
</html>
```

另外还需要处理边界问题，`URL` 首次加载页面 不会触发 `hashchange` 

👇 因此需要 `Js` 手动实现监听首次加载 [DOMContentLoaded](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/DOMContentLoaded_event) 触发一次 `Hash` 逻辑

```js
// 4. 监听 页面首次加载 load
window.addEventListener('DOMContentLoaded', ()=>{
  if(!location.hash) {
    // 如果不存在hash值，那么重定向到 #/ 并触发 hashchange 因此不用写渲染逻辑
    location.hash = "/"
  } else {
    // 根据 Hash 渲染相应的页面内容 这一步可引入 Vue 组件
    let hash = location.hash;
    routerView.innerHTML = hash
  }
})
```

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/hashrouter1.gif)

## History API

`History` 模式下，直接修改 `URL` 会触发页面 `reload`

通过 `History API` 修改 `URL` 则不会触发页面 `reload`

> `history.pushState()` 方法向当前浏览器会话的历史堆栈中添加一个状态（state） - [MDNs](https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState)


因此 `a标签` 的跳转, 需要禁用原逻辑, 而其他 `Js` 触发的跳转(如按钮逻辑)则需要限制只能用 `History API`

👇 页面首次加载 `load` 的时候, 遍历现有所有 `a标签` 绑定点击事件禁用原逻辑
```js
window.addEventListener('DOMContentLoaded', onLoad)

function onLoad () {
   var linkList = document.querySelectorAll('a[href]')
  //  遍历现有所有 a标签 绑定点击事件禁用原逻辑
   linkList.forEach(el => el.addEventListener('click', function (e) {
      e.preventDefault()
   }))
}
```
👆 除了要禁用 `a标签` 原逻辑, 还要做新的跳转逻辑

1. 也就是使用 `History API` 来修改 `URL` 为 `a标签` 上的 `href`
2. 手动根据 URL 渲染对应页面
```js
function onLoad () {
   var linkList = document.querySelectorAll('a[href]')
   // 遍历现有所有 a标签 绑定点击事件禁用原逻辑
   linkList.forEach(el => el.addEventListener('click', function (e) {
      e.preventDefault()
      // 使用 `History API` 来跳转 `a标签` 上的 `href` 指定页面
      history.pushState(null, '', el.getAttribute('href')) // <-- this
      // 手动根据 URL 渲染对应页面 监听 popstate 不会触发 下面会提到
      routerView.innerHTML = location.pathname // <-- this
   }))
}
```

👇 同样的，首次加载也不会触发路由监听 因此需要 手动渲染首次加载时的 `URL` 对应的页面内容
```js
function onLoad () {
   // 根据首次加载时的 URL 渲染对应的页面内容
   routerView.innerHTML = location.pathname // <-- this

   var linkList = document.querySelectorAll('a[href]')
   // 遍历现有所有 a标签 绑定点击事件禁用原逻辑
   linkList.forEach(el => el.addEventListener('click', ()=>{}))
}
```

👆 至此, 我们实现了跳转, `URL` 变化不触发页面 `reload`

浏览器测试时会发现 `pushState` 不允许在本地文件系统的源中使用
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230110131540.png)

👇 我们用一个静态服务器打开这个 `HTML` 文件
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/historyrouter2.gif)

👆 可以看出跳转不会触发 `reload` 但是浏览器的前进后退没有根据 `URL` 渲染相应的页面内容，而且在跳转后的路径刷新时, 这个静态服务器会报 `404`


> 每当激活同一文档中不同的历史记录条目时，`popstate` 事件就会在对应的 `window` 对象上触发。如果当前处于激活状态的历史记录条目是由 `history.pushState()` 方法创建的或者是由 `history.replaceState()` 方法修改的，则 `popstate` 事件的 `state` 属性包含了这个历史记录条目的 `state` 对象的一个拷贝。 - [popstate - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/popstate_event)

> 调用 `history.pushState()` 或者 `history.replaceState()` 不会触发 `popstate` 事件。`popstate` 事件只会在浏览器某些行为下触发，比如点击后退按钮（或者在 `JavaScript` 中调用 `history.back()` 方法）。即，在同一文档的两个历史记录条目之间导航会触发该事件。

👇 监听 `popstate` 浏览器后退前进触发根据 `URL` 渲染相应的页面内容
```js
window.addEventListener('popstate', ()=>{
  routerView.innerHTML = location.pathname
})
```

至此就实现了 `history` 模式的路由机制了

但是刷新的 **静态服务器** `404` 问题，需要静态服务的 `nginx` 配置一下如：符合某个目录下的路径(当然也可以所有静态服务器路径)都重定向到 `单页应用根html` 资源, 由 `Js` 路由机制渲染正确的页面

👇 原生 `HTMl/JS` 实现
```html
<html>
<body>
   <!-- 1. 通过a标签触发 URL 变化, 省去 Js 写跳转逻辑 -->
   <ul>
      <li><a href='/home'>home</a></li>
      <li><a href='/about'>about</a></li>
   </ul>

   <!-- 2. 根据 URL Hash 显示的页面内容 placeholder -->
   <!-- 当然可以不用 placeholder 直接往 body 下加 DOM -->
   <div id="routeView"></div>
</body>
<script>
  let routerView = routeView
  // 3. 监听页面首次加载
  window.addEventListener('DOMContentLoaded', onLoad)
  function onLoad () {
      // 6. 根据首次加载时的 URL 渲染对应的页面内容
      routerView.innerHTML = location.pathname
      // 4. 遍历现有所有 a标签 绑定点击事件禁用原逻辑
      var linkList = document.querySelectorAll('a[href]')
      linkList.forEach(el => el.addEventListener('click', function (e) {
         e.preventDefault()
         // 5. 使用 `History API` 来跳转 `a标签` 上的 `href` 指定页面
         history.pushState(null, '', el.getAttribute('href'))
         routerView.innerHTML = location.pathname
      }))
  }

  // 7. 监听 `popstate` 浏览器后退前进触发根据 `URL` 渲染相应的页面内容
  window.addEventListener('popstate', ()=>{
      routerView.innerHTML = location.pathname
  })
</script>
</html>
```

## 补充

- 上面都是通过 `a标签` 跳转的, 但是2种模式的跳转是截然不同的! `hash` 时就是 `a标签` 默认事件直接修改 `URL`, 但是 `history` 时是手动改写成我们封装的跳转事件
- `History API` 除了 [pushState](https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState) 还有 [replaceState](https://developer.mozilla.org/zh-CN/docs/Web/API/History/replaceState)
- 本文只是讲解 `Vue` 路由(前端路由)的实现所基于的底层逻辑
- `VueRouter` 还把这些路由模式封装成一个 `Class类` 以及提供渲染组件的功能, 并通过 `Vue plugin` 的形式抛出 - 这部分为 [VueRouter源码分析](./源码分析-vueRouter.md)
- 上面原生 `HTML/JS` 实现的源码 [html代码](https://github.com/luojinan/note-by-vitepress/tree/master/test/vue_router)
