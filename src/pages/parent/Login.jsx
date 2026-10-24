import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CardIcon } from '../../components/Icons.jsx'
import { CHILDREN, findChildByCode } from '../../data/menu.js'

/** Sign in with the secret code printed on the back of the student's canteen
 *  card. The code resolves to the student ID held against the account. */
export default function Login({ onSignIn }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const clean = code.trim().toUpperCase()
  const submit = (e) => {
    e.preventDefault()
    // preview build: a real code opens that child, anything else opens the first one
    onSignIn(findChildByCode(clean) || CHILDREN[0])
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

        <button className="btn block" type="submit">Find my child</button>

        <div className="auth-row">
          <Link className="link-btn" to="/">&larr; Canteen counter</Link>
          <span className="muted">Lost the card? Ask the canteen.</span>
        </div>

        <p className="auth-demo">Preview build: any code opens. Try <strong>KX7M2Q</strong> (Aarav) · <strong>PD4B9T</strong> (Ananya)</p>
      </form>
    </div>
  )
}
