import FoodArt, { hasArt } from './FoodArt.jsx'
import { CATEGORIES } from '../data/menu.js'

/**
 * One dish on the counter board. Tapping anywhere on the card adds one; the
 * − / + buttons adjust it from there. `slot` keeps each card's count its own,
 * so the same dish shown in two sections only counts where it was tapped.
 */
export default function FoodCard({ item, slot, qty = 0, onAdd, onRemove }) {
  const category = CATEGORIES.find((c) => c.id === item.cat)?.name || 'Counter'

  // the steppers sit inside the card, so stop them bubbling up into "add one"
  const step = (fn) => (e) => {
    e.stopPropagation()
    fn(item, slot)
  }

  return (
    <article
      className={'card' + (qty > 0 ? ' picked' : '') + (item.soldOut ? ' is-out' : '')}
      onClick={() => !item.soldOut && onAdd(item, slot)}
      role={item.soldOut ? undefined : 'button'}
      aria-label={item.soldOut ? `${item.name}, sold out` : `Add ${item.name}`}
    >
      <div className={'thumb' + (item.type === 'nonveg' ? ' nv' : '')}>
        {item.image || item.icon ? (
          <img className="thumb-photo" src={item.image || item.icon} alt="" />
        ) : hasArt(item.art) ? (
          <FoodArt art={item.art} {...(item.artProps || {})} />
        ) : (
          <span className="em" role="img" aria-label={item.name}>{item.emoji}</span>
        )}

        {qty > 0 && <span className="qty-badge">{qty} in order</span>}

        <span className={'marker' + (item.type === 'nonveg' ? ' nonveg' : '')}
              title={item.type === 'nonveg' ? 'Non-vegetarian' : 'Vegetarian'} />

        {item.soldOut && <span className="sold-out">Sold out</span>}
      </div>

      <div className="card-body">
        <h3 className="card-name">{item.name}</h3>
        <p className="card-note">{item.note || category}</p>

        <div className="card-foot">
          <span className="card-price">₹{item.price}</span>

          {item.soldOut ? (
            <span className="muted" style={{ fontSize: 11.5 }}>Not available</span>
          ) : qty > 0 ? (
            <div className="stepper">
              <button onClick={step(onRemove)} aria-label={`One less ${item.name}`}>−</button>
              <span>{qty}</span>
              <button onClick={step(onAdd)} aria-label={`One more ${item.name}`}>+</button>
            </div>
          ) : (
            <button className="add-btn" onClick={step(onAdd)} aria-label={`Add ${item.name}`}>
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
