仓库使用pnpm 相关文章 TODO:

packages
- docs
- playground
- router



```js
import Vue from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

// 创建和挂载
const routes = [
  { path: '/', component: { template: '<div>Home</div>' } },
  { path: '/foo', component: { template: '<div>foo</div>' } },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = Vue.createApp({})
app.use(router)mount('#app')
```

