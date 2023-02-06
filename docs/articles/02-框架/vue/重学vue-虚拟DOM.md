# 虚拟DOM

[深入剖析：Vue核心之虚拟DOM#10](https://github.com/fengshi123/blog/issues/10)
[解析vue2.0的diff算法 #2](https://github.com/aooy/blog/issues/2)

## virtualDom

为什么说真是DOM很重

我们可以打印一个空的div对象的属性
```js
var mydiv = document.createElement('div');
for(var k in mydiv ){
  console.log(k)
}
```
👆 dom 是可遍历(有迭代器属性)的对象

virtualDom 就是解决这个问题的一个思路，用一个简单的对象去代替复杂的dom对象

因此加了一层 virtualDom 的操作如下

👇 直接操作DOM
```js
var mydiv = document.createElement('div');
mydiv.className = 'a';
document.body.appendChild(mydiv);
```

👇 加一层 virtualDom
```js
//伪代码
var vNode = { 
  tag: 'DIV',
  class: 'a'
};
var newvNode = {
   tag: 'DIV',
   class: 'b'
}
if(vNode.tag !== newvNode.tag || vNode.class  !== newvNode.class){
   change(mydiv)
}

// 会执行相应的修改 mydiv.className = 'b';
//最后  <div class='b'></div>
```
👆 已经可以看到相应的 virtualDom 更新步骤了

1. diff - 判断old/new virtualDom 是否变化, 此步骤需要递归算法速度最快
2. patch - change 函数真实修改DOM, 此步骤需要最小范围操作DOM

优缺点：

直接操作DOM明显比这样对比计算操作要更直接,更没有损耗

但是页面结构很庞大，结构很复杂时，手工优化会花去大量时间，而且可维护性也不高，不能保证每个人都有手工优化的能力。virtualDom很多时候都不是最优的操作，但它具有普适性，在效率、可维护性之间达平衡。

virtualDom 另一个重大意义就是跨端，提供一个中间层，js写ui，ios安卓之类的负责渲染，就像reactNative一样。

## diff

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230206163258.png)
👆 不同颜色框住的意思是 diff 只发生在同色部分，也就是同级比较, 不会跨层级比较

```xml
<!-- 之前 -->
<div>           <!-- 层级1 -->
  <p>            <!-- 层级2 -->
    <b> aoy </b>   <!-- 层级3 -->   
    <span>diff</Span>
  </P> 
</div>

<!-- 之后 -->
<div>            <!-- 层级1 -->
  <p>             <!-- 层级2 -->
      <b> aoy </b>        <!-- 层级3 -->
  </p>
  <span>diff</Span>
</div>
```
👆 `span` 移到层级2

直接操作DOM的可以不销毁来移动

但是虚拟DOM的 diff 会移除 `<p>` 里的 `<span>` 再创建一个新的 `<span>` 插到 `<p>` 的后边

因为比较只会比较同层级的 DOM 新增修改

TODO: 🤔 假如是 `<b>` 和 `<span>` 层级3 互换位置， diff 如何处理


diff 和 path 是一边遍历一边执行的而不是各自遍历一次

```js
// 同级diff 新旧 virtualDom
function diffPatchDom (oldVnode, newVnode) {
	if (easyDiff(oldVnode, newVnode) === 'same') {
		deepDiffPatchVnode(oldVnode, newVnode)
	} else {
		const oEl = oldVnode.el
		let parentEle = api.parentNode(oEl)
		createEle(newVnode)
		if (parentEle !== null) {
			api.insertBefore(parentEle, newVnode.el, api.nextSibling(oEl))
			api.removeChild(parentEle, oldVnode.el)
			oldVnode = null
		}
	}
	return newVnode
}
```

👆 为了优化 diff 遍历会希望匹配到不想等就跳出循环的 所以会把长的深度的判断拆成一段一段的，方便跳出

👇 因此先进行简易判断 直接 key 或者 sel 不相等就不一一判断 vNode 中的其他属性信息
```js
function easyDiff(oldVnode, vnode){
	return vnode.key === oldVnode.key && vnode.sel === oldVnode.sel
}
```
sel属性是 `'div#v.classA'` 标签名+选择器

👆 这就是为什么 v-for 的 key 不要用index 而是唯一标识可以不用经过深度遍历


再看看简易diff 判断出 Node 发生变化 TODO: 看不懂

最终执行完 简易diff 和 深度diff 之后返回出新 vNode (深度diff 也会操作到 newVnode)


```js
deepDiffPatchVnode (oldVnode, vnode) {
  const el = vnode.el = oldVnode.el
  let i, oldCh = oldVnode.children, ch = vnode.children
  if (oldVnode === vnode) return // 1. 引用相等
  if (oldVnode.text !== null && vnode.text !== null && oldVnode.text !== vnode.text) {
    // 2. 文本节点 diff
    api.setTextContent(el, vnode.text)
  }else {
    updateEle(el, vnode, oldVnode) // 这里还要再深度判断? 有可能是不变的？
    if (oldCh && ch && oldCh !== ch) {
      // 3. 都有子节点并且引用不想等
      updateChildren(el, oldCh, ch)
    }else if (ch){
      // 4. 新vnode有子节点
      createEle(vnode) //create el's children dom
    }else if (oldCh){
      // 4. 新vnode没有子节点 旧vnode有
      api.removeChildren(el)
    }
  }
}
```