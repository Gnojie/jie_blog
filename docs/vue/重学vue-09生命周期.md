> 有了组件的基础，我们知道我们的UI就是有组件搭建起来，由一个根组件+各种组件组成
> 
> 每个组件会有自己的生命周期，而各种组件组合起来的生命周期会有点绕，所以要来捋一下
> 如果写render函数的话，需要思考一下，这个render函数在什么时候会触发，平时写template时并不会注意到这点
> 实际上是整个组件的数据(prop、data)发生变化都会触发render，也就是update的生命周期

父子逐渐mounted，destroy顺序，我们把组件创建当成一个个数组项，并且会进出，那么这个数据结构就是栈
先进后出





父组件触发update生命周期(render)，会触发子组件的update吗？

react会，那么vue是怎么做到的呢




---

知道各种生命周期的作用之后，我们反过来思考一下生命周期的本质是什么
我们都知道生命周期也叫钩子函数，在特定时机抛出来调用
这么一想，钩子函数其实就是一个被放出来自定义的回调函数吧
我们用js实现一下
```js
class Vue{
  constor(config){
    this.init(config)
  }
  init() {
    setTimeout(()=>{
      config.cb1()
    },1000)
  }
}

const config = {
  cb1(){
    console.log('我是钩子函数1')
  }
}
new Vue(config)
```

