import crypto from 'node:crypto'
import { safeEqual } from './security.js'
import { HttpError } from './http.js'

// Keys come from the environment at call time and are never sent to the browser
// (only the public key id is, so Checkout can open).
const keys = () => ({
  id: process.env.RAZORPAY_KEY_ID || '',
  secret: process.env.RAZORPAY_KEY_SECRET || '',
})
const apiBase = () => process.env.RAZORPAY_API_BASE || 'https://api.razorpay.com'

export const configured = () => {
  const k = keys()
  return Boolean(k.id && k.secret)
}
export const publicKeyId = () => keys().id

const hmac = (secret, text) => crypto.createHmac('sha256', secret).update(text).digest('hex')

/** Ask Razorpay for an order; the amount is fixed here, on the server. */
export async function createOrder({ amountPaise, receipt, notes }) {
  const { id, secret } = keys()
  let res
  try {
    res = await fetch(`${apiBase()}/v1/orders`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      },
      body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, notes }),
    })
  } catch {
    throw new HttpError(502, 'razorpay_unreachable', 'Could not reach Razorpay. Try again in a moment.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new HttpError(502, 'razorpay_error', data?.error?.description || 'Razorpay could not create the order')
  }
  return data
}

/** Checkout hands the browser order_id, payment_id and a signature; only our secret can reproduce it. */
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const { secret } = keys()
  if (!secret || !orderId || !paymentId || !signature) return false
  return safeEqual(hmac(secret, `${orderId}|${paymentId}`), signature)
}

/** Webhooks are signed over the raw request body with a separate webhook secret. */
export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
  if (!secret || !signature) return false
  return safeEqual(hmac(secret, rawBody), signature)
}
