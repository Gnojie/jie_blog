

## day.js的format
```js
function format(val,target='YYYY-MM-DD') {
  // 把target字符串用正则repalce
  target.replace(/Y{2,4}|M{1,4}|D{1,2}/g,item=>{
    console.log(item,val)
  })
}
format('20300101')
```


## date-fns的format

## 页面反显空格的format
