import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CardIcon } from '../../components/Icons.jsx'
import { api } from '../../api/client.js'

/** Sign in with the secret code printed on the back of the student's canteen
 *  card. The code resolves to the student ID held against the account. */
export default function Login({ onSignIn }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [demo, setDemo] = useState(false)

  useEffect(() => { api.meta().then((m) => setDemo(m.demo)).catch(() => {}) }, [])

  const clean = code.trim().toUpperCase()
  const ready = clean.length >= 6

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const problem = await onSignIn(clean)
    setBusy(false)
    if (problem) setError(problem)
  }

  return (
    <div className="page auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="auth-ico"><CardIcon /></span>
        <h1 className="auth-title">Enter card code</h1>
        <p className="auth-sub">
          Type the secret code printed on the back of your child&rsquo;s canteen card.
          We&rsquo;ll pull up their wallet and order history.
        </p>

        <div className="card-back" aria-hidden="true">
          <span className="card-back-label">Back of card</span>
          <span className="card-back-code">XXXXXX</span>
          <span className="card-back-hint">6-character secret code</span>
        </div>

        <label className="field">
          <span>Secret code</span>
          <input
            className="code-input" type="text" maxLength={8} placeholder="KX7M2Q" autoFocus
            value={code}
            onChange={(e) => { setCode(e.target.value); setError('') }}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="btn block" type="submit" disabled={!ready || busy}>
          {busy ? 'Checking…' : 'Find my child'}
        </button>

        <div className="auth-row">
          <Link className="link-btn" to="/">&larr; Canteen counter</Link>
          <span className="muted">Lost the card? Ask the canteen.</span>
        </div>

        {demo && (
          <p className="auth-demo">Demo codes — <strong>KX7M2Q</strong> (Aarav) · <strong>PD4B9T</strong> (Ananya)</p>
        )}
      </form>
    </div>
  )
}
