import React from 'react';

interface MosaicBadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'notion';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export function MosaicBadge({
  children,
  variant = 'purple',
  size = 'md',
  icon,
  className = '',
}: MosaicBadgeProps) {
  const variantStyles = {
    purple: 'bg-purple-950/60 text-purple-300 border-purple-700/40 hover:border-purple-500/60',
    blue: 'bg-indigo-950/60 text-indigo-300 border-indigo-700/40 hover:border-indigo-500/60',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40 hover:border-emerald-500/60',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-700/40 hover:border-amber-500/60',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-700/40 hover:border-rose-500/60',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-500/60',
    notion: 'bg-stone-900/90 text-stone-300 border-stone-700 hover:border-stone-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border backdrop-blur-md transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="opacity-80 shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
