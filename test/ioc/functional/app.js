export function createApp() {
  const modules = [] // module约定为一个含有init函数的对象

  const use = (module)=>{
    modules.push(module)
  }
  const run = ()=>{
    modules.map(module => module.init(app));
  }
  
  const app = {
    use,
    run
  }

  return app
}