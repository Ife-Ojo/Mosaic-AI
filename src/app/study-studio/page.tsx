'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, Layers, CheckSquare, BrainCircuit, 
  HelpCircle, Copy, Download, RefreshCw, Check, ArrowRight, 
  RotateCw, Eye, EyeOff, Award, ChevronDown, ChevronRight, Database,
  Globe, AlertTriangle, ArrowUpRight, Zap
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MosaicBadge } from '@/components/MosaicBadge';
import { NotionModal } from '@/components/NotionModal';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useToast } from '@/components/Toast';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { 
  SupportedLanguageCode, 
  StudyMaterial, 
  FlashcardItem, 
  OutlineNode,
  StudyAction,
  StudyRequest,
  StudyResult
} from '@/types';
import { addOrUpdateMaterial, getPreferredTargetLanguage } from '@/lib/storage';

const AI_OPERATIONS: Array<{
  action: StudyAction;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { action: 'translate', label: 'Translate', description: 'Preserves terms & formulas in target language', icon: Globe },
  { action: 'summarize', label: 'Summarize', description: 'Concise executive summary & key takeaways', icon: BookOpen },
  { action: 'study-notes', label: 'Study Notes', description: 'Organized headings, concepts & examples', icon: Sparkles },
  { action: 'simplify', label: 'Feynman Simplify', description: 'Plain-language analogy without losing rigor', icon: BrainCircuit },
  { action: 'questions', label: 'Revision Q&A', description: 'Conceptual, applied, and recall questions', icon: HelpCircle },
  { action: 'visual-outline', label: 'Visual Outline', description: 'Hierarchical concept map & mind map tree', icon: Layers },
];

