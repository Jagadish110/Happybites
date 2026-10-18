import { useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { getChild, TOPUP_PRESETS } from '../../data/menu.js'
import { BankIcon } from '../../components/Icons.jsx'

export default function TopUp() {
  const { id } = useParams()
  const { say } = useOutletContext()
  const kid = getChild(id)

  const [amount, setAmount] = useState(500)
  const [custom, setCustom] = useState('')
  const [autoTopUp, setAutoTopUp] = useState(false)

  const value = custom ? Number(custom) || 0 : amount
  const fee = 0 // the canteen absorbs the gateway fee
  const total = value + fee

  return (
    <div className="page page-narrow">
      <Link className="link-btn back" to={`/parent/${kid.id}`}>&larr; {kid.name}</Link>
      <h1 className="page-title">Add money</h1>
      <p className="page-sub">
        To {kid.name}&rsquo;s canteen wallet · <span className="mono">{kid.id}</span>
      </p>

      <div className="panel">
        <div className="panel-head">
          <h2>Choose an amount</h2>
          <span className="pill grey">Balance ₹{kid.balance}</span>
        </div>

        <div className="amount-grid">
          {TOPUP_PRESETS.map((a) => (
            <button
              key={a}
              className={'amount-opt' + (!custom && amount === a ? ' active' : '')}
              onClick={() => { setAmount(a); setCustom('') }}
            >
              ₹{a}
            </button>
          ))}
        </div>

        <label className="field" style={{ marginTop: 16 }}>
          <span>Or enter your own amount</span>
          <input
            type="number" min="10" max="10000" placeholder="e.g. 750"
            value={custom} onChange={(e) => setCustom(e.target.value)}
          />
        </label>

        <label className="toggle-row">
          <input type="checkbox" checked={autoTopUp} onChange={(e) => setAutoTopUp(e.target.checked)} />
          <span className="switch" aria-hidden="true" />
          <span>
            <strong>Auto top-up</strong>
            <span className="muted"> — add ₹500 whenever the balance drops below ₹100</span>
          </span>
        </label>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Payment method</h2></div>

        <div className="pay-row">
          <span className="pay-bank-ico" aria-hidden="true"><BankIcon width={22} height={22} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              UPI · Card · Netbanking via <span className="pay-logo">Razorpay</span>
            </div>
            <div className="muted">Wallet credits as soon as the payment is confirmed</div>
          </div>
          <span className="pill">Coming soon</span>
        </div>

        <div className="summary-line"><span>Top-up amount</span><span>₹{value}</span></div>
        <div className="summary-line"><span>Convenience fee</span><span>₹{fee}</span></div>
        <div className="summary-line total"><span>Payable now</span><strong>₹{total}</strong></div>

        <button
          className="btn block" style={{ marginTop: 14 }} disabled={value < 10}
          onClick={() => say(`Razorpay checkout opens here — ₹${total} for ${kid.name}`)}
        >
          Pay ₹{total}
        </button>
        <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>
          Payments go live once the Razorpay account is connected.
        </p>
      </div>
    </div>
  )
}
