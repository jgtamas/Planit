import type { ReactNode } from 'react';
import { PlanitLogo } from './PlanitLogo';

export function EmptyState({
  title,
  body,
  action,
  size = 56,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
      <PlanitLogo size={size} className="mb-4 opacity-90" />
      <h3 className="text-base font-bold text-fg">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
