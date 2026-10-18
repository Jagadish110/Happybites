import { Link, useOutletContext, useParams } from 'react-router-dom'
import { CATEGORIES, getChild } from '../../data/menu.js'
import { ArrowDownLeftIcon, UtensilsIcon, WalletIcon, SlidersIcon, ShieldIcon } from '../../components/Icons.jsx'

export default function ChildDetail() {
  const { id } = useParams()
  const { say } = useOutletContext()
  const kid = getChild(id)

  const left = Math.max(kid.dailyLimit - kid.spentToday, 0)
  const pct = Math.min((kid.spentToday / kid.dailyLimit) * 100, 100)
  const allowed = CATEGORIES.filter((c) => c.id !== 'all' && !kid.blocked.includes(c.id))
  const initials = kid.name.split(' ').map((n) => n[0]).join('')

  return (
    <div className="page page-narrow">
      <Link className="link-btn back" to="/parent">&larr; All children</Link>

      <div className="id-card">
        <div className="id-top">
          <div>
            <div className="id-label">Happybites canteen card</div>
            <div className="id-name">{kid.name}</div>
            <div className="id-meta">{kid.klass}</div>
          </div>
          <div className="id-avatar" aria-hidden="true">
            <span>{initials}</span>
          </div>
        </div>

        <div className="id-balance">
          <div className="id-label">Wallet balance</div>
          <div className="amt">₹{kid.balance}</div>
        </div>

        <div className="id-foot">
          <span className="id-code">{kid.id}</span>
          <span className="id-badge-active">{kid.cardActive ? '● Card active' : '○ Card blocked'}</span>
        </div>
      </div>

      <div className="action-row">
        <Link className="btn inline-btn" to={`/parent/${kid.id}/topup`}>
          <WalletIcon width={16} height={16} />
          <span>Add money</span>
        </Link>
        <Link className="btn ghost inline-btn" to={`/parent/${kid.id}/limits`}>
          <SlidersIcon width={16} height={16} />
          <span>Spending limits</span>
        </Link>
        <button
          className="btn ghost danger inline-btn"
          onClick={() => say(`${kid.name}'s card would be blocked at the counter`)}
        >
          <ShieldIcon width={16} height={16} />
          <span>Block card</span>
        </button>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Today&rsquo;s spending</h2>
          <span className="pill green">₹{left} left of ₹{kid.dailyLimit}</span>
        </div>
        <div className="meter">
          <div className="meter-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="stat-row">
          <div className="stat">
            <span className="stat-k">Spent today</span>
            <span className="stat-v">₹{kid.spentToday}</span>
          </div>
          <div className="stat">
            <span className="stat-k">Daily limit</span>
            <span className="stat-v">₹{kid.dailyLimit}</span>
          </div>
          <div className="stat">
            <span className="stat-k">Per order cap</span>
            <span className="stat-v">₹{kid.perOrderCap}</span>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          Can buy: {allowed.map((c) => c.name).join(', ')}
          {kid.blocked.length > 0 && ` · blocked: ${kid.blocked.join(', ')}`}
        </p>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Spend history</h2>
          <span className="muted">Recent canteen activity</span>
        </div>
        {kid.transactions.map((t) => (
          <div className="tx-row" key={t.id}>
            <span className={'tx-ico ' + t.kind} aria-hidden="true">
              {t.kind === 'in' ? (
                <ArrowDownLeftIcon width={18} height={18} />
              ) : (
                <UtensilsIcon width={18} height={18} />
              )}
            </span>
            <div className="tx-main">
              <div className="tx-title">{t.title}</div>
              <div className="tx-sub">{t.sub}</div>
            </div>
            <span className={'tx-amt ' + t.kind}>
              {t.kind === 'in' ? '+' : '−'}₹{t.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
