import { useState } from 'react';
import { CalendarClock, GitMerge } from 'lucide-react';
import type { Task } from '../types';
import { useStore } from '../lib/storeContext';
import { COURSE_BY_ID } from '../data/mockData';
import { dueLabel, isOverdue } from '../lib/dates';
import { estimateOf, formatMinutes } from '../lib/planning';
import { SourceTags } from './SourceTag';
import { PriorityDot } from './ui';

export function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  const [burst, setBurst] = useState(0);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        if (!checked) setBurst((b) => b + 1);
        onToggle();
      }}
      className="group/check relative flex h-6 w-6 shrink-0 items-center justify-center"
    >
      {burst > 0 && <span key={burst} className="animate-burst absolute inset-0 rounded-full border-2 border-brand-green" />}
      <span
        className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 transition-all duration-200 ${
          checked
            ? 'brand-gradient animate-pop border-transparent'
            : 'border-line-strong group-hover/check:border-brand-purple group-hover/check:bg-brand-purple/10'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
            <path className="animate-draw" d="M3.5 8.5l3 3 6-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

export function TaskCard({ task, showCourse = true }: { task: Task; showCourse?: boolean }) {
  const { toggleTask, openTask, connections } = useStore();
  const [completing, setCompleting] = useState(false);
  const course = task.courseId ? COURSE_BY_ID[task.courseId] : undefined;
  const overdue = isOverdue(task);
  const isEvent = task.kind === 'event';
  const sources = task.sources.filter((s) => s === 'planit' || connections[s]?.connected);
  const merged = sources.length > 1;
  const checked = task.completed || completing;

  const onToggle = () => {
    if (task.completed) {
      toggleTask(task.id);
      return;
    }
    setCompleting(true);
    setTimeout(() => {
      toggleTask(task.id);
      setCompleting(false);
    }, 650);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openTask(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTask(task.id);
        }
      }}
      className={`group animate-fade-up flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-card transition-all duration-200 hover:-translate-y-px hover:border-line-strong ${
        completing ? 'scale-[0.98] opacity-40' : ''
      }`}
    >
      <div className="pt-0.5">
        {isEvent ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full text-faint" title="Calendar event">
            <CalendarClock size={17} />
          </span>
        ) : (
          <Checkbox checked={checked} onToggle={onToggle} label={`Mark ${task.title} ${task.completed ? 'not done' : 'done'}`} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={`min-w-0 flex-1 text-[15px] leading-snug font-semibold transition-colors duration-200 ${
              checked ? 'text-faint line-through decoration-2' : 'text-fg'
            }`}
          >
            {task.title}
          </p>
          {!isEvent && <span className="mt-1.5"><PriorityDot priority={task.priority} /></span>}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted">
          {showCourse && course && (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: course.color }} />
              {course.name}
            </span>
          )}
          <span className={overdue ? 'font-semibold text-rose-500' : ''}>{dueLabel(task)}</span>
          {!isEvent && !task.completed && (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted" title="Estimated time">
              ~{formatMinutes(estimateOf(task))}
            </span>
          )}
          <SourceTags sources={sources} compact />
          {merged && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-faint"
              title="Found in multiple sources — Planit merged them into one item"
            >
              <GitMerge size={11} /> Merged
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
