

[50道CSS基础面试题（附答案）](https://segmentfault.com/a/1190000013325778)
## rem, 计算出375的屏幕，1rem,单位出现小数怎么处理
## rem和vw的使用场景

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