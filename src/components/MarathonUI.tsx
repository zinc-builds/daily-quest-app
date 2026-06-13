'use client';

import { cn } from '@/lib/utils';

export function Panel({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        'border border-white/20 bg-black p-4 relative',
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
          <h3 className="text-xs font-mono-data uppercase tracking-widest text-lime">
            {title}
          </h3>
          <span className="text-[10px] font-mono-data text-white/40">[ ACTIVE ]</span>
        </div>
      )}
      {children}
    </div>
  );
}

export function TerminalButton({
  children,
  onClick,
  variant = 'default',
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'lime' | 'ghost';
  className?: string;
  disabled?: boolean;
}) {
  const variants = {
    default:
      'border-white/40 text-white hover:border-lime hover:text-lime hover:shadow-[0_0_12px_rgba(192,254,4,0.3)]',
    lime: 'border-lime bg-lime text-black hover:bg-white hover:border-white hover:shadow-[0_0_16px_rgba(192,254,4,0.6)]',
    ghost:
      'border-transparent text-white/60 hover:text-white hover:border-white/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 border font-mono-data text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function TerminalInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full bg-black border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-lime focus:outline-none font-mono-data',
        className
      )}
    />
  );
}

export function TerminalCheckbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer group', className)}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'w-5 h-5 border flex items-center justify-center transition-all',
          checked
            ? 'border-lime bg-lime text-black'
            : 'border-white/40 text-transparent group-hover:border-lime'
        )}
      >
        <span className="font-mono-data text-xs">✓</span>
      </button>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

export function ProgressBar({
  current,
  max,
  className,
}: {
  current: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;
  return (
    <div className={cn('h-3 w-full border border-white/20 bg-black', className)}>
      <div
        className="h-full bg-lime transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-1">
      {children}
    </h2>
  );
}

export function DataLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono-data">
      {children}
    </span>
  );
}

export function DataValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('text-lg font-mono-data text-lime', className)}>
      {children}
    </span>
  );
}
