/**
 * Hand-drawn food illustrations. One flat SVG per dish family, drawn on a
 * 100x100 board so every card shows the food at the same size. `tone` tints the
 * parts that vary between dishes of the same shape (juice colour, bun filling).
 *
 * Admin-uploaded photos take priority over these; see FoodCard.
 */

const Shadow = () => <ellipse cx="50" cy="88" rx="26" ry="5" fill="rgba(120,70,40,.16)" />

const Steam = ({ x = 50 }) => (
  <g stroke="#cbb3a4" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".8">
    <path d={`M${x - 9} 26c3-4-3-7 0-11`} />
    <path d={`M${x} 22c3-4-3-8 0-12`} />
    <path d={`M${x + 9} 26c3-4-3-7 0-11`} />
  </g>
)

const Chai = ({ tone = '#c98348' }) => (
  <g>
    <Shadow />
    <Steam x={46} />
    <path d="M26 40h40l-5 39a8 8 0 0 1-8 7H39a8 8 0 0 1-8-7L26 40Z" fill="#fff" />
    <path d="M28.6 48h34.8l-4 31a5 5 0 0 1-5 4.4H37.6a5 5 0 0 1-5-4.4L28.6 48Z" fill={tone} />
    <path d="M66 46h6.5a8.5 8.5 0 0 1 0 17H64" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
    <ellipse cx="46" cy="40" rx="20" ry="5" fill="#fff" />
    <ellipse cx="46" cy="48" rx="17" ry="3.6" fill="#fff" opacity=".3" />
  </g>
)

const Coffee = ({ tone = '#6f4426' }) => (
  <g>
    <Shadow />
    <Steam x={50} />
    <ellipse cx="50" cy="86" rx="24" ry="5" fill="#f0ddcd" />
    <path d="M28 40h44l-4 34a9 9 0 0 1-9 8H41a9 9 0 0 1-9-8L28 40Z" fill="#fff" />
    <path d="M31 47h38l-3.4 27a5 5 0 0 1-5 4.4H39.4a5 5 0 0 1-5-4.4L31 47Z" fill={tone} />
    <ellipse cx="50" cy="47" rx="19" ry="4.4" fill="#d9b48d" opacity=".55" />
    <ellipse cx="50" cy="40" rx="22" ry="5.4" fill="#fff" />
  </g>
)

const Malt = ({ tone = '#a9683a' }) => (
  <g>
    <Shadow />
    <path d="M34 28h32l-4 50a8 8 0 0 1-8 7.2H46a8 8 0 0 1-8-7.2L34 28Z" fill="#fff" opacity=".92" />
    <path d="M36.6 40h26.8l-3 38a5 5 0 0 1-5 4.6h-11a5 5 0 0 1-5-4.6l-2.8-38Z" fill={tone} />
    <ellipse cx="50" cy="40" rx="13.4" ry="3.4" fill="#fff" opacity=".45" />
    <ellipse cx="50" cy="28" rx="16" ry="4.2" fill="#fff" />
    <rect x="54" y="12" width="5" height="26" rx="2.5" transform="rotate(12 56 24)" fill="#ef6a5a" />
  </g>
)

const MaltBowl = ({ tone = '#b07a4b' }) => (
  <g>
    <Shadow />
    <path d="M22 46h56c0 17-11 30-25 30h-6c-14 0-25-13-25-30Z" fill="#fff" />
    <path d="M27 51h46c-1 13-9.5 20-20 20h-6c-10.5 0-19-7-20-20Z" fill={tone} />
    <ellipse cx="50" cy="51" rx="23" ry="5" fill="#e7cdb3" opacity=".6" />
    <circle cx="43" cy="52" r="2.4" fill="#f6e2c8" />
    <circle cx="56" cy="55" r="2" fill="#f6e2c8" />
  </g>
)

