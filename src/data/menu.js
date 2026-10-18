// Happy Bites menu, taken from the printed board (Sept 2026 card).
// UI-stage data — swap for the API later; the shapes are kept simple on purpose.

export const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid' },
  { id: 'tea', name: 'Tea & Snacks', icon: 'cup' },
  { id: 'juices', name: 'Juices', icon: 'glass' },
  { id: 'snacks', name: 'Snacks', icon: 'leaf' },
  { id: 'bowls', name: 'Healthy Bowls', icon: 'bowl' },
]

export const ITEMS = [
  // ---- Tea & Snacks ----
  { id: 't1', icon: '/icons/tea.png', name: 'Tea', price: 12, cat: 'tea', type: 'veg', emoji: '🍵', featured: true, art: 'chai' },
  { id: 't2', icon: '/icons/coffee.png', name: 'Coffee', price: 15, cat: 'tea', type: 'veg', emoji: '☕', featured: true, art: 'coffee' },
  { id: 't3', icon: '/icons/boost.png', name: 'Boost', price: 15, cat: 'tea', type: 'veg', emoji: '🥛', art: 'malt', artProps: { tone: '#a9683a' } },
  { id: 't4', icon: '/icons/horlicks.png', name: 'Horlicks', price: 15, cat: 'tea', type: 'veg', emoji: '🥛', art: 'malt', artProps: { tone: '#e4b57a' } },
  { id: 't5', icon: '/icons/ragimalt.png', name: 'Ragimalt', price: 15, cat: 'tea', type: 'veg', emoji: '🥣', art: 'maltbowl' },
  { id: 't6', icon: '/icons/ginger_tea.png', name: 'Ginger Tea', price: 15, cat: 'tea', type: 'veg', emoji: '🍵', art: 'chai', artProps: { tone: '#d99a4e' } },
  { id: 't7', icon: '/icons/sukku_coffee.png', name: 'Sukku Coffee', price: 15, cat: 'tea', type: 'veg', emoji: '☕', art: 'coffee', artProps: { tone: '#4e2e18' } },
  { id: 't8', icon: '/icons/green_tea.png', name: 'Green Tea', price: 15, cat: 'tea', type: 'veg', emoji: '🍃', art: 'greentea' },
  { id: 't9', icon: '/icons/cake.png', name: 'Cake', price: 10, cat: 'tea', type: 'veg', emoji: '🍰', art: 'cake' },
  { id: 't10', icon: '/icons/veg_puff.png', name: 'Veg Puff', price: 20, cat: 'tea', type: 'veg', emoji: '🥐', featured: true, art: 'puff' },
  { id: 't11', icon: '/icons/brownie.png', name: 'Brownie', price: 100, cat: 'tea', type: 'veg', emoji: '🍫', art: 'brownie' },
  { id: 't12', icon: '/icons/veg_roll.png', name: 'Veg Roll', price: 30, cat: 'tea', type: 'veg', emoji: '🌯', art: 'roll' },
  { id: 't13', icon: '/icons/cream_bun.png', name: 'Cream Bun', price: 20, cat: 'tea', type: 'veg', emoji: '🥯', art: 'bun' },
  { id: 't14', icon: '/icons/jam_bun.png', name: 'Jam Bun', price: 20, cat: 'tea', type: 'veg', emoji: '🍞', art: 'bun', artProps: { tone: '#e8452c' } },
  { id: 't15', icon: '/icons/potato_samosa.png', name: 'Potato Samosa', price: 15, cat: 'tea', type: 'veg', emoji: '🥟', featured: true, art: 'samosa' },
  { id: 't16', icon: '/icons/mini_samosa.png', name: 'Mini Samosa', price: 30, cat: 'tea', type: 'veg', emoji: '🥟', note: '5 pieces', art: 'minisamosa' },
  { id: 't17', icon: '/icons/special_bonda.png', name: 'Special Bonda', price: 15, cat: 'tea', type: 'veg', emoji: '🧆', art: 'bonda', artProps: { tone: '#d98b3c' } },
  { id: 't18', icon: '/icons/vadai.png', name: 'Vadai', price: 10, cat: 'tea', type: 'veg', emoji: '🍩', art: 'vadai' },
  { id: 't19', icon: '/icons/bajji.png', name: 'Bajji', price: 10, cat: 'tea', type: 'veg', emoji: '🌶️', art: 'bajji' },
  { id: 't20', icon: '/icons/bonda.png', name: 'Bonda', price: 10, cat: 'tea', type: 'veg', emoji: '🧆', art: 'bonda' },
  { id: 't21', icon: '/icons/bread_bajji.png', name: 'Bread Bajji', price: 30, cat: 'tea', type: 'veg', emoji: '🍞', art: 'breadbajji' },

  // ---- Juices (half-litre mug, one price) ----
  { id: 'j1', icon: '/icons/watermelon_juice.png', name: 'Watermelon', price: 69, cat: 'juices', type: 'veg', emoji: '🍉', note: '½ ltr mug', featured: true, art: 'juice', artProps: { tone: '#f0565c' } },
  { id: 'j2', icon: '/icons/pomegranate_juice.png', name: 'Pomegranate', price: 69, cat: 'juices', type: 'veg', emoji: '🍒', note: '½ ltr mug', art: 'juice', artProps: { tone: '#c22a4a' } },
  { id: 'j3', icon: '/icons/sathukudi_juice.png', name: 'Sathukudi', price: 69, cat: 'juices', type: 'veg', emoji: '🍋', note: '½ ltr mug', art: 'juice', artProps: { tone: '#f7c948' } },
  { id: 'j4', icon: '/icons/grapes_juice.png', name: 'Grapes', price: 69, cat: 'juices', type: 'veg', emoji: '🍇', note: '½ ltr mug', art: 'juice', artProps: { tone: '#8156c7' } },
  { id: 'j5', icon: '/icons/apple_juice.png', name: 'Apple', price: 69, cat: 'juices', type: 'veg', emoji: '🍏', note: '½ ltr mug', art: 'juice', artProps: { tone: '#9ccb4a' } },
  { id: 'j6', icon: '/icons/pineapple_juice.png', name: 'Pineapple', price: 69, cat: 'juices', type: 'veg', emoji: '🍍', note: '½ ltr mug', art: 'juice', artProps: { tone: '#f5b228' } },
  { id: 'j7', icon: '/icons/musk_melon_juice.png', name: 'Musk Melon', price: 69, cat: 'juices', type: 'veg', emoji: '🍈', note: '½ ltr mug', art: 'juice', artProps: { tone: '#f58b52' } },
  { id: 'j8', icon: '/icons/papaya_juice.png', name: 'Papaya', price: 69, cat: 'juices', type: 'veg', emoji: '🍊', note: '½ ltr mug', art: 'juice', artProps: { tone: '#f4813f' } },
  { id: 'j9', icon: '/icons/mango_juice.png', name: 'Mango', price: 69, cat: 'juices', type: 'veg', emoji: '🥭', note: '½ ltr mug', art: 'juice', artProps: { tone: '#f6a623' } },
  { id: 'j10', icon: '/icons/abc_juice.png', name: 'ABC Juice', price: 69, cat: 'juices', type: 'veg', emoji: '🥤', note: 'apple, beetroot, carrot', art: 'juice', artProps: { tone: '#d8552f' } },
  { id: 'j11', icon: '/icons/carrot_juice.png', name: 'Carrot', price: 69, cat: 'juices', type: 'veg', emoji: '🥕', note: '½ ltr mug', art: 'juice', artProps: { tone: '#f07a28' } },
  { id: 'j12', icon: '/icons/lemon_juice.png', name: 'Lemon', price: 69, cat: 'juices', type: 'veg', emoji: '🍋', note: '½ ltr mug', art: 'juice', artProps: { tone: '#f4d13d' } },

  // ---- Snacks ----
  { id: 's1', icon: '/icons/smiles.png', name: 'Smiles', price: 59, cat: 'snacks', type: 'veg', emoji: '🥔', art: 'smiley' },
  { id: 's2', icon: '/icons/french_fries.png', name: 'French Fries', price: 69, cat: 'snacks', type: 'veg', emoji: '🍟', featured: true, art: 'fries' },
  { id: 's3', icon: '/icons/cheese_french_fries.png', name: 'Cheese French Fries', price: 99, cat: 'snacks', type: 'veg', emoji: '🧀', art: 'fries', artProps: { cheese: true } },
  { id: 's4', icon: '/icons/veg_mixed_nuggets.png', name: 'Veg Mixed Nuggets', price: 89, cat: 'snacks', type: 'veg', emoji: '🧆', note: '6 pieces', art: 'nuggets' },
  { id: 's5', icon: '/icons/veg_cheese_balls.png', name: 'Veg Cheese Balls', price: 99, cat: 'snacks', type: 'veg', emoji: '🧀', art: 'cheeseballs' },
  { id: 's6', icon: '/icons/veg_nuggets.png', name: 'Veg Nuggets', price: 69, cat: 'snacks', type: 'veg', emoji: '🧆', art: 'nuggets' },
  { id: 's7', icon: '/icons/veg_finger.png', name: 'Veg Finger', price: 129, cat: 'snacks', type: 'veg', emoji: '🍢', art: 'fingers' },
  { id: 's8', icon: '/icons/mixed_veg_lollipop.png', name: 'Mixed Veg Lollipop', price: 109, cat: 'snacks', type: 'veg', emoji: '🍡', art: 'lollipop' },
  { id: 's9', icon: '/icons/peri_peri_french_fry.png', name: 'Peri Peri French Fry', price: 99, cat: 'snacks', type: 'veg', emoji: '🌶️', art: 'fries', artProps: { peri: true, tone: '#b7291a' } },
  { id: 's10', icon: '/icons/bread_sandwich.png', name: 'Bread Sandwich', price: 49, cat: 'snacks', type: 'veg', emoji: '🥪', featured: true, art: 'sandwich' },
  { id: 's11', icon: '/icons/maggie.png', name: 'Maggie', price: 69, cat: 'snacks', type: 'veg', emoji: '🍜', featured: true, art: 'noodles' },

  // ---- Healthy Nutritious Bowls ----
  { id: 'b1', icon: '/icons/simple_pack.png', name: 'Simple Pack', price: 49, cat: 'bowls', type: 'veg', emoji: '🥗',
    note: '4 fruits + 1 vegetable', featured: true, art: 'bowl', artProps: { level: 1 } },
  { id: 'b2', icon: '/icons/basic_pack.png', name: 'Basic Pack', price: 99, cat: 'bowls', type: 'veg', emoji: '🥣',
    note: '4 fruits, 1 vegetable, sprouts', art: 'bowl', artProps: { level: 2 } },
  { id: 'b3', icon: '/icons/premium_pack.png', name: 'Premium Pack', price: 129, cat: 'bowls', type: 'nonveg', emoji: '🍲',
    note: '5 fruits, 1 vegetable, sprouts & nuts, 1 egg', art: 'bowl', artProps: { level: 3 } },
]

