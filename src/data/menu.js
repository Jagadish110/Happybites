// Fixed lists the screens share. The menu itself (dishes, prices, offers) lives on the
// server; see server/menu-seed.json for the starting menu.

export const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid' },
  { id: 'tea', name: 'Tea & Snacks', icon: 'cup' },
  { id: 'juices', name: 'Juices', icon: 'glass' },
  { id: 'snacks', name: 'Snacks', icon: 'leaf' },
  { id: 'bowls', name: 'Healthy Bowls', icon: 'bowl' },
]

// ---------- parent top-up and limit presets ----------

export const TOPUP_PRESETS = [200, 500, 1000, 1500, 2000, 3000]
export const LIMIT_PRESETS = [80, 100, 120, 150, 200, 250]
