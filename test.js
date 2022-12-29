// 创建2个普通函子
const TryFunctor = (val) => ({
  next: fn => TryFunctor(fn(val)),

  // run接收2个回调函数，只执行第一个
  run: (successCallBack, errCallBack) => successCallBack(val)
})

const CatchFunctor = (val) => ({
  next: () => CatchFunctor(val),

  // run接收2个回调函数，只执行第二个
  run: (successCallBack, errCallBack) => errCallBack(val)
})

function doSomeThing(str) {
  return JSON.parse(str)
}
function successFn(val) {
  console.log('执行成功',val)
}
function doErrorThing(err) {
  console.log('执行失败',err)
}

// 原try catch
// function tryCatchFn() {
//   try{
//     doSomeThing('{}')
//     successFn()
//   }catch(err){
//     doErrorThing(err)
//   }
// }
// tryCatchFn()

// ifelse 函子
function TryCatchFunctor(fn) {
  try{
    return TryFunctor(fn())
  }catch(err){
    return CatchFunctor(err)
  }
}


// TryCatchFunctor( () => doSomeThing('{"name":"a"}') )
//     .next(res => res.name)
//     .run(successFn, doErrorThing)

// 组合多个函数 compose
function compose(...fns){
  return (value) => {
    // 倒序执行
    return fns.reverse().reduce((lastRes, fn) => fn(lastRes), value);
  }
}


function tryCatchCompose(...fns) {
  return (successCall, errCallback) => {
    try{
      const composeFn = compose(...fns)
      const res = composeFn()
      successCall(res)
    } catch(err) {
      errCallback(err)
    }
  }
}

const tryCatchDoSomething = tryCatchCompose( res => res.name , () => doSomeThing('') )

// tryCatchDoSomething(successFn, doErrorThing)

// Promise 内部的3个状态
const PENDING = 'pending' // 等待状态
const RESOLVED = 'resolved' // 完成状态
const REJECTED = 'rejected' // 拒绝状态


function MyPromise(fn) {
  this.state = PENDING
  this.res = null

  this.onFulfilled = null
  this.onRejected = null

  // Promise 提供回调函数的2个参数 resolve函数 reject函数
  function resolve(value) {
    // 只从等待状态 修改为 完成，已经修改过状态的不会执行
    if (this.state === PENDING) {
      this.state = RESOLVED // 修改状态为 完成
      this.res = value // 记录res
      this.onFulfilled(this.res)
    }
  }
  function reject(value) {
    if (this.state === PENDING) {
      this.state = REJECTED // 修改状态为 拒绝
      this.res = value // 记录res
      this.onRejected()
    }
  }
  
  fn(resolve.bind(this),reject.bind(this))
}
MyPromise.prototype.then = function (onFulfilled, onRejected){
  this.onFulfilled = onFulfilled
  this.onRejected = onRejected
}

// new MyPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve(1)
//   }, 0)
// }).then(value => {
//   console.log(value)
// })


/******************************** */

// 执行中间件
const run = (middlewares) => {
  middlewares.forEach(middleware => {
    if(typeof middleware === 'function'){
      middleware()
      return
    }
    middleware.pre()
  });
  middlewares.reverse().forEach(middleware => {
    if(typeof middleware === 'function') return
    middleware.post()
  });
}

function createKoa() {
  let middlewares = []

  // 挂载中间件
  const use = (middleWare) => {
    middlewares.push(middleWare)
  }

  return {
    use,
    run:run.bind(null,middlewares)
  }
}

// const middleWare1 = (next) => {
// 	console.log('first start')
// 	next()
// 	console.log('first end')
// }
// const middleWare2 = (next) => {
// 	console.log('second start')
// 	next()
// 	console.log('second end')
// }
// const middleWare3 = () => {
//   console.log('third no next')
// }
const middleWare1 = {
  pre: () => console.log('first start'),
  post: () => console.log('first end')
}
const middleWare2 = {
  pre: () => console.log('second start'),
  post: () => console.log('second end')
}
const middleWare3 = () => console.log('third no next')

const koa = createKoa()

koa.use(middleWare1)
koa.use(middleWare2)
koa.use(middleWare3)

koa.run()