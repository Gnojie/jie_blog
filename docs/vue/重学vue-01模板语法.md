
## 基本概念
Vue是渐进式框架

从最基础的功能往外按需使用生态

最基础的是模版引擎，数据驱动视图，往外开始需要到组件复用视图和数据关系，再往外需要路由解决打多页面问题，再往外是各种生态

我们从最基础的数据驱动视图看Vue的本质

```html
<html>
<body>
  <div id="app"></div>
  <script src="cdn/vue.js"></script>

  <script>
    const config = {
      el: '#app',
      template: '<h1>{{title}}</h1>',
      data: {
        title: '标题'
      }··
    };

    new Vue(config);
  </script>
</body>
</html>
```
效果如👇
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220303233115.png)

## vue对外的资源js为什么这么多版本
> 👆 选择使用CDN的形式引入vue资源

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220305234509.png)

**CDN上vue对外的包为什么分这么多种？**
- 开发版、生产版(压缩版/mini版)
- 完整版、运行时版(runtime)
- CJS版、ESM版、UMD版

### 开发版、生产版(压缩版/mini版)
> `CommonJS` 和 `ES Module` 版本是用于打包工具的，因此我们不提供压缩后的版本。你需要自行将最终的包进行压缩。

TODO: 但是压缩代码不是会设置忽略`node_modules`的吗?所以我们现在生产上的代码是引入时就压缩了，还是打包时压缩的？

### 完整版、运行时版(runtime)
- 编译器：用来将模板字符串编译成为 JavaScript 渲染函数的代码。
- 运行时：用来创建 Vue 实例、渲染并处理虚拟 DOM 等的代码。基本上就是除去编译器的其它一切。
- 完整版：编译器+运行时

当使用 `vue-loader` 或 `vueify` 的时候，`*.vue` 文件内部的模板会在构建时预编译成 `JavaScript`(render函数)

最终打好的包里实际上是不需要编译器的，所以只用运行时版本即可

因为运行时版本相比完整版体积要小大约 30%，所以应该尽可能使用这个版本,打包工具引入的资源默认是运行时版本的

CDN的默认是完整版，我们试着改成runtime版 👇
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220313215927.png)


```js
import Vue from 'vue' // 配置打包工具的资源别名指向具体的资源版本
import App from './App'
// 需要编译器
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})

// 不需要编译器
new Vue({
  el: '#app',
  render: h => h(App)
})
```
👆 看出编译器用于把`template`配置相中的字符串在运行时编译成`渲染函数/vNode`,如果不写`template`，而是写`reander`就不需要编译

真实场景不会直接用`template`，但是也不会直接用`render`，而是写`.vue`文件，依赖`vue-loader`在编译阶段把模版`<template>`编译成`render`

> TODO: 理论上`vue-loader`只在编译阶段用，分包把依赖单独打包时，却发现打包产物中有`vue-loader`??

### TODO: 为什么ESM要分为浏览器版和nodejs版

ES Module：从 2.6 开始 Vue 会提供两个 `ES Modules (ESM)` 构建文件：
- 为打包工具提供的 `ESM`：为诸如 `webpack 2` 或 `Rollup` 提供的现代打包工具。ESM 格式被设计为可以被静态分析，所以打包工具可以利用这一点来进行“tree-shaking”并将用不到的代码排除出最终的包。为这些打包工具提供的默认文件 (pkg.module) 是只有运行时的 `ES Module` 构建 (`vue.runtime.esm.js`)。
- 为浏览器提供的 `ESM` (2.6+)：用于在现代浏览器中通过 `<script type="module">` 直接导入。

---
> 题外话: CDN的vue资源读取第二次是取缓存，这个缓存是谁做的?怎么做到的?如果我现在断网还能不能获取到?如果vue的版本更新了这个CDN地址怎么办?用户手动清除缓存吗?请求头里的强缓存时间是7天,7天之后Vue没有版本更新也要重新获取资源吗?
---
## Vue的模版引擎功能

从上面运行结果可以看出，vue做的事情就是把`data`和`template`的配置项结合覆盖到目标`el`中

我们可以尝试写出这种效果来

### 为什么要包成闭包
我们来写多几个js，如果不包在闭包里面，各自js中的变量就会互相冲突

[闭包为什么能解决变量污染的问题](../js/闭包与垃圾回收.md)

闭包的缺点：
- 内存泄漏

> 题外话：明明浏览器V8引擎有垃圾回收机制，为什么还会溢出，垃圾回收有没有作用

TODO: 说到变量污染了，再来看看变量提升
```js
console.log(a) // 不是有变量提升吗？为什么会报a未定义
let a = '1'
```


### 模块化的形式
> 写成闭包之后要做到是挂载实例到window全局变量中
> 怎么挂到到全局变量，又有几种方式，我们看看vue2的方式是UMD的
> 先看看UMD的模块化形式概念

