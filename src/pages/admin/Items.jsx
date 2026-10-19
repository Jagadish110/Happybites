import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CATEGORIES } from '../../data/menu.js'
import { useMenu } from '../../store/MenuStore.jsx'
import { fileToThumbnail } from '../../utils/image.js'
import FoodArt, { hasArt } from '../../components/FoodArt.jsx'
import { UtensilsIcon, CameraIcon, PlusIcon, CloseIcon, PencilIcon } from '../../components/Icons.jsx'

const BLANK = { name: '', price: '', cat: 'tea', type: 'veg', note: '', emoji: '', image: '' }
const cats = CATEGORIES.filter((c) => c.id !== 'all')

/** The same fields serve both "new item" and "edit item". */
function ItemForm({ form, setForm, onSave, onCancel, saveLabel, imgError, setImgError }) {
  const fileRef = useRef(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const valid = form.name.trim() && Number(form.price) > 0
  const fieldId = `dish-photo-${saveLabel.replace(/\s+/g, '-').toLowerCase()}`

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

  return (
    <>
      <div className="photo-row">
        <div className={'photo-box' + (form.image ? ' filled' : '')}>
          {form.image ? (
            <img src={form.image} alt="" />
          ) : (
            <span className="photo-fallback-ico"><CameraIcon width={30} height={30} /></span>
          )}
        </div>
        <div className="photo-actions">
          <span className="field-label">Dish photo</span>
          <p className="muted">Take one with the phone camera, or pick an image file from this device.</p>
          <input
            ref={fileRef} id={fieldId} className="file-input" type="file"
            accept="image/*" capture="environment" onChange={pickImage}
          />
          <div className="photo-btns">
            <label className="btn ghost small" htmlFor={fieldId}>
              {form.image ? 'Change photo' : 'Upload photo'}
            </label>
            {form.image && (
              <button
                className="btn ghost small danger"
                onClick={() => {
                  setForm((f) => ({ ...f, image: '' }))
                  if (fileRef.current) fileRef.current.value = ''
                }}
              >
                Remove photo
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
        <label className="field">
          <span>Portion note (optional)</span>
          <input type="text" placeholder="e.g. 5 pieces, half litre mug" value={form.note} onChange={set('note')} />
        </label>
      </div>

      <div className="form-actions">
        <button className="btn" disabled={!valid} onClick={onSave}>{saveLabel}</button>
        {onCancel && <button className="btn ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </>
  )
}

export default function Items() {
  const { say } = useOutletContext()
  const { items, ready, error, addItem, updateItem, toggleItem } = useMenu()

  const [form, setForm] = useState(BLANK)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)      // the dish being edited
  const [filter, setFilter] = useState('all')
  const [imgError, setImgError] = useState('')

  const shown = items.filter((i) => filter === 'all' || i.cat === filter)
  const catName = (id) => cats.find((c) => c.id === id)?.name || id

  const startAdd = () => {
    setEditing(null)
    setForm(BLANK)
    setImgError('')
    setAdding((a) => !a)
  }

  const startEdit = (item) => {
    setAdding(false)
    setImgError('')
    setEditing(item)
    setForm({
      name: item.name,
      price: String(item.price),
      cat: item.cat,
      type: item.type,
      note: item.note || '',
      emoji: item.emoji || '',
      image: item.image || '',
    })
  }

  const saveNew = async () => {
    try {
      const made = await addItem({
        name: form.name.trim(),
        price: Number(form.price),
        cat: form.cat,
        type: form.type,
        note: form.note.trim(),
        emoji: form.emoji,
        image: form.image || '',
      })
      say(`${made.name} added to ${catName(made.cat)}`)
      setForm(BLANK)
      setAdding(false)
    } catch (err) {
      say(err.message)
    }
  }

  const saveEdit = async () => {
    try {
      const saved = await updateItem(editing.id, {
        name: form.name.trim(),
        price: Number(form.price),
        cat: form.cat,
        type: form.type,
        note: form.note.trim(),
        image: form.image || '',
      })
      say(`${saved.name} updated. The counter shows it now.`)
      setEditing(null)
      setForm(BLANK)
    } catch (err) {
      say(err.message)
    }
  }

  const flipAvailable = async (item) => {
    try {
      const saved = await toggleItem(item)
      say(saved.soldOut ? `${saved.name} marked sold out` : `${saved.name} is available again`)
    } catch (err) {
      say(err.message)
    }
  }

  if (!ready) {
    return (
      <div className="page">
        <h1 className="page-title">Menu items</h1>
        <p className={error ? 'form-error' : 'page-sub'}>{error || 'Loading the menu…'}</p>
      </div>
    )
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
        <button className="btn inline-btn" onClick={startAdd}>
          {adding ? (
            <><CloseIcon width={16} height={16} /><span>Cancel</span></>
          ) : (
            <><PlusIcon width={16} height={16} /><span>Add item</span></>
          )}
        </button>
      </div>

      {adding && (
        <div className="panel add-form">
          <div className="panel-head"><h2>New item</h2></div>
          <ItemForm
            form={form} setForm={setForm} onSave={saveNew} saveLabel="Save item"
            imgError={imgError} setImgError={setImgError}
          />
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
          <span>Dish</span><span>Category</span><span>Price</span><span>Available</span><span>Edit</span>
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
            <span className="muted t-cat">{catName(i.cat)}</span>
            <span className="t-price">₹{i.price}</span>
            <label className="toggle-row compact">
              <input type="checkbox" checked={!i.soldOut} onChange={() => flipAvailable(i)} />
              <span className="switch" aria-hidden="true" />
            </label>
            <button className="row-edit" onClick={() => startEdit(i)} aria-label={`Edit ${i.name}`}>
              <PencilIcon width={15} height={15} />
              <span>Edit</span>
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="modal-wrap" role="dialog" aria-modal="true" aria-label={`Edit ${editing.name}`}>
          <div className="modal-scrim" onClick={() => setEditing(null)} />
          <div className="order-modal edit-modal">
            <div className="modal-head">
              <h2>Edit {editing.name}</h2>
              <button className="modal-close" onClick={() => setEditing(null)} aria-label="Close">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <ItemForm
                form={form} setForm={setForm} onSave={saveEdit} onCancel={() => setEditing(null)}
                saveLabel="Save changes" imgError={imgError} setImgError={setImgError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
