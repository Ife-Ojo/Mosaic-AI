'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, ShieldCheck, Key, CheckCircle2, AlertTriangle, 
  ExternalLink, RefreshCw, Copy, Check, Info, Cpu, FileText, 
  Sparkles, Layers, BookOpen, ArrowRight, Lock, Radio, Server, Code
} from 'lucide-react';
import { MosaicBadge } from '@/components/MosaicBadge';
import { useToast } from '@/components/Toast';
import { getStoredNotionWorkspace, saveNotionWorkspace } from '@/lib/storage';
import { NotionWorkspaceInfo } from '@/types';

export default function SettingsPage() {
  const { success, error, info } = useToast();

  const [workspace, setWorkspace] = useState<NotionWorkspaceInfo>(getStoredNotionWorkspace());
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    valid: boolean;
    botName?: string;
    workspaceName?: string;
    message?: string;
    accessibleDatabases?: Array<{ id: string; title: string; url: string }>;
    accessiblePages?: Array<{ id: string; title: string; url: string }>;
  } | null>(null);

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [parentIdInput, setParentIdInput] = useState('');
  const [parentType, setParentType] = useState<'database' | 'page'>('page');
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'guide' | 'mcp-architecture' | 'export'>('connection');

  // Check connection status on load
  useEffect(() => {
    checkServerNotionStatus();
  }, []);

  const checkServerNotionStatus = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/notion/status');
      const data = await res.json();
      setConnectionStatus({
        tested: true,
        valid: Boolean(data.valid),
        botName: data.botName,
        workspaceName: data.workspaceName,
        message: data.message,
        accessibleDatabases: data.accessibleDatabases || [],
        accessiblePages: data.accessiblePages || [],
      });
      if (data.valid) {
        setWorkspace(prev => ({
          ...prev,
          apiKeyConfigured: true,
          workspaceName: data.workspaceName || prev.workspaceName,
          botName: data.botName,
        }));
      }
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        valid: false,
        message: 'Could not contact server Notion endpoint.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    try {
      const res = await fetch('/api/notion/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() || undefined }),
      });
      const data = await res.json();
      setConnectionStatus({
        tested: true,
        valid: Boolean(data.valid),
        botName: data.botName,
        workspaceName: data.workspaceName,
        message: data.message,
        accessibleDatabases: data.accessibleDatabases || [],
        accessiblePages: data.accessiblePages || [],
      });

      if (data.valid) {
        success('Notion Connection Verified', data.message);
        const updated = {
          ...workspace,
          apiKeyConfigured: true,
          workspaceName: data.workspaceName || workspace.workspaceName,
          botName: data.botName,
        };
        saveNotionWorkspace(updated);
        setWorkspace(updated);
      } else {
        error('Connection Verification Failed', data.message || 'Invalid Notion integration credentials.');
      }
    } catch (err: any) {
      error('Verification Error', err.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveLocalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: NotionWorkspaceInfo = {
      ...workspace,
      targetDatabaseName: workspace.targetDatabaseName,
      workspaceName: workspace.workspaceName,
      parentId: parentIdInput.trim() || workspace.parentId,
      parentType,
    };
    saveNotionWorkspace(updated);
    setWorkspace(updated);
    success('Workspace Settings Saved', 'Local workspace configuration updated.');
  };

  const sampleEnvConfig = `# .env.local — Mosaic Server Configuration
NOTION_API_KEY=${apiKeyInput.trim() || 'secret_your_notion_internal_integration_token'}
NOTION_DATABASE_ID=${parentIdInput.trim() || 'your_32_char_database_or_page_id'}
# Or if targeting a root page instead of a database:
# NOTION_PARENT_PAGE_ID=your_32_char_parent_page_id`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(sampleEnvConfig);
    setCopiedEnv(true);
    success('Configuration Copied', 'Paste this into your project .env.local file.');
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
              <Database className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Workspace Integrations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Notion Workspace & Architecture Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Configure your official Notion API bridge, explore the Notion MCP server architecture, and verify synchronization permissions.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              connectionStatus?.valid
                ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50'
                : 'bg-amber-400'
            }`}
          />
          <div className="text-xs">
            <div className="font-semibold text-white">
              {connectionStatus?.valid ? 'Official Notion API Connected' : 'Preview / Simulation Mode'}
            </div>
            <div className="text-[11px] text-slate-400">
              {connectionStatus?.valid
                ? `Bot: ${connectionStatus.botName || 'Mosaic Bot'}`
                : 'Ready for server API credentials'}
            </div>
          </div>
          <button
            onClick={checkServerNotionStatus}
            disabled={isTesting}
            className="p-1.5 ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Refresh connection status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('connection')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'connection'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          Connection & Credentials
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'guide'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          4-Step Setup Guide
        </button>
        <button
          onClick={() => setActiveTab('mcp-architecture')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'mcp-architecture'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Notion API vs Notion MCP
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'export'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Manual Export & Fallbacks
        </button>
      </div>

      {/* Tab 1: Connection & Credentials */}
      {activeTab === 'connection' && (
        <div className="space-y-6">
          {/* Status Diagnostic Card */}
          <div
            className={`p-5 rounded-2xl border ${
              connectionStatus?.valid
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {connectionStatus?.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm text-white">
                  {connectionStatus?.valid
                    ? 'Connected to Notion via Official REST API'
                    : 'Currently Running in Safe Preview / Simulated Mode'}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {connectionStatus?.message ||
                    'When configured with an official Notion Internal Integration Token, Mosaic creates rich Notion pages containing bilingual summaries, glossaries, takeaways, and active recall revision questions.'}
                </p>
                {connectionStatus?.accessibleDatabases && connectionStatus.accessibleDatabases.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-800/40">
                    <span className="font-semibold text-white">Accessible Databases Discovered:</span>
                    <ul className="mt-1 space-y-1 font-mono text-[11px] text-emerald-200">
                      {connectionStatus.accessibleDatabases.map((db) => (
                        <li key={db.id} className="flex items-center gap-2">
                          <span>📁 {db.title}</span>
                          <span className="text-slate-400 text-[10px]">({db.id})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {connectionStatus?.accessiblePages && connectionStatus.accessiblePages.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-emerald-800/40">
                    <span className="font-semibold text-white">Accessible Pages Discovered:</span>
                    <ul className="mt-1 space-y-1 font-mono text-[11px] text-emerald-200">
                      {connectionStatus.accessiblePages.map((pg) => (
                        <li key={pg.id} className="flex items-center gap-2">
                          <span>📄 {pg.title}</span>
                          <span className="text-slate-400 text-[10px]">({pg.id})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test / Save Credentials Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                Test / Session Integration Token
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your Notion Internal Integration Token to test credentials immediately against the official Notion API. Tokens are kept securely on the server and are never exposed in frontend state.
              </p>

              <form onSubmit={handleTestKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notion Internal Integration Secret
                  </label>
                  <input
                    type="password"
                    placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx or ntn_xxxx..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Created in the Notion Developers Portal under &quot;My Integrations&quot;.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    {isTesting ? 'Verifying with Notion API...' : 'Test Connection'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setApiKeyInput('');
                      checkServerNotionStatus();
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                  >
                    Reset to .env
                  </button>
                </div>
              </form>
            </div>

            {/* Target Destination & Workspace Metadata */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                Target Notion Workspace & Page
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure the target page or database where Mosaic will save generated study materials.
              </p>

              <form onSubmit={handleSaveLocalSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Workspace Display Name
                  </label>
                  <input
                    type="text"
                    value={workspace.workspaceName}
                    onChange={(e) => setWorkspace({ ...workspace, workspaceName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Type</label>
                    <select
                      value={parentType}
                      onChange={(e) => setParentType(e.target.value as 'database' | 'page')}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="page">Parent Page (Mosaic Vault)</option>
                      <option value="database">Database (Courses Table)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Target Page / Database ID or URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234567890abcdef1234567890abcdef"
                      value={parentIdInput || workspace.parentId || ''}
                      onChange={(e) => setParentIdInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl font-bold transition-all mt-2"
                >
                  Save Workspace Target
                </button>
              </form>
            </div>
          </div>

          {/* .env.local Configuration Snippet */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Recommended Server Environment Configuration (.env.local)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  For permanent security in production and hackathon demos, store credentials in your server environment:
                </p>
              </div>

              <button
                onClick={handleCopyEnv}
                className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEnv ? 'Copied' : 'Copy .env.local'}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap">
              {sampleEnvConfig}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: 4-Step Setup Guide */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Step-by-Step Notion Internal Integration Guide
            </h3>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white">Create an Internal Integration in Notion</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Navigate to the official Notion developer portal at{' '}
                    <a
                      href="https://www.notion.so/profile/integrations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline inline-flex items-center gap-1"
                    >
                      notion.so/profile/integrations <ExternalLink className="w-3 h-3" />
                    </a>
                    . Click <strong>&quot;+ New integration&quot;</strong>, name it <strong>Mosaic AI</strong>, and select the workspace where your academic notes reside.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Ensure the capabilities include <strong>Read content</strong>, <strong>Update content</strong>, and <strong>Insert content</strong>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white">Retrieve Your Internal Integration Secret</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Copy the token shown under <strong>&quot;Internal Integration Secret&quot;</strong> (typically starting with <code className="text-purple-300 bg-slate-950 px-1.5 py-0.5 rounded">secret_</code> or <code className="text-purple-300 bg-slate-950 px-1.5 py-0.5 rounded">ntn_</code>).
                  </p>
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-purple-300 text-[11px]">
                    <strong>Security Rule:</strong> Never hardcode this token in client-side code or public Git repositories. Mosaic keeps this secret strictly inside server-side environment variables.
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white">Share Target Page or Database with the Bot (Crucial!)</h4>
                  <p className="text-slate-300 leading-relaxed">
                    By default, Notion integrations have <strong>zero access</strong> to your workspace pages until explicitly shared.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 ml-1">
                    <li>Open your target Notion page or database in your browser or desktop app.</li>
                    <li>Click the <strong>&quot;...&quot;</strong> menu in the upper-right corner of the page.</li>
                    <li>Scroll down and click <strong>&quot;Connect to&quot;</strong> (or <strong>&quot;Add connections&quot;</strong>).</li>
                    <li>Search for <strong>&quot;Mosaic AI&quot;</strong> (or your integration name) and confirm.</li>
                  </ol>
                  <p className="text-amber-400 text-[11px] font-medium">
                    ⚠️ If you skip this step, the Notion API will return an <code className="bg-slate-950 px-1 rounded">object_not_found</code> (404/403) error when attempting to create pages.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white">Obtain Your Target Page or Database ID</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Look at your Notion page URL in the browser address bar:
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                    https://notion.so/workspace/My-Study-Vault-<span className="text-purple-400 font-bold">32_hex_characters_here</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    The 32-character hex sequence at the very end is your page or database ID. Copy it into your <code className="text-purple-300">.env.local</code> file or input field above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notion API vs Notion MCP Architecture */}
      {activeTab === 'mcp-architecture' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Architecture Deep Dive</span>
              <h3 className="text-lg font-bold text-white mt-1">
                Distinguishing the Notion REST API vs. Notion MCP Server
              </h3>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Before implementing or deploying workspace AI, it is critical to verify what capabilities each system actually provides rather than assuming AI protocols provide microphone audio or meeting streaming.
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notion REST API */}
              <div className="p-5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Official Notion REST API</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 font-mono">
                    Primary Engine
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The direct HTTP programming interface (<code className="text-purple-300">https://api.notion.com/v1</code>) operated by Notion.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="font-semibold text-white">What it does in Mosaic:</div>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li>Programmatically creates pages using official block schemas (<code className="text-purple-300">pages.create</code>).</li>
                    <li>Renders callouts, toggle notes, checklists, and bilingual summaries.</li>
                    <li>Fetches and reads existing page blocks for transcript import.</li>
                    <li>Uses secure server-to-server token authentication without browser popup dependencies.</li>
                  </ul>
                </div>
              </div>

              {/* Notion MCP */}
              <div className="p-5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">Official Notion MCP Server</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-mono">
                    Agent Protocol
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The Model Context Protocol endpoint (<code className="text-indigo-300">https://mcp.notion.com/mcp</code>) designed for autonomous AI clients like Claude, Cursor, and Goose.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="font-semibold text-white">Available Tools & Capabilities:</div>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li><code className="text-indigo-300">notion-search</code>: Semantic search across pages and databases.</li>
                    <li><code className="text-indigo-300">get_page</code> / <code className="text-indigo-300">read_page</code>: Retrieve structured page content in markdown.</li>
                    <li><code className="text-indigo-300">create_page</code> / <code className="text-indigo-300">update_page</code>: Let AI agents write workspace data.</li>
                    <li>OAuth-managed authorization for interactive desktop AI tools.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Critical Boundaries Banner */}
            <div className="p-5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-200 space-y-2">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-400" />
                Critical Verification: What Notion MCP & API DO NOT Support
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-xs leading-relaxed">
                <li>
                  <strong className="text-white">No Live Microphone / Audio Capture:</strong> Neither the Notion API nor the Notion MCP server connects to microphone hardware, audio drivers, or live speech streams.
                </li>
                <li>
                  <strong className="text-white">No Meeting Audio Stream Interception:</strong> Neither protocol hooks into Zoom, Microsoft Teams, Google Meet, or Notion&apos;s desktop audio recorder in real time.
                </li>
                <li>
                  <strong className="text-white">No Autonomous Calendar Engine:</strong> While Notion Calendar exists as an application, Notion MCP does not provide live event listening daemons.
                </li>
              </ul>
            </div>

            {/* The True Meeting Workflow */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                The Verified End-to-End Meeting Workflow in Mosaic
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Because Notion does not expose live audio streams to APIs or MCP tools, Mosaic establishes a realistic, robust meeting notes workflow:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-purple-300 mb-1">1. Capture in Notion</div>
                  <p className="text-[11px] text-slate-400">
                    User records a meeting/lecture using Notion AI Meeting Notes or pastes a lecture transcript into a Notion page.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-purple-300 mb-1">2. Ingestion in Mosaic</div>
                  <p className="text-[11px] text-slate-400">
                    Paste the transcript text, upload a file (.txt, .srt), or import directly from the Notion page using Mosaic&apos;s verified page reader.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-purple-300 mb-1">3. Multilingual Persistence</div>
                  <p className="text-[11px] text-slate-400">
                    Mosaic generates bilingual summaries, glossaries, Feynman notes, and revision questions, writing them back to Notion as official blocks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Manual Export & Fallbacks */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Notion Export Fallbacks & Zero-Lockin Safeguards
            </h3>
            <p className="text-slate-400 leading-relaxed">
              If your Notion integration is temporarily unconfigured or your university network restricts outbound API calls, Mosaic ensures you never lose access to your study materials.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Copy className="w-4 h-4 text-purple-400" />
                  1-Click Notion Markdown Paste
                </div>
                <p className="text-slate-400 text-[11px]">
                  All generated materials can be copied as Markdown. When pasted into any Notion page, Notion natively transforms headings, quote callouts, checkboxes, and tables into official Notion blocks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-purple-400" />
                  JSON Archive Export
                </div>
                <p className="text-slate-400 text-[11px]">
                  Export full bilingual study datasets containing timestamps, flashcards, and rubric scores for backup in Obsidian, Logseq, or local storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
