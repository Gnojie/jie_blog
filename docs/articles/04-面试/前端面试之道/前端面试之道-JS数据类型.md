## JS数据类型

### 基础(原始)类型
> js基础(原始)类型有哪几种？

- boolean
- number
- string
- null
- undefined
- symbol

基础类型存储的是值(而非指针内存空间),是没有函数可以调用的
如 `1.toString()` 报错

---

🤔: 有意思的是 `'1'.toString()`字符串类型有函数调用,`(1).toString()`正常调用输出`'1'`

这是因为调用的时候`'1'`已经不是基础类型，而是`String对象类型`，`(1)`同理，不是数字类型

---

🤔: 有意思的是 `typeof null --> object` , 但是`null`是**基础类型而非对象类型**，这是因为`typeof` 判断类型根据`000`开头代表对象, 而`null`被设置为`全0`, 这也是JS的悠久BUG

---

### 对象(引用)类型

> 对象类型和基础(原始)类型的不同之处

基础类型存储的是值，对象类型存储的是指针(地址)内存空间

并且可以 `.xx` 的形式调用函数

```js
const a = []
const b = a
b.push(1)
```

创建一个空数组内存空间，得到指针 `#001` 赋值给常量a，a赋值给常量b，即a和b都是 `#001`的指针

修改数组，也就是a和b指针的内容都发生变化
这也是深浅拷贝出现的原因

### JS内存空间

这里从最简单的赋值开始理解
- 首先浏览器执行JS代码，需要有JS执行的环境（空间）
- 其次是执行JS的人

与👆对应的是
1. 环境：从电脑内存（运行内存,一般为8g）分配出一块内存，即，`栈内存Stack`
2. 人：`栈内存`里再分配出一个`主流程`用来自上而下执行JS
> ps: `栈内存`里有`变量存储空间`、`值存储空间`、`主线程`

例如：
```js
let a = 1
```
在浏览器执行会发生
1. 创建变量a，放到`变量存储空间`
2. 创建一个值1，放到`值存储空间`，（引用类型值不是简单的放到`值存储空间`）
3. =赋值，使`变量存储空间`的变量指向相应的`值存储空间`的值
👆简单来说
1. 执行 `‘=‘` 左边
2. 执行 `‘=‘` 右边
3. 执行 `‘=‘` 赋值

引用类型值
对应 👆 第2步创建值的时候，需要3个步骤
1. 在内存中分配出一块新内存，即，`堆内存heap`
  - 且堆内存有个16进制的地址(指针)，用于给变量指向自己
2. 把引用类型值（对象）依次存入堆内存中(键值对形式)
3. 把`值存储空间`的值地址(16进制)指向相应的`堆内存`

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221201205655.png)

👆这就是深浅拷贝出现的原因，引用类型值修改了内容
另一个指向它的值也被改变了，从而导致bug


### 类型判断

> `typeof`除了`null`判断不出真实类型外，还有什么其他问题？而`instanceof`判断类型的原理是什么？

```js
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'undefined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'

typeof [] // 'object'
typeof {} // 'object'
typeof console.log // 'function'
```
基础类型中 `typeof`只是判断不出 `null`
引用类型中 只能判断出 `object` 和 `function`

TODO: 
`instanceof` 原理是根据原型链判断类型的，因此可以知道引用类型的具体类型
```js
// 构造函数
const Person = function() {}
const p1 = new Person()
p1 instanceof Person // true

// 字符串
var str1 = new String('hello world')
str1 instanceof String // true
```

`'hello world' instanceof String --> false`

基础类型并不能判断出来！！！

---

🤔: 原型链也是可以篡改的，当通过`[Symbol。hasInstance]`修改原型链， `instanceof` 也不是百分之百可信, 那现在常用的js判断类型工具方法是什么，又是否可信呢？

---

### 类型隐式转化

#### TODO: 对象转基础类型
对象在转换类型的时候，会调用内置的 [[ToPrimitive]] 函数，对于该函数来说，算法逻辑一般来说如下：

- 如果已经是原始类型了，那就不需要转换了
- 调用 x.valueOf()，如果转换为基础类型，就返回转换的值
- 调用 x.toString()，如果转换为基础类型，就返回转换的值
- 如果都没有返回原始类型，就会报错

当然你也可以重写 Symbol.toPrimitive ，该方法在转原始类型时调用优先级最高。
```js
let a = {
  valueOf() {
    return 0
  },
  toString() {
    return '1'
  },
  [Symbol.toPrimitive]() {
    return 2
  }
}
1 + a // => 3
```

#### 四则运算导致隐式转化
- 加法：把非数字字符串类型，先转化为数字或字符串，如果其中一方是字符串就会把另一方也转换为字符串
  - `true + true --> 2` 先转化为数字，再相加，且没有字符串结果为数字2
  - `4+[1,2,3] --> '41,2,3'` 数组先`toString`转化为字符串`'1,2,3'`,其中一方是字符串，因此另一方数字4转化为字符串后相加
  - `'a' + + 'b' --> 'aNaN'` 先计算后面(TODO: why?)的` + 'b' --> NaN` 类似于 `+'1'`可以转化字符串，最终`'a' + NaN --> 'aNaN'`
- 减乘除，一方是数字，另一方就会被转为数字
  - `4*[] --> 0` `4*[1,2]-->NaN`

#### 比较运算导致隐式转化
- 对象类型 通过 `toPrimitive` 转换对象(TODO: what?)，通过 `valueOf` 转换为原始类型再比较值
  - `a > -1 --> true` 这里我们可以覆盖a对象的`valueOf`函数 `a = { valueOf(){return -2} }`，就可以影响到对象比较结果
- 字符串类型 通过 `unicode` 字符索引比较

#### 非全等判断语句导致隐式转化

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221130150234.png)

---

🤔: `[] == ![]` 的转化过程 TODO:

---

#### JS 中类型转换只有三种情况

- 各种类型转换为布尔值
  -  `undefined` `null` `false` `NaN` `''` `0` `-0` 转为 `false`
  - 其他所有值都转为 `true` ，包括所有对象
- 各种类型转换为数字
- 各种类型转换为字符串

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20221130095726.png)
👆 对应各种类型转化为布尔、字符串、数字的结果


### TODO: 作为小册，并不详细，详细知识后续补充！
