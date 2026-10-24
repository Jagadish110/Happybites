// The simulated gateway must be impossible to reach in production, even if someone asks for it.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'

process.env.NODE_ENV = 'production'
process.env.APP_SECRET = 'a-long-production-secret-for-the-test-run-0123456789'
process.env.COUNTER_PIN = '777777'
process.env.ADMIN_PIN = '888888'
process.env.HB_SEED_DEMO = '1'               // only so there is a student to try with
process.env.HB_TEST_GATEWAY = '1'            // explicitly asking for it must not help
process.env.HB_DB = ':memory:'
delete process.env.RAZORPAY_KEY_ID
delete process.env.RAZORPAY_KEY_SECRET

let base
let server
let token

before(async () => {
  const { createApp } = await import('../app.js')
  server = createApp().listen(0)
  base = `http://localhost:${server.address().port}/api`
})
after(() => server.close())

async function call(path, { method = 'GET', body, auth } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, body: await res.json() }
}

test('in production the test gateway is off and top-ups stay off until real keys exist', async () => {
  const meta = (await call('/meta')).body
  assert.equal(meta.testGateway, false)
  assert.equal(meta.demo, false)
  assert.equal(meta.openAccess, false, 'production requires sign-in unless open access is switched on deliberately')

  token = (await call('/parent/login', { method: 'POST', body: { code: 'KX7M2Q' } })).body.token
  const order = await call('/parent/topup/order', { method: 'POST', auth: token, body: { studentId: 'HB-2024-0518', amount: 500 } })
  assert.equal(order.status, 503)
  assert.equal(order.body.error, 'razorpay_not_configured')

  const pay = await call('/parent/topup/test-pay', { method: 'POST', auth: token, body: { orderId: 'order_TESTx', method: 'gpay' } })
  assert.equal(pay.status, 404)
})

test('in production the built-in demo PINs do not work', async () => {
  const demo = await call('/staff/login', { method: 'POST', body: { staffId: 'CNT-01', pin: '1234' } })
  assert.equal(demo.status, 401)
  const real = await call('/staff/login', { method: 'POST', body: { staffId: 'CNT-01', pin: '777777' } })
  assert.equal(real.status, 200)
})
