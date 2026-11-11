import { useId } from 'react';

interface PlanitLogoProps {
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Planit mark: a gradient planet with a tilted ring.
 * The ring is split into a back arc (drawn before the planet) and a front arc
 * (drawn after it) so it reads as wrapping around the planet.
 */
export function PlanitLogo({ size = 32, className, title = 'Planit' }: PlanitLogoProps) {
  const uid = useId().replace(/:/g, '');
  const planet = `planet-${uid}`;
  const ring = `ring-${uid}`;
  const shine = `shine-${uid}`;
  const shade = `shade-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id={planet} x1="18" y1="14" x2="46" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="0.52" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id={ring} x1="4" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C4B5FD" />
          <stop offset="0.5" stopColor="#93C5FD" />
          <stop offset="1" stopColor="#6EE7B7" />
        </linearGradient>
        <radialGradient id={shine} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(25 23) rotate(45) scale(13)">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={shade} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(42 43) rotate(45) scale(16)">
          <stop offset="0" stopColor="#0B0F1A" stopOpacity="0" />
          <stop offset="1" stopColor="#0B0F1A" stopOpacity="0.28" />
        </radialGradient>
      </defs>

      <g transform="rotate(-22 32 32)">
        {/* back half of ring (behind planet) */}
        <path
          d="M4.5 32 A27.5 8.5 0 0 1 59.5 32"
          stroke={`url(#${ring})`}
          strokeWidth="3.6"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>

      {/* planet */}
      <circle cx="32" cy="32" r="16.5" fill={`url(#${planet})`} />
      <circle cx="32" cy="32" r="16.5" fill={`url(#${shade})`} />
      <circle cx="32" cy="32" r="16.5" fill={`url(#${shine})`} />

      <g transform="rotate(-22 32 32)">
        {/* front half of ring (over planet) */}
        <path
          d="M59.5 32 A27.5 8.5 0 0 1 4.5 32"
          stroke={`url(#${ring})`}
          strokeWidth="3.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function PlanitWordmark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <PlanitLogo size={size} />
      <span className="text-[1.15rem] font-extrabold tracking-tight text-fg">Planit</span>
    </div>
  );
}
