> webpack的plugin机制是钩子，实现钩子🪝的方式，最容易想到的就是`发布订阅`了
> 埋下标识，再特定时机触发

但是webpack的🪝机制基于 [Tapable](https://github.com/webpack/tapable) 实现，有人说是

> 网上不少资料将 webpack 的插件架构归类为“**事件/订阅**”模式，我认为这种归纳有失偏颇。订阅模式是一种**松耦合架构**，发布器只是在特定时机发布事件消息，订阅者并不或者很少与事件直接发生交互，举例来说，我们平常在使用 HTML 事件的时候很多时候只是在这个时机触发业务逻辑，很少调用上下文操作。
> 
> 而 webpack 的插件体系是一种基于 `Tapable` 实现的**强耦合架构**，它在特定时机触发钩子时会附带上足够的上下文信息，插件定义的钩子回调中，能也只能与这些上下文背后的数据结构、接口交互产生 `side effect`，进而影响到编译状态和后续流程。
[源码解读-Webpack 插件架构深度讲解](https://zhuanlan.zhihu.com/p/367931462)


插件就是一个带有 `apply` 函数的类 👇
```js
class SomePlugin {
  apply(compiler) {}
}
```

## Tapable



> [插件式可扩展架构设计心得](https://zhuanlan.zhihu.com/p/372381276)

> [webpack loader 与plugin 开发实战 —— 点击 vue 页面元素跳转到对应的 vscode 代码](https://zhuanlan.zhihu.com/p/439960042)