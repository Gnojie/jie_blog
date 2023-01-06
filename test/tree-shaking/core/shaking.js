import {astToCodeString, visitNode, visitVariableDeclarator,visitIdentifier} from './astToCodeString.js'

export function shaking(astBody) {

  // decls保存所有声明函数和变量
  // calledDecls中存放的是所使用的声明的名词
  // code中放其它非声明ast的代码。
  let declarationList = new Map()
  let calledDeclarationList = []
  let code = []

  astBody.forEach(function (node) {
    // 函数声明 存放到 declarationList 的 Map 中
    if (node.type == "FunctionDeclaration") {
      const code = astToCodeString([node])
      declarationList.set(visitNode(node.id), code)
      return;
    }
    // 变量声明表达式，kind 属性表示是什么类型的声明，值可能是var/const/let
    // declarations 数组 表示声明的多个描述，因为我们可以这样：let a = 1, b = 2
    // 存放到 declarationList 的 Map 中
    if (node.type == "VariableDeclaration") {
      const kind = node.kind
      for (const decl of node.declarations) {
        declarationList.set(visitNode(decl.id), visitVariableDeclarator(decl, kind))
      }
      return
    }
    if (node.type == "ExpressionStatement") {
      // 函数调用表达式，比如：setTimeout(()=>{})
      // callee 属性是一个表达式节点，表示函数
      // arguments 是一个数组，元素是表达式节点，表示函数参数列表
      if (node.expression.type == "CallExpression") {
        const callNode = node.expression
        calledDeclarationList.push(visitIdentifier(callNode.callee))
        const args = callNode.arguments
        for (const arg of args) {
          if (arg.type == "Identifier") {
            calledDeclarationList.push(visitNode(arg))
          }
        }
      }
    }
    // Identifier- 标识符，就是我们写 JS 时自定义的名称，如变量名，函数名，属性名，都归为标识符
    // 表示的是使用变量？ 存放到 calledDeclarationList 数组中
    if (node.type == "Identifier") {
      calledDeclarationList.push(node.name)
    }
    code.push(astToCodeString([node]))
  });

  const afterShakingCodeStr = calledDeclarationList.map(c => {
    return declarationList.get(c)
  }).concat([code]).join('')
  
  return afterShakingCodeStr
}