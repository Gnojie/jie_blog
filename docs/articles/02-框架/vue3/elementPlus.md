## vite 创建工程

```bash
pnpm create vite demo-name --template vue-ts
```

比起`vue`参数创建项目，`vue-ts` 会把js文件转为ts

并在根目录生成  `tsconfig.node.json` 和 `tsconfig.json`
同时需要安装 `vue-tsc` 单文件组件依赖

---
🤔思考： `tsconfig.node.json` 作用是什么？

---

有意思的是，基于`vite`的 `dev阶段` **运行时按需编译** 机制，模版html，直接引入的是 `main.ts`

目录结构如下👇 

![vue3目录结构](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220730160726.png)

启动效果如下👇

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220730161527.png)

> 初始化的 `style.css` 挺有意思的，有空可以研究一下


入口文件
```ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

```vue
<script lang="ts" setup>
</script>

<template>
  <div>组件库</div>
</template>
```

需要引入`vue-router` 以及 `elementPlus`

```bash
pnpm i vue-router element-plus -D
```

在入口文件中挂载vueRouter，在测试页面中引入element按钮组件

详细使用及原理在其他笔记，具体参数查看官方文档

不在入口文件里引入vue-router，而是在router目录主文件里做创建操作

```ts
// router/index.ts
// TODO: 其他几种路由模式区别是什么
// TODO: 其他几种type分别是什么
import { createRouter,createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routerConfigList: RouteRecordRaw[] = [
  {
    path:'/',
    component: Home
  }
]

const router = createRouter({
  routes: routerConfigList, // 路由配置
  history: createWebHistory(), // 路由模式
})

export default router
```

ts的提示非常舒服 👇
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220730172530.png)


入口文件引入路由操作主文件，只做挂载操作
main入口文件
```ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index' // 引入路由操作主文件

const app = createApp(App)
app.use(router) // 挂载路由
app.mount('#app')
```

参考elementPlus官方文档，全局挂载组件库
```ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index' // 引入路由操作主文件
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(router).use(ElementPlus) // 挂载路由和组件库
app.mount('#app')
```

vite工程可以自动识别引入了新的依赖重启服务，不再需要手动重启👇
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220730175248.png)

直接在页面中写组件标签即可生效，因为全局引入了，不需要单文件组件里引入


## icon

图标现在都倾向用svg了，不再是以前全局挂在的iconfont
并且需要手动引入，并注册组件使用👇
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20220730181205.png)

官方文档的实例代码👇
```ts
// main.ts
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
```
👆 关于[Object.entries](../js/Object.entries.md)的用法
这样注册的组件使用时的标签名将会是`<Edit />` 很容易跟其他组件冲突命名
虽然官方文档示例里面用 `<el-icon> <Edit /> </el-icon>` 包裹使用
但是冲突的问题还在，我们可以在全局注册的时候不直接使用组件的key值，而是拼上我们的前缀
```js
app.component(`MyIcon${key}`, component)

// 使用 <MyIconEdit /> or <my-icon-edit />
```

不明白视频为什么要重命名成横杠。。。
```ts
// 驼峰命名转化为横杆
export function toLine(value:string):string {
  // 利用正则找出所有大写字母，加上‘-’，再全部转化为小写
  return value.replace(/(A-Z)g/, '-$1').toLocaleLowerCase()
}

//  app.component(`my-${toLine(key)}`, component)
```

---
🤔思考：👇的button组件是怎么做到渲染el-icon包住的图标，不渲染直接写的图标的
```html
<el-button>
  <!-- 图标可以渲染进button组件 -->
  <el-icon style="vertical-align: middle">
    <Edit />
  </el-icon>
  按钮
  <!-- 图标渲染不进button组件 -->
  <Edit />
</el-button>
```
---

新建views同级目录componenrs，存放组件，同时菜单布局的组件也放在这里
利用二级路由，最外层路由是组件目录下的菜单布局，子路由才是views下的各个页面

这种思路是`element-admin`的目录思路

可以看一下vue3版的 `element-admin`


- 关注页聚焦基金显示条件是缓存中没有自选基金，无论是否登录？
- 关注页在缓存没有自选基金时，显示的聚焦基金，是从缓存取吗，关注页要不要调接口取聚焦基金，什么时候调接口什么时候取缓存？
- 关注页每次resume都要查一次缓存有没有自选基金，没有时显示聚焦基金？
- 关注页每次resume都要清空自选基金，替换更新成缓存的自选基金？有没有关注页主动查自选基金接口逻辑？
- 切换账号，退出账号都会对自选基金缓存做相应更新？
