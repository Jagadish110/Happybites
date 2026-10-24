import express from 'express'
import { db } from './db.js'
import { config, isProd, openAccess } from './config.js'
import { HttpError, bad, isInt } from './http.js'
import { hashPin, keyed, throttle, verifyPin } from './security.js'
import { endSession, issueSession, linkStudent, ownStudent, requireParent, requireStaff } from './auth.js'
import {
  CATEGORY_IDS, chargeStudent, creditTopup, getStudent, setCardActive, setLimits, studentView,
} from './wallet.js'
import * as rzp from './razorpay.js'
import * as testgw from './testgateway.js'
import { adminSummary } from './reports.js'
import {
  createItem, createOffer, menuSnapshot, priceOrder, setItemAvailable, setOfferActive, updateItem,
} from './menu.js'

export const api = express.Router()

const FIFTEEN_MIN = 15 * 60 * 1000
const DUMMY_PIN = hashPin('not-a-real-pin')           // so unknown staff IDs cost the same time as wrong PINs
const text = (v, max = 80) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const tooMany = () => new HttpError(429, 'too_many_attempts', 'Too many tries. Wait a few minutes and try again.')

api.get('/meta', (_req, res) => {
  res.json({
    razorpay: rzp.configured(),
    testGateway: testgw.enabled(),
    openAccess: openAccess(),
    demo: !isProd,
    topupMin: config.topupMin,
    topupMax: config.topupMax,
  })
})

// ---- parent: card code is the login --------------------------------------
function studentByCode(raw) {
  const code = text(raw, 12).toUpperCase()
  const row = code.length >= 4 ? db.prepare('SELECT * FROM students WHERE code_hash = ?').get(keyed(code)) : null
  if (!row) throw new HttpError(404, 'card_not_found', 'No card found with that code. Check the back of the card.')
  return row
}

api.post('/parent/login', (req, res) => {
  // Open access (testing): whatever is typed opens the portal. A real card code still
  // opens just that child; anything else opens the first few children in the system.
  if (openAccess()) {
    const code = text(req.body?.code, 12).toUpperCase()
    const match = code.length >= 4 ? db.prepare('SELECT * FROM students WHERE code_hash = ?').get(keyed(code)) : null
    const rows = match ? [match] : db.prepare('SELECT * FROM students ORDER BY id LIMIT 10').all()
    if (!rows.length) throw new HttpError(404, 'card_not_found', 'There are no students in the system yet')
    const token = issueSession('parent', '', rows.map((r) => r.id))
    return res.json({ token, students: rows.map(studentView) })
  }

  if (!throttle(`parent-login:${req.ip}`, 12, FIFTEEN_MIN)) throw tooMany()
  const row = studentByCode(req.body?.code)
  const token = issueSession('parent', '', [row.id])
  res.json({ token, students: [studentView(row)] })
})

api.post('/parent/link', requireParent, (req, res) => {
  if (!throttle(`parent-link:${req.ip}`, 12, FIFTEEN_MIN)) throw tooMany()
  const row = studentByCode(req.body?.code)
  if (req.session.studentIds.includes(row.id)) {
    throw new HttpError(409, 'already_linked', `${row.name} is already linked.`)
  }
  linkStudent(req.session.hash, row.id)
  res.json({ student: studentView(row) })
})

api.get('/parent/students', requireParent, (req, res) => {
  res.json({
    students: req.session.studentIds.map(getStudent).filter(Boolean).map(studentView),
  })
})

api.post('/parent/logout', requireParent, (req, res) => {
  endSession(req.session.hash)
  res.json({ ok: true })
})

api.put('/parent/students/:id/limits', requireParent, (req, res) => {
  ownStudent(req, req.params.id)
  const { dailyLimit, perOrderCap, blocked } = req.body || {}
  if (!isInt(dailyLimit, 0, 5000) || !isInt(perOrderCap, 0, 2000)) {
    throw bad('invalid_limits', 'Limits must be whole rupees')
  }
  if (!Array.isArray(blocked) || blocked.some((c) => !CATEGORY_IDS.includes(c))) {
    throw bad('invalid_limits', 'Unknown food category')
  }
  setLimits(req.params.id, { dailyLimit, perOrderCap, blocked })
  res.json({ student: studentView(getStudent(req.params.id)) })
})

api.put('/parent/students/:id/card', requireParent, (req, res) => {
  ownStudent(req, req.params.id)
  if (typeof req.body?.active !== 'boolean') throw bad('invalid_request', 'active must be true or false')
  setCardActive(req.params.id, req.body.active)
  res.json({ student: studentView(getStudent(req.params.id)) })
})

