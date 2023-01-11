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