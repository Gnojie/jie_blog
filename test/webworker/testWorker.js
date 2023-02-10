self.onmessage = ({ data }) => {
  console.log('worker线程输出', data)
  self.postMessage({ name: data.name, info: `Worker处理后的info: ${data.info}` });
}