import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import { config, isProd } from './config.js'
import { hashPin, keyed } from './security.js'

fs.mkdirSync(path.dirname(path.resolve(config.dbFile)), { recursive: true })
export const db = new DatabaseSync(config.dbFile)
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

/** Run fn as one all-or-nothing write. BEGIN IMMEDIATE queues writers, so a balance check and the debit never interleave. */
export function tx(fn) {
  db.exec('BEGIN IMMEDIATE')
  try {
    const out = fn()
    db.exec('COMMIT')
    return out
  } catch (err) {
    try { db.exec('ROLLBACK') } catch { /* already rolled back */ }
    throw err
  }
}

// All money is stored as integer paise. Rupees only exist at the edges.
db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  klass               TEXT NOT NULL DEFAULT '',
  code_hash           TEXT NOT NULL UNIQUE,
  balance_paise       INTEGER NOT NULL DEFAULT 0 CHECK (balance_paise >= 0),
  daily_limit_paise   INTEGER NOT NULL DEFAULT 0,
  per_order_cap_paise INTEGER NOT NULL DEFAULT 0,
  blocked             TEXT NOT NULL DEFAULT '[]',
  card_active         INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wallet_ledger (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id          TEXT NOT NULL REFERENCES students(id),
  kind                TEXT NOT NULL CHECK (kind IN ('topup','purchase','refund')),
  amount_paise        INTEGER NOT NULL CHECK (amount_paise > 0),
  balance_after_paise INTEGER NOT NULL,
  ref                 TEXT NOT NULL,
  note                TEXT NOT NULL DEFAULT '',
  counter             TEXT NOT NULL DEFAULT '',
  created_at          TEXT NOT NULL,
  UNIQUE (kind, ref)
);
CREATE INDEX IF NOT EXISTS ledger_student ON wallet_ledger (student_id, id);

CREATE TABLE IF NOT EXISTS topup_orders (
  order_id     TEXT PRIMARY KEY,
  student_id   TEXT NOT NULL REFERENCES students(id),
  amount_paise INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'created',
  payment_id   TEXT,
  created_at   TEXT NOT NULL,
  paid_at      TEXT
);

CREATE TABLE IF NOT EXISTS purchases (
  id          TEXT PRIMARY KEY,
  client_ref  TEXT NOT NULL UNIQUE,
  student_id  TEXT NOT NULL REFERENCES students(id),
  total_paise INTEGER NOT NULL,
  items       TEXT NOT NULL,
  staff_id    TEXT NOT NULL,
  counter     TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS purchases_when ON purchases (created_at);

CREATE TABLE IF NOT EXISTS staff (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  role    TEXT NOT NULL CHECK (role IN ('counter','admin')),
  counter TEXT NOT NULL DEFAULT '',
  pin     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  kind       TEXT NOT NULL CHECK (kind IN ('parent','staff')),
  subject    TEXT NOT NULL DEFAULT '',
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session_students (
  token_hash TEXT NOT NULL REFERENCES sessions(token_hash) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id),
  PRIMARY KEY (token_hash, student_id)
);
`)

const nowIso = () => new Date().toISOString()

// ---- first-run seed ------------------------------------------------------
function seed() {
  if (!db.prepare('SELECT COUNT(*) AS n FROM staff').get().n) {
    const counterPin = process.env.COUNTER_PIN || (isProd ? '' : '1234')
    const adminPin = process.env.ADMIN_PIN || (isProd ? '' : '4321')
    if (!counterPin || !adminPin) {
      throw new Error('Set COUNTER_PIN and ADMIN_PIN before the first production start')
    }
    const add = db.prepare('INSERT INTO staff (id, name, role, counter, pin) VALUES (?,?,?,?,?)')
    add.run('CNT-01', 'Lakshmi R.', 'counter', 'Counter 1', hashPin(counterPin))
    add.run('ADMIN', 'Owner', 'admin', '', hashPin(adminPin))
  }

  const wantDemo = process.env.HB_SEED_DEMO ? process.env.HB_SEED_DEMO === '1' : !isProd
  if (wantDemo && !db.prepare('SELECT COUNT(*) AS n FROM students').get().n) {
    const demo = [
      { id: 'HB-2024-0518', code: 'KX7M2Q', name: 'Aarav Sharma', klass: 'Class 9-B · Roll 18', rupees: 420, daily: 150, cap: 90, blocked: [] },
      { id: 'HB-2024-0732', code: 'PD4B9T', name: 'Ananya Sharma', klass: 'Class 6-A · Roll 04', rupees: 60, daily: 120, cap: 70, blocked: ['snacks'] },
    ]
    tx(() => {
      for (const s of demo) {
        db.prepare(`INSERT INTO students
          (id, name, klass, code_hash, balance_paise, daily_limit_paise, per_order_cap_paise, blocked, created_at)
          VALUES (?,?,?,?,?,?,?,?,?)`)
          .run(s.id, s.name, s.klass, keyed(s.code), s.rupees * 100, s.daily * 100, s.cap * 100, JSON.stringify(s.blocked), nowIso())
        db.prepare(`INSERT INTO wallet_ledger
          (student_id, kind, amount_paise, balance_after_paise, ref, note, counter, created_at)
          VALUES (?, 'topup', ?, ?, ?, 'Opening balance', '', ?)`)
          .run(s.id, s.rupees * 100, s.rupees * 100, `opening-${s.id}`, nowIso())
      }
    })
  }
}
seed()
