self.onmessage = ({ data }) => {
  let startTime = performance.now();
  console.log('worker线程输出', data)
  const {arr, calcList} = data.info

  calcList.forEach(item=>{
    if(item.type === 'sum') {
      const sum = arr.reduce((res, next) => res + next, 0)
      item.res = sum
    }
    if(item.type === 'average') {
      const sum = arr.reduce((res, next) => res + next, 0)
      item.res = sum / arr.length
    }
  })

  let endTime = performance.now();
  let duration = endTime - startTime;
  console.log(`计算(不含通信)耗时: ${duration} 毫秒`);

  self.postMessage({ name: data.name, info: data.info, time: + new Date() });
}