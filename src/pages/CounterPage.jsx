import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MenuSection from '../components/MenuSection.jsx'
import OrderModal from '../components/OrderModal.jsx'
import CardScanner from '../components/CardScanner.jsx'
import NavLogins from '../components/NavLogins.jsx'
import OfferSection from '../components/OfferSection.jsx'
import { CategoryIcon, CloseIcon, SearchIcon } from '../components/Icons.jsx'
import { CATEGORIES, findChildByCard } from '../data/menu.js'
import { useMenu } from '../store/MenuStore.jsx'

/** Canteen counter. Staff build an order with + / −, then charge the card. */
export default function CounterPage() {
  const { items, liveOffers } = useMenu()
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const [order, setOrder] = useState({})
  const [orderOpen, setOrderOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [toast, setToast] = useState('')

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

  // charging starts with a card scan; the camera reads the student's QR
  const charge = () => {
    setOrderOpen(false)
    setScanning(true)
  }

  const onScanned = (value) => {
    setScanning(false)
    const child = findChildByCard(value)

    if (!child) {
      say(`Card ${value} is not registered — try again`)
      return
    }
    if (child.balance < total) {
      say(`${child.name} has only ₹${child.balance} — ₹${total - child.balance} short`)
      return
    }

    say(`₹${total} charged to ${child.name} · balance ₹${child.balance - total}`)
    setOrder({})
  }

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

          <NavLogins />
        </div>
      </header>

      <div className="page counter-page">
        {term ? (
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

      <div className={'toast' + (toast ? ' show' : '')}>{toast}</div>
    </>
  )
}
