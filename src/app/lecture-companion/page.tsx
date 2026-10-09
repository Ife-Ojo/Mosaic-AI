'use client';

import React, { useState, useEffect } from 'react';
import { 
  Headphones, Upload, FileText, Sparkles, Database, 
  Copy, Download, Check, RefreshCw, BookOpen, Layers, 
  ExternalLink, ChevronRight, Volume2, Globe, Clock, ArrowRight
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MosaicBadge } from '@/components/MosaicBadge';
import { NotionModal } from '@/components/NotionModal';
import { useToast } from '@/components/Toast';
import { PRESET_LECTURE_TRANSCRIPTS, SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { SupportedLanguageCode, StudyMaterial } from '@/types';
import { addOrUpdateMaterial, getPreferredTargetLanguage, simulateNotionSync } from '@/lib/storage';

export default function LectureCompanionPage() {
  const { success, error, info } = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [sourceLang, setSourceLang] = useState<SupportedLanguageCode>('en');
  const [targetLang, setTargetLang] = useState<SupportedLanguageCode>('es');
  const [transcriptText, setTranscriptText] = useState('');
  const [includeGlossary, setIncludeGlossary] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedMaterial, setGeneratedMaterial] = useState<StudyMaterial | null>(null);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bilingual' | 'glossary' | 'takeaways' | 'original'>('bilingual');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  useEffect(() => {
    setTargetLang(getPreferredTargetLanguage());
  }, []);

  const handleLoadPreset = (presetIndex: number) => {
    const preset = PRESET_LECTURE_TRANSCRIPTS[presetIndex];
    if (!preset) return;
    setTitle(preset.title);
    setSubject(preset.subject);
    setSourceLang(preset.defaultSource);
    setTargetLang(preset.defaultTarget);
    setTranscriptText(preset.text);
    info('Sample Lecture Loaded', preset.title);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(txt|srt|vtt|md)$/i)) {
      error('Unsupported File', 'Please upload a .txt, .srt, .vtt, or .md transcript file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setTranscriptText(text);
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      success('File Uploaded', `Loaded ${file.name} (${Math.round(text.length / 5)} words)`);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcriptText.trim()) {
      error('Transcript Missing', 'Please paste a lecture transcript or load a sample preset.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Analyzing transcript speech & timestamps...');

    try {
      setTimeout(() => setLoadingStep('Extracting key academic theorems & domain concepts...'), 500);
      setTimeout(() => setLoadingStep(`Translating into ${targetLang.toUpperCase()} with cultural and technical context...`), 1100);

      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'lecture',
          inputText: transcriptText,
          title: title || 'University Lecture Notes',
          subject: subject || 'General Studies',
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate');
      }

      const newMaterial: StudyMaterial = {
        id: `mat-${Date.now()}`,
        title: title || 'University Lecture Notes',
        subject: subject || 'General Studies',
        type: 'lecture',
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [subject, 'Lecture Notes', `${sourceLang.toUpperCase()}→${targetLang.toUpperCase()}`],
        notionSyncStatus: 'local_only',
        stats: {
          wordCount: data.wordCount || 850,
          estimatedReadTimeMinutes: Math.max(3, Math.round((data.wordCount || 850) / 250)),
          masteryPercentage: 75,
        },
        content: {
          ...data.content,
          rawSourceText: transcriptText,
        },
      };

      addOrUpdateMaterial(newMaterial);
      setGeneratedMaterial(newMaterial);
      success('Lecture Companion Ready', 'Bilingual notes and Notion blocks created.');
    } catch (err: any) {
      error('Generation Failed', err.message || 'Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleCopyMarkdown = () => {
    if (!generatedMaterial) return;
    const lines = [
      `# ${generatedMaterial.title}`,
      `**Subject:** ${generatedMaterial.subject} | **Source:** ${sourceLang.toUpperCase()} | **Target:** ${targetLang.toUpperCase()}`,
      '',
      `> 💡 **Bilingual Executive Summary (${targetLang.toUpperCase()})**`,
      `> ${generatedMaterial.content.translatedSummary || generatedMaterial.content.summary}`,
      '',
      '## 📌 Key Lecture Takeaways',
      ...(generatedMaterial.content.translatedTakeaways || []).map((t) => `- [x] ${t}`),
      '',
      '## 📖 Technical Terminology Glossary',
      ...(generatedMaterial.content.bilingualGlossary || []).map(
        (g) => `- **${g.term}** (${g.translation}): ${g.nativeExplanation || g.definition}`
      ),
      '',
      '## 🎙️ Bilingual Lecture Notes',
      ...(generatedMaterial.content.bilingualSections || []).map(
        (s) => `### ${s.heading} (${s.timestamp || ''})\n**Original:** ${s.originalText}\n\n**${targetLang.toUpperCase()}:** ${s.translatedText}\n`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedMarkdown(true);
    success('Markdown Copied', 'Paste into Notion or your markdown notes editor.');
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!generatedMaterial) return;
    const blob = new Blob([JSON.stringify(generatedMaterial, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedMaterial.title.toLowerCase().replace(/\s+/g, '-')}-mosaic.json`;
    a.click();
    URL.revokeObjectURL(url);
    info('Package Downloaded', 'Exported JSON study material archive.');
  };

  const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
  const sourceLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
              <Headphones className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Lecture Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lecture Companion
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Convert recorded university transcripts into dual-language structured notes, audio timestamp glossaries, and clean Notion database blocks.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Try a sample:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleLoadPreset(0)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              ⚛️ Quantum
            </button>
            <button
              onClick={() => handleLoadPreset(1)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              🧠 Machine Learning
            </button>
            <button
              onClick={() => handleLoadPreset(2)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              🏰 History
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Panel (5 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Transcript & Course Input
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {transcriptText ? `${transcriptText.split(/\s+/).filter(Boolean).length} words` : 'Empty'}
              </span>
            </h2>

            {/* Title & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Lecture / Topic Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems 101"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Subject Domain
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Physics">Physics</option>
                  <option value="Neuroscience">Neuroscience</option>
                  <option value="Economics">Economics</option>
                  <option value="History">History</option>
                  <option value="Bioengineering">Bioengineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="General Studies">General Studies</option>
                </select>
              </div>
            </div>

            {/* Language Selectors */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <LanguageSelector
                label="Lecture Language"
                selectedCode={sourceLang}
                onChange={setSourceLang}
              />
              <LanguageSelector
                label="Your Native Language"
                selectedCode={targetLang}
                onChange={setTargetLang}
              />
            </div>

            {/* Transcript Input Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-400">
                  Lecture Transcript Text
                </label>
                <label className="cursor-pointer text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Upload .txt / .srt</span>
                  <input
                    type="file"
                    accept=".txt,.srt,.vtt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                rows={9}
                placeholder="Paste the recorded lecture transcript or professor's speech here..."
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                className="w-full p-3 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
              />
            </div>

            {/* Feature Options */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeGlossary}
                  onChange={(e) => setIncludeGlossary(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-0"
                />
                <span>Generate Bilingual Academic Glossary (Terms & Context)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-0"
                />
                <span>Extract Timestamped Sections for Notion toggles</span>
              </label>
            </div>

            {/* Generate Action Button */}
            <button
              type="submit"
              disabled={isLoading || !transcriptText.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || 'Synthesizing Multilingual Notes...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Multilingual Lecture Pack</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Output / Study Pack (7 cols) */}
        <div className="lg:col-span-7">
          {generatedMaterial ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
              
              {/* Output Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <MosaicBadge variant="purple" size="sm">
                      {generatedMaterial.subject}
                    </MosaicBadge>
                    <MosaicBadge variant="emerald" size="sm">
                      {sourceLangObj?.flag} {sourceLang.toUpperCase()} → {targetLangObj?.flag} {targetLang.toUpperCase()}
                    </MosaicBadge>
                    <span className="text-[11px] text-slate-500">
                      {generatedMaterial.stats?.estimatedReadTimeMinutes} min read
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {generatedMaterial.title}
                  </h2>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNotionModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span>Export to Notion</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                    title="Copy Markdown"
                  >
                    {copiedMarkdown ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                    title="Download JSON Archive"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 gap-2">
                {[
                  { id: 'bilingual', label: 'Bilingual Notes', icon: BookOpen },
                  { id: 'takeaways', label: 'Key Takeaways', icon: Sparkles },
                  { id: 'glossary', label: 'Concept Glossary', icon: Layers },
                  { id: 'original', label: 'Raw Transcript', icon: FileText },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                        isActive
                          ? 'border-purple-500 text-purple-300'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Bilingual Notes */}
              {activeTab === 'bilingual' && (
                <div className="space-y-5">
                  {/* Executive Summary Callout */}
                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                    <div className="flex items-center gap-2 text-purple-300 font-bold mb-1">
                      <span>✨</span>
                      <span>Executive Synthesis ({targetLang.toUpperCase()})</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      {generatedMaterial.content.translatedSummary || generatedMaterial.content.summary}
                    </p>
                  </div>

                  {/* Section Walkthrough */}
                  <div className="space-y-4">
                    {(generatedMaterial.content.bilingualSections || []).map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{sec.heading}</span>
                            {sec.headingTranslation && (
                              <span className="text-xs text-purple-300">({sec.headingTranslation})</span>
                            )}
                          </div>
                          {sec.timestamp && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                              <Clock className="w-3 h-3" />
                              {sec.timestamp}
                            </span>
                          )}
                        </div>

                        {/* Dual Column Transcript Excerpt */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">
                              ORIGINAL ({sourceLang.toUpperCase()})
                            </span>
                            <p className="leading-relaxed">{sec.originalText}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-900/40 text-purple-100">
                            <span className="text-[10px] font-bold text-purple-400 block mb-1">
                              TRANSLATION ({targetLang.toUpperCase()})
                            </span>
                            <p className="leading-relaxed">{sec.translatedText}</p>
                          </div>
                        </div>

                        {sec.insightNotes && (
                          <div className="text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-900/30 rounded-lg p-2.5 flex items-center gap-2">
                            <span className="shrink-0">💡</span>
                            <span>{sec.insightNotes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Key Takeaways */}
              {activeTab === 'takeaways' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                      Core Academic Insights ({targetLang.toUpperCase()})
                    </h3>
                    <div className="space-y-2.5">
                      {(generatedMaterial.content.translatedTakeaways || generatedMaterial.content.keyTakeaways || []).map((t, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-850 text-xs text-slate-200">
                          <div className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {i + 1}
                          </div>
                          <span className="leading-relaxed">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Glossary */}
              {activeTab === 'glossary' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Specialized terminology explained with domain precision in {targetLangObj?.name}.
                  </p>

                  <div className="space-y-3">
                    {(generatedMaterial.content.bilingualGlossary || []).map((g, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{g.term}</span>
                            <span className="text-slate-500">→</span>
                            <span className="font-bold text-purple-300 text-sm">{g.translation}</span>
                          </div>
                          {g.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {g.category}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                          <div className="p-2.5 rounded bg-slate-900/70 border border-slate-850">
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">ENGLISH DEFINITION</span>
                            <p>{g.definition}</p>
                          </div>
                          <div className="p-2.5 rounded bg-purple-950/20 border border-purple-900/30 text-purple-200">
                            <span className="text-[10px] font-bold text-purple-400 block mb-1">NATIVE CONTEXT ({targetLang.toUpperCase()})</span>
                            <p>{g.nativeExplanation || g.definition}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Original Transcript */}
              {activeTab === 'original' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {generatedMaterial.content.rawSourceText || transcriptText}
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[420px] rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-purple-400 flex items-center justify-center mb-4">
                <Headphones className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                No Lecture Processed Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                Paste your professor's lecture transcript on the left or click one of the quick samples above to see bilingual notes in action.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleLoadPreset(0)}
                  className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <span>Load Quantum Mechanics Sample</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notion Page Modal */}
      <NotionModal
        material={generatedMaterial}
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
        onSynced={(updated) => {
          setGeneratedMaterial(updated);
        }}
      />
    </div>
  );
}
