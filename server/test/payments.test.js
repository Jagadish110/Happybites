// End-to-end tests of the money paths against a throwaway database and a fake
// Razorpay. Run with:  npm run test:server
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import http from 'node:http'

process.env.HB_DB = ':memory:'
process.env.RAZORPAY_KEY_ID = 'rzp_test_fake'
process.env.RAZORPAY_KEY_SECRET = 'fake_key_secret'
process.env.RAZORPAY_WEBHOOK_SECRET = 'fake_hook_secret'

// ---- a stand-in for api.razorpay.com ------------------------------------------
let orderCounter = 0
const rzpOrders = []
const fakeRazorpay = http.createServer((req, res) => {
  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', () => {
    const want = 'Basic ' + Buffer.from('rzp_test_fake:fake_key_secret').toString('base64')
    if (req.headers.authorization !== want) {
      res.writeHead(401, { 'content-type': 'application/json' })
      return res.end(JSON.stringify({ error: { description: 'Authentication failed' } }))
    }
    const data = JSON.parse(body)
    orderCounter += 1
    const order = { id: `order_T${orderCounter}`, entity: 'order', status: 'created', ...data }
    rzpOrders.push(order)
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(order))
  })
})

let base
let server
let db
const sign = (secret, text) => crypto.createHmac('sha256', secret).update(text).digest('hex')

before(async () => {
  await new Promise((r) => fakeRazorpay.listen(0, r))
  process.env.RAZORPAY_API_BASE = `http://localhost:${fakeRazorpay.address().port}`
  const { createApp } = await import('../app.js')
  ;({ db } = await import('../db.js'))
  server = createApp().listen(0)
  base = `http://localhost:${server.address().port}/api`
})

after(() => {
  server.close()
  fakeRazorpay.close()
})

async function call(path, { method = 'GET', body, token, raw, headers = {} } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(raw ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  })
  return { status: res.status, body: await res.json() }
}

const AARAV = 'HB-2024-0518'
const ANANYA = 'HB-2024-0732'
const bal = (id) => db.prepare('SELECT balance_paise FROM students WHERE id = ?').get(id).balance_paise / 100
const tea = (qty) => ({ id: 't1', name: 'Tea', price: 12, qty, cat: 'tea' })
const topup = (amount, studentId = AARAV) =>
  call('/parent/topup/order', { method: 'POST', token: parent, body: { studentId, amount } })

let parent
let counter
let admin

test('parent signs in with the card code and a wrong code is refused', async () => {
  assert.equal((await call('/parent/login', { method: 'POST', body: { code: 'WRONG1' } })).status, 404)
  const ok = await call('/parent/login', { method: 'POST', body: { code: 'kx7m2q' } })
  assert.equal(ok.status, 200)
  assert.equal(ok.body.students[0].id, AARAV)
  parent = ok.body.token
})

test('a top-up order is created for exactly the amount asked, and bad amounts are refused', async () => {
  for (const amount of [5, 0, -50, 99999, 12.5, '500']) {
    assert.equal((await topup(amount)).status, 400, `amount ${amount}`)
  }
  const r = await topup(500)
  assert.equal(r.status, 200)
  assert.equal(r.body.amount, 50000)
  assert.equal(r.body.keyId, 'rzp_test_fake')
  assert.equal(JSON.stringify(r.body).includes('fake_key_secret'), false, 'secret must never reach the browser')
  assert.equal(rzpOrders.at(-1).amount, 50000)
  assert.equal(rzpOrders.at(-1).currency, 'INR')
})

test('a parent cannot top up a child that is not linked to them', async () => {
  assert.equal((await topup(500, ANANYA)).status, 403)
})

test('a valid payment signature credits the wallet exactly once', async () => {
  const orderId = (await topup(300)).body.orderId
  const paymentId = 'pay_OK1'
  const body = {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: sign('fake_key_secret', `${orderId}|${paymentId}`),
  }

  const before = bal(AARAV)
  const first = await call('/parent/topup/verify', { method: 'POST', token: parent, body })
  assert.equal(first.status, 200)
  assert.equal(first.body.credited, true)
  assert.equal(bal(AARAV), before + 300)

  const again = await call('/parent/topup/verify', { method: 'POST', token: parent, body })
  assert.equal(again.status, 200)
  assert.equal(again.body.credited, false)
  assert.equal(bal(AARAV), before + 300, 'a repeated callback must not credit twice')
})

