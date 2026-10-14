import type { ReactNode } from "react";

export function PhoneFrame({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <svg className="h-android" viewBox="0 0 644 1356" role="img" aria-label={label}>
      <defs>
        <clipPath id={`${id}-screen`}>
          <rect x="18" y="18" width="608" height="1320" rx="58" />
        </clipPath>
        <linearGradient id={`${id}-frame`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b2c2f" />
          <stop offset="0.5" stopColor="#151618" />
          <stop offset="1" stopColor="#222326" />
        </linearGradient>
      </defs>
      <rect x="640" y="300" width="6" height="92" rx="3" fill="#2a2b2e" />
      <rect x="640" y="430" width="6" height="150" rx="3" fill="#2a2b2e" />
      <rect x="0.5" y="0.5" width="643" height="1355" rx="78" fill={`url(#${id}-frame)`} stroke="#3a3b3f" />
      <rect x="9" y="9" width="626" height="1338" rx="68" fill="#050506" />
      <g clipPath={`url(#${id}-screen)`}>{children}</g>
    </svg>
  );
}