// ---- parent: top up through Razorpay -------------------------------------
api.post('/parent/topup/order', requireParent, wrap(async (req, res) => {
  const { studentId, amount } = req.body || {}
  ownStudent(req, studentId)
  if (!isInt(amount, config.topupMin, config.topupMax)) {
    throw bad('invalid_amount', `Enter a whole amount between ₹${config.topupMin} and ₹${config.topupMax}`)
  }
  const student = getStudent(studentId)

  // No Razorpay keys: in development a simulated gateway stands in; otherwise top-ups stay off.
  if (!rzp.configured()) {
    if (!testgw.enabled()) {
      throw new HttpError(503, 'razorpay_not_configured',
        'Online payments are not switched on yet. The canteen needs to add its Razorpay keys.')
    }
    const orderId = testgw.newOrderId()
    db.prepare('INSERT INTO topup_orders (order_id, student_id, amount_paise, gateway, created_at) VALUES (?,?,?,?,?)')
      .run(orderId, student.id, amount * 100, 'test', new Date().toISOString())
    return res.json({
      orderId, amount: amount * 100, currency: 'INR', keyId: testgw.TEST_KEY_ID, studentName: student.name, test: true,
    })
  }

  const order = await rzp.createOrder({
    amountPaise: amount * 100,
    receipt: `tu_${Date.now().toString(36)}`,
    notes: { student_id: student.id, student_name: student.name },
  })
  db.prepare('INSERT INTO topup_orders (order_id, student_id, amount_paise, created_at) VALUES (?,?,?,?)')
    .run(order.id, student.id, amount * 100, new Date().toISOString())

  res.json({ orderId: order.id, amount: amount * 100, currency: 'INR', keyId: rzp.publicKeyId(), studentName: student.name })
}))

/** Credit the order we created, for the amount we recorded, once. Shared by the browser callback and the webhook. */
export function settleOrder(order, paymentId) {
  if (order.status === 'paid' && order.payment_id !== paymentId) return { applied: false }

  const result = creditTopup({
    studentId: order.student_id,
    amountPaise: order.amount_paise,
    ref: paymentId,
    note: order.gateway === 'test' ? 'Wallet top-up (TEST payment)' : 'Wallet top-up via Razorpay',
  })
  db.prepare("UPDATE topup_orders SET status = 'paid', payment_id = ?, paid_at = ? WHERE order_id = ?")
    .run(paymentId, new Date().toISOString(), order.order_id)
  return result
}

/** Simulated "pay" step. Hands back what Razorpay Checkout would; /verify still decides about the credit. */
api.post('/parent/topup/test-pay', requireParent, (req, res) => {
  if (!testgw.enabled()) throw new HttpError(404, 'not_found', 'No such endpoint')
  const { orderId, method, outcome } = req.body || {}
  const order = db.prepare('SELECT * FROM topup_orders WHERE order_id = ?').get(text(orderId, 60))
  if (!order || order.gateway !== 'test') throw new HttpError(404, 'order_not_found', 'No such test order')
  ownStudent(req, order.student_id)
  if (order.status === 'paid') throw new HttpError(409, 'already_paid', 'That order has already been paid')
  res.json(testgw.pay({ orderId: order.order_id, method: text(method, 20), outcome: text(outcome, 10) }))
})

api.post('/parent/topup/verify', requireParent, (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {}
  const order = db.prepare('SELECT * FROM topup_orders WHERE order_id = ?').get(text(orderId, 60))
  if (!order) throw new HttpError(404, 'order_not_found', 'We have no record of that payment order')
  ownStudent(req, order.student_id)

  const genuine = order.gateway === 'test'
    ? testgw.enabled() && testgw.verify({ orderId, paymentId, signature })
    : rzp.verifyPaymentSignature({ orderId, paymentId, signature })
  if (!genuine) {
    throw bad('bad_signature', 'The payment could not be verified, so nothing was added to the wallet')
  }
  const result = settleOrder(order, paymentId)
  res.json({ ok: true, credited: result.applied, student: studentView(getStudent(order.student_id)) })
})

export function razorpayWebhook(req, res) {
  const raw = req.body
  if (!Buffer.isBuffer(raw) || !rzp.verifyWebhookSignature(raw, req.get('x-razorpay-signature'))) {
    return res.status(400).json({ error: 'bad_signature' })
  }
  let event
  try { event = JSON.parse(raw.toString('utf8')) } catch { return res.status(400).json({ error: 'bad_json' }) }

  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const pay = event.payload?.payment?.entity
    const order = pay?.order_id ? db.prepare('SELECT * FROM topup_orders WHERE order_id = ?').get(pay.order_id) : null
    // Only ever credit what we asked Razorpay to collect.
    if (order && order.gateway !== 'test' && pay.id && pay.amount === order.amount_paise) settleOrder(order, pay.id)
  }
  res.json({ ok: true })      // always 2xx for a signed event, or Razorpay keeps retrying
}

