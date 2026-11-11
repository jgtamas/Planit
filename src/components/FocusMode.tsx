import { useEffect, useRef, useState } from 'react';
import { isToday } from 'date-fns';
import { Check, Pause, Play, RotateCcw, Square, X } from 'lucide-react';
import { useStore } from '../lib/storeContext';
import { COURSE_BY_ID } from '../data/mockData';
import { estimateOf, formatMinutes } from '../lib/planning';
import { PlanitLogo } from './PlanitLogo';
import { Button } from './ui';

type Phase = 'setup' | 'launching' | 'running' | 'done';

const LENGTHS = [
  { min: 1, label: 'Demo', sub: '1 min' },
  { min: 15, label: '15', sub: 'min' },
  { min: 25, label: '25', sub: 'min' },
  { min: 50, label: '50', sub: 'min' },
];

const STARS = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 37.3) % 100,
  y: (i * 61.7) % 100,
  s: (i % 3) + 1,
  d: 2 + (i % 5),
}));

function fmt(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function FocusMode() {
  const { focusTaskId, tasks, endFocus, logFocus, toggleTask, progress } = useStore();
  const task = tasks.find((t) => t.id === focusTaskId);
  const [phase, setPhase] = useState<Phase>('setup');
  const [length, setLength] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60000);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ minutes: number; xp: number } | null>(null);
  const endAt = useRef(0);

  // reset whenever a new task is focused
  useEffect(() => {
    if (!focusTaskId) return;
    setPhase('setup');
    setPaused(false);
    setResult(null);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.title = 'Planit';
    };
  }, [focusTaskId]);

  // ticking clock, based on a fixed end time so background tabs stay accurate
  useEffect(() => {
    if (phase !== 'running' || paused) return;
    const tick = () => {
      const left = endAt.current - Date.now();
      setRemaining(left);
      document.title = `${fmt(left)} · Focus — Planit`;
      if (left <= 0) finish(length);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused]);

  useEffect(() => {
    if (!task || phase === 'running' || phase === 'launching') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && endFocus();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [task, phase, endFocus]);

  if (!task) return null;

  const course = task.courseId ? COURSE_BY_ID[task.courseId] : undefined;
  const sessionsForTask = progress.sessions.filter((s) => s.taskId === task.id);
  const minutesForTask = sessionsForTask.reduce((n, s) => n + s.minutes, 0);
  const todayMinutes = progress.sessions.filter((s) => isToday(new Date(s.at))).reduce((n, s) => n + s.minutes, 0);
  const totalMs = length * 60000;
  const pct = phase === 'running' ? 1 - Math.max(0, remaining) / totalMs : 0;

  function launch() {
    setRemaining(length * 60000);
    setPhase('launching');
    setTimeout(() => {
      endAt.current = Date.now() + length * 60000;
      setPhase('running');
    }, 1500);
  }

  function finish(minutes: number) {
    document.title = 'Planit';
    const xp = minutes >= 1 ? logFocus(task!.id, minutes) : 0;
    setResult({ minutes, xp });
    setPhase('done');
  }

  function togglePause() {
    if (paused) {
      endAt.current = Date.now() + remaining;
      setPaused(false);
    } else {
      setRemaining(endAt.current - Date.now());
      setPaused(true);
    }
  }

  function endEarly() {
    const left = paused ? remaining : endAt.current - Date.now();
    finish(Math.floor((totalMs - left) / 60000));
  }

  // big orbit track geometry
  const R = 128;
  const C = 2 * Math.PI * R;
  const angle = pct * 2 * Math.PI - Math.PI / 2;

  return (
    <div className="animate-fade-in fixed inset-0 z-[70] flex flex-col overflow-hidden bg-[#070A13] text-white">
      {/* starfield */}
      <div className="pointer-events-none absolute inset-0">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              opacity: 0.25 + (s.s - 1) * 0.2,
              animation: phase === 'launching' ? `star-streak 1.5s ease-in both` : `twinkle ${s.d}s ease-in-out ${i * 0.13}s infinite`,
            }}
          />
        ))}
        <div className="absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-purple/25 via-brand-blue/15 to-brand-green/15 blur-3xl" />
      </div>

      <header className="relative flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6">
        <span className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase">Focus mode</span>
        {(phase === 'setup' || phase === 'done') && (
          <button onClick={endFocus} aria-label="Close focus mode" className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
            <X size={20} />
          </button>
        )}
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-5 pb-10 text-center">
        <div className="mb-8 max-w-xl">
          {course && (
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-white/60">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: course.color }} />
              {course.name}
            </div>
          )}
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{task.title}</h1>
          <p className="mt-2 text-sm text-white/50">
            Estimated {formatMinutes(estimateOf(task))}
            {minutesForTask > 0 && ` · ${formatMinutes(minutesForTask)} focused so far`}
          </p>
        </div>

        {phase === 'setup' && (
          <div className="animate-fade-up flex flex-col items-center">
            <PlanitLogo size={120} className="animate-float mb-10" />
            <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
              {LENGTHS.map((l) => (
                <button
                  key={l.min}
                  onClick={() => setLength(l.min)}
                  className={`flex w-[72px] flex-col items-center rounded-xl py-2.5 transition-all duration-150 sm:w-20 ${
                    length === l.min ? 'bg-white text-[#0B0F1A] shadow-lg' : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-lg font-extrabold">{l.label}</span>
                  <span className="text-[11px] font-semibold opacity-70">{l.sub}</span>
                </button>
              ))}
            </div>
            <Button variant="primary" size="lg" className="mt-8 min-w-60" onClick={launch}>
              <Play size={18} fill="currentColor" /> Launch into orbit
            </Button>
            <p className="mt-4 text-xs text-white/40">Earn {length === 1 ? 10 : length * 2} XP for your planet</p>
          </div>
        )}

        {phase === 'launching' && (
          <div className="flex flex-col items-center">
            <div className="relative h-[300px] w-[300px]">
              <div className="animate-launch-trail absolute bottom-0 left-1/2 h-40 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-t from-transparent via-brand-blue/60 to-brand-purple" />
              <div className="animate-launch absolute inset-0 flex items-center justify-center">
                <PlanitLogo size={140} />
              </div>
            </div>
            <p className="animate-fade-in mt-4 text-sm font-semibold tracking-wide text-white/70">Launching into orbit…</p>
          </div>
        )}

        {phase === 'running' && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="relative h-[300px] w-[300px]">
              <svg viewBox="0 0 300 300" className="absolute inset-0">
                <defs>
                  <linearGradient id="focus-track" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#7C3AED" />
                    <stop offset="0.55" stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                <circle cx="150" cy="150" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" strokeDasharray="2 6" />
                <circle
                  cx="150"
                  cy="150"
                  r={R}
                  stroke="url(#focus-track)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct)}
                  transform="rotate(-90 150 150)"
                  style={{ transition: 'stroke-dashoffset 250ms linear' }}
                />
                <circle cx={150 + R * Math.cos(angle)} cy={150 + R * Math.sin(angle)} r="9" fill="#fff" stroke="#10B981" strokeWidth="3" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <PlanitLogo size={64} className={paused ? 'opacity-50' : 'animate-float'} />
                <div className="mt-3 font-mono text-5xl font-bold tracking-tight tabular-nums">{fmt(remaining)}</div>
                <div className="mt-1 text-xs font-semibold tracking-wide text-white/50 uppercase">{paused ? 'Paused' : 'In orbit'}</div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Button variant="secondary" className="!border-white/15 !bg-white/10 !text-white hover:!bg-white/15" onClick={togglePause}>
                {paused ? <Play size={16} /> : <Pause size={16} />}
                {paused ? 'Resume' : 'Pause'}
              </Button>
              <Button variant="ghost" className="!text-white/60 hover:!bg-white/10 hover:!text-white" onClick={endEarly}>
                <Square size={14} /> End session
              </Button>
            </div>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="animate-fade-up flex flex-col items-center">
            <div className="relative mb-6">
              <span className="animate-burst absolute inset-0 rounded-full border-2 border-brand-green" />
              <div className="brand-gradient animate-pop flex h-20 w-20 items-center justify-center rounded-full shadow-[0_0_60px_-10px_rgba(16,185,129,0.8)]">
                <Check size={38} strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold">{result.minutes >= 1 ? 'Session complete' : 'Session ended'}</h2>
            <p className="mt-2 text-white/60">
              {result.minutes >= 1
                ? `${formatMinutes(result.minutes)} of focus logged · ${formatMinutes(todayMinutes)} today`
                : 'Less than a minute, so nothing was logged.'}
            </p>
            {result.xp > 0 && (
              <span className="mt-4 rounded-full bg-brand-green/15 px-4 py-1.5 text-sm font-bold text-emerald-300">+{result.xp} XP</span>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!task.completed && (
                <Button
                  variant="primary"
                  onClick={() => {
                    toggleTask(task.id);
                    endFocus();
                  }}
                >
                  <Check size={16} /> Mark task done
                </Button>
              )}
              <Button variant="secondary" className="!border-white/15 !bg-white/10 !text-white hover:!bg-white/15" onClick={() => setPhase('setup')}>
                <RotateCcw size={15} /> Another round
              </Button>
              <Button variant="ghost" className="!text-white/60 hover:!bg-white/10 hover:!text-white" onClick={endFocus}>
                Back to Planit
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
