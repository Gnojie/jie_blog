
## 概念
控制反转/依赖注入
插件系统常见设计模式，常用于面向对象编程

概念上(面向对象)
- 每一个实例对象都是依赖
- 不要让实例内部实例化所依赖的别的实例
- 使用一个统一的控制中心来实例化依赖

## class类实现

主体实例内部创建一个控制中心，通过控制中心处理依赖到的模块
```js
export default class App {
  static modules = [] // module约定为一个含有init函数的对象
  constructor() {
    this.init();
  }
  static use(module) {
    App.modules.push(module);
  }
  init() {
    App.modules.map(module => module.init(this));
  }
}
```

```js
export default { 
  init(app) {
    app.a = 'a'
  }
}
```

实例化主体实例时，编写相关依赖
```js
import a from './a.js'
import App from './app.js'

App.use(a)

const app = new App()
console.log(app)
```
👆 这样可以实现，拓展依赖或者修改已有依赖，需要配合修改的只有实例化主体实例的地方 `index.js`，而不需要修改主体实例的内部逻辑
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230101112651.png)


可以发现很像vue的插件机制
也像koa/express的中间件机制

## 函数式编程实现

函数式编程的宗旨是没有依赖，因此不存在依赖注入这种做法

但是在函数式编程里使用这种控制中心的思维还是很有用的

```js
export function createApp() {
  const modules = [] // module约定为一个含有init函数的对象

  const use = (module)=>{
    modules.push(module)
  }
  const run = ()=>{
    modules.map(module => module.init(app));
  }
  
  const app = {
    use,
    run
  }

  return app
}
```

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230101114426.png)



## vite的插件机制


## 总结

用户不需要关心生命周期和流程，只用写自己的模块，关心自己的业务，用容器来管理应用的整体，在抽象，还可以内置几大模块的基类，提供钩子给用户继承实现业务