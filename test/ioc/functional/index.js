import { createApp } from "./app.js";
import a from './a.js'

const app = createApp()
app.use(a)
app.run()

console.log(app)