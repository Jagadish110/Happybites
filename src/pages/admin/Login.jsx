import { Link } from 'react-router-dom'
import { ShieldIcon } from '../../components/Icons.jsx'
import StaffSignInForm from '../../components/StaffSignInForm.jsx'

/** Owner sign-in. The server checks the PIN; counter staff cannot get in here. */
export default function AdminLogin({ onSignIn }) {
  return (
    <div className="page auth-page">
      <div className="auth-card">
        <span className="auth-ico"><ShieldIcon /></span>
        <h1 className="auth-title">Admin sign in</h1>
        <p className="auth-sub">
          Manage the menu, run offers, and watch today&rsquo;s counter progress.
        </p>

        <StaffSignInForm role="admin" onSignedIn={onSignIn} />

        <div className="auth-row">
          <Link className="link-btn" to="/">&larr; Back to counter</Link>
          <span className="muted">Forgot PIN? Ask the owner.</span>
        </div>
      </div>
    </div>
  )
}
