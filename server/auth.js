import { db } from './db.js'
import { config, openAccess } from './config.js'
import { keyed, newToken } from './security.js'
import { HttpError } from './http.js'

const unauthorized = () => new HttpError(401, 'unauthorized', 'Please sign in again')

export function issueSession(kind, subject, studentIds = []) {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString())

  const token = newToken()
  const hash = keyed(token)
  const expires = new Date(Date.now() + config.sessionHours * 3600 * 1000).toISOString()

  db.prepare('INSERT INTO sessions (token_hash, kind, subject, expires_at) VALUES (?,?,?,?)')
    .run(hash, kind, subject, expires)
  for (const id of studentIds) linkStudent(hash, id)
  return token
}

export function linkStudent(hash, studentId) {
  db.prepare('INSERT OR IGNORE INTO session_students (token_hash, student_id) VALUES (?, ?)').run(hash, studentId)
}

function readSession(req, kind) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '')
  if (!m) throw unauthorized()
  const hash = keyed(m[1])
  const s = db.prepare('SELECT * FROM sessions WHERE token_hash = ?').get(hash)
  if (!s || s.kind !== kind || s.expires_at < new Date().toISOString()) throw unauthorized()
  return s
}

export function requireParent(req, _res, next) {
  const s = readSession(req, 'parent')
  req.session = {
    hash: s.token_hash,
    studentIds: db.prepare('SELECT student_id FROM session_students WHERE token_hash = ?')
      .all(s.token_hash).map((r) => r.student_id),
  }
  next()
}

export const requireStaff = (...roles) => (req, _res, next) => {
  if (openAccess()) {
    // Testing: nobody has to sign in. A real session is still recognised if one was sent.
    let staff = null
    let hash = ''
    try {
      const s = readSession(req, 'staff')
      hash = s.token_hash
      staff = db.prepare('SELECT id, name, role, counter FROM staff WHERE id = ?').get(s.subject)
    } catch { /* no session: that is fine in open access */ }
    req.staff = staff || { id: 'OPEN', name: 'Counter', role: 'admin', counter: 'Counter 1' }
    req.session = { hash }
    return next()
  }

  const s = readSession(req, 'staff')
  const staff = db.prepare('SELECT id, name, role, counter FROM staff WHERE id = ?').get(s.subject)
  if (!staff) throw unauthorized()
  if (!roles.includes(staff.role)) throw new HttpError(403, 'forbidden', 'That needs an admin sign-in')
  req.staff = staff
  req.session = { hash: s.token_hash }
  next()
}

export function endSession(hash) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hash)
}

/** A parent may only act on students whose card code they have entered this session. */
export function ownStudent(req, studentId) {
  if (!req.session.studentIds.includes(studentId)) {
    throw new HttpError(403, 'forbidden', 'That card is not linked to this account')
  }
}
