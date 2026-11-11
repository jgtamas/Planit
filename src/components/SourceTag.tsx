import type { SourceId } from '../types';
import { SOURCES } from '../lib/sources';

export function SourceDot({ source, size = 8 }: { source: SourceId; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: SOURCES[source].color }}
    />
  );
}

export function SourceTag({ source, compact = false }: { source: SourceId; compact?: boolean }) {
  const meta = SOURCES[source];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
      }`}
      style={{ color: meta.color, background: `${meta.color}1F` }}
    >
      <SourceDot source={source} size={6} />
      {meta.short}
    </span>
  );
}

export function SourceTags({ sources, compact }: { sources: SourceId[]; compact?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {sources.map((s) => (
        <SourceTag key={s} source={s} compact={compact} />
      ))}
    </span>
  );
}

/** Small logo-like square for a source, used on Connections and onboarding. */
export function SourceIcon({ source, size = 40 }: { source: SourceId; size?: number }) {
  const meta = SOURCES[source];
  const letter = { canvas: 'C', blackbaud: 'B', reminders: 'R', gcal: 'G', planit: 'P' }[source];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl font-extrabold text-white shadow-sm"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(140deg, ${meta.color}, ${meta.color}CC)`,
      }}
      aria-hidden
    >
      {letter}
    </span>
  );
}
