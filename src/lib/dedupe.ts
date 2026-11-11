import { format } from 'date-fns';
import type { Task } from '../types';

/** Normalize a title so "APUSH DBQ Outline - Reconstruction" matches "APUSH DBQ Outline: Reconstruction". */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function dedupeKey(t: Task): string {
  return [normalizeTitle(t.title), t.courseId ?? '', format(new Date(t.due), 'yyyy-MM-dd')].join('|');
}

/**
 * Merge items that show up in more than one source (e.g. a teacher posts the same
 * assignment in Canvas and Blackbaud). The first record wins for title/time; sources
 * and notes are combined.
 */
export function mergeDuplicates(records: Task[]): Task[] {
  const byKey = new Map<string, Task>();
  for (const rec of records) {
    const key = dedupeKey(rec);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...rec, sources: [...rec.sources] });
      continue;
    }
    for (const s of rec.sources) if (!existing.sources.includes(s)) existing.sources.push(s);
    if (rec.notes && !existing.notes.includes(rec.notes)) {
      existing.notes = existing.notes ? `${existing.notes}\n\n${rec.notes}` : rec.notes;
    }
    existing.completed = existing.completed || rec.completed;
  }
  return [...byKey.values()];
}
