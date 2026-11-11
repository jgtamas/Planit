import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarClock, ExternalLink, GitMerge, Timer, Trash2, X } from 'lucide-react';
import { ESTIMATE_OPTIONS, estimateOf, formatMinutes } from '../lib/planning';
import type { Priority, Task } from '../types';
import { useStore } from '../lib/storeContext';
import { COURSES } from '../data/mockData';
import { SOURCES } from '../lib/sources';
import { SourceDot } from './SourceTag';
import { Checkbox } from './TaskCard';
import { Button, PRIORITY_COLOR } from './ui';

const toLocalInput = (iso: string) => format(new Date(iso), "yyyy-MM-dd'T'HH:mm");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted uppercase">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-medium text-fg transition-colors focus:border-brand-purple/60 focus:outline-none';

export function TaskDrawer() {
  const { selectedTaskId, tasks, openTask } = useStore();
  const task = tasks.find((t) => t.id === selectedTaskId);

  useEffect(() => {
    if (!task) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && openTask(null);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [task, openTask]);

  if (!task) return null;
  return <DrawerBody key={task.id} task={task} />;
}

function DrawerBody({ task }: { task: Task }) {
  const { openTask, updateTask, deleteTask, toggleTask, toast, connections, startFocus, progress } = useStore();
  const sessions = progress.sessions.filter((s) => s.taskId === task.id);
  const focusedMin = sessions.reduce((n, s) => n + s.minutes, 0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const imported = task.sources.filter((s) => s !== 'planit' && connections[s]?.connected);
  const primary = imported[0];
  const isEvent = task.kind === 'event';

  const close = () => openTask(null);

  return (
    <div className="fixed inset-0 z-50">
      <div className="animate-fade-in absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={close} />
      <aside
        role="dialog"
        aria-label="Task details"
        className="animate-sheet md:animate-drawer absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl border border-line bg-surface shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-strong md:hidden" />
        <header className="flex items-center justify-between gap-3 px-6 pt-4 pb-2 md:pt-6">
          {imported.length > 0 ? (
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
              <span className="text-muted">Imported from</span>
              {imported.map((s, i) => (
                <span key={s} className="inline-flex items-center gap-1.5" style={{ color: SOURCES[s].color }}>
                  {i > 0 && <span className="text-faint">+</span>}
                  <SourceDot source={s} />
                  {SOURCES[s].name}
                </span>
              ))}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: SOURCES.planit.color }}>
              <SourceDot source="planit" /> Added in Planit
            </span>
          )}
          <button onClick={close} aria-label="Close" className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 pt-2 pb-6">
          {imported.length > 1 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-xs text-muted">
              <GitMerge size={15} className="mt-0.5 shrink-0 text-brand-purple" />
              <span>
                This assignment was posted in both {imported.map((s) => SOURCES[s].name).join(' and ')}. Planit merged
                the duplicates into one item.
              </span>
            </div>
          )}

          <div className="flex items-start gap-3">
            {isEvent ? (
              <CalendarClock size={20} className="mt-2.5 shrink-0 text-faint" />
            ) : (
              <div className="pt-2">
                <Checkbox checked={task.completed} onToggle={() => toggleTask(task.id)} label="Toggle done" />
              </div>
            )}
            <textarea
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value.replace(/\n/g, '') })}
              rows={2}
              aria-label="Title"
              className="w-full resize-none rounded-xl bg-transparent px-2 py-1.5 text-xl font-bold text-fg transition-colors hover:bg-surface-2 focus:bg-surface-2 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={isEvent ? 'Starts' : 'Due'}>
              <input
                type="datetime-local"
                value={toLocalInput(task.due)}
                onChange={(e) => e.target.value && updateTask(task.id, { due: new Date(e.target.value).toISOString() })}
                className={inputCls}
              />
            </Field>
            <Field label="Class">
              <select
                value={task.courseId ?? ''}
                onChange={(e) => updateTask(task.id, { courseId: e.target.value || undefined })}
                className={inputCls}
              >
                <option value="">No class</option>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {!isEvent && (
            <Field label="Priority">
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface-2 p-1">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateTask(task.id, { priority: p })}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold capitalize transition-all duration-150 ${
                      task.priority === p ? 'bg-surface text-fg shadow-card' : 'text-muted hover:text-fg'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: PRIORITY_COLOR[p] }} />
                    {p}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {!isEvent && (
            <Field label="Time estimate">
              <div className="flex items-center gap-3">
                <select
                  value={estimateOf(task)}
                  onChange={(e) => updateTask(task.id, { estimate: Number(e.target.value) })}
                  className={`${inputCls} flex-1`}
                >
                  {[...new Set([...ESTIMATE_OPTIONS, estimateOf(task)])]
                    .sort((a, b) => a - b)
                    .map((m) => (
                      <option key={m} value={m}>
                        {formatMinutes(m)}
                        {task.estimate === undefined && m === estimateOf(task) ? ' (suggested)' : ''}
                      </option>
                    ))}
                </select>
                {focusedMin > 0 && (
                  <span className="shrink-0 text-xs font-semibold text-muted">
                    {formatMinutes(focusedMin)} focused · {sessions.length} session{sessions.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>
            </Field>
          )}

          {!isEvent && !task.completed && (
            <Button variant="primary" className="w-full" onClick={() => startFocus(task.id)}>
              <Timer size={16} /> Start focus session
            </Button>
          )}

          <Field label="Notes">
            <textarea
              value={task.notes}
              onChange={(e) => updateTask(task.id, { notes: e.target.value })}
              rows={5}
              placeholder="Add details, links, or a plan of attack…"
              className={`${inputCls} resize-none leading-relaxed`}
            />
          </Field>

          {primary && (
            <Button variant="secondary" disabled className="w-full" title="Available when live integrations launch">
              <ExternalLink size={15} /> Open in {SOURCES[primary].name}
            </Button>
          )}
        </div>

        <footer className="pb-safe flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <span className="text-xs text-faint">Changes save automatically</span>
          {confirmDelete ? (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  deleteTask(task.id);
                  toast('Task deleted');
                }}
              >
                <Trash2 size={14} /> Confirm delete
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> Delete
            </Button>
          )}
        </footer>
      </aside>
    </div>
  );
}
