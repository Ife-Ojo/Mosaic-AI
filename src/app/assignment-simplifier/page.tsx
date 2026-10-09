'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, CheckCircle2, AlertTriangle, Clock, Database, 
  Copy, Download, Sparkles, RefreshCw, Check, ArrowRight, 
  ShieldAlert, Target, ListTodo
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MosaicBadge } from '@/components/MosaicBadge';
import { NotionModal } from '@/components/NotionModal';
import { useToast } from '@/components/Toast';
import { PRESET_ASSIGNMENT_PROMPTS, SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { SupportedLanguageCode, StudyMaterial } from '@/types';
import { addOrUpdateMaterial, getPreferredTargetLanguage } from '@/lib/storage';

export default function AssignmentSimplifierPage() {
  const { success, error, info } = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [targetLang, setTargetLang] = useState<SupportedLanguageCode>('es');
  const [briefText, setBriefText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedMaterial, setGeneratedMaterial] = useState<StudyMaterial | null>(null);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'rubric' | 'pitfalls'>('plan');

  useEffect(() => {
    setTargetLang(getPreferredTargetLanguage());
  }, []);

  const handleLoadPreset = (index: number) => {
    const p = PRESET_ASSIGNMENT_PROMPTS[index];
    if (!p) return;
    setTitle(p.title);
    setSubject(p.subject);
    setTargetLang(p.defaultTarget);
    setBriefText(p.text);
    info('Assignment Prompt Loaded', p.title);
  };

  const handleSimplify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefText.trim()) {
      error('Assignment Text Required', 'Please paste a project brief or load a sample preset.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Deconstructing academic brief & grading weights...');

    try {
      setTimeout(() => setLoadingStep('Extracting instructor expectations & grading pitfalls...'), 500);
      setTimeout(() => setLoadingStep(`Translating action plan into ${targetLang.toUpperCase()} & structuring phases...`), 1000);

      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'assignment',
          inputText: briefText,
          title: title || 'Course Assignment Project',
          subject,
          sourceLanguage: 'en',
          targetLanguage: targetLang,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const newMaterial: StudyMaterial = {
        id: `mat-${Date.now()}`,
        title: title || 'Course Assignment Project Plan',
        subject,
        type: 'assignment_plan',
        sourceLanguage: 'en',
        targetLanguage: targetLang,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [subject, 'Assignment Plan', 'Checklist'],
        notionSyncStatus: 'local_only',
        stats: {
          wordCount: data.wordCount || 540,
          estimatedReadTimeMinutes: 5,
          masteryPercentage: 35,
        },
        content: {
          ...data.content,
          rawSourceText: briefText,
        },
      };

      addOrUpdateMaterial(newMaterial);
      setGeneratedMaterial(newMaterial);
      success('Assignment Decoded', 'Milestone plan and rubric breakdown ready.');
    } catch (err: any) {
      error('Failed to Process', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleToggleTask = (phaseIdx: number, taskId: string) => {
    if (!generatedMaterial?.content.assignmentBreakdown) return;
    const breakdown = { ...generatedMaterial.content.assignmentBreakdown };
    const milestones = [...breakdown.milestones];
    const targetPhase = milestones[phaseIdx];
    
    targetPhase.tasks = targetPhase.tasks.map(t => 
      t.id === taskId ? { ...t, done: !t.done } : t
    );

    const updatedMaterial: StudyMaterial = {
      ...generatedMaterial,
      content: {
        ...generatedMaterial.content,
        assignmentBreakdown: {
          ...breakdown,
          milestones,
        },
      },
    };

    setGeneratedMaterial(updatedMaterial);
    addOrUpdateMaterial(updatedMaterial);
    info('Task Updated', 'Action plan progress saved.');
  };

  const handleCopyMarkdown = () => {
    if (!generatedMaterial?.content.assignmentBreakdown) return;
    const b = generatedMaterial.content.assignmentBreakdown;
    const lines = [
      `# ${generatedMaterial.title} — Assignment Action Plan`,
      `**Subject:** ${generatedMaterial.subject} | **Target Language:** ${targetLang.toUpperCase()}`,
      '',
      '## 🎯 Plain-Language Summary',
      b.plainSummary,
      '',
      '### 💡 Translated Overview',
      b.translatedSummary,
      '',
      '## 🧑‍🏫 What the Instructor Actually Cares About',
      `> ${b.professorIntent}`,
      '',
      '## 📋 Actionable Milestones & Checklists',
      ...b.milestones.flatMap(m => [
        `### ${m.phase}: ${m.title}`,
        ...m.tasks.map(t => `- [${t.done ? 'x' : ' '}] ${t.text} (${t.estimatedHours}h)`),
        ''
      ]),
      '## ⚠️ Critical Rubric Weights',
      ...b.criticalRubricCriteria.map(c => `- **${c.criterion}** (${c.weight}): ${c.howToAce}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedMarkdown(true);
    success('Checklist Copied', 'Paste into Notion as actionable to-do blocks.');
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const breakdown = generatedMaterial?.content.assignmentBreakdown;
  const targetLangObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);

  const allTasks = breakdown?.milestones.flatMap(m => m.tasks) || [];
  const completedTasks = allTasks.filter(t => t.done).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-orange-950/60 text-orange-400 border border-orange-800/60">
              <FileCheck2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Rubric & Deliverable Decoder
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Assignment Simplifier
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Translate academic course prompts into plain language, expose hidden grading pitfalls, and generate phased checklists for your Notion workspace.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 hidden sm:inline">Try preset:</span>
          <button
            onClick={() => handleLoadPreset(0)}
            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 hover:text-orange-300 rounded-lg text-xs font-medium transition-colors"
          >
            💻 CS 420 Distributed Raft
          </button>
          <button
            onClick={() => handleLoadPreset(1)}
            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 hover:text-orange-300 rounded-lg text-xs font-medium transition-colors"
          >
            🧬 BIO 380 CRISPR Proposal
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Input Form (5 cols) */}
        <form onSubmit={handleSimplify} className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-400" />
                Assignment Brief & Prompt
              </span>
              <span className="text-[11px] text-zinc-500 font-normal font-mono">
                {briefText ? `${briefText.split(/\s+/).filter(Boolean).length} words` : 'Empty'}
              </span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Course & Project Title
              </label>
              <input
                type="text"
                placeholder="e.g. CS 350 Final Capstone Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Department
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Bioengineering">Bioengineering</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Economics">Economics</option>
                  <option value="Literature">Literature</option>
                  <option value="General Studies">General Studies</option>
                </select>
              </div>

              <LanguageSelector
                label="Target Native Language"
                selectedCode={targetLang}
                onChange={setTargetLang}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Paste Project Brief / Syllabus Prompt
              </label>
              <textarea
                rows={9}
                placeholder="Paste the full assignment brief, rubric criteria, or instructions here..."
                value={briefText}
                onChange={(e) => setBriefText(e.target.value)}
                className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500 font-mono leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !briefText.trim()}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || 'Decoding Assignment Requirements...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Simplify Assignment & Generate Action Plan</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Output: Breakdown & Action Plan (7 cols) */}
        <div className="lg:col-span-7">
          {breakdown ? (
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-850 shadow-2xl space-y-6">
              
              {/* Header with Progress */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-md font-medium bg-zinc-900 text-orange-300 border border-zinc-800">
                      {generatedMaterial?.subject}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {targetLangObj?.flag} {targetLang.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {completedTasks}/{allTasks.length} milestones complete ({progressPercent}%)
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {generatedMaterial?.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNotionModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-orange-400" />
                    <span>Sync to Notion</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white transition-colors"
                    title="Copy Markdown Checklist"
                  >
                    {copiedMarkdown ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-zinc-800">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* View Tabs */}
              <div className="flex border-b border-zinc-850 gap-2">
                {[
                  { id: 'plan', label: 'Action Checklist', icon: ListTodo },
                  { id: 'rubric', label: 'Grading Rubric Decoder', icon: Target },
                  { id: 'pitfalls', label: 'Pitfalls & Traps', icon: ShieldAlert },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
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

              {/* Tab 1: Action Checklist & Phased Milestones */}
              {activeTab === 'plan' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-2">
                    <span className="font-bold text-white block">Plain-Language Executive Summary</span>
                    <p className="text-zinc-300 leading-relaxed">{breakdown.plainSummary}</p>
                    {breakdown.translatedSummary && (
                      <p className="text-orange-300 leading-relaxed pt-1 border-t border-zinc-800">
                        {breakdown.translatedSummary}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-800/40 text-xs flex items-start gap-2.5">
                    <span className="text-orange-400 text-base">🧑‍🏫</span>
                    <div>
                      <strong className="block text-orange-400 mb-0.5">What the Professor Actually Looks For:</strong>
                      <p className="text-zinc-200 leading-relaxed">{breakdown.professorIntent}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {breakdown.milestones.map((milestone, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-4 rounded-xl bg-black border border-zinc-850 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                          <div>
                            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                              {milestone.phase}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {milestone.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            ~{milestone.tasks.reduce((a, b) => a + b.estimatedHours, 0)} hours
                          </span>
                        </div>

                        <div className="space-y-2">
                          {milestone.tasks.map((task) => (
                            <label
                              key={task.id}
                              className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                task.done
                                  ? 'bg-zinc-950 border-zinc-850 text-zinc-500 line-through'
                                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-200 hover:border-orange-500/40'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleToggleTask(pIdx, task.id)}
                                className="mt-0.5 rounded border-zinc-700 text-orange-600 focus:ring-0"
                              />
                              <div className="flex-1">
                                <span>{task.text}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                                {task.estimatedHours}h
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Rubric Decoder */}
              {activeTab === 'rubric' && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-400">
                    Weighted evaluation criteria decoded so you know exactly where points are awarded:
                  </p>
                  <div className="space-y-3">
                    {breakdown.criticalRubricCriteria.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-black border border-zinc-850 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{c.criterion}</span>
                          <span className="text-xs font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-950/80 border border-orange-800/60">
                            {c.weight}
                          </span>
                        </div>
                        <div className="text-zinc-300 leading-relaxed pt-1">
                          <strong className="text-orange-400">How to Ace: </strong>
                          {c.howToAce}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Common Pitfalls */}
              {activeTab === 'pitfalls' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-rose-300 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Where Most Students Lose Marks:</span>
                    </div>
                    <ul className="space-y-2 text-zinc-300">
                      {breakdown.commonPitfalls.map((pitfall, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-rose-400 mt-0.5">✕</span>
                          <span>{pitfall}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[420px] rounded-2xl bg-zinc-950 border border-dashed border-zinc-850 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Assignment Simplifier Ready
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
                Paste any complex syllabus prompt or assignment brief to extract a plain-language summary, hidden rubric traps, and an actionable Notion checklist.
              </p>
              <button
                onClick={() => handleLoadPreset(0)}
                className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <span>Load CS 420 Raft Assignment Sample</span>
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
