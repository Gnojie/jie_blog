(()=>{
  // 存放当前路由信息
  class History{
    constructor() {
      this.current = null
    }
  }

  // new VueRouter 时初始化了对浏览器路由的监听逻辑
  class VueRouter{
    constructor(options) {
      this.mode = options.mode
      this.routes = options.routes

      this.history = new History()

      this.init()
    }

    init() {
      console.log('mode-->', this.mode)
      console.log('routes-->', this.routes)
      console.log('history-->', this.history)
      // 不同路由mode 区分处理浏览器路由逻辑 <-- this
      if(this.mode === 'hash') {
        // 1. 当前 URL 没有hash时初始化为 #/
        !location.hash && (location.hash = "/"); // xxx -> xxx#/
        // 2. 当页面加载(首次访问/刷新)时 设置当前路由 history.current 的值
        window.addEventListener("load",()=>{
          console.log('hash模式触发 onload 事件监听')
          this.history.current = location.hash.slice(1)
        })
        // 3. 监听 hashchange 设置当前路由 history.current 的值
        window.addEventListener("hashchange",()=>{
          console.log('hash模式触发 hashchange 事件监听')
          this.history.current = location.hash.slice(1)
        })
        return
      }
      if(this.mode === 'history') {
        // 1. 当前 URL 没有路径时初始化为 / 会重定向到静态服务器根路径(应该重定向到项目目录)
        !location.pathname && (location.pathname = "/");
        // 2. 当页面加载(首次访问/刷新)时 设置当前路由 history.current 的值
        window.addEventListener('load',()=>{
          console.log('history模式触发 onload 事件监听')
          this.history.current = location.pathname

          // 4. 遍历现有所有 a标签 绑定点击事件禁用原逻辑
          var linkList = document.querySelectorAll('a[href]')
          linkList.forEach(el => el.addEventListener('click', (e) => {
            e.preventDefault()
            // 5. 使用 `History API` 来跳转 `a标签` 上的 `href` 指定页面
            history.pushState(null, '', el.getAttribute('href'))
            // 调用 `history.pushState()` 或者 `history.replaceState()` 不会触发 `popstate` 事件
            this.history.current = location.pathname
          }))

        })
        // 3. 监听 popstate (浏览器后退前进) 设置当前路由 history.current 的值
        window.addEventListener("popstate",()=>{
          console.log('history模式触发 popstate 事件监听',location.pathname)
          this.history.current = location.pathname
        })
        return
      }

      console.log(`invalid mode: ${this.mode}`)
    }
  }

  // 把 `vueRouter` 作为 `VuePlugin` 注入 `Vue实例` 时挂载的全局组件/方法
  VueRouter.install = function(Vue) {
    console.log('Vue.use VueRouter.install')

    // install 执行时获取不到实例化后的 Router , 但是可以想办法获取到未来的 Router
    Vue.mixin({
      beforeCreate() {
        if(this.$options?.router) {
          console.log('根组件实例$options有router-->', this)
          // Vue.prototype.$router = this.$options.router
          this._router = this.$options.router

          Vue.util.defineReactive(this, "xxx", this._router.history)
        }
      }
    })

    // 全局注册组件 `<router-view>`、`<router-link>`
    Vue.component('router-link', {
      props:{
        to:String // 目标路由
      },
      render(h){
        // ❕ 记得 return
        return h('a', { attrs: {href: this.to} }, this.$slots.default)
      }
    })
    Vue.component('router-view', {
      render(h){
        // load 的时候先触发render 此时 URL 没有设置为默认的 / 将匹配不到页面组件
        // 还是要 $route 变化触发本组件的 render
        const {_router} = this.$root // 根组件上实例化后的 Router
        let {current} = _router.history // 当前路由信息 响应式数据
        // 匹配对应的页面组件并渲染
        const {component} = _router.routes.find(item=>item.path === current) || {}
        console.log('router-view 渲染-->', current,component)
        return h(component)
      }
    })
  }

  window.VueRouter = VueRouter
})()