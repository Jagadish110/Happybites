import crypto from 'node:crypto'
import { config, isProd } from './config.js'
import { keyed, safeEqual } from './security.js'
import { configured as razorpayConfigured } from './razorpay.js'
import { HttpError } from './http.js'

/**
 * A stand-in for Razorpay so the whole top-up flow can be tried before real keys
 * exist. It follows Razorpay's contract: an order is created, the "payment" returns
 * { order_id, payment_id, signature }, and the SAME verify step as the real thing
 * decides whether to credit the wallet.
 *
 * Safety: it can never run in production, and switches itself off the moment real
 * Razorpay keys are present. Money it credits is labelled as test money and is kept
 * out of the owner's "paid in" figures.
 */
export const enabled = () =>
  !isProd && !razorpayConfigured() && process.env.HB_TEST_GATEWAY !== '0'

export const TEST_KEY_ID = 'rzp_test_SIMULATED'
const secret = () => keyed('test-gateway')

export const sign = (orderId, paymentId) =>
  crypto.createHmac('sha256', secret()).update(`${orderId}|${paymentId}`).digest('hex')

export const verify = ({ orderId, paymentId, signature }) =>
  Boolean(orderId && paymentId && signature) && safeEqual(sign(orderId, paymentId), signature)

export const newOrderId = () => `order_TEST${crypto.randomBytes(6).toString('hex')}`

export const METHODS = ['gpay', 'phonepe', 'paytm', 'bhim', 'upi_id', 'card', 'netbanking', 'wallet']

/** The bank/app "approves" (or declines) the payment and hands back what Checkout would. */
export function pay({ orderId, method, outcome }) {
  if (!METHODS.includes(method)) throw new HttpError(400, 'invalid_method', 'Pick one of the payment options')
  if (outcome === 'failure') {
    throw new HttpError(402, 'payment_failed', 'The payment was declined by the bank (test). No money was taken.')
  }
  const paymentId = `test_pay_${crypto.randomBytes(7).toString('hex')}`
  return {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: sign(orderId, paymentId),
  }
}

export const maxTopup = () => config.topupMax
