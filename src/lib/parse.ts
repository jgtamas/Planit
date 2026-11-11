import { addDays, addWeeks, nextDay, setHours, setMinutes, startOfDay, startOfWeek, type Day } from 'date-fns';
import type { Priority, TaskKind } from '../types';

export interface ParsedTask {
  title: string;
  due: Date;
  /** True if the user typed a date or time we understood. */
  hasDate: boolean;
  courseId?: string;
  priority: Priority;
  kind: TaskKind;
  /** Minutes, if the user typed something like "45m" or "2h". */
  estimate?: number;
}

const WEEKDAYS: Record<string, Day> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, weds: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

const COURSE_KEYWORDS: [RegExp, string][] = [
  [/\b(ap ?bus(iness)?|business|deca)\b/i, 'apbus'],
  [/\b(apush|us history|history)\b/i, 'apush'],
  [/\b(pre-?calc(ulus)?|trig|math)\b/i, 'precalc'],
  [/\b(english|eng ?11|gatsby|essay)\b/i, 'eng11'],
  [/\b(chem(istry)?|lab report)\b/i, 'chem'],
  [/\b(theology|theo|religion)\b/i, 'theo'],
];

function withTime(d: Date, h: number, m: number): Date {
  return setMinutes(setHours(startOfDay(d), h), m);
}

/**
 * Light natural-language parsing for quick-add.
 * Understands: today, tonight, tomorrow/tmrw, weekday names ("friday", "next fri"),
 * "next week", "in 3 days", times ("at 3pm", "3:30pm", "noon"), and "!" / "!!" for priority.
 */
export function parseQuickAdd(input: string, now: Date = new Date()): ParsedTask {
  let text = ` ${input.trim()} `;
  let date: Date | null = null;
  let hour: number | null = null;
  let minute = 0;
  let priority: Priority = 'medium';

  const take = (re: RegExp): RegExpMatchArray | null => {
    const m = text.match(re);
    if (m) text = text.replace(m[0], ' ');
    return m;
  };

  // priority markers
  if (take(/\s(?:!low|low priority)(?=\s)/i)) priority = 'low';
  else if (take(/\s(?:!+(?:high)?|high priority|urgent|important)(?=\s)/i)) priority = 'high';

  // time: "at 3pm", "3:30 pm", "at 15:00", "noon"
  let m = take(/\s(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)(?=\s)/i);
  if (m) {
    hour = Number(m[1]) % 12 + (m[3].toLowerCase() === 'pm' ? 12 : 0);
    minute = m[2] ? Number(m[2]) : 0;
  } else if ((m = take(/\sat\s+(\d{1,2}):(\d{2})(?=\s)/i))) {
    hour = Number(m[1]);
    minute = Number(m[2]);
  } else if (take(/\s(?:at\s+)?noon(?=\s)/i)) {
    hour = 12;
  }

  // date words
  const today = startOfDay(now);
  if (take(/\s(?:due\s+)?(?:by\s+|on\s+)?today(?=\s)/i)) date = today;
  else if (take(/\s(?:due\s+)?(?:by\s+)?tonight(?=\s)/i)) {
    date = today;
    if (hour === null) hour = 21;
  } else if (take(/\s(?:due\s+)?(?:by\s+|on\s+)?(?:tomorrow|tmrw|tmr)(?=\s)/i)) date = addDays(today, 1);
  else if (take(/\s(?:due\s+)?next\s+week(?=\s)/i)) date = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
  else if ((m = take(/\s(?:due\s+)?in\s+(\d{1,2})\s+days?(?=\s)/i))) date = addDays(today, Number(m[1]));
  else if ((m = take(/\s(?:due\s+)?(?:by\s+|on\s+)?(next\s+|this\s+)?(sun(?:day)?|mon(?:day)?|tue(?:s(?:day)?)?|wed(?:s|nesday)?|thu(?:r(?:s(?:day)?)?)?|fri(?:day)?|sat(?:urday)?)(?=\s)/i))) {
    const day = WEEKDAYS[m[2].toLowerCase()];
    if (m[1]?.trim().toLowerCase() === 'next') {
      // "next friday" = that weekday in next calendar week
      const nextWeekStart = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
      date = addDays(nextWeekStart, (day + 6) % 7);
    } else {
      date = today.getDay() === day && m[1] ? today : nextDay(today, day);
    }
  }

  // effort: "45m", "2h", "1.5h", "90 min"
  let estimate: number | undefined;
  if ((m = take(/\s(?:~|for\s+)?(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?)(?=\s)/i))) estimate = Math.round(Number(m[1]) * 60);
  else if ((m = take(/\s(?:~|for\s+)?(\d{1,3})\s*(m|min|mins|minutes?)(?=\s)/i))) estimate = Number(m[1]);

  const hasDate = date !== null || hour !== null;
  const base = date ?? today;
  const due = hour !== null ? withTime(base, hour, minute) : withTime(base, 23, 59);

  let courseId: string | undefined;
  for (const [re, id] of COURSE_KEYWORDS) {
    if (re.test(input)) {
      courseId = id;
      break;
    }
  }

  const lower = input.toLowerCase();
  const kind: TaskKind = /\b(test|exam|final|midterm)\b/.test(lower)
    ? 'test'
    : /\bquiz\b/.test(lower)
      ? 'quiz'
      : /\b(read|reading|homework|hw|worksheet|problems?|flashcards|study)\b/.test(lower)
        ? 'homework'
        : /\b(email|call|text|buy|pick up|register|sign up|return|renew|remind)\b/.test(lower)
          ? 'reminder'
          : 'assignment';

  const title = text.replace(/\s+/g, ' ').trim().replace(/^\w/, (c) => c.toUpperCase());
  return { title, due, hasDate, courseId, priority, kind, estimate };
}
