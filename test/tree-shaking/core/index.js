// import acorn from 'acorn' // 无效 因为奇奇怪怪的导出方式
import * as acorn from "acorn";
import { output, readEntrier } from "./readWriterFile.js"
import { shaking } from './shaking.js'

const buffer = readEntrier()

const { body } = acorn.parse(buffer, {ecmaVersion: 2020})

// 步骤：扫描所有声明的变量 扫描所有使用的变量，按照使用的变量 取 对应声明的变量，最后拼接
const afterShakingCodeStr = shaking(body)

output(afterShakingCodeStr)