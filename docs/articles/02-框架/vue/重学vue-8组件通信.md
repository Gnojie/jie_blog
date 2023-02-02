
### eventBus

```js
// 创建一个中央时间总线类  
class Bus {  
  constructor() {  
    this.callbacks = {};   // 存放事件的名字  
  }  
  $on(name, fn) {  
    this.callbacks[name] = this.callbacks[name] || [];  
    this.callbacks[name].push(fn);  
  }  
  $emit(name, args) {  
    if (this.callbacks[name]) {  
      this.callbacks[name].forEach((cb) => cb(args));  
    }  
  }  
}  
  
// main.js  
Vue.prototype.$bus = new Bus() // 将$bus挂载到vue实例的原型上  
// 另一种方式  
Vue.prototype.$bus = new Vue() // Vue已经实现了Bus的功能  
```