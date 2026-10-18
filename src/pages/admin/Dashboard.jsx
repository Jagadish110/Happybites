import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowIcon, TrendIcon, ReceiptIcon, WalletIcon, UtensilsIcon, SparklesIcon } from '../../components/Icons.jsx'
import { COUNTER_TODAY as T, getItem, LIFETIME, TOP_SELLERS, TRENDS } from '../../data/menu.js'

const VIEWS = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
]

export default function Dashboard() {
  const [view, setView] = useState('daily')
  const trend = TRENDS[view]

  const pct = Math.min(Math.round((T.revenue / T.target) * 100), 100)
  const peak = Math.max(...trend.bars.map((b) => b.v))
  const totalTrend = trend.bars.reduce((n, b) => n + b.v, 0)
  const topMax = Math.max(...TOP_SELLERS.map((t) => t.sold))

  return (
    <div className="page">
      <h1 className="page-title">Today at the counter</h1>
      <p className="page-sub">Live since 7:00 am · updates as orders are charged</p>

      <div className="lifetime">
        <div className="lifetime-main">
          <span className="lifetime-ico"><TrendIcon /></span>
          <div>
            <span className="lifetime-k">Total earned since day one</span>
            <span className="lifetime-v">₹{LIFETIME.total.toLocaleString('en-IN')}</span>
            <span className="lifetime-sub">Open since {LIFETIME.since}</span>
          </div>
        </div>
        <div className="lifetime-side">
          <div className="lifetime-stat">
            <span className="stat-k">This year</span>
            <span className="stat-v">₹{LIFETIME.thisYear.toLocaleString('en-IN')}</span>
          </div>
          <div className="lifetime-stat">
            <span className="stat-k">Orders all time</span>
            <span className="stat-v">{LIFETIME.orders.toLocaleString('en-IN')}</span>
          </div>
          <div className="lifetime-stat">
            <span className="stat-k">Students served</span>
            <span className="stat-v">{LIFETIME.students.toLocaleString('en-IN')}</span>
          </div>
          <div className="lifetime-stat">
            <span className="stat-k">Best month</span>
            <span className="stat-v">₹{LIFETIME.bestMonth.v.toLocaleString('en-IN')}</span>
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
          <span className="stat-v in">₹{T.revenue.toLocaleString('en-IN')}</span>
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
          <span className="stat-v out">₹{T.avgOrder}</span>
        </div>
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
          <span style={{ color: '#1a1a1a', fontWeight: 700 }}><strong>₹{T.revenue.toLocaleString('en-IN')}</strong> earned</span>
          <span style={{ color: '#555', fontWeight: 700 }}>target <strong>₹{T.target.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head stacked">
            <div>
              <h2>Sales progress</h2>
              <span className="muted">{trend.label} · ₹{totalTrend.toLocaleString('en-IN')} total</span>
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
                <div className={'bar' + (b.now ? ' now' : '')} style={{ height: `${(b.v / peak) * 100}%` }} />
                <span className="bar-lbl">{b.label}</span>
              </div>
            ))}
          </div>
          <p className="muted trend-note">{trend.note}</p>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Most selling</h2>
            <Link className="link-btn" to="/admin/items">Manage items <ArrowIcon /></Link>
          </div>
          {TOP_SELLERS.map((row, i) => {
            const item = getItem(row.id)
            if (!item) return null
            return (
              <div className="rank-row" key={row.id}>
                <span className="rank">{i + 1}</span>
                <span className="rank-em" aria-hidden="true">
                  {item.image || item.icon ? (
                    <img src={item.image || item.icon} alt="" className="rank-img" />
                  ) : (
                    <UtensilsIcon width={18} height={18} />
                  )}
                </span>
                <div className="rank-main">
                  <div className="rank-nm">{item.name}</div>
                  <div className="rank-bar">
                    <span style={{ width: `${(row.sold / topMax) * 100}%` }} />
                  </div>
                </div>
                <div className="rank-right">
                  <div className="rank-sold">{row.sold} sold</div>
                  <div className="rank-rev">₹{(row.sold * item.price).toLocaleString('en-IN')}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
