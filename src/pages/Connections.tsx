import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, Loader2, RefreshCw } from 'lucide-react';
import type { ConnectableSource } from '../types';
import { useStore } from '../lib/storeContext';
import { CONNECTABLE, SOURCES } from '../lib/sources';
import { SourceIcon } from '../components/SourceTag';
import { Button, Card, PageHeader } from '../components/ui';

/** Re-render every 30s so "last synced" labels stay fresh. */
function useTick(ms = 30000) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function syncedLabel(iso?: string) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 45000) return 'Just now';
  return `${formatDistanceToNow(new Date(iso))} ago`;
}

export function ConnectionRow({ id }: { id: ConnectableSource }) {
  const { connections, connect, disconnect, sync, countFor, toast } = useStore();
  const [busy, setBusy] = useState<'connect' | 'sync' | null>(null);
  const conn = connections[id];
  const meta = SOURCES[id];
  const count = countFor(id);

  const onConnect = async () => {
    setBusy('connect');
    const n = await connect(id);
    setBusy(null);
    toast(`${meta.name} connected · Imported ${n} items`);
  };

  const onSync = async () => {
    setBusy('sync');
    await sync(id);
    setBusy(null);
    toast(`${meta.name} is up to date`);
  };

  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <SourceIcon source={id} size={44} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-fg">{meta.name}</h3>
            {conn.connected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/12 px-2 py-0.5 text-[11px] font-semibold text-brand-green">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green" /> Connected
              </span>
            ) : (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-faint">Not connected</span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted">
            {conn.connected ? `${count} items · Last synced ${syncedLabel(conn.lastSynced)}` : meta.description}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2 sm:justify-end">
        {conn.connected ? (
          <>
            <Button size="sm" variant="secondary" onClick={onSync} disabled={busy !== null}>
              <RefreshCw size={14} className={busy === 'sync' ? 'animate-spin' : ''} />
              {busy === 'sync' ? 'Syncing…' : 'Sync'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy !== null}
              onClick={() => {
                disconnect(id);
                toast(`${meta.name} disconnected`);
              }}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button size="sm" variant="primary" onClick={onConnect} disabled={busy !== null} className="min-w-28">
            {busy === 'connect' ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Connecting…
              </>
            ) : (
              'Connect'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export function Connections() {
  useTick();
  const { connections, sync, toast } = useStore();
  const [syncing, setSyncing] = useState(false);
  const anyConnected = CONNECTABLE.some((s) => connections[s].connected);
  const connectedCount = CONNECTABLE.filter((s) => connections[s].connected).length;

  const syncAll = async () => {
    setSyncing(true);
    await sync();
    setSyncing(false);
    toast('All sources synced · Everything is up to date');
  };

  return (
    <div>
      <PageHeader
        title="Connections"
        subtitle={`${connectedCount} of ${CONNECTABLE.length} sources connected. Planit merges duplicates across them.`}
        right={
          <Button variant="primary" onClick={syncAll} disabled={!anyConnected || syncing}>
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync now'}
          </Button>
        }
      />

      <Card className="divide-y divide-line overflow-hidden">
        {CONNECTABLE.map((id) => (
          <ConnectionRow key={id} id={id} />
        ))}
      </Card>

      <h2 className="mt-10 mb-3 px-1 text-sm font-bold tracking-wide text-muted uppercase">Coming soon</h2>
      <Card className="divide-y divide-line overflow-hidden">
        {[
          { name: 'Schoology', color: '#0EA5E9', desc: 'Courses and assignments' },
          { name: 'Google Classroom', color: '#22C55E', desc: 'Classwork and announcements' },
          { name: 'Notion', color: '#94A3B8', desc: 'Pages and to-do databases' },
        ].map((s) => (
          <div key={s.name} className="flex items-center gap-4 px-5 py-4 opacity-70">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold text-white"
              style={{ background: s.color }}
            >
              {s.name[0]}
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-fg">{s.name}</div>
              <div className="text-xs text-muted">{s.desc}</div>
            </div>
            <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-faint">Soon</span>
          </div>
        ))}
      </Card>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-faint">
        <Check size={12} /> Demo mode — sample data shown.
      </p>
    </div>
  );
}
