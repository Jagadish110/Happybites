import { configured } from './razorpay.js'
import { isProd, openAccess } from './config.js'

export function rzpStatus() {
  if (!configured()) return 'Razorpay: NOT configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env to take payments.'
  const mode = process.env.RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'LIVE' : 'test'
  const hook = process.env.RAZORPAY_WEBHOOK_SECRET ? 'webhook on' : 'webhook secret missing'
  return `Razorpay: ${mode} keys loaded (${hook}).`
}

export function accessStatus() {
  if (!openAccess()) return 'Sign-in: REQUIRED for the counter, admin and parents.'
  return isProd
    ? 'WARNING: HB_OPEN_ACCESS=1 in production. Anyone who can reach this server can charge cards and open the admin and parent areas.'
    : 'Open access (testing): no sign-in at the counter, and any admin or parent login opens. Set HB_OPEN_ACCESS=0 to require sign-in.'
}
