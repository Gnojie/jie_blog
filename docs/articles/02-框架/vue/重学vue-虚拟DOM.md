# 虚拟DOM

🌟 [深入剖析：Vue核心之虚拟DOM#10](https://github.com/fengshi123/blog/issues/10)

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

```js
import { createVNode } from "./vnode.js"

var ul = createVNode('div',{id:'virtual-dom'},[
  createVNode('p',{},['Virtual DOM']),
  createVNode('ul', { id: 'list' }, [
    createVNode('li', { class: 'item' }, ['Item 1']),
    createVNode('li', { class: 'item' }, ['Item 2']),
    createVNode('li', { class: 'item' }, ['Item 3'])
  ]),
  createVNode('div',{},['Hello World'])
]) 
```

👇 `vnode.js`
```js
/**
 * Element virdual-dom 对象定义
 * @param {String} tagName - dom 元素名称
 * @param {Object} props - dom 属性
 * @param {Array<Element|String>} - 子节点
 */
function Element(tagName, props, children) {
  this.tagName = tagName
  this.props = props
  this.children = children
  // dom 元素的 key 值，用作唯一标识符
  if(props.key){
    this.key = props.key
  }
  var count = 0
  children.forEach(function (child, i) {
    if (child instanceof Element) {
      count += child.count
    } else {
      children[i] = '' + child
    }
    count++
  })
  // 子元素个数
  this.count = count
}

export function createVNode(tagName, props, children){
 return new Element(tagName, props, children);
}
```

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230207120110.png)

得到带有层级关系的 js 对象数据

👆 createVNode 就是 vue 中的函数式组件 `render: function(h){h()}`
```js
/**
 * render 将virdual-dom 对象渲染为实际 DOM 元素
 */
Element.prototype.render = function () {
  var el = document.createElement(this.tagName)
  var props = this.props
  // 设置节点的DOM属性
  for (var propName in props) {
    var propValue = props[propName]
    el.setAttribute(propName, propValue)
  }

  var children = this.children || []
  children.forEach(function (child) {
      var childEl = (child instanceof Element)
          ? child.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
          : document.createTextNode(child) // 如果字符串，只构建文本节点
      el.appendChild(childEl)
  })
  return el
}

ulRoot = ul.render();
document.body.appendChild(ulRoot); 
```
👆 遍历( `children.forEach` )所有的`虚拟DOM` 调用 `render` 生成`真实DOM`

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


```js
// diff 函数，对比两棵树
function diff(oldTree, newTree) {
  var index = 0 // 当前节点的标志
  var patches = {} // 用来记录每个节点差异的对象
  dfsWalk(oldTree, newTree, index, patches)
  return patches
}

// 对两棵树进行深度优先遍历
function dfsWalk(oldNode, newNode, index, patches) {
  var currentPatch = []
  if (typeof (oldNode) === "string" && typeof (newNode) === "string") {
    // 文本内容改变
    if (newNode !== oldNode) {
      currentPatch.push({ type: patch.TEXT, content: newNode })
    }
  } else if (newNode!=null && oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
    // 节点相同，比较属性
    var propsPatches = diffProps(oldNode, newNode)
    if (propsPatches) {
      currentPatch.push({ type: patch.PROPS, props: propsPatches })
    }
    // 比较子节点，如果子节点有'ignore'属性，则不需要比较
    if (!isIgnoreChildren(newNode)) {
      diffChildren(
        oldNode.children,
        newNode.children,
        index,
        patches,
        currentPatch
      )
    }
  } else if(newNode !== null){
    // 新节点和旧节点不同，用 replace 替换
    currentPatch.push({ type: patch.REPLACE, node: newNode })
  }

  if (currentPatch.length) {
    patches[index] = currentPatch
  }
} 
```
👆 最终希望得到 `{ index: [{type, newNode}], ... }`

TODO: `diffChildren` 不完善 自己补充...

diff(差异) 和 patch(补丁) 是一边遍历一边执行的而不是各自遍历一次

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

👆 为了优化 diff 遍历会希望匹配到不相等就跳出循环的 所以会把长的深度的判断拆成一段一段的，方便跳出

👇 因此先进行简易判断 直接 key 或者 sel 不相等就跳出不一一判断 vNode 中的其他属性信息
```js
function easyDiff(oldVnode, vnode){
	return vnode.key === oldVnode.key && vnode.sel === oldVnode.sel ? 'same' : 'unsame'
}
```
sel属性是 `'div#v.classA'` 标签名+选择器

👆 这就是为什么 v-for 的 key 不要用index 而是唯一标识, 可以在 简易diff 后就跳出


再看看简易diff 判断出 Node 发生变化 TODO: 看不懂

最终执行完 简易diff 和 深度diff 之后返回出新 vNode (深度diff 也会操作到 newVnode)

