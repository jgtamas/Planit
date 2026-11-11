import { useState } from 'react';
import { addDays, addWeeks, format, isSameDay, isToday, startOfWeek } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Heatmap } from '../components/Heatmap';
import type { Task } from '../types';
import { useStore } from '../lib/storeContext';
import { SOURCES } from '../lib/sources';
import { timeLabel, timeRange, isOverdue } from '../lib/dates';
import { COURSE_BY_ID } from '../data/mockData';
import { Button, PageHeader } from '../components/ui';

function WeekItem({ task }: { task: Task }) {
  const { openTask, connections } = useStore();
  const sources = task.sources.filter((s) => s === 'planit' || connections[s]?.connected);
  const color = SOURCES[sources[0] ?? 'planit'].color;
  const course = task.courseId ? COURSE_BY_ID[task.courseId] : undefined;
  const isEvent = task.kind === 'event';
  const overdue = isOverdue(task);

  return (
    <button
      onClick={() => openTask(task.id)}
      className={`group w-full rounded-xl border-l-[3px] px-2.5 py-2 text-left transition-all duration-150 hover:-translate-y-px hover:shadow-card ${
        task.completed ? 'opacity-50' : ''
      }`}
      style={{ borderLeftColor: color, background: `${color}${isEvent ? '14' : '1C'}` }}
    >
      <div className={`text-[12.5px] leading-snug font-semibold text-fg ${task.completed ? 'line-through' : ''}`}>{task.title}</div>
      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-medium text-muted">
        <span className={overdue ? 'text-rose-500' : ''}>{isEvent ? timeRange(task) : timeLabel(new Date(task.due))}</span>
        {course && <span className="truncate">· {course.name}</span>}
      </div>
      {sources.length > 1 && (
        <div className="mt-1.5 flex gap-1">
          {sources.map((s) => (
            <span key={s} className="h-1.5 w-1.5 rounded-full" style={{ background: SOURCES[s].color }} title={SOURCES[s].name} />
          ))}
        </div>
      )}
    </button>
  );
}

function WeekGrid() {
  const { visibleTasks } = useStore();
  const [offset, setOffset] = useState(0);
  const start = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), offset);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const end = days[6];

  const itemsFor = (d: Date) => visibleTasks.filter((t) => isSameDay(new Date(t.due), d));
  const totalWeek = days.reduce((n, d) => n + itemsFor(d).length, 0);

  const rangeLabel =
    start.getMonth() === end.getMonth()
      ? `${format(start, 'MMMM d')} – ${format(end, 'd')}`
      : `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;

  return (
    <div className="lg:-mx-4 xl:-mx-16">
      <PageHeader
        title="Week"
        subtitle={`${rangeLabel} · ${totalWeek} item${totalWeek === 1 ? '' : 's'}`}
        right={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setOffset((o) => o - 1)} aria-label="Previous week">
              <ChevronLeft size={16} />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setOffset(0)} disabled={offset === 0}>
              This week
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setOffset((o) => o + 1)} aria-label="Next week">
              <ChevronRight size={16} />
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 px-1 text-xs font-medium text-muted">
        {(['canvas', 'blackbaud', 'reminders', 'gcal', 'planit'] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: SOURCES[s].color }} />
            {SOURCES[s].name}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-7 lg:gap-2">
        {days.map((d) => {
          const items = itemsFor(d);
          const today = isToday(d);
          return (
            <div
              key={d.toISOString()}
              className={`flex flex-col rounded-2xl border bg-surface p-2.5 shadow-card lg:min-h-[420px] ${
                today ? 'border-brand-purple/50 ring-2 ring-brand-purple/15' : 'border-line'
              }`}
            >
              <div className="mb-2 flex items-center justify-between px-1 lg:flex-col lg:items-start lg:gap-0.5">
                <span className={`text-xs font-bold tracking-wide uppercase ${today ? 'text-brand-purple dark:text-violet-400' : 'text-muted'}`}>
                  {format(d, 'EEE')}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={`text-lg font-extrabold ${
                      today ? 'brand-gradient flex h-8 w-8 items-center justify-center rounded-full text-sm text-white' : 'text-fg'
                    }`}
                  >
                    {format(d, 'd')}
                  </span>
                  <span className="text-xs text-faint lg:hidden">{items.length} items</span>
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {items.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-faint">Free day</p>
                ) : (
                  items.map((t) => <WeekItem key={t.id} task={t} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type View = 'week' | 'month';

export function Week() {
  const [view, setView] = useState<View>(() => {
    try {
      return (localStorage.getItem('planit:calendarView') as View) || 'week';
    } catch {
      return 'week';
    }
  });
  const choose = (v: View) => {
    setView(v);
    try {
      localStorage.setItem('planit:calendarView', v);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <div className="mb-5 inline-grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1" role="tablist" aria-label="Calendar view">
        {(
          [
            ['week', 'Week', CalendarDays],
            ['month', 'Workload', Flame],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => choose(id)}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-150 ${
              view === id ? 'bg-surface text-fg shadow-card' : 'text-muted hover:text-fg'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {view === 'week' ? (
        <WeekGrid />
      ) : (
        <>
          <PageHeader title="Workload" subtitle="How heavy each day is, from time estimates and events. Spot crunch weeks early." />
          <Heatmap />
        </>
      )}
    </div>
  );
}
