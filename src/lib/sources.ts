import type { ConnectableSource, SourceId } from '../types';

export interface SourceMeta {
  id: SourceId;
  name: string;
  short: string;
  color: string;
  description: string;
}

export const SOURCES: Record<SourceId, SourceMeta> = {
  canvas: {
    id: 'canvas',
    name: 'Canvas',
    short: 'Canvas',
    color: '#F2552C',
    description: 'Assignments, quizzes, and due dates from your courses.',
  },
  blackbaud: {
    id: 'blackbaud',
    name: 'Blackbaud',
    short: 'Blackbaud',
    color: '#3B82F6',
    description: 'Homework, tests, and the school schedule.',
  },
  reminders: {
    id: 'reminders',
    name: 'Apple Reminders',
    short: 'Reminders',
    color: '#F59E0B',
    description: 'Personal to-dos from your iPhone and Mac.',
  },
  gcal: {
    id: 'gcal',
    name: 'Google Calendar',
    short: 'Calendar',
    color: '#10B981',
    description: 'Clubs, practices, and events on your calendar.',
  },
  planit: {
    id: 'planit',
    name: 'Planit',
    short: 'Planit',
    color: '#8B5CF6',
    description: 'Tasks you add right here in Planit.',
  },
};

export const CONNECTABLE: ConnectableSource[] = ['canvas', 'blackbaud', 'reminders', 'gcal'];