// ---------- parent portal ----------

export const PARENT = { name: 'Priya Sharma', phone: '+91 98765 43210' }

// Children linked to this parent account.
export const CHILDREN = [
  {
    id: 'HB-2024-0518',
    secretCode: 'KX7M2Q',
    name: 'Aarav Sharma',
    klass: 'Class 9-B · Roll 18',
    avatar: '🧑‍🎓',
    balance: 420,
    dailyLimit: 150,
    perOrderCap: 90,
    spentToday: 32,
    cardActive: true,
    blocked: [],
    lastSpend: 'Today · ₹32',
    transactions: [
      { id: 'a1', kind: 'out', title: 'Tea, Veg Puff', sub: 'Today · 9:12 am · Counter 2', amount: 32 },
      { id: 'a2', kind: 'in', title: 'Wallet top-up', sub: 'Yesterday · UPI · Priya', amount: 500 },
      { id: 'a3', kind: 'out', title: 'French Fries', sub: 'Yesterday · 1:05 pm · Counter 1', amount: 69 },
      { id: 'a4', kind: 'out', title: 'Potato Samosa, Tea', sub: '15 Oct · 4:30 pm · Counter 2', amount: 27 },
      { id: 'a5', kind: 'in', title: 'Wallet top-up', sub: '13 Oct · UPI · Priya', amount: 300 },
    ],
  },
  {
    id: 'HB-2024-0732',
    secretCode: 'PD4B9T',
    name: 'Ananya Sharma',
    klass: 'Class 6-A · Roll 04',
    avatar: '👧',
    balance: 60,
    dailyLimit: 120,
    perOrderCap: 70,
    spentToday: 49,
    cardActive: true,
    blocked: ['snacks'],
    lastSpend: 'Today · ₹49',
    transactions: [
      { id: 'n1', kind: 'out', title: 'Simple Pack bowl', sub: 'Today · 8:55 am · Counter 1', amount: 49 },
      { id: 'n2', kind: 'out', title: 'Watermelon juice', sub: 'Yesterday · 1:20 pm · Counter 1', amount: 69 },
      { id: 'n3', kind: 'in', title: 'Wallet top-up', sub: '14 Oct · UPI · Priya', amount: 250 },
      { id: 'n4', kind: 'out', title: 'Cake, Tea', sub: '14 Oct · 9:02 am · Counter 2', amount: 22 },
    ],
  },
]