const GreenTea = () => (
  <g>
    <Shadow />
    <Steam x={50} />
    <path d="M28 42h44l-5 36a8 8 0 0 1-8 7H41a8 8 0 0 1-8-7l-5-36Z" fill="#fff" />
    <path d="M31 49h38l-4 29a5 5 0 0 1-5 4.4H40a5 5 0 0 1-5-4.4l-4-29Z" fill="#a9c96a" />
    <ellipse cx="50" cy="42" rx="22" ry="5.4" fill="#fff" />
    <path d="M50 46c6-1 10-5 11-9-5-1-10 3-11 9Z" fill="#4e8f3c" />
  </g>
)

const Cake = () => (
  <g>
    <Shadow />
    <path d="M24 52h52v22a6 6 0 0 1-6 6H30a6 6 0 0 1-6-6V52Z" fill="#f6d8a8" />
    <path d="M24 52h52v8H24z" fill="#8a5a3b" />
    <path d="M24 66h52v7H24z" fill="#8a5a3b" opacity=".75" />
    <path d="M26 52c6-14 14-21 24-21s18 7 24 21H26Z" fill="#fbe7c6" />
    <path d="M30 50c5-11 11-16 20-16s15 5 20 16H30Z" fill="#f2b8c6" />
    <circle cx="50" cy="28" r="4" fill="#e8452c" />
  </g>
)

const Puff = () => (
  <g>
    <Shadow />
    <path d="M20 58c4-16 13-26 30-26s26 10 30 26c-8 6-18 9-30 9s-22-3-30-9Z" fill="#e8b874" />
    <path d="M24 56c4-12 11-19 26-19s22 7 26 19c-7 5-16 7-26 7s-19-2-26-7Z" fill="#f3cf95" />
    <path d="M34 40c3 8 3 15 1 22M50 36c0 9 0 16-1 23M66 40c-3 8-3 15-1 22"
          stroke="#d9a361" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <path d="M20 58c8 6 18 9 30 9s22-3 30-9c1 5-1 8-4 9H24c-3-1-5-4-4-9Z" fill="#d79a55" />
  </g>
)

const Brownie = () => (
  <g>
    <Shadow />
    <path d="M24 48h52v26a6 6 0 0 1-6 6H30a6 6 0 0 1-6-6V48Z" fill="#4d2a1b" />
    <path d="M24 48h52v9H24z" fill="#6b3a24" />
    <path d="M26 46c2-5 10-8 24-8s22 3 24 8c-6 4-14 6-24 6s-18-2-24-6Z" fill="#7b452b" />
    <circle cx="38" cy="44" r="3" fill="#2f1810" />
    <circle cx="58" cy="43" r="2.4" fill="#2f1810" />
    <path d="M30 64h40" stroke="#381f14" strokeWidth="2.6" strokeLinecap="round" />
  </g>
)

const Roll = () => (
  <g>
    <Shadow />
    <path d="M30 76 62 24c6-9 16-3 11 6L44 82c-4 7-18 1-14-6Z" fill="#edc98f" />
    <path d="M36 70 64 28" stroke="#dcb173" strokeWidth="3" strokeLinecap="round" />
    <path d="M30 76c6 5 14 6 20 2-3-5-6-9-6-14-5 3-10 7-14 12Z" fill="#f6e2bd" />
    <circle cx="41" cy="68" r="2.6" fill="#5fa04a" />
    <circle cx="48" cy="72" r="2.4" fill="#e8452c" />
    <circle cx="36" cy="74" r="2" fill="#f2a93b" />
  </g>
)

const Bun = ({ tone = '#fff0d6' }) => (
  <g>
    <Shadow />
    <path d="M18 62c0-16 14-28 32-28s32 12 32 28c0 7-4 11-10 11H28c-6 0-10-4-10-11Z" fill="#e0a865" />
    <path d="M22 60c0-14 12-23 28-23s28 9 28 23c0 5-3 8-8 8H30c-5 0-8-3-8-8Z" fill="#f1c88c" />
    <path d="M28 68h44c0 7-4 12-11 12H39c-7 0-11-5-11-12Z" fill="#d79a55" />
    <path d="M34 66c6-4 26-4 32 0-4 3-28 3-32 0Z" fill={tone} />
    <circle cx="42" cy="48" r="1.8" fill="#fff5e2" />
    <circle cx="56" cy="52" r="1.6" fill="#fff5e2" />
  </g>
)

