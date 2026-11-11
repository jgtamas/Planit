import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../lib/storeContext';
import { LEVELS, levelProgress } from '../lib/levels';
import { OrbitPlanet } from './OrbitPlanet';
import { Button, Card } from './ui';

function XpBar({ pct, className = '' }: { pct: number; className?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-surface-2 ${className}`}>
      <div className="brand-gradient h-full rounded-full transition-all duration-700" style={{ width: `${Math.round(pct * 100)}%` }} />
    </div>
  );
}

/** Today page card: the student's planet, level, and XP to next level. */
export function LevelCard() {
  const { progress } = useStore();
  const { current, next, pct, toNext } = levelProgress(progress.xp);
  return (
    <Card className="relative flex h-full flex-col items-center overflow-hidden p-5 text-center">
      <div className="text-[11px] font-semibold tracking-wide text-faint uppercase">Your planet</div>
      <div key={current.level} className="animate-level-in my-1">
        <OrbitPlanet level={current.level} size={124} />
      </div>
      <div className="text-sm font-bold text-fg">
        Level {current.level} · {current.name}
      </div>
      <XpBar pct={pct} className="mt-3 w-full" />
      <div className="mt-2 text-xs text-muted">
        {next ? (
          <>
            <span className="font-semibold text-fg">{toNext} XP</span> to {next.name}
          </>
        ) : (
          'Max level reached'
        )}
      </div>
    </Card>
  );
}

/** Compact version for the sidebar. */
export function LevelMini() {
  const { progress, settings } = useStore();
  const { current, pct } = levelProgress(progress.xp);
  return (
    <div className="flex items-center gap-3 px-1.5">
      <div className="-m-1.5 shrink-0">
        <OrbitPlanet level={current.level} size={46} animated={false} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-fg">{settings.name || 'Student'}</div>
        <div className="truncate text-[11px] text-muted">
          Lv {current.level} · {current.name}
        </div>
        <XpBar pct={pct} className="mt-1.5" />
      </div>
    </div>
  );
}

/** Full-screen celebration shown when a level is reached. */
export function LevelUpModal() {
  const { levelUp, dismissLevelUp } = useStore();
  const lvl = LEVELS.find((l) => l.level === levelUp);

  useEffect(() => {
    if (!lvl) return;
    const onKey = (e: KeyboardEvent) => (e.key === 'Escape' || e.key === 'Enter') && dismissLevelUp();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lvl, dismissLevelUp]);

  if (!lvl) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
      <div className="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismissLevelUp} />
      <div
        role="dialog"
        aria-label="Level up"
        className="animate-fade-up relative w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-surface p-8 text-center shadow-2xl"
      >
        <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-purple/30 via-brand-blue/20 to-brand-green/25 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-purple/15 px-3 py-1 text-xs font-bold tracking-wide text-brand-purple uppercase dark:text-violet-300">
            <Sparkles size={13} /> Level up
          </span>
          <div className="animate-level-in mx-auto my-4 w-fit">
            <OrbitPlanet level={lvl.level} size={180} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-fg">
            Level {lvl.level} · {lvl.name}
          </h2>
          <p className="mt-2 text-muted">{lvl.unlock}.</p>
          <Button variant="primary" size="lg" className="mt-7 w-full" onClick={dismissLevelUp}>
            Keep orbiting
          </Button>
        </div>
      </div>
    </div>
  );
}
