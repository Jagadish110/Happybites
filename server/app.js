import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { HttpError } from './http.js'
import { api, razorpayWebhook } from './routes.js'

function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.code, message: err.message, ...err.data })
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'bad_json', message: 'That request could not be read' })
  }
  console.error(err)
  res.status(500).json({ error: 'server_error', message: 'Something went wrong on our side' })
}

export function createApp() {
  const app = express()
  app.disable('x-powered-by')

  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    next()
  })

  // The webhook needs the exact bytes Razorpay signed, so it is read raw, before JSON parsing.
  app.post('/api/razorpay/webhook', express.raw({ type: 'application/json', limit: '200kb' }), razorpayWebhook)

  app.use('/api', express.json({ limit: '100kb' }), api, errorHandler)
  app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found', message: 'No such endpoint' }))

  // After `npm run build`, this same server also hosts the website.
  const dist = path.resolve('dist')
  if (fs.existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist))
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
  }
  return app
}
