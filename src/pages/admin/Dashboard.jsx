import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowIcon, TrendIcon, ReceiptIcon, WalletIcon, UtensilsIcon, SparklesIcon, BankIcon,
} from '../../components/Icons.jsx'
import { api } from '../../api/client.js'
import { useMenu } from '../../store/MenuStore.jsx'

const VIEWS = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
]

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function Dashboard() {
  const { items } = useMenu()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [view, setView] = useState('daily')

  const load = useCallback(() => {
    api.adminSummary().then((d) => { setData(d); setError('') }).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 30000)      // figures stay live while the page is open
    return () => window.clearInterval(timer)
  }, [load])

  if (!data) {
    return (
      <div className="page">
        <h1 className="page-title">Today at the counter</h1>
        <p className={error ? 'form-error' : 'page-sub'}>{error || 'Loading the latest numbers…'}</p>
      </div>
    )
  }

  const { today: T, lifetime: L, wallet: W, topSellers } = data
  const trend = data.trends[view]
  const pct = Math.min(Math.round((T.revenue / T.target) * 100), 100)
  const peak = Math.max(...trend.bars.map((b) => b.v), 1)
  const totalTrend = trend.bars.reduce((n, b) => n + b.v, 0)
  const topMax = Math.max(...topSellers.map((t) => t.sold), 1)
  const iconFor = (row) => {
    const item = items.find((i) => i.id === row.id) || items.find((i) => i.name === row.name)
    return item?.image || item?.icon || null
  }

  return (
    <div className="page">
      <h1 className="page-title">Today at the counter</h1>
      <p className="page-sub">Updates as cards are charged · refreshed every 30 seconds</p>

      <div className="lifetime">
        <div className="lifetime-main">
          <span className="lifetime-ico"><TrendIcon /></span>
          <div>
            <span className="lifetime-k">Total earned since day one</span>
            <span className="lifetime-v">{inr(L.total)}</span>
            <span className="lifetime-sub">{L.since ? `Selling since ${L.since}` : 'No sales recorded yet'}</span>
          </div>
        </div>
        <div className="lifetime-side">
          <div className="lifetime-stat">
            <span className="stat-k">This year</span>
            <span className="stat-v">{inr(L.thisYear)}</span>
          </div>
          <div className="lifetime-stat">
            <span className="stat-k">Orders all time</span>
            <span className="stat-v">{L.orders.toLocaleString('en-IN')}</span>
          </div>
          <div className="lifetime-stat">
            <span className="stat-k">Students served</span>
            <span className="stat-v">{L.students.toLocaleString('en-IN')}</span>
          </div>
          <div className="lifetime-stat">
            <span className="stat-k">Best month</span>
            <span className="stat-v">{L.bestMonth ? inr(L.bestMonth.v) : '—'}</span>
          </div>
        </div>
      </div>

      <div className="stat-row cards">
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-k">Orders served</span>
            <span className="stat-icon-badge"><ReceiptIcon width={17} height={17} /></span>
          </div>
          <span className="stat-v">{T.orders}</span>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-k">Revenue</span>
            <span className="stat-icon-badge in"><WalletIcon width={17} height={17} /></span>
          </div>
          <span className="stat-v in">{inr(T.revenue)}</span>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-k">Items sold</span>
            <span className="stat-icon-badge warm"><UtensilsIcon width={17} height={17} /></span>
          </div>
          <span className="stat-v">{T.itemsSold}</span>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-k">Average order</span>
            <span className="stat-icon-badge out"><SparklesIcon width={17} height={17} /></span>
          </div>
          <span className="stat-v out">{inr(T.avgOrder)}</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Where the money is</h2>
          <span className="muted">All time</span>
        </div>
        <div className="money-grid">
          <div className="money-item">
            <span className="stat-icon-badge in"><BankIcon width={17} height={17} /></span>
            <span className="stat-k">Paid in by parents</span>
            <span className="stat-v in">{inr(W.collected)}</span>
            <span className="muted">Collected through Razorpay. Razorpay pays this into your bank account on its normal settlement schedule.</span>
          </div>
          <div className="money-item">
            <span className="stat-icon-badge"><ReceiptIcon width={17} height={17} /></span>
            <span className="stat-k">Spent at the counter</span>
            <span className="stat-v">{inr(W.spent)}</span>
            <span className="muted">Taken off student wallets when cards were charged. This is what the canteen has earned.</span>
          </div>
          <div className="money-item">
            <span className="stat-icon-badge warm"><WalletIcon width={17} height={17} /></span>
            <span className="stat-k">Still in wallets</span>
            <span className="stat-v out">{inr(W.outstanding)}</span>
            <span className="muted">Paid in but not yet spent. Students can still use it, so treat it as owed.</span>
          </div>
        </div>
        {W.testCredited > 0 && (
          <p className="test-banner" style={{ marginTop: 14, marginBottom: 0 }}>
            <span aria-hidden="true">🧪</span>
            <span>
              <strong>{inr(W.testCredited)}</strong> of the wallet balance came from simulated test
              payments. It is not real money and is not counted in &ldquo;Paid in by parents&rdquo;.
            </span>
          </p>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Progress to today&rsquo;s target</h2>
          <span className="pill green">{pct}%</span>
        </div>
        <div className="meter">
          <div className="meter-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="range-ends" style={{ marginTop: 9 }}>
          <span style={{ color: '#1a1a1a', fontWeight: 700 }}><strong>{inr(T.revenue)}</strong> earned</span>
          <span style={{ color: '#555', fontWeight: 700 }}>target <strong>{inr(T.target)}</strong></span>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head stacked">
            <div>
              <h2>Sales progress</h2>
              <span className="muted">{trend.label} · {inr(totalTrend)} total</span>
            </div>
            <div className="seg">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  className={'seg-btn' + (view === v.id ? ' active' : '')}
                  onClick={() => setView(v.id)}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bars">
            {trend.bars.map((b) => (
              <div className="bar-col" key={b.label}>
                <span className="bar-val">₹{b.v >= 1000 ? `${(b.v / 1000).toFixed(1)}k` : b.v}</span>
                <div className={'bar' + (b.now ? ' now' : '')} style={{ height: `${Math.max((b.v / peak) * 100, 2)}%` }} />
                <span className="bar-lbl">{b.label}</span>
              </div>
            ))}
          </div>
          <p className="muted trend-note">{trend.note}</p>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Most selling today</h2>
            <Link className="link-btn" to="/admin/items">Manage items <ArrowIcon /></Link>
          </div>
          {topSellers.length === 0 && <p className="muted">Nothing sold yet today.</p>}
          {topSellers.map((row, i) => {
            const icon = iconFor(row)
            return (
              <div className="rank-row" key={`${row.id}-${row.name}`}>
                <span className="rank">{i + 1}</span>
                <span className="rank-em" aria-hidden="true">
                  {icon ? <img src={icon} alt="" className="rank-img" /> : <UtensilsIcon width={18} height={18} />}
                </span>
                <div className="rank-main">
                  <div className="rank-nm">{row.name}</div>
                  <div className="rank-bar">
                    <span style={{ width: `${(row.sold / topMax) * 100}%` }} />
                  </div>
                </div>
                <div className="rank-right">
                  <div className="rank-sold">{row.sold} sold</div>
                  <div className="rank-rev">{inr(row.revenue)}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
