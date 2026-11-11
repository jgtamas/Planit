import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import type { ConnectableSource } from '../types';
import { useStore } from '../lib/storeContext';
import { CONNECTABLE, SOURCES } from '../lib/sources';
import { PlanitLogo } from '../components/PlanitLogo';
import { SourceIcon } from '../components/SourceTag';
import { Button } from '../components/ui';

const GRADES = ['9th', '10th', '11th', '12th'];

function ConnectCard({ id }: { id: ConnectableSource }) {
  const { connections, connect, countFor } = useStore();
  const [loading, setLoading] = useState(false);
  const meta = SOURCES[id];
  const connected = connections[id].connected;

  const onClick = async () => {
    setLoading(true);
    await connect(id);
    setLoading(false);
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border bg-surface p-4 transition-all duration-200 ${
        connected ? 'border-brand-green/40' : 'border-line'
      }`}
    >
      <SourceIcon source={id} size={44} />
      <div className="min-w-0 flex-1">
        <div className="font-bold text-fg">{meta.name}</div>
        <div className="truncate text-xs text-muted">
          {connected ? (
            <span className="animate-fade-in font-semibold text-brand-green">Imported {countFor(id)} items</span>
          ) : (
            meta.description
          )}
        </div>
      </div>
      {connected ? (
        <span className="animate-pop flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-white">
          <Check size={18} strokeWidth={3} />
        </span>
      ) : (
        <Button size="sm" variant="secondary" onClick={onClick} disabled={loading} className="min-w-[104px]">
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Syncing
            </>
          ) : (
            'Connect'
          )}
        </Button>
      )}
    </div>
  );
}

export function Onboarding() {
  const { settings, updateSettings, connections } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(settings.name);
  const [grade, setGrade] = useState(settings.grade || '11th');
  const connectedCount = CONNECTABLE.filter((s) => connections[s].connected).length;

  const finish = () => updateSettings({ name: name.trim(), grade, onboarded: true });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        {/* progress */}
        <div className="mb-10 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'brand-gradient w-8' : i < step ? 'w-4 bg-brand-purple/50' : 'w-4 bg-line-strong'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div key="s0" className="animate-fade-up text-center">
            <div className="relative mx-auto mb-8 flex h-[200px] w-[200px] items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-purple/25 via-brand-blue/15 to-brand-green/20 blur-3xl" />
              <div className="animate-orbit absolute inset-2 rounded-full border border-dashed border-line-strong" />
              <PlanitLogo size={160} className="animate-float relative" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-fg">Planit</h1>
            <p className="mt-3 text-lg font-medium text-muted">
              All your school, <span className="brand-text font-bold">one orbit.</span>
            </p>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-faint">
              Canvas, Blackbaud, Reminders, and Google Calendar together in one calm view.
            </p>
            <Button variant="primary" size="lg" className="mt-10 w-full" onClick={() => setStep(1)}>
              Get started <ArrowRight size={18} />
            </Button>
          </div>
        )}

        {step === 1 && (
          <form
            key="s1"
            className="animate-fade-up"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) setStep(2);
            }}
          >
            <PlanitLogo size={44} className="mb-6" />
            <h1 className="text-3xl font-extrabold tracking-tight text-fg">Let’s get you set up</h1>
            <p className="mt-2 text-muted">Planit works best when it knows a little about you.</p>

            <label className="mt-8 block">
              <span className="mb-2 block text-sm font-semibold text-fg">First name</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Josh"
                className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] font-medium text-fg placeholder:text-faint focus:border-brand-purple/60 focus:ring-4 focus:ring-brand-purple/10 focus:outline-none"
              />
            </label>

            <div className="mt-6">
              <span className="mb-2 block text-sm font-semibold text-fg">Grade</span>
              <div className="grid grid-cols-4 gap-2">
                {GRADES.map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`h-12 rounded-xl border text-sm font-bold transition-all duration-150 ${
                      grade === g
                        ? 'border-brand-purple bg-brand-purple/12 text-fg ring-4 ring-brand-purple/10'
                        : 'border-line bg-surface text-muted hover:border-line-strong hover:text-fg'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <Button type="button" variant="ghost" size="lg" onClick={() => setStep(0)}>
                <ArrowLeft size={18} />
              </Button>
              <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={!name.trim()}>
                Continue <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div key="s2" className="animate-fade-up">
            <h1 className="text-3xl font-extrabold tracking-tight text-fg">Connect your accounts</h1>
            <p className="mt-2 text-muted">
              Planit pulls everything into one place and merges duplicates, so nothing shows up twice.
            </p>
            <div className="mt-8 space-y-3">
              {CONNECTABLE.map((id) => (
                <ConnectCard key={id} id={id} />
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
                <ArrowLeft size={18} />
              </Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={finish}>
                {connectedCount > 0 ? 'Enter your orbit' : 'Continue'} <ArrowRight size={18} />
              </Button>
            </div>
            {connectedCount === 0 && (
              <button onClick={finish} className="mt-4 w-full text-center text-sm font-semibold text-muted transition-colors hover:text-fg">
                Skip for now
              </button>
            )}
            <p className="mt-6 text-center text-xs text-faint">Demo mode — sample data shown. No real accounts are accessed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
