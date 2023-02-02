> `keep-alive` 缓存的是`真实DOM`

与不带`keep-alive`的动态组件比
- 普通动态组件每次切换都重新生成`vNode`和DOM
- 缓存组件，则重新生成`vNode`不可避免因为组件的内容还是要知道的

是在生成`真实DOM`之前，判断是否有`vNode`对应的`真实DOM`在缓存中，有则直接插入缓存中的`真实DOM`，没有则正常根据`vNode`生成`真实DOM`来插入页面

所以内置组件`keep-alive`做的事情是: 处理好内部的动态组件插槽和缓存空间
真正发挥缓存优化的部分是vNode生成真实DOM插入页面的部分，也就是渲染函数render/h再往内部的逻辑

## 内置组件概念
> ？`<component> <transition>`动画组件也是内置组件，它们为什么不在这里注册

内置组件，即转化为render函数,`h(‘keep-alive’)`,看出来其是一个vue的自定义组件，而不是其他的原生标签

- `keep-alive`和普通组件的区别
虽然渲染函数上看`keep-alive`和普通组件没有区别
但是实际上再往渲染函数的内部事件看，会对`keep-alive`类的内置组件做一些特殊处理
```js
// 创建子组件Vnode过程
function createComponent(Ctordata,context,children,tag) {
  // abstract是内置组件(抽象组件)的标志
  if (isTrue(Ctor.options.abstract)) {
    // 只保留slot属性，其他标签属性都被移除，在vnode对象上不再存在
    var slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }
}
```
渲染函数，render/h，内部有个渲染组件的函数 👆
判断到`options.abstract` 时，`data`对象只有一个`slot`
这个data对象就是一个vNode的所有参数


---

## vue内部注册组件

