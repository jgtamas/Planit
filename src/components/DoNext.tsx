import { ArrowRight, Target, Timer } from 'lucide-react';
import type { Ranked } from '../lib/planning';
import { estimateOf, formatMinutes } from '../lib/planning';
import { useStore } from '../lib/storeContext';
import { COURSE_BY_ID } from '../data/mockData';
import { dueLabel, isOverdue } from '../lib/dates';
import { Button, Card, PriorityDot } from './ui';

/** Smart Prioritization: the single best thing to work on now, plus what comes after. */
export function DoNext({ ranked }: { ranked: Ranked[] }) {
  const { openTask, startFocus } = useStore();
  if (ranked.length === 0) return null;
  const [top, ...rest] = ranked;
  const course = top.task.courseId ? COURSE_BY_ID[top.task.courseId] : undefined;

  return (
    <Card className="relative overflow-hidden">
      <div className="brand-gradient absolute inset-y-0 left-0 w-1" />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-brand-purple uppercase dark:text-violet-300">
          <Target size={14} /> Do this next
        </div>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button className="min-w-0 flex-1 text-left" onClick={() => openTask(top.task.id)}>
            <h3 className="text-xl font-extrabold tracking-tight text-fg">{top.task.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted">
              {course && (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: course.color }} />
                  {course.name}
                </span>
              )}
              <span className={isOverdue(top.task) ? 'font-semibold text-rose-500' : ''}>{dueLabel(top.task)}</span>
              <span>· ~{formatMinutes(estimateOf(top.task))}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {top.reasons.map((r) => (
                <span key={r} className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-muted">
                  {r}
                </span>
              ))}
            </div>
          </button>
          <Button variant="primary" size="lg" className="shrink-0" onClick={() => startFocus(top.task.id)}>
            <Timer size={17} /> Start focus
          </Button>
        </div>
      </div>

      {rest.length > 0 && (
        <div className="border-t border-line px-5 py-3 sm:px-6">
          <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-faint uppercase">Then</div>
          {rest.slice(0, 2).map((r, i) => (
            <button
              key={r.task.id}
              onClick={() => openTask(r.task.id)}
              className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2"
            >
              <span className="w-4 text-xs font-bold text-faint">{i + 2}</span>
              <PriorityDot priority={r.task.priority} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{r.task.title}</span>
              <span className="hidden shrink-0 text-xs text-muted sm:inline">{r.reasons[0]}</span>
              <span className="shrink-0 text-xs text-faint">~{formatMinutes(estimateOf(r.task))}</span>
              <ArrowRight size={14} className="shrink-0 text-faint" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
