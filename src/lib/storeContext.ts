import { createContext, useContext } from 'react';
import type { ConnectableSource, Connection, PageId, Progress, Settings, Task } from '../types';

export type Connections = Record<ConnectableSource, Connection>;

export interface Toast {
  id: number;
  message: string;
}

export interface Store {
  tasks: Task[];
  /** Tasks from connected sources plus manual tasks. */
  visibleTasks: Task[];
  connections: Connections;
  settings: Settings;
  page: PageId;
  setPage: (p: PageId) => void;
  selectedTaskId: string | null;
  openTask: (id: string | null) => void;
  classFilter: string | null;
  setClassFilter: (id: string | null) => void;

  toggleTask: (id: string) => void;
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'completed' | 'sources'>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  countFor: (source: ConnectableSource) => number;
  connect: (id: ConnectableSource) => Promise<number>;
  disconnect: (id: ConnectableSource) => void;
  sync: (id?: ConnectableSource) => Promise<void>;

  updateSettings: (patch: Partial<Settings>) => void;
  resetDemo: () => void;

  toasts: Toast[];
  toast: (message: string) => void;

  /** Orbit Levels XP and focus session log. */
  progress: Progress;
  /** Level number just reached, while the celebration is showing. */
  levelUp: number | null;
  dismissLevelUp: () => void;

  focusTaskId: string | null;
  startFocus: (taskId: string) => void;
  endFocus: () => void;
  /** Record a finished focus session; returns XP earned. */
  logFocus: (taskId: string, minutes: number) => number;
}

export const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
