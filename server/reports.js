import { db } from './db.js'
import { config } from './config.js'
import { dayKey } from './wallet.js'

const DAY = "date(p.created_at, '+330 minutes')"
const rupees = (paise) => Math.round(paise) / 100

// ---- tiny IST calendar helpers (work on YYYY-MM-DD keys) ------------------
const toDate = (key) => new Date(`${key}T00:00:00Z`)
const toKey = (d) => d.toISOString().slice(0, 10)
const addDays = (key, n) => toKey(new Date(toDate(key).getTime() + n * 86400000))
const mondayOf = (key) => addDays(key, -((toDate(key).getUTCDay() + 6) % 7))
const label = (key, opts) => new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', ...opts }).format(toDate(key))

function bucketed(sql, params) {
  return new Map(db.prepare(sql).all(...params).map((r) => [r.k, r.paise]))
}

function trends(today) {
  // last 7 days
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
  const byDay = bucketed(
    `SELECT ${DAY} AS k, SUM(total_paise) AS paise FROM purchases p WHERE ${DAY} >= ? GROUP BY k`,
    [days[0]]
  )
  const daily = days.map((k) => ({
    label: k === today ? 'Today' : label(k, { weekday: 'short' }),
    v: rupees(byDay.get(k) || 0),
    now: k === today,
  }))

  // last 6 weeks, Monday to Sunday
  const thisMonday = mondayOf(today)
  const mondays = Array.from({ length: 6 }, (_, i) => addDays(thisMonday, (i - 5) * 7))
  const byWeek = bucketed(
    `SELECT date(p.created_at, '+330 minutes', '-6 days', 'weekday 1') AS k, SUM(total_paise) AS paise
     FROM purchases p WHERE ${DAY} >= ? GROUP BY k`,
    [mondays[0]]
  )
  const weekly = mondays.map((k) => ({
    label: k === thisMonday ? 'This week' : label(k, { day: 'numeric', month: 'short' }),
    v: rupees(byWeek.get(k) || 0),
    now: k === thisMonday,
  }))

  // last 6 months
  const [y, m] = today.split('-').map(Number)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (5 - i), 1))
    return toKey(d).slice(0, 7)
  })
  const byMonth = bucketed(
    `SELECT strftime('%Y-%m', p.created_at, '+330 minutes') AS k, SUM(total_paise) AS paise
     FROM purchases p WHERE ${DAY} >= ? GROUP BY k`,
    [`${months[0]}-01`]
  )
  const monthly = months.map((k) => ({
    label: label(`${k}-01`, { month: 'short' }),
    v: rupees(byMonth.get(k) || 0),
    now: k === months[5],
  }))

  const best = (bars) => bars.reduce((a, b) => (b.v > a.v ? b : a), bars[0])
  const pct = (now, before) => (before > 0 ? Math.round(((now - before) / before) * 100) : null)

  const bestDay = best(daily)
  const wNow = weekly[5].v
  const wPrev = weekly[4].v
  const wChange = pct(wNow, wPrev)
  const mNow = monthly[5].v
  const mPrev = monthly[4].v
  const mChange = pct(mNow, mPrev)

  return {
    daily: {
      label: 'Last 7 days',
      note: bestDay.v > 0 ? `Best day: ${bestDay.label}` : 'No sales yet',
      bars: daily,
    },
    weekly: {
      label: 'Last 6 weeks',
      note: wChange === null ? (wNow > 0 ? 'First week of sales' : 'No sales yet')
        : `${wChange >= 0 ? 'Up' : 'Down'} ${Math.abs(wChange)}% on last week`,
      bars: weekly,
    },
    monthly: {
      label: 'Last 6 months',
      note: mChange === null ? (mNow > 0 ? 'First month of sales' : 'No sales yet')
        : `${mChange >= 0 ? 'Up' : 'Down'} ${Math.abs(mChange)}% on last month`,
      bars: monthly,
    },
  }
}

export function adminSummary() {
  const today = dayKey(new Date())
  const year = today.slice(0, 4)

  const day = db.prepare(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total_paise), 0) AS paise FROM purchases p WHERE ${DAY} = ?`
  ).get(today)

  const itemsSold = db.prepare(
    `SELECT COALESCE(SUM(json_extract(j.value, '$.qty')), 0) AS n
     FROM purchases p, json_each(p.items) j WHERE ${DAY} = ?`
  ).get(today).n

  const topSellers = db.prepare(
    `SELECT json_extract(j.value, '$.id') AS item_id, json_extract(j.value, '$.name') AS item_name,
            SUM(json_extract(j.value, '$.qty')) AS sold,
            SUM(json_extract(j.value, '$.qty') * json_extract(j.value, '$.price')) AS revenue
     FROM purchases p, json_each(p.items) j WHERE ${DAY} = ?
     GROUP BY item_id, item_name ORDER BY sold DESC, item_name LIMIT 6`
  ).all(today).map((r) => ({ id: r.item_id, name: r.item_name, sold: r.sold, revenue: r.revenue }))

  const life = db.prepare(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total_paise), 0) AS paise,
            COUNT(DISTINCT student_id) AS students, MIN(${DAY}) AS first FROM purchases p`
  ).get()
  const thisYear = db.prepare(
    `SELECT COALESCE(SUM(total_paise), 0) AS paise FROM purchases p WHERE strftime('%Y', ${DAY}) = ?`
  ).get(year).paise
  const bestMonth = db.prepare(
    `SELECT strftime('%Y-%m', ${DAY}) AS k, SUM(total_paise) AS paise FROM purchases p
     GROUP BY k ORDER BY paise DESC LIMIT 1`
  ).get()

  // Where the money actually is. Top-ups are what Razorpay settles to the owner's
  // bank; "outstanding" is prepaid balance students have not spent yet.
  const wallet = db.prepare(
    `SELECT
       COALESCE((SELECT SUM(amount_paise) FROM wallet_ledger WHERE kind = 'topup' AND ref LIKE 'pay_%'), 0) AS collected,
       COALESCE((SELECT SUM(amount_paise) FROM wallet_ledger WHERE kind = 'purchase'), 0) AS spent,
       COALESCE((SELECT SUM(balance_paise) FROM students), 0) AS outstanding`
  ).get()

  return {
    today: {
      orders: day.orders,
      revenue: rupees(day.paise),
      itemsSold,
      avgOrder: day.orders ? Math.round(day.paise / 100 / day.orders) : 0,
      target: config.dailyTarget,
    },
    topSellers,
    lifetime: {
      since: life.first ? label(life.first, { day: 'numeric', month: 'long', year: 'numeric' }) : null,
      total: rupees(life.paise),
      orders: life.orders,
      students: life.students,
      thisYear: rupees(thisYear),
      bestMonth: bestMonth
        ? { label: label(`${bestMonth.k}-01`, { month: 'long', year: 'numeric' }), v: rupees(bestMonth.paise) }
        : null,
    },
    wallet: {
      collected: rupees(wallet.collected),
      spent: rupees(wallet.spent),
      outstanding: rupees(wallet.outstanding),
    },
    trends: trends(today),
  }
}
