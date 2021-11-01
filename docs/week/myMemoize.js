function memoizeAsync(fn, getKey) {
  const memo = {};

  return function memoized(...allArgs) {
    return new Promise((resolve)=>{
      const args = allArgs;
      const key = getKey(...args);
  
      if (memo.hasOwnProperty(key)) {
        resolve(memo[key])
        return;
      } else {
        // memo[key] = 'pending状态的异步事件'; // 异步事件传递进来还没开始promise异步呢
        // TODO: 待验证，可以这样赋值吗，外部await
        memo[key] = fn.call(this, ...args).then(res=>{
          memo[key] = res
          resolve(res);
        })
      }
      // const res = await fn.call(this, ...args); // 传递进来异步事件fn必须是个promise
    })
  };

}

const memoExpensiveOperation = memoizeAsync(expensiveOperation, (key) => key);
const res = await memoExpensiveOperation(key)
callback(res)