export const TOPUP_PRESETS = [200, 500, 1000, 1500, 2000, 3000]
export const LIMIT_PRESETS = [80, 100, 120, 150, 200, 250]

export const getChild = (id) => CHILDREN.find((c) => c.id === id) || CHILDREN[0]

/** A scanned card may carry the student ID or the secret code on its back. */
export const findChildByCard = (value) => {
  const v = String(value).trim().toLowerCase()
  return CHILDREN.find(
    (c) => c.id.toLowerCase() === v || c.secretCode.toLowerCase() === v
  )
}

export const findChildByCode = (code) =>
  CHILDREN.find((c) => c.secretCode.toLowerCase() === String(code).trim().toLowerCase())

// ---------- admin / counter ----------

export const STAFF = { name: 'Lakshmi R.', staffId: 'CNT-01', counter: 'Counter 1' }

export const COUNTER_TODAY = {
  orders: 184,
  revenue: 9240,
  itemsSold: 412,
  avgOrder: 50,
  target: 12000,
  bestDay: 'Wednesday',
}

// itemId -> units sold today
export const TOP_SELLERS = [
  { id: 't1', icon: '/icons/tea.png', sold: 96, art: 'chai' },
  { id: 's2', icon: '/icons/french_fries.png', sold: 71, art: 'fries' },
  { id: 't10', icon: '/icons/veg_puff.png', sold: 64, art: 'puff' },
  { id: 'j1', icon: '/icons/watermelon_juice.png', sold: 48, art: 'juice', artProps: { tone: '#f0565c' } },
  { id: 's11', icon: '/icons/maggie.png', sold: 42, art: 'noodles' },
  { id: 'b1', icon: '/icons/simple_pack.png', sold: 35, art: 'bowl', artProps: { level: 1 } },
]

