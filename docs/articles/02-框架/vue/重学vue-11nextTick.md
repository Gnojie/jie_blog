> 我们操作ref，就要看看nextTick

```js
const config = {
  el: '#app',
  data: {
    count: 1
  },
  methods:{
    addText(e) {
      this.count++
      console.log(this.count,e.target.innerHTML) // 2 '1'
      this.$nextTick(()=>{
        console.log(this.count,e.target.innerHTML) // 2 2
      })
    }
  },
  template: '<h1 @click="addText">{{count}}</h1>',
};

new Vue(config);
```