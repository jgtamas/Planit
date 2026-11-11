import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';
import type { Course, Priority, SourceId, Task, TaskKind } from '../types';
import { mergeDuplicates } from '../lib/dedupe';

export const COURSES: Course[] = [
  { id: 'apbus', name: 'AP Business', teacher: 'Mr. Alvarez', period: 'Period 1', room: 'B204', color: '#8B5CF6' },
  { id: 'apush', name: 'AP US History', teacher: 'Mrs. Whitfield', period: 'Period 2', room: 'H112', color: '#F2552C' },
  { id: 'precalc', name: 'Precalculus', teacher: 'Mr. Nguyen', period: 'Period 3', room: 'M108', color: '#3B82F6' },
  { id: 'eng11', name: 'English 11', teacher: 'Ms. Okafor', period: 'Period 4', room: 'E215', color: '#EC4899' },
  { id: 'chem', name: 'Chemistry', teacher: 'Dr. Patel', period: 'Period 5', room: 'S301', color: '#10B981' },
  { id: 'theo', name: 'Theology', teacher: 'Fr. Daniels', period: 'Period 6', room: 'C102', color: '#F59E0B' },
];

export const COURSE_BY_ID: Record<string, Course> = Object.fromEntries(COURSES.map((c) => [c.id, c]));

/** One raw record as it would arrive from an integration, before Planit merges duplicates. */
interface RawRecord {
  source: Exclude<SourceId, 'planit'>;
  title: string;
  course?: string;
  /** Days from today (negative = past). */
  day: number;
  /** 24h "HH:mm". */
  time: string;
  /** End time for calendar events. */
  until?: string;
  kind: TaskKind;
  priority: Priority;
  notes?: string;
  done?: boolean;
  /** Estimated minutes of work (otherwise a default by type). */
  est?: number;
  /** Keep school items on weekdays; some events belong on weekends. */
  snap?: 'weekday' | 'weekend' | 'none';
}

