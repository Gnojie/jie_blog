[[toc]]

### 1. v-show和v-if的区别
- show通过`css display` 控制显示和隐藏
- if控制真正的渲染和销毁，而不是显示隐藏
- 频繁切换用show，否则用if
- TODO: css display 的本质是什么

### 2. v-for为什么要用key
- for用的key不能是 index 和唯一随机值
- diff算法通过选择器字符串和key来判断是否 sameNode
- 用key方便diff算法，做到减少渲染次数，提升渲染性能

### 3. 描述Vue组件生命周期(父子组件)
- 单组件生命周期图
- 父子组件生命周期关系

### 4. Vue组件如何通信
- 父子组件 props、$emit()
- 自定义事件 直接用vue实例做eventbus, `event.$on 、event.$off 、event.$emit`
- vuex

### 5. 描述组件渲染和更新过程/请描述响应式原理
- 官方文档图示
- 包含模版渲染成虚拟dom、数据双向绑定的getset拦截和观察、更新虚拟dom成真实dom的diff算法

### 6. v-model的实现
- input元素的`value = this.xxx`
- 绑定input事件 `this.xxx = $even.target.value`
- data更新出发re-render

### 7. computed的特点
- 有缓存，data不变不会重新计算(可以看看是怎么实现的)
- 提高性能

### 8. 组件data为什么必须是一个函数
- 每个vue文件都会编译到同一个vue实例下，多个组件的属性如果是对象会互相干扰，函数则会是一个闭包

### 9. 何时需要用到beforeDestory
- 解除eventbus自定义事件时 `event.$off`
- 清除定时器
- 解绑自定义的DOM事件，如 window scroll 等

### 10. 什么是作用域插槽
- 父组件想拿到子组件的数据如data时用到
- TODO: 实现一个表格组件就可以知道了

### 11. vuex和 action 和 mutation 有何区别
- action 中处理异步，mutation不可以
- mutation一般做原子操作
- action可以整个多个mutation

### 12. vue-router模式
- hash模式
- history模式 (服务器支持)
- 实现原理

### 13. 将中间组件所有的props传递给子组件
- `<child :topProps="$props">`
- $attr

### 14. 何时用到keep-alive
- 缓存组件，不需要重复渲染时,如多个静态tab页的切换
- 优化性能

### 15. 用vNode描述一个dom结构
<!-- ![5f604da2d0b8a32f36d6ee7242a94f0f.png](evernotecid://A8CC14F8-F351-4473-9E82-5EFAB88A4F7D/appyinxiangcom/18783918/ENResource/p1757) -->
### 16. 监听data变化的核心API
- `Object.defineProperty`
- 深度监听原理,监听数组的实现
- 有何缺点

### 17. Vue如何监听数组变化
- `Object.defineProperty`不能监听数组变化
- 重新定义原型,重写`push、pop、splice`等方法
- `Proxy`原生支持监听数组变化

### 18. Vue为何是异步渲染,$nextTick
- 异步渲染(以及合并data修改),用于提高渲染性能
- `$nextTick` 用于在DOM更新完之后,触发回调

### 19. 简述diff算法过程
- `patch(elem,vnode)` 和 `patch(vnode,newVnode)`
- `patchVnode` 和 `addVnodes` 和 `removeVnodes`
- `updateChildren` (局部比对 key的重要性)

### 20. css的link标签和@import的区别
1. 概念
  - link标签属于HTML的标签，不仅仅可以加载样式还可以定义一些属性ref
  - @import属于CSS的语法，只能加载外部样式
2. 加载顺序
  - link标签，加载页面时同时加载样式
  - @import，页面加载完成，才开始加载外部样式(如果把主页面样式写成@import会导致页面加载出来有一段时间样式缺失)
3. DOM操作区别
  - link是个标签，可以通过js新增删除样式
  - @import是css语法，无法通过js操作

### 21. display:none、visibility:hidden、opacity:0的区别
- opacity通过透明度隐藏dom，还有占位和可以点击（依然要渲染，消耗性能）
- visibility控制可视性隐藏dom，还有占位和不可点击（不渲染，保留空间，消耗一丢丢性能）
- display盒模型彻底隐藏（不渲染，不保留空间）

性能：
浏览器GUI渲染线程、浏览器JS引擎线程
css渲染过程：布局(排列、重排、回流)->绘制(重绘)

开关`opacity`和开关`visibility`都会触发重绘


### 22. https为什么更安全，怎么验证证书
https防的是服务器中间人

浏览器 --访问--> B站

浏览器 --访问--> 中间人 --转接--> B站

中间人可以通过基站或不安全的wifi等插入进来，此时你的访问被接管，是否转发到目标访问都取决于中间人，且上送数据都被接收

https给访问目标如B站，添加认证，每次访问都需要符合认证。

浏览器会查看访问目标服务器的证书是否和域名匹配
但是证书是公开的，也就是中间人可以下载目标服务器的证书到自己的服务器里，让浏览器检查

除了校验证书内容，还会校验颁发者，当然颁发者也是公开的，中间人也可以配置自己证书是这个办法者

这些公开不加密的证书信息可以伪造，但是真正校验证书的是加密签名(签名只能用一次)，服务器上除了要有证书还要有个公开的共钥和不公开的私钥，用于解密证书信息

RSA非对称加密，只能用一次的签名防篡改

### 
