## computed
我们需要知道`computed`内部没有监听变量(即没有使用到响应式数据)时，`computed`是静态的
有监听变量且响应式数据没有发生变化时，`computed`不会触发重新计算(重新get)
👆 这是`computed`的特性

关于**响应式数据**的概念在[数据驱动视图](./重学vue-02数据驱动视图.md)讲到过,不要跳过这个名词解释，因为这是在vue中有特定含义的名词

另外因为`computed`的配置项可以简写为函数形式，容易让人以为使用`computed`时就是在调用函数,`computed`的调用时机我们在下面会讲到
所以我们的讲解为了避免不必要的误解，就不使用简写了

常见误区: 计算属性是在调用的时候出发函数的❌
> computed并不是定义在template上时调用的，而是由数据监听触发

👇 来看看这题，说说打印1的次数
```js
var vm = new Vue({
  el: '#app',
  data: {
    msg: 'Hello'
  },  
  computed: {    
    test() {
      console.log(1)
      return this.msg
    }
  },  
  created() {
    this.msg = 'World'    
    for (var i = 0; i < 5; i++) {        
      console.log(this.test)    
    }
  }
})
```
## 缓存
这里我们猜测一下，绑定到标签上的计算属性被修改，相当于data里被`Object.defindProto`代理的对象，也就是复用让赋值实际触发set

## 不支持异步
