## 最基础的功能是数据驱动视图，那和以往用模版语法写页面有什么区别呢？都是用js来写页面

## Vue的数据驱动视图作用

react、小程序
```js
const data = {a:'1'}
setData({a:'2'})

setData(newData) {
  Object.assign(data,newData)
  render()
}

render() {
  dealHtml() // 结合template和data 得到新的html来innerHtml渲染
}
```