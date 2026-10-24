// Everything tunable comes from the environment (see .env.example).
// Razorpay keys are read at the moment they are used, so they can be changed
// without touching code — and never reach the browser.

export const isProd = process.env.NODE_ENV === 'production'

export const config = {
  // In development the Vite proxy expects 8787. Tools that start dev servers export PORT for the
  // website, so PORT is only honoured in production; API_PORT overrides in either mode.
  port: Number(process.env.API_PORT) || (isProd && Number(process.env.PORT)) || 8787,
  dbFile: process.env.HB_DB || 'server/data/happybites.db',
  appSecret: process.env.APP_SECRET || (isProd ? '' : 'dev-only-secret-change-me'),
  topupMin: 10,
  topupMax: Number(process.env.TOPUP_MAX) || 10000,
  maxOrderRupees: 20000,
  dailyTarget: Number(process.env.DAILY_TARGET) || 10000,
  sessionHours: 12,
}

if (isProd && config.appSecret.length < 24) {
  throw new Error('APP_SECRET must be set to a long random string in production')
}

/**
 * Testing switch. When on, the counter needs no staff sign-in and the admin and
 * parent logins accept whatever is typed. It is ON in development and OFF in
 * production unless HB_OPEN_ACCESS=1 is set on purpose. Set HB_OPEN_ACCESS=0 to
 * require real sign-ins in development too.
 */
export const openAccess = () =>
  process.env.HB_OPEN_ACCESS ? process.env.HB_OPEN_ACCESS === '1' : !isProd
