import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Priority } from '../types';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary:
    'brand-gradient text-white shadow-[0_6px_20px_-6px_rgba(124,58,237,0.6)] hover:brightness-110 active:brightness-95',
  secondary: 'bg-surface-2 text-fg border border-line hover:border-line-strong hover:bg-raised',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg'; children: ReactNode }) {
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-[15px]' };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 ${sizes[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export const PRIORITY_COLOR: Record<Priority, string> = {
  high: '#F43F5E',
  medium: '#F59E0B',
  low: '#64748B',
};

export function PriorityDot({ priority }: { priority: Priority }) {
  return (
    <span
      title={`${priority[0].toUpperCase()}${priority.slice(1)} priority`}
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ background: PRIORITY_COLOR[priority] }}
    />
  );
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-2xl border border-line bg-surface shadow-card ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
