import { useEffect } from 'react'
import { CloseIcon } from './Icons.jsx'
import StaffSignInForm from './StaffSignInForm.jsx'

/** Shown when someone taps "Scan card & charge" before a staff member has signed in. */
export function StaffSignInDialog({ open, onClose, onSignedIn }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label="Counter sign in">
      <div className="modal-scrim" onClick={onClose} />
      <div className="order-modal sign-modal">
        <div className="modal-head">
          <h2>Counter sign in</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>
        <div className="modal-body">
          <p className="muted" style={{ marginBottom: 14 }}>
            Sign in with your staff ID to take payment from a student card.
          </p>
          <StaffSignInForm onSignedIn={onSignedIn} />
        </div>
      </div>
    </div>
  )
}

/**
 * The outcome of a charge, big enough to read across a counter.
 * state: { status: 'busy' | 'ok' | 'fail', title, detail }
 */
export function ChargeResult({ state, onClose }) {
  useEffect(() => {
    if (state?.status !== 'ok') return undefined
    const t = window.setTimeout(onClose, 6000)
    return () => window.clearTimeout(t)
  }, [state, onClose])

  if (!state) return null
  return (
    <div className="modal-wrap" role="alertdialog" aria-modal="true" aria-label="Payment result">
      <div className="modal-scrim" />
      <div className={'order-modal result-modal ' + state.status}>
        <div className="result-mark" aria-hidden="true">
          {state.status === 'busy' ? '…' : state.status === 'ok' ? '✓' : '!'}
        </div>
        <h2>{state.title}</h2>
        {state.detail && <p>{state.detail}</p>}
        {state.status !== 'busy' && (
          <button className="btn block" onClick={onClose} autoFocus>
            {state.status === 'ok' ? 'Done' : 'Close'}
          </button>
        )}
      </div>
    </div>
  )
}
