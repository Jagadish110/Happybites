import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import FoodCard from './FoodCard.jsx'
import { CategoryIcon } from './Icons.jsx'

/**
 * A category block. Cards wrap onto rows — never a sideways swipe — and a long
 * section is kept to two rows until the staff ask for the rest.
 */
export default function MenuSection({ id, title, accent, script, icon, tone = 'plain', items, order, onAdd, onRemove }) {
  const gridRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [twoRows, setTwoRows] = useState(null)   // height of two rows, in px
  const [overflows, setOverflows] = useState(false)

  const measure = useCallback(() => {
    const grid = gridRef.current
    const card = grid?.querySelector('.card')
    if (!grid || !card) return

    const styles = getComputedStyle(grid)
    const gap = parseFloat(styles.rowGap) || 12
    const padTop = parseFloat(styles.paddingTop) || 0
    const padBottom = parseFloat(styles.paddingBottom) || 0
    const height = card.offsetHeight * 2 + gap + padTop + padBottom

    setTwoRows(height)
    setOverflows(grid.scrollHeight > height + 4)
  }, [])

  useLayoutEffect(measure, [measure, items])

  useEffect(() => {
    const grid = gridRef.current
    if (!grid || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(grid)
    return () => ro.disconnect()
  }, [measure])

  if (!items.length) return null

  const clamped = overflows && !expanded

  return (
    <section className={`section ${tone}`}>
      <div className="section-head">
        <h2 className="section-title">
          {script && <span className="script">{script}</span>}
          {icon && <CategoryIcon icon={icon} className="t-ico" />}
          <span className="underline">{title}</span>
          {accent && <span className="accent">{accent}</span>}
        </h2>

        <div className="section-tools">
          <span className="muted">{items.length} items</span>
          {overflows && (
            <button className="link-btn" onClick={() => setExpanded((e) => !e)}>
              {expanded ? 'Show less' : `Show all ${items.length}`}
            </button>
          )}
        </div>
      </div>

      <div
        ref={gridRef}
        className={'grid' + (clamped ? ' clamped' : '')}
        style={clamped && twoRows ? { maxHeight: twoRows } : undefined}
      >
        {items.map((it, i) => {
          const slot = `${id}|${it.id}`
          return (
            <FoodCard
              key={slot} item={it} slot={slot} tint={(i % 4) + 1}
              qty={order[slot]?.qty || 0}
              onAdd={onAdd} onRemove={onRemove}
            />
          )
        })}
      </div>
    </section>
  )
}
