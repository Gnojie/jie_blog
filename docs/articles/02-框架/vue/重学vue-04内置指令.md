> 在了解过render函数后，我们知道我们开发阶段编写的template代码，都会经过转译成render函数
> 
> 所以vue在template模板语法中提供的很多指令都是作用于怎样生成render函数的

## v-if
转译结果 👇
```js
// <p v-if="xx">内容</p>
export default {}
  render(h){
    if(xx) h('p', {}, '内容')
  }
}
```

## v-show
转译结果 👇
```js
// <p v-show="xx">内容</p>
export default {}
  render(h){
    return h('p', {
      style:{
        'display':xx?'':'none'
      }
    }, '内容')
  }
}
```

## v-for
转译结果 👇
```js
// <p v-for="item in list">内容</p>
export default {}
  render(h){
    return this.list.map(item=>{
      h('p', {}, '内容')
    })
  }
}
```

## v-model
```js
// <input v-model="xx" />
export default {
  props: ['value'],
  render(h) {
    return h('input', {
      on: {
        input: event => this.emit('input', event.target.value)
      }
    })
  }
}
```

## v-bind简写(:)
> [v-bind - 官方文档](https://cn.vuejs.org/v2/api/#v-bind)
> 
> [自定义指令 - 官方文档](https://cn.vuejs.org/v2/guide/custom-directive.html)
> 
> ![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220317215853.png)
> 

`v-bind:xx="msg"` `v-xx`是指令,`:xx`是参数
因此以下简写都是vue的内置指令根据不同参数做的不同处理

### 参数style
> `:style=""`  支持数组、对象、字符串

### 参数class
> `:class=""` 支持数组、对象、字符串

## v-on

this指向，永远指向当前组件实例

怎么做到$event可以写任意位置而不是第一个参数

### 其他自定义参数：1.组件参数 2.标签属性


## 自定义指令

常见用处

总结场景：
- 需要封装的公共逻辑是要操作DOM的时候

### 拖拽指令v-drag