const Samosa = () => (
  <g>
    <Shadow />
    <path d="M50 22 84 76c2 4-1 8-5 8H21c-4 0-7-4-5-8L50 22Z" fill="#e2a85f" />
    <path d="M50 32 76 76H24L50 32Z" fill="#f0c285" />
    <path d="M50 22v62" stroke="#d1904a" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M34 66c10-4 22-4 32 0" stroke="#c9843c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <circle cx="42" cy="58" r="2.2" fill="#b9762f" opacity=".7" />
  </g>
)

const MiniSamosa = () => (
  <g>
    <Shadow />
    {[[30, 58, 0.62], [68, 58, 0.62], [49, 42, 0.68]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s}) translate(-50 -50)`}>
        <path d="M50 22 84 76c2 4-1 8-5 8H21c-4 0-7-4-5-8L50 22Z" fill="#e2a85f" />
        <path d="M50 32 76 76H24L50 32Z" fill="#f0c285" />
        <path d="M50 24v58" stroke="#d1904a" strokeWidth="3" strokeLinecap="round" />
      </g>
    ))}
  </g>
)

const Bonda = ({ tone = '#dd9a4e' }) => (
  <g>
    <Shadow />
    <circle cx="50" cy="55" r="26" fill={tone} />
    <circle cx="50" cy="55" r="20" fill="#f0bd79" opacity=".55" />
    <circle cx="41" cy="46" r="5" fill="#fbdca9" opacity=".8" />
    <circle cx="62" cy="63" r="3" fill="#c07c35" opacity=".6" />
    <circle cx="56" cy="44" r="2.4" fill="#c07c35" opacity=".5" />
  </g>
)

const Vadai = () => (
  <g>
    <Shadow />
    <circle cx="50" cy="55" r="27" fill="#d9954a" />
    <circle cx="50" cy="55" r="21" fill="#eeb771" />
    <circle cx="50" cy="55" r="8" fill="#fdf0dd" />
    <circle cx="50" cy="55" r="8" fill="none" stroke="#c88338" strokeWidth="2" />
    <circle cx="36" cy="46" r="3" fill="#c88338" opacity=".55" />
    <circle cx="64" cy="62" r="2.6" fill="#c88338" opacity=".55" />
  </g>
)

const Bajji = ({ tone = '#e5a957' }) => (
  <g>
    <Shadow />
    <path d="M30 40c10-12 30-12 40 0 8 10 4 26-6 34-8 7-20 7-28 0-10-8-14-24-6-34Z" fill={tone} />
    <path d="M36 44c8-8 20-8 28 0 6 7 3 19-5 25-6 5-12 5-18 0-8-6-11-18-5-25Z" fill="#f4cb91" />
    <path d="M40 42c-3 8-2 16 2 22M60 42c3 8 2 16-2 22" stroke="#cf9246" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </g>
)

const BreadBajji = () => (
  <g>
    <Shadow />
    <path d="M24 36h52v34a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V36Z" fill="#e3a559" />
    <path d="M30 42h40v28a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4V42Z" fill="#f6d9a4" />
    <path d="M30 56h40" stroke="#dcae6c" strokeWidth="2.6" />
    <path d="M24 36c6-6 46-6 52 0-6 5-46 5-52 0Z" fill="#d1913f" />
  </g>
)

const Juice = ({ tone = '#f0565c' }) => (
  <g>
    <Shadow />
    <path d="M30 24h40l-5 54a9 9 0 0 1-9 8H44a9 9 0 0 1-9-8L30 24Z" fill="#ffffff" opacity=".95" />
    <path d="M33.4 36h33.2l-4 42a5 5 0 0 1-5 4.6H42.4a5 5 0 0 1-5-4.6l-4-42Z" fill={tone} />
    <ellipse cx="50" cy="36" rx="16.6" ry="4" fill="#fff" opacity=".4" />
    <ellipse cx="50" cy="24" rx="20" ry="5" fill="#fff" />
    <rect x="56" y="6" width="6" height="26" rx="3" transform="rotate(14 59 19)" fill="#f6911e" />
    <path d="M40 46c-1 10-1 20 1 28" stroke="#fff" strokeWidth="2.6" opacity=".45" strokeLinecap="round" fill="none" />
  </g>
)

const Fries = ({ tone = '#e8452c', cheese = false, peri = false }) => (
  <g>
    <Shadow />
    <g fill="#f6c762">
      <rect x="31" y="22" width="9" height="42" rx="4" transform="rotate(-12 35 43)" />
      <rect x="45" y="16" width="9" height="46" rx="4" />
      <rect x="58" y="22" width="9" height="42" rx="4" transform="rotate(12 62 43)" />
      <rect x="38" y="24" width="9" height="40" rx="4" transform="rotate(-4 42 44)" />
      <rect x="52" y="24" width="9" height="40" rx="4" transform="rotate(5 56 44)" />
    </g>
    <path d="M28 50h44l-5 30a7 7 0 0 1-7 6H40a7 7 0 0 1-7-6l-5-30Z" fill={tone} />
    <path d="M34 58h32l-3 20H37l-3-20Z" fill="#fff" opacity=".22" />
    {cheese && <path d="M31 50c8 10 30 10 38 0 2 8-4 14-19 14s-21-6-19-14Z" fill="#f7c948" />}
    {peri && (
      <g fill="#a81f12">
        <circle cx="42" cy="34" r="2" />
        <circle cx="54" cy="28" r="1.8" />
        <circle cx="60" cy="40" r="1.8" />
        <circle cx="46" cy="44" r="1.6" />
      </g>
    )}
  </g>
)

const Nuggets = () => (
  <g>
    <Shadow />
    {[[34, 58, -14], [50, 64, 6], [66, 58, 16], [42, 42, -6], [58, 42, 10]].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
        <path d="M-13-8c6-5 14-5 20 0 5 4 4 11-2 14-6 3-14 3-19 0-5-3-5-10 1-14Z" fill="#e8ab5b" />
        <path d="M-10-6c5-4 11-4 16 0 4 3 3 8-2 10-5 2-11 2-15 0-4-2-4-7 1-10Z" fill="#f5cd8f" />
      </g>
    ))}
  </g>
)

const CheeseBalls = () => (
  <g>
    <Shadow />
    {[[36, 62, 14], [64, 62, 14], [50, 46, 15], [50, 70, 12]].map(([x, y, r], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={r} fill="#e4a752" />
        <circle cx={x} cy={y} r={r - 4} fill="#f7c76f" />
        <circle cx={x - 4} cy={y - 4} r="2.6" fill="#fde7bb" />
      </g>
    ))}
  </g>
)

const Fingers = () => (
  <g>
    <Shadow />
    {[[-18, -8], [0, -14], [18, -8], [-9, 4], [9, 4]].map(([dx, dy], i) => (
      <g key={i} transform={`translate(${50 + dx} ${58 + dy}) rotate(${dx * 1.2})`}>
        <rect x="-7" y="-20" width="14" height="40" rx="7" fill="#e3a251" />
        <rect x="-4.5" y="-16" width="9" height="32" rx="4.5" fill="#f4ca8d" />
      </g>
    ))}
  </g>
)

const Lollipop = () => (
  <g>
    <Shadow />
    {[[34, 34], [66, 34], [50, 48]].map(([x, y], i) => (
      <g key={i}>
        <rect x={x - 2.4} y={y + 8} width="4.8" height="30" rx="2.4" fill="#e8d2b4" />
        <circle cx={x} cy={y + 6} r="15" fill="#d98f4a" />
        <circle cx={x} cy={y + 6} r="11" fill="#f0b870" />
        <circle cx={x - 4} cy={y + 2} r="2.4" fill="#fbe0b4" />
      </g>
    ))}
  </g>
)

const Sandwich = () => (
  <g>
    <Shadow />
    <path d="M22 70 50 30l28 40c2 3 0 7-4 7H26c-4 0-6-4-4-7Z" fill="#f3d6a4" />
    <path d="M28 68 50 38l22 30H28Z" fill="#fdf0d8" />
    <path d="M30 60h40l-4-6H34l-4 6Z" fill="#8fc45f" />
    <path d="M32 52h36l-4-6H36l-4 6Z" fill="#ef6a5a" />
    <path d="M34 44h32l-4-6H38l-4 6Z" fill="#f7c948" />
  </g>
)

const Noodles = () => (
  <g>
    <Shadow />
    <path d="M20 48h60c0 18-12 32-26 32h-8C32 80 20 66 20 48Z" fill="#ef6a5a" />
    <path d="M26 53h48c-1 14-10 22-22 22h-4c-12 0-21-8-22-22Z" fill="#fde7cf" />
    <g stroke="#f3b23f" strokeWidth="3.4" fill="none" strokeLinecap="round">
      <path d="M30 50c4-8 10-12 16-10" />
      <path d="M42 48c2-9 8-14 15-13" />
      <path d="M56 50c3-7 9-10 14-8" />
      <path d="M36 44c3-6 8-9 13-8" />
    </g>
    <circle cx="44" cy="60" r="3.4" fill="#8fc45f" />
    <circle cx="58" cy="63" r="3" fill="#e8452c" />
  </g>
)

const Smiley = () => (
  <g>
    <Shadow />
    {[[36, 50, 15], [64, 50, 15], [50, 68, 15]].map(([x, y, r], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={r} fill="#e9a94f" />
        <circle cx={x} cy={y} r={r - 3} fill="#f8cd86" />
        <circle cx={x - 5} cy={y - 4} r="1.9" fill="#d08a39" />
        <circle cx={x + 5} cy={y - 4} r="1.9" fill="#d08a39" />
        <path d={`M${x - 6} ${y + 3}c3 4 9 4 12 0`} stroke="#d08a39" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
    ))}
  </g>
)

const FruitBowl = ({ level = 1 }) => (
  <g>
    <Shadow />
    <circle cx="36" cy="44" r="9" fill="#ef6a5a" />
    <circle cx="52" cy="38" r="10" fill="#f3b23f" />
    <circle cx="66" cy="45" r="8" fill="#8fc45f" />
    <circle cx="44" cy="34" r="7" fill="#a86fd1" />
    {level > 1 && <circle cx="60" cy="31" r="6" fill="#f0565c" />}
    {level > 2 && (
      <g>
        <circle cx="30" cy="34" r="5.4" fill="#f7c948" />
        <ellipse cx="50" cy="26" rx="7" ry="5.4" fill="#fdf3e0" />
        <circle cx="50" cy="26" r="2.6" fill="#f3b23f" />
      </g>
    )}
    <path d="M18 50h64c0 18-12 32-27 32h-10C30 82 18 68 18 50Z" fill="#fff" />
    <path d="M24 55h52c-1 14-10 22-23 22h-6c-13 0-22-8-23-22Z" fill="#dff0d6" />
    <path d="M24 55h52c-.4 5-1.6 9-3.4 12H27.4c-1.8-3-3-7-3.4-12Z" fill="#c9e6ba" />
  </g>
)

const ART = {
  chai: Chai, coffee: Coffee, malt: Malt, maltbowl: MaltBowl, greentea: GreenTea,
  cake: Cake, puff: Puff, brownie: Brownie, roll: Roll, bun: Bun,
  samosa: Samosa, minisamosa: MiniSamosa, bonda: Bonda, vadai: Vadai, bajji: Bajji,
  breadbajji: BreadBajji, juice: Juice, fries: Fries, nuggets: Nuggets,
  cheeseballs: CheeseBalls, fingers: Fingers, lollipop: Lollipop, sandwich: Sandwich,
  noodles: Noodles, smiley: Smiley, bowl: FruitBowl,
}

export function hasArt(name) {
  return Boolean(ART[name])
}

export default function FoodArt({ art, className = 'food-art', ...rest }) {
  const Drawing = ART[art]
  if (!Drawing) return null

  return (
    <svg viewBox="0 0 100 100" className={className} role="presentation" focusable="false">
      <Drawing {...rest} />
    </svg>
  )
}
