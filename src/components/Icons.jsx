// Small inline icon set — keeps the bundle tiny and the strokes consistent.

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function ChefHat({ size = 40 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path
        d="M24 6c-4.2 0-7.8 2.5-9.4 6.1C9.9 12.5 6 16.5 6 21.4c0 3.4 1.9 6.4 4.7 8v2.2c0 1.2 1 2.2 2.2 2.2h22.2c1.2 0 2.2-1 2.2-2.2v-2.2c2.8-1.6 4.7-4.6 4.7-8 0-4.9-3.9-8.9-8.6-9.3C31.8 8.5 28.2 6 24 6z"
        fill="#f97316"
      />
      <rect x="12.8" y="35.2" width="22.4" height="5.2" rx="2.6" fill="#f97316" />
      <path d="M18 18.5c1.6-1.4 3.6-2.1 6-2.1s4.4.7 6 2.1" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function GridIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className="ico" {...props} aria-hidden="true">
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" />
    </svg>
  )
}

export function SunriseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className="ico" {...stroke} {...props} aria-hidden="true">
      <path d="M12 4v3M5 9l2 2M19 9l-2 2M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0" />
    </svg>
  )
}

export function BowlIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className="ico" {...stroke} {...props} aria-hidden="true">
      <path d="M3 12h18a8 8 0 0 1-8 7h-2a8 8 0 0 1-8-7Z" />
      <path d="M9 7c0-1.2 1-1.8 1-3M13 7c0-1.2 1-1.8 1-3" />
    </svg>
  )
}

export function LeafIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className="ico" {...stroke} {...props} aria-hidden="true">
      <path d="M4 16c3-7 9-11 16-11-1 7-5 13-12 15l-4-4Z" />
      <path d="M8 12c2 .4 3.6 2 4 4" />
    </svg>
  )
}

export function CartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="18" cy="20" r="1.6" />
      <path d="M2 3h2.2l2.3 11.4a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.6L21 7H5.3" />
    </svg>
  )
}

export function QrIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20 14h1M14 20h3M20 17v4" />
    </svg>
  )
}

export function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" className="arr" {...stroke} {...props} aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}


export function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
      <circle cx="10" cy="8" r="3.2" />
      <path d="M20 19v-1.4a3.4 3.4 0 0 0-2.6-3.3M15.6 5.2a3.2 3.2 0 0 1 0 6" />
    </svg>
  )
}

export function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6l-7-3Z" />
      <path d="M12 11v3" />
      <circle cx="12" cy="9" r=".6" fill="currentColor" />
    </svg>
  )
}

export function ReceiptIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M6 3h12v18l-2.5-1.6L13 21l-2.5-1.6L8 21l-2-1.4V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  )
}

export function CardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2.6" />
      <path d="M2.5 9.5h19M6 14.5h4" />
    </svg>
  )
}

export function ChevronIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" {...stroke} {...props} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function TrendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M3 17l5.5-5.5 3.5 3.5L21 6" />
      <path d="M15 6h6v6" />
    </svg>
  )
}

export function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CupIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className="ico" {...stroke} {...props} aria-hidden="true">
      <path d="M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z" />
      <path d="M16 11h2.2a2.3 2.3 0 0 1 0 4.6H16" />
      <path d="M8 3.5c0 1-.9 1.4-.9 2.5M12 3.5c0 1-.9 1.4-.9 2.5" />
    </svg>
  )
}

export function GlassIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className="ico" {...stroke} {...props} aria-hidden="true">
      <path d="M6.5 4h11l-1.3 15.2a2 2 0 0 1-2 1.8H9.8a2 2 0 0 1-2-1.8L6.5 4Z" />
      <path d="M7 9h10" />
      <path d="M14.5 2.5 12 6" />
    </svg>
  )
}

export function UtensilsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
      <path d="M15 11v11M5 2v8a3 3 0 0 0 3 3h1v9" />
    </svg>
  )
}

export function WalletIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
      <path d="M16 3H4a2 2 0 0 0-2 2v2h18V5a2 2 0 0 0-2-2Z" />
      <circle cx="16" cy="14" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function ArrowDownLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M17 7 7 17M17 17H7V7" />
    </svg>
  )
}

export function ArrowUpRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  )
}

export function TagIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="m12.5 3.5 8 8a2.1 2.1 0 0 1 0 3l-6 6a2.1 2.1 0 0 1-3 0l-8-8V3.5h9Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function BarChartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  )
}

export function ClockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

export function SlidersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
  )
}

export function BankIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="m2 9 10-6 10 6v2H2V9ZM4 11v8M9 11v8M15 11v8M20 11v8M2 19h20v2H2v-2Z" />
    </svg>
  )
}

export function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" />
    </svg>
  )
}

export function CameraIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="14" r="4" />
    </svg>
  )
}

export function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <path d="m12 3 1.9 4.8L18.7 9.7l-4.8 1.9L12 16.5l-1.9-4.9L5.3 9.7l4.8-1.9L12 3ZM19 16l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
    </svg>
  )
}

export function CheckCircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5" />
    </svg>
  )
}

export function CategoryIcon({ icon, ...rest }) {
  if (icon === 'cup') return <CupIcon {...rest} />
  if (icon === 'glass') return <GlassIcon {...rest} />
  if (icon === 'sunrise') return <SunriseIcon {...rest} />
  if (icon === 'bowl') return <BowlIcon {...rest} />
  if (icon === 'leaf') return <LeafIcon {...rest} />
  return <GridIcon {...rest} />
}

