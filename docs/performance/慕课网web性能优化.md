[toc]

- 公众号文章分析
- svg实现

## 可优化层面：
- 网络层面
- 构建层面
- 浏览器渲染层面
- 服务端层面

## 技术点：
- 资源的合成与压缩
- 图片编解码原理和类型选择
- 浏览器渲染机制
- 懒加载预加载
- 浏览器存储
- 缓存机制
- PWA
- Vue-SSR



## 重绘与回流
> 简单概念：浏览器渲染过程有排列(重排/布局/回流)和绘制(重绘)

关于层和GPU[这样使用GPU动画](https://www.w3cplus.com/animation/gpu-animation-doing-it-right.html)

[浏览器渲染流程&Composite（渲染层合并）简单总结](https://segmentfault.com/a/1190000014520786)

### 1. 偏移translate替代定位布局的
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20211214201147.png)

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20211214201309.png)
👆 不使用定位布局，而是直接用偏移来修改位置

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20211214201339.png)

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20211214201404.png)
👆 定位布局修改位置绘触发回流(回流一定会触发重绘)，偏移修改位置则只会触发重绘

问题：偏移可以完全替代定位布局？偏移会占文档流且无法设置zindex

绝对定位因为本身脱离文档流，再去修改位置其实不会触发其他元素的回流，性能检测上还是能看到有回流，应该是指绝对定位的元素的回流待测

适用于，只想偏移自身，且不想脱离文档流的情况


### 新建层来优化渲染
绘制(重绘)过程：
获取 DOM 并将其分割为多个层（layer）
将每个层独立地绘制进位图（bitmap）中
将层作为纹理（texture）上传至 GPU
复合（composite）多个层来生成最终的屏幕图像。

👆 层的概念是，属于同一层的局部元素进行了重绘，整个层都需要进行重绘？


假设手动设置成了层，其他元素回流重绘，不会影响本层的回流甚至重绘，浏览器重新复合来显示本层内容
但是本图层内的回流重绘并不会有所优化，会影响其他层吗？感觉会

所以独立图层和开启GPU没有减少回流重绘，是利用内存优化加速了渲染

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20211214215327.png)
直接修改margin，触发其他元素一起回流
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20211214215338.png)
只修改脱离文档流的元素位置，不影响其他元素
