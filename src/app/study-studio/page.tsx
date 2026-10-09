'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, Layers, BrainCircuit, 
  HelpCircle, Copy, Download, RefreshCw, Check, ArrowRight, 
  RotateCw, Database
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MosaicBadge } from '@/components/MosaicBadge';
import { NotionModal } from '@/components/NotionModal';
import { useToast } from '@/components/Toast';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { SupportedLanguageCode, StudyMaterial } from '@/types';
import { addOrUpdateMaterial, getPreferredTargetLanguage } from '@/lib/storage';

export default function StudyStudioPage() {
  const { success, error, info } = useToast();

  const [inputTopic, setInputTopic] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [targetLang, setTargetLang] = useState<SupportedLanguageCode>('es');
  const [sourceLang, setSourceLang] = useState<SupportedLanguageCode>('en');
  const [inputText, setInputText] = useState('');
  
  const [activeTransformMode, setActiveTransformMode] = useState<'all' | 'flashcards' | 'outline'>('all');
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
    info('Sample Topic Loaded', 'Ready to transform into multilingual study materials.');
  };

  const handleTransform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      error('Input Text Required', 'Please paste content to transform or click one of the quick samples.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Analyzing text structure & theoretical foundations...');

    try {
      setTimeout(() => setLoadingStep('Drafting Feynman plain-language analogy...'), 500);
      setTimeout(() => setLoadingStep(`Translating into ${targetLang.toUpperCase()} & synthesizing flashcards...`), 1000);

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
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
      success('Study Studio Ready', 'Transformed into flashcards, concept outlines, and Notion blocks.');
    } catch (err: any) {
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

  const handleCopyMarkdown = () => {
    if (!generatedMaterial) return;
    const lines = [
      `# ${generatedMaterial.title} — Study Studio`,
      `**Subject:** ${generatedMaterial.subject} | **Target Language:** ${targetLang.toUpperCase()}`,
      '',
      '## 💡 Feynman Plain-Language Explanation',
      `${generatedMaterial.content.simplifiedExplanation || generatedMaterial.content.summary}`,
      '',
      '### 🌾 Real-World Analogy',
      `> ${generatedMaterial.content.feynmanAnalogy || 'Conceptual metaphor for fast intuition.'}`,
      '',
      '## 🗂️ Active Recall Revision Prompts',
      ...(generatedMaterial.content.flashcards || []).map(
        (f, i) => `### Card ${i + 1}: ${f.question}\n- **Translation (${targetLang.toUpperCase()}):** ${f.questionTranslation}\n- **Answer:** ${f.answer}\n`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedMarkdown(true);
    success('Study Pack Copied', 'Paste into Notion as a toggled study guide.');
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
            <span className="p-1 rounded-lg bg-orange-950/60 text-orange-400 border border-orange-800/60">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Cognitive Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Study Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Deconstruct complex academic theories using Feynman analogies, interactive bilingual flashcards, and hierarchical concept trees that sync directly into Notion.
          </p>
        </div>

        {/* Quick Load Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 hidden sm:inline">Load Sample:</span>
          <button
            onClick={() => handleLoadSample('cs')}
            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 hover:text-orange-300 rounded-lg text-xs font-medium transition-colors"
          >
            💾 B-Trees vs LSM
          </button>
          <button
            onClick={() => handleLoadSample('bio')}
            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 hover:text-orange-300 rounded-lg text-xs font-medium transition-colors"
          >
            🧬 Respiration ETC
          </button>
          <button
            onClick={() => handleLoadSample('econ')}
            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 hover:text-orange-300 rounded-lg text-xs font-medium transition-colors"
          >
            📊 Nash Equilibrium
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Input (5 cols) */}
        <form onSubmit={handleTransform} className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-orange-400" />
                Input Concept or Textbook Excerpt
              </span>
              <span className="text-[11px] text-zinc-500 font-normal font-mono">
                {inputText ? `${inputText.split(/\s+/).filter(Boolean).length} words` : 'Empty'}
              </span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Topic Name
              </label>
              <input
                type="text"
                placeholder="e.g. Hebbian Learning & Synaptic Strength"
                value={inputTopic}
                onChange={(e) => setInputTopic(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Subject Area
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Bioengineering">Bioengineering</option>
                  <option value="Economics">Economics</option>
                  <option value="Physics">Physics</option>
                  <option value="Neuroscience">Neuroscience</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <LanguageSelector
                label="Target Study Language"
                selectedCode={targetLang}
                onChange={setTargetLang}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Raw Content / Chapter Excerpt
              </label>
              <textarea
                rows={9}
                placeholder="Paste the dense chapter text, theorem, or academic problem here to deconstruct..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500 font-mono leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || 'Transforming into Study Pack...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Transform into Multilingual Study Pack</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Output: Transformation Results (7 cols) */}
        <div className="lg:col-span-7">
          {generatedMaterial ? (
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-850 shadow-2xl space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-md font-medium bg-zinc-900 text-orange-300 border border-zinc-800">
                      {generatedMaterial.subject}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {targetLangObj?.flag} {targetLang.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {currentCards.length} revision flashcards
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {generatedMaterial.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNotionModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-orange-400" />
                    <span>Notion</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white transition-colors"
                    title="Copy Markdown"
                  >
                    {copiedMarkdown ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Transformation View Tabs */}
              <div className="flex border-b border-zinc-850 gap-2">
                {[
                  { id: 'all', label: 'Feynman Analogy', icon: BookOpen },
                  { id: 'flashcards', label: `Flashcards (${currentCards.length})`, icon: HelpCircle },
                  { id: 'outline', label: 'Concept Map', icon: Layers },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTransformMode === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTransformMode(t.id as any)}
                      className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                        isActive
                          ? 'border-orange-500 text-orange-400'
                          : 'border-transparent text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* View 1: Feynman Plain-Language & Analogy */}
              {activeTransformMode === 'all' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-zinc-900 border border-orange-500/30 text-xs space-y-3">
                    <div className="flex items-center gap-2 text-orange-400 font-bold">
                      <BrainCircuit className="w-4 h-4" />
                      <span>Feynman Simplification Technique</span>
                    </div>
                    <p className="text-zinc-200 leading-relaxed text-sm">
                      {generatedMaterial.content.simplifiedExplanation || generatedMaterial.content.summary}
                    </p>

                    <div className="p-3.5 rounded-lg bg-black border border-zinc-800 text-xs text-zinc-300">
                      <strong className="block text-orange-400 mb-1 font-semibold flex items-center gap-1.5">
                        <span>💡</span> Intuitive Metaphor
                      </strong>
                      <p className="leading-relaxed">
                        {generatedMaterial.content.feynmanAnalogy || 'Imagine this like a highway system with dynamic toll gates that adjust to prevent congestion.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-orange-400 font-bold border-b border-zinc-850 pb-2">
                      <span>Translated Synthesis ({targetLangObj?.name})</span>
                      <span className="text-[10px] font-mono text-zinc-500">Notion Block Ready</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed pt-1">
                      {generatedMaterial.content.translatedSummary || generatedMaterial.content.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* View 2: Interactive Revision Flashcards */}
              {activeTransformMode === 'flashcards' && (
                <div className="space-y-4">
                  {currentCards.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span>Card {currentCardIndex + 1} of {currentCards.length}</span>
                        <span className="text-emerald-400 font-semibold">
                          {Object.values(masteredCards).filter(Boolean).length} Mastered
                        </span>
                      </div>

                      <div
                        onClick={() => setIsCardFlipped(!isCardFlipped)}
                        className={`min-h-[220px] p-6 rounded-2xl border cursor-pointer transition-all duration-300 shadow-xl flex flex-col justify-between ${
                          isCardFlipped
                            ? 'bg-zinc-900 border-orange-500/50 text-orange-100'
                            : 'bg-black border-zinc-800 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {isCardFlipped ? 'Answer (Reveal)' : 'Question'}
                          </span>
                          <span className="text-xs text-zinc-400 flex items-center gap-1">
                            <RotateCw className="w-3 h-3 text-orange-400" />
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
                                <div className="text-xs text-orange-300 mt-2 font-medium">
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
                                <div className="text-xs text-orange-200 mt-2">
                                  {currentCard.answerTranslation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-850 text-xs text-zinc-400">
                          <span className="capitalize">Level: {currentCard.difficulty || 'Medium'}</span>
                          <span>{isCardFlipped ? 'Click again for question' : 'Click to verify answer'}</span>
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
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 rounded-lg text-xs font-semibold"
                        >
                          Previous
                        </button>

                        <button
                          onClick={() => toggleCardMastery(currentCard.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            masteredCards[currentCard.id]
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
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
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 rounded-lg text-xs font-semibold"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-zinc-400">No flashcards available.</div>
                  )}
                </div>
              )}

              {/* View 3: Visual Concept Outline */}
              {activeTransformMode === 'outline' && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-400">
                    Hierarchical knowledge structure with dual-language nodes:
                  </p>
                  <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-3">
                    {(generatedMaterial.content.visualOutline || []).map((node) => (
                      <div key={node.id} className="space-y-2">
                        <div className="flex items-start gap-2 text-xs font-bold text-white bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                          <span className="text-orange-400">◆</span>
                          <div className="flex-1">
                            <div>{node.label}</div>
                            <div className="text-[11px] text-orange-300 font-normal">{node.translation}</div>
                          </div>
                        </div>

                        {node.children && (
                          <div className="ml-4 pl-3 border-l border-zinc-800 space-y-2">
                            {node.children.map((child) => (
                              <div key={child.id} className="text-xs bg-zinc-950 p-2 rounded-lg border border-zinc-850">
                                <div className="font-semibold text-zinc-200">{child.label}</div>
                                <div className="text-[11px] text-orange-400">{child.translation}</div>
                                <div className="text-[11px] text-zinc-400 mt-1">{child.description}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[420px] rounded-2xl bg-zinc-950 border border-dashed border-zinc-850 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                AI Study Studio Ready
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
                Paste any chapter excerpt on the left or select a sample topic above to generate bilingual flashcards, Feynman analogies, and Notion study blocks.
              </p>
              <button
                onClick={() => handleLoadSample('cs')}
                className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
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
