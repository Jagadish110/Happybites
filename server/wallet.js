import crypto from 'node:crypto'
import { db, tx } from './db.js'
import { HttpError } from './http.js'

const IST = 'Asia/Kolkata'
const DAY_SQL = "date(created_at, '+330 minutes')"      // IST calendar day of a stored UTC time

export const CATEGORY_IDS = ['tea', 'juices', 'snacks', 'bowls']

// ---- time ----------------------------------------------------------------
const fmt = (opts) => new Intl.DateTimeFormat('en-IN', { timeZone: IST, ...opts })
export const dayKey = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: IST }).format(d)
const clock = (d) => fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).format(d).toLowerCase()

function dayLabel(d) {
  const key = dayKey(d)
  if (key === dayKey(new Date())) return 'Today'
  if (key === dayKey(new Date(Date.now() - 86400000))) return 'Yesterday'
  return fmt({ day: 'numeric', month: 'short' }).format(d)
}

// ---- reads ---------------------------------------------------------------
export const getStudent = (id) => db.prepare('SELECT * FROM students WHERE id = ?').get(id)

export function spentToday(studentId) {
  return db.prepare(
    `SELECT COALESCE(SUM(total_paise), 0) AS n FROM purchases WHERE student_id = ? AND ${DAY_SQL} = ?`
  ).get(studentId, dayKey(new Date())).n
}

