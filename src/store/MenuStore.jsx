import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ITEMS, OFFERS } from '../data/menu.js'

/**
 * One source of truth for the menu and the offers, shared by the admin portal
 * and the counter. Saved to localStorage so a refresh keeps what admin changed.
 * Swap the two setters for API calls when the backend lands.
 */
const KEY = 'hb_menu_v7'   // bump whenever the shipped menu data changes shape
const MenuContext = createContext(null)

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (saved?.items?.length && saved?.offers) return saved
  } catch { /* storage blocked or corrupt */ }
  return { items: ITEMS, offers: OFFERS }
}

export function MenuProvider({ children }) {
  const [{ items, offers }, setState] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ items, offers })) } catch { /* quota or private mode */ }
  }, [items, offers])

  const value = useMemo(() => ({
    items,
    offers,
    liveOffers: offers.filter((o) => o.active),

    addItem: (item) =>
      setState((s) => ({ ...s, items: [{ ...item, id: 'item-' + Date.now() }, ...s.items] })),

    /** Change a dish in place — name, price, category, photo… */
    updateItem: (id, patch) =>
      setState((s) => ({
        ...s,
        items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      })),

    toggleItem: (id) =>
      setState((s) => ({
        ...s,
        items: s.items.map((i) => (i.id === id ? { ...i, soldOut: !i.soldOut } : i)),
      })),

    addOffer: (offer) =>
      setState((s) => ({ ...s, offers: [{ ...offer, id: 'offer-' + Date.now() }, ...s.offers] })),

    toggleOffer: (id) =>
      setState((s) => ({
        ...s,
        offers: s.offers.map((o) => (o.id === id ? { ...o, active: !o.active } : o)),
      })),

    reset: () => setState({ items: ITEMS, offers: OFFERS }),
  }), [items, offers])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('useMenu must be used inside <MenuProvider>')
  return ctx
}
