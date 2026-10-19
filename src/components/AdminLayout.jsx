import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { BarChartIcon, UtensilsIcon, TagIcon } from './Icons.jsx'
import AdminLogin from '../pages/admin/Login.jsx'
import { api, getToken } from '../api/client.js'

export default function AdminLayout() {
  const [staff, setStaff] = useState(undefined)          // undefined = checking, null = signed out
  const [toast, setToast] = useState('')

  const say = useCallback((msg) => {
    setToast(msg)
    window.clearTimeout(say._t)
    say._t = window.setTimeout(() => setToast(''), 2600)
  }, [])

  useEffect(() => {
    if (!getToken('staff')) { setStaff(null); return }
    api.staff.me().then((me) => setStaff(me.role === 'admin' ? me : null)).catch(() => setStaff(null))
  }, [])

  const signOut = async () => {
    try { await api.staff.logout() } catch { /* token is cleared either way */ }
    setStaff(null)
  }

  const signedIn = Boolean(staff)

  return (
    <>
      <header className="topbar admin-bar">
        <div className="topbar-inner">
          <Link className="brand" to={signedIn ? '/admin' : '/'}>
            <img className="brand-logo" src="/logo.png" alt="Happy Bites" />
            <span className="brand-text">Happy<span className="b2">bites</span></span>
          </Link>
          <span className="portal-tag admin">Admin</span>

          {signedIn ? (
            <>
              <nav className="parent-nav admin-nav" aria-label="Admin sections">
                <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <BarChartIcon width={16} height={16} />
                  <span>Today</span>
                </NavLink>
                <NavLink to="/admin/items" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <UtensilsIcon width={16} height={16} />
                  <span>Items</span>
                </NavLink>
                <NavLink to="/admin/offers" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <TagIcon width={16} height={16} />
                  <span>Offers</span>
                </NavLink>
              </nav>
              <span className="spacer" />
              <div className="who">
                <span className="who-name">{staff.name}</span>
                <span className="who-phone">{staff.id} · Owner</span>
              </div>
              <Link className="btn ghost small" to="/">Counter</Link>
              <button className="btn ghost small" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <>
              <span className="spacer" />
              <Link className="link-btn" to="/">&larr; Counter</Link>
            </>
          )}
        </div>
      </header>

      {staff === undefined ? (
        <div className="page"><p className="empty">Loading…</p></div>
      ) : signedIn ? (
        <Outlet context={{ say, staff }} />
      ) : (
        <AdminLogin onSignIn={setStaff} />
      )}

      <footer className="foot">
        <span>Happybites admin</span>
        <span className="dot">•</span>
        <span>Menu, offers and daily counter reports</span>
      </footer>

      <div className={'toast' + (toast ? ' show' : '')}>{toast}</div>
    </>
  )
}
