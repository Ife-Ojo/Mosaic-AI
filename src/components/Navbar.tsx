'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, Database, ChevronDown, Check, Globe, 
  Columns, BookOpen, BrainCircuit, Link2
} from 'lucide-react';
import { MosaicTesseraIcon } from './MosaicPattern';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { SupportedLanguageCode, NotionWorkspaceInfo } from '@/types';
import { 
  getPreferredTargetLanguage, 
  savePreferredTargetLanguage, 
  getStoredNotionWorkspace,
  getDisplayFormat,
  saveDisplayFormat,
  DisplayFormat
} from '@/lib/storage';
import { useToast } from './Toast';

export function Navbar({ onOpenNotionModal }: { onOpenNotionModal?: () => void }) {
  const pathname = usePathname();
  const { info, success } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [targetLang, setTargetLang] = useState<SupportedLanguageCode>('es');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const [displayFormat, setDisplayFormatState] = useState<DisplayFormat>('dual');
  const [workspace, setWorkspace] = useState<NotionWorkspaceInfo>(getStoredNotionWorkspace());

  useEffect(() => {
    setTargetLang(getPreferredTargetLanguage());
    setDisplayFormatState(getDisplayFormat());
    setWorkspace(getStoredNotionWorkspace());
  }, [pathname]);

  const handleLanguageChange = (code: SupportedLanguageCode) => {
    setTargetLang(code);
    savePreferredTargetLanguage(code);
    setLangDropdownOpen(false);
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    info('Study Language', `Set to ${lang?.name} (${lang?.flag})`);
  };

  const handleFormatChange = (fmt: DisplayFormat) => {
    setDisplayFormatState(fmt);
    saveDisplayFormat(fmt);
    setFormatDropdownOpen(false);
    const label = fmt === 'dual' ? 'Side-by-Side Dual' : fmt === 'native_first' ? 'Native-First (Gloss)' : 'Feynman Plain-Language';
    success('Display Format', `Switched to ${label}`);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLang) || SUPPORTED_LANGUAGES[1];

  const formatLabels: Record<DisplayFormat, { label: string; icon: any }> = {
    dual: { label: 'Dual Language', icon: Columns },
    native_first: { label: 'Native-First', icon: BookOpen },
    feynman: { label: 'Feynman Plain', icon: BrainCircuit },
  };

  const CurrentFormatIcon = formatLabels[displayFormat]?.icon || Columns;

  const navLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Lecture Companion', href: '/lecture-companion' },
    { name: 'AI Study Studio', href: '/study-studio' },
    { name: 'Assignment Simplifier', href: '/assignment-simplifier' },
    { name: 'My Learning', href: '/my-learning' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left: Mobile trigger & brand */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <MosaicTesseraIcon className="w-6 h-6" />
            <span className="font-bold text-white text-base">Mosaic</span>
          </Link>
        </div>

        {/* Center: Context Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
          <span className="font-medium text-zinc-300">Mosaic:</span>
          <span className="capitalize text-white font-semibold">
            {pathname === '/' ? 'Dashboard' : pathname.replace('/', '').replace('-', ' ')}
          </span>
        </div>

        {/* Right Actions: Language + Display Format + Notion Option */}
        <div className="flex items-center gap-2.5">
          
          {/* 1. Target Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setFormatDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-orange-500/60 text-xs text-zinc-200 transition-colors shadow-sm"
              title="Target study language preference"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="hidden sm:inline font-medium text-white">{currentLangObj.name}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-950 border border-orange-500/30 shadow-2xl py-1.5 z-50 backdrop-blur-xl max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  Translate Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                      targetLang === lang.code ? 'bg-orange-950/40 text-orange-200 font-bold' : 'text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span className="text-white">{lang.name}</span>
                      <span className="text-zinc-400 text-[11px]">({lang.nativeName})</span>
                    </div>
                    {targetLang === lang.code && <Check className="w-3.5 h-3.5 text-orange-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Display Format Button (next to Translate option) */}
          <div className="relative">
            <button
              onClick={() => {
                setFormatDropdownOpen(!formatDropdownOpen);
                setLangDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-orange-500/60 text-xs text-zinc-200 transition-colors shadow-sm"
              title="Change Display Format"
            >
              <CurrentFormatIcon className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline font-medium text-white">
                {formatLabels[displayFormat]?.label}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {formatDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl bg-zinc-950 border border-orange-500/30 shadow-2xl py-1.5 z-50 backdrop-blur-xl">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  Study Display Format
                </div>
                {[
                  { id: 'dual', label: 'Side-by-Side Dual Language', desc: 'Original text alongside translation', icon: Columns },
                  { id: 'native_first', label: 'Native-First (Gloss)', desc: 'Translated text with English keywords', icon: BookOpen },
                  { id: 'feynman', label: 'Feynman Plain-Language', desc: 'Metaphors without academic jargon', icon: BrainCircuit },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = displayFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => handleFormatChange(fmt.id as DisplayFormat)}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                        isSelected ? 'bg-orange-950/40 text-orange-200' : 'text-zinc-300 hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-white">{fmt.label}</div>
                        <div className="text-[10px] text-zinc-400">{fmt.desc}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Notion Connection Option (Connect / Connected) */}
          <button
            onClick={onOpenNotionModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              workspace?.connected
                ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                : 'bg-orange-600/15 border-orange-500/50 text-orange-300 hover:bg-orange-600/25'
            }`}
            title={workspace?.connected ? 'Notion Connected (Click to manage)' : 'Connect Notion Workspace'}
          >
            <Database className={`w-3.5 h-3.5 ${workspace?.connected ? 'text-emerald-400' : 'text-orange-400'}`} />
            <span className="hidden sm:inline">
              {workspace?.connected ? (workspace.workspaceName || 'Notion Connected') : 'Connect Notion'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                workspace?.connected ? 'bg-emerald-400' : 'bg-orange-400 animate-pulse'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-black px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-orange-600/20 text-orange-200 border border-orange-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
