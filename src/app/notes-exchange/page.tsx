'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Plus, 
  RefreshCw, 
  Layers, 
  BookOpen, 
  SlidersHorizontal, 
  X, 
  AlertCircle,
  Database,
  Sparkles,
  HelpCircle,
  Flame,
  ArrowUpDown
} from 'lucide-react';
import { SharedNote, ShareNoteFormData, ExchangeFilterOptions } from '@/types/exchange';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { 
  fetchExchangeNotes, 
  toggleSaveNote, 
  createSharedNote 
} from '@/lib/notes-exchange-service';
import { NoteCard } from '@/components/notes-exchange/NoteCard';
import { NoteDetailModal } from '@/components/notes-exchange/NoteDetailModal';
import { ShareNoteModal } from '@/components/notes-exchange/ShareNoteModal';
import { DemoModeBanner } from '@/components/notes-exchange/DemoModeBanner';
import { DatabaseSetupModal } from '@/components/notes-exchange/DatabaseSetupModal';
import { useToast } from '@/components/Toast';

export default function NotesExchangePage() {
  const { success, error: toastError, info } = useToast();

  // State
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'subject'>('newest');

  // Modal States
  const [activeNoteForDetail, setActiveNoteForDetail] = useState<SharedNote | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Load notes
  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const filters: ExchangeFilterOptions = {
        searchQuery,
        subject: selectedSubject,
        language: selectedLanguage,
        savedOnly,
        sortBy,
      };

      const res = await fetchExchangeNotes(filters);
      setNotes(res.notes);
      setIsDemoMode(res.isDemoMode);
      if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      console.error('Error loading exchange notes:', err);
      setErrorMessage(err.message || 'Failed to load notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedSubject, selectedLanguage, savedOnly, sortBy]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Handle Save / Unsave
  const handleToggleSave = async (noteId: string, currentSaved: boolean) => {
    const nextSaved = !currentSaved;

    // Optimistic UI update
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, is_saved: nextSaved } : n))
    );

    if (activeNoteForDetail && activeNoteForDetail.id === noteId) {
      setActiveNoteForDetail((prev) => (prev ? { ...prev, is_saved: nextSaved } : null));
    }

    try {
      const result = await toggleSaveNote(noteId, nextSaved);
      if (nextSaved) {
        if (result.isDemoMode) {
          info('Saved to Session', 'Note saved to your browser session library (demo mode).');
        } else {
          success('Note Saved', 'Saved to your personal study library.');
        }
      } else {
        info('Note Removed', 'Removed from your saved library.');
      }
    } catch (err: any) {
      // Revert optimistic update on error
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, is_saved: currentSaved } : n))
      );
      toastError('Error updating save state', err.message);
    }
  };

  // Handle Note Submission
  const handleShareSubmit = async (formData: ShareNoteFormData) => {
    const result = await createSharedNote(formData);
    if (result.isDemoMode) {
      success('Note Published (Demo)', `"${result.note.title}" added to current session feed.`);
    } else {
      success('Note Published', `"${result.note.title}" is now shared with all students.`);
    }
    // Refresh feed
    await loadNotes();
  };

  // Handle Detail Open
  const handleOpenDetail = (note: SharedNote) => {
    setActiveNoteForDetail(note);
    setIsDetailModalOpen(true);
  };

  // Available subjects for filtering
  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    notes.forEach((n) => {
      if (n.subject) subjects.add(n.subject);
    });
    // Add default popular subjects
    ['Computer Science', 'Machine Learning', 'Mathematics', 'Physics', 'Neuroscience', 'Economics', 'Chemistry'].forEach(
      (s) => subjects.add(s)
    );
    return Array.from(subjects).sort();
  }, [notes]);

  // Saved notes count
  const savedCount = useMemo(() => {
    return notes.filter((n) => n.is_saved).length;
  }, [notes]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('all');
    setSelectedLanguage('all');
    setSavedOnly(false);
    setSortBy('newest');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-purple-400 tracking-wider uppercase">
              Community Knowledge Hub
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50">
              LinguaLearn
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Notes Exchange
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Discover, read, and save multilingual study notes shared by students across different languages and university subjects.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold border border-slate-750 transition-colors shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Database & RLS</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-950/40 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Share Study Notes</span>
          </button>
        </div>
      </div>

      {/* Demo Mode / Supabase Status Banner */}
      <DemoModeBanner
        isDemoMode={isDemoMode}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
      />

      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, formula, subject, author, or keywords..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-purple-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Refresh */}
          <button
            onClick={loadNotes}
            title="Refresh notes feed"
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-750 hover:border-purple-500/50 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          {/* Feed Tabs: All Notes vs Saved Notes */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSavedOnly(false)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                !savedOnly
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Notes ({notes.length})
            </button>
            <button
              onClick={() => setSavedOnly(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                savedOnly
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-400" />
              <span>Saved Notes</span>
              {savedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-900/80 text-purple-200">
                  {savedCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subject Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium hidden sm:inline">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 text-xs focus:border-purple-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {allSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium hidden sm:inline">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 text-xs focus:border-purple-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Languages</option>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 text-xs focus:border-purple-500 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="subject">Subject (A-Z)</option>
              </select>
            </div>

            {/* Active filters reset */}
            {(searchQuery || selectedSubject !== 'all' || selectedLanguage !== 'all' || savedOnly) && (
              <button
                onClick={resetFilters}
                className="text-purple-400 hover:text-purple-300 font-medium hover:underline text-xs flex items-center gap-1 ml-1"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Feed Area */}
      <div>
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 bg-slate-800 rounded-md" />
                  <div className="h-6 w-6 bg-slate-800 rounded-lg" />
                </div>
                <div className="h-6 w-3/4 bg-slate-800 rounded-md" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                  <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="h-4 w-20 bg-slate-800 rounded" />
                  <div className="h-4 w-12 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && notes.length === 0 && (
          <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-900/50 border border-rose-700/50 flex items-center justify-center text-rose-300 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Notice Loading Notes</h3>
              <p className="text-xs text-rose-300 mt-1 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={loadNotes}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty States */}
        {!isLoading && notes.length === 0 && !errorMessage && (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400 mx-auto">
              {savedOnly ? <Bookmark className="w-7 h-7" /> : <Search className="w-7 h-7" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {savedOnly ? 'No Saved Notes Yet' : 'No Study Notes Found'}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {savedOnly
                  ? 'You have not saved any study notes to your personal library yet. Browse the community exchange and click the bookmark icon to save notes.'
                  : 'No shared notes match your active filters or search terms. Try clearing your filters or share your own study notes to start the exchange.'}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              {savedOnly ? (
                <button
                  onClick={() => setSavedOnly(false)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Browse All Shared Notes
                </button>
              ) : (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {!isLoading && notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSaved={!!note.is_saved}
                onToggleSave={handleToggleSave}
                onOpenDetail={handleOpenDetail}
                isDemoMode={isDemoMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      <NoteDetailModal
        note={activeNoteForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setActiveNoteForDetail(null);
        }}
        isSaved={!!activeNoteForDetail?.is_saved}
        onToggleSave={handleToggleSave}
        isDemoMode={isDemoMode}
      />

      {/* Share Note Modal */}
      <ShareNoteModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSubmit={handleShareSubmit}
        isDemoMode={isDemoMode}
      />

      {/* Database & RLS Setup Modal */}
      <DatabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
}
