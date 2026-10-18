import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { ArrowIcon, PlusIcon, WalletIcon, CloseIcon } from '../../components/Icons.jsx'

export default function Children() {
  const { children: kids, linkChild } = useOutletContext()
  const [adding, setAdding] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const total = kids.reduce((n, c) => n + c.balance, 0)

  const submit = (e) => {
    e.preventDefault()
    const err = linkChild(code)
    if (err) { setError(err); return }
    setCode('')
    setError('')
    setAdding(false)
  }

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Your children</h1>
      <p className="page-sub">
        {kids.length} card{kids.length === 1 ? '' : 's'} linked · ₹{total.toLocaleString('en-IN')} across their wallets
      </p>

      <div className="kid-grid">
        {kids.map((kid) => {
          const low = kid.balance < 100
          const initials = kid.name.split(' ').map((n) => n[0]).join('')
          return (
            <div className="kid-card" key={kid.id}>
              <div className="kid-top">
                <span className="kid-avatar-badge" aria-hidden="true">
                  <span className="kid-initials">{initials}</span>
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="kid-name">{kid.name}</div>
                  <div className="kid-meta">{kid.klass}</div>
                  <div className="kid-meta mono">{kid.id}</div>
                </div>
              </div>

              <div className={'kid-balance' + (low ? ' low' : '')}>
                <div>
                  <div className="muted" style={{ fontSize: 12 }}>Wallet balance</div>
                  <div className="amt">₹{kid.balance}</div>
                </div>
                {low
                  ? <span className="pill danger">Running low</span>
                  : <span className="pill green">Healthy</span>}
              </div>

              <div className="muted">
                Spent today ₹{kid.spentToday} of ₹{kid.dailyLimit} · {kid.lastSpend}
              </div>

              <div className="kid-actions">
                <Link className="btn inline-btn" to={`/parent/${kid.id}/topup`}>
                  <WalletIcon width={15} height={15} />
                  <span>Add money</span>
                </Link>
                <Link className="btn ghost" to={`/parent/${kid.id}`}>
                  <span>Details</span>
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          )
        })}

        {adding ? (
          <form className="kid-card link-form" onSubmit={submit}>
            <div className="kid-name">Link another child</div>
            <p className="muted">Enter the secret code from the back of their canteen card.</p>
            <label className="field">
              <span>Secret code</span>
              <input
                className="code-input" type="text" maxLength={8} placeholder="PD4B9T" autoFocus
                value={code}
                onChange={(e) => { setCode(e.target.value); setError('') }}
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <div className="kid-actions">
              <button className="btn" type="submit" disabled={code.trim().length < 6}>Link card</button>
              <button className="btn ghost" type="button" onClick={() => { setAdding(false); setError('') }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="kid-card add-kid" onClick={() => setAdding(true)}>
            <span className="plus" aria-hidden="true">
              <PlusIcon width={22} height={22} />
            </span>
            <div>
              <div className="kid-name">Link another child</div>
              <div className="kid-meta">Enter the secret code on their card</div>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
