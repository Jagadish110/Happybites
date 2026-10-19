// Thin wrapper over fetch for the Happybites server. Money and sign-in live on
// the server; the browser only holds a session token per role.

const KEYS = { parent: 'hb_parent_token', staff: 'hb_staff_token' }

export const getToken = (kind) => {
  try { return sessionStorage.getItem(KEYS[kind]) } catch { return null }
}
export const setToken = (kind, token) => {
  try { sessionStorage.setItem(KEYS[kind], token) } catch { /* private mode */ }
}
export const clearToken = (kind) => {
  try { sessionStorage.removeItem(KEYS[kind]) } catch { /* private mode */ }
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || 'Something went wrong')
    this.status = status
    this.code = body?.error || 'error'
    this.data = body || {}
  }
}

async function request(path, { method = 'GET', body, as } = {}) {
  const headers = {}
  if (body !== undefined) headers['content-type'] = 'application/json'
  const token = as ? getToken(as) : null
  if (token) headers.authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, { error: 'network', message: 'Cannot reach the server. Check the connection and try again.' })
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && as) clearToken(as)     // session ended: next screen asks to sign in again
    throw new ApiError(res.status, data)
  }
  return data
}

export const api = {
  meta: () => request('/meta'),

  parent: {
    async login(code) {
      const out = await request('/parent/login', { method: 'POST', body: { code } })
      setToken('parent', out.token)
      return out.students
    },
    async link(code) {
      return (await request('/parent/link', { method: 'POST', body: { code }, as: 'parent' })).student
    },
    async students() {
      return (await request('/parent/students', { as: 'parent' })).students
    },
    async logout() {
      try { await request('/parent/logout', { method: 'POST', as: 'parent' }) } finally { clearToken('parent') }
    },
    async setLimits(id, body) {
      return (await request(`/parent/students/${id}/limits`, { method: 'PUT', body, as: 'parent' })).student
    },
    async setCard(id, active) {
      return (await request(`/parent/students/${id}/card`, { method: 'PUT', body: { active }, as: 'parent' })).student
    },
    topupOrder: (studentId, amount) =>
      request('/parent/topup/order', { method: 'POST', body: { studentId, amount }, as: 'parent' }),
    topupVerify: (payload) =>
      request('/parent/topup/verify', { method: 'POST', body: payload, as: 'parent' }),
  },

  staff: {
    async login(staffId, pin) {
      const out = await request('/staff/login', { method: 'POST', body: { staffId, pin } })
      setToken('staff', out.token)
      return out.staff
    },
    async me() {
      return (await request('/staff/me', { as: 'staff' })).staff
    },
    async logout() {
      try { await request('/staff/logout', { method: 'POST', as: 'staff' }) } finally { clearToken('staff') }
    },
  },

  menu: () => request('/menu'),

  admin: {
    async createItem(fields) {
      return (await request('/admin/items', { method: 'POST', body: fields, as: 'staff' })).item
    },
    async updateItem(id, fields) {
      return (await request(`/admin/items/${id}`, { method: 'PUT', body: fields, as: 'staff' })).item
    },
    async setAvailable(id, available) {
      return (await request(`/admin/items/${id}/available`, { method: 'PUT', body: { available }, as: 'staff' })).item
    },
    async createOffer(fields) {
      return (await request('/admin/offers', { method: 'POST', body: fields, as: 'staff' })).offer
    },
    async setOfferActive(id, active) {
      return (await request(`/admin/offers/${id}/active`, { method: 'PUT', body: { active }, as: 'staff' })).offer
    },
  },

  charge: (payload) => request('/charge', { method: 'POST', body: payload, as: 'staff' }),
  adminSummary: () => request('/admin/summary', { as: 'staff' }),
}
