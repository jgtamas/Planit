import type { Task, TaskKind } from '../types';

export interface OrbitLevel {
  level: number;
  name: string;
  xp: number;
  unlock: string;
}

/** Each level visibly changes the planet. */
export const LEVELS: OrbitLevel[] = [
  { level: 1, name: 'Planetoid', xp: 0, unlock: 'A brand-new world' },
  { level: 2, name: 'Ringed World', xp: 100, unlock: 'Your planet formed its ring' },
  { level: 3, name: 'First Moon', xp: 250, unlock: 'Your planet gained its first moon' },
  { level: 4, name: 'Aurora', xp: 450, unlock: 'Your ring shifted to aurora colors' },
  { level: 5, name: 'Twin Moons', xp: 700, unlock: 'A second moon joined your orbit' },
  { level: 6, name: 'Star System', xp: 1000, unlock: 'Your planet lit up its own star system' },
];

/** XP the demo starts with, so the first completed task triggers a level-up on stage. */
export const STARTING_XP = 232;

const TASK_XP: Record<TaskKind, number> = {
  test: 40,
  quiz: 30,
  assignment: 25,
  homework: 20,
  reminder: 10,
  event: 0,
};

export function xpForTask(t: Task): number {
  return TASK_XP[t.kind];
}

export function xpForFocus(minutes: number): number {
  return Math.max(10, Math.round(minutes * 2));
}

export function levelFor(xp: number): OrbitLevel {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) cur = l;
  return cur;
}

export function levelProgress(xp: number): { current: OrbitLevel; next?: OrbitLevel; pct: number; toNext: number } {
  const current = levelFor(xp);
  const next = LEVELS.find((l) => l.level === current.level + 1);
  if (!next) return { current, pct: 1, toNext: 0 };
  return { current, next, pct: (xp - current.xp) / (next.xp - current.xp), toNext: next.xp - xp };
}
