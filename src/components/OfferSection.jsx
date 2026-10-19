import FoodArt, { hasArt } from './FoodArt.jsx'

/** Offers the admin has switched on. They appear here the moment they go live. */
export default function OfferSection({ offers, order, onAdd, onRemove }) {
  if (!offers.length) return null

  return (
    <section className="section offers">
      <div className="section-head">
        <h2 className="section-title">
          <span className="offer-flag" aria-hidden="true">%</span>
          <span className="underline">Offers</span>
          <span className="accent">today</span>
        </h2>
        <span className="muted">{offers.length} running</span>
      </div>

      <div className="offer-strip">
        {offers.map((o) => {
          const slot = `offer|${o.id}`
          const qty = order[slot]?.qty || 0
          const dish = { id: o.id, name: o.title, price: o.price, emoji: o.emoji, cat: o.cat, isOffer: true }
          const save = o.was - o.price

          return (
            <article className={'offer-tile' + (qty > 0 ? ' picked' : '')} key={o.id}>
              {qty > 0 && <span className="qty-badge">{qty}</span>}

              <div className="offer-tile-top" onClick={() => onAdd(dish, slot)} role="button"
                   aria-label={`Add ${o.title}`}>
                <span className="offer-tile-em" aria-hidden="true">
                  {o.image || o.icon
                    ? <img src={o.image || o.icon} alt="" />
                    : hasArt(o.art)
                      ? <FoodArt art={o.art} {...(o.artProps || {})} />
                      : o.emoji}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="offer-tile-nm">{o.title}</div>
                  <div className="offer-tile-sub">{o.detail}</div>
                </div>
                {save > 0 && <span className="offer-save">Save ₹{save}</span>}
              </div>

              <div className="offer-tile-foot">
                <span className="offer-tile-price">
                  ₹{o.price}
                  {save > 0 && <span className="was">₹{o.was}</span>}
                </span>

                {qty > 0 ? (
                  <div className="stepper">
                    <button onClick={() => onRemove(dish, slot)} aria-label={`One less ${o.title}`}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => onAdd(dish, slot)} aria-label={`One more ${o.title}`}>+</button>
                  </div>
                ) : (
                  <button className="add-btn" onClick={() => onAdd(dish, slot)} aria-label={`Add ${o.title}`}>
                    Add
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
