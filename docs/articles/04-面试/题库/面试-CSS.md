[50道CSS基础面试题（附答案）](https://segmentfault.com/a/1190000013325778)
## CSS 选择器及优先级

**选择器**

- id选择器(#myid)
- 类选择器(.myclass)
- 属性选择器(a[rel="external"])
- 伪类选择器(a:hover, li:nth-child)
- 标签选择器(div, h1,p)
- 相邻选择器（h1 + p）
- 子选择器(ul > li)
- 后代选择器(li a)
- 通配符选择器(*)

**优先级：**

- `!important`
- 内联样式（1000）
- ID选择器（0100）
- 类选择器/属性选择器/伪类选择器（0010）
- 元素选择器/伪元素选择器（0001）
- 关系选择器/通配符选择器（0000）

带!important 标记的样式属性优先级最高； 样式表的来源相同时：
`!important > 行内样式>ID选择器 > 类选择器 > 标签 > 通配符 > 继承 > 浏览器默认属性`

## rem, 计算出375的屏幕，1rem,单位出现小数怎么处理
## rem和vw的使用场景
**rem**

改变了一个元素在不同设备上占据的css像素的个数
rem适配的优缺点

-   优点：没有破坏完美视口
-   缺点：px值转换rem太过于复杂(下面我们使用less来解决这个问题)

**viewport适配的原理**

viewport适配方案中，每一个元素在不同设备上占据的css像素的个数是一样的。但是css像素和物理像素的比例是不一样的，等比的

viewport适配的优缺点

-   在我们设计图上所量取的大小即为我们可以设置的像素大小，即所量即所设
-   缺点破坏完美视口

[移动端响应式开发单位设计](../../03-%E6%9E%B6%E6%9E%84/%E8%AE%BE%E8%AE%A1/%E7%A7%BB%E5%8A%A8%E7%AB%AF%E5%93%8D%E5%BA%94%E5%BC%8F%E5%BC%80%E5%8F%91%E5%8D%95%E4%BD%8D%E8%AE%BE%E8%AE%A1.md)

## Display 的常见属性


## css的link标签和@import的区别
1. 概念
  - link标签属于HTML的标签，不仅仅可以加载样式还可以定义一些属性ref
  - @import属于CSS的语法，只能加载外部样式
2. 加载顺序
  - link标签，加载页面时同时加载样式
  - @import，页面加载完成，才开始加载外部样式(如果把主页面样式写成@import会导致页面加载出来有一段时间样式缺失)
3. DOM操作区别
  - link是个标签，可以通过js新增删除样式
  - @import是css语法，无法通过js操作

总结：
- 性质不同，link是xhtml标签，无兼容性问题，可用于加载CSS文件的同时还可以进行RSS信息聚合等事务，而@import属于CSS范畴，在CSS2时提出，低版本浏览器不支持，只能用于加载CSS文件
- 加载时间不同，link引用CSS随页面载入时同时加载，@import需要在页面加载完毕后被需要时才会加载
- 写法不同，link是写在head标签中，而@import在html中只能写在style标签中
- 样式权重不同，link引用的样式权重高于@import

## display:none、visibility:hidden、opacity:0的区别
- opacity通过透明度隐藏dom，还有占位和可以点击（依然要渲染，消耗性能）
- visibility控制可视性隐藏dom，还有占位和不可点击（不渲染，保留空间，消耗一丢丢性能）
- display盒模型彻底隐藏（不渲染，不保留空间）

性能：
浏览器GUI渲染线程、浏览器JS引擎线程
css渲染过程：布局(排列、重排、回流)->绘制(重绘)

开关`opacity`和开关`visibility`都会触发重绘

## scss样式穿透原因及原生原理
内部写样式不生效，改为全局样式后生效的原因
在vue中用了scope组件样式，去改第三方组件之类的样式不生效的原因是第三方组件的样式是全局的，内部组件scope不会给第三方组件加data码，这样组件选择器会选不中它
scss提供给组件父级下的选择器加deep，让这部分样式编译成全局样式，不带data码

如果是原生css会不会遇到样式穿透的问题，如何解决

## CSS盒模型
css 盒子模型分为两种：`IE 怪异盒模型`，`标准盒模型`

1. 盒模型
- 内容(`content`)
- 内边距(`padding`)
- 边框(`border`)
- 外边距(`margin`)
2. 宽高区别
- `W3C` 标准盒子的 `width/height` 直接为 `content`
- `IE` 盒子的 `width/height` 为 `content + padding + border`
3. `box-sizing` 可以转换盒子模型
- `border-box(IE)`
- `content-box(W3C,默认)`