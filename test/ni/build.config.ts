import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/commands/ni'
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
})