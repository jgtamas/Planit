import { differenceInCalendarDays, endOfDay, isToday } from 'date-fns';
import type { Priority, Task, TaskKind } from '../types';

/** Suggested minutes by task type, used when a task has no explicit estimate. */
export const DEFAULT_ESTIMATE: Record<TaskKind, number> = {
  test: 90,
  quiz: 40,
  assignment: 60,
  homework: 35,
  reminder: 10,
  event: 0,
};

export const ESTIMATE_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120, 150, 180, 240];

export function estimateOf(t: Task): number {
  if (t.kind === 'event') {
    return t.end ? Math.round((new Date(t.end).getTime() - new Date(t.due).getTime()) / 60000) : 0;
  }
  return t.estimate ?? DEFAULT_ESTIMATE[t.kind];
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/* ── Smart prioritization ─────────────────────────────────────────────── */

const WEIGHT: Record<TaskKind, number> = {
  test: 3,
  quiz: 2.2,
  assignment: 1.6,
  homework: 1.2,
  reminder: 0.8,
  event: 0,
};

const PRIORITY_MULT: Record<Priority, number> = { high: 1.5, medium: 1, low: 0.7 };

const KIND_LABEL: Record<TaskKind, string> = {
  test: 'Test',
  quiz: 'Quiz',
  assignment: 'Assignment',
  homework: 'Homework',
  reminder: 'Reminder',
  event: 'Event',
};

export interface Ranked {
  task: Task;
  score: number;
  reasons: string[];
}

/**
 * Score a task: how much it matters (type weight × priority) times how urgent it is,
 * boosted when the work needed is large relative to the time left.
 */
export function scoreTask(t: Task, now: Date = new Date()): Ranked {
  const due = new Date(t.due);
  const hoursLeft = (due.getTime() - now.getTime()) / 36e5;
  const est = estimateOf(t);
  const overdue = due < now && !isToday(due);
  const days = Math.max(hoursLeft, 0) / 24;

  const urgency = overdue ? 2.4 : 2 / (0.6 + days);
  const workload = 1 + est / 150;
  const tight = !overdue && hoursLeft > 0 && est / 60 > hoursLeft * 0.25 ? 1.3 : 1;
  const score = WEIGHT[t.kind] * PRIORITY_MULT[t.priority] * urgency * workload * tight;

  const reasons: string[] = [];
  const dayDiff = differenceInCalendarDays(due, now);
  if (overdue) reasons.push('Overdue');
  else if (dayDiff === 0) reasons.push(due.getHours() >= 20 ? 'Due tonight' : 'Due today');
  else if (dayDiff === 1) reasons.push(`${KIND_LABEL[t.kind]} tomorrow`);
  else reasons.push(`${KIND_LABEL[t.kind]} in ${dayDiff} days`);
  if (t.kind === 'test' || t.kind === 'quiz') {
    if (dayDiff > 1) reasons[0] = `${KIND_LABEL[t.kind]} in ${dayDiff} days`;
  }
  if (t.priority === 'high') reasons.push('High priority');
  if (est >= 60) reasons.push(`~${formatMinutes(est)} of work`);
  if (tight > 1) reasons.push('Start soon to finish in time');
  return { task: t, score, reasons };
}

/** Open, non-event work ranked "do this next" first. */
export function rankTasks(tasks: Task[], now: Date = new Date()): Ranked[] {
  const horizon = endOfDay(new Date(now.getTime() + 14 * 864e5));
  return tasks
    .filter((t) => !t.completed && t.kind !== 'event' && new Date(t.due) <= horizon)
    .map((t) => scoreTask(t, now))
    .sort((a, b) => b.score - a.score);
}
