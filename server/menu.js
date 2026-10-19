import crypto from 'node:crypto'
import { db } from './db.js'
import { HttpError, bad, isInt } from './http.js'
import { CATEGORY_IDS } from './wallet.js'

const MAX_IMAGE_CHARS = 300_000
const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${crypto.randomBytes(2).toString('hex')}`

// ---- what the website receives --------------------------------------------
export const itemView = (r) => ({
  id: r.id, name: r.name, price: r.price, cat: r.cat, type: r.type, note: r.note,
  emoji: r.emoji, icon: r.icon, image: r.image, art: r.art, artProps: JSON.parse(r.art_props || '{}'),
  featured: !!r.featured, soldOut: !!r.sold_out,
})

export const offerView = (r) => ({
  id: r.id, title: r.title, detail: r.detail, price: r.price, was: r.was || r.price, cat: r.cat,
  emoji: r.emoji, icon: r.icon, image: r.image, art: r.art, active: !!r.active,
})

export function menuSnapshot() {
  return {
    items: db.prepare('SELECT * FROM menu_items ORDER BY sort, name').all().map(itemView),
    offers: db.prepare('SELECT * FROM offers ORDER BY sort, title').all().map(offerView),
  }
}

// ---- validation -------------------------------------------------------------
function cleanImage(v) {
  if (v === '' || v === undefined || v === null) return ''
  if (typeof v !== 'string' || v.length > MAX_IMAGE_CHARS || !IMAGE_RE.test(v)) {
    throw bad('invalid_image', 'The photo must be a JPEG, PNG or WebP under about 200 KB')
  }
  return v
}

function cleanCategory(v) {
  if (!CATEGORY_IDS.includes(v)) throw bad('invalid_category', 'Pick one of the menu categories')
  return v
}

function cleanPrice(v, label = 'Price') {
  if (!isInt(v, 1, 5000)) throw bad('invalid_price', `${label} must be a whole number of rupees between 1 and 5000`)
  return v
}

// ---- dishes ---------------------------------------------------------------------
export function createItem(body) {
  const name = text(body.name, 60)
  if (!name) throw bad('invalid_name', 'Give the dish a name')
  const type = body.type === 'nonveg' ? 'nonveg' : 'veg'

  const sort = (db.prepare('SELECT MIN(sort) AS m FROM menu_items').get().m ?? 0) - 1   // newest first
  const id = newId('item')
  db.prepare(
    `INSERT INTO menu_items (id, name, price, cat, type, note, emoji, image, sort, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(id, name, cleanPrice(body.price), cleanCategory(body.cat), type, text(body.note, 60),
    text(body.emoji, 8), cleanImage(body.image), sort, new Date().toISOString())
  return itemView(db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id))
}

export function updateItem(id, body) {
  const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id)
  if (!row) throw new HttpError(404, 'item_not_found', 'No such dish')

  const next = {
    name: body.name !== undefined ? text(body.name, 60) : row.name,
    price: body.price !== undefined ? cleanPrice(body.price) : row.price,
    cat: body.cat !== undefined ? cleanCategory(body.cat) : row.cat,
    type: body.type !== undefined ? (body.type === 'nonveg' ? 'nonveg' : 'veg') : row.type,
    note: body.note !== undefined ? text(body.note, 60) : row.note,
    image: body.image !== undefined ? cleanImage(body.image) : row.image,
  }
  if (!next.name) throw bad('invalid_name', 'Give the dish a name')

  db.prepare(
    'UPDATE menu_items SET name=?, price=?, cat=?, type=?, note=?, image=?, updated_at=? WHERE id=?'
  ).run(next.name, next.price, next.cat, next.type, next.note, next.image, new Date().toISOString(), id)
  return itemView(db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id))
}

export function setItemAvailable(id, available) {
  const r = db.prepare('UPDATE menu_items SET sold_out = ?, updated_at = ? WHERE id = ?')
    .run(available ? 0 : 1, new Date().toISOString(), id)
  if (!r.changes) throw new HttpError(404, 'item_not_found', 'No such dish')
  return itemView(db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id))
}

// ---- offers -----------------------------------------------------------------------
export function createOffer(body) {
  const title = text(body.title, 60)
  if (!title) throw bad('invalid_name', 'Give the offer a name')
  const price = cleanPrice(body.price, 'Offer price')
  const was = body.was === undefined || body.was === '' || body.was === 0 ? price : cleanPrice(body.was, 'Usual price')

  const sort = (db.prepare('SELECT MIN(sort) AS m FROM offers').get().m ?? 0) - 1
  const id = newId('offer')
  db.prepare(
    `INSERT INTO offers (id, title, detail, price, was, cat, emoji, image, active, sort, updated_at)
     VALUES (?,?,?,?,?,?,?,?,1,?,?)`
  ).run(id, title, text(body.detail, 100), price, was, cleanCategory(body.cat),
    text(body.emoji, 8), cleanImage(body.image), sort, new Date().toISOString())
  return offerView(db.prepare('SELECT * FROM offers WHERE id = ?').get(id))
}

export function setOfferActive(id, active) {
  const r = db.prepare('UPDATE offers SET active = ?, updated_at = ? WHERE id = ?')
    .run(active ? 1 : 0, new Date().toISOString(), id)
  if (!r.changes) throw new HttpError(404, 'offer_not_found', 'No such offer')
  return offerView(db.prepare('SELECT * FROM offers WHERE id = ?').get(id))
}

// ---- pricing an order -----------------------------------------------------------
/**
 * Turn what the counter sent ([{ id, qty, offer? }]) into priced lines using the
 * server's own menu. Names, prices and categories the browser might have sent are
 * never used, so a tampered request cannot be cheaper or dodge a parent's block.
 */
export function priceOrder(lines) {
  const byKey = new Map()
  for (const l of lines) {
    const key = `${l.offer ? 'o' : 'i'}:${l.id}`
    byKey.set(key, (byKey.get(key) || 0) + l.qty)
  }

  const priced = []
  for (const [key, qty] of byKey) {
    if (qty > 99) throw bad('invalid_item', 'That quantity is too large')
    const isOffer = key.startsWith('o:')
    const id = key.slice(2)

    if (isOffer) {
      const o = db.prepare('SELECT * FROM offers WHERE id = ?').get(id)
      if (!o) throw bad('unknown_item', 'An offer in this order no longer exists')
      if (!o.active) throw new HttpError(409, 'item_unavailable', `The offer "${o.title}" has ended`, { id })
      priced.push({ id: o.id, name: o.title, price: o.price, qty, cat: o.cat, offer: true })
    } else {
      const i = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id)
      if (!i) throw bad('unknown_item', 'A dish in this order is not on the menu')
      if (i.sold_out) throw new HttpError(409, 'item_unavailable', `${i.name} is sold out`, { id })
      priced.push({ id: i.id, name: i.name, price: i.price, qty, cat: i.cat })
    }
  }
  return priced
}
