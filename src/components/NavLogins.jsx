import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MenuIcon, ShieldIcon, UsersIcon } from './Icons.jsx'

/** One icon in the header; it expands to the two portals. */
export default function NavLogins({ staff, onSignOut }) {
  const [open, setOpen] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!box.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="nav-menu" ref={box}>
      <button
        className={'nav-trigger' + (open ? ' open' : '')}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <MenuIcon className="nav-ico" />
      </button>

      {open && (
        <div className="nav-pop" role="menu">
          {staff && (
            <div className="nav-pop-who">
              <span>
                <strong>{staff.name}</strong>
                <span className="muted">{staff.id} · signed in at this counter</span>
              </span>
              <button className="btn ghost small" onClick={() => { setOpen(false); onSignOut() }}>Sign out</button>
            </div>
          )}

          <Link className="nav-pop-item" to="/parent" role="menuitem" onClick={() => setOpen(false)}>
            <span className="nav-pop-ico parent"><UsersIcon /></span>
            <span>
              <strong>Parent login</strong>
              <span className="muted">Wallet, top-up and limits</span>
            </span>
          </Link>

          <Link className="nav-pop-item" to="/admin" role="menuitem" onClick={() => setOpen(false)}>
            <span className="nav-pop-ico admin"><ShieldIcon /></span>
            <span>
              <strong>Admin login</strong>
              <span className="muted">Menu, offers and reports</span>
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}