```js
deepDiffPatchVnode (oldVnode, newVnode) {
  const el = newVnode.el = oldVnode.el
  let i, oldCh = oldVnode.children, newCh = newVnode.children
  if (oldVnode === newVnode) return // 1. 引用相等 则diff结果 没变化
  if (oldVnode.text !== null && newVnode.text !== null && oldVnode.text !== newVnode.text) {
    // 2. 有text代表是纯文本节点 diff
    api.setTextContent(el, newVnode.text)
  }else {
    updateEle(el, newVnode, oldVnode) // 这里还要再深度判断? 有可能是不变的？
    if (oldCh && newCh && oldCh !== newCh) {
      // 3. 都有子节点并且引用不想等
      updateChildren(el, oldCh, newCh)
    }else if (newCh){
      // 4. 新vnode有子节点
      createEle(newVnode) //create el's children dom
    }else if (oldCh){
      // 4. 新vnode没有子节点 旧vnode有
      api.removeChildren(el)
    }
  }
}
```

双向指针遍历

先看单向的


```js
updateChildren (parentElm, oldCh, newCh) {
  let oldStartIdx = 0, newStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]
  let newEndIdx = newCh.length - 1
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]
  let oldKeyToIdx
  let idxInOld
  let elmToMove
  let before
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {   //对于vnode.key的比较，会把oldVnode = null
      oldStartVnode = oldCh[++oldStartIdx] 
    }else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx]
    }else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx]
    }else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx]
    }else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    }else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    }else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode)
      api.insertBefore(parentElm, oldStartVnode.el, api.nextSibling(oldEndVnode.el))
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    }else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode)
      api.insertBefore(parentElm, oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    }else {
      // 使用key时的比较
      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx) // 有key生成index表
      }
      idxInOld = oldKeyToIdx[newStartVnode.key]
      if (!idxInOld) {
        api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
        newStartVnode = newCh[++newStartIdx]
      }
      else {
        elmToMove = oldCh[idxInOld]
        if (elmToMove.sel !== newStartVnode.sel) {
          api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
        }else {
          patchVnode(elmToMove, newStartVnode)
          oldCh[idxInOld] = null
          api.insertBefore(parentElm, elmToMove.el, oldStartVnode.el)
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
  }
  if (oldStartIdx > oldEndIdx) {
    before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].el
    addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx)
  }else if (newStartIdx > newEndIdx) {
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
  }
}
```

## 讲讲vue的diff算法

首先，我们拿到新旧节点的数组，然后初始化四个指针，分别指向新旧节点的开始位置和结束位置，进行两两对比

若是新的开始节点和旧开始节点相同，则都向后面移动

若是结尾节点相匹配，则都前移指针

若是新开始节点和旧结尾节点匹配上了，则会将旧的结束节点移动到旧的开始节点前

若是旧开始节点和新的结束节点相匹配，则会将旧开始节点移动到旧结束节点的后面

若是上述节点都没配有匹配上，则会进行一个兜底逻辑的判断，判断开始节点是否在旧节点中，若是存在则复用，若是不存在则创建

最终跳出循环，进行裁剪或者新增，若是旧的开始节点小于旧的结束节点，则会删除之间的节点，反之则是新增新的开始节点到新的结束节点。

`diff` 过程中又分了好几种情况，`oldCh ` 为 `oldVnode`的子节点，`ch` 为 `Vnode `的子节点：

- 首先进行文本节点的判断，若 `oldVnode.text !== vnode.text`，那么就会直接进行文本节点的替换；
- 在`vnode`  没有文本节点的情况下，进入子节点的 `diff`；
- 当 `oldCh` 和 `ch ` 都存在且不相同的情况下，调用 `updateChildren` 对子节点进行 `diff`；
- 若 `oldCh `不存在，`ch` 存在，首先清空 `oldVnode` 的文本节点，同时调用 `addVnodes` 方法将 `ch` 添加到`elm `真实 `dom` 节点当中；
- 若 `oldCh `存在，`ch `不存在，则删除 `elm` 真实节点下的 `oldCh` 子节点；
- 若 `oldVnode` 有文本节点，而 `vnode` 没有，那么就清空这个文本节点。

## diff 中的 key
在 `vnode` 不带 `key` 的情况下，每一轮的 `diff` 过程当中都是`起始`和`结束`节点进行比较，直到 `oldCh` 或者`newCh` 被遍历完。而当为 `vnode` 引入 `key` 属性后，在每一轮的 `diff` 过程中，当`起始`和`结束`节点都没有找到`sameVnode` 时，然后再判断在 `newStartVnode` 的属性中是否有 `key`，且是否在 `oldKeyToIndx` 中找到对应的节点 ：

- 如果不存在这个 `key`，那么就将这个 `newStartVnode `作为新的节点创建且插入到原有的 `root` 的子节点中；
- 如果存在这个 `key`，那么就取出 `oldCh` 中的存在这个 `key` 的 `vnode`，然后再进行 `diff` 的过；

通过以上分析，给`vdom`上添加 `key `属性后，遍历 `diff` 的过程中，当**起始点**，**结束点**的**搜寻**及 `diff` 出现还是无法匹配的情况下时，就会用 `key` 来作为唯一标识，来进行 `diff`，这样就可以提高 `diff` 效率。  


## vue 的diff算法是深度优先遍历还是广度优先算法

在patchVnode过程中会调用updateChildren，所以 vue 的diff算法是个深度优先算法

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230207111234.png)

