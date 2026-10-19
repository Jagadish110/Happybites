import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CATEGORIES } from '../../data/menu.js'
import { useMenu } from '../../store/MenuStore.jsx'
import { TagIcon, PlusIcon, CloseIcon, SparklesIcon } from '../../components/Icons.jsx'

const BLANK = { title: '', detail: '', price: '', was: '', cat: 'tea' }

export default function Offers() {
  const { say } = useOutletContext()
  const { offers, ready, error, addOffer, toggleOffer } = useMenu()
  const [form, setForm] = useState(BLANK)
  const [adding, setAdding] = useState(false)

  const cats = CATEGORIES.filter((c) => c.id !== 'all')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const valid = form.title.trim() && Number(form.price) > 0

  const publish = async () => {
    const offer = {
      title: form.title.trim(),
      detail: form.detail.trim(),
      price: Number(form.price),
      was: Number(form.was) || Number(form.price),
      cat: form.cat,
    }
    try {
      await addOffer(offer)
      setForm(BLANK)
      setAdding(false)
      say(`${offer.title} is now live at the counter`)
    } catch (err) {
      say(err.message)
    }
  }

  const flip = async (offer) => {
    try {
      const saved = await toggleOffer(offer)
      say(saved.active ? `${saved.title} is live at the counter` : `${saved.title} switched off`)
    } catch (err) {
      say(err.message)
    }
  }

  if (!ready) {
    return (
      <div className="page">
        <h1 className="page-title">Offers &amp; Combos</h1>
        <p className={error ? 'form-error' : 'page-sub'}>{error || 'Loading the offers…'}</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="head-row">
        <div>
          <h1 className="page-title">Offers & Combos</h1>
          <p className="page-sub">
            {offers.filter((o) => o.active).length} active · anything enabled appears directly on the canteen counter
          </p>
        </div>
        <button className="btn inline-btn" onClick={() => setAdding((a) => !a)}>
          {adding ? (
            <>
              <CloseIcon width={16} height={16} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <PlusIcon width={16} height={16} />
              <span>New offer</span>
            </>
          )}
        </button>
      </div>

      {adding && (
        <div className="panel add-form">
          <div className="panel-head">
            <h2>Create new offer</h2>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Offer name</span>
              <input type="text" placeholder="e.g. Exam week combo" value={form.title} onChange={set('title')} autoFocus />
            </label>
            <label className="field">
              <span>What&rsquo;s included</span>
              <input type="text" placeholder="Poori (2 pcs) + Tea" value={form.detail} onChange={set('detail')} />
            </label>
            <label className="field">
              <span>Offer price (₹)</span>
              <input type="number" min="1" placeholder="45" value={form.price} onChange={set('price')} />
            </label>
            <label className="field">
              <span>Usual price (₹)</span>
              <input type="number" min="1" placeholder="55" value={form.was} onChange={set('was')} />
            </label>
            <label className="field">
              <span>Category</span>
              <select value={form.cat} onChange={set('cat')}>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <button className="btn" disabled={!valid} onClick={publish}>Publish offer</button>
        </div>
      )}

      <div className="kid-grid">
        {offers.map((o) => {
          const save = o.was - o.price
          return (
            <div className={'offer-card' + (o.active ? '' : ' paused')} key={o.id}>
              <div className="offer-top">
                <span className="offer-em" aria-hidden="true">
                  {o.icon || o.image ? (
                    <img src={o.icon || o.image} alt="" className="offer-img" />
                  ) : (
                    <TagIcon width={22} height={22} />
                  )}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="kid-name">{o.title}</div>
                  <div className="kid-meta">{o.detail}</div>
                </div>
                {save > 0 && <span className="pill green">Save ₹{save}</span>}
              </div>

              <div className="offer-price">
                <span className="now">₹{o.price}</span>
                {save > 0 && <span className="was">₹{o.was}</span>}
                <span className="pill grey">{cats.find((c) => c.id === o.cat)?.name || o.cat}</span>
              </div>

              <label className="toggle-row">
                <input type="checkbox" checked={o.active} onChange={() => flip(o)} />
                <span className="switch" aria-hidden="true" />
                <span>
                  <strong>{o.active ? 'Live at counter' : 'Paused'}</strong>
                </span>
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
