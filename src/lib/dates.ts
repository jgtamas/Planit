import {
  differenceInCalendarDays,
  format,
  isSameDay,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
} from 'date-fns';
import type { Task } from '../types';

export function timeLabel(d: Date): string {
  if (d.getHours() === 23 && d.getMinutes() === 59) return '11:59 PM';
  return format(d, d.getMinutes() === 0 ? 'h a' : 'h:mm a');
}

export function timeRange(t: Task): string {
  const start = new Date(t.due);
  if (!t.end) return timeLabel(start);
  return `${timeLabel(start)} – ${timeLabel(new Date(t.end))}`;
}

/** Human-friendly due label relative to now. */
export function dueLabel(t: Task, now: Date = new Date()): string {
  const d = new Date(t.due);
  const time = t.end ? timeRange(t) : timeLabel(d);
  if (isToday(d)) return time;
  if (isTomorrow(d)) return `Tomorrow · ${time}`;
  if (isYesterday(d)) return `Yesterday · ${time}`;
  const diff = differenceInCalendarDays(d, now);
  if (diff < 0) return `${-diff} days ago`;
  if (diff < 7) return `${format(d, 'EEE')} · ${time}`;
  return format(d, 'MMM d');
}

export function dayKey(d: Date | string): string {
  return format(new Date(d), 'yyyy-MM-dd');
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function isOverdue(t: Task, now: Date = new Date()): boolean {
  return !t.completed && t.kind !== 'event' && new Date(t.due) < startOfDay(now);
}

export { isSameDay };
