import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { UsersIcon, ClockIcon } from './Icons.jsx'
import Login from '../pages/parent/Login.jsx'
import { api, getToken } from '../api/client.js'

/** Everything under /parent lives here. A card's secret code is the login and
 *  the server holds the wallets; entering more codes links more children. */
export default function ParentLayout() {
  const [students, setStudents] = useState(null)               // null = still checking the session
  const [toast, setToast] = useState('')

  const say = useCallback((msg) => {
    setToast(msg)
    window.clearTimeout(say._t)
    say._t = window.setTimeout(() => setToast(''), 3200)
  }, [])

  useEffect(() => {
    if (!getToken('parent')) { setStudents([]); return }
    api.parent.students().then(setStudents).catch(() => setStudents([]))
  }, [])

  /** Swap one student in the list for their fresh copy from the server. */
  const update = useCallback((fresh) => {
    setStudents((list) => (list || []).map((s) => (s.id === fresh.id ? fresh : s)))
  }, [])

  const refresh = useCallback(async () => {
    try { setStudents(await api.parent.students()) } catch { /* keep what we have */ }
  }, [])

  /** Returns an error message, or null on success. */
  const signIn = async (code) => {
    try {
      setStudents(await api.parent.login(code))
      return null
    } catch (err) {
      return err.message
    }
  }

  const linkChild = async (code) => {
    try {
      const child = await api.parent.link(code)
      setStudents((list) => [...(list || []), child])
      say(`${child.name} linked to your account`)
      return null
    } catch (err) {
      return err.message
    }
  }

  const signOut = async () => {
    try { await api.parent.logout() } catch { /* the token is cleared either way */ }
    setStudents([])
  }

  const signedIn = Boolean(students && students.length)

  return (
    <>
      <header className="topbar parent-bar">
        <div className="topbar-inner">
          <Link className="brand" to={signedIn ? '/parent' : '/'}>
            <img className="brand-logo" src="/logo.png" alt="Happy Bites" />
            <span className="brand-text">Happy<span className="b2">bites</span></span>
          </Link>
          <span className="portal-tag">Parent portal</span>

          {signedIn ? (
            <>
              <nav className="parent-nav" aria-label="Parent sections">
                <NavLink to="/parent" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <UsersIcon width={16} height={16} />
                  <span>Children</span>
                </NavLink>
                <NavLink to="/parent/activity" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <ClockIcon width={16} height={16} />
                  <span>Activity</span>
                </NavLink>
              </nav>
              <span className="spacer" />
              <div className="who">
                <span className="who-name">{students.length} card{students.length === 1 ? '' : 's'} linked</span>
                <span className="who-phone">{students.map((c) => c.name.split(' ')[0]).join(', ')}</span>
              </div>
              <button className="btn ghost small" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <>
              <span className="spacer" />
              <Link className="link-btn" to="/">&larr; Canteen counter</Link>
            </>
          )}
        </div>
      </header>

      {students === null ? (
        <div className="page"><p className="empty">Loading…</p></div>
      ) : signedIn ? (
        <Outlet context={{ say, children: students, linkChild, update, refresh }} />
      ) : (
        <Login onSignIn={signIn} />
      )}

      <footer className="foot">
        <span>Happybites parent portal</span>
        <span className="dot">•</span>
        <span>Support 9am – 6pm · help@happybites.in</span>
      </footer>

      <div className={'toast' + (toast ? ' show' : '')}>{toast}</div>
    </>
  )
}