/** The shape the parent portal renders. Amounts leave the server as rupees. */
export function studentView(row) {
  const last = db.prepare(
    'SELECT total_paise, created_at FROM purchases WHERE student_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(row.id)

  const transactions = db.prepare(
    'SELECT * FROM wallet_ledger WHERE student_id = ? ORDER BY id DESC LIMIT 40'
  ).all(row.id).map((l) => {
    const when = new Date(l.created_at)
    const where = l.kind === 'purchase' ? l.counter || 'Counter' : l.ref.startsWith('pay_') ? 'Razorpay' : ''
    return {
      id: `l${l.id}`,
      kind: l.kind === 'purchase' ? 'out' : 'in',
      title: l.note || (l.kind === 'purchase' ? 'Canteen purchase' : 'Wallet top-up'),
      sub: [dayLabel(when), clock(when), where].filter(Boolean).join(' · '),
      amount: l.amount_paise / 100,
    }
  })

  return {
    id: row.id,
    name: row.name,
    klass: row.klass,
    balance: row.balance_paise / 100,
    dailyLimit: row.daily_limit_paise / 100,
    perOrderCap: row.per_order_cap_paise / 100,
    spentToday: spentToday(row.id) / 100,
    cardActive: !!row.card_active,
    blocked: JSON.parse(row.blocked),
    lastSpend: last
      ? `${dayLabel(new Date(last.created_at))} · ₹${last.total_paise / 100}`
      : 'No purchases yet',
    transactions,
  }
}

// ---- writes --------------------------------------------------------------
/**
 * Credit a paid top-up. Safe to call more than once for the same payment:
 * the (kind, ref) uniqueness plus the check below make the second call a no-op,
 * which is what lets the browser callback and Razorpay's webhook both fire.
 */
export function creditTopup({ studentId, amountPaise, ref, note = 'Wallet top-up' }) {
  return tx(() => {
    const dup = db.prepare("SELECT id FROM wallet_ledger WHERE kind = 'topup' AND ref = ?").get(ref)
    const row = getStudent(studentId)
    if (!row) throw new HttpError(404, 'card_not_found', 'No such student')
    if (dup) return { applied: false, balancePaise: row.balance_paise }

    const balance = row.balance_paise + amountPaise
    db.prepare('UPDATE students SET balance_paise = ? WHERE id = ?').run(balance, studentId)
    db.prepare(
      `INSERT INTO wallet_ledger (student_id, kind, amount_paise, balance_after_paise, ref, note, created_at)
       VALUES (?, 'topup', ?, ?, ?, ?, ?)`
    ).run(studentId, amountPaise, balance, ref, note, new Date().toISOString())
    return { applied: true, balancePaise: balance }
  })
}

const summarise = (items) =>
  items.map((i) => (i.qty > 1 ? `${i.name} ×${i.qty}` : i.name)).join(', ').slice(0, 140)

/**
 * Take money off a student's wallet for one counter order. Every rule the parent
 * set is checked here, on the server, inside the same transaction as the debit.
 */
export function chargeStudent({ cardId, items, totalPaise, clientRef, staff }) {
  const existing = db.prepare('SELECT * FROM purchases WHERE client_ref = ?').get(clientRef)
  if (existing) {
    if (existing.student_id !== cardId || existing.total_paise !== totalPaise) {
      throw new HttpError(409, 'idempotency_conflict', 'That request id was already used for a different order')
    }
    return { purchaseId: existing.id, student: getStudent(existing.student_id), replayed: true }
  }

  return tx(() => {
    const row = getStudent(cardId)
    if (!row) throw new HttpError(404, 'card_not_found', 'This card is not registered')
    if (!row.card_active) throw new HttpError(403, 'card_blocked', `${row.name}'s card is blocked`)

    const blocked = JSON.parse(row.blocked)
    const hit = [...new Set(items.filter((i) => blocked.includes(i.cat)).map((i) => i.name))]
    if (hit.length) {
      throw new HttpError(403, 'category_blocked', `A parent has blocked: ${hit.join(', ')}`, { items: hit })
    }

    if (row.per_order_cap_paise > 0 && totalPaise > row.per_order_cap_paise) {
      throw new HttpError(403, 'over_order_cap', `Over the per-order cap of ₹${row.per_order_cap_paise / 100}`,
        { cap: row.per_order_cap_paise / 100 })
    }

    if (row.daily_limit_paise > 0) {
      const used = spentToday(row.id)
      if (used + totalPaise > row.daily_limit_paise) {
        throw new HttpError(403, 'over_daily_limit',
          `Daily limit of ₹${row.daily_limit_paise / 100} reached (₹${used / 100} spent today)`,
          { limit: row.daily_limit_paise / 100, spent: used / 100 })
      }
    }

    if (row.balance_paise < totalPaise) {
      throw new HttpError(402, 'insufficient_balance',
        `Balance ₹${row.balance_paise / 100}, ₹${(totalPaise - row.balance_paise) / 100} short`,
        { balance: row.balance_paise / 100, short: (totalPaise - row.balance_paise) / 100 })
    }

    const now = new Date().toISOString()
    const purchaseId = `P${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`
    const balance = row.balance_paise - totalPaise

    db.prepare('UPDATE students SET balance_paise = ? WHERE id = ?').run(balance, row.id)
    db.prepare(
      `INSERT INTO purchases (id, client_ref, student_id, total_paise, items, staff_id, counter, created_at)
       VALUES (?,?,?,?,?,?,?,?)`
    ).run(purchaseId, clientRef, row.id, totalPaise, JSON.stringify(items), staff.id, staff.counter || '', now)
    db.prepare(
      `INSERT INTO wallet_ledger (student_id, kind, amount_paise, balance_after_paise, ref, note, counter, created_at)
       VALUES (?, 'purchase', ?, ?, ?, ?, ?, ?)`
    ).run(row.id, totalPaise, balance, purchaseId, summarise(items), staff.counter || '', now)

    return { purchaseId, student: { ...row, balance_paise: balance }, replayed: false }
  })
}

export function setLimits(studentId, { dailyLimit, perOrderCap, blocked }) {
  db.prepare(
    'UPDATE students SET daily_limit_paise = ?, per_order_cap_paise = ?, blocked = ? WHERE id = ?'
  ).run(dailyLimit * 100, perOrderCap * 100, JSON.stringify(blocked), studentId)
}

export function setCardActive(studentId, active) {
  db.prepare('UPDATE students SET card_active = ? WHERE id = ?').run(active ? 1 : 0, studentId)
}
