'use client';

import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  Key, 
  ShieldCheck, 
  Terminal, 
  ExternalLink 
} from 'lucide-react';
import { useToast } from '@/components/Toast';

interface DatabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DatabaseSetupModal({ isOpen, onClose }: DatabaseSetupModalProps) {
  const { success } = useToast();
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'env' | 'sql'>('env');

  if (!isOpen) return null;

  const envSnippet = `# .env.local — Supabase Credentials for Notes Exchange
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Server-side only (Optional, never expose to client):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const sqlSnippet = `-- Execute in Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Shared Notes Table
CREATE TABLE IF NOT EXISTS public.shared_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Saved Notes Table (Composite Primary Key)
CREATE TABLE IF NOT EXISTS public.saved_notes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES public.shared_notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, note_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read, Author modification, User-isolated saves
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Shared notes are viewable by everyone" ON public.shared_notes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create shared notes" ON public.shared_notes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their own shared notes" ON public.shared_notes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their own shared notes" ON public.shared_notes FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can view their own saved notes" ON public.saved_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save notes for themselves" ON public.saved_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave their own saved notes" ON public.saved_notes FOR DELETE USING (auth.uid() = user_id);`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    success('Environment Variables Copied', 'Paste into your .env.local file.');
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const copySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    success('SQL Migration Copied', 'Paste into your Supabase Dashboard SQL Editor.');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-750 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Supabase Setup & SQL Migration</h2>
              <p className="text-xs text-slate-400">Configure PostgreSQL persistence for the Notes Exchange</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('env')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'env'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Environment Variables</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Migration & RLS</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'env' ? (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Add these variables to your <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">.env.local</code> file in the project root. When these are provided, the Notes Exchange will automatically connect to your live Supabase database.
              </p>

              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-200">
                <pre className="overflow-x-auto whitespace-pre">{envSnippet}</pre>
                <button
                  onClick={copyEnv}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 text-purple-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Security Note:</strong> Only <code className="text-purple-300 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> is used in browser requests. <code className="text-purple-300 font-mono">SUPABASE_SERVICE_ROLE_KEY</code> is never exposed on the client side.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Run this SQL script in your Supabase Dashboard (<span className="text-slate-100 font-semibold">SQL Editor → New Query</span>) to create the <code className="text-purple-300">profiles</code>, <code className="text-purple-300">shared_notes</code>, and <code className="text-purple-300">saved_notes</code> tables with Row Level Security.
              </p>

              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-200 max-h-72 overflow-y-auto">
                <pre className="whitespace-pre">{sqlSnippet}</pre>
                <button
                  onClick={copySql}
                  className="sticky top-0 float-right flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shadow-md"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>

              <p className="text-slate-400 text-[11px]">
                Migration file is also saved at: <code className="text-slate-300 font-mono">supabase/migrations/20261009000001_notes_exchange.sql</code>
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
