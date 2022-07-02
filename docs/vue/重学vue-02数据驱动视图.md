## 最基础的功能是数据驱动视图，那和以往用模版语法写页面有什么区别呢？都是用js来写页面
模版语法仅仅能够做到方便js渲染带变量的`dom`，渲染完后就时普通的`静态dom`了，更新dom依然要操作dom

`vue、react`的特点都是数据驱动视图，也就是**dom渲染完成后，通过数据更新dom**

如，我们前面CDN引入Vue的例子里，我们把new之后的vue示例挂在`变量app`上，在控制台通过`app.title = 'xx'` ，即可更新dom

## `React`的数据驱动视图
> 在说Vue的数据驱动视图前，我们先看看`react`的驱动形式是通过[setState()](https://react.docschina.org/docs/state-and-lifecycle.html)
> 
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220306154527.png)
我们仿照这种形式，再我们的vue类中加一个`setData`方法 👇

```js
class Vue{
  constructor({el,data,template}) {
    console.log('创建一个Vue')
    this.el = el
    this.data = data
    this.template = template

    this.renderByDataTemp() // 处理data template 生成dom
  }

  renderByDataTemp() {
    const newHtml = this.template.replace(/\{\{(.+?)\}\}/g,(...args)=>{
      return this.getValue(args[1])
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

  setData(newData) {
    Object.assign(this.data,newData)
    this.renderByDataTemp()
  }
}
```

在控制台输入`app.setData({title:'aa'})`来更新视图

## Vue的数据驱动视图
> Vue会把这种数据叫做响应式数据，实现的响应式的过程叫做数据劫持、数据代理、数据监听
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220307233604.png)

原理相信大家耳熟能详，`Vue2`使用 [Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 的API重写对象属性的`get、set`，这也是Vue2不支持IE9以下的原因

```js
render()
const $data = { x:1 }
Object.defineProperty(data,x{
  set(newVal) {
    // data.x = newVal // 导致死循环
    $data.x = newVal
    render()
  }
  get() {
    return $data.x
  }
})
```

## 解决`Object.defineProperty`的缺点

- `$set(data, prop, newVal)`
```js
const obj = {a:'1'}

function $set(obj,key,val){
  Object.defineProperty(obj,key,{
    set() {
    }
    get() {
    }
  })
}

obj.b = 2
$set(obj,'b',2)
```
- 重写数组方法

```js

```

## Vue3的proxy

关于[Proxy](../js/proxy.md)
