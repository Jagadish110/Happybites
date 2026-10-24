import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { BankIcon, CardIcon, CloseIcon, WalletIcon } from './Icons.jsx'

/**
 * A stand-in for Razorpay Checkout, used while no real keys are set. It behaves the
 * same way for the person paying: pick a way to pay, approve it, see the result. The
 * result handed back to the page has the same shape as the real Checkout handler.
 */
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', mark: 'G', color: '#4285f4' },
  { id: 'phonepe', name: 'PhonePe', mark: 'Pe', color: '#5f259f' },
  { id: 'paytm', name: 'Paytm', mark: 'P', color: '#00b9f5' },
  { id: 'bhim', name: 'BHIM UPI', mark: 'B', color: '#f2812b' },
]

const OTHERS = [
  { id: 'card', name: 'Cards', hint: 'Visa, Mastercard, RuPay', Icon: CardIcon },
  { id: 'netbanking', name: 'Netbanking', hint: 'All major banks', Icon: BankIcon },
  { id: 'wallet', name: 'Wallets', hint: 'Paytm, Mobikwik and more', Icon: WalletIcon },
]

const sleep = (ms) => new Promise((r) => window.setTimeout(r, ms))
const inr = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`
const label = (id) => [...UPI_APPS, ...OTHERS].find((m) => m.id === id)?.name || 'your bank'

export default function FakeCheckout({ order, onPaid, onDismiss }) {
  const [phase, setPhase] = useState('choose')       // choose | processing | success | failed
  const [method, setMethod] = useState('')
  const [message, setMessage] = useState('')
  const [declineNext, setDeclineNext] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && phase !== 'processing' && phase !== 'success' && onDismiss()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [phase, onDismiss])

  const start = async (id) => {
    setMethod(id)
    setPhase('processing')
    try {
      // the short wait stands in for approving the request in the UPI app or bank page
      const [response] = await Promise.all([
        api.parent.testPay(order.orderId, id, declineNext ? 'failure' : undefined),
        sleep(1800),
      ])
      setPhase('success')
      await sleep(1300)
      onPaid(response)
    } catch (err) {
      setMessage(err.message)
      setPhase('failed')
    }
  }

  const isUpi = UPI_APPS.some((a) => a.id === method)

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label="Payment">
      <div className="modal-scrim" onClick={phase === 'choose' || phase === 'failed' ? onDismiss : undefined} />

      <div className="fc">
        <div className="fc-head">
          <span className="fc-logo" aria-hidden="true">HB</span>
          <div className="fc-merchant">
            <strong>Happy Bites</strong>
            <span>Canteen wallet top-up · {order.studentName}</span>
          </div>
          <div className="fc-amount">
            <strong>{inr(order.amount)}</strong>
            <span className="fc-test">TEST MODE</span>
          </div>
          {phase !== 'processing' && phase !== 'success' && (
            <button className="fc-x" onClick={onDismiss} aria-label="Close payment window"><CloseIcon /></button>
          )}
        </div>

        {phase === 'choose' && (
          <div className="fc-body">
            <p className="fc-label">Pay using UPI</p>
            <div className="fc-apps">
              {UPI_APPS.map((a) => (
                <button key={a.id} className="fc-app" onClick={() => start(a.id)}>
                  <span className="fc-mark" style={{ background: a.color }}>{a.mark}</span>
                  <span>{a.name}</span>
                </button>
              ))}
            </div>

            <p className="fc-label">More ways to pay</p>
            <div className="fc-list">
              {OTHERS.map(({ id, name, hint, Icon }) => (
                <button key={id} className="fc-row" onClick={() => start(id)}>
                  <span className="fc-row-ico"><Icon width={20} height={20} /></span>
                  <span className="fc-row-main"><strong>{name}</strong><span>{hint}</span></span>
                  <span className="fc-chev" aria-hidden="true">›</span>
                </button>
              ))}
            </div>

            <label className="fc-decline">
              <input type="checkbox" checked={declineNext} onChange={(e) => setDeclineNext(e.target.checked)} />
              <span>Simulate a declined payment (to see the failure screen)</span>
            </label>
            <p className="fc-foot">Test checkout. No real money moves and nothing is charged to any account.</p>
          </div>
        )}

        {phase === 'processing' && (
          <div className="fc-state">
            <span className="fc-spinner" aria-hidden="true" />
            <h3>{isUpi ? `Waiting for ${label(method)}` : 'Processing payment'}</h3>
            <p>
              {isUpi
                ? `Approve the request for ${inr(order.amount)} in the ${label(method)} app.`
                : `Confirming with ${label(method)}. Please do not close this window.`}
            </p>
          </div>
        )}

        {phase === 'success' && (
          <div className="fc-state ok">
            <span className="fc-badge" aria-hidden="true">✓</span>
            <h3>Payment successful</h3>
            <p>{inr(order.amount)} paid to Happy Bites. Adding it to the wallet…</p>
          </div>
        )}

        {phase === 'failed' && (
          <div className="fc-state bad">
            <span className="fc-badge" aria-hidden="true">!</span>
            <h3>Payment failed</h3>
            <p>{message}</p>
            <div className="fc-actions">
              <button className="btn" onClick={() => { setDeclineNext(false); setPhase('choose') }}>Try another way</button>
              <button className="btn ghost" onClick={onDismiss}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
