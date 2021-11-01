[toc]

## create-vue脚手架
> 参考文章[Vue 团队公开快如闪电的全新脚手架工具 create-vue，未来将替代 Vue-CLI，才300余行代码](https://juejin.cn/post/7018344866811740173)


```bash
npm init vue@next
```

在习惯里，npm的脚手架依赖库工具都是通过全局安装依赖后，使用该库的指令进行搭建
如⬇️ vue-cli脚手架
```bash
npm i -g @vue/cli
vue create hello-world
```

而`npm init`则是给项目路径初始化出`package.json`文件，初始化项目目录的指令

为什么`npm init vue@next` 就可以安装脚手架依赖并运行脚手架搭建指令呢？
注意这里的`npm init xx` 不是安装依赖的指令`npm i xx` = `npm install xx`

npm init 用法：
```bash
npm init [--force|-f|--yes|-y|--scope]
npm init <@scope> (same as `npx <@scope>/create`)
npm init [<@scope>/]<name> (same as `npx [<@scope>/]create-<name>`)
```

npm init xxx -> npx create-xxx
npm init @xxx -> npx @xxx/create
npm init @xxx/foo -> npx @xxx/create-foo

⬆️ @xx为命名空间，相当于一个依赖库的集合名称，而这些参数都会按照一定规则补充`create`名称

再来看这行指令`npm init vue@next`，需要注意到是依赖名后加`@xx`不是命名空间，而是指定版本
所以忽视安装依赖的版本则简化为 `npm init vue`
转化为`npx create-vue`

而[npx指令](http://nodejs.cn/learn/the-npx-nodejs-package-runner)，不仅能直接运行`node_modules`中的库，还能不把依赖安装到本地来运行指令(估计是安装到了本地缓存，运行完自动清除那种)
如下官方示例
```bash
npx cowsay "你好"
```
运行结果为
```console
 _______
< 你好 >
 -------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```
这是`npx`安装`cowsay`的库并运行后的结果

到这里我们知道了`npm init vue@next`
就是本地执行`npx create-vue`
本地安装`create-vue`的脚手架库(不安装到本地而是安装到缓存并运行完清除),并运行的运行搭建指令

> 另外，npx的这个不安装到本地的特性其实也可以用到vue-cli的脚手架框架
> 即 `npx @vue/cli create demoName`
> 所以到这里并不能体现新的脚手架有多值得替换`npx create-vue`

## create-vue真正强大的地方在于他创建项目的速度
> 快的原因，主要在于依赖少（能不依赖包就不依赖），源码行数少，目前index.js只有300余行。

> 帮助创建项目的工具，都是下载项目模版和安装项目所需的依赖而已，这能怎么提升速度呢？


## 开始实现
以上只是简化了安装脚手架依赖的初始化步骤
开始询问式配置并创建项目文件夹和文件才是重点

1. 问答式输入配置
2. 解析配置成数据结构
3. 根据配置进行相应内置的插件初始化文件

以上是主流程，同时提供
1. 解析指令式配置，跳过问答
2. 检测同名项目文件夹，提示覆盖
3. ts需要修改所有js文件的后缀成ts
4. 代码生成readme文件内容

### 实现问答式配置




## git clone项目把提交记录也保留下来

在 github 上新建一个仓库 `create-vue-analysis` 克隆下来
```bash
git clone https://github.com/lxchuan12/create-vue-analysis.git
cd create-vue-analysis
git subtree add --prefix=create-vue https://github.com/vuejs/create-vue.git main
```
这样就把 create-vue 文件夹克隆到自己的 git 仓库了。且保留的 git 记录
复制代码
关于更多 git subtree，可以看[Git Subtree](https://segmentfault.com/a/1190000003969060) 简明使用手册

## 减少了删除文件夹依赖`rimraf`
自己实现一个利用多叉树深搜中的后序遍历，先删除子文件和子文件夹，才能保证当前文件夹为空，才能直接用`fs.rmdirSync`来删除文件夹
`多叉树深搜中的后序遍历`，看下面的代码也就普通的递归而已...这么高级的算法名字
```js
function postOrderDirectoryTraverse(dir, dirCallback, fileCallback) {
  for (const filename of fs.readdirSync(dir)) {
    const fullpath = path.resolve(dir, filename)
    // 如果是文件夹，递归
    if (fs.lstatSync(fullpath).isDirectory()) {
      postOrderDirectoryTraverse(fullpath, dirCallback, fileCallback)
      // 子文件和子文件夹都处理好了再来用 dirCallback 处理这个文件夹
      dirCallback(fullpath)
      continue
    }
    // 如果是文件，直接用 fileCallback 处理
    fileCallback(fullpath)
  }
}

function emptyDir(dir) {
  // 传入文件夹回调和文件回调
  postOrderDirectoryTraverse(
    dir,
    (dir) => fs.rmdirSync(dir),
    (file) => fs.unlinkSync(file)
  )
}
```

这个提升的速度不大吧...除此之外好像没有别的提升速度的地方了吧

