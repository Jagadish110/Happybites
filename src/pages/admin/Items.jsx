import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CATEGORIES } from '../../data/menu.js'
import { useMenu } from '../../store/MenuStore.jsx'
import { fileToThumbnail } from '../../utils/image.js'
import FoodArt, { hasArt } from '../../components/FoodArt.jsx'
import { UtensilsIcon, CameraIcon, PlusIcon, CloseIcon } from '../../components/Icons.jsx'

const BLANK = { name: '', price: '', cat: 'tea', type: 'veg', emoji: '', image: '' }

export default function Items() {
  const { say } = useOutletContext()
  const { items, addItem, toggleItem } = useMenu()

  const [form, setForm] = useState(BLANK)
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('all')
  const [imgError, setImgError] = useState('')
  const fileRef = useRef(null)

  const cats = CATEGORIES.filter((c) => c.id !== 'all')
  const shown = items.filter((i) => filter === 'all' || i.cat === filter)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const valid = form.name.trim() && Number(form.price) > 0

  const pickImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setImgError('')
      const image = await fileToThumbnail(file)
      setForm((f) => ({ ...f, image }))
    } catch (err) {
      setImgError(err.message)
    }
  }

  const save = () => {
    addItem({
      name: form.name.trim(),
      price: Number(form.price),
      cat: form.cat,
      type: form.type,
      emoji: form.emoji || '🍽️',
      image: form.image || '',
    })
    setForm(BLANK)
    setAdding(false)
    if (fileRef.current) fileRef.current.value = ''
    say(`${form.name.trim()} added to ${form.cat}`)
  }

  return (
    <div className="page">
      <div className="head-row">
        <div>
          <h1 className="page-title">Menu items</h1>
          <p className="page-sub">
            {items.length} dishes · changes show at the counter straight away
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
              <span>Add item</span>
            </>
          )}
        </button>
      </div>

      {adding && (
        <div className="panel add-form">
          <div className="panel-head"><h2>New item</h2></div>

          <div className="photo-row">
            <div className={'photo-box' + (form.image ? ' filled' : '')}>
              {form.image ? (
                <img src={form.image} alt="" />
              ) : (
                <span className="photo-fallback-ico">
                  <CameraIcon width={30} height={30} />
                </span>
              )}
            </div>
            <div className="photo-actions">
              <span className="field-label">Dish photo</span>
              <p className="muted">Take one with the phone camera, or pick an image file from this device.</p>
              <input
                ref={fileRef} id="dish-photo" className="file-input" type="file"
                accept="image/*" capture="environment" onChange={pickImage}
              />
              <div className="photo-btns">
                <label className="btn ghost small" htmlFor="dish-photo">
                  {form.image ? 'Change photo' : 'Upload photo'}
                </label>
                {form.image && (
                  <button
                    className="btn ghost small danger"
                    onClick={() => { setForm((f) => ({ ...f, image: '' })); if (fileRef.current) fileRef.current.value = '' }}
                  >
                    Remove
                  </button>
                )}
              </div>
              {imgError && <p className="form-error" style={{ marginTop: 10 }}>{imgError}</p>}
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Dish name</span>
              <input type="text" placeholder="e.g. Mysore Bonda" value={form.name} onChange={set('name')} autoFocus />
            </label>
            <label className="field">
              <span>Price (₹)</span>
              <input type="number" min="1" placeholder="25" value={form.price} onChange={set('price')} />
            </label>
            <label className="field">
              <span>Category</span>
              <select value={form.cat} onChange={set('cat')}>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Food type</span>
              <select value={form.type} onChange={set('type')}>
                <option value="veg">Vegetarian</option>
                <option value="nonveg">Non-vegetarian</option>
              </select>
            </label>
          </div>

          <button className="btn" disabled={!valid} onClick={save}>Save item</button>
        </div>
      )}

      <div className="chip-row">
        <button className={'chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>
          All dishes ({items.length})
        </button>
        {cats.map((c) => (
          <button key={c.id} className={'chip' + (filter === c.id ? ' active' : '')} onClick={() => setFilter(c.id)}>
            {c.name} ({items.filter((i) => i.cat === c.id).length})
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="table-head">
          <span>Dish</span><span>Category</span><span>Price</span><span>Available</span>
        </div>
        {shown.map((i) => (
          <div className={'table-row' + (i.soldOut ? ' off' : '')} key={i.id}>
            <span className="t-dish">
              <span className="t-em" aria-hidden="true">
                {i.image || i.icon ? (
                  <img src={i.image || i.icon} alt="" />
                ) : hasArt(i.art) ? (
                  <FoodArt art={i.art} {...(i.artProps || {})} />
                ) : (
                  <UtensilsIcon width={18} height={18} />
                )}
              </span>
              <span className="t-dish-label">
                <span className="t-name">{i.name}</span>
                <span className={'dot-mark ' + i.type} title={i.type === 'veg' ? 'Veg' : 'Non-veg'} />
              </span>
            </span>
            <span className="muted t-cat">{cats.find((c) => c.id === i.cat)?.name || i.cat}</span>
            <span className="t-price">₹{i.price}</span>
            <label className="toggle-row compact">
              <input type="checkbox" checked={!i.soldOut} onChange={() => toggleItem(i.id)} />
              <span className="switch" aria-hidden="true" />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
