按照vue的官方文档，本应看vue的指令(v-model、v-show、v-for...)
这里在讲指令之前，我们先讲vue的render函数，因为vue的指令解析之后就是作用于render函数

[Vue 推荐在绝大多数情况下使用模板来创建你的 HTML。然而在一些场景中，你真的需要 JavaScript 的完全编程的能力。这时你可以用渲染函数，它比模板更接近编译器。](https://cn.vuejs.org/v2/guide/render-function.html)

要理解render就要知道Vue最终渲染的过程
我们知道Vue用的是虚拟DOM(关于`虚拟DOM的意义、性能`，我们会另外分析)
- 那我们平时写的代码就是虚拟DOM了吗？
- 虚拟DOM渲染真实DOM的步骤发生在哪里呢？

下面用VNode指代虚拟DOM

我们平时写的代码是`.vue`文件的`<template>`模版
或者像前面讲解Vue的模板语法功能的示例代码，写`new Vue`的配置项`template:'<p>123</p>'`
很明显，这些都不是VNode，也不是真实DOM

我们写出来的`.vue`文件会经过打包工具如`webpack`的解析(借助`vue-loader`)，打包成render函数的js

打包上线后，浏览器执行这段render函数生成VNode，再由vue内部决定在什么时机渲染成真实DOM

注意: 容易有的误区，我们常用的vue库版本是runtime版，这个版本不支持直接写template的代码渲染成真实DOM，[vue对外的资源js为什么这么多版本](./重学vue-01模板语法.html#完整版、运行时版-runtime)中我们尝试用runtime版运行模版语法会报错，runtime版只能通过render函数渲染出真实DOM


就像官方文档说的，一般我们不关心render函数，也不关心VNode、真实DOM

但是官方还是把render开放出来给我们使用，并列举了一些使用场景

如果单论我们要写render函数还是写模版`template`

优点
- 因为最终打包后的代码都是render函数,所以写`template`需要打包的编译耗时,render会减少打包时间
- 特定场景下，利用js比起用template可以更好的编写内容

缺点
- 额外的学习成本
- 需要自己实现vue在模版上提供的语法糖,如`v-show`、`v-model`

注意: 容易有的误区，写render函数并不会提升代码运行时的速度