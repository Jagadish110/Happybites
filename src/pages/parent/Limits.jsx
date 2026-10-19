import { useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { CATEGORIES, LIMIT_PRESETS } from '../../data/menu.js'
import { api } from '../../api/client.js'
import { CategoryIcon } from '../../components/Icons.jsx'

export default function Limits() {
  const { id } = useParams()
  const { say, children, update } = useOutletContext()
  const kid = children.find((c) => c.id === id) || children[0]

  const [daily, setDaily] = useState(kid.dailyLimit)
  const [cap, setCap] = useState(kid.perOrderCap)
  const [blocked, setBlocked] = useState(kid.blocked)

  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const fresh = await api.parent.setLimits(kid.id, { dailyLimit: daily, perOrderCap: cap, blocked })
      update(fresh)
      say(`Limits saved for ${kid.name}. The counter follows them straight away.`)
    } catch (err) {
      say(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = (catId) =>
    setBlocked((b) => (b.includes(catId) ? b.filter((x) => x !== catId) : [...b, catId]))

  const cats = CATEGORIES.filter((c) => c.id !== 'all')

  return (
    <div className="page page-narrow">
      <Link className="link-btn back" to={`/parent/${kid.id}`}>&larr; {kid.name}</Link>
      <h1 className="page-title">Spending limits</h1>
      <p className="page-sub">The counter enforces these rules when {kid.name}&rsquo;s card is tapped.</p>

      <div className="panel">
        <div className="panel-head">
          <h2>Daily limit</h2>
          <span className="pill">₹{daily} / day</span>
        </div>
        <div className="amount-grid">
          {LIMIT_PRESETS.map((a) => (
            <button key={a} className={'amount-opt' + (daily === a ? ' active' : '')}
                    onClick={() => setDaily(a)}>
              ₹{a}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Per order cap</h2>
          <span className="pill">₹{cap} / order</span>
        </div>
        <input
          className="range" type="range" min="20" max="200" step="10"
          value={cap} onChange={(e) => setCap(Number(e.target.value))}
        />
        <div className="range-ends"><span>₹20</span><span>₹200</span></div>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Allowed food categories</h2></div>
        {cats.map((c) => {
          const on = !blocked.includes(c.id)
          return (
            <label className="toggle-row" key={c.id}>
              <input type="checkbox" checked={on} onChange={() => toggle(c.id)} />
              <span className="switch" aria-hidden="true" />
              <span className="cat-toggle-meta">
                <span className="cat-toggle-ico"><CategoryIcon icon={c.icon} width={18} height={18} /></span>
                <span>
                  <strong>{c.name}</strong>
                  <span className="muted"> — {on ? 'allowed' : 'blocked'}</span>
                </span>
              </span>
            </label>
          )
        })}
      </div>

      <button className="btn block" disabled={saving} onClick={save}>
        {saving ? 'Saving…' : 'Save limits'}
      </button>
      <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>
        The counter checks these every time {kid.name.split(' ')[0]}&rsquo;s card is charged.
      </p>
    </div>
  )
}
