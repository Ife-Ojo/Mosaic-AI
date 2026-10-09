'use client';

import React from 'react';
import { 
  AlertTriangle, 
  Database, 
  ExternalLink, 
  ShieldAlert, 
  Sparkles,
  Info
} from 'lucide-react';

interface DemoModeBannerProps {
  onOpenSetupModal: () => void;
  isDemoMode: boolean;
}

export function DemoModeBanner({ onOpenSetupModal, isDemoMode }: DemoModeBannerProps) {
  if (!isDemoMode) {
    return (
      <div className="rounded-2xl bg-emerald-950/30 border border-emerald-800/40 p-4 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-emerald-300">Supabase Connected</div>
            <p className="text-slate-400">Live PostgreSQL synchronization active with Row Level Security (RLS).</p>
          </div>
        </div>
        <button
          onClick={onOpenSetupModal}
          className="text-emerald-400 hover:text-emerald-300 font-medium underline text-xs shrink-0"
        >
          View Schema
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/20 to-slate-900 border border-amber-600/30 p-4 sm:p-5 text-xs shadow-lg shadow-black/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300 text-sm">Demo Mode Active</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-200 border border-amber-700/50">
                Session Only
              </span>
            </div>
            <p className="text-slate-300 mt-1 leading-relaxed">
              Supabase database credentials are not configured. Browsing realistic sample notes and saving notes to your <strong>browser session only</strong> (saves are temporary and not synced to cloud).
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSetupModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 font-semibold text-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Setup Supabase & SQL</span>
        </button>
      </div>
    </div>
  );
}
