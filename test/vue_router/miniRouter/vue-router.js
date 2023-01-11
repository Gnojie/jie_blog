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
        !location.pathname && (location.pathname = "/test/vue_router/miniRouter/");
        // 2. 当页面加载(首次访问/刷新)时 设置当前路由 history.current 的值
        window.addEventListener('load',()=>{
          console.log('history模式触发 onload 事件监听')
          this.history.current = location.pathname
        })
        // 3. 监听 popstate (浏览器后退前进) 设置当前路由 history.current 的值
        window.addEventListener("popstate",()=>{
          console.log('history模式触发 popstate 事件监听')
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
    Vue.component('router-link', { render(){}} )
    Vue.component('router-view', { render(){}} )
  }

  window.VueRouter = VueRouter
})()