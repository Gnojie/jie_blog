export default class App {
  static modules = [] // module约定为一个含有init函数的对象
  constructor() {
    this.init();
  }
  static use(module) {
    App.modules.push(module);
  }
  init() {
    App.modules.map(module => module.init(this));
  }
}