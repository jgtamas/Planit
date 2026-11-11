import { useMemo, useRef, useState } from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { CalendarDays, CornerDownLeft, Plus } from 'lucide-react';
import { parseQuickAdd } from '../lib/parse';
import { useStore } from '../lib/storeContext';
import { COURSE_BY_ID } from '../data/mockData';
import { timeLabel } from '../lib/dates';
import { DEFAULT_ESTIMATE, formatMinutes } from '../lib/planning';

const EXAMPLES = ['Bio lab report friday', 'Chem quiz thursday high priority', 'Study for APUSH test tomorrow 2h', 'Call grandma sunday at 3pm', 'Gatsby essay next week 3h'];

export function QuickAdd() {
  const { addTask, toast } = useStore();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholder = useMemo(() => EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)], []);
  const parsed = value.trim() ? parseQuickAdd(value) : null;

  const dateText = (d: Date) => {
    const day = isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : format(d, 'EEE, MMM d');
    return `${day} · ${timeLabel(d)}`;
  };

  const submit = () => {
    if (!parsed || !parsed.title) return;
    addTask({
      title: parsed.title,
      due: parsed.due.toISOString(),
      courseId: parsed.courseId,
      priority: parsed.priority,
      kind: parsed.kind,
      estimate: parsed.estimate,
      notes: '',
    });
    toast(`Added “${parsed.title}” · ${dateText(parsed.due)}`);
    setValue('');
  };

  return (
    <div
      className={`rounded-2xl border bg-surface shadow-card transition-all duration-200 ${
        focused ? 'border-brand-purple/60 ring-4 ring-brand-purple/10' : 'border-line'
      }`}
    >
      <div className="flex items-center gap-3 px-4">
        <Plus size={18} className={focused ? 'text-brand-purple' : 'text-faint'} />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') setValue('');
          }}
          placeholder={`Add a task — try “${placeholder}”`}
          aria-label="Quick add a task"
          className="h-14 min-w-0 flex-1 bg-transparent text-[15px] font-medium text-fg placeholder:text-faint focus:outline-none"
        />
        {value.trim() && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={submit}
            className="hidden items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-fg sm:flex"
          >
            <CornerDownLeft size={13} /> Add
          </button>
        )}
      </div>
      {parsed && parsed.title && (
        <div className="animate-fade-in flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-purple/12 px-2.5 py-1 font-semibold text-brand-purple dark:text-violet-300">
            <CalendarDays size={12} />
            {dateText(parsed.due)}
          </span>
          {parsed.courseId && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 font-semibold text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: COURSE_BY_ID[parsed.courseId].color }} />
              {COURSE_BY_ID[parsed.courseId].name}
            </span>
          )}
          <span className="rounded-full bg-surface-2 px-2.5 py-1 font-semibold text-muted">
            ~{formatMinutes(parsed.estimate ?? DEFAULT_ESTIMATE[parsed.kind])} {parsed.kind}
          </span>
          {parsed.priority === 'high' && (
            <span className="rounded-full bg-rose-500/12 px-2.5 py-1 font-semibold text-rose-500">High priority</span>
          )}
          {!parsed.hasDate && <span className="text-faint">No date found — defaults to tonight</span>}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={submit}
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-muted hover:text-fg sm:hidden"
          >
            <CornerDownLeft size={12} /> Add
          </button>
          <span className="ml-auto hidden text-faint sm:inline">Press Enter to add</span>
        </div>
      )}
    </div>
  );
}
