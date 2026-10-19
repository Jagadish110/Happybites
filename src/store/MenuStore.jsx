import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api/client.js'

/**
 * The menu, prices and offers live on the server, so every counter and the admin
 * portal see the same thing. This store loads them, keeps them fresh (every 30 s
 * and whenever the tab regains focus), and wraps the owner's edits.
 */
const MenuContext = createContext(null)
const REFRESH_MS = 30000

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState({ items: [], offers: [] })
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const last = useRef('')

  const reload = useCallback(async () => {
    try {
      const fresh = await api.menu()
      const key = JSON.stringify(fresh)
      if (key !== last.current) {            // avoid re-rendering the whole board when nothing changed
        last.current = key
        setMenu(fresh)
      }
      setReady(true)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    reload()
    const timer = window.setInterval(reload, REFRESH_MS)
    window.addEventListener('focus', reload)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', reload)
    }
  }, [reload])

  const value = useMemo(() => {
    const { items, offers } = menu
    const putItem = (item) => setMenu((m) => ({ ...m, items: m.items.map((i) => (i.id === item.id ? item : i)) }))
    const putOffer = (offer) => setMenu((m) => ({ ...m, offers: m.offers.map((o) => (o.id === offer.id ? offer : o)) }))

    // Edits return the saved copy from the server and throw an ApiError if it refuses.
    return {
      items,
      offers,
      liveOffers: offers.filter((o) => o.active),
      ready,
      error,
      reload,

      addItem: async (fields) => {
        const item = await api.admin.createItem(fields)
        setMenu((m) => ({ ...m, items: [item, ...m.items] }))
        return item
      },
      updateItem: async (id, patch) => {
        const item = await api.admin.updateItem(id, patch)
        putItem(item)
        return item
      },
      toggleItem: async (item) => {
        const saved = await api.admin.setAvailable(item.id, !!item.soldOut)   // sold out -> available, and back
        putItem(saved)
        return saved
      },
      addOffer: async (fields) => {
        const offer = await api.admin.createOffer(fields)
        setMenu((m) => ({ ...m, offers: [offer, ...m.offers] }))
        return offer
      },
      toggleOffer: async (offer) => {
        const saved = await api.admin.setOfferActive(offer.id, !offer.active)
        putOffer(saved)
        return saved
      },
    }
  }, [menu, ready, error, reload])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('useMenu must be used inside <MenuProvider>')
  return ctx
}
