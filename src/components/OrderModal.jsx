import { useEffect } from 'react'
import { CloseIcon, ReceiptIcon } from './Icons.jsx'

/** The running order. A pill sits at the bottom of the counter screen; opening
 *  it brings the order up in the middle of the screen. */
export default function OrderModal({ lines, total, count, open, onOpen, onClose, onAdd, onRemove, onClear, onCharge }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <button className={'order-fab' + (count ? ' has-items' : '')} onClick={onOpen}>
        <ReceiptIcon className="fab-ico" />
        <span className="fab-text">
          {count ? `${count} item${count === 1 ? '' : 's'}` : 'Current order'}
        </span>
        <span className="fab-total">₹{total}</span>
      </button>

      {open && (
        <div className="modal-wrap" role="dialog" aria-modal="true" aria-label="Current order">
          <div className="modal-scrim" onClick={onClose} />

          <div className="order-modal">
            {/* ── Header ── */}
            <div className="modal-head">
              <div className="modal-head-inner">
                <div className="modal-head-icon">
                  <ReceiptIcon />
                </div>
                <div>
                  <h2>Current order</h2>
                  <p className="modal-head-sub">{count ? `${count} item${count === 1 ? '' : 's'} in your order` : 'No items yet'}</p>
                </div>
              </div>
              <button className="modal-close" onClick={onClose} aria-label="Close order">
                <CloseIcon />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="modal-body">
              {lines.length === 0 ? (
                <div className="rail-empty">
                  <span className="rail-empty-ico">🍽️</span>
                  <p>Tap a dish to start your order.</p>
                  <span className="muted">Use + / − for extra portions.</span>
                </div>
              ) : (
                lines.map((line) => {
                  const { item, qty } = line
                  const imgSrc = item.image || item.icon || null
                  return (
                    <div className="order-row" key={item.id}>
                      <div className="order-img-wrap">
                        {imgSrc ? (
                          <img className="order-img" src={imgSrc} alt={item.name} />
                        ) : (
                          <span className="order-em" aria-hidden="true">{item.emoji}</span>
                        )}
                      </div>
                      <div className="order-info">
                        <div className="order-nm">{item.name}</div>
                        <div className="order-pr">₹{item.price} × {qty} = <strong>₹{item.price * qty}</strong></div>
                      </div>
                      <div className="stepper big">
                        <button onClick={() => onRemove(line)} aria-label={`One less ${item.name}`}>−</button>
                        <span>{qty}</span>
                        <button onClick={() => onAdd(line)} aria-label={`One more ${item.name}`}>+</button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* ── Footer ── */}
            <div className="modal-foot">
              <div className="summary-line total">
                <span>Total</span>
                <strong className="total-price">₹{total}</strong>
              </div>
              <button className="btn block charge-btn" disabled={!lines.length} onClick={onCharge}>
                Scan card &amp; charge ₹{total}
              </button>
              <button className="link-btn clear" disabled={!lines.length} onClick={onClear}>
                Clear order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
