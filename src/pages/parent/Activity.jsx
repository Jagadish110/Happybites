import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowDownLeftIcon, UtensilsIcon, WalletIcon, ReceiptIcon } from '../../components/Icons.jsx'

/** Every transaction across all linked children, newest first. */
export default function Activity() {
  const { children: CHILDREN } = useOutletContext()
  const [who, setWho] = useState('all')

  const rows = CHILDREN.flatMap((kid) =>
    kid.transactions.map((t) => ({ ...t, kidId: kid.id, kidName: kid.name.split(' ')[0] }))
  ).filter((t) => who === 'all' || t.kidId === who)

  const spent = rows.filter((t) => t.kind === 'out').reduce((n, t) => n + t.amount, 0)
  const added = rows.filter((t) => t.kind === 'in').reduce((n, t) => n + t.amount, 0)

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Activity</h1>
      <p className="page-sub">All canteen meals and wallet top-ups across your linked children.</p>

      <div className="chip-row">
        <button className={'chip' + (who === 'all' ? ' active' : '')} onClick={() => setWho('all')}>
          Everyone
        </button>
        {CHILDREN.map((k) => (
          <button key={k.id} className={'chip' + (who === k.id ? ' active' : '')} onClick={() => setWho(k.id)}>
            <span className="chip-dot">{k.name[0]}</span>
            <span>{k.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="stat-row cards">
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-k">Total spent</span>
            <span className="stat-icon-badge out"><UtensilsIcon width={16} height={16} /></span>
          </div>
          <span className="stat-v out">₹{spent.toLocaleString('en-IN')}</span>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-k">Topped up</span>
            <span className="stat-icon-badge in"><WalletIcon width={16} height={16} /></span>
          </div>
          <span className="stat-v in">₹{added.toLocaleString('en-IN')}</span>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-k">Transactions</span>
            <span className="stat-icon-badge"><ReceiptIcon width={16} height={16} /></span>
          </div>
          <span className="stat-v">{rows.length}</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Timeline</h2>
          <span className="muted">{rows.length} total entries</span>
        </div>
        {rows.map((t) => (
          <div className="tx-row" key={t.kidId + t.id}>
            <span className={'tx-ico ' + t.kind} aria-hidden="true">
              {t.kind === 'in' ? (
                <ArrowDownLeftIcon width={18} height={18} />
              ) : (
                <UtensilsIcon width={18} height={18} />
              )}
            </span>
            <div className="tx-main">
              <div className="tx-title">{t.title}</div>
              <div className="tx-sub">{t.kidName} · {t.sub}</div>
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