test('a forged or mismatched signature adds nothing', async () => {
  const a = (await topup(200)).body.orderId
  const b = (await topup(200)).body.orderId
  const before = bal(AARAV)
  const verify = (body) => call('/parent/topup/verify', { method: 'POST', token: parent, body })

  const forged = await verify({ razorpay_order_id: a, razorpay_payment_id: 'pay_FAKE', razorpay_signature: 'deadbeef' })
  assert.equal(forged.status, 400)

  // a genuine signature, but for a different order
  const wrong = await verify({
    razorpay_order_id: b, razorpay_payment_id: 'pay_X',
    razorpay_signature: sign('fake_key_secret', `${a}|pay_X`),
  })
  assert.equal(wrong.status, 400)

  const missing = await verify({ razorpay_order_id: 'order_NOPE', razorpay_payment_id: 'pay_Z', razorpay_signature: 'x' })
  assert.equal(missing.status, 404)
  assert.equal(bal(AARAV), before)
})

test('the webhook credits a payment the browser never reported, and only once', async () => {
  const orderId = (await topup(400)).body.orderId
  const payload = JSON.stringify({
    event: 'payment.captured',
    payload: { payment: { entity: { id: 'pay_HOOK1', order_id: orderId, amount: 40000, status: 'captured' } } },
  })
  const hook = (sig) => call('/razorpay/webhook', {
    method: 'POST', raw: payload, headers: { 'content-type': 'application/json', 'x-razorpay-signature': sig },
  })
  const before = bal(AARAV)

  assert.equal((await hook('nope')).status, 400)
  assert.equal(bal(AARAV), before, 'an unsigned webhook must be ignored')

  assert.equal((await hook(sign('fake_hook_secret', payload))).status, 200)
  assert.equal(bal(AARAV), before + 400)

  assert.equal((await hook(sign('fake_hook_secret', payload))).status, 200)
  assert.equal(bal(AARAV), before + 400, 'a retried webhook must not credit twice')

  // the browser callback arriving after the webhook is also a no-op
  const late = await call('/parent/topup/verify', {
    method: 'POST', token: parent,
    body: {
      razorpay_order_id: orderId, razorpay_payment_id: 'pay_HOOK1',
      razorpay_signature: sign('fake_key_secret', `${orderId}|pay_HOOK1`),
    },
  })
  assert.equal(late.body.credited, false)
  assert.equal(bal(AARAV), before + 400)
})

test('a webhook whose amount differs from our order credits nothing', async () => {
  const orderId = (await topup(100)).body.orderId
  const payload = JSON.stringify({
    event: 'payment.captured',
    payload: { payment: { entity: { id: 'pay_LIAR', order_id: orderId, amount: 999900 } } },
  })
  const before = bal(AARAV)
  await call('/razorpay/webhook', {
    method: 'POST', raw: payload,
    headers: { 'content-type': 'application/json', 'x-razorpay-signature': sign('fake_hook_secret', payload) },
  })
  assert.equal(bal(AARAV), before)
})

test('staff sign in; a wrong PIN is refused; roles are enforced', async () => {
  assert.equal((await call('/staff/login', { method: 'POST', body: { staffId: 'CNT-01', pin: '0000' } })).status, 401)
  counter = (await call('/staff/login', { method: 'POST', body: { staffId: 'cnt-01', pin: '1234' } })).body.token
  admin = (await call('/staff/login', { method: 'POST', body: { staffId: 'ADMIN', pin: '4321' } })).body.token
  assert.ok(counter && admin)

  assert.equal((await call('/charge', { method: 'POST', body: {} })).status, 401, 'no sign-in')
  assert.equal((await call('/charge', { method: 'POST', token: parent, body: {} })).status, 401, 'a parent session is not staff')
  assert.equal((await call('/admin/summary', { token: counter })).status, 403, 'counter staff cannot see the owner reports')
  assert.equal((await call('/admin/summary', { token: admin })).status, 200)
})

const charge = (body) => call('/charge', { method: 'POST', token: counter, body })

test('charging a card takes exactly the total off the wallet, and a retry does not charge twice', async () => {
  const before = bal(AARAV)
  const order = { cardId: AARAV, items: [tea(2)], total: 24, idempotencyKey: 'charge-key-0001' }

  const first = await charge(order)
  assert.equal(first.status, 200)
  assert.equal(first.body.student.balance, before - 24)

  const retry = await charge(order)
  assert.equal(retry.status, 200)
  assert.equal(retry.body.replayed, true)
  assert.equal(bal(AARAV), before - 24, 'a retried request must not charge twice')

  const clash = await charge({ ...order, items: [tea(3)], total: 36 })
  assert.equal(clash.status, 409)
})

test('malformed or tampered orders are refused and charge nothing', async () => {
  const before = bal(AARAV)
  const key = (n) => `bad-order-key-${n}`
  const cases = [
    { items: [tea(2)], total: 1, idempotencyKey: key(1) },
    { items: [{ ...tea(1), qty: -1 }], total: -12, idempotencyKey: key(2) },
    { items: [{ ...tea(1), price: -5 }], total: -5, idempotencyKey: key(3) },
    { items: [], total: 0, idempotencyKey: key(4) },
    { items: [tea(1)], total: 12 },
  ]
  for (const c of cases) {
    const r = await charge({ cardId: AARAV, ...c })
    assert.equal(r.status, 400, JSON.stringify(c))
  }
  const unknown = await charge({ cardId: 'HB-0000-0000', items: [tea(1)], total: 12, idempotencyKey: key(5) })
  assert.equal(unknown.status, 404)
  assert.equal(bal(AARAV), before)
})

