/**
 * Demo persistence. Everything lives in sessionStorage, which belongs to a single
 * browser tab: a newly opened tab always starts the demo fresh (at onboarding),
 * while reloading the same tab keeps progress so an accidental refresh mid-demo
 * doesn't wipe it. Separate tabs and separate people never share state.
 */
const PREFIX = 'planit:';

function store(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

// Older builds kept data in localStorage across visits. Remove it so nothing lingers.
try {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
} catch {
  /* storage blocked — nothing to clean */
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = store()?.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    store()?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the demo keeps working in memory */
  }
}

export function clearAll(): void {
  try {
    const s = store();
    if (!s) return;
    Object.keys(s)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => s.removeItem(k));
  } catch {
    /* ignore */
  }
}
