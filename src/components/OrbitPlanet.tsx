import { useId } from 'react';

/**
 * The student's planet. It grows with Orbit Level:
 * 1 planet · 2 ring · 3 first moon · 4 aurora ring + glow · 5 second moon · 6 star system
 */
export function OrbitPlanet({ level, size = 120, animated = true }: { level: number; size?: number; animated?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `${n}-${uid}`;
  const aurora = level >= 4;
  const r = 21 + Math.min(level, 6) * 0.8;
  const ringA = aurora ? ['#F9A8D4', '#FCD34D', '#5EEAD4'] : ['#C4B5FD', '#93C5FD', '#6EE7B7'];
  const planetStops = level === 1 ? ['#6D5BD0', '#4F7FD9', '#3AA58A'] : ['#7C3AED', '#3B82F6', '#10B981'];
  const orbit1 = 'M8 60 a52 30 0 1 0 104 0 a52 30 0 1 0 -104 0';
  const orbit2 = 'M2 60 a58 40 0 1 1 116 0 a58 40 0 1 1 -116 0';
  const ringPath = (front: boolean) =>
    front ? `M${60 + r * 1.75} 60 A${r * 1.75} ${r * 0.52} 0 0 1 ${60 - r * 1.75} 60` : `M${60 - r * 1.75} 60 A${r * 1.75} ${r * 0.52} 0 0 1 ${60 + r * 1.75} 60`;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-label={`Level ${level} planet`} role="img">
      <defs>
        <linearGradient id={id('p')} x1="35" y1="35" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={planetStops[0]} />
          <stop offset="0.52" stopColor={planetStops[1]} />
          <stop offset="1" stopColor={planetStops[2]} />
        </linearGradient>
        <linearGradient id={id('r')} x1="10" y1="60" x2="110" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={ringA[0]} />
          <stop offset="0.5" stopColor={ringA[1]} />
          <stop offset="1" stopColor={ringA[2]} />
        </linearGradient>
        <radialGradient id={id('s')} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${60 - r * 0.4} ${60 - r * 0.45}) rotate(45) scale(${r * 0.8})`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('d')} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${60 + r * 0.6} ${60 + r * 0.65}) rotate(45) scale(${r})`}>
          <stop offset="0" stopColor="#0B0F1A" stopOpacity="0" />
          <stop offset="1" stopColor="#0B0F1A" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id={id('g')} cx="60" cy="60" r="56" gradientUnits="userSpaceOnUse">
          <stop offset="0.35" stopColor={aurora ? '#F472B6' : '#8B5CF6'} stopOpacity="0.35" />
          <stop offset="1" stopColor={aurora ? '#F472B6' : '#8B5CF6'} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* glow: subtle from level 2, strong aurora from level 4 */}
      {level >= 2 && <circle cx="60" cy="60" r="56" fill={`url(#${id('g')})`} opacity={aurora ? 1 : 0.45} />}

      {/* star system sparkles */}
      {level >= 6 &&
        [
          [16, 22, 1.6],
          [104, 18, 1.2],
          [100, 98, 1.8],
          [20, 100, 1.1],
          [60, 8, 1.3],
          [112, 60, 1],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d={`M0 ${-s * 2.5} L${s * 0.6} 0 L0 ${s * 2.5} L${-s * 0.6} 0Z M${-s * 2.5} 0 L0 ${s * 0.6} L${s * 2.5} 0 L0 ${-s * 0.6}Z`} fill="#FDE68A">
              {animated && <animate attributeName="opacity" values="1;0.3;1" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />}
            </path>
          </g>
        ))}

      {/* outer orbit tracks for moons */}
      {level >= 3 && (
        <g transform="rotate(-22 60 60)" opacity="0.18">
          <path d={orbit1} stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" className="text-faint" />
          {level >= 5 && <path d={orbit2} stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" className="text-faint" />}
        </g>
      )}

      {level >= 2 && (
        <g transform="rotate(-22 60 60)">
          <path d={ringPath(false)} stroke={`url(#${id('r')})`} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        </g>
      )}

      <circle cx="60" cy="60" r={r} fill={`url(#${id('p')})`} />
      <circle cx="60" cy="60" r={r} fill={`url(#${id('d')})`} />
      <circle cx="60" cy="60" r={r} fill={`url(#${id('s')})`} />

      {level >= 2 && (
        <g transform="rotate(-22 60 60)">
          <path d={ringPath(true)} stroke={`url(#${id('r')})`} strokeWidth="5" strokeLinecap="round" />
        </g>
      )}

      {/* moons */}
      {level >= 3 && (
        <g transform="rotate(-22 60 60)">
          <circle r="5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" cx={animated ? 0 : 112} cy={animated ? 0 : 60}>
            {animated && <animateMotion dur="9s" repeatCount="indefinite" path={orbit1} />}
          </circle>
          {level >= 5 && (
            <circle r="3.6" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.8" cx={animated ? 0 : 2} cy={animated ? 0 : 60}>
              {animated && <animateMotion dur="14s" begin="-7s" repeatCount="indefinite" path={orbit2} />}
            </circle>
          )}
        </g>
      )}
    </svg>
  );
}
