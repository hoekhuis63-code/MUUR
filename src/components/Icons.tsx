// Kleine inline iconen (geen icon-library nodig).
type Props = { className?: string };
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  viewBox: '0 0 24 24',
};

export const IconLock = ({ className }: Props) => (
  <svg {...base} className={className}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
export const IconReceipt = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);
export const IconCalendar = ({ className }: Props) => (
  <svg {...base} className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);
export const IconVideo = ({ className }: Props) => (
  <svg {...base} className={className}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="m16 10 5-3v10l-5-3" />
  </svg>
);
export const IconArrow = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
