'use client';

import React, { useEffect } from 'react';
import { 
  X, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  Clock, 
  Globe, 
  Calendar, 
  Share2, 
  Database,
  BookOpen
} from 'lucide-react';
import { SharedNote } from '@/types/exchange';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { useToast } from '@/components/Toast';

interface NoteDetailModalProps {
  note: SharedNote | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (noteId: string, currentSaved: boolean) => void;
  isDemoMode?: boolean;
}

export function NoteDetailModal({
  note,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  isDemoMode = false,
}: NoteDetailModalProps) {
  const { success } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [copiedNotion, setCopiedNotion] = React.useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !note) return null;

  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === note.language);
  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    success('Note Copied', 'Full note copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyNotionFormat = () => {
    const notionBlock = `# ${note.title}\n\n**Subject:** ${note.subject} | **Language:** ${
      langObj?.name || note.language
    } | **Author:** ${note.author?.display_name || 'Student'}\n\n${note.content}`;
    navigator.clipboard.writeText(notionBlock);
    setCopiedNotion(true);
    success('Notion Block Copied', 'Ready to paste directly into your Notion workspace.');
    setTimeout(() => setCopiedNotion(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-750 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-700/50">
                {note.subject}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                <span>{langObj?.flag || '🌐'}</span>
                <span>{langObj?.name || note.language.toUpperCase()}</span>
                <span className="text-slate-400">({langObj?.nativeName})</span>
              </span>
              {note.read_time_minutes && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{note.read_time_minutes} min read</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {note.title}
            </h2>

            {/* Author info & date */}
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                {note.author?.avatar_url ? (
                  <img
                    src={note.author.avatar_url}
                    alt={note.author.display_name}
                    className="w-5 h-5 rounded-full object-cover border border-purple-500/30"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-purple-900/60 flex items-center justify-center text-[10px] font-bold text-purple-200">
                    {note.author?.display_name?.slice(0, 1) || 'S'}
                  </div>
                )}
                <span className="font-medium text-slate-200">
                  {note.author?.display_name || 'Student Contributor'}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close note preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-200 text-sm leading-relaxed font-normal selection:bg-purple-600">
          {/* Note content rendered in clean structured layout */}
          <div className="prose prose-invert max-w-none space-y-4">
            {note.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h1 key={index} className="text-xl font-bold text-white pt-2 border-b border-slate-800 pb-2">
                    {paragraph.replace('# ', '')}
                  </h1>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-lg font-semibold text-purple-200 pt-3">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-base font-medium text-purple-300 pt-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('$$') && paragraph.endsWith('$$')) {
                return (
                  <div key={index} className="p-3 my-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto text-center">
                    {paragraph.slice(2, -2)}
                  </div>
                );
              }
              return (
                <p key={index} className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">Tags:</span>
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {isDemoMode && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-center justify-between">
              <span>
                💡 <strong>Demo Mode:</strong> Saves are stored in this browser session. Connect Supabase to sync across devices.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Save / Unsave Action */}
            <button
              onClick={() => onToggleSave(note.id, isSaved)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSaved
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/60 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-purple-400" />
                  <span>{isDemoMode ? 'Saved (Demo Session)' : 'Saved in Library'}</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Save to My Notes</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            {/* Copy Notion Block */}
            <button
              onClick={handleCopyNotionFormat}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-200 text-xs font-medium border border-stone-750 transition-colors"
            >
              {copiedNotion ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Database className="w-3.5 h-3.5 text-purple-400" />
              )}
              <span>{copiedNotion ? 'Copied' : 'Copy for Notion'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
