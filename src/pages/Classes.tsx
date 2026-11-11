import { useState } from 'react';
import { addDays, endOfDay } from 'date-fns';
import { ArrowLeft, BookOpen, Briefcase, ChevronDown, Church, FlaskConical, Landmark, Sigma, type LucideIcon } from 'lucide-react';
import { useStore } from '../lib/storeContext';
import { COURSES, COURSE_BY_ID } from '../data/mockData';
import { dueLabel, isOverdue } from '../lib/dates';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { Button, Card, PageHeader } from '../components/ui';

const ICONS: Record<string, LucideIcon> = {
  apbus: Briefcase,
  apush: Landmark,
  precalc: Sigma,
  eng11: BookOpen,
  chem: FlaskConical,
  theo: Church,
};

function ClassDetail({ id }: { id: string }) {
  const { visibleTasks, setClassFilter } = useStore();
  const [showDone, setShowDone] = useState(false);
  const course = COURSE_BY_ID[id];
  const Icon = ICONS[id];
  const tasks = visibleTasks.filter((t) => t.courseId === id);
  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div>
      <button
        onClick={() => setClassFilter(null)}
        className="mb-5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <ArrowLeft size={16} /> All classes
      </button>
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${course.color}22`, color: course.color }}>
          <Icon size={26} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-[28px]">{course.name}</h1>
          <p className="text-sm text-muted">
            {course.teacher} · {course.period} · Room {course.room}
          </p>
        </div>
      </div>

      <h2 className="mb-3 px-1 text-sm font-bold tracking-wide text-muted uppercase">
        Open <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs">{open.length}</span>
      </h2>
      {open.length === 0 ? (
        <EmptyState title="All caught up" body={`Nothing open for ${course.name}. Enjoy it while it lasts.`} />
      ) : (
        <div className="space-y-2.5">
          {open.map((t) => (
            <TaskCard key={t.id} task={t} showCourse={false} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <section className="mt-8">
          <button
            onClick={() => setShowDone((s) => !s)}
            className="mb-3 flex items-center gap-2 px-1 text-sm font-bold tracking-wide text-muted uppercase hover:text-fg"
          >
            <ChevronDown size={16} className={`transition-transform duration-200 ${showDone ? '' : '-rotate-90'}`} />
            Done <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-xs text-brand-green">{done.length}</span>
          </button>
          {showDone && (
            <div className="space-y-2.5">
              {done.map((t) => (
                <TaskCard key={t.id} task={t} showCourse={false} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export function Classes() {
  const { visibleTasks, classFilter, setClassFilter, setPage } = useStore();
  if (classFilter && COURSE_BY_ID[classFilter]) return <ClassDetail id={classFilter} />;

  const weekEnd = endOfDay(addDays(new Date(), 7));
  const anyTasks = visibleTasks.some((t) => t.courseId);

  return (
    <div>
      <PageHeader title="Classes" subtitle="Everything for each class, from every source." />
      {!anyTasks && (
        <div className="mb-6">
          <EmptyState
            title="No class work yet"
            body="Connect Canvas or Blackbaud to see assignments for each class."
            action={
              <Button variant="primary" onClick={() => setPage('connections')}>
                Connect accounts
              </Button>
            }
          />
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COURSES.map((c) => {
          const Icon = ICONS[c.id];
          const open = visibleTasks.filter((t) => t.courseId === c.id && !t.completed);
          const upcoming = open.filter((t) => new Date(t.due) <= weekEnd);
          const next = open[0];
          const late = open.filter((t) => isOverdue(t)).length;
          return (
            <button key={c.id} onClick={() => setClassFilter(c.id)} className="text-left">
              <Card className="group h-full p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${c.color}22`, color: c.color }}>
                    <Icon size={21} />
                  </span>
                  <span className="text-right">
                    <span className="block text-2xl leading-none font-extrabold text-fg">{upcoming.length}</span>
                    <span className="text-[11px] font-semibold text-muted">this week</span>
                  </span>
                </div>
                <h3 className="mt-4 text-[17px] font-bold text-fg">{c.name}</h3>
                <p className="text-xs text-muted">
                  {c.teacher} · {c.period}
                </p>
                <div className="mt-4 border-t border-line pt-3">
                  {next ? (
                    <>
                      <div className="text-[11px] font-semibold tracking-wide text-faint uppercase">Next up</div>
                      <div className="mt-1 truncate text-sm font-semibold text-fg">{next.title}</div>
                      <div className={`text-xs ${isOverdue(next) ? 'font-semibold text-rose-500' : 'text-muted'}`}>
                        {dueLabel(next)}
                        {late > 0 && !isOverdue(next) ? ` · ${late} overdue` : ''}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted">Nothing due. All clear.</div>
                  )}
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
