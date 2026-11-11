export type SourceId = 'canvas' | 'blackbaud' | 'reminders' | 'gcal' | 'planit';

/** Sources that can be connected (everything except manual Planit tasks). */
export type ConnectableSource = Exclude<SourceId, 'planit'>;

export type Priority = 'low' | 'medium' | 'high';

export type TaskKind = 'assignment' | 'quiz' | 'test' | 'homework' | 'reminder' | 'event';

export interface Task {
  id: string;
  title: string;
  courseId?: string;
  /** Every source this item was found in. More than one means a duplicate was merged. */
  sources: SourceId[];
  kind: TaskKind;
  /** ISO date-time the item is due (or starts, for events). */
  due: string;
  /** ISO date-time an event ends. */
  end?: string;
  /** Estimated minutes of work. Falls back to a default by kind. */
  estimate?: number;
  priority: Priority;
  notes: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  teacher: string;
  period: string;
  room: string;
  /** Accent color used on the course card. */
  color: string;
}

export interface Connection {
  id: ConnectableSource;
  connected: boolean;
  lastSynced?: string;
}

export type ThemeMode = 'dark' | 'light';

export interface Settings {
  name: string;
  grade: string;
  theme: ThemeMode;
  onboarded: boolean;
}

export type PageId = 'today' | 'week' | 'classes' | 'connections' | 'settings';

export interface FocusSession {
  id: string;
  taskId: string;
  minutes: number;
  /** ISO time the session ended. */
  at: string;
}

export interface Progress {
  xp: number;
  sessions: FocusSession[];
}
