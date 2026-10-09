'use client';

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Globe, 
  BookOpen, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Loader2,
  HelpCircle
} from 'lucide-react';
import { ShareNoteFormData } from '@/types/exchange';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { useToast } from '@/components/Toast';

interface ShareNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ShareNoteFormData) => Promise<void>;
  isDemoMode: boolean;
}

const COMMON_SUBJECTS = [
  'Computer Science',
  'Machine Learning',
  'Mathematics',
  'Physics',
  'Neuroscience',
  'Chemistry',
  'Biology',
  'Economics',
  'History',
  'Philosophy',
];

export function ShareNoteModal({
  isOpen,
  onClose,
  onSubmit,
  isDemoMode,
}: ShareNoteModalProps) {
  const { error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState('en');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Please enter a note title.');
      return;
    }
    if (!subject.trim()) {
      setValidationError('Please specify the subject or course module.');
      return;
    }
    if (!content.trim()) {
      setValidationError('Please enter your note content.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        subject: subject.trim(),
        language,
        content: content.trim(),
        author_name: authorName.trim() || undefined,
      });

      // Reset form on success
      setTitle('');
      setSubject('');
      setContent('');
      setAuthorName('');
      onClose();
    } catch (err: any) {
      toastError('Failed to publish note', err.message || 'Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPresetSubject = (sub: string) => {
    setSubject(sub);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-750 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Share Study Notes</h2>
              <p className="text-xs text-slate-400">
                Publish study notes to help fellow multilingual scholars learn.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="px-6 py-3 bg-amber-950/30 border-b border-amber-800/40 text-xs text-amber-200 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Demo Mode:</strong> Your note will be saved in your current browser session feed. Connect Supabase to publish globally.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
              Note Title <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Neural Networks: Backpropagation & Chain Rule Math"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-purple-500 focus:outline-none text-slate-100 placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Subject & Language Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                Subject / Module <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-purple-500 focus:outline-none text-slate-100 placeholder-slate-500 transition-colors"
              />
              {/* Quick Subject Suggestions */}
              <div className="flex flex-wrap gap-1 mt-2">
                {COMMON_SUBJECTS.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSelectPresetSubject(s)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                Language <span className="text-purple-400">*</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-purple-500 focus:outline-none text-slate-100 transition-colors cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Author Display Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
              Author Display Name (Optional)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Aiden Clark"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-purple-500 focus:outline-none text-slate-100 placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Note Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold text-xs">
                Note Content <span className="text-purple-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500">Supports Markdown headers (#, ##), bullet points, and math</span>
            </div>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`# Core Principles\n\n- Write down key definitions...\n- Include intuitive analogies or proofs...\n\n## Practical Takeaways\n- Focus on exam traps and solutions...`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-purple-500 focus:outline-none text-slate-100 placeholder-slate-500 font-mono text-xs leading-relaxed transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-950/40 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDemoMode ? 'Share (Demo Session)' : 'Publish Note'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
