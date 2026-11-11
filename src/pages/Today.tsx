import { useState, type ReactNode } from 'react';
import { addDays, endOfDay, format, isToday, startOfDay } from 'date-fns';
import { AlertCircle, ChevronDown, Clock, GitMerge, Link2, Timer } from 'lucide-react';
import { useStore } from '../lib/storeContext';
import { greeting, isOverdue } from '../lib/dates';
import { CONNECTABLE } from '../lib/sources';
import { TaskCard } from '../components/TaskCard';
import { QuickAdd } from '../components/QuickAdd';
import { OrbitRing } from '../components/OrbitRing';
import { EmptyState } from '../components/EmptyState';
import { LevelCard } from '../components/Levels';
import { DoNext } from '../components/DoNext';
import { estimateOf, formatMinutes, rankTasks } from '../lib/planning';
import { Button, Card } from '../components/ui';
import type { Task } from '../types';

function Section({
  title,
  count,
  tone,
  children,
  empty,
}: {
  title: string;
  count: number;
  tone?: 'danger';
  children: ReactNode;
  empty?: string;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2 px-1">
        <h2 className={`text-sm font-bold tracking-wide uppercase ${tone === 'danger' ? 'text-rose-500' : 'text-muted'}`}>{title}</h2>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted">{count}</span>
      </div>
      {count === 0 && empty ? (
        <p className="rounded-2xl border border-dashed border-line-strong px-4 py-5 text-center text-sm text-muted">{empty}</p>
      ) : (
        <div className="space-y-2.5">{children}</div>
      )}
    </section>
  );
}

export function Today() {
  const { visibleTasks, settings, connections, setPage, progress } = useStore();
  const [showDone, setShowDone] = useState(false);
  const now = new Date();
  const todayEnd = endOfDay(now);
  const weekEnd = endOfDay(addDays(now, 7));

  const connectedCount = CONNECTABLE.filter((s) => connections[s].connected).length;
  const open = visibleTasks.filter((t) => !t.completed);
  const overdue = open.filter((t) => isOverdue(t, now));
  const dueToday = open.filter((t) => {
    const d = new Date(t.due);
    return d >= startOfDay(now) && d <= todayEnd;
  });
  const comingUp = open.filter((t) => {
    const d = new Date(t.due);
    return d > todayEnd && d <= weekEnd;
  });
  const done = visibleTasks.filter(
    (t) => t.completed && ((t.completedAt && isToday(new Date(t.completedAt))) || isToday(new Date(t.due))),
  );

  const todaysWork = visibleTasks.filter(
    (t) => t.kind !== 'event' && (isToday(new Date(t.due)) || (t.completed && t.completedAt && isToday(new Date(t.completedAt)))),
  );
  const doneToday = todaysWork.filter((t) => t.completed).length;
  const merged = visibleTasks.filter((t) => t.sources.filter((s) => s === 'planit' || connections[s]?.connected).length > 1).length;
  const remaining = todaysWork.length - doneToday;
  const ranked = rankTasks(visibleTasks, now);
  const tonightMin = [...overdue, ...dueToday].filter((t) => t.kind !== 'event').reduce((n, t) => n + estimateOf(t), 0);
  const focusedToday = progress.sessions.filter((s) => isToday(new Date(s.at))).reduce((n, s) => n + s.minutes, 0);

  const firstName = settings.name.trim().split(' ')[0] || 'there';

  const list = (tasks: Task[]) => tasks.map((t) => <TaskCard key={t.id} task={t} />);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold text-muted">{format(now, 'EEEE, MMMM d')}</p>
        <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-fg sm:text-[32px]">
          {greeting(now)}, {firstName}
        </h1>
      </div>

      {connectedCount === 0 && visibleTasks.length === 0 ? (
        <EmptyState
          size={72}
          title="Your orbit is empty"
          body="Connect Canvas, Blackbaud, Reminders, or Google Calendar and Planit will pull everything into one place."
          action={
            <Button variant="primary" onClick={() => setPage('connections')}>
              <Link2 size={16} /> Connect accounts
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
          <Card className="relative overflow-hidden p-5 sm:p-6">
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-purple/10 blur-3xl" />
            <div className="relative flex h-full flex-col items-center gap-6 sm:flex-row sm:items-center">
              <OrbitRing done={doneToday} total={todaysWork.length} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-bold text-fg">
                  {todaysWork.length === 0
                    ? 'Nothing due today'
                    : remaining === 0
                      ? 'Everything for today is done'
                      : `${remaining} thing${remaining === 1 ? '' : 's'} left in today’s orbit`}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {overdue.length > 0
                    ? `Start with the ${overdue.length} overdue item${overdue.length === 1 ? '' : 's'}, then work through today.`
                    : 'You’re caught up on past work. Nice.'}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Stat icon={<Clock size={13} className="text-brand-blue" />} label="tonight" value={`~${formatMinutes(tonightMin)}`} />
                  <Stat icon={<AlertCircle size={13} className="text-rose-500" />} label="Overdue" value={overdue.length} />
                  {focusedToday > 0 && (
                    <Stat icon={<Timer size={13} className="text-brand-green" />} label="focused" value={formatMinutes(focusedToday)} />
                  )}
                  {merged > 0 && (
                    <Stat icon={<GitMerge size={13} className="text-brand-purple" />} label="Merged" value={merged} />
                  )}
                </div>
              </div>
            </div>
          </Card>
          <LevelCard />
          </div>

          <div className="mt-6">
            <QuickAdd />
          </div>

          {ranked.length > 0 && (
            <div className="mt-6">
              <DoNext ranked={ranked} />
            </div>
          )}

          {overdue.length > 0 && (
            <Section title="Overdue" count={overdue.length} tone="danger">
              {list(overdue)}
            </Section>
          )}
          <Section title="Due today" count={dueToday.length} empty="Nothing else due today. Add something above or take a breather.">
            {list(dueToday)}
          </Section>
          <Section title="Coming up" count={comingUp.length} empty="Nothing in the next 7 days.">
            {list(comingUp)}
          </Section>

          {done.length > 0 && (
            <section className="mt-8">
              <button
                onClick={() => setShowDone((s) => !s)}
                className="mb-3 flex items-center gap-2 px-1 text-sm font-bold tracking-wide text-muted uppercase transition-colors hover:text-fg"
              >
                <ChevronDown size={16} className={`transition-transform duration-200 ${showDone ? '' : '-rotate-90'}`} />
                Done
                <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-xs font-semibold text-brand-green">{done.length}</span>
              </button>
              {showDone && <div className="space-y-2.5">{list(done)}</div>}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted">
      {icon}
      <span className="text-fg">{value}</span> {label}
    </span>
  );
}
