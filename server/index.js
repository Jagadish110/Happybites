import { config, isProd } from './config.js'
import { createApp } from './app.js'
import { rzpStatus } from './status.js'

createApp().listen(config.port, () => {
  console.log(`Happybites API on http://localhost:${config.port}`)
  console.log(rzpStatus())
  if (!isProd) console.log('Dev mode: demo PINs in use (counter CNT-01 / 1234, admin ADMIN / 4321).')
})
