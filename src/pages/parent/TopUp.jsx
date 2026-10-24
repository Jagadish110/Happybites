import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { TOPUP_PRESETS } from '../../data/menu.js'
import { BankIcon } from '../../components/Icons.jsx'
import { api } from '../../api/client.js'
import FakeCheckout from '../../components/FakeCheckout.jsx'

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

/** Razorpay's Checkout script is only fetched when someone actually pays. */
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script')
    tag.src = CHECKOUT_SRC
    tag.onload = resolve
    tag.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'))
    document.head.appendChild(tag)
  })
}

export default function TopUp() {
  const { id } = useParams()
  const { say, children, update } = useOutletContext()
  const navigate = useNavigate()
  const kid = children.find((c) => c.id === id) || children[0]

  const [amount, setAmount] = useState(500)
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(false)
  const [meta, setMeta] = useState(null)
  const [fake, setFake] = useState(null)                 // an open simulated checkout

  useEffect(() => { api.meta().then(setMeta).catch(() => setMeta({ razorpay: false, topupMin: 10, topupMax: 10000 })) }, [])

  const min = meta?.topupMin ?? 10
  const max = meta?.topupMax ?? 10000
  const value = custom ? Number(custom) : amount
  const valid = Number.isInteger(value) && value >= min && value <= max
  const test = Boolean(meta?.testGateway)
  const ready = Boolean(meta?.razorpay || test)

  /** Both the real Checkout and the simulated one hand back the same three fields. */
  const settle = async (response) => {
    try {
      const out = await api.parent.topupVerify(response)
      update(out.student)
      setFake(null)
      say(`₹${value.toLocaleString('en-IN')} added to the wallet of ${kid.name}`)
      navigate(`/parent/${kid.id}`)
    } catch (err) {
      // The money has left the parent account; for real payments the webhook still credits it.
      setFake(null)
      say(err.status === 400
        ? err.message
        : 'Your payment went through, but we could not confirm it just yet. It will be added to the wallet shortly.')
      setBusy(false)
    }
  }

  const pay = async () => {
    setBusy(true)
    try {
      const order = await api.parent.topupOrder(kid.id, value)
      if (order.test) {                                   // no Razorpay keys yet: simulated checkout
        setFake(order)
        return
      }
      await loadCheckout()

      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Happy Bites',
        description: `Canteen wallet top-up for ${order.studentName}`,
        theme: { color: '#ea4b2c' },
        handler: settle,
        modal: {
          ondismiss: () => { setBusy(false); say('Payment cancelled. Nothing was charged.') },
        },
      })
      checkout.on('payment.failed', (r) => say(`Payment failed: ${r.error?.description || 'please try again'}`))
      checkout.open()
    } catch (err) {
      say(err.message)
      setBusy(false)
    }
  }

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
          <span>Or enter your own amount (₹{min} – ₹{max})</span>
          <input
            type="number" min={min} max={max} step="1" placeholder="e.g. 750"
            value={custom} onChange={(e) => setCustom(e.target.value)}
          />
        </label>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Payment method</h2></div>

        {test && (
          <div className="test-banner">
            <span aria-hidden="true">🧪</span>
            <span>
              <strong>Test mode.</strong> Payments are simulated, so no real money moves. Add the
              Razorpay keys to the server to take real payments.
            </span>
          </div>
        )}

        <div className="pay-row">
          <span className="pay-bank-ico" aria-hidden="true"><BankIcon width={22} height={22} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              UPI · Card · Netbanking via <span className="pay-logo">Razorpay</span>
            </div>
            <div className="muted">Wallet credits as soon as the payment is confirmed</div>
          </div>
          <span className={'pill' + (test ? ' amber' : ready ? ' green' : '')}>
            {test ? 'Test mode' : ready ? 'Secure checkout' : 'Not set up yet'}
          </span>
        </div>

        {meta && !ready && (
          <p className="form-error">
            Online payments are not switched on yet. The canteen needs to add its Razorpay keys before money can be added here.
          </p>
        )}

        <div className="summary-line"><span>Top-up amount</span><span>₹{valid ? value : 0}</span></div>
        <div className="summary-line total"><span>Payable now</span><strong>₹{valid ? value : 0}</strong></div>

        <button className="btn block" style={{ marginTop: 14 }} disabled={!valid || !ready || busy} onClick={pay}>
          {busy ? 'Opening payment…' : `Pay ₹${valid ? value.toLocaleString('en-IN') : 0}`}
        </button>
        <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>
          Payments are processed by Razorpay. Card and UPI details never touch this site.
        </p>
      </div>

      {fake && (
        <FakeCheckout
          order={fake}
          onPaid={settle}
          onDismiss={() => { setFake(null); setBusy(false); say('Payment cancelled. Nothing was charged.') }}
        />
      )}
    </div>
  )
}
