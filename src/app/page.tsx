'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Headphones, Sparkles, FileCheck2, Database, 
  ArrowRight, BookOpen, ExternalLink, RefreshCw, 
  ChevronRight, Link2
} from 'lucide-react';
import { MosaicBadge } from '@/components/MosaicBadge';
import { NotionModal } from '@/components/NotionModal';
import { useToast } from '@/components/Toast';
import { 
  getStoredMaterials, 
  getStoredNotionWorkspace, 
  simulateNotionSync 
} from '@/lib/storage';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { StudyMaterial, NotionWorkspaceInfo } from '@/types';

export default function DashboardPage() {
  const { success } = useToast();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [workspace, setWorkspace] = useState<NotionWorkspaceInfo | null>(null);
  const [selectedMaterialForNotion, setSelectedMaterialForNotion] = useState<StudyMaterial | null>(null);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    setMaterials(getStoredMaterials());
    setWorkspace(getStoredNotionWorkspace());
  }, []);

  const handleSyncAllNotion = () => {
    if (!workspace?.connected) {
      setIsNotionModalOpen(true);
      return;
    }
    setIsSyncingAll(true);
    setTimeout(() => {
      materials.forEach(m => simulateNotionSync(m.id));
      setMaterials(getStoredMaterials());
      setWorkspace(getStoredNotionWorkspace());
      setIsSyncingAll(false);
      success('Workspace Synchronized', 'All study materials verified and synced to Notion.');
    }, 800);
  };

  const openNotionPreview = (material: StudyMaterial) => {
    setSelectedMaterialForNotion(material);
    setIsNotionModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Notion Connection Option Banner (if not connected) */}
      {!workspace?.connected ? (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Notion Workspace: Not Connected</div>
              <div className="text-[11px] text-zinc-400">
                Optionally connect your Notion workspace to synchronize lecture summaries and checklists directly.
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsNotionModalOpen(true)}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 shadow-sm shadow-orange-950/40"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Connect Notion</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 px-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-zinc-400">Connected Workspace:</span>
            <span className="font-semibold text-white">{workspace.workspaceName}</span>
            <span className="text-zinc-500">({workspace.targetDatabaseName})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAllNotion}
              disabled={isSyncingAll}
              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Syncing...' : 'Sync All'}</span>
            </button>
            <button
              onClick={() => setIsNotionModalOpen(true)}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Manage
            </button>
          </div>
        </div>
      )}

      {/* Primary Action Launchers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: Lecture Companion */}
        <Link
          href="/lecture-companion"
          className="group relative p-5 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-orange-500/50 transition-all duration-200 hover:-translate-y-0.5 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-orange-600/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors">
                Lecture Companion
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-orange-300 font-medium border border-zinc-800">
                Audio/Text
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Paste or upload lecture transcripts. Generates bilingual key takeaways, technical glossaries, and timestamps for Notion.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
            <span>Process Transcript</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Action 2: AI Study Studio */}
        <Link
          href="/study-studio"
          className="group relative p-5 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-orange-500/50 transition-all duration-200 hover:-translate-y-0.5 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-orange-600/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors">
                AI Study Studio
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-orange-300 font-medium border border-zinc-800">
                Transform
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Translate, summarize, simplify using the Feynman technique, and generate revision questions with interactive flashcards.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
            <span>Open Study Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Action 3: Assignment Simplifier */}
        <Link
          href="/assignment-simplifier"
          className="group relative p-5 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-orange-500/50 transition-all duration-200 hover:-translate-y-0.5 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-orange-600/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors">
                Assignment Simplifier
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-orange-300 font-medium border border-zinc-800">
                Rubrics
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Paste syllabus briefs to uncover what professors really want, decode tricky grading rubrics, and generate phased checklists.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
            <span>Simplify Assignment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Full-Width Recent Learning Materials Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-400" />
              Recent Learning Materials
            </h2>
            <p className="text-xs text-zinc-400">Course materials transformed into your native language</p>
          </div>
          <Link
            href="/my-learning"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <span>View all ({materials.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => {
            const targetLangObj = SUPPORTED_LANGUAGES.find(l => l.code === mat.targetLanguage);
            const sourceLangObj = SUPPORTED_LANGUAGES.find(l => l.code === mat.sourceLanguage);
            const isSynced = mat.notionSyncStatus === 'synced';

            return (
              <div
                key={mat.id}
                className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-orange-500/40 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-md font-medium bg-zinc-900 text-orange-300 border border-zinc-800">
                        {mat.subject}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {sourceLangObj?.flag} {mat.sourceLanguage.toUpperCase()} → {targetLangObj?.flag} {mat.targetLanguage.toUpperCase()}
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-500 font-mono">
                      {new Date(mat.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white group-hover:text-orange-300 transition-colors truncate">
                    {mat.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {mat.content.translatedSummary || mat.content.summary || "Bilingual study transformation completed."}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-850 flex items-center justify-between">
                  <span className={`text-[11px] flex items-center gap-1.5 ${isSynced ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                    {isSynced ? 'Notion Synced' : 'Local Draft'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openNotionPreview(mat)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="View Notion page format"
                    >
                      <Database className="w-3.5 h-3.5 text-orange-400" />
                      <span>Notion</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </button>
                    
                    <Link
                      href={
                        mat.type === 'lecture'
                          ? '/lecture-companion'
                          : mat.type === 'assignment_plan'
                          ? '/assignment-simplifier'
                          : '/study-studio'
                      }
                      className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors shadow-sm"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
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
