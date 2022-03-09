computed写成对象形式时，加上get、set可以实现修改计算属性
这里我们猜测一下，绑定到标签上的计算属性被修改，相当于data里被`Object.defindProto`代理的对象，也就是复用让赋值实际触发set

> computed并不是定义在template上时调用的，而是由数据监听触发

## 缓存

没有监听变量时，值是静态的
监听变量没有发生变化时，值不会触发重新计算(重新get)

常见误区: 计算属性是在调用的时候出发函数的❌

来看看这题
👇 说说打印1的次数
```js
var vm = new Vue({
  el: '#example',
  data: {
    message: 'Hello'
  },  
  computed: {    
    test() {
      console.log(1)
      return this.message
    }
  },  
  created() {
    this.message = 'World'    
    for (var i = 0; i < 5; i++) {        
      console.log(this.test)    
    }
  }
})
```

## 不支持异步
