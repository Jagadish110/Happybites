import crypto from 'node:crypto'
import { config } from './config.js'

/** Keyed hash used for card codes and session tokens, so the database never holds them in clear. */
export const keyed = (value) =>
  crypto.createHmac('sha256', config.appSecret).update(String(value)).digest('hex')

export const newToken = () => crypto.randomBytes(32).toString('base64url')

export function safeEqual(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

/** PINs are stored as scrypt(salt, pin). */
export function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(pin), salt, 32).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPin(pin, stored) {
  const [salt, hash] = String(stored).split(':')
  if (!salt || !hash) return false
  const test = crypto.scryptSync(String(pin), salt, 32).toString('hex')
  return safeEqual(test, hash)
}

/** Tiny in-memory throttle for the login endpoints. */
const hits = new Map()
export function throttle(key, max, windowMs) {
  const now = Date.now()
  const slot = hits.get(key)
  if (!slot || slot.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  slot.count += 1
  return slot.count <= max
}
