import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

/**
 * Staff ID + PIN, checked by the server. Used by the admin page and by the
 * counter when someone tries to charge a card before signing in.
 * `role="admin"` refuses counter staff, so the owner reports stay owner-only.
 */
export default function StaffSignInForm({ role, onSignedIn, autoFocus = true }) {
  const [staffId, setStaffId] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [demo, setDemo] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    api.meta().then((m) => { setDemo(m.demo); setOpen(m.openAccess) }).catch(() => {})
  }, [])

  // Testing mode: anything typed opens it, so the button is never blocked.
  const ready = open || (staffId.trim().length >= 2 && pin.length >= 4)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const staff = await api.staff.login(staffId.trim(), pin)
      if (role && staff.role !== role) {
        await api.staff.logout()
        setError('This area is for the owner. Use the admin sign-in.')
      } else {
        onSignedIn(staff)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <label className="field">
        <span>Staff ID</span>
        <input
          type="text" placeholder={role === 'admin' ? 'ADMIN' : 'CNT-01'} autoFocus={autoFocus}
          autoComplete="username" value={staffId} onChange={(e) => { setStaffId(e.target.value); setError('') }}
        />
      </label>

      <label className="field">
        <span>PIN</span>
        <input
          className="otp-input" type="password" inputMode="numeric" maxLength={8}
          placeholder="••••" autoComplete="current-password"
          value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError('') }}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button className="btn block" type="submit" disabled={!ready || busy}>
        {busy ? 'Checking…' : 'Sign in'}
      </button>

      {open ? (
        <p className="auth-demo">Test mode: type anything, or nothing, and it opens.</p>
      ) : demo && (
        <p className="auth-demo">
          Demo PINs — counter <strong>CNT-01 / 1234</strong> · owner <strong>ADMIN / 4321</strong>
        </p>
      )}
    </form>
  )
}
