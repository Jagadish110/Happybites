import { useCallback, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { UsersIcon, ClockIcon } from './Icons.jsx'
import Login from '../pages/parent/Login.jsx'
import { CHILDREN, findChildByCode } from '../data/menu.js'

const KEY = 'hb_parent_cards'

/** Everything under /parent lives here. A card's secret code is the login —
 *  entering more codes links more children to the same session. */
export default function ParentLayout() {
  const [linked, setLinked] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || '[]')
      return CHILDREN.filter((c) => saved.includes(c.id))
    } catch { return [] }
  })
  const [toast, setToast] = useState('')

  const save = (list) => {
    try { sessionStorage.setItem(KEY, JSON.stringify(list.map((c) => c.id))) } catch { /* private mode */ }
  }

  const say = useCallback((msg) => {
    setToast(msg)
    window.clearTimeout(say._t)
    say._t = window.setTimeout(() => setToast(''), 2600)
  }, [])

  const signIn = (child) => {
    const list = [child]
    setLinked(list)
    save(list)
  }

  /** Link another card by its secret code. Returns an error string, or null. */
  const linkChild = (code) => {
    const child = findChildByCode(code)
    if (!child) return 'No card found with that code.'
    if (linked.some((c) => c.id === child.id)) return `${child.name} is already linked.`
    const list = [...linked, child]
    setLinked(list)
    save(list)
    say(`${child.name} linked to your account`)
    return null
  }

  const signOut = () => {
    try { sessionStorage.removeItem(KEY) } catch { /* private mode */ }
    setLinked([])
  }

  const signedIn = linked.length > 0

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
                <span className="who-name">{linked.length} card{linked.length === 1 ? '' : 's'} linked</span>
                <span className="who-phone">{linked.map((c) => c.name.split(' ')[0]).join(', ')}</span>
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

      {signedIn
        ? <Outlet context={{ say, children: linked, linkChild }} />
        : <Login onSignIn={signIn} />}

      <footer className="foot">
        <span>Happybites parent portal</span>
        <span className="dot">•</span>
        <span>Support 9am – 6pm · help@happybites.in</span>
      </footer>

      <div className={'toast' + (toast ? ' show' : '')}>{toast}</div>
    </>
  )
}