export const OFFERS = [
  {
    id: 'o1', title: 'Tea time combo', detail: 'Tea + Veg Puff',
    price: 28, was: 32, cat: 'tea', active: true, emoji: '🍵', art: 'chai', icon: '/icons/tea.png',
  },
  {
    id: 'o2', title: 'Fries & juice', detail: 'French Fries + any juice',
    price: 125, was: 138, cat: 'snacks', active: true, emoji: '🍟', art: 'fries', icon: '/icons/french_fries.png',
  },
  {
    id: 'o3', title: 'Healthy start', detail: 'Simple Pack bowl + Green Tea',
    price: 55, was: 64, cat: 'bowls', active: false, emoji: '🥗', art: 'bowl', icon: '/icons/simple_pack.png',
  },
]

export const getItem = (id) => ITEMS.find((i) => i.id === id)

// Sales trend for the admin dashboard. Each view is a plain list of bars.
export const TRENDS = {
  daily: {
    label: 'Last 7 days',
    note: 'Best day Wednesday',
    unit: 'day',
    bars: [
      { label: 'Fri', v: 8120 }, { label: 'Sat', v: 4240 }, { label: 'Sun', v: 2160 },
      { label: 'Mon', v: 9860 }, { label: 'Tue', v: 9450 }, { label: 'Wed', v: 11320 },
      { label: 'Today', v: 9240, now: true },
    ],
  },
  weekly: {
    label: 'Last 6 weeks',
    note: 'Up 12% on last week',
    unit: 'week',
    bars: [
      { label: 'W36', v: 41200 }, { label: 'W37', v: 44600 }, { label: 'W38', v: 38900 },
      { label: 'W39', v: 49250 }, { label: 'W40', v: 47800 }, { label: 'This week', v: 53600, now: true },
    ],
  },
  monthly: {
    label: 'Last 6 months',
    note: 'October tracking ahead of September',
    unit: 'month',
    bars: [
      { label: 'May', v: 148000 }, { label: 'Jun', v: 102400 }, { label: 'Jul', v: 162300 },
      { label: 'Aug', v: 178900 }, { label: 'Sep', v: 169200 }, { label: 'Oct', v: 128400, now: true },
    ],
  },
}

// Everything the canteen has taken since it opened.
export const LIFETIME = {
  since: '12 June 2023',
  total: 5468300,
  orders: 126840,
  students: 1240,
  thisYear: 1664200,
  bestMonth: { label: 'August 2026', v: 178900 },
}
