
Vue是渐进式框架

最基础的功能往外按需使用生态

最基础的是模版引擎，数据驱动视图，往外开始需要到组件复用视图和数据关系，再往外需要路由解决打多页面问题，再往外是各种生态

从最基础的数据驱动视图看Vue的本质

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
      }
    };

    new Vue(config);
  </script>
</body>
</html>
```
![](https://gitee.com/luojinan1/markdown-img/raw/master/20220303233115.png)

> 题外话: CDN的vue资源读取第二次是取缓存，这个缓存是谁做的?怎么做到的?如果我现在断网还能不能获取到?如果vue的版本更新了这个CDN地址怎么办?用户手动清除缓存吗?请求头里的强缓存时间是7天,7天之后Vue没有版本更新也要重新获取资源吗?

从上面的js的效果可以看出，vue做的事情就是把`data`和`template`的配置项结合覆盖到目标`el`中

我们可以尝试写出这种效果来
## Vue的模版引擎功能

### 为什么要包成闭包
我们来写多几个js，如果不包在闭包里面，各自js中的变量就会互相冲突

闭包为什么能解决变量污染的问题
FIXME: 因为js运行是有作用域的，块级作用域、行内作用域(是不是有点像css的会分行的块状元素和不会分行的行内元素)
闭包里利用的是外部无法访问函数内部的机制，也就是手动限制了作用域

TODO: 说到变量污染了，再来看看变量提升
```js
console.log(a) // 不是有变量提升吗？为什么会报a未定义
let a = '1'
```


### 模块化的形式
> 可以看到写成闭包，并且挂载实例到window全局变量中，这就是UMD的模块化形式

单纯立即执行函数中挂载全局变量
```js
(()=>{
  window.Vue = Class
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

UMD: 举例

挖坑

## 参数为什么不用this

## class的语法
有人会在业务代码里面写class吗
class简介
构造函数简介

两者没有区别

new写起来帅一点
那么new做了什么

浏览器不支持class的时候，babel的作用


## 模版字符串解析`{{}}`

> 先尝试思考一下算法思路
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
let value=str.replace(/\{\{(.+?)\}\}/g,(...args)=>{
  eturn getValue(args[1])
})
function getValue(val){
  return val.split('.').reduce((data,currentVal)=>{
    return data[currentVal]
  },data)
}
```


## vue3为什么要舍弃OptionsApi 改为CompositionApi

## 最基础的功能是数据驱动视图，那和以往用模版语法写页面有什么区别呢？都是用js来写页面

---


template参数和render二选一



el参数和$mount()二选一
```js
// 1. new Vue实例时传递目标el，直接开始渲染
new Vue({template,el:'#app'})

// 2. new Vue实例时不传入目标el，vue实例还是会做很多初始化操作成为一个vue实例对象
// 此时调用实例对象的$mount方法，做到延时挂载的效果，或者拦截vue实例做一些额外操作
const app = new Vue({template})
app.$mount('#app')
```

## Vue的数据驱动视图作用

react、小程序
```js
const data = {a:'1'}
setData({a:'2'})

setData(newData) {
  Object.assign(data,newData)
  render()
}

render() {
  dealHtml() // 结合template和data 得到新的html来innerHtml渲染
}
```