import { useId } from 'react';

/** Circular progress styled as an orbit, with a small moon marking progress. */
export function OrbitRing({ done, total, size = 132 }: { done: number; total: number; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const pct = total === 0 ? 0 : done / total;
  const stroke = 9;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const angle = pct * 2 * Math.PI - Math.PI / 2;
  const cx = size / 2 + r * Math.cos(angle);
  const cy = size / 2 + r * Math.sin(angle);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`og-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7C3AED" />
            <stop offset="0.55" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--app-line-strong)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#og-${uid})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
        />
        {pct > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={stroke / 2 + 2.5}
            fill="#fff"
            stroke="#10B981"
            strokeWidth={2.5}
            style={{ transition: 'cx 700ms cubic-bezier(0.2,0.8,0.2,1), cy 700ms cubic-bezier(0.2,0.8,0.2,1)' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] leading-none font-extrabold tracking-tight text-fg">
          {done}
          <span className="text-lg font-bold text-faint">/{total}</span>
        </span>
        <span className="mt-1 text-[11px] font-semibold tracking-wide text-muted uppercase">done today</span>
      </div>
    </div>
  );
}
