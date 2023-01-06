import fs from 'node:fs'

export function readEntrier() {
  const buffer = fs.readFileSync('./src/index.js').toString()
  return buffer
}

export function output(code) {
  fs.writeFileSync('dist/index.shaked.js', code)
}
