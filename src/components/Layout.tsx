import type { ReactNode } from 'react';
import { CalendarDays, CheckCircle2, GraduationCap, Link2, Settings, Sun } from 'lucide-react';
import type { PageId } from '../types';
import { useStore } from '../lib/storeContext';
import { PlanitWordmark } from './PlanitLogo';
import { TaskDrawer } from './TaskDrawer';
import { FocusMode } from './FocusMode';
import { LevelMini, LevelUpModal } from './Levels';

const NAV: { id: PageId; label: string; icon: typeof Sun }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'week', label: 'Week', icon: CalendarDays },
  { id: 'classes', label: 'Classes', icon: GraduationCap },
  { id: 'connections', label: 'Connections', icon: Link2 },
];

function Sidebar() {
  const { page, setPage, visibleTasks } = useStore();
  const openCount = visibleTasks.filter((t) => !t.completed && t.kind !== 'event').length;

  const item = (id: PageId, label: string, Icon: typeof Sun, badge?: number) => {
    const active = page === id;
    return (
      <button
        key={id}
        onClick={() => setPage(id)}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
          active ? 'bg-surface-2 text-fg shadow-card' : 'text-muted hover:bg-surface-2/60 hover:text-fg'
        }`}
      >
        <Icon size={18} className={active ? 'text-brand-purple dark:text-violet-400' : ''} />
        <span className="flex-1 text-left">{label}</span>
        {badge !== undefined && badge > 0 && <span className="text-xs font-semibold text-faint">{badge}</span>}
      </button>
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface/60 px-4 py-6 backdrop-blur-xl md:flex">
      <div className="px-2">
        <PlanitWordmark size={30} />
      </div>
      <nav className="mt-8 space-y-1">{NAV.map((n) => item(n.id, n.label, n.icon, n.id === 'today' ? openCount : undefined))}</nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-2xl border border-line bg-surface-2/60 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-fg">
            <CheckCircle2 size={14} className="text-brand-green" /> Demo mode
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">Sample data shown. No real accounts are connected.</p>
        </div>
        {item('settings', 'Settings', Settings)}
        <div className="pt-1">
          <LevelMini />
        </div>
      </div>
    </aside>
  );
}

function BottomNav() {
  const { page, setPage } = useStore();
  const items = [...NAV, { id: 'settings' as PageId, label: 'Settings', icon: Settings }];
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/85 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {items.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                active ? 'text-fg' : 'text-faint'
              }`}
            >
              <span className={`rounded-full px-3 py-1 transition-colors ${active ? 'bg-brand-purple/15' : ''}`}>
                <Icon size={19} className={active ? 'text-brand-purple dark:text-violet-400' : ''} />
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-xl md:hidden">
      <PlanitWordmark size={26} />
    </header>
  );
}

function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fade-up flex max-w-md items-center gap-2.5 rounded-xl border border-line bg-raised px-4 py-2.5 text-sm font-medium text-fg shadow-2xl"
        >
          <CheckCircle2 size={16} className="shrink-0 text-brand-green" />
          <span className="truncate">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileHeader />
      <main className="pb-28 md:pb-12 md:pl-64">
        <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 md:px-10 md:pt-10">{children}</div>
      </main>
      <BottomNav />
      <TaskDrawer />
      <FocusMode />
      <LevelUpModal />
      <Toasts />
    </div>
  );
}