export default function StudyStudioPage() {
  const { success, error, info } = useToast();

  const [inputTopic, setInputTopic] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [targetLang, setTargetLang] = useState<SupportedLanguageCode>('es');
  const [sourceLang, setSourceLang] = useState<SupportedLanguageCode>('en');
  const [inputText, setInputText] = useState('');
  
  // Selected AI Action (Contract operations)
  const [selectedAction, setSelectedAction] = useState<StudyAction>('study-notes');
  const [studyResult, setStudyResult] = useState<StudyResult | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'formatted' | 'interactive' | 'notion'>('formatted');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedMaterial, setGeneratedMaterial] = useState<StudyMaterial | null>(null);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Flashcard interactive state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTargetLang(getPreferredTargetLanguage());
  }, []);

  const handleLoadSample = (sampleType: 'cs' | 'bio' | 'econ') => {
    if (sampleType === 'cs') {
      setInputTopic('Database Indexing: B-Trees vs. LSM Trees');
      setSubject('Computer Science');
      setInputText(`Database engines rely on two dominant indexing paradigms for disk storage: B-Trees and Log-Structured Merge-Trees (LSM).

B-Trees organize keys into a balanced tree of fixed-size blocks (typically 4KB-16KB pages). They provide O(log N) point reads and writes by updating pages in-place. However, in-place updates cause high write amplification and random disk I/O, which degrades solid-state drive lifespan.

In contrast, LSM-trees append all writes sequentially to an in-memory MemTable (typically a red-black tree or skiplist). When full, the MemTable is flushed to immutable SSTables (Sorted String Tables) on disk. Background compaction merges and deduplicates SSTables. LSM-trees optimize heavily for write throughput at the expense of slower point reads and read amplification, mitigated using Bloom filters.`);
    } else if (sampleType === 'bio') {
      setInputTopic('Cellular Respiration: The Electron Transport Chain');
      setSubject('Bioengineering');
      setInputText(`The Electron Transport Chain (ETC) is a series of four multi-protein complexes embedded in the inner mitochondrial membrane that couples redox reactions to ATP synthesis.

NADH and FADH2 donate high-energy electrons to Complex I and Complex II. As electrons cascade down decreasing redox potentials to the final electron acceptor, molecular oxygen (O2), Complexes I, III, and IV pump protons (H+) from the mitochondrial matrix into the intermembrane space.

This creates a steep electrochemical proton gradient (proton motive force). Protons flow back into the matrix exclusively through ATP Synthase (Complex V), causing its catalytic rotor domain to rotate and phosphorylate ADP into ATP via chemiosmosis.`);
    } else {
      setInputTopic('Game Theory: Nash Equilibrium & Prisoner\'s Dilemma');
      setSubject('Economics');
      setInputText(`In non-cooperative game theory, a Nash Equilibrium is a decision configuration where no player has an incentive to unilaterally deviate from their chosen strategy given the strategies of all other participants.

The classic canonical illustration is the Prisoner's Dilemma. Two suspects are interrogated separately. If both confess, both receive 5 years. If neither confesses, both receive 1 year. If one confesses while the other stays silent, the defector walks free while the silent partner gets 10 years.

Although mutual cooperation yields the Pareto optimal outcome (1 year each), dominant strategy defect leads both to confess (5 years each). Individual rational incentives diverge from collective social efficiency.`);
    }
    setErrorState(null);
    info('Sample Topic Loaded', 'Select any AI operation below to process with Gemini.');
  };

  /**
   * Executes a specific StudyAction using the server-side /api/study contract endpoint
   */
  const handleExecuteAction = async (actionToRun: StudyAction) => {
    if (!inputText.trim()) {
      error('Input Text Required', 'Please paste content to process or click one of the quick samples.');
      return;
    }

    setSelectedAction(actionToRun);
    setIsLoading(true);
    setErrorState(null);
    const op = AI_OPERATIONS.find(o => o.action === actionToRun);
    setLoadingStep(`Running ${op?.label || actionToRun} in ${targetLang.toUpperCase()}...`);

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('Preserving technical formulas & code blocks...');
      }, 600);
      const stepTimer2 = setTimeout(() => {
        setLoadingStep(`Synthesizing response with Gemini AI in ${targetLang.toUpperCase()}...`);
      }, 1200);

      const requestPayload: StudyRequest = {
        text: inputText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        action: actionToRun,
      };

      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to process study action');
      }

      const result: StudyResult = {
        title: data.title || `${op?.label || actionToRun} Result`,
        content: data.content,
        targetLanguage: data.targetLanguage || targetLang,
        isDemo: data.isDemo,
        demoNotice: data.demoNotice,
        action: data.action || actionToRun,
        model: data.model,
      };

      setStudyResult(result);

      // Create a compatible StudyMaterial for Notion synchronization and local storage
      const newMaterial: StudyMaterial = {
        id: `mat-${Date.now()}`,
        title: result.title,
        subject,
        type: actionToRun === 'questions' ? 'flashcards' : actionToRun === 'visual-outline' ? 'visual_outline' : 'study_notes',
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [subject, op?.label || actionToRun, `${sourceLang.toUpperCase()}→${targetLang.toUpperCase()}`],
        notionSyncStatus: 'local_only',
        stats: {
          wordCount: inputText.split(/\s+/).filter(Boolean).length,
          estimatedReadTimeMinutes: 3,
          masteryPercentage: 50,
        },
        content: {
          rawSourceText: inputText,
          summary: result.content,
          translatedSummary: result.content,
          simplifiedExplanation: actionToRun === 'simplify' ? result.content : undefined,
        },
      };

      addOrUpdateMaterial(newMaterial);
      setGeneratedMaterial(newMaterial);
      setActiveTab('formatted');

      if (result.isDemo) {
        info('Demo Mode', 'Generated using sample mode (no server GEMINI_API_KEY).');
      } else {
        success('AI Engine Complete', `${op?.label} generated successfully using Gemini.`);
      }
    } catch (err: any) {
      console.error('Study action error:', err);
      setErrorState(err.message || 'Operation failed. Please check inputs and server configuration.');
      error('Engine Error', err.message || 'Operation failed');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  /**
   * Executes full study pack transformation using /api/transform (which reuses the engine)
   */
  const handleTransformAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      error('Input Text Required', 'Please paste content to transform or click one of the quick samples.');
      return;
    }

    setIsLoading(true);
    setErrorState(null);
    setLoadingStep('Initializing Mosaic Multilingual Study Pack...');

    try {
      setTimeout(() => setLoadingStep('Drafting Feynman analogies & active recall flashcards...'), 500);
      setTimeout(() => setLoadingStep(`Translating into ${targetLang.toUpperCase()} with technical preservation...`), 1000);

      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'study_notes',
          inputText,
          title: inputTopic || 'Study Topic',
          subject,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const newMaterial: StudyMaterial = {
        id: `mat-${Date.now()}`,
        title: inputTopic || 'Study Topic Analysis',
        subject,
        type: 'study_notes',
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [subject, 'Study Studio', 'Active Recall'],
        notionSyncStatus: 'local_only',
        stats: {
          wordCount: data.wordCount || 620,
          estimatedReadTimeMinutes: 4,
          masteryPercentage: 60,
        },
        content: {
          ...data.content,
          rawSourceText: inputText,
        },
      };

      addOrUpdateMaterial(newMaterial);
      setGeneratedMaterial(newMaterial);

      // Also set studyResult
      setStudyResult({
        title: newMaterial.title,
        content: data.content.summary || data.content.translatedSummary || inputText,
        targetLanguage: targetLang,
        isDemo: data.isDemo,
        action: 'study-notes',
      });

      setCurrentCardIndex(0);
      setIsCardFlipped(false);
      setActiveTab('formatted');
      success('Study Studio Ready', 'Transformed into flashcards, concept outlines, and Notion blocks.');
    } catch (err: any) {
      setErrorState(err.message || 'Please try again.');
      error('Transformation Error', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const toggleCardMastery = (cardId: string) => {
    setMasteredCards(prev => {
      const next = { ...prev, [cardId]: !prev[cardId] };
      const total = generatedMaterial?.content.flashcards?.length || 1;
      const count = Object.values(next).filter(Boolean).length;
      info('Flashcard Progress', `Mastered ${count} of ${total} revision prompts.`);
      return next;
    });
  };

  const handleCopyResult = () => {
    const textToCopy = studyResult?.content || generatedMaterial?.content.summary || '';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedMarkdown(true);
    success('Copied to Clipboard', 'Study content is ready to paste into Notion or notes.');
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const currentCards = generatedMaterial?.content.flashcards || [];
  const currentCard = currentCards[currentCardIndex];
  const targetLangObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Multilingual AI Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Study Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Powered by the official Google Gen AI SDK (<code className="text-purple-300 font-mono">@google/genai</code>). Translate, summarize, simplify with Feynman analogies, generate revision Q&A, and construct concept maps.
          </p>
        </div>

        {/* Quick Load Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Load Sample:</span>
          <button
            onClick={() => handleLoadSample('cs')}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            💾 B-Trees vs LSM
          </button>
          <button
            onClick={() => handleLoadSample('bio')}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            🧬 Respiration ETC
          </button>
          <button
            onClick={() => handleLoadSample('econ')}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            📊 Nash Equilibrium
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Input & Operation Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleTransformAll} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                Input Concept or Material
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {inputText ? `${inputText.split(/\s+/).filter(Boolean).length} words` : 'Empty'}
              </span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Topic Name
              </label>
              <input
                type="text"
                placeholder="e.g. Hebbian Learning & Synaptic Strength"
                value={inputTopic}
                onChange={(e) => setInputTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Subject Area
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Bioengineering">Bioengineering</option>
                  <option value="Economics">Economics</option>
                  <option value="Physics">Physics</option>
                  <option value="Neuroscience">Neuroscience</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="General Studies">General Studies</option>
                </select>
              </div>

              <LanguageSelector
                label="Target Language"
                selectedCode={targetLang}
                onChange={setTargetLang}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Raw Content / Chapter Excerpt
              </label>
              <textarea
                rows={8}
                placeholder="Paste the dense chapter text, theorem, code, or academic problem here to deconstruct..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-3 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
              />
            </div>

            {/* AI Operations Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  Select AI Operation
                </label>
                <span className="text-[10px] text-slate-500">Click to execute</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AI_OPERATIONS.map((op) => {
                  const Icon = op.icon;
                  const isSelected = selectedAction === op.action;
                  return (
                    <button
                      key={op.action}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleExecuteAction(op.action)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[70px] ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-500/80 text-white shadow-md shadow-purple-950/40 ring-1 ring-purple-500/50'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-300' : 'text-slate-400'}`} />
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-xs mt-1">{op.label}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 leading-tight">{op.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={isLoading || !inputText.trim()}
                onClick={() => handleExecuteAction(selectedAction)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loadingStep || 'Executing Gemini AI Operation...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run {AI_OPERATIONS.find(o => o.action === selectedAction)?.label || 'Operation'}</span>
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Generate Full Study Pack (All Modes)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Output: Transformation Results (7 cols) */}
        <div className="lg:col-span-7">

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center min-h-[420px] text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-700/60 flex items-center justify-center text-purple-300 shadow-xl shadow-purple-950/80">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-white">Mosaic AI Engine Running</h3>
                <p className="text-xs text-purple-300 font-mono animate-pulse">{loadingStep}</p>
                <p className="text-[11px] text-slate-400 pt-2">
                  Preserving code snippets, formulas, and terminology into {targetLangObj?.name || targetLang}.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && errorState && (
            <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/60 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-red-300 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>AI Transformation Error</span>
              </div>
              <p className="text-xs text-red-200/90 leading-relaxed bg-red-950/40 p-3.5 rounded-xl border border-red-900/50 font-mono">
                {errorState}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleExecuteAction(selectedAction)}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Operation</span>
                </button>
              </div>
            </div>
          )}

          {/* Result State */}
          {!isLoading && !errorState && (studyResult || generatedMaterial) ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <MosaicBadge variant="blue" size="sm">
                      {subject}
                    </MosaicBadge>
                    <MosaicBadge variant="purple" size="sm">
                      {targetLangObj?.flag} {targetLang.toUpperCase()}
                    </MosaicBadge>
                    {studyResult?.action && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 uppercase">
                        {studyResult.action}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {studyResult?.title || generatedMaterial?.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsNotionModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span>Notion View</span>
                  </button>

                  <button
                    onClick={handleCopyResult}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                    title="Copy Markdown"
                  >
                    {copiedMarkdown ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Mode Notice Banner (Never fabricates results) */}
              {studyResult?.isDemo && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="leading-snug">
                      <strong>Demo Mode:</strong> No server-side <code className="text-amber-300">GEMINI_API_KEY</code> configured. Showing curated sample demonstration. Set your API key to run live Gemini AI inference.
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                    Demo Mode
                  </span>
                </div>
              )}

              {/* Live Gemini AI Status */}
              {studyResult && !studyResult.isDemo && (
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Gemini AI generation (<code className="text-emerald-300">{studyResult.model || 'gemini-2.5-flash'}</code>)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">Verified AI Output</span>
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  onClick={() => setActiveTab('formatted')}
                  className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                    activeTab === 'formatted'
                      ? 'border-purple-500 text-purple-300'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Result View</span>
                </button>

                {currentCards.length > 0 && (
                  <button
                    onClick={() => setActiveTab('interactive')}
                    className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                      activeTab === 'interactive'
                        ? 'border-purple-500 text-purple-300'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Flashcards ({currentCards.length})</span>
                  </button>
                )}
              </div>

              {/* Content Tab: Markdown & Preserved Technical Elements */}
              {activeTab === 'formatted' && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 max-h-[580px] overflow-y-auto">
                  <MarkdownRenderer
                    content={studyResult?.content || generatedMaterial?.content.summary || ''}
                  />
                </div>
              )}

              {/* Interactive Flashcard Tab */}
              {activeTab === 'interactive' && currentCards.length > 0 && (
                <div className="space-y-4">
                  <div>
                    {/* Progress bar */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Card {currentCardIndex + 1} of {currentCards.length}</span>
                      <span className="text-emerald-400 font-semibold">
                        {Object.values(masteredCards).filter(Boolean).length} Mastered
                      </span>
                    </div>

                    {/* Flashcard Component */}
                    <div
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className={`min-h-[220px] p-6 rounded-2xl border cursor-pointer transition-all duration-300 shadow-xl flex flex-col justify-between ${
                        isCardFlipped
                          ? 'bg-gradient-to-br from-purple-950/70 to-slate-900 border-purple-500/50 text-purple-100'
                          : 'bg-gradient-to-br from-slate-900 to-indigo-950/50 border-indigo-500/30 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                          {isCardFlipped ? 'Answer (Reveal)' : 'Question'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <RotateCw className="w-3 h-3" />
                          Click to flip
                        </span>
                      </div>

                      <div className="py-4 text-center">
                        {!isCardFlipped ? (
                          <div>
                            <div className="text-sm sm:text-base font-semibold leading-snug">
                              {currentCard.question}
                            </div>
                            {currentCard.questionTranslation && (
                              <div className="text-xs text-purple-300 mt-2 font-medium">
                                {currentCard.questionTranslation}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm sm:text-base font-medium leading-snug text-white">
                              {currentCard.answer}
                            </div>
                            {currentCard.answerTranslation && (
                              <div className="text-xs text-purple-200 mt-2">
                                {currentCard.answerTranslation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-xs text-slate-400">
                        <span className="capitalize">Level: {currentCard.difficulty || 'Medium'}</span>
                        <span>{isCardFlipped ? 'Click again for prompt' : 'Click to verify answer'}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <button
                        disabled={currentCardIndex === 0}
                        onClick={() => {
                          setCurrentCardIndex(prev => prev - 1);
                          setIsCardFlipped(false);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold"
                      >
                        Previous
                      </button>

                      <button
                        onClick={() => toggleCardMastery(currentCard.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          masteredCards[currentCard.id]
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{masteredCards[currentCard.id] ? 'Mastered!' : 'Mark as Mastered'}</span>
                      </button>

                      <button
                        disabled={currentCardIndex === currentCards.length - 1}
                        onClick={() => {
                          setCurrentCardIndex(prev => prev + 1);
                          setIsCardFlipped(false);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[420px] rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Mosaic AI Engine Ready
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                Select any of the 6 operations (Translate, Summarize, Study Notes, Feynman Simplify, Revision Q&A, Visual Outline) to process your material using Gemini.
              </p>
              <button
                onClick={() => handleLoadSample('cs')}
                className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <span>Load B-Trees vs LSM Trees Sample</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
