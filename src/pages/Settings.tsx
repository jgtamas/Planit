import { useState } from 'react';
import { Moon, RotateCcw, Sun } from 'lucide-react';
import { useStore } from '../lib/storeContext';
import { PlanitLogo } from '../components/PlanitLogo';
import { Button, Card, PageHeader } from '../components/ui';

const GRADES = ['9th', '10th', '11th', '12th'];

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-semibold text-fg">{title}</div>
        <div className="text-sm text-muted">{desc}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function Settings() {
  const { settings, updateSettings, resetDemo, toast } = useStore();
  const [name, setName] = useState(settings.name);
  const [confirmReset, setConfirmReset] = useState(false);

  const saveName = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === settings.name) return;
    updateSettings({ name: trimmed });
    toast('Name updated');
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Make Planit yours." />

      <Card className="divide-y divide-line">
        <Row title="Appearance" desc="Space-dark by default. Light mode for bright classrooms.">
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1">
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all duration-150 ${
                  settings.theme === t ? 'bg-surface text-fg shadow-card' : 'text-muted hover:text-fg'
                }`}
              >
                {t === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
                {t}
              </button>
            ))}
          </div>
        </Row>

        <Row title="Your name" desc="Used in your daily greeting.">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveName();
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              aria-label="First name"
              className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm font-medium text-fg focus:border-brand-purple/60 focus:outline-none sm:w-48"
            />
          </form>
        </Row>

        <Row title="Grade" desc="Helps tailor what Planit highlights.">
          <div className="grid grid-cols-4 gap-1 rounded-xl border border-line bg-surface-2 p-1">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => updateSettings({ grade: g })}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150 ${
                  settings.grade === g ? 'bg-surface text-fg shadow-card' : 'text-muted hover:text-fg'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Row>

        <Row title="Reset demo" desc="Restarts onboarding in this tab. Every newly opened tab also starts fresh.">
          {confirmReset ? (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={resetDemo}>
                <RotateCcw size={14} /> Yes, reset everything
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={14} /> Reset demo
            </Button>
          )}
        </Row>
      </Card>

      <div className="mt-12 flex flex-col items-center text-center">
        <PlanitLogo size={40} />
        <div className="mt-3 text-sm font-bold text-fg">Planit</div>
        <div className="text-xs text-muted">All your school, one orbit.</div>
        <div className="mt-1 text-xs text-faint">Version 1.0 · Demo mode — sample data shown</div>
      </div>
    </div>
  );
}
