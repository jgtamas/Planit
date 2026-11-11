import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import type { ConnectableSource, PageId, Progress, Settings, Task } from '../types';
import { STARTING_XP, levelFor, xpForFocus, xpForTask } from './levels';
import { StoreContext, type Connections, type Store, type Toast } from './storeContext';
import { generateMockTasks } from '../data/mockData';
import { clearAll, load, save } from './storage';
import { CONNECTABLE } from './sources';
import { dayKey } from './dates';


const DEFAULT_SETTINGS: Settings = { name: '', grade: '11th', theme: 'dark', onboarded: false };

function defaultConnections(): Connections {
  return Object.fromEntries(CONNECTABLE.map((id) => [id, { id, connected: false }])) as Connections;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Load tasks. If the demo data was seeded on an earlier day, shift imported items forward
 * so the demo always looks current (manual tasks keep their dates).
 */
function loadTasks(): Task[] {
  const seededOn = load<string | null>('seededOn', null);
  const stored = load<Task[] | null>('tasks', null);
  const todayKey = dayKey(new Date());
  if (!stored || !seededOn) {
    save('seededOn', todayKey);
    return generateMockTasks();
  }
  const shift = differenceInCalendarDays(parseISO(todayKey), parseISO(seededOn));
  if (shift === 0) return stored;
  save('seededOn', todayKey);
  return stored.map((t) =>
    t.sources.includes('planit')
      ? t
      : {
          ...t,
          due: addDays(new Date(t.due), shift).toISOString(),
          end: t.end ? addDays(new Date(t.end), shift).toISOString() : undefined,
          completedAt: t.completedAt ? addDays(new Date(t.completedAt), shift).toISOString() : undefined,
        },
  );
}


export function StoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [connections, setConnections] = useState<Connections>(() => ({
    ...defaultConnections(),
    ...load<Partial<Connections>>('connections', {}),
  }));
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...load('settings', {}) }));
  const [page, setPageState] = useState<PageId>('today');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [progress, setProgress] = useState<Progress>(() => load('progress', { xp: STARTING_XP, sessions: [] }));
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const lastLevel = useRef(levelFor(progress.xp).level);

  useEffect(() => save('progress', progress), [progress]);
  useEffect(() => {
    const lvl = levelFor(progress.xp).level;
    if (lvl > lastLevel.current) setTimeout(() => setLevelUp(lvl), 350);
    lastLevel.current = lvl;
  }, [progress.xp]);

  useEffect(() => save('tasks', tasks), [tasks]);
  useEffect(() => save('connections', connections), [connections]);
  useEffect(() => save('settings', settings), [settings]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.theme === 'dark' ? '#0B0F1A' : '#F6F7FB');
  }, [settings.theme]);

  const visibleTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.sources.some((s) => s === 'planit' || connections[s]?.connected))
        .sort((a, b) => a.due.localeCompare(b.due)),
    [tasks, connections],
  );

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, message }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 2600);
  }, []);

  const setPage = useCallback((p: PageId) => {
    setPageState(p);
    if (p !== 'classes') setClassFilter(null);
    window.scrollTo({ top: 0 });
  }, []);

  const toggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const gain = xpForTask(task);
      setProgress((p) => ({ ...p, xp: Math.max(0, p.xp + (task.completed ? -gain : gain)) }));
      setTasks((ts) =>
        ts.map((t) =>
          t.id === id
            ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
            : t,
        ),
      );
    },
    [tasks],
  );

  const logFocus = useCallback((taskId: string, minutes: number) => {
    const gain = xpForFocus(minutes);
    setProgress((p) => ({
      xp: p.xp + gain,
      sessions: [...p.sessions, { id: `fs-${Date.now()}`, taskId, minutes, at: new Date().toISOString() }],
    }));
    return gain;
  }, []);

  const addTask: Store['addTask'] = useCallback((input) => {
    const task: Task = {
      ...input,
      id: `planit-${Date.now()}`,
      sources: ['planit'],
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((ts) => [...ts, task]);
    return task;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((ts) => ts.filter((t) => t.id !== id));
    setSelectedTaskId((cur) => (cur === id ? null : cur));
  }, []);

  const countFor = useCallback((source: ConnectableSource) => tasks.filter((t) => t.sources.includes(source)).length, [tasks]);

  const connect = useCallback(
    async (id: ConnectableSource) => {
      await wait(1200);
      setConnections((c) => ({ ...c, [id]: { id, connected: true, lastSynced: new Date().toISOString() } }));
      return tasks.filter((t) => t.sources.includes(id)).length;
    },
    [tasks],
  );

  const disconnect = useCallback((id: ConnectableSource) => {
    setConnections((c) => ({ ...c, [id]: { id, connected: false } }));
  }, []);

  const sync = useCallback(async (id?: ConnectableSource) => {
    await wait(1100);
    const now = new Date().toISOString();
    setConnections((c) => {
      const next = { ...c };
      for (const key of CONNECTABLE) {
        if ((!id || id === key) && next[key].connected) next[key] = { ...next[key], lastSynced: now };
      }
      return next;
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);

  const resetDemo = useCallback(() => {
    const theme = settings.theme;
    clearAll();
    save('seededOn', dayKey(new Date()));
    setTasks(generateMockTasks());
    setConnections(defaultConnections());
    setSettings({ ...DEFAULT_SETTINGS, theme });
    setSelectedTaskId(null);
    setClassFilter(null);
    setFocusTaskId(null);
    setLevelUp(null);
    lastLevel.current = levelFor(STARTING_XP).level;
    setProgress({ xp: STARTING_XP, sessions: [] });
    setPageState('today');
  }, [settings.theme]);

  const value: Store = {
    tasks,
    visibleTasks,
    connections,
    settings,
    page,
    setPage,
    selectedTaskId,
    openTask: setSelectedTaskId,
    classFilter,
    setClassFilter,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    countFor,
    connect,
    disconnect,
    sync,
    updateSettings,
    resetDemo,
    toasts,
    toast,
    progress,
    levelUp,
    dismissLevelUp: () => setLevelUp(null),
    focusTaskId,
    startFocus: (id) => {
      setSelectedTaskId(null);
      setFocusTaskId(id);
    },
    endFocus: () => setFocusTaskId(null),
    logFocus,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