const RAW: RawRecord[] = [
  // ── Overdue ────────────────────────────────────────────────
  { source: 'canvas', title: 'Unit 4 Reading Notes: Market Structures', course: 'apbus', day: -2, time: '23:59', est: 45, kind: 'assignment', priority: 'high', notes: 'Cornell notes on Ch. 11. Submit as PDF.' },
  { source: 'blackbaud', title: 'Problem Set 7: Stoichiometry', course: 'chem', day: -1, time: '08:00', kind: 'homework', priority: 'medium', notes: 'Odd problems 1–29. Show all unit conversions.' },
  { source: 'reminders', title: 'Return library books', day: -1, time: '15:00', kind: 'reminder', priority: 'low' },

  // ── Today ──────────────────────────────────────────────────
  { source: 'canvas', title: 'DBQ Outline: Reconstruction', course: 'apush', day: 0, time: '23:59', est: 90, kind: 'assignment', priority: 'high', notes: 'Thesis + 3 body paragraph outlines. Use at least 4 of the 7 documents.' },
  { source: 'blackbaud', title: 'DBQ Outline - Reconstruction', course: 'apush', day: 0, time: '23:59', kind: 'assignment', priority: 'high' },
  { source: 'canvas', title: '5.3 Practice: Trig Identities', course: 'precalc', day: 0, time: '22:00', est: 50, kind: 'assignment', priority: 'medium', notes: 'WebAssign set — 18 problems.' },
  { source: 'blackbaud', title: 'Read The Great Gatsby Ch. 4–5', course: 'eng11', day: 0, time: '23:59', est: 45, kind: 'homework', priority: 'medium', notes: 'Annotate for symbolism (green light, eyes of T.J. Eckleburg).' },
  { source: 'reminders', title: 'Email counselor about rec letter', day: 0, time: '16:00', est: 10, kind: 'reminder', priority: 'medium', notes: 'Ask Ms. Carter if she needs the brag sheet before Thanksgiving.' },
  { source: 'gcal', title: 'DECA Chapter Meeting', day: 0, time: '15:15', until: '16:15', kind: 'event', priority: 'low', notes: 'Room B204 · Bring competition event preferences.' },
  { source: 'blackbaud', title: 'Read Ch. 3 handout', course: 'theo', day: 0, time: '08:00', kind: 'homework', priority: 'low', done: true },

  // ── Coming up ──────────────────────────────────────────────
  { source: 'canvas', title: 'Quiz: The Mole Concept', course: 'chem', day: 1, time: '08:15', est: 45, kind: 'quiz', priority: 'high', notes: 'Covers molar mass, Avogadro’s number, and percent composition.' },
  { source: 'reminders', title: 'DECA meeting prep: finalize pitch slides', day: 1, time: '18:00', est: 60, kind: 'reminder', priority: 'medium' },
  { source: 'gcal', title: 'Varsity Soccer Practice', day: 1, time: '15:30', until: '17:30', kind: 'event', priority: 'low', notes: 'Upper field.' },

  { source: 'canvas', title: 'Case Study: Tesla Pricing Strategy', course: 'apbus', day: 2, time: '23:59', est: 120, kind: 'assignment', priority: 'high', notes: '2-page analysis using the 4 Ps framework.' },
  { source: 'blackbaud', title: 'Case Study — Tesla Pricing Strategy', course: 'apbus', day: 2, time: '23:59', kind: 'assignment', priority: 'high' },
  { source: 'blackbaud', title: 'Reflection Journal #6', course: 'theo', day: 2, time: '08:00', kind: 'homework', priority: 'low' },
  { source: 'gcal', title: 'Peer Tutoring – Library', day: 2, time: '07:30', until: '08:00', kind: 'event', priority: 'low' },

  { source: 'canvas', title: 'Unit 5 Test: Trigonometry', course: 'precalc', day: 3, time: '09:00', est: 150, kind: 'test', priority: 'high', notes: 'Calculator allowed. One page of notes (front only).' },
  { source: 'reminders', title: 'Register for December SAT', day: 3, time: '19:00', est: 20, kind: 'reminder', priority: 'high', notes: 'Late registration fee starts after this week.' },

  { source: 'blackbaud', title: 'Gatsby Socratic Seminar Prep', course: 'eng11', day: 4, time: '08:00', est: 40, kind: 'homework', priority: 'medium', notes: 'Bring 3 discussion questions with page citations.' },
  { source: 'gcal', title: 'Model UN Club', day: 4, time: '15:15', until: '16:30', kind: 'event', priority: 'low' },

  { source: 'canvas', title: 'Chapter 16 Quiz: The Gilded Age', course: 'apush', day: 5, time: '10:00', est: 45, kind: 'quiz', priority: 'medium' },
  { source: 'gcal', title: 'Volunteer Shift – Food Bank', day: 5, time: '09:00', until: '12:00', kind: 'event', priority: 'low', snap: 'weekend' },

  { source: 'canvas', title: 'Lab Report: Limiting Reagents', course: 'chem', day: 6, time: '23:59', est: 120, kind: 'assignment', priority: 'high', notes: 'Use the lab report template. Include error analysis.' },
  { source: 'blackbaud', title: 'Lab Report – Limiting Reagents', course: 'chem', day: 6, time: '23:59', kind: 'assignment', priority: 'high' },
  { source: 'reminders', title: 'Finish scholarship essay draft', day: 6, time: '20:00', est: 90, kind: 'reminder', priority: 'medium' },

  { source: 'blackbaud', title: 'Homework 5.5: Sum & Difference Formulas', course: 'precalc', day: 7, time: '08:00', kind: 'homework', priority: 'low' },
  { source: 'canvas', title: 'Marketing Mix Quiz', course: 'apbus', day: 7, time: '13:00', kind: 'quiz', priority: 'medium' },

  // ── Further out ────────────────────────────────────────────
  { source: 'canvas', title: 'Essay: The American Dream in Gatsby', course: 'eng11', day: 9, time: '23:59', est: 180, kind: 'assignment', priority: 'high', notes: '1,200–1,500 words, MLA format. Submit to Turnitin.' },
  { source: 'gcal', title: 'College Info Night – Gym', day: 10, time: '18:30', until: '20:00', kind: 'event', priority: 'low' },
  { source: 'blackbaud', title: 'Unit Test: The Sacraments', course: 'theo', day: 11, time: '09:00', kind: 'test', priority: 'medium' },
  { source: 'canvas', title: 'Primary Source Analysis: Populism', course: 'apush', day: 12, time: '23:59', kind: 'assignment', priority: 'medium' },
  { source: 'reminders', title: 'Renew driver’s permit', day: 13, time: '12:00', kind: 'reminder', priority: 'low' },
  { source: 'canvas', title: 'Unit 5 Exam: Marketing', course: 'apbus', day: 14, time: '10:30', est: 150, kind: 'test', priority: 'high' },
  { source: 'blackbaud', title: 'Unit 5 Exam - Marketing', course: 'apbus', day: 14, time: '10:30', kind: 'test', priority: 'high' },
];

function at(base: Date, day: number, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  return setMinutes(setHours(addDays(startOfDay(base), day), h), m);
}

/**
 * Relative offsets can land school work on a weekend. Nudge it to the nearest school day
 * (backward for past items so overdue stays overdue, forward for future ones). Items due
 * today and personal reminders stay put.
 */
function snapDay(now: Date, r: RawRecord): number {
  const snap = r.snap ?? (r.source === 'reminders' ? 'none' : 'weekday');
  const dow = addDays(startOfDay(now), r.day).getDay();
  if (snap === 'weekday' && r.day !== 0 && (dow === 0 || dow === 6)) {
    if (r.day < 0) return r.day - (dow === 6 ? 1 : 2);
    return r.day + (dow === 6 ? 2 : 1);
  }
  if (snap === 'weekend' && dow !== 0 && dow !== 6) {
    // nearest weekend day, without moving into the past
    const back = r.day - dow; // previous Sunday
    return dow <= 2 && back > 0 ? back : r.day + (6 - dow);
  }
  return r.day;
}

/** Build the demo data set relative to `now`, so the demo never looks stale. */
export function generateMockTasks(now: Date = new Date()): Task[] {
  const created = addDays(now, -14).toISOString();
  const records: Task[] = RAW.map((r, i) => {
    const day = snapDay(now, r);
    return {
      id: `${r.source}-${i + 1}`,
      title: r.title,
      courseId: r.course,
      sources: [r.source],
      kind: r.kind,
      due: at(now, day, r.time).toISOString(),
      end: r.until ? at(now, day, r.until).toISOString() : undefined,
      priority: r.priority,
      estimate: r.est,
      notes: r.notes ?? '',
      completed: !!r.done,
      completedAt: r.done ? at(now, day, '07:40').toISOString() : undefined,
      createdAt: created,
    };
  });
  return mergeDuplicates(records);
}
