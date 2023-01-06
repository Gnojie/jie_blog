function visitVariableDeclaration(node) {
  let str = ''
  str += node.kind + ' '
  str += visitNodes(node.declarations)
  return str + '\n'
}
export function visitVariableDeclarator(node, kind) {
  let str = ''
  str += kind ? kind + ' ' : str
  str += visitNode(node.id)
  str += '='
  str += visitNode(node.init)
  return str + ';' + '\n'
}
export function visitIdentifier(node) {
  return node.name
}
function visitLiteral(node) {
  return node.raw
}
function visitBinaryExpression(node) {
  let str = ''
  str += visitNode(node.left)
  str += node.operator
  str += visitNode(node.right)
  return str + '\n'
}
function visitFunctionDeclaration(node) {
  let str = 'function '
  str += visitNode(node.id)
  str += '('
  for (let param = 0; param < node.params.length; param++) {
    str += visitNode(node.params[param])
    str += ((node.params[param] == undefined) ? '' : ',')
  }
  str = str.slice(0, str.length - 1)
  str += '){'
  str += visitNode(node.body)
  str += '}'
  return str + '\n'
}
function visitBlockStatement(node) {
  let str = ''
  str += visitNodes(node.body)
  return str
}
function visitCallExpression(node) {
  let str = ''
  const callee = visitIdentifier(node.callee)
  str += callee + '('
  for (const arg of node.arguments) {
    str += visitNode(arg) + ','
  }
  str = str.slice(0, str.length - 1)
  str += ');'
  return str + '\n'
}
function visitReturnStatement(node) {
  let str = 'return ';
  str += visitNode(node.argument)
  return str + '\n'
}
function visitExpressionStatement(node) {
  return visitNode(node.expression)
}

function visitNodes(nodes) {
  let str = ''
  for (const node of nodes) {
    str += visitNode(node)
  }
  return str
}

export function visitNode(node) {
  let str = ''
  switch (node.type) {
    case 'VariableDeclaration':
      str += visitVariableDeclaration(node)
      break;
    case 'VariableDeclarator':
      str += visitVariableDeclarator(node)
      break;
    case 'Literal':
      str += visitLiteral(node)
      break;
    case 'Identifier':
      str += visitIdentifier(node)
      break;
    case 'BinaryExpression':
      str += visitBinaryExpression(node)
      break;
    case 'FunctionDeclaration':
      str += visitFunctionDeclaration(node)
      break;
    case 'BlockStatement':
      str += visitBlockStatement(node)
      break;
    case "CallExpression":
      str += visitCallExpression(node)
      break;
    case "ReturnStatement":
      str += visitReturnStatement(node)
      break;
    case "ExpressionStatement":
      str += visitExpressionStatement(node)
      break;
  }
  return str
}

// 手动把一个ast节点转化为代码字符串（为什么不删除ast节点，然后用ast转代码库 整体转化？？？）
export function astToCodeString(body) {
  let str = ''
  str += visitNodes(body)
  return str
}