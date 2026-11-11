import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import type { Task } from '../types';
import { useStore } from '../lib/storeContext';
import { estimateOf, formatMinutes } from '../lib/planning';
import { TaskCard } from './TaskCard';
import { Button, Card } from './ui';

interface DayLoad {
  date: Date;
  work: number;
  events: number;
  total: number;
  items: Task[];
}

/** Bucket thresholds in minutes: light < 1h, moderate < 2h, heavy < 3.5h, crunch beyond. */
const BUCKETS = [
  { max: 0, label: 'Free' },
  { max: 60, label: 'Light' },
  { max: 120, label: 'Moderate' },
  { max: 210, label: 'Heavy' },
  { max: Infinity, label: 'Crunch' },
];

function bucket(total: number): number {
  if (total <= 0) return 0;
  return BUCKETS.findIndex((b, i) => i > 0 && total < b.max);
}

const cellBg = (b: number) => `var(--heat-${b})`;
const cellInk = (b: number) => (b >= 3 ? `var(--heat-ink-${b})` : undefined);

export function Heatmap() {
  const { visibleTasks } = useStore();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Date>(new Date());
  const [hover, setHover] = useState<DayLoad | null>(null);

  const month = addMonths(startOfMonth(new Date()), offset);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  const loads = useMemo(
    () =>
      days.map<DayLoad>((date) => {
        const items = visibleTasks.filter((t) => isSameDay(new Date(t.due), date));
        const work = items.filter((t) => t.kind !== 'event').reduce((n, t) => n + estimateOf(t), 0);
        const events = items.filter((t) => t.kind === 'event').reduce((n, t) => n + estimateOf(t), 0);
        return { date, work, events, total: work + events, items };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleTasks, offset],
  );

  // heaviest Mon–Sun week touching this month
  const crunch = useMemo(() => {
    let best = { start: days[0], total: 0 };
    for (let i = 0; i < loads.length; i += 7) {
      const total = loads.slice(i, i + 7).reduce((n, d) => n + d.total, 0);
      if (total > best.total) best = { start: loads[i].date, total };
    }
    return best;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loads]);

  const sel = loads.find((d) => isSameDay(d.date, selected));
  const monthTotal = loads.filter((d) => isSameMonth(d.date, month)).reduce((n, d) => n + d.total, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-fg">{format(month, 'MMMM yyyy')}</h2>
          <p className="text-sm text-muted">~{formatMinutes(monthTotal)} of work and commitments this month</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setOffset((o) => o - 1)} aria-label="Previous month">
            <ChevronLeft size={16} />
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setOffset(0)} disabled={offset === 0}>
            This month
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setOffset((o) => o + 1)} aria-label="Next month">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {crunch.total >= 360 && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card">
          <Flame size={18} className="mt-0.5 shrink-0 text-rose-500" />
          <div className="text-sm">
            <span className="font-bold text-fg">
              Crunch week: {format(crunch.start, 'MMM d')} – {format(addDays(crunch.start, 6), 'MMM d')}
            </span>
            <span className="text-muted"> · ~{formatMinutes(crunch.total)} planned. Start the big items early.</span>
          </div>
        </div>
      )}

      <Card className="relative p-3 sm:p-4">
        <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold tracking-wide text-faint uppercase">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2" onMouseLeave={() => setHover(null)}>
          {loads.map((d) => {
            const b = bucket(d.total);
            const inMonth = isSameMonth(d.date, month);
            const isSel = isSameDay(d.date, selected);
            return (
              <button
                key={d.date.toISOString()}
                onClick={() => setSelected(d.date)}
                onMouseEnter={() => setHover(d)}
                onFocus={() => setHover(d)}
                aria-label={`${format(d.date, 'EEEE, MMMM d')}: ${BUCKETS[b].label}, ${d.total ? formatMinutes(d.total) : 'nothing planned'}`}
                className={`relative flex aspect-square flex-col justify-between rounded-lg p-1.5 text-left transition-all duration-150 hover:scale-[1.04] sm:aspect-[1.25] sm:rounded-xl sm:p-2 ${
                  inMonth ? '' : 'opacity-35'
                } ${isSel ? 'ring-2 ring-fg/70 ring-offset-2 ring-offset-surface' : ''}`}
                style={{ background: cellBg(b), color: cellInk(b) }}
              >
                <span className={`text-[11px] font-bold sm:text-xs ${cellInk(b) ? '' : 'text-fg'}`}>
                  {isToday(d.date) ? (
                    <span className="brand-gradient inline-flex h-5 w-5 items-center justify-center rounded-full text-white">{format(d.date, 'd')}</span>
                  ) : (
                    format(d.date, 'd')
                  )}
                </span>
                {d.total > 0 && (
                  <span className={`hidden text-[11px] font-semibold sm:block ${cellInk(b) ? 'opacity-90' : 'text-muted'}`}>
                    {formatMinutes(d.total)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
            <span className="mr-1">Lighter</span>
            {BUCKETS.map((b, i) => (
              <span key={b.label} className="flex items-center gap-1">
                <span className="h-3.5 w-3.5 rounded" style={{ background: cellBg(i) }} title={b.label} />
              </span>
            ))}
            <span className="ml-1">Heavier</span>
          </div>
          <div className="text-[11px] text-faint">Free · &lt;1h · 1–2h · 2–3.5h · 3.5h+</div>
        </div>

        {/* hover tooltip */}
        {hover && (
          <div className="pointer-events-none absolute top-3 right-3 z-10 hidden w-60 rounded-xl border border-line bg-raised p-3 text-xs shadow-2xl md:block">
            <div className="font-bold text-fg">{format(hover.date, 'EEEE, MMM d')}</div>
            <div className="mt-0.5 text-muted">
              {BUCKETS[bucket(hover.total)].label}
              {hover.total > 0 && ` · ~${formatMinutes(hover.total)}`}
            </div>
            {hover.total > 0 && (
              <div className="mt-1.5 text-faint">
                {formatMinutes(hover.work)} work{hover.events > 0 && ` · ${formatMinutes(hover.events)} events`}
              </div>
            )}
            {hover.items.slice(0, 4).map((t) => (
              <div key={t.id} className="mt-1.5 flex justify-between gap-2 text-fg">
                <span className="truncate">{t.title}</span>
                <span className="shrink-0 text-muted">{formatMinutes(estimateOf(t))}</span>
              </div>
            ))}
            {hover.items.length > 4 && <div className="mt-1 text-faint">+{hover.items.length - 4} more</div>}
          </div>
        )}
      </Card>

      {/* selected day detail (doubles as the table view) */}
      {sel && (
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2 px-1">
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">{format(sel.date, 'EEEE, MMM d')}</h3>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted">
              {sel.total ? `~${formatMinutes(sel.total)}` : 'Free'}
            </span>
          </div>
          {sel.items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong px-4 py-5 text-center text-sm text-muted">Nothing planned. A good day to get ahead.</p>
          ) : (
            <div className="space-y-2.5">
              {sel.items.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
