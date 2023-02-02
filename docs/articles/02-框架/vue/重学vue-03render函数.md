## 前情提要

按照vue的官方文档，本应先看vue的指令(`v-model、v-show、v-for`...)
这里在讲指令之前，我们先讲vue的`render函数`，因为vue的指令解析之后就是作用于`render函数`

> [Vue 推荐在绝大多数情况下使用模板来创建你的 HTML。然而在一些场景中，你真的需要 JavaScript 的完全编程的能力。这时你可以用渲染函数，它比模板更接近编译器。](https://cn.vuejs.org/v2/guide/render-function.html)

要理解render就要知道Vue的DOM渲染过程

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220316194111.png)

👆我们知道Vue用的是`虚拟DOM`渲染成`真实DOM`(关于`虚拟DOM`的意义、性能`，我们会另外分析)
> 我们把这样的节点描述为`“虚拟节点 (virtual node)”`，也常简写它为`“VNode”`
> 
> `“虚拟 DOM”`是我们对由 `Vue` 组件树建立起来的整个 `VNode 树`的称呼
- `VNode`: 虚拟节点
- `虚拟DOM`: `虚拟DOM`树(由各种虚拟节点组成)

👆 官方文档对`虚拟DOM`的解释，我们需要知道`虚拟DOM`并不是Vue独有的东西
仅仅是概念，不影响我们对整体的学习，但是我们还是区分好以免造成概念混淆

---
**思考🤔**
- 那我们平时写的代码就是`虚拟DOM`了吗？
- `虚拟DOM`渲染真实DOM的步骤发生在哪里呢？


我们平时写的代码是`.vue`文件的`<template>`模版
或者像前面讲解Vue的模板语法功能的示例代码，写`new Vue`的配置项`template:'<p>123</p>'`
很明显，这些都不是VNode，也不是真实DOM

我们写出来的`.vue`文件会经过打包工具如`webpack`的解析(借助`vue-loader`)，打包成`render函数`的js

打包上线后，浏览器执行这段`render函数`生成VNode，再由vue内部决定在什么时机渲染成真实DOM

注意: 容易有的误区，我们常用的vue库版本是runtime版，这个版本不支持直接写template的代码渲染成真实DOM，[vue对外的资源js为什么这么多版本](./重学vue-01模板语法.html#`、运行时版-runtime)中我们尝试用runtime版运行模版语法会报错，runtime版只能通过`render函数`渲染出真实DOM

---

## 写一个不考虑虚拟dom的render
```js


```

> 我们现在先把注意力放在单个的`虚拟节点`上，不考虑树状`虚拟DOM`的数据协作(后面再补)


下面用`VNode`指代`虚拟节点`
## render参数对象

[渲染函数&JSX - 官方文档](https://cn.vuejs.org/v2/guide/render-function.html#深入数据对象)

注意的写渲染函数不支持vue的语法糖指令

另外，渲染函数执行后返回的是一个`VNode`对象

我们可以打印一下 `VNode`
```js
const config = {
  el: '#app',
  render:(h)=>{
    const VNode = h('h1',{},'测试render')
    console.log(Vnode)
    return VNode // 注意render配置项 函数要返回VNode
  }
};
const app = new Vue(config)
```

👆 可以看到一个`VNode`里面是带着真实DOM的，所以虚拟DOM并没有办法脱离真实DOM的范畴，并且在浏览器内存中存着一份真实DOM
甚至绕过虚拟DOM,直接操作DOM性能会更好

思考🤔: 虚拟DOM到底有什么好处

## 写render和template的区别
就像官方文档说的，一般我们不关心`render函数`，也不关心`VNode`、`真实DOM`

但是官方还是把render开放出来给我们使用，并列举了一些使用场景

如果单论我们开发时应该写`render函数`还是写模版`template`，我们来分析一下区别：

- 优点
  - 因为最终打包后的代码都是`render函数`,所以写`template`需要打包的编译耗时,render会减少打包时间
  - 特定场景下，利用js比起用template可以更好的编写内容
- 缺点
  - 额外的学习成本
  - 需要自己实现vue在模版上提供的语法糖,如`v-show`、`v-model`

注意: 容易有的误区，写 `render函数` 并不会提升代码**运行时的速度**

## JSX
> 起源于`react`，用`html`语法写成js的`render`

有趣的是:
- 我们为了在`js`中写`html`，而引入`模版语法`
- 现在又为了在`js`中用`html`语法，而引入`jsx语法`

### 转译
> `jsx`并不是浏览器或者`nodejs`环境认识的语法，因此需要转译工具的帮忙

- 在`react`中，是用`.jsx`文件配合`babel`，转译成`render函数`
- 在`vue`中，是用`.vue`文件，配合原来的`vue-loader`外加vue的`jsx-babel`,转译成`render函数`

到这里，我们再来捋一下vue的几种转译流程

1. `runtime版`vue，在开发阶段直接就写`render函数`，给浏览器运行
2. `runtime版`vue，写`template`，通过打包工具转译为`render函数`，给浏览器运行
3. `完整版`vue，写`template`，在浏览器运行时，通过库内的`vue.complier`解析`template`成`render函数`
4. 与vue版本无关，开发阶段写render并用`jsx语法`，通过打包工具转译成`render函数`，给浏览器运行

思考🤔：现在的工程支不支持写`jsx`，支持的话，是怎么配置打包工具来支持的？

## 函数式组件
> 在vue3中废弃

优点：
- 组件初始化，轻量
  - 没有组件实例化(`new vnode.componentOptions.Ctor(options)`)，函数式组件获取VNode仅仅是普通函数调用
  - 无公共属性、方法拷贝
  - 无生命周期钩子调用
- DOM树渲染、更新速度快(直接挂载到父组件中，缩短首次渲染、diff更新路径)
  - 父组件生成VNode时，函数式组件render方法会被调用，生成VNode挂载到父组件children中，patch阶段可直接转换成真是DOM,普通组件则在createElm时，走组件初始化流程。
  - diff更新时，函数式组件调用render，直接创建普通VNode，而普通组件创建的VNode的是包含组件作用域的，diff操作时，还有额外调用updateChildComponent更新属性、自定义事件等，调用链路会比较长。