// ---- staff: counter and admin sign-in --------------------------------------
api.post('/staff/login', (req, res) => {
  // Open access (testing): any ID and PIN, even blank, opens the owner area.
  if (openAccess()) {
    const owner = db.prepare("SELECT * FROM staff WHERE role = 'admin' ORDER BY id LIMIT 1").get()
    const token = issueSession('staff', owner.id)
    return res.json({ token, staff: { id: owner.id, name: owner.name, role: owner.role, counter: owner.counter } })
  }

  const staffId = text(req.body?.staffId, 20).toUpperCase()
  const pin = text(req.body?.pin, 12)
  if (!throttle(`staff-login:${req.ip}:${staffId}`, 8, FIFTEEN_MIN)) throw tooMany()

  const row = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId)
  const ok = row ? verifyPin(pin, row.pin) : (verifyPin(pin, DUMMY_PIN), false)
  if (!ok) throw new HttpError(401, 'invalid_credentials', 'Wrong staff ID or PIN')

  const token = issueSession('staff', row.id)
  res.json({ token, staff: { id: row.id, name: row.name, role: row.role, counter: row.counter } })
})

api.get('/staff/me', requireStaff('counter', 'admin'), (req, res) => res.json({ staff: req.staff }))

api.post('/staff/logout', requireStaff('counter', 'admin'), (req, res) => {
  endSession(req.session.hash)
  res.json({ ok: true })
})

// ---- the menu: everyone may read it, only the owner may change it --------------
api.get('/menu', (_req, res) => res.json(menuSnapshot()))

// Photos arrive inside the JSON, so these routes get a larger body limit. The
// owner check runs first, so only a signed-in owner can send a large body.
const ownerJson = [requireStaff('admin'), express.json({ limit: '600kb' })]
const body = (req) => req.body || {}

api.post('/admin/items', ownerJson, (req, res) => res.json({ item: createItem(body(req)) }))
api.put('/admin/items/:id', ownerJson, (req, res) => res.json({ item: updateItem(req.params.id, body(req)) }))
api.put('/admin/items/:id/available', ownerJson, (req, res) => {
  if (typeof body(req).available !== 'boolean') throw bad('invalid_request', 'available must be true or false')
  res.json({ item: setItemAvailable(req.params.id, body(req).available) })
})

api.post('/admin/offers', ownerJson, (req, res) => res.json({ offer: createOffer(body(req)) }))
api.put('/admin/offers/:id/active', ownerJson, (req, res) => {
  if (typeof body(req).active !== 'boolean') throw bad('invalid_request', 'active must be true or false')
  res.json({ offer: setOfferActive(req.params.id, body(req).active) })
})

// ---- counter: take money off a scanned card --------------------------------
/**
 * The counter sends only WHICH dishes and how many ([{ id, qty, offer? }]) and the
 * total it showed the customer. The server prices the order from its own menu; if
 * that differs from what the screen showed, nothing is charged and the counter is
 * told to refresh.
 */
api.post('/charge', requireStaff('counter', 'admin'), (req, res) => {
  const { cardId, items, total, idempotencyKey } = req.body || {}

  const clientRef = text(idempotencyKey, 64)
  if (clientRef.length < 8) throw bad('missing_request_id', 'Missing request id')

  if (!Array.isArray(items) || items.length === 0 || items.length > 60) {
    throw bad('invalid_order', 'The order is empty')
  }
  const lines = items.map((i) => {
    if (!text(i?.id, 60) || !isInt(i?.qty, 1, 99)) throw bad('invalid_item', 'One of the items in the order is not valid')
    return { id: text(i.id, 60), qty: i.qty, offer: i.offer === true }
  })

  const priced = priceOrder(lines)
  const serverTotal = priced.reduce((n, i) => n + i.price * i.qty, 0)

  if (!isInt(serverTotal, 1, config.maxOrderRupees)) throw bad('invalid_order', 'That order total is not allowed')
  if (total !== serverTotal) {
    throw new HttpError(409, 'price_changed',
      'Prices have changed since this screen loaded. The board has been refreshed, so check the order and try again.',
      { serverTotal })
  }

  const out = chargeStudent({
    cardId: text(cardId, 40).toUpperCase(),
    items: priced,
    totalPaise: serverTotal * 100,
    clientRef,
    staff: req.staff,
  })

  res.json({
    ok: true,
    purchaseId: out.purchaseId,
    replayed: out.replayed,
    total: serverTotal,
    student: { id: out.student.id, name: out.student.name, balance: out.student.balance_paise / 100 },
  })
})

// ---- admin: what the owner sees -----------------------------------------------
api.get('/admin/summary', requireStaff('admin'), (_req, res) => res.json(adminSummary()))
