## proxy简介
> 只做简到不能再简的简介，详细用法请查阅[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)和[阮一峰ES6](https://es6.ruanyifeng.com/#docs/proxy)
> 
> `proxy` 一般用于库的封装设计，非必要不建议用在业务代码里，因为它会彻底改变数据的行为，很反常识

```js
let obj = {
  a: "1",
};

let proxy = new Proxy(obj, {
  get(obj, key) {
    console.log(obj, key);
    return obj[key];
  },
  defineProperty() {
    console.log(arguments);
  },
});
```

控制台执行

- `obj.a` 输出 1 不打印
- `proxy.a` 打印内容并输出 1
- `Object.defineProperty(proxy, "a", {value:10})` 打印函数的参数

这里可以看出原对象的 `get` 不会走进 `proxy`
因此，我们也可以把 `proxy` 不理解成代理,而是当作一个完全自定义的对象或者类或者工具库

`proxy` 的使用方式和 `promise` 类似

```js
function a() {
  return new Promise();
}

function b() {
  return new Proxy();
}
```

很少像示例那样直接 `new proxy` 后赋值给个变量

## 数据双向绑定示例

**React**
```js
// 数据
const [data, setData] = useState({ count: 1 }); // reactive()

// 观测变化 需要手动声明依赖(手动声明这个回调对应什么的ey)
useEffect(() => console.log("count changed", data.count), [data.count]);

// 触发 console.log('count changed', data.count) 重新执行
// 手动通过工具触发修改值，而不是直接修改
setData({
  count: 2,
});
```

**Vue3**
```js
const data = reactive({ count: 0 }); // 定义一个代理后的数据

effect(() => console.log("count changed", data.count)); // 定义回调，代理数据变化时触发

data.count = 2; // 修改代理后的值
```
👆 我们可以看到 `vue3` 相比于 `vue2`，需要手动把期望响应式的数据放到 `reactive` 里

`vue3` 相比于 `reactive` ，又简化了很多步骤，甚至像个无法理解的黑盒

## 基于Proxy实现数据双向绑定

需要实现的效果如👇
```js
let dummy; // 假数据
const counter = reactive({ num: 0 }); // 定义一个代理后的数据
effect(() => (dummy = counter.num)); // 定义回调，代理数据变化时触发
// dummy = counter.num; // 直接赋值的形式不会双向绑定

console.log(dummy); // 0
counter.num = 7; // 修改代理后的值
console.log(dummy); // 7
```
### 1. 实现基础get、set代理
```js
(function () {
  let dummy;

  function reactive(data) {
    return new Proxy(data, {
      get(originData, key) {
        console.log("触发get", key);
        return originData[key];
      },
      set(originData, key, newVal) {
        console.log("触发set", key);
        return (originData[key] = newVal);
      },
    });
  }
  const myData = { num: 1 }; // 原数据
  const proxyData = reactive(myData); // 代理后数据
  // 因为代理的get和set处理好了 修改原对象和修改代理对象 再访问原对象或者代理对象都能是新的值
  dummy = proxyData.num;
  console.log(dummy); // 1
  proxyData.num = 2;
  console.log(dummy); // 1
})();
```
👆 代理后的数据赋值给 `dummy`，`dummy` 不会随着代理数据变化而变化

> 但是使用数据的时候使用代理对象不就好了吗，为什么要赋值出来使用
> 看起操作的数据是外层的，不用关心数据是不是在代理对象里层？

### 2. set时触发订阅者的回调
要实现修改代理对象数据,能通知到赋值的变量,也就是 `set` 的时候再触发一次赋值(回调)
因此赋值操作需要立即执行一次，以及传递到 `set` 的回调时执行一次，用 `effect` 封装起来

```js
(function () {
  let dummy;
  const callbackList = [];

  function reactive(data) {
    return new Proxy(data, {
      get(originData, key) {
        console.log("触发get", key);
        return originData[key];
      },
      set(originData, key, newVal) {
        console.log("触发set", key);
        originData[key] = newVal;
        callbackList.forEach((fn) => fn());
        return newVal;
      },
    });
  }
  const myData = { num: 1 }; // 原数据
  const proxyData = reactive(myData); // 代理后数据

  function effect(callback) {
    callback(); // 1. 立即执行一次
    callbackList.push(callback); // 2. 传递给set的时候执行一次
    // 因为代理整个对象所以需要多个不同观察者，存储层数组，在set的时候全部执行(性能浪费)
  }

  effect(() => (dummy = proxyData.num)); // 触发立即执行回调中赋值的get
  console.log(dummy); // 1 不触发proxy的get set
  proxyData.num = 2; // 触发set 和回调中的赋值的get
  console.log(dummy); // 2 不触发proxy的get set
  /* effect(()=>{
      console.log('触发num的回调');
      dummy = proxyData.num
  }); // 触发立即执行回调中赋值的get
  effect( ()=>{
      console.log('触发num2的回调')
      dummy2 = proxyData.num2
  } ); // 触发立即执行回调中赋值的get
  console.log(dummy); // 1 不触发proxy的get set
  proxyData.num = 2; // 触发set 和回调中的赋值的get
  proxyData.num2 = 2; // 触发set 和回调中的赋值的get
  console.log(dummy); // 2 不触发proxy的get set*/
})();
```

👆 假如代理多个 `reactive` 对象，每个对象中多个属性，都共用一个 `callback` 列表，并且在 `set` 时触发所有的回调，性能浪费

理想状态是，`set` 具体的 `reactive` 对象的具体 `key` 触发相应的回调


### 3. set匹配到相应的回调来触发
我们看到现在收集回调的地方，是在立即执行时存起来，只要想办法不是单纯的往回调列表中 `push`
而是存储对象 `key value`，即可在 `set` 的时候调用相应的回调
但是回调函数是没有明显的 `key` 给我们定义的

因为要定位到是哪个 `reactive` 对象和 `key`，因此理想的`回调map数据结构`如下

```js
const callbackMap = new Map([
  [ originObj1, new Map([ [key1: callbackList], [key2: callbackList] ...  ])]
  [ originObj2, new Map([ [key1: callbackList], [key2: callbackList] ...  ])]
])
```

我们再看一下整个流程，不想污染外部，又不想在外部额外调用工具来存储回调，发现只有 `proxy` 内部可以获取到 `originObj` 和 `key`

那我们利用立即执行回调时，触发 `get` 的时机，存储回调 (有点类似 vue2 的 `computed`，依赖到的变量才会触发收集)
在立即执行触发的 `get` 里，可以初始化出回调 `map` 的数据结构
但是回调函数在 `effect` 里，此时没有 `originObj` 和 `key` ，即使已经初始化好回调 `map` 数据结构，也无法往对应的地方存储回调函数

所以外加一个临时变量存储立即执行触发的 `get` 对应的回调 `map` 数据结构中的回调列表，这样在 `effect` 里就可以往临时变量里存回调了
而在 `set` 的时候根据 `key` 获取回调 `map` 中对应的回调执行即可

```js
(function () {
  let dummy;
  const callbackMap = new Map();
  let tempCallbackList = []; // 临时变量 立即执行的回调之后获取的对应的回调列表

  function reactive(data) {
    return new Proxy(data, {
      get(originData, key) {
        console.log("触发get", key);
        if (!callbackMap.get(originData)) {
          callbackMap.set(originData, new Map());
        }
        if (!callbackMap.get(originData).get(key)) {
          callbackMap.get(originData).set(key, []);
        }
        tempCallbackList.push(callbackMap.get(originData).get(key));
        return originData[key];
      },
      set(originData, key, newVal) {
        console.log("触发set", key);
        originData[key] = newVal;
        callbackMap
          .get(originData)
          .get(key)
          .forEach((fn) => fn());
        return newVal;
      },
    });
  }
  const myData = { num: 1 }; // 原数据
  const proxyData = reactive(myData); // 代理后数据

  function effect(callback) {
    tempCallbackList = [];
    callback(); // 1. 立即执行一次
    tempCallbackList.forEach((list) => {
      list.push(callback);
    });
  }

  effect(() => (dummy = proxyData.num)); // 触发立即执行回调中赋值的get
  console.log(dummy); // 1 不触发proxy的get set
  proxyData.num = 2; // 触发set 和回调中的赋值的get
  console.log(dummy); // 2 不触发proxy的get set
  /*effect(()=>{
      console.log('触发num的回调');
      dummy = proxyData.num
  }); // 触发立即执行回调中赋值的get
  effect( ()=>{
      console.log('触发num2的回调')
      dummy2 = proxyData.num2
  } ); // 触发立即执行回调中赋值的get
  console.log(dummy); // 1 不触发proxy的get set
  proxyData.num = 2; // 触发set 和回调中的赋值的get
  proxyData.num2 = 2; // 触发set 和回调中的赋值的get
  console.log(dummy); // 2 不触发proxy的get set*/
})();
```
👆 在我们测试使用多个 `effect` 时没有问题，每个 `effect` 都会往对应的 key 里存储回调
但是当一个 `effect` 里依赖多个变量时发现了问题，只把回调存储到了最后一个变量的回调里
这是因为临时变量只对应一个 `key` 的回调列表
所以临时变量应该对应多个 `key` 的回调函数列表
在存储回调的时候遍历临时变量列表来存储

到这里，已经可以有 `vue3` 双向绑定数据的雏形
也可以发现我们是通过 `get` 来做回调存储的
当不触发 `get` 的时候就不会有回调
如：使用判断语句，只有在运行时才能知道会不会进 `get` ，在 `effect` 阶段不知道

### 4. 深度proxy
`另外，proxy` 并不自动支持深度代理， `key` 对应的回调也不没有深度数据

要想实现深度数据的 key，首先想到的可能是递归，但是这里有个更取巧的方法
就是， `effect` 立即执行阶段，如果是深度数据，只会触发外层的 `proxy`
我们可以利用判断当前值是对象时返回一个 `proxy` 代理，让深度的值继续触发 get，形成递归的样子

```js
(function () {
  let dummy;
  const callbackMap = new Map();
  let tempCallbackList = []; // 临时变量 立即执行的回调之后获取的对应的回调列表

  function reactive(data) {
    return new Proxy(data, {
      get(originData, key) {
        console.log("触发get", key);
        if (!callbackMap.get(originData)) {
          callbackMap.set(originData, new Map());
        }
        if (!callbackMap.get(originData).get(key)) {
          callbackMap.get(originData).set(key, []);
        }
        tempCallbackList.push(callbackMap.get(originData).get(key));
        // 判断当前值是对象时继续代理，形成递归
        if (typeof originData[key] === "object") {
          return reactive(originData[key]);
        }
        return originData[key];
      },
      set(originData, key, newVal) {
        console.log("触发set", key);
        originData[key] = newVal;
        callbackMap
          .get(originData)
          .get(key)
          .forEach((fn) => fn());
        return newVal;
      },
    });
  }
  const myData = { a: { b: 1 } }; // 原数据
  const proxyData = reactive(myData); // 代理后数据

  effect(() => {
    dummy = proxyData.a.b;
  });
  console.log(dummy);
  proxyData.a.b = 2;
  console.log(dummy);
})();
```

这样就让深度的对象类型数据也走一次 `proxy`
但是这样的写法有点性能问题，每次深度取值都要重新走一次 `proxy` 即使同一个值已经走过一次

### 5. 优化深度代理
这里我们用一个 `map` 存储深度对象的 `proxy` ，就以对象为 `key`
其实也像是把深度对象扁平化出来存储了，仅仅为了省去每次深度取值时的重复 `proxy`

```js
const deepProxyMap = new Map(); // 其实也像是把深度对象扁平化出来存储了，仅仅为了省去每次深度取值时的重复

function reactive(data) {
  if (deepProxyMap.has(data)) {
    return deepProxyMap.get(data);
  }

  const proxy = new Proxy(data, {
    get(originData, key) {
      console.log("触发get", key);
      if (!callbackMap.get(originData)) {
        callbackMap.set(originData, new Map());
      }
      if (!callbackMap.get(originData).get(key)) {
        callbackMap.get(originData).set(key, []);
      }
      tempCallbackList.push(callbackMap.get(originData).get(key));
      if (typeof originData[key] === "object") {
        return reactive(originData[key]);
      }
      return originData[key];
    },
  });
  deepProxyMap.set(data);
  return proxy;
}
```

## 结合dom的reactive案例

### 1. input双向数据绑定（v-model）
### 2. 拖拽取色值


---

目前很流行的一种大型项目管理方式 Monorepo
## 参考资料

[proxy-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

[vue3-reactivity](https://github.com/vuejs/core/tree/main/packages/reactivity)

[Vue3 的 Proxy 能做到哪些精确的拦截操作？原理揭秘](https://zhuanlan.zhihu.com/p/148937064)
