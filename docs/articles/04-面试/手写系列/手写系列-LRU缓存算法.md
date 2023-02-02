## LRU(Least Recently Used)
> 属于算法范畴，但是因为实际应用也常使用，所以作为手写系列

Least Recently Used
最近最少使用

创建时间上: 先进先出
另外还有使用的时间(当使用 `get` 获取数据后，该条数据需要更新到最前面)

- 操作系统底层的内存管理，其中就包括有 `LRU` 算法
- 缓存服务，比如 `redis` 等等
- 比如浏览器的最近浏览记录存储

2个实现方向
- `hashmap` 的数据结构，能够高效的检索与任意键相关联的值
  - 比如字符串
  - ES6 的 `Map`
  - 或者任何普通的对象 {}
  - 【缓存】与一个【固定容量的键值对存储】没什么不同
- 将所有元素按最后访问顺序存储
  - 我们将需要高效地移动元素
  - 双向链表

### hashMap -字典

> [数据结构-字典](../题库/面试-数据结构.md#字典)

- 创建 `LRUCache` 类，用来当存储空间
```js
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize; // 存储长度
    this.dataMap = new Map(); // 存储数据
  }
  // 存储数据，通过键值对的方式
  set(key, value) { }
  // 获取数据
  get(key) { }
}

const lruCache = new LRUCache(5);
```

- 采用 `Map` 数据结构存储数据，因为它的存取时间复杂度为 `O(1)`，数组为 `O(n)`
- 实现 `get` 和 `set` 方法，用来获取和添加数据
- 我们的存储空间有长度限制，所以无需提供删除方法，存储满之后，自动删除最久远的那条数据
- 当使用 `get` 获取数据后，该条数据需要更新到最前面

```js
// 存储数据，通过键值对的方式
set(key, value) {
  const dataMap = this.dataMap;
  // 去重
  if (dataMap.has(key)) {
    dataMap.delete(key)
  }
  // 存入数据
  dataMap.set(key, value);

  // 🔥 如果超出了容量，则需要删除最久的数据
  if (dataMap.size > this.maxSize) {
    this._removeFirstItem()
  }
}
// 获取数据
get(key) {
  const dataMap = this.dataMap;
  // 未找到
  if (!dataMap.has(key)) {
    return null;
  }
  const value = dataMap.get(key); // 获取元素

  // 🔥 更新到最前面
  dataMap.delete(key); // 删除元素
  dataMap.set(key, value); // 重新插入元素
}

// 移除最早的数据
_removeFirstItem() {
  const delKey = this.dataMap.keys().next().value;
  this.dataMap.delete(delKey);
}
```

### 双向链表


## 参考资料

- [面试官：请使用JS完成一个LRU缓存？](https://juejin.cn/post/7105654083347808263#heading-5)
- [[译]使用 JavaScript 实现一个高效的 LRU cache - 双向链表](https://juejin.cn/post/6844904183426973710)




