import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldIcon } from '../../components/Icons.jsx'

/** Staff ID + PIN. UI only — any ID and any 4-digit PIN get in. */
export default function AdminLogin({ onSignIn }) {
  const [staffId, setStaffId] = useState('')
  const [pin, setPin] = useState('')

  const ok = staffId.trim().length >= 3 && pin.replace(/\D/g, '').length === 4

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <span className="auth-ico"><ShieldIcon /></span>
        <h1 className="auth-title">Admin sign in</h1>
        <p className="auth-sub">
          Manage the menu, run offers, and watch today&rsquo;s counter progress.
        </p>

        <label className="field">
          <span>Staff ID</span>
          <input
            type="text" placeholder="CNT-01" autoFocus
            value={staffId} onChange={(e) => setStaffId(e.target.value)}
          />
        </label>

        <label className="field">
          <span>4-digit PIN</span>
          <input
            className="otp-input" type="password" inputMode="numeric" maxLength={4}
            placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)}
          />
        </label>

        <button className="btn block" disabled={!ok} onClick={onSignIn}>Sign in</button>

        <div className="auth-row">
          <Link className="link-btn" to="/">&larr; Back to counter</Link>
          <span className="muted">Forgot PIN?</span>
        </div>

        <p className="auth-demo">Demo build — any staff ID and any 4-digit PIN will sign you in.</p>
      </div>
    </div>
  )
}
