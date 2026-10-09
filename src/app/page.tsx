'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Headphones, Sparkles, FileCheck2, Library, Database, 
  ArrowRight, CheckCircle2, Clock, BookOpen, Globe, 
  Flame, Award, Layers, ExternalLink, RefreshCw, ChevronRight
} from 'lucide-react';
import { MosaicBadge } from '@/components/MosaicBadge';
import { NotionModal } from '@/components/NotionModal';
import { useToast } from '@/components/Toast';
import { 
  getStoredMaterials, 
  getStoredNotionWorkspace, 
  getPreferredTargetLanguage, 
  savePreferredTargetLanguage,
  simulateNotionSync
} from '@/lib/storage';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { StudyMaterial, NotionWorkspaceInfo, SupportedLanguageCode } from '@/types';

export default function DashboardPage() {
  const { success, info } = useToast();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [workspace, setWorkspace] = useState<NotionWorkspaceInfo | null>(null);
  const [preferredLang, setPreferredLang] = useState<SupportedLanguageCode>('es');
  const [selectedMaterialForNotion, setSelectedMaterialForNotion] = useState<StudyMaterial | null>(null);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [studyMode, setStudyMode] = useState<'bilingual' | 'target_primary' | 'feynman'>('bilingual');
  const [academicLevel, setAcademicLevel] = useState<'undergraduate' | 'graduate' | 'simplified'>('undergraduate');
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    setMaterials(getStoredMaterials());
    setWorkspace(getStoredNotionWorkspace());
    setPreferredLang(getPreferredTargetLanguage());
  }, []);

  const handleLanguageChange = (lang: SupportedLanguageCode) => {
    setPreferredLang(lang);
    savePreferredTargetLanguage(lang);
    const target = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    success('Study Language Updated', `Default target language set to ${target?.name} (${target?.flag})`);
  };

  const handleSyncAllNotion = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      materials.forEach(m => simulateNotionSync(m.id));
      setMaterials(getStoredMaterials());
      setWorkspace(getStoredNotionWorkspace());
      setIsSyncingAll(false);
      success('Workspace Synchronized', 'All recent study materials verified and synced to Notion.');
    }, 900);
  };

  const openNotionPreview = (material: StudyMaterial) => {
    setSelectedMaterialForNotion(material);
    setIsNotionModalOpen(true);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === preferredLang) || SUPPORTED_LANGUAGES[1];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Welcome & Streak Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-indigo-950/60 border border-purple-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-900/50 text-purple-300 border border-purple-700/50">
                Active Notion Companion
              </span>
              <span className="text-slate-400 text-xs">Term: Fall 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-indigo-300">Aiden</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl leading-relaxed">
              Your multilingual study assistant is bridging lecture content into your primary language while syncing clean markdown summaries and checklists directly into Notion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Streak Card */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Study Streak</div>
                <div className="text-sm font-bold text-white">5 Consecutive Days</div>
              </div>
            </div>

            {/* Target Language Card */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">
                {currentLangObj.flag}
              </div>
              <div>
                <div className="text-xs text-slate-400">Target Language</div>
                <div className="text-sm font-bold text-white">{currentLangObj.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notion Sync Health Ribbon */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-sm shadow-inner">
              {workspace?.workspaceIcon || '🏛️'}
            </div>
            <div>
              <span className="text-slate-400">Connected to: </span>
              <strong className="text-white font-medium">{workspace?.workspaceName}</strong>
              <span className="text-slate-500 ml-2">({workspace?.targetDatabaseName})</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {workspace?.syncedItemsCount || 18} Pages Synced
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Last sync: {workspace?.lastSyncTimestamp || 'Just now'}</span>
            <button
              onClick={handleSyncAllNotion}
              disabled={isSyncingAll}
              className="ml-2 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Syncing...' : 'Sync Workspace'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⚡</span> Quick AI Actions
          </h2>
          <span className="text-xs text-slate-400">Enhance your courses with multilingual intelligence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: Lecture Companion */}
          <Link
            href="/lecture-companion"
            className="group relative p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-purple-950/20 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-700/50 text-purple-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                  Lecture Companion
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 font-medium">Audio/Text</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Paste or upload any lecture transcript. Generates bilingual key takeaways, technical glossaries, and timestamps for Notion.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Start lecture processing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Action 2: AI Study Studio */}
          <Link
            href="/study-studio"
            className="group relative p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-indigo-950/20 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                  AI Study Studio
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 font-medium">Transform</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Translate, summarize, simplify using the Feynman technique, and generate revision questions with interactive flashcards.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Open Study Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Action 3: Assignment Simplifier */}
          <Link
            href="/assignment-simplifier"
            className="group relative p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-emerald-950/20 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                  Assignment Simplifier
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300 font-medium">Rubrics</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Paste syllabus briefs to uncover what professors really want, decode tricky grading rubrics, and generate phased checklists.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Simplify an assignment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Two-Column Section: Recent Materials & Language Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Learning Materials */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Recent Learning Materials
              </h2>
              <p className="text-xs text-slate-400">Course materials transformed into your native language</p>
            </div>
            <Link
              href="/my-learning"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>View all ({materials.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {materials.slice(0, 4).map((mat) => {
              const targetLangObj = SUPPORTED_LANGUAGES.find(l => l.code === mat.targetLanguage);
              const sourceLangObj = SUPPORTED_LANGUAGES.find(l => l.code === mat.sourceLanguage);

              return (
                <div
                  key={mat.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all duration-200 group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <MosaicBadge variant="purple" size="sm">
                        {mat.subject}
                      </MosaicBadge>
                      <MosaicBadge variant="slate" size="sm">
                        {sourceLangObj?.flag} {mat.sourceLanguage.toUpperCase()} → {targetLangObj?.flag} {mat.targetLanguage.toUpperCase()}
                      </MosaicBadge>
                      <span className="text-[11px] text-slate-500">
                        {new Date(mat.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors truncate">
                      {mat.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                      {mat.content.translatedSummary || mat.content.summary || "Bilingual study transformation completed."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => openNotionPreview(mat)}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                      title="View Notion page format"
                    >
                      <Database className="w-3.5 h-3.5 text-purple-400" />
                      <span>Notion</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </button>
                    
                    <Link
                      href={
                        mat.type === 'lecture'
                          ? '/lecture-companion'
                          : mat.type === 'assignment_plan'
                          ? '/assignment-simplifier'
                          : '/study-studio'
                      }
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Language & Study Preferences Widget */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                Language Preferences
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300">
                Active
              </span>
            </div>

            {/* Target Language Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Primary Native Language
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = lang.code === preferredLang;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs border text-left transition-all ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500/60 text-purple-200 font-bold shadow-sm'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="truncate">{lang.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bilingual Display Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Display Format
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'bilingual', title: 'Side-by-Side Dual Language', desc: 'Original EN alongside translated text' },
                  { id: 'target_primary', title: 'Native-First with English Gloss', desc: 'Translated text with English technical keywords' },
                  { id: 'feynman', title: 'Feynman Plain-Language', desc: 'Conceptual analogies without academic jargon' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setStudyMode(mode.id as any);
                      info('Display Preference', `Switched mode to: ${mode.title}`);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                      studyMode === mode.id
                        ? 'bg-purple-950/40 border-purple-500/50 text-white font-medium'
                        : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="font-semibold text-slate-200">{mode.title}</div>
                    <div className="text-[11px] text-slate-500">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Complexity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Complexity Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'undergraduate', label: 'Undergrad' },
                  { id: 'graduate', label: 'Graduate' },
                  { id: 'simplified', label: 'Plain Terms' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setAcademicLevel(lvl.id as any);
                      info('Complexity Level', `Set to ${lvl.label}`);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center border transition-all ${
                      academicLevel === lvl.id
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notion Page Modal */}
      <NotionModal
        material={selectedMaterialForNotion}
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
        onSynced={(updated) => {
          setMaterials(getStoredMaterials());
          setWorkspace(getStoredNotionWorkspace());
        }}
      />
    </div>
  );
}
