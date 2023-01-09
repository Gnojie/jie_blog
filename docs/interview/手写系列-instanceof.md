
👇 typeof只能判断六种类型，即function、object、undefined、string、boolean、number。
```js
function abc() {}
console.log(typeof abc); // function

let bool = true;
console.log(typeof bool); // boolean

let num = 12;
console.log(typeof num); // number

let str = 'str';
console.log(typeof str); // string

let unde;
console.log(typeof unde); // undefined

let nu = null;
console.log(typeof nu); // object

let obj = {};
console.log(typeof obj); // object
```

思路：
- 步骤1：先取得当前类的原型，当前实例对象的原型链
- 步骤2：一直循环（执行原型链的查找机制）
  - 取得当前实例对象原型链的原型链（proto = proto.__proto__，沿着原型链一直向上查找）
  - 如果当前实例的原型链__proto__上找到了当前类的原型prototype，则返回true
  - 如果一直找到Object.prototype.__proto__==null，Object的基类(null)上面都没找到，则返回false

```js
// 实例.__ptoto__ === 类.prototype
function myInstanceof(example, classFunc) {
  let proto = Object.getPrototypeOf(example);
  while(true) {
    if(proto == null) return false;

    // 在当前实例对象的原型链上，找到了当前类
    if(proto == classFunc.prototype) return true;
    // 沿着原型链__ptoto__一层一层向上查
    proto = Object.getPrototypeof(proto); // 等于proto.__ptoto__
  }
}
```