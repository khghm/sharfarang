import React from "react";

type IconProps = { className?: string; strokeWidth?: number };

const base = (props: IconProps) => ({
  className: props.className ?? "w-6 h-6",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: props.strokeWidth ?? 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/* ── آیکون تالارها ─────────────────────────────── */

export const GameIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="7.5" width="18" height="10" rx="5" />
    <path d="M7.5 10.5v4M5.5 12.5h4" />
    <circle cx="15.5" cy="11.3" r="0.4" fill="currentColor" />
    <circle cx="18" cy="13.3" r="0.4" fill="currentColor" />
    <path d="M3.5 17.5 5 19M20.5 17.5 19 19" />
  </svg>
);

export const AutoIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M4 15.5 5.4 11a2 2 0 0 1 1.9-1.5h9.4a2 2 0 0 1 1.9 1.5L20 15.5" />
    <path d="M8.6 9.5 9.8 6.4h4.4l1.2 3.1" />
    <path d="M3 15.5h18v2.6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <circle cx="7.4" cy="16.9" r="1.1" />
    <circle cx="16.6" cy="16.9" r="1.1" />
    <path d="M3.6 12.2h1.6M18.8 12.2h1.6" />
  </svg>
);

export const CompIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="11" rx="1.4" />
    <rect x="6.4" y="6.2" width="11.2" height="6.6" />
    <path d="M8.4 8.6 10 10l-1.6 1.4M11.6 11.4h3" />
    <path d="M10.2 15 9.4 18h5.2l-.8-3M7.5 20.4h9" />
  </svg>
);

export const AvIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <circle cx="10.5" cy="10.5" r="6.8" />
    <circle cx="10.5" cy="10.5" r="1.3" />
    <circle cx="10.5" cy="6.6" r="1.2" />
    <circle cx="14" cy="12.6" r="1.2" />
    <circle cx="7" cy="12.6" r="1.2" />
    <path d="M16.6 14.9 21 17.4M4.5 20.6h16.5" />
  </svg>
);

export const CommIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M5.4 9.2a6.6 6.6 0 0 1 13.2 0" />
    <circle cx="5" cy="9.6" r="1.7" />
    <circle cx="19" cy="9.6" r="1.7" />
    <path d="M5.5 13.5 7 10.8h10l1.5 2.7v3.6a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z" />
    <circle cx="12" cy="15" r="1.9" />
    <circle cx="12" cy="15" r="0.5" fill="currentColor" />
  </svg>
);

export const PhotoIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="3.5" y="7" width="17" height="12" rx="2" />
    <circle cx="12" cy="13" r="3.6" />
    <circle cx="12" cy="13" r="1.4" />
    <rect x="5.8" y="9.2" width="2.4" height="1.7" />
    <circle cx="17.6" cy="9.9" r="0.9" />
    <path d="M8 4.6h5l1.2 2.4H9.2z" />
  </svg>
);

export const OfficeIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="8.2" y="3" width="7.6" height="4.6" />
    <path d="M9.6 4.6h4.8" />
    <rect x="4" y="7.6" width="16" height="8.4" rx="1.4" />
    <circle cx="8" cy="11" r="0.6" fill="currentColor" />
    <circle cx="11" cy="11" r="0.6" fill="currentColor" />
    <circle cx="14" cy="11" r="0.6" fill="currentColor" />
    <circle cx="17" cy="11" r="0.6" fill="currentColor" />
    <path d="M7.4 13.8h9.2M6 19.4h12" />
    <path d="M7.4 16v3.4M16.6 16v3.4" />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M12 2.8c1.2 1.5 1.2 3 0 4.4-1.2-1.4-1.2-2.9 0-4.4Z" />
    <path d="M9.6 9h4.8l-.9 4.2h-3z" />
    <path d="M10.5 13.2v1.6h3v-1.6" />
    <path d="M8.2 14.8h7.6l.9 3.4a1 1 0 0 1-1 1.2H8.3a1 1 0 0 1-1-1.2z" />
    <path d="M16.6 15.6h2.4M5 15.6h2.4" />
    <path d="M9.2 21.6h5.6" />
  </svg>
);

/* ── آیکون‌های کاربردی ─────────────────────────── */

export const SearchIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="m15.6 15.6 4.4 4.4" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ArrowNext: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M14 5l-7 7 7 7" />
  </svg>
);

export const ArrowPrev: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="m10 5 7 7-7 7" />
  </svg>
);

export const TicketIcon: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M4 7h16v3.2a1.8 1.8 0 0 0 0 3.6V17H4v-3.2a1.8 1.8 0 0 0 0-3.6z" />
    <path d="M13.5 7v10" strokeDasharray="1.5 2.4" />
  </svg>
);

export const StarBurst: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>
);

export const CornerOrnament: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M2 38V14a12 12 0 0 1 12-12h24" />
    <path d="M2 38V26a8 8 0 0 1 8-8h12" opacity="0.55" />
    <circle cx="8" cy="8" r="2.4" />
  </svg>
);

export const CATEGORY_ICONS: Record<string, React.FC<IconProps>> = {
  gaming: GameIcon,
  auto: AutoIcon,
  comp: CompIcon,
  av: AvIcon,
  comm: CommIcon,
  photo: PhotoIcon,
  office: OfficeIcon,
  home: HomeIcon,
};
