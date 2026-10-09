'use client';

import React from 'react';
import { 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  BookOpen, 
  Globe, 
  User, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SharedNote } from '@/types/exchange';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';

interface NoteCardProps {
  note: SharedNote;
  isSaved: boolean;
  onToggleSave: (noteId: string, currentSaved: boolean) => void;
  onOpenDetail: (note: SharedNote) => void;
  isDemoMode?: boolean;
}

export function NoteCard({
  note,
  isSaved,
  onToggleSave,
  onOpenDetail,
  isDemoMode = false,
}: NoteCardProps) {
  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === note.language);

  // Subject color mapping for visual distinction
  const getSubjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('computer') || s.includes('machine') || s.includes('algorithm')) {
      return 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50';
    }
    if (s.includes('math') || s.includes('physics')) {
      return 'bg-purple-950/60 text-purple-300 border-purple-700/50';
    }
    if (s.includes('neuro') || s.includes('bio') || s.includes('chem')) {
      return 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50';
    }
    if (s.includes('econ') || s.includes('business')) {
      return 'bg-amber-950/60 text-amber-300 border-amber-700/50';
    }
    return 'bg-slate-800/60 text-slate-300 border-slate-700/50';
  };

  // Generate plain text preview without markdown symbols
  const plainPreview = note.content
    .replace(/#+\s+/g, '')
    .replace(/\$\$?[^$]+\$\$?/g, '[Formula]')
    .replace(/\*\*/g, '')
    .replace(/[-*]\s+/g, '')
    .trim()
    .slice(0, 180);

  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group relative rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-purple-950/20 flex flex-col justify-between overflow-hidden">
      {/* Top Banner Accent */}
      <div className="p-5 pb-3">
        {/* Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${getSubjectColor(
                note.subject
              )}`}
            >
              {note.subject}
            </span>

            {/* Language Badge */}
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
              title={`Written in ${langObj?.name || note.language.toUpperCase()}`}
            >
              <span>{langObj?.flag || '🌐'}</span>
              <span>{langObj?.nativeName || note.language.toUpperCase()}</span>
            </span>

            {note.is_demo_session && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-pink-950/60 text-pink-300 border border-pink-700/40">
                Your Demo Note
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(note.id, isSaved);
            }}
            aria-label={isSaved ? 'Unsave note' : 'Save note to library'}
            title={
              isSaved
                ? isDemoMode
                  ? 'Saved (Demo Session Only) — Click to unsave'
                  : 'Saved to library — Click to unsave'
                : isDemoMode
                ? 'Save to session library'
                : 'Save to library'
            }
            className={`p-2 rounded-xl transition-all ${
              isSaved
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 fill-purple-500/30 text-purple-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Note Title */}
        <h3
          onClick={() => onOpenDetail(note)}
          className="font-bold text-white text-base leading-snug group-hover:text-purple-300 transition-colors line-clamp-2 cursor-pointer mb-2"
        >
          {note.title}
        </h3>

        {/* Content Preview */}
        <p
          onClick={() => onOpenDetail(note)}
          className="text-xs text-slate-300 leading-relaxed line-clamp-3 cursor-pointer"
        >
          {plainPreview}...
        </p>
      </div>

      {/* Card Footer with Author and Actions */}
      <div className="px-5 py-3.5 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 min-w-0">
          {note.author?.avatar_url ? (
            <img
              src={note.author.avatar_url}
              alt={note.author.display_name}
              className="w-6 h-6 rounded-full object-cover border border-purple-500/30"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-purple-900/60 border border-purple-700/50 flex items-center justify-center text-[10px] font-bold text-purple-200">
              {note.author?.display_name
                ? note.author.display_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'S'}
            </div>
          )}
          <span className="truncate font-medium text-slate-300">
            {note.author?.display_name || 'Student Contributor'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500 text-[11px] shrink-0">{formattedDate}</span>
        </div>

        <button
          onClick={() => onOpenDetail(note)}
          className="flex items-center gap-1 font-semibold text-purple-400 hover:text-purple-300 transition-colors group-hover:translate-x-0.5 shrink-0 ml-2"
        >
          <span>Read</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
