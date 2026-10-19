import { configured } from './razorpay.js'

export function rzpStatus() {
  if (!configured()) return 'Razorpay: NOT configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env to take payments.'
  const mode = process.env.RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'LIVE' : 'test'
  const hook = process.env.RAZORPAY_WEBHOOK_SECRET ? 'webhook on' : 'webhook secret missing'
  return `Razorpay: ${mode} keys loaded (${hook}).`
}
