import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MenuSection from '../components/MenuSection.jsx'
import OrderModal from '../components/OrderModal.jsx'
import CardScanner from '../components/CardScanner.jsx'
import NavLogins from '../components/NavLogins.jsx'
import OfferSection from '../components/OfferSection.jsx'
import { CategoryIcon, CloseIcon, SearchIcon } from '../components/Icons.jsx'
import { CATEGORIES } from '../data/menu.js'
import { ChargeResult, StaffSignInDialog } from '../components/ChargeDialogs.jsx'
import { api, getToken } from '../api/client.js'
import { useMenu } from '../store/MenuStore.jsx'

/** Canteen counter. Staff build an order with + / −, then charge the card. */
export default function CounterPage() {
  const { items, liveOffers, ready, error: menuError, reload } = useMenu()
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const [order, setOrder] = useState({})
  const [orderOpen, setOrderOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [staff, setStaff] = useState(null)
  const [result, setResult] = useState(null)
  const attemptKey = useRef('')
  const [toast, setToast] = useState('')

  // pick up a staff session that is already open in this tab
  useEffect(() => {
    if (getToken('staff')) api.staff.me().then(setStaff).catch(() => setStaff(null))
  }, [])

  const say = (msg) => {
    setToast(msg)
    window.clearTimeout(say._t)
    say._t = window.setTimeout(() => setToast(''), 2600)
  }

  // Picks are stored per card slot ("section|itemId") so tapping a dish in one
  // section never lights up the same dish somewhere else on the board.
  const add = (item, slot) =>
    setOrder((o) => ({ ...o, [slot]: { item, slot, qty: (o[slot]?.qty || 0) + 1 } }))

  const remove = (item, slot) =>
    setOrder((o) => {
      const qty = (o[slot]?.qty || 0) - 1
      if (qty <= 0) {
        const { [slot]: _gone, ...rest } = o
        return rest
      }
      return { ...o, [slot]: { item, slot, qty } }
    })

  // The bill still shows one line per dish, however many cards it came from.
  const lines = useMemo(() => {
    const byDish = new Map()
    for (const pick of Object.values(order)) {
      const line = byDish.get(pick.item.id) || { item: pick.item, qty: 0, slots: [] }
      line.qty += pick.qty
      line.slots.push(pick.slot)
      byDish.set(pick.item.id, line)
    }
    return [...byDish.values()]
  }, [order])

  const addLine = (line) => add(line.item, line.slots[line.slots.length - 1])
  const removeLine = (line) => remove(line.item, line.slots[line.slots.length - 1])

  const count = lines.reduce((n, l) => n + l.qty, 0)
  const total = lines.reduce((n, l) => n + l.qty * l.item.price, 0)

  // The menu can change while an order is being built (the owner edits a price, a dish
  // sells out). Re-price the basket from the latest menu and drop what is no longer sold.
  useEffect(() => {
    if (!ready) return
    setOrder((o) => {
      let changed = false
      const next = {}
      for (const [slot, pick] of Object.entries(o)) {
        const id = pick.item.id
        const fresh = pick.item.isOffer
          ? liveOffers.find((x) => x.id === id)
          : items.find((x) => x.id === id)
        if (!fresh || fresh.soldOut) { changed = true; continue }

        const name = pick.item.isOffer ? fresh.title : fresh.name
        if (fresh.price !== pick.item.price || name !== pick.item.name) {
          changed = true
          next[slot] = { ...pick, item: { ...pick.item, name, price: fresh.price, cat: fresh.cat } }
        } else {
          next[slot] = pick
        }
      }
      return changed ? next : o
    })
  }, [items, liveOffers, ready])

  // Charging starts by proving who is at the till, then scanning the student's card.
  // One id per order attempt, so a retry after a dropped connection cannot charge twice.
  const charge = () => {
    setOrderOpen(false)
    if (!attemptKey.current) attemptKey.current = crypto.randomUUID()
    if (getToken('staff')) setScanning(true)
    else setSigningIn(true)
  }

  const onScanned = useCallback(async (cardId) => {
    setScanning(false)
    setResult({ status: 'busy', title: 'Charging…', detail: 'Checking the card' })

    try {
      const out = await api.charge({
        cardId,
        total,
        idempotencyKey: attemptKey.current,
        items: lines.map(({ item, qty }) => ({ id: String(item.id), qty, offer: Boolean(item.isOffer) })),
      })
      attemptKey.current = ''
      setOrder({})
      setResult({
        status: 'ok',
        title: `₹${out.total} charged`,
        detail: `${out.student.name} · balance now ₹${out.student.balance}`,
      })
    } catch (err) {
      if (err.status === 401) {
        setResult(null)
        setStaff(null)
        setSigningIn(true)                       // the shift session ended; sign in and carry on
        return
      }
      if (err.code === 'price_changed' || err.code === 'item_unavailable') {
        attemptKey.current = ''
        reload()                                   // pull the latest prices; the basket re-prices itself
      }
      const unsure = err.code === 'network'
      setResult({
        status: 'fail',
        title: unsure ? 'Could not confirm the charge' : 'Not charged',
        detail: unsure
          ? 'Scan the same card again to retry. It will not be charged twice.'
          : err.message,
      })
    }
  }, [lines, total, reload])

  // a different basket is a different payment
  useEffect(() => { attemptKey.current = '' }, [total, count])

  // "/" puts the cursor in the search box, so staff never reach for the mouse
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && query) setQuery('')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [query])

  const term = query.trim().toLowerCase()
  const matches = useMemo(() => {
    if (!term) return []
    const label = (i) => CATEGORIES.find((c) => c.id === i.cat)?.name || ''
    return items.filter((i) =>
      [i.name, i.note || '', label(i)].join(' ').toLowerCase().includes(term)
    )
  }, [items, term])

  const byCat = (c) => items.filter((i) => i.cat === c)
  const featured = items.filter((i) => i.featured)
  const showAll = cat === 'all'
  const show = (c) => showAll || cat === c

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/">
            <img className="brand-logo" src="/logo.png" alt="Happy Bites" />
            <span className="brand-text">Happy<span className="b2">bites</span></span>
          </Link>

          <nav className="tabs" aria-label="Menu categories" style={{ margin: '0 auto' }}>
            {CATEGORIES.map((c, i) => (
              <span key={c.id} style={{ display: 'contents' }}>
                {i > 0 && <span className="tab-sep" />}
                <button
                  className={'tab' + (cat === c.id ? ' active' : '')}
                  onClick={() => setCat(c.id)}
                  aria-pressed={cat === c.id}
                >
                  <CategoryIcon icon={c.icon} />
                  {c.name}
                </button>
              </span>
            ))}
          </nav>

          <div className="search">
            <SearchIcon className="search-ico" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a dish…  (press /)"
              aria-label="Search the menu"
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                <CloseIcon />
              </button>
            )}
          </div>

          <NavLogins staff={staff} onSignOut={async () => { await api.staff.logout().catch(() => {}); setStaff(null) }} />
        </div>
      </header>

      <div className="page counter-page">
        {!ready ? (
          <div className="empty">
            {menuError ? (
              <>
                <p>Could not load the menu.<br /><span className="muted">{menuError}</span></p>
                <button className="btn" onClick={reload}>Try again</button>
              </>
            ) : 'Loading the menu…'}
          </div>
        ) : term ? (
          matches.length ? (
            <MenuSection
              id="search" title="Results" accent={`for “${query.trim()}”`}
              script={`${matches.length} dish${matches.length === 1 ? '' : 'es'}`}
              tone="plain" items={matches} order={order} onAdd={add} onRemove={remove}
            />
          ) : (
            <p className="empty">
              Nothing matches “{query.trim()}”.<br />
              <span className="muted">Try a shorter word, like “tea” or “rice”.</span>
            </p>
          )
        ) : (
        <>
        <OfferSection
          offers={cat === 'all' ? liveOffers : liveOffers.filter((o) => o.cat === cat)}
          order={order} onAdd={add} onRemove={remove}
        />

        {showAll && (
          <MenuSection id="quick" title="Quick" accent="Picks" script="most ordered" tone="plain"
            items={featured} order={order} onAdd={add} onRemove={remove} />
        )}
        {show('tea') && (
          <MenuSection id="tea" title="Tea &" accent="Snacks" script="hot &amp; fresh" icon="cup" tone="warm"
            items={byCat('tea')} order={order} onAdd={add} onRemove={remove} />
        )}
        {show('juices') && (
          <MenuSection id="juices" title="Juices" script="half litre mugs" icon="glass" tone="fresh"
            items={byCat('juices')} order={order} onAdd={add} onRemove={remove} />
        )}
        {show('snacks') && (
          <MenuSection id="snacks" title="Snacks" script="crispy &amp; hot" icon="leaf" tone="warm"
            items={byCat('snacks')} order={order} onAdd={add} onRemove={remove} />
        )}
        {show('bowls') && (
          <MenuSection id="bowls" title="Healthy" accent="Bowls" script="nutritious" icon="bowl" tone="fresh"
            items={byCat('bowls')} order={order} onAdd={add} onRemove={remove} />
        )}
        </>
        )}
      </div>

      <OrderModal
        lines={lines} total={total} count={count}
        open={orderOpen} onOpen={() => setOrderOpen(true)} onClose={() => setOrderOpen(false)}
        onAdd={addLine} onRemove={removeLine}
        onClear={() => setOrder({})} onCharge={charge}
      />

      <CardScanner
        open={scanning}
        amount={total}
        onClose={() => setScanning(false)}
        onScan={onScanned}
      />

      <StaffSignInDialog
        open={signingIn}
        onClose={() => setSigningIn(false)}
        onSignedIn={(me) => { setStaff(me); setSigningIn(false); if (lines.length) setScanning(true) }}
      />

      <ChargeResult state={result} onClose={() => setResult(null)} />

      <div className={'toast' + (toast ? ' show' : '')}>{toast}</div>
    </>
  )
}