test('the parent rules are enforced at the counter', async () => {
  // Ananya has blocked snacks
  const snack = { id: 's2', name: 'French Fries', price: 69, qty: 1, cat: 'snacks' }
  const blocked = await charge({ cardId: ANANYA, items: [snack], total: 69, idempotencyKey: 'rule-key-0001' })
  assert.equal(blocked.status, 403)
  assert.equal(blocked.body.error, 'category_blocked')

  // 69 is under her 70 cap but over her 60 balance
  const juice = { id: 'j1', name: 'Watermelon', price: 69, qty: 1, cat: 'juices' }
  const poor = await charge({ cardId: ANANYA, items: [juice], total: 69, idempotencyKey: 'rule-key-0002' })
  assert.equal(poor.status, 402)
  assert.equal(poor.body.error, 'insufficient_balance')
  assert.equal(poor.body.short, 9)
  assert.equal(bal(ANANYA), 60)

  // Aarav has a per-order cap of 90
  const big = await charge({ cardId: AARAV, items: [{ ...tea(1), price: 100 }], total: 100, idempotencyKey: 'rule-key-0003' })
  assert.equal(big.body.error, 'over_order_cap')

  // his daily limit is 150 and he has spent 24: 90 more is fine, 40 after that is not
  const ok = await charge({ cardId: AARAV, items: [{ ...tea(1), price: 90 }], total: 90, idempotencyKey: 'rule-key-0004' })
  assert.equal(ok.status, 200)
  const over = await charge({ cardId: AARAV, items: [{ ...tea(1), price: 40 }], total: 40, idempotencyKey: 'rule-key-0005' })
  assert.equal(over.status, 403)
  assert.equal(over.body.error, 'over_daily_limit')
})

test('a parent can change limits and block the card, and the counter follows at once', async () => {
  const put = (path, body) => call(`/parent/students/${AARAV}${path}`, { method: 'PUT', token: parent, body })

  assert.equal((await put('/limits', { dailyLimit: 500, perOrderCap: 20, blocked: [] })).status, 200)
  const capped = await charge({ cardId: AARAV, items: [tea(2)], total: 24, idempotencyKey: 'live-key-0001' })
  assert.equal(capped.body.error, 'over_order_cap')

  assert.equal((await put('/limits', { dailyLimit: 500, perOrderCap: 90, blocked: ['tea'] })).status, 200)
  const noTea = await charge({ cardId: AARAV, items: [tea(1)], total: 12, idempotencyKey: 'live-key-0002' })
  assert.equal(noTea.body.error, 'category_blocked')

  assert.equal((await put('/limits', { dailyLimit: 500, perOrderCap: 90, blocked: ['nonsense'] })).status, 400)
  assert.equal((await put('/limits', { dailyLimit: 'lots', perOrderCap: 90, blocked: [] })).status, 400)

  await put('/limits', { dailyLimit: 500, perOrderCap: 90, blocked: [] })
  assert.equal((await put('/card', { active: false })).status, 200)
  const off = await charge({ cardId: AARAV, items: [tea(1)], total: 12, idempotencyKey: 'live-key-0003' })
  assert.equal(off.body.error, 'card_blocked')

  await put('/card', { active: true })
  const on = await charge({ cardId: AARAV, items: [tea(1)], total: 12, idempotencyKey: 'live-key-0004' })
  assert.equal(on.status, 200)
})

test('the ledger always adds up to the balance, and the owner report matches it', async () => {
  for (const id of [AARAV, ANANYA]) {
    const rows = db.prepare('SELECT kind, amount_paise FROM wallet_ledger WHERE student_id = ?').all(id)
    const net = rows.reduce((n, r) => n + (r.kind === 'purchase' ? -r.amount_paise : r.amount_paise), 0)
    assert.equal(net, bal(id) * 100, `ledger for ${id}`)
  }

  const s = (await call('/admin/summary', { token: admin })).body
  const purchases = db.prepare('SELECT COUNT(*) AS n, SUM(total_paise) AS paise FROM purchases').get()
  assert.equal(s.today.orders, purchases.n)
  assert.equal(s.today.revenue, purchases.paise / 100)
  assert.equal(s.wallet.collected, 700, 'only the two settled payments (300 + 400) were collected via Razorpay')
  assert.equal(s.wallet.spent, purchases.paise / 100)
  assert.equal(s.wallet.outstanding, bal(AARAV) + bal(ANANYA))
  assert.equal(s.topSellers[0].name, 'Tea')
  assert.equal(s.trends.daily.bars.length, 7)
  assert.equal(s.trends.daily.bars.at(-1).v, s.today.revenue)
})
