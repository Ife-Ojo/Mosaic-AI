'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Library, Search, Filter, Database, ExternalLink, 
  Trash2, Copy, Sparkles, BookOpen, Headphones, 
  FileCheck2, Check, RefreshCw, Layers, ArrowUpRight, Plus
} from 'lucide-react';
import { MosaicBadge } from '@/components/MosaicBadge';
import { NotionModal } from '@/components/NotionModal';
import { useToast } from '@/components/Toast';
import { 
  getStoredMaterials, 
  deleteMaterial, 
  simulateNotionSync, 
  getStoredNotionWorkspace 
} from '@/lib/storage';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { StudyMaterial, MaterialType, NotionWorkspaceInfo } from '@/types';

export default function MyLearningPage() {
  const { success, info } = useToast();

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [workspace, setWorkspace] = useState<NotionWorkspaceInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [selectedSyncStatus, setSelectedSyncStatus] = useState<string>('all');

  const [selectedMaterialForNotion, setSelectedMaterialForNotion] = useState<StudyMaterial | null>(null);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);

  useEffect(() => {
    setMaterials(getStoredMaterials());
    setWorkspace(getStoredNotionWorkspace());
  }, []);

  const handleDelete = (id: string, title: string) => {
    const updated = deleteMaterial(id);
    setMaterials(updated);
    success('Material Removed', `"${title}" was removed from your local study archive.`);
  };

  const handleSyncItem = (mat: StudyMaterial) => {
    const res = simulateNotionSync(mat.id);
    const updated = getStoredMaterials();
    setMaterials(updated);
    setWorkspace(getStoredNotionWorkspace());
    success('Notion Synced', `"${mat.title}" synchronized to Notion workspace.`);
  };

  const handleCopyMarkdown = (mat: StudyMaterial) => {
    const lines = [
      `# ${mat.title}`,
      `**Subject:** ${mat.subject} | **Language:** ${mat.targetLanguage.toUpperCase()}`,
      '',
      `> 💡 **Summary:** ${mat.content.translatedSummary || mat.content.summary}`,
      '',
      '## Key Notes & Takeaways',
      ...(mat.content.translatedTakeaways || mat.content.keyTakeaways || []).map(t => `- ${t}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    success('Markdown Copied', 'Ready to paste into Notion or Obsidian.');
  };

  // Unique subjects and languages present in materials
  const availableSubjects = Array.from(new Set(materials.map(m => m.subject)));
  const availableLanguages = Array.from(new Set(materials.map(m => m.targetLanguage)));

  // Filter materials
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || m.type === selectedType;
    const matchesSubject = selectedSubject === 'all' || m.subject === selectedSubject;
    const matchesLang = selectedLang === 'all' || m.targetLanguage === selectedLang;
    const matchesSync = selectedSyncStatus === 'all' || 
      (selectedSyncStatus === 'synced' ? m.notionSyncStatus === 'synced' : m.notionSyncStatus !== 'synced');

    return matchesSearch && matchesType && matchesSubject && matchesLang && matchesSync;
  });

  const syncedCount = materials.filter(m => m.notionSyncStatus === 'synced').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
              <Library className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Study Hub Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Learning & Notion Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Access, review, and synchronize all generated lecture packs, study guides, and assignment plans with their corresponding Notion database pages.
          </p>
        </div>

        {/* Quick Link to Studio */}
        <div className="flex items-center gap-3">
          <Link
            href="/study-studio"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/40 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>New Transform</span>
          </Link>
        </div>
      </div>

      {/* Stats Counter Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 mb-1">Total Materials</div>
          <div className="text-2xl font-extrabold text-white">{materials.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 mb-1">Notion Synced</div>
          <div className="text-2xl font-extrabold text-emerald-400 flex items-center gap-2">
            <span>{syncedCount}</span>
            <span className="text-xs font-normal text-slate-500">/ {materials.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 mb-1">Target Languages</div>
          <div className="text-2xl font-extrabold text-purple-400">{availableLanguages.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 shadow-sm">
          <div className="text-xs text-stone-400 mb-1">Connected Vault</div>
          <div className="text-xs font-bold text-stone-200 truncate mt-1">
            {workspace?.workspaceName || 'Academic Vault'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by topic title, course, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Material Types</option>
            <option value="lecture">Lecture Notes</option>
            <option value="study_notes">Study Studio Notes</option>
            <option value="assignment_plan">Assignment Plans</option>
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Subjects</option>
            {availableSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Notion Status Filter */}
          <select
            value={selectedSyncStatus}
            onChange={(e) => setSelectedSyncStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Sync Statuses</option>
            <option value="synced">Synced to Notion</option>
            <option value="pending">Local Only / Pending</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => {
            const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === mat.targetLanguage);
            const sourceLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === mat.sourceLanguage);
            const isSynced = mat.notionSyncStatus === 'synced';

            return (
              <div
                key={mat.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all duration-200 shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <MosaicBadge variant="purple" size="sm">
                      {mat.subject}
                    </MosaicBadge>
                    <MosaicBadge variant={isSynced ? 'emerald' : 'slate'} size="sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                      {isSynced ? 'Notion Synced' : 'Local Draft'}
                    </MosaicBadge>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                    {mat.title}
                  </h3>

                  {/* Language & Date Metadata */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <span>
                      {sourceLangObj?.flag} {mat.sourceLanguage.toUpperCase()} → {targetLangObj?.flag} {mat.targetLanguage.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{mat.type.replace('_', ' ')}</span>
                  </div>

                  {/* Summary Snippet */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {mat.content.translatedSummary || mat.content.summary || 'Multilingual study notes ready for revision and Notion export.'}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-850 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedMaterialForNotion(mat);
                        setIsNotionModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Open in Notion preview modal"
                    >
                      <Database className="w-3.5 h-3.5 text-purple-400" />
                      <span>Notion</span>
                    </button>

                    {!isSynced && (
                      <button
                        onClick={() => handleSyncItem(mat)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                        title="Sync to Notion now"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyMarkdown(mat)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                      title="Copy Markdown block"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDelete(mat.id, mat.title)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                      title="Delete material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
          <Library className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No study materials match your filters</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            Try adjusting your search query, or clear filters to see your full library.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedSubject('all');
              setSelectedLang('all');
              setSelectedSyncStatus('all');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

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
