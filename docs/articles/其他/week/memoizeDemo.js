function memoize(fn, getKey){
  const memo = {}
  return function memoized(...args){
     const key = getKey(...args)
     if(memo.hasOwnProperty(key)) return memo[key]

     memo[key] = fn.apply(this, args)
     return memo[key]
  }
}

// 获取平方值的方法
const getSquare = x => x * x
// 缓存平方方法
const memoGetSquare = memoize(getSquare, num => num)
memoGetSquare(2); // ==> 4


const getDivision = (a, b) => a/b
const memoGetDivision= memoize(getDivision, (a, b) => `${a}_${b}`)
