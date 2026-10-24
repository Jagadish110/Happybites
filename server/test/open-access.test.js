// Testing mode: no staff sign-in at the counter, and any admin or parent login opens.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'

process.env.HB_DB = ':memory:'
delete process.env.HB_OPEN_ACCESS
delete process.env.NODE_ENV
delete process.env.RAZORPAY_KEY_ID
delete process.env.RAZORPAY_KEY_SECRET

let base
let server
let db

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
const ANANYA = 'HB-2024-0732'

test('development defaults to open access, and the app is told', async () => {
  assert.equal((await call('/meta')).body.openAccess, true)
})

test('anyone at the counter can charge a card with no sign-in', async () => {
  const r = await call('/charge', {
    method: 'POST',
    body: { cardId: AARAV, items: [{ id: 't1', qty: 1 }], total: 12, idempotencyKey: 'open-key-0001' },
  })
  assert.equal(r.status, 200)
  assert.equal(r.body.student.balance, 408)
  assert.equal(db.prepare("SELECT staff_id FROM purchases WHERE client_ref = 'open-key-0001'").get().staff_id, 'OPEN')
})

test('the safety rules still apply with no sign-in: prices, parent blocks and balance', async () => {
  const charge = (body) => call('/charge', { method: 'POST', body })

  const cheap = await charge({ cardId: AARAV, items: [{ id: 't1', qty: 2 }], total: 2, idempotencyKey: 'open-key-0002' })
  assert.equal(cheap.status, 409)
  assert.equal(cheap.body.error, 'price_changed')

  const fries = await charge({ cardId: ANANYA, items: [{ id: 's2', qty: 1 }], total: 69, idempotencyKey: 'open-key-0003' })
  assert.equal(fries.body.error, 'category_blocked')

  const poor = await charge({ cardId: ANANYA, items: [{ id: 'j1', qty: 1 }], total: 69, idempotencyKey: 'open-key-0004' })
  assert.equal(poor.body.error, 'insufficient_balance')
})

test('any admin ID and PIN opens the owner area, even blank', async () => {
  for (const creds of [{ staffId: 'whoever', pin: '0000' }, { staffId: '', pin: '' }, {}]) {
    const r = await call('/staff/login', { method: 'POST', body: creds })
    assert.equal(r.status, 200, JSON.stringify(creds))
    assert.equal(r.body.staff.role, 'admin')
    assert.equal((await call('/admin/summary', { token: r.body.token })).status, 200)
  }
  assert.equal((await call('/admin/summary')).status, 200, 'owner pages load with no session at all')
  assert.equal((await call('/admin/items/t1', { method: 'PUT', body: { price: 12 } })).status, 200)
})

test('any parent code opens the portal; a real card code still opens just that child', async () => {
  const anything = await call('/parent/login', { method: 'POST', body: { code: 'whatever' } })
  assert.equal(anything.status, 200)
  assert.equal(anything.body.students.length, 2)
  const blank = await call('/parent/login', { method: 'POST', body: { code: '' } })
  assert.equal(blank.status, 200)

  const students = await call('/parent/students', { token: anything.body.token })
  assert.equal(students.body.students.length, 2)

  const real = await call('/parent/login', { method: 'POST', body: { code: 'pd4b9t' } })
  assert.deepEqual(real.body.students.map((s) => s.id), [ANANYA])
})

test('switching it off brings real sign-in back, at once', async () => {
  process.env.HB_OPEN_ACCESS = '0'
  try {
    assert.equal((await call('/meta')).body.openAccess, false)
    const charge = await call('/charge', { method: 'POST', body: { cardId: AARAV, items: [{ id: 't1', qty: 1 }], total: 12, idempotencyKey: 'open-key-0005' } })
    assert.equal(charge.status, 401)
    assert.equal((await call('/admin/summary')).status, 401)
    assert.equal((await call('/parent/login', { method: 'POST', body: { code: 'whatever' } })).status, 404)
    assert.equal((await call('/staff/login', { method: 'POST', body: { staffId: 'whoever', pin: '1' } })).status, 401)
  } finally {
    delete process.env.HB_OPEN_ACCESS
  }
})
