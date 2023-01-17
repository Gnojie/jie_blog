
package.json 中的配置

## exports

[Nodejs官方文档](https://nodejs.org/api/packages.html#package-entry-points)

> The `"exports"` provides a modern alternative to `"main"` allowing multiple entry points to be defined, conditional entry resolution support between environments, and preventing any other entry points besides those defined in `"exports"`.
> 
> exports 配置是替换 main 的现代输出配置
> 🤔 以往的 js库 一般都是定义 main 为 UMD 吗


> the "exports" field is recommended. For packages supporting Node.js 10 and below, the "main" field is required. If both "exports" and "main" are defined, the "exports" field takes precedence over "main" in supported versions of Node.js.
>
> 👆 低于nodejs10 不支持exports 只能用 main
> 
> 对于支持的nodejs export 优先级高于 main


> To make the introduction of "exports" non-breaking, ensure that every previously supported entry point is exported. It is best to explicitly specify entry points so that the package's public API is well-defined. 
>
> 👆 显式定义可被引入的 entry points 是更好的


```json
{
  "exports": "./index.js"
}
```

等同于
```json
{
  "exports": {
    ".": "./index.js"
  }
}
```
👆 `"."` 是默认输出值 也等同于 `"main"` 配置

### exports省略后缀写法

[import map package - github](https://github.com/WICG/import-maps#packages-via-trailing-slashes)


### exports常见exports配置

```json
{
  "exports": {
    ".": {
      "types": "index.d.ts",
      "module": "index.js",
      "import": "index.js",
      "require": "index.cjs",
      "default": "index.js"
    },
    "./package.json": "./package.json"
  }
}
```

👆 type module 是什么？
 
nodejs 文档只有 `node-addons node import require default`

- export
  - 动词: 输出
  - 名词: 出口/出口货物 exports
- output
  - 动词: 输出
  - 名词: 产量/出口量

根据不同的条件输出对应的文件
- 文件是被 import 还是被 require
- 开发人员需要的是 development 版本的库还是 production 版本

## main

`main` 是当打包工具或运行时不支持 package exports 时的兜底方案

如果打包工具或运行时支持 package exports，则不会使用 `main`

❕ 是不会使用, 而不仅仅是优先级

`main` 应该指向一个兼容 CommonJS 格式的产出；它应该与 package exports 中的 `require` 保持一致。

## module

`module` 是当 `打包工具` 或运行时不支持 package exports 时的兜底方案

如果打包工具或运行时支持 package exports，则不会使用 `module`。

`module` 应该指向一个兼容 ESM 格式的产出；它应该与 package exports 中的 `module` 或 `import` 保持一致。

## files

用于 npm 发包

[files - npm官方文档](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#files) 决定 `npm` CLI 在打包库时哪些文件和目录包含到最终的 NPM 包中。

例如，如果你将代码从 TypeScript 编译为 JavaScript，你可能就不想在 NPM 包中包含 TypeScript 的源代码。（相反，你应该包含 sourcemap）。

`files` 可以接受一个字符串数组（如果需要，这些字符串可以包含类似 glob 的语法），例如：

```json
{
  "files": ["dist"]
}
```

注意，文件数组不接受相对路径表示；`"files": ["./dist"]` 将无法正常工作。

验证你已正确设置 `files` 的一种好方法是运行 [`npm publish --dry-run`](https://docs.npmjs.com/cli/v8/commands/npm-publish#dry-run)，它将根据此设置列出将会包含的文件。

## types

package exports 可以配置 types

如果打包工具或运行时支持 package exports，则不会使用 types。

types 应该指向你的 TypeScript 入口文件，例如 index.d.ts；它应该与 package exports 中的 types 字段指向同一个文件。

## peerDependencies

外置框架。只有在开发人员自行安装你需要的框架后才能工作

设置 peerDependencies 让他们知道他们需要安装的框架。- 例如，如果你在创建一个 React 库：

npm v3-v6 不安装 peer dependencies，而 npm v7+ 将自动安装 peer dependencies。

## 双包注意事项

[Node最新Module导入导出规范-翻译Nodejs官方文档(Nodejs.cn太机翻了)](https://juejin.cn/post/6972006652631318564)

## 简易打包方法

## 发包

## 参考资料

- [打包 JavaScript 库的现代化指南](https://github.com/frehner/modern-guide-to-packaging-js-library/blob/main/README-zh_CN.md)

