import React from 'react';

interface MosaicBadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'purple' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'notion';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export function MosaicBadge({
  children,
  variant = 'orange',
  size = 'md',
  icon,
  className = '',
}: MosaicBadgeProps) {
  const variantStyles = {
    orange: 'bg-orange-950/60 text-orange-300 border-orange-700/50 hover:border-orange-500/70',
    purple: 'bg-purple-950/50 text-purple-300 border-purple-800/40 hover:border-purple-600/60',
    blue: 'bg-indigo-950/50 text-indigo-300 border-indigo-800/40 hover:border-indigo-600/60',
    emerald: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40 hover:border-emerald-600/60',
    amber: 'bg-amber-950/50 text-amber-300 border-amber-800/40 hover:border-amber-600/60',
    rose: 'bg-rose-950/50 text-rose-300 border-rose-800/40 hover:border-rose-600/60',
    slate: 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700',
    notion: 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700',
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