👇 [global-api注册内部全局组件](https://github.com/vuejs/vue/blob/dev/src/core/global-api/index.js)
```js
import builtInComponents from '../components/index'

extend(Vue.options.components, builtInComponents)
```

👇 `../components/index` 只有一个 `keep-alive`的内置组件
```js
import KeepAlive from './keep-alive'

export default {
  KeepAlive
}
```

## 大概设计流程
> 知道了keep-alive是一个把插槽vNode缓存起来的组件，我们试着猜想一下这个组件大概的设计

- 首先内部的插槽会是个变化的组件
- 插槽内容变化时,原本会销毁插槽dom内容
- keep-alive则保留原插槽的vNode和真实Dom，去生成新的vNode和真实DOM
- 内部插槽变回原vNode时直接使用原vNode的真实DOM

那么每个插槽都要有个id，用于切换回来时识别到

问题1: 切换的插槽id怎么跟上一次的相同，id用什么生成
问题2: 渲染真实DOM要怎么操作
问题3: 怎么拿到插槽vNode


## keep-alive组件源码删减版

👇 函数式组件源码
```js
import { isRegExp, remove } from 'shared/util'
import { getFirstComponentChild } from 'core/vdom/helpers/index'

export default {
  name: 'keep-alive',
  abstract: true, // 抽象组件 不会添加到父子组件关系链中

  props: {include,exclude,max},

  methods: {
    cacheVNode() {
      const { cache, keys, vnodeToCache, keyToCache } = this
      if (vnodeToCache) {
        const { tag, componentInstance, componentOptions } = vnodeToCache
        cache[keyToCache] = {
          name: getComponentName(componentOptions),
          tag,
          componentInstance,
        }
        keys.push(keyToCache)
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
        this.vnodeToCache = null
      }
    }
  },

  created () {
    this.cache = Object.create(null) // 直接空对象的区别
    this.keys = []
  },

  destroyed () {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    this.cacheVNode()
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  updated () {
    this.cacheVNode()
  },

  render () {
    const slot = this.$slots.default
    const vnode = getFirstComponentChild(slot)
    const componentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      const name = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        (include && (!name || !matches(include, name))) ||
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this
      const key = vnode.key == null
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      if (cache[key]) {
        // TODO: 虚拟dom中的componentInstance是干嘛的
        vnode.componentInstance = cache[key].componentInstance
        // 根据激活更新keys顺序
        remove(keys, key)
        keys.push(key)
      } else {
        this.vnodeToCache = vnode
        this.keyToCache = key
      }

      vnode.data.keepAlive = true // TODO: 往虚拟dom中的data注入keepAlive？
    }
    return vnode || (slot && slot[0])
  }
}
```

this.的变量
- max
- include、exclude
- cache
- keys
- _vnode
- vnodeToCache
- keyToCache


## 初始化keep-alive
初始化keep-alive组件 render渲染时判断当前组件内插槽是否在include或者exclude内
- 不需要缓存时，render直接返回vNode不做任何操作
- 需要缓存时，render返回vNode前
  - 生成vNode的key
  - 存入keyToCache、vnodeToCache

render之后再触发mounted/updated
mounted/updated都是触发cacheVNode
处理缓存就是把vNode放入cache对象中并生成一个key放入keys数组中

## 为什么要额外的一个keys数组
```js
cacheVNode(){
  cache[key] = {
    name: getComponentName(componentOptions),
    tag,
    componentInstance,
  }

  keys.push(key)
  if (this.max && keys.length > parseInt(this.max)) {
    pruneCacheEntry(cache, keys[0], keys, this._vnode)
  }

  this.vnodeToCache = null
}
```
因为要控制max，缓存量的最大值
vNode除了虚拟DOM数据，还带着真实DOM对象，会很大
缓存是放在内存中的，如果没有限制容易出现内存泄漏
因此需要一个自动清除缓存中的vNode机制
清除的对象是最久没有激活的vNode
也就需要keys数组记录每次更新cache时把key放到数组最后，这样清除第一个vNode就是最久没激活的

> keys不会有重复key吗？
触发render时，如果有key，会移除原有key，再push


初始化keep-alive组件，内部插槽vNode存入缓存，插槽内容以后会变化
内部插槽变化，触发keep-alive的render和update
render会判断本次插槽是否有缓存
- 有则不更新keys的顺序，赋值vNode一个组件实例`componentInstance`？
- 没有则进入update的存入cache对象和keys



👇 工具方法
```js
function getComponentName (opts){
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern, name){
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  return false
}

function pruneCache (keepAliveInstance, filter) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const entry = cache[key]
    if (entry) {
      const name = entry.name
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}

function pruneCacheEntry (cache,key,keys) {
  const entry = cache[key]
  if (entry && (!current || entry.tag !== current.tag)) {
    entry.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}
```

## LRU缓存淘汰算法
```ts
// ./LRU.ts
export class LRUCache {
  capacity: number; // 容量
  cache: Map<number, number | null>; // 缓存
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  get(key: number): number {
    if (this.cache.has(key)) {
      let temp = this.cache.get(key) as number;
      //访问到的 key 若在缓存中，将其提前
      this.cache.delete(key);
      this.cache.set(key, temp);
      return temp;
    }
    return -1;
  }
  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      //存在则删除，if 结束再提前
    } else if (this.cache.size >= this.capacity) {
      // 超过缓存长度,淘汰最近没使用的
      this.cache.delete(this.cache.keys().next().value);
      console.log(`refresh: key:${key} , value:${value}`)
    }
    this.cache.set(key, value);
  }
  toString(){
    console.log('capacity',this.capacity)
    console.table(this.cache)
  }
}
// ./index.ts
import {LRUCache} from './lru'
const list = new LRUCache(4)
list.put(2,2)   // 入 2，剩余容量3
list.put(3,3)   // 入 3，剩余容量2
list.put(4,4)   // 入 4，剩余容量1
list.put(5,5)   // 入 5，已满    从头至尾         2-3-4-5
list.put(4,4)   // 入4，已存在 ——> 置队尾         2-3-5-4
list.put(1,1)   // 入1，不存在 ——> 删除队首 插入1  3-5-4-1
list.get(3)     // 获取3，刷新3——> 置队尾         5-4-1-3
list.toString()
```

## Object.create(null)和直接定义{}的区别

[详解Object.create(null)](https://juejin.cn/post/6844903589815517192)


## 参考资料
- [彻底搞懂Vue中keep-alive的魔法(上)](https://juejin.cn/post/6844903950886371342)