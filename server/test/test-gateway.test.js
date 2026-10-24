// The simulated payment gateway, as used in development before Razorpay keys exist.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'

process.env.HB_DB = ':memory:'
process.env.HB_OPEN_ACCESS = '0'          // these suites check that sign-in is enforced
delete process.env.RAZORPAY_KEY_ID
delete process.env.RAZORPAY_KEY_SECRET
delete process.env.NODE_ENV
delete process.env.HB_TEST_GATEWAY

let base
let server
let db
let parent

before(async () => {
  const { createApp } = await import('../app.js')
  ;({ db } = await import('../db.js'))
  server = createApp().listen(0)
  base = `http://localhost:${server.address().port}/api`
})
after(() => server.close())

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, body: await res.json() }
}

const AARAV = 'HB-2024-0518'
const bal = () => db.prepare('SELECT balance_paise FROM students WHERE id = ?').get(AARAV).balance_paise / 100
const order = (amount) => call('/parent/topup/order', { method: 'POST', token: parent, body: { studentId: AARAV, amount } })
const pay = (orderId, method = 'gpay', outcome) =>
  call('/parent/topup/test-pay', { method: 'POST', token: parent, body: { orderId, method, outcome } })
const verify = (body) => call('/parent/topup/verify', { method: 'POST', token: parent, body })

test('without Razorpay keys the test gateway is on and says so', async () => {
  const meta = (await call('/meta')).body
  assert.equal(meta.razorpay, false)
  assert.equal(meta.testGateway, true)
  parent = (await call('/parent/login', { method: 'POST', body: { code: 'KX7M2Q' } })).body.token
})

test('a simulated payment follows the real flow: order, pay, verify, credited once', async () => {
  const o = await order(2000)
  assert.equal(o.status, 200)
  assert.equal(o.body.test, true)
  assert.equal(o.body.amount, 200000)
  assert.match(o.body.orderId, /^order_TEST/)

  const before = bal()
  const paid = await pay(o.body.orderId, 'phonepe')
  assert.equal(paid.status, 200)
  assert.equal(bal(), before, 'paying alone credits nothing; the verify step does')

  const first = await verify(paid.body)
  assert.equal(first.status, 200)
  assert.equal(first.body.credited, true)
  assert.equal(bal(), before + 2000)

  const again = await verify(paid.body)
  assert.equal(again.body.credited, false)
  assert.equal(bal(), before + 2000, 'verifying twice must not credit twice')

  const row = db.prepare("SELECT ref, note FROM wallet_ledger WHERE kind = 'topup' ORDER BY id DESC LIMIT 1").get()
  assert.match(row.ref, /^test_pay_/)
  assert.match(row.note, /TEST/)
})

test('a declined simulated payment takes nothing and credits nothing', async () => {
  const o = await order(500)
  const before = bal()
  const failed = await pay(o.body.orderId, 'card', 'failure')
  assert.equal(failed.status, 402)
  assert.equal(failed.body.error, 'payment_failed')
  assert.equal(bal(), before)

  // the same order can still be paid properly afterwards
  const retry = await pay(o.body.orderId, 'gpay')
  assert.equal(retry.status, 200)
  assert.equal((await verify(retry.body)).body.credited, true)
  assert.equal(bal(), before + 500)
})

test('a made-up signature, an unknown order and an unknown method are refused', async () => {
  const o = await order(300)
  const before = bal()
  const forged = await verify({ razorpay_order_id: o.body.orderId, razorpay_payment_id: 'test_pay_fake', razorpay_signature: 'beef' })
  assert.equal(forged.status, 400)
  assert.equal((await pay('order_TESTnope')).status, 404)
  assert.equal((await pay(o.body.orderId, 'cheque')).status, 400)
  assert.equal(bal(), before)
})

test('a parent cannot pay a different family order, and an order cannot be paid twice', async () => {
  const other = (await call('/parent/login', { method: 'POST', body: { code: 'PD4B9T' } })).body.token
  const o = await order(100)
  const stolen = await call('/parent/topup/test-pay', { method: 'POST', token: other, body: { orderId: o.body.orderId, method: 'gpay' } })
  assert.equal(stolen.status, 403)

  const p = await pay(o.body.orderId)
  await verify(p.body)
  assert.equal((await pay(o.body.orderId)).status, 409)
})

test('test money is labelled and kept out of the paid-in figure', async () => {
  const owner = (await call('/staff/login', { method: 'POST', body: { staffId: 'ADMIN', pin: '4321' } })).body.token
  const w = (await call('/admin/summary', { token: owner })).body.wallet
  assert.equal(w.collected, 0, 'simulated payments are not real money')
  assert.equal(w.testCredited, 2000 + 500 + 100)

  const kid = (await call('/parent/students', { token: parent })).body.students.find((s) => s.id === AARAV)
  assert.ok(kid.transactions.some((t) => t.sub.includes('Test payment')), 'history says it was a test payment')
})