单纯立即执行函数中挂载全局变量
```js
(()=>{
  window.Vue = Class
  // var Vue = Class // 是不是全局变量？
})()
```
兼容不同环境的全局变量，把全局变量写为this，传递进来挂载
```js
((globalEnv)=>{
  globalEnv.Vue = Class
})(this)
```
把要挂载的对象也作为参数传递进来，原因是为了结构更通用、模块化逻辑分离业务逻辑
```js
((globalEnv, something)=>{
  globalEnv.Vue = something
})(this,Class)
```
模块化逻辑+识别AMD模块化的逻辑
```js
((globalEnv, something)=>{
  if(typeof define === 'function' && define.amd){
    console.log('是AMD模块规范，如require.js')
    define(something)
  }else if (typeof module === 'object' && module.exports) {
      module.exports = something;
    } else{
    globalEnv.Vue = something
  }
})(this,Class)
```

UMD: Vue2、JQuery...

> 再来看看vue3的CDN

vue3的CDN资源
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220305233901.png)

```js
var Vue = (()=>{ return class })
```
👆 用闭包限制内部变量的同时又挂在全局变量上

IIFEs vs UMD ？
- UMD 兼容其他形式的模块化，`require('cdn/xx')`等
- IIEFs不能这么引用
- IIEFs只能用于html加载，连nodejs环境引入也没用

> 思考🤔: Vue3为什么不考虑支持UMD
- UMD主要用于让资源同时支持nodejs和浏览器环境，现在更推荐用ESM即可(需要本地启WEB服务)


## 参数为什么不用this
```js
((this)=>{ // 这个参数为什么不能写this？
  this.Vue = class
})(this)
```
js规定形参不能用内部语法/变量命名

## Vue构造函数
有人会在业务代码里面写class吗
class简介
构造函数简介

两者没有区别

new写起来帅一点
那么`new Vue()`做了什么，[new的原理](../interview/手写系列-new原理.md)
既然Vue是一个构造函数，如果直接`Vue()`会怎样

浏览器不支持class的时候，babel的作用


## 模版字符串解析 { { } }

> 先尝试思考🤔一下算法思路
```js
function test(text) {
  console.log(text)
  // 先从数据类型看，字符串找到{{}}的方法是indexof
  // 用indexof找可以吗？可以
  const start = text.indexOf('{{')
  const end = text.indexOf('}}')
  const replaceEnd = end+2
  const target = text.slice(start,replaceEnd)
  const newText = text.replace(target,'成功替换啦')
  console.log(newText)
}
test('<div>{{msg}}</div><p>{{}}</p>')
```

问题是字符串的方法没办法匹配多个值
或者循环替换

用正则

```js
let value=str.replace(/\{\{(.+?)\}\}/g,(match, item)=>{
  eturn getValue(item)
})
function getValue(val){
  return val.split('.').reduce((data,currentVal)=>{
    return data[currentVal]
  },data)
}
```

---
> 题外话，搜索`算法 括号` 找到[leetcode](https://leetcode-cn.com/problems/valid-parentheses/)上的匹配有效括号算法题看看

[有效括号校验](/interview/算法01.html#有效括号校验)

---

## 最终实现代码
```js
((globalEnv,something)=>{ // 参数命名为this行不行
  globalEnv.Vue = something
})(this, class Vue{
    constructor({el,data,template}) {
      console.log('创建一个Vue')
      this.el = el
      this.data = data
      this.template = template

      this.dealDataTemp() // 结合data,template 生成dom覆盖到目标el
    }

    dealDataTemp() {
      // '<h1>{{title}}</h1>' ==> '<h1>xx</h1>'
      const newHtml = this.template.replace(/\{\{(.+?)\}\}/g,(match,item)=>{
        return this.getValue(item)
      })
      this.render(newHtml)
    }

    getValue(val){
      return val.split('.').reduce((pre,next)=>{
        return pre[next]
      },this.data)
    }
    render(html) {
      const rootDom = document.querySelector(this.el);
      rootDom.innerHTML = html
    }
  }
)
```
或者
```js
var Vue = (()=>{
  return class
})()
```


## 当我们说创建vue实例用template参数和render时我们在说什么
> template参数和render二选一,都能达到挂载渲染页面的效果
> 
> 两者最大的区别是，引入的vue资源要完整版还是runtime版

## el参数和$mount()二选一
```js
// 1. new Vue实例时传递目标el，直接开始渲染
new Vue({template,el:'#app'})

// 2. new Vue实例时不传入目标el，vue实例还是会做很多初始化操作成为一个vue实例对象
// 此时调用实例对象的$mount方法，做到延时挂载的效果，或者拦截vue实例做一些额外操作
const app = new Vue({template})
app.$mount('#app')
```
vue-cli脚手架做法
```js
import Vue from 'vue'
import App from './App.vue'

new Vue({
  render:h=>h(App)
}).$mount('#app')
```
👆 为什么脚手架要用$mount而不是配置参数el呢？



## vue3为什么要舍弃OptionsApi 改为CompositionApi


TODO：
- [ ] 变量提升
- [ ] 变量作用域
- [ ] class与构造函数
- [ ] new